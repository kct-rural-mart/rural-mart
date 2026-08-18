import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { ADMIN_USERS_DATA, SYSTEM_ACTIVITY_DATA } from '../../../lib/newPages/mockData'
import { getRuralMarts } from '../../../lib/newPages/shared/dataServices'
import SettingsHeader from './SettingsHeader'
import SettingsKpiCards from './SettingsKpiCards'
import SettingsCategoryCards from './SettingsCategoryCards'
import SettingsTables from './SettingsTables'
import SettingsBackupSecurity from './SettingsBackupSecurity'
import UserPermissionsModal from './UserPermissionsModal'
import { CheckCircle2 } from 'lucide-react'

export default function SettingsDashboard() {
  const { user } = useAuth()
  const actorName = user?.email ?? 'Admin'

  const [adminUsers, setAdminUsers] = useState(ADMIN_USERS_DATA)
  const [systemActivity, setSystemActivity] = useState(SYSTEM_ACTIVITY_DATA)

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    salesDeclineAlerts: true,
    dataUpdateReminders: true,
    martApprovalNotifications: true,
  })

  const [reportSettings, setReportSettings] = useState({
    defaultFormat: 'PDF',
    scheduledReports: true,
    monthlyReports: true,
    quarterlyReports: true,
    yearlyReports: true,
  })

  const [systemPreferences, setSystemPreferences] = useState({
    defaultTheme: 'Light',
    defaultDashboard: 'Executive Overview',
    timeZone: 'IST (UTC+05:30) Indian Standard Time',
    dateFormat: 'DD/MM/YYYY (e.g. 07/08/2026)',
    language: 'English (India)',
  })

  const [lastBackup, setLastBackup] = useState('Not configured')
  const [isSaving, setIsSaving] = useState(false)

  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userModalMode, setUserModalMode] = useState('view')

  const [toast, setToast] = useState({ show: false, title: '', message: '' })

  const triggerToast = (title, message) => {
    setToast({ show: true, title, message })
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }))
    }, 3800)
  }

  const handleSaveSettings = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)

      const newActivity = {
        id: `act-${Date.now()}`,
        dateTime: 'Just now',
        user: actorName,
        action: 'Saved Global Platform Configuration',
        module: 'System Settings',
        status: 'Completed',
      }
      setSystemActivity((prev) => [newActivity, ...prev])

      triggerToast('Settings Saved', 'Platform preferences updated successfully.')
    }, 750)
  }

  const handleRunBackup = () => {
    triggerToast('Backup Initiated', 'Manual backup process triggered...')

    setTimeout(() => {
      const nowStr = `Today • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      setLastBackup(nowStr)

      const newActivity = {
        id: `act-${Date.now()}`,
        dateTime: 'Just now',
        user: `${actorName} (Manual Trigger)`,
        action: 'Manual System Backup Completed',
        module: 'Database Backup',
        status: 'Completed',
      }
      setSystemActivity((prev) => [newActivity, ...prev])

      triggerToast('Backup Completed', `Database snapshot created successfully at ${nowStr}.`)
    }, 1800)
  }

  const handleSaveUser = (savedUser) => {
    if (userModalMode === 'add') {
      setAdminUsers((prev) => [savedUser, ...prev])
      const newActivity = {
        id: `act-${Date.now()}`,
        dateTime: 'Just now',
        user: actorName,
        action: `Added Admin User (${savedUser.name})`,
        module: 'User Permissions',
        status: 'Completed',
      }
      setSystemActivity((prev) => [newActivity, ...prev])
      triggerToast('User Added', `Admin account created for ${savedUser.name} (${savedUser.role}).`)
    } else {
      setAdminUsers((prev) => prev.map((u) => (u.id === savedUser.id ? savedUser : u)))
      const newActivity = {
        id: `act-${Date.now()}`,
        dateTime: 'Just now',
        user: actorName,
        action: `Updated Permissions for ${savedUser.name}`,
        module: 'User Permissions',
        status: 'Completed',
      }
      setSystemActivity((prev) => [newActivity, ...prev])
      triggerToast('Permissions Saved', `Role matrix updated for ${savedUser.name}.`)
    }
  }

  return (
    <div className="space-y-5">
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-brand-primary-dark text-white shadow-2xl border border-brand-primary max-w-md">
          <CheckCircle2 className="w-5 h-5 text-brand-primary-light shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-white">{toast.title}</p>
            <p className="text-xs text-brand-primary-light truncate">{toast.message}</p>
          </div>
        </div>
      )}

      <SettingsHeader onSave={handleSaveSettings} isSaving={isSaving} />

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">Settings Overview</h2>
        </div>
        <SettingsKpiCards
          totalMartsCount={getRuralMarts().length}
          adminUsers={adminUsers}
          notificationRulesCount={Object.values(notifications).filter(Boolean).length}
          scheduledReportsCount={[reportSettings.scheduledReports, reportSettings.monthlyReports, reportSettings.quarterlyReports, reportSettings.yearlyReports].filter(Boolean).length}
          lastBackup={lastBackup}
        />
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">System Settings Categories</h2>
          <span className="text-[11px] text-brand-text-subtle">Users, Notifications, Reports &amp; Preferences</span>
        </div>
        <SettingsCategoryCards
          notifications={notifications}
          setNotifications={setNotifications}
          reportSettings={reportSettings}
          setReportSettings={setReportSettings}
          systemPreferences={systemPreferences}
          setSystemPreferences={setSystemPreferences}
          adminUsers={adminUsers}
          onOpenUserManagementModal={() => {
            setSelectedUser(null)
            setUserModalMode('add')
            setIsUserModalOpen(true)
          }}
          onOpenRoleModal={() => {
            setSelectedUser(adminUsers[0] || null)
            setUserModalMode('edit')
            setIsUserModalOpen(true)
          }}
          onOpenScheduleModal={() => {
            triggerToast('Scheduled Engine', 'Opening automated report cron scheduler...')
          }}
          onTriggerToast={triggerToast}
        />
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">User Management &amp; Administrative Activity Logs</h2>
          <span className="text-[11px] text-brand-text-subtle">RBAC Access Controls &amp; System Audit History</span>
        </div>
        <SettingsTables
          adminUsers={adminUsers}
          systemActivity={systemActivity}
          onViewUser={(u) => {
            setSelectedUser(u)
            setUserModalMode('view')
            setIsUserModalOpen(true)
          }}
          onEditPermissions={(u) => {
            setSelectedUser(u)
            setUserModalMode('edit')
            setIsUserModalOpen(true)
          }}
          onAddUser={() => {
            setSelectedUser(null)
            setUserModalMode('add')
            setIsUserModalOpen(true)
          }}
        />
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">Backup Status &amp; Security Overview</h2>
          <span className="text-[11px] text-brand-text-subtle">Replication Health &amp; Cyber-Shield Protocols</span>
        </div>
        <SettingsBackupSecurity
          lastBackup={lastBackup}
          nextBackup="Not scheduled"
          onRunBackup={handleRunBackup}
          onViewBackupHistory={() => triggerToast('Backup History', 'Fetching previous backup snapshot logs...')}
          onOpenSecuritySettings={() => triggerToast('Security Console', 'Opening 2FA & Password Policy Controls...')}
          onViewSecurityLogs={() => triggerToast('Security Logs', 'Viewing authentication audit trail...')}
        />
      </section>

      <UserPermissionsModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={selectedUser}
        mode={userModalMode}
        onSaveUser={handleSaveUser}
      />
    </div>
  )
}
