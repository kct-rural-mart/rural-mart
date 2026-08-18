import { useState } from 'react'
import { X, Download, Filter, BarChart3, ShieldCheck, CheckCircle2, FileType, FileSpreadsheet } from 'lucide-react'

export default function ReportGenerateModal({ isOpen, onClose, initialReport, filters, allMarts, onConfirmGenerate }) {
  const [reportTitle, setReportTitle] = useState(initialReport ? initialReport.name : 'Custom Consolidated Rural Mart Audit Report')
  const [reportType, setReportType] = useState(initialReport ? initialReport.type : 'Combined Network')
  const [district, setDistrict] = useState(filters.district !== 'All Districts' ? filters.district : 'All')
  const [ruralMart, setRuralMart] = useState(filters.ruralMart !== 'All Rural Marts' ? filters.ruralMart : 'All')
  const [dateRange, setDateRange] = useState(filters.dateRange || 'Last 30 Days')
  const [format, setFormat] = useState('PDF')
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeAuditWatermark, setIncludeAuditWatermark] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  if (!isOpen) return null

  const networkSalesRaw = allMarts.reduce((sum, m) => sum + (m.salesRaw || 0), 0)
  const activeMartsCount = allMarts.filter((m) => m.status === 'Active').length
  const farmersReachedTotal = allMarts.reduce((sum, m) => sum + (m.farmersReached || 0), 0)

  const handleDownload = (selectedFormat) => {
    setFormat(selectedFormat)
    setIsGenerating(true)

    setTimeout(() => {
      setIsGenerating(false)
      onConfirmGenerate({
        reportTitle,
        reportType,
        district,
        ruralMart,
        dateRange,
        format: selectedFormat,
        includeCharts,
        includeAuditWatermark,
      })
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-text/60 backdrop-blur-sm">
      <div className="bg-brand-surface border border-brand-border rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="p-5 border-b border-brand-border flex items-center justify-between sticky top-0 bg-brand-surface/95 backdrop-blur z-10">
          <div>
            <h2 className="text-lg font-black text-brand-text">Generate &amp; Preview Report</h2>
            <p className="text-xs text-brand-text-muted">Customize parameters and download an executive compliance document</p>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-brand-text-subtle hover:text-brand-text hover:bg-brand-bg-subtle transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          <div className="bg-brand-bg-subtle border border-brand-border/70 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-brand-primary" />
              1. Report Configuration &amp; Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Report Title</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Report Category / Scope</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="Combined Network">Combined Network Report</option>
                  <option value="Individual Mart">Individual Rural Mart Report</option>
                  <option value="Business & Finance">Business & Finance Report</option>
                  <option value="Farmers & Outreach">Farmers & Outreach Report</option>
                  <option value="Products & Inventory">Products & Inventory Report</option>
                  <option value="Comparison">Comparison Report</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Target District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="All">All Districts</option>
                  <option value="Erode">Erode District</option>
                  <option value="Coimbatore">Coimbatore District</option>
                  <option value="Tiruppur">Tiruppur District</option>
                  <option value="Salem">Salem District</option>
                  <option value="Madurai">Madurai District</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Reporting Period</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="This Month">This Month</option>
                  <option value="Last Quarter">Last Quarter</option>
                  <option value="Financial Year 2026-27">Financial Year 2026-27</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-brand-border/60">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-brand-text">
                <input type="checkbox" checked={includeCharts} onChange={(e) => setIncludeCharts(e.target.checked)} />
                <BarChart3 className="w-3.5 h-3.5 text-brand-primary" />
                Include Graphical Charts &amp; Visual Analytics
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-brand-text">
                <input type="checkbox" checked={includeAuditWatermark} onChange={(e) => setIncludeAuditWatermark(e.target.checked)} />
                <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
                Attach Official Digital Verification Seal
              </label>
            </div>
          </div>

          <div className="bg-brand-surface border-2 border-brand-primary/30 rounded-2xl p-5 shadow-inner space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-primary" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary-dark">Live Document Preview</h4>
                  <p className="text-[11px] text-brand-text-muted">Rural Mart Executive Audit Standard</p>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary bg-brand-primary-light px-2.5 py-1 rounded-full">{format} Format Ready</span>
            </div>

            <div className="space-y-3 font-mono text-xs text-brand-text bg-brand-bg-subtle p-4 rounded-xl border border-brand-border/60">
              <div className="text-center border-b border-brand-border pb-2">
                <p className="font-bold uppercase text-sm tracking-wide text-brand-primary-dark">{reportTitle}</p>
                <p className="text-[10px] text-brand-text-muted">
                  Period: {dateRange} | Scope: {district} District ({ruralMart})
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                <div className="bg-brand-surface p-2 rounded border border-brand-border">
                  <span className="block text-[10px] text-brand-text-subtle">Network Sales:</span>
                  <span className="font-bold text-brand-accent">₹{(networkSalesRaw / 10000000).toFixed(2)} Crore</span>
                </div>
                <div className="bg-brand-surface p-2 rounded border border-brand-border">
                  <span className="block text-[10px] text-brand-text-subtle">Active Marts:</span>
                  <span className="font-bold text-brand-text">{activeMartsCount} of {allMarts.length} Outposts</span>
                </div>
                <div className="bg-brand-surface p-2 rounded border border-brand-border">
                  <span className="block text-[10px] text-brand-text-subtle">Farmers Reached:</span>
                  <span className="font-bold text-brand-info">{farmersReachedTotal.toLocaleString('en-IN')} Members</span>
                </div>
                <div className="bg-brand-surface p-2 rounded border border-brand-border">
                  <span className="block text-[10px] text-brand-text-subtle">Doc Reference:</span>
                  <span className="font-bold text-brand-accent">RRM-{Date.now().toString().slice(-6)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-brand-border bg-brand-bg-subtle/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-brand-text-muted">
            <CheckCircle2 className="w-4 h-4 text-brand-primary" />
            <span>Select preferred format to download instantly:</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleDownload('PDF')}
              disabled={isGenerating}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-danger hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              <FileType className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={() => handleDownload('Excel')}
              disabled={isGenerating}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-success hover:bg-green-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Excel</span>
            </button>

            <button
              onClick={() => handleDownload('CSV')}
              disabled={isGenerating}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-brand-bg-subtle hover:bg-brand-border/40 text-brand-text font-bold text-xs transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
