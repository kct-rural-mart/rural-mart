import { Database, ShieldCheck, Play, History, Lock, ArrowRight, CheckCircle2, Clock, KeyRound } from 'lucide-react'

export default function SettingsBackupSecurity({
  lastBackup = 'Not configured',
  nextBackup = 'Not scheduled',
  onRunBackup,
  onViewBackupHistory,
  onOpenSecuritySettings,
  onViewSecurityLogs,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-primary-light text-brand-primary-dark">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-text">Backup Status</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border/70 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted block">Last Backup</span>
              <span className="text-xs font-bold text-brand-text block">{lastBackup}</span>
              <span className="text-[10px] text-brand-text-muted font-medium">Size: —</span>
            </div>

            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border/70 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted block">Next Scheduled Backup</span>
              <span className="text-xs font-bold text-brand-text block">{nextBackup}</span>
              <span className="text-[10px] text-brand-text-muted font-medium">—</span>
            </div>

            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border/70 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted block">Backup Frequency</span>
              <span className="text-xs font-bold text-brand-text block">Not configured</span>
              <span className="text-[10px] text-brand-text-muted font-medium">Retention: —</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-brand-border/60 flex items-center gap-3">
          <button
            onClick={onRunBackup}
            className="flex-1 px-3 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Manual Backup</span>
          </button>
          <button
            onClick={onViewBackupHistory}
            className="flex-1 px-3 py-2 rounded-xl bg-brand-bg-subtle hover:bg-brand-border/40 text-brand-text text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-brand-border cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-brand-primary" />
            <span>View History</span>
          </button>
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-text">Security Overview</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border/70 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-text-muted block">Password Policy</span>
                <span className="text-xs font-bold text-brand-text">Not configured</span>
                <p className="text-[10px] text-brand-text-muted">—</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border/70 flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-brand-text-subtle shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-text-muted block">Two-Factor Auth (2FA)</span>
                <span className="text-xs font-bold text-brand-text-muted">Not configured</span>
                <p className="text-[10px] text-brand-text-muted">—</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border/70 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-brand-warning-dark shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-text-muted block">Session Timeout</span>
                <span className="text-xs font-bold text-brand-text">Current frontend session</span>
                <p className="text-[10px] text-brand-text-muted">—</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border/70 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-info shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-text-muted block">Login Activity</span>
                <span className="text-xs font-bold text-brand-text">No activity history available</span>
                <p className="text-[10px] text-brand-text-muted">—</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-brand-border/60 flex items-center gap-3">
          <button
            onClick={onOpenSecuritySettings}
            className="flex-1 px-3 py-2 rounded-xl bg-purple-900 hover:bg-purple-950 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <span>Security Settings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onViewSecurityLogs}
            className="flex-1 px-3 py-2 rounded-xl bg-brand-bg-subtle hover:bg-brand-border/40 text-brand-text text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-brand-border"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>View Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
