import React, { useState } from 'react';
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
import { FINANCIAL_TREND_DATA } from '../../../mockData';

interface FinancialTrendChartProps {
  theme: Theme;
}

type SelectedMetric = 'All' | 'Sales' | 'Procurement' | 'Gross Profit' | 'Net Profit';

export const FinancialTrendChart: React.FC<FinancialTrendChartProps> = ({ theme }) => {
  const [selectedMetric, setSelectedMetric] = useState<SelectedMetric>('All');

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1E3129' : '#DDE6E0';
  const textColor = isDark ? '#8E9E96' : '#66736C';

  // Line Colors
  const salesColor = isDark ? '#8ECAAA' : '#174F3A'; // Primary Green
  const procurementColor = isDark ? '#60A5FA' : '#2563EB'; // Blue
  const grossProfitColor = isDark ? '#2DD4BF' : '#0D9488'; // Teal
  const netProfitColor = isDark ? '#FBBF24' : '#D97706'; // Amber

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#17221D] text-white dark:bg-[#16241E] dark:text-[#E6ECE8] border border-[#34735A] p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
          <div className="font-bold text-sm text-[#A3E6C5] border-b border-[#34735A] pb-1 flex justify-between items-center">
            <span>{label} 2026</span>
            <span className="text-[10px] font-normal text-[#8E9E96]">P&L Financials</span>
          </div>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                <span className="font-medium text-[#E6ECE8]">{entry.name}:</span>
              </div>
              <span className="font-bold">₹{entry.value} Lakhs</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 flex flex-col justify-between">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#DDE6E0] dark:border-[#1E3129]">
        <div>
          <h3 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] tracking-tight">
            Financial Trend
          </h3>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex flex-wrap items-center bg-[#F8FAF7] dark:bg-[#16241E] p-0.5 rounded-lg border border-[#DDE6E0] dark:border-[#1E3129]">
          {(['All', 'Sales', 'Procurement', 'Gross Profit', 'Net Profit'] as SelectedMetric[]).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMetric(m)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                selectedMetric === m
                  ? 'bg-[#174F3A] dark:bg-[#1B3D30] text-white dark:text-[#A3E6C5] shadow-xs'
                  : 'text-[#66736C] dark:text-[#8E9E96] hover:text-[#17221D] dark:hover:text-[#E6ECE8]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 md:h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={FINANCIAL_TREND_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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

            {(selectedMetric === 'All' || selectedMetric === 'Sales') && (
              <Line
                type="monotone"
                dataKey="sales"
                name="Sales"
                stroke={salesColor}
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: salesColor }}
                activeDot={{ r: 6 }}
              />
            )}

            {(selectedMetric === 'All' || selectedMetric === 'Procurement') && (
              <Line
                type="monotone"
                dataKey="procurement"
                name="Procurement"
                stroke={procurementColor}
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: procurementColor }}
                activeDot={{ r: 6 }}
              />
            )}

            {(selectedMetric === 'All' || selectedMetric === 'Gross Profit') && (
              <Line
                type="monotone"
                dataKey="grossProfit"
                name="Gross Profit"
                stroke={grossProfitColor}
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: grossProfitColor }}
                activeDot={{ r: 6 }}
              />
            )}

            {(selectedMetric === 'All' || selectedMetric === 'Net Profit') && (
              <Line
                type="monotone"
                dataKey="netProfit"
                name="Net Profit"
                stroke={netProfitColor}
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: netProfitColor }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
