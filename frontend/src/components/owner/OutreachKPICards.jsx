import React, { useState } from 'react';

export default function OutreachKpiCards() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const kpis = [
    {
      id: 'sessions',
      title: 'TOTAL SESSIONS CONDUCTED',
      value: '18',
      badge: '12 this month',
      subtext: '4 villages covered',
      bgImage: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'farmers',
      title: 'TOTAL FARMERS REACHED',
      value: '1,240',
      badge: '+18.5% growth',
      subtext: 'Avg ~68 / session',
      bgImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'conversion',
      title: 'LEAD CONVERSION RATE',
      value: '34.2%',
      badge: '+4.1% vs target',
      subtext: '424 active buyers',
      bgImage: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'sales',
      title: 'DIRECT FIELD SALES',
      value: '₹1,84,500',
      badge: '+12.8% efficiency',
      subtext: 'Seeds: 40% • Fertilizers: 35%',
      bgImage: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80'
    }
  ];

  return (
    <div style={styles.grid}>
      {kpis.map((kpi) => {
        const isHovered = hoveredCard === kpi.id;

        return (
          <div
            key={kpi.id}
            onMouseEnter={() => setHoveredCard(kpi.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              ...styles.card,
              transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
              boxShadow: isHovered
                ? '0 12px 24px -6px rgba(0, 0, 0, 0.15)'
                : '0 2px 8px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Background Image Container */}
            <div
              style={{
                ...styles.bgLayer,
                backgroundImage: `url(${kpi.bgImage})`,
                transform: isHovered ? 'scale(1.08)' : 'scale(1.0)',
              }}
            />

            {/* Light semi-transparent overlay */}
            <div style={styles.overlay} />

            {/* Card Content */}
            <div style={styles.content}>
              <span style={styles.title}>{kpi.title}</span>
              <h2 style={styles.value}>{kpi.value}</h2>
              
              <div style={styles.badgeRow}>
                <span style={styles.badge}>{kpi.badge}</span>
              </div>

              <span style={styles.subtext}>{kpi.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)', // Strictly 4 columns in one row
    gap: '16px',
    width: '100%',
    marginBottom: '24px'
  },
  card: {
    position: 'relative',
    borderRadius: '18px',
    overflow: 'hidden',
    border: '1px solid rgba(229, 231, 235, 0.8)',
    padding: '16px',
    height: '140px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    boxSizing: 'border-box'
  },
  bgLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'transform 0.4s ease-in-out',
    zIndex: 1
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    backdropFilter: 'blur(1px)',
    zIndex: 2
  },
  content: {
    position: 'relative',
    zIndex: 3,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#374151',
    letterSpacing: '0.4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  value: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#111827',
    margin: '2px 0 4px 0',
    lineHeight: '1.1'
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '2px'
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '6px',
    border: '1px solid #bbf7d0',
    whiteSpace: 'nowrap'
  },
  subtext: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#4b5563',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};