import React from 'react'
import { CheckCircle2, PencilLine } from 'lucide-react'

const STATUS_CONFIG = {
  Saved: { icon: CheckCircle2, className: 'dbr-badge-saved' },
  Edited: { icon: PencilLine, className: 'dbr-badge-edited' },
}

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Saved
  const Icon = config.icon

  return (
    <span className={`dbr-badge ${config.className}`}>
      <Icon size={13} aria-hidden="true" />
      {status}
    </span>
  )
}
