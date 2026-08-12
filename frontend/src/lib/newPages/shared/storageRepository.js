export const STORAGE_KEYS = {
  RURAL_MARTS: 'ruralmart_rural_marts',
  OWNERS: 'ruralmart_owners',
  FARMERS: 'ruralmart_farmers',
  PRODUCTS: 'ruralmart_products',
  INVENTORY: 'ruralmart_inventory',
  SALES: 'ruralmart_sales',
  PURCHASES: 'ruralmart_purchases',
  EXPENSES: 'ruralmart_expenses',
  OUTREACH: 'ruralmart_outreach',
  FINANCIAL_RECORDS: 'ruralmart_financial_records',
  FINANCIAL_LEDGER_LOGS: 'ruralmart_financial_ledger_logs',
  OPERATIONAL_ENTRIES: 'ruralmart_operational_entries',
  APPLICATIONS: 'ruralmart_applications',
  ALERTS: 'ruralmart_alerts',
  AUTH: 'ruralmart_auth',
}

export class LocalStorageRepository {
  get(key) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null
      }
      const raw = localStorage.getItem(key)
      if (!raw) {
        return null
      }
      return JSON.parse(raw)
    } catch (e) {
      console.error(`Error reading key "${key}" from localStorage:`, e)
      return null
    }
  }

  set(key, data) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return
      }
      localStorage.setItem(key, JSON.stringify(data))
    } catch (e) {
      console.error(`Error saving key "${key}" to localStorage:`, e)
    }
  }

  remove(key) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return
      }
      localStorage.removeItem(key)
    } catch (e) {
      console.error(`Error removing key "${key}" from localStorage:`, e)
    }
  }
}

// Singleton repository instance (can later be swapped with a real API-backed one)
export const currentRepository = new LocalStorageRepository()
