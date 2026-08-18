import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, LogOut, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

interface ChangePasswordPageProps {
  mandatory?: boolean;
  recovery?: boolean;
  embedded?: boolean;
  onComplete?: () => void | Promise<void>;
  onCancel?: () => void;
}

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const ChangePasswordPage: React.FC<ChangePasswordPageProps> = ({
  mandatory = false,
  recovery = false,
  embedded = false,
  onComplete,
  onCancel,
}) => {
  const { user, refreshProfile, signOut } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!user) {
      setError('Your session has expired. Please return to login.');
      return;
    }
    if (!PASSWORD_RULE.test(newPassword)) {
      setError('Use at least 8 characters with uppercase, lowercase, number, and special character.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
      if (passwordError) throw passwordError;

      // Prefer the narrowly scoped database function. Fall back to the RLS-protected
      // table update until the migration has been applied to older projects.
      const { data: completed, error: rpcError } = await supabase.rpc('complete_password_change');
      if (rpcError) {
        const { data: updatedProfile, error: profileError } = await supabase
          .from('profiles')
          .update({ must_change_password: false })
          .eq('id', user.id)
          .select('must_change_password')
          .single();

        if (profileError || updatedProfile?.must_change_password !== false) {
          throw new Error(
            'Your Auth password changed, but the profile flag is blocked by Supabase. Apply the complete_password_change migration, then sign in with the new password and try again.',
          );
        }
      } else if (completed !== true) {
        throw new Error('Your account profile could not be found. Ask the administrator to restore the profile.');
      }

      const nextProfile = await refreshProfile();
      if (!nextProfile || nextProfile.must_change_password) {
        throw new Error('Password updated, but Supabase did not confirm the profile update. Please sign in again with the new password.');
      }
      setSuccess('Password updated successfully.');
      await onComplete?.();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to change the password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const panel = (
    <div className="w-full max-w-md rounded-2xl border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] p-6 shadow-xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#174F3A] text-white">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#17221D] dark:text-[#E6ECE8]">Change Password</h1>
            <p className="mt-1 text-xs text-[#66736C] dark:text-[#8E9E96]">
              {recovery ? 'Set a new password to recover your account.' : mandatory ? 'Set a secure password before continuing to your dashboard.' : 'Choose a new password for your account.'}
            </p>
          </div>
        </div>
        {!mandatory && onCancel && (
          <button type="button" onClick={onCancel} aria-label="Close" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {mandatory && (
        <div className="mb-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          {recovery ? 'You opened a secure Supabase password-recovery link.' : 'The temporary password must be replaced on your first login.'}
        </div>
      )}
      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</div>}
      {success && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="new-password" className="mb-1.5 block text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">New Password</label>
          <div className="relative">
            <input id="new-password" type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" className="h-11 w-full rounded-xl border border-[#DDE6E0] bg-[#F8FAF7] px-3 pr-11 text-sm outline-none focus:border-[#174F3A] dark:border-[#1E3129] dark:bg-[#16241E] dark:text-white" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-[#66736C] dark:text-[#8E9E96]">Minimum 8 characters, including uppercase, lowercase, number, and special character.</p>
        </div>
        <div>
          <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">Confirm New Password</label>
          <input id="confirm-password" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" className="h-11 w-full rounded-xl border border-[#DDE6E0] bg-[#F8FAF7] px-3 text-sm outline-none focus:border-[#174F3A] dark:border-[#1E3129] dark:bg-[#16241E] dark:text-white" />
        </div>
        <button type="submit" disabled={submitting} className="h-11 w-full rounded-xl bg-[#174F3A] text-sm font-bold text-white transition-colors hover:bg-[#103A2B] disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>

      {mandatory && (
        <button type="button" onClick={() => void signOut()} className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold text-[#66736C] hover:bg-slate-50 dark:hover:bg-slate-800">
          <LogOut className="h-4 w-4" /> Return to Login
        </button>
      )}
    </div>
  );

  if (embedded) return panel;
  return <div className="grid min-h-screen place-items-center bg-[#F5F8F4] px-4 dark:bg-[#0D1712]">{panel}</div>;
};
