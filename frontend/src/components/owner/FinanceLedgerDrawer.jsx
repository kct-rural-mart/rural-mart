import React, { useState } from 'react'
import { X, Edit2, Trash2, Download, BookOpen } from 'lucide-react'
import EditVoucherModal from './EditVoucherModal'

export default function FinanceLedgerDrawer({ isOpen, onClose, logs = [], setLogs, onExportPDF }) {
  const [selectedVoucher, setSelectedVoucher] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!isOpen) return null

  const handleOpenEdit = (voucher) => {
    setSelectedVoucher(voucher)
    setIsModalOpen(true)
  }

  const handleSaveVoucher = (updatedVoucher) => {
    if (setLogs) {
      setLogs((prev) => prev.map((item) => (item.id === updatedVoucher.id ? updatedVoucher : item)))
    }
  }

  const handleDeleteVoucher = (id) => {
    if (setLogs) {
      setLogs((prev) => prev.filter((item) => item.id !== id))
    }
    setIsModalOpen(false)
  }

  const handleExport = () => {
    if (onExportPDF) {
      onExportPDF()
    } else {
      window.print() // Triggers clean print-to-PDF
    }
  }

  return (
    <>
      <div style={styles.backdrop} onClick={onClose}>
        <div style={styles.drawerContainer} onClick={(e) => e.stopPropagation()}>
          
          {/* HEADER */}
          <div style={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={styles.headerIconContainer}>
                <BookOpen size={20} color="#ffffff" />
              </div>
              <div>
                <h2 style={styles.headerTitle}>Financial Audit Ledger Logs</h2>
                <p style={styles.headerSub}>Historical daily audit & operation records</p>
              </div>
            </div>
            <button style={styles.closeBtn} onClick={onClose}>
              <X size={18} color="#ffffff" />
            </button>
          </div>

          {/* LOGS LIST */}
          <div style={styles.content}>
            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>
                No ledger records found.
              </div>
            ) : (
              logs.map((item) => (
                <div key={item.id || item.date} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={styles.dateText}>{item.date}</span>
                      <span style={item.status === 'Saved' ? styles.statusSaved : styles.statusEdited}>
                        {item.status || 'Saved'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={styles.netLabel}>Net: </span>
                        <span style={styles.netValue}>
                          {item.net || `₹${(item.profit || 0).toLocaleString('en-IN')}`}
                        </span>
                      </div>
                      <button style={styles.actionEditBtn} onClick={() => handleOpenEdit(item)}>
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                      <button style={styles.actionDeleteBtn} onClick={() => handleDeleteVoucher(item.id)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <span style={styles.tagBadge}>{item.tag || 'Daily Ledger Entry'}</span>
                  </div>

                  <div style={styles.metricsRow}>
                    <div>
                      <span style={styles.metricLabel}>Revenue: </span>
                      <span style={styles.metricValue}>
                        {item.revenue || `₹${(item.revenueNum || item.revenue || 0).toLocaleString('en-IN')}`}
                      </span>
                    </div>
                    <div>
                      <span style={styles.metricLabel}>Procurement: </span>
                      <span style={styles.metricValue}>
                        {item.procurement || `₹${(item.procurementNum || 0).toLocaleString('en-IN')}`}
                      </span>
                    </div>
                    <div>
                      <span style={styles.metricLabel}>Expenses: </span>
                      <span style={styles.metricValue}>
                        {item.expenses || `₹${(item.expensesNum || 0).toLocaleString('en-IN')}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* FOOTER */}
          <div style={styles.footer}>
            <span style={styles.footerText}>Total {logs.length} records</span>
            <button style={styles.exportBtn} onClick={handleExport}>
              <Download size={16} />
              <span>Export Ledger PDF</span>
            </button>
          </div>

        </div>
      </div>

      {/* EDIT VOUCHER MODAL */}
      <EditVoucherModal
        isOpen={isModalOpen}
        voucher={selectedVoucher}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVoucher}
        onDelete={handleDeleteVoucher}
      />
    </>
  )
}

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(3px)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    width: '480px',
    height: '100%',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-10px 0 25px rgba(0,0,0,0.15)',
  },
  header: {
    backgroundColor: '#1E3316',
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#ffffff',
  },
  headerIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: '16px',
    fontWeight: '700',
    margin: 0,
    color: '#ffffff',
  },
  headerSub: {
    fontSize: '12px',
    color: '#a3b19b',
    margin: 0,
  },
  closeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    backgroundColor: '#f8faf6',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '16px',
    border: '1px solid #e2e8f0',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  dateText: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e293b',
  },
  statusSaved: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  statusEdited: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  netLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500',
  },
  netValue: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#0f172a',
  },
  actionEditBtn: {
    backgroundColor: '#1E3316',
    color: '#ffffff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  actionDeleteBtn: {
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  tagBadge: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '6px',
  },
  metricsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '10px',
    borderTop: '1px solid #f1f5f9',
    fontSize: '11px',
  },
  metricLabel: {
    color: '#64748b',
  },
  metricValue: {
    fontWeight: '700',
    color: '#1e293b',
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: '12px',
    color: '#64748b',
  },
  exportBtn: {
    backgroundColor: '#1E3316',
    color: '#ffffff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
}