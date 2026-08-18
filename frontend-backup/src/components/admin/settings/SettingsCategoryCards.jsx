import { Users, Shield, Bell, FileText, Sliders, ArrowRight, CheckCircle, FileSpreadsheet, Globe, Clock, Calendar, SunMoon } from 'lucide-react'

const NOTIFICATION_ITEMS = [
  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive digest summaries & system alerts via primary email' },
  { key: 'lowStockAlerts', label: 'Low Stock Alerts', desc: 'Alert when product inventory dips below critical minimum threshold' },
  { key: 'salesDeclineAlerts', label: 'Sales Decline Alerts', desc: 'Trigger notice when weekly mart revenue falls by >15%' },
  { key: 'dataUpdateReminders', label: 'Data Update Reminders', desc: 'Nudge managers for delayed stock & sales log syncs' },
  { key: 'martApprovalNotifications', label: 'Rural Mart Approval Notifications', desc: 'Immediate dispatch on new mart onboarding or status changes' },
]

const REPORT_TOGGLES = [
  { key: 'scheduledReports', label: 'Master Scheduled Engine', badge: 'Core Service' },
  { key: 'monthlyReports', label: 'Monthly Network Performance Reports', badge: '1st of Month' },
  { key: 'quarterlyReports', label: 'Quarterly Audit & Grant Balance Sheet', badge: 'End of Quarter' },
  { key: 'yearlyReports', label: 'Yearly Financial & Impact Statements', badge: 'Annual' },
]

export default function SettingsCategoryCards({
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
}) {
  const totalAdminCount = adminUsers.length
  const activeAdminCount = adminUsers.filter((u) => u.status === 'Active').length

  const handleToggleNotification = (key) => {
    setNotifications((prev) => {
      const updated = !prev[key]
      const labels = {
        emailNotifications: 'Email Notifications',
        lowStockAlerts: 'Low Stock Alerts',
        salesDeclineAlerts: 'Sales Decline Alerts',
        dataUpdateReminders: 'Data Update Reminders',
        martApprovalNotifications: 'Rural Mart Approval Notifications',
      }
      onTriggerToast('Notification Rule Updated', `${labels[key]} turned ${updated ? 'ON' : 'OFF'}.`)
      return { ...prev, [key]: updated }
    })
  }

  const handleToggleReportSetting = (key) => {
    setReportSettings((prev) => {
      const updated = !prev[key]
      onTriggerToast('Report Setting Saved', `${key} automated generation set to ${updated ? 'Enabled' : 'Disabled'}.`)
      return { ...prev, [key]: updated }
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-primary-light text-brand-primary-dark">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-brand-text">User &amp; Role Management</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border/70 text-center">
              <span className="text-[10px] font-bold uppercase text-brand-text-muted block">Total Admin Users</span>
              <span className="text-base font-extrabold text-brand-text mt-1 block">{totalAdminCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border/70 text-center">
              <span className="text-[10px] font-bold uppercase text-brand-text-muted block">Active Users</span>
              <span className="text-base font-extrabold text-brand-primary mt-1 block">{activeAdminCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border/70 text-center">
              <span className="text-[10px] font-bold uppercase text-brand-text-muted block">User Roles</span>
              <span className="text-base font-extrabold text-brand-text mt-1 block">{new Set(adminUsers.map((u) => u.role)).size}</span>
            </div>
            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border/70 text-center">
              <span className="text-[10px] font-bold uppercase text-brand-text-muted block">Permissions</span>
              <span className="text-base font-extrabold text-brand-text-muted mt-1 block">10</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-brand-border/60 flex items-center gap-3">
          <button onClick={onOpenUserManagementModal} className="flex-1 px-3 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs">
            <span>Manage Users</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenRoleModal}
            className="flex-1 px-3 py-2 rounded-xl bg-brand-bg-subtle hover:bg-brand-border/40 text-brand-text text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-brand-border"
          >
            <Shield className="w-3.5 h-3.5 text-brand-primary" />
            <span>Manage Roles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-warning-light text-brand-warning-dark">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-brand-text">Notification Settings</h3>
            </div>
          </div>

          <div className="space-y-3">
            {NOTIFICATION_ITEMS.map((item) => {
              const isChecked = notifications[item.key]
              return (
                <div
                  key={item.key}
                  onClick={() => handleToggleNotification(item.key)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-brand-bg-subtle/70 border border-brand-border/70 hover:bg-brand-bg-subtle transition-colors cursor-pointer select-none"
                >
                  <div className="pr-3">
                    <p className="text-xs font-semibold text-brand-text">{item.label}</p>
                    <p className="text-[11px] text-brand-text-muted">{item.desc}</p>
                  </div>

                  <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 shrink-0 ${isChecked ? 'bg-brand-primary' : 'bg-brand-border'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${isChecked ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="pt-2 text-[11px] text-brand-text-muted flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-brand-primary shrink-0" />
          <span>Notification preferences will apply when notification services are configured.</span>
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-100 text-teal-800">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-brand-text">Report Settings</h3>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border/70 space-y-2">
            <label className="text-xs font-bold text-brand-text flex items-center justify-between">
              <span>Default Export Format</span>
              <span className="text-[11px] font-normal text-brand-text-muted">Applied to quick downloads</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setReportSettings((prev) => ({ ...prev, defaultFormat: 'PDF' }))
                  onTriggerToast('Default Format Updated', 'Default download format set to PDF.')
                }}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
                  reportSettings.defaultFormat === 'PDF' ? 'bg-brand-primary text-white border-brand-primary shadow-xs' : 'bg-brand-surface text-brand-text border-brand-border hover:bg-brand-bg-subtle'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>PDF Format</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setReportSettings((prev) => ({ ...prev, defaultFormat: 'Excel' }))
                  onTriggerToast('Default Format Updated', 'Default download format set to Excel (.xlsx).')
                }}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
                  reportSettings.defaultFormat === 'Excel' ? 'bg-brand-primary text-white border-brand-primary shadow-xs' : 'bg-brand-surface text-brand-text border-brand-border hover:bg-brand-bg-subtle'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel (.XLSX)</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-brand-text block">Automated Periodic Compilations</span>

            {REPORT_TOGGLES.map((item) => {
              const isChecked = reportSettings[item.key]
              return (
                <div
                  key={item.key}
                  onClick={() => handleToggleReportSetting(item.key)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-brand-bg-subtle/70 border border-brand-border/70 hover:bg-brand-bg-subtle transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-brand-text">{item.label}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-brand-border/50 text-brand-text-muted">{item.badge}</span>
                  </div>

                  <div className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 shrink-0 ${isChecked ? 'bg-brand-primary' : 'bg-brand-border'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${isChecked ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-brand-border/60 flex items-center gap-3">
          <button onClick={onOpenScheduleModal} className="flex-1 px-3 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>Configure Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onTriggerToast('Report Center', 'Navigating to Available Reports...')}
            className="flex-1 px-3 py-2 rounded-xl bg-brand-bg-subtle hover:bg-brand-border/40 text-brand-text text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-brand-border"
          >
            <FileText className="w-3.5 h-3.5 text-brand-primary" />
            <span>Manage Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-brand-text">System Preferences</h3>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-bg-subtle/70 border border-brand-border/70">
              <div className="flex items-center gap-2">
                <SunMoon className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="text-xs font-semibold text-brand-text">Default Theme</span>
              </div>
              <div className="flex items-center gap-1 bg-brand-border/40 p-1 rounded-lg">
                {['Light', 'Dark', 'System'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setSystemPreferences((prev) => ({ ...prev, defaultTheme: t }))
                      onTriggerToast('Theme Preference Saved', `Default theme set to ${t}.`)
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      systemPreferences.defaultTheme === t ? 'bg-brand-surface text-brand-text shadow-xs' : 'text-brand-text-muted hover:text-brand-text'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-bg-subtle/70 border border-brand-border/70">
              <span className="text-xs font-semibold text-brand-text">Default Dashboard Landing</span>
              <select
                value={systemPreferences.defaultDashboard}
                onChange={(e) => {
                  const val = e.target.value
                  setSystemPreferences((prev) => ({ ...prev, defaultDashboard: val }))
                  onTriggerToast('Default Dashboard Updated', `Landing tab set to ${val}.`)
                }}
                className="bg-brand-surface border border-brand-border text-xs font-medium rounded-lg px-2.5 py-1 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="Executive Overview">Executive Overview</option>
                <option value="Business & Finance">Business &amp; Finance</option>
                <option value="Farmers & Outreach">Farmers &amp; Outreach</option>
                <option value="Products & Inventory">Products &amp; Inventory</option>
                <option value="Rural Marts">Rural Marts</option>
                <option value="Reports">Reports</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-bg-subtle/70 border border-brand-border/70">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="text-xs font-semibold text-brand-text">Time Zone</span>
              </div>
              <select
                value={systemPreferences.timeZone}
                onChange={(e) => {
                  const val = e.target.value
                  setSystemPreferences((prev) => ({ ...prev, timeZone: val }))
                  onTriggerToast('Timezone Preference Saved', `Timezone set to ${val}.`)
                }}
                className="bg-brand-surface border border-brand-border text-xs font-medium rounded-lg px-2.5 py-1 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="IST (UTC+05:30) Indian Standard Time">IST (UTC+05:30) Asia/Kolkata</option>
                <option value="UTC (UTC+00:00) Coordinated Universal Time">UTC (UTC+00:00) Universal</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-bg-subtle/70 border border-brand-border/70">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="text-xs font-semibold text-brand-text">Date Format</span>
              </div>
              <select
                value={systemPreferences.dateFormat}
                onChange={(e) => {
                  const val = e.target.value
                  setSystemPreferences((prev) => ({ ...prev, dateFormat: val }))
                  onTriggerToast('Date Format Saved', `Date layout set to ${val}.`)
                }}
                className="bg-brand-surface border border-brand-border text-xs font-medium rounded-lg px-2.5 py-1 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="DD/MM/YYYY (e.g. 07/08/2026)">DD/MM/YYYY (Standard)</option>
                <option value="YYYY-MM-DD (e.g. 2026-08-07)">YYYY-MM-DD (ISO)</option>
                <option value="DD MMM YYYY (e.g. 07 Aug 2026)">DD MMM YYYY (Textual)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-bg-subtle/70 border border-brand-border/70">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="text-xs font-semibold text-brand-text">Language</span>
              </div>
              <select
                value={systemPreferences.language}
                onChange={(e) => {
                  const val = e.target.value
                  setSystemPreferences((prev) => ({ ...prev, language: val }))
                  onTriggerToast('Language Saved', `System language set to ${val}.`)
                }}
                className="bg-brand-surface border border-brand-border text-xs font-medium rounded-lg px-2.5 py-1 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="English (India)">English (India)</option>
                <option value="Tamil (தமிழ்)">Tamil (தமிழ்)</option>
                <option value="Hindi (हिंदी)">Hindi (हिंदी)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-2 text-[11px] text-brand-text-muted flex items-center justify-between">
          <span>Preferences auto-sync across all admin devices</span>
        </div>
      </div>
    </div>
  )
}
