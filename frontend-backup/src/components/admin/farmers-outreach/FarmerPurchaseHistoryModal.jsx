import { useEffect, useState } from 'react'
import { X, User, MapPin, Building2, Phone, CheckCircle2, Receipt, Package, Loader2, AlertCircle } from 'lucide-react'
import { getFarmerPurchaseHistory } from '../../../lib/queries/farmersOutreach'

export default function FarmerPurchaseHistoryModal({ farmer, onClose }) {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (farmer) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [farmer])

  useEffect(() => {
    if (!farmer) return
    let isMounted = true

    async function loadHistory() {
      setLoading(true)
      setError('')
      try {
        const result = await getFarmerPurchaseHistory(farmer.id)
        if (isMounted) setSales(result)
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load purchase history.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadHistory()
    return () => {
      isMounted = false
    }
  }, [farmer])

  if (!farmer) return null

  const totalSpent = sales.reduce((sum, s) => sum + s.amount, 0)

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md cursor-default" style={{ touchAction: 'none' }}>
      <div onClick={(e) => e.stopPropagation()} className="bg-brand-surface border border-brand-border rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col text-brand-text max-h-[90vh]">
        <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-surface shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-primary-light text-brand-primary-dark">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-brand-text">Purchase History &amp; Farmer Detail</h2>
              <p className="text-[11px] text-brand-text-muted">Mart Transaction &amp; Beneficiary Summary</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-brand-text-subtle hover:text-brand-text hover:bg-brand-bg-subtle transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs overflow-y-auto">
          <div className="p-4 rounded-xl bg-brand-bg-subtle border border-brand-border space-y-2.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-brand-primary-dark border-b border-brand-border pb-1.5">Farmer Profile Summary</h3>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] text-brand-text-muted font-semibold flex items-center gap-1">
                  <User className="w-3 h-3 text-brand-primary" /> Farmer Name
                </span>
                <p className="font-bold text-sm text-brand-text mt-0.5">{farmer.name}</p>
              </div>

              <div>
                <span className="text-[10px] text-brand-text-muted font-semibold flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-brand-primary" /> Rural Mart
                </span>
                <p className="font-bold text-xs text-brand-primary-dark mt-0.5">
                  {farmer.ruralMart} ({farmer.district})
                </p>
              </div>

              <div>
                <span className="text-[10px] text-brand-text-muted font-semibold flex items-center gap-1">
                  <Package className="w-3 h-3 text-brand-primary" /> Cattle Count
                </span>
                <p className="font-extrabold text-xs text-brand-primary mt-0.5">{farmer.cattleCount} Head</p>
              </div>

              <div>
                <span className="text-[10px] text-brand-text-muted font-semibold flex items-center gap-1">
                  <Phone className="w-3 h-3 text-brand-primary" /> Phone Number
                </span>
                <p className="font-bold text-xs text-brand-text mt-0.5">{farmer.mobile || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-brand-primary/30 bg-brand-primary-light/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-brand-primary/20">
              <span className="text-[11px] font-extrabold text-brand-primary-dark uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4" /> Itemized Purchase History
              </span>
              <span className="text-[10px] font-mono font-bold text-brand-text-muted">{sales.length} Bills</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-brand-text-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading purchase history…</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-brand-danger-light border border-brand-danger-border text-brand-danger">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : sales.length === 0 ? (
              <div className="p-3 text-center text-xs text-brand-text-muted italic bg-brand-surface/50 rounded-lg border border-brand-primary/10">No purchase history found for this farmer.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-brand-primary/20 font-bold text-brand-primary-dark uppercase text-[9px] bg-brand-surface/60">
                      <th className="p-2">Date</th>
                      <th className="p-2">Bill #</th>
                      <th className="p-2">Product</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Unit Price</th>
                      <th className="p-2 text-right">Line Total</th>
                      <th className="p-2 text-right">Bill Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-primary/10">
                    {sales.map((sale) =>
                      sale.lineItems.length > 0 ? (
                        sale.lineItems.map((item, i) => (
                          <tr key={`${sale.id}-${i}`} className="hover:bg-brand-surface/50">
                            <td className="p-2 font-medium">{i === 0 ? new Date(sale.date).toLocaleDateString('en-IN') : ''}</td>
                            <td className="p-2 font-bold font-mono text-brand-primary-dark">{i === 0 ? sale.billNumber : ''}</td>
                            <td className="p-2 font-bold text-brand-text">{item.productName}</td>
                            <td className="p-2 text-center font-semibold">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="p-2 text-right">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                            <td className="p-2 text-right font-bold">₹{item.lineTotal.toLocaleString('en-IN')}</td>
                            <td className="p-2 text-right font-extrabold text-brand-primary">{i === 0 ? `₹${sale.amount.toLocaleString('en-IN')}` : ''}</td>
                          </tr>
                        ))
                      ) : (
                        <tr key={sale.id} className="hover:bg-brand-surface/50">
                          <td className="p-2 font-medium">{new Date(sale.date).toLocaleDateString('en-IN')}</td>
                          <td className="p-2 font-bold font-mono text-brand-primary-dark">{sale.billNumber}</td>
                          <td className="p-2 font-bold text-brand-text" colSpan={4}>
                            (No line items recorded)
                          </td>
                          <td className="p-2 text-right font-extrabold text-brand-primary">₹{sale.amount.toLocaleString('en-IN')}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pt-2 border-t border-brand-primary/20 flex justify-between items-center">
              <span className="text-xs text-brand-primary-dark font-extrabold">Total Amount Spent:</span>
              <span className="font-black text-base text-brand-primary">₹{totalSpent.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-brand-bg-subtle border border-brand-border flex items-center justify-between">
            <span className="text-[11px] text-brand-text-muted font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-primary" /> Registered Village Location:
            </span>
            <span className="font-bold text-xs text-brand-text">
              {farmer.village}, {farmer.district}
            </span>
          </div>
        </div>

        <div className="p-4 border-t border-brand-border bg-brand-bg-subtle flex items-center justify-between shrink-0">
          <span className="text-[11px] text-brand-text-muted flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" /> Verified Billing Record
          </span>

          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs shadow-xs transition-colors cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
