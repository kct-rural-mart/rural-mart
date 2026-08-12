import { useState } from 'react'
import { IndianRupee, PackageCheck, AlertTriangle, XCircle, Truck, ShoppingBag, Info } from 'lucide-react'

export default function ProductsKpiCards({ products }) {
  const [activeTooltip, setActiveTooltip] = useState(null)

  const totalVal = products.reduce((acc, p) => acc + (p.inventoryValue || 0), 0)
  const totalSKUs = products.length
  const lowStockCount = products.filter((p) => p.status === 'Low Stock').length
  const outOfStockCount = products.filter((p) => p.status === 'Out of Stock').length
  const procurementTotal = products.reduce((acc, p) => acc + (p.procurementQty || 0), 0)
  const salesTotal = products.reduce((acc, p) => acc + (p.salesQty || 0), 0)

  const kpis = [
    { id: 'inv-value', label: 'Inventory Value', value: `₹${(totalVal / 100000).toFixed(1)} L`, icon: IndianRupee, tooltip: 'Total valuation of all raw feed, bio-inputs, and products held across rural marts.' },
    { id: 'total-skus', label: 'Total Products', value: totalSKUs.toLocaleString('en-IN'), icon: PackageCheck, tooltip: 'Total registered active stock keeping units across agricultural input categories.' },
    { id: 'low-stock', label: 'Low-stock Products', value: lowStockCount.toString(), icon: AlertTriangle, tooltip: 'Products whose quantity has fallen below designated safety threshold levels.' },
    { id: 'out-of-stock', label: 'Out-of-stock Products', value: outOfStockCount.toString(), icon: XCircle, tooltip: 'Products with zero stock balance requiring immediate PO issuance.' },
    { id: 'procurement-qty', label: 'Procurement Quantity', value: procurementTotal.toLocaleString('en-IN'), icon: Truck, tooltip: 'Total inventory units procured from central warehouses and local FPGs.' },
    { id: 'sales-qty', label: 'Sales Quantity', value: salesTotal.toLocaleString('en-IN'), icon: ShoppingBag, tooltip: 'Total inventory units fulfilled and billed to registered member farmers.' },
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
