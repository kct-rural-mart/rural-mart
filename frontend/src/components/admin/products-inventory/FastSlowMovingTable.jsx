import { useState } from 'react'
import { TrendingUp, TrendingDown, Zap, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { FAST_SLOW_MOVING_PRODUCTS } from '../../../lib/newPages/mockData'

export default function FastSlowMovingTable() {
  const [activeTab, setActiveTab] = useState('All')

  const filteredItems = FAST_SLOW_MOVING_PRODUCTS.filter((item) => activeTab === 'All' || item.velocity === activeTab)

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-border/60">
          <h3 className="text-base font-bold text-brand-text tracking-tight flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-brand-warning fill-brand-warning" />
            Fast-moving &amp; Slow-moving
          </h3>

          <div className="flex bg-brand-bg-subtle p-1 rounded-xl text-xs font-semibold">
            {['All', 'Fast', 'Slow'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeTab === tab ? 'bg-brand-surface text-brand-text shadow-sm' : 'text-brand-text-muted hover:text-brand-text'
                }`}
              >
                {tab === 'All' ? 'All' : tab === 'Fast' ? '⚡ Fast' : '🐢 Slow'}
              </button>
            ))}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-brand-text-muted italic">No product velocity data available.</div>
        ) : (
          <div className="space-y-2.5">
            {filteredItems.map((item, idx) => {
              const isFast = item.velocity === 'Fast'

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-brand-border bg-brand-bg-subtle/50 hover:border-brand-primary/40 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                        isFast ? 'bg-brand-primary-light text-brand-primary-dark' : 'bg-brand-danger-light text-brand-danger'
                      }`}
                    >
                      #{idx + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-brand-text truncate group-hover:text-brand-primary">{item.name}</span>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${isFast ? 'bg-brand-primary-light text-brand-primary-dark' : 'bg-brand-warning-light text-brand-warning-dark'}`}>
                          {item.velocity}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-brand-text-subtle mt-0.5">
                        <span>{item.category}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          Turnover: <strong className="text-brand-text-muted">{item.turnoverDays}d</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-xs text-brand-text">{item.salesQty.toLocaleString('en-IN')} units</div>
                    <div className={`flex items-center justify-end gap-0.5 text-[10px] font-bold ${item.trend === 'up' ? 'text-brand-primary' : 'text-brand-danger'}`}>
                      {item.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      <span>{item.trendPercent > 0 ? `+${item.trendPercent}%` : `${item.trendPercent}%`}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-brand-border text-[11px] text-brand-text-muted flex items-center justify-between">
        <span className="flex items-center gap-1 font-semibold text-brand-primary">
          <TrendingUp className="w-3.5 h-3.5 text-brand-primary" />
          Fast threshold: &lt; 15 turnover days
        </span>
        <span className="flex items-center gap-1 font-semibold text-brand-danger">
          <TrendingDown className="w-3.5 h-3.5 text-brand-danger" />
          Slow threshold: &gt; 40 turnover days
        </span>
      </div>
    </div>
  )
}
