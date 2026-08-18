import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar, { ADMIN_NAV_ITEMS, ADMIN_SETTINGS_ITEM } from './admin/Sidebar'
import Header from './admin/Header'
import CompactStatusLine from './shared/CompactStatusLine'
import NotificationsPopover from './shared/NotificationsPopover'
import ExportModal from './admin/ExportModal'
import AllAlertsModal from './admin/AllAlertsModal'
import { getReportsRuralMarts, getAlerts, saveAlerts } from '../lib/newPages/shared/dataServices'

const ALL_NAV_ITEMS = [...ADMIN_NAV_ITEMS, ADMIN_SETTINGS_ITEM]

export default function AdminLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [filters, setFilters] = useState({
    searchQuery: '',
    district: 'All Districts',
    ruralMart: 'All Rural Marts',
    dateRange: 'Last 30 Days',
  })
  const [marts, setMarts] = useState(() => getReportsRuralMarts())
  const [alerts, setAlerts] = useState(() => getAlerts())
  const [lastSyncedTime, setLastSyncedTime] = useState('Not synced yet')
  const [refreshKey, setRefreshKey] = useState(0)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [allAlertsModalOpen, setAllAlertsModalOpen] = useState(false)

  useEffect(() => {
    setMarts(getReportsRuralMarts())
    setAlerts(getAlerts())
  }, [location.pathname])

  const filteredMarts = marts.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      m.district.toLowerCase().includes(filters.searchQuery.toLowerCase())
    const matchDistrict = filters.district === 'All Districts' || m.district === filters.district
    const matchMart =
      filters.ruralMart === 'All Rural Marts' ||
      m.name.toLowerCase().includes(filters.ruralMart.toLowerCase()) ||
      m.id.toLowerCase() === filters.ruralMart.toLowerCase()
    return matchSearch && matchDistrict && matchMart
  })

  const handleSync = () => {
    const now = new Date()
    setLastSyncedTime(now.toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }))
    setRefreshKey((k) => k + 1)
  }

  const handleReviewAlert = (alertId, newStatus) => {
    setAlerts((prev) => {
      const updated = prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a))
      saveAlerts(updated)
      return updated
    })
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const activeNavItem = ALL_NAV_ITEMS.find((item) => location.pathname.startsWith(item.to))
  const title = activeNavItem?.label ?? 'Executive Overview'

  return (
    <div className="min-h-screen flex bg-brand-bg text-brand-text font-sans antialiased">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <div className={`flex-1 flex flex-col min-w-0 overflow-x-hidden relative transition-all duration-300 ${sidebarCollapsed ? 'pl-16' : 'pl-16 md:pl-60'}`}>
        <div className="sticky top-0 z-30 bg-brand-surface/95 backdrop-blur-md shadow-xs">
          <Header
            title={title}
            filters={filters}
            setFilters={setFilters}
            onOpenExportModal={() => setExportModalOpen(true)}
            onOpenNotificationsPopover={() => setNotificationsOpen((v) => !v)}
            unreadAlertCount={alerts.filter((a) => a.status === 'New').length}
            onLogout={handleLogout}
            adminName={user?.email ?? 'Admin'}
            adminEmail={user?.email ?? ''}
            adminRole="Administrator"
          />

          <div className="flex items-center justify-between px-4 bg-brand-primary-light/60 border-b border-brand-border py-1 text-xs">
            <CompactStatusLine onSync={handleSync} lastSyncedTime={lastSyncedTime} />
          </div>
        </div>

        <NotificationsPopover
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          alerts={alerts}
          onMarkAllRead={() => {
            setAlerts((prev) => {
              const updated = prev.map((a) => ({ ...a, status: 'Resolved' }))
              saveAlerts(updated)
              return updated
            })
          }}
        />

        <main className="flex-1 p-3 md:p-5 space-y-4 max-w-[1600px] w-full mx-auto">
          <Outlet
            context={{
              marts: filteredMarts,
              alerts,
              onReviewAlert: handleReviewAlert,
              filters,
              onOpenAllAlertsModal: () => setAllAlertsModalOpen(true),
              refreshKey,
            }}
          />
        </main>
      </div>

      <ExportModal isOpen={exportModalOpen} onClose={() => setExportModalOpen(false)} marts={filteredMarts} />

      <AllAlertsModal
        isOpen={allAlertsModalOpen}
        onClose={() => setAllAlertsModalOpen(false)}
        alerts={alerts}
        onReviewAlert={handleReviewAlert}
      />
    </div>
  )
}
