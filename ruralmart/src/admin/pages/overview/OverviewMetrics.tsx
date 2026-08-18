import React from 'react';
import {
  Users,
  Receipt,
  Megaphone,
  AlertCircle,
  Award,
  TrendingUp,
  MapPin,
  Heart,
  Tent,
  UserCheck,
} from 'lucide-react';
import { RuralMartData } from '../../../shared/types';
import { getAlerts } from '../../../shared/dataServices';

interface OverviewMetricsProps {
  dateRange?: string;
  marts?: RuralMartData[];
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({
  dateRange = 'Last 30 Days',
  marts,
}) => {
  const activeMarts = marts ?? [];
  type LiveOverviewMart = RuralMartData & {
    totalBills?: number; outreachPrograms?: number; villagesCovered?: number;
    animalPopulationCovered?: number; medicalCamps?: number; newFarmers?: number;
    salesGrowthPercent?: number;
  };
  const liveMarts = activeMarts as LiveOverviewMart[];
  const alerts = getAlerts();

  // 1. Footfall, Bills, Programs, Alerts
  const footfall = activeMarts.reduce((sum, m) => sum + (m.farmerFootfall || 0), 0);
  const billsCount = liveMarts.reduce((sum, mart) => sum + (mart.totalBills || 0), 0);
  const programsCount = liveMarts.reduce((sum, mart) => sum + (mart.outreachPrograms || 0), 0);
  const activeAlertsCount = alerts.filter((a) => a.status !== 'Resolved').length;

  // 2. Highlights
  const sortedMarts = [...activeMarts].filter((m) => m.score > 0).sort((a, b) => b.score - a.score);
  const bestMart = sortedMarts[0];

  const sortedOutreach = [...activeMarts].filter((m) => m.farmersReached > 0).sort((a, b) => b.farmersReached - a.farmersReached);
  const highestOutreachMart = sortedOutreach[0];

  const sortedGrowth = [...liveMarts].filter((f) => (f.salesGrowthPercent || 0) > 0).sort(
    (a, b) => (b.salesGrowthPercent || 0) - (a.salesGrowthPercent || 0)
  );
  const fastestMartRecord = sortedGrowth[0];

  // 3. Impact Snapshot
  const villages = liveMarts.reduce((sum, m) => sum + (m.villagesCovered || 0), 0);
  const cattle = liveMarts.reduce((sum, m) => sum + (m.animalPopulationCovered || 0), 0);
  const camps = liveMarts.reduce((sum, m) => sum + (m.medicalCamps || 0), 0);
  const converted = liveMarts.reduce((sum, m) => sum + (m.newFarmers || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* 1. Network Activity Card */}
      <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-3.5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 cursor-pointer flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] inline-block" />
            Network Activity
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center py-1">
          {/* Farmer Footfall */}
          <div className="bg-[#F8FAF7] dark:bg-[#16241E] p-2 rounded-lg border border-[#E9EFEB] dark:border-[#1E3129]">
            <div className="flex items-center justify-center gap-1 text-[10px] text-[#66736C] dark:text-[#8E9E96] font-medium">
              <Users className="w-3 h-3 text-[#174F3A] dark:text-[#8ECAAA]" />
              <span>Footfall</span>
            </div>
            <p className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8] mt-1">
              {footfall.toLocaleString('en-IN')}
            </p>
            <div className="w-full bg-[#DDE6E0] dark:bg-[#1E3129] h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-[#174F3A] dark:bg-[#8ECAAA] h-full rounded-full" style={{ width: footfall > 0 ? '75%' : '0%' }} />
            </div>
          </div>

          {/* Number of Bills */}
          <div className="bg-[#F8FAF7] dark:bg-[#16241E] p-2 rounded-lg border border-[#E9EFEB] dark:border-[#1E3129]">
            <div className="flex items-center justify-center gap-1 text-[10px] text-[#66736C] dark:text-[#8E9E96] font-medium">
              <Receipt className="w-3 h-3 text-[#174F3A] dark:text-[#8ECAAA]" />
              <span>Bills</span>
            </div>
            <p className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8] mt-1">
              {billsCount.toLocaleString('en-IN')}
            </p>
            <div className="w-full bg-[#DDE6E0] dark:bg-[#1E3129] h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-[#34735A] dark:bg-[#4F8F78] h-full rounded-full" style={{ width: billsCount > 0 ? '80%' : '0%' }} />
            </div>
          </div>

          {/* Outreach Programs */}
          <div className="bg-[#F8FAF7] dark:bg-[#16241E] p-2 rounded-lg border border-[#E9EFEB] dark:border-[#1E3129]">
            <div className="flex items-center justify-center gap-1 text-[10px] text-[#66736C] dark:text-[#8E9E96] font-medium">
              <Megaphone className="w-3 h-3 text-[#4F8F78] dark:text-[#8ECAAA]" />
              <span>Programs</span>
            </div>
            <p className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8] mt-1">
              {programsCount}
            </p>
            <div className="w-full bg-[#DDE6E0] dark:bg-[#1E3129] h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-[#4F8F78] h-full rounded-full" style={{ width: programsCount > 0 ? '66%' : '0%' }} />
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-[#FEE2E2]/60 dark:bg-[#3D1717] p-2 rounded-lg border border-[#FECACA] dark:border-[#7F1D1D]">
            <div className="flex items-center justify-center gap-1 text-[10px] text-[#DC2626] dark:text-[#FCA5A5] font-medium">
              <AlertCircle className="w-3 h-3 text-[#DC2626]" />
              <span>Alerts</span>
            </div>
            <p className="text-base font-bold text-[#DC2626] dark:text-[#FCA5A5] mt-1">
              {activeAlertsCount}
            </p>
            <div className="w-full bg-[#FECACA] dark:bg-[#7F1D1D] h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-[#DC2626] h-full rounded-full" style={{ width: activeAlertsCount > 0 ? '50%' : '0%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Performance Highlights Card */}
      <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-3.5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 cursor-pointer flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#D97706]" />
            Performance Highlights
          </h3>
          <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] font-medium">
            {dateRange}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 py-0.5">
          {/* Best Performing RM */}
          <div className="bg-[#E7F2EC] dark:bg-[#1B3D30] p-2 rounded-lg border border-[#174F3A]/15 dark:border-[#A3E6C5]/20 flex flex-col justify-between">
            <span className="text-[9px] uppercase font-bold text-[#103A2B] dark:text-[#A3E6C5]">
              Best Performing
            </span>
            <p className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] mt-1 truncate">
              {bestMart ? bestMart.name.replace(' Rural Mart', '').replace(' Agro Mart', '') : 'N/A'}
            </p>
            <span className="text-[10px] text-[#34735A] dark:text-[#8ECAAA] font-bold mt-1">
              {bestMart ? `Score: ${bestMart.score}` : 'No data'}
            </span>
          </div>

          {/* Highest Outreach RM */}
          <div className="bg-[#F8FAF7] dark:bg-[#16241E] p-2 rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] flex flex-col justify-between">
            <span className="text-[9px] uppercase font-bold text-[#4F8F78] dark:text-[#8ECAAA]">
              Highest Outreach
            </span>
            <p className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] mt-1 truncate">
              {highestOutreachMart
                ? highestOutreachMart.name.replace(' Rural Mart', '').replace(' Agro Mart', '')
                : 'N/A'}
            </p>
            <span className="text-[10px] text-[#34735A] dark:text-[#8ECAAA] font-bold mt-1">
              {highestOutreachMart ? `${highestOutreachMart.farmersReached} Farmers` : 'No data'}
            </span>
          </div>

          {/* Fastest Growing RM */}
          <div className="bg-[#FEF3C7]/60 dark:bg-[#3D2D10] p-2 rounded-lg border border-[#FDE68A] dark:border-[#78350F] flex flex-col justify-between">
            <span className="text-[9px] uppercase font-bold text-[#B45309] dark:text-[#FBBF24]">
              Fastest Growing
            </span>
            <p className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] mt-1 truncate">
              {fastestMartRecord
                ? fastestMartRecord.name.replace(' Rural Mart', '').replace(' Agro Mart', '')
                : 'N/A'}
            </p>
            <span className="text-[10px] text-[#D97706] dark:text-[#FBBF24] font-bold mt-1 flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5 inline" />
              {fastestMartRecord ? `+${fastestMartRecord.salesGrowthPercent}% MoM` : 'No data'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Network Impact Snapshot Card */}
      <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-3.5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 cursor-pointer flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase tracking-wider flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#DC2626]" />
            Network Impact Snapshot
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center py-1">
          {/* Villages Covered */}
          <div className="bg-[#F8FAF7] dark:bg-[#16241E] p-2 rounded-lg border border-[#E9EFEB] dark:border-[#1E3129]">
            <div className="flex items-center justify-center gap-1 text-[10px] text-[#66736C] dark:text-[#8E9E96] font-medium">
              <MapPin className="w-3 h-3 text-[#174F3A] dark:text-[#8ECAAA]" />
              <span>Villages</span>
            </div>
            <p className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8] mt-1">
              {villages.toString()}
            </p>
          </div>

          {/* Animals Covered */}
          <div className="bg-[#F8FAF7] dark:bg-[#16241E] p-2 rounded-lg border border-[#E9EFEB] dark:border-[#1E3129]">
            <div className="flex items-center justify-center gap-1 text-[10px] text-[#66736C] dark:text-[#8E9E96] font-medium">
              <Heart className="w-3 h-3 text-[#DC2626]" />
              <span>Cattle</span>
            </div>
            <p className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8] mt-1">
              {cattle.toLocaleString('en-IN')}
            </p>
          </div>

          {/* Animal Health Camps */}
          <div className="bg-[#F8FAF7] dark:bg-[#16241E] p-2 rounded-lg border border-[#E9EFEB] dark:border-[#1E3129]">
            <div className="flex items-center justify-center gap-1 text-[10px] text-[#66736C] dark:text-[#8E9E96] font-medium">
              <Tent className="w-3 h-3 text-[#D97706]" />
              <span>Camps</span>
            </div>
            <p className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8] mt-1">
              {camps.toString()}
            </p>
          </div>

          {/* New Farmers Converted */}
          <div className="bg-[#F8FAF7] dark:bg-[#16241E] p-2 rounded-lg border border-[#E9EFEB] dark:border-[#1E3129]">
            <div className="flex items-center justify-center gap-1 text-[10px] text-[#66736C] dark:text-[#8E9E96] font-medium">
              <UserCheck className="w-3 h-3 text-[#2563EB]" />
              <span>Converted</span>
            </div>
            <p className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8] mt-1">
              {converted.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
