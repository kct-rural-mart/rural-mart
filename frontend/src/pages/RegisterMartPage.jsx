import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import AuthLayout from '../components/AuthLayout'
import { isValidEmail } from '../utils/validation'

const INITIAL_FORM = {
  martName: '',
  entrepreneurName: '',
  mobileNumber: '',
  email: '',
  district: '',
  block: '',
  village: '',
  gpsLat: '',
  gpsLng: '',
  openingDate: '',
  aadhaarNumber: '',
  gstNumber: '',
}

export default function RegisterMartPage() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [photoFile, setPhotoFile] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const validate = () => {
    const errors = {}

    if (!form.martName.trim()) errors.martName = 'Rural Mart name is required'
    if (!form.entrepreneurName.trim()) errors.entrepreneurName = 'Entrepreneur name is required'

    if (!form.mobileNumber.trim()) errors.mobileNumber = 'Mobile number is required'
    else if (!/^\d{10}$/.test(form.mobileNumber.trim())) {
      errors.mobileNumber = 'Enter a valid 10-digit mobile number'
    }

    if (!form.email.trim()) errors.email = 'Email is required'
    else if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address'

    if (!form.district.trim()) errors.district = 'District is required'
    if (!form.block.trim()) errors.block = 'Block is required'
    if (!form.village.trim()) errors.village = 'Village is required'

    if (!form.gpsLat.trim()) errors.gpsLat = 'Latitude is required'
    else if (Number.isNaN(Number(form.gpsLat.trim()))) errors.gpsLat = 'Latitude must be a number'

    if (!form.gpsLng.trim()) errors.gpsLng = 'Longitude is required'
    else if (Number.isNaN(Number(form.gpsLng.trim()))) errors.gpsLng = 'Longitude must be a number'

    if (!form.openingDate) errors.openingDate = 'Opening date is required'

    if (form.aadhaarNumber.trim() && !/^\d{12}$/.test(form.aadhaarNumber.trim())) {
      errors.aadhaarNumber = 'Aadhaar number must be 12 digits'
    }

    if (form.gstNumber.trim() && form.gstNumber.trim().length !== 15) {
      errors.gstNumber = 'GST number must be 15 characters'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      let photoUrl = null

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop()
        const filePath = `pending/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('registration-photos')
          .upload(filePath, photoFile)

        if (uploadError) {
          setFormError(`Photo upload failed: ${uploadError.message}`)
          return
        }

        const { data: publicUrlData } = supabase.storage
          .from('registration-photos')
          .getPublicUrl(filePath)
        photoUrl = publicUrlData?.publicUrl ?? null
      }

      const { error: insertError } = await supabase.from('pending_registrations').insert({
        mart_name: form.martName.trim(),
        entrepreneur_name: form.entrepreneurName.trim(),
        mobile_number: form.mobileNumber.trim(),
        email: form.email.trim(),
        district: form.district.trim(),
        block: form.block.trim(),
        village: form.village.trim(),
        gps_lat: form.gpsLat.trim(),
        gps_lng: form.gpsLng.trim(),
        opening_date: form.openingDate,
        aadhaar_number: form.aadhaarNumber.trim() || null,
        gst_number: form.gstNumber.trim() || null,
        photo_url: photoUrl,
        status: 'pending',
      })

      if (insertError) {
        setFormError(insertError.message)
        return
      }

      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <AuthLayout title="Application Submitted">
        <div className="alert alert-success">
          Application submitted. Status: <strong>Pending Approval</strong>
        </div>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 20 }}>
          Our team will review your Rural Mart application. You will be notified once it has been
          approved.
        </p>
        <Link to="/" className="btn btn-secondary btn-block">
          Back to Home
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Register Rural Mart"
      subtitle="Submit your Rural Mart details for approval."
      wide
    >
      {formError && <div className="alert alert-error">{formError}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <div className="section-title">Mart Details</div>

        <div className="form-group">
          <label htmlFor="martName">Rural Mart Name</label>
          <input
            id="martName"
            type="text"
            value={form.martName}
            onChange={handleChange('martName')}
            className={fieldErrors.martName ? 'input-error' : ''}
          />
          {fieldErrors.martName && <div className="field-error">{fieldErrors.martName}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="entrepreneurName">Entrepreneur Name</label>
            <input
              id="entrepreneurName"
              type="text"
              value={form.entrepreneurName}
              onChange={handleChange('entrepreneurName')}
              className={fieldErrors.entrepreneurName ? 'input-error' : ''}
            />
            {fieldErrors.entrepreneurName && (
              <div className="field-error">{fieldErrors.entrepreneurName}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="mobileNumber">Mobile Number</label>
            <input
              id="mobileNumber"
              type="tel"
              value={form.mobileNumber}
              onChange={handleChange('mobileNumber')}
              className={fieldErrors.mobileNumber ? 'input-error' : ''}
            />
            {fieldErrors.mobileNumber && (
              <div className="field-error">{fieldErrors.mobileNumber}</div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            className={fieldErrors.email ? 'input-error' : ''}
          />
          {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
        </div>

        <div className="section-title">Location</div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="district">District</label>
            <input
              id="district"
              type="text"
              value={form.district}
              onChange={handleChange('district')}
              className={fieldErrors.district ? 'input-error' : ''}
            />
            {fieldErrors.district && <div className="field-error">{fieldErrors.district}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="block">Block</label>
            <input
              id="block"
              type="text"
              value={form.block}
              onChange={handleChange('block')}
              className={fieldErrors.block ? 'input-error' : ''}
            />
            {fieldErrors.block && <div className="field-error">{fieldErrors.block}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="village">Village</label>
          <input
            id="village"
            type="text"
            value={form.village}
            onChange={handleChange('village')}
            className={fieldErrors.village ? 'input-error' : ''}
          />
          {fieldErrors.village && <div className="field-error">{fieldErrors.village}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="gpsLat">GPS Latitude</label>
            <input
              id="gpsLat"
              type="text"
              placeholder="e.g. 26.4499"
              value={form.gpsLat}
              onChange={handleChange('gpsLat')}
              className={fieldErrors.gpsLat ? 'input-error' : ''}
            />
            {fieldErrors.gpsLat && <div className="field-error">{fieldErrors.gpsLat}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="gpsLng">GPS Longitude</label>
            <input
              id="gpsLng"
              type="text"
              placeholder="e.g. 80.3319"
              value={form.gpsLng}
              onChange={handleChange('gpsLng')}
              className={fieldErrors.gpsLng ? 'input-error' : ''}
            />
            {fieldErrors.gpsLng && <div className="field-error">{fieldErrors.gpsLng}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="openingDate">Opening Date</label>
          <input
            id="openingDate"
            type="date"
            value={form.openingDate}
            onChange={handleChange('openingDate')}
            className={fieldErrors.openingDate ? 'input-error' : ''}
          />
          {fieldErrors.openingDate && <div className="field-error">{fieldErrors.openingDate}</div>}
        </div>

        <div className="section-title">Additional Details (Optional)</div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="aadhaarNumber">
              Aadhaar Number <span className="optional-tag">optional</span>
            </label>
            <input
              id="aadhaarNumber"
              type="text"
              value={form.aadhaarNumber}
              onChange={handleChange('aadhaarNumber')}
              className={fieldErrors.aadhaarNumber ? 'input-error' : ''}
            />
            {fieldErrors.aadhaarNumber && (
              <div className="field-error">{fieldErrors.aadhaarNumber}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="gstNumber">
              GST Number <span className="optional-tag">optional</span>
            </label>
            <input
              id="gstNumber"
              type="text"
              value={form.gstNumber}
              onChange={handleChange('gstNumber')}
              className={fieldErrors.gstNumber ? 'input-error' : ''}
            />
            {fieldErrors.gstNumber && <div className="field-error">{fieldErrors.gstNumber}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="photo">
            Photo <span className="optional-tag">optional</span>
          </label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
      <p className="auth-footer-link">
        Already have a Rural Mart account? <Link to="/login">Login</Link>
      </p>
    </AuthLayout>
  )
}
