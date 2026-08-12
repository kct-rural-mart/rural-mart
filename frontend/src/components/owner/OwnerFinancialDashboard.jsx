import { useMemo, useState } from 'react'
import { Trash2, Edit2, X, Download, BookOpen, ArrowUpRight, Calculator, CheckCircle2, TrendingUp } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { getChartTheme } from '../../lib/newPages/chartColors'
import { getFinancialLedgerLogs, saveFinancialLedgerLogs } from '../../lib/newPages/shared/dataServices'
import { getStoredSession } from '../../lib/newPages/storageService'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const rev = payload.find((p) => p.dataKey === 'revenue')?.value || 0
    const gp = payload.find((p) => p.dataKey === 'grossProfit')?.value || 0
    const margin = rev > 0 ? ((gp / rev) * 100).toFixed(1) : '0.0'

    return (
      <div className="p-3 rounded-xl bg-brand-surface border border-brand-border shadow-lg text-xs space-y-1">
        <p className="font-bold text-brand-text">{label}</p>
        <div className="text-brand-success font-semibold">Revenue: ₹{rev.toLocaleString('en-IN')}</div>
        <div className="text-brand-accent font-semibold">Gross Profit: ₹{gp.toLocaleString('en-IN')}</div>
        <div className="text-brand-warning font-bold pt-1 border-t border-brand-border/60">Margin Rate: {margin}%</div>
      </div>
    )
  }
  return null
}

export default function OwnerFinancialDashboard() {
  const chartTheme = getChartTheme()

  const session = getStoredSession()
  const ruralMartId = session?.ruralMartId || session?.email || 'RM-001'

  const [ledgerLogs, setLedgerLogs] = useState(() => getFinancialLedgerLogs(ruralMartId))

  const totalRevenue = useMemo(() => ledgerLogs.reduce((acc, log) => acc + log.grossRevenue, 0), [ledgerLogs])
  const totalNetProfit = useMemo(() => ledgerLogs.reduce((acc, log) => acc + log.netProfit, 0), [ledgerLogs])
  const totalProcurement = useMemo(() => ledgerLogs.reduce((acc, log) => acc + log.procurementCosts, 0), [ledgerLogs])
  const totalExpenses = useMemo(() => ledgerLogs.reduce((acc, log) => acc + log.operatingExpenses, 0), [ledgerLogs])
  const netMarginPct = totalRevenue > 0 ? ((totalNetProfit / totalRevenue) * 100).toFixed(1) : '0.0'
  const cogsRatioPct = totalRevenue > 0 ? ((totalProcurement / totalRevenue) * 100).toFixed(1) : '0.0'

  const chartData = useMemo(() => {
    return ledgerLogs
      .map((log) => ({
        date: log.dateStr.split(' ')[0] + ' ' + (log.dateStr.split(' ')[1] || ''),
        revenue: log.grossRevenue,
        grossProfit: log.grossRevenue - log.procurementCosts,
      }))
      .reverse()
  }, [ledgerLogs])

  const peakRevenue = useMemo(() => {
    if (chartData.length === 0) return 0
    return Math.max(...chartData.map((d) => d.revenue))
  }, [chartData])

  const recentEntries = useMemo(() => {
    return ledgerLogs.slice(0, 3).map((log) => ({ date: log.dateStr, revenue: log.grossRevenue, profit: log.netProfit }))
  }, [ledgerLogs])

  const updateLedgerLogs = (newLogs) => {
    setLedgerLogs(newLogs)
    saveFinancialLedgerLogs('RM-001', newLogs)
  }

  const [isLogsPanelOpen, setIsLogsPanelOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingLog, setEditingLog] = useState(null)

  const [toastMessage, setToastMessage] = useState(null)

  const [operationType, setOperationType] = useState('Retail Sales & Procurement')
  const [grossRevenueInput, setGrossRevenueInput] = useState('0')
  const [procurementCostsInput, setProcurementCostsInput] = useState('0')
  const [operatingExpensesInput, setOperatingExpensesInput] = useState('0')

  const revVal = Number(grossRevenueInput) || 0
  const procVal = Number(procurementCostsInput) || 0
  const opexVal = Number(operatingExpensesInput) || 0

  const liveGrossProfit = revVal - procVal
  const liveNetProfit = revVal - procVal - opexVal

  const [editAuditDate, setEditAuditDate] = useState('2026-08-06')
  const [editOperationType, setEditOperationType] = useState('Retail Sales & Procurement')
  const [editGrossRev, setEditGrossRev] = useState('0')
  const [editProcurement, setEditProcurement] = useState('0')
  const [editOpEx, setEditOpEx] = useState('0')

  const editRevVal = Number(editGrossRev) || 0
  const editProcVal = Number(editProcurement) || 0
  const editOpExVal = Number(editOpEx) || 0

  const editComputedGrossProfit = editRevVal - editProcVal
  const editComputedNetProfit = editRevVal - editProcVal - editOpExVal

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleClearForm = () => {
    setOperationType('Retail Sales & Procurement')
    setGrossRevenueInput('0')
    setProcurementCostsInput('0')
    setOperatingExpensesInput('0')
  }

  const handleSaveFinancialLog = (e) => {
    e.preventDefault()

    const newLog = {
      id: `fin-${Date.now()}`,
      voucherCode: `FIN-0${ledgerLogs.length + 1}`,
      dateStr: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      rawDate: new Date().toISOString().split('T')[0],
      status: 'Saved',
      operationType: operationType.trim() || 'General Operation',
      grossRevenue: revVal,
      procurementCosts: procVal,
      operatingExpenses: opexVal,
      netProfit: liveNetProfit,
    }

    updateLedgerLogs([newLog, ...ledgerLogs])
    showToast('Financial log saved successfully!')
    handleClearForm()
  }

  const handleOpenEdit = (log) => {
    setEditingLog(log)
    setEditAuditDate(log.rawDate || '2026-08-06')
    setEditOperationType(log.operationType)
    setEditGrossRev(String(log.grossRevenue))
    setEditProcurement(String(log.procurementCosts))
    setEditOpEx(String(log.operatingExpenses))
    setIsEditModalOpen(true)
  }

  const handleDeleteLog = (id) => {
    updateLedgerLogs(ledgerLogs.filter((item) => item.id !== id))
    setIsEditModalOpen(false)
    setEditingLog(null)
    showToast('Ledger entry deleted successfully.')
  }

  const handleSaveVoucherChanges = (e) => {
    e.preventDefault()
    if (!editingLog) return

    const updatedNetProfit = editRevVal - editProcVal - editOpExVal

    const parsedDate = new Date(editAuditDate)
    const dateFormatted = isNaN(parsedDate.getTime())
      ? editingLog.dateStr
      : `${parsedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} (${parsedDate.toLocaleDateString('en-US', { weekday: 'short' })})`

    updateLedgerLogs(
      ledgerLogs.map((log) =>
        log.id === editingLog.id
          ? {
              ...log,
              rawDate: editAuditDate,
              dateStr: dateFormatted,
              status: 'Edited',
              operationType: editOperationType.trim() || log.operationType,
              grossRevenue: editRevVal,
              procurementCosts: editProcVal,
              operatingExpenses: editOpExVal,
              netProfit: updatedNetProfit,
            }
          : log
      )
    )

    setIsEditModalOpen(false)
    setEditingLog(null)
    showToast(`Voucher ${editingLog.voucherCode} updated successfully!`)
  }

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
          <h1 className="text-xl font-bold text-brand-text">Financial Audit &amp; Accounting Dashboard</h1>
          <p className="text-xs text-brand-text-muted mt-0.5">Calculate gross margins, operational overheads, and edit daily ledger logs.</p>
        </div>

        <button
          onClick={() => setIsLogsPanelOpen(true)}
          className="h-9 px-4 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <BookOpen className="w-4 h-4" />
          <span>Historical Audit Ledger Logs ({ledgerLogs.length})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">TOTAL GROSS REVENUE</span>
          <div className="text-2xl font-extrabold text-brand-text">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <span className="text-[11px] font-semibold text-brand-success flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> 0% YoY growth
          </span>
        </div>

        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">NET OPERATING PROFIT</span>
          <div className="text-2xl font-extrabold text-brand-primary">₹{totalNetProfit.toLocaleString('en-IN')}</div>
          <span className="text-[11px] font-semibold text-brand-success flex items-center gap-0.5">{netMarginPct}% Net Margin</span>
        </div>

        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">TOTAL PROCUREMENT COSTS</span>
          <div className="text-2xl font-extrabold text-brand-text">₹{totalProcurement.toLocaleString('en-IN')}</div>
          <span className="text-[11px] font-medium text-brand-text-muted">{cogsRatioPct}% COGS ratio</span>
        </div>

        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">OVERHEAD &amp; EXPENSES</span>
          <div className="text-2xl font-extrabold text-brand-warning">₹{totalExpenses.toLocaleString('en-IN')}</div>
          <span className="text-[11px] font-medium text-brand-text-muted">Rent, utilities &amp; logistics</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 card-enterprise p-4 sm:p-5 space-y-4">
          <div className="border-b border-brand-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-brand-primary" />
              <h2 className="text-sm font-bold text-brand-text uppercase tracking-wider">Financial Entry &amp; Real-time Calculation</h2>
            </div>
            <p className="text-xs text-brand-text-muted mt-0.5">Enter daily operational values to compute margins live.</p>
          </div>

          <form onSubmit={handleSaveFinancialLog} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-brand-text">
                Type of Operation <span className="text-brand-danger">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Retail Sales & Procurement, Bulk Wholesaling..."
                value={operationType}
                onChange={(e) => setOperationType(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-brand-text">
                Gross Revenue (₹) <span className="text-brand-danger">*</span>
              </label>
              <input
                type="number"
                required
                value={grossRevenueInput}
                onChange={(e) => setGrossRevenueInput(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-brand-text">
                Procurement Costs (₹) <span className="text-brand-danger">*</span>
              </label>
              <input
                type="number"
                required
                value={procurementCostsInput}
                onChange={(e) => setProcurementCostsInput(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-brand-text">
                Operating Expenses (₹) <span className="text-brand-danger">*</span>
              </label>
              <input
                type="number"
                required
                value={operatingExpensesInput}
                onChange={(e) => setOperatingExpensesInput(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border text-center space-y-0.5">
                <span className="text-[10px] font-bold text-brand-text-muted uppercase block">GROSS PROFIT</span>
                <span className="text-base font-extrabold text-brand-text">₹{liveGrossProfit.toLocaleString('en-IN')}</span>
              </div>

              <div className="p-3 rounded-xl bg-brand-primary-light border border-brand-primary/20 text-center space-y-0.5">
                <span className="text-[10px] font-bold text-brand-primary uppercase block">NET PROFIT</span>
                <span className="text-base font-extrabold text-brand-primary">₹{liveNetProfit.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-brand-border/60">
              <button
                type="button"
                onClick={handleClearForm}
                className="h-9 px-4 rounded-xl border border-brand-border text-xs font-semibold text-brand-text-muted hover:bg-brand-bg-subtle cursor-pointer transition-colors"
              >
                Clear Form
              </button>

              <button
                type="submit"
                className="h-9 px-5 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Save Financial Log
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-7 card-enterprise p-4 sm:p-5 space-y-4">
          <div className="border-b border-brand-border/60 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-primary" />
              <h2 className="text-sm font-bold text-brand-text uppercase tracking-wider">7-DAY REVENUE VS GROSS PROFIT</h2>
            </div>
            <p className="text-xs text-brand-text-muted mt-0.5">Daily margin divergence over current billing cycle</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase block">7-DAY PEAK REVENUE</span>
              <span className="text-lg font-extrabold text-brand-text">₹{peakRevenue.toLocaleString('en-IN')}</span>
            </div>

            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase block">AVERAGE MARGIN RATE</span>
              <span className="text-lg font-extrabold text-brand-success">{netMarginPct}%</span>
            </div>
          </div>

          <div className="h-56 w-full pt-2">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-brand-text-muted italic">
                No financial transaction data recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
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
                  <XAxis dataKey="date" stroke={chartTheme.textColor} fontSize={11} />
                  <YAxis stroke={chartTheme.textColor} fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#174F3A" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                  <Area type="monotone" dataKey="grossProfit" name="Gross Profit" stroke="#0D9488" fillOpacity={1} fill="url(#colorGp)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs border-t border-brand-border/60 pt-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-brand-primary" />
              <span className="font-semibold text-brand-text">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-brand-accent" />
              <span className="font-semibold text-brand-text">Gross Profit</span>
            </div>
          </div>

          <div className="pt-2 space-y-2 border-t border-brand-border/60">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">RECENT LOGGED ENTRIES</h3>
              <span className="text-[11px] font-medium text-brand-text-muted">{recentEntries.length} entries tracked</span>
            </div>

            <div className="space-y-1.5">
              {recentEntries.length === 0 ? (
                <p className="text-xs text-brand-text-muted italic text-center py-3">No recent ledger entries recorded.</p>
              ) : (
                recentEntries.map((entry, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-brand-bg-subtle border border-brand-border flex items-center justify-between text-xs">
                    <span className="font-bold text-brand-text">{entry.date}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-brand-text-muted">
                        Rev: <strong className="text-brand-text">₹{entry.revenue.toLocaleString('en-IN')}</strong>
                      </span>
                      <span className="text-brand-success font-bold">Profit: ₹{entry.profit.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {isLogsPanelOpen && (
        <div className="fixed inset-0 z-50 bg-brand-text/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-primary" />
                  <span>Financial Audit Ledger Logs</span>
                </h3>
                <p className="text-xs text-brand-text-muted">Historical daily audit &amp; operation records</p>
              </div>
              <button onClick={() => setIsLogsPanelOpen(false)} className="text-brand-text-subtle hover:text-brand-text p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {ledgerLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-xl bg-brand-bg-subtle border border-brand-border space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-brand-text">{log.dateStr}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          log.status === 'Edited' ? 'bg-brand-warning-light text-brand-warning-dark' : 'bg-brand-success-light text-brand-success'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-brand-success">Net: ₹{log.netProfit.toLocaleString('en-IN')}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(log)}
                          className="h-7 px-2.5 rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-primary-light text-brand-primary text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="h-7 w-7 rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-danger-light text-brand-danger inline-flex items-center justify-center cursor-pointer"
                          title="Delete Log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-brand-primary-light text-brand-primary text-[10px] font-semibold">{log.operationType}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-brand-surface border border-brand-border text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-brand-text-muted block">Revenue</span>
                      <strong className="text-brand-text">₹{log.grossRevenue.toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-text-muted block">Procurement</span>
                      <strong className="text-brand-text">₹{log.procurementCosts.toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-text-muted block">Expenses</span>
                      <strong className="text-brand-warning">₹{log.operatingExpenses.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>
              ))}

              {ledgerLogs.length === 0 && <div className="py-8 text-center text-xs text-brand-text-muted">No audit ledger logs found.</div>}
            </div>

            <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between shrink-0">
              <span className="text-xs text-brand-text-muted font-medium">Total {ledgerLogs.length} records</span>

              <button
                onClick={() => showToast('Exporting Financial Ledger PDF...')}
                className="h-9 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Ledger PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingLog && (
        <div className="fixed inset-0 z-50 bg-brand-text/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-brand-primary" />
                  <span>Edit Financial Audit Voucher ({editingLog.voucherCode})</span>
                </h3>
                <p className="text-[11px] text-brand-text-muted">Modify financial values, operation types, and recalculate margins.</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-brand-text-subtle hover:text-brand-text p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVoucherChanges} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Audit Date <span className="text-brand-danger">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={editAuditDate}
                  onChange={(e) => setEditAuditDate(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-brand-text">
                    Type of Operation <span className="text-brand-danger">*</span>
                  </label>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Retail Sales & Procurement"
                  value={editOperationType}
                  onChange={(e) => setEditOperationType(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Gross Revenue (₹) <span className="text-brand-danger">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={editGrossRev}
                  onChange={(e) => setEditGrossRev(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-text">
                    Procurement Costs (₹) <span className="text-brand-danger">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={editProcurement}
                    onChange={(e) => setEditProcurement(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-text">
                    Operating Expenses (₹) <span className="text-brand-danger">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={editOpEx}
                    onChange={(e) => setEditOpEx(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-2.5 rounded-xl bg-brand-bg-subtle border border-brand-border text-center">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase block">GROSS PROFIT</span>
                  <span className="text-sm font-extrabold text-brand-text">₹{editComputedGrossProfit.toLocaleString('en-IN')}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-brand-primary-light border border-brand-primary/20 text-center">
                  <span className="text-[10px] font-bold text-brand-primary uppercase block">NET PROFIT</span>
                  <span className="text-sm font-extrabold text-brand-primary">₹{editComputedNetProfit.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => handleDeleteLog(editingLog.id)}
                  className="h-9 px-3 rounded-xl border border-brand-danger-border text-brand-danger text-xs font-bold hover:bg-brand-danger-light cursor-pointer transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Log</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="h-9 px-4 rounded-xl border border-brand-border text-xs font-semibold hover:bg-brand-bg-subtle cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-9 px-4 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Save Voucher Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
