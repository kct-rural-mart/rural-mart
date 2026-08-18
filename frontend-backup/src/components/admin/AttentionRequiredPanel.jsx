import { useState } from 'react'
import { AlertTriangle, AlertOctagon, Info, CheckCircle2, Clock } from 'lucide-react'

function getSeverityBadge(severity) {
  switch (severity) {
    case 'Critical':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-brand-danger-light text-brand-danger border border-brand-danger-border">
          <AlertOctagon className="w-2.5 h-2.5 text-brand-danger" /> Critical
        </span>
      )
    case 'Warning':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-brand-warning-light text-brand-warning-dark border border-brand-warning-border">
          <AlertTriangle className="w-2.5 h-2.5 text-brand-warning" /> Warning
        </span>
      )
    case 'Info':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-brand-info-light text-brand-info-dark border border-brand-info-border">
          <Info className="w-2.5 h-2.5 text-brand-info" /> Info
        </span>
      )
    default:
      return null
  }
}

function getStatusBadge(status) {
  switch (status) {
    case 'New':
      return (
        <span className="text-[10px] font-bold text-brand-danger bg-brand-danger-light/60 px-1.5 py-0.5 rounded border border-brand-danger-border">
          New
        </span>
      )
    case 'Under Review':
      return (
        <span className="text-[10px] font-bold text-brand-warning-dark bg-brand-warning-light/60 px-1.5 py-0.5 rounded border border-brand-warning-border">
          Under Review
        </span>
      )
    case 'Resolved':
      return (
        <span className="text-[10px] font-bold text-brand-primary-dark bg-brand-primary-light px-1.5 py-0.5 rounded border border-brand-primary/20">
          Resolved
        </span>
      )
    default:
      return null
  }
}

export default function AttentionRequiredPanel({ alerts, onReviewAlert }) {
  const [filterSeverity, setFilterSeverity] = useState('All')
  const [selectedAlertForReview, setSelectedAlertForReview] = useState(null)

  const filteredAlerts = alerts.filter((alt) => filterSeverity === 'All' || alt.severity === filterSeverity)

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between relative">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-brand-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-brand-warning animate-pulse" />
          <h2 className="text-sm font-bold text-brand-text tracking-tight">Attention Required</h2>
          <span className="text-[10px] font-bold text-brand-danger bg-brand-danger-light px-1.5 py-0.5 rounded-full border border-brand-danger-border">
            {alerts.filter((a) => a.status !== 'Resolved').length} Active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-2 text-[10px]">
        {['All', 'Critical', 'Warning', 'Info'].map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
              filterSeverity === sev
                ? 'bg-brand-primary text-white shadow-xs'
                : 'bg-brand-bg-subtle text-brand-text-muted border border-brand-border'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="py-8 text-center text-xs text-brand-text-subtle">
            No alerts found for the selected filter.
          </div>
        ) : (
          filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-3 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
                alt.severity === 'Critical'
                  ? 'bg-brand-danger-light/30 border-brand-danger-border hover:border-brand-danger/50'
                  : alt.severity === 'Warning'
                  ? 'bg-brand-warning-light/30 border-brand-warning-border hover:border-brand-warning/50'
                  : 'bg-brand-bg-subtle border-brand-border hover:border-brand-primary/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  {getSeverityBadge(alt.severity)}
                  <span className="text-xs font-bold text-brand-text">{alt.ruralMart}</span>
                </div>
                {getStatusBadge(alt.status)}
              </div>

              <p className="text-xs font-bold text-brand-text mt-0.5">{alt.title}</p>
              <p className="text-[11px] text-brand-text-muted mt-0.5 line-clamp-2">{alt.description}</p>

              <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-brand-border text-[10px]">
                <span className="text-brand-text-subtle flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3" /> {alt.detectedTime}
                </span>

                <button
                  onClick={() => setSelectedAlertForReview(alt)}
                  className="text-brand-primary hover:text-brand-primary-dark font-bold underline transition-colors"
                >
                  Review Alert
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedAlertForReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-brand-border pb-2">
              <div className="flex items-center gap-2">
                {getSeverityBadge(selectedAlertForReview.severity)}
                <h3 className="font-bold text-sm text-brand-text">{selectedAlertForReview.ruralMart} — Alert Action</h3>
              </div>
              <button
                onClick={() => setSelectedAlertForReview(null)}
                className="text-brand-text-subtle hover:text-brand-text text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-brand-text">{selectedAlertForReview.title}</p>
              <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">{selectedAlertForReview.description}</p>
              <p className="text-[10px] text-brand-text-subtle mt-2">
                Category: <strong>{selectedAlertForReview.category}</strong> | Detected: {selectedAlertForReview.detectedTime}
              </p>
            </div>

            <div className="pt-3 border-t border-brand-border flex flex-col gap-2">
              <span className="text-xs font-semibold text-brand-text">Update Status & Take Action:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onReviewAlert(selectedAlertForReview.id, 'Under Review')
                    setSelectedAlertForReview(null)
                  }}
                  className="px-3 py-2 rounded-lg bg-brand-warning hover:bg-brand-warning-dark text-white font-bold text-xs shadow-xs transition-all"
                >
                  Mark Under Review
                </button>

                <button
                  onClick={() => {
                    onReviewAlert(selectedAlertForReview.id, 'Resolved')
                    setSelectedAlertForReview(null)
                  }}
                  className="px-3 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Resolve Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
