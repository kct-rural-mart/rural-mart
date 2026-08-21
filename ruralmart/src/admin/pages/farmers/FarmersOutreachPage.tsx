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

  // Network-wide farmer totals for the KPI cards, deduped by phone number so a
  // person registered at two marts (within whatever district/mart filter is
  // currently applied) is counted once, not twice. Computed from the same
  // filtered set the Farmer Database table below uses, so the filter behaves
  // consistently everywhere on this page.
  const networkFarmerTotals = useMemo(() => {
    const repeatPhones = new Set<string>();
    const newCandidatePhones = new Set<string>();
    const allPhones = new Set<string>();

    for (const farmer of filteredFarmerRecords) {
      const phone = (farmer.phone || '').replace(/\D/g, '').slice(-10);
      if (!phone) continue;
      allPhones.add(phone);
      if (farmer.purchaseCount >= 2) repeatPhones.add(phone);
      else if (farmer.purchaseCount === 1) newCandidatePhones.add(phone);
    }
    // A phone only counts as "new" if none of its rows already qualified as repeat.
    const newPhones = [...newCandidatePhones].filter((phone) => !repeatPhones.has(phone));

    return {
      totalRegistered: allPhones.size,
      totalNew: newPhones.length,
      totalRepeat: repeatPhones.size,
    };
  }, [filteredFarmerRecords]);

  return (
    <div className="space-y-5">
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
      {/* SECTION 1 — 6 KPI Cards */}
      <section>
        <FarmersKpiCards
          outreachMarts={filteredOutreachMarts}
          totalRegisteredFarmers={networkFarmerTotals.totalRegistered}
          totalNewFarmers={networkFarmerTotals.totalNew}
          totalRepeatFarmers={networkFarmerTotals.totalRepeat}
        />
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
