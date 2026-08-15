import { useEffect, useMemo, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Search, X, History, Users, Eye, CheckCircle2, AlertCircle, Loader2, UserPlus, Receipt, User, MapPin, Phone, Building2 } from 'lucide-react'
import BillingPanel from './BillingPanel'
import { getOwnerDailyBusinessData, getOperationalMetrics } from '../../lib/queries/ownerDailyBusiness'
import { getFarmerDirectory, getRecentSales } from '../../lib/queries/ownerBilling'
import { getFarmerPurchaseHistory } from '../../lib/queries/farmersOutreach'

export default function OwnerDailyBusiness() {
  const { ruralMartId, dateRange, refreshKey: layoutRefreshKey } = useOutletContext()

  const [refreshKey, setRefreshKey] = useState(0)
  const bump = () => setRefreshKey((k) => k + 1)

  const [metrics, setMetrics] = useState(null)
  const [opMetrics, setOpMetrics] = useState(null)
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [dailyBusiness, operational, farmerDirectory] = await Promise.all([
          getOwnerDailyBusinessData({ ruralMartId, dateRange }),
          getOperationalMetrics(ruralMartId, dateRange),
          getFarmerDirectory(ruralMartId),
        ])
        if (isMounted) {
          setMetrics(dailyBusiness)
          setOpMetrics(operational)
          setFarmers(farmerDirectory)
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load Daily Business data.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (ruralMartId) load()
    return () => {
      isMounted = false
    }
  }, [ruralMartId, dateRange, layoutRefreshKey, refreshKey])

  const billingPanelRef = useRef(null)
  const [attachedFarmerId, setAttachedFarmerId] = useState(null)

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [recentSales, setRecentSales] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historySearch, setHistorySearch] = useState('')

  useEffect(() => {
    if (!isHistoryOpen || !ruralMartId) return
    let isMounted = true
    setHistoryLoading(true)
    getRecentSales(ruralMartId)
      .then((result) => {
        if (isMounted) setRecentSales(result)
      })
      .catch((err) => console.error('Failed to load sales history:', err.message))
      .finally(() => {
        if (isMounted) setHistoryLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [isHistoryOpen, ruralMartId, refreshKey])

  const filteredHistory = useMemo(() => {
    const q = historySearch.trim().toLowerCase()
    if (!q) return recentSales
    return recentSales.filter((s) => s.farmerName.toLowerCase().includes(q) || String(s.billNumber).includes(q))
  }, [recentSales, historySearch])

  const [viewFarmer, setViewFarmer] = useState(null)
  const [viewFarmerSales, setViewFarmerSales] = useState([])
  const [viewFarmerLoading, setViewFarmerLoading] = useState(false)

  useEffect(() => {
    if (!viewFarmer) return
    let isMounted = true
    setViewFarmerLoading(true)
    getFarmerPurchaseHistory(viewFarmer.id)
      .then((result) => {
        if (isMounted) setViewFarmerSales(result)
      })
      .catch((err) => console.error('Failed to load farmer purchase history:', err.message))
      .finally(() => {
        if (isMounted) setViewFarmerLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [viewFarmer])

  const viewTotalSpent = viewFarmerSales.reduce((sum, s) => sum + s.amount, 0)

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64 text-brand-text-muted gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Loading Daily Business…</span>
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
      <div className="bg-brand-surface border border-brand-border rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-text">Daily Business Register</h1>
          <p className="text-xs text-brand-text-muted">Record farmer purchases &amp; customer bills. Operational metrics update automatically.</p>
        </div>

        <button
          onClick={() => setIsHistoryOpen(true)}
          className="h-9 px-3.5 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <History className="w-4 h-4 text-white" />
          <span>Entry History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[11px] font-semibold text-brand-text-muted uppercase tracking-wider block">Daily Sales</span>
          <div className="text-2xl font-extrabold text-brand-text">₹{metrics.salesRaw.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-brand-success font-semibold block">Automated total from farmer bills</span>
        </div>
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[11px] font-semibold text-brand-text-muted uppercase tracking-wider block">Average Bill Value</span>
          <div className="text-2xl font-extrabold text-brand-text">₹{metrics.avgBillValue.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-brand-text-subtle block">Across {metrics.totalBills} customer transactions</span>
        </div>
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[11px] font-semibold text-brand-text-muted uppercase tracking-wider block">Customer Bills</span>
          <div className="text-2xl font-extrabold text-brand-text">{metrics.totalBills}</div>
          <span className="text-[10px] text-brand-text-subtle block">Total billing transactions</span>
        </div>
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[11px] font-semibold text-brand-text-muted uppercase tracking-wider block">Farmer Footfall</span>
          <div className="text-2xl font-extrabold text-brand-text flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-primary" />
            {metrics.footfall}
          </div>
          <span className="text-[10px] text-brand-text-subtle block">Distinct farmers who purchased</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 space-y-4">
          <BillingPanel ref={billingPanelRef} ruralMartId={ruralMartId} refreshKey={refreshKey} onDataChanged={bump} onMatchedFarmerChange={(f) => setAttachedFarmerId(f ? f.id : null)} />

          <div className="card-enterprise p-4 sm:p-5 space-y-3">
            <div className="border-b border-brand-border/60 pb-2.5">
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">Automated Operational Metrics</h3>
              <p className="text-[11px] text-brand-text-muted">Calculated live from stored procurement and farmer sales transactions.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-brand-bg-subtle border border-brand-border space-y-0.5">
                <span className="text-[10px] text-brand-text-muted font-semibold block uppercase">Opening Stock</span>
                <span className="text-sm font-bold text-brand-text">{opMetrics.openingStock} units</span>
              </div>
              <div className="p-2.5 rounded-xl bg-brand-bg-subtle border border-brand-border space-y-0.5">
                <span className="text-[10px] text-brand-text-muted font-semibold block uppercase">Procurement Qty</span>
                <span className="text-sm font-bold text-brand-text">{opMetrics.procurementQty} units</span>
              </div>
              <div className="p-2.5 rounded-xl bg-brand-bg-subtle border border-brand-border space-y-0.5">
                <span className="text-[10px] text-brand-text-muted font-semibold block uppercase">Sales Quantity</span>
                <span className="text-sm font-bold text-brand-success">{opMetrics.salesQty} units</span>
              </div>
              <div className="p-2.5 rounded-xl bg-brand-bg-subtle border border-brand-border space-y-0.5">
                <span className="text-[10px] text-brand-text-muted font-semibold block uppercase">Closing Stock</span>
                <span className="text-sm font-bold text-brand-primary">{opMetrics.closingStock} units</span>
              </div>
              <div className="p-2.5 rounded-xl bg-brand-bg-subtle border border-brand-border space-y-0.5">
                <span className="text-[10px] text-brand-text-muted font-semibold block uppercase">Procurement Value</span>
                <span className="text-sm font-bold text-brand-text">₹{opMetrics.procurementValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-brand-bg-subtle border border-brand-border space-y-0.5">
                <span className="text-[10px] text-brand-text-muted font-semibold block uppercase">Total Sales Value</span>
                <span className="text-sm font-bold text-brand-success">₹{metrics.salesRaw.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-brand-bg-subtle border border-brand-border space-y-0.5">
                <span className="text-[10px] text-brand-text-muted font-semibold block uppercase">Customer Bills</span>
                <span className="text-sm font-bold text-brand-text">{metrics.totalBills} bills</span>
              </div>
              <div className="p-2.5 rounded-xl bg-brand-bg-subtle border border-brand-border space-y-0.5">
                <span className="text-[10px] text-brand-text-muted font-semibold block uppercase">Average Bill Value</span>
                <span className="text-sm font-bold text-brand-text">₹{metrics.avgBillValue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 card-enterprise p-4 sm:p-5 space-y-4">
          <div className="border-b border-brand-border/60 pb-3">
            <h2 className="text-base font-bold text-brand-text flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-primary" />
              <span>Registered Customers ({farmers.length})</span>
            </h2>
            <p className="text-[11px] text-brand-text-muted">Quick lookup directory for registered farmers at your mart.</p>
          </div>

          {farmers.length === 0 ? (
            <div className="p-6 text-center text-xs text-brand-text-muted border border-dashed border-brand-border rounded-xl space-y-1">
              <UserPlus className="w-5 h-5 mx-auto text-brand-text-subtle" />
              <p className="font-semibold text-brand-text">No registered farmers yet</p>
              <p>Register a new farmer customer in the billing panel to add them to your directory.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {farmers.map((f) => {
                const isSelected = attachedFarmerId === f.id
                return (
                  <div key={f.id} className={`p-3 rounded-xl border transition-all ${isSelected ? 'bg-brand-success-light/70 border-brand-success/50' : 'bg-brand-surface border-brand-border hover:border-brand-primary'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-brand-text">{f.name}</span>
                        <div className="text-[11px] text-brand-text-muted mt-0.5">
                          {f.village} • {f.cattleCount} Cattle • {f.mobile}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                        <button type="button" title="View Customer" onClick={() => setViewFarmer(f)} className="p-1.5 rounded-lg text-brand-primary hover:bg-brand-primary-light transition-colors cursor-pointer">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => billingPanelRef.current?.attachFarmer(f)}
                          className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                            isSelected ? 'bg-brand-success text-white' : 'bg-brand-primary-light text-brand-primary-dark hover:bg-brand-primary hover:text-white'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Attached</span>
                            </>
                          ) : (
                            <span>Attach to Bill</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div onClick={() => setIsHistoryOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-brand-surface border-l border-brand-border shadow-2xl flex flex-col justify-between">
              <div className="p-4 sm:p-5 border-b border-brand-border/60 flex items-center justify-between bg-brand-bg-subtle">
                <div>
                  <h2 className="text-base font-bold text-brand-text">Entry History</h2>
                  <p className="text-xs text-brand-text-muted">Recent sales for your Rural Mart</p>
                </div>
                <button onClick={() => setIsHistoryOpen(false)} className="p-1.5 rounded-xl hover:bg-brand-border text-brand-text-muted transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border-b border-brand-border/60">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-brand-text-subtle" />
                  <input
                    type="text"
                    placeholder="Search by farmer name or bill number..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {historyLoading ? (
                  <div className="flex items-center justify-center gap-2 py-12 text-brand-text-muted">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Loading…</span>
                  </div>
                ) : filteredHistory.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-brand-bg-subtle border border-brand-border flex items-center justify-center text-brand-text-subtle">
                      <History className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-brand-text">No entries yet</h3>
                    <p className="text-xs text-brand-text-muted max-w-xs mx-auto">Bills you generate will show up here.</p>
                  </div>
                ) : (
                  filteredHistory.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-xl bg-brand-bg-subtle border border-brand-border space-y-2">
                      <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-brand-text">Bill #{item.billNumber}</span>
                          <span className="text-[10px] bg-brand-success-light text-brand-success font-bold px-2 py-0.5 rounded-full">{item.saleDate}</span>
                        </div>
                        <span className="text-xs font-bold text-brand-primary">₹{item.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-[11px] text-brand-text-muted">
                        Customer: <span className="font-bold text-brand-text">{item.farmerName}</span>
                      </div>
                      {item.lineItems.length > 0 && (
                        <div className="bg-brand-surface p-2 rounded-lg border border-brand-border text-[10px] space-y-1">
                          {item.lineItems.map((li, idx) => (
                            <div key={idx} className="flex justify-between text-brand-text">
                              <span>
                                {li.productName} × {li.quantity} {li.unit}
                              </span>
                              <span className="font-semibold">₹{li.lineTotal.toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-brand-border/60 bg-brand-bg-subtle">
                <button type="button" onClick={() => setIsHistoryOpen(false)} className="w-full h-9 rounded-xl border border-brand-border bg-brand-surface text-xs font-bold text-brand-text hover:bg-brand-primary-light transition-colors cursor-pointer">
                  Close Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewFarmer && (
        <div onClick={() => setViewFarmer(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div onClick={(e) => e.stopPropagation()} className="bg-brand-surface border border-brand-border rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col text-brand-text max-h-[90vh]">
            <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-surface shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-brand-primary-light text-brand-primary-dark">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-brand-text">Customer Profile &amp; Purchase History</h2>
                  <p className="text-[11px] text-brand-text-muted">Verified purchase summary &amp; itemized bill breakdown</p>
                </div>
              </div>
              <button onClick={() => setViewFarmer(null)} className="p-1.5 rounded-lg text-brand-text-subtle hover:text-brand-text hover:bg-brand-bg-subtle transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] text-brand-text-muted font-semibold flex items-center gap-1">
                    <User className="w-3 h-3 text-brand-primary" /> Name
                  </span>
                  <p className="font-bold text-brand-text mt-0.5">{viewFarmer.name}</p>
                </div>
                <div>
                  <span className="text-[10px] text-brand-text-muted font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-brand-primary" /> Village
                  </span>
                  <p className="font-bold text-brand-text mt-0.5">{viewFarmer.village}</p>
                </div>
                <div>
                  <span className="text-[10px] text-brand-text-muted font-semibold flex items-center gap-1">
                    <Phone className="w-3 h-3 text-brand-primary" /> Mobile
                  </span>
                  <p className="font-bold text-brand-text mt-0.5">{viewFarmer.mobile}</p>
                </div>
                <div>
                  <span className="text-[10px] text-brand-text-muted font-semibold flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-brand-primary" /> Cattle Count
                  </span>
                  <p className="font-bold text-brand-primary mt-0.5">{viewFarmer.cattleCount}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-brand-primary/30 bg-brand-primary-light/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-brand-primary/20">
                  <span className="text-[11px] font-extrabold text-brand-primary-dark uppercase tracking-wider">Itemized Purchase History</span>
                  <span className="text-[10px] font-mono font-bold text-brand-text-muted">{viewFarmerSales.length} Bills</span>
                </div>

                {viewFarmerLoading ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-brand-text-muted">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading…</span>
                  </div>
                ) : viewFarmerSales.length === 0 ? (
                  <div className="p-3 text-center text-brand-text-muted italic">No purchase history found for this customer.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-brand-primary/20 font-bold text-brand-primary-dark uppercase text-[9px] bg-brand-surface/60">
                          <th className="p-2">Date</th>
                          <th className="p-2">Product</th>
                          <th className="p-2 text-center">Qty</th>
                          <th className="p-2 text-right">Line Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-primary/10">
                        {viewFarmerSales.map((sale) =>
                          sale.lineItems.map((item, i) => (
                            <tr key={`${sale.id}-${i}`}>
                              <td className="p-2 font-medium">{i === 0 ? new Date(sale.date).toLocaleDateString('en-IN') : ''}</td>
                              <td className="p-2 font-bold text-brand-text">{item.productName}</td>
                              <td className="p-2 text-center font-semibold">
                                {item.quantity} {item.unit}
                              </td>
                              <td className="p-2 text-right font-bold">₹{item.lineTotal.toLocaleString('en-IN')}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="pt-2 border-t border-brand-primary/20 flex justify-between items-center">
                  <span className="text-xs text-brand-primary-dark font-extrabold">Total Amount Spent:</span>
                  <span className="font-black text-base text-brand-primary">₹{viewTotalSpent.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-brand-border bg-brand-bg-subtle flex items-center justify-between shrink-0">
              <span className="text-[11px] text-brand-text-muted flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" /> Verified Billing System
              </span>
              <button onClick={() => setViewFarmer(null)} className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs shadow-xs transition-colors cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
