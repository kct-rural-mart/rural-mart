import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { RADAR_SCORE_DIMENSION_DATA } from '../../../lib/newPages/mockData'
import { CHART_COLORS } from '../../../lib/newPages/chartColors'

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-brand-text/95 text-white border border-brand-accent p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
        <div className="font-bold text-sm text-white border-b border-white/20 pb-1 flex justify-between items-center">
          <span>{data.factor}</span>
          <span className="text-[10px] text-white/60">Max: {data.maxScore} pts</span>
        </div>
        <div className="flex items-center justify-between text-brand-primary-light font-bold">
          <span>Top Mart:</span>
          <span className="font-mono">{data.topMartScore} pts</span>
        </div>
        <div className="flex items-center justify-between text-brand-info-light font-bold">
          <span>Network Average:</span>
          <span className="font-mono">{data.avgNetworkScore} pts</span>
        </div>
        <div className="flex items-center justify-between text-brand-warning-light font-bold border-t border-white/20 pt-1">
          <span>NABARD Benchmark:</span>
          <span className="font-mono">{data.benchmarkScore} pts</span>
        </div>
      </div>
    )
  }
  return null
}

export default function PerformanceScoreRadarChart() {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-brand-border/60">
        <h3 className="text-sm font-bold text-brand-text tracking-tight">Performance Score Distribution</h3>
      </div>

      <div className="w-full h-72 md:h-80 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_SCORE_DIMENSION_DATA}>
            <PolarGrid stroke={CHART_COLORS.border} />
            <PolarAngleAxis dataKey="factor" tick={{ fill: CHART_COLORS.textMuted, fontSize: 10, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 20]} stroke={CHART_COLORS.textMuted} tick={{ fontSize: 9 }} />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />
            <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />

            <Radar name="Top Mart" dataKey="topMartScore" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.35} />
            <Radar name="Network Average" dataKey="avgNetworkScore" stroke={CHART_COLORS.info} fill={CHART_COLORS.info} fillOpacity={0.25} />
            <Radar name="Target Benchmark" dataKey="benchmarkScore" stroke={CHART_COLORS.warning} strokeDasharray="3 3" fill="transparent" />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
