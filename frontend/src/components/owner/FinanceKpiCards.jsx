import React, { useState } from 'react';

export default function FinanceKpiCards() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const kpis = [
    {
      title: 'TOTAL REVENUE',
      value: '₹2,48,750',
      change: '+12.8% vs last month',
      bgImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=80', // Currency / cash flow
    },
    {
      title: 'GROSS PROFIT',
      value: '₹78,450',
      change: '+8.6% margin growth',
      bgImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80', // Vector illustration style growth & coin stack
    },
    {
      title: 'NET PROFIT',
      value: '₹42,360',
      change: '+10.3% net retainage',
      bgImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80', // Stacks of coins / net gains
    },
    {
      title: 'OPERATING EXPENSES',
      value: '₹36,090',
      change: '-4.2% overhead reduction',
      bgImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', // Ledger & calculator / expense tracking
    },
  ];

  return (
    <div style={styles.gridContainer}>
      {kpis.map((kpi, index) => {
        const isHovered = hoveredIndex === index;
        const overlayOpacity = isHovered ? '0.82' : '0.93';

        return (
          <div 
            key={index} 
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              ...styles.card,
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, ${overlayOpacity}), rgba(255, 255, 255, ${overlayOpacity})), 
                url('${kpi.bgImage}')
              `,
              transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
              boxShadow: isHovered 
                ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div style={styles.title}>{kpi.title}</div>
            <div style={styles.value}>{kpi.value}</div>
            <div style={styles.changeRow}>
              <span style={styles.changeText}>{kpi.change}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
  },
  card: {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.25s ease-in-out',
    cursor: 'pointer',
  },
  title: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  value: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '8px',
  },
  changeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  changeText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#16a34a',
  },
};