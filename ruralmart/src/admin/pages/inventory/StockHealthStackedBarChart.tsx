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
import { STOCK_HEALTH_BY_MART } from '../../../mockData';

interface StockHealthStackedBarChartProps {
  theme: Theme;
}

export const StockHealthStackedBarChart: React.FC<StockHealthStackedBarChartProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1f3327' : '#e2e8f0';
  const textColor = isDark ? '#9ca3af' : '#64748b';

  // Colors
  const healthyColor = isDark ? '#34d399' : '#059669'; // Emerald
  const lowStockColor = isDark ? '#f59e0b' : '#d97706'; // Amber
  const outOfStockColor = isDark ? '#f43f5e' : '#e11d48'; // Rose

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const totalSKUs = data.healthy + data.lowStock + data.outOfStock;
      return (
        <div className="bg-slate-900/95 text-white dark:bg-emerald-950/95 dark:text-emerald-50 border border-slate-700 dark:border-emerald-700/60 p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
          <div className="font-bold text-sm text-emerald-400 border-b border-slate-800 dark:border-emerald-800 pb-1 flex justify-between items-center">
            <span>{label} Rural Mart</span>
            <span className="text-[10px] text-slate-400">{totalSKUs} Total SKUs</span>
          </div>
          <div className="flex items-center justify-between text-emerald-300 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Healthy Stock:
            </span>
            <span className="font-mono">{data.healthy} SKUs</span>
          </div>
          <div className="flex items-center justify-between text-amber-300 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Low Stock Alert:
            </span>
            <span className="font-mono">{data.lowStock} SKUs</span>
          </div>
          <div className="flex items-center justify-between text-rose-300 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              Out of Stock:
            </span>
            <span className="font-mono">{data.outOfStock} SKUs</span>
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
            Stock Health Breakdown
          </h3>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full h-72 md:h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={STOCK_HEALTH_BY_MART} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="ruralMart"
              tick={{ fill: textColor, fontSize: 10, fontWeight: 500 }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: textColor, fontSize: 10, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

            <Bar dataKey="healthy" name="Healthy" stackId="stock" fill={healthyColor} radius={[0, 0, 0, 0]} barSize={18} />
            <Bar dataKey="lowStock" name="Low Stock" stackId="stock" fill={lowStockColor} radius={[0, 0, 0, 0]} barSize={18} />
            <Bar dataKey="outOfStock" name="Out of Stock" stackId="stock" fill={outOfStockColor} radius={[4, 4, 0, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
