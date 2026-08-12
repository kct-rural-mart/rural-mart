import { useState } from 'react'
import { FileText, Calendar, Layers, Award, Store, Globe, Info } from 'lucide-react'

export default function ReportsKpiCards({ availableReports, exportHistory }) {
  const [activeTooltip, setActiveTooltip] = useState(null)

  const totalTemplates = availableReports.length
  const totalExports = exportHistory.length
  const completedExports = exportHistory.filter((h) => h.status === 'Completed').length
  const processingExports = exportHistory.filter((h) => h.status === 'Processing').length
  const failedExports = exportHistory.filter((h) => h.status === 'Failed').length
  const categoriesCovered = new Set(availableReports.map((r) => r.category)).size

  const kpis = [
    { id: 'kpi-templates', label: 'Available Report Templates', value: totalTemplates.toString(), icon: FileText, tooltip: 'Predefined report templates ready to preview and download.' },
    { id: 'kpi-exports', label: 'Total Exports Recorded', value: totalExports.toString(), icon: Calendar, tooltip: 'Reports downloaded or generated so far in this session.' },
    { id: 'kpi-completed', label: 'Completed Exports', value: completedExports.toString(), icon: Award, tooltip: 'Exports that finished successfully and are available to re-download.' },
    { id: 'kpi-processing', label: 'Processing Exports', value: processingExports.toString(), icon: Layers, tooltip: 'Exports currently being compiled.' },
    { id: 'kpi-failed', label: 'Failed Exports', value: failedExports.toString(), icon: Store, tooltip: 'Exports that failed and can be retried.' },
    { id: 'kpi-categories', label: 'Report Categories', value: categoriesCovered.toString(), icon: Globe, tooltip: 'Distinct report categories available across the template library.' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        const isTooltipOpen = activeTooltip === kpi.id

        return (
          <div
            key={kpi.id}
            className="bg-brand-surface border border-brand-border rounded-xl p-3.5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-brand-primary/40 transition-all duration-200 cursor-pointer relative flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider truncate">{kpi.label}</span>
              <div className="relative flex items-center">
                <button
                  onMouseEnter={() => setActiveTooltip(kpi.id)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(isTooltipOpen ? null : kpi.id)}
                  className="text-brand-text-subtle hover:text-brand-primary transition-colors p-0.5"
                  title="More information"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                {isTooltipOpen && (
                  <div className="absolute right-0 top-6 w-48 bg-brand-text text-white text-[10px] p-2 rounded-lg shadow-lg z-50 pointer-events-none leading-relaxed border border-brand-accent">
                    {kpi.tooltip}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2 my-1">
              <span className="text-xl md:text-2xl font-bold text-brand-text tracking-tight">{kpi.value}</span>
              <div className="w-7 h-7 rounded-lg bg-brand-primary-light text-brand-primary flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
