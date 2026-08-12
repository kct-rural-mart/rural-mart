import { useEffect } from 'react'
import { X, User, MapPin, Building2, Phone, Calendar, HeartHandshake, CheckCircle2, Receipt, Download } from 'lucide-react'

export default function FarmerDetailModal({ farmer, onClose }) {
  useEffect(() => {
    document.body.style.overflow = farmer ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [farmer])

  if (!farmer) return null

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md cursor-default" style={{ touchAction: 'none' }}>
      <div onClick={(e) => e.stopPropagation()} className="bg-brand-surface border border-brand-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col text-brand-text max-h-[90vh]">
        <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-surface shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-primary-light text-brand-primary-dark">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-brand-text">{farmer.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary-light text-brand-primary-dark border border-brand-primary/20">{farmer.id}</span>
              </div>
              <p className="text-[11px] text-brand-text-muted">Registered Farmer Profile • {farmer.status} Status</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-brand-text-subtle hover:text-brand-text hover:bg-brand-bg-subtle transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border">
              <span className="text-[10px] font-semibold text-brand-text-muted uppercase">Location &amp; Village</span>
              <p className="font-bold text-brand-text mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-primary" /> {farmer.village}, {farmer.district}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border">
              <span className="text-[10px] font-semibold text-brand-text-muted uppercase">Assigned Rural Mart</span>
              <p className="font-bold text-brand-text mt-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-brand-primary" /> {farmer.ruralMart} Hub
              </p>
            </div>

            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border">
              <span className="text-[10px] font-semibold text-brand-text-muted uppercase">Category / Specialization</span>
              <p className="font-bold text-brand-text mt-1 flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-brand-primary" /> {farmer.category}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border">
              <span className="text-[10px] font-semibold text-brand-text-muted uppercase">Animal Head Count</span>
              <p className="font-bold text-brand-primary mt-1">{farmer.animalHeadCount} Head</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-brand-border bg-brand-bg-subtle space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-brand-border">
              <span className="font-bold text-brand-text flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-brand-primary" /> Contact Phone:
              </span>
              <span className="font-bold text-brand-text">{farmer.phone}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-brand-border">
              <span className="font-bold text-brand-text flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-primary" /> Registration Date:
              </span>
              <span className="font-medium text-brand-text-muted">{farmer.joinedDate}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-brand-border">
              <span className="font-bold text-brand-text flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-brand-primary" /> Lifetime Purchase Value:
              </span>
              <span className="font-extrabold text-brand-primary">₹{farmer.totalPurchasesVal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-brand-text">Last Mart Visit:</span>
              <span className="font-medium text-brand-text-muted">{farmer.lastVisit}</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-brand-border bg-brand-bg-subtle flex items-center justify-between shrink-0">
          <span className="text-[11px] text-brand-text-muted flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" /> Registered Beneficiary
          </span>

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-brand-border text-brand-text font-semibold text-xs hover:bg-brand-surface transition-colors cursor-pointer">
              Close
            </button>
            <button
              onClick={() => alert(`Exporting profile card for ${farmer.name}...`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export Card
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
