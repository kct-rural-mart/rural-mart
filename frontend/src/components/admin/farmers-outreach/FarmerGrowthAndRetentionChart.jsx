import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { FARMER_GROWTH_TREND, CUSTOMER_RETENTION_DATA } from '../../../lib/newPages/mockData'
import { CHART_COLORS } from '../../../lib/newPages/chartColors'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-brand-text text-white border border-brand-accent p-3 rounded-xl shadow-xl text-xs space-y-2 min-w-[230px] pointer-events-none select-none">
        <div className="font-bold text-sm text-white border-b border-white/20 pb-1 flex justify-between items-center">
          <span>{label} Metrics</span>
          <span className="text-[10px] text-white/60">Growth &amp; Retention</span>
        </div>
        <div className="flex items-center justify-between text-brand-primary-light font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-primary-light inline-block" />
            Total Registered:
          </span>
          <span>{data.registeredFarmers.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center justify-between text-white/90">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-accent inline-block" />
            Repeat Active:
          </span>
          <span>{data.repeatFarmers.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center justify-between text-white/70">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-accent-muted inline-block" />
            New Registrations:
          </span>
          <span>+{data.newFarmers.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center justify-between text-brand-warning-light font-bold pt-1 border-t border-white/20">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-warning-light inline-block" />
            Retention Rate %:
          </span>
          <span>{data.retentionRate}%</span>
        </div>
      </div>
    )
  }
  return null
}

export default function FarmerGrowthAndRetentionChart() {
  const combinedData = FARMER_GROWTH_TREND.map((growth, idx) => {
    const retention = CUSTOMER_RETENTION_DATA[idx]
    return { ...growth, retentionRate: retention ? retention.retentionRate : 0 }
  })

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-brand-border">
        <h3 className="text-sm font-bold text-brand-text tracking-tight">Farmer Growth &amp; Customer Retention Trend</h3>
      </div>

      <div className="w-full h-72 md:h-80 relative">
        {combinedData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-brand-text-muted italic bg-brand-bg-subtle rounded-xl border border-brand-border/50">
            No farmer growth data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} vertical={false} />
              <XAxis dataKey="period" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11, fontWeight: 500 }} axisLine={{ stroke: CHART_COLORS.border }} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
              <YAxis yAxisId="right" orientation="right" domain={[50, 100]} tick={{ fill: CHART_COLORS.warning, fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

              <Line yAxisId="left" type="monotone" dataKey="registeredFarmers" name="Total Registered" stroke={CHART_COLORS.primary} strokeWidth={3} dot={{ r: 4, fill: CHART_COLORS.primary }} activeDot={{ r: 6 }} isAnimationActive={false} />
              <Line yAxisId="left" type="monotone" dataKey="repeatFarmers" name="Repeat Active" stroke={CHART_COLORS.accent} strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: CHART_COLORS.accent }} isAnimationActive={false} />
              <Line yAxisId="left" type="monotone" dataKey="newFarmers" name="New Farmers" stroke="#5A8F77" strokeWidth={2} dot={{ r: 3, fill: '#5A8F77' }} isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="retentionRate" name="Retention Rate %" stroke={CHART_COLORS.warning} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS.warning }} activeDot={{ r: 6 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
