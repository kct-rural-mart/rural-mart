import React, { useState, useMemo } from 'react';
import { OwnerSidebar } from '../navigation/OwnerSidebar';
import { OwnerHeader } from '../navigation/OwnerHeader';
import { OwnerDashboardPage } from '../pages/OwnerDashboardPage';
import { DailyBusinessPage } from '../pages/DailyBusinessPage';
import { ProductInventoryPage } from '../pages/ProductInventoryPage';
import { FarmerOutreachPage } from '../pages/FarmerOutreachPage';
import { FinancialDashboardPage } from '../pages/FinancialDashboardPage';
import { OwnerSettingsPage } from '../pages/OwnerSettingsPage';
import { CompactSyncStatus } from '../../shared/components/CompactSyncStatus';
import { NotificationsPopover } from '../../shared/components/NotificationsPopover';
// import { INITIAL_ALERTS } from '../../mockData'; // Removed mock data
// import { getRuralMartById, getRuralMarts, getOwnerById, getOwners } from '../../shared/dataServices';

interface OwnerLayoutProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onSwitchToAdmin: () => void;
  onLogout: () => void;
  ownerEmail?: string;
}

export const OwnerLayout: React.FC<OwnerLayoutProps> = ({
  theme,
  toggleTheme,
  onSwitchToAdmin,
  onLogout,
  ownerEmail,
}) => {
  const [activeTab, setActiveTab] = useState<string>('Overall Dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [lastSyncedTime, setLastSyncedTime] = useState('Today, 03:45 PM');

  // Load canonical Rural Mart and Owner from shared data layer
  const currentMart: any = useMemo(() => {
    // TODO: Connect to backend. For now, return null to show empty state.
    return null;
  }, [ownerEmail]);

  const currentOwner: any = useMemo(() => {
    return null;
  }, [currentMart]);

  const displayMartName = currentMart?.ruralMartName || '—';
  const displayOwnerName = currentOwner?.ownerName || '—';

  // Modals & Popovers
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Sync simulation
  const handleSync = () => {
    const now = new Date();
    setLastSyncedTime(`Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  };

  return (
    <div
      className={`min-h-screen flex text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans antialiased ${
        theme === 'dark' ? 'bg-[#0f1713] dark' : 'bg-[#f4f7f5]'
      }`}
    >
      {/* Owner Navigation Sidebar */}
      <OwnerSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        martName={displayMartName}
        ownerName={displayOwnerName}
      />

      {/* Main Content Viewport */}
      <div
        className={`flex-1 flex flex-col min-w-0 overflow-x-hidden relative transition-all duration-300 ${
          sidebarCollapsed ? 'pl-16' : 'pl-16 md:pl-60'
        }`}
      >
        {/* Fixed Header Bar Stack */}
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#121E19]/95 backdrop-blur-md shadow-xs">
          <OwnerHeader
            activeTab={activeTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            dateRange={dateRange}
            setDateRange={setDateRange}
            theme={theme}
            toggleTheme={toggleTheme}
            unreadCount={alerts.filter((a) => a.status === 'New').length}
            onOpenNotifications={() => setNotificationsOpen(!notificationsOpen)}
            onSwitchToAdmin={onSwitchToAdmin}
            onLogout={onLogout}
            ownerName={displayOwnerName}
            martName={displayMartName}
          />

          {/* Compact Telemetry Status Bar */}
          <CompactSyncStatus onSync={handleSync} lastSyncedTime={lastSyncedTime} />
        </div>

        {/* Notifications Popover Dropdown */}
        <NotificationsPopover
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          alerts={alerts}
          onMarkAllRead={() => {
            setAlerts((prev) => prev.map((a) => ({ ...a, status: 'Resolved' })));
          }}
        />

        {/* Main Workspace Render */}
        <main className="flex-1 p-3 md:p-5 space-y-4 max-w-[1600px] w-full mx-auto">
          {(!currentMart) && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 text-center shadow-sm mb-4">
              <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">Backend not connected — displaying dashboard structure only.</p>
            </div>
          )}

          {(activeTab === 'Overall Dashboard') && (
            <OwnerDashboardPage
              theme={theme}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenRecordSaleModal={() => setActiveTab('Daily Business')}
              onOpenAddFarmerModal={() => setActiveTab('Farmer Outreach')}
            />
          )}

          {(activeTab === 'Daily Business') && (
            <DailyBusinessPage
              theme={theme}
              searchQuery={searchQuery}
            />
          )}

          {(activeTab === 'Product & Inventory') && (
            <ProductInventoryPage
              theme={theme}
              searchQuery={searchQuery}
            />
          )}

          {(activeTab === 'Farmer Outreach') && (
            <FarmerOutreachPage
              theme={theme}
              searchQuery={searchQuery}
            />
          )}

          {(activeTab === 'Financial Dashboard') && (
            <FinancialDashboardPage
              theme={theme}
            />
          )}

          {(activeTab === 'Settings') && (
            <OwnerSettingsPage
              theme={theme}
            />
          )}
        </main>
      </div>
    </div>
  );
};
