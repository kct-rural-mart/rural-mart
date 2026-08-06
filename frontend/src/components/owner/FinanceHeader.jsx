import React from 'react';
import { BookOpen } from 'lucide-react';

export default function FinanceHeader({ activeDate = '6 Aug 2026', ledgerCount = 3, onOpenLedger }) {
  return (
    <div style={styles.container}>
      <div>
        <div style={styles.badgeRow}>
          <span style={styles.dateBadge}>ACTIVE BUSINESS DATE: {activeDate}</span>
        </div>
        <h1 style={styles.title}>Financial Audit & Accounting Dashboard</h1>
        <p style={styles.subtitle}>
          Calculate gross margins, operational overheads, and edit daily ledger logs.
        </p>
      </div>

      <button onClick={onOpenLedger} style={styles.ledgerBtn}>
        <BookOpen size={16} />
        <span>Historical Audit Ledger Logs ({ledgerCount})</span>
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e5e7eb',
  },
  badgeRow: {
    marginBottom: '8px',
  },
  dateBadge: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '6px',
    letterSpacing: '0.5px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#111827',
    margin: '4px 0',
  },
  subtitle: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },
  ledgerBtn: {
    backgroundColor: '#1E3316',
    color: '#ffffff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
};