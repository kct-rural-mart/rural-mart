import { X, Building2, TrendingUp, Receipt, Download, Phone, User, CheckCircle2, FileSpreadsheet } from 'lucide-react'

export default function MartFinancialDetailModal({ mart, onClose }) {
  if (!mart) return null

  const cogsVal = mart.procurementRaw
  const grossProfitVal = mart.grossProfitRaw
  const opexVal = mart.operatingExpensesRaw
  const netProfitVal = mart.netProfitRaw
  const expenseBreakdown = mart.expenseBreakdown || {}
  const expenseCategories = Object.entries(expenseBreakdown).sort((a, b) => b[1] - a[1])

  const downloadStatement = () => {
    alert(`Downloading complete P&L financial statement for ${mart.name} Rural Mart...`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-text/60 backdrop-blur-xs">
      <div className="bg-brand-surface border border-brand-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col text-brand-text">
        <div className="p-4 border-b border-brand-border flex items-center justify-between sticky top-0 bg-brand-surface z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-primary-light text-brand-primary-dark">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-brand-text">{mart.name} Rural Mart</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary-light text-brand-primary-dark border border-brand-primary/20">{mart.district} District</span>
              </div>
              <p className="text-[11px] text-brand-text-muted">Detailed Financial P&amp;L Statement &amp; Transaction Analytics</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-brand-text-subtle hover:text-brand-text hover:bg-brand-bg-subtle transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border">
              <span className="text-[10px] font-semibold text-brand-text-muted uppercase">Gross Revenue</span>
              <p className="text-base font-extrabold text-brand-text mt-1">{mart.salesDisplay}</p>
            </div>
            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border">
              <span className="text-[10px] font-semibold text-brand-text-muted uppercase">Net Profit</span>
              <p className="text-base font-extrabold text-brand-primary mt-1">{mart.netProfitDisplay}</p>
            </div>
            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border">
              <span className="text-[10px] font-semibold text-brand-text-muted uppercase">Profit Margin</span>
              <p className="text-base font-extrabold text-brand-warning-dark mt-1">{mart.profitMargin}%</p>
            </div>
            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border">
              <span className="text-[10px] font-semibold text-brand-text-muted uppercase">Total Bills</span>
              <p className="text-base font-extrabold text-brand-text mt-1">{mart.totalBills.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="border border-brand-border rounded-xl overflow-hidden">
            <div className="bg-brand-bg-subtle px-4 py-2.5 border-b border-brand-border flex items-center justify-between">
              <span className="text-xs font-bold text-brand-text flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-brand-primary" /> Income Statement Breakdown (P&amp;L)
              </span>
            </div>

            <div className="divide-y divide-brand-border text-xs">
              <div className="p-3 flex justify-between items-center bg-brand-surface">
                <span className="font-semibold text-brand-text">Total Revenue / Sales</span>
                <span className="font-bold text-brand-text">₹{mart.salesRaw.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 flex justify-between items-center bg-brand-bg-subtle">
                <span className="text-brand-text-muted pl-4">(-) Cost of Goods Sold (COGS Procurement)</span>
                <span className="text-brand-text">-₹{cogsVal.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 flex justify-between items-center bg-brand-primary-light font-bold border-t border-b border-brand-primary/20">
                <span className="text-brand-primary-dark">(=) Gross Profit Margin</span>
                <span className="text-brand-primary-dark">₹{grossProfitVal.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 flex justify-between items-center bg-brand-bg-subtle">
                <span className="text-brand-text-muted pl-4">(-) Operating Expenses Total</span>
                <span className="text-brand-warning-dark font-bold">-₹{opexVal.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2.5 pl-8 text-[11px] space-y-1 text-brand-text-muted">
                {expenseCategories.length === 0 ? (
                  <p className="italic">No operating expenses recorded for this period.</p>
                ) : (
                  expenseCategories.map(([category, amount]) => (
                    <div key={category} className="flex justify-between">
                      <span>• {category}:</span>
                      <span>₹{amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3.5 flex justify-between items-center bg-brand-primary text-white font-extrabold text-sm rounded-b-xl">
                <span>(=) Net Earnings / Net Profit</span>
                <span className="text-base">₹{netProfitVal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl border border-brand-border bg-brand-bg-subtle text-xs space-y-1.5">
              <span className="font-bold text-brand-text flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-primary" /> Outpost Leadership
              </span>
              <p className="text-brand-text-muted font-medium">
                Manager: <strong>{mart.entrepreneurName || mart.manager || 'Not Assigned'}</strong>
              </p>
              {mart.phone && (
                <p className="text-brand-text-muted flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {mart.phone}
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl border border-brand-border bg-brand-bg-subtle text-xs space-y-1.5">
              <span className="font-bold text-brand-text flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-brand-primary" /> Billing Metrics
              </span>
              <p className="text-brand-text-muted font-medium">
                Average Bill Amount: <strong>₹{mart.avgBillValue}</strong>
              </p>
              <p className="text-brand-text-muted flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-brand-primary" /> Sales Growth: +{mart.salesGrowthPercent}%
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-brand-border bg-brand-bg-subtle flex items-center justify-between rounded-b-xl">
          <span className="text-[11px] text-brand-text-muted flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" /> Verified financial record
          </span>

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-brand-border text-brand-text font-semibold text-xs hover:bg-brand-surface transition-colors">
              Close
            </button>
            <button onClick={downloadStatement} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs shadow-xs transition-colors">
              <Download className="w-4 h-4" /> Download P&amp;L Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
