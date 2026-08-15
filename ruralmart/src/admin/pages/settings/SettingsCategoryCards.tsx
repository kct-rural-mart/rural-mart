import React from 'react';
import {
  Users,
  Shield,
  Bell,
  FileText,
  Sliders,
  ArrowRight,
  CheckCircle,
  FileSpreadsheet,
  Globe,
  Clock,
  Calendar,
  SunMoon,
} from 'lucide-react';
import {
  AdminUserItem,
  NotificationSettingsState,
  ReportSettingsState,
  SystemPreferencesState,
  Theme,
} from '../../../shared/types';

interface SettingsCategoryCardsProps {
  theme: Theme;
  notifications: NotificationSettingsState;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationSettingsState>>;
  reportSettings: ReportSettingsState;
  setReportSettings: React.Dispatch<React.SetStateAction<ReportSettingsState>>;
  systemPreferences: SystemPreferencesState;
  setSystemPreferences: React.Dispatch<React.SetStateAction<SystemPreferencesState>>;
  adminUsers?: AdminUserItem[];
  onOpenUserManagementModal: () => void;
  onOpenRoleModal: () => void;
  onOpenScheduleModal: () => void;
  onTriggerToast: (title: string, message: string) => void;
}

export const SettingsCategoryCards: React.FC<SettingsCategoryCardsProps> = ({
  notifications,
  setNotifications,
  reportSettings,
  setReportSettings,
  systemPreferences,
  setSystemPreferences,
  adminUsers = [],
  onOpenUserManagementModal,
  onOpenRoleModal,
  onOpenScheduleModal,
  onTriggerToast,
}) => {
  const totalAdminCount = adminUsers.length || 1;
  const activeAdminCount = adminUsers.filter((u) => u.status === 'Active').length || 1;
  // Toggle handler for Notification switches
  const handleToggleNotification = (key: keyof NotificationSettingsState) => {
    setNotifications((prev) => {
      const updated = !prev[key];
      const labels: Record<keyof NotificationSettingsState, string> = {
        emailNotifications: 'Email Notifications',
        lowStockAlerts: 'Low Stock Alerts',
        salesDeclineAlerts: 'Sales Decline Alerts',
        dataUpdateReminders: 'Data Update Reminders',
        martApprovalNotifications: 'Rural Mart Approval Notifications',
      };
      onTriggerToast(
        'Notification Rule Updated',
        `${labels[key]} turned ${updated ? 'ON' : 'OFF'}.`
      );
      return { ...prev, [key]: updated };
    });
  };

  // Toggle handler for Report Toggles
  const handleToggleReportSetting = (key: keyof ReportSettingsState) => {
    if (key === 'defaultFormat') return;
    setReportSettings((prev) => {
      const updated = !prev[key];
      onTriggerToast(
        'Report Setting Saved',
        `${key} automated generation set to ${updated ? 'Enabled' : 'Disabled'}.`
      );
      return { ...prev, [key]: updated };
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* CARD 1 — User & Role Management */}
      <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  User & Role Management
                </h3>
              </div>
            </div>
          </div>

          {/* Key Metrics Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-emerald-400/70 block">
                Total Admin Users
              </span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white mt-1 block">
                {totalAdminCount}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-emerald-400/70 block">
                Active Users
              </span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
                {activeAdminCount}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-emerald-400/70 block">
                User Roles
              </span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white mt-1 block">
                0
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-emerald-400/70 block">
                Permissions
              </span>
              <span className="text-base font-extrabold text-slate-500 dark:text-emerald-400 mt-1 block">
                0
              </span>
            </div>
          </div>

          {/* Quick Details List */}
          <div className="space-y-2 pt-1 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-emerald-900/20">
              <span className="text-slate-500 dark:text-emerald-400/80">Super Admin Accounts:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">1 Account (admin@ruralmart.in)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-emerald-900/20">
              <span className="text-slate-500 dark:text-emerald-400/80">District Managers:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">Not configured</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-emerald-900/20">
              <span className="text-slate-500 dark:text-emerald-400/80">Auditors & Mart Managers:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">Not configured</span>
            </div>
          </div>
        </div>

        {/* Card Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-emerald-900/40 flex items-center gap-3">
          <button
            onClick={onOpenUserManagementModal}
            className="flex-1 px-3 py-2 rounded-xl bg-emerald-800 dark:bg-emerald-700 hover:bg-emerald-900 dark:hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <span>Manage Users</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenRoleModal}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-emerald-900/40 hover:bg-slate-200 dark:hover:bg-emerald-800/50 text-slate-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-slate-200 dark:border-emerald-800/60"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Manage Roles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CARD 2 — Notification Settings */}
      <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Notification Settings
                </h3>
              </div>
            </div>
          </div>

          {/* Toggle Switches List */}
          <div className="space-y-3">
            {[
              {
                key: 'emailNotifications',
                label: 'Email Notifications',
                desc: 'Receive digest summaries & system alerts via primary email',
              },
              {
                key: 'lowStockAlerts',
                label: 'Low Stock Alerts',
                desc: 'Alert when product inventory dips below critical minimum threshold',
              },
              {
                key: 'salesDeclineAlerts',
                label: 'Sales Decline Alerts',
                desc: 'Trigger notice when weekly mart revenue falls by >15%',
              },
              {
                key: 'dataUpdateReminders',
                label: 'Data Update Reminders',
                desc: 'Nudge District Managers for delayed stock & sales log syncs',
              },
              {
                key: 'martApprovalNotifications',
                label: 'Rural Mart Approval Notifications',
                desc: 'Immediate dispatch on new mart onboarding or grant status changes',
              },
            ].map((item) => {
              const k = item.key as keyof NotificationSettingsState;
              const isChecked = notifications[k];
              return (
                <div
                  key={item.key}
                  onClick={() => handleToggleNotification(k)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30 hover:bg-slate-100/80 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer select-none"
                >
                  <div className="pr-3">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-emerald-400/70">
                      {item.desc}
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <div
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
                      isChecked
                        ? 'bg-emerald-700 dark:bg-emerald-600'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        isChecked ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-2 text-[11px] text-slate-500 dark:text-emerald-400/70 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Notification preferences will apply when notification services are configured.</span>
        </div>
      </div>

      {/* CARD 3 — Report Settings */}
      <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Report Settings
                </h3>
              </div>
            </div>
          </div>

          {/* Default Format Selection */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30 space-y-2">
            <label className="text-xs font-bold text-slate-800 dark:text-emerald-200 flex items-center justify-between">
              <span>Default Export Format</span>
              <span className="text-[11px] font-normal text-slate-500 dark:text-emerald-400">
                Applied to quick downloads
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setReportSettings((prev) => ({ ...prev, defaultFormat: 'PDF' }));
                  onTriggerToast('Default Format Updated', 'Default download format set to PDF.');
                }}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
                  reportSettings.defaultFormat === 'PDF'
                    ? 'bg-emerald-800 text-white border-emerald-800 dark:bg-emerald-600 dark:border-emerald-500 shadow-xs'
                    : 'bg-white dark:bg-emerald-950/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-emerald-800 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>PDF Format</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setReportSettings((prev) => ({ ...prev, defaultFormat: 'Excel' }));
                  onTriggerToast('Default Format Updated', 'Default download format set to Excel (.xlsx).');
                }}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
                  reportSettings.defaultFormat === 'Excel'
                    ? 'bg-emerald-800 text-white border-emerald-800 dark:bg-emerald-600 dark:border-emerald-500 shadow-xs'
                    : 'bg-white dark:bg-emerald-950/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-emerald-800 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Excel (.XLSX)</span>
              </button>
            </div>
          </div>

          {/* Scheduled Report Frequency Toggles */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Automated Periodic Compilations
            </span>

            {[
              {
                key: 'scheduledReports',
                label: 'Master Scheduled Engine',
                badge: 'Core Service',
              },
              {
                key: 'monthlyReports',
                label: 'Monthly Network Performance Reports',
                badge: '1st of Month',
              },
              {
                key: 'quarterlyReports',
                label: 'Quarterly Audit & Grant Balance Sheet',
                badge: 'End of Quarter',
              },
              {
                key: 'yearlyReports',
                label: 'Yearly Financial & Impact Statements',
                badge: 'Annual March',
              },
            ].map((item) => {
              const k = item.key as keyof ReportSettingsState;
              if (k === 'defaultFormat') return null;
              const isChecked = reportSettings[k] as boolean;

              return (
                <div
                  key={item.key}
                  onClick={() => handleToggleReportSetting(k)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30 hover:bg-slate-100/80 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {item.label}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-200 dark:bg-emerald-900/60 text-slate-700 dark:text-emerald-300">
                      {item.badge}
                    </span>
                  </div>

                  <div
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 ${
                      isChecked
                        ? 'bg-emerald-700 dark:bg-emerald-600'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        isChecked ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-emerald-900/40 flex items-center gap-3">
          <button
            onClick={onOpenScheduleModal}
            className="flex-1 px-3 py-2 rounded-xl bg-emerald-800 dark:bg-emerald-700 hover:bg-emerald-900 dark:hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Configure Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onTriggerToast('Report Center', 'Navigating to Available Reports...')}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-emerald-900/40 hover:bg-slate-200 dark:hover:bg-emerald-800/50 text-slate-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-slate-200 dark:border-emerald-800/60"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Manage Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CARD 4 — System Preferences */}
      <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  System Preferences
                </h3>
              </div>
            </div>
          </div>

          {/* Form Controls Grid */}
          <div className="space-y-3">
            {/* Default Theme Option */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30">
              <div className="flex items-center gap-2">
                <SunMoon className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Default Theme
                </span>
              </div>
              <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-emerald-900/60 p-1 rounded-lg">
                {(['Light', 'Dark', 'System'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setSystemPreferences((prev) => ({ ...prev, defaultTheme: t }));
                      onTriggerToast('Theme Preference Saved', `Default theme set to ${t}.`);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      systemPreferences.defaultTheme === t
                        ? 'bg-white dark:bg-emerald-600 text-emerald-950 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Default Dashboard Option */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Default Dashboard Landing
              </span>
              <select
                value={systemPreferences.defaultDashboard}
                onChange={(e) => {
                  const val = e.target.value;
                  setSystemPreferences((prev) => ({ ...prev, defaultDashboard: val }));
                  onTriggerToast('Default Dashboard Updated', `Landing tab set to ${val}.`);
                }}
                className="bg-white dark:bg-emerald-950 border border-slate-200 dark:border-emerald-800 text-xs font-medium rounded-lg px-2.5 py-1 text-slate-800 dark:text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Executive Overview">Executive Overview</option>
                <option value="Business & Finance">Business & Finance</option>
                <option value="Farmers & Outreach">Farmers & Outreach</option>
                <option value="Products & Inventory">Products & Inventory</option>
                <option value="Rural Marts">Rural Marts</option>
                <option value="Reports">Reports</option>
              </select>
            </div>

            {/* Time Zone Option */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Time Zone
                </span>
              </div>
              <select
                value={systemPreferences.timeZone}
                onChange={(e) => {
                  const val = e.target.value;
                  setSystemPreferences((prev) => ({ ...prev, timeZone: val }));
                  onTriggerToast('Timezone Preference Saved', `Timezone set to ${val}.`);
                }}
                className="bg-white dark:bg-emerald-950 border border-slate-200 dark:border-emerald-800 text-xs font-medium rounded-lg px-2.5 py-1 text-slate-800 dark:text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="IST (UTC+05:30) Indian Standard Time">IST (UTC+05:30) Asia/Kolkata</option>
                <option value="UTC (UTC+00:00) Coordinated Universal Time">UTC (UTC+00:00) Universal</option>
              </select>
            </div>

            {/* Date Format Option */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Date Format
                </span>
              </div>
              <select
                value={systemPreferences.dateFormat}
                onChange={(e) => {
                  const val = e.target.value;
                  setSystemPreferences((prev) => ({ ...prev, dateFormat: val }));
                  onTriggerToast('Date Format Saved', `Date layout set to ${val}.`);
                }}
                className="bg-white dark:bg-emerald-950 border border-slate-200 dark:border-emerald-800 text-xs font-medium rounded-lg px-2.5 py-1 text-slate-800 dark:text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="DD/MM/YYYY (e.g. 07/08/2026)">DD/MM/YYYY (Standard)</option>
                <option value="YYYY-MM-DD (e.g. 2026-08-07)">YYYY-MM-DD (ISO)</option>
                <option value="DD MMM YYYY (e.g. 07 Aug 2026)">DD MMM YYYY (Textual)</option>
              </select>
            </div>

            {/* Language Option */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Language
                </span>
              </div>
              <select
                value={systemPreferences.language}
                onChange={(e) => {
                  const val = e.target.value;
                  setSystemPreferences((prev) => ({ ...prev, language: val }));
                  onTriggerToast('Language Saved', `System language set to ${val}.`);
                }}
                className="bg-white dark:bg-emerald-950 border border-slate-200 dark:border-emerald-800 text-xs font-medium rounded-lg px-2.5 py-1 text-slate-800 dark:text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="English (India)">English (India)</option>
                <option value="Tamil (தமிழ்)">Tamil (தமிழ்)</option>
                <option value="Hindi (हिंदी)">Hindi (हिंदी)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-2 text-[11px] text-slate-500 dark:text-emerald-400/70 flex items-center justify-between">
          <span>Preferences auto-sync across all admin devices</span>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
            v2.4.0 Engine
          </span>
        </div>
      </div>
    </div>
  );
};
