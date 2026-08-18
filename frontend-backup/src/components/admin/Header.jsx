import { useMemo, useState } from 'react'
import { Filter, Calendar, Bell, ChevronDown, LogOut } from 'lucide-react'
import { getRuralMarts } from '../../lib/newPages/shared/dataServices'

export default function Header({
  title = 'Executive Overview',
  filters,
  setFilters,
  onOpenExportModal,
  onOpenNotificationsPopover,
  unreadAlertCount,
  onLogout,
  adminName = 'Admin',
  adminEmail = '',
  adminRole = 'Administrator',
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  const districts = ['All Districts', 'Erode', 'Coimbatore', 'Tiruppur', 'Salem', 'Madurai']
  const ruralMarts = useMemo(() => {
    const canonicalMarts = getRuralMarts()
    if (canonicalMarts.length === 0) return ['All Rural Marts']
    return ['All Rural Marts', ...canonicalMarts.map((m) => m.ruralMartName.replace(' Rural Mart', ''))]
  }, [])
  const dateRanges = ['Last 30 Days', 'This Quarter (Q3)', 'Financial Year 2026-27', 'Year to Date 2026']

  return (
    <header className="bg-brand-surface/95 dark:bg-[#121E19]/95 backdrop-blur-md border-b border-brand-border dark:border-[#1E3129] px-4 md:px-6 py-2.5 transition-colors duration-150 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Page Title */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-brand-text dark:text-[#E6ECE8]">
                {title}
              </h1>
            </div>
          </div>
        </div>

        {/* Global Controls & Action Bar */}
        <div className="flex flex-wrap items-center gap-2 md:gap-2">
          {/* District Filter */}
          <div className="relative">
            <select
              value={filters.district}
              onChange={(e) => setFilters((prev) => ({ ...prev, district: e.target.value }))}
              className="h-8 appearance-none pl-3 pr-7 text-xs font-medium rounded-lg border border-brand-border dark:border-[#1E3129] bg-brand-bg-subtle dark:bg-[#16241E] text-brand-text dark:text-[#E6ECE8] focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
            >
              {districts.map((dst) => (
                <option key={dst} value={dst}>
                  {dst}
                </option>
              ))}
            </select>
            <Filter className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-brand-text-subtle dark:text-[#61736A] pointer-events-none" />
          </div>

          {/* Date Range Selector */}
          <div className="relative">
            <div className="flex items-center">
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value }))}
                className="h-8 appearance-none pl-7 pr-7 text-xs font-medium rounded-lg border border-brand-border dark:border-[#1E3129] bg-brand-bg-subtle dark:bg-[#16241E] text-brand-text dark:text-[#E6ECE8] focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
              >
                {dateRanges.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
              <Calendar className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-brand-text-subtle dark:text-[#61736A] pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-brand-text-subtle dark:text-[#61736A] pointer-events-none" />
            </div>
          </div>

          {/* Notification Button */}
          <button
            onClick={onOpenNotificationsPopover}
            className="h-8 w-8 flex items-center justify-center relative rounded-lg border border-brand-border dark:border-[#1E3129] bg-brand-surface dark:bg-[#121E19] hover:bg-brand-bg dark:hover:bg-[#182921] text-brand-text dark:text-[#E6ECE8] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-danger text-white text-[9px] font-bold flex items-center justify-center">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* Export Button */}
          <button
            onClick={onOpenExportModal}
            className="h-8 px-3 flex items-center gap-1.5 rounded-lg border border-brand-border dark:border-[#1E3129] bg-brand-surface dark:bg-[#121E19] hover:bg-brand-bg dark:hover:bg-[#182921] text-brand-text dark:text-[#E6ECE8] text-xs font-semibold transition-colors"
            title="Export report"
          >
            Export
          </button>

          {/* Admin Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="h-8 flex items-center gap-2 pl-1.5 pr-2 rounded-lg border border-brand-border dark:border-[#1E3129] bg-brand-surface dark:bg-[#121E19] hover:bg-brand-bg dark:hover:bg-[#182921] transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-brand-primary text-white font-bold text-[10px] flex items-center justify-center shrink-0 border border-brand-primary-dark/20">
                {adminName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col text-left hidden sm:flex">
                <span className="text-xs font-bold text-brand-text dark:text-[#E6ECE8] leading-tight">
                  {adminName}
                </span>
                <span className="text-[9px] font-semibold text-brand-text-muted dark:text-[#8E9E96]">
                  {adminRole}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-brand-text-subtle ml-0.5" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-brand-surface dark:bg-[#121E19] border border-brand-border dark:border-[#1E3129] rounded-xl shadow-lg py-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-brand-border/60 dark:border-[#16241E]">
                  <p className="font-bold text-brand-text dark:text-[#E6ECE8]">{adminName}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-primary dark:text-[#A3E6C5]">{adminRole}</p>
                  {adminEmail && <p className="text-[11px] text-brand-text-muted dark:text-[#8E9E96]">{adminEmail}</p>}
                </div>
                {onLogout && (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false)
                      onLogout()
                    }}
                    className="w-full text-left px-3 py-2 text-brand-danger dark:text-red-400 hover:bg-brand-danger-light dark:hover:bg-[#3D1717] flex items-center gap-2 cursor-pointer border-t border-brand-border/60 dark:border-[#16241E]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
