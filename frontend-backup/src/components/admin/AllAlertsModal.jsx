import { X, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function AllAlertsModal({ isOpen, onClose, alerts, onReviewAlert }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-brand-warning" />
            <h2 className="text-base font-bold text-brand-text">All Active & Operational Alerts ({alerts.length})</h2>
          </div>
          <button onClick={onClose} className="text-brand-text-subtle hover:text-brand-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {alerts.length === 0 ? (
            <div className="py-8 text-center text-xs text-brand-text-subtle">No alerts to show.</div>
          ) : (
            alerts.map((alt) => (
              <div
                key={alt.id}
                className="p-3 rounded-xl border border-brand-border bg-brand-bg-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        alt.severity === 'Critical'
                          ? 'bg-brand-danger-light text-brand-danger'
                          : alt.severity === 'Warning'
                          ? 'bg-brand-warning-light text-brand-warning-dark'
                          : 'bg-brand-info-light text-brand-info-dark'
                      }`}
                    >
                      {alt.severity}
                    </span>
                    <span className="font-bold text-brand-text">{alt.ruralMart} Mart ({alt.district})</span>
                    <span className="text-[10px] text-brand-text-subtle">• {alt.detectedTime}</span>
                  </div>
                  <p className="font-bold text-brand-text">{alt.title}</p>
                  <p className="text-brand-text-muted text-[11px]">{alt.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-brand-primary-light text-brand-primary-dark">
                    {alt.status}
                  </span>

                  {alt.status !== 'Resolved' && (
                    <button
                      onClick={() => onReviewAlert(alt.id, 'Resolved')}
                      className="px-3 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-[11px] transition-all flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Resolve
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-brand-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-brand-bg-subtle border border-brand-border text-brand-text font-bold text-xs hover:bg-brand-primary-light transition-colors"
          >
            Close Alerts Window
          </button>
        </div>
      </div>
    </div>
  )
}
