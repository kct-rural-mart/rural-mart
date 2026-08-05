import React, { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  TrendingUp, 
  Briefcase, 
  DollarSign, 
  FileText, 
  Settings, 
  Store,
  Search,
  Bell,
  Calendar,
  X,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserPlus,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Shield
} from 'lucide-react'

const NAV_ITEMS = {
  owner: [
    { to: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/owner/farmers', label: 'Farmers', icon: Users },
    { to: '/owner/products', label: 'Products', icon: Package },
    { to: '/owner/sales', label: 'Sales', icon: TrendingUp },
    { to: '/owner/procurement', label: 'Procurement', icon: Briefcase },
    { to: '/owner/inventory', label: 'Inventory', icon: Package },
    { to: '/owner/outreach', label: 'Outreach Programs', icon: Users },
    { to: '/owner/reports', label: 'Reports', icon: FileText },
    { to: '/owner/finance', label: 'Finance', icon: DollarSign },
    { to: '/owner/settings', label: 'Settings', icon: Settings },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/registrations', label: 'Pending Registrations', icon: FileText },
  ],
}

export default function DashboardLayout({ title }) {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState('2026-08-04')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const profileMenuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const links = NAV_ITEMS[role] ?? NAV_ITEMS.owner

  const handleLogout = async () => {
    try {
      if (signOut) await signOut()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      navigate('/login', { replace: true })
    }
  }

  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'Select Date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'short' })
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: '#F8FAF6' }}>

      {/* SIDEBAR */}
      <aside style={{ width: '260px', backgroundColor: '#1E3316', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px', flexShrink: 0, height: '100%' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#8DAA70', color: '#1E3316', padding: '8px 12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '18px' }}>🌱</div>
            <div>
              <h1 style={{ fontWeight: '800', fontSize: '16px', margin: 0, color: '#fff' }}>Rural Mart</h1>
              <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#8DAA70', margin: 0, textTransform: 'uppercase' }}>Management System</p>
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', maxHeight: 'calc(100vh - 180px)' }}>
            {links.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    backgroundColor: isActive ? '#8DAA70' : 'transparent',
                    color: isActive ? '#1E3316' : '#cbd5e1',
                  })}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        <div style={{ paddingTop: '16px', borderTop: '1px solid #2d4d23' }}>
          <div style={{ backgroundColor: '#2A4420', padding: '12px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #37582b' }}>
            <div style={{ padding: '8px', backgroundColor: '#1E3316', borderRadius: '10px', color: '#8DAA70' }}>
              <Store size={18} />
            </div>
            <div>
              <p style={{ fontWeight: 'bold', fontSize: '12px', color: '#fff', margin: 0 }}>Green Valley Mart</p>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>Store ID: #GV001</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN COLUMN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%', overflow: 'hidden' }}>

        {/* TOPBAR */}
        <header style={{ height: '80px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, zIndex: 30 }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{title || 'Owner Dashboard'}</h1>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Welcome back.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', width: '320px', display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '8px 14px' }}>
              <Search size={16} style={{ color: '#94a3b8', marginRight: '10px', flexShrink: 0 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, records, farmers..."
                style={{ width: '100%', backgroundColor: 'transparent', border: 'none', fontSize: '12px', outline: 'none', color: '#334155' }}
              />
              {searchQuery && (
                <X size={14} style={{ color: '#94a3b8', cursor: 'pointer', marginLeft: '6px' }} onClick={() => setSearchQuery('')} />
              )}
            </div>

            {/* Calendar Button */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => { setShowDatePicker(!showDatePicker); setShowNotifications(false); setShowProfileMenu(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', padding: '9px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}
              >
                <Calendar size={15} style={{ color: '#475569' }} />
                <span>{formatDateDisplay(selectedDate)}</span>
                {showDatePicker ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showDatePicker && (
                <div style={{ position: 'absolute', right: 0, marginTop: '8px', width: '300px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', padding: '16px', zIndex: 50 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#1e293b' }}>Select Business Date</span>
                    <X size={16} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => setShowDatePicker(false)} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input 
                      type="date" 
                      value={selectedDate} 
                      onChange={(e) => { setSelectedDate(e.target.value); setShowDatePicker(false); }}
                      style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px' }} 
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button onClick={() => { setSelectedDate('2026-08-04'); setShowDatePicker(false); }} style={{ backgroundColor: '#1E3316', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Today</button>
                      <button onClick={() => { setSelectedDate('2026-05-25'); setShowDatePicker(false); }} style={{ backgroundColor: '#f1f5f9', color: '#334155', border: 'none', padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Peak Sale</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowDatePicker(false); setShowProfileMenu(false); }}
                style={{ padding: '10px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Bell size={18} />
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', color: '#white', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</span>
              </button>

              {showNotifications && (
                <div style={{ position: 'absolute', right: 0, marginTop: '8px', width: '280px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', padding: '16px', zIndex: 50 }}>
                  <p style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' }}>Notifications (3 unread)</p>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>Low stock alert for Organic NPK Fertilizer.</p>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative', borderLeft: '1px solid #e2e8f0', paddingLeft: '16px' }} ref={profileMenuRef}>
              <button 
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowDatePicker(false); setShowNotifications(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <div>
                  <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#1e293b', margin: 0 }}>Rajesh Kumar</p>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#16a34a', margin: 0, textTransform: 'uppercase' }}>RURAL MART OWNER</p>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" 
                  alt="Rajesh Kumar" 
                  style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #16a34a' }}
                />
              </button>

              {showProfileMenu && (
                <div style={{ position: 'absolute', right: 0, marginTop: '12px', width: '260px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', padding: '16px', zIndex: 50 }}>
                  <div style={{ paddingBottom: '10px', borderBottom: '1px solid #f1f5f9', marginBottom: '10px' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#1e293b' }}>Rajesh Kumar</p>
                    <p style={{ fontSize: '11px', color: '#64748b' }}>{user?.email || 'rajesh.kumar@greenvalley.com'}</p>
                  </div>
                  <button onClick={handleLogout} style={{ width: '100%', padding: '8px', backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* MAIN OUTLET CONTAINER */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px', backgroundColor: '#F8FAF6' }}>
          <Outlet context={{ searchQuery, selectedDate }} />
        </main>

      </div>

    </div>
  )
}