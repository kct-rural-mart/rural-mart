import { useState } from 'react'
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

function getStatusBadge(status) {
  switch (status) {
    case 'Active':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary-light text-brand-primary-dark border border-brand-primary/15">
          <CheckCircle className="w-2.5 h-2.5" /> Active
        </span>
      )
    case 'Delayed':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-warning-light text-brand-warning-dark border border-brand-warning-border">
          <AlertTriangle className="w-2.5 h-2.5" /> Delayed
        </span>
      )
    case 'Inactive':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-danger-light text-brand-danger border border-brand-danger-border">
          <XCircle className="w-2.5 h-2.5" /> Inactive
        </span>
      )
    default:
      return null
  }
}

export default function MonitoringOverviewTable({ marts, onSelectMart }) {
  const [localSearch, setLocalSearch] = useState('')
  const [sortField, setSortField] = useState('salesRaw')
  const [sortDirection, setSortDirection] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const filteredMarts = marts.filter((m) => {
    return (
      m.name.toLowerCase().includes(localSearch.toLowerCase()) ||
      m.district.toLowerCase().includes(localSearch.toLowerCase()) ||
      m.manager.toLowerCase().includes(localSearch.toLowerCase())
    )
  })

  const sortedMarts = [...filteredMarts].sort((a, b) => {
    const aVal = a[sortField]
    const bVal = b[sortField]

    if (typeof aVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
  })

  const totalPages = Math.ceil(sortedMarts.length / itemsPerPage) || 1
  const paginatedMarts = sortedMarts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-brand-border">
        <div>
          <h2 className="text-sm font-bold text-brand-text tracking-tight">Monitoring Overview</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-brand-text-subtle" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search table..."
              className="pl-6 pr-2 py-1 text-[11px] rounded-md border border-brand-border bg-brand-bg-subtle text-brand-text placeholder-brand-text-subtle focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto my-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-brand-border text-[10px] font-bold uppercase tracking-wider text-brand-text-muted bg-brand-bg-subtle">
              <th onClick={() => handleSort('name')} className="py-2.5 px-2 cursor-pointer hover:text-brand-primary transition-colors">
                <div className="flex items-center gap-1">Rural Mart <ArrowUpDown className="w-2.5 h-2.5" /></div>
              </th>
              <th className="py-2.5 px-2">District</th>
              <th className="py-2.5 px-2">Status</th>
              <th onClick={() => handleSort('salesRaw')} className="py-2.5 px-2 cursor-pointer hover:text-brand-primary transition-colors text-right">
                <div className="flex items-center justify-end gap-1">Sales (₹) <ArrowUpDown className="w-2.5 h-2.5" /></div>
              </th>
              <th onClick={() => handleSort('grossProfitRaw')} className="py-2.5 px-2 cursor-pointer hover:text-brand-primary transition-colors text-right">
                <div className="flex items-center justify-end gap-1">Profit (₹) <ArrowUpDown className="w-2.5 h-2.5" /></div>
              </th>
              <th className="py-2.5 px-2 text-right">Farmers</th>
              <th className="py-2.5 px-2 text-right">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/60 font-medium">
            {paginatedMarts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-brand-text-subtle">
                  No Rural Marts found matching search.
                </td>
              </tr>
            ) : (
              paginatedMarts.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => onSelectMart(m)}
                  className="hover:bg-brand-bg-subtle cursor-pointer transition-colors text-brand-text"
                >
                  <td className="py-2.5 px-2 font-bold text-brand-text">{m.name}</td>
                  <td className="py-2.5 px-2 text-brand-text-muted">{m.district}</td>
                  <td className="py-2.5 px-2">{getStatusBadge(m.status)}</td>
                  <td className="py-2.5 px-2 text-right font-bold text-brand-primary">
                    {m.salesRaw > 0 ? `₹${(m.salesRaw / 100000).toFixed(1)} L` : '₹0'}
                  </td>
                  <td className="py-2.5 px-2 text-right font-bold text-brand-accent">
                    {m.grossProfitRaw > 0 ? `₹${(m.grossProfitRaw / 100000).toFixed(1)} L` : '₹0'}
                  </td>
                  <td className="py-2.5 px-2 text-right">{m.registeredFarmers.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-2 text-right text-[11px] text-brand-text-muted">{m.lastUpdated}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-brand-border text-xs text-brand-text-muted">
        <span>Showing {paginatedMarts.length} of {sortedMarts.length} Marts</span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 rounded border border-brand-border disabled:opacity-40 hover:bg-brand-bg-subtle"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-brand-text">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1 rounded border border-brand-border disabled:opacity-40 hover:bg-brand-bg-subtle"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
