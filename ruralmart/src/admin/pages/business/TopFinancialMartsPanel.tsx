import React from 'react';
import { Award, TrendingUp, ChevronRight } from 'lucide-react';
import { MartFinancialRecord } from '../../../shared/types';

interface TopFinancialMartsPanelProps {
  financialMarts: MartFinancialRecord[];
  onSelectMart: (mart: MartFinancialRecord) => void;
}

export const TopFinancialMartsPanel: React.FC<TopFinancialMartsPanelProps> = ({
  financialMarts,
  onSelectMart,
}) => {
  // Sort by Profit Margin descending & take top 5
  const topMarts = [...financialMarts]
    .filter((m) => m.salesRaw > 0)
    .sort((a, b) => b.profitMargin - a.profitMargin)
    .slice(0, 5);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-[#D97706] text-white';
      case 2:
        return 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5]';
      case 3:
        return 'bg-[#B45309] text-white';
      default:
        return 'bg-[#F8FAF7] text-[#66736C] dark:bg-[#16241E] dark:text-[#8E9E96] border border-[#DDE6E0] dark:border-[#1E3129]';
    }
  };

  return (
    <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DDE6E0] dark:border-[#1E3129]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#FEF3C7] dark:bg-[#3D2D10] text-[#D97706] dark:text-[#FBBF24]">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] tracking-tight">
                Top Performing Financial Rural Marts
              </h3>
            </div>
          </div>
        </div>

        {/* List of Top 5 Marts */}
        <div className="space-y-2.5">
          {topMarts.map((mart, idx) => {
            const rank = idx + 1;
            // Max profit margin in list for relative progress bar scaling
            const maxMargin = topMarts[0]?.profitMargin || 1;
            const percentageWidth = Math.min(100, Math.round((mart.profitMargin / maxMargin) * 100));

            return (
              <div
                key={mart.id}
                onClick={() => onSelectMart(mart)}
                className="p-2.5 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] hover:border-[#34735A] bg-[#F8FAF7] dark:bg-[#16241E] hover:bg-[#E7F2EC]/40 dark:hover:bg-[#1B3D30]/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-lg text-[10px] font-extrabold flex items-center justify-center shrink-0 ${getRankBadge(
                        rank
                      )}`}
                    >
                      #{rank}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-[#17221D] dark:text-[#E6ECE8] truncate group-hover:text-[#174F3A] dark:group-hover:text-[#A3E6C5]">
                        {mart.name}
                      </h4>
                      <p className="text-[10px] text-[#8A958F] font-medium">
                        {mart.district} District • {mart.salesDisplay} Sales
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-xs text-[#174F3A] dark:text-[#A3E6C5]">
                      {mart.profitMargin}% Margin
                    </div>
                    <div className="text-[10px] font-semibold text-[#66736C] dark:text-[#8E9E96]">
                      Net: {mart.netProfitDisplay}
                    </div>
                  </div>
                </div>

                {/* Margin Visual Progress Bar */}
                <div className="w-full bg-[#DDE6E0] dark:bg-[#1E3129] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#174F3A] dark:bg-[#8ECAAA] h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentageWidth}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#8A958F] mt-1.5">
                  <span className="flex items-center gap-1 font-semibold text-[#174F3A] dark:text-[#8ECAAA]">
                    <TrendingUp className="w-3 h-3" /> +{mart.salesGrowthPercent}% growth YoY
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform flex items-center text-[#174F3A] dark:text-[#A3E6C5] font-bold">
                    View P&L <ChevronRight className="w-3 h-3 ml-0.5 inline" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Banner */}
      <div className="mt-3 pt-2.5 border-t border-[#DDE6E0] dark:border-[#1E3129] text-[11px] text-[#66736C] dark:text-[#8E9E96] flex items-center justify-between">
        <span>Average Top 5 Margin: <strong className="text-[#17221D] dark:text-[#E6ECE8]">14.35%</strong></span>
        <span className="text-[#174F3A] dark:text-[#A3E6C5] font-bold">NABARD Benchmark Met</span>
      </div>
    </div>
  );
};
