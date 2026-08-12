import { useState } from 'react'
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Eye, Download, CheckCircle2, AlertTriangle, XCircle, Filter } from 'lucide-react'

function getStatusBadge(status) {
  switch (status) {
    case 'Healthy':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary-light text-brand-primary-dark">
          <CheckCircle2 className="w-2.5 h-2.5" /> Healthy
        </span>
      )
    case 'Low Stock':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-warning-light text-brand-warning-dark">
          <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
        </span>
      )
    case 'Out of Stock':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-danger-light text-brand-danger">
          <XCircle className="w-2.5 h-2.5" /> Out of Stock
        </span>
      )
  }
}

export default function ProductInventoryTable({ products, onSelectProduct, searchQuery, setSearchQuery }) {
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortField, setSortField] = useState('stockQty')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.ruralMart.toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aVal = a[sortField]
    const bVal = b[sortField]

    if (typeof aVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
  })

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const exportToCsv = () => {
    const headers = ['Product Code', 'Product Name', 'Category', 'Rural Mart', 'District', 'Stock Qty', 'Reorder Level', 'Sales Qty', 'Unit Price (₹)', 'Inventory Value (₹)', 'Status']
    const rows = sortedProducts.map((p) => [p.code, `"${p.name}"`, `"${p.category}"`, p.ruralMart, p.district, p.stockQty, p.reorderLevel, p.salesQty, p.unitPrice, p.inventoryValue, p.status])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Product_Inventory_Table_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-brand-border/60">
          <h3 className="text-base font-bold text-brand-text tracking-tight">Product Inventory Table</h3>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-brand-bg-subtle px-2 py-1 rounded-lg border border-brand-border text-xs">
              <Filter className="w-3 h-3 text-brand-text-subtle" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="bg-transparent text-brand-text focus:outline-none cursor-pointer font-medium"
              >
                <option value="All">All Statuses</option>
                <option value="Healthy">Healthy</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <div className="relative w-36">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-text-subtle" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search products..."
                className="w-full pl-8 pr-2 py-1 text-xs rounded-lg border border-brand-border bg-brand-bg-subtle text-brand-text placeholder-brand-text-subtle focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            <button onClick={exportToCsv} className="p-1.5 rounded-lg border border-brand-border text-brand-text-muted hover:bg-brand-bg-subtle transition-colors" title="Export CSV">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border text-brand-text-muted font-semibold uppercase text-[10px] tracking-wider bg-brand-bg-subtle/50">
                <th className="py-2.5 px-3 rounded-l-lg">
                  <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-brand-text">
                    Product <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3">
                  <button onClick={() => handleSort('category')} className="flex items-center gap-1 hover:text-brand-text">
                    Category <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button onClick={() => handleSort('stockQty')} className="flex items-center gap-1 ml-auto hover:text-brand-text">
                    Stock Qty <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button onClick={() => handleSort('salesQty')} className="flex items-center gap-1 ml-auto hover:text-brand-text">
                    Sales Qty <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-center">
                  <button onClick={() => handleSort('status')} className="flex items-center gap-1 mx-auto hover:text-brand-text">
                    Status <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-center rounded-r-lg">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-brand-text-subtle">
                    No product inventory records match the current filters.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-brand-bg-subtle transition-colors group">
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-brand-text text-xs group-hover:text-brand-primary">{p.name}</span>
                        <span className="text-[10px] text-brand-text-subtle font-mono">{p.code} • {p.ruralMart} Hub</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-block font-semibold text-brand-text bg-brand-bg-subtle px-2 py-0.5 rounded-md text-[11px]">{p.category}</span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span className={p.status === 'Out of Stock' ? 'text-brand-danger font-extrabold' : p.status === 'Low Stock' ? 'text-brand-warning' : 'text-brand-primary'}>
                        {p.stockQty.toLocaleString('en-IN')} Units
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-brand-text">{p.salesQty.toLocaleString('en-IN')}</td>

                    <td className="py-3 px-3 text-center">{getStatusBadge(p.status)}</td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onSelectProduct(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-primary-light text-brand-primary-dark font-semibold hover:bg-brand-primary hover:text-white transition-all text-xs"
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

      <div className="flex items-center justify-between pt-3 mt-3 border-t border-brand-border text-xs text-brand-text-muted">
        <span>
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sortedProducts.length)} to {Math.min(currentPage * itemsPerPage, sortedProducts.length)} of {sortedProducts.length} entries
        </span>

        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg border border-brand-border disabled:opacity-40 hover:bg-brand-bg-subtle transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-semibold text-brand-text">{currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg border border-brand-border disabled:opacity-40 hover:bg-brand-bg-subtle transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
