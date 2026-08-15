import React, { useState } from 'react';
import {
  Theme,
  AdminUserItem,
  SystemActivityRecord,
  NotificationSettingsState,
  ReportSettingsState,
  SystemPreferencesState,
} from '../../../shared/types';
import { ADMIN_USERS_DATA, SYSTEM_ACTIVITY_DATA } from '../../../mockData';
import { SettingsHeader } from './SettingsHeader';
import { SettingsCategoryCards } from './SettingsCategoryCards';
import { SettingsTables } from './SettingsTables';
import { SettingsBackupSecurity } from './SettingsBackupSecurity';
import { UserPermissionsModal } from './UserPermissionsModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface SettingsPageProps {
  theme: Theme;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ theme }) => {
  // State for Admin Users & Activity
  const [adminUsers, setAdminUsers] = useState<AdminUserItem[]>(ADMIN_USERS_DATA);
  const [systemActivity, setSystemActivity] = useState<SystemActivityRecord[]>(SYSTEM_ACTIVITY_DATA);

  // State for Notification Settings
  const [notifications, setNotifications] = useState<NotificationSettingsState>({
    emailNotifications: true,
    lowStockAlerts: true,
    salesDeclineAlerts: true,
    dataUpdateReminders: true,
    martApprovalNotifications: true,
  });

  // State for Report Settings
  const [reportSettings, setReportSettings] = useState<ReportSettingsState>({
    defaultFormat: 'PDF',
    scheduledReports: true,
    monthlyReports: true,
    quarterlyReports: true,
    yearlyReports: true,
  });

  // State for System Preferences
  const [systemPreferences, setSystemPreferences] = useState<SystemPreferencesState>({
    defaultTheme: theme === 'dark' ? 'Dark' : 'Light',
    defaultDashboard: 'Executive Overview',
    timeZone: 'IST (UTC+05:30) Indian Standard Time',
    dateFormat: 'DD/MM/YYYY (e.g. 07/08/2026)',
    language: 'English (India)',
  });

  // Backup state
  const [lastBackup, setLastBackup] = useState<string>('Not configured');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [userModalMode, setUserModalMode] = useState<'view' | 'edit' | 'add'>('view');

  // Notification Toast Banner State
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({ show: false, title: '', message: '' });

  const triggerToast = (title: string, message: string) => {
    setToast({ show: true, title, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3800);
  };

  // Header Save Action
  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);

      // Append Activity Record
      const newActivity: SystemActivityRecord = {
        id: `act-${Date.now()}`,
        dateTime: 'Just now',
        user: 'S. Ramanathan',
        action: 'Saved Global Platform Configuration',
        module: 'System Settings',
        status: 'Completed',
      };
      setSystemActivity((prev) => [newActivity, ...prev]);

      triggerToast('Settings Saved', 'Platform preferences updated successfully.');
    }, 750);
  };

  // Header Reset Defaults
  const handleResetDefaults = () => {
    setNotifications({
      emailNotifications: true,
      lowStockAlerts: true,
      salesDeclineAlerts: true,
      dataUpdateReminders: true,
      martApprovalNotifications: true,
    });
    setReportSettings({
      defaultFormat: 'PDF',
      scheduledReports: true,
      monthlyReports: true,
      quarterlyReports: true,
      yearlyReports: true,
    });
    setSystemPreferences({
      defaultTheme: 'Light',
      defaultDashboard: 'Executive Overview',
      timeZone: 'IST (UTC+05:30) Indian Standard Time',
      dateFormat: 'DD/MM/YYYY (e.g. 07/08/2026)',
      language: 'English (India)',
    });

    triggerToast('Defaults Restored', 'System preferences reset to default configuration.');
  };

  // Run Manual Backup Handler
  const handleRunBackup = () => {
    triggerToast('Backup Initiated', 'Manual backup process triggered...');

    setTimeout(() => {
      const nowStr = `Today • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      setLastBackup(nowStr);

      const newActivity: SystemActivityRecord = {
        id: `act-${Date.now()}`,
        dateTime: 'Just now',
        user: 'S. Ramanathan (Manual Trigger)',
        action: 'Manual System Backup Completed',
        module: 'Database Backup',
        status: 'Completed',
      };
      setSystemActivity((prev) => [newActivity, ...prev]);

      triggerToast('Backup Completed', `Database snapshot created successfully at ${nowStr}.`);
    }, 1800);
  };

  // Save or Add User
  const handleSaveUser = (user: AdminUserItem) => {
    if (userModalMode === 'add') {
      setAdminUsers((prev) => [user, ...prev]);
      const newActivity: SystemActivityRecord = {
        id: `act-${Date.now()}`,
        dateTime: 'Just now',
        user: 'S. Ramanathan',
        action: `Added Admin User (${user.name})`,
        module: 'User Permissions',
        status: 'Completed',
      };
      setSystemActivity((prev) => [newActivity, ...prev]);
      triggerToast('User Added', `Admin account created for ${user.name} (${user.role}).`);
    } else {
      setAdminUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
      const newActivity: SystemActivityRecord = {
        id: `act-${Date.now()}`,
        dateTime: 'Just now',
        user: 'S. Ramanathan',
        action: `Updated Permissions for ${user.name}`,
        module: 'User Permissions',
        status: 'Completed',
      };
      setSystemActivity((prev) => [newActivity, ...prev]);
      triggerToast('Permissions Saved', `Role matrix updated for ${user.name}.`);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toast Notification Banner */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-900 text-white shadow-2xl border border-emerald-700 animate-slideUp max-w-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-emerald-200">{toast.title}</p>
            <p className="text-xs text-emerald-300/90 truncate">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <SettingsHeader
        onSave={handleSaveSettings}
        isSaving={isSaving}
      />

      {/* SECTION 1 — System Settings Categories */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-300">
            System Settings Categories
          </h2>
          <span className="text-[11px] text-slate-400 dark:text-emerald-400/60">
            Users, Notifications, Reports & Preferences
          </span>
        </div>
        <SettingsCategoryCards
          theme={theme}
          notifications={notifications}
          setNotifications={setNotifications}
          reportSettings={reportSettings}
          setReportSettings={setReportSettings}
          systemPreferences={systemPreferences}
          setSystemPreferences={setSystemPreferences}
          adminUsers={adminUsers}
          onOpenUserManagementModal={() => {
            setSelectedUser(null);
            setUserModalMode('add');
            setIsUserModalOpen(true);
          }}
          onOpenRoleModal={() => {
            setSelectedUser(adminUsers[0] || null);
            setUserModalMode('edit');
            setIsUserModalOpen(true);
          }}
          onOpenScheduleModal={() => {
            triggerToast('Scheduled Engine', 'Opening automated report cron scheduler...');
          }}
          onTriggerToast={triggerToast}
        />
      </section>

      {/* SECTION 2 — User Management & Administrative Activity Logs (Combined Table) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-300">
            User Management & Administrative Activity Logs
          </h2>
          <span className="text-[11px] text-slate-400 dark:text-emerald-400/60">
            RBAC Access Controls & System Audit History
          </span>
        </div>
        <SettingsTables
          adminUsers={adminUsers}
          systemActivity={systemActivity}
          onViewUser={(user) => {
            setSelectedUser(user);
            setUserModalMode('view');
            setIsUserModalOpen(true);
          }}
          onEditPermissions={(user) => {
            setSelectedUser(user);
            setUserModalMode('edit');
            setIsUserModalOpen(true);
          }}
          onAddUser={() => {
            setSelectedUser(null);
            setUserModalMode('add');
            setIsUserModalOpen(true);
          }}
        />
      </section>

      {/* SECTION 3 — Backup Status & Security Overview */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-300">
            Backup Status & Security Overview
          </h2>
          <span className="text-[11px] text-slate-400 dark:text-emerald-400/60">
            Replication Health & Cyber-Shield Protocols
          </span>
        </div>
        <SettingsBackupSecurity
          lastBackup={lastBackup}
          nextBackup="Not scheduled"
          onRunBackup={handleRunBackup}
          onViewBackupHistory={() => {
            triggerToast('Backup History', 'Fetching previous 90 daily snapshot logs...');
          }}
          onOpenSecuritySettings={() => {
            triggerToast('Security Console', 'Opening 2FA & Password Policy Controls...');
          }}
          onViewSecurityLogs={() => {
            triggerToast('Security Logs', 'Viewing authentication audit trail...');
          }}
        />
      </section>

      {/* User & Role Management Modal */}
      <UserPermissionsModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={selectedUser}
        mode={userModalMode}
        onSaveUser={handleSaveUser}
      />
    </div>
  );
};
