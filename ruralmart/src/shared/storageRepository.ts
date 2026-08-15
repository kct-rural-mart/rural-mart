import { StorageRepository } from './types/storage';

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
} as const;

export class NoOpStorageRepository implements StorageRepository {
  get<T>(_key: string): T | null {
    return null;
  }

  set<T>(_key: string, _data: T): void {
    // No-op for Supabase preparation phase
  }

  remove(_key: string): void {
    // No-op for Supabase preparation phase
  }
}

// Singleton repository instance (can later be swapped with SupabaseRepository)
export const currentRepository: StorageRepository = new NoOpStorageRepository();
