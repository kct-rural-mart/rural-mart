import { useMemo, useState } from 'react'
import { TrendingUp, DollarSign, Package, Users, ChevronDown, Info, ArrowUpRight } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { getChartTheme } from '../../lib/newPages/chartColors'
import { getStoredSession } from '../../lib/newPages/storageService'
import {
  getSalesByRuralMart,
  getExpensesByRuralMart,
  getProductsByRuralMart,
  getOutreachByRuralMart,
  getPurchasesByRuralMart,
} from '../../lib/newPages/shared/dataServices'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const salesVal = payload[0]?.value ?? 0
    const procVal = payload[1]?.value ?? 0

    return (
      <div className="bg-brand-surface border border-brand-border rounded-xl p-3 shadow-lg text-xs space-y-1.5 min-w-[170px]">
        <div className="font-bold text-brand-text border-b border-brand-border/60 pb-1">{label}</div>
        <div className="space-y-1">
          <div className="flex justify-between items-center text-brand-primary font-semibold">
            <span>Sales:</span>
            <span>₹{salesVal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center text-brand-warning font-semibold">
            <span>Proc:</span>
            <span>₹{procVal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export default function OwnerOverallDashboard() {
  const chartTheme = getChartTheme()

  const [chartMode, setChartMode] = useState('Current Period')
  const [hoveredDate, setHoveredDate] = useState(null)

  const session = getStoredSession()
  const ruralMartId = session?.ruralMartId || session?.email || ''

  const salesRecords = useMemo(() => (ruralMartId ? getSalesByRuralMart(ruralMartId) : []), [ruralMartId])
  const expenseRecords = useMemo(() => (ruralMartId ? getExpensesByRuralMart(ruralMartId) : []), [ruralMartId])
  const purchaseRecords = useMemo(() => (ruralMartId ? getPurchasesByRuralMart(ruralMartId) : []), [ruralMartId])
  const productRecords = useMemo(() => (ruralMartId ? getProductsByRuralMart(ruralMartId) : []), [ruralMartId])
  const outreachRecords = useMemo(() => (ruralMartId ? getOutreachByRuralMart(ruralMartId) : []), [ruralMartId])

  const totalSalesVal = useMemo(() => salesRecords.reduce((acc, curr) => acc + (curr.amount || 0), 0), [salesRecords])
  const totalProcurementVal = useMemo(() => purchaseRecords.reduce((acc, curr) => acc + (curr.amount || 0), 0), [purchaseRecords])
  const totalExpensesVal = useMemo(() => expenseRecords.reduce((acc, curr) => acc + (curr.amount || 0), 0), [expenseRecords])
  const netProfitVal = totalSalesVal - totalProcurementVal - totalExpensesVal

  const topProduct = useMemo(() => {
    if (productRecords.length === 0) return { name: 'No product data', units: 0 }
    const sorted = [...productRecords].sort((a, b) => (b.salesQty || 0) - (a.salesQty || 0))
    if (!sorted[0] || (sorted[0].salesQty || 0) === 0) {
      return { name: 'No product data', units: 0 }
    }
    return { name: sorted[0].name || 'No product data', units: sorted[0].salesQty || 0 }
  }, [productRecords])

  const newFarmerLeads = useMemo(() => outreachRecords.reduce((acc, curr) => acc + (curr.newLeads || 0), 0), [outreachRecords])

  const totalFarmersReached = useMemo(
    () => outreachRecords.reduce((acc, curr) => acc + (curr.farmersReached || curr.attended || 0), 0),
    [outreachRecords]
  )

  const conversionRateStr = totalFarmersReached > 0 ? `${((newFarmerLeads / totalFarmersReached) * 100).toFixed(1)}%` : '0%'

  const weeklyChartData = useMemo(() => {
    if (salesRecords.length === 0 && purchaseRecords.length === 0) {
      return []
    }
    const map = new Map()
    salesRecords.forEach((s) => {
      const d = s.date || 'Today'
      const prev = map.get(d) || { sales: 0, proc: 0 }
      map.set(d, { ...prev, sales: prev.sales + s.amount })
    })
    purchaseRecords.forEach((p) => {
      const d = p.date || 'Today'
      const prev = map.get(d) || { sales: 0, proc: 0 }
      map.set(d, { ...prev, proc: prev.proc + p.amount })
    })
    return Array.from(map.entries()).map(([date, val]) => ({ date, sales: val.sales, proc: val.proc }))
  }, [salesRecords, purchaseRecords])

  const salesSeriesLabel = chartMode === 'Previous Period' ? 'Previous Gross Sales (₹)' : 'Gross Sales Revenue (₹)'
  const procSeriesLabel = chartMode === 'Previous Period' ? 'Previous Procurement (₹)' : 'Procurement Expense (₹)'

  const getInfoPillText = () => {
    if (weeklyChartData.length === 0) return 'No business data available'
    if (chartMode === 'Current Period') {
      const maxSale = Math.max(...weeklyChartData.map((d) => d.sales), 0)
      return `Peak Revenue: ₹${maxSale.toLocaleString('en-IN')}`
    } else if (chartMode === 'Previous Period') {
      return 'Prior Peak: ₹0'
    }
    return `Outreach Impact Correlation: ${newFarmerLeads} New Leads`
  }

  return (
    <div className="space-y-4">
      {/* 1. HERO / SUMMARY BANNER */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary-light border border-brand-primary-dark/10 text-[11px] font-bold text-brand-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-success"></span>
              </span>
              <span>LIVE HUB</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-text">
              Rural Mart Operations &amp; Owner Overview
            </h1>

            <p className="text-xs text-brand-text-muted">
              Real-time synchronization across sales, stock movements, and outreach conversions.
            </p>
          </div>
        </div>
      </div>

      {/* 2. KPI STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="card-enterprise p-4.5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">TOTAL SALES</span>
            <div className="p-2 rounded-xl bg-brand-primary-light text-brand-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-brand-text font-mono">
              ₹{totalSalesVal.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[11px] font-bold text-brand-success flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> 0%
              </span>
              <span className="text-[11px] text-brand-text-subtle">vs previous period</span>
            </div>
          </div>
        </div>

        <div className="card-enterprise p-4.5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">NET PROFIT (₹)</span>
            <div className="p-2 rounded-xl bg-brand-success-light text-brand-success">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-brand-text font-mono">
              ₹{netProfitVal.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[11px] font-bold text-brand-success flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> 0%
              </span>
              <span className="text-[11px] text-brand-text-subtle">net margin</span>
            </div>
          </div>
        </div>

        <div className="card-enterprise p-4.5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">TOP SELLING ITEM</span>
            <div className="p-2 rounded-xl bg-brand-info-light text-brand-info-dark">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-brand-text truncate">{topProduct.name}</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[11px] font-bold text-brand-info-dark">{topProduct.units} Units Sold</span>
            </div>
          </div>
        </div>

        <div className="card-enterprise p-4.5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">NEW FARMER LEADS</span>
            <div className="p-2 rounded-xl bg-brand-info-light text-brand-info">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-brand-text font-mono">{newFarmerLeads} Farmers</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[11px] font-bold text-brand-info flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> {conversionRateStr}
              </span>
              <span className="text-[11px] text-brand-text-subtle">conversion rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN CHART SECTION */}
      <div className="card-enterprise p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border/60 pb-3">
          <div>
            <h3 className="text-base font-bold text-brand-text">Weekly Performance &amp; Demand Trends</h3>
            <p className="text-xs text-brand-text-muted">Hover anywhere over chart area to inspect exact period analytics</p>
          </div>

          <div className="relative shrink-0">
            <select
              value={chartMode}
              onChange={(e) => setChartMode(e.target.value)}
              className="h-9 pr-8 pl-3 appearance-none text-xs font-bold rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-primary-dark focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer shadow-xs"
            >
              <option value="Current Period">Current Period</option>
              <option value="Previous Period">Previous Period</option>
              <option value="Outreach Overlay">Outreach Overlay</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-primary pointer-events-none" />
          </div>
        </div>

        <div className="h-72 w-full pt-2 relative">
          {weeklyChartData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-xs text-brand-text-muted italic bg-brand-bg-subtle rounded-xl border border-brand-border/50">
              No business data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weeklyChartData}
                onMouseMove={(e) => {
                  if (e && e.activeLabel) {
                    setHoveredDate(e.activeLabel)
                  }
                }}
                onMouseLeave={() => setHoveredDate(null)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
                <XAxis dataKey="date" stroke={chartTheme.textColor} fontSize={11} tickLine={false} />
                <YAxis stroke={chartTheme.textColor} fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip content={<CustomTooltip />} />

                <Line
                  type="monotone"
                  dataKey="sales"
                  name={salesSeriesLabel}
                  stroke="#174F3A"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#174F3A' }}
                  activeDot={{ r: 6 }}
                />

                <Line
                  type="monotone"
                  dataKey="proc"
                  name={procSeriesLabel}
                  stroke="#D97706"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#D97706' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-brand-border/60">
          <div className="flex items-center gap-5 text-xs font-semibold">
            <div className="flex items-center gap-2 text-brand-text">
              <span className="w-5 h-0.5 bg-brand-primary rounded-full inline-block"></span>
              <span>{salesSeriesLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-brand-text">
              <span className="w-5 h-0.5 border-b-2 border-dashed border-brand-warning inline-block"></span>
              <span>{procSeriesLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end shrink-0">
            {hoveredDate && (
              <span className="text-[11px] font-mono font-bold text-brand-primary bg-brand-primary-light px-2.5 py-1 rounded-lg border border-brand-primary-dark/10">
                Hovered: {hoveredDate}
              </span>
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-bg-subtle border border-brand-border text-xs font-bold text-brand-text">
              <Info className="w-3.5 h-3.5 text-brand-primary" />
              <span>{getInfoPillText()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
