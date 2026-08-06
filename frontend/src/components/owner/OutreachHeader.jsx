import React from 'react';

export default function OutreachHeader({ activeDate, logCount, onOpenDrawer }) {
  return (
    <div style={styles.headerCard}>
      <div>
        <span style={styles.dateBadge}>
          ACTIVE OUTREACH DATE: {activeDate.toUpperCase()}
        </span>
        <h1 style={styles.title}>Farmer Outreach & Field Sessions</h1>
        <p style={styles.subtitle}>
          Track village training camps, farmer leads, and awareness drives for {activeDate}.
        </p>
      </div>

      <button style={styles.btnLogs} onClick={onOpenDrawer}>
        ⏱ Outreach Session Logs ({logCount})
      </button>
    </div>
  );
}

const styles = {
  headerCard: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  dateBadge: {
    display: 'inline-block',
    backgroundColor: '#eaf2e8',
    color: '#2d3a24',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '6px',
    letterSpacing: '0.5px',
    marginBottom: '8px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    margin: '0',
    color: '#111827'
  },
  subtitle: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '4px 0 0 0'
  },
  btnLogs: {
    backgroundColor: '#dcedc8',
    color: '#1b2e15',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer'
  }
};