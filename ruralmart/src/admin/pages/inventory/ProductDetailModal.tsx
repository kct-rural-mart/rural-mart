import React from 'react';
import {
  X,
  Package,
  MapPin,
  Tag,
  IndianRupee,
  Calendar,
  AlertCircle,
  Truck,
  CheckCircle2,
  Printer,
  ShoppingBag,
} from 'lucide-react';
import { ProductInventoryRecord } from '../../../shared/types';

interface ProductDetailModalProps {
  product: ProductInventoryRecord | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  if (!product) return null;

  const stockPercentage = Math.min(
    Math.round((product.stockQty / (product.reorderLevel * 3)) * 100),
    100
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-emerald-950 border border-slate-200 dark:border-emerald-800/60 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-emerald-900/40 flex items-center justify-between bg-slate-50/50 dark:bg-emerald-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                  {product.code}
                </span>
                <span className="text-xs text-slate-500 dark:text-emerald-400/80">
                  ID: {product.id}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-emerald-50 tracking-tight mt-0.5">
                {product.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-900/40">
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-emerald-400/70 block">
                Stock Balance
              </span>
              <span className="text-xl font-black font-mono text-slate-900 dark:text-emerald-100">
                {product.stockQty.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-emerald-400 block mt-0.5">
                Reorder @ {product.reorderLevel}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-900/40">
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-emerald-400/70 block">
                Unit Cost
              </span>
              <span className="text-xl font-black font-mono text-slate-900 dark:text-emerald-100">
                ₹{product.unitPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-emerald-400 block mt-0.5">
                GST Included
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-900/40">
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-emerald-400/70 block">
                Inventory Valuation
              </span>
              <span className="text-xl font-black font-mono text-emerald-800 dark:text-emerald-300">
                ₹{product.inventoryValue.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-emerald-400 block mt-0.5">
                Total Holding Value
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-900/40">
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-emerald-400/70 block">
                Sales Volume
              </span>
              <span className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-300">
                {product.salesQty.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-emerald-400 block mt-0.5">
                YTD Units Sold
              </span>
            </div>
          </div>

          {/* Reorder Threshold Bar */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-emerald-800/40 bg-slate-50/50 dark:bg-emerald-900/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-emerald-200">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-emerald-600" />
                Safety Stock & Reorder Gauge
              </span>
              <span className="font-mono">{product.status}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-emerald-950 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  product.status === 'Out of Stock'
                    ? 'bg-rose-500'
                    : product.status === 'Low Stock'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(stockPercentage, 5)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-emerald-400/70 font-mono">
              <span>0 Units</span>
              <span>Reorder: {product.reorderLevel} Units</span>
              <span>Target: {product.reorderLevel * 3} Units</span>
            </div>
          </div>

          {/* Detailed Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3 p-4 rounded-2xl border border-slate-100 dark:border-emerald-900/30">
              <h4 className="font-bold text-slate-900 dark:text-emerald-100 border-b pb-1.5 dark:border-emerald-900/40 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                Product Classification
              </h4>
              <div className="space-y-2 text-slate-600 dark:text-emerald-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hub Mart:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{product.ruralMart} Rural Mart</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">District:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{product.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Restocked:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{product.lastRestocked}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-2xl border border-slate-100 dark:border-emerald-900/30">
              <h4 className="font-bold text-slate-900 dark:text-emerald-100 border-b pb-1.5 dark:border-emerald-900/40 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                Procurement & Fulfillment
              </h4>
              <div className="space-y-2 text-slate-600 dark:text-emerald-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Procured YTD:</span>
                  <span className="font-mono font-semibold">{product.procurementQty} Units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Primary Supplier:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">EDF Central Agri Supply Depot</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Restock Lead Time:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">2 to 3 Business Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Subsidy Approved:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Yes (NABARD 15% Pass)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-emerald-900/40 bg-slate-50/50 dark:bg-emerald-900/30 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-emerald-800 text-xs font-semibold text-slate-700 dark:text-emerald-200 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Stock Card</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-emerald-800 dark:bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-900 dark:hover:bg-emerald-500 transition-colors shadow-sm"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
