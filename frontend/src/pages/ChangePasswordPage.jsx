import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const errors = {}
    if (!newPassword) errors.newPassword = 'New password is required'
    else if (newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters'
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your new password'
    else if (newPassword && confirmPassword !== newPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!validate()) return

    if (!user) {
      setFormError('Session expired. Please log in again.')
      navigate('/login', { replace: true })
      return
    }

    setSubmitting(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) {
        setFormError(updateError.message)
        return
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', user.id)

      if (profileError) {
        setFormError(
          'Password updated, but we could not update your account status. Please contact an administrator.'
        )
        return
      }

      const updatedProfile = await refreshProfile()

      if (updatedProfile?.role === 'owner') {
        navigate('/owner/dashboard', { replace: true })
      } else if (updatedProfile?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Change Password" subtitle="Set a new password to continue.">
      {formError && <div className="alert alert-error">{formError}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={fieldErrors.newPassword ? 'input-error' : ''}
            autoComplete="new-password"
          />
          {fieldErrors.newPassword && <div className="field-error">{fieldErrors.newPassword}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={fieldErrors.confirmPassword ? 'input-error' : ''}
            autoComplete="new-password"
          />
          {fieldErrors.confirmPassword && (
            <div className="field-error">{fieldErrors.confirmPassword}</div>
          )}
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </AuthLayout>
  )
}
