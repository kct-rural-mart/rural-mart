import React, { useState } from 'react';

export default function TopicTagInput({ topics, onAddTopic, onRemoveTopic }) {
  const [isAdding, setIsAdding] = useState(false);
  const [inputVal, setInputVal] = useState('');

  const handleAdd = () => {
    if (inputVal.trim()) {
      onAddTopic(inputVal.trim());
      setInputVal('');
      setIsAdding(false);
    }
  };

  return (
    <div>
      <label style={styles.label}>Topics Covered in Session</label>
      <div style={styles.tagList}>
        {topics.map((tag, i) => (
          <span key={i} style={styles.tag}>
            {tag}
            <button type="button" onClick={() => onRemoveTopic(tag)} style={styles.removeBtn}>✕</button>
          </span>
        ))}
      </div>

      {isAdding ? (
        <div style={{ display: 'flex', gap: '8px', maxWidth: '300px' }}>
          <input 
            type="text" 
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="e.g. Silage Preservation"
            style={styles.input}
          />
          <button type="button" onClick={handleAdd} style={styles.addConfirmBtn}>Add</button>
        </div>
      ) : (
        <button type="button" onClick={() => setIsAdding(true)} style={styles.addTagBtn}>
          + Add Tag
        </button>
      )}
    </div>
  );
}

const styles = {
  label: { fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '8px' },
  tagList: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' },
  tag: { backgroundColor: '#2d3a24', color: '#ffffff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' },
  removeBtn: { background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '12px', padding: 0 },
  input: { width: '100%', padding: '6px 10px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' },
  addConfirmBtn: { backgroundColor: '#2d3a24', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' },
  addTagBtn: { backgroundColor: '#dcedc8', color: '#1b2e15', border: 'none', padding: '6px 14px', borderRadius: '16px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }
};