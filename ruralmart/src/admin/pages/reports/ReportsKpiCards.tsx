import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Layers,
  Award,
  Store,
  Globe,
  Info,
} from 'lucide-react';
import { AvailableReportItem, ExportHistoryRecord } from '../../../shared/types';

interface ReportsKpiCardsProps {
  availableReports: AvailableReportItem[];
  exportHistory: ExportHistoryRecord[];
  selectedReportType: string;
}

export const ReportsKpiCards: React.FC<ReportsKpiCardsProps> = ({
  availableReports,
  exportHistory,
  selectedReportType,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Calculations based on mock & live filter states
  const totalReportsGenerated = 1284;
  const monthlyCount = 542;
  const quarterlyCount = 386;
  const yearlyCount = 156;
  const individualMartCount = 120;
  const combinedNetworkCount = 80;

  const kpis = [
    {
      id: 'kpi-total',
      label: 'Total Reports Generated',
      value: totalReportsGenerated.toLocaleString(),
      badge: '+14.2%',
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/15 dark:border-[#A3E6C5]/20',
      comparison: 'vs last year',
      icon: FileText,
      tooltip: 'Total reports compiled, previewed, and downloaded across all districts in current fiscal period.',
    },
    {
      id: 'kpi-monthly',
      label: 'Monthly Reports',
      value: monthlyCount.toLocaleString(),
      badge: '42.2%',
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/15 dark:border-[#A3E6C5]/20',
      comparison: 'of total volume',
      icon: Calendar,
      tooltip: 'Regular monthly sales, ledger, and stock health reporting downloads.',
    },
    {
      id: 'kpi-quarterly',
      label: 'Quarterly Reports',
      value: quarterlyCount.toLocaleString(),
      badge: '30.1%',
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/15 dark:border-[#A3E6C5]/20',
      comparison: 'of total volume',
      icon: Layers,
      tooltip: 'Quarterly compliance, financial audit, and multi-district comparison matrix downloads.',
    },
    {
      id: 'kpi-yearly',
      label: 'Yearly Reports',
      value: yearlyCount.toLocaleString(),
      badge: '12.1%',
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/15 dark:border-[#A3E6C5]/20',
      comparison: 'of total volume',
      icon: Award,
      tooltip: 'Annual NABARD capital subsidy grant utilization summaries and financial audits.',
    },
    {
      id: 'kpi-individual',
      label: 'Individual Mart Reports',
      value: individualMartCount.toLocaleString(),
      badge: '9.3%',
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/15 dark:border-[#A3E6C5]/20',
      comparison: 'of total volume',
      icon: Store,
      tooltip: 'Single-outpost operational scorecards and local village level outreach summaries.',
    },
    {
      id: 'kpi-combined',
      label: 'Combined Network Reports',
      value: combinedNetworkCount.toLocaleString(),
      badge: '6.2%',
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/15 dark:border-[#A3E6C5]/20',
      comparison: 'of total volume',
      icon: Globe,
      tooltip: 'Statewide consolidated Rural Mart performance audits and macro-level impact dashboards.',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isTooltipOpen = activeTooltip === kpi.id;

        return (
          <div
            key={kpi.id}
            className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-3.5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 cursor-pointer relative flex flex-col justify-between group"
          >
            {/* Top Row: Label & Info Icon */}
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase tracking-wider truncate">
                {kpi.label}
              </span>
              <div className="relative flex items-center">
                <button
                  onMouseEnter={() => setActiveTooltip(kpi.id)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(isTooltipOpen ? null : kpi.id)}
                  className="text-[#8A958F] hover:text-[#174F3A] dark:text-[#61736A] dark:hover:text-[#A3E6C5] transition-colors p-0.5"
                  title="More information"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                {/* Info Tooltip Popover */}
                {isTooltipOpen && (
                  <div className="absolute right-0 top-6 w-48 bg-[#17221D] text-white dark:bg-[#16241E] dark:text-[#E6ECE8] text-[10px] p-2 rounded-lg shadow-lg z-50 pointer-events-none leading-relaxed border border-[#34735A]">
                    {kpi.tooltip}
                  </div>
                )}
              </div>
            </div>

            {/* Middle Row: Value & Main Icon */}
            <div className="flex items-baseline justify-between gap-2 my-1">
              <span className="text-xl md:text-2xl font-bold text-[#17221D] dark:text-[#E6ECE8] tracking-tight">
                {kpi.value}
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#E7F2EC] dark:bg-[#1B3D30] text-[#174F3A] dark:text-[#A3E6C5] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
