import React from 'react';
import { Save } from 'lucide-react';

interface SettingsHeaderProps {
  onSave: () => void;
  isSaving?: boolean;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  onSave,
  isSaving = false,
}) => {
  return (
    <div className="bg-white dark:bg-emerald-950/70 border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-emerald-400/80 mt-0.5">
            Manage system configurations, user permissions, and preferences
          </p>
        </div>

        {/* Right Actions - Just Save Settings button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm shadow-emerald-900/20 active:scale-98 disabled:opacity-70 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
