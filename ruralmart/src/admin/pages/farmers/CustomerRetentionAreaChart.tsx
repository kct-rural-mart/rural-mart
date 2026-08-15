import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Theme } from '../../../shared/types';
import { CUSTOMER_RETENTION_DATA } from '../../../mockData';

interface CustomerRetentionAreaChartProps {
  theme: Theme;
}

export const CustomerRetentionAreaChart: React.FC<CustomerRetentionAreaChartProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1E3129' : '#DDE6E0';
  const textColor = isDark ? '#8E9E96' : '#66736C';

  // Area colors
  const strokeColor = isDark ? '#8ECAAA' : '#174F3A'; // Primary Green

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#17221D] text-white dark:bg-[#16241E] dark:text-[#E6ECE8] border border-[#34735A] p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
          <div className="font-bold text-sm text-[#A3E6C5] border-b border-[#34735A] pb-1 flex justify-between items-center">
            <span>{label} Retention</span>
            <span className="text-[10px] text-[#8E9E96]">Customer Loyalty</span>
          </div>
          <div className="flex items-center justify-between text-[#A3E6C5] font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#174F3A] dark:bg-[#8ECAAA] inline-block" />
              Retention Rate %:
            </span>
            <span className="text-sm">{data.retentionRate}%</span>
          </div>
          <div className="flex items-center justify-between text-[#E6ECE8]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8E9E96] inline-block" />
              Repeat Footfall:
            </span>
            <span>{data.repeatVisitCount.toLocaleString('en-IN')} Visits</span>
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
            4. Customer Retention Trend
          </h3>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full h-72 md:h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CUSTOMER_RETENTION_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="period"
              tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
            />
            <YAxis
              domain={[50, 100]}
              tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

            <Area
              type="monotone"
              dataKey="retentionRate"
              name="Retention Rate %"
              stroke={strokeColor}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#retentionGradient)"
              dot={{ r: 4, fill: strokeColor }}
              activeDot={{ r: 7 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
