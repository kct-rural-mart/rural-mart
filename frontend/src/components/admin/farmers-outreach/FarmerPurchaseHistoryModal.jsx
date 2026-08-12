import { useEffect, useMemo } from 'react'
import { X, User, MapPin, Building2, Phone, Calendar, ShoppingBag, CheckCircle2, Receipt, Package, CreditCard, Hash } from 'lucide-react'

export default function FarmerPurchaseHistoryModal({ farmer, onClose }) {
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

  const rawItems = useMemo(() => {
    if (!farmer) return []
    if (!farmer.itemsPurchased || farmer.itemsPurchased.trim() === '' || farmer.itemsPurchased === 'None') return []
    return farmer.itemsPurchased.split(',')
  }, [farmer])

  const invoiceNo = useMemo(() => {
    if (!farmer || rawItems.length === 0) return '—'
    return `INV-${farmer.id.replace('FMR-', '')}`
  }, [farmer, rawItems])

  if (!farmer) return null

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md cursor-default" style={{ touchAction: 'none' }}>
      <div onClick={(e) => e.stopPropagation()} className="bg-brand-surface border border-brand-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col text-brand-text max-h-[90vh]">
        <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-surface shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-primary-light text-brand-primary-dark">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-brand-text">Purchase History &amp; Farmer Detail</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary-light text-brand-primary-dark border border-brand-primary/20">{farmer.id}</span>
              </div>
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
                  <Building2 className="w-3 h-3 text-brand-primary" /> Rural Mart Hub
                </span>
                <p className="font-bold text-xs text-brand-primary-dark mt-0.5">{farmer.ruralMart} Mart ({farmer.district})</p>
              </div>

              <div>
                <span className="text-[10px] text-brand-text-muted font-semibold flex items-center gap-1">
                  <Package className="w-3 h-3 text-brand-primary" /> Cattle Count
                </span>
                <p className="font-extrabold text-xs text-brand-primary mt-0.5">{farmer.animalHeadCount} Head</p>
              </div>

              <div>
                <span className="text-[10px] text-brand-text-muted font-semibold flex items-center gap-1">
                  <Phone className="w-3 h-3 text-brand-primary" /> Phone Number
                </span>
                <p className="font-bold text-xs text-brand-text mt-0.5">{farmer.phone}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-brand-primary/30 bg-brand-primary-light/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-brand-primary/20">
              <span className="text-[11px] font-extrabold text-brand-primary-dark uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4" /> Itemized Purchase Record
              </span>
              <span className="text-[10px] font-mono font-bold text-brand-text-muted flex items-center gap-1">
                <Hash className="w-3 h-3" /> {invoiceNo}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-brand-text-muted uppercase">Products Purchased:</span>
              <div className="space-y-1.5">
                {rawItems.length === 0 ? (
                  <div className="p-3 text-center text-xs text-brand-text-muted italic bg-brand-surface/50 rounded-lg border border-brand-primary/10">No purchase history found for this farmer</div>
                ) : (
                  rawItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-brand-surface/80 border border-brand-primary/15 text-xs font-bold">
                      <span className="flex items-center gap-2 text-brand-text">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                        {item.trim()}
                      </span>
                      <span className="text-[10px] text-brand-primary-dark font-extrabold bg-brand-primary-light px-2 py-0.5 rounded">Verified</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-brand-primary/20 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-brand-text-muted font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-primary" /> Date of Purchase:
                </span>
                <span className="font-bold text-brand-text">{farmer.purchaseDate || farmer.lastVisit}</span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-brand-text-muted font-semibold flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-brand-primary" /> Payment Mode:
                </span>
                <span className="font-bold text-brand-text">Direct Cash / Mart Billing Counter</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-brand-primary/20">
                <span className="text-xs text-brand-primary-dark font-extrabold">Total Amount Paid:</span>
                <span className="font-black text-base text-brand-primary">₹{farmer.totalPurchasesVal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-brand-bg-subtle border border-brand-border flex items-center justify-between">
            <span className="text-[11px] text-brand-text-muted font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-primary" /> Registered Village Location:
            </span>
            <span className="font-bold text-xs text-brand-text">{farmer.village}, {farmer.district}</span>
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
