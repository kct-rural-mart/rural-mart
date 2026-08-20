import React, { useMemo, useState } from 'react';
import {
  Store,
  MapPin,
  Calendar,
  FileText,
  Upload,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  UserSquare2,
  Landmark,
} from 'lucide-react';
import { MartRegistrationFormData } from '../../shared/types';
import { supabase } from '../../lib/supabaseClient';

interface RegisterMartPageProps {
  onRegisterSuccess: (formData: MartRegistrationFormData) => void;
  onNavigateLogin: () => void;
  onSwitchToAdmin?: () => void;
  theme: 'light' | 'dark';
}

// Tamil Nadu's 38 districts — must stay in sync with the
// pending_registrations_district_check constraint in the database.
const DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
  'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
  'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
  'Vellore', 'Viluppuram', 'Virudhunagar',
];

const GENDERS = ['Male', 'Female', 'Other'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const MIN_AGE = 18;
const MAX_AGE = 100;

function calculateAge(dobIso: string): number | null {
  if (!dobIso) return null;
  const dob = new Date(`${dobIso}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

function formatAadhaarDisplay(digits: string): string {
  return digits.match(/.{1,4}/g)?.join(' ') ?? '';
}

function readableSubmitError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    const value = error as { message?: string; details?: string; hint?: string; code?: string };
    const detail = [value.message, value.details, value.hint, value.code ? `Code: ${value.code}` : '']
      .filter(Boolean)
      .join(' — ');
    if (detail) return detail;
  }
  return 'Unable to submit the application.';
}

async function uploadRegistrationPhoto(file: File, prefix: 'mart' | 'entrepreneur'): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `pending/${prefix}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from('registration-photos')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  return path;
}

const inputClass =
  'w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-2 focus:ring-[#174F3A]';
const textareaClass =
  'w-full px-3 py-2 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-2 focus:ring-[#174F3A]';
const labelClass = 'block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]';

export const RegisterMartPage: React.FC<RegisterMartPageProps> = ({
  onRegisterSuccess,
  onNavigateLogin,
}) => {
  const [formData, setFormData] = useState<MartRegistrationFormData>({
    martName: '',
    mobileNumber: '',
    district: 'Erode',
    block: '',
    village: '',
    physicalAddress: '',
    openingDate: '2026-08-15',
    gstNumber: '',
    martPhotoFileName: '',
    entrepreneurName: '',
    entrepreneurPrimaryMobile: '',
    entrepreneurSecondaryMobile: '',
    entrepreneurEmail: '',
    entrepreneurDob: '',
    entrepreneurGender: '',
    entrepreneurAddressPermanent: '',
    entrepreneurAddressTemporary: '',
    entrepreneurQualification: '',
    entrepreneurAadhaarNumber: '',
    entrepreneurPanNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
    bankName: '',
    bankBranch: '',
    entrepreneurPhotoFileName: '',
  });

  const [mobileError, setMobileError] = useState('');
  const [entrepreneurMobileError, setEntrepreneurMobileError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMartPhoto, setSelectedMartPhoto] = useState<File | null>(null);
  const [selectedEntrepreneurPhoto, setSelectedEntrepreneurPhoto] = useState<File | null>(null);
  const [formError, setFormError] = useState('');

  const entrepreneurAge = useMemo(
    () => calculateAge(formData.entrepreneurDob),
    [formData.entrepreneurDob],
  );

  const validateMobile = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length > 10) return;
    setFormData((prev) => ({ ...prev, mobileNumber: cleaned }));
    setMobileError(cleaned.length > 0 && cleaned.length !== 10 ? 'Mobile number must be exactly 10 digits' : '');
  };

  const validateEntrepreneurMobile = (field: 'entrepreneurPrimaryMobile' | 'entrepreneurSecondaryMobile', val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length > 10) return;
    setFormData((prev) => ({ ...prev, [field]: cleaned }));
    if (field === 'entrepreneurPrimaryMobile') {
      setEntrepreneurMobileError(cleaned.length > 0 && cleaned.length !== 10 ? 'Mobile number must be exactly 10 digits' : '');
    }
  };

  const handleEntrepreneurAadhaarChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 12);
    setFormData((prev) => ({ ...prev, entrepreneurAadhaarNumber: digits }));
  };

  const handlePanChange = (val: string) => {
    const cleaned = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, entrepreneurPanNumber: cleaned }));
  };

  const validatePhotoFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) return 'Please select an image file.';
    if (file.size > 5 * 1024 * 1024) return 'The image must be 5 MB or smaller.';
    return null;
  };

  const handleMartPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const error = validatePhotoFile(file);
    if (error) {
      setFormError(error);
      e.target.value = '';
      return;
    }
    setFormError('');
    setSelectedMartPhoto(file);
    setFormData((prev) => ({ ...prev, martPhotoFileName: file.name }));
  };

  const handleEntrepreneurPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const error = validatePhotoFile(file);
    if (error) {
      setFormError(error);
      e.target.value = '';
      return;
    }
    setFormError('');
    setSelectedEntrepreneurPhoto(file);
    setFormData((prev) => ({ ...prev, entrepreneurPhotoFileName: file.name }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // --- Section 1: Rural Mart Details ---
    if (formData.mobileNumber.length !== 10) {
      setMobileError('Mobile number must be exactly 10 digits');
      return;
    }
    if (!formData.physicalAddress.trim()) {
      setFormError('Physical address is required.');
      return;
    }
    if (formData.gstNumber && formData.gstNumber.length !== 15) {
      setFormError('GST number must contain exactly 15 characters.');
      return;
    }

    // --- Section 2: Entrepreneur Details ---
    if (!formData.entrepreneurName.trim()) {
      setFormError('Entrepreneur name (as per Aadhaar) is required.');
      return;
    }
    if (formData.entrepreneurPrimaryMobile.length !== 10) {
      setEntrepreneurMobileError('Mobile number must be exactly 10 digits');
      setFormError('Entrepreneur primary mobile number must be exactly 10 digits.');
      return;
    }
    if (!EMAIL_PATTERN.test(formData.entrepreneurEmail.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!formData.entrepreneurDob) {
      setFormError('Date of birth is required.');
      return;
    }
    if (new Date(`${formData.entrepreneurDob}T00:00:00`) > new Date()) {
      setFormError('Date of birth cannot be in the future.');
      return;
    }
    if (entrepreneurAge === null || entrepreneurAge < MIN_AGE || entrepreneurAge > MAX_AGE) {
      setFormError(`Entrepreneur age must be between ${MIN_AGE} and ${MAX_AGE} years.`);
      return;
    }
    if (!formData.entrepreneurGender) {
      setFormError('Please select a gender.');
      return;
    }
    if (!formData.entrepreneurAddressPermanent.trim()) {
      setFormError('Permanent address is required.');
      return;
    }
    if (!formData.entrepreneurQualification.trim()) {
      setFormError('Qualification is required.');
      return;
    }
    if (!/^\d{12}$/.test(formData.entrepreneurAadhaarNumber)) {
      setFormError('Entrepreneur Aadhaar number must contain exactly 12 digits.');
      return;
    }
    if (!PAN_PATTERN.test(formData.entrepreneurPanNumber)) {
      setFormError('Enter a valid PAN number (format: ABCDE1234F).');
      return;
    }
    if (!formData.bankAccountNumber.trim()) {
      setFormError('Bank account number is required.');
      return;
    }
    if (!formData.ifscCode.trim()) {
      setFormError('IFSC code is required.');
      return;
    }
    if (!formData.bankName.trim()) {
      setFormError('Bank name is required.');
      return;
    }
    if (!formData.bankBranch.trim()) {
      setFormError('Branch is required.');
      return;
    }

    setIsLoading(true);
    let uploadedMartPath: string | null = null;
    let uploadedEntrepreneurPath: string | null = null;

    try {
      if (selectedMartPhoto) {
        uploadedMartPath = await uploadRegistrationPhoto(selectedMartPhoto, 'mart');
      }
      if (selectedEntrepreneurPhoto) {
        uploadedEntrepreneurPath = await uploadRegistrationPhoto(selectedEntrepreneurPhoto, 'entrepreneur');
      }

      const { error } = await supabase.from('pending_registrations').insert({
        mart_name: formData.martName.trim(),
        entrepreneur_name: formData.entrepreneurName.trim(),
        mobile_number: formData.mobileNumber,
        // Single email, collected once in the Entrepreneur section.
        email: formData.entrepreneurEmail.trim().toLowerCase(),
        district: formData.district,
        block: formData.block.trim(),
        village: formData.village.trim(),
        physical_address: formData.physicalAddress.trim(),
        opening_date: formData.openingDate,
        gst_number: formData.gstNumber?.trim().toUpperCase() || null,
        mart_photo_url: uploadedMartPath,
        status: 'pending',
        entrepreneur_primary_mobile: formData.entrepreneurPrimaryMobile,
        entrepreneur_secondary_mobile: formData.entrepreneurSecondaryMobile?.trim() || null,
        entrepreneur_dob: formData.entrepreneurDob,
        entrepreneur_gender: formData.entrepreneurGender,
        entrepreneur_address_permanent: formData.entrepreneurAddressPermanent.trim(),
        entrepreneur_address_temporary: formData.entrepreneurAddressTemporary?.trim() || null,
        entrepreneur_qualification: formData.entrepreneurQualification.trim(),
        entrepreneur_aadhaar_number: formData.entrepreneurAadhaarNumber,
        entrepreneur_pan_number: formData.entrepreneurPanNumber,
        entrepreneur_photo_url: uploadedEntrepreneurPath,
        bank_account_number: formData.bankAccountNumber.trim(),
        ifsc_code: formData.ifscCode.trim().toUpperCase(),
        bank_name: formData.bankName.trim(),
        bank_branch: formData.bankBranch.trim(),
      });
      if (error) throw error;

      onRegisterSuccess(formData);
    } catch (error) {
      const cleanupPaths = [uploadedMartPath, uploadedEntrepreneurPath].filter((p): p is string => !!p);
      if (cleanupPaths.length > 0) {
        await supabase.storage.from('registration-photos').remove(cleanupPaths);
      }
      setFormError(readableSubmitError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8F4] dark:bg-[#0B130F] text-[#17221D] dark:text-[#E6ECE8] font-sans antialiased py-8 px-4 sm:px-6 transition-colors">

      {/* Top Navigation */}
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-6">
        <button
          onClick={onNavigateLogin}
          className="text-xs font-semibold text-[#174F3A] dark:text-[#8ECAAA] flex items-center gap-1.5 hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>
      </div>

      {/* Main Form Container */}
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-md p-6 sm:p-8 space-y-6">

        {/* Header & Subtext */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE6E0] dark:border-[#1E3129] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#174F3A] dark:bg-[#1B3D30] text-white dark:text-[#A3E6C5] flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-[#174F3A] dark:text-[#A3E6C5] uppercase bg-[#E7F2EC] dark:bg-[#1B3D30] px-2 py-0.5 rounded-full">
                Application Form
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17221D] dark:text-[#E6ECE8] mt-1">
                Register Rural Mart
              </h1>
              <p className="text-xs text-[#66736C] dark:text-[#8E9E96]">
                Submit your Rural Mart and entrepreneur details for approval.
              </p>
            </div>
          </div>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-[#3D1717] border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ============================================================ */}
          {/* SECTION 1 — RURAL MART DETAILS                                */}
          {/* ============================================================ */}
          <fieldset className="space-y-4">
            <legend className="w-full flex items-center gap-2 border-b-2 border-[#174F3A] dark:border-[#8ECAAA] pb-2 mb-1">
              <Store className="w-4.5 h-4.5 text-[#174F3A] dark:text-[#8ECAAA]" />
              <h2 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8]">
                1. Rural Mart Details
              </h2>
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Rural Mart Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Erode Rural Mart"
                  value={formData.martName}
                  onChange={(e) => setFormData({ ...formData, martName: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Mobile Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={formData.mobileNumber}
                  onChange={(e) => validateMobile(e.target.value)}
                  className={`${inputClass} ${mobileError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                />
                {mobileError && (
                  <p className="text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{mobileError}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className={labelClass}>District <span className="text-red-500">*</span></label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className={inputClass}
                >
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Block <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Central Block"
                  value={formData.block}
                  onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Village <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Village North"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>
                  <Calendar className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
                  Opening Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.openingDate}
                  onChange={(e) => setFormData({ ...formData, openingDate: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>
                <MapPin className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
                Physical Address <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Full street address of the Rural Mart (door no., street, landmark)"
                value={formData.physicalAddress}
                onChange={(e) => setFormData({ ...formData, physicalAddress: e.target.value })}
                className={textareaClass}
              />
            </div>

            {/* Additional Details (Optional) */}
            <div className="space-y-3 pt-3 border-t border-dashed border-[#E9EFEB] dark:border-[#16241E]">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-[#174F3A] dark:text-[#8ECAAA]" />
                <h3 className="text-xs font-bold uppercase tracking-wide text-[#66736C] dark:text-[#8E9E96]">
                  Additional Details (Optional)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>GST Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 33AAAAA0000A1Z5"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Rural Mart Photo</label>
                <div className="flex items-center gap-3">
                  <label className="h-9 px-4 bg-[#F1F6F3] dark:bg-[#182921] hover:bg-[#E7F2EC] dark:hover:bg-[#1B3D30] text-[#174F3A] dark:text-[#8ECAAA] border border-[#DDE6E0] dark:border-[#1E3129] font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose file</span>
                    <input type="file" accept="image/*" onChange={handleMartPhotoUpload} className="hidden" />
                  </label>
                  <span className="text-xs text-[#66736C] dark:text-[#8E9E96] truncate">
                    {formData.martPhotoFileName || 'No file chosen'}
                  </span>
                </div>
              </div>
            </div>
          </fieldset>

          {/* ============================================================ */}
          {/* SECTION 2 — ENTREPRENEUR DETAILS (KYC)                        */}
          {/* ============================================================ */}
          <fieldset className="space-y-4">
            <legend className="w-full flex items-center gap-2 border-b-2 border-[#174F3A] dark:border-[#8ECAAA] pb-2 mb-1">
              <UserSquare2 className="w-4.5 h-4.5 text-[#174F3A] dark:text-[#8ECAAA]" />
              <h2 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8]">
                2. Entrepreneur Details
              </h2>
            </legend>
            <p className="text-[11px] text-[#66736C] dark:text-[#8E9E96] -mt-2">
              Personal and KYC details of the entrepreneur running this Rural Mart.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Name (as per Aadhaar) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Full name exactly as on Aadhaar"
                  value={formData.entrepreneurName}
                  onChange={(e) => setFormData({ ...formData, entrepreneurName: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Primary Mobile Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={formData.entrepreneurPrimaryMobile}
                  onChange={(e) => validateEntrepreneurMobile('entrepreneurPrimaryMobile', e.target.value)}
                  className={`${inputClass} ${entrepreneurMobileError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                />
                {entrepreneurMobileError && (
                  <p className="text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{entrepreneurMobileError}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Secondary Mobile Number</label>
                <input
                  type="tel"
                  placeholder="Optional"
                  value={formData.entrepreneurSecondaryMobile}
                  onChange={(e) => validateEntrepreneurMobile('entrepreneurSecondaryMobile', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Email ID <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  placeholder="e.g. owner@example.com"
                  value={formData.entrepreneurEmail}
                  onChange={(e) => setFormData({ ...formData, entrepreneurEmail: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Date of Birth <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().slice(0, 10)}
                  value={formData.entrepreneurDob}
                  onChange={(e) => setFormData({ ...formData, entrepreneurDob: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Age</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={entrepreneurAge !== null ? `${entrepreneurAge} years` : '—'}
                  className={`${inputClass} bg-[#EFEEE7] dark:bg-[#10140D] text-[#66736C] dark:text-[#8E9E96] cursor-not-allowed`}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Gender <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formData.entrepreneurGender}
                  onChange={(e) => setFormData({ ...formData, entrepreneurGender: e.target.value })}
                  className={inputClass}
                >
                  <option value="" disabled>Select gender</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Qualification <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Sc. Agriculture"
                  value={formData.entrepreneurQualification}
                  onChange={(e) => setFormData({ ...formData, entrepreneurQualification: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Address (Permanent) <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={2}
                  placeholder="Permanent residential address"
                  value={formData.entrepreneurAddressPermanent}
                  onChange={(e) => setFormData({ ...formData, entrepreneurAddressPermanent: e.target.value })}
                  className={textareaClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Address (Temporary)</label>
                <textarea
                  rows={2}
                  placeholder="Optional, if different from permanent address"
                  value={formData.entrepreneurAddressTemporary}
                  onChange={(e) => setFormData({ ...formData, entrepreneurAddressTemporary: e.target.value })}
                  className={textareaClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Aadhaar Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  placeholder="1234 5678 9012"
                  value={formatAadhaarDisplay(formData.entrepreneurAadhaarNumber)}
                  onChange={(e) => handleEntrepreneurAadhaarChange(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>PAN Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="ABCDE1234F"
                  value={formData.entrepreneurPanNumber}
                  onChange={(e) => handlePanChange(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Entrepreneur Selfie</label>
              <div className="flex items-center gap-3">
                <label className="h-9 px-4 bg-[#F1F6F3] dark:bg-[#182921] hover:bg-[#E7F2EC] dark:hover:bg-[#1B3D30] text-[#174F3A] dark:text-[#8ECAAA] border border-[#DDE6E0] dark:border-[#1E3129] font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose file</span>
                  <input type="file" accept="image/*" onChange={handleEntrepreneurPhotoUpload} className="hidden" />
                </label>
                <span className="text-xs text-[#66736C] dark:text-[#8E9E96] truncate">
                  {formData.entrepreneurPhotoFileName || 'No file chosen'}
                </span>
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-3 pt-3 border-t border-dashed border-[#E9EFEB] dark:border-[#16241E]">
              <div className="flex items-center gap-2">
                <Landmark className="w-3.5 h-3.5 text-[#174F3A] dark:text-[#8ECAAA]" />
                <h3 className="text-xs font-bold uppercase tracking-wide text-[#66736C] dark:text-[#8E9E96]">
                  Bank Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Bank Account Number <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    value={formData.bankAccountNumber}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value.replace(/\D/g, '') })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>IFSC Code <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SBIN0001234"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Bank Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. State Bank of India"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Branch <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Erode Main Branch"
                    value={formData.bankBranch}
                    onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </fieldset>

          {/* Submit Primary Button */}
          <div className="pt-4 border-t border-[#DDE6E0] dark:border-[#1E3129] flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-[#66736C] dark:text-[#8E9E96]">
              By submitting, you agree to the EDF Rural Mart operational guidelines.
            </p>

            <button
              type="submit"
              disabled={isLoading || !!mobileError || !!entrepreneurMobileError}
              className="w-full sm:w-auto h-10 px-6 bg-[#174F3A] hover:bg-[#103A2B] dark:bg-[#1B3D30] dark:hover:bg-[#234F3F] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Application</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

        {/* Footer Link */}
        <div className="pt-2 text-center border-t border-[#E9EFEB] dark:border-[#16241E]">
          <p className="text-xs text-[#66736C] dark:text-[#8E9E96]">
            Already have a Rural Mart account?{' '}
            <button
              onClick={onNavigateLogin}
              className="text-[#174F3A] dark:text-[#8ECAAA] font-bold hover:underline cursor-pointer"
            >
              Login
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
