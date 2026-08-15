import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { User, Building2, MapPin, ShieldCheck, KeyRound, CheckCircle2, X, Edit2, AlertCircle, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { updateOwnerRuralMart } from '../../lib/queries/ownerMart'

export default function OwnerSettings() {
  const { ruralMartId, ruralMart } = useOutletContext()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [mart, setMart] = useState(ruralMart)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editCompany, setEditCompany] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState('')

  const [toastMessage, setToastMessage] = useState(null)
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleOpenEditProfile = () => {
    setEditName(mart?.entrepreneur_name || '')
    setEditCompany(mart?.mart_name || '')
    setEditPhone(mart?.mobile_number || '')
    setEditError('')
    setIsEditProfileOpen(true)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setEditSubmitting(true)
    setEditError('')
    try {
      const updated = await updateOwnerRuralMart(ruralMartId, {
        martName: editCompany.trim(),
        entrepreneurName: editName.trim(),
        mobileNumber: editPhone.trim(),
      })
      setMart(updated)
      setIsEditProfileOpen(false)
      showToast('Profile details updated successfully!')
    } catch (err) {
      setEditError(err.message || 'Failed to update profile.')
    } finally {
      setEditSubmitting(false)
    }
  }

  if (!mart) {
    return <div className="text-sm text-brand-text-muted p-4">Loading your Rural Mart profile…</div>
  }

  const location = [mart.village, mart.block, mart.district].filter(Boolean).join(', ')

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
        <p className="text-xs text-brand-text-muted mt-0.5">Manage your Rural Mart profile and account.</p>
      </div>

      <div className="bg-brand-primary rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center shrink-0 shadow-xs">
            <User className="w-7 h-7 text-white" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-white tracking-wide">{mart.entrepreneur_name || 'Not set'}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/25 text-[11px] font-bold inline-flex items-center gap-1">✓ Verified Owner</span>
            </div>

            <p className="text-xs text-white/75 font-medium">Rural Mart Owner{mart.reference_code ? ` • Ref: ${mart.reference_code}` : ''}</p>
            <p className="text-xs text-white/85 font-medium">
              {mart.mart_name} ({mart.district})
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
              <span className="text-[10px] font-bold text-brand-text-muted uppercase block">MART NAME</span>
              <span className="font-bold text-brand-text">{mart.mart_name}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-brand-text-muted uppercase block">GST NUMBER</span>
              <span className="font-mono font-semibold text-brand-text">{mart.gst_number || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-brand-text-muted uppercase block">REGISTERED EMAIL</span>
              <span className="font-semibold text-brand-text">{user?.email || mart.email}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-brand-text-muted uppercase block">CONTACT PHONE</span>
              <span className="font-semibold text-brand-text">{mart.mobile_number || 'Not set'}</span>
            </div>
          </div>
        </div>

        <div className="card-enterprise p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-brand-border/60 pb-3">
            <MapPin className="w-4 h-4 text-brand-primary" />
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">LOCATION &amp; REGISTRATION</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-brand-text-muted uppercase block">PRIMARY HUB LOCATION</span>
              <span className="font-bold text-brand-text">{location || 'Not set'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-brand-text-muted uppercase block">OPENING DATE</span>
              <span className="font-semibold text-brand-text">{mart.opening_date ? new Date(mart.opening_date).toLocaleDateString('en-IN') : 'Not set'}</span>
            </div>
          </div>
        </div>

        <div className="card-enterprise p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-brand-border/60 pb-3">
            <ShieldCheck className="w-4 h-4 text-brand-primary" />
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">ACCOUNT &amp; SECURITY</h3>
          </div>

          <div className="space-y-3 text-xs">
            {profile?.must_change_password && (
              <div className="p-2.5 rounded-xl bg-brand-warning-light border border-brand-warning-border text-brand-warning-dark flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-semibold">You're using a temporary password — please change it.</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate('/change-password')}
              className="w-full p-2.5 rounded-xl bg-brand-bg-subtle border border-brand-border flex items-center justify-between hover:border-brand-primary transition-colors cursor-pointer"
            >
              <div className="text-left">
                <span className="font-bold text-brand-text block">Change Password</span>
                <span className="text-[11px] text-brand-text-muted">Update your account password</span>
              </div>
              <KeyRound className="w-4 h-4 text-brand-primary" />
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
              {editError && (
                <div className="p-2.5 rounded-lg bg-brand-danger-light border border-brand-danger-border text-brand-danger text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Owner Name <span className="text-brand-danger">*</span>
                </label>
                <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text" />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Mart Name <span className="text-brand-danger">*</span>
                </label>
                <input type="text" required value={editCompany} onChange={(e) => setEditCompany(e.target.value)} className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text" />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">Registered Email</label>
                <input type="email" disabled value={user?.email || ''} className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg text-brand-text-muted cursor-not-allowed" />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Phone Number <span className="text-brand-danger">*</span>
                </label>
                <input type="text" required value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text" />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-brand-border/60">
                <button type="button" onClick={() => setIsEditProfileOpen(false)} className="h-9 px-4 rounded-xl border border-brand-border text-xs font-semibold hover:bg-brand-bg-subtle cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={editSubmitting} className="h-9 px-4 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60">
                  {editSubmitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
