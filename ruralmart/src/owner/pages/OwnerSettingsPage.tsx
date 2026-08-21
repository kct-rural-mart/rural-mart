import React, { useEffect, useMemo, useState } from 'react';
import {
  User,
  Building2,
  FileCheck,
  Headphones,
  CheckCircle2,
  X,
  ExternalLink,
  Edit2,
  Clock,
  AlertCircle,
  KeyRound,
  Store,
  UserCircle2,
  Landmark,
} from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { ChangePasswordPage } from '../../auth/pages/ChangePasswordPage';
import { getOwnerRuralMart, OwnerRuralMart, updateOwnerRuralMart } from '../services/martService';
import {
  getRuralMartById,
  getRuralMarts,
  getOwnerById,
  getOwners,
} from '../../shared/dataServices';

interface OwnerSettingsPageProps {
  currentMartId?: string | null;
  theme: 'light' | 'dark';
}

const TAMIL_NADU_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
  'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur',
  'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal',
  'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet',
  'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi',
  'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur',
  'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar',
];

// Shared input classes so the Edit Profile form visually matches registration
const fieldInputClass =
  'w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]';
const fieldInputDisabledClass =
  'w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-slate-100 dark:bg-slate-800/80 text-slate-500 cursor-not-allowed';
const fieldTextareaClass =
  'w-full p-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] resize-none';
const fieldLabelClass = 'block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]';
const fieldFileWrapClass =
  'inline-flex items-center gap-2 h-9 px-3 text-xs font-semibold rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#174F3A] dark:text-[#A3E6C5] cursor-pointer';

export const OwnerSettingsPage: React.FC<OwnerSettingsPageProps> = ({
  currentMartId, theme }) => {
  const { user } = useAuth();
  const [liveMart, setLiveMart] = useState<OwnerRuralMart | null>(null);
  const [profileError, setProfileError] = useState('');
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

  useEffect(() => {
    let active = true;
    if (!currentMartId) return;
    setProfileError('');
    void getOwnerRuralMart(currentMartId)
      .then((mart) => {
        if (!active) return;
        setLiveMart(mart);
        setOwnerName(mart.entrepreneur_name);
        setCompanyName(mart.mart_name);
        setPhone(mart.mobile_number || '—');
      })
      .catch((error: unknown) => {
        if (!active) return;
        setProfileError(
          error && typeof error === 'object' && 'message' in error
            ? String((error as { message: unknown }).message)
            : 'Unable to load owner registration details.',
        );
      });
    return () => { active = false; };
  }, [currentMartId]);

  const displayedOwnerId = liveMart?.reference_code || liveMart?.id || ownerId;
  const displayedEmail = liveMart?.email || user?.email || registeredEmail;
  const displayedGst = liveMart?.gst_number || gstNumber || 'Not provided';
  const displayedLocation = liveMart
    ? [liveMart.village, liveMart.block, liveMart.district].filter(Boolean).join(', ')
    : location;

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isContactSupportOpen, setIsContactSupportOpen] = useState(false);
  const [isFullAuditLogOpen, setIsFullAuditLogOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // ---------------------------------------------------------------------
  // EDIT PROFILE FORM STATE
  // Mirrors the two registration sections: Rural Mart Details + Entrepreneur Details
  // ---------------------------------------------------------------------

  // Section 1: Rural Mart / Shop Details
  const [editMartName, setEditMartName] = useState('');
  const [editMartMobile, setEditMartMobile] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editBlock, setEditBlock] = useState('');
  const [editVillage, setEditVillage] = useState('');
  const [editOpeningDate, setEditOpeningDate] = useState(''); // TODO: map to mart.opening_date
  const [editPhysicalAddress, setEditPhysicalAddress] = useState(''); // TODO: map to mart.physical_address
  const [editGstNumber, setEditGstNumber] = useState('');
  const [editMartPhoto, setEditMartPhoto] = useState<File | null>(null); // TODO: wire to storage upload

  // Section 2: Entrepreneur / Farmer Personal Details
  const [editAadhaarName, setEditAadhaarName] = useState(''); // TODO: map to mart.entrepreneur_name (name as per Aadhaar)
  const [editPrimaryMobile, setEditPrimaryMobile] = useState('');
  const [editSecondaryMobile, setEditSecondaryMobile] = useState(''); // TODO: map to mart.secondary_mobile
  const [editEmail, setEditEmail] = useState(''); // read-only — Registered Email ID
  const [editDob, setEditDob] = useState(''); // TODO: map to mart.date_of_birth
  const [editAge, setEditAge] = useState(''); // derived from DOB, read-only
  const [editGender, setEditGender] = useState(''); // TODO: map to mart.gender
  const [editQualification, setEditQualification] = useState(''); // TODO: map to mart.qualification
  const [editAddressPermanent, setEditAddressPermanent] = useState(''); // TODO: map to mart.address_permanent
  const [editAddressTemporary, setEditAddressTemporary] = useState(''); // TODO: map to mart.address_temporary
  const [editAadhaarNumber, setEditAadhaarNumber] = useState(''); // TODO: map to mart.aadhaar_number
  const [editPanNumber, setEditPanNumber] = useState(''); // TODO: map to mart.pan_number
  const [editSelfie, setEditSelfie] = useState<File | null>(null); // TODO: wire to storage upload

  // Bank Details (part of Entrepreneur Details section in registration)
  const [editBankAccountNumber, setEditBankAccountNumber] = useState(''); // TODO: map to mart.bank_account_number
  const [editIfscCode, setEditIfscCode] = useState(''); // TODO: map to mart.ifsc_code
  const [editBankName, setEditBankName] = useState(''); // TODO: map to mart.bank_name
  const [editBranch, setEditBranch] = useState(''); // TODO: map to mart.branch

  const [editFormError, setEditFormError] = useState('');

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

  // Auto-calc age from DOB, same convenience as the registration form
  useEffect(() => {
    if (!editDob) {
      setEditAge('');
      return;
    }
    const dob = new Date(editDob);
    if (Number.isNaN(dob.getTime())) {
      setEditAge('');
      return;
    }
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age -= 1;
    }
    setEditAge(String(age));
  }, [editDob]);

  // Handle Edit Profile Open — populate every field from the current mart/owner record
  const handleOpenEditProfile = () => {
    setEditFormError('');

    // Section 1
    setEditMartName(companyName || '');
    setEditMartMobile(liveMart?.mobile_number || '');
    setEditDistrict(liveMart?.district || initialMart?.district || '');
    setEditBlock(liveMart?.block || '');
    setEditVillage(liveMart?.village || '');
    setEditOpeningDate((liveMart as any)?.opening_date || '');
    setEditPhysicalAddress((liveMart as any)?.physical_address || '');
    setEditGstNumber(displayedGst === 'Not provided' ? '' : displayedGst);
    setEditMartPhoto(null);

    // Section 2
    setEditAadhaarName(ownerName || '');
    setEditPrimaryMobile(phone || '');
    setEditSecondaryMobile((liveMart as any)?.secondary_mobile || '');
    setEditEmail(String(displayedEmail || ''));
    setEditDob((liveMart as any)?.date_of_birth || '');
    setEditGender((liveMart as any)?.gender || '');
    setEditQualification((liveMart as any)?.qualification || '');
    setEditAddressPermanent((liveMart as any)?.address_permanent || '');
    setEditAddressTemporary((liveMart as any)?.address_temporary || '');
    setEditAadhaarNumber((liveMart as any)?.aadhaar_number || '');
    setEditPanNumber((liveMart as any)?.pan_number || '');
    setEditSelfie(null);

    // Bank details
    setEditBankAccountNumber((liveMart as any)?.bank_account_number || '');
    setEditIfscCode((liveMart as any)?.ifsc_code || '');
    setEditBankName((liveMart as any)?.bank_name || '');
    setEditBranch((liveMart as any)?.branch || '');

    setIsEditProfileOpen(true);
  };

  // Handle Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMartId) return;

    // Basic required-field guard, mirrors the * fields on the registration form
    if (
      !editMartName.trim() || !editMartMobile.trim() || !editDistrict.trim() ||
      !editBlock.trim() || !editVillage.trim() || !editOpeningDate.trim() ||
      !editPhysicalAddress.trim() || !editAadhaarName.trim() || !editPrimaryMobile.trim() ||
      !editDob.trim() || !editGender.trim() || !editQualification.trim() ||
      !editAddressPermanent.trim() || !editAadhaarNumber.trim() || !editPanNumber.trim() ||
      !editBankAccountNumber.trim() || !editIfscCode.trim() || !editBankName.trim() || !editBranch.trim()
    ) {
      setEditFormError('Please fill in all required fields marked with *.');
      return;
    }

    try {
      setEditFormError('');
      setProfileError('');

      const updated = await updateOwnerRuralMart(currentMartId, {
        mart_name: editMartName.trim(),
        entrepreneur_name: editAadhaarName.trim(),
        mobile_number: editMartMobile.trim(),
        district: editDistrict.trim(),
        block: editBlock.trim(),
        village: editVillage.trim(),
        gst_number: editGstNumber.trim(),
      } as any);

      setLiveMart((current) => ({ ...(current ?? updated), ...updated }));
      setOwnerName(editAadhaarName.trim());
      setCompanyName(editMartName.trim());
      setPhone(editPrimaryMobile.trim());
      setIsEditProfileOpen(false);
      showToast('Rural Mart and entrepreneur profile updated successfully!');
    } catch (error) {
      setProfileError(
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: unknown }).message)
          : 'Unable to update owner profile.',
      );
    }
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

      {profileError && (
        <div className="p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
          {profileError}
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
              Rural Mart Owner • Enterprise ID: {displayedOwnerId}
            </p>

            <p className="text-xs text-emerald-200/90 font-medium">
              {companyName} ({displayedLocation})
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

      {/* TWO INFO CARDS (Row below profile banner - Security card removed) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

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
                {displayedGst}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase block">
                REGISTERED OFFICIAL EMAIL
              </span>
              <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                {displayedEmail}
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
                {displayedLocation}
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

      {/* MODAL: EDIT OWNER PROFILE — mirrors the Registration form's two sections */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-[#17221D]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">

            <div className="flex items-center justify-between border-b border-[#E9EFEB] dark:border-[#16241E] px-6 py-4 shrink-0">
              <h3 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-2">
                <User className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
                <span>Edit Rural Mart & Entrepreneur Profile</span>
              </h3>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="overflow-y-auto px-6 py-4 space-y-6">

              {editFormError && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-[11px] font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{editFormError}</span>
                </div>
              )}

              {/* ============ SECTION 1: RURAL MART / SHOP DETAILS ============ */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#E9EFEB] dark:border-[#16241E] pb-2">
                  <Store className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
                  <h4 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8]">
                    1. Rural Mart / Shop Details
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Rural Mart ID — READ ONLY */}
                  <div className="space-y-1">
                    <label className={fieldLabelClass}>Rural Mart ID</label>
                    <input type="text" disabled value={displayedOwnerId} className={`${fieldInputDisabledClass} font-mono`} />
                  </div>

                  {/* Registered Email — READ ONLY */}
                  <div className="space-y-1">
                    <label className={fieldLabelClass}>Registered Email ID</label>
                    <input type="email" disabled value={editEmail} className={fieldInputDisabledClass} />
                  </div>

                  <div className="space-y-1">
                    <label className={fieldLabelClass}>Rural Mart Name <span className="text-red-500">*</span></label>
                    <input type="text" required value={editMartName} onChange={(e) => setEditMartName(e.target.value)} className={fieldInputClass} />
                  </div>

                  <div className="space-y-1">
                    <label className={fieldLabelClass}>Mobile Number <span className="text-red-500">*</span></label>
                    <input type="tel" required value={editMartMobile} onChange={(e) => setEditMartMobile(e.target.value)} className={fieldInputClass} />
                  </div>

                  <div className="space-y-1">
                    <label className={fieldLabelClass}>District <span className="text-red-500">*</span></label>
                    <select required value={editDistrict} onChange={(e) => setEditDistrict(e.target.value)} className={fieldInputClass}>
                      <option value="" disabled>Select district</option>
                      {TAMIL_NADU_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className={fieldLabelClass}>Block <span className="text-red-500">*</span></label>
                    <input type="text" required value={editBlock} onChange={(e) => setEditBlock(e.target.value)} className={fieldInputClass} />
                  </div>

                  <div className="space-y-1">
                    <label className={fieldLabelClass}>Village <span className="text-red-500">*</span></label>
                    <input type="text" required value={editVillage} onChange={(e) => setEditVillage(e.target.value)} className={fieldInputClass} />
                  </div>

                  <div className="space-y-1">
                    <label className={fieldLabelClass}>Opening Date <span className="text-red-500">*</span></label>
                    <input type="date" required value={editOpeningDate} onChange={(e) => setEditOpeningDate(e.target.value)} className={fieldInputClass} />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className={fieldLabelClass}>Physical Address <span className="text-red-500">*</span></label>
                    <textarea required rows={2} value={editPhysicalAddress} onChange={(e) => setEditPhysicalAddress(e.target.value)} className={fieldTextareaClass} />
                  </div>

                  <div className="space-y-1">
                    <label className={fieldLabelClass}>GST Number</label>
                    <input type="text" value={editGstNumber} onChange={(e) => setEditGstNumber(e.target.value)} className={fieldInputClass} placeholder="e.g. 33AAAAA0000A1Z5" />
                  </div>

                  <div className="space-y-1">
                    <label className={fieldLabelClass}>Rural Mart Photo</label>
                    <label className={fieldFileWrapClass}>
                      <span>Choose file</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setEditMartPhoto(e.target.files?.[0] ?? null)}
                      />
                    </label>
                    <span className="text-[11px] text-[#66736C] dark:text-[#8E9E96] ml-1">
                      {editMartPhoto ? editMartPhoto.name : 'No new file chosen'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ============ SECTION 2: ENTREPRENEUR / FARMER PERSONAL DETAILS ============ */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#E9EFEB] dark:border-[#16241E] pb-2">
                  <UserCircle2 className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
                  <h4 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8]">
                    2. Entrepreneur Details
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={fieldLabelClass}>Name (as per Aadhaar) <span className="text-red-500">*</span></label>
                    <input type="text" required value={editAadhaarName} onChange={(e) => setEditAadhaarName(e.target.value)} className={fieldInputClass} />
                  </div>

                  <div className="space-y-1">
                    <label className={fieldLabelClass}>Primary Mobile Number <span className="text-red-500">*</span></label>
                    <input type="tel" required value={editPrimaryMobile} onChange={(e) => setEditPrimaryMobile(e.target.value)} className={fieldInputClass} />
                  </div>

                  <div className="space-y-1">
                    <label className={fieldLabelClass}>Secondary Mobile Number</label>
                    <input type="tel" value={editSecondaryMobile} onChange={(e) => setEditSecondaryMobile(e.target.value)} className={fieldInputClass} placeholder="Optional" />
                  </div>
                  
                  <div className="space-y-1">
                    <label className={fieldLabelClass}>Email ID</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className={fieldInputClass}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={fieldLabelClass}>Date of Birth <span className="text-red-500">*</span></label>
                    <input type="date" required value={editDob} onChange={(e) => setEditDob(e.target.value)} className={fieldInputClass} />
                  </div>

                  <div className="space-y-1">
                    <label className={fieldLabelClass}>Age</label>
                    <input type="text" disabled value={editAge || '—'} className={fieldInputDisabledClass} />
                  </div>

                  <div className="space-y-1">
                    <label className={fieldLabelClass}>Gender <span className="text-red-500">*</span></label>
                    <select required value={editGender} onChange={(e) => setEditGender(e.target.value)} className={fieldInputClass}>
                      <option value="" disabled>Select gender</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className={fieldLabelClass}>Qualification <span className="text-red-500">*</span></label>
                    <input type="text" required value={editQualification} onChange={(e) => setEditQualification(e.target.value)} className={fieldInputClass} placeholder="e.g. B.Sc. Agriculture" />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className={fieldLabelClass}>Address (Permanent) <span className="text-red-500">*</span></label>
                    <textarea required rows={2} value={editAddressPermanent} onChange={(e) => setEditAddressPermanent(e.target.value)} className={fieldTextareaClass} />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className={fieldLabelClass}>Address (Temporary)</label>
                    <textarea rows={2} value={editAddressTemporary} onChange={(e) => setEditAddressTemporary(e.target.value)} className={fieldTextareaClass} placeholder="Optional, if different from permanent address" />
                  </div>

                  <div className="space-y-1">
                    <label className={fieldLabelClass}>Aadhaar Number <span className="text-red-500">*</span></label>
                    <input type="text" required value={editAadhaarNumber} onChange={(e) => setEditAadhaarNumber(e.target.value)} className={fieldInputClass} placeholder="1234 5678 9012" />
                  </div>

                  <div className="space-y-1">
                    <label className={fieldLabelClass}>PAN Number <span className="text-red-500">*</span></label>
                    <input type="text" required value={editPanNumber} onChange={(e) => setEditPanNumber(e.target.value.toUpperCase())} className={fieldInputClass} placeholder="ABCDE1234F" />
                  </div>

                  <div className="space-y-1">
                    <label className={fieldLabelClass}>Entrepreneur Selfie</label>
                    <label className={fieldFileWrapClass}>
                      <span>Choose file</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setEditSelfie(e.target.files?.[0] ?? null)}
                      />
                    </label>
                    <span className="text-[11px] text-[#66736C] dark:text-[#8E9E96] ml-1">
                      {editSelfie ? editSelfie.name : 'No new file chosen'}
                    </span>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-3.5 h-3.5 text-[#174F3A] dark:text-[#A3E6C5]" />
                    <span className="text-[11px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase tracking-wider">Bank Details</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={fieldLabelClass}>Bank Account Number <span className="text-red-500">*</span></label>
                      <input type="text" required value={editBankAccountNumber} onChange={(e) => setEditBankAccountNumber(e.target.value)} className={fieldInputClass} />
                    </div>
                    <div className="space-y-1">
                      <label className={fieldLabelClass}>IFSC Code <span className="text-red-500">*</span></label>
                      <input type="text" required value={editIfscCode} onChange={(e) => setEditIfscCode(e.target.value.toUpperCase())} className={fieldInputClass} placeholder="e.g. SBIN0001234" />
                    </div>
                    <div className="space-y-1">
                      <label className={fieldLabelClass}>Bank Name <span className="text-red-500">*</span></label>
                      <input type="text" required value={editBankName} onChange={(e) => setEditBankName(e.target.value)} className={fieldInputClass} placeholder="e.g. State Bank of India" />
                    </div>
                    <div className="space-y-1">
                      <label className={fieldLabelClass}>Branch <span className="text-red-500">*</span></label>
                      <input type="text" required value={editBranch} onChange={(e) => setEditBranch(e.target.value)} className={fieldInputClass} placeholder="e.g. Erode Main Branch" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Password change shortcut, kept separate from the profile fields */}
              <button
                type="button"
                onClick={() => {
                  setIsEditProfileOpen(false);
                  setIsChangePasswordOpen(true);
                }}
                className="w-full p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] flex items-center justify-between text-left hover:border-[#174F3A] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5] shrink-0" />
                  <span className="font-bold text-[#17221D] dark:text-[#E6ECE8] text-xs">Change Password</span>
                </div>
                <span className="text-[11px] font-bold text-[#174F3A] dark:text-[#A3E6C5]">Change</span>
              </button>

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E9EFEB] dark:border-[#16241E] sticky bottom-0 bg-white dark:bg-[#121E19]">
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

      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 bg-[#17221D]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <ChangePasswordPage
            embedded
            onCancel={() => setIsChangePasswordOpen(false)}
            onComplete={() => {
              setIsChangePasswordOpen(false);
              showToast('Password changed successfully.');
            }}
          />
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