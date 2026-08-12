import { useMemo, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import OwnerSidebar from './owner/OwnerSidebar'
import OwnerHeader from './owner/OwnerHeader'
import CompactStatusLine from './shared/CompactStatusLine'
import NotificationsPopover from './shared/NotificationsPopover'
import { INITIAL_ALERTS } from '../lib/newPages/mockData'
import { getRuralMartById, getRuralMarts, getOwnerById, getOwners } from '../lib/newPages/shared/dataServices'

export default function OwnerLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [lastSyncedTime, setLastSyncedTime] = useState('Not synced yet')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [alerts, setAlerts] = useState(INITIAL_ALERTS)

  const ownerEmail = user?.email ?? ''

  const currentMart = useMemo(() => {
    if (ownerEmail) {
      const marts = getRuralMarts()
      const matched = marts.find((m) => m.ownerEmail.toLowerCase() === ownerEmail.toLowerCase())
      if (matched) return matched
    }
    return getRuralMartById('RM-001') || getRuralMarts()[0] || null
  }, [ownerEmail])

  const currentOwner = useMemo(() => {
    return currentMart ? getOwnerById(currentMart.ownerId) || getOwners()[0] || null : getOwners()[0] || null
  }, [currentMart])

  const displayMartName = currentMart?.ruralMartName || 'Your Rural Mart'
  const displayOwnerName = currentOwner?.ownerName || currentMart?.ownerName || ownerEmail || 'Owner'

  const handleSync = () => {
    const now = new Date()
    setLastSyncedTime(now.toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }))
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex bg-brand-bg text-brand-text font-sans antialiased">
      <OwnerSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} martName={displayMartName} />

      <div className={`flex-1 flex flex-col min-w-0 overflow-x-hidden relative transition-all duration-300 ${sidebarCollapsed ? 'pl-16' : 'pl-16 md:pl-60'}`}>
        <div className="sticky top-0 z-30 bg-brand-surface/95 backdrop-blur-md shadow-xs">
          <OwnerHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            dateRange={dateRange}
            setDateRange={setDateRange}
            unreadCount={alerts.filter((a) => a.status === 'New').length}
            onOpenNotifications={() => setNotificationsOpen((v) => !v)}
            onLogout={handleLogout}
            ownerName={displayOwnerName}
            ownerEmail={ownerEmail}
            martName={displayMartName}
          />

          <CompactStatusLine onSync={handleSync} lastSyncedTime={lastSyncedTime} />
        </div>

        <NotificationsPopover
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          alerts={alerts}
          onMarkAllRead={() => setAlerts((prev) => prev.map((a) => ({ ...a, status: 'Resolved' })))}
        />

        <main className="flex-1 p-3 md:p-5 space-y-4 max-w-[1600px] w-full mx-auto">
          <Outlet context={{ searchQuery, martName: displayMartName, ownerName: displayOwnerName }} />
        </main>
      </div>
    </div>
  )
}
