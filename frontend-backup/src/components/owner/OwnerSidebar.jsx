import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Briefcase, Users, Package, TrendingUp, Settings, Menu, Store } from 'lucide-react'

export const OWNER_NAV_ITEMS = [
  { id: 'Overall Dashboard', label: 'Overall Dashboard', icon: LayoutDashboard, to: '/owner/dashboard' },
  { id: 'Daily Business', label: 'Daily Business', icon: Briefcase, to: '/owner/daily-business' },
  { id: 'Product & Inventory', label: 'Product & Inventory', icon: Package, to: '/owner/inventory' },
  { id: 'Farmer Outreach', label: 'Farmer Outreach', icon: Users, to: '/owner/outreach' },
  { id: 'Financial Dashboard', label: 'Financial Dashboard', icon: TrendingUp, to: '/owner/finance' },
  { id: 'Settings', label: 'Settings', icon: Settings, to: '/owner/settings' },
]

export default function OwnerSidebar({ collapsed, setCollapsed, martName = '—' }) {
  const [isHovered, setIsHovered] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isExpanded = !collapsed || isHovered

  const go = (to) => {
    navigate(to)
    if (isHovered) setIsHovered(false)
  }

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
        } bg-brand-surface/95 backdrop-blur-md border-brand-border text-brand-text`}
      >
        <div className="h-14 flex items-center px-3.5 border-b border-brand-border">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {!isExpanded ? (
              <button
                onClick={() => setCollapsed(!collapsed)}
                onMouseEnter={() => setIsHovered(true)}
                className="w-9 h-9 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white flex items-center justify-center shrink-0 shadow-xs border border-brand-primary-dark/20 transition-all cursor-pointer"
                title="Expand Navigation Menu"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="w-9 h-9 rounded-xl bg-brand-primary text-white font-bold flex items-center justify-center shrink-0 shadow-xs border border-brand-primary-dark/20 hover:opacity-90 transition-opacity cursor-pointer"
                  title="Collapse menu"
                >
                  <Store className="w-4 h-4 text-white" />
                </button>
                <div className="flex flex-col min-w-0 transition-opacity duration-200">
                  <span className="font-bold text-sm text-brand-text truncate tracking-tight">{martName}</span>
                  <span className="text-[11px] text-brand-text-muted font-medium truncate">Owner Dashboard</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {OWNER_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname.startsWith(item.to)
            return (
              <button
                key={item.id}
                onClick={() => go(item.to)}
                title={!isExpanded ? item.label : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative group cursor-pointer ${
                  isActive
                    ? 'bg-brand-primary-light text-brand-primary-dark font-bold shadow-xs border-l-4 border-brand-primary'
                    : 'text-brand-text-muted hover:bg-brand-bg hover:text-brand-text'
                } ${!isExpanded ? 'justify-center px-0 border-l-0' : ''}`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                    isActive ? 'text-brand-primary-dark' : 'text-brand-text-muted'
                  }`}
                />
                {isExpanded && <span className="truncate tracking-tight">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        <div className="p-2 border-t border-brand-border space-y-2">
          <div className={`p-2.5 rounded-xl bg-brand-bg-subtle border border-brand-border flex items-center gap-2.5 ${!isExpanded ? 'justify-center p-2' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center shrink-0 shadow-xs">
              <Store className="w-4 h-4" />
            </div>
            {isExpanded && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-brand-text truncate">{martName}</div>
                <div className="text-[10px] font-medium text-brand-text-muted truncate">Your Rural Mart</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
