import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Theme } from '../../../shared/types';
import { RADAR_SCORE_DIMENSION_DATA } from '../../../mockData';

interface PerformanceScoreRadarChartProps {
  theme: Theme;
}

export const PerformanceScoreRadarChart: React.FC<PerformanceScoreRadarChartProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1f3327' : '#cbd5e1';
  const textColor = isDark ? '#9ca3af' : '#475569';

  const topColor = isDark ? '#34d399' : '#059669'; // Emerald
  const avgColor = isDark ? '#38bdf8' : '#0284c7'; // Sky
  const benchmarkColor = isDark ? '#f59e0b' : '#d97706'; // Amber

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white dark:bg-emerald-950/95 dark:text-emerald-50 border border-slate-700 dark:border-emerald-700/60 p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
          <div className="font-bold text-sm text-emerald-400 border-b border-slate-800 dark:border-emerald-800 pb-1 flex justify-between items-center">
            <span>{data.factor}</span>
            <span className="text-[10px] text-slate-400">Max: {data.maxScore} pts</span>
          </div>
          <div className="flex items-center justify-between text-emerald-300 font-bold">
            <span>Top Mart:</span>
            <span className="font-mono">{data.topMartScore} pts</span>
          </div>
          <div className="flex items-center justify-between text-sky-300 font-bold">
            <span>Network Average:</span>
            <span className="font-mono">{data.avgNetworkScore} pts</span>
          </div>
          <div className="flex items-center justify-between text-amber-300 font-bold border-t border-slate-800 pt-1">
            <span>NABARD Benchmark:</span>
            <span className="font-mono">{data.benchmarkScore} pts</span>
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
            Performance Score Distribution
          </h3>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full h-72 md:h-80 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_SCORE_DIMENSION_DATA}>
            <PolarGrid stroke={gridColor} />
            <PolarAngleAxis dataKey="factor" tick={{ fill: textColor, fontSize: 10, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 20]} stroke={textColor} tick={{ fontSize: 9 }} />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />
            <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />

            <Radar
              name="Top Mart"
              dataKey="topMartScore"
              stroke={topColor}
              fill={topColor}
              fillOpacity={0.35}
            />
            <Radar
              name="Network Average"
              dataKey="avgNetworkScore"
              stroke={avgColor}
              fill={avgColor}
              fillOpacity={0.25}
            />
            <Radar
              name="Target Benchmark"
              dataKey="benchmarkScore"
              stroke={benchmarkColor}
              strokeDasharray="3 3"
              fill="transparent"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
