import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import DailyEntryHistoryRow from './DailyEntryHistoryRow'

const STATUS_OPTIONS = ['All', 'Saved', 'Edited']

const TABLE_COLUMNS = [
  'Business Date',
  'Product Category',
  'Daily Sales',
  'Procurement Value',
  'Closing Stock',
  'Customer Bills',
  'Farmer/Customer',
  'Last Updated',
  'Status',
  'Actions',
]

export default function DailyEntryHistory({
  open,
  onClose,
  entries,
  totalCount,
  filters,
  onFiltersChange,
  onClearFilters,
  onView,
  onEdit,
  onDelete,
}) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const hasNoEntriesAtAll = totalCount === 0
  const hasNoMatches = !hasNoEntriesAtAll && entries.length === 0

  return (
    <div className="dbr-drawer-backdrop" onClick={onClose}>
      <div
        className="dbr-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dbr-drawer-heading"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dbr-drawer-header">
          <div>
            <h2 className="dbr-drawer-title" id="dbr-drawer-heading">
              Entry History
            </h2>
            <p className="dbr-drawer-subtitle">{totalCount} saved {totalCount === 1 ? 'entry' : 'entries'}</p>
          </div>
          <button type="button" className="dbr-drawer-close" onClick={onClose} ref={closeButtonRef} aria-label="Close entry history">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="dbr-drawer-body">
          <div className="dbr-drawer-filters">
            <input
              type="text"
              className="dbr-input"
              placeholder="Search by product category or farmer/customer"
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              aria-label="Search entry history"
            />
            <input
              type="date"
              className="dbr-input"
              value={filters.businessDate}
              onChange={(e) => onFiltersChange({ ...filters, businessDate: e.target.value })}
              aria-label="Filter by business date"
            />
            <select
              className="dbr-select"
              value={filters.status}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
              aria-label="Filter by status"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button type="button" className="dbr-btn dbr-btn-secondary" onClick={onClearFilters}>
              Clear Filters
            </button>
          </div>

          {hasNoEntriesAtAll && (
            <div className="dbr-empty-state">
              <p className="dbr-empty-state-title">No entries saved yet</p>
              <p>Daily entries you save will show up here.</p>
            </div>
          )}

          {hasNoMatches && (
            <div className="dbr-empty-state">
              <p className="dbr-empty-state-title">No entries match your filters</p>
              <p>Try a different search term, date, or status.</p>
            </div>
          )}

          {!hasNoEntriesAtAll && !hasNoMatches && (
            <>
              <div className="dbr-history-table-wrap">
                <table className="dbr-history-table">
                  <thead>
                    <tr>
                      {TABLE_COLUMNS.map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <DailyEntryHistoryRow key={entry.id} entry={entry} variant="table" onView={onView} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="dbr-history-cards">
                {entries.map((entry) => (
                  <DailyEntryHistoryRow key={entry.id} entry={entry} variant="card" onView={onView} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
