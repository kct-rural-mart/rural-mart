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
import { Theme } from '../../../shared/types';
import { FARMER_GROWTH_TREND } from '../../../mockData';

interface FarmerGrowthLineChartProps {
  theme: Theme;
}

export const FarmerGrowthLineChart: React.FC<FarmerGrowthLineChartProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1E3129' : '#DDE6E0';
  const textColor = isDark ? '#8E9E96' : '#66736C';

  // Colors
  const registeredColor = isDark ? '#8ECAAA' : '#174F3A'; // Primary Green
  const repeatColor = isDark ? '#A3E6C5' : '#34735A'; // Medium Green
  const newColor = isDark ? '#C2F0D9' : '#5A8F77'; // Light Green Accent

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#17221D] text-white dark:bg-[#16241E] dark:text-[#E6ECE8] border border-[#34735A] p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
          <div className="font-bold text-sm text-[#A3E6C5] border-b border-[#34735A] pb-1 flex justify-between items-center">
            <span>{label} 2026 Trend</span>
            <span className="text-[10px] text-[#8E9E96]">Cumulative Base</span>
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
            2. Farmer Growth Trend
          </h3>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full h-72 md:h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={FARMER_GROWTH_TREND} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

            <Line
              type="monotone"
              dataKey="registeredFarmers"
              name="Total Registered"
              stroke={registeredColor}
              strokeWidth={3}
              dot={{ r: 4, fill: registeredColor }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="repeatFarmers"
              name="Repeat Active"
              stroke={repeatColor}
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: repeatColor }}
            />
            <Line
              type="monotone"
              dataKey="newFarmers"
              name="New Farmers"
              stroke={newColor}
              strokeWidth={2}
              dot={{ r: 3, fill: newColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
