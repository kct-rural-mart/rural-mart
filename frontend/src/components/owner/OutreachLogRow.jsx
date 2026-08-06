import React from 'react';
import StatusBadge from '../common/StatusBadge';

export default function OutreachLogRow({ session }) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <strong style={styles.title}>{session.title}</strong>
          <span style={styles.date}>{session.date}</span>
        </div>
        {/* Reusing your common StatusBadge component */}
        <StatusBadge status={session.status} />
      </div>

      <p style={styles.desc}>{session.description}</p>

      <div style={styles.tagGroup}>
        {session.tags.map((t, idx) => (
          <span key={idx} style={styles.tag}>{t}</span>
        ))}
      </div>

      <div style={styles.metrics}>
        <span>Attended: {session.attended}</span>
        <span>Existing: {session.existing}</span>
        <span style={{ color: '#16a34a' }}>New Leads: +{session.newLeads}</span>
      </div>
    </div>
  );
}

const styles = {
  card: { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', marginBottom: '12px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  title: { fontSize: '13px', display: 'block' },
  date: { fontSize: '11px', color: '#6b7280' },
  desc: { fontSize: '12px', color: '#4b5563', margin: '8px 0' },
  tagGroup: { display: 'flex', gap: '4px', marginBottom: '8px' },
  tag: { fontSize: '10px', background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' },
  metrics: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }
};