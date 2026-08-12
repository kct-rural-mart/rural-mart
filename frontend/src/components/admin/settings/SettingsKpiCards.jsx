import { useState } from 'react'
import { Store, Users, Shield, Bell, FileClock, HardDrive, Info } from 'lucide-react'

export default function SettingsKpiCards({ totalMartsCount, adminUsers, notificationRulesCount, scheduledReportsCount, lastBackup }) {
  const [activeTooltip, setActiveTooltip] = useState(null)

  const activeUsersCount = adminUsers.filter((u) => u.status === 'Active').length

  const kpis = [
    { id: 'marts', label: 'Total Rural Marts', value: `${totalMartsCount}`, icon: Store, tooltip: 'Operational Rural Mart outposts currently configured in system settings.' },
    { id: 'users', label: 'Active Admin Users', value: `${activeUsersCount}`, icon: Users, tooltip: 'Admin and manager accounts authorized for district oversight.' },
    { id: 'total-users', label: 'Total Admin Users', value: `${adminUsers.length}`, icon: Shield, tooltip: 'All configured admin accounts, active or inactive.' },
    { id: 'notifications', label: 'Notification Rules', value: `${notificationRulesCount}`, icon: Bell, tooltip: 'Automated alert rules currently enabled for low inventory, sync lags, and financial thresholds.' },
    { id: 'reports', label: 'Scheduled Reports', value: `${scheduledReportsCount}`, icon: FileClock, tooltip: 'Recurring reporting tasks currently enabled for automatic generation.' },
    { id: 'backup', label: 'Last System Backup', value: lastBackup === 'Not configured' ? 'Not configured' : 'Done', icon: HardDrive, tooltip: 'Latest verified database backup snapshot.' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        const isTooltipOpen = activeTooltip === kpi.id

        return (
          <div
            key={kpi.id}
            className="bg-brand-surface border border-brand-border rounded-xl p-3.5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-brand-primary/40 transition-all duration-200 cursor-pointer relative flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider truncate">{kpi.label}</span>
              <div className="relative flex items-center">
                <button
                  onMouseEnter={() => setActiveTooltip(kpi.id)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(isTooltipOpen ? null : kpi.id)}
                  className="text-brand-text-subtle hover:text-brand-primary transition-colors p-0.5"
                  title="More information"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                {isTooltipOpen && (
                  <div className="absolute right-0 top-6 w-48 bg-brand-text text-white text-[10px] p-2 rounded-lg shadow-lg z-50 pointer-events-none leading-relaxed border border-brand-accent">
                    {kpi.tooltip}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2 my-1">
              <span className="text-xl md:text-2xl font-bold text-brand-text tracking-tight truncate">{kpi.value}</span>
              <div className="w-7 h-7 rounded-lg bg-brand-primary-light text-brand-primary flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
