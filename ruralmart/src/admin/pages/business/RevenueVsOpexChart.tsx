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
import { Theme } from '../../../shared/types';
import { REVENUE_OPEX_DATA } from '../../../mockData';

interface RevenueVsOpexChartProps {
  theme: Theme;
}

export const RevenueVsOpexChart: React.FC<RevenueVsOpexChartProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1E3129' : '#DDE6E0';
  const textColor = isDark ? '#8E9E96' : '#66736C';

  // Stack Colors
  const cogsColor = isDark ? '#60A5FA' : '#2563EB'; // Blue COGS
  const opexColor = isDark ? '#FBBF24' : '#D97706'; // Amber Opex
  const profitColor = isDark ? '#8ECAAA' : '#174F3A'; // Primary Green Net Profit

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#17221D] text-white dark:bg-[#16241E] dark:text-[#E6ECE8] border border-[#34735A] p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
          <div className="font-bold text-sm text-[#A3E6C5] border-b border-[#34735A] pb-1 flex justify-between items-center">
            <span>{label} 2026 Breakdown</span>
            <span className="text-[10px] text-[#8E9E96]">Total: ₹{data.revenue} L</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              COGS (Procurement):
            </span>
            <span className="font-bold">₹{data.cogs} Lakhs</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Operating Expenses:
            </span>
            <span className="font-bold">₹{data.opex} Lakhs</span>
          </div>
          <div className="flex items-center justify-between text-[#A3E6C5] border-t border-[#34735A] pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#174F3A] dark:bg-[#8ECAAA] inline-block" />
              Net Profit Realized:
            </span>
            <span className="font-bold">₹{data.netProfit} Lakhs</span>
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
            Revenue vs Operating Expenses
          </h3>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 md:h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={REVENUE_OPEX_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
              tickFormatter={(v) => `₹${v}L`}
            />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

            <Bar dataKey="cogs" name="COGS" stackId="revenueStack" fill={cogsColor} radius={[0, 0, 0, 0]} />
            <Bar dataKey="opex" name="Operating Expenses" stackId="revenueStack" fill={opexColor} radius={[0, 0, 0, 0]} />
            <Bar dataKey="netProfit" name="Net Profit" stackId="revenueStack" fill={profitColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
