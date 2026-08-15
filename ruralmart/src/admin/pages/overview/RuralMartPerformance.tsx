import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
} from 'recharts';
import { Info, ArrowUpDown } from 'lucide-react';
import { RuralMartData, Theme } from '../../../shared/types';

interface RuralMartPerformanceProps {
  marts: RuralMartData[];
  theme: Theme;
}

export const RuralMartPerformance: React.FC<RuralMartPerformanceProps> = ({ marts, theme }) => {
  const [sortBy, setSortBy] = useState<'Highest Score' | 'Lowest Score' | 'Name'>('Highest Score');
  const [showMethodologyPopover, setShowMethodologyPopover] = useState(false);

  const sortedData = [...marts].sort((a, b) => {
    if (sortBy === 'Highest Score') return b.score - a.score;
    if (sortBy === 'Lowest Score') return a.score - b.score;
    return a.name.localeCompare(b.name);
  });

  const chartData = sortedData.map((m) => ({
    name: m.name,
    score: m.score,
    targetScore: m.targetScore,
    breakdown: m.scoreBreakdown,
  }));

  const isDark = theme === 'dark';
  const barColor = isDark ? '#8ECAAA' : '#174F3A'; // Primary Forest / Soft Mint
  const targetDotColor = isDark ? '#60A5FA' : '#2563EB'; // Blue Target Dot
  const gridColor = isDark ? '#1E3129' : '#DDE6E0';
  const textColor = isDark ? '#8E9E96' : '#66736C';

  // Custom Hover Tooltip
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const scoreGap = data.score - data.targetScore;

      return (
        <div className="bg-[#17221D] text-white dark:bg-[#16241E] dark:text-[#E6ECE8] border border-[#34735A] p-3 rounded-xl shadow-lg text-xs space-y-1.5 min-w-[210px]">
          <div className="font-bold text-sm text-[#A3E6C5] border-b border-[#34735A]/50 pb-1 flex justify-between">
            <span>{label} Mart</span>
            <span className="text-[10px] text-[#8A958F] font-normal">Score Card</span>
          </div>

          <div className="flex justify-between items-center text-[#E6ECE8] pt-0.5">
            <span className="font-medium">Performance Score:</span>
            <span className="font-bold text-sm text-[#A3E6C5]">
              {data.score} / 100
            </span>
          </div>

          <div className="flex justify-between items-center text-[#9CA3AF] text-[11px]">
            <span className="font-medium">Target Benchmark:</span>
            <span className="font-bold text-[#60A5FA]">{data.targetScore} / 100</span>
          </div>

          <div className="flex justify-between items-center text-[10px] text-[#8A958F]">
            <span>Variance vs Target:</span>
            <span
              className={`font-bold ${
                scoreGap >= 0 ? 'text-[#A3E6C5]' : 'text-[#FBBF24]'
              }`}
            >
              {scoreGap >= 0 ? `+${scoreGap}` : `${scoreGap}`} pts
            </span>
          </div>

          <div className="pt-1.5 border-t border-[#34735A]/50 text-[9px] text-[#8A958F] space-y-0.5">
            <p className="font-bold text-[#E6ECE8]">Methodology Weighted Score:</p>
            <p>Sales: {data.breakdown?.salesGrowth}/20 | Profit: {data.breakdown?.profitability}/20</p>
            <p>Engage: {data.breakdown?.farmerEngagement}/20 | Reach: {data.breakdown?.outreachImpact}/15</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 flex flex-col justify-between relative">
      {/* Header & Controls */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#DDE6E0] dark:border-[#1E3129]">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] tracking-tight">
            Rural Mart Performance
          </h2>
          {/* Methodology Info Tooltip Button */}
          <div className="relative">
            <button
              onClick={() => setShowMethodologyPopover(!showMethodologyPopover)}
              onMouseEnter={() => setShowMethodologyPopover(true)}
              onMouseLeave={() => setShowMethodologyPopover(false)}
              className="text-[#8A958F] hover:text-[#174F3A] dark:text-[#61736A] dark:hover:text-[#A3E6C5] p-1 rounded-full transition-colors"
              title="View Score Methodology Weightings"
            >
              <Info className="w-3.5 h-3.5" />
            </button>

            {/* Methodology Popover */}
            {showMethodologyPopover && (
              <div className="absolute left-0 top-6 w-64 bg-[#17221D] text-white dark:bg-[#16241E] dark:text-[#E6ECE8] p-3 rounded-xl shadow-lg z-50 text-[11px] leading-relaxed border border-[#34735A]">
                <p className="font-bold text-xs text-[#A3E6C5] mb-1.5 border-b border-[#34735A]/50 pb-1">
                  Overall Score Methodology:
                </p>
                <ul className="space-y-1 text-[#E6ECE8]">
                  <li className="flex justify-between">
                    <span>Sales growth:</span> <strong className="text-[#A3E6C5]">20%</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Profitability:</span> <strong className="text-[#A3E6C5]">20%</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Farmer engagement:</span> <strong className="text-[#A3E6C5]">20%</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Outreach impact:</span> <strong className="text-[#8ECAAA]">15%</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Inventory health:</span> <strong className="text-[#8ECAAA]">15%</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Data compliance:</span> <strong className="text-[#FBBF24]">10%</strong>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Sort Control */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3 h-3 text-[#8A958F]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-[11px] font-semibold bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] border border-[#DDE6E0] dark:border-[#1E3129] rounded-lg px-2 py-1 focus:outline-none"
          >
            <option value="Highest Score">Highest Score</option>
            <option value="Lowest Score">Lowest Score</option>
            <option value="Name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 md:h-80 relative">
        {chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-[#66736C] dark:text-[#8E9E96] italic bg-[#F8FAF7] dark:bg-[#16241E] rounded-xl border border-[#DDE6E0]/50 dark:border-[#1E3129]/50">
            No rural marts performance data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

              <XAxis
                dataKey="name"
                tick={{ fill: textColor, fontSize: 11, fontWeight: 600 }}
                axisLine={{ stroke: gridColor }}
                tickLine={false}
              />

              <YAxis
                domain={[0, 100]}
                tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                ticks={[0, 20, 40, 60, 80, 100]}
              />

              <Tooltip content={<CustomBarTooltip />} />

              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
              />

              {/* Performance Score Bar */}
              <Bar
                dataKey="score"
                name="Performance Score"
                fill={barColor}
                radius={[6, 6, 0, 0]}
                barSize={28}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.score >= 85
                        ? isDark ? '#8ECAAA' : '#174F3A'
                        : entry.score >= 70
                        ? isDark ? '#A3E6C5' : '#34735A'
                        : isDark ? '#FBBF24' : '#D97706'
                    }
                  />
                ))}
              </Bar>

              {/* Circular Marker above bar representing Target Score */}
              <Scatter
                dataKey="targetScore"
                name="Target Score (Dot)"
                fill={targetDotColor}
                shape="circle"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
