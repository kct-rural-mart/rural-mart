import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Package,
  Store,
  FileText,
  Settings,
  Menu,
  ClipboardList,
} from 'lucide-react';
import { getApplications } from '../../lib/storageService';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  pendingCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  pendingCount,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [localPendingCount, setLocalPendingCount] = useState(0);

  useEffect(() => {
    if (pendingCount !== undefined) {
      setLocalPendingCount(pendingCount);
    } else {
      const apps = getApplications();
      setLocalPendingCount(apps.filter((a: any) => a.status === 'pending').length);
    }
  }, [pendingCount, activeTab]);

  const navItems = [
    { id: 'Executive Overview', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'Rural Marts', label: 'Rural Marts', icon: Store },
    { id: 'Business & Finance', label: 'Business & Finance', icon: Briefcase },
    { id: 'Farmers & Outreach', label: 'Farmers & Outreach', icon: Users },
    { id: 'Products & Inventory', label: 'Products & Inventory', icon: Package },
    { id: 'Pending Registrations', label: 'Pending Registrations', icon: ClipboardList, badge: localPendingCount },
    { id: 'Reports', label: 'Reports', icon: FileText },
  ];

  // Determine if sidebar should be temporarily expanded via hover
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
                  className="w-9 h-9 rounded-xl bg-[#174F3A] dark:bg-[#1B3D30] text-white dark:text-[#A3E6C5] font-bold flex items-center justify-center shrink-0 shadow-xs border border-[#103A2B]/20 dark:border-[#A3E6C5]/20 hover:opacity-90 transition-opacity"
                  title="Collapse menu"
                >
                  <span className="text-xs tracking-wider">RM</span>
                </button>
                <div className="flex flex-col min-w-0 transition-opacity duration-200">
                  <span className="font-bold text-sm text-[#17221D] dark:text-[#E6ECE8] truncate tracking-tight">
                    EDF Rural Mart
                  </span>
                  <span className="text-[11px] text-[#567568] dark:text-[#8E9E96] font-medium truncate">
                    Admin Monitoring
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
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative group ${
                  isActive
                    ? 'bg-[#E7F2EC] dark:bg-[#1B3D30] text-[#103A2B] dark:text-[#A3E6C5] font-bold shadow-xs border-l-4 border-[#174F3A] dark:border-[#A3E6C5]'
                    : 'text-[#66736C] dark:text-[#8E9E96] hover:bg-[#F1F6F3] dark:hover:bg-[#182921] hover:text-[#17221D] dark:hover:text-[#E6ECE8]'
                } ${!isExpanded ? 'justify-center px-0 border-l-0' : ''}`}
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <Icon className={`w-4 h-4 transition-transform duration-150 group-hover:scale-110 ${isActive ? 'text-[#103A2B] dark:text-[#A3E6C5]' : 'text-[#66736C] dark:text-[#8E9E96]'}`} />
                  {!isExpanded && item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-600 dark:bg-[#A3E6C5]" />
                  )}
                </div>
                {isExpanded && <span className="truncate tracking-tight">{item.label}</span>}
                {isExpanded && item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-[#174F3A] dark:bg-[#A3E6C5] text-white dark:text-[#103A2B] text-[10px] font-bold leading-none">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Navigation Utilities */}
        <div className="p-2 border-t border-[#DDE6E0] dark:border-[#1E3129]">
          <button
            onClick={() => {
              setActiveTab('Settings');
              if (isHovered) setIsHovered(false);
            }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 group ${
              activeTab === 'Settings'
                ? 'bg-[#E7F2EC] dark:bg-[#1B3D30] text-[#103A2B] dark:text-[#A3E6C5] font-bold'
                : 'text-[#66736C] dark:text-[#8E9E96] hover:bg-[#F1F6F3] dark:hover:bg-[#182921] hover:text-[#17221D] dark:hover:text-[#E6ECE8]'
            } ${!isExpanded ? 'justify-center px-0' : ''}`}
            title="Settings"
          >
            <Settings className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:rotate-45 ${activeTab === 'Settings' ? 'text-[#103A2B] dark:text-[#A3E6C5]' : 'text-[#66736C] dark:text-[#8E9E96]'}`} />
            {isExpanded && <span>Settings</span>}
            {activeTab === 'Settings' && isExpanded && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#174F3A] dark:bg-[#A3E6C5]" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
