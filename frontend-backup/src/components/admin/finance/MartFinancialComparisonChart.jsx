import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CHART_COLORS } from '../../../lib/newPages/chartColors'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-brand-text text-white border border-brand-accent p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
        <div className="font-bold text-sm text-white border-b border-white/20 pb-1 flex justify-between items-center">
          <span>{label} Hub</span>
          <span className="text-[10px] text-white/60">{data.district} District</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Total Sales:</span>
          <span className="font-bold">₹{data.salesLakhs} Lakhs</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Net Profit:</span>
          <span className="font-bold text-brand-primary-light">₹{data.netProfitLakhs} Lakhs</span>
        </div>
        <div className="flex items-center justify-between text-brand-warning-light border-t border-white/20 pt-1">
          <span className="font-medium">Profit Margin:</span>
          <span className="font-bold">{data.profitMargin}%</span>
        </div>
      </div>
    )
  }
  return null
}

export default function MartFinancialComparisonChart({ financialMarts }) {
  const [mode, setMode] = useState('Sales & Net Profit')

  const chartData = financialMarts
    .filter((m) => m.salesRaw > 0)
    .map((m) => ({
      name: m.name,
      district: m.district,
      salesLakhs: parseFloat((m.salesRaw / 100000).toFixed(1)),
      netProfitLakhs: parseFloat((m.netProfitRaw / 100000).toFixed(2)),
      profitMargin: m.profitMargin,
    }))
    .sort((a, b) => b.salesLakhs - a.salesLakhs)

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-brand-border">
        <h3 className="text-sm font-bold text-brand-text tracking-tight">Rural Mart Financial Comparison</h3>

        <div className="flex items-center bg-brand-bg-subtle p-0.5 rounded-lg border border-brand-border">
          {['Sales & Net Profit', 'Profit Margin %'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                mode === m ? 'bg-brand-primary text-white shadow-xs' : 'text-brand-text-muted hover:text-brand-text'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-72 md:h-80 relative">
        {chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-brand-text-muted italic bg-brand-bg-subtle rounded-xl border border-brand-border/50">
            No mart financial data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: CHART_COLORS.textMuted, fontSize: 11, fontWeight: 500 }}
                axisLine={{ stroke: CHART_COLORS.border }}
                tickLine={false}
                tickFormatter={(v) => (mode === 'Profit Margin %' ? `${v}%` : `₹${v}L`)}
              />
              <YAxis type="category" dataKey="name" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11, fontWeight: 600 }} axisLine={{ stroke: CHART_COLORS.border }} tickLine={false} width={100} />
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

              {mode === 'Sales & Net Profit' ? (
                <>
                  <Bar dataKey="salesLakhs" name="Sales (₹ L)" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="netProfitLakhs" name="Net Profit (₹ L)" fill={CHART_COLORS.accent} radius={[0, 4, 4, 0]} barSize={12} />
                </>
              ) : (
                <Bar dataKey="profitMargin" name="Profit Margin %" fill={CHART_COLORS.warning} radius={[0, 4, 4, 0]} barSize={18} />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
