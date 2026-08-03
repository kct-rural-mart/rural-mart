import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { generateTempPassword, generateUsername } from '../../utils/credentials'
import CredentialsModal from '../../components/CredentialsModal'

async function approveRegistration(registrationId, username, tempPassword) {
  const { data, error } = await supabase.functions.invoke('approve-registration', {
    body: { registrationId, username, tempPassword },
  })

  if (error) {
    let message = error.message
    if (error.context) {
      try {
        const body = await error.context.json()
        if (body?.error) message = body.error
      } catch {
        // fall back to error.message below
      }
    }
    throw new Error(message)
  }
  if (data?.error) throw new Error(data.error)

  return data
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="detail-label">{label}</div>
      <div className="detail-value">{value}</div>
    </div>
  )
}

export default function RegistrationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [registration, setRegistration] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showApproveModal, setShowApproveModal] = useState(false)
  const [username, setUsername] = useState('')
  const [tempPassword, setTempPassword] = useState('')
  const [approveSubmitting, setApproveSubmitting] = useState(false)
  const [approveError, setApproveError] = useState('')
  const [approvedCredentials, setApprovedCredentials] = useState(null)

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectSubmitting, setRejectSubmitting] = useState(false)
  const [rejectError, setRejectError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadRegistration() {
      setLoading(true)
      setError('')
      const { data, error: fetchError } = await supabase
        .from('pending_registrations')
        .select('*')
        .eq('id', id)
        .single()

      if (!isMounted) return

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setRegistration(data)
      }
      setLoading(false)
    }

    loadRegistration()
    return () => {
      isMounted = false
    }
  }, [id])

  const openApproveModal = async () => {
    setApproveError('')
    const { count } = await supabase
      .from('pending_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')

    setUsername(generateUsername((count ?? 0) + 1))
    setTempPassword(generateTempPassword())
    setShowApproveModal(true)
  }

  const confirmApprove = async () => {
    if (!username.trim() || !tempPassword.trim()) {
      setApproveError('Username and temporary password are required.')
      return
    }
    setApproveSubmitting(true)
    setApproveError('')
    try {
      const result = await approveRegistration(id, username.trim(), tempPassword.trim())
      console.log('Registration approved:', result.martId ?? id)
      setShowApproveModal(false)
      setRegistration((prev) => (prev ? { ...prev, status: 'approved' } : prev))
      setApprovedCredentials({
        email: result.email,
        username: result.username,
        tempPassword: result.tempPassword,
      })
    } catch (err) {
      setApproveError(err.message)
    } finally {
      setApproveSubmitting(false)
    }
  }

  const closeCredentialsModal = () => {
    setApprovedCredentials(null)
    navigate('/admin/registrations')
  }

  const confirmReject = async () => {
    setRejectSubmitting(true)
    setRejectError('')
    try {
      const { error: updateError } = await supabase
        .from('pending_registrations')
        .update({ status: 'rejected', rejection_reason: rejectReason.trim() || null })
        .eq('id', id)

      if (updateError) throw updateError

      setShowRejectModal(false)
      setRegistration((prev) => (prev ? { ...prev, status: 'rejected' } : prev))
    } catch (err) {
      setRejectError(err.message)
    } finally {
      setRejectSubmitting(false)
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <div className="alert alert-error">{error}</div>
  if (!registration) return <p>Registration not found.</p>

  return (
    <div>
      <Link to="/admin/registrations" className="back-link">
        &larr; Back to Pending Registrations
      </Link>

      <div className="page-header">
        <h1 className="page-header-title">{registration.mart_name}</h1>
        <span className={`badge badge-${registration.status}`}>{registration.status}</span>
      </div>

      <div className="card card-padded">
        <div className="detail-grid">
          <Detail label="Entrepreneur Name" value={registration.entrepreneur_name} />
          <Detail label="Mobile Number" value={registration.mobile_number} />
          <Detail label="Email" value={registration.email} />
          <Detail label="District" value={registration.district} />
          <Detail label="Block" value={registration.block} />
          <Detail label="Village" value={registration.village} />
          <Detail
            label="GPS Location"
            value={`${registration.gps_lat}, ${registration.gps_lng}`}
          />
          <Detail label="Opening Date" value={registration.opening_date} />
          <Detail label="Aadhaar Number" value={registration.aadhaar_number || '—'} />
          <Detail label="GST Number" value={registration.gst_number || '—'} />
        </div>

        {registration.photo_url && (
          <div style={{ marginTop: 20 }}>
            <div className="detail-label">Photo</div>
            <img
              src={registration.photo_url}
              alt="Rural Mart"
              style={{ maxWidth: 200, borderRadius: 8, marginTop: 6 }}
            />
          </div>
        )}

        {registration.status === 'pending' && (
          <div className="modal-actions" style={{ justifyContent: 'flex-start', marginTop: 28 }}>
            <button type="button" className="btn btn-primary" onClick={openApproveModal}>
              Approve
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setShowRejectModal(true)}
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {showApproveModal && (
        <div
          className="modal-backdrop"
          onClick={() => !approveSubmitting && setShowApproveModal(false)}
        >
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
              Approve Registration
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
              Review the generated login credentials below. You can edit them before confirming.
            </p>
            {approveError && <div className="alert alert-error">{approveError}</div>}
            <div className="form-group">
              <label htmlFor="genUsername">Reference Code</label>
              <input
                id="genUsername"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="genPassword">Temporary Password</label>
              <input
                id="genPassword"
                type="text"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
              />
            </div>
            <div className="credential-box">
              The owner logs in with their registered email ({registration.email}) and this
              temporary password — the reference code above is for display only. They will be
              required to change their password on first login. Email delivery isn&apos;t
              configured yet, so share this password with them manually for now.
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowApproveModal(false)}
                disabled={approveSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={confirmApprove}
                disabled={approveSubmitting}
              >
                {approveSubmitting ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div
          className="modal-backdrop"
          onClick={() => !rejectSubmitting && setShowRejectModal(false)}
        >
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              Reject Registration
            </h2>
            {rejectError && <div className="alert alert-error">{rejectError}</div>}
            <div className="form-group">
              <label htmlFor="rejectReason">
                Reason <span className="optional-tag">optional</span>
              </label>
              <textarea
                id="rejectReason"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowRejectModal(false)}
                disabled={rejectSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmReject}
                disabled={rejectSubmitting}
              >
                {rejectSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {approvedCredentials && (
        <CredentialsModal
          email={approvedCredentials.email}
          username={approvedCredentials.username}
          tempPassword={approvedCredentials.tempPassword}
          onClose={closeCredentialsModal}
        />
      )}
    </div>
  )
}
