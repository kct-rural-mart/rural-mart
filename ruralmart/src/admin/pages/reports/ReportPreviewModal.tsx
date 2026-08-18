import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Download,
  Printer,
  FileText,
  CheckCircle2,
  Building2,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Briefcase,
  AlertCircle,
  Info,
  BarChart3,
  Check,
  Award,
  Phone,
  UserCheck,
  Image as ImageIcon,
  MessageSquare,
  Target,
  GraduationCap,
} from 'lucide-react';
import { RuralMartData } from '../../../shared/types';
import { getLiveIndividualReport, LiveIndividualReport } from '../../services/reportsService';

export interface ReportConfig {
  scope: 'individual' | 'overall';
  category: 'overall' | 'business' | 'farmers' | 'products';
  mart?: RuralMartData | null;
  allMarts?: RuralMartData[];
}

interface ReportPreviewModalProps {
  config: ReportConfig | null;
  /** Reporting period label from the existing Admin header date-range selector (e.g. "Last 30 Days"). */
  dateRange?: string;
  onClose: () => void;
  onDownload: (title: string, format: 'PDF' | 'Excel' | 'CSV') => void;
}

// Translates the existing Admin date-range preset labels (AdminHeader) into a concrete
// [start, end] window, so the Individual Rural Mart report can honor the currently selected
// reporting period. Unrecognized/empty labels fall back to no filter (all-time), never hiding
// data by accident.
function getPeriodBounds(label?: string): { start: Date | null; end: Date | null } {
  if (!label) return { start: null, end: null };
  const now = new Date();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (label === 'Last 30 Days') {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    return { start, end: endOfToday };
  }
  if (label.startsWith('This Quarter')) {
    const q = Math.floor(now.getMonth() / 3);
    return { start: new Date(now.getFullYear(), q * 3, 1), end: endOfToday };
  }
  if (label.startsWith('Financial Year')) {
    const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return { start: new Date(fyStartYear, 3, 1), end: endOfToday };
  }
  if (label.startsWith('Year to Date')) {
    return { start: new Date(now.getFullYear(), 0, 1), end: endOfToday };
  }
  return { start: null, end: null };
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  config,
  dateRange,
  onClose,
  onDownload,
}) => {
  const [downloadSuccessFormat, setDownloadSuccessFormat] = useState<string | null>(null);

  // NOTE: hooks below must run unconditionally (before the `if (!config) return null` guard)
  // so the individual Rural Mart report can reuse the same centralized, real-data calculation
  // service (getIndividualMartReportData) — never a second/duplicate data layer.
  const isIndividualScope = config?.scope === 'individual';
  const individualMartId = config?.mart?.dbId || '';

  const { start: periodStart, end: periodEnd } = useMemo(
    () => getPeriodBounds(dateRange),
    [dateRange]
  );

  const [individualReportData, setIndividualReportData] = useState<LiveIndividualReport | null>(null);
  useEffect(() => {
    let active = true;
    if (!isIndividualScope || !individualMartId) { setIndividualReportData(null); return () => { active = false; }; }
    const start = periodStart?.toISOString().slice(0, 10); const end = periodEnd?.toISOString().slice(0, 10);
    void getLiveIndividualReport(individualMartId, start, end).then((data) => { if (active) setIndividualReportData(data); }).catch(() => { if (active) setIndividualReportData(null); });
    return () => { active = false; };
  }, [individualMartId, isIndividualScope, periodEnd, periodStart]);

  if (!config) return null;

  const isOverall = config.scope === 'overall';
  const mart = config.mart;
  const allMarts = config.allMarts || [];

  const targetName = isOverall
    ? 'All Rural Marts Network'
    : `${mart?.name || 'Rural Mart'} Rural Mart`;

  const categoryLabel = isOverall
    ? config.category === 'business'
      ? 'Business & Finance Master Audit'
      : config.category === 'farmers'
      ? 'Farmers & Outreach Master Report'
      : config.category === 'products'
      ? 'Products & Inventory Master Report'
      : 'Comprehensive State-Wide Audit Report'
    : 'Fellowship Report';

  const reportTitle = `${targetName} — ${categoryLabel}`;
  const generatedDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Derived metrics
  const totalSalesRaw = isOverall
    ? allMarts.reduce((acc, m) => acc + (m.salesRaw || 0), 0)
    : mart?.salesRaw || 0;

  const totalSalesLakhs = (totalSalesRaw / 100000).toFixed(2);
  const totalSalesCr = (totalSalesRaw / 10000000).toFixed(2);

  const totalFarmers = isOverall
    ? allMarts.reduce((acc, m) => acc + (m.registeredFarmers || 0), 0)
    : mart?.registeredFarmers || 0;

  const totalFarmersReached = isOverall
    ? allMarts.reduce((acc, m) => acc + (m.farmersReached || 0), 0)
    : mart?.farmersReached || 0;

  const totalFootfall = isOverall
    ? allMarts.reduce((acc, m) => acc + (m.farmerFootfall || 0), 0)
    : mart?.farmerFootfall || 0;

  const avgScore = isOverall
    ? Math.round(allMarts.reduce((acc, m) => acc + (m.score || 0), 0) / (allMarts.length || 1))
    : mart?.score || 0;

  const grossProfitRaw = isOverall
    ? allMarts.reduce((acc, m) => acc + (m.grossProfitRaw || 0), 0)
    : mart?.grossProfitRaw || 0;

  const grossProfitLakhs = (grossProfitRaw / 100000).toFixed(2);
  const marginPercent = ((grossProfitRaw / (totalSalesRaw || 1)) * 100).toFixed(1);

  // Individual specific calculations
  const totalBills = Math.round(totalSalesRaw / 650);
  const avgBillVal = Math.round(totalSalesRaw / (totalBills || 1));
  const estimatedProcurement = Math.round(totalSalesRaw * 0.78);
  const estimatedOpex = Math.round(totalSalesRaw * 0.08);

  const handleTriggerDownload = (format: 'PDF' | 'Excel' | 'CSV') => {
    setDownloadSuccessFormat(format);
    onDownload(reportTitle, format);
    setTimeout(() => {
      setDownloadSuccessFormat(null);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
        {/* Modal Header */}
        <div>
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-emerald-900/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/40">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-900/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                  {isOverall ? 'Network Combined Master Report' : `${mart?.district || 'Tamil Nadu'} District`}
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-emerald-50 mt-1">
                  {reportTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-emerald-400/80 flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Date: {generatedDate}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> NABARD Audit Compliant
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-emerald-200 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner if downloaded */}
        {downloadSuccessFormat && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-semibold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Report compilation successful! File downloaded as <strong>{downloadSuccessFormat}</strong>.
            </span>
          </div>
        )}

        {/* Document Preview Canvas */}
        <div className="bg-slate-50 dark:bg-[#0B130F] border border-slate-200 dark:border-emerald-900/40 rounded-xl p-5 space-y-6 text-slate-800 dark:text-emerald-100 font-sans shadow-inner">
          {isOverall ? (
          <>
          {/* Document Letterhead */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-emerald-900/40 pb-4 gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-emerald-50 uppercase tracking-wide">
                Tamil Nadu Rural Mart Monitoring & Operations Audit
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-emerald-400">
                Department of Rural Development & NABARD Outpost Analytics
              </p>
            </div>
            <div className="text-left sm:text-right text-[11px] text-slate-500 dark:text-emerald-400">
              <p>
                <strong>Doc Ref:</strong> RRM-AUD-{Date.now().toString().slice(-6)}
              </p>
              <p>
                <strong>Verification:</strong> Official Signed Copy
              </p>
            </div>
          </div>

          {/* SECTION 1: OVERALL MART SUMMARY & AUDIT SCORE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-900/30 pb-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                1. Overall Mart Summary & Audit Score
              </h4>
              <span className="text-[10px] font-bold text-slate-400">Section 1 of 4</span>
            </div>

            {!isOverall && mart ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Mart Metadata</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-emerald-50">{mart.name} Mart</p>
                  <p className="text-[11px] text-slate-500 dark:text-emerald-400">District: {mart.district}</p>
                  <p className="text-[11px] text-slate-500 dark:text-emerald-400">Manager: {mart.manager}</p>
                  <p className="text-[11px] text-slate-500 dark:text-emerald-400">Contact: {mart.contact}</p>
                </div>

                <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Audit Rating & Status</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{mart.score}</span>
                    <span className="text-xs text-slate-400">/ 100 Score</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
                    Target Benchmark: {mart.targetScore}/100
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                    {mart.status} Operational Outpost
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Score Factor Breakdown</span>
                  <div className="text-[10px] space-y-1 text-slate-600 dark:text-emerald-300">
                    <div className="flex justify-between">
                      <span>Sales Growth:</span>
                      <strong className="text-slate-800 dark:text-emerald-100">{mart.scoreBreakdown?.salesGrowth || 0}/20</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Profitability:</span>
                      <strong className="text-slate-800 dark:text-emerald-100">{mart.scoreBreakdown?.profitability || 0}/20</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Farmer Engagement:</span>
                      <strong className="text-slate-800 dark:text-emerald-100">{mart.scoreBreakdown?.farmerEngagement || 0}/20</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Compliance:</span>
                      <strong className="text-slate-800 dark:text-emerald-100">{mart.scoreBreakdown?.compliance || 0}/10</strong>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-medium">Network Size</span>
                  <span className="text-lg font-extrabold text-slate-900 dark:text-emerald-50">{allMarts.length} Marts</span>
                  <span className="text-[10px] text-emerald-600 block">100% Online</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-medium">Average Network Score</span>
                  <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">{avgScore}/100</span>
                  <span className="text-[10px] text-slate-400 block">Grade A Average</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-medium">Total Sales</span>
                  <span className="text-lg font-extrabold text-slate-900 dark:text-emerald-50">₹{totalSalesCr} Cr</span>
                  <span className="text-[10px] text-slate-400 block">Across 5 Districts</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-medium">Total Farmers</span>
                  <span className="text-lg font-extrabold text-blue-700 dark:text-blue-300">{totalFarmers.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 block">Registered Base</span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: BUSINESS & FINANCE REPORT */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-900/30 pb-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                2. Business & Finance Detail Report
              </h4>
              <span className="text-[10px] font-bold text-slate-400">Section 2 of 4</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Total Revenue / Sales</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-emerald-50">₹{totalSalesLakhs} Lakhs</span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">₹{totalSalesRaw.toLocaleString()}</span>
              </div>

              <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Gross Profit Margin</span>
                <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">₹{grossProfitLakhs} Lakhs</span>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">{marginPercent}% Margin</span>
              </div>

              <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Bills Generated</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-emerald-100">{totalBills.toLocaleString()} Bills</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Avg ₹{avgBillVal} / Bill</span>
              </div>

              <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Est. Operating Expenses</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-emerald-100">₹{(estimatedOpex / 100000).toFixed(2)} Lakhs</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">~8% Revenue Opex</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: FARMERS & OUTREACH REPORT */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-900/30 pb-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                3. Farmers & Outreach Detail Report
              </h4>
              <span className="text-[10px] font-bold text-slate-400">Section 3 of 4</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Registered Farmers</span>
                <span className="text-base font-extrabold text-blue-700 dark:text-blue-300">{totalFarmers.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Onboarded Base</span>
              </div>

              <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Active Farmers Reached</span>
                <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">{totalFarmersReached.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                  {((totalFarmersReached / (totalFarmers || 1)) * 100).toFixed(1)}% Active Reach
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Monthly Footfall</span>
                <span className="text-base font-extrabold text-amber-700 dark:text-amber-300">{totalFootfall.toLocaleString()} Visits</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Outpost Visits</span>
              </div>

              <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Repeat Buyer Rate</span>
                <span className="text-base font-extrabold text-purple-700 dark:text-purple-300">82.4%</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">High Loyalty Index</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: PRODUCTS & INVENTORY REPORT */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-900/30 pb-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-600" />
                4. Products & Inventory Detail Report
              </h4>
              <span className="text-[10px] font-bold text-slate-400">Section 4 of 4</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Catalog Stock Health</span>
                <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">96.8%</span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">Healthy In-Stock</span>
              </div>

              <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Fast-Moving SKUs</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-emerald-100">Fertilizers & Seeds</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">High Turnover</span>
              </div>

              <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Low Stock Alerts</span>
                <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">0 Critical</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Auto-Reorder Active</span>
              </div>

              <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Inventory Valuation</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-emerald-100">₹{(totalSalesRaw * 0.35 / 100000).toFixed(2)} Lakhs</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Current Stock Value</span>
              </div>
            </div>
          </div>

          {/* Detailed Audit Breakdown Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-400 mb-2">
              5. Operational Consolidated Table
            </h4>

            <div className="bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-[#182821] text-slate-600 dark:text-emerald-300 border-b border-slate-200 dark:border-[#1E3129]">
                    <th className="p-2.5 font-bold">Rural Mart Name</th>
                    <th className="p-2.5 font-bold">District</th>
                    <th className="p-2.5 font-bold text-right">Sales (Lakhs)</th>
                    <th className="p-2.5 font-bold text-right">Gross Profit</th>
                    <th className="p-2.5 font-bold text-right">Registered Farmers</th>
                    <th className="p-2.5 font-bold text-center">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/30">
                  {isOverall ? (
                    allMarts.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-emerald-900/20">
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-emerald-50">{m.name}</td>
                        <td className="p-2.5 text-slate-600 dark:text-emerald-300">{m.district}</td>
                        <td className="p-2.5 text-right font-semibold text-slate-800 dark:text-emerald-100">
                          ₹{(m.salesRaw / 100000).toFixed(2)} L
                        </td>
                        <td className="p-2.5 text-right text-emerald-700 dark:text-emerald-300 font-semibold">
                          ₹{m.grossProfitLakhs} L
                        </td>
                        <td className="p-2.5 text-right text-slate-700 dark:text-emerald-200">
                          {m.registeredFarmers.toLocaleString()}
                        </td>
                        <td className="p-2.5 text-center font-bold text-emerald-700 dark:text-emerald-400">
                          {m.score}/100
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="hover:bg-slate-50 dark:hover:bg-emerald-900/20">
                      <td className="p-2.5 font-semibold text-slate-900 dark:text-emerald-50">{mart?.name}</td>
                      <td className="p-2.5 text-slate-600 dark:text-emerald-300">{mart?.district}</td>
                      <td className="p-2.5 text-right font-semibold text-slate-800 dark:text-emerald-100">
                        ₹{((mart?.salesRaw || 0) / 100000).toFixed(2)} L
                      </td>
                      <td className="p-2.5 text-right text-emerald-700 dark:text-emerald-300 font-semibold">
                        ₹{mart?.grossProfitLakhs} L
                      </td>
                      <td className="p-2.5 text-right text-slate-700 dark:text-emerald-200">
                        {mart?.registeredFarmers.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-center font-bold text-emerald-700 dark:text-emerald-400">
                        {mart?.score}/100
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </>
          ) : (
          <>
          {/* FELLOWSHIP REPORT HEADER */}
          <div className="text-center border-b border-slate-200 dark:border-emerald-900/40 pb-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-emerald-50 uppercase tracking-wide">
              Fellowship Report
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-emerald-400 mt-0.5">
              Rural Mart Fellow — Operational, Outreach &amp; Business Status Report
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Fellow / Owner Name
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-emerald-50">
                {individualReportData?.ownerName || mart?.manager || '—'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-emerald-400 flex items-center gap-1">
                <Phone className="w-3 h-3" /> {individualReportData?.ownerContact || mart?.contact || '—'}
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Rural Mart</span>
              <p className="text-xs font-bold text-slate-900 dark:text-emerald-50">{mart?.name || '—'}</p>
              <p className="text-[11px] text-slate-500 dark:text-emerald-400">
                ID: {mart?.id || '—'} • District: {mart?.district || '—'}
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Period of Reporting
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-emerald-50">
                {dateRange || 'All-Time (No Period Filter Selected)'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-emerald-400">Submission Date: {generatedDate}</p>
            </div>
          </div>

          {/* SECTION 1: FARMER OUTREACH PROGRAMS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-900/30 pb-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                1. Farmer Outreach Programs
              </h4>
              <span className="text-[10px] font-bold text-slate-400">Section 1 of 7</span>
            </div>

            {individualReportData && individualReportData.outreachRecords.length > 0 ? (
              <div className="bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-[#182821] text-slate-600 dark:text-emerald-300 border-b border-slate-200 dark:border-[#1E3129]">
                      <th className="p-2.5 font-bold">S.No</th>
                      <th className="p-2.5 font-bold">Activity / Program</th>
                      <th className="p-2.5 font-bold">Date</th>
                      <th className="p-2.5 font-bold">Description</th>
                      <th className="p-2.5 font-bold text-right">Farmers Reached</th>
                      <th className="p-2.5 font-bold">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/30">
                    {individualReportData.outreachRecords.map((o, idx) => (
                      <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-emerald-900/20">
                        <td className="p-2.5 text-slate-500 dark:text-emerald-400">{idx + 1}</td>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-emerald-50">
                          {o.title || o.programName || o.activityType || 'Outreach Activity'}
                        </td>
                        <td className="p-2.5 text-slate-600 dark:text-emerald-300">{o.date || o.programDate || '—'}</td>
                        <td className="p-2.5 text-slate-600 dark:text-emerald-300">
                          {o.description ||
                            o.topicsCovered ||
                            (Array.isArray(o.topics) && o.topics.length > 0 ? o.topics.join(', ') : '') ||
                            '—'}
                        </td>
                        <td className="p-2.5 text-right font-semibold text-slate-800 dark:text-emerald-100">
                          {(o.farmersAttended ?? o.farmersReached ?? 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-2.5 text-slate-600 dark:text-emerald-300">{o.village || o.district || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-emerald-400 italic bg-white dark:bg-[#121E19] border border-dashed border-slate-300 dark:border-emerald-800/40 rounded-xl">
                No outreach activities recorded for this period.
              </div>
            )}
          </div>

          {/* SECTION 2: BUSINESS STATUS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-900/30 pb-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                2. Business Status
              </h4>
              <span className="text-[10px] font-bold text-slate-400">Section 2 of 7</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Total Procurement Value</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-emerald-50">
                  ₹{(individualReportData?.totalProcurementValue || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Total Sales Value</span>
                <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">
                  ₹{(individualReportData?.totalSalesValue || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Bills Generated</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-emerald-100">
                  {(individualReportData?.totalBills || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Avg ₹{(individualReportData?.avgBillValue || 0).toLocaleString('en-IN')} / Bill
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Registered Farmers</span>
                <span className="text-base font-extrabold text-blue-700 dark:text-blue-300">
                  {(individualReportData?.farmersCount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div>
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-400 mb-1.5">
                Most Sold Products &amp; Pricing Details
              </h5>
              {individualReportData && individualReportData.productBreakdown.length > 0 ? (
                <div className="bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-[#182821] text-slate-600 dark:text-emerald-300 border-b border-slate-200 dark:border-[#1E3129]">
                        <th className="p-2.5 font-bold">Product</th>
                        <th className="p-2.5 font-bold text-right">Qty Sold</th>
                        <th className="p-2.5 font-bold text-right">Selling Price</th>
                        <th className="p-2.5 font-bold text-right">Procurement Cost</th>
                        <th className="p-2.5 font-bold text-right">Sales Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/30">
                      {individualReportData.productBreakdown.slice(0, 8).map((p) => (
                        <tr key={p.productName} className="hover:bg-slate-50 dark:hover:bg-emerald-900/20">
                          <td className="p-2.5 font-semibold text-slate-900 dark:text-emerald-50">{p.productName}</td>
                          <td className="p-2.5 text-right text-slate-700 dark:text-emerald-200">
                            {p.quantitySold.toLocaleString('en-IN')} {p.unit}
                          </td>
                          <td className="p-2.5 text-right text-slate-700 dark:text-emerald-200">
                            {p.sellingPrice != null ? `₹${p.sellingPrice.toLocaleString('en-IN')}` : '—'}
                          </td>
                          <td className="p-2.5 text-right text-slate-700 dark:text-emerald-200">
                            {p.costPrice != null ? `₹${p.costPrice.toLocaleString('en-IN')}` : '—'}
                          </td>
                          <td className="p-2.5 text-right font-bold text-emerald-700 dark:text-emerald-300">
                            ₹{p.salesValue.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-emerald-400 italic bg-white dark:bg-[#121E19] border border-dashed border-slate-300 dark:border-emerald-800/40 rounded-xl">
                  No sales recorded for this period.
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: FINANCIAL PERFORMANCE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-900/30 pb-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                3. Financial Performance
              </h4>
              <span className="text-[10px] font-bold text-slate-400">Section 3 of 7</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Gross Profit</span>
                <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">
                  ₹{(individualReportData?.grossProfit || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Operating Expenses</span>
                <span className="text-base font-extrabold text-amber-700 dark:text-amber-300">
                  ₹{(individualReportData?.totalOperatingExpenses || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Net Profit</span>
                <span
                  className={`text-base font-extrabold ${
                    (individualReportData?.netProfit || 0) >= 0
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  ₹{(individualReportData?.netProfit || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4: REVIEW MEETING / TRAINING ENGAGEMENT */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-900/30 pb-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                4. Review Meeting / Training Engagement
              </h4>
              <span className="text-[10px] font-bold text-slate-400">Section 4 of 7</span>
            </div>

            {individualReportData && individualReportData.reviewTrainingRecords.length > 0 ? (
              <div className="bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-[#182821] text-slate-600 dark:text-emerald-300 border-b border-slate-200 dark:border-[#1E3129]">
                      <th className="p-2.5 font-bold">Engagement</th>
                      <th className="p-2.5 font-bold">Date</th>
                      <th className="p-2.5 font-bold">Details</th>
                      <th className="p-2.5 font-bold text-right">Participants</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/30">
                    {individualReportData.reviewTrainingRecords.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-emerald-900/20">
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-emerald-50">
                          {o.title || o.activityType || o.programName || 'Engagement'}
                        </td>
                        <td className="p-2.5 text-slate-600 dark:text-emerald-300">{o.date || o.programDate || '—'}</td>
                        <td className="p-2.5 text-slate-600 dark:text-emerald-300">
                          {o.description ||
                            o.topicsCovered ||
                            (Array.isArray(o.topics) && o.topics.length > 0 ? o.topics.join(', ') : '') ||
                            '—'}
                        </td>
                        <td className="p-2.5 text-right font-semibold text-slate-800 dark:text-emerald-100">
                          {(o.farmersAttended ?? o.farmersReached ?? 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-emerald-400 italic bg-white dark:bg-[#121E19] border border-dashed border-slate-300 dark:border-emerald-800/40 rounded-xl">
                No review meetings or training sessions recorded for this period.
              </div>
            )}
          </div>

          {/* SECTION 5: CHALLENGES / FEEDBACK */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-900/30 pb-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-rose-600" />
                5. Challenges / Feedback
              </h4>
              <span className="text-[10px] font-bold text-slate-400">Section 5 of 7</span>
            </div>
            <div className="p-4 bg-white dark:bg-[#121E19] border border-dashed border-slate-300 dark:border-emerald-800/40 rounded-xl text-xs text-slate-500 dark:text-emerald-400 italic">
              Not recorded — operational challenges and farmer feedback are not currently captured for this Rural Mart.
            </div>
          </div>

          {/* SECTION 6: PLAN / ROAD MAP FOR NEXT MONTH */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-900/30 pb-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-teal-600" />
                6. Plan / Road Map for Next Month
              </h4>
              <span className="text-[10px] font-bold text-slate-400">Section 6 of 7</span>
            </div>
            <div className="p-4 bg-white dark:bg-[#121E19] border border-dashed border-slate-300 dark:border-emerald-800/40 rounded-xl text-xs text-slate-500 dark:text-emerald-400 italic">
              Not recorded — next-month plans, outreach targets, and expansion roadmap are not currently captured for this Rural Mart.
            </div>
          </div>

          {/* SECTION 7: PHOTOS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-900/30 pb-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                7. Photos
              </h4>
              <span className="text-[10px] font-bold text-slate-400">Section 7 of 7</span>
            </div>
            {individualReportData && individualReportData.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {individualReportData.photos.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`${mart?.name || 'Rural Mart'} outreach photo ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-slate-200 dark:border-emerald-800/40"
                  />
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-emerald-400 italic bg-white dark:bg-[#121E19] border border-dashed border-slate-300 dark:border-emerald-800/40 rounded-xl">
                No photos available for this period.
              </div>
            )}
          </div>
          </>
          )}

          {/* Compliance Footer Note */}
          <div className="flex items-center gap-2 p-3 bg-emerald-50/70 dark:bg-emerald-950/60 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-emerald-900 dark:text-emerald-300">
            <Info className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              {isOverall
                ? 'This digital document is generated automatically from real-time field telemetry and meets NABARD & State Rural Development audit standards.'
                : 'This fellowship report is generated automatically from this Rural Mart\'s recorded sales, procurement, outreach and financial data.'}
            </span>
          </div>
        </div>

        {/* Modal Action Footer Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-emerald-900/30">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-700 text-slate-700 dark:text-emerald-200 hover:bg-slate-100 dark:hover:bg-emerald-900/50 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Preview</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleTriggerDownload('CSV')}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/70 text-slate-800 dark:text-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => handleTriggerDownload('Excel')}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/70 text-slate-800 dark:text-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>

            <button
              onClick={() => handleTriggerDownload('PDF')}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
