import React, { useMemo } from 'react';
import {
  Calendar,
  MapPin,
  Filter,
  Search,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { GlobalFilters } from '../../../shared/types';
import { getRuralMarts } from '../../../shared/dataServices';

interface ReportsFiltersProps {
  filters: GlobalFilters;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilters>>;
  selectedReportType: string;
  setSelectedReportType: (type: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const ReportsFilters: React.FC<ReportsFiltersProps> = ({
  filters,
  setFilters,
  selectedReportType,
  setSelectedReportType,
  searchQuery,
  setSearchQuery,
}) => {
  const districts = ['All Districts', 'Erode', 'Coimbatore', 'Tiruppur', 'Salem', 'Madurai'];
  const ruralMarts = useMemo(() => {
    const canonicalMarts = getRuralMarts();
    if (canonicalMarts.length === 0) return ['All Rural Marts'];
    return ['All Rural Marts', ...canonicalMarts.map((m) => m.ruralMartName.replace(' Rural Mart', ''))];
  }, []);

  const dateRanges = [
    'Last 30 Days',
    'This Month (Jul 2026)',
    'Last Quarter (Q2 2026)',
    'Financial Year 2025-26',
    'All Time',
  ];

  const reportTypes = [
    'All Report Types',
    'Combined Network',
    'Individual Mart',
    'Business & Finance',
    'Farmers & Outreach',
    'Products & Inventory',
    'Comparison',
  ];

  const handleReset = () => {
    setFilters((prev) => ({
      ...prev,
      district: 'All Districts',
      ruralMart: 'All Rural Marts',
      dateRange: 'Last 30 Days',
    }));
    setSelectedReportType('All Report Types');
    setSearchQuery('');
  };

  const isFiltered =
    filters.district !== 'All Districts' ||
    filters.ruralMart !== 'All Rural Marts' ||
    filters.dateRange !== 'Last 30 Days' ||
    selectedReportType !== 'All Report Types' ||
    searchQuery.trim() !== '';

  return (
    <div className="bg-white dark:bg-emerald-950/70 border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-300">
          <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Report Filters</span>
        </div>

        {isFiltered && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 px-2.5 py-1 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report title, keyword..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        {/* Date Range Dropdown */}
        <div className="relative">
          <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/60 pointer-events-none" />
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value }))}
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
          >
            {dateRanges.map((dr) => (
              <option key={dr} value={dr} className="bg-white dark:bg-emerald-950 text-slate-900 dark:text-white">
                {dr}
              </option>
            ))}
          </select>
        </div>

        {/* District Dropdown */}
        <div className="relative">
          <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/60 pointer-events-none" />
          <select
            value={filters.district}
            onChange={(e) => setFilters((prev) => ({ ...prev, district: e.target.value as any }))}
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
          >
            {districts.map((d) => (
              <option key={d} value={d} className="bg-white dark:bg-emerald-950 text-slate-900 dark:text-white">
                {d}
              </option>
            ))}
          </select>
        </div>


        {/* Report Type Dropdown */}
        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/60 pointer-events-none" />
          <select
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
          >
            {reportTypes.map((rt) => (
              <option key={rt} value={rt} className="bg-white dark:bg-emerald-950 text-slate-900 dark:text-white">
                {rt}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
