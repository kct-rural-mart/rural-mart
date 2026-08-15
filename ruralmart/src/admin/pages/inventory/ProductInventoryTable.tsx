import React, { useState } from 'react';
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
} from 'lucide-react';
import { ProductInventoryRecord } from '../../../shared/types';

interface ProductInventoryTableProps {
  products: ProductInventoryRecord[];
  onSelectProduct: (product: ProductInventoryRecord) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

type SortField = 'name' | 'category' | 'stockQty' | 'salesQty' | 'status';
type SortOrder = 'asc' | 'desc';

export const ProductInventoryTable: React.FC<ProductInventoryTableProps> = ({
  products,
  onSelectProduct,
  searchQuery,
  setSearchQuery,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('stockQty');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.ruralMart.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      return sortOrder === 'asc'
        ? (aVal as string).localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal as string);
    }

    return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Healthy':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
            <CheckCircle2 className="w-2.5 h-2.5" /> Healthy
          </span>
        );
      case 'Low Stock':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
            <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
          </span>
        );
      case 'Out of Stock':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
            <XCircle className="w-2.5 h-2.5" /> Out of Stock
          </span>
        );
    }
  };

  const exportToCsv = () => {
    const headers = [
      'Product Code',
      'Product Name',
      'Category',
      'Rural Mart',
      'District',
      'Stock Qty',
      'Reorder Level',
      'Sales Qty',
      'Unit Price (₹)',
      'Inventory Value (₹)',
      'Status',
    ];
    const rows = sortedProducts.map((p) => [
      p.code,
      `"${p.name}"`,
      `"${p.category}"`,
      p.ruralMart,
      p.district,
      p.stockQty,
      p.reorderLevel,
      p.salesQty,
      p.unitPrice,
      p.inventoryValue,
      p.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Product_Inventory_Table_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-emerald-900/30">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-emerald-50 tracking-tight">
              Product Inventory Table
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg border border-slate-200 dark:border-emerald-800/50 text-xs">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-slate-800 dark:text-emerald-100 focus:outline-none cursor-pointer font-medium"
              >
                <option value="All">All Statuses</option>
                <option value="Healthy">Healthy</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative w-36">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search products..."
                className="w-full pl-8 pr-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-emerald-800/50 bg-slate-50 dark:bg-emerald-900/20 text-slate-900 dark:text-emerald-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <button
              onClick={exportToCsv}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-emerald-800/50 text-slate-600 dark:text-emerald-300 hover:bg-slate-100 dark:hover:bg-emerald-900/30 transition-colors"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Viewport */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-emerald-800/40 text-slate-500 dark:text-emerald-300/80 font-semibold uppercase text-[10px] tracking-wider bg-slate-50/50 dark:bg-emerald-900/20">
                <th className="py-2.5 px-3 rounded-l-lg">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
                  >
                    Product <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3">
                  <button
                    onClick={() => handleSort('category')}
                    className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
                  >
                    Category <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => handleSort('stockQty')}
                    className="flex items-center gap-1 ml-auto hover:text-slate-900 dark:hover:text-white"
                  >
                    Stock Qty <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => handleSort('salesQty')}
                    className="flex items-center gap-1 ml-auto hover:text-slate-900 dark:hover:text-white"
                  >
                    Sales Qty <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-center">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 mx-auto hover:text-slate-900 dark:hover:text-white"
                  >
                    Status <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-center rounded-r-lg">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/20">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No product inventory records match the current filters.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-emerald-900/20 transition-colors group"
                  >
                    {/* Product Name & Code */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-emerald-100 text-xs group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-emerald-400/60 font-mono">
                          {p.code} • {p.ruralMart} Hub
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="inline-block font-semibold text-slate-700 dark:text-emerald-200 bg-slate-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md text-[11px]">
                        {p.category}
                      </span>
                    </td>

                    {/* Stock Qty */}
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span
                        className={
                          p.status === 'Out of Stock'
                            ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                            : p.status === 'Low Stock'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-700 dark:text-emerald-300'
                        }
                      >
                        {p.stockQty.toLocaleString('en-IN')} Units
                      </span>
                    </td>

                    {/* Sales Qty */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800 dark:text-emerald-200">
                      {p.salesQty.toLocaleString('en-IN')}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-center">{getStatusBadge(p.status)}</td>

                    {/* View Action */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onSelectProduct(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-semibold hover:bg-emerald-800 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all text-xs"
                        title="View stock details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-emerald-900/30 text-xs text-slate-500 dark:text-emerald-400">
        <span>
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sortedProducts.length)} to{' '}
          {Math.min(currentPage * itemsPerPage, sortedProducts.length)} of {sortedProducts.length} entries
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-emerald-800/50 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-emerald-900/30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-semibold text-slate-800 dark:text-emerald-200">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-emerald-800/50 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-emerald-900/30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
