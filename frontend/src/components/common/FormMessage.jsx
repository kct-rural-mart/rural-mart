import React from 'react'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

const TYPE_CONFIG = {
  success: { icon: CheckCircle2, className: 'dbr-message-success', role: 'status', live: 'polite' },
  error: { icon: AlertCircle, className: 'dbr-message-error', role: 'alert', live: 'assertive' },
  info: { icon: Info, className: 'dbr-message-info', role: 'status', live: 'polite' },
}

export default function FormMessage({ type = 'info', text, onDismiss }) {
  if (!text) return null

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info
  const Icon = config.icon

  return (
    <div className={`dbr-message ${config.className}`} role={config.role} aria-live={config.live}>
      <Icon size={16} aria-hidden="true" />
      <span>{text}</span>
      {onDismiss && (
        <button type="button" className="dbr-message-dismiss" onClick={onDismiss} aria-label="Dismiss message">
          ×
        </button>
      )}
    </div>
  )
}
