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
import { Theme, TopProductDataPoint } from '../../../shared/types';

interface Top10ProductsBarChartProps {
  theme: Theme;
  products: TopProductDataPoint[];
}

export const Top10ProductsBarChart: React.FC<Top10ProductsBarChartProps> = ({ theme, products }) => {
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1f3327' : '#e2e8f0';
  const textColor = isDark ? '#9ca3af' : '#64748b';

  // Sort ascending for horizontal bar stack
  const data = [...products].reverse();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white dark:bg-emerald-950/95 dark:text-emerald-50 border border-slate-700 dark:border-emerald-700/60 p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[220px]">
          <div className="font-bold text-sm text-emerald-400 border-b border-slate-800 dark:border-emerald-800 pb-1 flex justify-between items-center">
            <span>{item.name}</span>
            <span className="text-[10px] text-slate-400">{item.category}</span>
          </div>
          <div className="flex items-center justify-between text-slate-200">
            <span className="font-medium">Total Sales Volume:</span>
            <span className="font-mono font-bold">{item.salesQty.toLocaleString('en-IN')} Units</span>
          </div>
          <div className="flex items-center justify-between text-emerald-300 font-bold border-t border-slate-800 pt-1">
            <span>Generated Revenue:</span>
            <span className="font-mono text-sm">₹{(item.revenue / 100000).toFixed(2)} Lakhs</span>
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
            Top 10 Products
          </h3>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full h-72 md:h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: textColor, fontSize: 10, fontWeight: 500 }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tick={{ fill: textColor, fontSize: 10, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />

            <Bar dataKey="salesQty" radius={[0, 4, 4, 0]} barSize={14}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    index === data.length - 1
                      ? isDark
                        ? '#34d399'
                        : '#059669'
                      : index >= data.length - 3
                      ? isDark
                        ? '#38bdf8'
                        : '#0284c7'
                      : isDark
                      ? '#6ee7b7'
                      : '#10b981'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
