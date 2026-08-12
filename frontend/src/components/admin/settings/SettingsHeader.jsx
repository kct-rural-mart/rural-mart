import { Save } from 'lucide-react'

export default function SettingsHeader({ onSave, isSaving = false }) {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-text tracking-tight">Settings</h1>
          <p className="text-xs text-brand-text-muted mt-0.5">Manage system configurations, user permissions, and preferences</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
