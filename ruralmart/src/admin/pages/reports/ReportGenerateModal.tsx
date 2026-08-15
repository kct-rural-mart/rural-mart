import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  Calendar,
  MapPin,
  Store,
  Filter,
  FileType,
  FileSpreadsheet,
  ShieldCheck,
  BarChart3,
  Globe,
} from 'lucide-react';
import { AvailableReportItem, GlobalFilters } from '../../../shared/types';

interface ReportGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReport?: AvailableReportItem | null;
  filters: GlobalFilters;
  onConfirmGenerate: (params: {
    reportTitle: string;
    reportType: string;
    district: string;
    ruralMart: string;
    dateRange: string;
    format: 'PDF' | 'Excel' | 'CSV';
    includeCharts: boolean;
    includeAuditWatermark: boolean;
  }) => void;
}

export const ReportGenerateModal: React.FC<ReportGenerateModalProps> = ({
  isOpen,
  onClose,
  initialReport,
  filters,
  onConfirmGenerate,
}) => {
  if (!isOpen) return null;

  const [reportTitle, setReportTitle] = useState(
    initialReport ? initialReport.name : 'Custom Consolidated Rural Mart Audit Report'
  );
  const [reportType, setReportType] = useState(
    initialReport ? initialReport.type : 'Combined Network'
  );
  const [district, setDistrict] = useState(
    filters.district !== 'All Districts' ? filters.district : 'All'
  );
  const [ruralMart, setRuralMart] = useState(
    filters.ruralMart !== 'All Rural Marts' ? filters.ruralMart : 'All'
  );
  const [dateRange, setDateRange] = useState(filters.dateRange || 'This Month (Jul 2026)');
  const [format, setFormat] = useState<'PDF' | 'Excel' | 'CSV'>('PDF');
  const [includeCharts, setIncludeCharts] = useState<boolean>(true);
  const [includeAuditWatermark, setIncludeAuditWatermark] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleDownload = (selectedFormat: 'PDF' | 'Excel' | 'CSV') => {
    setFormat(selectedFormat);
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      onConfirmGenerate({
        reportTitle,
        reportType,
        district,
        ruralMart,
        dateRange,
        format: selectedFormat,
        includeCharts,
        includeAuditWatermark,
      });
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-emerald-950 border border-slate-200 dark:border-emerald-800/60 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-emerald-900/40 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-emerald-950/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Generate & Preview Report
              </h2>
              <p className="text-xs text-slate-500 dark:text-emerald-400/80">
                Customize parameters and download NABARD executive compliance documents
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-900/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Section 1: Parameters Form */}
          <div className="bg-slate-50 dark:bg-emerald-900/20 border border-slate-200/80 dark:border-emerald-800/40 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-300 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              1. Report Configuration & Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Report Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-200 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-white dark:bg-emerald-950 border border-slate-200 dark:border-emerald-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Report Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-200 mb-1">
                  Report Category / Scope
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-white dark:bg-emerald-950 border border-slate-200 dark:border-emerald-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Combined Network">Combined Network Report</option>
                  <option value="Individual Mart">Individual Rural Mart Report</option>
                  <option value="Business & Finance">Business & Finance Report</option>
                  <option value="Farmers & Outreach">Farmers & Outreach Report</option>
                  <option value="Products & Inventory">Products & Inventory Report</option>
                  <option value="Comparison">Comparison Report</option>
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-200 mb-1">
                  Target District
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-white dark:bg-emerald-950 border border-slate-200 dark:border-emerald-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="All">All Districts</option>
                  <option value="Erode">Erode District</option>
                  <option value="Coimbatore">Coimbatore District</option>
                  <option value="Tiruppur">Tiruppur District</option>
                  <option value="Salem">Salem District</option>
                  <option value="Madurai">Madurai District</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-200 mb-1">
                  Reporting Period
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-white dark:bg-emerald-950 border border-slate-200 dark:border-emerald-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="This Month (Jul 2026)">This Month (Jul 2026)</option>
                  <option value="Last Quarter (Q2 2026)">Last Quarter (Q2 2026)</option>
                  <option value="Financial Year 2025-26">Financial Year 2025-26</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                </select>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-200/60 dark:border-emerald-800/30">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-emerald-200">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                Include Graphical Charts & Visual Analytics
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-emerald-200">
                <input
                  type="checkbox"
                  checked={includeAuditWatermark}
                  onChange={(e) => setIncludeAuditWatermark(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Attach NABARD Official Digital Verification Seal
              </label>
            </div>
          </div>

          {/* Section 2: Live Executive Report Summary Preview Box */}
          <div className="bg-white dark:bg-emerald-950 border-2 border-emerald-500/30 rounded-2xl p-5 shadow-inner space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-800/50 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Live Document Preview
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-emerald-400/80">
                    NABARD EDF Rural Mart Executive Audit Standard
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-full">
                {format} Format Ready
              </span>
            </div>

            {/* Document Body Mock */}
            <div className="space-y-3 font-mono text-xs text-slate-800 dark:text-emerald-100 bg-slate-50/80 dark:bg-emerald-900/30 p-4 rounded-xl border border-slate-200/60 dark:border-emerald-800/30">
              <div className="text-center border-b border-slate-300 dark:border-emerald-700 pb-2">
                <p className="font-bold uppercase text-sm tracking-wide text-emerald-900 dark:text-emerald-300">
                  {reportTitle}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-emerald-400">
                  Period: {dateRange} | Scope: {district} District ({ruralMart})
                </p>
              </div>

              {/* Sample Metrics Summary Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                <div className="bg-white dark:bg-emerald-950 p-2 rounded border border-slate-200 dark:border-emerald-800/40">
                  <span className="block text-[10px] text-slate-400 dark:text-emerald-400">
                    Network Sales:
                  </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    ₹2.58 Crore
                  </span>
                </div>
                <div className="bg-white dark:bg-emerald-950 p-2 rounded border border-slate-200 dark:border-emerald-800/40">
                  <span className="block text-[10px] text-slate-400 dark:text-emerald-400">
                    Active Marts:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    9 of 10 Outposts
                  </span>
                </div>
                <div className="bg-white dark:bg-emerald-950 p-2 rounded border border-slate-200 dark:border-emerald-800/40">
                  <span className="block text-[10px] text-slate-400 dark:text-emerald-400">
                    Farmers Reached:
                  </span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">
                    24,440 Members
                  </span>
                </div>
                <div className="bg-white dark:bg-emerald-950 p-2 rounded border border-slate-200 dark:border-emerald-800/40">
                  <span className="block text-[10px] text-slate-400 dark:text-emerald-400">
                    Grant Status:
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    100% Compliant
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 dark:text-emerald-400/60 pt-2 flex items-center justify-between border-t border-slate-200 dark:border-emerald-800">
                <span>Generated by: S. Ramanathan (State Admin)</span>
                <span>Stamp: NABARD-EDF-2026-VERIFIED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-emerald-900/40 bg-slate-50/50 dark:bg-emerald-950/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Select preferred format to download instantly:</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleDownload('PDF')}
              disabled={isGenerating}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <FileType className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={() => handleDownload('Excel')}
              disabled={isGenerating}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Excel</span>
            </button>

            <button
              onClick={() => handleDownload('CSV')}
              disabled={isGenerating}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200 dark:bg-emerald-900/60 hover:bg-slate-300 dark:hover:bg-emerald-800 text-slate-800 dark:text-emerald-100 font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
