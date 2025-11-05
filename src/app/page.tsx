'use client';

import { useState, useEffect } from 'react';
import { authService, AuthState } from '@/lib/auth';
import LandingPage from '@/components/LandingPage';
import AuthForm from '@/components/AuthForm';
import DashboardHeader from '@/components/DashboardHeader';
import StatusCard from '@/components/StatusCard';
import ShiftCalendar from '@/components/ShiftCalendar';

export default function Home() {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar estado de autenticação
    const state = authService.getAuthState();
    setAuthState(state);
    setLoading(false);
  }, []);

  const handleGetStarted = () => {
    setShowAuth(true);
  };

  const handleAuthSuccess = () => {
    const state = authService.getAuthState();
    setAuthState(state);
    setShowAuth(false);
  };

  const handleLogout = () => {
    authService.logout();
    setAuthState({ user: null, isAuthenticated: false });
    setShowAuth(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Mostrar formulário de autenticação
  if (showAuth) {
    return <AuthForm onSuccess={handleAuthSuccess} />;
  }

  // Usuário autenticado - mostrar dashboard
  if (authState.isAuthenticated && authState.user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader user={authState.user} onLogout={handleLogout} />
        <div className="p-4">
          <StatusCard userId={authState.user.id} />
          <ShiftCalendar userId={authState.user.id} />
        </div>
      </div>
    );
  }

  // Mostrar landing page
  return <LandingPage onGetStarted={handleGetStarted} />;
}