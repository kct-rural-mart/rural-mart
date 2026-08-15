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
import { DISTRICT_PERFORMANCE_DATA } from '../../../mockData';

interface DistrictWisePerformanceChartProps {
  theme: Theme;
}

export const DistrictWisePerformanceChart: React.FC<DistrictWisePerformanceChartProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1f3327' : '#e2e8f0';
  const textColor = isDark ? '#9ca3af' : '#64748b';

  const salesColor = isDark ? '#34d399' : '#059669'; // Emerald
  const scoreColor = isDark ? '#38bdf8' : '#0284c7'; // Sky

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white dark:bg-emerald-950/95 dark:text-emerald-50 border border-slate-700 dark:border-emerald-700/60 p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
          <div className="font-bold text-sm text-emerald-400 border-b border-slate-800 dark:border-emerald-800 pb-1 flex justify-between items-center">
            <span>{label} District</span>
            <span className="text-[10px] text-slate-400">{data.martsCount} Marts ({data.activeCount} Active)</span>
          </div>
          <div className="flex items-center justify-between text-emerald-300 font-bold">
            <span>Total District Sales:</span>
            <span className="font-mono">₹{data.totalSalesLakhs.toFixed(1)} Lakhs</span>
          </div>
          <div className="flex items-center justify-between text-sky-300 font-bold">
            <span>Average Score:</span>
            <span className="font-mono">{data.avgScore} / 100</span>
          </div>
          <div className="flex items-center justify-between text-slate-300 border-t border-slate-800 pt-1">
            <span>Registered Farmers:</span>
            <span className="font-mono">{data.registeredFarmers.toLocaleString('en-IN')}</span>
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
            District-wise Performance
          </h3>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full h-72 md:h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DISTRICT_PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="district"
              tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: textColor, fontSize: 10, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v}L`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tick={{ fill: textColor, fontSize: 10, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}pt`}
            />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

            <Bar yAxisId="left" dataKey="totalSalesLakhs" name="District Sales (₹L)" fill={salesColor} radius={[4, 4, 0, 0]} barSize={22} />
            <Bar yAxisId="right" dataKey="avgScore" name="Avg Score Index" fill={scoreColor} radius={[4, 4, 0, 0]} barSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
