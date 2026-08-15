import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CHART_COLORS } from '../../../lib/newPages/chartColors'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-brand-text/95 text-white border border-brand-accent p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[220px]">
        <div className="font-bold text-sm text-white border-b border-white/20 pb-1 flex justify-between items-center">
          <span>{label} Network Snapshot</span>
          <span className="text-[10px] text-white/60">Monthly, all Rural Marts</span>
        </div>
        <div className="flex items-center justify-between text-brand-primary-light font-bold">
          <span>Network Sales:</span>
          <span className="font-mono">₹{data.salesLakhs} Lakhs</span>
        </div>
        <div className="flex items-center justify-between text-brand-info-light font-bold border-t border-white/20 pt-1">
          <span>Bills Generated:</span>
          <span className="font-mono">{data.bills.toLocaleString('en-IN')}</span>
        </div>
      </div>
    )
  }
  return null
}

export default function MonthlyRuralMartGrowthChart({ trendData = [], billsGrowthData = [] }) {
  const chartData = useMemo(() => {
    return trendData.map((t, idx) => ({
      period: t.period,
      salesLakhs: t.sales,
      bills: billsGrowthData[idx]?.bills ?? 0,
    }))
  }, [trendData, billsGrowthData])

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-brand-border/60">
        <h3 className="text-sm font-bold text-brand-text tracking-tight">Network Sales & Bills Trend</h3>
      </div>

      <div className="w-full h-72 md:h-80 relative">
        {chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-brand-text-muted italic bg-brand-bg-subtle rounded-xl border border-brand-border/50">
            No network trend data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} vertical={false} />
              <XAxis dataKey="period" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11, fontWeight: 500 }} axisLine={{ stroke: CHART_COLORS.border }} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: CHART_COLORS.textMuted, fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}L`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: CHART_COLORS.textMuted, fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} />
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

              <Line yAxisId="left" type="monotone" dataKey="salesLakhs" name="Network Sales (₹L)" stroke={CHART_COLORS.primary} strokeWidth={3} dot={{ r: 4, fill: CHART_COLORS.primary }} activeDot={{ r: 7 }} />
              <Line yAxisId="right" type="monotone" dataKey="bills" name="Bills Generated" stroke={CHART_COLORS.info} strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3, fill: CHART_COLORS.info }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
