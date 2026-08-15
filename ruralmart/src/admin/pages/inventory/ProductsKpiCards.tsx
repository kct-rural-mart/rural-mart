import React, { useState } from 'react';
import {
  IndianRupee,
  PackageCheck,
  AlertTriangle,
  XCircle,
  Truck,
  ShoppingBag,
  Info,
} from 'lucide-react';
import { ProductInventoryRecord } from '../../../shared/types';

interface ProductsKpiCardsProps {
  products: ProductInventoryRecord[];
}

export const ProductsKpiCards: React.FC<ProductsKpiCardsProps> = ({ products }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const totalVal = products.reduce((acc, p) => acc + (p.inventoryValue || 0), 0);
  const totalSKUs = products.length;
  const lowStockCount = products.filter((p) => p.status === 'Low Stock').length;
  const outOfStockCount = products.filter((p) => p.status === 'Out of Stock').length;
  const procurementTotal = products.reduce((acc, p) => acc + (p.procurementQty || 0), 0);
  const salesTotal = products.reduce((acc, p) => acc + (p.salesQty || 0), 0);

  const kpis = [
    {
      id: 'inv-value',
      label: 'Inventory Value',
      value: `₹${(totalVal / 100000).toFixed(1)} L`,
      icon: IndianRupee,
      tooltip: 'Total valuation of all raw feed, bio-inputs, and products held across rural marts.',
    },
    {
      id: 'total-skus',
      label: 'Total Products',
      value: totalSKUs.toLocaleString('en-IN'),
      icon: PackageCheck,
      tooltip: 'Total registered active stock keeping units across agricultural input categories.',
    },
    {
      id: 'low-stock',
      label: 'Low-stock Products',
      value: lowStockCount.toString(),
      icon: AlertTriangle,
      tooltip: 'Products whose quantity has fallen below designated safety threshold levels.',
    },
    {
      id: 'out-of-stock',
      label: 'Out-of-stock Products',
      value: outOfStockCount.toString(),
      icon: XCircle,
      tooltip: 'Products with zero stock balance requiring immediate PO issuance.',
    },
    {
      id: 'procurement-qty',
      label: 'Procurement Quantity',
      value: procurementTotal.toLocaleString('en-IN'),
      icon: Truck,
      tooltip: 'Total inventory units procured from central warehouses and local FPGs.',
    },
    {
      id: 'sales-qty',
      label: 'Sales Quantity',
      value: salesTotal.toLocaleString('en-IN'),
      icon: ShoppingBag,
      tooltip: 'Total inventory units fulfilled and billed to registered member farmers.',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isTooltipOpen = activeTooltip === kpi.id;

        return (
          <div
            key={kpi.id}
            className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-3.5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 cursor-pointer relative flex flex-col justify-between group"
          >
            {/* Top Row: Label & Info Icon */}
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase tracking-wider truncate">
                {kpi.label}
              </span>
              <div className="relative flex items-center">
                <button
                  onMouseEnter={() => setActiveTooltip(kpi.id)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(isTooltipOpen ? null : kpi.id)}
                  className="text-[#8A958F] hover:text-[#174F3A] dark:text-[#61736A] dark:hover:text-[#A3E6C5] transition-colors p-0.5"
                  title="More information"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                {/* Info Tooltip Popover */}
                {isTooltipOpen && (
                  <div className="absolute right-0 top-6 w-48 bg-[#17221D] text-white dark:bg-[#16241E] dark:text-[#E6ECE8] text-[10px] p-2 rounded-lg shadow-lg z-50 pointer-events-none leading-relaxed border border-[#34735A]">
                    {kpi.tooltip}
                  </div>
                )}
              </div>
            </div>

            {/* Middle Row: Value & Main Icon */}
            <div className="flex items-baseline justify-between gap-2 my-1">
              <span className="text-xl md:text-2xl font-bold text-[#17221D] dark:text-[#E6ECE8] tracking-tight">
                {kpi.value}
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#E7F2EC] dark:bg-[#1B3D30] text-[#174F3A] dark:text-[#A3E6C5] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
