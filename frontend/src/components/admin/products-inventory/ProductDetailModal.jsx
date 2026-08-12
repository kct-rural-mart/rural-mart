import { X, Package, Tag, AlertCircle, Truck, Printer } from 'lucide-react'

export default function ProductDetailModal({ product, onClose }) {
  if (!product) return null

  const stockPercentage = Math.min(Math.round((product.stockQty / (product.reorderLevel * 3 || 1)) * 100), 100)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-text/60 backdrop-blur-xs p-4">
      <div className="bg-brand-surface border border-brand-border rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-brand-bg-subtle/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-primary-light text-brand-primary-dark">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-brand-primary-dark bg-brand-primary-light px-2 py-0.5 rounded">{product.code}</span>
                <span className="text-xs text-brand-text-muted">ID: {product.id}</span>
              </div>
              <h2 className="text-lg font-black text-brand-text tracking-tight mt-0.5">{product.name}</h2>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-brand-text-subtle hover:text-brand-text hover:bg-brand-bg-subtle transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-brand-bg-subtle border border-brand-border/70">
              <span className="text-[10px] font-bold uppercase text-brand-text-subtle block">Stock Balance</span>
              <span className="text-xl font-black font-mono text-brand-text">{product.stockQty.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-brand-text-muted block mt-0.5">Reorder @ {product.reorderLevel}</span>
            </div>

            <div className="p-3 rounded-2xl bg-brand-bg-subtle border border-brand-border/70">
              <span className="text-[10px] font-bold uppercase text-brand-text-subtle block">Unit Cost</span>
              <span className="text-xl font-black font-mono text-brand-text">₹{product.unitPrice.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-brand-text-muted block mt-0.5">GST Included</span>
            </div>

            <div className="p-3 rounded-2xl bg-brand-bg-subtle border border-brand-border/70">
              <span className="text-[10px] font-bold uppercase text-brand-text-subtle block">Inventory Valuation</span>
              <span className="text-xl font-black font-mono text-brand-primary">₹{product.inventoryValue.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-brand-text-muted block mt-0.5">Total Holding Value</span>
            </div>

            <div className="p-3 rounded-2xl bg-brand-bg-subtle border border-brand-border/70">
              <span className="text-[10px] font-bold uppercase text-brand-text-subtle block">Sales Volume</span>
              <span className="text-xl font-black font-mono text-brand-info">{product.salesQty.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-brand-text-muted block mt-0.5">YTD Units Sold</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-brand-border bg-brand-bg-subtle/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-brand-text">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-brand-primary" />
                Safety Stock &amp; Reorder Gauge
              </span>
              <span className="font-mono">{product.status}</span>
            </div>
            <div className="w-full bg-brand-border h-3 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  product.status === 'Out of Stock' ? 'bg-brand-danger' : product.status === 'Low Stock' ? 'bg-brand-warning' : 'bg-brand-primary'
                }`}
                style={{ width: `${Math.max(stockPercentage, 5)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-brand-text-subtle font-mono">
              <span>0 Units</span>
              <span>Reorder: {product.reorderLevel} Units</span>
              <span>Target: {product.reorderLevel * 3} Units</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3 p-4 rounded-2xl border border-brand-border/70">
              <h4 className="font-bold text-brand-text border-b border-brand-border/60 pb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand-primary" />
                Product Classification
              </h4>
              <div className="space-y-2 text-brand-text-muted">
                <div className="flex justify-between">
                  <span className="text-brand-text-subtle">Category:</span>
                  <span className="font-semibold text-brand-text">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-text-subtle">Hub Mart:</span>
                  <span className="font-semibold text-brand-text">{product.ruralMart} Rural Mart</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-text-subtle">District:</span>
                  <span className="font-semibold text-brand-text">{product.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-text-subtle">Last Restocked:</span>
                  <span className="font-semibold text-brand-text">{product.lastRestocked}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-2xl border border-brand-border/70">
              <h4 className="font-bold text-brand-text border-b border-brand-border/60 pb-1.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-brand-primary" />
                Procurement
              </h4>
              <div className="space-y-2 text-brand-text-muted">
                <div className="flex justify-between">
                  <span className="text-brand-text-subtle">Procured YTD:</span>
                  <span className="font-mono font-semibold">{product.procurementQty} Units</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-brand-border bg-brand-bg-subtle/50 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-border text-xs font-semibold text-brand-text hover:bg-brand-bg-subtle transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Stock Card</span>
          </button>

          <button onClick={onClose} className="px-4 py-1.5 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-primary-dark transition-colors shadow-sm">
            Close Details
          </button>
        </div>
      </div>
    </div>
  )
}
