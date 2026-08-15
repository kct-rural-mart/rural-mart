import React, { useState, useMemo } from 'react';
import { Theme, FarmerOutreachMartRecord, FarmerRecord } from '../../../shared/types';
import { getFarmers, getRuralMarts, getFarmerOutreachMarts } from '../../../shared/dataServices';
import { FarmersKpiCards } from './FarmersKpiCards';
import { FarmerGrowthAndRetentionChart } from './FarmerGrowthAndRetentionChart';
import { OutreachPerformanceBarChart } from './OutreachPerformanceBarChart';
import { FarmerDatabasePreviewTable } from './FarmerDatabasePreviewTable';
import { FarmerDetailModal } from './FarmerDetailModal';
import { FarmerPurchaseHistoryModal } from './FarmerPurchaseHistoryModal';
import { MartOutreachDetailModal } from './MartOutreachDetailModal';

interface FarmersOutreachPageProps {
  theme: Theme;
  selectedDistrict: string;
  selectedMart: string;
}

export const FarmersOutreachPage: React.FC<FarmersOutreachPageProps> = ({
  theme,
  selectedDistrict,
  selectedMart,
}) => {
  const [selectedMartModal, setSelectedMartModal] = useState<FarmerOutreachMartRecord | null>(null);
  const [selectedFarmerModal, setSelectedFarmerModal] = useState<FarmerRecord | null>(null);
  const [selectedPurchaseHistoryFarmer, setSelectedPurchaseHistoryFarmer] = useState<FarmerRecord | null>(null);

  // Retrieve canonical farmer records via shared data service
  const allFarmers = useMemo(() => {
    const canonicalFarmers = getFarmers();
    const canonicalMarts = getRuralMarts();

    return canonicalFarmers.map((cf) => {
      const mart = canonicalMarts.find((m) => m.ruralMartId === cf.ruralMartId);
      let martDisplayName = cf.ruralMartId || 'Rural Mart';
      if (mart) {
        martDisplayName = mart.ruralMartName
          .replace(' Rural Mart', '')
          .replace(' Agro Mart', '')
          .replace(' Farmers Hub', '');
      }
      return {
        id: cf.id,
        name: cf.name,
        village: cf.village,
        district: cf.district || (mart ? mart.district : 'Erode'),
        ruralMart: martDisplayName,
        category: cf.category,
        animalHeadCount: cf.animalHeadCount,
        lastVisit: cf.lastVisit,
        status: cf.status,
        phone: cf.phone,
        totalPurchasesVal: cf.totalPurchasesVal,
        joinedDate: cf.joinedDate,
        itemsPurchased: (cf as any).itemsPurchased || 'None',
        purchaseDate: cf.lastVisit,
      } as FarmerRecord;
    });
  }, []);

  // Retrieve canonical outreach records via shared data service
  const allOutreachMarts = useMemo(() => getFarmerOutreachMarts(), []);

  // Filter outreach marts by selected top header district and rural mart
  const filteredOutreachMarts = useMemo(() => {
    return allOutreachMarts.filter((m) => {
      const matchDistrict =
        selectedDistrict === 'All Districts' ||
        m.district.toLowerCase() === selectedDistrict.toLowerCase();
      const matchMart =
        selectedMart === 'All Rural Marts' ||
        m.name.toLowerCase() === selectedMart.toLowerCase();
      return matchDistrict && matchMart;
    });
  }, [allOutreachMarts, selectedDistrict, selectedMart]);

  // Filter farmer database records by district and rural mart
  const filteredFarmerRecords = useMemo(() => {
    return allFarmers.filter((f) => {
      const matchDistrict =
        selectedDistrict === 'All Districts' ||
        f.district.toLowerCase() === selectedDistrict.toLowerCase();
      const matchMart =
        selectedMart === 'All Rural Marts' ||
        f.ruralMart.toLowerCase() === selectedMart.toLowerCase();
      return matchDistrict && matchMart;
    });
  }, [allFarmers, selectedDistrict, selectedMart]);

  return (
    <div className="space-y-5">
      {/* SECTION 1 — 6 KPI Cards */}
      <section>
        <FarmersKpiCards outreachMarts={filteredOutreachMarts} />
      </section>

      {/* SECTION 2 — Full Width Farmer Database (200 Records) */}
      <section className="w-full">
        <FarmerDatabasePreviewTable
          farmers={filteredFarmerRecords}
          onSelectFarmer={(farmer) => setSelectedFarmerModal(farmer)}
          onSelectPurchaseHistory={(farmer) => setSelectedPurchaseHistoryFarmer(farmer)}
        />
      </section>

      {/* SECTION 3 — Charts (Combined Growth & Retention Trend + Outreach Performance) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Combined Farmer Growth & Customer Retention Trend */}
        <FarmerGrowthAndRetentionChart theme={theme} />

        {/* Outreach Performance (Grouped Bar) */}
        <OutreachPerformanceBarChart theme={theme} />
      </section>

      {/* Modals */}
      <FarmerDetailModal
        farmer={selectedFarmerModal}
        onClose={() => setSelectedFarmerModal(null)}
      />

      <FarmerPurchaseHistoryModal
        farmer={selectedPurchaseHistoryFarmer}
        onClose={() => setSelectedPurchaseHistoryFarmer(null)}
      />

      <MartOutreachDetailModal
        mart={selectedMartModal}
        onClose={() => setSelectedMartModal(null)}
      />
    </div>
  );
};
