import React, { useState } from 'react';
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
import { MartFinancialRecord, Theme } from '../../../shared/types';

interface MartFinancialComparisonChartProps {
  financialMarts: MartFinancialRecord[];
  theme: Theme;
}

type Mode = 'Sales & Net Profit' | 'Profit Margin %';

export const MartFinancialComparisonChart: React.FC<MartFinancialComparisonChartProps> = ({
  financialMarts,
  theme,
}) => {
  const [mode, setMode] = useState<Mode>('Sales & Net Profit');

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1E3129' : '#DDE6E0';
  const textColor = isDark ? '#8E9E96' : '#66736C';

  // Bar colors
  const salesColor = isDark ? '#8ECAAA' : '#174F3A'; // Primary Green
  const netProfitColor = isDark ? '#A3E6C5' : '#34735A'; // Accent Green
  const marginColor = isDark ? '#FBBF24' : '#D97706'; // Amber

  // Filter out inactive marts with 0 sales for a tighter comparative bar view, or sort by sales
  const chartData = financialMarts
    .filter((m) => m.salesRaw > 0)
    .map((m) => ({
      name: m.name,
      district: m.district,
      salesLakhs: parseFloat((m.salesRaw / 100000).toFixed(1)),
      netProfitLakhs: parseFloat((m.netProfitRaw / 100000).toFixed(2)),
      profitMargin: m.profitMargin,
    }))
    .sort((a, b) => b.salesLakhs - a.salesLakhs);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#17221D] text-white dark:bg-[#16241E] dark:text-[#E6ECE8] border border-[#34735A] p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
          <div className="font-bold text-sm text-[#A3E6C5] border-b border-[#34735A] pb-1 flex justify-between items-center">
            <span>{label} Hub</span>
            <span className="text-[10px] text-[#8E9E96]">{data.district} District</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Total Sales:</span>
            <span className="font-bold">₹{data.salesLakhs} Lakhs</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Net Profit:</span>
            <span className="font-bold text-[#A3E6C5]">₹{data.netProfitLakhs} Lakhs</span>
          </div>
          <div className="flex items-center justify-between text-[#FBBF24] border-t border-[#34735A] pt-1">
            <span className="font-medium">Profit Margin:</span>
            <span className="font-bold">{data.profitMargin}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#DDE6E0] dark:border-[#1E3129]">
        <div>
          <h3 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] tracking-tight">
            Rural Mart Financial Comparison
          </h3>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-[#F8FAF7] dark:bg-[#16241E] p-0.5 rounded-lg border border-[#DDE6E0] dark:border-[#1E3129]">
          {(['Sales & Net Profit', 'Profit Margin %'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                mode === m
                  ? 'bg-[#174F3A] dark:bg-[#1B3D30] text-white dark:text-[#A3E6C5] shadow-xs'
                  : 'text-[#66736C] dark:text-[#8E9E96] hover:text-[#17221D] dark:hover:text-[#E6ECE8]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full h-72 md:h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
              tickFormatter={(v) => (mode === 'Profit Margin %' ? `${v}%` : `₹${v}L`)}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: textColor, fontSize: 11, fontWeight: 600 }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

            {mode === 'Sales & Net Profit' ? (
              <>
                <Bar dataKey="salesLakhs" name="Sales (₹ L)" fill={salesColor} radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="netProfitLakhs" name="Net Profit (₹ L)" fill={netProfitColor} radius={[0, 4, 4, 0]} barSize={12} />
              </>
            ) : (
              <Bar dataKey="profitMargin" name="Profit Margin %" fill={marginColor} radius={[0, 4, 4, 0]} barSize={18} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
