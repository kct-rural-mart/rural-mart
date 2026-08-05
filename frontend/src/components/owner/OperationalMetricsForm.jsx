import React from 'react'
import FormField from '../common/FormField'
import { OPERATIONAL_FIELDS } from '../../services/dailyBusinessService'

export default function OperationalMetricsForm({ values, errors, onChange, headingRef }) {
  return (
    <section className="dbr-card">
      <h2 className="dbr-section-heading" ref={headingRef} tabIndex={-1}>
        Operational Metrics Entry
      </h2>

      <div className="dbr-form-grid">
        {OPERATIONAL_FIELDS.map((field) => (
          <FormField
            key={field.name}
            field={field}
            value={values[field.name]}
            error={errors[field.name]}
            onChange={onChange}
            idPrefix="op"
          />
        ))}
      </div>
    </section>
  )
}
