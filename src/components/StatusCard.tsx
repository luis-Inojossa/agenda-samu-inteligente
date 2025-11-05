'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { shiftService, ShiftDay } from '@/lib/shifts';
import { Calendar, Clock, Coffee, Stethoscope, AlertCircle } from 'lucide-react';

interface StatusCardProps {
  userId: string;
}

export default function StatusCard({ userId }: StatusCardProps) {
  const [todayStatus, setTodayStatus] = useState<ShiftDay | null>(null);
  const [nextActivity, setNextActivity] = useState<{ date: string; type: ShiftDay['type']; dayName: string } | null>(null);
  const [hasSchedule, setHasSchedule] = useState(false);

  useEffect(() => {
    loadTodayStatus();
  }, [userId]);

  useEffect(() => {
    if (todayStatus) {
      findNextActivity();
    }
  }, [todayStatus, userId]);

  const loadTodayStatus = () => {
    const schedule = shiftService.getShiftSchedule(userId);
    setHasSchedule(!!schedule);
    
    if (!schedule) return;

    // Obter status de hoje
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Buscar nos próximos meses para encontrar o status de hoje
    let foundToday = false;
    for (let monthOffset = 0; monthOffset <= 2 && !foundToday; monthOffset++) {
      const checkDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
      const shifts = shiftService.getMonthShifts(userId, checkDate.getFullYear(), checkDate.getMonth());
      const todayShift = shifts.find(shift => shift.date === todayStr);
      
      if (todayShift) {
        setTodayStatus(todayShift);
        foundToday = true;
      }
    }

    // Se não encontrou, assumir que não há escala para hoje
    if (!foundToday) {
      setTodayStatus({ date: todayStr, type: 'off' });
    }
  };

  const findNextActivity = () => {
    if (!todayStatus) return;
    
    const today = new Date();
    
    // Buscar nos próximos 60 dias
    for (let i = 1; i <= 60; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      
      const futureDateStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}`;
      
      // Buscar shift para esta data
      const shifts = shiftService.getMonthShifts(userId, futureDate.getFullYear(), futureDate.getMonth());
      const futureShift = shifts.find(shift => shift.date === futureDateStr);
      
      if (futureShift) {
        // Se hoje é folga, procurar próximo plantão
        if (todayStatus.type === 'off' && (futureShift.type === 'work' || futureShift.type === 'extra')) {
          setNextActivity({
            date: futureDateStr,
            type: futureShift.type,
            dayName: getDayName(futureDate)
          });
          break;
        }
        // Se hoje é plantão, procurar próxima folga
        else if ((todayStatus.type === 'work' || todayStatus.type === 'extra') && futureShift.type === 'off') {
          setNextActivity({
            date: futureDateStr,
            type: futureShift.type,
            dayName: getDayName(futureDate)
          });
          break;
        }
      }
    }
  };

  const getDayName = (date: Date): string => {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return days[date.getDay()];
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusIcon = (type: ShiftDay['type']) => {
    switch (type) {
      case 'work': return <Stethoscope className="h-6 w-6" />;
      case 'extra': return <AlertCircle className="h-6 w-6" />;
      case 'off': return <Coffee className="h-6 w-6" />;
      default: return <Calendar className="h-6 w-6" />;
    }
  };

  const getStatusText = (type: ShiftDay['type']) => {
    switch (type) {
      case 'work': return 'Plantão Normal';
      case 'extra': return 'Plantão Extra';
      case 'off': return <span className="text-2xl font-bold text-green-600">FOLGA</span>;
      default: return 'Sem escala';
    }
  };

  const getStatusColor = (type: ShiftDay['type']) => {
    switch (type) {
      case 'work': return 'bg-blue-500';
      case 'extra': return 'bg-red-500';
      case 'off': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getNextActivityText = () => {
    if (!nextActivity) return null;
    
    if (todayStatus?.type === 'off') {
      return `Próximo plantão: ${nextActivity.dayName}, ${formatDate(nextActivity.date)}`;
    } else {
      return `Próxima folga: ${nextActivity.dayName}, ${formatDate(nextActivity.date)}`;
    }
  };

  if (!hasSchedule) {
    return null; // Não mostrar o card se não há escala configurada
  }

  return (
    <div className="max-w-4xl mx-auto mb-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Status de hoje */}
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${getStatusColor(todayStatus?.type || 'off')} text-white`}>
                {getStatusIcon(todayStatus?.type || 'off')}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Status de Hoje</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={todayStatus?.type === 'work' ? 'default' : todayStatus?.type === 'extra' ? 'destructive' : 'secondary'}
                    className="text-sm"
                  >
                    {getStatusText(todayStatus?.type || 'off')}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {new Date().toLocaleDateString('pt-BR', { 
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Próxima atividade */}
            {nextActivity && (
              <div className="flex items-center gap-3 bg-white/70 rounded-lg p-4 min-w-0">
                <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-base font-medium text-gray-700 truncate">
                    {getNextActivityText()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mensagem motivacional baseada no status */}
          <div className="mt-4 p-3 bg-white/50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              {todayStatus?.type === 'off' && '🏠 Aproveite seu dia de FOLGA! Descanse e recarregue as energias.'}
              {todayStatus?.type === 'work' && '💪 Plantão normal hoje! Você faz a diferença na vida das pessoas.'}
              {todayStatus?.type === 'extra' && '⚡ Plantão extra hoje! Sua dedicação é admirável.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}