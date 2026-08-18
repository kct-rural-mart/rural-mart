import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  ChevronDown,
  Info,
  ArrowUpRight,
  Receipt,
  X,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { getChartTheme } from '../../shared/theme';
import { BillingPanel, BillingPanelHandle } from '../components/BillingPanel';
import { getOwnerOverview, OwnerOverviewData } from '../services/overviewService';
import { addOwnerProduct, recordOwnerProcurement } from '../services/productService';

interface OwnerDashboardPageProps {
  currentMartId?: string | null;
  theme: 'light' | 'dark';
  onNavigateTab?: (tab: string) => void;
  onOpenRecordSaleModal?: () => void;
  onOpenAddFarmerModal?: () => void;
}

type ChartMode = 'Current Period' | 'Previous Period' | 'Outreach Overlay';

interface WeeklyDataItem {
  date: string;
  sales: number;
  proc: number;
  prevSales?: number;
  prevProc?: number;
  event?: string;
}

export const OwnerDashboardPage: React.FC<OwnerDashboardPageProps> = ({
  currentMartId,
  theme,
}) => {
  const isDark = theme === 'dark';
  const chartTheme = getChartTheme(isDark);

  const [chartMode, setChartMode] = useState<ChartMode>('Current Period');
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

    const ruralMartId = currentMartId || '';

  // State to force re-render/re-fetch after mutations
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [overview, setOverview] = useState<OwnerOverviewData>({
    salesRecords: [], expenseRecords: [], purchaseRecords: [], productRecords: [],
    newFarmerLeads: 0, totalFarmersReached: 0, convertedFarmers: 0,
  });
  const [overviewError, setOverviewError] = useState('');

  // Quick Action Modal States
  const [isDailySalesModalOpen, setIsDailySalesModalOpen] = useState(false);
  const [isProcurementModalOpen, setIsProcurementModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // --- DAILY SALES MODAL: ref to the reusable BillingPanel (same component used on Page 2) ---
  const billingPanelRef = useRef<BillingPanelHandle>(null);

  // --- NEW PROCUREMENT MODAL STATE ---
  const [procureMode, setProcureMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [selectedProcureProductId, setSelectedProcureProductId] = useState<string>('');
  const [procName, setProcName] = useState<string>('');
  const [procCategory, setProcCategory] = useState<string>('Cattle Feed');
  const [procSupplier, setProcSupplier] = useState<string>('');
  const [procQty, setProcQty] = useState<string>('');
  const [procUnit, setProcUnit] = useState<string>('kg');
  const [procCostPrice, setProcCostPrice] = useState<string>('');
  const [procSellingPrice, setProcSellingPrice] = useState<string>('');
  const [procError, setProcError] = useState<string>('');

  useEffect(() => {
    let active = true;
    setOverviewError('');
    void getOwnerOverview(ruralMartId)
      .then((data) => { if (active) setOverview(data); })
      .catch((error: unknown) => {
        if (!active) return;
        setOverviewError(error && typeof error === 'object' && 'message' in error
          ? String((error as { message: unknown }).message)
          : 'Unable to load dashboard data.');
      });
    return () => { active = false; };
  }, [ruralMartId, refreshKey]);

  const { salesRecords, expenseRecords, purchaseRecords, productRecords } = overview;

  const totalSalesVal = useMemo(() => salesRecords.reduce((acc, curr) => acc + (curr.amount || 0), 0), [salesRecords]);
  const totalProcurementVal = useMemo(() => purchaseRecords.reduce((acc, curr) => acc + (curr.amount || 0), 0), [purchaseRecords]);
  const totalExpensesVal = useMemo(() => expenseRecords.reduce((acc, curr) => acc + (curr.amount || 0), 0), [expenseRecords]);
  const netProfitVal = totalSalesVal - totalProcurementVal - totalExpensesVal;

  const topProduct = useMemo(() => {
    if (productRecords.length === 0) return { name: 'No product data', units: 0 };
    const sorted = [...productRecords].sort((a, b) => (b.salesQty || 0) - (a.salesQty || 0));
    if (!sorted[0] || (sorted[0].salesQty || 0) === 0) {
      return { name: 'No product data', units: 0 };
    }
    return { name: sorted[0].name || 'No product data', units: sorted[0].salesQty || 0 };
  }, [productRecords]);

  const newFarmerLeads = overview.newFarmerLeads;
  const totalFarmersReached = overview.totalFarmersReached;

  const conversionRateStr = newFarmerLeads > 0
    ? `${((overview.convertedFarmers / newFarmerLeads) * 100).toFixed(1)}%`
    : '0%';

  const weeklyChartData: WeeklyDataItem[] = useMemo(() => {
    if (salesRecords.length === 0 && purchaseRecords.length === 0) {
      return [];
    }
    const map = new Map<string, { sales: number; proc: number }>();
    salesRecords.forEach((s) => {
      const d = s.date || 'Today';
      const prev = map.get(d) || { sales: 0, proc: 0 };
      map.set(d, { ...prev, sales: prev.sales + s.amount });
    });
    purchaseRecords.forEach((p) => {
      const d = p.date || 'Today';
      const prev = map.get(d) || { sales: 0, proc: 0 };
      map.set(d, { ...prev, proc: prev.proc + p.amount });
    });
    return Array.from(map.entries()).map(([date, val]) => ({
      date,
      sales: val.sales,
      proc: val.proc,
    }));
  }, [salesRecords, purchaseRecords]);

  const salesSeriesLabel =
    chartMode === 'Previous Period'
      ? 'Previous Gross Sales (₹)'
      : 'Gross Sales Revenue (₹)';

  const procSeriesLabel =
    chartMode === 'Previous Period'
      ? 'Previous Procurement (₹)'
      : 'Procurement Expense (₹)';

  const getInfoPillText = () => {
    if (weeklyChartData.length === 0) return 'No business data available';
    if (chartMode === 'Current Period') {
      const maxSale = Math.max(...weeklyChartData.map((d) => d.sales), 0);
      return `Peak Revenue: ₹${maxSale.toLocaleString('en-IN')}`;
    } else if (chartMode === 'Previous Period') {
      return 'Prior Peak: ₹0';
    } else {
      return `Outreach Impact Correlation: ${newFarmerLeads} New Leads`;
    }
  };

  // --- NEW PROCUREMENT HANDLERS ---
  const handleSelectProcureProduct = (pId: string) => {
    setSelectedProcureProductId(pId);
    if (pId === 'NEW') {
      setProcureMode('NEW');
      setProcName('');
      setProcCategory('Cattle Feed');
      setProcSupplier('');
      setProcUnit('kg');
      setProcCostPrice('');
      setProcSellingPrice('');
    } else {
      setProcureMode('EXISTING');
      const prd = productRecords.find((p) => p.id === pId);
      if (prd) {
        setProcName(prd.name);
        setProcCategory(prd.category);
        setProcSupplier(prd.supplier || '');
        setProcUnit(prd.unit || 'kg');
        setProcCostPrice(String(prd.costPrice || (prd.sellingPrice * 0.75)));
        setProcSellingPrice(String(prd.sellingPrice));
      }
    }
  };

  const handleSaveProcurement = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcError('');

    const cleanName = procName.trim();
    if (!cleanName) {
      setProcError('Please enter a product name.');
      return;
    }
    const numQty = Number(procQty);
    if (!numQty || numQty <= 0) {
      setProcError('Please enter a valid procurement quantity (> 0).');
      return;
    }
    const numCostPrice = Number(procCostPrice);
    if (isNaN(numCostPrice) || numCostPrice < 0) {
      setProcError('Please enter a valid cost price per unit.');
      return;
    }
    const numSellingPrice = Number(procSellingPrice);
    if (isNaN(numSellingPrice) || numSellingPrice < 0) {
      setProcError('Please enter a valid selling price per unit.');
      return;
    }

    try {
      if (procureMode === 'NEW') {
        const allowedCategories = ['Farm Equipment', 'Feed', 'Mineral Mixtures', 'Fodder Seeds', 'Veterinary Medicines', 'Seeds', 'Fertilizers', 'Other'];
        await addOwnerProduct({
          ruralMartId,
          name: cleanName,
          category: allowedCategories.includes(procCategory) ? procCategory : 'Other',
          supplier: procSupplier,
          openingQuantity: numQty,
          purchasePrice: numCostPrice,
          sellingPrice: numSellingPrice,
          unit: procUnit,
        });
      } else {
        if (!selectedProcureProductId) throw new Error('Please select a product.');
        await recordOwnerProcurement({
          ruralMartId,
          productId: selectedProcureProductId,
          quantity: numQty,
          pricePerUnit: numCostPrice,
          supplier: procSupplier,
        });
      }
    } catch (error) {
      setProcError(error && typeof error === 'object' && 'message' in error
        ? String((error as { message: unknown }).message)
        : 'Unable to save procurement.');
      return;
    }

    setRefreshKey((k) => k + 1);
    setIsProcurementModalOpen(false);
    setProcName('');
    setProcQty('');
    setProcCostPrice('');
    setProcSellingPrice('');
    setSelectedProcureProductId('');
    showToast(`Successfully procured ${numQty} ${procUnit} of "${cleanName}"!`);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const salesVal = payload[0]?.value ?? 0;
      const procVal = payload[1]?.value ?? 0;

      return (
        <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-3 shadow-lg text-xs space-y-1.5 min-w-[170px]">
          <div className="font-bold text-[#17221D] dark:text-[#E6ECE8] border-b border-[#E9EFEB] dark:border-[#16241E] pb-1">
            {label}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[#174F3A] dark:text-[#A3E6C5] font-semibold">
              <span>Sales:</span>
              <span>₹{salesVal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-semibold">
              <span>Proc:</span>
              <span>₹{procVal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {overviewError && (
        <div className="p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
          {overviewError}
        </div>
      )}
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-[#174F3A] text-white text-xs font-bold shadow-lg border border-emerald-500/30 flex items-center justify-between animate-fade-in transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#A3E6C5]" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-200 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. HERO / SUMMARY BANNER SECTION */}
      <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E7F2EC] dark:bg-[#1B3D30] border border-[#103A2B]/10 dark:border-[#A3E6C5]/20 text-[11px] font-bold text-[#174F3A] dark:text-[#A3E6C5]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>LIVE HUB</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17221D] dark:text-[#E6ECE8]">
              RuralMart Operations &amp; Executive Overview
            </h1>

            <p className="text-xs text-[#66736C] dark:text-[#8E9E96]">
              Real-time synchronization across all regional outlets, stock movements, and outreach conversions.
            </p>
          </div>
        </div>
      </div>

      {/* 2. KPI STAT CARDS ROW (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Card 1: TOTAL SALES */}
        <div className="card-enterprise p-4.5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#66736C] dark:text-[#8E9E96]">
              TOTAL SALES
            </span>
            <div className="p-2 rounded-xl bg-[#E7F2EC] dark:bg-[#1B3D30] text-[#174F3A] dark:text-[#A3E6C5]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-[#17221D] dark:text-[#E6ECE8] font-mono">
              ₹{totalSalesVal.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> 0%
              </span>
              <span className="text-[11px] text-[#8A958F]">vs previous period</span>
            </div>
          </div>
        </div>

        {/* Card 2: NET PROFIT (₹) */}
        <div className="card-enterprise p-4.5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#66736C] dark:text-[#8E9E96]">
              NET PROFIT (₹)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-[#143825] text-emerald-700 dark:text-emerald-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-[#17221D] dark:text-[#E6ECE8] font-mono">
              ₹{netProfitVal.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> 0%
              </span>
              <span className="text-[11px] text-[#8A958F]">net margin</span>
            </div>
          </div>
        </div>

        {/* Card 3: TOP SELLING ITEM */}
        <div className="card-enterprise p-4.5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#66736C] dark:text-[#8E9E96]">
              TOP SELLING ITEM
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-[#2A1D3B] text-purple-600 dark:text-purple-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-[#17221D] dark:text-[#E6ECE8] truncate">
              {topProduct.name}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-300">
                {topProduct.units} Units Sold
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: NEW FARMER LEADS */}
        <div className="card-enterprise p-4.5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#66736C] dark:text-[#8E9E96]">
              NEW FARMER LEADS
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-[#152A42] text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-[#17221D] dark:text-[#E6ECE8] font-mono">
              {newFarmerLeads} Farmers
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> {conversionRateStr}
              </span>
              <span className="text-[11px] text-[#8A958F]">conversion rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS SECTION */}
      <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E9EFEB] dark:border-[#16241E] pb-2.5">
          <div>
            <h2 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
              <span>QUICK ACTIONS</span>
            </h2>
            <p className="text-xs text-[#66736C] dark:text-[#8E9E96]">
              Execute daily operations instantly without leaving your overall dashboard.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Quick Action Card 1: Daily Sales / Billing */}
          <button
            type="button"
            onClick={() => setIsDailySalesModalOpen(true)}
            className="group p-4 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] hover:border-[#174F3A] dark:hover:border-[#A3E6C5] hover:bg-white dark:hover:bg-[#1B2E26] transition-all text-left flex items-start gap-3.5 cursor-pointer shadow-xs"
          >
            <div className="p-3 rounded-xl bg-[#E7F2EC] dark:bg-[#1B3D30] text-[#174F3A] dark:text-[#A3E6C5] group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] group-hover:text-[#174F3A] dark:group-hover:text-[#A3E6C5] transition-colors">
                  Daily Sales &amp; Billing
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#174F3A]/10 dark:bg-[#A3E6C5]/20 text-[#174F3A] dark:text-[#A3E6C5]">
                  Record Sale
                </span>
              </div>
              <p className="text-xs text-[#66736C] dark:text-[#8E9E96]">
                Create a new bill, select products, and record today's sale instantly.
              </p>
            </div>
          </button>

          {/* Quick Action Card 2: New Procurement / Products & Inventory */}
          <button
            type="button"
            onClick={() => setIsProcurementModalOpen(true)}
            className="group p-4 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] hover:border-[#174F3A] dark:hover:border-[#A3E6C5] hover:bg-white dark:hover:bg-[#1B2E26] transition-all text-left flex items-start gap-3.5 cursor-pointer shadow-xs"
          >
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-[#3D2D10] text-amber-700 dark:text-amber-300 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] group-hover:text-[#174F3A] dark:group-hover:text-[#A3E6C5] transition-colors">
                  New Procurement
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-[#3D2D10] dark:text-amber-300">
                  Stock Entry
                </span>
              </div>
              <p className="text-xs text-[#66736C] dark:text-[#8E9E96]">
                Manage products, restock catalog items, and record procurement batches.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 3. MAIN CHART SECTION — "Weekly Performance & Demand Trends" */}
      <div className="card-enterprise p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9EFEB] dark:border-[#16241E] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8]">
              Weekly Performance &amp; Demand Trends
            </h3>
            <p className="text-xs text-[#66736C] dark:text-[#8E9E96]">
              Hover anywhere over chart area to inspect exact period analytics
            </p>
          </div>

          <div className="relative shrink-0">
            <select
              value={chartMode}
              onChange={(e) => setChartMode(e.target.value as ChartMode)}
              className="h-9 pr-8 pl-3 appearance-none text-xs font-bold rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#103A2B] dark:text-[#A3E6C5] focus:outline-none focus:ring-1 focus:ring-[#174F3A] cursor-pointer shadow-xs"
            >
              <option value="Current Period">Current Period</option>
              <option value="Previous Period">Previous Period</option>
              <option value="Outreach Overlay">Outreach Overlay</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#174F3A] dark:text-[#A3E6C5] pointer-events-none" />
          </div>
        </div>

        <div className="h-72 w-full pt-2 relative">
          {weeklyChartData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-xs text-[#66736C] dark:text-[#8E9E96] italic bg-[#F8FAF7] dark:bg-[#16241E] rounded-xl border border-[#DDE6E0]/50 dark:border-[#1E3129]/50">
              No business data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weeklyChartData}
                onMouseMove={(e: any) => {
                  if (e && e.activeLabel) {
                    setHoveredDate(e.activeLabel);
                  }
                }}
                onMouseLeave={() => setHoveredDate(null)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
                <XAxis
                  dataKey="date"
                  stroke={chartTheme.textColor}
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke={chartTheme.textColor}
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip content={<CustomTooltip />} />

                <Line
                  type="monotone"
                  dataKey="sales"
                  name={salesSeriesLabel}
                  stroke={isDark ? '#34D399' : '#174F3A'}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: isDark ? '#34D399' : '#174F3A' }}
                  activeDot={{ r: 6 }}
                />

                <Line
                  type="monotone"
                  dataKey="proc"
                  name={procSeriesLabel}
                  stroke={isDark ? '#F59E0B' : '#D97706'}
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: isDark ? '#F59E0B' : '#D97706' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E9EFEB] dark:border-[#16241E]">
          <div className="flex items-center gap-5 text-xs font-semibold">
            <div className="flex items-center gap-2 text-[#17221D] dark:text-[#E6ECE8]">
              <span className="w-5 h-0.5 bg-[#174F3A] dark:bg-[#34D399] rounded-full inline-block"></span>
              <span>{salesSeriesLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-[#17221D] dark:text-[#E6ECE8]">
              <span className="w-5 h-0.5 border-b-2 border-dashed border-amber-600 dark:border-amber-400 inline-block"></span>
              <span>{procSeriesLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end shrink-0">
            {hoveredDate && (
              <span className="text-[11px] font-mono font-bold text-[#174F3A] dark:text-[#A3E6C5] bg-[#E7F2EC] dark:bg-[#1B3D30] px-2.5 py-1 rounded-lg border border-[#103A2B]/10">
                Hovered: {hoveredDate}
              </span>
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">
              <Info className="w-3.5 h-3.5 text-[#174F3A] dark:text-[#A3E6C5]" />
              <span>{getInfoPillText()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTION MODAL 1: DAILY SALE — reuses the exact same BillingPanel as Page 2 (Daily Business) */}
      {isDailySalesModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#17221D]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-xl max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E9EFEB] dark:border-[#16241E] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
                  <span>Daily Sale</span>
                </h3>
                <p className="text-xs text-[#66736C] dark:text-[#8E9E96]">
                  Same billing panel as Daily Business — select or register a customer, add products, and record today's sale instantly.
                </p>
              </div>
              <button
                onClick={() => setIsDailySalesModalOpen(false)}
                className="text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <BillingPanel
              ref={billingPanelRef}
              ruralMartId={ruralMartId}
              theme={theme}
              refreshKey={refreshKey}
              onDataChanged={() => setRefreshKey((k) => k + 1)}
              onSaleGenerated={(info) => {
                showToast(`Recorded Sale Bill of ₹${info.amount.toLocaleString('en-IN')} for ${info.customerName}!`);
                setIsDailySalesModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* QUICK ACTION MODAL 2: NEW PROCUREMENT FORM */}
      {isProcurementModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#17221D]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E9EFEB] dark:border-[#16241E] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
                  <span>New Product Procurement Entry</span>
                </h3>
                <p className="text-xs text-[#66736C] dark:text-[#8E9E96]">
                  Restock an existing product or register a new product with cost and selling prices.
                </p>
              </div>
              <button
                onClick={() => setIsProcurementModalOpen(false)}
                className="text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {procError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-xs font-semibold border border-red-200">
                {procError}
              </div>
            )}

            <form onSubmit={handleSaveProcurement} className="space-y-3">
              <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] space-y-3">
                <label className="block text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase">
                  1. Product Selection
                </label>
                <select
                  value={selectedProcureProductId}
                  onChange={(e) => handleSelectProcureProduct(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8]"
                >
                  <option value="">-- Choose Catalog Product --</option>
                  {productRecords.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category}) • Current Stock: {p.stockQty} {p.unit}
                    </option>
                  ))}
                  <option value="NEW">+ Create New Product...</option>
                </select>

                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Concentrated Maize Feed"
                      value={procName}
                      onChange={(e) => setProcName(e.target.value)}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                        Category
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Cattle Feed"
                        value={procCategory}
                        onChange={(e) => setProcCategory(e.target.value)}
                        className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                        Supplier Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Co-Op Union"
                        value={procSupplier}
                        onChange={(e) => setProcSupplier(e.target.value)}
                        className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] space-y-3">
                <label className="block text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase">
                  2. Procurement &amp; Pricing
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                      Procurement Qty <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 100"
                      value={procQty}
                      onChange={(e) => setProcQty(e.target.value)}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                      Unit
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. kg, bag, pkt"
                      value={procUnit}
                      onChange={(e) => setProcUnit(e.target.value)}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                      Cost Price/Unit (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="e.g. 40"
                      value={procCostPrice}
                      onChange={(e) => setProcCostPrice(e.target.value)}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                      Selling Price/Unit (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="e.g. 55"
                      value={procSellingPrice}
                      onChange={(e) => setProcSellingPrice(e.target.value)}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8]"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-[#18382B] text-xs flex justify-between items-center font-bold text-[#174F3A] dark:text-[#A3E6C5]">
                  <span>Total Batch Procurement Value:</span>
                  <span className="text-sm">
                    ₹{((Number(procQty) || 0) * (Number(procCostPrice) || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E9EFEB] dark:border-[#16241E]">
                <button
                  type="button"
                  onClick={() => setIsProcurementModalOpen(false)}
                  className="h-9 px-4 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] text-xs font-semibold hover:bg-[#F8FAF7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-[#174F3A] hover:bg-[#103A2B] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save &amp; Record Procurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


