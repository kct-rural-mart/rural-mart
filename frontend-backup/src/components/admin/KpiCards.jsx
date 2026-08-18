import { useState } from 'react'
import { Store, Activity, TrendingUp, BarChart2, Users, Target, Info } from 'lucide-react'

export default function KpiCards({ marts }) {
  const [activeTooltip, setActiveTooltip] = useState(null)

  const totalMarts = marts.length
  const activeMartsCount = marts.filter((m) => m.status === 'Active').length
  const totalSalesRaw = marts.reduce((sum, m) => sum + m.salesRaw, 0)
  const totalProfitRaw = marts.reduce((sum, m) => sum + m.grossProfitRaw, 0)
  const totalFarmersReg = marts.reduce((sum, m) => sum + m.registeredFarmers, 0)
  const totalFarmersReached = marts.reduce((sum, m) => sum + m.farmersReached, 0)

  const formatSalesDisplay = (valRaw) => {
    if (valRaw >= 10000000) {
      return `₹${(valRaw / 10000000).toFixed(2)} Cr`
    }
    return `₹${(valRaw / 100000).toFixed(1)} L`
  }

  const formatProfitDisplay = (valRaw) => `₹${(valRaw / 100000).toFixed(1)} L`

  const kpiData = [
    {
      id: 'kpi-total-marts',
      label: 'Total Rural Marts',
      value: totalMarts.toString(),
      icon: Store,
      tooltip: 'Total sanctioned operating and expanding Rural Mart outposts across monitored districts.',
    },
    {
      id: 'kpi-active-marts',
      label: 'Active Rural Marts',
      value: activeMartsCount.toString(),
      icon: Activity,
      tooltip: 'Marts actively transmitting daily sales, inventory, and ledger records to the central hub.',
    },
    {
      id: 'kpi-total-sales',
      label: 'Total Sales',
      value: formatSalesDisplay(totalSalesRaw),
      icon: TrendingUp,
      tooltip: 'Cumulative gross revenue generated from agri-inputs, cattle feed, and local farmer product sales.',
    },
    {
      id: 'kpi-gross-profit',
      label: 'Gross Profit',
      value: formatProfitDisplay(totalProfitRaw),
      icon: BarChart2,
      tooltip: 'Gross profit margin realized after subtracting product cost of goods sold (COGS).',
    },
    {
      id: 'kpi-registered-farmers',
      label: 'Registered Farmers',
      value: totalFarmersReg.toLocaleString('en-IN'),
      icon: Users,
      tooltip: 'Farmers registered under the NABARD Rural Mart membership cooperative system.',
    },
    {
      id: 'kpi-farmers-reached',
      label: 'Farmers Reached',
      value: totalFarmersReached.toLocaleString('en-IN'),
      icon: Target,
      tooltip: 'Unique smallholder farmers directly participating in transactions or outreach camps this period.',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {kpiData.map((kpi) => {
        const Icon = kpi.icon
        const isTooltipOpen = activeTooltip === kpi.id

        return (
          <div
            key={kpi.id}
            className="bg-brand-surface border border-brand-border rounded-xl p-3.5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-brand-primary/40 transition-all duration-200 cursor-pointer relative flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider truncate">
                {kpi.label}
              </span>
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
              <span className="text-xl md:text-2xl font-bold text-brand-text tracking-tight">
                {kpi.value}
              </span>
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
