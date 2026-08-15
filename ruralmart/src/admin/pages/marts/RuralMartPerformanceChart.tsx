import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Theme, RuralMartData } from '../../../shared/types';

interface RuralMartPerformanceChartProps {
  theme: Theme;
  marts: RuralMartData[];
}

export const RuralMartPerformanceChart: React.FC<RuralMartPerformanceChartProps> = ({
  theme,
  marts,
}) => {
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1f3327' : '#e2e8f0';
  const textColor = isDark ? '#9ca3af' : '#64748b';

  // Sort marts by score ascending so highest is at top in horizontal layout
  const chartData = [...marts].sort((a, b) => a.score - b.score);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const mart: RuralMartData = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white dark:bg-emerald-950/95 dark:text-emerald-50 border border-slate-700 dark:border-emerald-700/60 p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[220px]">
          <div className="font-bold text-sm text-emerald-400 border-b border-slate-800 dark:border-emerald-800 pb-1 flex justify-between items-center">
            <span>{mart.name} Rural Mart</span>
            <span className="text-[10px] text-slate-400">{mart.district}</span>
          </div>
          <div className="flex items-center justify-between text-slate-200">
            <span>Composite Score:</span>
            <span className="font-mono font-bold text-emerald-300">{mart.score} / 100</span>
          </div>
          <div className="flex items-center justify-between text-slate-200">
            <span>Sales Revenue:</span>
            <span className="font-mono font-bold">₹{(mart.salesRaw / 100000).toFixed(1)} Lakhs</span>
          </div>
          <div className="flex items-center justify-between text-slate-200">
            <span>Reg. Farmers:</span>
            <span className="font-mono">{mart.registeredFarmers.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-800 pt-1 text-[11px]">
            <span>Mart Status:</span>
            <span
              className={`font-bold ${
                mart.status === 'Active'
                  ? 'text-emerald-400'
                  : mart.status === 'Delayed'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {mart.status}
            </span>
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
            Rural Mart Performance Comparison
          </h3>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full h-72 md:h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 25, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: textColor, fontSize: 10, fontWeight: 500 }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
              tickFormatter={(v) => `${v}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fill: textColor, fontSize: 10, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />

            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={14}>
              {chartData.map((entry, index) => {
                const color =
                  entry.status === 'Active'
                    ? isDark
                      ? '#34d399'
                      : '#059669'
                    : entry.status === 'Delayed'
                    ? isDark
                      ? '#f59e0b'
                      : '#d97706'
                    : isDark
                    ? '#f43f5e'
                    : '#e11d48';

                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
