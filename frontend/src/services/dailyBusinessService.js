import { IndianRupee, Receipt, Users, Percent } from 'lucide-react'

const STORAGE_KEY = 'ruralmart_daily_business_entries'

const NUMERIC_FIELDS = [
  'salesValue',
  'procurementValue',
  'openingStock',
  'closingStock',
  'salesQuantity',
  'procurementQuantity',
  'customerBills',
]

export const OPERATIONAL_FIELDS = [
  {
    name: 'productCategory',
    label: 'Product Category',
    type: 'select',
    required: true,
    placeholder: 'Select a category',
    options: [
      { value: 'Seeds', label: 'Seeds' },
      { value: 'Fertilizers', label: 'Fertilizers' },
      { value: 'Pesticides', label: 'Pesticides' },
      { value: 'Cattle Feed', label: 'Cattle Feed' },
      { value: 'Farm Tools', label: 'Farm Tools' },
      { value: 'Groceries', label: 'Groceries' },
      { value: 'Other', label: 'Other' },
    ],
  },
  {
    name: 'salesValue',
    label: 'Sales Value (₹)',
    type: 'number',
    required: true,
    min: 0,
    inputMode: 'decimal',
    placeholder: '0',
  },
  {
    name: 'procurementValue',
    label: 'Procurement Value (₹)',
    type: 'number',
    required: true,
    min: 0,
    inputMode: 'decimal',
    placeholder: '0',
  },
  {
    name: 'openingStock',
    label: 'Opening Stock',
    type: 'number',
    required: true,
    min: 0,
    inputMode: 'numeric',
    placeholder: '0',
  },
  {
    name: 'closingStock',
    label: 'Closing Stock',
    type: 'number',
    required: true,
    min: 0,
    inputMode: 'numeric',
    placeholder: '0',
  },
  {
    name: 'salesQuantity',
    label: 'Sales Quantity',
    type: 'number',
    required: true,
    min: 0,
    inputMode: 'numeric',
    placeholder: '0',
  },
  {
    name: 'procurementQuantity',
    label: 'Procurement Quantity',
    type: 'number',
    required: true,
    min: 0,
    inputMode: 'numeric',
    placeholder: '0',
  },
  {
    name: 'customerBills',
    label: 'Number of Customer Bills',
    type: 'number',
    required: true,
    min: 0,
    inputMode: 'numeric',
    placeholder: '0',
  },
]

export const KPI_CARDS = [
  { key: 'dailySales', label: 'Daily Sales', icon: IndianRupee, format: 'currency' },
  { key: 'avgBillValue', label: 'Average Bill Value', icon: Receipt, format: 'currency' },
  { key: 'dailyFootfall', label: 'Daily Footfall', icon: Users, format: 'number' },
  { key: 'conversionRate', label: 'Conversion Rate', icon: Percent, format: 'percent' },
]

export function loadEntries() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((entry) => entry && typeof entry === 'object' && entry.id)
  } catch {
    return []
  }
}

export function saveEntries(entries) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch (err) {
    console.error('Failed to save daily business entries to localStorage:', err)
  }
}

export function generateEntryId() {
  return `entry_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function toNumber(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

export function normalizeEntry(formValues) {
  const normalized = {
    productCategory: formValues.productCategory || '',
  }
  NUMERIC_FIELDS.forEach((field) => {
    normalized[field] = toNumber(formValues[field])
  })
  return normalized
}

function normalizeCustomer(customer) {
  if (!customer) return null
  return {
    id: customer.id ?? '',
    name: customer.name ?? '',
    mobile: customer.mobile ?? '',
    village: customer.village ?? '',
    gender: customer.gender ?? '',
    age: toNumber(customer.age),
    cattleCount: toNumber(customer.cattleCount),
    lastPurchase: customer.lastPurchase ?? null,
    totalVisits: toNumber(customer.totalVisits),
  }
}

export function createEntry(formValues, customer, businessDate) {
  const now = new Date().toISOString()
  return {
    id: generateEntryId(),
    businessDate,
    ...normalizeEntry(formValues),
    customer: normalizeCustomer(customer),
    status: 'Saved',
    createdAt: now,
    lastUpdated: now,
  }
}

export function deleteEntry(entries, entryId) {
  return entries.filter((entry) => entry.id !== entryId)
}

export function updateEntry(existingEntry, formValues, customer, businessDate) {
  return {
    ...existingEntry,
    businessDate,
    ...normalizeEntry(formValues),
    customer: normalizeCustomer(customer),
    status: 'Edited',
    lastUpdated: new Date().toISOString(),
  }
}

// TODO: closing-stock rule assumes no returns/wastage adjustments; revisit once
// those flows are modeled.
export function validateEntry(formValues) {
  const errors = {}

  if (!isRequiredString(formValues.businessDate)) {
    errors.businessDate = 'Business date is required.'
  }

  if (!isRequiredString(formValues.productCategory)) {
    errors.productCategory = 'Product category is required.'
  }

  NUMERIC_FIELDS.forEach((field) => {
    const raw = formValues[field]
    if (raw === '' || raw === null || raw === undefined) {
      errors[field] = 'This field is required.'
      return
    }
    const num = Number(raw)
    if (!Number.isFinite(num)) {
      errors[field] = 'Enter a valid number.'
      return
    }
    if (num < 0) {
      errors[field] = 'Value cannot be negative.'
    }
  })

  if (!errors.customerBills) {
    const bills = Number(formValues.customerBills)
    if (!Number.isInteger(bills)) {
      errors.customerBills = 'Customer bills must be a whole number.'
    }
  }

  if (!errors.closingStock && !errors.openingStock && !errors.procurementQuantity) {
    const opening = Number(formValues.openingStock)
    const procurementQty = Number(formValues.procurementQuantity)
    const closing = Number(formValues.closingStock)
    if (closing > opening + procurementQty) {
      errors.closingStock = 'Closing stock cannot exceed opening stock plus procurement quantity.'
    }
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

function isRequiredString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

// TODO: no lead/footfall-vs-conversion dataset exists yet; conversionRate is a
// documented placeholder until that tracking is built.
const MOCK_CONVERSION_RATE = 68

function aggregateForDate(entries, date) {
  const dayEntries = entries.filter((entry) => entry.businessDate === date)
  const dailySales = dayEntries.reduce((sum, entry) => sum + toNumber(entry.salesValue), 0)
  const dailyFootfall = dayEntries.reduce((sum, entry) => sum + toNumber(entry.customerBills), 0)
  const avgBillValue = dailyFootfall > 0 ? dailySales / dailyFootfall : 0
  return { dailySales, avgBillValue, dailyFootfall }
}

function percentChange(current, previous) {
  if (previous === 0) return current === 0 ? 0 : null
  return ((current - previous) / previous) * 100
}

// Business dates are plain YYYY-MM-DD calendar days with no inherent
// timezone. Parsing/formatting them via UTC (e.g. `new Date(str)` +
// `toISOString()`) can shift the displayed day in negative-UTC-offset
// timezones, so date-only strings are handled as local-time components
// throughout this file instead.
function parseDateOnly(dateString) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString || '')
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

function toDateOnlyString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function previousDate(dateString) {
  const date = parseDateOnly(dateString)
  if (!date) return dateString
  date.setDate(date.getDate() - 1)
  return toDateOnlyString(date)
}

export function computeDailyKpis(entries, businessDate) {
  const today = aggregateForDate(entries, businessDate)
  const yesterday = aggregateForDate(entries, previousDate(businessDate))

  return {
    dailySales: today.dailySales,
    avgBillValue: today.avgBillValue,
    dailyFootfall: today.dailyFootfall,
    conversionRate: MOCK_CONVERSION_RATE,
    changes: {
      dailySales: percentChange(today.dailySales, yesterday.dailySales),
      avgBillValue: percentChange(today.avgBillValue, yesterday.avgBillValue),
      dailyFootfall: percentChange(today.dailyFootfall, yesterday.dailyFootfall),
      conversionRate: null,
    },
  }
}

export function filterEntries(entries, filters) {
  const search = (filters.search || '').trim().toLowerCase()
  const businessDate = filters.businessDate || ''
  const status = filters.status || 'All'

  return entries.filter((entry) => {
    if (search) {
      const category = (entry.productCategory || '').toLowerCase()
      const customerName = (entry.customer?.name || '').toLowerCase()
      if (!category.includes(search) && !customerName.includes(search)) {
        return false
      }
    }
    if (businessDate && entry.businessDate !== businessDate) return false
    if (status !== 'All' && entry.status !== status) return false
    return true
  })
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(toNumber(value))
}

export function formatDate(dateString) {
  if (!dateString) return '—'
  const date = parseDateOnly(dateString) || new Date(dateString)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
