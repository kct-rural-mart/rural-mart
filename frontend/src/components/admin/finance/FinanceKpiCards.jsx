import { useState } from 'react'
import { TrendingUp, ShoppingCart, PieChart, Wallet, Receipt, Percent, Info } from 'lucide-react'

export default function FinanceKpiCards({ financialMarts }) {
  const [activeTooltip, setActiveTooltip] = useState(null)

  const totalSalesRaw = financialMarts.reduce((acc, m) => acc + m.salesRaw, 0)
  const totalProcurementRaw = financialMarts.reduce((acc, m) => acc + m.procurementRaw, 0)
  const totalGrossProfitRaw = financialMarts.reduce((acc, m) => acc + m.grossProfitRaw, 0)
  const totalNetProfitRaw = financialMarts.reduce((acc, m) => acc + m.netProfitRaw, 0)
  const totalBillsSum = financialMarts.reduce((acc, m) => acc + m.totalBills, 0)

  const overallMargin = totalSalesRaw > 0 ? ((totalNetProfitRaw / totalSalesRaw) * 100).toFixed(2) : '0.00'
  const overallAvgBill = totalBillsSum > 0 ? Math.round(totalSalesRaw / totalBillsSum) : 0

  const formatLakhsCr = (valRaw) => {
    if (valRaw >= 10000000) return `₹${(valRaw / 10000000).toFixed(2)} Cr`
    return `₹${(valRaw / 100000).toFixed(1)} L`
  }

  const kpis = [
    { id: 'kpi-sales', label: 'Total Sales', value: formatLakhsCr(totalSalesRaw), icon: TrendingUp, tooltip: 'Total sales turnover realized across all active Rural Mart outposts.' },
    { id: 'kpi-procurement', label: 'Procurement Value', value: formatLakhsCr(totalProcurementRaw), icon: ShoppingCart, tooltip: 'Total wholesale procurement expenditure for seed, fertilizer, and farm merchandise.' },
    { id: 'kpi-gross-profit', label: 'Gross Profit', value: formatLakhsCr(totalGrossProfitRaw), icon: PieChart, tooltip: 'Revenue remaining after subtracting Cost of Goods Sold (COGS).' },
    { id: 'kpi-net-profit', label: 'Net Profit', value: formatLakhsCr(totalNetProfitRaw), icon: Wallet, tooltip: 'Final net earnings after accounting for operating expenses, rent, and logistics overhead.' },
    { id: 'kpi-avg-bill', label: 'Avg Bill Value', value: `₹${overallAvgBill.toLocaleString('en-IN')}`, icon: Receipt, tooltip: 'Average monetary amount spent per customer purchase bill across Rural Marts.' },
    { id: 'kpi-profit-margin', label: 'Profit Margin', value: `${overallMargin}%`, icon: Percent, tooltip: 'Net profit expressed as a percentage of total revenue across the network.' },
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
              <span className="text-xl md:text-2xl font-bold text-brand-text tracking-tight">{kpi.value}</span>
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
