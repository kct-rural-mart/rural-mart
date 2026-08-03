import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = {
  owner: [{ to: '/owner/dashboard', label: 'Dashboard', icon: 'grid' }],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: 'grid' },
    { to: '/admin/registrations', label: 'Pending Registrations', icon: 'list' },
  ],
}

const ICONS = {
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  ),
  list: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="3.5" cy="6" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
}

export default function DashboardLayout({ title }) {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()
  const links = NAV_ITEMS[role] ?? []
  const initials = (user?.email?.[0] ?? '?').toUpperCase()

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo" title="Rural Mart">
          RM
        </div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              title={link.label}
              aria-label={link.label}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              {ICONS[link.icon]}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-avatar" title={user?.email ?? ''}>
            {initials}
          </div>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <div className="topbar-title">{title}</div>
          <div className="topbar-user">
            <span className="topbar-email">{user?.email}</span>
            {role && <span className="badge badge-approved">{role}</span>}
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
