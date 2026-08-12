import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { NEW_VS_REPEAT_DONUT } from '../../../lib/newPages/mockData'
import { CHART_COLORS } from '../../../lib/newPages/chartColors'

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-brand-text text-white border border-brand-accent p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[200px]">
        <div className="font-bold text-sm text-white border-b border-white/20 pb-1 flex justify-between items-center">
          <span>{data.name}</span>
          <span className="text-[10px] text-white/60">Share Ratio</span>
        </div>
        <div className="flex items-center justify-between text-white/90">
          <span className="font-medium">Total Count:</span>
          <span className="font-bold">{data.value.toLocaleString('en-IN')} Farmers</span>
        </div>
        <div className="flex items-center justify-between text-brand-primary-light font-bold border-t border-white/20 pt-1">
          <span>Percentage Share:</span>
          <span>{data.percentage}%</span>
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
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" className="text-[11px] font-black fill-white drop-shadow-xs">
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  )
}

export default function NewVsRepeatDonutChart() {
  const donutData = NEW_VS_REPEAT_DONUT.map((item) => {
    if (item.name.toLowerCase().includes('repeat')) {
      return { ...item, color: CHART_COLORS.primary }
    }
    return { ...item, color: CHART_COLORS.accent }
  })

  const totalBase = donutData.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-brand-border">
        <h3 className="text-sm font-bold text-brand-text tracking-tight">New vs Repeat Farmers</h3>
      </div>

      <div className="w-full h-72 md:h-80 relative flex items-center justify-center">
        {totalBase === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-brand-text-muted italic bg-brand-bg-subtle rounded-xl border border-brand-border/50">
            No farmer split data available
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Pie data={donutData} cx="50%" cy="48%" innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value" labelLine={false} label={renderCustomizedLabel}>
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-[10px] font-bold text-brand-text-subtle uppercase tracking-widest block">Total Base</span>
              <span className="text-xl font-black text-brand-text">{totalBase.toLocaleString('en-IN')}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
