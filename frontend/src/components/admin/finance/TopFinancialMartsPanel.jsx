import { Award, TrendingUp, ChevronRight } from 'lucide-react'

function getRankBadge(rank) {
  switch (rank) {
    case 1:
      return 'bg-brand-warning text-white'
    case 2:
      return 'bg-brand-primary-light text-brand-primary-dark'
    case 3:
      return 'bg-brand-warning-dark text-white'
    default:
      return 'bg-brand-bg-subtle text-brand-text-muted border border-brand-border'
  }
}

export default function TopFinancialMartsPanel({ financialMarts, onSelectMart }) {
  const topMarts = [...financialMarts]
    .filter((m) => m.salesRaw > 0)
    .sort((a, b) => b.profitMargin - a.profitMargin)
    .slice(0, 5)

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-warning-light text-brand-warning">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-brand-text tracking-tight">Top Performing Financial Rural Marts</h3>
          </div>
        </div>

        {topMarts.length === 0 ? (
          <div className="py-8 text-center text-xs text-brand-text-muted italic">No financial data available yet.</div>
        ) : (
          <div className="space-y-2.5">
            {topMarts.map((mart, idx) => {
              const rank = idx + 1
              const maxMargin = topMarts[0]?.profitMargin || 1
              const percentageWidth = Math.min(100, Math.round((mart.profitMargin / maxMargin) * 100))

              return (
                <div
                  key={mart.id}
                  onClick={() => onSelectMart(mart)}
                  className="p-2.5 rounded-xl border border-brand-border hover:border-brand-accent bg-brand-bg-subtle hover:bg-brand-primary-light/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 h-5 rounded-lg text-[10px] font-extrabold flex items-center justify-center shrink-0 ${getRankBadge(rank)}`}>#{rank}</span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-brand-text truncate group-hover:text-brand-primary">{mart.name}</h4>
                        <p className="text-[10px] text-brand-text-subtle font-medium">{mart.district} District • {mart.salesDisplay} Sales</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-xs text-brand-primary">{mart.profitMargin}% Margin</div>
                      <div className="text-[10px] font-semibold text-brand-text-muted">Net: {mart.netProfitDisplay}</div>
                    </div>
                  </div>

                  <div className="w-full bg-brand-border rounded-full h-1.5 overflow-hidden">
                    <div className="bg-brand-primary h-full rounded-full transition-all duration-500" style={{ width: `${percentageWidth}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-brand-text-subtle mt-1.5">
                    <span className="flex items-center gap-1 font-semibold text-brand-primary">
                      <TrendingUp className="w-3 h-3" /> +{mart.salesGrowthPercent}% growth YoY
                    </span>
                    <span className="group-hover:translate-x-1 transition-transform flex items-center text-brand-primary font-bold">
                      View P&amp;L <ChevronRight className="w-3 h-3 ml-0.5 inline" />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
