import { useState } from 'react'
import { Search, ChevronLeft, ChevronRight, User, Eye } from 'lucide-react'

export default function FarmerDatabasePreviewTable({ farmers, onSelectFarmer, onSelectPurchaseHistory }) {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredFarmers = farmers.filter((f) => {
    const q = search.toLowerCase()
    return (
      f.id.toLowerCase().includes(q) ||
      f.name.toLowerCase().includes(q) ||
      f.village.toLowerCase().includes(q) ||
      f.district.toLowerCase().includes(q) ||
      f.ruralMart.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      (f.itemsPurchased && f.itemsPurchased.toLowerCase().includes(q))
    )
  })

  const totalPages = Math.ceil(filteredFarmers.length / itemsPerPage) || 1
  const paginatedFarmers = filteredFarmers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between w-full h-full">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-brand-border">
          <h3 className="text-sm font-bold text-brand-text tracking-tight">Farmer Database ({filteredFarmers.length} Records)</h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-text-subtle" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search ID, Name, Village, Mart..."
              className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-brand-border bg-brand-bg-subtle text-brand-text placeholder-brand-text-subtle focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border text-brand-text-muted font-semibold uppercase text-[10px] tracking-wider bg-brand-bg-subtle">
                <th className="py-2.5 px-3 rounded-l-lg">Farmer ID</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Village &amp; District</th>
                <th className="py-2.5 px-3">Rural Mart</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-center">Cattle Count</th>
                <th className="py-2.5 px-3 text-center rounded-r-lg">Purchase History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {paginatedFarmers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-brand-text-subtle">
                    No farmer records found matching "{search}".
                  </td>
                </tr>
              ) : (
                paginatedFarmers.map((farmer) => (
                  <tr key={farmer.id} onClick={() => onSelectFarmer(farmer)} className="hover:bg-brand-bg-subtle transition-colors cursor-pointer group">
                    <td className="py-3 px-3 font-bold text-brand-text-muted whitespace-nowrap">{farmer.id}</td>

                    <td className="py-3 px-3 font-bold text-brand-text group-hover:text-brand-primary whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-brand-text-subtle group-hover:text-brand-primary" />
                        <span>{farmer.name}</span>
                        {farmer.status === 'New' && (
                          <span className="text-[9px] bg-brand-primary-light text-brand-primary-dark font-bold px-1.5 py-0.2 rounded border border-brand-primary/20">New</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-brand-text-muted whitespace-nowrap">
                      {farmer.village}, <span className="font-medium text-brand-text">{farmer.district}</span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-block font-semibold text-brand-text bg-brand-bg-subtle border border-brand-border px-2 py-0.5 rounded-md text-[11px]">{farmer.ruralMart}</span>
                    </td>

                    <td className="py-3 px-3 text-brand-text-muted font-medium whitespace-nowrap">{farmer.category}</td>

                    <td className="py-3 px-3 text-center whitespace-nowrap font-bold text-brand-primary">{farmer.animalHeadCount} Head</td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectPurchaseHistory(farmer)
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-brand-primary-light hover:bg-brand-primary text-brand-primary-dark hover:text-white border border-brand-primary/20 font-bold text-[11px] transition-colors shadow-2xs cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
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
          Showing {paginatedFarmers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredFarmers.length)} of {filteredFarmers.length} Farmers
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded-lg border border-brand-border disabled:opacity-40 hover:bg-brand-bg-subtle transition-colors flex items-center gap-1 font-semibold"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <span className="px-2 font-bold text-brand-text">{currentPage} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded-lg border border-brand-border disabled:opacity-40 hover:bg-brand-bg-subtle transition-colors flex items-center gap-1 font-semibold"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
