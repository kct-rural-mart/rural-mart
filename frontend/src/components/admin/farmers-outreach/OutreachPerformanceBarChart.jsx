import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { OUTREACH_PERFORMANCE_DATA } from '../../../lib/newPages/mockData'
import { CHART_COLORS } from '../../../lib/newPages/chartColors'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-brand-text text-white border border-brand-accent p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px] pointer-events-none select-none">
        <div className="font-bold text-sm text-white border-b border-white/20 pb-1 flex justify-between items-center">
          <span>{label} Outreach Impact</span>
          <span className="text-[10px] text-white/60">Campaign Metrics</span>
        </div>
        <div className="flex items-center justify-between text-brand-primary-light font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-primary-light inline-block" />
            Farmers Reached:
          </span>
          <span>{data.farmersReached.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center justify-between text-white/90 font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-accent inline-block" />
            Programs Conducted:
          </span>
          <span>{data.programsConducted}</span>
        </div>
        <div className="flex items-center justify-between text-brand-accent-muted font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-accent-muted inline-block" />
            Villages Covered:
          </span>
          <span>{data.villagesCovered}</span>
        </div>
      </div>
    )
  }
  return null
}

export default function OutreachPerformanceBarChart() {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-brand-border">
        <h3 className="text-sm font-bold text-brand-text tracking-tight">Outreach Performance</h3>
      </div>

      <div className="w-full h-72 md:h-80 relative">
        {OUTREACH_PERFORMANCE_DATA.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-brand-text-muted italic bg-brand-bg-subtle rounded-xl border border-brand-border/50">
            No outreach performance data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={OUTREACH_PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} vertical={false} />
              <XAxis dataKey="period" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11, fontWeight: 500 }} axisLine={{ stroke: CHART_COLORS.border }} tickLine={false} />
              <YAxis tick={{ fill: CHART_COLORS.textMuted, fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} cursor={{ fill: 'rgba(23, 79, 58, 0.05)' }} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

              <Bar dataKey="farmersReached" name="Farmers Reached" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} barSize={14} isAnimationActive={false} />
              <Bar dataKey="programsConducted" name="Programs Conducted" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} barSize={14} isAnimationActive={false} />
              <Bar dataKey="villagesCovered" name="Villages Covered" fill="#103A2B" radius={[4, 4, 0, 0]} barSize={14} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
