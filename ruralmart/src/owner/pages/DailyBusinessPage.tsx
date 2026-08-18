import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  X,
  History,
  Calendar,
  Filter,
  UserPlus,
  Users,
  Edit2,
  CheckCircle2,
  Save,
  Check,
  Trash2,
  Receipt,
  Package,
  ShoppingBag,
  Eye,
  User,
  MapPin,
  Building2,
  Phone,
} from 'lucide-react';
import { getOwnerFarmers } from '../../ownerMockData';
import {
  deleteFarmer,
  updateOperationalEntry,
  deleteOperationalEntry,
  BillLineItem,
} from '../../shared/dataServices';
import { CanonicalFarmer } from '../../shared/types/storage';
import { BillingPanel, BillingPanelHandle } from '../components/BillingPanel';
import { getDailyBusinessLiveData } from '../services/billingService';

interface DailyBusinessPageProps {
  currentMartId?: string | null;
  theme: 'light' | 'dark';
  searchQuery: string;
  dateRange: string;
}

interface OperationalEntry {
  id: string;
  timestamp: string;
  date: string;
  category: string;
  salesValue: number;
  procurementValue: number;
  openingStock: number;
  closingStock: number;
  salesQty: number;
  procurementQty: number;
  customerBills: number;
  farmerName?: string;
  status: 'Saved' | 'Edited';
  billNumber?: string;
  lineItems?: BillLineItem[];
  farmerId?: string;
}

export const DailyBusinessPage: React.FC<DailyBusinessPageProps> = ({
  currentMartId,
  theme,
  searchQuery: externalSearchQuery,
  dateRange,
}) => {
  const isDark = theme === 'dark';
  const RURAL_MART_ID = currentMartId || '';

  // --- REFRESH TRIGGER FOR AUTOMATIC METRICS & CATALOG SYNC ---
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // --- AUTOMATIC DERIVED METRICS FROM CANONICAL RECORDS ---
  const [metrics, setMetrics] = useState({
    procurementQty: 0, procurementValue: 0, openingStock: 0, closingStock: 0,
    salesQty: 0, totalSales: 0, customerBills: 0, avgBillValue: 0,
  });

  // --- REUSABLE BILLING PANEL: ref for external actions (Registered Customers panel) ---
  const billingPanelRef = useRef<BillingPanelHandle>(null);
  // Mirrors the BillingPanel's currently attached customer, so this page's own
  // Registered Customers directory can highlight the same "Attached" row.
  const [attachedFarmer, setAttachedFarmer] = useState<{ id: string; farmerCode?: string } | null>(null);

  // --- ENTRY HISTORY STATE ---
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [savedEntries, setSavedEntries] = useState<OperationalEntry[]>([]);

  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyDate, setHistoryDate] = useState<string>('');
  const [historyFilterStatus, setHistoryFilterStatus] = useState<string>('All');

  // Entry History Editing State
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editEntryFarmerName, setEditEntryFarmerName] = useState<string>('');
  const [editEntrySalesValue, setEditEntrySalesValue] = useState<string>('');
  const [editEntryCategory, setEditEntryCategory] = useState<string>('');

  // View Customer Modal State (Owner-side equivalent of Admin Purchase History Modal)
  const [viewFarmer, setViewFarmer] = useState<CanonicalFarmer | null>(null);

  // All registered farmers for the Registered Customers directory panel
  const [allRegisteredFarmers, setAllRegisteredFarmers] = useState<CanonicalFarmer[]>([]);

  useEffect(() => {
    let active = true;
    if (!RURAL_MART_ID) return;
    getDailyBusinessLiveData(RURAL_MART_ID, dateRange)
      .then((result) => {
        if (!active) return;
        setMetrics(result.metrics);
        setSavedEntries(result.entries);
        setAllRegisteredFarmers(result.farmers);
      })
      .catch((error) => console.error('Failed to load live daily business data:', error));
    return () => { active = false; };
  }, [RURAL_MART_ID, dateRange, refreshKey]);

  // Purchase history & summary for the customer currently open in the View modal
  const viewFarmerSales = useMemo(() => {
    if (!viewFarmer) return [];
    return savedEntries
      .filter((entry) => entry.farmerId === viewFarmer.id)
      .map((entry) => ({
        id: entry.id,
        date: entry.date,
        billNumber: entry.billNumber ?? entry.id,
        amount: entry.salesValue,
        lineItems: entry.lineItems,
        productName: entry.lineItems?.[0]?.productName,
        salesQty: entry.salesQty,
      }));
  }, [viewFarmer, savedEntries]);

  const viewCustomerSummary = useMemo(() => {
    if (!viewFarmer) {
      return { totalVisits: 0, totalBills: 0, totalQty: 0, totalSpent: 0, lastVisit: '—' };
    }

    let totalQty = 0;
    let totalSpent = viewFarmerSales.reduce((sum, s) => sum + (s.amount || 0), 0);
    let totalBills = viewFarmerSales.length;

    viewFarmerSales.forEach((s) => {
      if (s.lineItems) {
        s.lineItems.forEach((item) => {
          totalQty += item.quantity || 0;
        });
      }
    });

    if (totalSpent === 0 && viewFarmer.totalPurchasesVal) {
      totalSpent = viewFarmer.totalPurchasesVal;
    }
    if (totalBills === 0 && viewFarmer.totalPurchases) {
      totalBills = viewFarmer.totalPurchases;
    }

    const lastVisit = viewFarmerSales.length > 0 ? viewFarmerSales[0].date : viewFarmer.lastVisit || '—';

    return {
      totalVisits: Math.max(totalBills, 1),
      totalBills,
      totalQty,
      totalSpent,
      lastVisit,
    };
  }, [viewFarmer, viewFarmerSales]);

  // Entry History Action Handlers
  const handleStartEditEntry = (item: OperationalEntry) => {
    setEditingEntryId(item.id);
    setEditEntryFarmerName(item.farmerName || '');
    setEditEntrySalesValue(String(item.salesValue || 0));
    setEditEntryCategory(item.category || '');
  };

  const handleSaveEntryEdit = (entryId: string) => {
    updateOperationalEntry(RURAL_MART_ID, entryId, {
      farmerName: editEntryFarmerName.trim(),
      salesValue: Number(editEntrySalesValue) || 0,
      category: editEntryCategory.trim(),
    });
    setEditingEntryId(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleDeleteEntry = (item: OperationalEntry) => {
    if (
      window.confirm(
        `Are you sure you want to delete bill entry #${item.billNumber || item.id}? This will reverse stock deductions and remove the sale record.`
      )
    ) {
      deleteOperationalEntry(RURAL_MART_ID, item.id);
      setRefreshKey((prev) => prev + 1);
    }
  };

  // ----------------------------------------------------
  // REGISTERED CUSTOMERS PANEL HANDLERS
  // These delegate the actual attach/edit behavior to the reusable BillingPanel
  // (via ref) instead of re-implementing customer selection/edit logic here.
  // ----------------------------------------------------
  const handleEditFromPanel = (f: CanonicalFarmer) => {
    billingPanelRef.current?.editFarmer(f);
  };

  // Registered Customers panel: Delete action (confirmation required)
  const handleDeleteFarmer = (f: CanonicalFarmer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete customer "${f.name}" (${f.farmerCode || f.id})? This action cannot be undone.`
    );
    if (!confirmed) return;

    deleteFarmer(f.id);

    billingPanelRef.current?.clearIfMatches(f.id, f.farmerCode);
    if (attachedFarmer && (attachedFarmer.id === f.id || attachedFarmer.farmerCode === f.farmerCode)) {
      setAttachedFarmer(null);
    }
    if (viewFarmer && viewFarmer.id === f.id) {
      setViewFarmer(null);
    }

    setRefreshKey((prev) => prev + 1);
  };

  // History filtering
  const filteredHistory = savedEntries.filter((entry) => {
    const matchSearch =
      !historySearch ||
      entry.category.toLowerCase().includes(historySearch.toLowerCase()) ||
      (entry.farmerName && entry.farmerName.toLowerCase().includes(historySearch.toLowerCase())) ||
      (entry.billNumber && entry.billNumber.toLowerCase().includes(historySearch.toLowerCase()));
    
    const matchDate = !historyDate || entry.date === historyDate;
    const matchStatus = historyFilterStatus === 'All' || entry.status === historyFilterStatus;

    return matchSearch && matchDate && matchStatus;
  });

  const clearHistoryFilters = () => {
    setHistorySearch('');
    setHistoryDate('');
    setHistoryFilterStatus('All');
  };

  // Metrics Display Variables
  const totalDailySales = metrics.totalSales;
  const totalBills = metrics.customerBills;
  const avgBillValue = metrics.avgBillValue;
  const dailyFootfall = totalBills;
  const conversionRate = dailyFootfall > 0 ? '100.0' : '0';

  return (
    <div className="space-y-4">
      
      {/* PAGE HEADER */}
      <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#17221D] dark:text-[#E6ECE8]">
            Daily Business Register
          </h1>
          <p className="text-xs text-[#66736C] dark:text-[#8E9E96]">
            Record farmer purchases & customer bills. Operational metrics update automatically.
          </p>
        </div>

        {/* Top Right "Entry History" Button */}
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="h-9 px-3.5 bg-[#174F3A] hover:bg-[#103A2B] dark:bg-[#1B3D30] dark:hover:bg-[#234F3F] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <History className="w-4 h-4 text-[#A3E6C5]" />
          <span>Entry History</span>
          <span className="inline-flex items-center justify-center bg-emerald-500/20 text-[#A3E6C5] font-mono text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 min-w-[20px]">
            {savedEntries.length}
          </span>
        </button>
      </div>

      {/* TOP SUMMARY CARDS (4 metric cards in a row - Derived Automatically) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Card 1: Daily Sales */}
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[11px] font-semibold text-[#66736C] dark:text-[#8E9E96] uppercase tracking-wider block">
            Daily Sales
          </span>
          <div className="text-2xl font-extrabold text-[#17221D] dark:text-[#E6ECE8]">
            ₹{totalDailySales.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            Automated total from farmer bills
          </span>
        </div>

        {/* Card 2: Average Bill Value */}
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[11px] font-semibold text-[#66736C] dark:text-[#8E9E96] uppercase tracking-wider block">
            Average Bill Value
          </span>
          <div className="text-2xl font-extrabold text-[#17221D] dark:text-[#E6ECE8]">
            ₹{avgBillValue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#8A958F] block">
            Across {totalBills} customer transactions
          </span>
        </div>

        {/* Card 3: Customer Bills */}
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[11px] font-semibold text-[#66736C] dark:text-[#8E9E96] uppercase tracking-wider block">
            Customer Bills
          </span>
          <div className="text-2xl font-extrabold text-[#17221D] dark:text-[#E6ECE8]">
            {totalBills}
          </div>
          <span className="text-[10px] text-[#8A958F] block">
            Total unique billing transactions
          </span>
        </div>

        {/* Card 4: Conversion Rate */}
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[11px] font-semibold text-[#66736C] dark:text-[#8E9E96] uppercase tracking-wider block">
            Conversion Rate
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {conversionRate}%
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            Visitors converted to purchases
          </span>
        </div>

      </div>

      {/* MAIN TWO-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT SECTION: Farmer Purchase & Bill Entry Form (reusable BillingPanel — also used by the Page 1 Overall Dashboard "Daily Sale" Quick Action modal) */}
        <div className="lg:col-span-7 space-y-4">

          <BillingPanel
            ref={billingPanelRef}
            ruralMartId={RURAL_MART_ID}
            theme={theme}
            refreshKey={refreshKey}
            onDataChanged={() => setRefreshKey((prev) => prev + 1)}
            onMatchedFarmerChange={(f) => setAttachedFarmer(f ? { id: f.id, farmerCode: f.farmerCode } : null)}
          />

          {/* AUTOMATIC OPERATIONAL METRICS SUMMARY PANEL */}
          <div className="card-enterprise p-4 sm:p-5 space-y-3">
            <div className="border-b border-[#E9EFEB] dark:border-[#16241E] pb-2.5 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase tracking-wider">
                  Automated Operational Metrics Summary
                </h3>
                <p className="text-[11px] text-[#66736C] dark:text-[#8E9E96]">
                  Calculated live from stored inventory procurement and farmer sales transactions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] space-y-0.5">
                <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] font-semibold block uppercase">Opening Stock</span>
                <span className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8]">{metrics.openingStock} units</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] space-y-0.5">
                <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] font-semibold block uppercase">Procurement Qty</span>
                <span className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8]">{metrics.procurementQty} units</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] space-y-0.5">
                <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] font-semibold block uppercase">Sales Quantity</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{metrics.salesQty} units</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] space-y-0.5">
                <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] font-semibold block uppercase">Closing Stock</span>
                <span className="text-sm font-bold text-[#174F3A] dark:text-[#A3E6C5]">{metrics.closingStock} units</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] space-y-0.5">
                <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] font-semibold block uppercase">Procurement Value</span>
                <span className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8]">₹{metrics.procurementValue.toLocaleString('en-IN')}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] space-y-0.5">
                <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] font-semibold block uppercase">Total Sales Value</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{metrics.totalSales.toLocaleString('en-IN')}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] space-y-0.5">
                <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] font-semibold block uppercase">Customer Bills</span>
                <span className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8]">{metrics.customerBills} bills</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] space-y-0.5">
                <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] font-semibold block uppercase">Average Bill Value</span>
                <span className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8]">₹{metrics.avgBillValue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SECTION: Registered Farmers Directory & Quick Attach */}
        <div className="lg:col-span-5 card-enterprise p-4 sm:p-5 space-y-4">
          <div className="border-b border-[#E9EFEB] dark:border-[#16241E] pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
                <span>Registered Customers ({allRegisteredFarmers.length})</span>
              </h2>
              <p className="text-[11px] text-[#66736C] dark:text-[#8E9E96]">
                Quick lookup directory for registered farmers in this Rural Mart.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {allRegisteredFarmers.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#66736C] dark:text-[#8E9E96] border border-dashed border-[#DDE6E0] dark:border-[#1E3129] rounded-xl space-y-1">
                <UserPlus className="w-5 h-5 mx-auto text-slate-400" />
                <p className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">No registered farmers yet</p>
                <p>Register a new farmer customer on the left panel to add them to your directory.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {allRegisteredFarmers.map((f) => {
                  const isSelected = attachedFarmer?.id === f.id || attachedFarmer?.farmerCode === f.farmerCode;
                  return (
                    <div
                      key={f.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-[#143825] border-emerald-300 dark:border-emerald-700 shadow-xs'
                          : 'bg-white dark:bg-[#121E19] border-[#DDE6E0] dark:border-[#1E3129] hover:border-[#174F3A]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">
                              {f.name}
                            </span>
                            <span className="text-[10px] font-mono font-semibold text-[#174F3A] dark:text-[#A3E6C5] bg-[#E7F2EC] dark:bg-[#1B3D30] px-1.5 py-0.5 rounded">
                              {f.farmerCode || f.id}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#66736C] dark:text-[#8E9E96] mt-0.5 space-y-0.5">
                            <div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{f.village}</span>
                              {f.gramPanchayat ? `, ${f.gramPanchayat}` : ''} ({f.district || 'Erode'})
                            </div>
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                                {f.totalAnimalPopulation ?? f.animalHeadCount ?? 0} Animals ({f.numCattle ?? f.animalHeadCount ?? 0} Cattle)
                              </span>
                              <span>•</span>
                              <span>{f.phone}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                          <button
                            type="button"
                            title="View Customer"
                            onClick={() => setViewFarmer(f)}
                            className="p-1.5 rounded-lg text-[#174F3A] dark:text-[#A3E6C5] hover:bg-[#E7F2EC] dark:hover:bg-[#1B3D30] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Edit Customer"
                            onClick={() => handleEditFromPanel(f)}
                            className="p-1.5 rounded-lg text-[#174F3A] dark:text-[#A3E6C5] hover:bg-[#E7F2EC] dark:hover:bg-[#1B3D30] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete Customer"
                            onClick={() => handleDeleteFarmer(f)}
                            className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => billingPanelRef.current?.attachFarmer(f)}
                            className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#F0F5F2] dark:bg-[#1B3D30] text-[#174F3A] dark:text-[#A3E6C5] hover:bg-[#174F3A] hover:text-white'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Attached</span>
                              </>
                            ) : (
                              <span>Attach to Bill</span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* SLIDE-OVER PANEL: ENTRY HISTORY */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setIsHistoryOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-[#121E19] border-l border-[#DDE6E0] dark:border-[#1E3129] shadow-2xl flex flex-col justify-between">
              
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-[#E9EFEB] dark:border-[#16241E] flex items-center justify-between bg-[#F8FAF7] dark:bg-[#16241E]">
                <div>
                  <h2 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8]">
                    Entry History
                  </h2>
                  <p className="text-xs text-[#66736C] dark:text-[#8E9E96]">
                    {savedEntries.length} saved transaction entries
                  </p>
                </div>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filters Section */}
              <div className="p-4 space-y-3 border-b border-[#E9EFEB] dark:border-[#16241E]">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by bill number, category, farmer..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="date"
                      value={historyDate}
                      onChange={(e) => setHistoryDate(e.target.value)}
                      className="w-full h-8 px-2 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                    />
                  </div>

                  <select
                    value={historyFilterStatus}
                    onChange={(e) => setHistoryFilterStatus(e.target.value)}
                    className="w-full h-8 px-2 text-xs font-medium rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Saved">Saved</option>
                    <option value="Edited">Edited</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={clearHistoryFilters}
                    className="text-[11px] font-semibold text-[#174F3A] dark:text-[#A3E6C5] hover:underline cursor-pointer"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Entries Content List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredHistory.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] flex items-center justify-center text-slate-400">
                      <History className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8]">
                      No entries saved yet
                    </h3>
                    <p className="text-xs text-[#66736C] dark:text-[#8E9E96] max-w-xs mx-auto">
                      Daily farmer purchase bills and operational logs will show up here.
                    </p>
                  </div>
                ) : (
                  filteredHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] space-y-2.5"
                    >
                      <div className="flex items-center justify-between border-b border-[#E9EFEB] dark:border-[#1F3128] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#17221D] dark:text-[#E6ECE8]">
                            {item.billNumber || item.category}
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-[#143825] dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                            {item.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8A958F] font-mono">
                          {item.timestamp}
                        </span>
                      </div>

                      {editingEntryId === item.id ? (
                        <div className="space-y-2 pt-1 border-t border-[#DDE6E0] dark:border-[#1E3129]">
                          <div>
                            <label className="block text-[10px] font-bold text-[#17221D] dark:text-[#E6ECE8]">Customer Name</label>
                            <input
                              type="text"
                              value={editEntryFarmerName}
                              onChange={(e) => setEditEntryFarmerName(e.target.value)}
                              className="w-full h-7 px-2 text-xs rounded-md border bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8]"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-[#17221D] dark:text-[#E6ECE8]">Sales Amount (₹)</label>
                              <input
                                type="number"
                                value={editEntrySalesValue}
                                onChange={(e) => setEditEntrySalesValue(e.target.value)}
                                className="w-full h-7 px-2 text-xs rounded-md border bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-[#17221D] dark:text-[#E6ECE8]">Category / Notes</label>
                              <input
                                type="text"
                                value={editEntryCategory}
                                onChange={(e) => setEditEntryCategory(e.target.value)}
                                className="w-full h-7 px-2 text-xs rounded-md border bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8]"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingEntryId(null)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-white dark:bg-[#121E19] text-slate-600 dark:text-slate-300"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEntryEdit(item.id)}
                              className="px-2.5 py-1 text-xs font-bold rounded-md bg-[#174F3A] text-white"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-[#66736C] dark:text-[#8E9E96] block">Customer:</span>
                              <span className="font-bold text-[#17221D] dark:text-[#E6ECE8]">{item.farmerName || 'Counter Customer'}</span>
                            </div>
                            <div>
                              <span className="text-[#66736C] dark:text-[#8E9E96] block">Sales Value:</span>
                              <span className="font-bold text-[#174F3A] dark:text-[#A3E6C5]">₹{item.salesValue.toLocaleString('en-IN')}</span>
                            </div>
                            <div>
                              <span className="text-[#66736C] dark:text-[#8E9E96] block">Quantity Sold:</span>
                              <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">{item.salesQty} units</span>
                            </div>
                            <div>
                              <span className="text-[#66736C] dark:text-[#8E9E96] block">Customer Bill Count:</span>
                              <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">{item.customerBills} bill</span>
                            </div>
                          </div>

                          {item.lineItems && item.lineItems.length > 0 && (
                            <div className="bg-white dark:bg-[#121E19] p-2 rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] text-[10px] space-y-1">
                              <span className="font-bold text-[#66736C] dark:text-[#8E9E96] block">Billed Items:</span>
                              {item.lineItems.map((li: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-[#17221D] dark:text-[#E6ECE8]">
                                  <span>{li.productName} × {li.quantity} {li.unit}</span>
                                  <span className="font-semibold">₹{li.lineTotal}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-3 pt-1 border-t border-[#E9EFEB] dark:border-[#1F3128]">
                            <button
                              type="button"
                              onClick={() => handleStartEditEntry(item)}
                              className="text-[11px] font-bold text-[#174F3A] dark:text-[#A3E6C5] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit Entry</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEntry(item)}
                              className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete Entry</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#E9EFEB] dark:border-[#16241E] bg-[#F8FAF7] dark:bg-[#16241E]">
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(false)}
                  className="w-full h-9 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] hover:bg-[#E7F2EC] dark:hover:bg-[#182921] transition-colors cursor-pointer"
                >
                  Close Panel
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER VIEW MODAL: Profile & Purchase History (Admin FarmerPurchaseHistoryModal-equivalent) */}
      {viewFarmer && (
        <div
          onClick={() => setViewFarmer(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 dark:bg-black/80 backdrop-blur-md animate-fade-in cursor-default"
          style={{ touchAction: 'none' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col text-[#17221D] dark:text-[#E6ECE8] max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-[#DDE6E0] dark:border-[#1E3129] flex items-center justify-between bg-white dark:bg-[#121E19] shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#E7F2EC] dark:bg-[#1B3D30] text-[#103A2B] dark:text-[#A3E6C5]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold tracking-tight text-[#17221D] dark:text-[#E6ECE8]">
                      Customer Profile &amp; Purchase History
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/20">
                      {viewFarmer.farmerCode || viewFarmer.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#66736C] dark:text-[#8E9E96]">
                    Verified Mart Customer Summary &amp; Bill Breakdown
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewFarmer(null)}
                className="p-1.5 rounded-lg text-[#8A958F] hover:text-[#17221D] dark:hover:text-[#E6ECE8] hover:bg-[#F8FAF7] dark:hover:bg-[#16241E] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 space-y-4 text-xs overflow-y-auto">
              {/* Section 1: Customer Information */}
              <div className="p-4 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] space-y-2.5">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#103A2B] dark:text-[#A3E6C5] border-b border-[#DDE6E0] dark:border-[#1E3129] pb-1.5">
                  1. Customer Information
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] font-semibold flex items-center gap-1">
                      <User className="w-3 h-3 text-[#174F3A] dark:text-[#A3E6C5]" /> Customer Name
                    </span>
                    <p className="font-bold text-xs text-[#17221D] dark:text-[#E6ECE8] mt-0.5">
                      {viewFarmer.name}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] font-semibold flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-[#174F3A] dark:text-[#A3E6C5]" /> Rural Mart
                    </span>
                    <p className="font-bold text-xs text-[#103A2B] dark:text-[#A3E6C5] mt-0.5">
                      {viewFarmer.ruralMartId}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#174F3A] dark:text-[#A3E6C5]" /> Village / District
                    </span>
                    <p className="font-bold text-xs text-[#17221D] dark:text-[#E6ECE8] mt-0.5">
                      {viewFarmer.village}{viewFarmer.district ? `, ${viewFarmer.district}` : ''}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] font-semibold flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#174F3A] dark:text-[#A3E6C5]" /> Phone
                    </span>
                    <p className="font-bold text-xs text-[#17221D] dark:text-[#E6ECE8] mt-0.5">
                      {viewFarmer.phone}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#174F3A] dark:text-[#A3E6C5]" /> Registration Date
                    </span>
                    <p className="font-bold text-xs text-[#17221D] dark:text-[#E6ECE8] mt-0.5">
                      {viewFarmer.registrationDate || viewFarmer.joinedDate || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] font-semibold flex items-center gap-1">
                      <Package className="w-3 h-3 text-[#174F3A] dark:text-[#A3E6C5]" /> Category
                    </span>
                    <p className="font-bold text-xs text-[#17221D] dark:text-[#E6ECE8] mt-0.5">
                      {viewFarmer.category || 'Dairy Farmer'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Customer Summary Cards */}
              <div className="space-y-1.5">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#66736C] dark:text-[#8E9E96]">
                  2. Customer Summary
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] text-center">
                    <span className="text-[9px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase block">Total Visits</span>
                    <span className="text-sm font-extrabold text-[#17221D] dark:text-[#E6ECE8]">{viewCustomerSummary.totalVisits}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] text-center">
                    <span className="text-[9px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase block">Total Bills</span>
                    <span className="text-sm font-extrabold text-[#17221D] dark:text-[#E6ECE8]">{viewCustomerSummary.totalBills}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] text-center">
                    <span className="text-[9px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase block">Qty Purchased</span>
                    <span className="text-sm font-extrabold text-[#17221D] dark:text-[#E6ECE8]">{viewCustomerSummary.totalQty > 0 ? `${viewCustomerSummary.totalQty} Units` : '—'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#E7F2EC] dark:bg-[#1B3D30] border border-[#A3E6C5]/30 text-center col-span-2 sm:col-span-1">
                    <span className="text-[9px] font-bold text-[#174F3A] dark:text-[#A3E6C5] uppercase block">Total Spent</span>
                    <span className="text-sm font-black text-[#174F3A] dark:text-[#A3E6C5]">₹{viewCustomerSummary.totalSpent.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] text-center col-span-2 sm:col-span-1">
                    <span className="text-[9px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase block">Last Visit Date</span>
                    <span className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">{viewCustomerSummary.lastVisit}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Purchase History Table */}
              <div className="p-4 rounded-xl border border-[#174F3A]/30 dark:border-[#A3E6C5]/30 bg-[#E7F2EC]/40 dark:bg-[#1B3D30]/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#174F3A]/20 dark:border-[#A3E6C5]/20">
                  <span className="text-[11px] font-extrabold text-[#103A2B] dark:text-[#A3E6C5] uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt className="w-4 h-4" /> 3. Itemized Purchase History
                  </span>
                </div>

                {viewFarmerSales.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-[#174F3A]/20 font-bold text-[#103A2B] dark:text-[#A3E6C5] uppercase text-[9px] bg-white/60 dark:bg-[#121E19]/60">
                          <th className="p-2">Date</th>
                          <th className="p-2">Bill / Txn ID</th>
                          <th className="p-2">Product</th>
                          <th className="p-2 text-center">Qty</th>
                          <th className="p-2 text-right">Unit Price</th>
                          <th className="p-2 text-right">Line Total</th>
                          <th className="p-2 text-right">Bill Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#174F3A]/10">
                        {viewFarmerSales.map((sale) => (
                          <React.Fragment key={sale.id}>
                            {sale.lineItems && sale.lineItems.length > 0 ? (
                              sale.lineItems.map((item, i) => (
                                <tr key={`${sale.id}-${i}`} className="hover:bg-white/50 dark:hover:bg-[#121E19]/50">
                                  <td className="p-2 font-medium">{i === 0 ? sale.date : ''}</td>
                                  <td className="p-2 font-bold font-mono text-[#103A2B] dark:text-[#A3E6C5]">
                                    {i === 0 ? sale.billNumber || sale.id : ''}
                                  </td>
                                  <td className="p-2 font-bold text-[#17221D] dark:text-[#E6ECE8]">{item.productName}</td>
                                  <td className="p-2 text-center font-semibold">{item.quantity} {item.unit}</td>
                                  <td className="p-2 text-right">₹{item.unitPrice}</td>
                                  <td className="p-2 text-right font-bold">₹{item.lineTotal.toLocaleString('en-IN')}</td>
                                  <td className="p-2 text-right font-extrabold text-[#174F3A] dark:text-[#A3E6C5]">
                                    {i === 0 ? `₹${sale.amount.toLocaleString('en-IN')}` : ''}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr className="hover:bg-white/50">
                                <td className="p-2 font-medium">{sale.date}</td>
                                <td className="p-2 font-bold font-mono">{sale.billNumber || sale.id}</td>
                                <td className="p-2 font-bold">{sale.productName || 'Counter Sale Item'}</td>
                                <td className="p-2 text-center font-semibold">{sale.salesQty || 1}</td>
                                <td className="p-2 text-right">₹{sale.amount}</td>
                                <td className="p-2 text-right font-bold">₹{sale.amount.toLocaleString('en-IN')}</td>
                                <td className="p-2 text-right font-extrabold text-[#174F3A] dark:text-[#A3E6C5]">
                                  ₹{sale.amount.toLocaleString('en-IN')}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-[#66736C] dark:text-[#8E9E96] italic bg-white/50 dark:bg-[#121E19]/50 rounded-lg border border-[#174F3A]/10">
                    No purchase history records found for this customer.
                  </div>
                )}

                {/* Total Footer */}
                <div className="pt-2 border-t border-[#174F3A]/20 dark:border-[#A3E6C5]/20 flex justify-between items-center">
                  <span className="text-xs text-[#103A2B] dark:text-[#A3E6C5] font-extrabold">Total Amount Spent:</span>
                  <span className="font-black text-base text-[#174F3A] dark:text-[#A3E6C5]">
                    ₹{viewCustomerSummary.totalSpent.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#121E19] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-[#66736C] dark:text-[#8E9E96] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#174F3A] dark:text-[#A3E6C5]" /> Verified Billing System
              </span>

              <button
                onClick={() => setViewFarmer(null)}
                className="px-4 py-2 rounded-xl bg-[#174F3A] hover:bg-[#103A2B] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
