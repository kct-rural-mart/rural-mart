import { useState } from 'react'
import { Search, Calendar, Bell, ChevronDown, LogOut } from 'lucide-react'

export default function OwnerHeader({
  searchQuery,
  setSearchQuery,
  dateRange,
  setDateRange,
  unreadCount,
  onOpenNotifications,
  onLogout,
  ownerName = 'Owner',
  ownerEmail = '',
  martName = 'Rural Mart',
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  const dateRanges = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month']

  return (
    <header className="bg-brand-surface/95 backdrop-blur-md border-b border-brand-border px-4 md:px-6 py-2.5 transition-colors duration-150 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-brand-text">Owner Dashboard</h1>
            <p className="text-xs font-medium text-brand-text-muted">Welcome back.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-2.5">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, records, farmers..."
              className="h-8 w-48 sm:w-64 pl-8 pr-3 text-xs font-medium rounded-lg border border-brand-border bg-brand-bg-subtle text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary placeholder-brand-text-subtle"
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-text-subtle pointer-events-none" />
          </div>

          <div className="relative">
            <div className="flex items-center">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="h-8 appearance-none pl-7 pr-7 text-xs font-medium rounded-lg border border-brand-border bg-brand-bg-subtle text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
              >
                {dateRanges.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
              <Calendar className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-brand-text-subtle pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-brand-text-subtle pointer-events-none" />
            </div>
          </div>

          <button
            onClick={onOpenNotifications}
            className="h-8 w-8 flex items-center justify-center relative rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-bg text-brand-text transition-colors cursor-pointer"
            title="Mart Alerts & Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-danger text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="h-9 flex items-center gap-2 pl-1.5 pr-2 rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-bg transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-brand-primary text-white font-bold text-xs flex items-center justify-center shrink-0 border border-brand-primary-dark/20">
                {ownerName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col text-left hidden sm:flex">
                <span className="text-xs font-bold text-brand-text leading-tight">{ownerName}</span>
                <span className="text-[9px] font-bold tracking-wider text-brand-text-muted">RURAL MART OWNER</span>
              </div>
              <ChevronDown className="w-3 h-3 text-brand-text-subtle ml-0.5" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-brand-surface border border-brand-border rounded-xl shadow-lg py-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-brand-border/60">
                  <p className="font-bold text-brand-text">{ownerName}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">RURAL MART OWNER</p>
                  <p className="text-[11px] text-brand-text-muted">{martName}</p>
                  {ownerEmail && <p className="text-[11px] text-brand-text-muted">{ownerEmail}</p>}
                </div>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false)
                    onLogout()
                  }}
                  className="w-full text-left px-3 py-2 text-brand-danger hover:bg-brand-danger-light flex items-center gap-2 cursor-pointer border-t border-brand-border/60"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
