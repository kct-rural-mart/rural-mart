import { useState } from 'react'
import { TrendingUp, TrendingDown, ShoppingCart, PieChart, Wallet, Receipt, Percent, Info } from 'lucide-react'
import { CHART_COLORS } from '../../../lib/newPages/chartColors'
import { formatLakhsCr } from '../../../lib/queries/finance'

function SparklineSvg({ data, color }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const width = 64
  const height = 20

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width
      const y = height - ((val - min) / range) * (height - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  )
}

function growthOf(current, previous) {
  if (previous > 0) return Math.round(((current - previous) / previous) * 1000) / 10
  return current > 0 ? 100 : 0
}

export default function FinanceKpiCards({ financialMarts, trendData = [], billsGrowthData = [] }) {
  const [activeTooltip, setActiveTooltip] = useState(null)

  const totalSalesRaw = financialMarts.reduce((acc, m) => acc + m.salesRaw, 0)
  const totalProcurementRaw = financialMarts.reduce((acc, m) => acc + m.procurementRaw, 0)
  const totalGrossProfitRaw = financialMarts.reduce((acc, m) => acc + m.grossProfitRaw, 0)
  const totalNetProfitRaw = financialMarts.reduce((acc, m) => acc + m.netProfitRaw, 0)
  const totalBillsSum = financialMarts.reduce((acc, m) => acc + m.totalBills, 0)

  const totalPrevSalesRaw = financialMarts.reduce((acc, m) => acc + (m.prevSalesRaw || 0), 0)
  const totalPrevProcurementRaw = financialMarts.reduce((acc, m) => acc + (m.prevProcurementRaw || 0), 0)
  const totalPrevGrossProfitRaw = financialMarts.reduce((acc, m) => acc + (m.prevGrossProfitRaw || 0), 0)
  const totalPrevNetProfitRaw = financialMarts.reduce((acc, m) => acc + (m.prevNetProfitRaw || 0), 0)
  const totalPrevBillsSum = financialMarts.reduce((acc, m) => acc + (m.prevTotalBills || 0), 0)

  const overallMargin = totalSalesRaw > 0 ? ((totalNetProfitRaw / totalSalesRaw) * 100).toFixed(2) : '0.00'
  const overallAvgBill = totalBillsSum > 0 ? Math.round(totalSalesRaw / totalBillsSum) : 0
  const prevOverallMargin = totalPrevSalesRaw > 0 ? (totalPrevNetProfitRaw / totalPrevSalesRaw) * 100 : 0
  const prevOverallAvgBill = totalPrevBillsSum > 0 ? totalPrevSalesRaw / totalPrevBillsSum : 0

  // Sparklines & growth badges are derived from the same network-wide
  // monthly trend series the charts below use, not per-KPI fabricated data.
  const marginTrend = trendData.map((t) => (t.sales > 0 ? Math.round((t.netProfit / t.sales) * 1000) / 10 : 0))
  const avgBillTrend = billsGrowthData.map((b) => b.avgBillValue)

  const kpis = [
    {
      id: 'kpi-sales',
      label: 'Total Sales',
      value: formatLakhsCr(totalSalesRaw),
      icon: TrendingUp,
      growthPercent: growthOf(totalSalesRaw, totalPrevSalesRaw),
      sparklineData: trendData.map((t) => t.sales),
      tooltip: 'Total sales turnover realized across all active Rural Mart outposts, for the selected period.',
    },
    {
      id: 'kpi-procurement',
      label: 'Procurement Value',
      value: formatLakhsCr(totalProcurementRaw),
      icon: ShoppingCart,
      growthPercent: growthOf(totalProcurementRaw, totalPrevProcurementRaw),
      sparklineData: trendData.map((t) => t.procurement),
      tooltip: 'Total wholesale procurement expenditure for seed, fertilizer, and farm merchandise.',
    },
    {
      id: 'kpi-gross-profit',
      label: 'Gross Profit',
      value: formatLakhsCr(totalGrossProfitRaw),
      icon: PieChart,
      growthPercent: growthOf(totalGrossProfitRaw, totalPrevGrossProfitRaw),
      sparklineData: trendData.map((t) => t.grossProfit),
      tooltip: 'Revenue remaining after subtracting Cost of Goods Sold (COGS / Procurement).',
    },
    {
      id: 'kpi-net-profit',
      label: 'Net Profit',
      value: formatLakhsCr(totalNetProfitRaw),
      icon: Wallet,
      growthPercent: growthOf(totalNetProfitRaw, totalPrevNetProfitRaw),
      sparklineData: trendData.map((t) => t.netProfit),
      tooltip: 'Final net earnings after accounting for operating expenses.',
    },
    {
      id: 'kpi-avg-bill',
      label: 'Avg Bill Value',
      value: `₹${overallAvgBill.toLocaleString('en-IN')}`,
      icon: Receipt,
      growthPercent: growthOf(overallAvgBill, prevOverallAvgBill),
      sparklineData: avgBillTrend,
      tooltip: 'Average monetary amount spent per customer purchase bill across Rural Marts.',
    },
    {
      id: 'kpi-profit-margin',
      label: 'Profit Margin',
      value: `${overallMargin}%`,
      icon: Percent,
      growthPercent: growthOf(Number(overallMargin), prevOverallMargin),
      sparklineData: marginTrend,
      tooltip: 'Net profit expressed as a percentage of total revenue across the network.',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        const isTooltipOpen = activeTooltip === kpi.id
        const isPositive = kpi.growthPercent >= 0

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

            <div className="flex items-center justify-between gap-2 mt-1">
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isPositive ? 'bg-brand-primary-light text-brand-primary-dark' : 'bg-brand-danger-light text-brand-danger'
                }`}
              >
                {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                {isPositive ? '+' : ''}
                {kpi.growthPercent}%
              </span>
              <SparklineSvg data={kpi.sparklineData} color={isPositive ? CHART_COLORS.primary : '#dc2626'} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
