import React, { useState, useMemo } from 'react';
import {
  Filter,
  Calendar,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Check,
  LogOut,
} from 'lucide-react';
import { GlobalFilters, Theme } from '../../shared/types';
import { getReportsRuralMarts } from '../../shared/dataServices';

interface AdminHeaderProps {
  activeTab?: string;
  filters: GlobalFilters;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilters>>;
  theme: Theme;
  toggleTheme: () => void;
  onOpenExportModal: () => void;
  onOpenNotificationsPopover: () => void;
  unreadAlertCount: number;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onLogout?: () => void;
  adminName?: string;
  adminRole?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab = 'Executive Overview',
  filters,
  setFilters,
  theme,
  toggleTheme,
  onOpenExportModal,
  onOpenNotificationsPopover,
  unreadAlertCount,
  sidebarCollapsed,
  onToggleSidebar,
  onLogout,
  adminName = 'EDF Executive Admin',
  adminRole = 'Executive Administrator',
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const allMarts = getReportsRuralMarts();
  const districtList: string[] = ['All Districts', ...Array.from(new Set(allMarts.map((m: any) => m.district as string)))];
  const currentDistrictMarts =
    filters.district === 'All Districts' ? allMarts : allMarts.filter((m: any) => m.district === filters.district);

  const dateRanges = ['Last 30 Days', 'This Quarter (Q3)', 'Financial Year 2026-27', 'Year to Date 2026'];
  const comparisonPeriods = ['vs Previous Month', 'vs Previous Quarter', 'vs Previous Year', 'vs Budget Target'];

  // Title dynamic selection
  const getPageHeader = () => {
    return {
      title: activeTab,
      description: '',
      badge: '',
    };
  };

  const { title, description, badge } = getPageHeader();

  return (
    <header className="bg-white/95 dark:bg-[#121E19]/95 backdrop-blur-md border-b border-[#DDE6E0] dark:border-[#1E3129] px-4 md:px-6 py-2.5 transition-colors duration-150 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Hamburger & Page Title */}
        <div className="flex items-center gap-3">


          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#17221D] dark:text-[#E6ECE8]">
                {title}
              </h1>
            </div>
          </div>
        </div>

        {/* Global Controls & Action Bar */}
        <div className="flex flex-wrap items-center gap-2 md:gap-2">

          {/* All Districts Filter */}
          <div className="relative">
            <select
              value={filters.district}
              onChange={(e) => setFilters((prev: any) => ({ ...prev, district: e.target.value, ruralMart: 'All Rural Marts' }))}
              className="h-8 appearance-none pl-3 pr-7 text-xs font-medium rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-1 focus:ring-[#174F3A] cursor-pointer"
            >
              {districtList.map((dst) => (
                <option key={dst} value={dst} className="bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8]">
                  {dst}
                </option>
              ))}
            </select>
            <Filter className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-[#8A958F] dark:text-[#61736A] pointer-events-none" />
          </div>

          {/* Date Range Selector */}
          <div className="relative">
            <div className="flex items-center">
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters((prev: any) => ({ ...prev, dateRange: e.target.value }))}
                className="h-8 appearance-none pl-7 pr-7 text-xs font-medium rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-1 focus:ring-[#174F3A] cursor-pointer"
              >
                {dateRanges.map((range) => (
                  <option key={range} value={range} className="bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8]">
                    {range}
                  </option>
                ))}
              </select>
              <Calendar className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-[#8A958F] dark:text-[#61736A] pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-[#8A958F] dark:text-[#61736A] pointer-events-none" />
            </div>
          </div>

          {/* Notification Button */}
          <button
            onClick={onOpenNotificationsPopover}
            className="h-8 w-8 flex items-center justify-center relative rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] hover:bg-[#F1F6F3] dark:hover:bg-[#182921] text-[#17221D] dark:text-[#E6ECE8] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#DC2626] text-white text-[9px] font-bold flex items-center justify-center">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* Light / Dark Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] hover:bg-[#F1F6F3] dark:hover:bg-[#182921] text-[#17221D] dark:text-[#E6ECE8] transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#17221D]" />}
          </button>

          {/* Admin Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="h-8 flex items-center gap-2 pl-1.5 pr-2 rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] hover:bg-[#F1F6F3] dark:hover:bg-[#182921] transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-[#174F3A] text-white font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#103A2B]/20">
                EA
              </div>
              <div className="flex flex-col text-left hidden sm:flex">
                <span className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] leading-tight">
                  {adminName}
                </span>
                <span className="text-[9px] font-semibold text-[#66736C] dark:text-[#8E9E96]">
                  {adminRole}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-[#8A958F] ml-0.5" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl shadow-lg py-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-[#E9EFEB] dark:border-[#16241E]">
                  <p className="font-bold text-[#17221D] dark:text-[#E6ECE8]">{adminName}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#174F3A] dark:text-[#A3E6C5]">{adminRole}</p>
                  <p className="text-[11px] text-[#66736C] dark:text-[#8E9E96]">admin@ruralmart.in</p>
                </div>
                {onLogout && (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-[#3D1717] flex items-center gap-2 cursor-pointer border-t border-[#E9EFEB] dark:border-[#16241E]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
