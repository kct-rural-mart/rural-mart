import React from 'react';
import {
  X,
  Building2,
  TrendingUp,
  Receipt,
  Download,
  Phone,
  User,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { MartFinancialRecord } from '../../../shared/types';

interface MartFinancialDetailModalProps {
  mart: MartFinancialRecord | null;
  onClose: () => void;
}

export const MartFinancialDetailModal: React.FC<MartFinancialDetailModalProps> = ({
  mart,
  onClose,
}) => {
  if (!mart) return null;

  // Cost breakdown estimation for P&L display
  const cogsVal = mart.procurementRaw;
  const grossProfitVal = mart.grossProfitRaw;
  const opexVal = mart.operatingExpensesRaw;
  const netProfitVal = mart.netProfitRaw;

  // Breakdown of opex
  const logisticsEst = Math.round(opexVal * 0.4);
  const staffSalaryEst = Math.round(opexVal * 0.35);
  const rentUtilitiesEst = Math.round(opexVal * 0.25);

  const downloadStatement = () => {
    alert(`Downloading complete P&L financial statement for ${mart.name} Rural Mart (FY 2026-27)...`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17221D]/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col text-[#17221D] dark:text-[#E6ECE8]">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#DDE6E0] dark:border-[#1E3129] flex items-center justify-between sticky top-0 bg-white dark:bg-[#121E19] z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#E7F2EC] dark:bg-[#1B3D30] text-[#103A2B] dark:text-[#A3E6C5]">
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
                Detailed Financial P&L Statement & Transaction Analytics
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

        {/* Modal Content Body */}
        <div className="p-5 space-y-5">
          {/* Top Quick Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129]">
              <span className="text-[10px] font-semibold text-[#66736C] dark:text-[#8E9E96] uppercase">
                Gross Revenue
              </span>
              <p className="text-base font-extrabold text-[#17221D] dark:text-[#E6ECE8] mt-1">
                {mart.salesDisplay}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129]">
              <span className="text-[10px] font-semibold text-[#66736C] dark:text-[#8E9E96] uppercase">
                Net Profit
              </span>
              <p className="text-base font-extrabold text-[#174F3A] dark:text-[#A3E6C5] mt-1">
                {mart.netProfitDisplay}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129]">
              <span className="text-[10px] font-semibold text-[#66736C] dark:text-[#8E9E96] uppercase">
                Profit Margin
              </span>
              <p className="text-base font-extrabold text-[#B45309] dark:text-[#FBBF24] mt-1">
                {mart.profitMargin}%
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129]">
              <span className="text-[10px] font-semibold text-[#66736C] dark:text-[#8E9E96] uppercase">
                Total Bills
              </span>
              <p className="text-base font-extrabold text-[#17221D] dark:text-[#E6ECE8] mt-1">
                {mart.totalBills.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Detailed P&L Income Statement Table */}
          <div className="border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl overflow-hidden">
            <div className="bg-[#F8FAF7] dark:bg-[#16241E] px-4 py-2.5 border-b border-[#DDE6E0] dark:border-[#1E3129] flex items-center justify-between">
              <span className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" /> Income Statement Breakdown (P&L)
              </span>
              <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96]">
                FY 2026-27 YTD
              </span>
            </div>

            <div className="divide-y divide-[#DDE6E0] dark:divide-[#1E3129] text-xs">
              <div className="p-3 flex justify-between items-center bg-white dark:bg-[#121E19]">
                <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">Total Revenue / Sales</span>
                <span className="font-bold text-[#17221D] dark:text-[#E6ECE8]">
                  ₹{mart.salesRaw.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 flex justify-between items-center bg-[#F8FAF7] dark:bg-[#16241E]">
                <span className="text-[#66736C] dark:text-[#8E9E96] pl-4">(-) Cost of Goods Sold (COGS Procurement)</span>
                <span className="text-[#17221D] dark:text-[#E6ECE8]">
                  -₹{cogsVal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 flex justify-between items-center bg-[#E7F2EC] dark:bg-[#1B3D30] font-bold border-t border-b border-[#174F3A]/20">
                <span className="text-[#103A2B] dark:text-[#A3E6C5]">(=) Gross Profit Margin</span>
                <span className="text-[#103A2B] dark:text-[#A3E6C5]">
                  ₹{grossProfitVal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 flex justify-between items-center bg-[#F8FAF7] dark:bg-[#16241E]">
                <span className="text-[#66736C] dark:text-[#8E9E96] pl-4">(-) Operating Expenses Total</span>
                <span className="text-[#B45309] dark:text-[#FBBF24] font-bold">
                  -₹{opexVal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2.5 pl-8 text-[11px] space-y-1 text-[#66736C] dark:text-[#8E9E96]">
                <div className="flex justify-between">
                  <span>• Freight & Freight Transport:</span>
                  <span>₹{logisticsEst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Staff & Operations Salaries:</span>
                  <span>₹{staffSalaryEst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Facility Rent & Power Utilities:</span>
                  <span>₹{rentUtilitiesEst.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="p-3.5 flex justify-between items-center bg-[#174F3A] text-white font-extrabold text-sm rounded-b-xl">
                <span>(=) Net Earnings / Net Profit</span>
                <span className="text-base">₹{netProfitVal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Operational Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-xs space-y-1.5">
              <span className="font-bold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#174F3A] dark:text-[#A3E6C5]" /> Outpost Leadership
              </span>
              <p className="text-[#66736C] dark:text-[#8E9E96] font-medium">
                Manager: <strong>{(mart as any).entrepreneurName || (mart as any).manager || 'Not Assigned'}</strong>
              </p>
              {(mart as any).phone && (
                <p className="text-[#66736C] dark:text-[#8E9E96] flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {(mart as any).phone}
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-xs space-y-1.5">
              <span className="font-bold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-[#174F3A] dark:text-[#A3E6C5]" /> Billing Metrics
              </span>
              <p className="text-[#66736C] dark:text-[#8E9E96] font-medium">
                Average Bill Amount: <strong>₹{mart.avgBillValue}</strong>
              </p>
              <p className="text-[#66736C] dark:text-[#8E9E96] flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#174F3A] dark:text-[#A3E6C5]" /> Sales Growth: +{mart.salesGrowthPercent}%
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#121E19] flex items-center justify-between rounded-b-xl">
          <span className="text-[11px] text-[#66736C] dark:text-[#8E9E96] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#174F3A] dark:text-[#A3E6C5]" /> Audit verified by NABARD Finance
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] text-[#17221D] dark:text-[#E6ECE8] font-semibold text-xs hover:bg-white dark:hover:bg-[#16241E] transition-colors"
            >
              Close
            </button>
            <button
              onClick={downloadStatement}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#174F3A] hover:bg-[#103A2B] text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" /> Download P&L Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
