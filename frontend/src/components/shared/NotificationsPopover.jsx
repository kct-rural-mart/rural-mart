import { Bell, X } from 'lucide-react'

export default function NotificationsPopover({ isOpen, onClose, alerts, onMarkAllRead }) {
  if (!isOpen) return null

  return (
    <div className="absolute right-4 top-16 w-80 sm:w-96 bg-brand-surface border border-brand-border rounded-2xl shadow-2xl z-50 p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-brand-border pb-2">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand-primary" />
          <h3 className="font-bold text-sm text-brand-text">System Notifications</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onMarkAllRead} className="text-[10px] text-brand-primary font-bold hover:underline">
            Mark all read
          </button>
          <button onClick={onClose} className="text-brand-text-subtle hover:text-brand-text">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <div className="py-6 text-center text-xs text-brand-text-subtle">No notifications yet.</div>
        ) : (
          alerts.map((alt) => (
            <div key={alt.id} className="p-2.5 rounded-xl bg-brand-bg-subtle border border-brand-border/70 text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-brand-text">{alt.ruralMart} Mart</span>
                <span className="text-[10px] text-brand-text-subtle font-mono">{alt.detectedTime}</span>
              </div>
              <p className="text-brand-text-muted text-[11px]">{alt.title}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
