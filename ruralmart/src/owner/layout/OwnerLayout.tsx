import React, { useEffect, useState } from 'react';
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
import { useAuth } from '../../auth/context/AuthContext';
import { getOwnerRuralMart, OwnerRuralMart } from '../services/martService';

function readableMartError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    const value = error as { message?: string; details?: string; hint?: string; code?: string };
    const detail = [value.message, value.details, value.hint, value.code ? `Code: ${value.code}` : '']
      .filter(Boolean)
      .join(' — ');
    if (detail) return detail;
  }
  return 'Unable to load the Rural Mart.';
}

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
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('Overall Dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [lastSyncedTime, setLastSyncedTime] = useState('Today, 03:45 PM');

  const [currentMart, setCurrentMart] = useState<OwnerRuralMart | null>(null);
  const [martError, setMartError] = useState('');

  useEffect(() => {
    let active = true;
    if (!profile?.rural_mart_id) return;
    setMartError('');
    void getOwnerRuralMart(profile.rural_mart_id)
      .then((mart) => {
        if (active) setCurrentMart(mart);
      })
      .catch((error: unknown) => {
        if (active) setMartError(readableMartError(error));
      });
    return () => {
      active = false;
    };
  }, [profile?.rural_mart_id]);

  const displayMartName = currentMart?.mart_name || 'Your Rural Mart';
  const displayOwnerName = currentMart?.entrepreneur_name || ownerEmail || 'Mart Owner';

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
          {martError && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 text-center shadow-sm mb-4">
              <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">{martError}</p>
            </div>
          )}

          {(activeTab === 'Overall Dashboard') && (
            <OwnerDashboardPage
              currentMartId={profile?.rural_mart_id}
              theme={theme}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenRecordSaleModal={() => setActiveTab('Daily Business')}
              onOpenAddFarmerModal={() => setActiveTab('Farmer Outreach')}
            />
          )}

          {(activeTab === 'Daily Business') && (
            <DailyBusinessPage
              currentMartId={profile?.rural_mart_id}
              theme={theme}
              searchQuery={searchQuery}
              dateRange={dateRange}
            />
          )}

          {(activeTab === 'Product & Inventory') && (
            <ProductInventoryPage
              currentMartId={profile?.rural_mart_id}
              theme={theme}
              searchQuery={searchQuery}
            />
          )}

          {(activeTab === 'Farmer Outreach') && (
            <FarmerOutreachPage
              currentMartId={profile?.rural_mart_id}
              theme={theme}
              searchQuery={searchQuery}
              dateRange={dateRange}
            />
          )}

          {(activeTab === 'Financial Dashboard') && (
            <FinancialDashboardPage
              currentMartId={profile?.rural_mart_id}
              theme={theme}
            />
          )}

          {(activeTab === 'Settings') && (
            <OwnerSettingsPage
              currentMartId={profile?.rural_mart_id}
              theme={theme}
            />
          )}
        </main>
      </div>
    </div>
  );
};
