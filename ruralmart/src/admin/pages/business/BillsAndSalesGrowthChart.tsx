import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Theme } from '../../../shared/types';
import { BILLS_GROWTH_DATA } from '../../../mockData';

interface BillsAndSalesGrowthChartProps {
  theme: Theme;
}

export const BillsAndSalesGrowthChart: React.FC<BillsAndSalesGrowthChartProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1E3129' : '#DDE6E0';
  const textColor = isDark ? '#8E9E96' : '#66736C';

  // Colors
  const billsBarColor = isDark ? '#60A5FA' : '#2563EB'; // Blue
  const growthLineColor = isDark ? '#FBBF24' : '#D97706'; // Amber / Accent

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#17221D] text-white dark:bg-[#16241E] dark:text-[#E6ECE8] border border-[#34735A] p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
          <div className="font-bold text-sm text-[#A3E6C5] border-b border-[#34735A] pb-1 flex justify-between items-center">
            <span>{label} 2026 Volume</span>
            <span className="text-[10px] text-[#8E9E96]">Transaction Pulse</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              Total Bills Generated:
            </span>
            <span className="font-bold">{data.bills.toLocaleString('en-IN')} Bills</span>
          </div>
          <div className="flex items-center justify-between text-[#FBBF24] border-t border-[#34735A] pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              MoM Sales Growth %:
            </span>
            <span className="font-bold">+{data.growthPercent}%</span>
          </div>
          <div className="flex items-center justify-between text-[#8E9E96] text-[10px]">
            <span>Avg Bill Size:</span>
            <span className="text-[#E6ECE8]">₹{data.avgBillValue}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#DDE6E0] dark:border-[#1E3129]">
        <div>
          <h3 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] tracking-tight">
            Bills & Sales Growth
          </h3>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full h-72 md:h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={BILLS_GROWTH_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="period"
              tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
            />
            {/* Left Y-Axis for Number of Bills */}
            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}`}
            />
            {/* Right Y-Axis for Growth % */}
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

            <Bar
              yAxisId="left"
              dataKey="bills"
              name="Number of Bills"
              fill={billsBarColor}
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="growthPercent"
              name="Sales Growth %"
              stroke={growthLineColor}
              strokeWidth={3}
              dot={{ r: 4, fill: growthLineColor }}
              activeDot={{ r: 7 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
