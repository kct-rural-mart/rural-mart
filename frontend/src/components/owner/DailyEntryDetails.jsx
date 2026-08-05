import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import StatusBadge from '../common/StatusBadge'
import { formatCurrency, formatDate, formatDateTime } from '../../services/dailyBusinessService'

function Detail({ label, value }) {
  return (
    <div>
      <p className="dbr-modal-detail-label">{label}</p>
      <p className="dbr-modal-detail-value">{value ?? '—'}</p>
    </div>
  )
}

export default function DailyEntryDetails({ entry, onClose, onEdit }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!entry) return undefined

    closeButtonRef.current?.focus()

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [entry, onClose])

  if (!entry) return null

  const customer = entry.customer

  return (
    <div className="dbr-modal-backdrop" onClick={onClose}>
      <div
        className="dbr-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dbr-details-heading"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dbr-modal-header">
          <h2 className="dbr-modal-title" id="dbr-details-heading">
            Daily Entry Details
          </h2>
          <button type="button" className="dbr-modal-close" onClick={onClose} ref={closeButtonRef} aria-label="Close entry details">
            <X size={15} aria-hidden="true" />
          </button>
        </div>

        <section className="dbr-modal-section">
          <h3 className="dbr-modal-section-title">Business Information</h3>
          <div className="dbr-modal-detail-grid">
            <Detail label="Entry ID" value={entry.id} />
            <Detail label="Business Date" value={formatDate(entry.businessDate)} />
            <Detail label="Product Category" value={entry.productCategory} />
          </div>
        </section>

        <section className="dbr-modal-section">
          <h3 className="dbr-modal-section-title">Operational Metrics</h3>
          <div className="dbr-modal-detail-grid">
            <Detail label="Sales Value" value={formatCurrency(entry.salesValue)} />
            <Detail label="Procurement Value" value={formatCurrency(entry.procurementValue)} />
            <Detail label="Opening Stock" value={entry.openingStock} />
            <Detail label="Closing Stock" value={entry.closingStock} />
            <Detail label="Sales Quantity" value={entry.salesQuantity} />
            <Detail label="Procurement Quantity" value={entry.procurementQuantity} />
            <Detail label="Customer Bills" value={entry.customerBills} />
          </div>
        </section>

        <section className="dbr-modal-section">
          <h3 className="dbr-modal-section-title">Customer Information</h3>
          {customer ? (
            <div className="dbr-modal-detail-grid">
              <Detail label="Farmer / Customer ID" value={customer.id} />
              <Detail label="Name" value={customer.name} />
              <Detail label="Mobile" value={customer.mobile} />
              <Detail label="Village" value={customer.village} />
              <Detail label="Gender" value={customer.gender} />
              <Detail label="Age" value={customer.age} />
              <Detail label="Cattle Count" value={customer.cattleCount} />
              <Detail label="Last Purchase" value={customer.lastPurchase ? formatDate(customer.lastPurchase) : 'No prior purchase'} />
              <Detail label="Total Visits" value={customer.totalVisits} />
            </div>
          ) : (
            <p>Walk-in / No customer associated with this entry.</p>
          )}
        </section>

        <section className="dbr-modal-section">
          <h3 className="dbr-modal-section-title">Record Information</h3>
          <div className="dbr-modal-detail-grid">
            <Detail label="Status" value={<StatusBadge status={entry.status} />} />
            <Detail label="Created" value={formatDateTime(entry.createdAt)} />
            <Detail label="Last Updated" value={formatDateTime(entry.lastUpdated)} />
          </div>
        </section>

        <div className="dbr-modal-actions">
          <button type="button" className="dbr-btn dbr-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="dbr-btn dbr-btn-primary" onClick={() => onEdit(entry)}>
            Edit Entry
          </button>
        </div>
      </div>
    </div>
  )
}
