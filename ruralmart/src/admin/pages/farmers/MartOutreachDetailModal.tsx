import React, { useEffect } from 'react';
import {
  X,
  Building2,
  Users,
  Target,
  HeartHandshake,
  Download,
  CheckCircle2,
  CalendarCheck,
  Award,
} from 'lucide-react';
import { FarmerOutreachMartRecord } from '../../../shared/types';

interface MartOutreachDetailModalProps {
  mart: FarmerOutreachMartRecord | null;
  onClose: () => void;
}

export const MartOutreachDetailModal: React.FC<MartOutreachDetailModalProps> = ({ mart, onClose }) => {
  useEffect(() => {
    if (mart) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mart]);

  if (!mart) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 dark:bg-black/80 backdrop-blur-md animate-fade-in cursor-default"
      style={{ touchAction: 'none' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col text-[#17221D] dark:text-[#E6ECE8]"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#DDE6E0] dark:border-[#1E3129] flex items-center justify-between bg-white dark:bg-[#121E19] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#E7F2EC] dark:bg-[#1B3D30] text-[#103A2B] dark:text-[#A3E6C5]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-[#17221D] dark:text-[#E6ECE8]">{mart.name} Rural Mart</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/20">
                  {mart.district} District
                </span>
              </div>
              <p className="text-[11px] text-[#66736C] dark:text-[#8E9E96]">
                Outreach Impact, Farmer Engagement & Village Coverage Audit
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8A958F] hover:text-[#17221D] dark:hover:text-[#E6ECE8] hover:bg-[#F8FAF7] dark:hover:bg-[#16241E] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 space-y-5 text-xs overflow-y-auto">
          {/* Top 4 Impact KPI Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129]">
              <span className="text-[10px] font-semibold text-[#66736C] dark:text-[#8E9E96] uppercase">
                Registered Farmers
              </span>
              <p className="text-base font-extrabold text-[#17221D] dark:text-[#E6ECE8] mt-1">
                {mart.totalRegisteredFarmers.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129]">
              <span className="text-[10px] font-semibold text-[#66736C] dark:text-[#8E9E96] uppercase">
                Farmers Reached
              </span>
              <p className="text-base font-extrabold text-[#174F3A] dark:text-[#A3E6C5] mt-1">
                {mart.farmersReached.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129]">
              <span className="text-[10px] font-semibold text-[#66736C] dark:text-[#8E9E96] uppercase">
                Programs Conducted
              </span>
              <p className="text-base font-extrabold text-[#34735A] dark:text-[#A3E6C5] mt-1">
                {mart.outreachProgramsConducted} Camps
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129]">
              <span className="text-[10px] font-semibold text-[#66736C] dark:text-[#8E9E96] uppercase">
                Retention Rate
              </span>
              <p className="text-base font-extrabold text-[#103A2B] dark:text-[#A3E6C5] mt-1">
                {mart.retentionRate}%
              </p>
            </div>
          </div>

          {/* Breakdown of Programs Conducted */}
          <div className="border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl overflow-hidden">
            <div className="bg-[#F8FAF7] dark:bg-[#16241E] px-4 py-2.5 border-b border-[#DDE6E0] dark:border-[#1E3129] flex items-center justify-between">
              <span className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" /> Outreach Campaign Breakdown
              </span>
              <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96]">
                {mart.villagesCovered} Villages Active
              </span>
            </div>

            <div className="divide-y divide-[#DDE6E0] dark:divide-[#1E3129]">
              <div className="p-3 flex justify-between items-center bg-white dark:bg-[#121E19]">
                <div>
                  <span className="font-bold text-[#17221D] dark:text-[#E6ECE8] block">
                    Veterinary & Cattle Health Camps
                  </span>
                  <span className="text-[10px] text-[#8A958F]">Vaccinations, deworming, feed nutrition guidance</span>
                </div>
                <span className="font-bold text-[#174F3A] dark:text-[#A3E6C5]">
                  {Math.round(mart.outreachProgramsConducted * 0.45)} Camps
                </span>
              </div>
              <div className="p-3 flex justify-between items-center bg-[#F8FAF7] dark:bg-[#16241E]">
                <div>
                  <span className="font-bold text-[#17221D] dark:text-[#E6ECE8] block">
                    Soil Health & Organic Farming Workshops
                  </span>
                  <span className="text-[10px] text-[#8A958F]">Bio-fertilizer demos, crop soil testing</span>
                </div>
                <span className="font-bold text-[#34735A] dark:text-[#A3E6C5]">
                  {Math.round(mart.outreachProgramsConducted * 0.35)} Workshops
                </span>
              </div>
              <div className="p-3 flex justify-between items-center bg-white dark:bg-[#121E19]">
                <div>
                  <span className="font-bold text-[#17221D] dark:text-[#E6ECE8] block">
                    Farmer Producer Group (FPG) Melas
                  </span>
                  <span className="text-[10px] text-[#8A958F]">Direct input aggregation, fair pricing access</span>
                </div>
                <span className="font-bold text-[#103A2B] dark:text-[#A3E6C5]">
                  {Math.round(mart.outreachProgramsConducted * 0.2)} Melas
                </span>
              </div>
            </div>
          </div>

          {/* Additional Coverage Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] space-y-1">
              <span className="font-bold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" /> Acquisition Ratio
              </span>
              <p className="text-[#66736C] dark:text-[#8E9E96]">
                New Farmers Onboarded: <strong className="text-[#174F3A] dark:text-[#A3E6C5]">+{mart.newFarmers}</strong>
              </p>
              <p className="text-[#66736C] dark:text-[#8E9E96]">
                Repeat Active Farmers: <strong className="text-[#17221D] dark:text-[#E6ECE8]">{mart.repeatFarmers}</strong>
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] space-y-1">
              <span className="font-bold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" /> Animal Health Coverage
              </span>
              <p className="text-[#66736C] dark:text-[#8E9E96]">
                Cattle Head Count Covered: <strong className="text-[#174F3A] dark:text-[#A3E6C5]">{mart.animalPopulationCovered.toLocaleString('en-IN')} Head</strong>
              </p>
              <p className="text-[#66736C] dark:text-[#8E9E96]">
                Villages Reached: <strong>{mart.villagesCovered} Panchayat Villages</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#121E19] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#66736C] dark:text-[#8E9E96] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#174F3A] dark:text-[#A3E6C5]" /> Audit verified by EDF Outreach Cell
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] text-[#17221D] dark:text-[#E6ECE8] font-semibold text-xs hover:bg-white dark:hover:bg-[#16241E] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => alert(`Downloading Outreach & Impact Report for ${mart.name} Rural Mart...`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#174F3A] hover:bg-[#103A2B] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
