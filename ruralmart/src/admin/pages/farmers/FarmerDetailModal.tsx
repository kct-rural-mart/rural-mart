import React, { useEffect } from 'react';
import {
  X,
  User,
  MapPin,
  Building2,
  Phone,
  Calendar,
  HeartHandshake,
  CheckCircle2,
  Receipt,
  Download,
} from 'lucide-react';
import { FarmerRecord } from '../../../shared/types';

interface FarmerDetailModalProps {
  farmer: FarmerRecord | null;
  onClose: () => void;
}

export const FarmerDetailModal: React.FC<FarmerDetailModalProps> = ({ farmer, onClose }) => {
  // Lock body scroll when modal is active
  useEffect(() => {
    if (farmer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [farmer]);

  if (!farmer) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 dark:bg-black/80 backdrop-blur-md animate-fade-in cursor-default"
      style={{ touchAction: 'none' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col text-[#17221D] dark:text-[#E6ECE8] max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#DDE6E0] dark:border-[#1E3129] flex items-center justify-between bg-white dark:bg-[#121E19] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#E7F2EC] dark:bg-[#1B3D30] text-[#103A2B] dark:text-[#A3E6C5]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-[#17221D] dark:text-[#E6ECE8]">{farmer.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/20">
                  {farmer.id}
                </span>
              </div>
              <p className="text-[11px] text-[#66736C] dark:text-[#8E9E96]">
                Registered EDF Farmer Profile • {farmer.status} Status
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8A958F] hover:text-[#17221D] dark:hover:text-[#E6ECE8] hover:bg-[#F8FAF7] dark:hover:bg-[#16241E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129]">
              <span className="text-[10px] font-semibold text-[#66736C] dark:text-[#8E9E96] uppercase">
                Location & Village
              </span>
              <p className="font-bold text-[#17221D] dark:text-[#E6ECE8] mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#174F3A] dark:text-[#A3E6C5]" /> {farmer.village}, {farmer.district}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129]">
              <span className="text-[10px] font-semibold text-[#66736C] dark:text-[#8E9E96] uppercase">
                Assigned Rural Mart
              </span>
              <p className="font-bold text-[#17221D] dark:text-[#E6ECE8] mt-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#174F3A] dark:text-[#A3E6C5]" /> {farmer.ruralMart} Hub
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129]">
              <span className="text-[10px] font-semibold text-[#66736C] dark:text-[#8E9E96] uppercase">
                Category / Specialization
              </span>
              <p className="font-bold text-[#17221D] dark:text-[#E6ECE8] mt-1 flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-[#174F3A] dark:text-[#A3E6C5]" /> {farmer.category}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129]">
              <span className="text-[10px] font-semibold text-[#66736C] dark:text-[#8E9E96] uppercase">
                Animal Head Count
              </span>
              <p className="font-bold text-[#174F3A] dark:text-[#A3E6C5] mt-1">
                {farmer.animalHeadCount} Head
              </p>
            </div>
          </div>

          {/* Contact & History Card */}
          <div className="p-4 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-[#DDE6E0] dark:border-[#1E3129]">
              <span className="font-bold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#174F3A] dark:text-[#A3E6C5]" /> Contact Phone:
              </span>
              <span className="font-bold text-[#17221D] dark:text-[#E6ECE8]">{farmer.phone}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#DDE6E0] dark:border-[#1E3129]">
              <span className="font-bold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#174F3A] dark:text-[#A3E6C5]" /> EDF Registration Date:
              </span>
              <span className="font-medium text-[#66736C] dark:text-[#8E9E96]">{farmer.joinedDate}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#DDE6E0] dark:border-[#1E3129]">
              <span className="font-bold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-[#174F3A] dark:text-[#A3E6C5]" /> Lifetime Purchase Value:
              </span>
              <span className="font-extrabold text-[#174F3A] dark:text-[#A3E6C5]">
                ₹{farmer.totalPurchasesVal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#17221D] dark:text-[#E6ECE8]">Last Mart Visit:</span>
              <span className="font-medium text-[#66736C] dark:text-[#8E9E96]">{farmer.lastVisit}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#121E19] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#66736C] dark:text-[#8E9E96] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#174F3A] dark:text-[#A3E6C5]" /> Verified EDF Beneficiary
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] text-[#17221D] dark:text-[#E6ECE8] font-semibold text-xs hover:bg-white dark:hover:bg-[#16241E] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => alert(`Exporting profile card for ${farmer.name}...`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#174F3A] hover:bg-[#103A2B] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
