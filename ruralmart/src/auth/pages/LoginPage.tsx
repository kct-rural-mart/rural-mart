
import { supabase } from '../../lib/supabaseClient';
import React, { useState } from 'react';
import { Store, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Info } from 'lucide-react';

export interface AuthLoginUser {
  role: 'owner' | 'admin';
  email: string;
  ruralMart?: string;
  userName?: string;
  ruralMartId?: string;
  ownerId?: string;
}

interface LoginPageProps {
  onLoginSuccess: (user: AuthLoginUser) => void;
  onNavigateRegister: () => void;
  onSwitchToAdmin?: () => void;
  theme: 'light' | 'dark';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateRegister,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState('');
  const [isSendingRecovery, setIsSendingRecovery] = useState(false);

  const handleForgotPassword = async () => {
    setErrorMessage('');
    setForgotPasswordNotice('');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Enter your registered email address first.');
      return;
    }

    setIsSendingRecovery(true);
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: window.location.origin,
    });
    setIsSendingRecovery(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setForgotPasswordNotice('Password recovery email sent. Open the link in that email to set a new password.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMessage('');
  setForgotPasswordNotice('');

  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !password) {
    setErrorMessage('Please enter your email and password.');
    return;
  }

  setIsLoading(true);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (!data.user) {
      setErrorMessage('Unable to retrieve the authenticated user.');
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, rural_mart_id, must_change_password')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      setErrorMessage('Your user profile or role is not configured.');
      return;
    }

    if (profile.role !== 'admin' && profile.role !== 'owner') {
      await supabase.auth.signOut();
      setErrorMessage('Your account does not have an authorized role.');
      return;
    }

    onLoginSuccess({
      role: profile.role,
      email: data.user.email ?? cleanEmail,
      ruralMartId: profile.rural_mart_id ?? undefined,
      userName: data.user.user_metadata?.full_name ?? undefined,
    });
  } catch {
    setErrorMessage('Unable to connect to the authentication service.');
  } finally {
    setIsLoading(false);
  }
};
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-[#F5F8F4] dark:bg-[#0B130F] text-[#17221D] dark:text-[#E6ECE8] font-sans antialiased transition-colors">
      
      {/* Main Container Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-md p-6 sm:p-8 space-y-6">
        
        {/* App Logo & Brand Badge */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#174F3A] dark:bg-[#1B3D30] text-white dark:text-[#A3E6C5] flex items-center justify-center shadow-sm border border-[#103A2B]/20 dark:border-[#A3E6C5]/20">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-wider text-[#174F3A] dark:text-[#A3E6C5] uppercase bg-[#E7F2EC] dark:bg-[#1B3D30] px-2.5 py-0.5 rounded-full">
              RURAL MART MANAGEMENT
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#17221D] dark:text-[#E6ECE8] mt-2">
              Login
            </h1>
            <p className="text-xs text-[#66736C] dark:text-[#8E9E96] mt-1">
              Sign in to manage your Rural Mart
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-[#3D1717] border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Forgot Password Alert Notice */}
        {forgotPasswordNotice && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-[#3D2D10] border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-xs font-medium flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <span>{forgotPasswordNotice}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="e.g. karthik.owner@ruralmart.in"
                className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-2 focus:ring-[#174F3A] transition-colors"
              />
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A958F] dark:text-[#61736A]" />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                Password
              </label>
              <button
                type="button"
                onClick={() => void handleForgotPassword()}
                disabled={isSendingRecovery}
                className="text-[11px] font-semibold text-[#174F3A] dark:text-[#8ECAAA] hover:underline cursor-pointer"
              >
                {isSendingRecovery ? 'Sending...' : 'Forgot Password?'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Enter password"
                className="w-full h-10 pl-9 pr-9 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-2 focus:ring-[#174F3A] transition-colors"
              />
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A958F] dark:text-[#61736A]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A958F] dark:text-[#61736A] hover:text-[#17221D] dark:hover:text-[#E6ECE8] cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Primary Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 bg-[#174F3A] hover:bg-[#103A2B] dark:bg-[#1B3D30] dark:hover:bg-[#234F3F] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-70 mt-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-2 text-center">
          <p className="text-xs text-[#66736C] dark:text-[#8E9E96]">
            Don't have a Rural Mart account?{' '}
            <button
              onClick={onNavigateRegister}
              className="text-[#174F3A] dark:text-[#8ECAAA] font-bold hover:underline cursor-pointer"
            >
              Register Rural Mart
            </button>
          </p>
        </div>

      </div>

    </div>
  );
};

