import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { OutreachPerformanceDataPoint, Theme } from '../../../shared/types';

interface OutreachPerformanceBarChartProps {
  theme: Theme;
  data: OutreachPerformanceDataPoint[];
}

export const OutreachPerformanceBarChart: React.FC<OutreachPerformanceBarChartProps> = ({ theme, data }) => {
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1E3129' : '#DDE6E0';
  const textColor = isDark ? '#8E9E96' : '#66736C';

  // Bar colors with enterprise green palette
  const farmersReachedColor = isDark ? '#A3E6C5' : '#174F3A';
  const programsColor = isDark ? '#8ECAAA' : '#34735A';
  const villagesColor = isDark ? '#34735A' : '#103A2B';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#17221D] text-white dark:bg-[#16241E] dark:text-[#E6ECE8] border border-[#34735A] p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px] pointer-events-none select-none">
          <div className="font-bold text-sm text-[#A3E6C5] border-b border-[#34735A] pb-1 flex justify-between items-center">
            <span>{label} Outreach Impact</span>
            <span className="text-[10px] text-[#8E9E96]">Campaign Metrics</span>
          </div>
          <div className="flex items-center justify-between text-[#A3E6C5] font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#174F3A] dark:bg-[#A3E6C5] inline-block" />
              Farmers Reached:
            </span>
            <span>{data.farmersReached.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between text-[#E6ECE8] font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34735A] dark:bg-[#8ECAAA] inline-block" />
              Programs Conducted:
            </span>
            <span>{data.programsConducted}</span>
          </div>
          <div className="flex items-center justify-between text-[#8ECAAA] font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#103A2B] dark:bg-[#34735A] inline-block" />
              Villages Covered:
            </span>
            <span>{data.villagesCovered}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#DDE6E0] dark:border-[#1E3129]">
        <div>
          <h3 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] tracking-tight">
            Outreach Performance
          </h3>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full h-72 md:h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="period"
              tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ pointerEvents: 'none', outline: 'none' }}
              isAnimationActive={false}
              cursor={{ fill: isDark ? 'rgba(163, 230, 197, 0.05)' : 'rgba(23, 79, 58, 0.05)' }}
            />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

            <Bar dataKey="farmersReached" name="Farmers Reached" fill={farmersReachedColor} radius={[4, 4, 0, 0]} barSize={14} isAnimationActive={false} />
            <Bar dataKey="programsConducted" name="Programs Conducted" fill={programsColor} radius={[4, 4, 0, 0]} barSize={14} isAnimationActive={false} />
            <Bar dataKey="villagesCovered" name="Villages Covered" fill={villagesColor} radius={[4, 4, 0, 0]} barSize={14} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
