import { X, Phone, User, MapPin, Calendar, Award, Database, Store } from 'lucide-react'

export default function MartDetailModal({ mart, onClose }) {
  if (!mart) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary text-white font-bold flex items-center justify-center shadow">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-text">{mart.name} Rural Mart</h2>
              <p className="text-xs text-brand-text-muted flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-brand-primary" /> {mart.district} District
                </span>
                <span>•</span>
                <span>Manager: {mart.manager}</span>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-brand-text-subtle hover:text-brand-text hover:bg-brand-bg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
            <span className="text-[10px] font-bold text-brand-text-muted uppercase">Sales Revenue</span>
            <p className="text-base font-extrabold text-brand-text mt-1 font-mono">₹{(mart.salesRaw / 100000).toFixed(1)} L</p>
          </div>

          <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
            <span className="text-[10px] font-bold text-brand-text-muted uppercase">Gross Profit</span>
            <p className="text-base font-extrabold text-brand-accent mt-1 font-mono">₹{(mart.grossProfitRaw / 100000).toFixed(1)} L</p>
          </div>

          <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
            <span className="text-[10px] font-bold text-brand-text-muted uppercase">Reg. Farmers</span>
            <p className="text-base font-extrabold text-brand-text mt-1 font-mono">{mart.registeredFarmers.toLocaleString()}</p>
          </div>

          <div className="p-3 bg-brand-primary-light rounded-xl border border-brand-primary/15">
            <span className="text-[10px] font-bold text-brand-primary-dark uppercase">Overall Score</span>
            <p className="text-base font-extrabold text-brand-primary-dark mt-1 font-mono flex items-center gap-1">
              <Award className="w-4 h-4 text-brand-warning" />
              {mart.score} / 100
            </p>
          </div>
        </div>

        <div className="bg-brand-bg-subtle/80 p-4 rounded-xl border border-brand-border/80 space-y-2">
          <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">6-Factor Performance Score Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div>
              <span className="text-brand-text-muted">Sales Growth (20%):</span>
              <p className="font-bold font-mono text-brand-accent">{mart.scoreBreakdown.salesGrowth} / 20 pts</p>
            </div>
            <div>
              <span className="text-brand-text-muted">Profitability (20%):</span>
              <p className="font-bold font-mono text-brand-accent">{mart.scoreBreakdown.profitability} / 20 pts</p>
            </div>
            <div>
              <span className="text-brand-text-muted">Farmer Engagement (20%):</span>
              <p className="font-bold font-mono text-brand-accent">{mart.scoreBreakdown.farmerEngagement} / 20 pts</p>
            </div>
            <div>
              <span className="text-brand-text-muted">Outreach Impact (15%):</span>
              <p className="font-bold font-mono text-brand-accent">{mart.scoreBreakdown.outreachImpact} / 15 pts</p>
            </div>
            <div>
              <span className="text-brand-text-muted">Inventory Health (15%):</span>
              <p className="font-bold font-mono text-brand-accent">{mart.scoreBreakdown.inventoryHealth} / 15 pts</p>
            </div>
            <div>
              <span className="text-brand-text-muted">Data Compliance (10%):</span>
              <p className="font-bold font-mono text-brand-warning">{mart.scoreBreakdown.compliance} / 10 pts</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 text-xs p-3 bg-brand-surface rounded-xl border border-brand-border/80">
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-brand-text">
              <User className="w-3.5 h-3.5 text-brand-primary" /> Manager: <strong>{mart.manager}</strong>
            </p>
            <p className="flex items-center gap-1.5 text-brand-text">
              <Phone className="w-3.5 h-3.5 text-brand-primary" /> Phone: <strong>{mart.contact}</strong>
            </p>
          </div>

          <div className="space-y-1 sm:text-right">
            <p className="flex items-center sm:justify-end gap-1.5 text-brand-text">
              <Database className="w-3.5 h-3.5 text-brand-primary" /> Data Completeness: <strong className="font-mono">{mart.dataCompleteness}%</strong>
            </p>
            <p className="flex items-center sm:justify-end gap-1.5 text-brand-text-muted">
              <Calendar className="w-3.5 h-3.5" /> Last Updated: {mart.lastUpdated}
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs shadow transition-all">
            Close Overview
          </button>
        </div>
      </div>
    </div>
  )
}
