import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import OwnerSidebar from './owner/OwnerSidebar'
import OwnerHeader from './owner/OwnerHeader'
import CompactStatusLine from './shared/CompactStatusLine'
import NotificationsPopover from './shared/NotificationsPopover'
import { getOwnerRuralMart } from '../lib/queries/ownerMart'

export default function OwnerLayout() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [lastSyncedTime, setLastSyncedTime] = useState('Not synced yet')
  const [refreshKey, setRefreshKey] = useState(0)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [ruralMart, setRuralMart] = useState(null)

  const ruralMartId = profile?.rural_mart_id ?? null

  useEffect(() => {
    let isMounted = true
    if (!ruralMartId) {
      setRuralMart(null)
      return
    }
    getOwnerRuralMart(ruralMartId)
      .then((mart) => {
        if (isMounted) setRuralMart(mart)
      })
      .catch((err) => {
        console.error('Failed to load Rural Mart record:', err.message)
      })
    return () => {
      isMounted = false
    }
  }, [ruralMartId])

  const displayMartName = ruralMart?.mart_name || 'Your Rural Mart'
  const displayOwnerName = ruralMart?.entrepreneur_name || user?.email || 'Owner'

  const handleSync = () => {
    const now = new Date()
    setLastSyncedTime(now.toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }))
    setRefreshKey((k) => k + 1)
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
            unreadCount={0}
            onOpenNotifications={() => setNotificationsOpen((v) => !v)}
            onLogout={handleLogout}
            ownerName={displayOwnerName}
            ownerEmail={user?.email ?? ''}
            martName={displayMartName}
          />

          <CompactStatusLine onSync={handleSync} lastSyncedTime={lastSyncedTime} />
        </div>

        <NotificationsPopover isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} alerts={[]} onMarkAllRead={() => {}} />

        <main className="flex-1 p-3 md:p-5 space-y-4 max-w-[1600px] w-full mx-auto">
          <Outlet context={{ searchQuery, dateRange, martName: displayMartName, ownerName: displayOwnerName, ruralMartId, ruralMart, refreshKey }} />
        </main>
      </div>
    </div>
  )
}
