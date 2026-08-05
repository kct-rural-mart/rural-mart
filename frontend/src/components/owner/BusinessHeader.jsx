import React from 'react'
import { Calendar, History, PencilLine } from 'lucide-react'

export default function BusinessHeader({ businessDate, onBusinessDateChange, isEditing, entryCount, onOpenHistory }) {
  return (
    <header className="dbr-header">
      <div>
        <h1 className="dbr-header-title">Daily Business Register</h1>
        <p className="dbr-header-subtitle">Record daily transactional sales, stock levels and farmer purchases.</p>
        {isEditing && (
          <span className="dbr-editing-badge">
            <PencilLine size={13} aria-hidden="true" />
            Editing Daily Entry
          </span>
        )}
      </div>

      <div className="dbr-header-right">
        <div className="dbr-date-field">
          <Calendar size={15} className="dbr-date-icon" aria-hidden="true" />
          <input
            type="date"
            className="dbr-date-input"
            value={businessDate}
            onChange={(e) => onBusinessDateChange(e.target.value)}
            aria-label="Business date"
          />
        </div>

        <button
          type="button"
          className="dbr-history-btn"
          onClick={onOpenHistory}
          aria-label={`Open entry history, ${entryCount} saved entries`}
        >
          <History size={15} aria-hidden="true" />
          Entry History
          <span className="dbr-history-count">{entryCount}</span>
        </button>
      </div>
    </header>
  )
}
