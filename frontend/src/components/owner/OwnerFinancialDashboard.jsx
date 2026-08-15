import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { X, Plus, CheckCircle2, AlertCircle, Loader2, TrendingUp } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { getChartTheme } from '../../lib/newPages/chartColors'
import { getFinanceDashboardData, formatLakhsCr } from '../../lib/queries/finance'
import { addExpense, EXPENSE_CATEGORIES } from '../../lib/queries/ownerExpenses'
import { getLocalToday } from '../../utils/date'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const rev = payload.find((p) => p.dataKey === 'sales')?.value || 0
    const gp = payload.find((p) => p.dataKey === 'grossProfit')?.value || 0
    return (
      <div className="p-3 rounded-xl bg-brand-surface border border-brand-border shadow-lg text-xs space-y-1">
        <p className="font-bold text-brand-text">{label}</p>
        <div className="text-brand-success font-semibold">Revenue: ₹{rev.toLocaleString('en-IN')} L</div>
        <div className="text-brand-accent font-semibold">Gross Profit: ₹{gp.toLocaleString('en-IN')} L</div>
      </div>
    )
  }
  return null
}

export default function OwnerFinancialDashboard() {
  const { ruralMartId, dateRange, refreshKey: layoutRefreshKey } = useOutletContext()
  const chartTheme = getChartTheme()

  const [mart, setMart] = useState(null)
  const [trendData, setTrendData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [localRefresh, setLocalRefresh] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const result = await getFinanceDashboardData({ dateRange })
        if (isMounted) {
          setMart(result.financialMarts.find((m) => m.id === ruralMartId) ?? null)
          setTrendData(result.trendData)
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load financial data.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (ruralMartId) load()
    return () => {
      isMounted = false
    }
  }, [ruralMartId, dateRange, layoutRefreshKey, localRefresh])

  const [toastMessage, setToastMessage] = useState(null)
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [expenseCategory, setExpenseCategory] = useState(EXPENSE_CATEGORIES[0])
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseDescription, setExpenseDescription] = useState('')
  const [expenseDate, setExpenseDate] = useState(getLocalToday())
  const [expenseSubmitting, setExpenseSubmitting] = useState(false)
  const [expenseError, setExpenseError] = useState('')

  const resetExpenseForm = () => {
    setExpenseCategory(EXPENSE_CATEGORIES[0])
    setExpenseAmount('')
    setExpenseDescription('')
    setExpenseDate(getLocalToday())
    setExpenseError('')
  }

  const handleAddExpenseSubmit = async (e) => {
    e.preventDefault()
    if (!expenseAmount) return
    setExpenseSubmitting(true)
    setExpenseError('')
    try {
      await addExpense({
        ruralMartId,
        category: expenseCategory,
        amount: Number(expenseAmount),
        description: expenseDescription.trim(),
        expenseDate,
      })
      setIsAddExpenseOpen(false)
      resetExpenseForm()
      setLocalRefresh((k) => k + 1)
      showToast('Expense recorded successfully.')
    } catch (err) {
      setExpenseError(err.message || 'Failed to record expense.')
    } finally {
      setExpenseSubmitting(false)
    }
  }

  if (loading && !mart) {
    return (
      <div className="flex items-center justify-center h-64 text-brand-text-muted gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Loading financial data…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-xl bg-brand-danger-light border border-brand-danger-border text-brand-danger text-sm">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{error}</span>
      </div>
    )
  }

  const expenseCategories = Object.entries(mart?.expenseBreakdown || {}).sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-4">
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-lg border border-white/20 flex items-center justify-between transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-brand-surface border border-brand-border rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-text">Financial Dashboard</h1>
          <p className="text-xs text-brand-text-muted mt-0.5">Revenue, procurement, and profit for your Rural Mart, calculated from real transactions.</p>
        </div>

        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="h-9 px-4 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">REVENUE</span>
          <div className="text-2xl font-extrabold text-brand-text">{formatLakhsCr(mart?.salesRaw ?? 0)}</div>
        </div>

        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">PROCUREMENT</span>
          <div className="text-2xl font-extrabold text-brand-text">{formatLakhsCr(mart?.procurementRaw ?? 0)}</div>
        </div>

        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">GROSS PROFIT</span>
          <div className="text-2xl font-extrabold text-brand-accent">{formatLakhsCr(mart?.grossProfitRaw ?? 0)}</div>
        </div>

        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">NET PROFIT</span>
          <div className="text-2xl font-extrabold text-brand-primary">{formatLakhsCr(mart?.netProfitRaw ?? 0)}</div>
          <span className="text-[11px] font-semibold text-brand-text-muted">{mart?.profitMargin ?? 0}% margin</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 card-enterprise p-4 sm:p-5 space-y-4">
          <div className="border-b border-brand-border/60 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-primary" />
              <h2 className="text-sm font-bold text-brand-text uppercase tracking-wider">Sales vs Gross Profit Trend</h2>
            </div>
            <p className="text-xs text-brand-text-muted mt-0.5">Last 8 months, your Rural Mart only</p>
          </div>

          <div className="h-64 w-full">
            {trendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-brand-text-muted italic">No financial trend data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#174F3A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#174F3A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
                  <XAxis dataKey="period" stroke={chartTheme.textColor} fontSize={11} />
                  <YAxis stroke={chartTheme.textColor} fontSize={11} tickFormatter={(v) => `₹${v}L`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="sales" name="Sales" stroke="#174F3A" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                  <Area type="monotone" dataKey="grossProfit" name="Gross Profit" stroke="#0D9488" fillOpacity={1} fill="url(#colorGp)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 card-enterprise p-4 sm:p-5 space-y-3">
          <div className="border-b border-brand-border/60 pb-2.5">
            <h2 className="text-sm font-bold text-brand-text uppercase tracking-wider">Operating Expenses</h2>
            <p className="text-[11px] text-brand-text-muted">By category, for the selected period</p>
          </div>

          <div className="space-y-2">
            {expenseCategories.length === 0 ? (
              <p className="text-xs text-brand-text-muted italic text-center py-6">No expenses recorded for this period.</p>
            ) : (
              expenseCategories.map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between p-2.5 rounded-xl bg-brand-bg-subtle border border-brand-border text-xs">
                  <span className="font-semibold text-brand-text">{category}</span>
                  <span className="font-bold text-brand-text">₹{amount.toLocaleString('en-IN')}</span>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between text-xs">
            <span className="font-bold text-brand-text">Total Operating Expenses</span>
            <span className="font-extrabold text-brand-warning">₹{(mart?.operatingExpensesRaw ?? 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 bg-brand-text/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                  <Plus className="w-4 h-4 text-brand-primary" />
                  <span>Add Expense</span>
                </h3>
                <p className="text-[11px] text-brand-text-muted">Log an operating expense for your Rural Mart.</p>
              </div>
              <button
                onClick={() => {
                  setIsAddExpenseOpen(false)
                  resetExpenseForm()
                }}
                className="text-brand-text-subtle hover:text-brand-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3">
              {expenseError && (
                <div className="p-2.5 rounded-lg bg-brand-danger-light border border-brand-danger-border text-brand-danger text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{expenseError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Category <span className="text-brand-danger">*</span>
                </label>
                <select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Amount (₹) <span className="text-brand-danger">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly electricity bill"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Expense Date <span className="text-brand-danger">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddExpenseOpen(false)
                    resetExpenseForm()
                  }}
                  className="h-9 px-4 rounded-xl border border-brand-border text-xs font-semibold hover:bg-brand-bg-subtle cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" disabled={expenseSubmitting} className="h-9 px-5 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60">
                  {expenseSubmitting ? 'Saving…' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
