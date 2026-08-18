import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CHART_COLORS } from '../../../lib/newPages/chartColors'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-text text-white border border-brand-accent p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
        <div className="font-bold text-sm text-white border-b border-white/20 pb-1 flex justify-between items-center">
          <span>{label}</span>
          <span className="text-[10px] font-normal text-white/60">P&amp;L Financials</span>
        </div>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
              <span className="font-medium text-white/90">{entry.name}:</span>
            </div>
            <span className="font-bold">₹{entry.value} Lakhs</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function FinancialTrendChart({ trendData = [] }) {
  const [selectedMetric, setSelectedMetric] = useState('All')

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-brand-border">
        <h3 className="text-sm font-bold text-brand-text tracking-tight">Financial Trend</h3>

        <div className="flex flex-wrap items-center bg-brand-bg-subtle p-0.5 rounded-lg border border-brand-border">
          {['All', 'Sales', 'Procurement', 'Gross Profit', 'Net Profit'].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMetric(m)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                selectedMetric === m ? 'bg-brand-primary text-white shadow-xs' : 'text-brand-text-muted hover:text-brand-text'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-72 md:h-80 relative">
        {trendData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-brand-text-muted italic bg-brand-bg-subtle rounded-xl border border-brand-border/50">
            No financial trend data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} vertical={false} />
              <XAxis dataKey="period" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11, fontWeight: 500 }} axisLine={{ stroke: CHART_COLORS.border }} tickLine={false} />
              <YAxis tick={{ fill: CHART_COLORS.textMuted, fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}L`} />
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

              {(selectedMetric === 'All' || selectedMetric === 'Sales') && (
                <Line type="monotone" dataKey="sales" name="Sales" stroke={CHART_COLORS.primary} strokeWidth={2.5} dot={{ r: 3.5, fill: CHART_COLORS.primary }} activeDot={{ r: 6 }} />
              )}
              {(selectedMetric === 'All' || selectedMetric === 'Procurement') && (
                <Line type="monotone" dataKey="procurement" name="Procurement" stroke={CHART_COLORS.info} strokeWidth={2.5} dot={{ r: 3.5, fill: CHART_COLORS.info }} activeDot={{ r: 6 }} />
              )}
              {(selectedMetric === 'All' || selectedMetric === 'Gross Profit') && (
                <Line type="monotone" dataKey="grossProfit" name="Gross Profit" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 3.5, fill: '#0D9488' }} activeDot={{ r: 6 }} />
              )}
              {(selectedMetric === 'All' || selectedMetric === 'Net Profit') && (
                <Line type="monotone" dataKey="netProfit" name="Net Profit" stroke={CHART_COLORS.warning} strokeWidth={2.5} dot={{ r: 3.5, fill: CHART_COLORS.warning }} activeDot={{ r: 6 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
