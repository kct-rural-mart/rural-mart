import React, { useState } from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

export default function RevenueChart({ data = [] }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  // Fallback default data if none is passed yet
  const chartData = data.length > 0 ? data : [
    { date: '19 May', revenue: 160000, profit: 62000 },
    { date: '21 May', revenue: 195000, profit: 68000 },
    { date: '23 May', revenue: 210000, profit: 71000 },
    { date: '25 May', revenue: 248750, profit: 78450 },
  ];

  // Dynamic max scale calculation (rounds up to nearest ₹50k for clean grids)
  const maxVal = Math.max(...chartData.map((d) => d.revenue), 100000);
  const yMax = Math.ceil(maxVal / 50000) * 50000;

  // Dynamic peak values for labels
  const peakRevenue = Math.max(...chartData.map((d) => d.revenue));
  const peakProfit = Math.max(...chartData.map((d) => d.profit));

  // Dynamic growth calculation between first and last data entries
  const firstRev = chartData[0]?.revenue || 0;
  const lastRev = chartData[chartData.length - 1]?.revenue || 0;
  const growthRate = firstRev > 0 ? (((lastRev - firstRev) / firstRev) * 100).toFixed(1) : '0.0';
  const isPositiveGrowth = Number(growthRate) >= 0;

  // Map dynamic data to SVG coordinates
  const svgPoints = chartData.map((d, index) => {
    const step = chartData.length > 1 ? 440 / (chartData.length - 1) : 0;
    const x = 20 + index * step;
    const revY = 185 - (d.revenue / yMax) * 165;
    const profY = 185 - (d.profit / yMax) * 165;
    const margin = d.revenue > 0 ? ((d.profit / d.revenue) * 100).toFixed(1) + '%' : '0%';
    return { ...d, x, revY, profY, margin };
  });

  return (
    <div style={styles.card}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <div style={styles.titleRow}>
            <TrendingUp size={18} color="#1E3316" />
            <h3 style={styles.title}>7-DAY REVENUE VS GROSS PROFIT</h3>
          </div>
          <p style={styles.subtitle}>Daily margin divergence over current billing cycle</p>
        </div>
        <div style={{
          ...styles.badge,
          backgroundColor: isPositiveGrowth ? '#f0fdf4' : '#fef2f2',
          borderColor: isPositiveGrowth ? '#dcfce7' : '#fee2e2'
        }}>
          <ArrowUpRight 
            size={14} 
            color={isPositiveGrowth ? '#16a34a' : '#dc2626'} 
            style={{ transform: isPositiveGrowth ? 'none' : 'rotate(90deg)' }}
          />
          <span style={{
            ...styles.badgeText,
            color: isPositiveGrowth ? '#15803d' : '#991b1b'
          }}>
            {isPositiveGrowth ? `+${growthRate}%` : `${growthRate}%`} Growth
          </span>
        </div>
      </div>

      {/* QUICK SUMMARY METRICS BAR */}
      <div style={styles.metricsBar}>
        <div style={styles.metricItem}>
          <span style={styles.metricLabel}>7-Day Peak Revenue</span>
          <span style={styles.metricValue}>₹{peakRevenue.toLocaleString('en-IN')}</span>
        </div>
        <div style={{ width: '1px', backgroundColor: '#e5e7eb' }} />
        <div style={styles.metricItem}>
          <span style={styles.metricLabel}>Average Margin Rate</span>
          <span style={styles.metricValue}>
            {chartData.length > 0
              ? (
                  chartData.reduce((acc, curr) => acc + (curr.profit / curr.revenue), 0) /
                  chartData.length * 100
                ).toFixed(1) + '%'
              : '0%'}
          </span>
        </div>
      </div>

      {/* SVG CHART CONTAINER WITH INTERACTIVE HOVER */}
      <div style={styles.chartContainer}>
        <div style={styles.yAxis}>
          <span>₹{(yMax / 1000).toFixed(0)}k</span>
          <span>₹{((yMax * 0.75) / 1000).toFixed(0)}k</span>
          <span>₹{((yMax * 0.5) / 1000).toFixed(0)}k</span>
          <span>₹{((yMax * 0.25) / 1000).toFixed(0)}k</span>
          <span>₹0</span>
        </div>

        <div style={styles.svgWrapper}>
          <svg
            viewBox="0 0 500 200"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1E3316" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1E3316" stopOpacity="0.01" />
              </linearGradient>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a3b19b" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#a3b19b" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            <line x1="0" y1="20" x2="460" y2="20" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="61" x2="460" y2="61" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="102" x2="460" y2="102" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="143" x2="460" y2="143" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="185" x2="460" y2="185" stroke="#e2e8f0" strokeWidth="1" />

            {/* Area Fills */}
            <polygon
              points={`${svgPoints.map((p) => `${p.x},${p.revY}`).join(' ')} 460,185 20,185`}
              fill="url(#revGrad)"
            />
            <polygon
              points={`${svgPoints.map((p) => `${p.x},${p.profY}`).join(' ')} 460,185 20,185`}
              fill="url(#profitGrad)"
            />

            {/* Lines */}
            <polyline
              points={svgPoints.map((p) => `${p.x},${p.revY}`).join(' ')}
              fill="none"
              stroke="#1E3316"
              strokeWidth="3"
            />
            <polyline
              points={svgPoints.map((p) => `${p.x},${p.profY}`).join(' ')}
              fill="none"
              stroke="#a3b19b"
              strokeWidth="2.5"
            />

            {/* Active Vertical Crosshair */}
            {hoverIndex !== null && svgPoints[hoverIndex] && (
              <line
                x1={svgPoints[hoverIndex].x}
                y1="10"
                x2={svgPoints[hoverIndex].x}
                y2="185"
                stroke="#1E3316"
                strokeDasharray="4 4"
                strokeWidth="1.5"
              />
            )}

            {/* Interactive Data Points & Hover Targets */}
            {svgPoints.map((p, i) => {
              const isHovered = hoverIndex === i;
              return (
                <g key={i} onMouseEnter={() => setHoverIndex(i)} style={{ cursor: 'pointer' }}>
                  <rect x={p.x - 25} y="0" width="50" height="200" fill="transparent" />
                  <circle
                    cx={p.x}
                    cy={p.revY}
                    r={isHovered ? 7 : 4}
                    fill="#1E3316"
                    stroke="#ffffff"
                    strokeWidth={isHovered ? 2 : 1}
                  />
                  <circle
                    cx={p.x}
                    cy={p.profY}
                    r={isHovered ? 6 : 4}
                    fill="#a3b19b"
                    stroke="#ffffff"
                    strokeWidth={isHovered ? 2 : 1}
                  />
                </g>
              );
            })}
          </svg>

          {/* DYNAMIC HOVER TOOLTIP */}
          {hoverIndex !== null && svgPoints[hoverIndex] && (
            <div
              style={{
                ...styles.tooltip,
                left: `${(svgPoints[hoverIndex].x / 460) * 80 + 5}%`,
                top: `${svgPoints[hoverIndex].revY - 50}px`,
              }}
            >
              <div style={styles.tooltipDate}>{svgPoints[hoverIndex].date}</div>
              <div style={styles.tooltipRow}>
                <span>Revenue:</span>
                <strong>₹{svgPoints[hoverIndex].revenue.toLocaleString('en-IN')}</strong>
              </div>
              <div style={styles.tooltipRow}>
                <span>Gross Profit:</span>
                <strong style={{ color: '#15803d' }}>
                  ₹{svgPoints[hoverIndex].profit.toLocaleString('en-IN')}
                </strong>
              </div>
              <div style={styles.tooltipRow}>
                <span>Margin:</span>
                <strong style={{ color: '#2563eb' }}>{svgPoints[hoverIndex].margin}</strong>
              </div>
            </div>
          )}

          {/* X-Axis Labels */}
          <div style={styles.xAxis}>
            {chartData.map((d, index) => (
              <span
                key={index}
                style={{
                  color: hoverIndex === index ? '#1E3316' : '#64748b',
                  fontWeight: hoverIndex === index ? '800' : '600',
                }}
              >
                {d.date}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* LEGEND */}
      <div style={styles.legendRow}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.dot, backgroundColor: '#1E3316' }} />
          <span style={styles.legendText}>
            Revenue <strong>(Peak: ₹{(peakRevenue / 100000).toFixed(2)}L)</strong>
          </span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.dot, backgroundColor: '#a3b19b' }} />
          <span style={styles.legendText}>
            Gross Profit <strong>(Peak: ₹{(peakProfit / 1000).toFixed(0)}k)</strong>
          </span>
        </div>
      </div>

      {/* RECENT LOGGED ACTIVITY FEED */}
      <div style={styles.activityCard}>
        <div style={styles.activityHeader}>
          <span style={styles.activityTitle}>RECENT LOGGED ENTRIES</span>
          <span style={styles.activityCount}>{chartData.length} entries tracked</span>
        </div>
        <div style={styles.activityList}>
          {chartData.slice(-3).reverse().map((item, idx) => (
            <div key={idx} style={styles.activityRow}>
              <div style={styles.activityLeft}>
                <div style={styles.miniDot} />
                <span style={styles.activityDate}>{item.date}</span>
              </div>
              <div style={styles.activityRight}>
                <span style={styles.activityRev}>Rev: ₹{item.revenue.toLocaleString('en-IN')}</span>
                <span style={{
                  ...styles.activityProf,
                  color: item.profit < 0 ? '#dc2626' : '#15803d'
                }}>
                  Profit: ₹{item.profit.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#111827',
    letterSpacing: '0.5px',
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '8px',
    border: '1px solid',
  },
  badgeText: {
    fontSize: '11px',
    fontWeight: '700',
  },
  metricsBar: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    backgroundColor: '#f8faf6',
    borderRadius: '12px',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  metricLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#1E3316',
    marginTop: '2px',
  },
  chartContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'stretch',
    paddingTop: '8px',
    position: 'relative',
  },
  yAxis: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    paddingBottom: '24px',
  },
  svgWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  xAxis: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    paddingTop: '8px',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#1e293b',
    color: '#ffffff',
    padding: '10px 12px',
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    fontSize: '11px',
    pointerEvents: 'none',
    zIndex: 20,
    whiteSpace: 'nowrap',
    transform: 'translate(-50%, -50%)',
    transition: 'all 0.15s ease-out',
  },
  tooltipDate: {
    fontWeight: '800',
    marginBottom: '4px',
    borderBottom: '1px solid #334155',
    paddingBottom: '4px',
    color: '#94a3b8',
  },
  tooltipRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    marginTop: '3px',
  },
  legendRow: {
    display: 'flex',
    gap: '24px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '12px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  legendText: {
    fontSize: '12px',
    color: '#4b5563',
  },
  activityCard: {
    backgroundColor: '#fafafa',
    borderRadius: '12px',
    padding: '14px 16px',
    border: '1px solid #f0f0f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  activityHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: '8px',
  },
  activityTitle: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: '0.4px',
  },
  activityCount: {
    fontSize: '10px',
    color: '#94a3b8',
    fontWeight: '600',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  activityRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
  },
  activityLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  miniDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#1E3316',
  },
  activityDate: {
    fontWeight: '700',
    color: '#334155',
  },
  activityRight: {
    display: 'flex',
    gap: '16px',
    fontSize: '11px',
  },
  activityRev: {
    color: '#64748b',
  },
  activityProf: {
    fontWeight: '700',
  },
};