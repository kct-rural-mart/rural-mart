import React, { useEffect, useState, useMemo } from 'react';
import { GlobalFilters, Theme, RuralMartData } from '../../../shared/types';
import { getLiveRuralMarts } from '../../services/ruralMartsService';
import { ReportPreviewModal, ReportConfig } from './ReportPreviewModal';
import {
  FileText,
  Briefcase,
  Users,
  Package,
  Search,
  Filter,
  Download,
  Building2,
  CheckCircle2,
  Globe,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface ReportsPageProps {
  theme: Theme;
  filters: GlobalFilters;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilters>>;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  theme,
  filters,
  setFilters,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [previewConfig, setPreviewConfig] = useState<ReportConfig | null>(null);

  const [allMarts, setAllMarts] = useState<RuralMartData[]>([]);
  const [loadError, setLoadError] = useState('');
  useEffect(() => { let active = true; setLoadError(''); void getLiveRuralMarts(filters.dateRange).then((marts) => { if (active) setAllMarts(marts); }).catch((reason: unknown) => { if (active) setLoadError(reason && typeof reason === 'object' && 'message' in reason ? String((reason as { message: unknown }).message) : 'Unable to load reports.'); }); return () => { active = false; }; }, [filters.dateRange]);

  // Toast state
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  const triggerToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 4000);
  };

  // Get list of unique districts for filter dropdown
  const districts = useMemo(() => {
    const list = Array.from(new Set(allMarts.map((m) => m.district)));
    return ['All Districts', ...list];
  }, [allMarts]);

  // Filter rural marts based on search and district selection
  const filteredMarts = useMemo(() => {
    return allMarts.filter((mart) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        mart.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mart.district.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDistrict =
        selectedDistrict === 'All Districts' || mart.district === selectedDistrict;

      return matchesSearch && matchesDistrict;
    });
  }, [allMarts, searchQuery, selectedDistrict]);

  // Handle open preview modal for Individual Mart
  const handleOpenIndividualPreview = (
    mart: RuralMartData,
    category: 'overall' | 'business' | 'farmers' | 'products'
  ) => {
    setPreviewConfig({
      scope: 'individual',
      category,
      mart,
      allMarts,
    });
  };

  // Handle open preview modal for Overall Network
  const handleOpenOverallPreview = (
    category: 'overall' | 'business' | 'farmers' | 'products'
  ) => {
    setPreviewConfig({
      scope: 'overall',
      category,
      mart: null,
      allMarts,
    });
  };

  // Handle Download from Preview Modal
  const handleModalDownload = (reportTitle: string, format: 'PDF' | 'Excel' | 'CSV') => {
    triggerToast(`Downloaded "${reportTitle}" in ${format} format successfully.`);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {loadError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{loadError}</div>}
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-900 text-white shadow-2xl border border-emerald-700 animate-slideUp max-w-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-emerald-100">{toast.message}</span>
        </div>
      )}

      {/* Header & Filter Bar */}
      <div className="bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                <FileText className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-emerald-50">
                Reports & Document Generation
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-emerald-400 mt-1">
              Generate and download official compliance reports for individual Rural Marts or aggregate network summaries.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {allMarts.length} Outposts Online
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100 dark:border-emerald-900/30">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Rural Mart by name or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-emerald-800/50 bg-slate-50 dark:bg-[#0B130F] text-slate-900 dark:text-emerald-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {/* District Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-emerald-800/50 bg-slate-50 dark:bg-[#0B130F] text-slate-900 dark:text-emerald-100 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 1: OVERALL NETWORK MASTER REPORTS */}
      <section className="bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-emerald-900/30 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                <Globe className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-emerald-50">
                Download Overall Report — All Rural Marts Network
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-emerald-400 mt-1">
              Generate unified, state-wide executive audit reports combining metrics across all {allMarts.length} active Rural Mart outposts.
            </p>
          </div>

          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/40 px-3 py-1 rounded-full shrink-0">
            State-Wide Consolidated Audit
          </span>
        </div>

        {/* 4 Master Download Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Master 1: Overall Combined */}
          <div className="bg-slate-50 dark:bg-[#0B130F] border border-slate-200 dark:border-[#1E3129] rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/50 transition-all">
            <div>
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 w-fit mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-emerald-50">
                Overall Network Master Report
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-emerald-400 mt-1">
                Complete operational, financial, farmer outreach & inventory audit for all {allMarts.length} Rural Marts.
              </p>
            </div>

            <button
              onClick={() => handleOpenOverallPreview('overall')}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Preview & Download</span>
            </button>
          </div>

          {/* Master 2: Business & Finance */}
          <div className="bg-slate-50 dark:bg-[#0B130F] border border-slate-200 dark:border-[#1E3129] rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/50 transition-all">
            <div>
              <div className="p-2.5 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 w-fit mb-2">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-emerald-50">
                Network Business & Finance
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-emerald-400 mt-1">
                Aggregated sales volume, gross profit margins, operating costs & bill analytics across all outposts.
              </p>
            </div>

            <button
              onClick={() => handleOpenOverallPreview('business')}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Preview & Download</span>
            </button>
          </div>

          {/* Master 3: Farmers & Outreach */}
          <div className="bg-slate-50 dark:bg-[#0B130F] border border-slate-200 dark:border-[#1E3129] rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/50 transition-all">
            <div>
              <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 w-fit mb-2">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-emerald-50">
                Network Farmers & Outreach
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-emerald-400 mt-1">
                Total farmer registrations, active reach, footfall metrics, repeat buyer rates & retention logs.
              </p>
            </div>

            <button
              onClick={() => handleOpenOverallPreview('farmers')}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Preview & Download</span>
            </button>
          </div>

          {/* Master 4: Products & Inventory */}
          <div className="bg-slate-50 dark:bg-[#0B130F] border border-slate-200 dark:border-[#1E3129] rounded-xl p-4 flex flex-col justify-between hover:border-purple-500/50 transition-all">
            <div>
              <div className="p-2.5 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 w-fit mb-2">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-emerald-50">
                Network Products & Inventory
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-emerald-400 mt-1">
                State-wide catalog stock health, fast/slow moving SKU analysis & reorder alerts.
              </p>
            </div>

            <button
              onClick={() => handleOpenOverallPreview('products')}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Preview & Download</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: INDIVIDUAL RURAL MART TILES / KPI CARDS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-emerald-300 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Individual Rural Mart Reports
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-emerald-400/80">
              Click any report category button on a Rural Mart tile to preview and download its specific report.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-emerald-400 bg-slate-100 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-emerald-800/40">
            Showing {filteredMarts.length} Marts
          </span>
        </div>

        {/* Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMarts.map((mart) => (
            <div
              key={mart.id}
              className="bg-white dark:bg-[#121E19] border border-slate-200 dark:border-[#1E3129] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 space-y-3 flex flex-col justify-between"
            >
              {/* Tile Header */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-emerald-50">
                      {mart.name}
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40 inline-block mt-0.5">
                      {mart.district} District
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 block">
                      Score: {mart.score}/100
                    </span>
                    <span className="text-[10px] text-slate-400">Target: {mart.targetScore}</span>
                  </div>
                </div>

                {/* KPI Summary Strip */}
                <div className="grid grid-cols-2 gap-2 mt-3 p-2 rounded-xl bg-slate-50 dark:bg-[#0B130F] border border-slate-100 dark:border-emerald-900/30 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Sales Volume</span>
                    <span className="font-bold text-slate-800 dark:text-emerald-100">
                      ₹{(mart.salesRaw / 100000).toFixed(1)} Lakhs
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Farmers</span>
                    <span className="font-bold text-slate-800 dark:text-emerald-100">
                      {mart.registeredFarmers.toLocaleString()} Reg.
                    </span>
                  </div>
                </div>
              </div>

              {/* Download Report Button */}
              <div className="pt-2 border-t border-slate-100 dark:border-emerald-900/30">
                <button
                  onClick={() => handleOpenIndividualPreview(mart, 'overall')}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Preview & Download Report</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Report Preview & Download Modal */}
      <ReportPreviewModal
        config={previewConfig}
        dateRange={filters.dateRange}
        onClose={() => setPreviewConfig(null)}
        onDownload={handleModalDownload}
      />
    </div>
  );
};
