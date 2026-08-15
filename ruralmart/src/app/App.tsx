import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../admin/layout/AdminLayout';

// Owner Portal Components
import { LoginPage, AuthLoginUser } from '../auth/pages/LoginPage';
import { RegisterMartPage } from '../auth/pages/RegisterMartPage';
import { RegistrationSubmittedPage } from '../auth/pages/RegistrationSubmittedPage';
import { OwnerLayout } from '../owner/layout/OwnerLayout';

import { Theme, MartRegistrationFormData } from '../shared/types';
import { getApplications, RegistrationApplication } from '../lib/storageService';

export interface AuthSession {
  isAuthenticated: boolean;
  role: 'owner' | 'admin' | null;
  email: string;
  ruralMart?: string;
  userName?: string;
}

export default function App() {
  const [theme, setTheme] = useState<Theme>('light');
  
  // Persistent Auth Session State
  const [authSession, setAuthSession] = useState<AuthSession>({
    isAuthenticated: false,
    role: null,
    email: '',
  });

  // Sub-view for unauthenticated state ('login' | 'register' | 'submitted')
  const [unauthSubView, setUnauthSubView] = useState<'login' | 'register' | 'submitted'>('login');
  const [registrationData, setRegistrationData] = useState<MartRegistrationFormData | null>(null);
  const [submittedApp, setSubmittedApp] = useState<RegistrationApplication | null>(null);

  // Sync auth state to localStorage (Removed for Supabase prep)
  useEffect(() => {
    // Backend will handle auth state later
  }, [authSession]);

  // Apply dark class to html document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Login handler
  const handleLoginSuccess = (loginUser: AuthLoginUser) => {
    const session: AuthSession = {
      isAuthenticated: true,
      role: loginUser.role,
      email: loginUser.email,
      ruralMart: loginUser.ruralMart || (loginUser.role === 'owner' ? 'Rural Mart Outpost' : undefined),
      userName: loginUser.userName || (loginUser.role === 'owner' ? 'Mart Owner' : 'EDF Executive Admin'),
    };
    setAuthSession(session);
    // localStorage.setItem('ruralmartAuth', JSON.stringify(session)); // Removed for Supabase prep
  };

  // Logout handler
  const handleLogout = () => {
    setAuthSession({
      isAuthenticated: false,
      role: null,
      email: '',
    });
    // localStorage.removeItem('ruralmartAuth'); // Removed for Supabase prep
    setUnauthSubView('login');
  };

  // Sync simulation handler


  // UNAUTHENTICATED ROUTE GUARD & VIEWS
  if (!authSession.isAuthenticated && unauthSubView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigateRegister={() => setUnauthSubView('register')}
        theme={theme}
      />
    );
  }

  if (!authSession.isAuthenticated && unauthSubView === 'register') {
    return (
      <RegisterMartPage
        onRegisterSuccess={(data) => {
          setRegistrationData(data);
          setSubmittedApp(null);
          setUnauthSubView('submitted');
        }}
        onNavigateLogin={() => setUnauthSubView('login')}
        theme={theme}
      />
    );
  }

  if (!authSession.isAuthenticated && unauthSubView === 'submitted') {
    return (
      <RegistrationSubmittedPage
        registrationData={registrationData}
        submittedApp={submittedApp}
        onBackToLogin={() => setUnauthSubView('login')}
        theme={theme}
      />
    );
  }

  // AUTHENTICATED ROLE GUARD: OWNER PORTAL
  if (authSession.role === 'owner') {
    return (
      <OwnerLayout
        theme={theme}
        toggleTheme={toggleTheme}
        onSwitchToAdmin={handleLogout}
        onLogout={handleLogout}
        ownerEmail={authSession.email}
      />
    );
  }

  // AUTHENTICATED ROLE GUARD: EXECUTIVE ADMIN PORTAL
  return (
    <AdminLayout
      theme={theme}
      toggleTheme={toggleTheme}
      onLogout={handleLogout}
    />
  );
}

