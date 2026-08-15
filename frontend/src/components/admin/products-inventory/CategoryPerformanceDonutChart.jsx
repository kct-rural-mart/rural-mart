import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const CATEGORY_COLORS = ['#174F3A', '#22C55E', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-brand-text text-white border border-brand-accent p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
        <div className="font-bold text-sm text-white border-b border-white/20 pb-1 flex justify-between items-center">
          <span>{data.name}</span>
          <span className="text-[10px] text-white/60">Share Ratio</span>
        </div>
        <div className="flex items-center justify-between text-white/90">
          <span className="font-medium">Gross Revenue:</span>
          <span className="font-mono font-bold">₹{data.value.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center justify-between text-brand-primary-light font-bold border-t border-white/20 pt-1">
          <span>Revenue Share:</span>
          <span className="font-mono">{data.percentage}%</span>
        </div>
      </div>
    )
  }
  return null
}

function renderCustomizedLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" className="text-[10px] font-black fill-white drop-shadow-md">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function CategoryPerformanceDonutChart({ products }) {
  const chartData = useMemo(() => {
    const totals = {}
    for (const p of products) {
      totals[p.category] = (totals[p.category] || 0) + p.revenue
    }
    const totalRevenue = Object.values(totals).reduce((a, b) => a + b, 0)
    if (totalRevenue === 0) return []
    return Object.entries(totals)
      .filter(([, value]) => value > 0)
      .map(([name, value], idx) => ({
        name,
        value,
        percentage: Math.round((value / totalRevenue) * 100),
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)
  }, [products])

  const totalRevenue = chartData.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-brand-border/60">
        <h3 className="text-sm font-bold text-brand-text tracking-tight">Product Category Performance</h3>
      </div>

      <div className="w-full h-72 md:h-80 relative flex items-center justify-center">
        {chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-brand-text-muted italic bg-brand-bg-subtle rounded-xl border border-brand-border/50">
            No category performance data available
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />
                <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Pie data={chartData} cx="50%" cy="45%" innerRadius={62} outerRadius={98} paddingAngle={4} dataKey="value" labelLine={false} label={renderCustomizedLabel}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-[10px] font-bold text-brand-text-subtle uppercase tracking-widest block">Gross Rev</span>
              <span className="text-lg font-black text-brand-text font-mono">₹{(totalRevenue / 100000).toFixed(2)}L</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
