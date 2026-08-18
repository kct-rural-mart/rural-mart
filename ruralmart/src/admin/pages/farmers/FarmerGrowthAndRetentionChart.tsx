import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { FarmerGrowthDataPoint, Theme } from '../../../shared/types';

interface FarmerGrowthAndRetentionChartProps {
  theme: Theme;
  data: FarmerGrowthDataPoint[];
}

export const FarmerGrowthAndRetentionChart: React.FC<FarmerGrowthAndRetentionChartProps> = ({ theme, data }) => {
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1E3129' : '#DDE6E0';
  const textColor = isDark ? '#8E9E96' : '#66736C';

  // Colors preserved from existing charts + distinguished styling
  const registeredColor = isDark ? '#8ECAAA' : '#174F3A'; // Primary Green
  const repeatColor = isDark ? '#A3E6C5' : '#34735A'; // Medium Green
  const newColor = isDark ? '#C2F0D9' : '#5A8F77'; // Light Green Accent
  const retentionColor = isDark ? '#FBBF24' : '#D97706'; // Amber Gold for Retention %

  // Merge data sets by month period
  const combinedData = data.map((growth) => ({ ...growth, retentionRate: growth.newFarmers + growth.repeatFarmers > 0 ? Math.round((growth.repeatFarmers / (growth.newFarmers + growth.repeatFarmers)) * 1000) / 10 : 0 }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#17221D] text-white dark:bg-[#16241E] dark:text-[#E6ECE8] border border-[#34735A] p-3 rounded-xl shadow-xl text-xs space-y-2 min-w-[230px] pointer-events-none select-none">
          <div className="font-bold text-sm text-[#A3E6C5] border-b border-[#34735A] pb-1 flex justify-between items-center">
            <span>{label} 2026 Metrics</span>
            <span className="text-[10px] text-[#8E9E96]">Growth & Retention</span>
          </div>
          <div className="flex items-center justify-between text-[#A3E6C5] font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#174F3A] dark:bg-[#8ECAAA] inline-block" />
              Total Registered:
            </span>
            <span>{data.registeredFarmers.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between text-[#E6ECE8]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34735A] dark:bg-[#A3E6C5] inline-block" />
              Repeat Active:
            </span>
            <span>{data.repeatFarmers.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between text-[#8E9E96]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5A8F77] dark:bg-[#C2F0D9] inline-block" />
              New Registrations:
            </span>
            <span>+{data.newFarmers.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between text-amber-400 font-bold pt-1 border-t border-[#34735A]/50">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Retention Rate %:
            </span>
            <span>{data.retentionRate}%</span>
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
            Farmer Growth & Customer Retention Trend
          </h3>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full h-72 md:h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combinedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="period"
              tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
            />
            {/* Left Y-Axis: Farmer Count */}
            <YAxis
              yAxisId="left"
              tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            />
            {/* Right Y-Axis: Retention % */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[50, 100]}
              tick={{ fill: isDark ? '#FBBF24' : '#D97706', fontSize: 11, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ pointerEvents: 'none', outline: 'none' }}
              isAnimationActive={false}
            />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

            {/* Total Registered Line */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="registeredFarmers"
              name="Total Registered"
              stroke={registeredColor}
              strokeWidth={3}
              dot={{ r: 4, fill: registeredColor }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
            {/* Repeat Active Line */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="repeatFarmers"
              name="Repeat Active"
              stroke={repeatColor}
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: repeatColor }}
              isAnimationActive={false}
            />
            {/* New Farmers Line */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="newFarmers"
              name="New Farmers"
              stroke={newColor}
              strokeWidth={2}
              dot={{ r: 3, fill: newColor }}
              isAnimationActive={false}
            />
            {/* Retention Rate % Line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="retentionRate"
              name="Retention Rate %"
              stroke={retentionColor}
              strokeWidth={2.5}
              dot={{ r: 4, fill: retentionColor }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
