import React, { useEffect, useState, useMemo } from 'react';
import { GlobalFilters, Theme, RuralMartData } from '../../../shared/types';
import { RuralMartsKpiCards } from './RuralMartsKpiCards';
import { RuralMartPerformanceChart } from './RuralMartPerformanceChart';
import { DistrictWisePerformanceChart } from './DistrictWisePerformanceChart';
import { RuralMartDirectoryTable } from './RuralMartDirectoryTable';
import { RuralMartDetailModal } from './RuralMartDetailModal';
import { getLiveRuralMarts } from '../../services/ruralMartsService';

interface RuralMartsPageProps {
  filters: GlobalFilters;
  theme: Theme;
}

export const RuralMartsPage: React.FC<RuralMartsPageProps> = ({
  filters,
  theme,
}) => {
  const [selectedMart, setSelectedMart] = useState<RuralMartData | null>(null);
  const [allMarts, setAllMarts] = useState<RuralMartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    void getLiveRuralMarts(filters.dateRange)
      .then((marts) => { if (active) setAllMarts(marts); })
      .catch((reason: unknown) => {
        if (!active) return;
        const details = reason && typeof reason === 'object' && 'message' in reason
          ? String((reason as { message: unknown }).message)
          : 'Unable to load Rural Marts.';
        const code = reason && typeof reason === 'object' && 'code' in reason
          ? ` (Code: ${String((reason as { code: unknown }).code)})`
          : '';
        setError(`${details}${code}`);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filters.dateRange]);

  // Filter Rural Marts dataset according to global header filters if applicable
  const filteredMarts = useMemo(() => {
    return allMarts.filter((m) => {
      const matchesDistrict =
        !filters.district ||
        filters.district === 'All Districts' ||
        m.district.toLowerCase() === filters.district.toLowerCase();

      const matchesMart =
        !filters.ruralMart ||
        filters.ruralMart === 'All Rural Marts' ||
        m.name.toLowerCase() === filters.ruralMart.toLowerCase();

      return matchesDistrict && matchesMart;
    });
  }, [allMarts, filters]);

  return (
    <div className="space-y-6 pb-12">
      {loading && <div className="rounded-xl border border-[#DDE6E0] bg-white p-4 text-sm font-semibold text-[#174F3A]">Loading live Rural Mart data...</div>}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
      {/* SECTION 1 — KPI Cards (6) */}
      <section>
        <RuralMartsKpiCards marts={filteredMarts} />
      </section>

      {/* SECTION 2 — Rural Mart Directory Table (Full Width) */}
      <section>
        <RuralMartDirectoryTable
          marts={filteredMarts}
          onSelectMart={(mart) => setSelectedMart(mart)}
        />
      </section>

      {/* SECTION 3 — Charts Grid (2) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Rural Mart Performance Comparison (Horizontal bar) */}
        <RuralMartPerformanceChart theme={theme} marts={filteredMarts} />

        {/* Chart 2: District-wise Performance (Column chart) */}
        <DistrictWisePerformanceChart theme={theme} marts={filteredMarts} />
      </section>

      {/* Detail Inspection Modal */}
      {selectedMart && (
        <RuralMartDetailModal
          mart={selectedMart}
          onClose={() => setSelectedMart(null)}
        />
      )}
    </div>
  );
};
