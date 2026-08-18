import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CHART_COLORS } from '../../../lib/newPages/chartColors'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-brand-text/95 text-white border border-brand-accent p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
        <div className="font-bold text-sm text-white border-b border-white/20 pb-1 flex justify-between items-center">
          <span>{label} District</span>
          <span className="text-[10px] text-white/60">
            {data.martsCount} Marts ({data.activeCount} Active)
          </span>
        </div>
        <div className="flex items-center justify-between text-brand-primary-light font-bold">
          <span>Total District Sales:</span>
          <span className="font-mono">₹{data.totalSalesLakhs.toFixed(1)} Lakhs</span>
        </div>
        <div className="flex items-center justify-between text-brand-info-light font-bold">
          <span>Avg Profit Margin:</span>
          <span className="font-mono">{data.avgProfitMargin.toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between text-white/70 border-t border-white/20 pt-1">
          <span>Registered Farmers:</span>
          <span className="font-mono">{data.registeredFarmers.toLocaleString('en-IN')}</span>
        </div>
      </div>
    )
  }
  return null
}

export default function DistrictWisePerformanceChart({ marts }) {
  const districtData = useMemo(() => {
    const byDistrict = new Map()

    for (const m of marts) {
      if (!byDistrict.has(m.district)) {
        byDistrict.set(m.district, { district: m.district, martsCount: 0, activeCount: 0, totalSalesRaw: 0, marginSum: 0, marginCount: 0, registeredFarmers: 0 })
      }
      const d = byDistrict.get(m.district)
      d.martsCount += 1
      if (m.status === 'Active') d.activeCount += 1
      d.totalSalesRaw += m.salesRaw
      d.registeredFarmers += m.registeredFarmers
      if (m.salesRaw > 0) {
        d.marginSum += m.profitMargin
        d.marginCount += 1
      }
    }

    return Array.from(byDistrict.values())
      .map((d) => ({
        district: d.district,
        martsCount: d.martsCount,
        activeCount: d.activeCount,
        totalSalesLakhs: d.totalSalesRaw / 100000,
        avgProfitMargin: d.marginCount > 0 ? d.marginSum / d.marginCount : 0,
        registeredFarmers: d.registeredFarmers,
      }))
      .sort((a, b) => b.totalSalesLakhs - a.totalSalesLakhs)
  }, [marts])

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-brand-border/60">
        <h3 className="text-sm font-bold text-brand-text tracking-tight">District-wise Performance</h3>
      </div>

      <div className="w-full h-72 md:h-80 relative">
        {districtData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-brand-text-muted italic bg-brand-bg-subtle rounded-xl border border-brand-border/50">
            No district performance data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={districtData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} vertical={false} />
              <XAxis dataKey="district" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11, fontWeight: 500 }} axisLine={{ stroke: CHART_COLORS.border }} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: CHART_COLORS.textMuted, fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}L`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: CHART_COLORS.textMuted, fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

              <Bar yAxisId="left" dataKey="totalSalesLakhs" name="District Sales (₹L)" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} barSize={22} />
              <Bar yAxisId="right" dataKey="avgProfitMargin" name="Avg Profit Margin (%)" fill={CHART_COLORS.info} radius={[4, 4, 0, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
