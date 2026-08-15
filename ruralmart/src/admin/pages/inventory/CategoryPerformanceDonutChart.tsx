import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Theme } from '../../../shared/types';
import { PRODUCT_CATEGORY_PERFORMANCE } from '../../../mockData';

interface CategoryPerformanceDonutChartProps {
  theme: Theme;
}

export const CategoryPerformanceDonutChart: React.FC<CategoryPerformanceDonutChartProps> = ({
  theme,
}) => {
  const isDark = theme === 'dark';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white dark:bg-emerald-950/95 dark:text-emerald-50 border border-slate-700 dark:border-emerald-700/60 p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
          <div className="font-bold text-sm text-emerald-400 border-b border-slate-800 dark:border-emerald-800 pb-1 flex justify-between items-center">
            <span>{data.name}</span>
            <span className="text-[10px] text-slate-400">Share Ratio</span>
          </div>
          <div className="flex items-center justify-between text-slate-200">
            <span className="font-medium">Gross Revenue:</span>
            <span className="font-mono font-bold">₹{(data.value / 100000).toFixed(2)} Lakhs</span>
          </div>
          <div className="flex items-center justify-between text-emerald-300 font-bold border-t border-slate-800 pt-1">
            <span>Market Share:</span>
            <span className="font-mono">{data.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[10px] font-black fill-white drop-shadow-md"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-emerald-900/30">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-emerald-50 tracking-tight">
            Product Category Performance
          </h3>
        </div>
      </div>

      {/* Donut Canvas */}
      <div className="w-full h-72 md:h-80 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />
            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
            />
            <Pie
              data={PRODUCT_CATEGORY_PERFORMANCE}
              cx="50%"
              cy="45%"
              innerRadius={62}
              outerRadius={98}
              paddingAngle={4}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {PRODUCT_CATEGORY_PERFORMANCE.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke={isDark ? '#064e3b' : '#ffffff'} strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <span className="text-[10px] font-bold text-slate-400 dark:text-emerald-400 uppercase tracking-widest block">
            Gross Rev
          </span>
          <span className="text-lg font-black text-slate-900 dark:text-emerald-50 font-mono">
            ₹1.10Cr
          </span>
        </div>
      </div>
    </div>
  );
};
