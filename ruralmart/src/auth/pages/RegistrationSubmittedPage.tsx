import React from 'react';
import { Store, Clock, ArrowLeft } from 'lucide-react';
import { MartRegistrationFormData } from '../../shared/types';

interface RegistrationSubmittedPageProps {
  registrationData?: MartRegistrationFormData | null;
  submittedApp?: any | null; // Use any since we removed the type
  onBackToLogin: () => void;
  theme: 'light' | 'dark';
}

export const RegistrationSubmittedPage: React.FC<RegistrationSubmittedPageProps> = ({
  registrationData,
  submittedApp,
  onBackToLogin,
}) => {
  const martName = submittedApp?.ruralMartName || registrationData?.martName || '—';
  const ownerName = submittedApp?.ownerName || registrationData?.entrepreneurName || '—';
  const district = submittedApp?.district || registrationData?.district || '—';
  const applicationId = submittedApp?.applicationId || '—';
  const submittedAt = submittedApp?.submittedAt || '—';

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-[#F5F8F4] dark:bg-[#0B130F] text-[#17221D] dark:text-[#E6ECE8] font-sans antialiased transition-colors">
      
      {/* Main Card */}
      <div className="w-full max-w-lg bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-md p-6 sm:p-8 space-y-6 text-center">
        
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#174F3A] dark:bg-[#1B3D30] text-white dark:text-[#A3E6C5] flex items-center justify-center shadow-sm border border-[#103A2B]/20 dark:border-[#A3E6C5]/20">
            <Store className="w-7 h-7" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#17221D] dark:text-[#E6ECE8]">
            Registration Submitted
          </h1>
          <p className="text-xs text-[#66736C] dark:text-[#8E9E96]">
            Your Rural Mart registration has been submitted successfully and is awaiting admin approval.
          </p>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-[#3D2D10] border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-bold shadow-xs">
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Status: Pending Approval</span>
        </div>

        {/* Application Details Summary */}
        <div className="border border-[#E9EFEB] dark:border-[#16241E] bg-[#F8FAF7] dark:bg-[#16241E] rounded-xl p-4 text-left text-xs space-y-3">
          <div className="flex justify-between items-center text-[#174F3A] dark:text-[#8ECAAA] font-bold border-b border-[#E9EFEB] dark:border-[#16241E] pb-2">
            <span>Application Summary</span>
            <span className="font-mono bg-[#E7F2EC] dark:bg-[#1B3D30] px-2 py-0.5 rounded text-[11px]">
              {applicationId}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div>
              <span className="text-[#8A958F] dark:text-[#61736A] text-[10px] block">Application ID</span>
              <span className="font-bold text-[#17221D] dark:text-[#E6ECE8] font-mono">{applicationId}</span>
            </div>
            <div>
              <span className="text-[#8A958F] dark:text-[#61736A] text-[10px] block">Status</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">Pending Approval</span>
            </div>
            <div>
              <span className="text-[#8A958F] dark:text-[#61736A] text-[10px] block">Rural Mart Name</span>
              <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">{martName}</span>
            </div>
            <div>
              <span className="text-[#8A958F] dark:text-[#61736A] text-[10px] block">Owner Name</span>
              <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">{ownerName}</span>
            </div>
            <div>
              <span className="text-[#8A958F] dark:text-[#61736A] text-[10px] block">District</span>
              <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">{district}</span>
            </div>
            <div>
              <span className="text-[#8A958F] dark:text-[#61736A] text-[10px] block">Submission Date</span>
              <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">{submittedAt}</span>
            </div>
          </div>
        </div>

        {/* Back to Login Button */}
        <div className="pt-2">
          <button
            onClick={onBackToLogin}
            className="w-full h-10 border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] hover:bg-[#F1F6F3] dark:hover:bg-[#182921] text-[#17221D] dark:text-[#E6ECE8] font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </button>
        </div>

      </div>
    </div>
  );
};
