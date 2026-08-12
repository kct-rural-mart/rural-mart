import { useState } from 'react'
import { X, Download, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react'

export default function ExportModal({ isOpen, onClose, marts }) {
  const [exportFormat, setExportFormat] = useState('csv')
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  if (!isOpen) return null

  const handleDownload = () => {
    setDownloading(true)

    if (exportFormat === 'csv') {
      const headers = [
        'Rural Mart',
        'District',
        'Status',
        'Sales (Rupees)',
        'Gross Profit (Rupees)',
        'Registered Farmers',
        'Performance Score',
        'Data Completeness (%)',
        'Last Updated',
      ]

      const rows = marts.map((m) => [
        `"${m.name}"`,
        `"${m.district}"`,
        `"${m.status}"`,
        m.salesRaw,
        m.grossProfitRaw,
        m.registeredFarmers,
        m.score,
        m.dataCompleteness,
        `"${m.lastUpdated}"`,
      ])

      const csvContent =
        'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `Rural_Mart_Executive_Overview_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      window.print()
    }

    setTimeout(() => {
      setDownloading(false)
      setDownloaded(true)
      setTimeout(() => {
        setDownloaded(false)
        onClose()
      }, 1200)
    }, 600)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-brand-primary" />
            <h2 className="text-base font-bold text-brand-text">Export Executive Report</h2>
          </div>
          <button onClick={onClose} className="text-brand-text-subtle hover:text-brand-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-brand-text-muted">
          Generate and download complete network performance data, financial metrics, and score cards across all {marts.length} Rural Marts.
        </p>

        <div className="space-y-2">
          <label className="text-xs font-bold text-brand-text uppercase tracking-wider">Select Format:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setExportFormat('csv')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                exportFormat === 'csv'
                  ? 'bg-brand-primary-light border-brand-primary text-brand-primary-dark'
                  : 'bg-brand-bg-subtle border-brand-border text-brand-text-muted'
              }`}
            >
              <FileSpreadsheet className="w-6 h-6 text-brand-primary" />
              <span>CSV Spreadsheet</span>
            </button>

            <button
              onClick={() => setExportFormat('pdf')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                exportFormat === 'pdf'
                  ? 'bg-brand-primary-light border-brand-primary text-brand-primary-dark'
                  : 'bg-brand-bg-subtle border-brand-border text-brand-text-muted'
              }`}
            >
              <FileText className="w-6 h-6 text-brand-accent" />
              <span>Printable PDF</span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-brand-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-brand-text-muted hover:bg-brand-bg-subtle text-xs font-semibold">
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading || downloaded}
            className="px-5 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
          >
            {downloaded ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Export Complete
              </>
            ) : downloading ? (
              'Generating File...'
            ) : (
              <>
                <Download className="w-4 h-4" /> Download Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
