import React from 'react';
import {
  Database,
  ShieldCheck,
  Play,
  History,
  Lock,
  ArrowRight,
  CheckCircle2,
  Clock,
  KeyRound,
} from 'lucide-react';

interface SettingsBackupSecurityProps {
  lastBackup?: string;
  nextBackup?: string;
  onRunBackup: () => void;
  onViewBackupHistory: () => void;
  onOpenSecuritySettings: () => void;
  onViewSecurityLogs: () => void;
}

export const SettingsBackupSecurity: React.FC<SettingsBackupSecurityProps> = ({
  lastBackup = 'Not configured',
  nextBackup = 'Not scheduled',
  onRunBackup,
  onViewBackupHistory,
  onOpenSecuritySettings,
  onViewSecurityLogs,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* CARD 1 — Backup Status */}
      <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Backup Status
                </h3>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-400/70 block">
                Last Backup
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {lastBackup}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-emerald-400/70 font-medium">
                Size: —
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-400/70 block">
                Next Scheduled Backup
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {nextBackup}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-emerald-400/70 font-medium">
                —
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-400/70 block">
                Backup Frequency
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Not configured
              </span>
              <span className="text-[10px] text-slate-500 dark:text-emerald-400/70 font-medium">
                Retention: —
              </span>
            </div>
          </div>
        </div>

        {/* Card Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-emerald-900/40 flex items-center gap-3">
          <button
            onClick={onRunBackup}
            className="flex-1 px-3 py-2 rounded-xl bg-emerald-800 dark:bg-emerald-700 hover:bg-emerald-900 dark:hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Manual Backup</span>
          </button>
          <button
            onClick={onViewBackupHistory}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-emerald-900/40 hover:bg-slate-200 dark:hover:bg-emerald-800/50 text-slate-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-slate-200 dark:border-emerald-800/60 cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>View History</span>
          </button>
        </div>
      </div>

      {/* CARD 2 — Security Overview */}
      <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Security Overview
                </h3>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-emerald-400/70 block">
                  Password Policy
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Not configured
                </span>
                <p className="text-[10px] text-slate-500 dark:text-emerald-400/70">
                  —
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30 flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-emerald-400/70 block">
                  Two-Factor Auth (2FA)
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Not configured
                </span>
                <p className="text-[10px] text-slate-500 dark:text-emerald-400/70">
                  —
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-emerald-400/70 block">
                  Session Timeout
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Current frontend session
                </span>
                <p className="text-[10px] text-slate-500 dark:text-emerald-400/70">
                  —
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-emerald-400/70 block">
                  Login Activity
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  No activity history available
                </span>
                <p className="text-[10px] text-slate-500 dark:text-emerald-400/70">
                  —
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-emerald-900/40 flex items-center gap-3">
          <button
            onClick={onOpenSecuritySettings}
            className="flex-1 px-3 py-2 rounded-xl bg-purple-900/90 dark:bg-purple-800 hover:bg-purple-950 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <span>Security Settings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onViewSecurityLogs}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-emerald-900/40 hover:bg-slate-200 dark:hover:bg-emerald-800/50 text-slate-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-slate-200 dark:border-emerald-800/60"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>View Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
