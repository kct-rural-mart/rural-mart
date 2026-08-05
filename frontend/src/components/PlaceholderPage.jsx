import React from 'react'

export default function PlaceholderPage({ title, subtitle, icon: Icon }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', backgroundColor: '#F8FAF6', minHeight: '100%', paddingBottom: '32px' }}>
      <section style={{ backgroundColor: '#ffffff', padding: '48px 32px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '16px', minHeight: '400px' }}>
        {Icon && (
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#EAEFE6', color: '#1E3316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={30} />
          </div>
        )}
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#1e293b', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>{title}</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0, maxWidth: '420px' }}>{subtitle || 'This module is under development.'}</p>
        </div>
      </section>
    </div>
  )
}
