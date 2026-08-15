import React, { useState, useMemo } from 'react';
import { FinanceKpiCards } from './FinanceKpiCards';
import { FinancialTrendChart } from './FinancialTrendChart';
import { RevenueVsOpexChart } from './RevenueVsOpexChart';
import { MartFinancialComparisonChart } from './MartFinancialComparisonChart';
import { BillsAndSalesGrowthChart } from './BillsAndSalesGrowthChart';
import { MartFinancialDetailModal } from './MartFinancialDetailModal';

import { GlobalFilters, MartFinancialRecord, Theme } from '../../../shared/types';
import { getFinancialMarts } from '../../../shared/dataServices';

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

  // Derive financial marts from shared data layer
  const allFinancialMarts = useMemo(() => getFinancialMarts(), []);

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
      {/* SECTION 1 — KPI CARDS (6) */}
      <section aria-label="Financial Key Performance Indicators">
        <FinanceKpiCards financialMarts={filteredMarts} />
      </section>

      {/* SECTION 2 — CHARTS (4 ANALYTICS CARDS IN A 2x2 GRID) */}
      <section aria-label="Financial Analytics Charts" className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Chart 1: Financial Trend Line Chart */}
        <FinancialTrendChart theme={theme} />

        {/* Chart 2: Revenue vs Operating Expenses Stacked Bar Chart */}
        <RevenueVsOpexChart theme={theme} />

        {/* Chart 3: Rural Mart Financial Comparison Horizontal Bar Chart */}
        <MartFinancialComparisonChart financialMarts={filteredMarts} theme={theme} />

        {/* Chart 4: Bills & Sales Growth Dual-Axis Chart */}
        <BillsAndSalesGrowthChart theme={theme} />
      </section>

      {/* DETAIL P&L STATEMENT MODAL */}
      <MartFinancialDetailModal mart={selectedMart} onClose={() => setSelectedMart(null)} />
    </div>
  );
};
