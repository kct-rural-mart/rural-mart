import { useState } from 'react'
import { X, Download, Printer, FileText, CheckCircle2, Building2, Calendar, ShieldCheck, Users, Package, Briefcase, Info } from 'lucide-react'

export default function ReportPreviewModal({ config, onClose, onDownload }) {
  const [downloadSuccessFormat, setDownloadSuccessFormat] = useState(null)

  if (!config) return null

  const isOverall = config.scope === 'overall'
  const mart = config.mart
  const allMarts = config.allMarts || []

  const targetName = isOverall ? 'All Rural Marts Network' : `${mart?.name || 'Rural Mart'} Rural Mart`

  const categoryLabel = isOverall
    ? config.category === 'business'
      ? 'Business & Finance Master Audit'
      : config.category === 'farmers'
      ? 'Farmers & Outreach Master Report'
      : config.category === 'products'
      ? 'Products & Inventory Master Report'
      : 'Comprehensive State-Wide Audit Report'
    : 'Complete Comprehensive Operational & Audit Report'

  const reportTitle = `${targetName} — ${categoryLabel}`
  const generatedDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  const totalSalesRaw = isOverall ? allMarts.reduce((acc, m) => acc + (m.salesRaw || 0), 0) : mart?.salesRaw || 0
  const totalSalesLakhs = (totalSalesRaw / 100000).toFixed(2)
  const totalSalesCr = (totalSalesRaw / 10000000).toFixed(2)

  const totalFarmers = isOverall ? allMarts.reduce((acc, m) => acc + (m.registeredFarmers || 0), 0) : mart?.registeredFarmers || 0
  const totalFarmersReached = isOverall ? allMarts.reduce((acc, m) => acc + (m.farmersReached || 0), 0) : mart?.farmersReached || 0
  const totalFootfall = isOverall ? allMarts.reduce((acc, m) => acc + (m.farmerFootfall || 0), 0) : mart?.farmerFootfall || 0
  const avgScore = isOverall ? Math.round(allMarts.reduce((acc, m) => acc + (m.score || 0), 0) / (allMarts.length || 1)) : mart?.score || 0

  const grossProfitRaw = isOverall ? allMarts.reduce((acc, m) => acc + (m.grossProfitRaw || 0), 0) : mart?.grossProfitRaw || 0
  const grossProfitLakhs = (grossProfitRaw / 100000).toFixed(2)
  const marginPercent = ((grossProfitRaw / (totalSalesRaw || 1)) * 100).toFixed(1)

  const totalBills = Math.round(totalSalesRaw / 650)
  const avgBillVal = Math.round(totalSalesRaw / (totalBills || 1))
  const estimatedOpex = Math.round(totalSalesRaw * 0.08)

  const handleTriggerDownload = (format) => {
    setDownloadSuccessFormat(format)
    onDownload(reportTitle, format)
    setTimeout(() => setDownloadSuccessFormat(null), 3000)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between border-b border-brand-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-brand-primary-light text-brand-primary-dark border border-brand-primary/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary-light/70 px-2.5 py-0.5 rounded-full border border-brand-primary/20">
                  {isOverall ? 'Network Combined Master Report' : `${mart?.district || ''} District`}
                </span>
                <h2 className="text-xl font-bold text-brand-text mt-1">{reportTitle}</h2>
                <p className="text-xs text-brand-text-muted flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Date: {generatedDate}
                  </span>
                </p>
              </div>
            </div>

            <button onClick={onClose} className="p-1.5 rounded-lg text-brand-text-subtle hover:text-brand-text hover:bg-brand-bg-subtle transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {downloadSuccessFormat && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-success-light border border-brand-success/30 text-brand-success text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Report compilation successful! File downloaded as <strong>{downloadSuccessFormat}</strong>.
            </span>
          </div>
        )}

        <div className="bg-brand-bg-subtle border border-brand-border rounded-xl p-5 space-y-6 text-brand-text shadow-inner">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-brand-border pb-4 gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-brand-text uppercase tracking-wide">Rural Mart Monitoring &amp; Operations Audit</h3>
              <p className="text-[11px] text-brand-text-muted">Regional Rural Development &amp; Outpost Analytics</p>
            </div>
            <div className="text-left sm:text-right text-[11px] text-brand-text-muted">
              <p><strong>Doc Ref:</strong> RRM-AUD-{Date.now().toString().slice(-6)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-primary flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                1. Overall Mart Summary &amp; Audit Score
              </h4>
              <span className="text-[10px] font-bold text-brand-text-subtle">Section 1 of 4</span>
            </div>

            {!isOverall && mart ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-brand-surface border border-brand-border rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-brand-text-subtle uppercase">Mart Metadata</span>
                  <p className="text-xs font-bold text-brand-text">{mart.name} Mart</p>
                  <p className="text-[11px] text-brand-text-muted">District: {mart.district}</p>
                  <p className="text-[11px] text-brand-text-muted">Manager: {mart.manager}</p>
                  <p className="text-[11px] text-brand-text-muted">Contact: {mart.contact}</p>
                </div>

                <div className="p-3 bg-brand-surface border border-brand-border rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-brand-text-subtle uppercase">Audit Rating &amp; Status</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-brand-primary">{mart.score}</span>
                    <span className="text-xs text-brand-text-subtle">/ 100 Score</span>
                  </div>
                  <p className="text-[11px] text-brand-primary font-semibold">Target Benchmark: {mart.targetScore}/100</p>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary-light text-brand-primary-dark">{mart.status} Operational Outpost</span>
                </div>

                <div className="p-3 bg-brand-surface border border-brand-border rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-brand-text-subtle uppercase">Score Factor Breakdown</span>
                  <div className="text-[10px] space-y-1 text-brand-text-muted">
                    <div className="flex justify-between">
                      <span>Sales Growth:</span>
                      <strong className="text-brand-text">{mart.scoreBreakdown?.salesGrowth || 0}/20</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Profitability:</span>
                      <strong className="text-brand-text">{mart.scoreBreakdown?.profitability || 0}/20</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Farmer Engagement:</span>
                      <strong className="text-brand-text">{mart.scoreBreakdown?.farmerEngagement || 0}/20</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Compliance:</span>
                      <strong className="text-brand-text">{mart.scoreBreakdown?.compliance || 0}/10</strong>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-brand-surface border border-brand-border rounded-xl">
                  <span className="text-[10px] text-brand-text-subtle block font-medium">Network Size</span>
                  <span className="text-lg font-extrabold text-brand-text">{allMarts.length} Marts</span>
                </div>
                <div className="p-3 bg-brand-surface border border-brand-border rounded-xl">
                  <span className="text-[10px] text-brand-text-subtle block font-medium">Average Network Score</span>
                  <span className="text-lg font-extrabold text-brand-primary">{avgScore}/100</span>
                </div>
                <div className="p-3 bg-brand-surface border border-brand-border rounded-xl">
                  <span className="text-[10px] text-brand-text-subtle block font-medium">Total Sales</span>
                  <span className="text-lg font-extrabold text-brand-text">₹{totalSalesCr} Cr</span>
                </div>
                <div className="p-3 bg-brand-surface border border-brand-border rounded-xl">
                  <span className="text-[10px] text-brand-text-subtle block font-medium">Total Farmers</span>
                  <span className="text-lg font-extrabold text-brand-info">{totalFarmers.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-info flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                2. Business &amp; Finance Detail Report
              </h4>
              <span className="text-[10px] font-bold text-brand-text-subtle">Section 2 of 4</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-brand-surface border border-brand-border rounded-xl">
                <span className="text-[10px] text-brand-text-subtle block font-medium">Total Revenue / Sales</span>
                <span className="text-base font-extrabold text-brand-text">₹{totalSalesLakhs} Lakhs</span>
                <span className="text-[10px] text-brand-primary font-semibold block mt-0.5">₹{totalSalesRaw.toLocaleString()}</span>
              </div>

              <div className="p-3 bg-brand-surface border border-brand-border rounded-xl">
                <span className="text-[10px] text-brand-text-subtle block font-medium">Gross Profit Margin</span>
                <span className="text-base font-extrabold text-brand-primary">₹{grossProfitLakhs} Lakhs</span>
                <span className="text-[10px] text-brand-text-muted font-semibold block mt-0.5">{marginPercent}% Margin</span>
              </div>

              <div className="p-3 bg-brand-surface border border-brand-border rounded-xl">
                <span className="text-[10px] text-brand-text-subtle block font-medium">Bills Generated</span>
                <span className="text-base font-extrabold text-brand-text">{totalBills.toLocaleString()} Bills</span>
                <span className="text-[10px] text-brand-text-subtle block mt-0.5">Avg ₹{avgBillVal} / Bill</span>
              </div>

              <div className="p-3 bg-brand-surface border border-brand-border rounded-xl">
                <span className="text-[10px] text-brand-text-subtle block font-medium">Est. Operating Expenses</span>
                <span className="text-base font-extrabold text-brand-text">₹{(estimatedOpex / 100000).toFixed(2)} Lakhs</span>
                <span className="text-[10px] text-brand-text-subtle block mt-0.5">~8% Revenue Opex</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-warning-dark flex items-center gap-2">
                <Users className="w-4 h-4" />
                3. Farmers &amp; Outreach Detail Report
              </h4>
              <span className="text-[10px] font-bold text-brand-text-subtle">Section 3 of 4</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-brand-surface border border-brand-border rounded-xl">
                <span className="text-[10px] text-brand-text-subtle block font-medium">Registered Farmers</span>
                <span className="text-base font-extrabold text-brand-info">{totalFarmers.toLocaleString()}</span>
              </div>

              <div className="p-3 bg-brand-surface border border-brand-border rounded-xl">
                <span className="text-[10px] text-brand-text-subtle block font-medium">Active Farmers Reached</span>
                <span className="text-base font-extrabold text-brand-primary">{totalFarmersReached.toLocaleString()}</span>
                <span className="text-[10px] text-brand-primary font-semibold block mt-0.5">{((totalFarmersReached / (totalFarmers || 1)) * 100).toFixed(1)}% Active Reach</span>
              </div>

              <div className="p-3 bg-brand-surface border border-brand-border rounded-xl">
                <span className="text-[10px] text-brand-text-subtle block font-medium">Monthly Footfall</span>
                <span className="text-base font-extrabold text-brand-warning-dark">{totalFootfall.toLocaleString()} Visits</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-700 flex items-center gap-2">
                <Package className="w-4 h-4" />
                4. Products &amp; Inventory Detail Report
              </h4>
              <span className="text-[10px] font-bold text-brand-text-subtle">Section 4 of 4</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-brand-surface border border-brand-border rounded-xl">
                <span className="text-[10px] text-brand-text-subtle block font-medium">Inventory Valuation</span>
                <span className="text-base font-extrabold text-brand-text">₹{((totalSalesRaw * 0.35) / 100000).toFixed(2)} Lakhs</span>
                <span className="text-[10px] text-brand-text-subtle block mt-0.5">Estimated Stock Value</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2">5. Operational Consolidated Table</h4>

            <div className="bg-brand-surface border border-brand-border rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-brand-bg-subtle text-brand-text-muted border-b border-brand-border">
                    <th className="p-2.5 font-bold">Rural Mart Name</th>
                    <th className="p-2.5 font-bold">District</th>
                    <th className="p-2.5 font-bold text-right">Sales (Lakhs)</th>
                    <th className="p-2.5 font-bold text-right">Gross Profit</th>
                    <th className="p-2.5 font-bold text-right">Registered Farmers</th>
                    <th className="p-2.5 font-bold text-center">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {isOverall ? (
                    allMarts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-brand-text-subtle">No Rural Marts to report on yet.</td>
                      </tr>
                    ) : (
                      allMarts.map((m) => (
                        <tr key={m.id} className="hover:bg-brand-bg-subtle">
                          <td className="p-2.5 font-semibold text-brand-text">{m.name}</td>
                          <td className="p-2.5 text-brand-text-muted">{m.district}</td>
                          <td className="p-2.5 text-right font-semibold text-brand-text">₹{(m.salesRaw / 100000).toFixed(2)} L</td>
                          <td className="p-2.5 text-right text-brand-primary font-semibold">₹{m.grossProfitLakhs} L</td>
                          <td className="p-2.5 text-right text-brand-text-muted">{m.registeredFarmers.toLocaleString()}</td>
                          <td className="p-2.5 text-center font-bold text-brand-primary">{m.score}/100</td>
                        </tr>
                      ))
                    )
                  ) : (
                    <tr className="hover:bg-brand-bg-subtle">
                      <td className="p-2.5 font-semibold text-brand-text">{mart?.name}</td>
                      <td className="p-2.5 text-brand-text-muted">{mart?.district}</td>
                      <td className="p-2.5 text-right font-semibold text-brand-text">₹{((mart?.salesRaw || 0) / 100000).toFixed(2)} L</td>
                      <td className="p-2.5 text-right text-brand-primary font-semibold">₹{mart?.grossProfitLakhs} L</td>
                      <td className="p-2.5 text-right text-brand-text-muted">{mart?.registeredFarmers?.toLocaleString()}</td>
                      <td className="p-2.5 text-center font-bold text-brand-primary">{mart?.score}/100</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-brand-primary-light/50 rounded-xl border border-brand-primary/20 text-[11px] text-brand-primary-dark">
            <Info className="w-4 h-4 shrink-0" />
            <span>This document is generated from the current Rural Mart network data available in the system.</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-brand-border/60">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-brand-border text-brand-text hover:bg-brand-bg-subtle font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Preview</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={() => handleTriggerDownload('CSV')} className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-brand-bg-subtle hover:bg-brand-border/40 text-brand-text font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button onClick={() => handleTriggerDownload('Excel')} className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-brand-bg-subtle hover:bg-brand-border/40 text-brand-text font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
              <Download className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>

            <button onClick={() => handleTriggerDownload('PDF')} className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors">
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
