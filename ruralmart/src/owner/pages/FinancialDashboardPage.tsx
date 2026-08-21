import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Trash2,
  X,
  ArrowUpRight,
  Calculator,
  CheckCircle2,
  Calendar,
  ListFilter,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { getChartTheme } from '../../shared/theme';
import {
  getFinancialEntries,
  saveFinancialEntryRecord,
  deleteFinancialEntryRecord,
  getSalesByRuralMart,
  getPurchasesByRuralMart,
  getExpensesByRuralMart,
  getOperationalEntries,
  getProductsByRuralMart,
  FinancialEntryRecord,
} from '../../shared/dataServices';

interface FinancialDashboardPageProps {
  currentMartId?: string | null;
  theme: 'light' | 'dark';
}

export type PeriodFilterOption = 'Today' | 'This Week' | 'Current Month' | 'Previous Month' | 'Custom Range';

// --- SHARED FINANCIAL CALCULATION HELPERS ---
// These implement the SAME Total Revenue / Total COGS / Gross Profit / Operating Expenses /
// Net Profit formulas already used across this dashboard (KPI cards + Profit Calculation Flow
// panel). Extracted here so the point-in-time snapshot stored on each saved financial entry
// reuses this exact logic instead of duplicating it.
function calcRevenueAndCOGS(
  sales: ReturnType<typeof getSalesByRuralMart>,
  purchases: ReturnType<typeof getPurchasesByRuralMart>,
  opEntries: ReturnType<typeof getOperationalEntries>,
  products: ReturnType<typeof getProductsByRuralMart>,
  financialEntries: FinancialEntryRecord[]
) {
  const salesTotal = sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const otherIncomeTotal = financialEntries
    .filter((fe) => fe.category.toLowerCase().includes('income'))
    .reduce((sum, fe) => sum + (Number(fe.amount) || 0), 0);
  const totalRevenue = salesTotal + otherIncomeTotal;

  const procurementTotal = purchases.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  let totalCOGS = procurementTotal;

  if (totalCOGS === 0) {
    let calculatedCOGS = 0;
    let hasLineItems = false;

    sales.forEach((s) => {
      const op = opEntries.find((e: any) => e.billNumber === s.billNumber || e.id === s.id);
      if (op && Array.isArray(op.lineItems) && op.lineItems.length > 0) {
        hasLineItems = true;
        op.lineItems.forEach((item: any) => {
          const prd = products.find((p) => p.id === item.productId || p.code === item.productId || p.name === item.productName);
          const unitCost = prd?.costPrice ?? (item.unitPrice ? item.unitPrice * 0.7 : 0);
          calculatedCOGS += (item.quantity || 1) * unitCost;
        });
      }
    });

    if (hasLineItems && calculatedCOGS > 0) {
      totalCOGS = calculatedCOGS;
    } else if (totalRevenue > 0) {
      totalCOGS = Math.round(totalRevenue * 0.65);
    }
  }

  return { totalRevenue, totalCOGS, grossProfit: totalRevenue - totalCOGS };
}

function calcTotalOperatingExpenses(
  financialEntries: FinancialEntryRecord[],
  expenses: ReturnType<typeof getExpensesByRuralMart>
) {
  let total = 0;
  financialEntries.forEach((fe) => {
    if (!fe.category.toLowerCase().includes('income')) {
      total += Number(fe.amount) || 0;
    }
  });
  expenses.forEach((ex) => {
    total += Number(ex.amount) || 0;
  });
  return total;
}

export const OPERATING_EXPENSE_PRESETS = [
  'Electricity',
  'Transportation',
  'Staff Salary',
  'Maintenance',
  'Rent',
  'Water & Utilities',
  'Packaging & Supplies',
  'Marketing & Promotion',
  'Other Expense',
  'Custom Category...',
];

export function isDateInPeriod(
  dateStr?: string,
  period: PeriodFilterOption = 'Current Month',
  customStart?: string,
  customEnd?: string
): boolean {
  if (!dateStr) return false;

  let recDate: Date | null = null;
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const parts = dateStr.split('T')[0].split('-');
    recDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  } else {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) recDate = d;
  }

  if (!recDate || isNaN(recDate.getTime())) return false;

  const now = new Date();

  if (period === 'Today') {
    return (
      recDate.getFullYear() === now.getFullYear() &&
      recDate.getMonth() === now.getMonth() &&
      recDate.getDate() === now.getDate()
    );
  }

  if (period === 'This Week') {
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + distanceToMonday, 0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const recTime = recDate.getTime();
    return recTime >= startOfWeek.getTime() && recTime <= endOfWeek.getTime();
  }

  if (period === 'Current Month') {
    return (
      recDate.getFullYear() === now.getFullYear() &&
      recDate.getMonth() === now.getMonth()
    );
  }

  if (period === 'Previous Month') {
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return (
      recDate.getFullYear() === prevMonthDate.getFullYear() &&
      recDate.getMonth() === prevMonthDate.getMonth()
    );
  }

  if (period === 'Custom Range') {
    if (!customStart && !customEnd) return true;
    const recTime = recDate.getTime();
    const startTime = customStart ? new Date(`${customStart}T00:00:00`).getTime() : 0;
    const endTime = customEnd ? new Date(`${customEnd}T23:59:59`).getTime() : Infinity;
    return recTime >= startTime && recTime <= endTime;
  }

  return true;
}

export const FinancialDashboardPage: React.FC<FinancialDashboardPageProps> = ({
  currentMartId,
  theme,
}) => {
  const isDark = theme === 'dark';
  const chartTheme = getChartTheme(isDark);

    const ruralMartId = currentMartId || '';

  // Period Filter State
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterOption>('Current Month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Financial Entry State
  const [entries, setEntries] = useState<FinancialEntryRecord[]>(() =>
    getFinancialEntries(ruralMartId)
  );

  const refreshData = () => {
    setEntries(getFinancialEntries(ruralMartId));
  };

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Form State
  const [categoryPreset, setCategoryPreset] = useState<string>('Electricity');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [amountInput, setAmountInput] = useState('');
  const [dateInput, setDateInput] = useState(() => new Date().toISOString().split('T')[0]);
  const [descriptionInput, setDescriptionInput] = useState('');

  const handleClearForm = () => {
    setCategoryPreset('Electricity');
    setCustomCategory('');
    setAmountInput('');
    setDateInput(new Date().toISOString().split('T')[0]);
    setDescriptionInput('');
  };

  // Fetch all raw collections
  const rawSales = useMemo(() => getSalesByRuralMart(ruralMartId), [ruralMartId]);
  const rawPurchases = useMemo(() => getPurchasesByRuralMart(ruralMartId), [ruralMartId]);
  const rawExpenses = useMemo(() => getExpensesByRuralMart(ruralMartId), [ruralMartId]);
  const rawOpEntries = useMemo(() => getOperationalEntries(ruralMartId), [ruralMartId]);
  const products = useMemo(() => getProductsByRuralMart(ruralMartId), [ruralMartId]);

  // Filtered collections based on period
  const filteredSales = useMemo(() => {
    return rawSales.filter((s) =>
      isDateInPeriod(s.date || (s as any).createdAt, periodFilter, customStartDate, customEndDate)
    );
  }, [rawSales, periodFilter, customStartDate, customEndDate]);

  const filteredPurchases = useMemo(() => {
    return rawPurchases.filter((p) =>
      isDateInPeriod(p.date || (p as any).createdAt, periodFilter, customStartDate, customEndDate)
    );
  }, [rawPurchases, periodFilter, customStartDate, customEndDate]);

  const filteredExpenses = useMemo(() => {
    return rawExpenses.filter((ex) =>
      isDateInPeriod(ex.date || (ex as any).createdAt, periodFilter, customStartDate, customEndDate)
    );
  }, [rawExpenses, periodFilter, customStartDate, customEndDate]);

  const filteredEntries = useMemo(() => {
    return entries.filter((fe) =>
      isDateInPeriod(fe.date || fe.createdAt, periodFilter, customStartDate, customEndDate)
    );
  }, [entries, periodFilter, customStartDate, customEndDate]);

  // 1 & 2 & 3. TOTAL REVENUE, TOTAL COGS & GROSS PROFIT (shared helper — see calcRevenueAndCOGS)
  const { totalRevenue, totalCOGS, grossProfit } = useMemo(() => {
    return calcRevenueAndCOGS(filteredSales, filteredPurchases, rawOpEntries, products, filteredEntries);
  }, [filteredSales, filteredPurchases, rawOpEntries, products, filteredEntries]);

  // 4. OPERATIONAL EXPENSES BREAKDOWN & TOTAL
  const operatingExpensesBreakdown = useMemo(() => {
    const map: Record<string, number> = {};

    filteredEntries.forEach((fe) => {
      if (!fe.category.toLowerCase().includes('income')) {
        const catName = fe.category || 'Other Expense';
        map[catName] = (map[catName] || 0) + (Number(fe.amount) || 0);
      }
    });

    filteredExpenses.forEach((ex) => {
      const catName = ex.category || 'General Expense';
      map[catName] = (map[catName] || 0) + (Number(ex.amount) || 0);
    });

    return Object.entries(map)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredEntries, filteredExpenses]);

  const totalOperatingExpenses = useMemo(() => {
    return operatingExpensesBreakdown.reduce((sum, item) => sum + item.amount, 0);
  }, [operatingExpensesBreakdown]);

  // 5. NET PROFIT = Gross Profit - Total Operating Expenses
  const netProfit = grossProfit - totalOperatingExpenses;

  // Trend Chart Data
  const chartData = useMemo(() => {
    const dayMap: Record<
      string,
      { date: string; revenue: number; cogs: number; expenses: number; grossProfit: number; netProfit: number }
    > = {};

    const getDayObj = (dStr: string) => {
      if (!dayMap[dStr]) {
        dayMap[dStr] = { date: dStr, revenue: 0, cogs: 0, expenses: 0, grossProfit: 0, netProfit: 0 };
      }
      return dayMap[dStr];
    };

    filteredSales.forEach((s) => {
      const d = s.date || '';
      if (d) {
        const obj = getDayObj(d);
        obj.revenue += Number(s.amount) || 0;
      }
    });

    filteredPurchases.forEach((p) => {
      const d = p.date || '';
      if (d) {
        const obj = getDayObj(d);
        obj.cogs += Number(p.amount) || 0;
      }
    });

    filteredExpenses.forEach((ex) => {
      const d = ex.date || '';
      if (d) {
        const obj = getDayObj(d);
        obj.expenses += Number(ex.amount) || 0;
      }
    });

    filteredEntries.forEach((fe) => {
      const d = fe.date || '';
      if (d) {
        const obj = getDayObj(d);
        const amt = Number(fe.amount) || 0;
        if (fe.category.toLowerCase().includes('income')) {
          obj.revenue += amt;
        } else {
          obj.expenses += amt;
        }
      }
    });

    const sortedDates = Object.keys(dayMap).sort();
    return sortedDates.map((d) => {
      const item = dayMap[d];
      if (item.cogs === 0 && item.revenue > 0) {
        item.cogs = Math.round(item.revenue * 0.65);
      }
      const gp = item.revenue - item.cogs;
      const np = gp - item.expenses;
      return {
        ...item,
        grossProfit: gp,
        netProfit: np,
      };
    });
  }, [filteredSales, filteredPurchases, filteredExpenses, filteredEntries]);

  // Save Financial Entry
  const handleSaveFinancialEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amountInput);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showToast('Please enter a valid positive amount.');
      return;
    }

    const finalCategoryName =
      categoryPreset === 'Custom Category...' || categoryPreset === 'Other Expense'
        ? customCategory.trim() || categoryPreset
        : categoryPreset;

    const newEntry: FinancialEntryRecord = {
      id: `fin-${Date.now()}`,
      financialRecordId: `fin-${Date.now()}`,
      ruralMartId,
      category: finalCategoryName as any,
      amount: numericAmount,
      date: dateInput,
      description: descriptionInput.trim(),
      createdAt: new Date().toISOString(),
    };

    // Gross Profit / Net Profit snapshot at the moment this entry is recorded — reuses the
    // same calculation formulas as the dashboard KPIs above, applied to all-time data (plus
    // this new entry itself, since it is an operating expense) rather than the period filter.
    const allEntriesWithNew = [...entries, newEntry];
    const { grossProfit: snapshotGrossProfit } = calcRevenueAndCOGS(
      rawSales,
      rawPurchases,
      rawOpEntries,
      products,
      allEntriesWithNew
    );
    const snapshotOperatingExpenses = calcTotalOperatingExpenses(allEntriesWithNew, rawExpenses);
    newEntry.grossProfit = snapshotGrossProfit;
    newEntry.netProfit = snapshotGrossProfit - snapshotOperatingExpenses;

    saveFinancialEntryRecord(newEntry);
    refreshData();
    showToast(`Expense for "${finalCategoryName}" (₹${numericAmount.toLocaleString('en-IN')}) saved!`);
    handleClearForm();
  };

  // Delete Financial Entry
  const handleDeleteEntry = (id: string) => {
    deleteFinancialEntryRecord(ruralMartId, id);
    refreshData();
    showToast('Financial entry deleted successfully.');
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const rev = payload.find((p: any) => p.dataKey === 'revenue')?.value || 0;
      const cogs = payload.find((p: any) => p.dataKey === 'cogs')?.value || 0;
      const opex = payload.find((p: any) => p.dataKey === 'expenses')?.value || 0;
      const gp = rev - cogs;
      const np = gp - opex;

      return (
        <div className="p-3 rounded-xl bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] shadow-lg text-xs space-y-1">
          <p className="font-bold text-[#17221D] dark:text-[#E6ECE8]">{label}</p>
          <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
            Total Revenue: ₹{rev.toLocaleString('en-IN')}
          </div>
          <div className="text-gray-600 dark:text-gray-400 font-semibold">
            Total COGS: ₹{cogs.toLocaleString('en-IN')}
          </div>
          <div className="text-teal-700 dark:text-teal-400 font-bold">
            Gross Profit: ₹{gp.toLocaleString('en-IN')}
          </div>
          <div className="text-amber-700 dark:text-amber-400 font-semibold">
            Operating Expenses: ₹{opex.toLocaleString('en-IN')}
          </div>
          <div className="text-emerald-800 dark:text-emerald-300 font-bold pt-1 border-t border-[#E9EFEB] dark:border-[#16241E]">
            Net Profit: ₹{np.toLocaleString('en-IN')}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#174F3A] text-white text-xs font-bold shadow-lg border border-emerald-500/30 flex items-center justify-between animate-fade-in transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#A3E6C5]" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-200 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-[#66736C] dark:text-[#8E9E96] uppercase block mb-0.5">
            RURAL MART FINANCIALS
          </span>
          <h1 className="text-xl font-bold text-[#17221D] dark:text-[#E6ECE8]">
            FINANCIAL OVERVIEW
          </h1>
        </div>

        {/* PERIOD FILTER DROPDOWN */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-2 bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as PeriodFilterOption)}
              className="bg-transparent text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8] focus:outline-none cursor-pointer"
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="Current Month">Current Month</option>
              <option value="Previous Month">Previous Month</option>
              <option value="Custom Range">Custom Range</option>
            </select>
          </div>

          {periodFilter === 'Custom Range' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="h-8 px-2 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                placeholder="Start Date"
              />
              <span className="text-xs text-[#66736C] dark:text-[#8E9E96]">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="h-8 px-2 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                placeholder="End Date"
              />
            </div>
          )}
        </div>
      </div>

      {/* 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Revenue */}
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase tracking-wider block">
            TOTAL REVENUE
          </span>
          <div className="text-2xl font-extrabold text-[#17221D] dark:text-[#E6ECE8]">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
            {totalRevenue > 0 ? (
              <>
                <ArrowUpRight className="w-3.5 h-3.5" /> All product sales for {periodFilter}
              </>
            ) : (
              'No sales recorded for this period'
            )}
          </span>
        </div>

        {/* Card 2: Total COGS */}
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase tracking-wider block">
            TOTAL COGS
          </span>
          <div className="text-2xl font-extrabold text-[#17221D] dark:text-[#E6ECE8]">
            ₹{totalCOGS.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] font-medium text-[#66736C] dark:text-[#8E9E96]">
            Cost of goods sold for period
          </span>
        </div>

        {/* Card 3: Gross Profit */}
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase tracking-wider block">
            GROSS PROFIT
          </span>
          <div className="text-2xl font-extrabold text-[#174F3A] dark:text-[#A3E6C5]">
            ₹{grossProfit.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
            Total Revenue - Total COGS
          </span>
        </div>

        {/* Card 4: Net Profit */}
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase tracking-wider block">
            NET PROFIT
          </span>
          <div
            className={`text-2xl font-extrabold ${
              netProfit >= 0
                ? 'text-teal-700 dark:text-teal-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            ₹{netProfit.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
            Opex: ₹{totalOperatingExpenses.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* SECTION 1: REVENUE & PROFIT TREND */}
      <div className="card-enterprise p-4 sm:p-5 space-y-4">
        <div className="border-b border-[#E9EFEB] dark:border-[#16241E] pb-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
              <h2 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase tracking-wider">
                Revenue & Profit Trend
              </h2>
            </div>
            <p className="text-xs text-[#66736C] dark:text-[#8E9E96] mt-0.5">
              Daily revenue and profit performance across all sales for the selected period.
            </p>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="h-48 w-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#DDE6E0] dark:border-[#1E3129] rounded-xl bg-[#F8FAF7] dark:bg-[#16241E]">
            <TrendingUp className="w-8 h-8 text-[#66736C] dark:text-[#8E9E96] mb-2 opacity-50" />
            <p className="text-xs font-semibold text-[#66736C] dark:text-[#8E9E96]">
              No financial transaction data recorded for this period.
            </p>
          </div>
        ) : (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#174F3A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#174F3A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
                <XAxis dataKey="date" stroke={chartTheme.textColor} fontSize={11} />
                <YAxis
                  stroke={chartTheme.textColor}
                  fontSize={11}
                  tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Total Revenue"
                  stroke="#174F3A"
                  fillOpacity={1}
                  fill="url(#colorRev)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="netProfit"
                  name="Net Profit"
                  stroke="#0D9488"
                  fillOpacity={1}
                  fill="url(#colorNp)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* FINANCIAL ENTRY FORM & OPERATING EXPENSES BREAKDOWN */}
      <div className="card-enterprise p-4 sm:p-5 space-y-4">
        <div className="border-b border-[#E9EFEB] dark:border-[#16241E] pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
            <h2 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase tracking-wider">
              Record Operating Expense
            </h2>
          </div>
          <p className="text-xs text-[#66736C] dark:text-[#8E9E96] mt-0.5">
            Add operating expense categories dynamically to update Total Operating Expenses and Net Profit calculations.
          </p>
        </div>

        <form onSubmit={handleSaveFinancialEntry} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Field 1: Operating Expense Category */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                Expense Category <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryPreset}
                onChange={(e) => setCategoryPreset(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none"
              >
                {OPERATING_EXPENSE_PRESETS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 2: Custom Category Input (if selected) or Amount */}
            {(categoryPreset === 'Custom Category...' || categoryPreset === 'Other Expense') ? (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  Custom Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Internet, License Fee, Fuel"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none"
                />
              </div>
            ) : null}

            {/* Field 3: Amount (₹) */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                placeholder="Enter amount"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none"
              />
            </div>

            {/* Field 4: Date */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none"
              />
            </div>
          </div>

          {/* Description / Notes Area */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
              Description / Notes
            </label>
            <input
              type="text"
              placeholder="Optional description / voucher notes"
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={handleClearForm}
              className="h-9 px-4 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] text-xs font-semibold text-[#66736C] dark:text-[#8E9E96] hover:bg-[#F8FAF7] dark:hover:bg-[#16241E] cursor-pointer transition-colors"
            >
              Clear
            </button>
            <button
              type="submit"
              className="h-9 px-5 bg-[#174F3A] hover:bg-[#103A2B] dark:bg-[#1B3D30] dark:hover:bg-[#234F3F] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Save Operating Expense
            </button>
          </div>
        </form>

        {/* IMMEDIATELY BELOW DESCRIPTION/NOTES: COMPACT FINANCIAL SUMMARY & OPERATING EXPENSES */}
        <div className="mt-5 pt-4 border-t border-[#E9EFEB] dark:border-[#16241E] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase tracking-wider">
              Financial Summary & Operating Expenses ({periodFilter})
            </h3>
            <span className="text-[11px] font-semibold text-[#174F3A] dark:text-[#A3E6C5] bg-[#F8FAF7] dark:bg-[#16241E] px-2.5 py-1 rounded-lg border border-[#DDE6E0] dark:border-[#1E3129]">
              Combined Sales Across All Products
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LEFT COLUMN: Operating Expenses Breakdown */}
            <div className="p-4 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] space-y-3">
              <div className="flex items-center justify-between border-b border-[#DDE6E0] dark:border-[#1E3129] pb-2">
                <span className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">
                  Operating Expenses
                </span>
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  {operatingExpensesBreakdown.length} Categories
                </span>
              </div>

              {operatingExpensesBreakdown.length === 0 ? (
                <p className="text-xs text-[#66736C] dark:text-[#8E9E96] italic py-3 text-center">
                  No operating expenses recorded for this period. Use the form above to enter expense categories like Electricity, Transportation, Staff Salary, etc.
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {operatingExpensesBreakdown.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-white dark:bg-[#121E19] border border-[#E9EFEB] dark:border-[#1A2E25]"
                    >
                      <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                        {item.category}
                      </span>
                      <span className="font-bold text-[#17221D] dark:text-[#E6ECE8]">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-[#DDE6E0] dark:border-[#1E3129] pt-2.5 font-bold text-xs">
                <span className="text-[#17221D] dark:text-[#E6ECE8]">Total Operating Expenses</span>
                <span className="text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                  ₹{totalOperatingExpenses.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: Statement Breakdown */}
            <div className="p-4 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#DDE6E0] dark:border-[#1E3129] pb-2">
                  <span className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">
                    Profit Calculation Flow
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-[#143825] dark:text-emerald-300">
                    {periodFilter}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#66736C] dark:text-[#8E9E96]">Total Revenue (All Product Sales)</span>
                    <span className="font-bold text-[#17221D] dark:text-[#E6ECE8]">
                      ₹{totalRevenue.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#66736C] dark:text-[#8E9E96]">Total COGS (Cost of Goods Sold)</span>
                    <span className="font-semibold text-[#66736C] dark:text-[#8E9E96]">
                      - ₹{totalCOGS.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-[#E9EFEB] dark:border-[#1A2E25] font-bold">
                    <span className="text-[#17221D] dark:text-[#E6ECE8]">Gross Profit</span>
                    <span className="text-emerald-700 dark:text-emerald-400 text-sm font-extrabold">
                      ₹{grossProfit.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#66736C] dark:text-[#8E9E96]">Subtract Total Operating Expenses</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      - ₹{totalOperatingExpenses.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t-2 border-[#174F3A] dark:border-[#234F3F] pt-3 font-extrabold text-sm mt-2">
                <span className="text-[#17221D] dark:text-[#E6ECE8]">Net Profit</span>
                <span
                  className={`text-base ${
                    netProfit >= 0
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  ₹{netProfit.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT FINANCIAL TRANSACTIONS */}
      <div className="card-enterprise p-4 sm:p-5 space-y-4">
        <div className="border-b border-[#E9EFEB] dark:border-[#16241E] pb-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
              <h2 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase tracking-wider">
                Recent Financial & Operating Expense Entries
              </h2>
            </div>
            <p className="text-xs text-[#66736C] dark:text-[#8E9E96] mt-0.5">
              Saved operating expense entries recorded for the active Rural Mart.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#66736C] dark:text-[#8E9E96]">
            {filteredEntries.length} entries
          </span>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-[#DDE6E0] dark:border-[#1E3129] rounded-xl bg-[#F8FAF7] dark:bg-[#16241E]">
            <p className="text-xs font-semibold text-[#66736C] dark:text-[#8E9E96]">
              No expense entries recorded yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E9EFEB] dark:border-[#16241E] text-[#66736C] dark:text-[#8E9E96] uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Description / Notes</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Gross Profit</th>
                  <th className="py-2.5 px-3">Net Profit</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EFEB] dark:divide-[#16241E]">
                {filteredEntries.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#F8FAF7] dark:hover:bg-[#16241E] transition-colors"
                  >
                    <td className="py-3 px-3 font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                      {item.date}
                    </td>
                    <td className="py-3 px-3 font-medium text-[#17221D] dark:text-[#E6ECE8]">
                      {item.category}
                    </td>
                    <td className="py-3 px-3 text-[#66736C] dark:text-[#8E9E96]">
                      {item.description || '-'}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-[#17221D] dark:text-[#E6ECE8]">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-700 dark:text-emerald-400">
                      {typeof item.grossProfit === 'number' && !isNaN(item.grossProfit)
                        ? `₹${item.grossProfit.toLocaleString('en-IN')}`
                        : '—'}
                    </td>
                    <td
                      className={`py-3 px-3 font-bold ${
                        typeof item.netProfit === 'number' && !isNaN(item.netProfit)
                          ? item.netProfit >= 0
                            ? 'text-teal-700 dark:text-teal-400'
                            : 'text-red-600 dark:text-red-400'
                          : 'text-[#66736C] dark:text-[#8E9E96]'
                      }`}
                    >
                      {typeof item.netProfit === 'number' && !isNaN(item.netProfit)
                        ? `₹${item.netProfit.toLocaleString('en-IN')}`
                        : '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteEntry(item.id)}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg cursor-pointer transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};