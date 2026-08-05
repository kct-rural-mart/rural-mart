import React from 'react'

export default function DailyBusinessFooter({
  isEditing,
  isSubmitting,
  clearConfirmPending,
  onClearFormClick,
  onConfirmDiscard,
  onCancelDiscard,
  onCancelEditingClick,
  onSubmit,
}) {
  if (clearConfirmPending) {
    return (
      <div className="dbr-footer">
        <div className="dbr-footer-confirm">
          <span className="dbr-footer-confirm-text">Discard unsaved changes?</span>
          <div className="dbr-footer-confirm-actions">
            <button type="button" className="dbr-btn dbr-btn-secondary" onClick={onCancelDiscard}>
              Cancel
            </button>
            <button type="button" className="dbr-btn dbr-btn-danger" onClick={onConfirmDiscard}>
              Discard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dbr-footer">
      <button type="button" className="dbr-btn dbr-btn-secondary" onClick={onClearFormClick} disabled={isSubmitting}>
        Clear Form
      </button>

      <div className="dbr-footer-right">
        {isEditing && (
          <button type="button" className="dbr-btn dbr-btn-secondary" onClick={onCancelEditingClick} disabled={isSubmitting}>
            Cancel Editing
          </button>
        )}
        <button type="button" className="dbr-btn dbr-btn-primary" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? (isEditing ? 'Updating…' : 'Saving…') : isEditing ? 'Update Daily Entry' : 'Save Daily Entry'}
        </button>
      </div>
    </div>
  )
}
