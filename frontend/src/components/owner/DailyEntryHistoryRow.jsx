import React, { useState } from 'react'
import { Eye, PencilLine, Trash2 } from 'lucide-react'
import StatusBadge from '../common/StatusBadge'
import { formatCurrency, formatDate, formatDateTime } from '../../services/dailyBusinessService'

export default function DailyEntryHistoryRow({ entry, variant, onView, onEdit, onDelete }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const customerName = entry.customer?.name || 'Walk-in / No customer'
  const businessDateLabel = formatDate(entry.businessDate)
  const lastUpdatedLabel = formatDateTime(entry.lastUpdated)

  const actions = confirmingDelete ? (
    <div className="dbr-row-confirm">
      <span className="dbr-row-confirm-text">Delete this entry?</span>
      <div className="dbr-row-confirm-actions">
        <button type="button" className="dbr-row-action-btn" onClick={() => setConfirmingDelete(false)}>
          Cancel
        </button>
        <button type="button" className="dbr-row-action-btn dbr-row-danger-btn" onClick={() => onDelete(entry)}>
          Delete
        </button>
      </div>
    </div>
  ) : (
    <div className="dbr-row-actions">
      <button type="button" className="dbr-row-action-btn" onClick={() => onView(entry)} aria-label={`View entry for ${businessDateLabel}, ${entry.productCategory}`}>
        <Eye size={13} aria-hidden="true" />
        View
      </button>
      <button type="button" className="dbr-row-action-btn" onClick={() => onEdit(entry)} aria-label={`Edit entry for ${businessDateLabel}, ${entry.productCategory}`}>
        <PencilLine size={13} aria-hidden="true" />
        Edit
      </button>
      <button
        type="button"
        className="dbr-row-action-btn dbr-row-danger-btn"
        onClick={() => setConfirmingDelete(true)}
        aria-label={`Delete entry for ${businessDateLabel}, ${entry.productCategory}`}
      >
        <Trash2 size={13} aria-hidden="true" />
        Delete
      </button>
    </div>
  )

  if (variant === 'table') {
    return (
      <tr>
        <td>{businessDateLabel}</td>
        <td>{entry.productCategory}</td>
        <td>{formatCurrency(entry.salesValue)}</td>
        <td>{formatCurrency(entry.procurementValue)}</td>
        <td>{entry.closingStock}</td>
        <td>{entry.customerBills}</td>
        <td>{customerName}</td>
        <td>{lastUpdatedLabel}</td>
        <td>
          <StatusBadge status={entry.status} />
        </td>
        <td>{actions}</td>
      </tr>
    )
  }

  return (
    <div className="dbr-entry-card">
      <div className="dbr-entry-card-top">
        <div>
          <p className="dbr-farmer-detail-label">{businessDateLabel}</p>
          <p className="dbr-entry-card-category">{entry.productCategory}</p>
        </div>
        <StatusBadge status={entry.status} />
      </div>

      <div className="dbr-entry-card-grid">
        <div>
          <p className="dbr-farmer-detail-label">Daily Sales</p>
          <p className="dbr-farmer-detail-value">{formatCurrency(entry.salesValue)}</p>
        </div>
        <div>
          <p className="dbr-farmer-detail-label">Procurement Value</p>
          <p className="dbr-farmer-detail-value">{formatCurrency(entry.procurementValue)}</p>
        </div>
        <div>
          <p className="dbr-farmer-detail-label">Closing Stock</p>
          <p className="dbr-farmer-detail-value">{entry.closingStock}</p>
        </div>
        <div>
          <p className="dbr-farmer-detail-label">Customer Bills</p>
          <p className="dbr-farmer-detail-value">{entry.customerBills}</p>
        </div>
        <div>
          <p className="dbr-farmer-detail-label">Farmer / Customer</p>
          <p className="dbr-farmer-detail-value">{customerName}</p>
        </div>
        <div>
          <p className="dbr-farmer-detail-label">Last Updated</p>
          <p className="dbr-farmer-detail-value">{lastUpdatedLabel}</p>
        </div>
      </div>

      {actions}
    </div>
  )
}
