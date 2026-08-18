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
import { InventoryMovementDataPoint, Theme } from '../../../shared/types';

interface InventoryMovementLineChartProps {
  theme: Theme;
  data: InventoryMovementDataPoint[];
}

export const InventoryMovementLineChart: React.FC<InventoryMovementLineChartProps> = ({ theme, data }) => {
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1f3327' : '#e2e8f0';
  const textColor = isDark ? '#9ca3af' : '#64748b';

  // Colors
  const closingColor = isDark ? '#34d399' : '#059669'; // Emerald
  const procurementColor = isDark ? '#38bdf8' : '#0284c7'; // Sky
  const salesColor = isDark ? '#f59e0b' : '#d97706'; // Amber
  const openingColor = isDark ? '#a855f7' : '#7e22ce'; // Purple

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white dark:bg-emerald-950/95 dark:text-emerald-50 border border-slate-700 dark:border-emerald-700/60 p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[220px]">
          <div className="font-bold text-sm text-emerald-400 border-b border-slate-800 dark:border-emerald-800 pb-1 flex justify-between items-center">
            <span>{label} 2026 Movement</span>
            <span className="text-[10px] text-slate-400">Unit Flow</span>
          </div>
          <div className="flex items-center justify-between text-purple-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
              Opening Stock:
            </span>
            <span className="font-mono">{data.openingStock.toLocaleString('en-IN')} Units</span>
          </div>
          <div className="flex items-center justify-between text-sky-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
              Procurement (In):
            </span>
            <span className="font-mono">+{data.procurement.toLocaleString('en-IN')} Units</span>
          </div>
          <div className="flex items-center justify-between text-amber-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Sales (Out):
            </span>
            <span className="font-mono">-{data.sales.toLocaleString('en-IN')} Units</span>
          </div>
          <div className="flex items-center justify-between text-emerald-300 font-bold border-t border-slate-800 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Closing Stock:
            </span>
            <span className="font-mono text-sm">{data.closingStock.toLocaleString('en-IN')} Units</span>
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
            Inventory Movement
          </h3>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full h-72 md:h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

            <Line
              type="monotone"
              dataKey="closingStock"
              name="Closing Stock"
              stroke={closingColor}
              strokeWidth={3}
              dot={{ r: 4, fill: closingColor }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="openingStock"
              name="Opening Stock"
              stroke={openingColor}
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={{ r: 3, fill: openingColor }}
            />
            <Line
              type="monotone"
              dataKey="procurement"
              name="Procurement"
              stroke={procurementColor}
              strokeWidth={2}
              dot={{ r: 3, fill: procurementColor }}
            />
            <Line
              type="monotone"
              dataKey="sales"
              name="Sales Qty"
              stroke={salesColor}
              strokeWidth={2}
              dot={{ r: 3, fill: salesColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
