import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../navigation/AdminSidebar';
import { AdminHeader } from '../navigation/AdminHeader';
import { CompactSyncStatus } from '../../shared/components/CompactSyncStatus';
import { KpiCards } from '../pages/overview/KpiCards';
import { OverviewMetrics } from '../pages/overview/OverviewMetrics';
import { NetworkPerformanceTrend } from '../pages/overview/NetworkPerformanceTrend';
import { RuralMartPerformance } from '../pages/overview/RuralMartPerformance';
import { MonitoringOverviewTable } from '../pages/overview/MonitoringOverviewTable';
import { AttentionRequiredPanel } from '../pages/overview/AttentionRequiredPanel';
import { MartDetailModal } from '../../shared/components/MartDetailModal';
import { ExportModal } from '../../shared/components/ExportModal';
import { NotificationsPopover } from '../../shared/components/NotificationsPopover';
import { AllAlertsModal } from '../../shared/components/AllAlertsModal';
import { BusinessFinancePage } from '../pages/business/BusinessFinancePage';
import { FarmersOutreachPage } from '../pages/farmers/FarmersOutreachPage';
import { ProductsInventoryPage } from '../pages/inventory/ProductsInventoryPage';
import { RuralMartsPage } from '../pages/marts/RuralMartsPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { PendingRegistrationsPage } from '../pages/PendingRegistrationsPage';

import { GlobalFilters, RuralMartData, AlertStatus, AlertItem, Theme } from '../../shared/types';
import { getAlerts, saveAlerts } from '../../shared/dataServices';
import { getRegistrationApplications } from '../services/registrationService';
import { getLiveRuralMarts } from '../services/ruralMartsService';
import { ArrowLeft, Users, Package, FileText, CheckCircle2, Store } from 'lucide-react';

interface AdminLayoutProps {
  theme: Theme;
  toggleTheme: () => void;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ theme, toggleTheme, onLogout }) => {
  const [activeTab, setActiveTab] = useState<string>('Executive Overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [pendingAppsCount, setPendingAppsCount] = useState(0);

  const refreshPendingAppsCount = async () => {
    try {
      const apps = await getRegistrationApplications();
      setPendingAppsCount(apps.filter((a) => a.status === 'pending').length);
    } catch {
      setPendingAppsCount(0);
    }
  };

  useEffect(() => {
    void refreshPendingAppsCount();
  }, [activeTab]);

  const [filters, setFilters] = useState<GlobalFilters>({
    searchQuery: '',
    district: 'All Districts',
    ruralMart: 'All Rural Marts',
    dateRange: 'Last 30 Days',
    comparisonPeriod: 'Previous Period',
  });

  const [marts, setMarts] = useState<RuralMartData[]>([]);
  const [overviewError, setOverviewError] = useState('');
  const [overviewRefreshKey, setOverviewRefreshKey] = useState(0);
  const [alerts, setAlerts] = useState<AlertItem[]>(() => getAlerts());
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('07 Aug 2026, 3:45 PM');

  useEffect(() => {
    let active = true;
    setAlerts(getAlerts());
    setOverviewError('');
    void getLiveRuralMarts(filters.dateRange)
      .then((rows) => { if (active) setMarts(rows); })
      .catch((reason: unknown) => {
        if (!active) return;
        setMarts([]);
        setOverviewError(reason && typeof reason === 'object' && 'message' in reason
          ? String((reason as { message: unknown }).message)
          : 'Unable to load the Executive Overview.');
      });
    return () => { active = false; };
  }, [activeTab, filters.dateRange, overviewRefreshKey]);

  const [selectedMart, setSelectedMart] = useState<RuralMartData | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [allAlertsModalOpen, setAllAlertsModalOpen] = useState(false);

  const handleSync = () => {
    const now = new Date();
    setLastSyncedTime(now.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    }));
    setOverviewRefreshKey((value) => value + 1);
  };

  const handleReviewAlert = (alertId: string, newStatus: AlertStatus) => {
    setAlerts((prev) => {
      const updated = prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a));
      saveAlerts(updated);
      return updated;
    });
  };

  const filteredMarts = marts.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      m.district.toLowerCase().includes(filters.searchQuery.toLowerCase());
    const matchDistrict = filters.district === 'All Districts' || m.district === filters.district;
    const matchMart =
      filters.ruralMart === 'All Rural Marts' ||
      m.name.toLowerCase().includes(filters.ruralMart.toLowerCase()) ||
      m.id.toLowerCase() === filters.ruralMart.toLowerCase();

    return matchSearch && matchDistrict && matchMart;
  });

  return (
    <div
      className={`min-h-screen flex text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans antialiased ${
        theme === 'dark' ? 'bg-[#0f1713] dark' : 'bg-[#f4f7f5]'
      }`}
    >
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        pendingCount={pendingAppsCount}
      />

      <div
        className={`flex-1 flex flex-col min-w-0 overflow-x-hidden relative transition-all duration-300 ${
          sidebarCollapsed ? 'pl-16' : 'pl-16 md:pl-60'
        }`}
      >
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#121E19]/95 backdrop-blur-md shadow-xs">
          <AdminHeader
            activeTab={activeTab}
            filters={filters}
            setFilters={setFilters}
            theme={theme}
            toggleTheme={toggleTheme}
            onOpenExportModal={() => setExportModalOpen(true)}
            onOpenNotificationsPopover={() => setNotificationsOpen(!notificationsOpen)}
            unreadAlertCount={alerts.filter((a) => a.status === 'New').length}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            onLogout={onLogout}
            adminName="EDF Executive Admin"
            adminRole="Executive Administrator"
          />

          <div className="flex items-center justify-between px-4 bg-[#E7F2EC]/60 dark:bg-[#1B3D30]/40 border-b border-[#DDE6E0] dark:border-[#1E3129] py-1 text-xs">
            <CompactSyncStatus onSync={handleSync} lastSyncedTime={lastSyncedTime} />
          </div>
        </div>

        <NotificationsPopover
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          alerts={alerts}
          onMarkAllRead={() => {
            setAlerts((prev) => prev.map((a) => ({ ...a, status: 'Resolved' })));
          }}
        />

        <main className="flex-1 p-3 md:p-5 space-y-4 max-w-[1600px] w-full mx-auto">
          {activeTab === 'Rural Marts' ? (
            <RuralMartsPage theme={theme} filters={filters} />
          ) : activeTab === 'Business & Finance' ? (
            <BusinessFinancePage theme={theme} filters={filters} setFilters={setFilters} />
          ) : activeTab === 'Farmers & Outreach' ? (
            <FarmersOutreachPage theme={theme} selectedDistrict={filters.district} selectedMart={filters.ruralMart} />
          ) : activeTab === 'Products & Inventory' ? (
            <ProductsInventoryPage
              theme={theme}
              filters={{
                district: filters.district,
                ruralMart: filters.ruralMart,
                dateRange: filters.dateRange,
                comparisonPeriod: filters.comparisonPeriod || 'Previous Period',
              }}
              searchQuery={filters.searchQuery}
              setSearchQuery={(query) => setFilters((prev) => ({ ...prev, searchQuery: query }))}
            />
          ) : activeTab === 'Pending Registrations' ? (
            <PendingRegistrationsPage theme={theme} onUpdatePendingCount={refreshPendingAppsCount} />
          ) : activeTab === 'Reports' ? (
            <ReportsPage theme={theme} filters={filters} setFilters={setFilters} />
          ) : activeTab === 'Settings' ? (
            <SettingsPage theme={theme} />
          ) : activeTab !== 'Executive Overview' ? (
            <div className="bg-white dark:bg-emerald-950/70 border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-900/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                    {activeTab === 'Farmers & Outreach' && <Users className="w-6 h-6" />}
                    {activeTab === 'Products & Inventory' && <Package className="w-6 h-6" />}
                    {activeTab === 'Rural Marts' && <Store className="w-6 h-6" />}
                    {activeTab === 'Reports' && <FileText className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-emerald-50">{activeTab} Management</h2>
                    <p className="text-xs text-slate-500 dark:text-emerald-400">
                      Detailed telemetry, reporting, and operational tools for {activeTab.toLowerCase()}.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('Executive Overview')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 text-white font-bold text-xs shadow hover:bg-emerald-900"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Executive Overview
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30">
                  <span className="text-xs text-slate-500">Active Module</span>
                  <p className="text-base font-bold text-slate-900 dark:text-emerald-100 mt-1">{activeTab} Data Sync</p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-2">
                    <CheckCircle2 className="w-3 h-3" /> Transmitting Live
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30">
                  <span className="text-xs text-slate-500">Total Records</span>
                  <p className="text-base font-bold text-slate-900 dark:text-emerald-100 mt-1 font-mono">18,420 Entries</p>
                  <span className="text-[10px] text-slate-400 mt-2 block">Updated 10 mins ago</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30">
                  <span className="text-xs text-slate-500">Compliance Rate</span>
                  <p className="text-base font-bold text-emerald-700 dark:text-emerald-300 mt-1 font-mono">94.2%</p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 block">Meets NABARD Standard</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {overviewError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  {overviewError}
                </div>
              )}
              <section aria-label="Key Performance Indicators">
                <KpiCards marts={filteredMarts} />
              </section>
              <section aria-label="Network Activity Highlights and Impact">
                <OverviewMetrics dateRange={filters.dateRange} marts={filteredMarts} />
              </section>
              <section aria-label="Network Trends and Mart Performance" className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <NetworkPerformanceTrend theme={theme} />
                <RuralMartPerformance marts={filteredMarts} theme={theme} />
              </section>
              <section aria-label="Monitoring Overview and Attention Required" className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <div className="lg:col-span-8">
                  <MonitoringOverviewTable
                    marts={filteredMarts}
                    onSelectMart={(m) => setSelectedMart(m)}
                    searchQuery={filters.searchQuery}
                    setSearchQuery={(q) => setFilters((prev) => ({ ...prev, searchQuery: q }))}
                    districtFilter={filters.district}
                    setDistrictFilter={(d) => setFilters((prev) => ({ ...prev, district: d }))}
                  />
                </div>
                <div className="lg:col-span-4">
                  <AttentionRequiredPanel
                    alerts={alerts}
                    onReviewAlert={handleReviewAlert}
                    onOpenAllAlertsModal={() => setAllAlertsModalOpen(true)}
                  />
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      <MartDetailModal mart={selectedMart} onClose={() => setSelectedMart(null)} />
      <ExportModal isOpen={exportModalOpen} onClose={() => setExportModalOpen(false)} marts={filteredMarts} />
      <AllAlertsModal
        isOpen={allAlertsModalOpen}
        onClose={() => setAllAlertsModalOpen(false)}
        alerts={alerts}
        onReviewAlert={handleReviewAlert}
      />
    </div>
  );
}
