import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import AuthLayout from '../components/AuthLayout'
import { isValidEmail } from '../utils/validation'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const errors = {}
    if (!email.trim()) errors.email = 'Email is required'
    else if (!isValidEmail(email)) errors.email = 'Enter a valid email address'
    if (!password) errors.password = 'Password is required'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        setFormError('Invalid email or password.')
        return
      }

      const userId = signInData.user?.id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, rural_mart_id, must_change_password')
        .eq('id', userId)
        .single()

      if (profileError || !profile) {
        setFormError('Could not load your account profile. Please contact an administrator.')
        return
      }

      if (profile.must_change_password) {
        navigate('/change-password', { replace: true })
        return
      }

      if (profile.role === 'owner') {
        navigate('/owner/dashboard', { replace: true })
      } else if (profile.role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else {
        setFormError('Your account does not have a recognized role. Please contact an administrator.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Login" subtitle="Sign in to manage your Rural Mart.">
      {formError && <div className="alert alert-error">{formError}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldErrors.email ? 'input-error' : ''}
            autoComplete="email"
          />
          {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldErrors.password ? 'input-error' : ''}
            autoComplete="current-password"
          />
          {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="auth-footer-link">
        Don&apos;t have a Rural Mart account? <Link to="/register">Register Rural Mart</Link>
      </p>
    </AuthLayout>
  )
}
