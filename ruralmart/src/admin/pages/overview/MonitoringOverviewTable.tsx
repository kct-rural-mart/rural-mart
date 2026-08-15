import React, { useState } from 'react';
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { District, MartStatus, RuralMartData } from '../../../shared/types';

interface MonitoringOverviewTableProps {
  marts: RuralMartData[];
  onSelectMart: (mart: RuralMartData) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  districtFilter?: District;
  setDistrictFilter?: (district: District) => void;
}

export const MonitoringOverviewTable: React.FC<MonitoringOverviewTableProps> = ({
  marts,
  onSelectMart,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [sortField, setSortField] = useState<'salesRaw' | 'grossProfitRaw' | 'name'>('salesRaw');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtering
  const filteredMarts = marts.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(localSearch.toLowerCase()) ||
      m.district.toLowerCase().includes(localSearch.toLowerCase()) ||
      m.manager.toLowerCase().includes(localSearch.toLowerCase());

    return matchesSearch;
  });

  // Sorting
  const sortedMarts = [...filteredMarts].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      return sortDirection === 'asc'
        ? (aVal as string).localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal as string);
    }
    return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  // Pagination
  const totalPages = Math.ceil(sortedMarts.length / itemsPerPage) || 1;
  const paginatedMarts = sortedMarts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: 'salesRaw' | 'grossProfitRaw' | 'name') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStatusBadge = (status: MartStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/15 dark:border-[#A3E6C5]/20">
            <CheckCircle className="w-2.5 h-2.5" /> Active
          </span>
        );
      case 'Delayed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#B45309] dark:bg-[#3D2D10] dark:text-[#FBBF24] border border-[#FDE68A] dark:border-[#78350F]">
            <AlertTriangle className="w-2.5 h-2.5" /> Delayed
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#DC2626] dark:bg-[#3D1717] dark:text-[#FCA5A5] border border-[#FECACA] dark:border-[#7F1D1D]">
            <XCircle className="w-2.5 h-2.5" /> Inactive
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 flex flex-col justify-between">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-[#DDE6E0] dark:border-[#1E3129]">
        <div>
          <h2 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] tracking-tight">
            Monitoring Overview
          </h2>
        </div>

        {/* Local Search only */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-[#8A958F]" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search table..."
              className="pl-6 pr-2 py-1 text-[11px] rounded-md border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] placeholder-[#8A958F] focus:outline-none focus:ring-1 focus:ring-[#174F3A]"
            />
          </div>
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto my-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#DDE6E0] dark:border-[#1E3129] text-[10px] font-bold uppercase tracking-wider text-[#66736C] dark:text-[#8E9E96] bg-[#F8FAF7] dark:bg-[#16241E]">
              <th
                onClick={() => handleSort('name')}
                className="py-2.5 px-2 cursor-pointer hover:text-[#174F3A] dark:hover:text-[#A3E6C5] transition-colors"
              >
                <div className="flex items-center gap-1">
                  Rural Mart <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th className="py-2.5 px-2">District</th>
              <th className="py-2.5 px-2">Status</th>
              <th
                onClick={() => handleSort('salesRaw')}
                className="py-2.5 px-2 cursor-pointer hover:text-[#174F3A] dark:hover:text-[#A3E6C5] transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  Sales (₹) <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th
                onClick={() => handleSort('grossProfitRaw')}
                className="py-2.5 px-2 cursor-pointer hover:text-[#174F3A] dark:hover:text-[#A3E6C5] transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  Profit (₹) <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th className="py-2.5 px-2 text-right">Farmers</th>
              <th className="py-2.5 px-2 text-right">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDE6E0]/60 dark:divide-[#1E3129]/60 font-medium">
            {paginatedMarts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#8A958F]">
                  No Rural Marts found matching search.
                </td>
              </tr>
            ) : (
              paginatedMarts.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => onSelectMart(m)}
                  className="hover:bg-[#F8FAF7] dark:hover:bg-[#16241E] cursor-pointer transition-colors text-[#17221D] dark:text-[#E6ECE8]"
                >
                  <td className="py-2.5 px-2 font-bold text-[#17221D] dark:text-[#E6ECE8]">
                    {m.name}
                  </td>
                  <td className="py-2.5 px-2 text-[#66736C] dark:text-[#8E9E96]">{m.district}</td>
                  <td className="py-2.5 px-2">{getStatusBadge(m.status)}</td>
                  <td className="py-2.5 px-2 text-right font-bold text-[#174F3A] dark:text-[#A3E6C5]">
                    {m.salesRaw > 0 ? `₹${(m.salesRaw / 100000).toFixed(1)} L` : '₹0'}
                  </td>
                  <td className="py-2.5 px-2 text-right font-bold text-[#34735A] dark:text-[#8ECAAA]">
                    {m.grossProfitRaw > 0 ? `₹${(m.grossProfitRaw / 100000).toFixed(1)} L` : '₹0'}
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    {m.registeredFarmers.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-2 text-right text-[11px] text-[#66736C] dark:text-[#8E9E96]">
                    {m.lastUpdated}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#DDE6E0] dark:border-[#1E3129] text-xs text-[#66736C] dark:text-[#8E9E96]">
        <span>
          Showing {paginatedMarts.length} of {sortedMarts.length} Marts
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 rounded border border-[#DDE6E0] dark:border-[#1E3129] disabled:opacity-40 hover:bg-[#F8FAF7] dark:hover:bg-[#16241E]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1 rounded border border-[#DDE6E0] dark:border-[#1E3129] disabled:opacity-40 hover:bg-[#F8FAF7] dark:hover:bg-[#16241E]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
