import { getFarmersByRuralMart } from './shared/dataServices'

export const OWNER_MART_INFO = {
  name: 'Rural Mart Outpost',
  storeId: '#RM000',
  entrepreneur: 'Mart Owner',
  phone: '',
  email: '',
  district: '',
  block: '',
  village: '',
  latitude: '',
  longitude: '',
  openingDate: '',
  status: 'Active',
  gstNumber: '',
  aadhaarNumber: '',
  bankAccount: '',
  upiId: '',
}

export const INITIAL_OWNER_PRODUCTS = []

export const INITIAL_OWNER_TRANSACTIONS = []

export const INITIAL_OWNER_EXPENSES = []

export function getOwnerFarmers(ruralMartId = 'RM-001') {
  const canonical = getFarmersByRuralMart(ruralMartId)
  return canonical.map((cf) => ({
    id: cf.id,
    name: cf.name,
    village: cf.village,
    phone: cf.phone,
    category: cf.category || 'Smallholder',
    animalCount: cf.animalHeadCount ?? 0,
    lastVisitDate: cf.lastVisit || 'N/A',
    totalPurchases: cf.totalPurchasesVal ?? cf.totalPurchases ?? 0,
    joinedDate: cf.joinedDate || cf.lastVisit || 'N/A',
    aadhaarNumber: cf.aadhaarNumber || 'N/A',
  }))
}

export const INITIAL_OWNER_FARMERS = []

export const OWNER_HOURLY_SALES_TODAY = []

export const OWNER_DAILY_SALES_TREND = []

export const OWNER_MONTHLY_FINANCIAL_SERIES = []

export const INITIAL_OWNER_VOUCHERS = []
