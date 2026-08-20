export type Theme = 'light' | 'dark';

export type District = 'All Districts' | 'Erode' | 'Coimbatore' | 'Tiruppur' | 'Salem' | 'Madurai';

export type RuralMartName = string;

export type TimeGrouping = 'Monthly' | 'Quarterly' | 'Half-yearly' | 'Yearly';

export type MetricSelection = 'Both' | 'Sales' | 'Gross Profit';

export type MartStatus = 'Active' | 'Delayed' | 'Inactive';

export type AlertSeverity = 'Critical' | 'Warning' | 'Info';

export type AlertStatus = 'New' | 'Under Review' | 'Resolved';

export type AlertCategory =
  | 'Missing daily update'
  | 'Sales decline'
  | 'Negative or low profit'
  | 'Low stock or stock-out'
  | 'Low farmer footfall'
  | 'Missing outreach report'
  | 'Inactive Rural Mart';

export interface AlertItem {
  id: string;
  ruralMart: string;
  district: string;
  category: AlertCategory;
  title: string;
  description: string;
  severity: AlertSeverity;
  detectedTime: string;
  status: AlertStatus;
}

export interface RuralMartData {
  dbId?: string;
  id: string;
  name: string;
  district: string;
  status: MartStatus;
  salesCr: number; // in Lakhs/Cr formatted
  salesRaw: number; // in Rupees
  grossProfitLakhs: number;
  grossProfitRaw: number;
  registeredFarmers: number;
  farmersReached: number;
  farmerFootfall: number;
  score: number;
  targetScore: number;
  dataCompleteness: number;
  lastUpdated: string;
  manager: string;
  contact: string;
  scoreBreakdown: {
    salesGrowth: number; // max 20
    profitability: number; // max 20
    farmerEngagement: number; // max 20
    outreachImpact: number; // max 15
    inventoryHealth: number; // max 15
    compliance: number; // max 10
  };
}

export interface ChartDataPoint {
  period: string;
  sales: number; // in Lakhs or Cr
  salesRaw: number;
  grossProfit: number; // in Lakhs
  grossProfitRaw: number;
  prevSales?: number;
  prevGrossProfit?: number;
  salesChange: string;
  profitChange: string;
}

export interface GlobalFilters {
  searchQuery: string;
  district: District;
  ruralMart: RuralMartName;
  dateRange: string;
  comparisonPeriod?: string;
}

export interface MartFinancialRecord {
  id: string;
  name: string;
  district: string;
  status: MartStatus;
  salesRaw: number;
  salesDisplay: string;
  procurementRaw: number;
  procurementDisplay: string;
  grossProfitRaw: number;
  grossProfitDisplay: string;
  netProfitRaw: number;
  netProfitDisplay: string;
  operatingExpensesRaw: number;
  opexDisplay: string;
  profitMargin: number; // Percentage, e.g. 15.26
  avgBillValue: number; // Rupees
  totalBills: number;
  salesGrowthPercent: number; // Percentage
  trend: 'up' | 'down' | 'flat';
  sparklineData: number[];
  monthlyBreakdown?: {
    month: string;
    sales: number;
    procurement: number;
    netProfit: number;
    bills: number;
  }[];
}

export interface FinancialTrendPoint {
  period: string;
  sales: number; // in Lakhs
  procurement: number; // in Lakhs
  grossProfit: number; // in Lakhs
  netProfit: number; // in Lakhs
}

export interface RevenueOpexPoint {
  period: string;
  revenue: number; // in Lakhs
  cogs: number; // in Lakhs
  opex: number; // in Lakhs
  netProfit: number; // in Lakhs
}

export interface BillsGrowthPoint {
  period: string;
  bills: number;
  growthPercent: number;
  avgBillValue: number;
}

export interface FarmerOutreachMartRecord {
  id: string;
  name: string;
  district: string;
  status: MartStatus;
  totalRegisteredFarmers: number;
  newFarmers: number;
  repeatFarmers: number;
  farmersReached: number;
  outreachProgramsConducted: number;
  villagesCovered: number;
  animalPopulationCovered: number;
  retentionRate: number; // e.g. 78.5
  sparklineData: number[];
}

export interface FarmerRecord {
  id: string;
  name: string;
  village: string;
  district: string;
  ruralMart: string;
  category: string;
  animalHeadCount: number;
  lastVisit: string;
  status: 'New' | 'Repeat';
  phone: string;
  totalPurchasesVal: number;
  joinedDate: string;
  itemsPurchased?: string;
  purchaseDate?: string;
}

export interface NewVsRepeatDataPoint {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface FarmerGrowthDataPoint {
  period: string;
  registeredFarmers: number;
  newFarmers: number;
  repeatFarmers: number;
}

export interface OutreachPerformanceDataPoint {
  period: string;
  programsConducted: number;
  farmersReached: number;
  villagesCovered: number;
}

export interface RetentionTrendDataPoint {
  period: string;
  retentionRate: number;
  repeatVisitCount: number;
}

export interface ProductInventoryRecord {
  id: string;
  code: string;
  name: string;
  category: string;
  ruralMart: string;
  district: string;
  stockQty: number;
  reorderLevel: number;
  unitPrice: number;
  salesQty: number;
  procurementQty: number;
  inventoryValue: number;
  status: 'Healthy' | 'Low Stock' | 'Out of Stock';
  lastRestocked: string;
}

export interface InventoryMovementDataPoint {
  period: string;
  openingStock: number;
  procurement: number;
  sales: number;
  closingStock: number;
}

export interface TopProductDataPoint {
  name: string;
  category: string;
  salesQty: number;
  revenue: number;
}

export interface ProductCategoryPerformanceDataPoint {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface StockHealthDataPoint {
  ruralMart: string;
  healthy: number;
  lowStock: number;
  outOfStock: number;
}

export interface FastSlowProductRecord {
  id: string;
  name: string;
  category: string;
  velocity: 'Fast' | 'Slow';
  salesQty: number;
  turnoverDays: number;
  trendPercent: number;
  trend: 'up' | 'down';
}

export interface DistrictPerformanceDataPoint {
  district: string;
  martsCount: number;
  activeCount: number;
  avgScore: number;
  totalSalesLakhs: number;
  registeredFarmers: number;
}

export interface RadarScoreDimensionPoint {
  factor: string;
  maxScore: number;
  topMartScore: number;
  avgNetworkScore: number;
  benchmarkScore: number;
}

export interface MonthlyMartGrowthDataPoint {
  period: string;
  activeMarts: number;
  totalMarts: number;
  avgScore: number;
  networkSalesCr: number;
}

export interface MartDataUpdateRecord {
  id: string;
  ruralMart: string;
  district: string;
  lastUpdated: string;
  status: 'Up-to-Date' | 'Delayed' | 'Sync Pending' | 'Offline';
  completenessPercent: number;
  syncLagMinutes: number;
  pendingRecordsCount: number;
}

export interface AvailableReportItem {
  id: string;
  name: string;
  type: string;
  reportingPeriod: string;
  format: 'PDF' | 'Excel' | 'PDF & Excel' | 'CSV';
  category: 'Financial' | 'Operations' | 'Outreach' | 'Inventory' | 'Compliance';
  description: string;
  size: string;
  lastGenerated: string;
  downloadsCount: number;
  district?: string;
  ruralMart?: string;
}

export interface AdminUserItem {
  id: string;
  name: string;
  role: 'Super Admin' | 'District Manager' | 'Auditor' | 'Mart Manager';
  email: string;
  status: 'Active' | 'Inactive' | 'Pending';
  lastLogin: string;
  department?: string;
  phone?: string;
}

export interface SystemActivityRecord {
  id: string;
  dateTime: string;
  user: string;
  action: string;
  module: string;
  status: 'Completed' | 'Warning' | 'Failed';
}

export interface NotificationSettingsState {
  emailNotifications: boolean;
  lowStockAlerts: boolean;
  salesDeclineAlerts: boolean;
  dataUpdateReminders: boolean;
  martApprovalNotifications: boolean;
}

export interface ReportSettingsState {
  defaultFormat: 'PDF' | 'Excel';
  scheduledReports: boolean;
  monthlyReports: boolean;
  quarterlyReports: boolean;
  yearlyReports: boolean;
}

export interface SystemPreferencesState {
  defaultTheme: 'Light' | 'Dark' | 'System';
  defaultDashboard: string;
  timeZone: string;
  dateFormat: string;
  language: string;
}


export interface ExportHistoryRecord {
  id: string;
  dateTime: string;
  reportName: string;
  generatedBy: string;
  format: 'PDF' | 'Excel' | 'CSV';
  status: 'Completed' | 'Processing' | 'Failed';
  fileSize: string;
  district?: string;
  ruralMart?: string;
}

export interface ReportGenerationTrendPoint {
  month: string;
  generatedCount: number;
  downloadsCount: number;
}

export interface ReportTypeDistributionPoint {
  name: string;
  value: number;
  color: string;
}

export interface DownloadActivityMonthPoint {
  month: string;
  pdfDownloads: number;
  excelDownloads: number;
}

export interface ReportUsageCategoryPoint {
  category: string;
  count: number;
  percentage: number;
}

// Owner Portal Types
export interface MartRegistrationFormData {
  // Section 1 — Rural Mart Details
  martName: string;
  mobileNumber: string;
  district: string;
  block: string;
  village: string;
  physicalAddress: string;
  openingDate: string;
  gstNumber?: string;
  martPhotoFileName?: string;

  // Section 2 — Entrepreneur Details (KYC)
  entrepreneurName: string;
  entrepreneurPrimaryMobile: string;
  entrepreneurSecondaryMobile?: string;
  entrepreneurEmail: string;
  entrepreneurDob: string;
  entrepreneurGender: string;
  entrepreneurAddressPermanent: string;
  entrepreneurAddressTemporary?: string;
  entrepreneurQualification: string;
  entrepreneurAadhaarNumber: string;
  entrepreneurPanNumber: string;
  bankAccountNumber: string;
  ifscCode: string;
  bankName: string;
  bankBranch: string;
  entrepreneurPhotoFileName?: string;
}

export interface OwnerDailyTransaction {
  id: string;
  billNumber: string;
  time: string;
  customerName: string;
  farmerId?: string;
  itemsCount: number;
  paymentMethod: 'Cash' | 'UPI / Online' | 'Credit / Due';
  amount: number;
  status: 'Completed' | 'Pending' | 'Refunded';
}

export interface OwnerDailyExpense {
  id: string;
  category: string;
  description: string;
  amount: number;
  time: string;
  paidTo: string;
}

export interface OwnerProductItem {
  id: string;
  code: string;
  name: string;
  category: string;
  stockQty: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  status: 'Healthy' | 'Low Stock' | 'Out of Stock';
  lastRestocked: string;
  supplier?: string;
}

export interface OwnerFinancialVoucher {
  id: string;
  voucherNumber: string;
  date: string;
  operationType: string; // Free text input
  category: string;
  amount: number;
  paymentMode: string;
  narration: string;
  status: 'Verified' | 'Pending Audit' | 'Approved';
}

export interface OwnerFarmerRecord {
  id: string;
  name: string;
  village: string;
  phone: string;
  category: 'Dairy Farmer' | 'Poultry Farmer' | 'Agriculture' | 'Goat/Sheep Rearing';
  animalCount: number;
  lastVisitDate: string;
  totalPurchases: number;
  joinedDate: string;
  aadhaarNumber?: string;
  gender?: string;
  age?: number;
  cattleCount?: number;
}



