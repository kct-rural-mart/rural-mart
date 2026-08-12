import { useState } from 'react'
import { ResponsiveContainer, ComposedChart, Bar, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Legend } from 'recharts'
import { Info, ArrowUpDown } from 'lucide-react'
import { CHART_COLORS } from '../../lib/newPages/chartColors'

function CustomBarTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const scoreGap = data.score - data.targetScore

    return (
      <div className="bg-brand-text text-white border border-brand-accent p-3 rounded-xl shadow-lg text-xs space-y-1.5 min-w-[210px]">
        <div className="font-bold text-sm text-white border-b border-white/20 pb-1 flex justify-between">
          <span>{label} Mart</span>
          <span className="text-[10px] text-white/60 font-normal">Score Card</span>
        </div>

        <div className="flex justify-between items-center text-white pt-0.5">
          <span className="font-medium">Performance Score:</span>
          <span className="font-bold text-sm text-white">{data.score} / 100</span>
        </div>

        <div className="flex justify-between items-center text-white/70 text-[11px]">
          <span className="font-medium">Target Benchmark:</span>
          <span className="font-bold text-brand-info-light">{data.targetScore} / 100</span>
        </div>

        <div className="flex justify-between items-center text-[10px] text-white/60">
          <span>Variance vs Target:</span>
          <span className={`font-bold ${scoreGap >= 0 ? 'text-brand-primary-light' : 'text-brand-warning-light'}`}>
            {scoreGap >= 0 ? `+${scoreGap}` : `${scoreGap}`} pts
          </span>
        </div>

        <div className="pt-1.5 border-t border-white/20 text-[9px] text-white/60 space-y-0.5">
          <p className="font-bold text-white">Methodology Weighted Score:</p>
          <p>Sales: {data.breakdown?.salesGrowth}/20 | Profit: {data.breakdown?.profitability}/20</p>
          <p>Engage: {data.breakdown?.farmerEngagement}/20 | Reach: {data.breakdown?.outreachImpact}/15</p>
        </div>
      </div>
    )
  }
  return null
}

export default function RuralMartPerformance({ marts }) {
  const [sortBy, setSortBy] = useState('Highest Score')
  const [showMethodologyPopover, setShowMethodologyPopover] = useState(false)

  const sortedData = [...marts].sort((a, b) => {
    if (sortBy === 'Highest Score') return b.score - a.score
    if (sortBy === 'Lowest Score') return a.score - b.score
    return a.name.localeCompare(b.name)
  })

  const chartData = sortedData.map((m) => ({
    name: m.name,
    score: m.score,
    targetScore: m.targetScore,
    breakdown: m.scoreBreakdown,
  }))

  const barColor = CHART_COLORS.primary
  const targetDotColor = CHART_COLORS.info
  const gridColor = CHART_COLORS.border
  const textColor = CHART_COLORS.textMuted

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between relative">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-brand-border">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-brand-text tracking-tight">Rural Mart Performance</h2>
          <div className="relative">
            <button
              onClick={() => setShowMethodologyPopover(!showMethodologyPopover)}
              onMouseEnter={() => setShowMethodologyPopover(true)}
              onMouseLeave={() => setShowMethodologyPopover(false)}
              className="text-brand-text-subtle hover:text-brand-primary p-1 rounded-full transition-colors"
              title="View Score Methodology Weightings"
            >
              <Info className="w-3.5 h-3.5" />
            </button>

            {showMethodologyPopover && (
              <div className="absolute left-0 top-6 w-64 bg-brand-text text-white p-3 rounded-xl shadow-lg z-50 text-[11px] leading-relaxed border border-brand-accent">
                <p className="font-bold text-xs text-white mb-1.5 border-b border-white/20 pb-1">
                  Overall Score Methodology:
                </p>
                <ul className="space-y-1 text-white/90">
                  <li className="flex justify-between"><span>Sales growth:</span> <strong className="text-white">20%</strong></li>
                  <li className="flex justify-between"><span>Profitability:</span> <strong className="text-white">20%</strong></li>
                  <li className="flex justify-between"><span>Farmer engagement:</span> <strong className="text-white">20%</strong></li>
                  <li className="flex justify-between"><span>Outreach impact:</span> <strong className="text-white">15%</strong></li>
                  <li className="flex justify-between"><span>Inventory health:</span> <strong className="text-white">15%</strong></li>
                  <li className="flex justify-between"><span>Data compliance:</span> <strong className="text-white">10%</strong></li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3 h-3 text-brand-text-subtle" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-[11px] font-semibold bg-brand-bg-subtle text-brand-text border border-brand-border rounded-lg px-2 py-1 focus:outline-none"
          >
            <option value="Highest Score">Highest Score</option>
            <option value="Lowest Score">Lowest Score</option>
            <option value="Name">Name A-Z</option>
          </select>
        </div>
      </div>

      <div className="w-full h-72 md:h-80 relative">
        {chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-brand-text-muted italic bg-brand-bg-subtle rounded-xl border border-brand-border/50">
            No rural marts performance data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 11, fontWeight: 600 }} axisLine={{ stroke: gridColor }} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} ticks={[0, 20, 40, 60, 80, 100]} />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

              <Bar dataKey="score" name="Performance Score" fill={barColor} radius={[6, 6, 0, 0]} barSize={28}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.score >= 85 ? CHART_COLORS.primary : entry.score >= 70 ? CHART_COLORS.accent : CHART_COLORS.warning}
                  />
                ))}
              </Bar>

              <Scatter dataKey="targetScore" name="Target Score (Dot)" fill={targetDotColor} shape="circle" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
