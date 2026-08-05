import React, { useRef, useState } from 'react'
import { Search, UserRoundCheck } from 'lucide-react'
import FormField from '../common/FormField'
import FormMessage from '../common/FormMessage'
import { isRequired, isValidMobileNumber } from '../../utils/validation'
import { formatDate } from '../../services/dailyBusinessService'

const TABS = [
  { key: 'existing', label: 'Existing Customer' },
  { key: 'new', label: 'New Customer' },
]

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
]

const NEW_CUSTOMER_FIELDS = [
  { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Farmer full name' },
  { name: 'mobile', label: 'Mobile', type: 'tel', required: true, placeholder: '10-digit mobile number', inputMode: 'numeric' },
  { name: 'village', label: 'Village', type: 'text', required: true, placeholder: 'Village name' },
  { name: 'gender', label: 'Gender', type: 'select', required: true, options: GENDER_OPTIONS, placeholder: 'Select gender' },
  { name: 'age', label: 'Age', type: 'number', required: true, min: 1, inputMode: 'numeric', placeholder: 'Age in years' },
]

const EDIT_FIELDS = [
  ...NEW_CUSTOMER_FIELDS,
  { name: 'cattleCount', label: 'Cattle Count', type: 'number', required: false, min: 0, inputMode: 'numeric', placeholder: '0' },
]

// Local dummy dataset — stands in for a future Supabase-backed farmer directory.
const DUMMY_FARMERS = [
  { id: 'FRM-1042', name: 'Ramesh Yadav', mobile: '9876543210', village: 'Sonipur', gender: 'Male', age: 45, cattleCount: 4, lastPurchase: '2026-07-28', totalVisits: 12 },
  { id: 'FRM-1078', name: 'Sunita Devi', mobile: '9123456780', village: 'Rampur Kalan', gender: 'Female', age: 38, cattleCount: 2, lastPurchase: '2026-08-01', totalVisits: 7 },
  { id: 'FRM-1105', name: 'Anil Kumar', mobile: '9988776655', village: 'Chandpur', gender: 'Male', age: 52, cattleCount: 6, lastPurchase: '2026-07-15', totalVisits: 20 },
  { id: 'FRM-1132', name: 'Geeta Sharma', mobile: '9012345678', village: 'Baragaon', gender: 'Female', age: 29, cattleCount: 1, lastPurchase: '2026-08-03', totalVisits: 4 },
  { id: 'FRM-1156', name: 'Mahesh Patel', mobile: '9765432109', village: 'Sonipur', gender: 'Male', age: 60, cattleCount: 8, lastPurchase: '2026-06-30', totalVisits: 31 },
]

const EMPTY_DRAFT = { name: '', mobile: '', village: '', gender: '', age: '' }

function validateCustomerDraft(draft) {
  const errors = {}
  if (!isRequired(draft.name)) errors.name = 'Name is required.'
  if (!isRequired(draft.mobile)) errors.mobile = 'Mobile number is required.'
  else if (!isValidMobileNumber(draft.mobile)) errors.mobile = 'Enter a valid 10-digit Indian mobile number.'
  if (!isRequired(draft.village)) errors.village = 'Village is required.'
  if (!isRequired(draft.gender)) errors.gender = 'Gender is required.'
  const age = Number(draft.age)
  if (draft.age === '' || draft.age === undefined || draft.age === null) {
    errors.age = 'Age is required.'
  } else if (!Number.isFinite(age) || age <= 0 || age > 120) {
    errors.age = 'Enter a valid age.'
  }
  return errors
}

export default function FarmerLookup({ selectedCustomer, onSelectCustomer, onClearCustomer }) {
  const [activeTab, setActiveTab] = useState('existing')
  const [searchQuery, setSearchQuery] = useState('')
  const [notFound, setNotFound] = useState(false)

  const [newCustomerDraft, setNewCustomerDraft] = useState(EMPTY_DRAFT)
  const [newCustomerErrors, setNewCustomerErrors] = useState({})
  const [newCustomerMessage, setNewCustomerMessage] = useState(null)

  const [editDraft, setEditDraft] = useState(null)
  const [editErrors, setEditErrors] = useState({})

  const tabRefs = useRef([])

  const handleTabKeyDown = (e, index) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const direction = e.key === 'ArrowRight' ? 1 : -1
      const nextIndex = (index + direction + TABS.length) % TABS.length
      setActiveTab(TABS[nextIndex].key)
      tabRefs.current[nextIndex]?.focus()
    }
  }

  const handleSearch = () => {
    const query = searchQuery.trim()
    if (!query) {
      setNotFound(false)
      return
    }
    const match = DUMMY_FARMERS.find(
      (farmer) => farmer.id.toLowerCase() === query.toLowerCase() || farmer.mobile === query
    )
    if (match) {
      onSelectCustomer(match)
      setSearchQuery('')
      setNotFound(false)
    } else {
      setNotFound(true)
    }
  }

  const handleChangeCustomer = () => {
    onClearCustomer()
    setSearchQuery('')
    setNotFound(false)
    setEditDraft(null)
    setEditErrors({})
    setActiveTab('existing')
  }

  const handleStartEditFarmer = () => {
    setEditDraft({
      name: selectedCustomer.name || '',
      mobile: selectedCustomer.mobile || '',
      village: selectedCustomer.village || '',
      gender: selectedCustomer.gender || '',
      age: selectedCustomer.age ?? '',
      cattleCount: selectedCustomer.cattleCount ?? '',
    })
    setEditErrors({})
  }

  const handleSaveFarmerEdit = () => {
    const errors = validateCustomerDraft(editDraft)
    setEditErrors(errors)
    if (Object.keys(errors).length > 0) return

    onSelectCustomer({
      ...selectedCustomer,
      ...editDraft,
      age: Number(editDraft.age),
      cattleCount: editDraft.cattleCount === '' ? 0 : Number(editDraft.cattleCount),
    })
    setEditDraft(null)
    setEditErrors({})
  }

  const handleSaveNewCustomer = () => {
    const errors = validateCustomerDraft(newCustomerDraft)
    setNewCustomerErrors(errors)
    if (Object.keys(errors).length > 0) return

    const customer = {
      id: `TEMP-${Date.now()}`,
      name: newCustomerDraft.name.trim(),
      mobile: newCustomerDraft.mobile.trim(),
      village: newCustomerDraft.village.trim(),
      gender: newCustomerDraft.gender,
      age: Number(newCustomerDraft.age),
      cattleCount: 0,
      lastPurchase: null,
      totalVisits: 0,
    }

    // TODO: persist new customer to Supabase once this module is wired to the backend.
    onSelectCustomer(customer)
    setNewCustomerDraft(EMPTY_DRAFT)
    setNewCustomerErrors({})
    setNewCustomerMessage({ type: 'success', text: `${customer.name} added as a new customer (ID: ${customer.id}).` })
  }

  return (
    <section className="dbr-card">
      <h2 className="dbr-section-heading">Farmer Purchase Lookup</h2>

      {selectedCustomer && !editDraft && (
        <div className="dbr-farmer-card">
          <span className="dbr-farmer-id-badge">{selectedCustomer.id}</span>
          <h3 className="dbr-farmer-name">{selectedCustomer.name}</h3>

          <div className="dbr-farmer-grid">
            <div>
              <p className="dbr-farmer-detail-label">Mobile</p>
              <p className="dbr-farmer-detail-value">{selectedCustomer.mobile || '—'}</p>
            </div>
            <div>
              <p className="dbr-farmer-detail-label">Village</p>
              <p className="dbr-farmer-detail-value">{selectedCustomer.village || '—'}</p>
            </div>
            <div>
              <p className="dbr-farmer-detail-label">Gender</p>
              <p className="dbr-farmer-detail-value">{selectedCustomer.gender || '—'}</p>
            </div>
            <div>
              <p className="dbr-farmer-detail-label">Age</p>
              <p className="dbr-farmer-detail-value">{selectedCustomer.age ?? '—'}</p>
            </div>
            <div>
              <p className="dbr-farmer-detail-label">Cattle Count</p>
              <p className="dbr-farmer-detail-value">{selectedCustomer.cattleCount ?? '—'}</p>
            </div>
            <div>
              <p className="dbr-farmer-detail-label">Last Purchase</p>
              <p className="dbr-farmer-detail-value">{selectedCustomer.lastPurchase ? formatDate(selectedCustomer.lastPurchase) : 'No prior purchase'}</p>
            </div>
            <div>
              <p className="dbr-farmer-detail-label">Total Visits</p>
              <p className="dbr-farmer-detail-value">{selectedCustomer.totalVisits ?? 0}</p>
            </div>
          </div>

          <div className="dbr-farmer-actions">
            <button type="button" className="dbr-btn dbr-btn-secondary dbr-btn-sm" onClick={handleStartEditFarmer}>
              Edit Details
            </button>
            <button type="button" className="dbr-btn dbr-btn-secondary dbr-btn-sm" onClick={handleChangeCustomer}>
              Change
            </button>
          </div>
        </div>
      )}

      {editDraft && (
        <div className="dbr-new-customer-form">
          {EDIT_FIELDS.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={editDraft[field.name]}
              error={editErrors[field.name]}
              onChange={(name, value) => setEditDraft((prev) => ({ ...prev, [name]: value }))}
              idPrefix="edit"
            />
          ))}
          <div className="dbr-new-customer-actions">
            <button type="button" className="dbr-btn dbr-btn-secondary" onClick={() => { setEditDraft(null); setEditErrors({}) }}>
              Cancel
            </button>
            <button type="button" className="dbr-btn dbr-btn-primary" onClick={handleSaveFarmerEdit}>
              Save Changes
            </button>
          </div>
          {/* Note: edits here apply only to this entry's customer copy, not the master farmer directory. */}
        </div>
      )}

      {!selectedCustomer && !editDraft && (
        <>
          <div className="dbr-tabs" role="tablist" aria-label="Farmer lookup mode">
            {TABS.map((tab, index) => (
              <button
                key={tab.key}
                ref={(el) => { tabRefs.current[index] = el }}
                type="button"
                role="tab"
                id={`dbr-tab-${tab.key}`}
                aria-selected={activeTab === tab.key}
                aria-controls={`dbr-tabpanel-${tab.key}`}
                tabIndex={activeTab === tab.key ? 0 : -1}
                className={`dbr-tab${activeTab === tab.key ? ' dbr-tab-active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'existing' && (
            <div role="tabpanel" id="dbr-tabpanel-existing" aria-labelledby="dbr-tab-existing">
              <div className="dbr-search-row">
                <input
                  type="text"
                  className="dbr-input"
                  placeholder="Search by Farmer ID or Mobile"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setNotFound(false) }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  aria-label="Search by Farmer ID or Mobile"
                />
                <button type="button" className="dbr-btn dbr-btn-primary" onClick={handleSearch} aria-label="Search farmer">
                  <Search size={15} aria-hidden="true" />
                </button>
              </div>

              {notFound && (
                <div className="dbr-empty-state">
                  <UserRoundCheck size={28} aria-hidden="true" />
                  <p className="dbr-empty-state-title">No farmer found</p>
                  <p>Check the Farmer ID or mobile number, or add them as a new customer.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'new' && (
            <div role="tabpanel" id="dbr-tabpanel-new" aria-labelledby="dbr-tab-new">
              <div className="dbr-new-customer-form">
                {NEW_CUSTOMER_FIELDS.map((field) => (
                  <FormField
                    key={field.name}
                    field={field}
                    value={newCustomerDraft[field.name]}
                    error={newCustomerErrors[field.name]}
                    onChange={(name, value) => setNewCustomerDraft((prev) => ({ ...prev, [name]: value }))}
                    idPrefix="newcust"
                  />
                ))}
                <FormMessage {...newCustomerMessage} onDismiss={() => setNewCustomerMessage(null)} />
                <div className="dbr-new-customer-actions">
                  <button type="button" className="dbr-btn dbr-btn-primary" onClick={handleSaveNewCustomer}>
                    Save Customer
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
