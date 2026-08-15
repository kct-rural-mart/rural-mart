import React, { useState } from 'react';
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
} from 'lucide-react';
import { FarmerOutreachMartRecord } from '../../../shared/types';

interface FarmerOutreachSummaryTableProps {
  outreachMarts: FarmerOutreachMartRecord[];
  onSelectMart: (mart: FarmerOutreachMartRecord) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

type SortField =
  | 'name'
  | 'newFarmers'
  | 'repeatFarmers'
  | 'outreachProgramsConducted'
  | 'farmersReached'
  | 'totalRegisteredFarmers';
type SortOrder = 'asc' | 'desc';

export const FarmerOutreachSummaryTable: React.FC<FarmerOutreachSummaryTableProps> = ({
  outreachMarts,
  onSelectMart,
  searchQuery,
  setSearchQuery,
}) => {
  const [sortField, setSortField] = useState<SortField>('farmersReached');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredMarts = outreachMarts.filter((m) => {
    const q = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.district.toLowerCase().includes(q);
  });

  const sortedMarts = [...filteredMarts].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      return sortOrder === 'asc'
        ? (aVal as string).localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal as string);
    }

    return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const totalPages = Math.ceil(sortedMarts.length / itemsPerPage) || 1;
  const paginatedMarts = sortedMarts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/20">
            <CheckCircle2 className="w-2.5 h-2.5" /> Active
          </span>
        );
      case 'Delayed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] dark:bg-[#451A03]/60 dark:text-[#FCD34D] border border-amber-300/30">
            <Clock className="w-2.5 h-2.5" /> Delayed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F8FAF7] text-[#66736C] dark:bg-[#16241E] dark:text-[#8E9E96] border border-[#DDE6E0] dark:border-[#1E3129]">
            <AlertCircle className="w-2.5 h-2.5" /> Inactive
          </span>
        );
    }
  };

  const exportToCsv = () => {
    const headers = [
      'Rural Mart',
      'District',
      'New Farmers',
      'Repeat Farmers',
      'Programs Conducted',
      'Farmers Reached',
      'Villages Covered',
      'Animal Population Covered',
    ];
    const rows = sortedMarts.map((m) => [
      m.name,
      m.district,
      m.newFarmers,
      m.repeatFarmers,
      m.outreachProgramsConducted,
      m.farmersReached,
      m.villagesCovered,
      m.animalPopulationCovered,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Farmer_Outreach_Summary_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#DDE6E0] dark:border-[#1E3129]">
          <div>
            <h3 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] tracking-tight">
              Farmer Outreach Summary
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A958F]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter outreach..."
                className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] placeholder-[#8A958F] focus:outline-none focus:ring-1 focus:ring-[#174F3A]"
              />
            </div>

            <button
              onClick={exportToCsv}
              className="p-1.5 rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] text-[#66736C] dark:text-[#8E9E96] hover:bg-[#F8FAF7] dark:hover:bg-[#16241E] transition-colors"
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
              <tr className="border-b border-[#DDE6E0] dark:border-[#1E3129] text-[#66736C] dark:text-[#8E9E96] font-semibold uppercase text-[10px] tracking-wider bg-[#F8FAF7] dark:bg-[#16241E]">
                <th className="py-2.5 px-3 rounded-l-lg">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-[#17221D] dark:hover:text-[#E6ECE8]"
                  >
                    Rural Mart <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => handleSort('newFarmers')}
                    className="flex items-center gap-1 ml-auto hover:text-[#17221D] dark:hover:text-[#E6ECE8]"
                  >
                    New Farmers <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => handleSort('repeatFarmers')}
                    className="flex items-center gap-1 ml-auto hover:text-[#17221D] dark:hover:text-[#E6ECE8]"
                  >
                    Repeat Farmers <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => handleSort('outreachProgramsConducted')}
                    className="flex items-center gap-1 ml-auto hover:text-[#17221D] dark:hover:text-[#E6ECE8]"
                  >
                    Programs <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => handleSort('farmersReached')}
                    className="flex items-center gap-1 ml-auto hover:text-[#17221D] dark:hover:text-[#E6ECE8]"
                  >
                    Farmers Reached <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-center rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE6E0] dark:divide-[#1E3129]">
              {paginatedMarts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#8A958F]">
                    No farmer outreach records found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedMarts.map((mart) => (
                  <tr
                    key={mart.id}
                    className="hover:bg-[#F8FAF7] dark:hover:bg-[#16241E] transition-colors group"
                  >
                    {/* Mart Name & District */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#17221D] dark:text-[#E6ECE8] text-xs group-hover:text-[#174F3A] dark:group-hover:text-[#A3E6C5]">
                            {mart.name}
                          </span>
                          {getStatusBadge(mart.status)}
                        </div>
                        <span className="text-[10px] text-[#8A958F] font-medium">
                          {mart.district} District • {mart.villagesCovered} Villages
                        </span>
                      </div>
                    </td>

                    {/* New Farmers */}
                    <td className="py-3 px-3 text-right font-bold text-[#174F3A] dark:text-[#A3E6C5]">
                      +{mart.newFarmers.toLocaleString('en-IN')}
                    </td>

                    {/* Repeat Farmers */}
                    <td className="py-3 px-3 text-right text-[#17221D] dark:text-[#E6ECE8]">
                      {mart.repeatFarmers.toLocaleString('en-IN')}
                    </td>

                    {/* Programs */}
                    <td className="py-3 px-3 text-right font-bold text-[#34735A] dark:text-[#A3E6C5]">
                      {mart.outreachProgramsConducted} Camps
                    </td>

                    {/* Farmers Reached */}
                    <td className="py-3 px-3 text-right font-bold text-[#17221D] dark:text-[#E6ECE8]">
                      {mart.farmersReached.toLocaleString('en-IN')}
                    </td>

                    {/* View Action */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onSelectMart(mart)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E7F2EC] dark:bg-[#1B3D30] text-[#103A2B] dark:text-[#A3E6C5] font-bold hover:bg-[#174F3A] hover:text-white dark:hover:bg-[#174F3A] dark:hover:text-white transition-all text-xs border border-[#174F3A]/20"
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

      {/* Pagination Bar */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#DDE6E0] dark:border-[#1E3129] text-xs text-[#66736C] dark:text-[#8E9E96]">
        <span>
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sortedMarts.length)} to{' '}
          {Math.min(currentPage * itemsPerPage, sortedMarts.length)} of {sortedMarts.length} entries
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] disabled:opacity-40 hover:bg-[#F8FAF7] dark:hover:bg-[#16241E] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-semibold text-[#17221D] dark:text-[#E6ECE8]">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] disabled:opacity-40 hover:bg-[#F8FAF7] dark:hover:bg-[#16241E] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
