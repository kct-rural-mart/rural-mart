import React, { useState, useMemo } from 'react';
import { GlobalFilters, Theme, RuralMartData } from '../../../shared/types';
import { INITIAL_RURAL_MARTS } from '../../../mockData';
import { RuralMartsKpiCards } from './RuralMartsKpiCards';
import { RuralMartPerformanceChart } from './RuralMartPerformanceChart';
import { DistrictWisePerformanceChart } from './DistrictWisePerformanceChart';
import { RuralMartDirectoryTable } from './RuralMartDirectoryTable';
import { RuralMartDetailModal } from './RuralMartDetailModal';
import { getRuralMarts } from '../../../shared/dataServices';

interface RuralMartsPageProps {
  filters: GlobalFilters;
  theme: Theme;
}

export const RuralMartsPage: React.FC<RuralMartsPageProps> = ({
  filters,
  theme,
}) => {
  const [selectedMart, setSelectedMart] = useState<RuralMartData | null>(null);

  // Combine canonical marts from shared service layer
  const allMarts = useMemo(() => {
    const canonicalMarts = getRuralMarts();

    return canonicalMarts.map((cm) => {
      // Match against static mock data to retain performance analytics metrics
      const existingMock = INITIAL_RURAL_MARTS.find(
        (m) =>
          m.id.toLowerCase() === cm.ruralMartId.toLowerCase() ||
          m.name.toLowerCase() === cm.ruralMartName.toLowerCase() ||
          cm.ruralMartName.toLowerCase().includes(m.name.toLowerCase()) ||
          m.id.replace('rm-', 'RM-00') === cm.ruralMartId
      );

      const formattedStatus = (
        cm.status
          ? cm.status.charAt(0).toUpperCase() + cm.status.slice(1).toLowerCase()
          : 'Active'
      ) as 'Active' | 'Delayed' | 'Inactive';

      return {
        id: cm.ruralMartId, // Canonical ID e.g., RM-001
        name: cm.ruralMartName,
        district: cm.district,
        status: formattedStatus,
        salesCr: existingMock ? existingMock.salesCr : 0.18,
        salesRaw: existingMock ? existingMock.salesRaw : 1800000,
        grossProfitLakhs: existingMock ? existingMock.grossProfitLakhs : 3.8,
        grossProfitRaw: existingMock ? existingMock.grossProfitRaw : 380000,
        registeredFarmers: existingMock ? existingMock.registeredFarmers : 500,
        farmersReached: existingMock ? existingMock.farmersReached : 210,
        farmerFootfall: existingMock ? existingMock.farmerFootfall : 350,
        score: existingMock ? existingMock.score : 88,
        targetScore: existingMock ? existingMock.targetScore : 90,
        dataCompleteness: existingMock ? existingMock.dataCompleteness : 100,
        lastUpdated: cm.lastUpdated || 'Just now',
        manager: cm.ownerName || (existingMock ? existingMock.manager : 'Mart Owner'),
        contact: cm.ownerPhone || cm.ownerEmail || (existingMock ? existingMock.contact : 'N/A'),
        scoreBreakdown: existingMock
          ? existingMock.scoreBreakdown
          : {
              salesGrowth: 18.0,
              profitability: 17.5,
              farmerEngagement: 18.0,
              outreachImpact: 14.5,
              inventoryHealth: 13.0,
              compliance: 9.5,
            },
      };
    });
  }, []);

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
        <DistrictWisePerformanceChart theme={theme} />
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
