import React from 'react'
import { RotateCcw, Save } from 'lucide-react'

export default function FinanceForm({
  operationType = 'Retail Sales & Procurement',
  setOperationType,
  grossRevenue = '',
  setGrossRevenue,
  procurementCosts = '',
  setProcurementCosts,
  operatingExpenses = '',
  setOperatingExpenses,
  calculatedGrossProfit = 0,
  calculatedNetProfit = 0,
  onSave,
  onClear,
}) {
  const handleFormClear = (e) => {
    e.preventDefault()
    if (onClear) {
      onClear()
    } else {
      // Fallback local state resets
      if (setOperationType) setOperationType('Retail Sales & Procurement')
      if (setGrossRevenue) setGrossRevenue('')
      if (setProcurementCosts) setProcurementCosts('')
      if (setOperatingExpenses) setOperatingExpenses('')
    }
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>Financial Entry & Real-time Calculation</h3>
        <p style={styles.subtitle}>Enter daily operational values to compute margins live.</p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} style={styles.form}>
        {/* Type of Operation */}
        <div>
          <label style={styles.label}>Type of Operation *</label>
          <select
            style={styles.select}
            value={operationType}
            onChange={(e) => setOperationType && setOperationType(e.target.value)}
          >
            <option value="Retail Sales & Procurement">Retail Sales & Procurement</option>
            <option value="Bulk Wholesaling">Bulk Wholesaling</option>
            <option value="Inventory Restock & Feed Purchase">Inventory Restock & Feed Purchase</option>
          </select>
        </div>

        {/* Gross Revenue */}
        <div>
          <label style={styles.label}>Gross Revenue (₹) *</label>
          <input
            type="number"
            placeholder="0"
            style={styles.input}
            value={grossRevenue}
            onChange={(e) => setGrossRevenue && setGrossRevenue(e.target.value)}
          />
        </div>

        {/* Procurement Costs */}
        <div>
          <label style={styles.label}>Procurement Costs (₹) *</label>
          <input
            type="number"
            placeholder="0"
            style={styles.input}
            value={procurementCosts}
            onChange={(e) => setProcurementCosts && setProcurementCosts(e.target.value)}
          />
        </div>

        {/* Operating Expenses */}
        <div>
          <label style={styles.label}>Operating Expenses (₹) *</label>
          <input
            type="number"
            placeholder="0"
            style={styles.input}
            value={operatingExpenses}
            onChange={(e) => setOperatingExpenses && setOperatingExpenses(e.target.value)}
          />
        </div>

        {/* Real-time Calculated Margins */}
        <div style={styles.marginRow}>
          <div style={styles.grossBox}>
            <span style={styles.boxLabel}>GROSS PROFIT</span>
            <span style={styles.grossVal}>₹{Number(calculatedGrossProfit).toLocaleString('en-IN')}</span>
          </div>
          <div style={styles.netBox}>
            <span style={styles.netBoxLabel}>NET PROFIT</span>
            <span style={styles.netVal}>₹{Number(calculatedNetProfit).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.buttonRow}>
          <button type="button" onClick={handleFormClear} style={styles.clearBtn}>
            <RotateCcw size={15} />
            <span>Clear Form</span>
          </button>
          <button type="button" onClick={onSave} style={styles.saveBtn}>
            <Save size={15} />
            <span>Save Financial Log</span>
          </button>
        </div>
      </form>
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#111827',
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#374151',
    display: 'block',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid #d1d5db',
    backgroundColor: '#f9fafb',
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid #d1d5db',
    backgroundColor: '#f9fafb',
    fontSize: '13px',
    fontWeight: '600',
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box',
  },
  marginRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginTop: '8px',
  },
  grossBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: '12px',
    padding: '14px 16px',
    border: '1px solid #e5e7eb',
  },
  boxLabel: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#6b7280',
    letterSpacing: '0.5px',
    display: 'block',
  },
  grossVal: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#111827',
    marginTop: '4px',
    display: 'block',
  },
  netBox: {
    backgroundColor: '#1E3316',
    borderRadius: '12px',
    padding: '14px 16px',
  },
  netBoxLabel: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#a3b19b',
    letterSpacing: '0.5px',
    display: 'block',
  },
  netVal: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#ffffff',
    marginTop: '4px',
    display: 'block',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  clearBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    color: '#374151',
    border: '1px solid #d1d5db',
    padding: '12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  saveBtn: {
    flex: 2,
    backgroundColor: '#1E3316',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
}