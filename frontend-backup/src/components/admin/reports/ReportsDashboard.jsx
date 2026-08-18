import { useMemo, useState } from 'react'
import {
  FileText,
  Briefcase,
  Users,
  Package,
  Search,
  Filter,
  Download,
  Building2,
  CheckCircle2,
  Globe,
  Sparkles,
  Plus,
} from 'lucide-react'
import { getReportsRuralMarts } from '../../../lib/newPages/shared/dataServices'
import { AVAILABLE_REPORTS_DATA } from '../../../lib/newPages/mockData'
import ReportsKpiCards from './ReportsKpiCards'
import AvailableReportsTable from './AvailableReportsTable'
import ReportsCharts from './ReportsCharts'
import RecentExportHistoryTable from './RecentExportHistoryTable'
import ReportGenerateModal from './ReportGenerateModal'
import ReportPreviewModal from './ReportPreviewModal'

export default function ReportsDashboard({ filters }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts')
  const [previewConfig, setPreviewConfig] = useState(null)
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [exportHistory, setExportHistory] = useState([])

  const allMarts = useMemo(() => getReportsRuralMarts(), [])

  const [toast, setToast] = useState({ show: false, message: '' })

  const triggerToast = (message) => {
    setToast({ show: true, message })
    setTimeout(() => setToast({ show: false, message: '' }), 4000)
  }

  const recordExport = (reportName, format) => {
    setExportHistory((prev) => [
      {
        id: `exp-${Date.now()}`,
        dateTime: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        reportName,
        generatedBy: 'Admin',
        format,
        status: 'Completed',
        fileSize: format === 'PDF' ? '1.1 MB' : format === 'Excel' ? '0.6 MB' : '0.2 MB',
      },
      ...prev,
    ])
  }

  const districts = useMemo(() => {
    const list = Array.from(new Set(allMarts.map((m) => m.district)))
    return ['All Districts', ...list]
  }, [allMarts])

  const filteredMarts = useMemo(() => {
    return allMarts.filter((mart) => {
      const matchesSearch = searchQuery.trim() === '' || mart.name.toLowerCase().includes(searchQuery.toLowerCase()) || mart.district.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDistrict = selectedDistrict === 'All Districts' || mart.district === selectedDistrict
      return matchesSearch && matchesDistrict
    })
  }, [allMarts, searchQuery, selectedDistrict])

  const handleOpenIndividualPreview = (mart, category) => {
    setPreviewConfig({ scope: 'individual', category, mart, allMarts })
  }

  const handleOpenOverallPreview = (category) => {
    setPreviewConfig({ scope: 'overall', category, mart: null, allMarts })
  }

  const handleModalDownload = (reportTitle, format) => {
    recordExport(reportTitle, format)
    triggerToast(`Downloaded "${reportTitle}" in ${format} format successfully.`)
  }

  const handleTableDownload = (report, format) => {
    recordExport(report.name, format)
    triggerToast(`Downloaded "${report.name}" in ${format} format successfully.`)
  }

  const handleGenerateConfirm = (params) => {
    recordExport(params.reportTitle, params.format)
    setIsGenerateModalOpen(false)
    triggerToast(`Generated "${params.reportTitle}" in ${params.format} format successfully.`)
  }

  return (
    <div className="space-y-6 pb-8">
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-brand-primary text-white shadow-2xl border border-white/20 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      <section>
        <ReportsKpiCards availableReports={AVAILABLE_REPORTS_DATA} exportHistory={exportHistory} />
      </section>

      <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-brand-primary-light text-brand-primary-dark">
                <FileText className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-brand-text">Reports &amp; Document Generation</h1>
            </div>
            <p className="text-xs text-brand-text-muted mt-1">
              Generate and download compliance reports for individual Rural Marts or aggregate network summaries.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-brand-primary-light text-brand-primary-dark border border-brand-primary/20 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              {allMarts.length} Outposts Online
            </span>
            <button
              onClick={() => setIsGenerateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate Custom Report</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-brand-border/60">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-subtle" />
            <input
              type="text"
              placeholder="Search Rural Mart by name or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-brand-text-subtle shrink-0" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/30 cursor-pointer"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <section className="bg-brand-surface border border-brand-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-brand-primary-light text-brand-primary-dark">
                <Globe className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-extrabold text-brand-text">Download Overall Report — All Rural Marts Network</h2>
            </div>
            <p className="text-xs text-brand-text-muted mt-1">
              Generate unified executive audit reports combining metrics across all {allMarts.length} active Rural Mart outposts.
            </p>
          </div>

          <span className="text-xs font-bold text-brand-primary-dark bg-brand-primary-light/70 border border-brand-primary/20 px-3 py-1 rounded-full shrink-0">
            State-Wide Consolidated Audit
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-brand-bg-subtle border border-brand-border rounded-xl p-4 flex flex-col justify-between hover:border-brand-primary/50 transition-all">
            <div>
              <div className="p-2.5 rounded-lg bg-brand-primary-light text-brand-primary-dark w-fit mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-brand-text">Overall Network Master Report</h3>
              <p className="text-[11px] text-brand-text-muted mt-1">
                Complete operational, financial, farmer outreach &amp; inventory audit for all {allMarts.length} Rural Marts.
              </p>
            </div>

            <button
              onClick={() => handleOpenOverallPreview('overall')}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Preview &amp; Download</span>
            </button>
          </div>

          <div className="bg-brand-bg-subtle border border-brand-border rounded-xl p-4 flex flex-col justify-between hover:border-brand-info/50 transition-all">
            <div>
              <div className="p-2.5 rounded-lg bg-brand-info-light text-brand-info-dark w-fit mb-2">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-brand-text">Network Business &amp; Finance</h3>
              <p className="text-[11px] text-brand-text-muted mt-1">Aggregated sales volume, gross profit margins, operating costs &amp; bill analytics.</p>
            </div>

            <button
              onClick={() => handleOpenOverallPreview('business')}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-brand-info hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Preview &amp; Download</span>
            </button>
          </div>

          <div className="bg-brand-bg-subtle border border-brand-border rounded-xl p-4 flex flex-col justify-between hover:border-brand-warning/50 transition-all">
            <div>
              <div className="p-2.5 rounded-lg bg-brand-warning-light text-brand-warning-dark w-fit mb-2">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-brand-text">Network Farmers &amp; Outreach</h3>
              <p className="text-[11px] text-brand-text-muted mt-1">Total farmer registrations, active reach, footfall metrics &amp; retention logs.</p>
            </div>

            <button
              onClick={() => handleOpenOverallPreview('farmers')}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-brand-warning hover:bg-brand-warning-dark text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Preview &amp; Download</span>
            </button>
          </div>

          <div className="bg-brand-bg-subtle border border-brand-border rounded-xl p-4 flex flex-col justify-between hover:border-purple-400/50 transition-all">
            <div>
              <div className="p-2.5 rounded-lg bg-purple-100 text-purple-800 w-fit mb-2">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-brand-text">Network Products &amp; Inventory</h3>
              <p className="text-[11px] text-brand-text-muted mt-1">State-wide catalog stock health, fast/slow moving SKU analysis &amp; reorder alerts.</p>
            </div>

            <button
              onClick={() => handleOpenOverallPreview('products')}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Preview &amp; Download</span>
            </button>
          </div>
        </div>
      </section>

      <section>
        <AvailableReportsTable
          reports={AVAILABLE_REPORTS_DATA}
          onPreviewReport={(report) => setPreviewConfig({ scope: 'overall', category: 'overall', mart: null, allMarts })}
          onDownloadReport={handleTableDownload}
        />
      </section>

      <section>
        <ReportsCharts />
      </section>

      <section>
        <RecentExportHistoryTable
          history={exportHistory}
          onRedownload={(record) => triggerToast(`Re-downloaded "${record.reportName}".`)}
          onRetry={(record) => triggerToast(`Retrying "${record.reportName}"...`)}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-text flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-primary" />
              Individual Rural Mart Reports
            </h2>
            <p className="text-[11px] text-brand-text-muted">Click any report category button on a Rural Mart tile to preview and download its specific report.</p>
          </div>
          <span className="text-xs font-bold text-brand-text-muted bg-brand-bg-subtle px-2.5 py-1 rounded-lg border border-brand-border">Showing {filteredMarts.length} Marts</span>
        </div>

        {filteredMarts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No Rural Marts yet</div>
            <p>Individual mart reports will appear here once marts are onboarded.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMarts.map((mart) => (
              <div key={mart.id} className="bg-brand-surface border border-brand-border rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-brand-text">{mart.name}</h3>
                      <span className="text-[10px] font-bold text-brand-primary bg-brand-primary-light/80 px-2 py-0.5 rounded-full border border-brand-primary/20 inline-block mt-0.5">{mart.district} District</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-brand-primary block">Score: {mart.score}/100</span>
                      <span className="text-[10px] text-brand-text-subtle">Target: {mart.targetScore}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 p-2 rounded-xl bg-brand-bg-subtle border border-brand-border/70 text-[11px]">
                    <div>
                      <span className="text-brand-text-subtle block text-[10px]">Sales Volume</span>
                      <span className="font-bold text-brand-text">₹{(mart.salesRaw / 100000).toFixed(1)} Lakhs</span>
                    </div>
                    <div>
                      <span className="text-brand-text-subtle block text-[10px]">Farmers</span>
                      <span className="font-bold text-brand-text">{mart.registeredFarmers.toLocaleString()} Reg.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-brand-border/60">
                  <button
                    onClick={() => handleOpenIndividualPreview(mart, 'overall')}
                    className="w-full py-2.5 px-3 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Preview &amp; Download Report</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <ReportPreviewModal config={previewConfig} onClose={() => setPreviewConfig(null)} onDownload={handleModalDownload} />

      <ReportGenerateModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        initialReport={null}
        filters={filters}
        allMarts={allMarts}
        onConfirmGenerate={handleGenerateConfirm}
      />
    </div>
  )
}
