import React from 'react'

export default function FormField({ field, value, error, onChange, idPrefix }) {
  const { name, label, type, required, options, placeholder, min, inputMode } = field
  const id = `${idPrefix}-${name}`
  const errorId = `${id}-error`

  const handleChange = (e) => {
    onChange(name, e.target.value)
  }

  return (
    <div className="dbr-field">
      <label htmlFor={id} className="dbr-field-label">
        {label}
        {required && <span className="dbr-field-required" aria-hidden="true">*</span>}
      </label>

      {type === 'select' ? (
        <select
          id={id}
          className={`dbr-select${error ? ' dbr-input-error' : ''}`}
          value={value ?? ''}
          onChange={handleChange}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          required={required}
        >
          <option value="" disabled>
            {placeholder || 'Select an option'}
          </option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type === 'number' ? 'number' : type}
          className={`dbr-input${error ? ' dbr-input-error' : ''}`}
          value={value ?? ''}
          onChange={handleChange}
          placeholder={placeholder}
          min={type === 'number' ? min : undefined}
          inputMode={inputMode}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          required={required}
        />
      )}

      {error && (
        <span id={errorId} className="dbr-field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
