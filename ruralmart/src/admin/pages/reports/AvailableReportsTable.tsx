import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  FileType,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { AvailableReportItem } from '../../../shared/types';

interface AvailableReportsTableProps {
  reports: AvailableReportItem[];
  onPreviewReport: (report: AvailableReportItem) => void;
  onDownloadReport: (report: AvailableReportItem, format: 'PDF' | 'Excel' | 'CSV') => void;
}

export const AvailableReportsTable: React.FC<AvailableReportsTableProps> = ({
  reports,
  onPreviewReport,
  onDownloadReport,
}) => {
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('All');

  const categories = ['All', 'Financial', 'Operations', 'Outreach', 'Inventory', 'Compliance'];

  const filteredReports = reports.filter((r) => {
    if (activeCategoryTab === 'All') return true;
    return r.category === activeCategoryTab;
  });

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'Combined Network':
        return 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700/50';
      case 'Individual Mart':
        return 'bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700/50';
      case 'Business & Finance':
        return 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700/50';
      case 'Farmers & Outreach':
        return 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700/50';
      case 'Products & Inventory':
        return 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-700/50';
      case 'Comparison':
        return 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700/50';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 space-y-4">
      {/* Header & Category Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-emerald-900/40 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Available Reports
            </h3>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryTab(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategoryTab === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-emerald-900/30 text-slate-600 dark:text-emerald-300 hover:bg-slate-200 dark:hover:bg-emerald-800/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-emerald-800/40 bg-slate-50/70 dark:bg-emerald-900/30 text-slate-500 dark:text-emerald-300 font-semibold uppercase tracking-wider">
              <th className="py-3 px-3">Report Name</th>
              <th className="py-3 px-3">Report Type</th>
              <th className="py-3 px-3">Reporting Period</th>
              <th className="py-3 px-3">Format</th>
              <th className="py-3 px-3 text-right">Actions / Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/30">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-emerald-400/60">
                  No reports match the current filter selection.
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-emerald-900/20 transition-colors group"
                >
                  {/* Report Name & Description */}
                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                      <span>{report.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-emerald-400/70 line-clamp-1 mt-0.5">
                      {report.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 dark:text-emerald-400/50">
                      <span>Size: {report.size}</span>
                      <span>•</span>
                      <span>Downloads: {report.downloadsCount}</span>
                    </div>
                  </td>

                  {/* Report Type Badge */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getTypeBadgeStyle(
                        report.type
                      )}`}
                    >
                      {report.type}
                    </span>
                  </td>

                  {/* Reporting Period */}
                  <td className="py-3 px-3 whitespace-nowrap text-slate-700 dark:text-emerald-200 font-medium">
                    {report.reportingPeriod}
                  </td>

                  {/* Format Indicator */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {report.format.includes('PDF') && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 text-[10px] font-bold">
                          <FileType className="w-3 h-3" /> PDF
                        </span>
                      )}
                      {report.format.includes('Excel') && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-[10px] font-bold">
                          <FileSpreadsheet className="w-3 h-3" /> EXCEL
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Preview Button */}
                      <button
                        onClick={() => onPreviewReport(report)}
                        className="p-1.5 rounded-lg text-slate-600 dark:text-emerald-300 hover:bg-slate-100 dark:hover:bg-emerald-900/50 transition-colors"
                        title="Preview & Custom Options"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* PDF Download */}
                      {report.format.includes('PDF') && (
                        <button
                          onClick={() => onDownloadReport(report, 'PDF')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shadow-sm transition-all"
                          title="Download PDF"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      )}

                      {/* Excel Download */}
                      {report.format.includes('Excel') && (
                        <button
                          onClick={() => onDownloadReport(report, 'Excel')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-all"
                          title="Download Excel"
                        >
                          <Download className="w-3 h-3" />
                          <span>XLSX</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
