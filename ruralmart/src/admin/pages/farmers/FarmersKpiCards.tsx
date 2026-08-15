import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  RotateCw,
  Target,
  CalendarCheck,
  HeartHandshake,
  Info,
} from 'lucide-react';
import { FarmerOutreachMartRecord } from '../../../shared/types';

interface FarmersKpiCardsProps {
  outreachMarts: FarmerOutreachMartRecord[];
}

export const FarmersKpiCards: React.FC<FarmersKpiCardsProps> = ({ outreachMarts }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const totalRegistered = outreachMarts.reduce((acc, m) => acc + (m.totalRegisteredFarmers || 0), 0);
  const totalNew = outreachMarts.reduce((acc, m) => acc + (m.newFarmers || 0), 0);
  const totalRepeat = outreachMarts.reduce((acc, m) => acc + (m.repeatFarmers || 0), 0);
  const totalReached = outreachMarts.reduce((acc, m) => acc + (m.farmersReached || 0), 0);
  const totalPrograms = outreachMarts.reduce((acc, m) => acc + (m.outreachProgramsConducted || 0), 0);
  const totalAnimalPop = outreachMarts.reduce((acc, m) => acc + (m.animalPopulationCovered || 0), 0);

  const kpis = [
    {
      id: 'reg-farmers',
      label: 'Total Registered Farmers',
      value: totalRegistered.toLocaleString('en-IN'),
      icon: Users,
      tooltip: 'Total cumulative farmers registered across all active Rural Marts in EDF records.',
    },
    {
      id: 'new-farmers',
      label: 'New Farmers',
      value: totalNew.toLocaleString('en-IN'),
      icon: UserPlus,
      tooltip: 'First-time registered farmers onboarded during current reporting cycle.',
    },
    {
      id: 'repeat-farmers',
      label: 'Repeat Farmers',
      value: totalRepeat.toLocaleString('en-IN'),
      icon: RotateCw,
      tooltip: 'Farmers with 2 or more transactions or visits to Rural Marts.',
    },
    {
      id: 'farmers-reached',
      label: 'Farmers Reached',
      value: totalReached.toLocaleString('en-IN'),
      icon: Target,
      tooltip: 'Farmers directly participating in health camps, training workshops, and melas.',
    },
    {
      id: 'outreach-programs',
      label: 'Outreach Programs',
      value: totalPrograms.toString(),
      icon: CalendarCheck,
      tooltip: 'Veterinary camps, soil testing drives, and organic farming workshops held.',
    },
    {
      id: 'animal-pop',
      label: 'Animal Population Covered',
      value: totalAnimalPop.toLocaleString('en-IN'),
      icon: HeartHandshake,
      tooltip: 'Total cattle, dairy, and livestock head count provided with health and nutrition inputs.',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {kpis.map((kpi) => {
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
