import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Store,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { RuralMartData } from '../../../shared/types';

interface RuralMartDirectoryTableProps {
  marts: RuralMartData[];
  onSelectMart: (mart: RuralMartData) => void;
}

export const RuralMartDirectoryTable: React.FC<RuralMartDirectoryTableProps> = ({
  marts,
  onSelectMart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'name' | 'score' | 'salesRaw' | 'lastUpdated'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Extract unique districts
  const districts = useMemo(() => {
    const set = new Set(marts.map((m) => m.district));
    return ['All', ...Array.from(set)];
  }, [marts]);

  // Filter & Sort
  const filteredMarts = useMemo(() => {
    return marts
      .filter((m) => {
        const matchesSearch =
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.district.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === 'All' || m.status.toLowerCase() === statusFilter.toLowerCase();

        const matchesDistrict =
          districtFilter === 'All' || m.district === districtFilter;

        return matchesSearch && matchesStatus && matchesDistrict;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          return sortOrder === 'asc'
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }

        return sortOrder === 'asc'
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      });
  }, [marts, searchTerm, statusFilter, districtFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredMarts.length / itemsPerPage) || 1;
  const paginatedMarts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMarts.slice(start, start + itemsPerPage);
  }, [filteredMarts, currentPage]);

  const handleSort = (field: 'name' | 'score' | 'salesRaw' | 'lastUpdated') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Rural Mart', 'Manager', 'District', 'Status', 'Score', 'Sales (₹)', 'Registered Farmers', 'Last Updated'];
    const rows = filteredMarts.map((m) => [
      m.name,
      m.manager,
      m.district,
      m.status,
      m.score,
      m.salesRaw,
      m.registeredFarmers,
      m.lastUpdated,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rural_marts_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 flex flex-col justify-between h-full">
      {/* Header & Controls */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-emerald-900/30">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-emerald-50 tracking-tight">
              Rural Mart Directory
            </h3>
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 transition-colors self-start sm:self-auto"
            title="Export CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Directory</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-emerald-400/60" />
            <input
              type="text"
              placeholder="Search mart or manager..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/40 rounded-xl text-slate-900 dark:text-emerald-100 placeholder-slate-400 dark:placeholder-emerald-500/70 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/40 rounded-xl px-2">
            <Filter className="w-3 h-3 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent py-1.5 text-xs text-slate-700 dark:text-emerald-200 focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-white dark:bg-emerald-950">Status: All</option>
              <option value="Active" className="bg-white dark:bg-emerald-950">Active Only</option>
              <option value="Delayed" className="bg-white dark:bg-emerald-950">Delayed Only</option>
              <option value="Inactive" className="bg-white dark:bg-emerald-950">Inactive Only</option>
            </select>
          </div>

          {/* District Filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/40 rounded-xl px-2">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <select
              value={districtFilter}
              onChange={(e) => {
                setDistrictFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent py-1.5 text-xs text-slate-700 dark:text-emerald-200 focus:outline-none cursor-pointer"
            >
              {districts.map((d) => (
                <option key={d} value={d} className="bg-white dark:bg-emerald-950">
                  {d === 'All' ? 'District: All' : d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-emerald-800/30">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-emerald-900/40 border-b border-slate-200 dark:border-emerald-800/30 text-slate-600 dark:text-emerald-300 font-semibold">
                <th
                  onClick={() => handleSort('name')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-emerald-800/40 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Rural Mart</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Owner / Manager</th>
                <th className="py-2.5 px-3">District</th>
                <th
                  onClick={() => handleSort('score')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-emerald-800/40 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Score</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Status</th>
                <th
                  onClick={() => handleSort('lastUpdated')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-emerald-800/40 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Last Updated</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/30">
              {paginatedMarts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-emerald-400/60">
                    No Rural Marts found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedMarts.map((mart) => {
                  const isAccurate = mart.status === 'Active';
                  const isDelayed = mart.status === 'Delayed';

                  return (
                    <tr
                      key={mart.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-emerald-900/20 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-emerald-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                            <Store className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="block font-bold">{mart.name}</span>
                            <span className="text-[10px] text-slate-400 dark:text-emerald-400/60">
                              ₹{(mart.salesRaw / 100000).toFixed(1)}L Sales
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-slate-700 dark:text-emerald-200">
                        <span className="block font-medium">{mart.manager}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{mart.contact}</span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-600 dark:text-emerald-300">
                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md text-[11px]">
                          <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          {mart.district}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-emerald-100">
                        <span className="text-emerald-700 dark:text-emerald-300">{mart.score}</span>
                        <span className="text-[10px] text-slate-400 font-normal">/100</span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isAccurate
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                              : isDelayed
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                          }`}
                        >
                          {isAccurate ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : isDelayed ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {mart.status}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-500 dark:text-emerald-400/80 text-[11px]">
                        {mart.lastUpdated}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onSelectMart(mart)}
                          className="p-1.5 rounded-lg text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors inline-flex items-center gap-1 font-semibold text-xs"
                          title="Inspect Rural Mart Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-emerald-900/30 text-xs">
        <span className="text-slate-500 dark:text-emerald-400/80">
          Page {currentPage} of {totalPages} ({filteredMarts.length} total)
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-emerald-800/40 text-slate-600 dark:text-emerald-300 hover:bg-slate-100 dark:hover:bg-emerald-900/40 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-emerald-800/40 text-slate-600 dark:text-emerald-300 hover:bg-slate-100 dark:hover:bg-emerald-900/40 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
