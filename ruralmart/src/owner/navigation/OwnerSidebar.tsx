import React, { useState } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Package,
  TrendingUp,
  Settings,
  Menu,
  Store,
  ShieldCheck,
} from 'lucide-react';

interface OwnerSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  martName?: string;
  ownerName?: string;
}

export const OwnerSidebar: React.FC<OwnerSidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  martName = '—',
  ownerName = '—',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const navItems = [
    { id: 'Overall Dashboard', label: 'Overall Dashboard', icon: LayoutDashboard },
    { id: 'Daily Business', label: 'Daily Business', icon: Briefcase },
    { id: 'Product & Inventory', label: 'Product & Inventory', icon: Package },
    { id: 'Farmer Outreach', label: 'Farmer Outreach', icon: Users },
    { id: 'Financial Dashboard', label: 'Financial Dashboard', icon: TrendingUp },
    { id: 'Settings', label: 'Settings', icon: Settings },
  ];

  const isExpanded = !collapsed || isHovered;

  return (
    <>
      {/* Invisible backdrop when expanded on hover over content */}
      {collapsed && isHovered && (
        <div
          onClick={() => setIsHovered(false)}
          className="fixed inset-0 bg-[#17221D]/20 backdrop-blur-[1px] z-30 transition-opacity duration-200"
        />
      )}

      <aside
        onMouseEnter={() => collapsed && setIsHovered(true)}
        onMouseLeave={() => collapsed && setIsHovered(false)}
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out border-r ${
          isExpanded ? 'w-60 shadow-2xl' : 'w-16 shadow-sm'
        } bg-white/95 dark:bg-[#121E19]/95 backdrop-blur-md border-[#DDE6E0] dark:border-[#1E3129] text-[#17221D] dark:text-[#E6ECE8]`}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center px-3.5 border-b border-[#DDE6E0] dark:border-[#1E3129]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {!isExpanded ? (
              <button
                onClick={() => setCollapsed(!collapsed)}
                onMouseEnter={() => setIsHovered(true)}
                className="w-9 h-9 rounded-xl bg-[#174F3A] hover:bg-[#103A2B] dark:bg-[#1B3D30] dark:hover:bg-[#234F3F] text-white dark:text-[#A3E6C5] flex items-center justify-center shrink-0 shadow-xs border border-[#103A2B]/20 dark:border-[#A3E6C5]/20 transition-all cursor-pointer"
                title="Expand Navigation Menu"
              >
                <Menu className="w-5 h-5 text-white dark:text-[#A3E6C5]" />
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="w-9 h-9 rounded-xl bg-[#174F3A] dark:bg-[#1B3D30] text-white dark:text-[#A3E6C5] font-bold flex items-center justify-center shrink-0 shadow-xs border border-[#103A2B]/20 dark:border-[#A3E6C5]/20 hover:opacity-90 transition-opacity cursor-pointer"
                  title="Collapse menu"
                >
                  <Store className="w-4 h-4 text-white dark:text-[#A3E6C5]" />
                </button>
                <div className="flex flex-col min-w-0 transition-opacity duration-200">
                  <span className="font-bold text-sm text-[#17221D] dark:text-[#E6ECE8] truncate tracking-tight">
                    {martName}
                  </span>
                  <span className="text-[11px] text-[#567568] dark:text-[#8E9E96] font-medium truncate">
                    Owner Dashboard
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (isHovered) setIsHovered(false);
                }}
                title={!isExpanded ? item.label : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative group cursor-pointer ${
                  isActive
                    ? 'bg-[#E7F2EC] dark:bg-[#1B3D30] text-[#103A2B] dark:text-[#A3E6C5] font-bold shadow-xs border-l-4 border-[#174F3A] dark:border-[#A3E6C5]'
                    : 'text-[#66736C] dark:text-[#8E9E96] hover:bg-[#F1F6F3] dark:hover:bg-[#182921] hover:text-[#17221D] dark:hover:text-[#E6ECE8]'
                } ${!isExpanded ? 'justify-center px-0 border-l-0' : ''}`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                    isActive ? 'text-[#103A2B] dark:text-[#A3E6C5]' : 'text-[#66736C] dark:text-[#8E9E96]'
                  }`}
                />
                {isExpanded && <span className="truncate tracking-tight">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer Navigation Utilities & Store Selector */}
        <div className="p-2 border-t border-[#DDE6E0] dark:border-[#1E3129] space-y-2">
          {/* Store Selector Footer Block */}
          <div className={`p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] flex items-center gap-2.5 ${!isExpanded ? 'justify-center p-2' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-[#174F3A] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Store className="w-4 h-4 text-[#A3E6C5]" />
            </div>
            {isExpanded && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] truncate">
                  Green Valley Mart
                </div>
                <div className="text-[10px] font-medium text-[#66736C] dark:text-[#8E9E96] truncate">
                  Store ID: #GV001
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
