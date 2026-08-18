import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../admin/layout/AdminLayout';

// Owner Portal Components
import { LoginPage, AuthLoginUser } from '../auth/pages/LoginPage';
import { RegisterMartPage } from '../auth/pages/RegisterMartPage';
import { RegistrationSubmittedPage } from '../auth/pages/RegistrationSubmittedPage';
import { ChangePasswordPage } from '../auth/pages/ChangePasswordPage';
import { OwnerLayout } from '../owner/layout/OwnerLayout';

import { Theme, MartRegistrationFormData } from '../shared/types';
import { RegistrationApplication } from '../lib/storageService';
import { useAuth } from '../auth/context/AuthContext';

export interface AuthSession {
  isAuthenticated: boolean;
  role: 'owner' | 'admin' | null;
  email: string;
  ruralMart?: string;
  userName?: string;
}

export default function App() {
  const { user, profile, loading, passwordRecovery, clearPasswordRecovery, refreshProfile, signOut } = useAuth();
  const [theme, setTheme] = useState<Theme>('light');

  // Sub-view for unauthenticated state ('login' | 'register' | 'submitted')
  const [unauthSubView, setUnauthSubView] = useState<'login' | 'register' | 'submitted'>('login');
  const [registrationData, setRegistrationData] = useState<MartRegistrationFormData | null>(null);
  const [submittedApp, setSubmittedApp] = useState<RegistrationApplication | null>(null);

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
  const handleLoginSuccess = (_loginUser: AuthLoginUser) => undefined;

  // Logout handler
  const handleLogout = async () => {
    await signOut();
    setUnauthSubView('login');
  };

  // Sync simulation handler


  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-[#F5F8F4] text-[#174F3A] font-semibold">Loading your account...</div>;
  }

  if (!user && unauthSubView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigateRegister={() => setUnauthSubView('register')}
        theme={theme}
      />
    );
  }

  if (!user && unauthSubView === 'register') {
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

  if (!user && unauthSubView === 'submitted') {
    return (
      <RegistrationSubmittedPage
        registrationData={registrationData}
        submittedApp={submittedApp}
        onBackToLogin={() => setUnauthSubView('login')}
        theme={theme}
      />
    );
  }

  if (user && passwordRecovery) {
    return (
      <ChangePasswordPage
        mandatory
        recovery
        onComplete={async () => {
          clearPasswordRecovery();
          await signOut();
          setUnauthSubView('login');
        }}
      />
    );
  }

  if (user && profile?.must_change_password) {
    return <ChangePasswordPage mandatory onComplete={async () => { await refreshProfile(); }} />;
  }

  // AUTHENTICATED ROLE GUARD: OWNER PORTAL
  if (user && profile?.role === 'owner') {
    return (
      <OwnerLayout
        theme={theme}
        toggleTheme={toggleTheme}
        onSwitchToAdmin={handleLogout}
        onLogout={handleLogout}
        ownerEmail={user.email ?? ''}
      />
    );
  }

  // AUTHENTICATED ROLE GUARD: EXECUTIVE ADMIN PORTAL
  if (user && profile?.role === 'admin') return (
    <AdminLayout
      theme={theme}
      toggleTheme={toggleTheme}
      onLogout={handleLogout}
    />
  );

  return (
    <div className="min-h-screen grid place-items-center bg-[#F5F8F4] px-4">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm space-y-4">
        <div>
          <h1 className="text-lg font-bold text-red-700">Account profile unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your saved login session no longer has an authorized admin or owner profile.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="w-full h-10 rounded-xl bg-[#174F3A] text-white text-sm font-bold hover:bg-[#103A2B] transition-colors"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
}

