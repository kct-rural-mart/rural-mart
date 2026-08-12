import { useState } from 'react'
import { X, Phone, User, MapPin, Award, Store, DollarSign, Users, Package, ShieldCheck } from 'lucide-react'

export default function RuralMartDetailModal({ mart, onClose }) {
  const [activeTab, setActiveTab] = useState('summary')

  if (!mart) return null

  const formatLakhs = (raw) => `₹${(raw / 100000).toFixed(1)} Lakhs`

  const salesRaw = mart.salesRaw || 0
  const grossProfitRaw = mart.grossProfitRaw || 0
  const netProfitRaw = Math.round(grossProfitRaw * 0.72)
  const totalBills = Math.round(salesRaw / 650) || 0
  const avgBillValue = Math.round(salesRaw / (totalBills || 1))

  const tabs = [
    { id: 'summary', label: 'Summary', icon: Award },
    { id: 'business', label: 'Business & Finance', icon: DollarSign },
    { id: 'farmers', label: 'Farmers & Outreach', icon: Users },
    { id: 'products', label: 'Products & Inventory', icon: Package },
  ]

  const scoreRows = [
    { label: 'Sales Growth', key: 'salesGrowth', max: 20 },
    { label: 'Profitability', key: 'profitability', max: 20 },
    { label: 'Farmer Engagement', key: 'farmerEngagement', max: 20 },
    { label: 'Outreach Impact', key: 'outreachImpact', max: 15 },
    { label: 'Inventory Health', key: 'inventoryHealth', max: 15 },
    { label: 'Compliance & Sync', key: 'compliance', max: 10 },
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-brand-primary text-white font-bold flex items-center justify-center shadow-md shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-brand-text">{mart.name} Rural Mart</h2>
                <p className="text-xs text-brand-text-muted flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-brand-primary" /> {mart.district} District
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-brand-primary" /> Manager: {mart.manager}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-brand-primary" /> {mart.contact}
                  </span>
                </p>
              </div>
            </div>

            <button onClick={onClose} className="p-1.5 rounded-lg text-brand-text-subtle hover:text-brand-text hover:bg-brand-bg-subtle transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-1 border-b border-brand-border pt-3 overflow-x-auto text-xs font-bold">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    activeTab === tab.id ? 'border-brand-primary text-brand-primary-dark' : 'border-transparent text-brand-text-muted hover:text-brand-text'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="py-2 space-y-4">
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Overall Index Score</span>
                  <p className="text-xl font-extrabold text-brand-primary-dark mt-1 font-mono flex items-center gap-1">
                    <Award className="w-4 h-4 text-brand-warning shrink-0" />
                    {mart.score} / 100
                  </p>
                </div>

                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Sales Revenue</span>
                  <p className="text-xl font-extrabold text-brand-text mt-1 font-mono">{formatLakhs(salesRaw)}</p>
                </div>

                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Gross Profit</span>
                  <p className="text-xl font-extrabold text-brand-accent mt-1 font-mono">{formatLakhs(grossProfitRaw)}</p>
                </div>

                <div className="p-3 bg-brand-primary-light rounded-xl border border-brand-primary/20">
                  <span className="text-[10px] font-bold text-brand-primary-dark uppercase">Data Completeness</span>
                  <p className="text-xl font-extrabold text-brand-primary-dark mt-1 font-mono">{mart.dataCompleteness}%</p>
                </div>
              </div>

              <div className="bg-brand-bg-subtle/80 p-4 rounded-xl border border-brand-border/80 space-y-3">
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-primary" />
                  6-Factor NABARD Composite Performance Breakdown
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {scoreRows.map((row) => {
                    const value = mart.scoreBreakdown?.[row.key] ?? 0
                    return (
                      <div key={row.key} className="space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className="text-brand-text-muted">{row.label} ({row.max} pts):</span>
                          <span className="font-mono text-brand-accent">{value} / {row.max}</span>
                        </div>
                        <div className="w-full h-1.5 bg-brand-border rounded-full overflow-hidden">
                          <div className="h-full bg-brand-primary rounded-full" style={{ width: `${(value / row.max) * 100}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Gross Sales Revenue</span>
                  <p className="text-lg font-extrabold text-brand-text mt-1 font-mono">{formatLakhs(salesRaw)}</p>
                </div>

                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Gross Profit</span>
                  <p className="text-lg font-extrabold text-brand-accent mt-1 font-mono">{formatLakhs(grossProfitRaw)}</p>
                </div>

                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Est. Net Margin</span>
                  <p className="text-lg font-extrabold text-brand-accent mt-1 font-mono">{formatLakhs(netProfitRaw)}</p>
                </div>

                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Avg Bill Value</span>
                  <p className="text-lg font-extrabold text-brand-text mt-1 font-mono">₹{avgBillValue.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="p-4 bg-brand-bg-subtle rounded-xl border border-brand-border space-y-2 text-xs">
                <h4 className="font-bold text-brand-text uppercase tracking-wider">Operating Ledger Breakdown</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-brand-text-muted">Total Invoices Issued:</span>
                    <p className="font-mono font-bold text-brand-text">{totalBills.toLocaleString('en-IN')} Bills</p>
                  </div>
                  <div>
                    <span className="text-brand-text-muted">Procurement Cost:</span>
                    <p className="font-mono font-bold text-brand-text">{formatLakhs(salesRaw - grossProfitRaw)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'farmers' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Registered Farmers</span>
                  <p className="text-lg font-extrabold text-brand-text mt-1 font-mono">{mart.registeredFarmers.toLocaleString('en-IN')}</p>
                </div>

                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Active Footfall</span>
                  <p className="text-lg font-extrabold text-brand-accent mt-1 font-mono">{(mart.farmerFootfall ?? 0).toLocaleString('en-IN')}</p>
                </div>

                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Farmers Reached</span>
                  <p className="text-lg font-extrabold text-brand-info mt-1 font-mono">{(mart.farmersReached ?? 0).toLocaleString('en-IN')}</p>
                </div>

                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Registered</span>
                  <p className="text-lg font-extrabold text-brand-text mt-1 font-mono">{mart.dataCompleteness}%</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="p-4 bg-brand-bg-subtle rounded-xl border border-brand-border text-xs space-y-2">
                <h4 className="font-bold text-brand-text uppercase tracking-wider">Top Moving Items at {mart.name}</h4>
                {mart.salesRaw > 0 ? (
                  <p className="text-brand-text-muted italic py-1">Inventory analytics for this mart aren't wired up yet.</p>
                ) : (
                  <p className="text-brand-text-muted italic py-1">No sales items recorded for this Rural Mart.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-xs">
          <span className="text-brand-text-muted">
            Last Synced: <span className="font-mono text-brand-text">{mart.lastUpdated}</span>
          </span>

          <button onClick={onClose} className="px-4 py-2 bg-brand-text text-white rounded-xl font-bold hover:bg-brand-primary-dark transition-colors">
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  )
}
