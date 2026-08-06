import React, { useState } from 'react';
import TopicTagInput from './TopicTagInput';

export default function OutreachForm({ onSave }) {
  const [sessionDate, setSessionDate] = useState('2026-08-06');

  // Dynamic state for dropdowns
  const [activityTypes, setActivityTypes] = useState([
    'Product Demonstration',
    'Farmer Training Session',
    'Awareness Programme',
    'Soil Testing Drive',
    'Veterinary Camp',
    'Crop Advisory Workshop'
  ]);
  const [activityType, setActivityType] = useState('Product Demonstration');

  const [villages, setVillages] = useState([
    'Green Valley',
    'Karamadai',
    'Thudiyalur'
  ]);
  const [village, setVillage] = useState('Green Valley');

  const [description, setDescription] = useState('');
  const [attended, setAttended] = useState('');
  const [topics, setTopics] = useState(['Soil Health', 'Organic Fertilizers', 'Dairy Farming']);

  // Modal State
  const [modalType, setModalType] = useState(null); // 'activity' | 'village' | null
  const [inputValue, setInputValue] = useState('');

  const calculatedLeads = attended ? Math.max(0, Math.floor(Number(attended) * 0.35)) : 0;

  // Handle dropdown selections
  const handleActivityChange = (e) => {
    const val = e.target.value;
    if (val === 'ADD_CUSTOM_ACTIVITY') {
      setModalType('activity');
      setInputValue('');
    } else {
      setActivityType(val);
    }
  };

  const handleVillageChange = (e) => {
    const val = e.target.value;
    if (val === 'ADD_CUSTOM_VILLAGE') {
      setModalType('village');
      setInputValue('');
    } else {
      setVillage(val);
    }
  };

  // Handle modal submit
  const handleModalAdd = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (modalType === 'activity') {
      const newType = inputValue.trim();
      setActivityTypes((prev) => [...prev, newType]);
      setActivityType(newType);
    } else if (modalType === 'village') {
      const newVillage = inputValue.trim();
      setVillages((prev) => [...prev, newVillage]);
      setVillage(newVillage);
    }

    setModalType(null);
    setInputValue('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({
        sessionDate,
        activityType,
        village,
        description,
        attended,
        topics
      });
    }
  };

  const handleClear = () => {
    setSessionDate('2026-08-06');
    setActivityType(activityTypes[0]);
    setVillage(villages[0]);
    setDescription('');
    setAttended('');
    setTopics(['Soil Health', 'Organic Fertilizers', 'Dairy Farming']);
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, color: '#111827' }}>
          👥 RECORD VILLAGE OUTREACH & FARMER EVENT
        </h2>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>Event Verification Required</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={styles.row}>
          {/* Session Date */}
          <div style={styles.group}>
            <label style={styles.label}>Session Date *</label>
            <input 
              type="date" 
              value={sessionDate} 
              onChange={(e) => setSessionDate(e.target.value)} 
              style={styles.input} 
              required 
            />
          </div>

          {/* Activity Type Dropdown */}
          <div style={styles.group}>
            <label style={styles.label}>Activity Type *</label>
            <select value={activityType} onChange={handleActivityChange} style={styles.select}>
              {activityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
              <option value="ADD_CUSTOM_ACTIVITY" style={{ fontWeight: 'bold', color: '#25331e' }}>
                + Add New Custom Activity Type...
              </option>
            </select>
          </div>

          {/* Village Dropdown */}
          <div style={styles.group}>
            <label style={styles.label}>Village / Gram Panchayat *</label>
            <select value={village} onChange={handleVillageChange} style={styles.select}>
              {villages.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
              <option value="ADD_CUSTOM_VILLAGE" style={{ fontWeight: 'bold', color: '#25331e' }}>
                + Add New Custom Village...
              </option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div style={{ ...styles.group, marginBottom: '20px' }}>
          <label style={styles.label}>Brief Description of Activity *</label>
          <textarea 
            rows={3} 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key highlights, product trials, and farmer feedback..."
            style={styles.textarea}
            required
          />
        </div>

        {/* Attendance & Auto-calculated Leads */}
        <div style={{ ...styles.row, gridTemplateColumns: '1fr 1fr', alignItems: 'center' }}>
          <div style={styles.group}>
            <label style={styles.label}>Total Farmers Attended *</label>
            <input 
              type="number" 
              value={attended} 
              onChange={(e) => setAttended(e.target.value)}
              placeholder="e.g. 65"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.leadsBox}>
            <span style={styles.leadsLabel}>AUTO CALCULATED NEW POTENTIAL LEADS</span>
            <h4 style={styles.leadsValue}>{calculatedLeads} New Farmers</h4>
          </div>
        </div>

        {/* Topics Covered */}
        <div style={{ marginTop: '20px' }}>
          <TopicTagInput 
            topics={topics}
            onAddTopic={(tag) => setTopics([...topics, tag])}
            onRemoveTopic={(tag) => setTopics(topics.filter(t => t !== tag))}
          />
        </div>

        {/* Action Buttons */}
        <div style={styles.footer}>
          <button type="button" onClick={handleClear} style={styles.btnClear}>Clear Form</button>
          <button type="submit" style={styles.btnSave}>Save Outreach Session</button>
        </div>
      </form>

      {/* Custom Add Modal */}
      {modalType && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                + Add Custom {modalType === 'activity' ? 'Activity Type' : 'Village'}
              </h3>
              <button 
                type="button" 
                onClick={() => setModalType(null)} 
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModalAdd}>
              <div style={{ marginBottom: '20px' }}>
                <label style={styles.modalLabel}>
                  New {modalType === 'activity' ? 'Activity Name' : 'Village Name'}
                </label>
                <input
                  type="text"
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    modalType === 'activity' 
                      ? 'e.g. Dairy Nutrition Masterclass' 
                      : 'e.g. Annur Panchayat'
                  }
                  style={styles.modalInput}
                  required
                />
              </div>

              <div style={styles.modalFooter}>
                <button 
                  type="button" 
                  onClick={() => setModalType(null)} 
                  style={styles.modalCancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.modalSubmitBtn}>
                  Add {modalType === 'activity' ? 'Activity Type' : 'Village'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: { backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', position: 'relative' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px', marginBottom: '24px' },
  row: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' },
  group: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px' },
  input: { width: '100%', padding: '10px 14px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', color: '#111827', boxSizing: 'border-box' },
  select: { width: '100%', padding: '10px 14px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', color: '#111827', boxSizing: 'border-box', cursor: 'pointer' },
  textarea: { width: '100%', padding: '10px 14px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', color: '#111827', resize: 'vertical', boxSizing: 'border-box' },
  leadsBox: { backgroundColor: '#f0f7ed', border: '1px solid #d0e2c8', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  leadsLabel: { fontSize: '10px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.5px' },
  leadsValue: { fontSize: '20px', fontWeight: '800', margin: 0, color: '#111827' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '20px', marginTop: '24px' },
  btnClear: { backgroundColor: '#ffffff', border: '1px solid #d1d5db', color: '#374151', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' },
  btnSave: { backgroundColor: '#25331e', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' },
  
  // Modal Styles matching screenshot design
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#ffffff', borderRadius: '24px', padding: '28px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  modalTitle: { fontSize: '18px', fontWeight: '800', margin: 0, color: '#111827' },
  closeBtn: { border: 'none', background: 'none', fontSize: '18px', color: '#6b7280', cursor: 'pointer' },
  modalLabel: { display: 'block', fontSize: '13px', fontWeight: '700', color: '#111827', marginBottom: '8px' },
  modalInput: { width: '100%', padding: '12px 16px', borderRadius: '20px', border: '2px solid #111827', outline: 'none', fontSize: '14px', boxSizing: 'border-box' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },
  modalCancelBtn: { border: '1px solid #d1d5db', backgroundColor: '#ffffff', padding: '10px 20px', borderRadius: '20px', fontWeight: '700', color: '#4b5563', cursor: 'pointer' },
  modalSubmitBtn: { backgroundColor: '#25331e', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: '700', cursor: 'pointer' }
};