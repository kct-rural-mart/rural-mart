import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CHART_COLORS } from '../../../lib/newPages/chartColors'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-brand-text text-white border border-brand-accent p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
        <div className="font-bold text-sm text-white border-b border-white/20 pb-1 flex justify-between items-center">
          <span>{label} Volume</span>
          <span className="text-[10px] text-white/60">Transaction Pulse</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
            Total Bills Generated:
          </span>
          <span className="font-bold">{data.bills.toLocaleString('en-IN')} Bills</span>
        </div>
        <div className="flex items-center justify-between text-brand-warning-light border-t border-white/20 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            MoM Sales Growth %:
          </span>
          <span className="font-bold">+{data.growthPercent}%</span>
        </div>
        <div className="flex items-center justify-between text-white/60 text-[10px]">
          <span>Avg Bill Size:</span>
          <span className="text-white">₹{data.avgBillValue}</span>
        </div>
      </div>
    )
  }
  return null
}

export default function BillsAndSalesGrowthChart({ billsGrowthData = [] }) {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-brand-border">
        <h3 className="text-sm font-bold text-brand-text tracking-tight">Bills &amp; Sales Growth</h3>
      </div>

      <div className="w-full h-72 md:h-80 relative">
        {billsGrowthData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-brand-text-muted italic bg-brand-bg-subtle rounded-xl border border-brand-border/50">
            No bills/growth data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={billsGrowthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} vertical={false} />
              <XAxis dataKey="period" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11, fontWeight: 500 }} axisLine={{ stroke: CHART_COLORS.border }} tickLine={false} />
              <YAxis yAxisId="left" orientation="left" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

              <Bar yAxisId="left" dataKey="bills" name="Number of Bills" fill={CHART_COLORS.info} radius={[4, 4, 0, 0]} barSize={24} />
              <Line yAxisId="right" type="monotone" dataKey="growthPercent" name="Sales Growth %" stroke={CHART_COLORS.warning} strokeWidth={3} dot={{ r: 4, fill: CHART_COLORS.warning }} activeDot={{ r: 7 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
