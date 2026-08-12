import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getNetworkTrendData } from '../../lib/newPages/shared/dataServices'
import { CHART_COLORS } from '../../lib/newPages/chartColors'

function CustomTooltip({ active, payload, label, metric, comparePrevious }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload

    return (
      <div className="bg-brand-text/95 text-white border border-brand-accent p-3 rounded-xl shadow-lg text-xs space-y-1.5 min-w-[200px]">
        <div className="font-bold text-sm text-white border-b border-white/20 pb-1 flex justify-between items-center">
          <span>{label}</span>
          <span className="text-[10px] font-normal text-white/60">Period Overview</span>
        </div>

        {(metric === 'Both' || metric === 'Sales') && (
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-primary-light inline-block" />
              <span className="font-medium">Total Sales:</span>
            </div>
            <div className="text-right">
              <span className="font-bold">₹{data.sales} Lakhs</span>
              <span className="ml-1.5 text-[10px] text-brand-primary-light font-bold">({data.salesChange})</span>
            </div>
          </div>
        )}

        {(metric === 'Both' || metric === 'Gross Profit') && (
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-accent-light inline-block" />
              <span className="font-medium">Gross Profit:</span>
            </div>
            <div className="text-right">
              <span className="font-bold">₹{data.grossProfit} Lakhs</span>
              <span className="ml-1.5 text-[10px] text-brand-primary-light font-bold">({data.profitChange})</span>
            </div>
          </div>
        )}

        {comparePrevious && data.prevSales && (
          <div className="pt-1 border-t border-white/20 text-[10px] text-white/60 flex justify-between">
            <span>Prev Period Sales:</span>
            <span className="text-white">₹{data.prevSales} L</span>
          </div>
        )}
      </div>
    )
  }
  return null
}

export default function NetworkPerformanceTrend() {
  const [metric, setMetric] = useState('Both')
  const [timeGrouping, setTimeGrouping] = useState('Monthly')
  const [comparePrevious, setComparePrevious] = useState(false)

  const chartData = getNetworkTrendData(timeGrouping)

  const salesStroke = CHART_COLORS.primary
  const profitStroke = CHART_COLORS.accent
  const prevSalesStroke = `${CHART_COLORS.primary}50`
  const gridColor = CHART_COLORS.border
  const textColor = CHART_COLORS.textMuted

  const formatYAxis = (val) => (timeGrouping === 'Yearly' ? `₹${val} Cr` : `₹${val} L`)

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-brand-border">
        <div>
          <h2 className="text-sm font-bold text-brand-text tracking-tight">Network Performance Trend</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center bg-brand-bg-subtle p-0.5 rounded-lg border border-brand-border">
            {['Both', 'Sales', 'Gross Profit'].map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  metric === m ? 'bg-brand-primary text-white shadow-xs' : 'text-brand-text-muted hover:text-brand-text'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-brand-bg-subtle p-0.5 rounded-lg border border-brand-border">
            {['Monthly', 'Quarterly', 'Half-yearly', 'Yearly'].map((tg) => (
              <button
                key={tg}
                onClick={() => setTimeGrouping(tg)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  timeGrouping === tg ? 'bg-brand-primary text-white shadow-xs' : 'text-brand-text-muted hover:text-brand-text'
                }`}
              >
                {tg}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer ml-1 select-none">
            <div className="relative">
              <input
                type="checkbox"
                checked={comparePrevious}
                onChange={(e) => setComparePrevious(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-7 h-4 rounded-full transition-colors ${comparePrevious ? 'bg-brand-primary' : 'bg-brand-border'}`} />
              <div
                className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                  comparePrevious ? 'transform translate-x-3' : ''
                }`}
              />
            </div>
            <span className="text-[11px] font-medium text-brand-text-muted">Compare prev.</span>
          </label>
        </div>
      </div>

      <div className="w-full h-72 md:h-80 relative">
        {chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-brand-text-muted italic bg-brand-bg-subtle rounded-xl border border-brand-border/50">
            No network trend data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={salesStroke} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={salesStroke} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={profitStroke} stopOpacity={0.22} />
                  <stop offset="95%" stopColor={profitStroke} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="period" tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }} axisLine={{ stroke: gridColor }} tickLine={false} />
              <YAxis tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={formatYAxis} />
              <Tooltip content={<CustomTooltip metric={metric} comparePrevious={comparePrevious} />} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />

              {comparePrevious && (metric === 'Both' || metric === 'Sales') && (
                <Area
                  type="monotone"
                  dataKey="prevSales"
                  name="Prev. Period Sales"
                  stroke={prevSalesStroke}
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  fill="none"
                  dot={false}
                />
              )}

              {(metric === 'Both' || metric === 'Sales') && (
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Total Sales"
                  stroke={salesStroke}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                  dot={{ r: 4, strokeWidth: 2, fill: CHART_COLORS.surface, stroke: salesStroke }}
                  activeDot={{ r: 6, strokeWidth: 2, fill: salesStroke, stroke: '#ffffff' }}
                />
              )}

              {(metric === 'Both' || metric === 'Gross Profit') && (
                <Area
                  type="monotone"
                  dataKey="grossProfit"
                  name="Gross Profit"
                  stroke={profitStroke}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#profitGrad)"
                  dot={{ r: 3.5, strokeWidth: 2, fill: CHART_COLORS.surface, stroke: profitStroke }}
                  activeDot={{ r: 5.5, strokeWidth: 2, fill: profitStroke, stroke: '#ffffff' }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
