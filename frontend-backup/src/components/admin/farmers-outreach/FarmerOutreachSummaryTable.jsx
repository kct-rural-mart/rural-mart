import { useState } from 'react'
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Eye, Download, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

function getStatusBadge(status) {
  switch (status) {
    case 'Active':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary-light text-brand-primary-dark border border-brand-primary/20">
          <CheckCircle2 className="w-2.5 h-2.5" /> Active
        </span>
      )
    case 'Delayed':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-warning-light text-brand-warning-dark">
          <Clock className="w-2.5 h-2.5" /> Delayed
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-bg-subtle text-brand-text-muted border border-brand-border">
          <AlertCircle className="w-2.5 h-2.5" /> Inactive
        </span>
      )
  }
}

export default function FarmerOutreachSummaryTable({ outreachMarts, onSelectMart, searchQuery, setSearchQuery }) {
  const [sortField, setSortField] = useState('farmersReached')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const filteredMarts = outreachMarts.filter((m) => {
    const q = searchQuery.toLowerCase()
    return m.name.toLowerCase().includes(q) || m.district.toLowerCase().includes(q)
  })

  const sortedMarts = [...filteredMarts].sort((a, b) => {
    const aVal = a[sortField]
    const bVal = b[sortField]

    if (typeof aVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
  })

  const totalPages = Math.ceil(sortedMarts.length / itemsPerPage) || 1
  const paginatedMarts = sortedMarts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const exportToCsv = () => {
    const headers = ['Rural Mart', 'District', 'New Farmers', 'Repeat Farmers', 'Programs Conducted', 'Farmers Reached', 'Villages Covered', 'Animal Population Covered']
    const rows = sortedMarts.map((m) => [m.name, m.district, m.newFarmers, m.repeatFarmers, m.outreachProgramsConducted, m.farmersReached, m.villagesCovered, m.animalPopulationCovered])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Farmer_Outreach_Summary_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-brand-border">
          <h3 className="text-sm font-bold text-brand-text tracking-tight">Farmer Outreach Summary</h3>

          <div className="flex items-center gap-2">
            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-text-subtle" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter outreach..."
                className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-brand-border bg-brand-bg-subtle text-brand-text placeholder-brand-text-subtle focus:outline-none focus:ring-1 focus:ring-brand-primary"
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
              <tr className="border-b border-brand-border text-brand-text-muted font-semibold uppercase text-[10px] tracking-wider bg-brand-bg-subtle">
                <th className="py-2.5 px-3 rounded-l-lg">
                  <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-brand-text">
                    Rural Mart <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button onClick={() => handleSort('newFarmers')} className="flex items-center gap-1 ml-auto hover:text-brand-text">
                    New Farmers <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button onClick={() => handleSort('repeatFarmers')} className="flex items-center gap-1 ml-auto hover:text-brand-text">
                    Repeat Farmers <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button onClick={() => handleSort('outreachProgramsConducted')} className="flex items-center gap-1 ml-auto hover:text-brand-text">
                    Programs <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button onClick={() => handleSort('farmersReached')} className="flex items-center gap-1 ml-auto hover:text-brand-text">
                    Farmers Reached <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-center rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {paginatedMarts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-brand-text-subtle">
                    No farmer outreach records found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedMarts.map((mart) => (
                  <tr key={mart.id} className="hover:bg-brand-bg-subtle transition-colors group">
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-brand-text text-xs group-hover:text-brand-primary">{mart.name}</span>
                          {getStatusBadge(mart.status)}
                        </div>
                        <span className="text-[10px] text-brand-text-subtle font-medium">{mart.district} District • {mart.villagesCovered} Villages</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-brand-primary">+{mart.newFarmers.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right text-brand-text">{mart.repeatFarmers.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right font-bold text-brand-accent">{mart.outreachProgramsConducted} Camps</td>
                    <td className="py-3 px-3 text-right font-bold text-brand-text">{mart.farmersReached.toLocaleString('en-IN')}</td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onSelectMart(mart)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-primary-light text-brand-primary-dark font-bold hover:bg-brand-primary hover:text-white transition-all text-xs border border-brand-primary/20"
                        title="View outreach details"
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
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sortedMarts.length)} to {Math.min(currentPage * itemsPerPage, sortedMarts.length)} of {sortedMarts.length} entries
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
