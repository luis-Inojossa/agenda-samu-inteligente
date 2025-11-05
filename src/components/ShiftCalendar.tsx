'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { shiftService, ShiftDay } from '@/lib/shifts';
import { authService } from '@/lib/auth';
import { ChevronLeft, ChevronRight, Plus, Minus, RotateCcw, Calendar, Clock, Download, FileImage, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CalendarProps {
  userId: string;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function ShiftCalendar({ userId }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthShifts, setMonthShifts] = useState<ShiftDay[]>([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    loadMonthShifts();
  }, [currentDate, userId]);

  const loadMonthShifts = () => {
    const schedule = shiftService.getShiftSchedule(userId);
    setHasSchedule(!!schedule);
    
    if (schedule) {
      const shifts = shiftService.getMonthShifts(userId, year, month);
      setMonthShifts(shifts);
    } else {
      setMonthShifts([]);
    }
  };

  const handleStartSchedule = (startDate: string) => {
    const schedule = shiftService.generateShiftSchedule(startDate, 6);
    shiftService.saveShiftSchedule(userId, schedule);
    
    // Atualizar data de início no perfil do usuário
    authService.updateUser({ startDate });
    
    setShowStartDatePicker(false);
    loadMonthShifts();
  };

  const handleResetSchedule = () => {
    setShowStartDatePicker(true);
  };

  const toggleExtraShift = (date: string, currentType: ShiftDay['type']) => {
    if (currentType === 'extra') {
      shiftService.removeExtraShift(userId, date);
    } else {
      shiftService.addExtraShift(userId, date);
    }
    loadMonthShifts();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const exportAsImage = async () => {
    if (!calendarRef.current) return;
    
    setIsExporting(true);
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(calendarRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      
      const link = document.createElement('a');
      link.download = `escala-${MONTHS[month]}-${year}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Erro ao exportar imagem:', error);
      alert('Erro ao exportar imagem. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    if (!calendarRef.current) return;
    
    setIsExporting(true);
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const canvas = await html2canvas(calendarRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`escala-${MONTHS[month]}-${year}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Dias vazios do mês anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getShiftForDate = (day: number): ShiftDay | undefined => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return monthShifts.find(shift => shift.date === dateStr);
  };

  const getShiftColor = (type: ShiftDay['type']) => {
    switch (type) {
      case 'work': return 'bg-blue-500 text-white';
      case 'extra': return 'bg-red-500 text-white';
      case 'off': return 'bg-white border border-gray-200 text-gray-700';
      default: return 'bg-gray-100 text-gray-400';
    }
  };

  const getShiftStats = () => {
    return shiftService.getShiftStats(userId, year, month);
  };

  const stats = hasSchedule ? getShiftStats() : { workDays: 0, extraDays: 0, offDays: 0 };

  if (!hasSchedule || showStartDatePicker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle className="text-xl">Configurar Escala</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-center">
              Escolha o dia de início dos seus plantões para gerar automaticamente sua escala 12x36.
            </p>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Data de início:</label>
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => {
                  if (e.target.value) {
                    handleStartSchedule(e.target.value);
                  }
                }}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Como funciona:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Trabalha 12 horas, folga 36 horas</li>
                <li>• Plantões normais em azul</li>
                <li>• Plantões extras em vermelho</li>
                <li>• Dias de folga em branco</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h1 className="text-2xl font-bold text-blue-900">
              {MONTHS[month]} {year}
            </h1>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4" />
                  {isExporting ? 'Exportando...' : 'Exportar'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportAsImage}>
                  <FileImage className="h-4 w-4 mr-2" />
                  Exportar como Imagem
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportAsPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar como PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              onClick={handleResetSchedule}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reiniciar Escala
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.workDays}</div>
              <div className="text-sm text-gray-600">Plantões Normais</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.extraDays}</div>
              <div className="text-sm text-gray-600">Plantões Extras</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.offDays}</div>
              <div className="text-sm text-gray-600">Dias de Folga</div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <Card ref={calendarRef}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Agenda de Plantões
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {WEEKDAYS.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth().map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const shift = getShiftForDate(day);
                
                // Criar datas para comparação precisa
                const today = new Date();
                const dayDate = new Date(year, month, day);
                
                // Normalizar as datas para comparar apenas dia/mês/ano (ignorar horário)
                const todayStr = today.toDateString();
                const dayStr = dayDate.toDateString();
                
                const isToday = todayStr === dayStr;
                const isPast = dayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());

                // Determinar a cor do dia
                let dayColor = 'bg-gray-100 text-gray-400'; // padrão para dias sem escala
                
                if (shift) {
                  if (isPast && !isToday) {
                    // Dias passados ficam em cinza
                    dayColor = 'bg-gray-100 text-gray-400';
                  } else {
                    // Dia atual e futuros mantêm a cor da escala
                    dayColor = getShiftColor(shift.type);
                  }
                }

                return (
                  <div
                    key={`${year}-${month}-${day}`}
                    className={`
                      aspect-square p-2 rounded-lg border-2 transition-all cursor-pointer
                      ${dayColor}
                      ${isToday ? 'ring-2 ring-yellow-400' : ''}
                      hover:scale-105
                    `}
                    onClick={() => {
                      if (shift) {
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        toggleExtraShift(dateStr, shift.type);
                      }
                    }}
                  >
                    <div className="text-center">
                      <div className="text-sm font-medium">{day}</div>
                      {shift && (
                        <div className="mt-1">
                          {shift.type === 'work' && <Badge variant="secondary" className="text-xs px-1">12h</Badge>}
                          {shift.type === 'extra' && <Badge variant="destructive" className="text-xs px-1">Extra</Badge>}
                          {shift.type === 'off' && <Badge variant="outline" className="text-xs px-1">Folga</Badge>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Plantão Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Plantão Extra</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                <span>Folga</span>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-gray-600">
              Clique em um dia para marcar/desmarcar como plantão extra
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}