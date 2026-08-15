import { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { TrendingUp, DollarSign, Package, Users, Receipt, X, CheckCircle2, AlertCircle, Loader2, Truck, SquareArrowOutUpRight } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { CHART_COLORS } from '../../lib/newPages/chartColors'
import { getOwnerOverviewData } from '../../lib/queries/ownerOverview'
import { getOwnerProducts, addProduct, recordProcurement, PRODUCT_CATEGORIES } from '../../lib/queries/ownerProducts'
import { formatLakhsCr } from '../../lib/queries/finance'
import { getLocalToday } from '../../utils/date'
import BillingPanel from './BillingPanel'

export default function OwnerOverallDashboard() {
  const { ruralMartId, dateRange, refreshKey: layoutRefreshKey } = useOutletContext()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const bump = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    let isMounted = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const result = await getOwnerOverviewData({ ruralMartId, dateRange })
        if (isMounted) setData(result)
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load dashboard data.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (ruralMartId) load()
    return () => {
      isMounted = false
    }
  }, [ruralMartId, dateRange, layoutRefreshKey, refreshKey])

  const [toastMsg, setToastMsg] = useState(null)
  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 4000)
  }

  const [isDailySalesModalOpen, setIsDailySalesModalOpen] = useState(false)
  const billingPanelRef = useRef(null)

  const [isProcurementModalOpen, setIsProcurementModalOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [procureMode, setProcureMode] = useState('EXISTING')
  const [selectedProcureProductId, setSelectedProcureProductId] = useState('')
  const [procName, setProcName] = useState('')
  const [procCategory, setProcCategory] = useState(PRODUCT_CATEGORIES[0])
  const [procUnit, setProcUnit] = useState('')
  const [procQty, setProcQty] = useState('')
  const [procCost, setProcCost] = useState('')
  const [procSupplier, setProcSupplier] = useState('')
  const [procDate, setProcDate] = useState(getLocalToday())
  const [procError, setProcError] = useState('')
  const [procSubmitting, setProcSubmitting] = useState(false)

  useEffect(() => {
    if (!isProcurementModalOpen || !ruralMartId) return
    getOwnerProducts(ruralMartId)
      .then(setProducts)
      .catch((err) => console.error('Failed to load products for procurement:', err.message))
  }, [isProcurementModalOpen, ruralMartId, refreshKey])

  const handleSelectProcureProduct = (id) => {
    setSelectedProcureProductId(id)
    if (id === 'NEW') {
      setProcureMode('NEW')
      setProcName('')
      setProcCategory(PRODUCT_CATEGORIES[0])
      setProcUnit('')
    } else {
      setProcureMode('EXISTING')
    }
  }

  const resetProcureForm = () => {
    setProcureMode('EXISTING')
    setSelectedProcureProductId('')
    setProcName('')
    setProcCategory(PRODUCT_CATEGORIES[0])
    setProcUnit('')
    setProcQty('')
    setProcCost('')
    setProcSupplier('')
    setProcDate(getLocalToday())
    setProcError('')
  }

  const handleSaveProcurement = async (e) => {
    e.preventDefault()
    setProcError('')

    const numQty = Number(procQty)
    if (!numQty || numQty <= 0) {
      setProcError('Please enter a valid procurement quantity (> 0).')
      return
    }
    const numCost = Number(procCost)
    if (isNaN(numCost) || numCost <= 0) {
      setProcError('Please enter a valid total procurement cost.')
      return
    }

    setProcSubmitting(true)
    try {
      let productId = selectedProcureProductId

      if (procureMode === 'NEW') {
        if (!procName.trim() || !procUnit.trim()) {
          setProcError('Product name and unit are required for a new product.')
          setProcSubmitting(false)
          return
        }
        const newProduct = await addProduct({
          ruralMartId,
          category: procCategory,
          name: procName.trim(),
          unit: procUnit.trim(),
          purchasePrice: numCost / numQty,
          sellingPrice: numCost / numQty,
        })
        productId = newProduct.id
      }

      if (!productId) {
        setProcError('Please select a product, or choose "+ Create New Product".')
        setProcSubmitting(false)
        return
      }

      await recordProcurement({
        ruralMartId,
        productId,
        quantity: numQty,
        cost: numCost,
        supplierName: procSupplier.trim(),
        procurementDate: procDate,
      })

      setIsProcurementModalOpen(false)
      resetProcureForm()
      bump()
      showToast(`Successfully procured ${numQty} ${procUnit || 'units'}!`)
    } catch (err) {
      setProcError(err.message || 'Failed to record procurement.')
    } finally {
      setProcSubmitting(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64 text-brand-text-muted gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Loading dashboard…</span>
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

  return (
    <div className="space-y-4">
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-lg border border-white/20 flex items-center justify-between transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-xs relative overflow-hidden">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary-light border border-brand-primary-dark/10 text-[11px] font-bold text-brand-primary">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-success"></span>
            </span>
            <span>LIVE HUB</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-text">Rural Mart Operations &amp; Owner Overview</h1>
          <p className="text-xs text-brand-text-muted">Real-time synchronization across sales, stock movements, and outreach conversions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="card-enterprise p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">TOTAL SALES</span>
            <div className="p-2 rounded-xl bg-brand-primary-light text-brand-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-brand-text font-mono">{formatLakhsCr(data.salesRaw)}</div>
        </div>

        <div className="card-enterprise p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">NET PROFIT</span>
            <div className="p-2 rounded-xl bg-brand-success-light text-brand-success">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-brand-text font-mono">{formatLakhsCr(data.netProfitRaw)}</div>
        </div>

        <div className="card-enterprise p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">TOP SELLING ITEM</span>
            <div className="p-2 rounded-xl bg-brand-info-light text-brand-info-dark">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold tracking-tight text-brand-text truncate">{data.topProduct?.name ?? 'No sales recorded'}</div>
          <span className="text-[11px] font-bold text-brand-info-dark">{data.topProduct ? `${data.topProduct.soldQty} ${data.topProduct.unit} sold` : ''}</span>
        </div>

        <div className="card-enterprise p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">NEW FARMER LEADS</span>
            <div className="p-2 rounded-xl bg-brand-info-light text-brand-info">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-brand-text font-mono">{data.newFarmersCount}</div>
          <span className="text-[11px] font-bold text-brand-info">{data.conversionRate}% converted to buyers</span>
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-2.5">
          <div>
            <h2 className="text-sm font-bold text-brand-text uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-primary" />
              <span>QUICK ACTIONS</span>
            </h2>
            <p className="text-xs text-brand-text-muted">Execute daily operations instantly without leaving your overall dashboard.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-6">
          <button type="button" onClick={() => setIsDailySalesModalOpen(true)} className="group flex flex-col items-center gap-2 cursor-pointer w-24">
            <span className="relative">
              <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-primary-light text-brand-primary shadow-xs border border-brand-primary/20 group-hover:scale-105 group-hover:bg-brand-primary group-hover:text-white transition-all">
                <Receipt className="w-7 h-7" />
              </span>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-surface border border-brand-border shadow-xs flex items-center justify-center text-brand-primary group-hover:border-brand-primary transition-colors">
                <SquareArrowOutUpRight className="w-2.5 h-2.5" />
              </span>
            </span>
            <span className="text-xs font-bold text-brand-text text-center group-hover:text-brand-primary transition-colors">Daily Sales &amp; Billing</span>
          </button>

          <button type="button" onClick={() => setIsProcurementModalOpen(true)} className="group flex flex-col items-center gap-2 cursor-pointer w-24">
            <span className="relative">
              <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-warning-light text-brand-warning-dark shadow-xs border border-brand-warning-border group-hover:scale-105 group-hover:bg-brand-warning group-hover:text-white transition-all">
                <Truck className="w-7 h-7" />
              </span>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-surface border border-brand-border shadow-xs flex items-center justify-center text-brand-warning-dark group-hover:border-brand-warning transition-colors">
                <SquareArrowOutUpRight className="w-2.5 h-2.5" />
              </span>
            </span>
            <span className="text-xs font-bold text-brand-text text-center group-hover:text-brand-primary transition-colors">New Procurement</span>
          </button>
        </div>
      </div>

      <div className="card-enterprise p-5 space-y-4">
        <div className="border-b border-brand-border/60 pb-3">
          <h3 className="text-base font-bold text-brand-text">Sales Trend</h3>
          <p className="text-xs text-brand-text-muted">Last 8 months, your Rural Mart only</p>
        </div>

        <div className="h-72 w-full pt-2">
          {data.trendData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-xs text-brand-text-muted italic bg-brand-bg-subtle rounded-xl border border-brand-border/50">No business data available</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} vertical={false} />
                <XAxis dataKey="period" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11, fontWeight: 500 }} axisLine={{ stroke: CHART_COLORS.border }} tickLine={false} />
                <YAxis tick={{ fill: CHART_COLORS.textMuted, fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}L`} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />
                <Line type="monotone" dataKey="sales" name="Sales (₹L)" stroke={CHART_COLORS.primary} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS.primary }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="grossProfit" name="Gross Profit (₹L)" stroke={CHART_COLORS.warning} strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 4, fill: CHART_COLORS.warning }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {isDailySalesModalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-text/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-xl max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-brand-primary" />
                  <span>Daily Sale</span>
                </h3>
                <p className="text-xs text-brand-text-muted">Same billing panel as Daily Business — select or register a customer, add products, and record today's sale instantly.</p>
              </div>
              <button onClick={() => setIsDailySalesModalOpen(false)} className="text-brand-text-subtle hover:text-brand-text cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <BillingPanel
              ref={billingPanelRef}
              ruralMartId={ruralMartId}
              refreshKey={refreshKey}
              onDataChanged={bump}
              onSaleGenerated={(info) => {
                showToast(`Recorded Sale Bill #${info.billNumber} of ₹${info.amount.toLocaleString('en-IN')} for ${info.customerName}!`)
                setIsDailySalesModalOpen(false)
              }}
            />
          </div>
        </div>
      )}

      {isProcurementModalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-text/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-primary" />
                  <span>New Product Procurement Entry</span>
                </h3>
                <p className="text-xs text-brand-text-muted">Restock an existing product or register a new product.</p>
              </div>
              <button
                onClick={() => {
                  setIsProcurementModalOpen(false)
                  resetProcureForm()
                }}
                className="text-brand-text-subtle hover:text-brand-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {procError && (
              <div className="p-3 rounded-xl bg-brand-danger-light border border-brand-danger-border text-brand-danger text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{procError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProcurement} className="space-y-3">
              <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border space-y-3">
                <label className="block text-xs font-bold text-brand-text uppercase">1. Product Selection</label>
                <select value={selectedProcureProductId} onChange={(e) => handleSelectProcureProduct(e.target.value)} className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-surface text-brand-text">
                  <option value="">-- Choose Catalog Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category}) • Current Stock: {p.stockQty} {p.unit}
                    </option>
                  ))}
                  <option value="NEW">+ Create New Product...</option>
                </select>

                {procureMode === 'NEW' && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-semibold text-brand-text">
                        Product Name <span className="text-brand-danger">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Concentrated Maize Feed"
                        value={procName}
                        onChange={(e) => setProcName(e.target.value)}
                        className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-surface text-brand-text"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-brand-text">Category</label>
                        <select value={procCategory} onChange={(e) => setProcCategory(e.target.value)} className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-surface text-brand-text">
                          {PRODUCT_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-brand-text">
                          Unit <span className="text-brand-danger">*</span>
                        </label>
                        <input type="text" required placeholder="e.g. kg" value={procUnit} onChange={(e) => setProcUnit(e.target.value)} className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-surface text-brand-text" />
                      </div>
                    </div>
                    <p className="text-[10px] text-brand-text-muted italic">Purchase and selling price will initialize from this procurement's cost — edit them anytime in Product &amp; Inventory.</p>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border space-y-3">
                <label className="block text-xs font-bold text-brand-text uppercase">2. Procurement Details</label>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-brand-text">
                      Quantity <span className="text-brand-danger">*</span>
                    </label>
                    <input type="number" required min="0.001" step="0.001" placeholder="e.g. 100" value={procQty} onChange={(e) => setProcQty(e.target.value)} className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-surface text-brand-text" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-text">
                      Total Cost (₹) <span className="text-brand-danger">*</span>
                    </label>
                    <input type="number" required min="0.01" step="0.01" placeholder="e.g. 4000" value={procCost} onChange={(e) => setProcCost(e.target.value)} className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-surface text-brand-text" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-brand-text">Supplier Name</label>
                    <input type="text" placeholder="e.g. Co-Op Union" value={procSupplier} onChange={(e) => setProcSupplier(e.target.value)} className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-surface text-brand-text" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-text">
                      Date <span className="text-brand-danger">*</span>
                    </label>
                    <input type="date" required value={procDate} onChange={(e) => setProcDate(e.target.value)} className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-surface text-brand-text" />
                  </div>
                </div>

                {procQty && procCost && Number(procQty) > 0 && (
                  <div className="p-2.5 rounded-xl bg-brand-primary-light text-xs flex justify-between items-center font-bold text-brand-primary-dark">
                    <span>Cost per Unit:</span>
                    <span>₹{(Number(procCost) / Number(procQty)).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsProcurementModalOpen(false)
                    resetProcureForm()
                  }}
                  className="h-9 px-4 rounded-xl border border-brand-border text-xs font-semibold hover:bg-brand-bg-subtle cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" disabled={procSubmitting} className="h-9 px-5 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60">
                  {procSubmitting ? 'Saving…' : 'Save & Record Procurement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
