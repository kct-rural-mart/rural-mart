import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { TrendingUp, PieChart as PieIcon, BarChart3, Layers } from 'lucide-react'
import { REPORT_GENERATION_TREND_DATA, REPORT_TYPE_DISTRIBUTION_DATA, DOWNLOAD_ACTIVITY_DATA, REPORT_USAGE_CATEGORY_DATA } from '../../../lib/newPages/mockData'
import { CHART_COLORS } from '../../../lib/newPages/chartColors'

function EmptyChart({ label }) {
  return (
    <div className="h-full w-full flex items-center justify-center text-xs text-brand-text-muted italic bg-brand-bg-subtle rounded-xl border border-brand-border/50">
      {label}
    </div>
  )
}

export default function ReportsCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-primary-light text-brand-primary-dark">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-brand-text">Report Generation Trend</h3>
          </div>
        </div>

        <div className="h-64 w-full">
          {REPORT_GENERATION_TREND_DATA.length === 0 ? (
            <EmptyChart label="No report generation data available" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REPORT_GENERATION_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
                <XAxis dataKey="month" stroke={CHART_COLORS.textMuted} fontSize={11} tickLine={false} />
                <YAxis stroke={CHART_COLORS.textMuted} fontSize={11} tickLine={false} />
                <Tooltip wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} contentStyle={{ backgroundColor: CHART_COLORS.text, borderColor: CHART_COLORS.border, borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
                <Line type="monotone" dataKey="generatedCount" name="Reports Generated" stroke={CHART_COLORS.primary} strokeWidth={2.5} dot={{ r: 3, fill: CHART_COLORS.primary }} activeDot={{ r: 6 }} isAnimationActive={false} />
                <Line type="monotone" dataKey="downloadsCount" name="Total Downloads" stroke={CHART_COLORS.info} strokeWidth={2.5} dot={{ r: 3, fill: CHART_COLORS.info }} activeDot={{ r: 6 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-info-light text-brand-info-dark">
              <PieIcon className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-brand-text">Report Type Distribution</h3>
          </div>
        </div>

        <div className="h-64 w-full flex items-center justify-center">
          {REPORT_TYPE_DISTRIBUTION_DATA.length === 0 ? (
            <EmptyChart label="No report type distribution data available" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={REPORT_TYPE_DISTRIBUTION_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" nameKey="name">
                  {REPORT_TYPE_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} contentStyle={{ backgroundColor: CHART_COLORS.text, borderColor: CHART_COLORS.border, borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '11px', lineHeight: '20px' }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-info-light text-brand-info-dark">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-brand-text">Download Activity by Month</h3>
          </div>
        </div>

        <div className="h-64 w-full">
          {DOWNLOAD_ACTIVITY_DATA.length === 0 ? (
            <EmptyChart label="No download activity data available" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DOWNLOAD_ACTIVITY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
                <XAxis dataKey="month" stroke={CHART_COLORS.textMuted} fontSize={11} tickLine={false} />
                <YAxis stroke={CHART_COLORS.textMuted} fontSize={11} tickLine={false} />
                <Tooltip wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} contentStyle={{ backgroundColor: CHART_COLORS.text, borderColor: CHART_COLORS.border, borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
                <Bar dataKey="pdfDownloads" name="PDF Format" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="excelDownloads" name="Excel Format" fill={CHART_COLORS.info} radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-brand-text">Report Usage by Category</h3>
          </div>
        </div>

        <div className="h-64 w-full">
          {REPORT_USAGE_CATEGORY_DATA.length === 0 ? (
            <EmptyChart label="No report usage data available" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REPORT_USAGE_CATEGORY_DATA} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
                <XAxis type="number" stroke={CHART_COLORS.textMuted} fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="category" stroke={CHART_COLORS.textMuted} fontSize={10} tickLine={false} width={110} />
                <Tooltip wrapperStyle={{ pointerEvents: 'none', outline: 'none' }} isAnimationActive={false} contentStyle={{ backgroundColor: CHART_COLORS.text, borderColor: CHART_COLORS.border, borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="count" name="Reports Count" fill="#8b5cf6" radius={[0, 4, 4, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
