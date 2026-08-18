import React, { useEffect, useState, useMemo } from 'react';
import { FinanceKpiCards } from './FinanceKpiCards';
import { FinancialTrendChart } from './FinancialTrendChart';
import { RevenueVsOpexChart } from './RevenueVsOpexChart';
import { MartFinancialComparisonChart } from './MartFinancialComparisonChart';
import { BillsAndSalesGrowthChart } from './BillsAndSalesGrowthChart';
import { MartFinancialDetailModal } from './MartFinancialDetailModal';

import { BillsGrowthPoint, FinancialTrendPoint, GlobalFilters, MartFinancialRecord, RevenueOpexPoint, Theme } from '../../../shared/types';
import { getLiveFinance } from '../../services/financeDashboardService';

interface BusinessFinancePageProps {
  theme: Theme;
  filters: GlobalFilters;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilters>>;
}

export const BusinessFinancePage: React.FC<BusinessFinancePageProps> = ({
  theme,
  filters,
  setFilters,
}) => {
  const [selectedMart, setSelectedMart] = useState<MartFinancialRecord | null>(null);
  const [allFinancialMarts, setAllFinancialMarts] = useState<MartFinancialRecord[]>([]); const [trend, setTrend] = useState<FinancialTrendPoint[]>([]); const [revenueOpex, setRevenueOpex] = useState<RevenueOpexPoint[]>([]); const [bills, setBills] = useState<BillsGrowthPoint[]>([]); const [error, setError] = useState('');

  useEffect(() => { let active = true; setError(''); void getLiveFinance().then((data) => { if (!active) return; setAllFinancialMarts(data.marts); setTrend(data.trend); setRevenueOpex(data.revenueOpex); setBills(data.bills); }).catch((reason: unknown) => { if (active) setError(reason && typeof reason === 'object' && 'message' in reason ? String((reason as { message: unknown }).message) : 'Unable to load finance data.'); }); return () => { active = false; }; }, []);

  // Filter financial marts based on global filter selections
  const filteredMarts = useMemo(() => {
    return allFinancialMarts.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        m.district.toLowerCase().includes(filters.searchQuery.toLowerCase());
      const matchDistrict = filters.district === 'All Districts' || m.district === filters.district;
      const matchMart = filters.ruralMart === 'All Rural Marts' || m.name === filters.ruralMart;

      return matchSearch && matchDistrict && matchMart;
    });
  }, [allFinancialMarts, filters.searchQuery, filters.district, filters.ruralMart]);

  return (
    <div className="space-y-4 max-w-[1600px] w-full mx-auto">
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
      {/* SECTION 1 — KPI CARDS (6) */}
      <section aria-label="Financial Key Performance Indicators">
        <FinanceKpiCards financialMarts={filteredMarts} />
      </section>

      {/* SECTION 2 — CHARTS (4 ANALYTICS CARDS IN A 2x2 GRID) */}
      <section aria-label="Financial Analytics Charts" className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Chart 1: Financial Trend Line Chart */}
        <FinancialTrendChart theme={theme} data={trend} />

        {/* Chart 2: Revenue vs Operating Expenses Stacked Bar Chart */}
        <RevenueVsOpexChart theme={theme} data={revenueOpex} />

        {/* Chart 3: Rural Mart Financial Comparison Horizontal Bar Chart */}
        <MartFinancialComparisonChart financialMarts={filteredMarts} theme={theme} />

        {/* Chart 4: Bills & Sales Growth Dual-Axis Chart */}
        <BillsAndSalesGrowthChart theme={theme} data={bills} />
      </section>

      {/* DETAIL P&L STATEMENT MODAL */}
      <MartFinancialDetailModal mart={selectedMart} onClose={() => setSelectedMart(null)} />
    </div>
  );
};
