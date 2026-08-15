import React, { useState } from 'react';
import {
  Store,
  CheckCircle2,
  AlertTriangle,
  Award,
  Zap,
  TrendingUp,
  Info,
} from 'lucide-react';
import { RuralMartData } from '../../../shared/types';

interface RuralMartsKpiCardsProps {
  marts: RuralMartData[];
}

export const RuralMartsKpiCards: React.FC<RuralMartsKpiCardsProps> = ({ marts }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const totalMarts = marts.length;
  const activeMarts = marts.filter((m) => m.status === 'Active').length;
  const inactiveMarts = totalMarts - activeMarts;

  const sortedByScore = [...marts].filter((m) => m.score > 0).sort((a, b) => b.score - a.score);
  const bestMart = sortedByScore[0];

  const sortedByGrowth = [...marts].filter((m) => (m as any).salesGrowthPercent > 0).sort((a, b) => ((b as any).salesGrowthPercent || 0) - ((a as any).salesGrowthPercent || 0));
  const fastestMart = sortedByGrowth[0];

  const avgScore =
    marts.length > 0
      ? (marts.reduce((acc, m) => acc + (m.score || 0), 0) / marts.length).toFixed(1)
      : '0.0';

  const kpis = [
    {
      id: 'kpi-total',
      label: 'Total Rural Marts',
      value: totalMarts.toString(),
      icon: Store,
      tooltip: 'Total registered and sanctioned Rural Mart outposts across monitored districts.',
    },
    {
      id: 'kpi-active',
      label: 'Active Rural Marts',
      value: activeMarts.toString(),
      icon: CheckCircle2,
      tooltip: 'Rural Marts actively generating daily sales, serving farmers, and syncing data.',
    },
    {
      id: 'kpi-inactive',
      label: 'Inactive / Delayed',
      value: inactiveMarts.toString(),
      icon: AlertTriangle,
      tooltip: 'Rural Marts marked inactive, experiencing data lag, or pending restocking.',
    },
    {
      id: 'kpi-best',
      label: 'Best Performing Mart',
      value: bestMart ? bestMart.name : 'N/A',
      icon: Award,
      tooltip: 'Top-ranked Rural Mart evaluated on sales growth, profitability, farmer reach, and inventory health.',
    },
    {
      id: 'kpi-fastest',
      label: 'Fastest Growing Mart',
      value: fastestMart ? fastestMart.name : 'N/A',
      icon: Zap,
      tooltip: 'Rural Mart experiencing the highest year-over-year revenue and registered farmer growth.',
    },
    {
      id: 'kpi-avg-score',
      label: 'Avg Performance Score',
      value: `${avgScore}`,
      icon: TrendingUp,
      tooltip: 'Weighted average composite performance score across all Rural Marts in the network.',
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
              <span className="text-xl md:text-2xl font-bold text-[#17221D] dark:text-[#E6ECE8] tracking-tight truncate">
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
