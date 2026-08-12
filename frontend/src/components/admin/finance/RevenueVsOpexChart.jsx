import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { REVENUE_OPEX_DATA } from '../../../lib/newPages/mockData'
import { CHART_COLORS } from '../../../lib/newPages/chartColors'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-brand-text text-white border border-brand-accent p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
        <div className="font-bold text-sm text-white border-b border-white/20 pb-1 flex justify-between items-center">
          <span>{label} Breakdown</span>
          <span className="text-[10px] text-white/60">Total: ₹{data.revenue} L</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
            COGS (Procurement):
          </span>
          <span className="font-bold">₹{data.cogs} Lakhs</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            Operating Expenses:
          </span>
          <span className="font-bold">₹{data.opex} Lakhs</span>
        </div>
        <div className="flex items-center justify-between text-brand-primary-light border-t border-white/20 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-primary-light inline-block" />
            Net Profit Realized:
          </span>
          <span className="font-bold">₹{data.netProfit} Lakhs</span>
        </div>
      </div>
    )
  }
  return null
}

export default function RevenueVsOpexChart() {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-brand-border">
        <h3 className="text-sm font-bold text-brand-text tracking-tight">Revenue vs Operating Expenses</h3>
      </div>

      <div className="w-full h-72 md:h-80 relative">
        {REVENUE_OPEX_DATA.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-brand-text-muted italic bg-brand-bg-subtle rounded-xl border border-brand-border/50">
            No revenue/opex data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={REVENUE_OPEX_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} vertical={false} />
              <XAxis dataKey="period" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11, fontWeight: 500 }} axisLine={{ stroke: CHART_COLORS.border }} tickLine={false} />
              <YAxis tick={{ fill: CHART_COLORS.textMuted, fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}L`} />
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

              <Bar dataKey="cogs" name="COGS" stackId="revenueStack" fill={CHART_COLORS.info} radius={[0, 0, 0, 0]} />
              <Bar dataKey="opex" name="Operating Expenses" stackId="revenueStack" fill={CHART_COLORS.warning} radius={[0, 0, 0, 0]} />
              <Bar dataKey="netProfit" name="Net Profit" stackId="revenueStack" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
