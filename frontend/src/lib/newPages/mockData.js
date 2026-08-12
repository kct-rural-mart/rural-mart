export const INITIAL_RURAL_MARTS = []

export const MONTHLY_TREND_DATA = []

export const QUARTERLY_TREND_DATA = []

export const HALFYEARLY_TREND_DATA = []

export const YEARLY_TREND_DATA = []

export const INITIAL_ALERTS = []

export const FINANCIAL_MARTS_DATA = []

export const FINANCIAL_TREND_DATA = []

export const REVENUE_OPEX_DATA = []

export const BILLS_GROWTH_DATA = []

export const FARMER_OUTREACH_MARTS = []

export const FARMER_DATABASE = []

export const NEW_VS_REPEAT_DONUT = [
  { name: 'Repeat Farmers', value: 0, percentage: 0, color: '#059669' },
  { name: 'New Farmers', value: 0, percentage: 0, color: '#3b82f6' },
]

export const FARMER_GROWTH_TREND = []

export const OUTREACH_PERFORMANCE_DATA = []

export const CUSTOMER_RETENTION_DATA = []

export const PRODUCTS_INVENTORY_ITEMS = []

export const INVENTORY_MOVEMENT_DATA = []

export const TOP_10_PRODUCTS_DATA = []

export const PRODUCT_CATEGORY_PERFORMANCE = []

export const STOCK_HEALTH_BY_MART = []

export const FAST_SLOW_MOVING_PRODUCTS = []

export const DISTRICT_PERFORMANCE_DATA = []

export const RADAR_SCORE_DIMENSION_DATA = [
  { factor: 'Sales Growth', maxScore: 20, topMartScore: 0, avgNetworkScore: 0, benchmarkScore: 0 },
  { factor: 'Profitability', maxScore: 20, topMartScore: 0, avgNetworkScore: 0, benchmarkScore: 0 },
  { factor: 'Farmer Engagement', maxScore: 20, topMartScore: 0, avgNetworkScore: 0, benchmarkScore: 0 },
  { factor: 'Outreach Impact', maxScore: 15, topMartScore: 0, avgNetworkScore: 0, benchmarkScore: 0 },
  { factor: 'Inventory Health', maxScore: 15, topMartScore: 0, avgNetworkScore: 0, benchmarkScore: 0 },
  { factor: 'Compliance', maxScore: 10, topMartScore: 0, avgNetworkScore: 0, benchmarkScore: 0 },
]

export const MONTHLY_MART_GROWTH_DATA = []

export const DATA_UPDATE_STATUS_RECORDS = []

export const AVAILABLE_REPORTS_DATA = [
  {
    id: 'rep-1',
    name: 'Combined Network Performance Audit',
    type: 'Combined Network',
    reportingPeriod: 'Current Month',
    format: 'PDF & Excel',
    category: 'Financial',
    description: 'Consolidated network audit report combining sales revenue, profitability, score ranking, and compliance.',
    size: '1.2 MB',
    lastGenerated: 'Not generated',
    downloadsCount: 0,
    district: 'All',
    ruralMart: 'All',
  },
  {
    id: 'rep-2',
    name: 'Individual Mart Operational Scorecard',
    type: 'Individual Mart',
    reportingPeriod: 'Current Month',
    format: 'PDF',
    category: 'Operations',
    description: 'Performance index breakdown for individual Rural Mart outposts.',
    size: '0.8 MB',
    lastGenerated: 'Not generated',
    downloadsCount: 0,
    district: 'All',
    ruralMart: 'All',
  },
  {
    id: 'rep-3',
    name: 'Business & Finance Ledger & Subsidy Audit',
    type: 'Business & Finance',
    reportingPeriod: 'Current Quarter',
    format: 'Excel',
    category: 'Financial',
    description: 'Operating ledger, gross margins, and net profit breakdowns.',
    size: '1.5 MB',
    lastGenerated: 'Not generated',
    downloadsCount: 0,
    district: 'All',
    ruralMart: 'All',
  },
  {
    id: 'rep-4',
    name: 'Farmers & Animal Husbandry Outreach Report',
    type: 'Farmers & Outreach',
    reportingPeriod: 'Current Month',
    format: 'PDF',
    category: 'Outreach',
    description: 'Registered farmer counts, active footfall, panchayat outreach sessions, and cattle coverage.',
    size: '1.1 MB',
    lastGenerated: 'Not generated',
    downloadsCount: 0,
    district: 'All',
    ruralMart: 'All',
  },
  {
    id: 'rep-5',
    name: 'Products & Inventory Reorder Analysis',
    type: 'Products & Inventory',
    reportingPeriod: 'Current Month',
    format: 'Excel',
    category: 'Inventory',
    description: 'Fast/slow-moving SKU audit, dead stock risk, low stock reorder thresholds, and vendor fulfillment status.',
    size: '0.9 MB',
    lastGenerated: 'Not generated',
    downloadsCount: 0,
    district: 'All',
    ruralMart: 'All',
  },
]

export const EXPORT_HISTORY_DATA = []

export const REPORT_GENERATION_TREND_DATA = []

export const REPORT_TYPE_DISTRIBUTION_DATA = []

export const DOWNLOAD_ACTIVITY_DATA = []

export const REPORT_USAGE_CATEGORY_DATA = []

export const ADMIN_USERS_DATA = [
  {
    id: 'usr-1',
    name: 'EDF Executive Admin',
    role: 'Super Admin',
    email: 'admin@ruralmart.in',
    status: 'Active',
    lastLogin: 'Active now',
    department: 'State Regional Office',
    phone: '+91 98401 23456',
  },
]

export const SYSTEM_ACTIVITY_DATA = []
