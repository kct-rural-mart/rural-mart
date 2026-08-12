import { useMemo, useState } from 'react'
import {
  User,
  Building2,
  FileCheck,
  ShieldCheck,
  Lock,
  Headphones,
  CheckCircle2,
  X,
  ExternalLink,
  Edit2,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { getRuralMartById, getRuralMarts, updateRuralMart, getOwnerById, getOwners, updateOwner } from '../../lib/newPages/shared/dataServices'

export default function OwnerSettings() {
  const initialMart = useMemo(() => getRuralMartById('RM-001') || getRuralMarts()[0] || null, [])
  const initialOwner = useMemo(
    () => (initialMart ? getOwnerById(initialMart.ownerId) || getOwners()[0] || null : getOwners()[0] || null),
    [initialMart]
  )

  const [ownerId] = useState(initialOwner?.ownerId || '—')
  const [ownerName, setOwnerName] = useState(initialOwner?.ownerName || '—')
  const [companyName, setCompanyName] = useState(initialMart?.ruralMartName || '—')
  const [registeredEmail] = useState(initialOwner?.email || '—')
  const [phone, setPhone] = useState(initialOwner?.phone || '—')
  const [gstNumber] = useState(initialMart?.gstNumber || '—')
  const [location] = useState(initialMart ? `${initialMart.district}, Tamil Nadu` : '—')

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isContactSupportOpen, setIsContactSupportOpen] = useState(false)
  const [isFullAuditLogOpen, setIsFullAuditLogOpen] = useState(false)

  const [editName, setEditName] = useState(ownerName)
  const [editCompany, setEditCompany] = useState(companyName)
  const [editPhone, setEditPhone] = useState(phone)

  const [supportSubject, setSupportSubject] = useState('')
  const [supportQuery, setSupportQuery] = useState('')
  const [supportErrors, setSupportErrors] = useState({})

  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleOpenEditProfile = () => {
    setEditName(ownerName)
    setEditCompany(companyName)
    setEditPhone(phone)
    setIsEditProfileOpen(true)
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    setOwnerName(editName)
    setCompanyName(editCompany)
    setPhone(editPhone)

    if (initialMart) {
      updateRuralMart(initialMart.ruralMartId, {
        ruralMartName: editCompany,
        ownerName: editName,
        ownerPhone: editPhone,
        lastUpdated: 'Just now',
      })
    }
    if (initialOwner) {
      updateOwner(initialOwner.ownerId, { ownerName: editName, phone: editPhone })
    }

    setIsEditProfileOpen(false)
    showToast('Owner profile details updated successfully!')
  }

  const handleSubmitSupport = (e) => {
    e.preventDefault()
    const errors = {}

    if (!supportSubject.trim()) errors.subject = 'Please fill in this field.'
    if (!supportQuery.trim()) errors.query = 'Please fill in this field.'

    if (Object.keys(errors).length > 0) {
      setSupportErrors(errors)
      return
    }

    setSupportErrors({})
    setIsContactSupportOpen(false)
    setSupportSubject('')
    setSupportQuery('')
    showToast('Support query submitted successfully! KCT team will respond shortly.')
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

      <div className="bg-brand-surface border border-brand-border rounded-xl p-4 sm:p-5 shadow-xs">
        <h1 className="text-xl font-bold text-brand-text">Settings</h1>
        <p className="text-xs text-brand-text-muted mt-0.5">Manage your profile, business entity credentials, and security settings</p>
      </div>

      <div className="bg-brand-primary rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center shrink-0 shadow-xs">
            <User className="w-7 h-7 text-white" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-white tracking-wide">{ownerName}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/25 text-[11px] font-bold inline-flex items-center gap-1">
                ✓ Verified Owner
              </span>
            </div>

            <p className="text-xs text-white/75 font-medium">Rural Mart Owner • Enterprise ID: {ownerId}</p>
            <p className="text-xs text-white/85 font-medium">
              {companyName} ({location})
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenEditProfile}
          className="h-9 px-4 rounded-xl bg-white text-brand-primary hover:bg-brand-primary-light text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0 self-start md:self-auto"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Profile Details</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card-enterprise p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-brand-border/60 pb-3">
            <Building2 className="w-4 h-4 text-brand-primary" />
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">BUSINESS ENTITY</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-[10px] font-bold text-brand-text-muted uppercase block">COMPANY NAME</span>
              <span className="font-bold text-brand-text">{companyName}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-brand-text-muted uppercase block">GST / TAX REGISTRATION</span>
              <span className="font-mono font-semibold text-brand-text">{gstNumber}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-brand-text-muted uppercase block">REGISTERED OFFICIAL EMAIL</span>
              <span className="font-semibold text-brand-text">{registeredEmail}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-brand-text-muted uppercase block">CONTACT PHONE</span>
              <span className="font-semibold text-brand-text">{phone}</span>
            </div>
          </div>
        </div>

        <div className="card-enterprise p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-brand-border/60 pb-3">
            <FileCheck className="w-4 h-4 text-brand-primary" />
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">TRADE LICENSE &amp; LOCATION</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-brand-text-muted uppercase block">PRIMARY HUB LOCATION</span>
              <span className="font-bold text-brand-text">{location}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-brand-text-muted uppercase block mb-1">TRADE LICENSE STATUS</span>
              <span className="px-2.5 py-1 rounded-full bg-brand-success-light text-brand-success text-[11px] font-extrabold inline-block">
                Active until Dec 2026
              </span>
            </div>
          </div>
        </div>

        <div className="card-enterprise p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-brand-border/60 pb-3">
            <ShieldCheck className="w-4 h-4 text-brand-primary" />
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">SECURITY &amp; AUTH</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-2.5 rounded-xl bg-brand-bg-subtle border border-brand-border flex items-center justify-between">
              <div>
                <span className="font-bold text-brand-text block">Two-Factor Authentication</span>
                <span className="text-[11px] text-brand-text-muted">Require SMS / App OTP</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setTwoFactorEnabled(!twoFactorEnabled)
                  showToast(!twoFactorEnabled ? 'Two-Factor Authentication enabled.' : 'Two-Factor Authentication disabled.')
                }}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                  twoFactorEnabled ? 'bg-brand-primary' : 'bg-brand-border'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-brand-bg-subtle border border-brand-border flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-brand-text block">Trusted Sessions</span>
                <span className="text-[11px] text-brand-text-muted">3 Active Devices (Android POS Terminal, Chrome Web, Tablet)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 card-enterprise p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-primary" />
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">RECENT SYSTEM AUDIT LOG</h3>
            </div>

            <button
              onClick={() => setIsFullAuditLogOpen(true)}
              className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Audit Log</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="p-4 text-center text-xs text-brand-text-muted italic">No recent system actions logged</div>
          </div>
        </div>

        <div className="lg:col-span-5 card-enterprise p-4 sm:p-5 space-y-3">
          <div className="border-b border-brand-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-brand-primary" />
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">HELP &amp; SUPPORT</h3>
            </div>
            <p className="text-xs text-brand-text-muted mt-0.5">Get help and support from KCT team</p>
          </div>

          <div className="p-4 rounded-xl bg-brand-primary-light border border-brand-primary/20 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-primary">Contact KCT Support</h4>
                <p className="text-xs text-brand-text mt-0.5">Our support team is here to help you with any issues or queries.</p>
              </div>
            </div>

            <button
              onClick={() => setIsContactSupportOpen(true)}
              className="w-full h-9 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Headphones className="w-4 h-4" />
              <span>Contact Support</span>
            </button>
          </div>
        </div>
      </div>

      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-brand-text/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                <User className="w-4 h-4 text-brand-primary" />
                <span>Edit Owner Profile</span>
              </h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-brand-text-subtle hover:text-brand-text p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">Rural Mart ID</label>
                <input
                  type="text"
                  disabled
                  value={ownerId}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted font-mono cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Owner Name <span className="text-brand-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Company Name <span className="text-brand-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">Registered Email</label>
                <input
                  type="email"
                  disabled
                  value={registeredEmail}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Phone Number <span className="text-brand-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="h-9 px-4 rounded-xl border border-brand-border text-xs font-semibold hover:bg-brand-bg-subtle cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isContactSupportOpen && (
        <div className="fixed inset-0 z-50 bg-brand-text/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                <Headphones className="w-4 h-4 text-brand-primary" />
                <span>Contact KCT Support</span>
              </h3>
              <button
                onClick={() => {
                  setIsContactSupportOpen(false)
                  setSupportErrors({})
                }}
                className="text-brand-text-subtle hover:text-brand-text p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSupport} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Subject / Issue Category <span className="text-brand-danger">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Inventory sync issue, Billing query"
                  value={supportSubject}
                  onChange={(e) => {
                    setSupportSubject(e.target.value)
                    if (supportErrors.subject) setSupportErrors((prev) => ({ ...prev, subject: undefined }))
                  }}
                  className={`w-full h-9 px-3 text-xs rounded-xl border ${
                    supportErrors.subject ? 'border-brand-danger bg-brand-danger-light/50' : 'border-brand-border bg-brand-bg-subtle'
                  } text-brand-text`}
                />
                {supportErrors.subject && (
                  <p className="text-[11px] font-semibold text-brand-danger flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{supportErrors.subject}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Describe Your Query <span className="text-brand-danger">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Type out your issue or query directly here..."
                  value={supportQuery}
                  onChange={(e) => {
                    setSupportQuery(e.target.value)
                    if (supportErrors.query) setSupportErrors((prev) => ({ ...prev, query: undefined }))
                  }}
                  className={`w-full p-3 text-xs rounded-xl border ${
                    supportErrors.query ? 'border-brand-danger bg-brand-danger-light/50' : 'border-brand-border bg-brand-bg-subtle'
                  } text-brand-text`}
                />
                {supportErrors.query && (
                  <p className="text-[11px] font-semibold text-brand-danger flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{supportErrors.query}</span>
                  </p>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsContactSupportOpen(false)
                    setSupportErrors({})
                  }}
                  className="h-9 px-4 rounded-xl border border-brand-border text-xs font-semibold hover:bg-brand-bg-subtle cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isFullAuditLogOpen && (
        <div className="fixed inset-0 z-50 bg-brand-text/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-primary" />
                <span>Full System Audit Log</span>
              </h3>
              <button onClick={() => setIsFullAuditLogOpen(false)} className="text-brand-text-subtle hover:text-brand-text p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              <div className="p-4 text-center text-xs text-brand-text-muted italic">No recent system actions logged</div>
            </div>

            <div className="pt-3 border-t border-brand-border/60 flex justify-end">
              <button
                onClick={() => setIsFullAuditLogOpen(false)}
                className="h-9 px-4 rounded-xl border border-brand-border text-xs font-semibold hover:bg-brand-bg-subtle cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
