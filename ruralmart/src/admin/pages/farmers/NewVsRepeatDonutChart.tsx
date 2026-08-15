import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Theme } from '../../../shared/types';
import { NEW_VS_REPEAT_DONUT } from '../../../mockData';

interface NewVsRepeatDonutChartProps {
  theme: Theme;
}

export const NewVsRepeatDonutChart: React.FC<NewVsRepeatDonutChartProps> = ({ theme }) => {
  const isDark = theme === 'dark';

  // Override mock colors with enterprise palette
  const donutData = NEW_VS_REPEAT_DONUT.map((item) => {
    if (item.name.toLowerCase().includes('repeat')) {
      return { ...item, color: isDark ? '#8ECAAA' : '#174F3A' };
    }
    return { ...item, color: isDark ? '#A3E6C5' : '#34735A' };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#17221D] text-white dark:bg-[#16241E] dark:text-[#E6ECE8] border border-[#34735A] p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[200px]">
          <div className="font-bold text-sm text-[#A3E6C5] border-b border-[#34735A] pb-1 flex justify-between items-center">
            <span>{data.name}</span>
            <span className="text-[10px] text-[#8E9E96]">Share Ratio</span>
          </div>
          <div className="flex items-center justify-between text-[#E6ECE8]">
            <span className="font-medium">Total Count:</span>
            <span className="font-bold">{data.value.toLocaleString('en-IN')} Farmers</span>
          </div>
          <div className="flex items-center justify-between text-[#A3E6C5] font-bold border-t border-[#34735A] pt-1">
            <span>Percentage Share:</span>
            <span>{data.percentage}%</span>
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
        className="text-[11px] font-black fill-white drop-shadow-xs"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#DDE6E0] dark:border-[#1E3129]">
        <div>
          <h3 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] tracking-tight">
            1. New vs Repeat Farmers
          </h3>
        </div>
      </div>

      {/* Donut Canvas */}
      <div className="w-full h-72 md:h-80 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
            <Pie
              data={donutData}
              cx="50%"
              cy="48%"
              innerRadius={65}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {donutData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke={isDark ? '#121E19' : '#ffffff'} strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text Badge inside Donut */}
        <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <span className="text-[10px] font-bold text-[#8A958F] dark:text-[#8E9E96] uppercase tracking-widest block">
            Total Base
          </span>
          <span className="text-xl font-black text-[#17221D] dark:text-[#E6ECE8]">
            18.4K
          </span>
        </div>
      </div>
    </div>
  );
};
