import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  ShieldCheck,
  LogOut,
  UserCheck,
  Store,
  Sparkles,
} from 'lucide-react';

interface OwnerHeaderProps {
  activeTab: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onSwitchToAdmin: () => void;
  onLogout: () => void;
  ownerName?: string;
  martName?: string;
}

export const OwnerHeader: React.FC<OwnerHeaderProps> = ({
  activeTab,
  searchQuery,
  setSearchQuery,
  dateRange,
  setDateRange,
  theme,
  toggleTheme,
  unreadCount,
  onOpenNotifications,
  onSwitchToAdmin,
  onLogout,
  ownerName = 'Rajesh Kumar',
  martName = 'Green Valley Mart',
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const dateRanges = ['Tue, Aug 4, 2026', 'Today', 'Last 7 Days', 'Last 30 Days', 'This Month (Aug 2026)'];

  return (
    <header className="bg-white/95 dark:bg-[#121E19]/95 backdrop-blur-md border-b border-[#DDE6E0] dark:border-[#1E3129] px-4 md:px-6 py-2.5 transition-colors duration-150 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Left Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#17221D] dark:text-[#E6ECE8]">
              Owner Dashboard
            </h1>
            <p className="text-xs font-medium text-[#66736C] dark:text-[#8E9E96]">
              Welcome back.
            </p>
          </div>
        </div>

        {/* Right Controls Bar */}
        <div className="flex flex-wrap items-center gap-2 md:gap-2.5">
          
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, records, farmers..."
              className="h-8 w-48 sm:w-64 pl-8 pr-3 text-xs font-medium rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-1 focus:ring-[#174F3A] placeholder-[#8A958F]"
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A958F] dark:text-[#61736A] pointer-events-none" />
          </div>

          {/* Date Selector */}
          <div className="relative">
            <div className="flex items-center">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
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

          {/* Light/Dark Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] hover:bg-[#F1F6F3] dark:hover:bg-[#182921] text-[#17221D] dark:text-[#E6ECE8] transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#17221D]" />}
          </button>

          {/* Notification Bell Icon with Red Badge */}
          <button
            onClick={onOpenNotifications}
            className="h-8 w-8 flex items-center justify-center relative rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] hover:bg-[#F1F6F3] dark:hover:bg-[#182921] text-[#17221D] dark:text-[#E6ECE8] transition-colors cursor-pointer"
            title="Mart Alerts & Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#DC2626] text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Block */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="h-9 flex items-center gap-2 pl-1.5 pr-2 rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] hover:bg-[#F1F6F3] dark:hover:bg-[#182921] transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#174F3A] text-white font-bold text-xs flex items-center justify-center shrink-0 border border-[#103A2B]/20">
                RK
              </div>
              <div className="flex flex-col text-left hidden sm:flex">
                <span className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] leading-tight">
                  {ownerName}
                </span>
                <span className="text-[9px] font-bold tracking-wider text-[#66736C] dark:text-[#8E9E96]">
                  RURAL MART OWNER
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-[#8A958F] ml-0.5" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl shadow-lg py-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-[#E9EFEB] dark:border-[#16241E]">
                  <p className="font-bold text-[#17221D] dark:text-[#E6ECE8]">{ownerName}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#174F3A] dark:text-[#A3E6C5]">RURAL MART OWNER</p>
                  <p className="text-[11px] text-[#66736C] dark:text-[#8E9E96]">{martName}</p>
                </div>

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
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
