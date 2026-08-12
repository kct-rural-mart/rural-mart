import { useMemo, useState } from 'react'
import { Search, Filter, Eye, ArrowUpDown, ChevronLeft, ChevronRight, Store, MapPin, CheckCircle2, Clock, AlertCircle, FileSpreadsheet } from 'lucide-react'

export default function RuralMartDirectoryTable({ marts, onSelectMart }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [districtFilter, setDistrictFilter] = useState('All')
  const [sortField, setSortField] = useState('score')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const districts = useMemo(() => {
    const set = new Set(marts.map((m) => m.district))
    return ['All', ...Array.from(set)]
  }, [marts])

  const filteredMarts = useMemo(() => {
    return marts
      .filter((m) => {
        const matchesSearch =
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.district.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'All' || m.status.toLowerCase() === statusFilter.toLowerCase()
        const matchesDistrict = districtFilter === 'All' || m.district === districtFilter

        return matchesSearch && matchesStatus && matchesDistrict
      })
      .sort((a, b) => {
        const valA = a[sortField]
        const valB = b[sortField]

        if (typeof valA === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
        }
        return sortOrder === 'asc' ? valA - valB : valB - valA
      })
  }, [marts, searchTerm, statusFilter, districtFilter, sortField, sortOrder])

  const totalPages = Math.ceil(filteredMarts.length / itemsPerPage) || 1
  const paginatedMarts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredMarts.slice(start, start + itemsPerPage)
  }, [filteredMarts, currentPage])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const exportToCSV = () => {
    const headers = ['Rural Mart', 'Manager', 'District', 'Status', 'Score', 'Sales (₹)', 'Registered Farmers', 'Last Updated']
    const rows = filteredMarts.map((m) => [m.name, m.manager, m.district, m.status, m.score, m.salesRaw, m.registeredFarmers, m.lastUpdated])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `rural_marts_directory_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-border/60">
          <h3 className="text-sm font-bold text-brand-text tracking-tight">Rural Mart Directory</h3>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-primary-light text-brand-primary-dark border border-brand-primary/20 hover:bg-brand-primary/20 transition-colors self-start sm:self-auto"
            title="Export CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Directory</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-brand-text-subtle" />
            <input
              type="text"
              placeholder="Search mart or manager..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-brand-bg-subtle border border-brand-border rounded-xl text-brand-text placeholder-brand-text-subtle focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          <div className="flex items-center gap-1 bg-brand-bg-subtle border border-brand-border rounded-xl px-2">
            <Filter className="w-3 h-3 text-brand-text-subtle shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-transparent py-1.5 text-xs text-brand-text focus:outline-none cursor-pointer"
            >
              <option value="All">Status: All</option>
              <option value="Active">Active Only</option>
              <option value="Delayed">Delayed Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-brand-bg-subtle border border-brand-border rounded-xl px-2">
            <MapPin className="w-3 h-3 text-brand-text-subtle shrink-0" />
            <select
              value={districtFilter}
              onChange={(e) => {
                setDistrictFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-transparent py-1.5 text-xs text-brand-text focus:outline-none cursor-pointer"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'District: All' : d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-brand-border/70">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-brand-bg-subtle border-b border-brand-border text-brand-text-muted font-semibold">
                <th onClick={() => handleSort('name')} className="py-2.5 px-3 cursor-pointer hover:bg-brand-border/40 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>Rural Mart</span>
                    <ArrowUpDown className="w-3 h-3 text-brand-text-subtle" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Owner / Manager</th>
                <th className="py-2.5 px-3">District</th>
                <th onClick={() => handleSort('score')} className="py-2.5 px-3 cursor-pointer hover:bg-brand-border/40 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>Score</span>
                    <ArrowUpDown className="w-3 h-3 text-brand-text-subtle" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Status</th>
                <th onClick={() => handleSort('lastUpdated')} className="py-2.5 px-3 cursor-pointer hover:bg-brand-border/40 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>Last Updated</span>
                    <ArrowUpDown className="w-3 h-3 text-brand-text-subtle" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {paginatedMarts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-text-subtle">
                    No Rural Marts found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedMarts.map((mart) => {
                  const isAccurate = mart.status === 'Active'
                  const isDelayed = mart.status === 'Delayed'

                  return (
                    <tr key={mart.id} className="hover:bg-brand-bg-subtle transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-brand-text">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-brand-primary-light text-brand-primary-dark flex items-center justify-center font-bold text-xs shrink-0">
                            <Store className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="block font-bold">{mart.name}</span>
                            <span className="text-[10px] text-brand-text-subtle">₹{(mart.salesRaw / 100000).toFixed(1)}L Sales</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-brand-text">
                        <span className="block font-medium">{mart.manager}</span>
                        <span className="text-[10px] text-brand-text-subtle font-mono">{mart.contact}</span>
                      </td>

                      <td className="py-2.5 px-3 text-brand-text-muted">
                        <span className="inline-flex items-center gap-1 bg-brand-bg-subtle px-2 py-0.5 rounded-md text-[11px]">
                          <MapPin className="w-3 h-3 text-brand-primary" />
                          {mart.district}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 font-mono font-bold text-brand-text">
                        <span className="text-brand-primary">{mart.score}</span>
                        <span className="text-[10px] text-brand-text-subtle font-normal">/100</span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isAccurate ? 'bg-brand-success-light text-brand-success' : isDelayed ? 'bg-brand-warning-light text-brand-warning-dark' : 'bg-brand-danger-light text-brand-danger'
                          }`}
                        >
                          {isAccurate ? <CheckCircle2 className="w-3 h-3" /> : isDelayed ? <Clock className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {mart.status}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-brand-text-muted text-[11px]">{mart.lastUpdated}</td>

                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onSelectMart(mart)}
                          className="p-1.5 rounded-lg text-brand-primary hover:text-brand-primary-dark hover:bg-brand-primary-light transition-colors inline-flex items-center gap-1 font-semibold text-xs"
                          title="Inspect Rural Mart Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 mt-2 border-t border-brand-border/60 text-xs">
        <span className="text-brand-text-muted">
          Page {currentPage} of {totalPages} ({filteredMarts.length} total)
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-brand-border text-brand-text-muted hover:bg-brand-bg-subtle disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-brand-border text-brand-text-muted hover:bg-brand-bg-subtle disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
