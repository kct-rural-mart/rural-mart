import React, { useEffect, useState, useMemo } from 'react';
import { Theme, FarmerOutreachMartRecord, FarmerRecord, FarmerGrowthDataPoint, OutreachPerformanceDataPoint } from '../../../shared/types';
import { getLiveFarmersOutreach } from '../../services/farmersOutreachService';
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
  const [allFarmers, setAllFarmers] = useState<FarmerRecord[]>([]); const [allOutreachMarts, setAllOutreachMarts] = useState<FarmerOutreachMartRecord[]>([]);
  const [growth, setGrowth] = useState<FarmerGrowthDataPoint[]>([]); const [outreach, setOutreach] = useState<OutreachPerformanceDataPoint[]>([]); const [error, setError] = useState('');

  useEffect(() => { let active = true; setError(''); void getLiveFarmersOutreach().then((data) => { if (!active) return; setAllFarmers(data.farmers); setAllOutreachMarts(data.marts); setGrowth(data.growth); setOutreach(data.outreach); }).catch((reason: unknown) => { if (active) setError(reason && typeof reason === 'object' && 'message' in reason ? String((reason as { message: unknown }).message) : 'Unable to load farmer outreach.'); }); return () => { active = false; }; }, []);

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
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
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
        <FarmerGrowthAndRetentionChart theme={theme} data={growth} />

        {/* Outreach Performance (Grouped Bar) */}
        <OutreachPerformanceBarChart theme={theme} data={outreach} />
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
