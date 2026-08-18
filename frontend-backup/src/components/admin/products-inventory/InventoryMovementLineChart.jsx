import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CHART_COLORS } from '../../../lib/newPages/chartColors'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-brand-text text-white border border-brand-accent p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[220px]">
        <div className="font-bold text-sm text-white border-b border-white/20 pb-1 flex justify-between items-center">
          <span>{label} Movement</span>
          <span className="text-[10px] text-white/60">Unit Flow</span>
        </div>
        <div className="flex items-center justify-between text-purple-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
            Opening Stock:
          </span>
          <span className="font-mono">{data.openingStock.toLocaleString('en-IN')} Units</span>
        </div>
        <div className="flex items-center justify-between text-brand-info-light">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-info-light inline-block" />
            Procurement (In):
          </span>
          <span className="font-mono">+{data.procurement.toLocaleString('en-IN')} Units</span>
        </div>
        <div className="flex items-center justify-between text-brand-warning-light">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-warning-light inline-block" />
            Sales (Out):
          </span>
          <span className="font-mono">-{data.sales.toLocaleString('en-IN')} Units</span>
        </div>
        <div className="flex items-center justify-between text-brand-primary-light font-bold border-t border-white/20 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-primary-light inline-block" />
            Closing Stock:
          </span>
          <span className="font-mono text-sm">{data.closingStock.toLocaleString('en-IN')} Units</span>
        </div>
      </div>
    )
  }
  return null
}

export default function InventoryMovementLineChart({ trendData = [] }) {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-brand-border/60">
        <h3 className="text-sm font-bold text-brand-text tracking-tight">Inventory Movement</h3>
      </div>

      <div className="w-full h-72 md:h-80 relative">
        {trendData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-brand-text-muted italic bg-brand-bg-subtle rounded-xl border border-brand-border/50">
            No inventory movement data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} vertical={false} />
              <XAxis dataKey="period" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11, fontWeight: 500 }} axisLine={{ stroke: CHART_COLORS.border }} tickLine={false} />
              <YAxis tick={{ fill: CHART_COLORS.textMuted, fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

              <Line type="monotone" dataKey="closingStock" name="Closing Stock" stroke={CHART_COLORS.primary} strokeWidth={3} dot={{ r: 4, fill: CHART_COLORS.primary }} activeDot={{ r: 7 }} />
              <Line type="monotone" dataKey="openingStock" name="Opening Stock" stroke="#7e22ce" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3, fill: '#7e22ce' }} />
              <Line type="monotone" dataKey="procurement" name="Procurement" stroke={CHART_COLORS.info} strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS.info }} />
              <Line type="monotone" dataKey="sales" name="Sales Qty" stroke={CHART_COLORS.warning} strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS.warning }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
