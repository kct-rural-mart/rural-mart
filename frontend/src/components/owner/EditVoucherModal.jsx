import React, { useState, useEffect } from 'react'
import { X, Trash2, Edit3, Plus, Check } from 'lucide-react'

export default function EditVoucherModal({ isOpen, voucher, onClose, onSave, onDelete }) {
  if (!isOpen || !voucher) return null

  // Options State
  const [operationOptions, setOperationOptions] = useState([
    'Retail Sales & Procurement',
    'Bulk Wholesaling',
    'Inventory Restock & Feed Purchase',
  ])
  
  // Custom Type Adding State
  const [isAddingCustom, setIsAddingCustom] = useState(false)
  const [newCustomType, setNewCustomType] = useState('')

  // Form Fields State
  const [auditDate, setAuditDate] = useState(voucher.dateRaw || '25 May 2024')
  const [status, setStatus] = useState(voucher.status || 'Edited')
  const [operationType, setOperationType] = useState(voucher.tag || 'Retail Sales & Procurement')
  const [grossRevenue, setGrossRevenue] = useState(voucher.revenueNum || 248750)
  const [procurementCosts, setProcurementCosts] = useState(voucher.procurementNum || 170300)
  const [operatingExpenses, setOperatingExpenses] = useState(voucher.expensesNum || 36090)

  // Real-time calculations
  const grossProfit = (Number(grossRevenue) || 0) - (Number(procurementCosts) || 0)
  const netProfit = grossProfit - (Number(operatingExpenses) || 0)

  useEffect(() => {
    if (voucher) {
      setStatus(voucher.status || 'Edited')
      setOperationType(voucher.tag || 'Retail Sales & Procurement')
      // Ensure current tag is present in options list
      if (voucher.tag && !operationOptions.includes(voucher.tag)) {
        setOperationOptions((prev) => [...prev, voucher.tag])
      }
    }
  }, [voucher])

  const handleAddCustomType = () => {
    const trimmed = newCustomType.trim()
    if (trimmed) {
      if (!operationOptions.includes(trimmed)) {
        setOperationOptions((prev) => [...prev, trimmed])
      }
      setOperationType(trimmed)
      setNewCustomType('')
      setIsAddingCustom(false)
    }
  }

  const handleSave = () => {
    onSave({
      ...voucher,
      status,
      tag: operationType,
      revenue: `₹${Number(grossRevenue).toLocaleString('en-IN')}`,
      procurement: `₹${Number(procurementCosts).toLocaleString('en-IN')}`,
      expenses: `₹${Number(operatingExpenses).toLocaleString('en-IN')}`,
      net: `₹${netProfit.toLocaleString('en-IN')}`,
    })
    onClose()
  }

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit3 size={18} color="#1E3316" />
              <h2 style={styles.title}>Edit Financial Audit Voucher (FIN-01)</h2>
            </div>
            <p style={styles.subtitle}>Modify financial values, operation types, and recalculate margins.</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={18} color="#64748b" />
          </button>
        </div>

        {/* FORM BODY */}
        <div style={styles.body}>
          {/* Row 1: Date & Status */}
          <div style={styles.rowTwoCol}>
            <div>
              <label style={styles.label}>Audit Date *</label>
              <input
                type="text"
                style={styles.input}
                value={auditDate}
                onChange={(e) => setAuditDate(e.target.value)}
              />
            </div>
            <div>
              <label style={styles.label}>Status *</label>
              <select
                style={styles.select}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Saved">Saved</option>
                <option value="Edited">Edited</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Row 2: Operation Type */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={styles.label}>Type of Operation *</label>
              {!isAddingCustom && (
                <button 
                  style={styles.addCustomBtn} 
                  type="button" 
                  onClick={() => setIsAddingCustom(true)}
                >
                  <Plus size={12} /> Add New Custom Type
                </button>
              )}
            </div>

            {isAddingCustom ? (
              <div style={styles.inlineAddContainer}>
                <input
                  type="text"
                  placeholder="Enter custom operation name..."
                  value={newCustomType}
                  onChange={(e) => setNewCustomType(e.target.value)}
                  style={styles.inlineInput}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCustomType()
                  }}
                />
                <button type="button" onClick={handleAddCustomType} style={styles.confirmAddBtn}>
                  <Check size={14} /> Add
                </button>
                <button type="button" onClick={() => setIsAddingCustom(false)} style={styles.cancelAddBtn}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <select
                style={styles.select}
                value={operationType}
                onChange={(e) => setOperationType(e.target.value)}
              >
                {operationOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Row 3: Gross Revenue */}
          <div>
            <label style={styles.label}>Gross Revenue (₹) *</label>
            <input
              type="number"
              style={styles.input}
              value={grossRevenue}
              onChange={(e) => setGrossRevenue(e.target.value)}
            />
          </div>

          {/* Row 4: Procurement Costs */}
          <div>
            <label style={styles.label}>Procurement Costs (₹) *</label>
            <input
              type="number"
              style={styles.input}
              value={procurementCosts}
              onChange={(e) => setProcurementCosts(e.target.value)}
            />
          </div>

          {/* Row 5: Operating Expenses */}
          <div>
            <label style={styles.label}>Operating Expenses (₹) *</label>
            <input
              type="number"
              style={styles.input}
              value={operatingExpenses}
              onChange={(e) => setOperatingExpenses(e.target.value)}
            />
          </div>

          {/* PROFIT SUMMARY */}
          <div style={styles.profitCardsRow}>
            <div style={styles.grossCard}>
              <span style={styles.profitLabel}>GROSS PROFIT</span>
              <span style={styles.grossValue}>₹{grossProfit.toLocaleString('en-IN')}</span>
            </div>
            <div style={styles.netCard}>
              <span style={styles.netProfitLabel}>NET PROFIT</span>
              <span style={styles.netValue}>₹{netProfit.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={styles.footer}>
          <button style={styles.deleteBtn} onClick={() => onDelete(voucher.id)}>
            <Trash2 size={16} />
            <span>Delete Log</span>
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button style={styles.saveBtn} onClick={handleSave}>
              Save Voucher Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    backdropFilter: 'blur(4px)',
    zIndex: 1100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    width: '540px',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '24px 28px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #f1f5f9',
  },
  title: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    color: '#64748b',
    margin: '4px 0 0 0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  body: {
    padding: '20px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: 'calc(80vh - 120px)',
    overflowY: 'auto',
  },
  rowTwoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
    display: 'block',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  addCustomBtn: {
    background: 'none',
    border: 'none',
    color: '#1E3316',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  inlineAddContainer: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  inlineInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '12px',
    border: '2px solid #1E3316',
    backgroundColor: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a',
    outline: 'none',
  },
  confirmAddBtn: {
    backgroundColor: '#1E3316',
    color: '#ffffff',
    border: 'none',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  cancelAddBtn: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    padding: '10px',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  profitCardsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginTop: '8px',
  },
  grossCard: {
    backgroundColor: '#f6f8f4',
    borderRadius: '16px',
    padding: '16px',
    border: '1px solid #e2e8f0',
  },
  profitLabel: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#475569',
    letterSpacing: '0.5px',
    display: 'block',
  },
  grossValue: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#1e293b',
    marginTop: '4px',
    display: 'block',
  },
  netCard: {
    backgroundColor: '#23391b',
    borderRadius: '16px',
    padding: '16px',
  },
  netProfitLabel: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#a3b19b',
    letterSpacing: '0.5px',
    display: 'block',
  },
  netValue: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#ffffff',
    marginTop: '4px',
    display: 'block',
  },
  footer: {
    padding: '16px 28px 24px',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '10px 16px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  cancelBtn: {
    backgroundColor: '#ffffff',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '10px 20px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  saveBtn: {
    backgroundColor: '#23391b',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
}