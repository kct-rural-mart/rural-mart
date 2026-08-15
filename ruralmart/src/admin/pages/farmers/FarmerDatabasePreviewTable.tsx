import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, User, Eye } from 'lucide-react';
import { FarmerRecord } from '../../../shared/types';

interface FarmerDatabasePreviewTableProps {
  farmers: FarmerRecord[];
  onSelectFarmer: (farmer: FarmerRecord) => void;
  onSelectPurchaseHistory: (farmer: FarmerRecord) => void;
}

export const FarmerDatabasePreviewTable: React.FC<FarmerDatabasePreviewTableProps> = ({
  farmers,
  onSelectFarmer,
  onSelectPurchaseHistory,
}) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredFarmers = farmers.filter((f) => {
    const q = search.toLowerCase();
    return (
      f.id.toLowerCase().includes(q) ||
      f.name.toLowerCase().includes(q) ||
      f.village.toLowerCase().includes(q) ||
      f.district.toLowerCase().includes(q) ||
      f.ruralMart.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      (f.itemsPurchased && f.itemsPurchased.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredFarmers.length / itemsPerPage) || 1;
  const paginatedFarmers = filteredFarmers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 flex flex-col justify-between w-full h-full">
      <div>
        {/* Table Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-[#DDE6E0] dark:border-[#1E3129]">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] tracking-tight">
              Farmer Database ({filteredFarmers.length} Records)
            </h3>
          </div>

          {/* Table Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A958F]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search ID, Name, Village, Mart..."
              className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] placeholder-[#8A958F] focus:outline-none focus:ring-1 focus:ring-[#174F3A]"
            />
          </div>
        </div>

        {/* Table Viewport */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DDE6E0] dark:border-[#1E3129] text-[#66736C] dark:text-[#8E9E96] font-semibold uppercase text-[10px] tracking-wider bg-[#F8FAF7] dark:bg-[#16241E]">
                <th className="py-2.5 px-3 rounded-l-lg">Farmer ID</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Village & District</th>
                <th className="py-2.5 px-3">Rural Mart</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-center">Cattle Count</th>
                <th className="py-2.5 px-3 text-center rounded-r-lg">Purchase History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE6E0] dark:divide-[#1E3129]">
              {paginatedFarmers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#8A958F]">
                    No farmer records found matching "{search}".
                  </td>
                </tr>
              ) : (
                paginatedFarmers.map((farmer) => (
                  <tr
                    key={farmer.id}
                    onClick={() => onSelectFarmer(farmer)}
                    className="hover:bg-[#F8FAF7] dark:hover:bg-[#16241E] transition-colors cursor-pointer group"
                  >
                    {/* Farmer ID */}
                    <td className="py-3 px-3 font-bold text-[#66736C] dark:text-[#8E9E96] whitespace-nowrap">
                      {farmer.id}
                    </td>

                    {/* Name */}
                    <td className="py-3 px-3 font-bold text-[#17221D] dark:text-[#E6ECE8] group-hover:text-[#174F3A] dark:group-hover:text-[#A3E6C5] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#8A958F] group-hover:text-[#174F3A]" />
                        <span>{farmer.name}</span>
                        {farmer.status === 'New' && (
                          <span className="text-[9px] bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] font-bold px-1.5 py-0.2 rounded border border-[#174F3A]/20">
                            New
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Village & District */}
                    <td className="py-3 px-3 text-[#66736C] dark:text-[#8E9E96] whitespace-nowrap">
                      {farmer.village}, <span className="font-medium text-[#17221D] dark:text-[#E6ECE8]">{farmer.district}</span>
                    </td>

                    {/* Rural Mart */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-block font-semibold text-[#17221D] dark:text-[#E6ECE8] bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] px-2 py-0.5 rounded-md text-[11px]">
                        {farmer.ruralMart}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 text-[#66736C] dark:text-[#8E9E96] font-medium whitespace-nowrap">
                      {farmer.category}
                    </td>

                    {/* Cattle Count */}
                    <td className="py-3 px-3 text-center whitespace-nowrap font-bold text-[#174F3A] dark:text-[#A3E6C5]">
                      {farmer.animalHeadCount} Head
                    </td>

                    {/* Purchase History — Just View Button */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPurchaseHistory(farmer);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#E7F2EC] hover:bg-[#174F3A] text-[#103A2B] hover:text-white dark:bg-[#1B3D30] dark:hover:bg-[#A3E6C5] dark:text-[#A3E6C5] dark:hover:text-[#121E19] border border-[#174F3A]/20 font-bold text-[11px] transition-colors shadow-2xs cursor-pointer"
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

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#DDE6E0] dark:border-[#1E3129] text-xs text-[#66736C] dark:text-[#8E9E96]">
        <span>
          Showing {paginatedFarmers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{' '}
          {Math.min(currentPage * itemsPerPage, filteredFarmers.length)} of {filteredFarmers.length} Farmers
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] disabled:opacity-40 hover:bg-[#F8FAF7] dark:hover:bg-[#16241E] transition-colors flex items-center gap-1 font-semibold"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <span className="px-2 font-bold text-[#17221D] dark:text-[#E6ECE8]">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] disabled:opacity-40 hover:bg-[#F8FAF7] dark:hover:bg-[#16241E] transition-colors flex items-center gap-1 font-semibold"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
