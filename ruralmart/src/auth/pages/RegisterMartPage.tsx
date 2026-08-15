import React, { useState } from 'react';
import {
  Store,
  MapPin,
  Calendar,
  FileText,
  Upload,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { MartRegistrationFormData } from '../../shared/types';

interface RegisterMartPageProps {
  onRegisterSuccess: (formData: MartRegistrationFormData) => void;
  onNavigateLogin: () => void;
  onSwitchToAdmin?: () => void;
  theme: 'light' | 'dark';
}

export const RegisterMartPage: React.FC<RegisterMartPageProps> = ({
  onRegisterSuccess,
  onNavigateLogin,
}) => {
  const [formData, setFormData] = useState<MartRegistrationFormData>({
    martName: '',
    entrepreneurName: '',
    mobileNumber: '',
    email: '',
    district: 'Erode',
    block: '',
    village: '',
    latitude: '',
    longitude: '',
    openingDate: '2026-08-15',
    aadhaarNumber: '',
    gstNumber: '',
    photoFileName: '',
  });

  const [mobileError, setMobileError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');

  const districts = ['Erode', 'Coimbatore', 'Tiruppur', 'Salem', 'Madurai'];

  const validateMobile = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length > 10) return;
    setFormData((prev) => ({ ...prev, mobileNumber: cleaned }));

    if (cleaned.length > 0 && cleaned.length !== 10) {
      setMobileError('Mobile number must be exactly 10 digits');
    } else {
      setMobileError('');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      setFormData((prev) => ({ ...prev, photoFileName: file.name }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.mobileNumber.length !== 10) {
      setMobileError('Mobile number must be exactly 10 digits');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setMobileError('Registration backend is not connected yet. Your application has not been submitted.');
    }, 600);
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
                Submit your Rural Mart details for approval.
              </p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: Mart Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#E9EFEB] dark:border-[#16241E] pb-2">
              <Store className="w-4 h-4 text-[#174F3A] dark:text-[#8ECAAA]" />
              <h2 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8]">
                Mart Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Rural Mart Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  Rural Mart Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Erode Rural Mart"
                  value={formData.martName}
                  onChange={(e) => setFormData({ ...formData, martName: e.target.value })}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-2 focus:ring-[#174F3A]"
                />
              </div>

              {/* Entrepreneur Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  Entrepreneur Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Entrepreneur Name"
                  value={formData.entrepreneurName}
                  onChange={(e) => setFormData({ ...formData, entrepreneurName: e.target.value })}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-2 focus:ring-[#174F3A]"
                />
              </div>

              {/* Mobile Number with 10-digit validation */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={formData.mobileNumber}
                  onChange={(e) => validateMobile(e.target.value)}
                  className={`w-full h-9 px-3 text-xs rounded-xl border ${
                    mobileError ? 'border-red-500 ring-1 ring-red-500' : 'border-[#DDE6E0] dark:border-[#1E3129]'
                  } bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-2 focus:ring-[#174F3A]`}
                />
                {mobileError && (
                  <p className="text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{mobileError}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. owner@ruralmart.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-2 focus:ring-[#174F3A]"
                />
              </div>

            </div>
          </div>

          {/* SECTION 2: Location */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 border-b border-[#E9EFEB] dark:border-[#16241E] pb-2">
              <MapPin className="w-4 h-4 text-[#174F3A] dark:text-[#8ECAAA]" />
              <h2 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8]">
                Location Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* District */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-2 focus:ring-[#174F3A]"
                >
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Block */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  Block <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Central Block"
                  value={formData.block}
                  onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-2 focus:ring-[#174F3A]"
                />
              </div>

              {/* Village */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  Village <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Village North"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-2 focus:ring-[#174F3A]"
                />
              </div>

            </div>

            {/* GPS Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  GPS Latitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 28.4499"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-2 focus:ring-[#174F3A]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  GPS Longitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 80.3319"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-2 focus:ring-[#174F3A]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Opening Date */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 border-b border-[#E9EFEB] dark:border-[#16241E] pb-2">
              <Calendar className="w-4 h-4 text-[#174F3A] dark:text-[#8ECAAA]" />
              <h2 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8]">
                Opening Date
              </h2>
            </div>

            <div className="max-w-xs space-y-1">
              <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                Target / Actual Opening Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.openingDate}
                onChange={(e) => setFormData({ ...formData, openingDate: e.target.value })}
                className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-2 focus:ring-[#174F3A]"
              />
            </div>
          </div>

          {/* SECTION 4: Additional Details (Optional) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 border-b border-[#E9EFEB] dark:border-[#16241E] pb-2">
              <FileText className="w-4 h-4 text-[#174F3A] dark:text-[#8ECAAA]" />
              <h2 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8]">
                Additional Details (Optional)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Aadhaar Number */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  placeholder="12-digit Aadhaar Number"
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-2 focus:ring-[#174F3A]"
                />
              </div>

              {/* GST Number */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  GST Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-2 focus:ring-[#174F3A]"
                />
              </div>

            </div>

            {/* Photo Upload ("Choose file") */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                Mart Frontage / Entrepreneur Photo
              </label>
              <div className="flex items-center gap-3">
                <label className="h-9 px-4 bg-[#F1F6F3] dark:bg-[#182921] hover:bg-[#E7F2EC] dark:hover:bg-[#1B3D30] text-[#174F3A] dark:text-[#8ECAAA] border border-[#DDE6E0] dark:border-[#1E3129] font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose file</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-[#66736C] dark:text-[#8E9E96] truncate">
                  {selectedFileName ? selectedFileName : 'No file chosen'}
                </span>
              </div>
            </div>

          </div>

          {/* Submit Primary Button */}
          <div className="pt-4 border-t border-[#DDE6E0] dark:border-[#1E3129] flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-[#66736C] dark:text-[#8E9E96]">
              By submitting, you agree to the EDF Rural Mart operational guidelines.
            </p>

            <button
              type="submit"
              disabled={isLoading || !!mobileError}
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
