import { useState } from 'react'

async function copyText(text) {
  if (!navigator.clipboard?.writeText) return false
  await navigator.clipboard.writeText(text)
  return true
}

export default function CredentialsModal({ email, username, tempPassword, onClose }) {
  const [copiedField, setCopiedField] = useState('')

  const fullBlock = `Owner Email: ${email}\nReference ID: ${username}\nTemporary Password: ${tempPassword}`

  const handleCopy = async (field, text) => {
    const ok = await copyText(text)
    if (!ok) return
    setCopiedField(field)
    setTimeout(() => {
      setCopiedField((current) => (current === field ? '' : current))
    }, 2000)
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Registration Approved</h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
          The owner account has been created with the credentials below.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div className="detail-label">Owner Email</div>
            <div className="detail-value">{email}</div>
          </div>
          <div>
            <div className="detail-label">Reference ID</div>
            <div className="detail-value">{username}</div>
          </div>
          <div>
            <div className="detail-label">Temporary Password</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="detail-value" style={{ fontFamily: 'monospace' }}>
                {tempPassword}
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleCopy('password', tempPassword)}
              >
                {copiedField === 'password' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div className="credential-box">
          Share these credentials with the owner. This is the only time the password will be
          shown.
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleCopy('all', fullBlock)}
          >
            {copiedField === 'all' ? 'Copied!' : 'Copy All'}
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
