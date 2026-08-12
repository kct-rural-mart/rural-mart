import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TOP_10_PRODUCTS_DATA } from '../../../lib/newPages/mockData'
import { CHART_COLORS } from '../../../lib/newPages/chartColors'

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="bg-brand-text text-white border border-brand-accent p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[220px]">
        <div className="font-bold text-sm text-white border-b border-white/20 pb-1 flex justify-between items-center">
          <span>{item.name}</span>
          <span className="text-[10px] text-white/60">{item.category}</span>
        </div>
        <div className="flex items-center justify-between text-white/90">
          <span className="font-medium">Total Sales Volume:</span>
          <span className="font-mono font-bold">{item.salesQty.toLocaleString('en-IN')} Units</span>
        </div>
        <div className="flex items-center justify-between text-brand-primary-light font-bold border-t border-white/20 pt-1">
          <span>Generated Revenue:</span>
          <span className="font-mono text-sm">₹{(item.revenue / 100000).toFixed(2)} Lakhs</span>
        </div>
      </div>
    )
  }
  return null
}

export default function Top10ProductsBarChart() {
  const data = [...TOP_10_PRODUCTS_DATA].reverse()

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-brand-border/60">
        <h3 className="text-sm font-bold text-brand-text tracking-tight">Top 10 Products</h3>
      </div>

      <div className="w-full h-72 md:h-80 relative">
        {data.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-brand-text-muted italic bg-brand-bg-subtle rounded-xl border border-brand-border/50">
            No product sales data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} horizontal={false} />
              <XAxis type="number" tick={{ fill: CHART_COLORS.textMuted, fontSize: 10, fontWeight: 500 }} axisLine={{ stroke: CHART_COLORS.border }} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fill: CHART_COLORS.textMuted, fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />

              <Bar dataKey="salesQty" radius={[0, 4, 4, 0]} barSize={14}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === data.length - 1 ? CHART_COLORS.primary : index >= data.length - 3 ? CHART_COLORS.info : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
