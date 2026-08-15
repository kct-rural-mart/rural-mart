import React, { useState } from 'react';
import {
  Store,
  Activity,
  TrendingUp,
  BarChart2,
  Users,
  Target,
  Info,
} from 'lucide-react';
import { RuralMartData } from '../../../shared/types';

interface KpiCardsProps {
  marts: RuralMartData[];
}

export const KpiCards: React.FC<KpiCardsProps> = ({ marts }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Calculate filtered or total values dynamically
  const totalMarts = marts.length;
  const activeMartsCount = marts.filter((m) => m.status === 'Active').length;
  
  // Sum sales in raw rupees
  const totalSalesRaw = marts.reduce((sum, m) => sum + m.salesRaw, 0);
  const totalProfitRaw = marts.reduce((sum, m) => sum + m.grossProfitRaw, 0);
  const totalFarmersReg = marts.reduce((sum, m) => sum + m.registeredFarmers, 0);
  const totalFarmersReached = marts.reduce((sum, m) => sum + m.farmersReached, 0);

  // Format helper for Currency
  const formatSalesDisplay = (valRaw: number) => {
    if (valRaw >= 10000000) {
      return `₹${(valRaw / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(valRaw / 100000).toFixed(1)} L`;
  };

  const formatProfitDisplay = (valRaw: number) => {
    return `₹${(valRaw / 100000).toFixed(1)} L`;
  };

  const kpiData = [
    {
      id: 'kpi-total-marts',
      label: 'Total Rural Marts',
      value: totalMarts.toString(),
      icon: Store,
      badge: '+0',
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/15 dark:border-[#A3E6C5]/20',
      comparison: 'vs last quarter',
      tooltip: 'Total sanctioned operating and expanding Rural Mart outposts across monitored districts.',
    },
    {
      id: 'kpi-active-marts',
      label: 'Active Rural Marts',
      value: activeMartsCount.toString(),
      icon: Activity,
      badge: `${activeMartsCount}/${totalMarts} Live`,
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/15 dark:border-[#A3E6C5]/20',
      comparison: `${totalMarts - activeMartsCount} pending sync`,
      tooltip: 'Marts actively transmitting daily sales, inventory, and ledger records to the central hub.',
    },
    {
      id: 'kpi-total-sales',
      label: 'Total Sales',
      value: formatSalesDisplay(totalSalesRaw),
      icon: TrendingUp,
      badge: '+12.4%',
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/15 dark:border-[#A3E6C5]/20',
      comparison: 'vs previous quarter',
      tooltip: 'Cumulative gross revenue generated from agri-inputs, cattle feed, and local farmer product sales.',
    },
    {
      id: 'kpi-gross-profit',
      label: 'Gross Profit',
      value: formatProfitDisplay(totalProfitRaw),
      icon: BarChart2,
      badge: '+8.7%',
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/15 dark:border-[#A3E6C5]/20',
      comparison: 'vs previous quarter',
      tooltip: 'Gross profit margin realized after subtracting product cost of goods sold (COGS).',
    },
    {
      id: 'kpi-registered-farmers',
      label: 'Registered Farmers',
      value: totalFarmersReg.toLocaleString('en-IN'),
      icon: Users,
      badge: '+6.2%',
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/15 dark:border-[#A3E6C5]/20',
      comparison: 'vs previous quarter',
      tooltip: 'Farmers registered under the NABARD Rural Mart membership cooperative system.',
    },
    {
      id: 'kpi-farmers-reached',
      label: 'Farmers Reached',
      value: totalFarmersReached.toLocaleString('en-IN'),
      icon: Target,
      badge: '+14.1%',
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/15 dark:border-[#A3E6C5]/20',
      comparison: 'vs previous quarter',
      tooltip: 'Unique smallholder farmers directly participating in transactions or outreach camps this period.',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {kpiData.map((kpi) => {
        const Icon = kpi.icon;
        const isTooltipOpen = activeTooltip === kpi.id;

        return (
          <div
            key={kpi.id}
            className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-3.5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 cursor-pointer relative flex flex-col justify-between group"
          >
            {/* Top Row: Label & Info Icon */}
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase tracking-wider truncate">
                {kpi.label}
              </span>
              <div className="relative flex items-center">
                <button
                  onMouseEnter={() => setActiveTooltip(kpi.id)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(isTooltipOpen ? null : kpi.id)}
                  className="text-[#8A958F] hover:text-[#174F3A] dark:text-[#61736A] dark:hover:text-[#A3E6C5] transition-colors p-0.5"
                  title="More information"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                {/* Info Tooltip Popover */}
                {isTooltipOpen && (
                  <div className="absolute right-0 top-6 w-48 bg-[#17221D] text-white dark:bg-[#16241E] dark:text-[#E6ECE8] text-[10px] p-2 rounded-lg shadow-lg z-50 pointer-events-none leading-relaxed border border-[#34735A]">
                    {kpi.tooltip}
                  </div>
                )}
              </div>
            </div>

            {/* Middle Row: Value & Main Icon */}
            <div className="flex items-baseline justify-between gap-2 my-1">
              <span className="text-xl md:text-2xl font-bold text-[#17221D] dark:text-[#E6ECE8] tracking-tight">
                {kpi.value}
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#E7F2EC] dark:bg-[#1B3D30] text-[#174F3A] dark:text-[#A3E6C5] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
