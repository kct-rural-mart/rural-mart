import { useEffect } from 'react'
import { X, Building2, Target, HeartHandshake, Download, CheckCircle2, CalendarCheck } from 'lucide-react'

export default function MartOutreachDetailModal({ mart, onClose }) {
  const activityEntries = mart ? Object.entries(mart.activityTypeBreakdown || {}).sort((a, b) => b[1] - a[1]) : []
  useEffect(() => {
    document.body.style.overflow = mart ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mart])

  if (!mart) return null

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md cursor-default" style={{ touchAction: 'none' }}>
      <div onClick={(e) => e.stopPropagation()} className="bg-brand-surface border border-brand-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col text-brand-text">
        <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-surface shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-primary-light text-brand-primary-dark">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-brand-text">{mart.name} Rural Mart</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary-light text-brand-primary-dark border border-brand-primary/20">{mart.district} District</span>
              </div>
              <p className="text-[11px] text-brand-text-muted">Outreach Impact, Farmer Engagement &amp; Village Coverage</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-brand-text-subtle hover:text-brand-text hover:bg-brand-bg-subtle transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border">
              <span className="text-[10px] font-semibold text-brand-text-muted uppercase">Registered Farmers</span>
              <p className="text-base font-extrabold text-brand-text mt-1">{mart.totalRegisteredFarmers.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border">
              <span className="text-[10px] font-semibold text-brand-text-muted uppercase">Farmers Reached</span>
              <p className="text-base font-extrabold text-brand-primary mt-1">{mart.farmersReached.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border">
              <span className="text-[10px] font-semibold text-brand-text-muted uppercase">Programs Conducted</span>
              <p className="text-base font-extrabold text-brand-accent mt-1">{mart.outreachProgramsConducted} Camps</p>
            </div>
            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border">
              <span className="text-[10px] font-semibold text-brand-text-muted uppercase">Retention Rate</span>
              <p className="text-base font-extrabold text-brand-primary-dark mt-1">{mart.retentionRate}%</p>
            </div>
          </div>

          <div className="border border-brand-border rounded-xl overflow-hidden">
            <div className="bg-brand-bg-subtle px-4 py-2.5 border-b border-brand-border flex items-center justify-between">
              <span className="text-xs font-bold text-brand-text flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-brand-primary" /> Outreach Campaign Breakdown
              </span>
              <span className="text-[10px] text-brand-text-muted">{mart.villagesCovered} Villages Active</span>
            </div>

            <div className="divide-y divide-brand-border">
              {activityEntries.length === 0 ? (
                <div className="p-3 text-center text-brand-text-muted italic">No outreach programs recorded in the selected period.</div>
              ) : (
                activityEntries.map(([activityType, count], idx) => (
                  <div key={activityType} className={`p-3 flex justify-between items-center ${idx % 2 === 0 ? 'bg-brand-surface' : 'bg-brand-bg-subtle'}`}>
                    <span className="font-bold text-brand-text">{activityType}</span>
                    <span className="font-bold text-brand-primary">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-brand-border bg-brand-bg-subtle space-y-1">
              <span className="font-bold text-brand-text flex items-center gap-1.5">
                <Target className="w-4 h-4 text-brand-primary" /> Acquisition Ratio
              </span>
              <p className="text-brand-text-muted">
                New Farmers Onboarded: <strong className="text-brand-primary">+{mart.newFarmers}</strong>
              </p>
              <p className="text-brand-text-muted">
                Repeat Active Farmers: <strong className="text-brand-text">{mart.repeatFarmers}</strong>
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-brand-border bg-brand-bg-subtle space-y-1">
              <span className="font-bold text-brand-text flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-brand-primary" /> Animal Health Coverage
              </span>
              <p className="text-brand-text-muted">
                Cattle Head Count Covered: <strong className="text-brand-primary">{mart.animalPopulationCovered.toLocaleString('en-IN')} Head</strong>
              </p>
              <p className="text-brand-text-muted">
                Villages Reached: <strong>{mart.villagesCovered} Panchayat Villages</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-brand-border bg-brand-bg-subtle flex items-center justify-between shrink-0">
          <span className="text-[11px] text-brand-text-muted flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" /> Outreach record verified
          </span>

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-brand-border text-brand-text font-semibold text-xs hover:bg-brand-surface transition-colors cursor-pointer">
              Close
            </button>
            <button
              onClick={() => alert(`Downloading Outreach & Impact Report for ${mart.name} Rural Mart...`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
