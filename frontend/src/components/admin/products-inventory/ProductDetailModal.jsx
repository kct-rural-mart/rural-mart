import { X, Package, Tag, Truck, Printer } from 'lucide-react'
import { formatLakhsCr } from '../../../lib/queries/finance'

export default function ProductDetailModal({ product, onClose }) {
  if (!product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-text/60 backdrop-blur-xs p-4">
      <div className="bg-brand-surface border border-brand-border rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-brand-bg-subtle/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-primary-light text-brand-primary-dark">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-brand-primary-dark bg-brand-primary-light px-2 py-0.5 rounded">{product.category}</span>
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
              <span className={`text-xl font-black font-mono ${product.status === 'Out of Stock' ? 'text-brand-danger' : 'text-brand-text'}`}>
                {product.stockQty.toLocaleString('en-IN')} {product.unit}
              </span>
              <span className="text-[10px] text-brand-text-subtle block mt-0.5">{product.status}</span>
            </div>

            <div className="p-3 rounded-2xl bg-brand-bg-subtle border border-brand-border/70">
              <span className="text-[10px] font-bold uppercase text-brand-text-subtle block">Selling Price</span>
              <span className="text-xl font-black font-mono text-brand-text">₹{product.sellingPrice.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-brand-text-subtle block mt-0.5">per {product.unit}</span>
            </div>

            <div className="p-3 rounded-2xl bg-brand-bg-subtle border border-brand-border/70">
              <span className="text-[10px] font-bold uppercase text-brand-text-subtle block">Inventory Valuation</span>
              <span className="text-xl font-black font-mono text-brand-primary">{formatLakhsCr(product.inventoryValue)}</span>
              <span className="text-[10px] text-brand-text-subtle block mt-0.5">Purchase price × current stock</span>
            </div>

            <div className="p-3 rounded-2xl bg-brand-bg-subtle border border-brand-border/70">
              <span className="text-[10px] font-bold uppercase text-brand-text-subtle block">Sales Volume</span>
              <span className="text-xl font-black font-mono text-brand-info">{product.soldQty.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-brand-text-subtle block mt-0.5">Units sold, selected period</span>
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
                  <span className="text-brand-text-subtle">Rural Mart:</span>
                  <span className="font-semibold text-brand-text">{product.ruralMart}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-text-subtle">District:</span>
                  <span className="font-semibold text-brand-text">{product.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-text-subtle">Purchase Price:</span>
                  <span className="font-semibold text-brand-text">₹{product.purchasePrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-2xl border border-brand-border/70">
              <h4 className="font-bold text-brand-text border-b border-brand-border/60 pb-1.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-brand-primary" />
                Procurement (Selected Period)
              </h4>
              <div className="space-y-2 text-brand-text-muted">
                <div className="flex justify-between">
                  <span className="text-brand-text-subtle">Quantity Procured:</span>
                  <span className="font-mono font-semibold">
                    {product.procuredQty.toLocaleString('en-IN')} {product.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-text-subtle">Procurement Cost:</span>
                  <span className="font-mono font-semibold">₹{product.procuredValue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-text-subtle">Sales Revenue:</span>
                  <span className="font-mono font-semibold text-brand-primary">₹{product.revenue.toLocaleString('en-IN')}</span>
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
