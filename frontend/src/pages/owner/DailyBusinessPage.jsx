import React, { useEffect, useMemo, useRef, useState } from 'react'
import '../../styles/dailyBusiness.css'
import BusinessHeader from '../../components/owner/BusinessHeader'
import BusinessKPICards from '../../components/owner/BusinessKPICards'
import OperationalMetricsForm from '../../components/owner/OperationalMetricsForm'
import FarmerLookup from '../../components/owner/FarmerLookup'
import DailyBusinessFooter from '../../components/owner/DailyBusinessFooter'
import DailyEntryHistory from '../../components/owner/DailyEntryHistory'
import DailyEntryDetails from '../../components/owner/DailyEntryDetails'
import FormMessage from '../../components/common/FormMessage'
import {
  OPERATIONAL_FIELDS,
  loadEntries,
  saveEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  validateEntry,
  computeDailyKpis,
  filterEntries,
} from '../../services/dailyBusinessService'

const EMPTY_OPERATIONAL_FIELDS = {
  productCategory: '',
  salesValue: '',
  procurementValue: '',
  openingStock: '',
  closingStock: '',
  salesQuantity: '',
  procurementQuantity: '',
  customerBills: '',
}

const EMPTY_HISTORY_FILTERS = { search: '', businessDate: '', status: 'All' }

function todayString() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function DailyBusinessPage() {
  const [businessDate, setBusinessDate] = useState(todayString)
  const [operationalFields, setOperationalFields] = useState(EMPTY_OPERATIONAL_FIELDS)
  const [fieldErrors, setFieldErrors] = useState({})
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [entries, setEntries] = useState([])
  const [editingEntryId, setEditingEntryId] = useState(null)
  const [formTouched, setFormTouched] = useState(false)
  const [formMessage, setFormMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyFilters, setHistoryFilters] = useState(EMPTY_HISTORY_FILTERS)
  const [detailsEntry, setDetailsEntry] = useState(null)
  const [clearConfirmPending, setClearConfirmPending] = useState(false)

  const formHeadingRef = useRef(null)

  useEffect(() => {
    setEntries(loadEntries())
  }, [])

  const filteredHistoryEntries = useMemo(() => filterEntries(entries, historyFilters), [entries, historyFilters])
  const kpis = useMemo(() => computeDailyKpis(entries, businessDate), [entries, businessDate])

  const resetForm = () => {
    setOperationalFields(EMPTY_OPERATIONAL_FIELDS)
    setFieldErrors({})
    setSelectedCustomer(null)
    setEditingEntryId(null)
    setFormTouched(false)
  }

  const handleFieldChange = (name, value) => {
    setOperationalFields((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
    setFormTouched(true)
  }

  const handleBusinessDateChange = (value) => {
    setBusinessDate(value)
    setFormTouched(true)
  }

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer)
    setFormTouched(true)
  }

  const handleClearCustomer = () => {
    setSelectedCustomer(null)
    setFormTouched(true)
  }

  const handleSaveOrUpdate = () => {
    const { valid, errors } = validateEntry({ ...operationalFields, businessDate })
    setFieldErrors(errors)

    if (!valid) {
      setFormMessage({ type: 'error', text: 'Please fix the highlighted fields before saving.' })
      const firstInvalidField = OPERATIONAL_FIELDS.find((field) => errors[field.name])
      if (firstInvalidField) {
        document.getElementById(`op-${firstInvalidField.name}`)?.focus()
      }
      return
    }

    setIsSubmitting(true)

    let savedEntry
    let updatedEntries
    if (editingEntryId) {
      const existing = entries.find((entry) => entry.id === editingEntryId)
      savedEntry = updateEntry(existing, operationalFields, selectedCustomer, businessDate)
      updatedEntries = entries.map((entry) => (entry.id === editingEntryId ? savedEntry : entry))
    } else {
      savedEntry = createEntry(operationalFields, selectedCustomer, businessDate)
      updatedEntries = [...entries, savedEntry]
    }

    saveEntries(updatedEntries)
    setEntries(updatedEntries)
    console.log(editingEntryId ? 'Updated daily entry:' : 'Saved daily entry:', savedEntry)
    setFormMessage({
      type: 'success',
      text: editingEntryId ? 'Daily entry updated successfully.' : 'Daily entry saved successfully.',
    })
    resetForm()
    setIsSubmitting(false)
  }

  const handleClearFormClick = () => {
    if (formTouched) {
      setClearConfirmPending(true)
    } else {
      resetForm()
      setFormMessage(null)
    }
  }

  const handleCancelEditingClick = () => {
    if (formTouched) {
      setClearConfirmPending(true)
    } else {
      resetForm()
    }
  }

  const handleConfirmDiscard = () => {
    resetForm()
    setClearConfirmPending(false)
    setFormMessage(null)
  }

  const handleCancelDiscard = () => {
    setClearConfirmPending(false)
  }

  const handleEditEntry = (entry) => {
    setHistoryOpen(false)
    setDetailsEntry(null)
    setOperationalFields({
      productCategory: entry.productCategory ?? '',
      salesValue: String(entry.salesValue ?? ''),
      procurementValue: String(entry.procurementValue ?? ''),
      openingStock: String(entry.openingStock ?? ''),
      closingStock: String(entry.closingStock ?? ''),
      salesQuantity: String(entry.salesQuantity ?? ''),
      procurementQuantity: String(entry.procurementQuantity ?? ''),
      customerBills: String(entry.customerBills ?? ''),
    })
    setBusinessDate(entry.businessDate)
    setSelectedCustomer(entry.customer ?? null)
    setEditingEntryId(entry.id)
    setFieldErrors({})
    setFormTouched(false)
    setFormMessage(null)
    requestAnimationFrame(() => {
      formHeadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      formHeadingRef.current?.focus()
    })
  }

  const handleViewEntry = (entry) => setDetailsEntry(entry)

  const handleDeleteEntry = (entry) => {
    const updatedEntries = deleteEntry(entries, entry.id)
    saveEntries(updatedEntries)
    setEntries(updatedEntries)
    console.log('Deleted daily entry:', entry)
    setFormMessage({ type: 'success', text: 'Daily entry deleted.' })

    if (detailsEntry?.id === entry.id) setDetailsEntry(null)
    if (editingEntryId === entry.id) resetForm()
  }

  return (
    <div className="dbr-page">
      <BusinessHeader
        businessDate={businessDate}
        onBusinessDateChange={handleBusinessDateChange}
        isEditing={!!editingEntryId}
        entryCount={entries.length}
        onOpenHistory={() => setHistoryOpen(true)}
      />

      <BusinessKPICards kpis={kpis} />

      <FormMessage {...formMessage} onDismiss={() => setFormMessage(null)} />

      <div className="dbr-main-grid">
        <OperationalMetricsForm
          values={operationalFields}
          errors={fieldErrors}
          onChange={handleFieldChange}
          headingRef={formHeadingRef}
        />
        <FarmerLookup
          selectedCustomer={selectedCustomer}
          onSelectCustomer={handleSelectCustomer}
          onClearCustomer={handleClearCustomer}
        />
      </div>

      <DailyBusinessFooter
        isEditing={!!editingEntryId}
        isSubmitting={isSubmitting}
        clearConfirmPending={clearConfirmPending}
        onClearFormClick={handleClearFormClick}
        onConfirmDiscard={handleConfirmDiscard}
        onCancelDiscard={handleCancelDiscard}
        onCancelEditingClick={handleCancelEditingClick}
        onSubmit={handleSaveOrUpdate}
      />

      <DailyEntryHistory
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        entries={filteredHistoryEntries}
        totalCount={entries.length}
        filters={historyFilters}
        onFiltersChange={setHistoryFilters}
        onClearFilters={() => setHistoryFilters(EMPTY_HISTORY_FILTERS)}
        onView={handleViewEntry}
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
      />

      <DailyEntryDetails entry={detailsEntry} onClose={() => setDetailsEntry(null)} onEdit={handleEditEntry} />
    </div>
  )
}
