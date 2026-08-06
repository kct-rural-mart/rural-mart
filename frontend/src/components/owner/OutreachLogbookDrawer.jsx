import React from 'react';
import OutreachLogRow from './OutreachLogRow';

export default function OutreachLogbookDrawer({ isOpen, onClose, sessions }) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        <div>
          <div style={styles.header}>
            <div>
              <h3 style={styles.title}>👥 Outreach Activity Logbook</h3>
              <p style={styles.subtitle}>Historical village sessions & potential lead records</p>
            </div>
            <button onClick={onClose} style={styles.closeBtn}>✕</button>
          </div>

          <div style={styles.body}>
            {sessions.map((item) => (
              <OutreachLogRow key={item.id} session={item} />
            ))}
          </div>
        </div>

        <div style={styles.footer}>
          <span style={styles.countText}>Total {sessions.length} sessions logged</span>
          <button style={styles.btnExport}>Export Session Summary PDF</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 },
  content: { width: '420px', backgroundColor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.1)' },
  header: { backgroundColor: '#25331e', color: '#ffffff', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { margin: 0, fontSize: '16px', fontWeight: 'bold' },
  subtitle: { margin: '4px 0 0 0', fontSize: '11px', color: '#d1d5db' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' },
  body: { padding: '16px', overflowY: 'auto', flexGrow: 1 },
  footer: { padding: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  countText: { fontSize: '12px', color: '#6b7280' },
  btnExport: { backgroundColor: '#25331e', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }
};