import { useState } from 'react'
import { X, Phone, User, MapPin, TrendingUp, Store, DollarSign, Users, Package, Receipt, Megaphone } from 'lucide-react'
import { formatLakhsCr } from '../../../lib/queries/finance'
import { formatDaysAgo } from '../../../utils/date'

export default function RuralMartDetailModal({ mart, onClose }) {
  const [activeTab, setActiveTab] = useState('summary')

  if (!mart) return null

  const expenseCategories = Object.entries(mart.expenseBreakdown || {}).sort((a, b) => b[1] - a[1])

  const tabs = [
    { id: 'summary', label: 'Summary', icon: TrendingUp },
    { id: 'business', label: 'Business & Finance', icon: DollarSign },
    { id: 'farmers', label: 'Farmers & Outreach', icon: Users },
    { id: 'products', label: 'Products & Inventory', icon: Package },
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
                    <User className="w-3 h-3 text-brand-primary" /> Manager: {mart.entrepreneurName || 'Not Assigned'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-brand-primary" /> {mart.phone || 'N/A'}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Sales Revenue</span>
                  <p className="text-lg font-extrabold text-brand-text mt-1 font-mono">{formatLakhsCr(mart.salesRaw)}</p>
                </div>
                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Net Profit</span>
                  <p className="text-lg font-extrabold text-brand-accent mt-1 font-mono">{formatLakhsCr(mart.netProfitRaw)}</p>
                </div>
                <div className="p-3 bg-brand-primary-light rounded-xl border border-brand-primary/20">
                  <span className="text-[10px] font-bold text-brand-primary-dark uppercase">Profit Margin</span>
                  <p className="text-lg font-extrabold text-brand-primary-dark mt-1 font-mono">{mart.profitMargin}%</p>
                </div>
                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Registered Farmers</span>
                  <p className="text-lg font-extrabold text-brand-text mt-1 font-mono">{mart.registeredFarmers.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Outreach Programs</span>
                  <p className="text-lg font-extrabold text-brand-text mt-1 font-mono">{mart.outreachProgramsConducted}</p>
                </div>
                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Last Sale</span>
                  <p className="text-lg font-extrabold text-brand-text mt-1 font-mono">{formatDaysAgo(mart.daysSinceLastSale)}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Gross Sales Revenue</span>
                  <p className="text-lg font-extrabold text-brand-text mt-1 font-mono">{formatLakhsCr(mart.salesRaw)}</p>
                </div>

                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Gross Profit</span>
                  <p className="text-lg font-extrabold text-brand-accent mt-1 font-mono">{formatLakhsCr(mart.grossProfitRaw)}</p>
                </div>

                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Net Profit</span>
                  <p className="text-lg font-extrabold text-brand-accent mt-1 font-mono">{formatLakhsCr(mart.netProfitRaw)}</p>
                </div>

                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Avg Bill Value</span>
                  <p className="text-lg font-extrabold text-brand-text mt-1 font-mono">₹{mart.avgBillValue.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="p-4 bg-brand-bg-subtle rounded-xl border border-brand-border space-y-2 text-xs">
                <h4 className="font-bold text-brand-text uppercase tracking-wider">Operating Ledger Breakdown</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-brand-text-muted">Total Invoices Issued:</span>
                    <p className="font-mono font-bold text-brand-text">{mart.totalBills.toLocaleString('en-IN')} Bills</p>
                  </div>
                  <div>
                    <span className="text-brand-text-muted">Procurement Cost:</span>
                    <p className="font-mono font-bold text-brand-text">{formatLakhsCr(mart.procurementRaw)}</p>
                  </div>
                  <div>
                    <span className="text-brand-text-muted">Operating Expenses:</span>
                    <p className="font-mono font-bold text-brand-text">{formatLakhsCr(mart.operatingExpensesRaw)}</p>
                  </div>
                </div>

                {expenseCategories.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-brand-border/60 space-y-1">
                    <span className="text-brand-text-muted uppercase text-[10px] font-bold">Expense Breakdown</span>
                    {expenseCategories.map(([category, amount]) => (
                      <div key={category} className="flex justify-between">
                        <span className="text-brand-text-muted">{category}</span>
                        <span className="font-mono font-bold text-brand-text">₹{amount.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'farmers' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Registered Farmers</span>
                  <p className="text-lg font-extrabold text-brand-text mt-1 font-mono">{mart.registeredFarmers.toLocaleString('en-IN')}</p>
                </div>

                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Outreach Programs</span>
                  <p className="text-lg font-extrabold text-brand-accent mt-1 font-mono">{mart.outreachProgramsConducted}</p>
                </div>

                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Villages Covered</span>
                  <p className="text-lg font-extrabold text-brand-info mt-1 font-mono">{mart.villagesCovered}</p>
                </div>

                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Farmers Reached (Outreach)</span>
                  <p className="text-lg font-extrabold text-brand-text mt-1 font-mono">{mart.farmersReachedOutreach}</p>
                </div>

                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Animals Covered (Outreach)</span>
                  <p className="text-lg font-extrabold text-brand-text mt-1 font-mono">{mart.animalsCoveredOutreach.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {mart.outreachProgramsConducted === 0 && (
                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70 text-xs text-brand-text-muted flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-brand-primary shrink-0" />
                  No outreach programs recorded for this Rural Mart in the selected period.
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Total Products (SKUs)</span>
                  <p className="text-lg font-extrabold text-brand-text mt-1 font-mono">{mart.totalProducts}</p>
                </div>
                <div className="p-3 bg-brand-bg-subtle rounded-xl border border-brand-border/70">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase">Procurement Cost (Period)</span>
                  <p className="text-lg font-extrabold text-brand-text mt-1 font-mono">{formatLakhsCr(mart.procurementRaw)}</p>
                </div>
              </div>

              <div className="p-4 bg-brand-bg-subtle rounded-xl border border-brand-border text-xs space-y-1.5 text-brand-text-muted">
                <div className="flex items-center gap-1.5 font-bold text-brand-text uppercase tracking-wider">
                  <Receipt className="w-3.5 h-3.5 text-brand-primary" /> Stock Levels
                </div>
                <p>
                  Per-product stock health (Healthy / Low Stock / Out of Stock) needs a reorder-level convention this schema doesn't define yet - that'll be built out with the dedicated
                  Products &amp; Inventory feature area.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-xs">
          <span className="text-brand-text-muted">
            Last Sale: <span className="font-mono text-brand-text">{formatDaysAgo(mart.daysSinceLastSale)}</span>
          </span>

          <button onClick={onClose} className="px-4 py-2 bg-brand-text text-white rounded-xl font-bold hover:bg-brand-primary-dark transition-colors">
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  )
}
