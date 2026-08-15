// --- CANONICAL SCHEMAS FOR CENTRAL & OWNER SYNC ---

export type MartStatusType = 'Active' | 'Delayed' | 'Inactive';

export interface RegistrationApplication {
  applicationId: string;
  ownerName: string;
  email: string;
  phone: string;
  ruralMartName: string;
  district: string;
  block: string;
  village: string;
  address: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface CanonicalRuralMart {
  ruralMartId: string;
  ruralMartName: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  district: string;
  block: string;
  village: string;
  address: string;
  openingDate: string;
  status: MartStatusType;
  registrationStatus: 'pending' | 'approved' | 'rejected';
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  gstNumber?: string;
}

export interface CanonicalOwner {
  ownerId: string;
  ruralMartId: string;
  email: string;
  ownerName: string;
  phone: string;
  role: 'owner';
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface CanonicalFarmer {
  id: string;
  ruralMartId: string;
  farmerCode: string;
  name: string;
  phone: string;
  village: string;
  gramPanchayat?: string;
  district: string;
  registrationDate?: string;
  numCattle?: number;
  numOtherLivestock?: number;
  totalAnimalPopulation?: number;
  status: 'New' | 'Repeat' | 'Active' | 'Inactive';
  totalPurchases: number;
  totalSpent: number;
  lastVisit: string;
  animalHeadCount?: number;
  primaryCrop?: string;
  landHoldingAcres?: number;
  age?: number;
  gender?: string;
  category?: string;
  totalPurchasesVal?: number;
  joinedDate?: string;
  aadhaarNumber?: string;
}

export interface CanonicalProduct {
  id: string;
  ruralMartId: string;
  code: string;
  name: string;
  productName?: string;
  category: string;
  district?: string;
  stockQty: number;
  currentStockQuantity?: number;
  unit: string;
  costPrice: number;
  procurementPricePerUnit?: number;
  sellingPrice: number;
  sellingPricePerUnit?: number;
  reorderLevel: number;
  status: 'Healthy' | 'Low Stock' | 'Out of Stock';
  lastRestocked: string;
  supplier?: string;
  supplierName?: string;
  salesQty?: number;
  salesQuantity?: number;
  salesValue?: number;
  procurementQty?: number;
  procurementQuantity?: number;
  procurementValue?: number;
  openingStockQty?: number;
  openingStockQuantity?: number;
  inventoryValue?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CanonicalInventoryRecord {
  id: string;
  ruralMartId: string;
  productId: string;
  productCode: string;
  productName: string;
  category: string;
  stockQty: number;
  reorderLevel: number;
  unitPrice: number;
  salesQty: number;
  procurementQty: number;
  inventoryValue: number;
  status: 'Healthy' | 'Low Stock' | 'Out of Stock';
  lastRestocked: string;
}

export interface CanonicalSaleRecord {
  id: string;
  ruralMartId: string;
  billNumber: string;
  time: string;
  date: string;
  customerName: string;
  farmerName?: string;
  farmerId?: string;
  itemsCount: number;
  paymentMethod: 'Cash' | 'UPI / Online' | 'Credit / Due';
  amount: number;
  status: 'Completed' | 'Pending' | 'Refunded';
  productName?: string;
  salesQty?: number;
  lineItems?: Array<{
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    lineTotal: number;
  }>;
}

export interface CanonicalPurchaseRecord {
  id: string;
  ruralMartId: string;
  purchaseNumber: string;
  date: string;
  supplier: string;
  itemsCount: number;
  amount: number;
  status: 'Completed' | 'Pending' | 'Approved';
}

export interface CanonicalExpenseRecord {
  id: string;
  ruralMartId: string;
  category: string;
  description: string;
  amount: number;
  time: string;
  date: string;
  paidTo: string;
}

export interface CanonicalOutreachRecord {
  id: string;
  ruralMartId: string;
  programName: string;
  district: string;
  programDate: string;
  farmersReached: number;
  villagesCovered: number;
  animalPopulationCovered: number;
  status: 'Completed' | 'Scheduled' | 'In Progress';
  title?: string;
  activityType?: string;
  village?: string;
  date?: string;
  description?: string;
  topicsCovered?: string;
  topics?: string[];
  farmersAttended?: number;
  existingFarmersCount?: number;
  newLeadsCount?: number;
  photos?: string[];
}

export interface CanonicalFinancialRecord {
  id: string;
  ruralMartId: string;
  name: string;
  district: string;
  status: MartStatusType;
  salesRaw: number;
  procurementRaw: number;
  grossProfitRaw: number;
  netProfitRaw: number;
  operatingExpensesRaw: number;
  profitMargin: number;
  avgBillValue: number;
  totalBills: number;
  salesGrowthPercent: number;
  salesDisplay?: string;
  procurementDisplay?: string;
  grossProfitDisplay?: string;
  netProfitDisplay?: string;
  opexDisplay?: string;
}

// Storage Abstraction Interface for Future Supabase / External DB Replacement
export interface StorageRepository {
  get<T>(key: string): T | null;
  set<T>(key: string, data: T): void;
  remove(key: string): void;
}
