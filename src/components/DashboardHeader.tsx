'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authService, User } from '@/lib/auth';
import { LogOut, User as UserIcon, Calendar, Crown, Clock } from 'lucide-react';

interface DashboardHeaderProps {
  user: User;
  onLogout: () => void;
}

export default function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [isTrialActive, setIsTrialActive] = useState(false);

  useEffect(() => {
    if (user.trialEndsAt && !user.isSubscribed) {
      const trialEnd = new Date(user.trialEndsAt);
      const now = new Date();
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      setTrialDaysLeft(Math.max(0, daysLeft));
      setIsTrialActive(daysLeft > 0);
    }
  }, [user]);

  const handleSubscribe = () => {
    // Em um app real, integraria com sistema de pagamento
    authService.updateUser({ isSubscribed: true });
    window.location.reload();
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Olá, {user.name.split(' ')[0]}!
              </h2>
              <p className="text-sm text-gray-600">
                {user.isSubscribed ? 'Plano Ativo' : 'Período de Teste'}
              </p>
            </div>
          </div>

          {/* Status and Actions */}
          <div className="flex items-center gap-3">
            {/* Trial Status */}
            {!user.isSubscribed && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <div>
                      {isTrialActive ? (
                        <>
                          <div className="text-sm font-medium text-orange-800">
                            {trialDaysLeft} dias restantes
                          </div>
                          <div className="text-xs text-orange-600">
                            no seu período gratuito
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-sm font-medium text-red-800">
                            Período gratuito expirado
                          </div>
                          <div className="text-xs text-red-600">
                            Assine para continuar usando
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subscription Status */}
            {user.isSubscribed && (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                <Crown className="h-3 w-3 mr-1" />
                Plano Ativo
              </Badge>
            )}

            {/* Subscribe Button */}
            {!user.isSubscribed && (
              <Button
                onClick={handleSubscribe}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                Assinar R$ 19,90/mês
              </Button>
            )}

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        {/* Trial Warning */}
        {!user.isSubscribed && !isTrialActive && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-600" />
                <div>
                  <div className="font-medium text-red-800">
                    Seu período gratuito expirou
                  </div>
                  <div className="text-sm text-red-600">
                    Assine agora por apenas R$ 19,90/mês para continuar usando a agenda
                  </div>
                </div>
              </div>
              <Button
                onClick={handleSubscribe}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Assinar Agora
              </Button>
            </div>
          </div>
        )}

        {/* Trial Info */}
        {!user.isSubscribed && isTrialActive && trialDaysLeft <= 3 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-yellow-800">
                    Seu período gratuito termina em {trialDaysLeft} dias
                  </div>
                  <div className="text-sm text-yellow-600">
                    Assine agora e continue organizando seus plantões sem interrupção
                  </div>
                </div>
              </div>
              <Button
                onClick={handleSubscribe}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Assinar R$ 19,90/mês
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}