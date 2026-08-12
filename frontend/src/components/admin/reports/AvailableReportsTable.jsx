import { useState } from 'react'
import { FileText, Download, Eye, FileType, FileSpreadsheet } from 'lucide-react'

function getTypeBadgeStyle(type) {
  switch (type) {
    case 'Combined Network':
      return 'bg-brand-primary-light text-brand-primary-dark border-brand-primary/20'
    case 'Individual Mart':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'Business & Finance':
      return 'bg-brand-info-light text-brand-info-dark border-brand-info-border'
    case 'Farmers & Outreach':
      return 'bg-brand-warning-light text-brand-warning-dark border-brand-warning-border'
    case 'Products & Inventory':
      return 'bg-teal-100 text-teal-800 border-teal-200'
    default:
      return 'bg-brand-bg-subtle text-brand-text-muted border-brand-border'
  }
}

export default function AvailableReportsTable({ reports, onPreviewReport, onDownloadReport }) {
  const [activeCategoryTab, setActiveCategoryTab] = useState('All')

  const categories = ['All', 'Financial', 'Operations', 'Outreach', 'Inventory', 'Compliance']

  const filteredReports = reports.filter((r) => activeCategoryTab === 'All' || r.category === activeCategoryTab)

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-primary-light text-brand-primary-dark">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-brand-text">Available Reports</h3>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryTab(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategoryTab === cat ? 'bg-brand-primary text-white shadow-sm' : 'bg-brand-bg-subtle text-brand-text-muted hover:bg-brand-border/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-brand-border bg-brand-bg-subtle/70 text-brand-text-muted font-semibold uppercase tracking-wider">
              <th className="py-3 px-3">Report Name</th>
              <th className="py-3 px-3">Report Type</th>
              <th className="py-3 px-3">Reporting Period</th>
              <th className="py-3 px-3">Format</th>
              <th className="py-3 px-3 text-right">Actions / Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/60">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-brand-text-subtle">
                  No reports match the current filter selection.
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-brand-bg-subtle transition-colors group">
                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-bold text-brand-text group-hover:text-brand-primary transition-colors">{report.name}</div>
                    <p className="text-[11px] text-brand-text-muted line-clamp-1 mt-0.5">{report.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-brand-text-subtle">
                      <span>Size: {report.size}</span>
                      <span>•</span>
                      <span>Downloads: {report.downloadsCount}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getTypeBadgeStyle(report.type)}`}>{report.type}</span>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap text-brand-text font-medium">{report.reportingPeriod}</td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {report.format.includes('PDF') && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-danger-light text-brand-danger border border-brand-danger-border text-[10px] font-bold">
                          <FileType className="w-3 h-3" /> PDF
                        </span>
                      )}
                      {report.format.includes('Excel') && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-success-light text-brand-success text-[10px] font-bold">
                          <FileSpreadsheet className="w-3 h-3" /> EXCEL
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => onPreviewReport(report)} className="p-1.5 rounded-lg text-brand-text-muted hover:bg-brand-bg-subtle transition-colors" title="Preview & Custom Options">
                        <Eye className="w-4 h-4" />
                      </button>

                      {report.format.includes('PDF') && (
                        <button
                          onClick={() => onDownloadReport(report, 'PDF')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-danger hover:bg-red-700 text-white font-bold text-[11px] shadow-sm transition-all"
                          title="Download PDF"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      )}

                      {report.format.includes('Excel') && (
                        <button
                          onClick={() => onDownloadReport(report, 'Excel')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-success hover:bg-green-700 text-white font-bold text-[11px] shadow-sm transition-all"
                          title="Download Excel"
                        >
                          <Download className="w-3 h-3" />
                          <span>XLSX</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
