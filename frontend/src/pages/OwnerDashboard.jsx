import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Calendar, 
  Package, 
  Users, 
  ArrowUpRight, 
  TrendingUp, 
  DollarSign, 
  Briefcase 
} from 'lucide-react';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { theme } = useOutletContext() || { theme: 'light' };
  const isDark = theme === 'dark';

  return (
    <div style={{ paddingBottom: '40px' }}>
      
      {/* Top Banner Overview */}
      <div style={{ 
        backgroundColor: isDark ? '#1f2937' : '#ffffff', 
        borderRadius: '20px', 
        padding: '28px 32px', 
        border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`,
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a' }}></span>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Hub • 5 Aug 2026</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: isDark ? '#f9fafb' : '#1e293b', margin: '0 0 6px 0' }}>
            RuralMart Operations & Executive Overview
          </h2>
          <p style={{ fontSize: '13px', color: isDark ? '#9ca3af' : '#64748b', margin: 0 }}>
            Real-time synchronization across all regional outlets, stock movements, and outreach conversions.
          </p>
        </div>
      </div>

      {/* Action Cards Grid (Direct Navigation) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        
        {/* 1. Daily Business Entry Card */}
        <div 
          onClick={() => navigate('/owner/daily-business')}
          style={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderRadius: '20px',
            padding: '28px',
            border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = '#16a34a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = isDark ? '#374151' : '#e2e8f0';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '14px', 
              backgroundColor: isDark ? '#111827' : '#EAEFE6', 
              color: '#1E3316', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Calendar size={22} />
            </div>
            <ArrowUpRight size={20} style={{ color: isDark ? '#9ca3af' : '#64748b' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: isDark ? '#f9fafb' : '#1e293b', margin: '0 0 8px 0' }}>
            Daily Business Entry
          </h3>
          <p style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#64748b', margin: 0, lineHeight: '1.5' }}>
            Record sales value, stock counts, bills, and farmer purchase lookup.
          </p>
        </div>

        {/* 2. Manage Products & Inventory Card */}
        <div 
          onClick={() => navigate('/owner/product-inventory')}
          style={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderRadius: '20px',
            padding: '28px',
            border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = '#16a34a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = isDark ? '#374151' : '#e2e8f0';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '14px', 
              backgroundColor: isDark ? '#111827' : '#EAEFE6', 
              color: '#1E3316', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Package size={22} />
            </div>
            <ArrowUpRight size={20} style={{ color: isDark ? '#9ca3af' : '#64748b' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: isDark ? '#f9fafb' : '#1e293b', margin: '0 0 8px 0' }}>
            Manage Products & Inventory
          </h3>
          <p style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#64748b', margin: 0, lineHeight: '1.5' }}>
            Add new agricultural items, update stock levels, and review category breakdowns.
          </p>
        </div>

        {/* 3. Farmer Outreach Sessions Card */}
        <div 
          onClick={() => navigate('/owner/farmer-outreach')}
          style={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderRadius: '20px',
            padding: '28px',
            border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = '#16a34a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = isDark ? '#374151' : '#e2e8f0';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '14px', 
              backgroundColor: isDark ? '#111827' : '#EAEFE6', 
              color: '#1E3316', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Users size={22} />
            </div>
            <ArrowUpRight size={20} style={{ color: isDark ? '#9ca3af' : '#64748b' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: isDark ? '#f9fafb' : '#1e293b', margin: '0 0 8px 0' }}>
            Farmer Outreach Sessions
          </h3>
          <p style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#64748b', margin: 0, lineHeight: '1.5' }}>
            Log village training sessions, total attendees, and new lead conversions.
          </p>
        </div>

      </div>
    </div>
  );
}