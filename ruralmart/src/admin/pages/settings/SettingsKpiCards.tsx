import React, { useState } from 'react';
import { Store, Users, Shield, Bell, FileClock, HardDrive, Info } from 'lucide-react';

interface SettingsKpiCardsProps {
  totalMartsCount?: number;
  activeUsersCount?: number;
  userRolesCount?: number;
  notificationRulesCount?: number;
  scheduledReportsCount?: number;
  lastBackupTime?: string;
}

export const SettingsKpiCards: React.FC<SettingsKpiCardsProps> = ({
  totalMartsCount = 24,
  activeUsersCount = 1,
  userRolesCount = 0,
  notificationRulesCount = 0,
  scheduledReportsCount = 0,
  lastBackupTime = 'Not configured',
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const kpis = [
    {
      id: 'marts',
      label: 'Total Rural Marts',
      value: `${totalMartsCount}`,
      badge: 'Active',
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/15 dark:border-[#A3E6C5]/20',
      comparison: 'Operational across districts',
      icon: Store,
      tooltip: 'Operational Rural Mart outposts currently configured in system settings.',
    },
    {
      id: 'users',
      label: 'Active Admin Users',
      value: `${activeUsersCount}`,
      badge: '8 Connected',
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/15 dark:border-[#A3E6C5]/20',
      comparison: '1 pending invite',
      icon: Users,
      tooltip: 'Admin and manager accounts authorized for district oversight.',
    },
    {
      id: 'roles',
      label: 'User Roles',
      value: `${userRolesCount}`,
      badge: 'RBAC Enforced',
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/15 dark:border-[#A3E6C5]/20',
      comparison: '32 permission rules',
      icon: Shield,
      tooltip: 'Configured role-based access control policies across departments.',
    },
    {
      id: 'notifications',
      label: 'Notification Rules',
      value: `${notificationRulesCount}`,
      badge: 'Live Dispatch',
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/15 dark:border-[#A3E6C5]/20',
      comparison: 'Email & In-App Routing',
      icon: Bell,
      tooltip: 'Automated alert rules for low inventory, sync lags, and financial thresholds.',
    },
    {
      id: 'reports',
      label: 'Scheduled Reports',
      value: `${scheduledReportsCount}`,
      badge: 'Auto-Cron',
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/15 dark:border-[#A3E6C5]/20',
      comparison: 'Automated exports active',
      icon: FileClock,
      tooltip: 'Recurring reporting tasks scheduled for automatic email generation.',
    },
    {
      id: 'backup',
      label: 'Last System Backup',
      value: 'Clean',
      badge: '02:30 AM',
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/15 dark:border-[#A3E6C5]/20',
      comparison: 'Cloud SQL Snapshot',
      icon: HardDrive,
      tooltip: 'Latest verified automated Cloud SQL database backup snapshot.',
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
              <span className="text-xl md:text-2xl font-bold text-[#17221D] dark:text-[#E6ECE8] tracking-tight truncate">
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
