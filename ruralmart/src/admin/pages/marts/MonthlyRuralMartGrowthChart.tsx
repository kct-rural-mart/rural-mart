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
import { MONTHLY_MART_GROWTH_DATA } from '../../../mockData';

interface MonthlyRuralMartGrowthChartProps {
  theme: Theme;
}

export const MonthlyRuralMartGrowthChart: React.FC<MonthlyRuralMartGrowthChartProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1f3327' : '#e2e8f0';
  const textColor = isDark ? '#9ca3af' : '#64748b';

  const activeColor = isDark ? '#34d399' : '#059669'; // Emerald
  const salesColor = isDark ? '#a855f7' : '#7e22ce'; // Purple
  const scoreColor = isDark ? '#38bdf8' : '#0284c7'; // Sky

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white dark:bg-emerald-950/95 dark:text-emerald-50 border border-slate-700 dark:border-emerald-700/60 p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[220px]">
          <div className="font-bold text-sm text-emerald-400 border-b border-slate-800 dark:border-emerald-800 pb-1 flex justify-between items-center">
            <span>{label} 2026 Network Growth</span>
            <span className="text-[10px] text-slate-400">Monthly Snapshot</span>
          </div>
          <div className="flex items-center justify-between text-emerald-300 font-bold">
            <span>Active Rural Marts:</span>
            <span className="font-mono">{data.activeMarts} / {data.totalMarts} Outposts</span>
          </div>
          <div className="flex items-center justify-between text-purple-300 font-bold">
            <span>Network Sales Volume:</span>
            <span className="font-mono">₹{data.networkSalesCr.toFixed(2)} Cr</span>
          </div>
          <div className="flex items-center justify-between text-sky-300 font-bold border-t border-slate-800 pt-1">
            <span>Average Score Index:</span>
            <span className="font-mono">{data.avgScore} / 100</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-emerald-900/30">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-emerald-50 tracking-tight">
            Monthly Rural Mart Growth
          </h3>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full h-72 md:h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={MONTHLY_MART_GROWTH_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="period"
              tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              domain={[0, 15]}
              tick={{ fill: textColor, fontSize: 10, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 3]}
              tick={{ fill: textColor, fontSize: 10, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v}Cr`}
            />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="activeMarts"
              name="Active Marts"
              stroke={activeColor}
              strokeWidth={3}
              dot={{ r: 4, fill: activeColor }}
              activeDot={{ r: 7 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="networkSalesCr"
              name="Network Sales (₹Cr)"
              stroke={salesColor}
              strokeWidth={3}
              dot={{ r: 4, fill: salesColor }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="avgScore"
              name="Avg Score (scaled)"
              stroke={scoreColor}
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={{ r: 3, fill: scoreColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
