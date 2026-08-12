import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Package,
  Store,
  FileText,
  Settings,
  Menu,
  ClipboardList,
} from 'lucide-react'
import { getApplications } from '../../lib/newPages/storageService'

// Shared with AdminLayout so the Header title stays in sync with the active section.
export const ADMIN_NAV_ITEMS = [
  { id: 'Executive Overview', label: 'Executive Overview', icon: LayoutDashboard, to: '/admin/dashboard' },
  { id: 'Rural Marts', label: 'Rural Marts', icon: Store, to: '/admin/rural-marts' },
  { id: 'Business & Finance', label: 'Business & Finance', icon: Briefcase, to: '/admin/finance' },
  { id: 'Farmers & Outreach', label: 'Farmers & Outreach', icon: Users, to: '/admin/outreach' },
  { id: 'Products & Inventory', label: 'Products & Inventory', icon: Package, to: '/admin/inventory' },
  { id: 'Pending Registrations', label: 'Pending Registrations', icon: ClipboardList, to: '/admin/registrations' },
  { id: 'Reports', label: 'Reports', icon: FileText, to: '/admin/reports' },
]

export const ADMIN_SETTINGS_ITEM = { id: 'Settings', label: 'Settings', icon: Settings, to: '/admin/settings' }

export default function Sidebar({ collapsed, setCollapsed }) {
  const [isHovered, setIsHovered] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const apps = getApplications()
    setPendingCount(apps.filter((a) => a.status === 'pending').length)
  }, [location.pathname])

  const isExpanded = !collapsed || isHovered

  const go = (to) => {
    navigate(to)
    if (isHovered) setIsHovered(false)
  }

  const isItemActive = (to) => location.pathname.startsWith(to)

  return (
    <>
      {collapsed && isHovered && (
        <div
          onClick={() => setIsHovered(false)}
          className="fixed inset-0 bg-brand-text/20 backdrop-blur-[1px] z-30 transition-opacity duration-200"
        />
      )}

      <aside
        onMouseEnter={() => collapsed && setIsHovered(true)}
        onMouseLeave={() => collapsed && setIsHovered(false)}
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out border-r ${
          isExpanded ? 'w-60 shadow-2xl' : 'w-16 shadow-sm'
        } bg-brand-surface/95 dark:bg-[#121E19]/95 backdrop-blur-md border-brand-border dark:border-[#1E3129] text-brand-text dark:text-[#E6ECE8]`}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center px-3.5 border-b border-brand-border dark:border-[#1E3129]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {!isExpanded ? (
              <button
                onClick={() => setCollapsed(!collapsed)}
                onMouseEnter={() => setIsHovered(true)}
                className="w-9 h-9 rounded-xl bg-brand-primary hover:bg-brand-primary-dark dark:bg-[#1B3D30] dark:hover:bg-[#234F3F] text-white dark:text-[#A3E6C5] flex items-center justify-center shrink-0 shadow-xs border border-brand-primary-dark/20 dark:border-[#A3E6C5]/20 transition-all cursor-pointer"
                title="Expand Navigation Menu"
              >
                <Menu className="w-5 h-5 text-white dark:text-[#A3E6C5]" />
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="w-9 h-9 rounded-xl bg-brand-primary dark:bg-[#1B3D30] text-white dark:text-[#A3E6C5] font-bold flex items-center justify-center shrink-0 shadow-xs border border-brand-primary-dark/20 dark:border-[#A3E6C5]/20 hover:opacity-90 transition-opacity"
                  title="Collapse menu"
                >
                  <span className="text-xs tracking-wider">RM</span>
                </button>
                <div className="flex flex-col min-w-0 transition-opacity duration-200">
                  <span className="font-bold text-sm text-brand-text dark:text-[#E6ECE8] truncate tracking-tight">
                    Rural Mart
                  </span>
                  <span className="text-[11px] text-brand-text-muted dark:text-[#8E9E96] font-medium truncate">
                    Admin Monitoring
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = isItemActive(item.to)
            const badge = item.id === 'Pending Registrations' ? pendingCount : undefined
            return (
              <button
                key={item.id}
                onClick={() => go(item.to)}
                title={!isExpanded ? item.label : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative group ${
                  isActive
                    ? 'bg-brand-primary-light dark:bg-[#1B3D30] text-brand-primary-dark dark:text-[#A3E6C5] font-bold shadow-xs border-l-4 border-brand-primary dark:border-[#A3E6C5]'
                    : 'text-brand-text-muted dark:text-[#8E9E96] hover:bg-brand-bg dark:hover:bg-[#182921] hover:text-brand-text dark:hover:text-[#E6ECE8]'
                } ${!isExpanded ? 'justify-center px-0 border-l-0' : ''}`}
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <Icon className={`w-4 h-4 transition-transform duration-150 group-hover:scale-110 ${isActive ? 'text-brand-primary-dark dark:text-[#A3E6C5]' : 'text-brand-text-muted dark:text-[#8E9E96]'}`} />
                  {!isExpanded && badge !== undefined && badge > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-brand-primary dark:bg-[#A3E6C5]" />
                  )}
                </div>
                {isExpanded && <span className="truncate tracking-tight">{item.label}</span>}
                {isExpanded && badge !== undefined && badge > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-brand-primary dark:bg-[#A3E6C5] text-white dark:text-[#103A2B] text-[10px] font-bold leading-none">
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer Navigation Utilities */}
        <div className="p-2 border-t border-brand-border dark:border-[#1E3129]">
          <button
            onClick={() => go(ADMIN_SETTINGS_ITEM.to)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 group ${
              isItemActive(ADMIN_SETTINGS_ITEM.to)
                ? 'bg-brand-primary-light dark:bg-[#1B3D30] text-brand-primary-dark dark:text-[#A3E6C5] font-bold'
                : 'text-brand-text-muted dark:text-[#8E9E96] hover:bg-brand-bg dark:hover:bg-[#182921] hover:text-brand-text dark:hover:text-[#E6ECE8]'
            } ${!isExpanded ? 'justify-center px-0' : ''}`}
            title="Settings"
          >
            <Settings className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:rotate-45 ${isItemActive(ADMIN_SETTINGS_ITEM.to) ? 'text-brand-primary-dark dark:text-[#A3E6C5]' : 'text-brand-text-muted dark:text-[#8E9E96]'}`} />
            {isExpanded && <span>Settings</span>}
            {isItemActive(ADMIN_SETTINGS_ITEM.to) && isExpanded && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary dark:bg-[#A3E6C5]" />
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
