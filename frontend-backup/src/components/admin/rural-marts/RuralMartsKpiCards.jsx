import { useState } from 'react'
import { Store, CheckCircle2, AlertTriangle, Award, Zap, Percent, Info } from 'lucide-react'

export default function RuralMartsKpiCards({ marts }) {
  const [activeTooltip, setActiveTooltip] = useState(null)

  const totalMarts = marts.length
  const activeMarts = marts.filter((m) => m.status === 'Active').length
  const inactiveMarts = totalMarts - activeMarts

  const sortedByNetProfit = [...marts].filter((m) => m.netProfitRaw > 0).sort((a, b) => b.netProfitRaw - a.netProfitRaw)
  const topMart = sortedByNetProfit[0]

  const sortedByGrowth = [...marts].filter((m) => m.salesGrowthPercent > 0).sort((a, b) => b.salesGrowthPercent - a.salesGrowthPercent)
  const fastestMart = sortedByGrowth[0]

  const martsWithSales = marts.filter((m) => m.salesRaw > 0)
  const avgProfitMargin = martsWithSales.length > 0 ? (martsWithSales.reduce((acc, m) => acc + m.profitMargin, 0) / martsWithSales.length).toFixed(1) : '0.0'

  const kpis = [
    { id: 'kpi-total', label: 'Total Rural Marts', value: totalMarts.toString(), icon: Store, tooltip: 'Total registered Rural Mart outposts across monitored districts.' },
    { id: 'kpi-active', label: 'Active Rural Marts', value: activeMarts.toString(), icon: CheckCircle2, tooltip: 'Rural Marts with at least one recorded sale in the selected period.' },
    { id: 'kpi-inactive', label: 'Inactive / Delayed', value: inactiveMarts.toString(), icon: AlertTriangle, tooltip: 'Rural Marts with no sales in the selected period - restocking only (Delayed) or no activity at all (Inactive).' },
    { id: 'kpi-top', label: 'Top Mart by Net Profit', value: topMart ? topMart.name : 'N/A', icon: Award, tooltip: 'Rural Mart with the highest Net Profit (Revenue - Procurement - Operating Expenses) in the selected period.' },
    { id: 'kpi-fastest', label: 'Fastest Growing Mart', value: fastestMart ? fastestMart.name : 'N/A', icon: Zap, tooltip: 'Rural Mart with the highest sales growth vs. the equivalent prior period.' },
    { id: 'kpi-avg-margin', label: 'Avg Profit Margin', value: `${avgProfitMargin}%`, icon: Percent, tooltip: 'Average Net Profit Margin across Rural Marts with recorded sales in the selected period.' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        const isTooltipOpen = activeTooltip === kpi.id

        return (
          <div
            key={kpi.id}
            className="bg-brand-surface border border-brand-border rounded-xl p-3.5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-brand-primary/40 transition-all duration-200 cursor-pointer relative flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider truncate">{kpi.label}</span>
              <div className="relative flex items-center">
                <button
                  onMouseEnter={() => setActiveTooltip(kpi.id)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(isTooltipOpen ? null : kpi.id)}
                  className="text-brand-text-subtle hover:text-brand-primary transition-colors p-0.5"
                  title="More information"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                {isTooltipOpen && (
                  <div className="absolute right-0 top-6 w-48 bg-brand-text text-white text-[10px] p-2 rounded-lg shadow-lg z-50 pointer-events-none leading-relaxed border border-brand-accent">
                    {kpi.tooltip}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2 my-1">
              <span className="text-xl md:text-2xl font-bold text-brand-text tracking-tight truncate">{kpi.value}</span>
              <div className="w-7 h-7 rounded-lg bg-brand-primary-light text-brand-primary flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
