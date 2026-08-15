import React, { useState, useMemo } from 'react';
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
  Smartphone,
  AlertCircle,
} from 'lucide-react';
import {
  getRuralMartById,
  getRuralMarts,
  updateRuralMart,
  getOwnerById,
  getOwners,
  updateOwner,
} from '../../shared/dataServices';

interface OwnerSettingsPageProps {
  currentMartId?: string | null;
  theme: 'light' | 'dark';
}

export const OwnerSettingsPage: React.FC<OwnerSettingsPageProps> = ({
  currentMartId, theme }) => {
  // Load canonical Rural Mart and Owner profile from shared data layer
  const initialMart = useMemo(() => {
    return getRuralMartById(currentMartId || '') || getRuralMarts()[0] || null;
  }, []);

  const initialOwner = useMemo(() => {
    return initialMart ? (getOwnerById(initialMart.ownerId) || getOwners()[0] || null) : (getOwners()[0] || null);
  }, [initialMart]);

  // Owner Profile state initialized from shared data layer
  const [ownerId] = useState(initialOwner?.ownerId || '—');
  const [ownerName, setOwnerName] = useState(initialOwner?.ownerName || '—');
  const [companyName, setCompanyName] = useState(initialMart?.ruralMartName || '—');
  const [registeredEmail] = useState(initialOwner?.email || '—');
  const [phone, setPhone] = useState(initialOwner?.phone || '—');
  const [gstNumber] = useState(initialMart?.gstNumber || '—');
  const [location] = useState(initialMart ? `${initialMart.district}, Tamil Nadu` : '—');

  // Security Toggles
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isContactSupportOpen, setIsContactSupportOpen] = useState(false);
  const [isFullAuditLogOpen, setIsFullAuditLogOpen] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState(ownerName);
  const [editCompany, setEditCompany] = useState(companyName);
  const [editPhone, setEditPhone] = useState(phone);

  // Contact Support Form State
  const [supportSubject, setSupportSubject] = useState('');
  const [supportQuery, setSupportQuery] = useState('');
  const [supportErrors, setSupportErrors] = useState<{ subject?: string; query?: string }>({});

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handle Edit Profile Open
  const handleOpenEditProfile = () => {
    setEditName(ownerName);
    setEditCompany(companyName);
    setEditPhone(phone);
    setIsEditProfileOpen(true);
  };

  // Handle Save Profile Changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setOwnerName(editName);
    setCompanyName(editCompany);
    setPhone(editPhone);

    // Sync to shared data layer
    if (initialMart) {
      updateRuralMart(initialMart.ruralMartId, {
        ruralMartName: editCompany,
        ownerName: editName,
        ownerPhone: editPhone,
        lastUpdated: 'Just now',
      });
    }
    if (initialOwner) {
      updateOwner(initialOwner.ownerId, {
        ownerName: editName,
        phone: editPhone,
      });
    }

    setIsEditProfileOpen(false);
    showToast('Owner profile details updated successfully!');
  };

  // Handle Submit Support Query
  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { subject?: string; query?: string } = {};

    if (!supportSubject.trim()) {
      errors.subject = 'Please fill in this field.';
    }
    if (!supportQuery.trim()) {
      errors.query = 'Please fill in this field.';
    }

    if (Object.keys(errors).length > 0) {
      setSupportErrors(errors);
      return;
    }

    setSupportErrors({});
    setIsContactSupportOpen(false);
    setSupportSubject('');
    setSupportQuery('');
    showToast('Support query submitted successfully! KCT team will respond shortly.');
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#174F3A] text-white text-xs font-bold shadow-lg border border-emerald-500/30 flex items-center justify-between animate-fade-in transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#A3E6C5]" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-200 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-4 sm:p-5 shadow-xs">
        <h1 className="text-xl font-bold text-[#17221D] dark:text-[#E6ECE8]">
          Settings
        </h1>
        <p className="text-xs text-[#66736C] dark:text-[#8E9E96] mt-0.5">
          Manage your profile, business entity credentials, and security settings
        </p>
      </div>

      {/* PROFILE BANNER (Dark highlighted band) */}
      <div className="bg-[#174F3A] dark:bg-[#12261E] border border-[#1E4233] rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Profile Photo / Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-[#23634C] dark:bg-[#1B3A2E] border-2 border-[#A3E6C5]/30 flex items-center justify-center shrink-0 shadow-xs">
            <User className="w-7 h-7 text-[#A3E6C5]" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-white tracking-wide">
                {ownerName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#A3E6C5]/20 text-[#A3E6C5] border border-[#A3E6C5]/30 text-[11px] font-bold inline-flex items-center gap-1">
                ✓ Verified Owner
              </span>
            </div>

            <p className="text-xs text-emerald-100/80 font-medium">
              Rural Mart Owner • Enterprise ID: {ownerId}
            </p>

            <p className="text-xs text-emerald-200/90 font-medium">
              {companyName} ({location})
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenEditProfile}
          className="h-9 px-4 rounded-xl bg-white text-[#174F3A] hover:bg-emerald-50 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0 self-start md:self-auto"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Profile Details</span>
        </button>
      </div>

      {/* THREE INFO CARDS (Row below profile banner) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Card 1: Business Entity */}
        <div className="card-enterprise p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#E9EFEB] dark:border-[#16241E] pb-3">
            <Building2 className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
            <h3 className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase tracking-wider">
              BUSINESS ENTITY
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase block">
                COMPANY NAME
              </span>
              <span className="font-bold text-[#17221D] dark:text-[#E6ECE8]">
                {companyName}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase block">
                GST / TAX REGISTRATION
              </span>
              <span className="font-mono font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                {gstNumber}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase block">
                REGISTERED OFFICIAL EMAIL
              </span>
              <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                {registeredEmail}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase block">
                CONTACT PHONE
              </span>
              <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                {phone}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Trade License & Location */}
        <div className="card-enterprise p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#E9EFEB] dark:border-[#16241E] pb-3">
            <FileCheck className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
            <h3 className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase tracking-wider">
              TRADE LICENSE & LOCATION
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase block">
                PRIMARY HUB LOCATION
              </span>
              <span className="font-bold text-[#17221D] dark:text-[#E6ECE8]">
                {location}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase block mb-1">
                TRADE LICENSE STATUS
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-[#143825] dark:text-emerald-300 text-[11px] font-extrabold inline-block">
                Active until Dec 2026
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Security & Auth */}
        <div className="card-enterprise p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#E9EFEB] dark:border-[#16241E] pb-3">
            <ShieldCheck className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
            <h3 className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase tracking-wider">
              SECURITY & AUTH
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Two-Factor Authentication Row */}
            <div className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#17221D] dark:text-[#E6ECE8] block">
                  Two-Factor Authentication
                </span>
                <span className="text-[11px] text-[#66736C] dark:text-[#8E9E96]">
                  Require SMS / App OTP
                </span>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => {
                  setTwoFactorEnabled(!twoFactorEnabled);
                  showToast(
                    !twoFactorEnabled
                      ? 'Two-Factor Authentication enabled.'
                      : 'Two-Factor Authentication disabled.'
                  );
                }}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                  twoFactorEnabled
                    ? 'bg-[#174F3A] dark:bg-[#A3E6C5]'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white dark:bg-[#121E19] shadow-md transform transition-transform ${
                    twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Trusted Sessions Row */}
            <div className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#17221D] dark:text-[#E6ECE8] block">
                  Trusted Sessions
                </span>
                <span className="text-[11px] text-[#66736C] dark:text-[#8E9E96]">
                  3 Active Devices (Android POS Terminal, Chrome Web, Tablet)
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: Audit Log & Help Support */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* BOTTOM-LEFT: Recent System Audit Log */}
        <div className="lg:col-span-7 card-enterprise p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E9EFEB] dark:border-[#16241E] pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
              <h3 className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase tracking-wider">
                RECENT SYSTEM AUDIT LOG
              </h3>
            </div>

            <button
              onClick={() => setIsFullAuditLogOpen(true)}
              className="text-xs font-bold text-[#174F3A] dark:text-[#A3E6C5] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Audit Log</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="p-4 text-center text-xs text-[#66736C] dark:text-[#8E9E96] italic">
              No recent system actions logged
            </div>
          </div>
        </div>

        {/* BOTTOM-RIGHT: Help & Support */}
        <div className="lg:col-span-5 card-enterprise p-4 sm:p-5 space-y-3">
          <div className="border-b border-[#E9EFEB] dark:border-[#16241E] pb-3">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
              <h3 className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase tracking-wider">
                HELP & SUPPORT
              </h3>
            </div>
            <p className="text-xs text-[#66736C] dark:text-[#8E9E96] mt-0.5">
              Get help and support from KCT team
            </p>
          </div>

          {/* Inner Highlighted Card */}
          <div className="p-4 rounded-xl bg-[#E7F2EC] dark:bg-[#1B3D30] border border-[#A3E6C5]/40 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#174F3A] text-white flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5 text-[#A3E6C5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#174F3A] dark:text-[#A3E6C5]">
                  Contact KCT Support
                </h4>
                <p className="text-xs text-[#17221D] dark:text-[#E6ECE8] mt-0.5">
                  Our support team is here to help you with any issues or queries.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsContactSupportOpen(true)}
              className="w-full h-9 bg-[#174F3A] hover:bg-[#103A2B] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Headphones className="w-4 h-4" />
              <span>Contact Support</span>
            </button>
          </div>
        </div>

      </div>

      {/* MODAL: EDIT OWNER PROFILE */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-[#17221D]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#E9EFEB] dark:border-[#16241E] pb-3">
              <h3 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-2">
                <User className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
                <span>Edit Owner Profile</span>
              </h3>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              {/* Rural Mart ID */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  Rural Mart ID
                </label>
                <input
                  type="text"
                  disabled
                  value={ownerId}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-slate-100 dark:bg-slate-800/80 text-slate-500 font-mono cursor-not-allowed"
                />
              </div>

              {/* Owner Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  Owner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                />
              </div>

              {/* Company Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                />
              </div>

              {/* Registered Email */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  Registered Email
                </label>
                <input
                  type="email"
                  disabled
                  value={registeredEmail}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-slate-100 dark:bg-slate-800/80 text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E9EFEB] dark:border-[#16241E]">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="h-9 px-4 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] text-xs font-semibold hover:bg-[#F8FAF7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-[#174F3A] hover:bg-[#103A2B] dark:bg-[#1B3D30] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL: CONTACT KCT SUPPORT */}
      {isContactSupportOpen && (
        <div className="fixed inset-0 z-50 bg-[#17221D]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#E9EFEB] dark:border-[#16241E] pb-3">
              <h3 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-2">
                <Headphones className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
                <span>Contact KCT Support</span>
              </h3>
              <button
                onClick={() => {
                  setIsContactSupportOpen(false);
                  setSupportErrors({});
                }}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSupport} className="space-y-3">
              
              {/* Subject / Issue Category */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  Subject / Issue Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Inventory sync issue, Billing query"
                  value={supportSubject}
                  onChange={(e) => {
                    setSupportSubject(e.target.value);
                    if (supportErrors.subject) {
                      setSupportErrors((prev) => ({ ...prev, subject: undefined }));
                    }
                  }}
                  className={`w-full h-9 px-3 text-xs rounded-xl border ${
                    supportErrors.subject
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20'
                      : 'border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E]'
                  } text-[#17221D] dark:text-[#E6ECE8]`}
                />
                {supportErrors.subject && (
                  <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{supportErrors.subject}</span>
                  </p>
                )}
              </div>

              {/* Describe Your Query */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  Describe Your Query <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Type out your issue or query directly here..."
                  value={supportQuery}
                  onChange={(e) => {
                    setSupportQuery(e.target.value);
                    if (supportErrors.query) {
                      setSupportErrors((prev) => ({ ...prev, query: undefined }));
                    }
                  }}
                  className={`w-full p-3 text-xs rounded-xl border ${
                    supportErrors.query
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20'
                      : 'border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E]'
                  } text-[#17221D] dark:text-[#E6ECE8]`}
                />
                {supportErrors.query && (
                  <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{supportErrors.query}</span>
                  </p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E9EFEB] dark:border-[#16241E]">
                <button
                  type="button"
                  onClick={() => {
                    setIsContactSupportOpen(false);
                    setSupportErrors({});
                  }}
                  className="h-9 px-4 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] text-xs font-semibold hover:bg-[#F8FAF7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-[#174F3A] hover:bg-[#103A2B] dark:bg-[#1B3D30] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Submit
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL: VIEW FULL AUDIT LOG */}
      {isFullAuditLogOpen && (
        <div className="fixed inset-0 z-50 bg-[#17221D]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E9EFEB] dark:border-[#16241E] pb-3">
              <h3 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
                <span>Full System Audit Log</span>
              </h3>
              <button
                onClick={() => setIsFullAuditLogOpen(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              <div className="p-4 text-center text-xs text-[#66736C] dark:text-[#8E9E96] italic">
                No recent system actions logged
              </div>
            </div>

            <div className="pt-3 border-t border-[#E9EFEB] dark:border-[#16241E] flex justify-end">
              <button
                onClick={() => setIsFullAuditLogOpen(false)}
                className="h-9 px-4 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] text-xs font-semibold hover:bg-[#F8FAF7] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
