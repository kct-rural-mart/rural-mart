import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { CHART_COLORS } from '../../../lib/newPages/chartColors'
import { formatLakhsCr } from '../../../lib/queries/finance'

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const mart = payload[0].payload
    return (
      <div className="bg-brand-text/95 text-white border border-brand-accent p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[220px]">
        <div className="font-bold text-sm text-white border-b border-white/20 pb-1 flex justify-between items-center">
          <span>{mart.name} Rural Mart</span>
          <span className="text-[10px] text-white/60">{mart.district}</span>
        </div>
        <div className="flex items-center justify-between text-white/90">
          <span>Net Profit:</span>
          <span className="font-mono font-bold text-brand-primary-light">{formatLakhsCr(mart.netProfitRaw)}</span>
        </div>
        <div className="flex items-center justify-between text-white/90">
          <span>Sales Revenue:</span>
          <span className="font-mono font-bold">{formatLakhsCr(mart.salesRaw)}</span>
        </div>
        <div className="flex items-center justify-between text-white/90">
          <span>Reg. Farmers:</span>
          <span className="font-mono">{mart.registeredFarmers.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center justify-between border-t border-white/20 pt-1 text-[11px]">
          <span>Mart Status:</span>
          <span className={`font-bold ${mart.status === 'Active' ? 'text-brand-primary-light' : mart.status === 'Delayed' ? 'text-brand-warning-light' : 'text-red-400'}`}>{mart.status}</span>
        </div>
      </div>
    )
  }
  return null
}

export default function RuralMartPerformanceChart({ marts }) {
  const chartData = [...marts].sort((a, b) => a.netProfitRaw - b.netProfitRaw).map((m) => ({ ...m, netProfitLakhs: m.netProfitRaw / 100000 }))

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-brand-border/60">
        <h3 className="text-sm font-bold text-brand-text tracking-tight">Rural Mart Performance Comparison</h3>
      </div>

      <div className="w-full h-72 md:h-80 relative">
        {chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-brand-text-muted italic bg-brand-bg-subtle rounded-xl border border-brand-border/50">
            No rural marts performance data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 25, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} horizontal={false} />
              <XAxis type="number" tick={{ fill: CHART_COLORS.textMuted, fontSize: 10, fontWeight: 500 }} axisLine={{ stroke: CHART_COLORS.border }} tickLine={false} tickFormatter={(v) => `₹${v}L`} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fill: CHART_COLORS.textMuted, fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />

              <Bar dataKey="netProfitLakhs" name="Net Profit (₹L)" radius={[0, 4, 4, 0]} barSize={14}>
                {chartData.map((entry, index) => {
                  const color = entry.status === 'Active' ? CHART_COLORS.primary : entry.status === 'Delayed' ? CHART_COLORS.warning : '#e11d48'
                  return <Cell key={`cell-${index}`} fill={color} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
