import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CHART_COLORS } from '../../../lib/newPages/chartColors'

// Only two real states - no reorder_level column exists to define a "Low
// Stock" threshold (same decision already made for Owner's Product &
// Inventory page).
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const totalSKUs = data.healthy + data.outOfStock
    return (
      <div className="bg-brand-text text-white border border-brand-accent p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
        <div className="font-bold text-sm text-white border-b border-white/20 pb-1 flex justify-between items-center">
          <span>{label} Rural Mart</span>
          <span className="text-[10px] text-white/60">{totalSKUs} Total SKUs</span>
        </div>
        <div className="flex items-center justify-between text-brand-primary-light font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-primary-light inline-block" />
            Healthy Stock:
          </span>
          <span className="font-mono">{data.healthy} SKUs</span>
        </div>
        <div className="flex items-center justify-between text-red-300 font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
            Out of Stock:
          </span>
          <span className="font-mono">{data.outOfStock} SKUs</span>
        </div>
      </div>
    )
  }
  return null
}

export default function StockHealthStackedBarChart({ products }) {
  const chartData = useMemo(() => {
    const byMart = new Map()
    for (const p of products) {
      if (!byMart.has(p.ruralMart)) byMart.set(p.ruralMart, { ruralMart: p.ruralMart, healthy: 0, outOfStock: 0 })
      const entry = byMart.get(p.ruralMart)
      if (p.status === 'Out of Stock') entry.outOfStock += 1
      else entry.healthy += 1
    }
    return Array.from(byMart.values()).sort((a, b) => b.healthy + b.outOfStock - (a.healthy + a.outOfStock))
  }, [products])

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-brand-border/60">
        <h3 className="text-sm font-bold text-brand-text tracking-tight">Stock Health by Mart</h3>
      </div>

      <div className="w-full h-72 md:h-80 relative">
        {chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-brand-text-muted italic bg-brand-bg-subtle rounded-xl border border-brand-border/50">
            No stock health data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} vertical={false} />
              <XAxis dataKey="ruralMart" tick={{ fill: CHART_COLORS.textMuted, fontSize: 10, fontWeight: 500 }} axisLine={{ stroke: CHART_COLORS.border }} tickLine={false} />
              <YAxis tick={{ fill: CHART_COLORS.textMuted, fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

              <Bar dataKey="healthy" name="Healthy" stackId="stock" fill={CHART_COLORS.primary} radius={[0, 0, 0, 0]} barSize={18} />
              <Bar dataKey="outOfStock" name="Out of Stock" stackId="stock" fill="#e11d48" radius={[4, 4, 0, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
