import {
  CanonicalRuralMart,
  CanonicalOwner,
  CanonicalFarmer,
  CanonicalProduct,
  CanonicalInventoryRecord,
  CanonicalSaleRecord,
  CanonicalPurchaseRecord,
  CanonicalExpenseRecord,
  CanonicalOutreachRecord,
  CanonicalFinancialRecord,
} from './types/storage';
import { STORAGE_KEYS, currentRepository } from './storageRepository';
import {
  INITIAL_CANONICAL_MARTS,
  INITIAL_CANONICAL_OWNERS,
  INITIAL_CANONICAL_FARMERS,
  INITIAL_CANONICAL_PRODUCTS,
  INITIAL_CANONICAL_SALES,
  INITIAL_CANONICAL_EXPENSES,
  INITIAL_CANONICAL_OUTREACH,
  INITIAL_CANONICAL_FINANCIALS,
  INITIAL_CANONICAL_APPLICATIONS,
} from './seedData';
import { RegistrationApplication, AuthSession } from '../lib/storageService';
import { MartFinancialRecord, FarmerOutreachMartRecord, RuralMartData, AlertItem, ChartDataPoint, TimeGrouping } from './types';
import {
  INITIAL_RURAL_MARTS,
  INITIAL_ALERTS,
  MONTHLY_TREND_DATA,
  QUARTERLY_TREND_DATA,
  HALFYEARLY_TREND_DATA,
  YEARLY_TREND_DATA,
} from '../mockData';

// Module-level in-memory fallback store for financial ledger logs (Operating Expense /
// financial entries), mirroring the `|| INITIAL_CANONICAL_X` stable-reference pattern used
// by every other entity getter below (e.g. getFarmers, getSales) given `currentRepository`
// is currently a no-op stub. Without a STABLE reference here, getFinancialEntries() returned
// a brand-new `[]`/`{}` literal on every call instead of persisting mutations — so a saved
// Operating Expense was silently discarded before it could reach Recent Transactions or the
// Operating Expense panel, even though it appeared to affect Profit Calculation (that snapshot
// is computed from in-memory component state at save-time, independent of this store).
let financialLedgerLogsStore: Record<string, FinancialEntryRecord[]> = {};

function getFinancialLedgerLogsAll(): Record<string, FinancialEntryRecord[]> {
  const stored = currentRepository.get<Record<string, FinancialEntryRecord[]>>(STORAGE_KEYS.FINANCIAL_LEDGER_LOGS);
  return stored || financialLedgerLogsStore;
}

function setFinancialLedgerLogsAll(allEntries: Record<string, FinancialEntryRecord[]>): void {
  financialLedgerLogsStore = allEntries;
  currentRepository.set(STORAGE_KEYS.FINANCIAL_LEDGER_LOGS, allEntries);
}

// --- INITIALIZATION / SEEDING ---
export function initSharedDataStore(forceReset: boolean = false): void {
  try {
    if (forceReset) {
      currentRepository.set(STORAGE_KEYS.PRODUCTS, []);
      currentRepository.set(STORAGE_KEYS.SALES, []);
      currentRepository.set(STORAGE_KEYS.INVENTORY, []);
      currentRepository.set(STORAGE_KEYS.OPERATIONAL_ENTRIES, {});
      currentRepository.set(STORAGE_KEYS.PURCHASES, []);
      currentRepository.set(STORAGE_KEYS.EXPENSES, []);
      currentRepository.set(STORAGE_KEYS.FINANCIAL_RECORDS, []);
      currentRepository.set(STORAGE_KEYS.FINANCIAL_LEDGER_LOGS, {});
    } else {
      if (!currentRepository.get(STORAGE_KEYS.RURAL_MARTS)) {
        currentRepository.set(STORAGE_KEYS.RURAL_MARTS, INITIAL_CANONICAL_MARTS);
      }
      if (!currentRepository.get(STORAGE_KEYS.OWNERS)) {
        currentRepository.set(STORAGE_KEYS.OWNERS, INITIAL_CANONICAL_OWNERS);
      }
      if (!currentRepository.get(STORAGE_KEYS.FARMERS)) {
        currentRepository.set(STORAGE_KEYS.FARMERS, INITIAL_CANONICAL_FARMERS);
      }
      if (!currentRepository.get(STORAGE_KEYS.PRODUCTS)) {
        currentRepository.set(STORAGE_KEYS.PRODUCTS, INITIAL_CANONICAL_PRODUCTS);
      }
      if (!currentRepository.get(STORAGE_KEYS.SALES)) {
        currentRepository.set(STORAGE_KEYS.SALES, INITIAL_CANONICAL_SALES);
      }
      if (!currentRepository.get(STORAGE_KEYS.EXPENSES)) {
        currentRepository.set(STORAGE_KEYS.EXPENSES, INITIAL_CANONICAL_EXPENSES);
      }
      if (!currentRepository.get(STORAGE_KEYS.OUTREACH)) {
        currentRepository.set(STORAGE_KEYS.OUTREACH, INITIAL_CANONICAL_OUTREACH);
      }
      if (!currentRepository.get(STORAGE_KEYS.FINANCIAL_RECORDS)) {
        currentRepository.set(STORAGE_KEYS.FINANCIAL_RECORDS, INITIAL_CANONICAL_FINANCIALS);
      }
      if (!currentRepository.get(STORAGE_KEYS.APPLICATIONS)) {
        currentRepository.set(STORAGE_KEYS.APPLICATIONS, INITIAL_CANONICAL_APPLICATIONS);
      }
    }
  } catch (e) {
    console.error('Error initializing shared data store:', e);
  }
}

// Perform a clean wipe of any leftover test products/bills from previous test runs
clearAllMartData('RM-001');

// --- 1. RURAL MARTS SERVICES ---
export function getRuralMarts(): CanonicalRuralMart[] {
  const marts = currentRepository.get<CanonicalRuralMart[]>(STORAGE_KEYS.RURAL_MARTS);
  return marts || INITIAL_CANONICAL_MARTS;
}

export function getRuralMartById(id: string): CanonicalRuralMart | null {
  const marts = getRuralMarts();
  return marts.find((m) => m.ruralMartId === id || m.ruralMartName === id) || null;
}

export function saveRuralMart(data: CanonicalRuralMart): void {
  const marts = getRuralMarts();
  const existingIdx = marts.findIndex((m) => m.ruralMartId === data.ruralMartId);
  if (existingIdx >= 0) {
    marts[existingIdx] = { ...marts[existingIdx], ...data, updatedAt: new Date().toISOString() };
  } else {
    marts.unshift(data);
  }
  currentRepository.set(STORAGE_KEYS.RURAL_MARTS, marts);
}

export function updateRuralMart(id: string, data: Partial<CanonicalRuralMart>): CanonicalRuralMart | null {
  const marts = getRuralMarts();
  const index = marts.findIndex((m) => m.ruralMartId === id);
  if (index === -1) return null;

  const updated: CanonicalRuralMart = {
    ...marts[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  marts[index] = updated;
  currentRepository.set(STORAGE_KEYS.RURAL_MARTS, marts);
  return updated;
}

// --- 2. OWNERS SERVICES ---
export function getOwners(): CanonicalOwner[] {
  const owners = currentRepository.get<CanonicalOwner[]>(STORAGE_KEYS.OWNERS);
  return owners || INITIAL_CANONICAL_OWNERS;
}

export function getOwnerById(id: string): CanonicalOwner | null {
  const owners = getOwners();
  return owners.find((o) => o.ownerId === id) || null;
}

export function saveOwner(data: CanonicalOwner): void {
  const owners = getOwners();
  const existingIdx = owners.findIndex((o) => o.ownerId === data.ownerId);
  if (existingIdx >= 0) {
    owners[existingIdx] = { ...owners[existingIdx], ...data, updatedAt: new Date().toISOString() };
  } else {
    owners.unshift(data);
  }
  currentRepository.set(STORAGE_KEYS.OWNERS, owners);
}

export function updateOwner(id: string, data: Partial<CanonicalOwner>): CanonicalOwner | null {
  const owners = getOwners();
  const index = owners.findIndex((o) => o.ownerId === id);
  if (index === -1) return null;

  const updated: CanonicalOwner = {
    ...owners[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  owners[index] = updated;
  currentRepository.set(STORAGE_KEYS.OWNERS, owners);
  return updated;
}

// --- 3. FARMERS SERVICES ---
export function getFarmers(): CanonicalFarmer[] {
  const farmers = currentRepository.get<CanonicalFarmer[]>(STORAGE_KEYS.FARMERS);
  return farmers || INITIAL_CANONICAL_FARMERS;
}

export function getFarmersByRuralMart(ruralMartId: string): CanonicalFarmer[] {
  const farmers = getFarmers();
  return farmers.filter((f) => f.ruralMartId === ruralMartId);
}

export function getFarmerById(id: string): CanonicalFarmer | null {
  const farmers = getFarmers();
  return farmers.find((f) => f.id === id) || null;
}

export function saveFarmer(data: CanonicalFarmer): void {
  const farmers = getFarmers();
  const index = farmers.findIndex((f) => f.id === data.id);
  if (index >= 0) {
    farmers[index] = data;
  } else {
    farmers.unshift(data);
  }
  currentRepository.set(STORAGE_KEYS.FARMERS, farmers);
}

export function updateFarmer(id: string, data: Partial<CanonicalFarmer>): CanonicalFarmer | null {
  const farmers = getFarmers();
  const index = farmers.findIndex((f) => f.id === id);
  if (index === -1) return null;

  const updated = { ...farmers[index], ...data };
  farmers[index] = updated;
  currentRepository.set(STORAGE_KEYS.FARMERS, farmers);
  return updated;
}

export function deleteFarmer(id: string): boolean {
  const farmers = getFarmers();
  const filtered = farmers.filter((f) => f.id !== id);
  currentRepository.set(STORAGE_KEYS.FARMERS, filtered);
  return true;
}

// --- 4. PRODUCTS SERVICES ---
export function getProducts(): CanonicalProduct[] {
  const products = currentRepository.get<CanonicalProduct[]>(STORAGE_KEYS.PRODUCTS);
  return products || INITIAL_CANONICAL_PRODUCTS;
}

export function getProductsByRuralMart(ruralMartId: string): CanonicalProduct[] {
  const products = getProducts();
  return products.filter((p) => p.ruralMartId === ruralMartId);
}

export function getProductById(id: string): CanonicalProduct | null {
  const products = getProducts();
  return products.find((p) => p.id === id) || null;
}

export function saveProduct(data: CanonicalProduct): void {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === data.id);
  if (index >= 0) {
    products[index] = data;
  } else {
    products.unshift(data);
  }
  currentRepository.set(STORAGE_KEYS.PRODUCTS, products);
}

export function updateProduct(id: string, data: Partial<CanonicalProduct>): CanonicalProduct | null {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updated = { ...products[index], ...data };
  products[index] = updated;
  currentRepository.set(STORAGE_KEYS.PRODUCTS, products);
  return updated;
}

export function deleteProduct(id: string): boolean {
  const products = getProducts();
  const filtered = products.filter((p) => p.id !== id);
  currentRepository.set(STORAGE_KEYS.PRODUCTS, filtered);

  const inv = getInventory();
  const filteredInv = inv.filter((i) => i.productId !== id && i.id !== `inv-${id}`);
  currentRepository.set(STORAGE_KEYS.INVENTORY, filteredInv);
  return true;
}

export interface ProcurementInput {
  productName: string;
  category: string;
  unit: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  supplier?: string;
  reorderLevel?: number;
}

export function procureProduct(
  ruralMartId: string = 'RM-001',
  input: ProcurementInput
): { success: boolean; product: CanonicalProduct; purchaseRecord: CanonicalPurchaseRecord; isExisting: boolean } {
  const products = getProductsByRuralMart(ruralMartId);
  const cleanName = input.productName.trim();
  const existingProduct = products.find(
    (p) => p.name.trim().toLowerCase() === cleanName.toLowerCase()
  );

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const formattedDate = `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;
  const totalAmount = input.quantity * input.costPrice;

  let targetProduct: CanonicalProduct;
  let isExisting = false;

  if (existingProduct) {
    isExisting = true;
    // CRITICAL STOCK RULE: DO NOT change Opening Stock of the day.
    // Opening Stock = starting balance.
    const openingStock =
      existingProduct.openingStockQty ??
      existingProduct.openingStockQuantity ??
      (existingProduct.stockQty - (existingProduct.procurementQty || 0) + (existingProduct.salesQty || 0));

    const newProcQty = (existingProduct.procurementQty || 0) + input.quantity;
    const currentSalesQty = existingProduct.salesQty || 0;
    // Closing Stock = Opening Stock + Procurement Received - Sales
    const newClosingStock = openingStock + newProcQty - currentSalesQty;
    const updatedStatus =
      newClosingStock === 0 ? 'Out of Stock' : newClosingStock <= (existingProduct.reorderLevel || 35) ? 'Low Stock' : 'Healthy';

    targetProduct = {
      ...existingProduct,
      category: input.category || existingProduct.category,
      unit: input.unit || existingProduct.unit,
      openingStockQty: openingStock, // Opening Stock is NEVER modified when adding procurement
      openingStockQuantity: openingStock,
      procurementQty: newProcQty,
      procurementQuantity: newProcQty,
      procurementValue: (existingProduct.procurementValue || 0) + totalAmount,
      stockQty: newClosingStock, // Closing stock updated
      currentStockQuantity: newClosingStock,
      costPrice: input.costPrice > 0 ? input.costPrice : existingProduct.costPrice,
      sellingPrice: input.sellingPrice > 0 ? input.sellingPrice : existingProduct.sellingPrice,
      status: updatedStatus,
      lastRestocked: formattedDate,
      supplier: input.supplier || existingProduct.supplier,
      inventoryValue: newClosingStock * (input.sellingPrice > 0 ? input.sellingPrice : existingProduct.sellingPrice),
      updatedAt: new Date().toISOString(),
    };

    updateProduct(existingProduct.id, targetProduct);

    const invList = getInventoryByRuralMart(ruralMartId);
    const invItem = invList.find((i) => i.productId === existingProduct.id);
    if (invItem) {
      updateInventory(invItem.id, {
        category: targetProduct.category,
        stockQty: targetProduct.stockQty,
        procurementQty: targetProduct.procurementQty,
        unitPrice: targetProduct.sellingPrice,
        inventoryValue: targetProduct.inventoryValue,
        status: targetProduct.status,
        lastRestocked: targetProduct.lastRestocked,
      });
    }
  } else {
    // Brand new product created via procurement
    // Opening Stock before procurement received during the day was 0
    const existingCount = products.length;
    const code = `PRD-${String(existingCount + 101).padStart(3, '0')}`;
    const id = `prd-${Date.now()}`;

    const openingStock = 0;
    const newProcQty = input.quantity;
    const newClosingStock = openingStock + newProcQty; // Closing Stock = 0 + quantity - 0 = quantity

    targetProduct = {
      id,
      ruralMartId,
      code,
      name: cleanName,
      productName: cleanName,
      category: input.category || 'General',
      unit: input.unit || 'Kg',
      openingStockQty: openingStock, // Opening stock before procurement received during the day = 0
      openingStockQuantity: openingStock,
      procurementQty: newProcQty,
      procurementQuantity: newProcQty,
      procurementValue: totalAmount,
      salesQty: 0,
      salesQuantity: 0,
      stockQty: newClosingStock, // Closing stock = Opening Stock (0) + Procurement (qty) - Sales (0)
      currentStockQuantity: newClosingStock,
      costPrice: input.costPrice,
      sellingPrice: input.sellingPrice,
      reorderLevel: input.reorderLevel || 20,
      status: input.quantity === 0 ? 'Out of Stock' : input.quantity <= 20 ? 'Low Stock' : 'Healthy',
      lastRestocked: formattedDate,
      supplier: input.supplier || 'Local Supplier',
      inventoryValue: input.quantity * input.sellingPrice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveProduct(targetProduct);

    saveInventory({
      id: `inv-${id}`,
      ruralMartId,
      productId: id,
      productCode: code,
      productName: cleanName,
      category: targetProduct.category,
      stockQty: targetProduct.stockQty,
      reorderLevel: targetProduct.reorderLevel,
      unitPrice: input.sellingPrice,
      salesQty: 0,
      procurementQty: input.quantity,
      inventoryValue: targetProduct.inventoryValue ?? (input.quantity * input.costPrice),
      status: targetProduct.status,
      lastRestocked: formattedDate,
    });
  }

  // Create procurement purchase history record (must be created for EVERY procurement event)
  const existingPurchases = getPurchasesByRuralMart(ruralMartId);
  const purchaseNum = `PO-${String(existingPurchases.length + 501).padStart(4, '0')}`;
  const purchaseRecord: CanonicalPurchaseRecord = {
    id: `pur-${Date.now()}`,
    ruralMartId,
    purchaseNumber: purchaseNum,
    date: dateStr,
    supplier: input.supplier || targetProduct.supplier || 'Vendor / Manufacturer',
    itemsCount: input.quantity,
    amount: totalAmount,
    status: 'Completed',
  };

  savePurchase(purchaseRecord);

  // Also add to operational entry for total procurement calculation
  const opEntry = {
    id: `op-proc-${Date.now()}`,
    timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: dateStr,
    category: targetProduct.category,
    salesValue: 0,
    procurementValue: totalAmount,
    openingStock: targetProduct.openingStockQty || 0, // Opening Stock remains unchanged
    closingStock: targetProduct.stockQty, // Closing Stock = Opening Stock + Procurement - Sales
    salesQty: 0,
    procurementQty: input.quantity,
    farmerName: targetProduct.supplier,
    status: 'Saved',
    billNumber: purchaseNum,
    productName: cleanName,
  };

  saveOperationalEntry(ruralMartId, opEntry);

  return { success: true, product: targetProduct, purchaseRecord, isExisting };
}

// --- 5. INVENTORY SERVICES ---
export function getInventory(): CanonicalInventoryRecord[] {
  const inventory = currentRepository.get<CanonicalInventoryRecord[]>(STORAGE_KEYS.INVENTORY);
  if (inventory && inventory.length > 0) return inventory;

  const products = getProducts();
  return products.map((p) => ({
    id: `inv-${p.id}`,
    ruralMartId: p.ruralMartId,
    productId: p.id,
    productCode: p.code,
    productName: p.name,
    category: p.category,
    stockQty: p.stockQty,
    reorderLevel: p.reorderLevel,
    unitPrice: p.sellingPrice,
    salesQty: 0,
    procurementQty: 0,
    inventoryValue: p.stockQty * p.costPrice,
    status: p.status,
    lastRestocked: p.lastRestocked || 'N/A',
  }));
}

export function getInventoryByRuralMart(ruralMartId: string): CanonicalInventoryRecord[] {
  const inv = getInventory();
  return inv.filter((item) => item.ruralMartId === ruralMartId);
}

export function saveInventory(data: CanonicalInventoryRecord): void {
  const inv = getInventory();
  const index = inv.findIndex((i) => i.id === data.id);
  if (index >= 0) {
    inv[index] = data;
  } else {
    inv.unshift(data);
  }
  currentRepository.set(STORAGE_KEYS.INVENTORY, inv);
}

export function updateInventory(id: string, data: Partial<CanonicalInventoryRecord>): CanonicalInventoryRecord | null {
  const inv = getInventory();
  const index = inv.findIndex((i) => i.id === id);
  if (index === -1) return null;

  const updated = { ...inv[index], ...data };
  inv[index] = updated;
  currentRepository.set(STORAGE_KEYS.INVENTORY, inv);
  return updated;
}

// --- 6. SALES / BUSINESS SERVICES ---
export function getSales(): CanonicalSaleRecord[] {
  const sales = currentRepository.get<CanonicalSaleRecord[]>(STORAGE_KEYS.SALES);
  return sales || INITIAL_CANONICAL_SALES;
}

export function getSalesByRuralMart(ruralMartId: string): CanonicalSaleRecord[] {
  const sales = getSales();
  return sales.filter((s) => s.ruralMartId === ruralMartId);
}

export function saveSale(data: CanonicalSaleRecord): void {
  const sales = getSales();
  sales.unshift(data);
  currentRepository.set(STORAGE_KEYS.SALES, sales);
}

// --- 7. PURCHASES / PROCUREMENT SERVICES ---
export function getPurchases(): CanonicalPurchaseRecord[] {
  const purchases = currentRepository.get<CanonicalPurchaseRecord[]>(STORAGE_KEYS.PURCHASES);
  return purchases || [];
}

export function getPurchasesByRuralMart(ruralMartId: string): CanonicalPurchaseRecord[] {
  const purchases = getPurchases();
  return purchases.filter((p) => p.ruralMartId === ruralMartId);
}

export function savePurchase(data: CanonicalPurchaseRecord): void {
  const purchases = getPurchases();
  purchases.unshift(data);
  currentRepository.set(STORAGE_KEYS.PURCHASES, purchases);
}

// --- 8. EXPENSES SERVICES ---
export function getExpenses(): CanonicalExpenseRecord[] {
  const expenses = currentRepository.get<CanonicalExpenseRecord[]>(STORAGE_KEYS.EXPENSES);
  return expenses || INITIAL_CANONICAL_EXPENSES;
}

export function getExpensesByRuralMart(ruralMartId: string): CanonicalExpenseRecord[] {
  const expenses = getExpenses();
  return expenses.filter((e) => e.ruralMartId === ruralMartId);
}

export function saveExpense(data: CanonicalExpenseRecord): void {
  const expenses = getExpenses();
  expenses.unshift(data);
  currentRepository.set(STORAGE_KEYS.EXPENSES, expenses);
}

// --- 9. OUTREACH SERVICES ---
export function getOutreachPrograms(): CanonicalOutreachRecord[] {
  const outreach = currentRepository.get<CanonicalOutreachRecord[]>(STORAGE_KEYS.OUTREACH);
  return outreach || INITIAL_CANONICAL_OUTREACH;
}

export function getOutreachByRuralMart(ruralMartId: string): CanonicalOutreachRecord[] {
  const outreach = getOutreachPrograms();
  return outreach.filter((o) => o.ruralMartId === ruralMartId);
}

export function saveOutreachProgram(data: CanonicalOutreachRecord): void {
  const outreach = getOutreachPrograms();
  const index = outreach.findIndex((o) => o.id === data.id);
  if (index >= 0) {
    outreach[index] = data;
  } else {
    outreach.unshift(data);
  }
  currentRepository.set(STORAGE_KEYS.OUTREACH, outreach);
}

export function updateOutreachProgram(id: string, data: Partial<CanonicalOutreachRecord>): CanonicalOutreachRecord | null {
  const outreach = getOutreachPrograms();
  const index = outreach.findIndex((o) => o.id === id);
  if (index === -1) return null;

  const updated = { ...outreach[index], ...data };
  outreach[index] = updated;
  currentRepository.set(STORAGE_KEYS.OUTREACH, outreach);
  return updated;
}

export function deleteOutreachProgram(id: string): boolean {
  const outreach = getOutreachPrograms();
  const filtered = outreach.filter((o) => o.id !== id);
  currentRepository.set(STORAGE_KEYS.OUTREACH, filtered);
  return true;
}

export function getFarmerOutreachMarts(): FarmerOutreachMartRecord[] {
  const marts = getRuralMarts();
  const allOutreach = getOutreachPrograms();
  const allFarmers = getFarmers();

  return marts.map((m) => {
    const martOutreach = allOutreach.filter((o) => o.ruralMartId === m.ruralMartId);
    const martFarmers = allFarmers.filter((f) => f.ruralMartId === m.ruralMartId);

    const displayName = m.ruralMartName
      .replace(' Rural Mart', '')
      .replace(' Agro Mart', '')
      .replace(' Farmers Hub', '');

    const totalReg = martFarmers.length;
    const totalProg = martOutreach.length;
    const totalReached = martOutreach.reduce(
      (sum, item) => sum + ((item as any).farmersAttended || item.farmersReached || 0),
      0
    );

    const villagesSet = new Set(martFarmers.map((f) => f.village).filter(Boolean));
    const animalPop = martFarmers.reduce((sum, f) => sum + (f.animalHeadCount || 0), 0);

    return {
      id: m.ruralMartId.toLowerCase(),
      name: displayName,
      district: m.district,
      status: (m.status as any) || 'Active',
      totalRegisteredFarmers: totalReg,
      newFarmers: martFarmers.filter((f) => f.status === 'New').length,
      repeatFarmers: martFarmers.filter((f) => f.status === 'Repeat' || (f.status as string) === 'Active').length,
      farmersReached: totalReached,
      outreachProgramsConducted: totalProg,
      villagesCovered: villagesSet.size,
      animalPopulationCovered: animalPop,
      retentionRate: totalReg > 0 ? Number(((martFarmers.filter((f) => f.status === 'Repeat').length / totalReg) * 100).toFixed(1)) : 0,
      sparklineData: [0, 0, 0, 0, 0, totalReg],
    };
  });
}

// --- 10. FINANCIAL RECORDS SERVICES ---
export interface FinancialEntryRecord {
  id: string;
  financialRecordId?: string;
  ruralMartId: string;
  category: 'Sales Revenue' | 'Procurement' | 'Operating Expense';
  amount: number;
  date: string;
  description?: string;
  createdAt?: string;
  // Point-in-time Gross Profit / Net Profit snapshot, calculated and stored when this
  // entry is saved (or recalculated when edited). Optional so older records saved before
  // this field existed remain valid — the UI falls back to "—" for those.
  grossProfit?: number;
  netProfit?: number;
}

export type FinancialLedgerLog = FinancialEntryRecord;

export function getFinancialRecords(): CanonicalFinancialRecord[] {
  const financials = currentRepository.get<CanonicalFinancialRecord[]>(STORAGE_KEYS.FINANCIAL_RECORDS);
  return financials || INITIAL_CANONICAL_FINANCIALS;
}

export function getFinancialRecordsByRuralMart(ruralMartId: string): CanonicalFinancialRecord[] {
  const financials = getFinancialRecords();
  return financials.filter((f) => f.ruralMartId === ruralMartId);
}

export function saveFinancialRecord(data: CanonicalFinancialRecord): void {
  const financials = getFinancialRecords();
  const index = financials.findIndex((f) => f.id === data.id || f.ruralMartId === data.ruralMartId);
  if (index >= 0) {
    financials[index] = data;
  } else {
    financials.unshift(data);
  }
  currentRepository.set(STORAGE_KEYS.FINANCIAL_RECORDS, financials);
}

export function getFinancialEntries(ruralMartId: string): FinancialEntryRecord[] {
  const allEntries = getFinancialLedgerLogsAll();
  return allEntries[ruralMartId] || [];
}

export function getFinancialLedgerLogs(ruralMartId: string = 'RM-001'): FinancialEntryRecord[] {
  return getFinancialEntries(ruralMartId);
}

export function saveFinancialEntryRecord(entry: FinancialEntryRecord): void {
  const allEntries = getFinancialLedgerLogsAll();
  const martEntries = allEntries[entry.ruralMartId] ? [...allEntries[entry.ruralMartId]] : [];
  const idx = martEntries.findIndex((e) => e.id === entry.id || (e.financialRecordId && e.financialRecordId === entry.financialRecordId));
  if (idx >= 0) {
    martEntries[idx] = entry;
  } else {
    martEntries.unshift(entry);
  }
  setFinancialLedgerLogsAll({ ...allEntries, [entry.ruralMartId]: martEntries });
  updateCanonicalFinancialSummary(entry.ruralMartId);
}

export function saveFinancialLedgerLogs(ruralMartId: string, logs: FinancialEntryRecord[]): void {
  const allEntries = getFinancialLedgerLogsAll();
  setFinancialLedgerLogsAll({ ...allEntries, [ruralMartId]: logs });
  updateCanonicalFinancialSummary(ruralMartId);
}

export function deleteFinancialEntryRecord(ruralMartId: string, id: string): void {
  const allEntries = getFinancialLedgerLogsAll();
  if (allEntries[ruralMartId]) {
    setFinancialLedgerLogsAll({
      ...allEntries,
      [ruralMartId]: allEntries[ruralMartId].filter((e) => e.id !== id && e.financialRecordId !== id),
    });
    updateCanonicalFinancialSummary(ruralMartId);
  }
}

export function getRuralMartFinancialSummary(ruralMartId: string) {
  const sales = getSalesByRuralMart(ruralMartId);
  const purchases = getPurchasesByRuralMart(ruralMartId);
  const expenses = getExpensesByRuralMart(ruralMartId);
  const finEntries = getFinancialEntries(ruralMartId);

  const salesTotal = sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const finSalesTotal = finEntries
    .filter((e) => e.category === 'Sales Revenue')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalRevenue = salesTotal + finSalesTotal;

  const purchasesTotal = purchases.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const finProcTotal = finEntries
    .filter((e) => e.category === 'Procurement')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalProcurement = purchasesTotal + finProcTotal;

  const expensesTotal = expenses.reduce((sum, ex) => sum + (Number(ex.amount) || 0), 0);
  const finOpexTotal = finEntries
    .filter((e) => e.category === 'Operating Expense')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalExpenses = expensesTotal + finOpexTotal;

  const grossProfit = totalRevenue - totalProcurement;
  const netProfit = grossProfit - totalExpenses;
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const cogsRatio = totalRevenue > 0 ? (totalProcurement / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalProcurement,
    totalExpenses,
    grossProfit,
    netProfit,
    netMargin,
    cogsRatio,
  };
}

export function updateCanonicalFinancialSummary(ruralMartId: string): void {
  const summary = getRuralMartFinancialSummary(ruralMartId);
  const currentFinancials = getFinancialRecords();
  const existingIndex = currentFinancials.findIndex((f) => f.ruralMartId === ruralMartId);

  const updatedRecord: CanonicalFinancialRecord = {
    id: `fin-${ruralMartId}`,
    ruralMartId,
    name: ruralMartId,
    district: '',
    status: 'Active',
    salesRaw: summary.totalRevenue,
    salesDisplay: summary.totalRevenue > 0 ? `₹${(summary.totalRevenue / 100000).toFixed(1)} L` : '₹0',
    procurementRaw: summary.totalProcurement,
    procurementDisplay: summary.totalProcurement > 0 ? `₹${(summary.totalProcurement / 100000).toFixed(1)} L` : '₹0',
    grossProfitRaw: summary.grossProfit,
    grossProfitDisplay: summary.grossProfit > 0 ? `₹${(summary.grossProfit / 100000).toFixed(1)} L` : '₹0',
    netProfitRaw: summary.netProfit,
    netProfitDisplay: summary.netProfit > 0 ? `₹${(summary.netProfit / 100000).toFixed(1)} L` : '₹0',
    operatingExpensesRaw: summary.totalExpenses,
    opexDisplay: summary.totalExpenses > 0 ? `₹${(summary.totalExpenses / 100000).toFixed(1)} L` : '₹0',
    profitMargin: Math.round(summary.netMargin * 100) / 100,
    avgBillValue: 0,
    totalBills: getSalesByRuralMart(ruralMartId).length,
    salesGrowthPercent: 0,
  };

  if (existingIndex >= 0) {
    currentFinancials[existingIndex] = updatedRecord;
  } else {
    currentFinancials.unshift(updatedRecord);
  }
  currentRepository.set(STORAGE_KEYS.FINANCIAL_RECORDS, currentFinancials);
}

export interface BillLineItem {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

export interface CustomerBillInput {
  farmerId?: string;
  farmerName: string;
  paymentMethod: 'Cash' | 'UPI / Online' | 'Credit / Due';
  lineItems: BillLineItem[];
}

export function recordCustomerBill(
  ruralMartId: string = 'RM-001',
  input: CustomerBillInput
): { success: boolean; billNumber?: string; errorMessage?: string } {
  if (!input.lineItems || input.lineItems.length === 0) {
    return { success: false, errorMessage: 'Please add at least one product line item to the bill.' };
  }

  const products = getProductsByRuralMart(ruralMartId);

  // Validate stock for each line item
  for (const item of input.lineItems) {
    const prd = products.find((p) => p.id === item.productId || p.code === item.productId);
    if (!prd) {
      return { success: false, errorMessage: `Product "${item.productName}" not found in inventory catalog.` };
    }
    if (prd.stockQty < item.quantity) {
      return {
        success: false,
        errorMessage: `Insufficient stock for "${item.productName}". Available: ${prd.stockQty} ${item.unit}, Requested: ${item.quantity} ${item.unit}.`,
      };
    }
  }

  // Deduct stock for each product
  for (const item of input.lineItems) {
    const prdIndex = products.findIndex((p) => p.id === item.productId || p.code === item.productId);
    if (prdIndex >= 0) {
      const prd = products[prdIndex];
      const newStock = Math.max(0, prd.stockQty - item.quantity);
      const updatedStatus =
        newStock === 0 ? 'Out of Stock' : newStock <= (prd.reorderLevel || 35) ? 'Low Stock' : 'Healthy';

      updateProduct(prd.id, {
        stockQty: newStock,
        status: updatedStatus,
        salesQty: (prd.salesQty || 0) + item.quantity,
        inventoryValue: newStock * prd.sellingPrice,
      });

      const invList = getInventoryByRuralMart(ruralMartId);
      const invItem = invList.find((i) => i.productId === prd.id);
      if (invItem) {
        updateInventory(invItem.id, {
          stockQty: newStock,
          salesQty: (invItem.salesQty || 0) + item.quantity,
          inventoryValue: newStock * prd.sellingPrice,
          status: updatedStatus,
        });
      }
    }
  }

  const totalAmount = input.lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalQuantity = input.lineItems.reduce((sum, item) => sum + item.quantity, 0);

  const existingSales = getSalesByRuralMart(ruralMartId);
  const billNum = `BILL-${String(existingSales.length + 1001).padStart(4, '0')}`;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toISOString().split('T')[0];

  const newSale: CanonicalSaleRecord = {
    id: `sale-${Date.now()}`,
    ruralMartId,
    billNumber: billNum,
    time: timeStr,
    date: dateStr,
    customerName: input.farmerName || 'Counter Customer',
    farmerId: input.farmerId,
    itemsCount: input.lineItems.length,
    paymentMethod: input.paymentMethod || 'Cash',
    amount: totalAmount,
    status: 'Completed',
  };

  saveSale(newSale);

  const categoriesInBill = Array.from(new Set(input.lineItems.map((i) => i.category))).join(', ');
  const opEntry = {
    id: `op-entry-${Date.now()}`,
    timestamp: timeStr,
    date: dateStr,
    category: categoriesInBill || 'General Store',
    salesValue: totalAmount,
    procurementValue: 0,
    openingStock: 0,
    closingStock: 0,
    salesQty: totalQuantity,
    procurementQty: 0,
    customerBills: 1, // 1 bill for this transaction
    farmerName: input.farmerName,
    status: 'Saved',
    billNumber: billNum,
    lineItems: input.lineItems,
  };

  const allEntries = currentRepository.get<Record<string, any[]>>(STORAGE_KEYS.OPERATIONAL_ENTRIES) || {};
  const currentList = allEntries[ruralMartId] || [];
  currentList.unshift(opEntry);
  allEntries[ruralMartId] = currentList;
  currentRepository.set(STORAGE_KEYS.OPERATIONAL_ENTRIES, allEntries);

  if (input.farmerId) {
    const farmer = getFarmerById(input.farmerId);
    if (farmer) {
      updateFarmer(farmer.id, {
        totalPurchasesVal: (farmer.totalPurchasesVal || farmer.totalSpent || 0) + totalAmount,
        totalPurchases: (farmer.totalPurchases || 0) + 1,
        totalSpent: (farmer.totalSpent || 0) + totalAmount,
        lastVisit: 'Today',
        status: 'Repeat',
      });
    }
  }

  return { success: true, billNumber: billNum };
}

export function getDailyBusinessCalculatedMetrics(ruralMartId: string = 'RM-001') {
  const products = getProductsByRuralMart(ruralMartId);
  const sales = getSalesByRuralMart(ruralMartId);

  const procurementQty = products.reduce(
    (sum, p) => sum + (p.procurementQty ?? p.procurementQuantity ?? 0),
    0
  );
  const procurementValue = products.reduce(
    (sum, p) =>
      sum +
      (p.procurementValue ??
        ((p.procurementQty ?? 0) * (p.costPrice ?? p.procurementPricePerUnit ?? 0))),
    0
  );

  // Opening Stock represents starting stock balance for the day
  const openingStock = products.reduce(
    (sum, p) => {
      const open =
        p.openingStockQty ??
        p.openingStockQuantity ??
        ((p.stockQty ?? 0) - (p.procurementQty ?? 0) + (p.salesQty ?? 0));
      return sum + open;
    },
    0
  );

  const salesQty = products.reduce((sum, p) => sum + (p.salesQty ?? p.salesQuantity ?? 0), 0);

  // Daily Closing Stock = Daily Opening Stock + Daily Procurement - Daily Sales
  const closingStock = products.reduce(
    (sum, p) => {
      const open =
        p.openingStockQty ??
        p.openingStockQuantity ??
        ((p.stockQty ?? 0) - (p.procurementQty ?? 0) + (p.salesQty ?? 0));
      const proc = p.procurementQty ?? p.procurementQuantity ?? 0;
      const sale = p.salesQty ?? p.salesQuantity ?? 0;
      const calcClosing = open + proc - sale;
      return sum + (p.stockQty ?? calcClosing);
    },
    0
  );

  const completedSales = sales.filter((s) => s.status === 'Completed');
  const totalSales = completedSales.reduce((sum, s) => sum + s.amount, 0);
  const customerBills = completedSales.length;

  const avgBillValue = customerBills > 0 ? Math.round(totalSales / customerBills) : 0;

  return {
    procurementQty,
    procurementValue,
    openingStock,
    closingStock,
    salesQty,
    totalSales,
    customerBills,
    avgBillValue,
  };
}

export function getOperationalEntries(ruralMartId: string = 'RM-001'): any[] {
  const allEntries = currentRepository.get<Record<string, any[]>>(STORAGE_KEYS.OPERATIONAL_ENTRIES);
  if (allEntries && allEntries[ruralMartId]) {
    return allEntries[ruralMartId];
  }
  return [];
}

export function saveOperationalEntry(ruralMartId: string, entry: any): void {
  const allEntries = currentRepository.get<Record<string, any[]>>(STORAGE_KEYS.OPERATIONAL_ENTRIES) || {};
  const currentList = allEntries[ruralMartId] || [];
  currentList.unshift(entry);
  allEntries[ruralMartId] = currentList;
  currentRepository.set(STORAGE_KEYS.OPERATIONAL_ENTRIES, allEntries);

  if (entry.salesValue > 0) {
    saveSale({
      id: `sale-${Date.now()}`,
      ruralMartId,
      billNumber: entry.billNumber || `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
      time: entry.timestamp || '12:00 PM',
      date: entry.date || new Date().toISOString().split('T')[0],
      customerName: entry.farmerName || 'Daily Customer',
      itemsCount: entry.salesQty || 1,
      paymentMethod: 'Cash',
      amount: entry.salesValue,
      status: 'Completed',
    });
  }
}

export function updateOperationalEntry(ruralMartId: string, entryId: string, updatedFields: Partial<any>): void {
  const allEntries = currentRepository.get<Record<string, any[]>>(STORAGE_KEYS.OPERATIONAL_ENTRIES) || {};
  const currentList = allEntries[ruralMartId] || [];
  const index = currentList.findIndex((e) => e.id === entryId);
  if (index >= 0) {
    const existing = currentList[index];
    const updated = { ...existing, ...updatedFields, status: 'Edited' };
    currentList[index] = updated;
    allEntries[ruralMartId] = currentList;
    currentRepository.set(STORAGE_KEYS.OPERATIONAL_ENTRIES, allEntries);

    // Also sync corresponding sale record if billNumber matches
    if (existing.billNumber) {
      const sales = getSalesByRuralMart(ruralMartId);
      const saleIdx = sales.findIndex((s) => s.billNumber === existing.billNumber);
      if (saleIdx >= 0) {
        if (updatedFields.farmerName) sales[saleIdx].customerName = updatedFields.farmerName;
        if (updatedFields.salesValue) sales[saleIdx].amount = updatedFields.salesValue;
        currentRepository.set(STORAGE_KEYS.SALES, sales);
      }
    }
  }
}

export function deleteOperationalEntry(ruralMartId: string, entryId: string): void {
  const allEntries = currentRepository.get<Record<string, any[]>>(STORAGE_KEYS.OPERATIONAL_ENTRIES) || {};
  const currentList = allEntries[ruralMartId] || [];
  const targetEntry = currentList.find((e) => e.id === entryId);

  if (!targetEntry) return;

  // 1. If line items exist (Sales Entry), reverse stock deduction
  if (targetEntry.lineItems && Array.isArray(targetEntry.lineItems)) {
    const products = getProductsByRuralMart(ruralMartId);
    for (const item of targetEntry.lineItems) {
      const prd = products.find((p) => p.id === item.productId || p.code === item.productId);
      if (prd) {
        const openingStock = prd.openingStockQty ?? (prd.stockQty - (prd.procurementQty || 0) + (prd.salesQty || 0));
        const restoredSalesQty = Math.max(0, (prd.salesQty || 0) - item.quantity);
        // Closing Stock = Opening Stock + Procurement - Restored Sales
        const restoredStock = openingStock + (prd.procurementQty || 0) - restoredSalesQty;
        const updatedStatus =
          restoredStock === 0 ? 'Out of Stock' : restoredStock <= (prd.reorderLevel || 35) ? 'Low Stock' : 'Healthy';

        updateProduct(prd.id, {
          openingStockQty: openingStock, // Opening stock NEVER modified
          stockQty: restoredStock,
          salesQty: restoredSalesQty,
          status: updatedStatus,
          inventoryValue: restoredStock * prd.sellingPrice,
        });

        const invList = getInventoryByRuralMart(ruralMartId);
        const invItem = invList.find((i) => i.productId === prd.id);
        if (invItem) {
          updateInventory(invItem.id, {
            stockQty: restoredStock,
            salesQty: restoredSalesQty,
            inventoryValue: restoredStock * prd.sellingPrice,
            status: updatedStatus,
          });
        }
      }
    }
  }

  // 2. If procurement entry, remove procurement quantity while preserving Opening Stock
  if (targetEntry.procurementQty > 0 || targetEntry.procurementValue > 0) {
    const products = getProductsByRuralMart(ruralMartId);
    const prd = products.find(
      (p) =>
        (targetEntry.productName && p.name.toLowerCase() === targetEntry.productName.toLowerCase()) ||
        p.category === targetEntry.category
    );
    if (prd) {
      const openingStock = prd.openingStockQty ?? (prd.stockQty - (prd.procurementQty || 0) + (prd.salesQty || 0));
      const newProcQty = Math.max(0, (prd.procurementQty || 0) - (targetEntry.procurementQty || 0));
      const currentSalesQty = prd.salesQty || 0;
      // Closing Stock = Opening Stock + Procurement - Sales
      const newClosingStock = openingStock + newProcQty - currentSalesQty;
      const updatedStatus =
        newClosingStock === 0 ? 'Out of Stock' : newClosingStock <= (prd.reorderLevel || 35) ? 'Low Stock' : 'Healthy';

      updateProduct(prd.id, {
        openingStockQty: openingStock, // Opening Stock NEVER modified
        procurementQty: newProcQty,
        stockQty: newClosingStock,
        status: updatedStatus,
        inventoryValue: newClosingStock * prd.sellingPrice,
      });

      const invList = getInventoryByRuralMart(ruralMartId);
      const invItem = invList.find((i) => i.productId === prd.id);
      if (invItem) {
        updateInventory(invItem.id, {
          stockQty: newClosingStock,
          procurementQty: newProcQty,
          inventoryValue: newClosingStock * prd.sellingPrice,
          status: updatedStatus,
        });
      }
    }
  }

  // 3. Remove from sales and purchase records if applicable
  if (targetEntry.billNumber) {
    const sales = getSales();
    const updatedSales = sales.filter((s) => s.billNumber !== targetEntry.billNumber && s.id !== entryId);
    currentRepository.set(STORAGE_KEYS.SALES, updatedSales);

    const purchases = getPurchases();
    const updatedPurchases = purchases.filter((p) => p.purchaseNumber !== targetEntry.billNumber && p.id !== entryId);
    currentRepository.set(STORAGE_KEYS.PURCHASES, updatedPurchases);
  }

  // 4. Remove entry from operational list
  const updatedList = currentList.filter((e) => e.id !== entryId);
  allEntries[ruralMartId] = updatedList;
  currentRepository.set(STORAGE_KEYS.OPERATIONAL_ENTRIES, allEntries);
}

export function clearAllMartData(ruralMartId: string = 'RM-001'): void {
  currentRepository.set(STORAGE_KEYS.PRODUCTS, []);
  currentRepository.set(STORAGE_KEYS.SALES, []);
  currentRepository.set(STORAGE_KEYS.INVENTORY, []);
  currentRepository.set(STORAGE_KEYS.EXPENSES, []);
  currentRepository.set(STORAGE_KEYS.OUTREACH, []);
  currentRepository.set(STORAGE_KEYS.FARMERS, []);
  currentRepository.set(STORAGE_KEYS.FINANCIAL_RECORDS, []);
  currentRepository.set(STORAGE_KEYS.PURCHASES, []);

  const allEntries = currentRepository.get<Record<string, any[]>>(STORAGE_KEYS.OPERATIONAL_ENTRIES) || {};
  allEntries[ruralMartId] = [];
  currentRepository.set(STORAGE_KEYS.OPERATIONAL_ENTRIES, allEntries);

  const allLogs = getFinancialLedgerLogsAll();
  setFinancialLedgerLogsAll({ ...allLogs, [ruralMartId]: [] });
}

export function getFinancialMarts(): MartFinancialRecord[] {
  const canonicalRecords = getFinancialRecords();
  const marts = getRuralMarts();

  return canonicalRecords.map((fin) => {
    const mart = marts.find((m) => m.ruralMartId === fin.ruralMartId);
    let displayName = fin.name.replace(' Rural Mart', '').replace(' Agro Mart', '').replace(' Farmers Hub', '');
    if (!displayName) displayName = mart ? mart.ruralMartName : fin.ruralMartId;

    const formatLakhs = (val: number) => {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val > 0) return `₹${(val / 100000).toFixed(1)} L`;
      return '₹0.0 L';
    };

    return {
      id: fin.ruralMartId.toLowerCase(),
      name: displayName,
      district: fin.district || (mart ? mart.district : 'N/A'),
      status: (fin.status as any) || 'Active',
      salesRaw: fin.salesRaw,
      salesDisplay: formatLakhs(fin.salesRaw),
      procurementRaw: fin.procurementRaw,
      procurementDisplay: formatLakhs(fin.procurementRaw),
      grossProfitRaw: fin.grossProfitRaw,
      grossProfitDisplay: formatLakhs(fin.grossProfitRaw),
      netProfitRaw: fin.netProfitRaw,
      netProfitDisplay: formatLakhs(fin.netProfitRaw),
      operatingExpensesRaw: fin.operatingExpensesRaw,
      opexDisplay: formatLakhs(fin.operatingExpensesRaw),
      profitMargin: fin.profitMargin,
      avgBillValue: fin.avgBillValue,
      totalBills: fin.totalBills,
      salesGrowthPercent: fin.salesGrowthPercent,
      trend: 'flat' as const,
      sparklineData: [0, 0, 0, 0, 0, 0, 0],
      monthlyBreakdown: [],
    };
  });
}

// --- 11. REGISTRATION & APPROVAL SERVICES ---
export function getApplications(): RegistrationApplication[] {
  const apps = currentRepository.get<RegistrationApplication[]>(STORAGE_KEYS.APPLICATIONS);
  return apps || INITIAL_CANONICAL_APPLICATIONS;
}

export function saveApplications(apps: RegistrationApplication[]): void {
  currentRepository.set(STORAGE_KEYS.APPLICATIONS, apps);
}

export function submitApplication(
  data: Omit<RegistrationApplication, 'applicationId' | 'submittedAt' | 'status'>
): RegistrationApplication {
  const apps = getApplications();
  const nextIdNum = apps.length + 1;
  const appId = `RM-APP-${String(nextIdNum).padStart(3, '0')}`;

  const now = new Date();
  const formattedDate = `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;

  const newApp: RegistrationApplication = {
    ...data,
    applicationId: appId,
    submittedAt: formattedDate,
    status: 'pending',
  };

  apps.unshift(newApp);
  saveApplications(apps);
  return newApp;
}

export function approveApplication(appId: string): {
  application: RegistrationApplication;
  ruralMart: CanonicalRuralMart;
  owner: CanonicalOwner;
  temporaryPassword: string;
} {
  const apps = getApplications();
  const appIndex = apps.findIndex((a) => a.applicationId === appId);
  if (appIndex === -1) {
    throw new Error('Application not found');
  }

  const app = apps[appIndex];
  const now = new Date();
  const formattedDate = `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;

  app.status = 'approved';
  app.reviewedAt = formattedDate;
  app.reviewedBy = 'EDF Executive Admin';
  apps[appIndex] = app;
  saveApplications(apps);

  const marts = getRuralMarts();
  let existingMart = marts.find(
    (m) =>
      m.ruralMartName.toLowerCase() === app.ruralMartName.toLowerCase() ||
      m.ownerEmail.toLowerCase() === app.email.trim().toLowerCase()
  );

  let ruralMartId = existingMart ? existingMart.ruralMartId : `RM-${String(marts.length + 1).padStart(3, '0')}`;
  let ownerId = existingMart ? existingMart.ownerId : `OWNER-${String(marts.length + 1).padStart(3, '0')}`;

  const canonicalMart: CanonicalRuralMart = {
    ruralMartId,
    ruralMartName: app.ruralMartName,
    ownerId,
    ownerName: app.ownerName,
    ownerEmail: app.email,
    ownerPhone: app.phone,
    district: app.district,
    block: app.block,
    village: app.village,
    address: app.address,
    openingDate: formattedDate,
    status: 'Active',
    registrationStatus: 'approved',
    lastUpdated: formattedDate,
    createdAt: formattedDate,
    updatedAt: formattedDate,
  };

  saveRuralMart(canonicalMart);

  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const tempPassword = `RM@2026${randomSuffix}`;

  const newOwner: CanonicalOwner = {
    ownerId,
    ruralMartId,
    email: app.email.trim().toLowerCase(),
    ownerName: app.ownerName,
    phone: app.phone,
    role: 'owner',
    status: 'active',
    createdAt: formattedDate,
    updatedAt: formattedDate,
  };

  saveOwner(newOwner);

  return {
    application: app,
    ruralMart: canonicalMart,
    owner: newOwner,
    temporaryPassword: tempPassword,
  };
}

export function rejectApplication(appId: string, rejectionReason: string): RegistrationApplication {
  const apps = getApplications();
  const appIndex = apps.findIndex((a) => a.applicationId === appId);
  if (appIndex === -1) {
    throw new Error('Application not found');
  }

  const app = apps[appIndex];
  const now = new Date();
  const formattedDate = `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;

  app.status = 'rejected';
  app.rejectionReason = rejectionReason || 'Application details incomplete or unverified.';
  app.reviewedAt = formattedDate;
  app.reviewedBy = 'EDF Executive Admin';

  apps[appIndex] = app;
  saveApplications(apps);

  return app;
}

// --- 12. AUTHENTICATION SERVICES ---
export function authenticateUser(emailInput: string, passwordInput: string): {
  success: boolean;
  session?: AuthSession;
  errorMessage?: string;
} {
  const cleanEmail = emailInput.trim().toLowerCase();
  const cleanPassword = passwordInput;

  if (!cleanEmail || !cleanPassword) {
    return { success: false, errorMessage: 'Invalid email or password.' };
  }

  // Admin Login
  if (cleanEmail === 'admin@ruralmart.in' && cleanPassword === 'admin123') {
    const session: AuthSession = {
      isAuthenticated: true,
      role: 'admin',
      email: 'admin@ruralmart.in',
      userName: 'EDF Executive Admin',
    };
    return { success: true, session };
  }

  // Owner Login
  const owners = getOwners();
  const matchedOwner = owners.find(
    (o) => o.email.toLowerCase() === cleanEmail
  );

  if (matchedOwner) {
    const marts = getRuralMarts();
    const mart = marts.find((m) => m.ruralMartId === matchedOwner.ruralMartId);

    const session: AuthSession = {
      isAuthenticated: true,
      role: 'owner',
      email: matchedOwner.email,
      ruralMartId: matchedOwner.ruralMartId,
      ruralMartName: mart ? mart.ruralMartName : 'Rural Mart Outpost',
      ownerId: matchedOwner.ownerId,
      userName: matchedOwner.ownerName || matchedOwner.email.split('@')[0],
    };
    return { success: true, session };
  }

  if (cleanEmail === 'karthik.owner@ruralmart.in' || cleanPassword === 'owner123') {
    const session: AuthSession = {
      isAuthenticated: true,
      role: 'owner',
      email: 'karthik.owner@ruralmart.in',
      ruralMartId: 'RM-001',
      ruralMartName: 'Rural Mart Outpost',
      ownerId: 'OWNER-001',
      userName: 'Mart Owner',
    };
    return { success: true, session };
  }

  return { success: false, errorMessage: 'Invalid email or password.' };
}

export function getReportsRuralMarts(): RuralMartData[] {
  const canonicalMarts = getRuralMarts();
  const financials = getFinancialRecords();
  const allFarmers = getFarmers();
  const allOutreach = getOutreachPrograms();
  const allOwners = getOwners();

  return canonicalMarts.map((cm) => {
    const fin = financials.find((f) => f.ruralMartId === cm.ruralMartId);
    const martFarmers = allFarmers.filter((f) => f.ruralMartId === cm.ruralMartId);
    const martOutreach = allOutreach.filter((o) => o.ruralMartId === cm.ruralMartId);
    const owner = allOwners.find((o) => o.ruralMartId === cm.ruralMartId);

    const salesRaw = fin ? fin.salesRaw : 0;
    const grossProfitRaw = fin ? fin.grossProfitRaw : 0;
    const grossProfitLakhs = Number((grossProfitRaw / 100000).toFixed(1));
    const salesCr = Number((salesRaw / 10000000).toFixed(2));

    const registeredFarmers = martFarmers.length;

    let farmersReached = 0;
    if (martOutreach.length > 0) {
      farmersReached = martOutreach.reduce(
        (sum, item) => sum + ((item as any).farmersAttended || item.farmersReached || 0),
        0
      );
    }

    const formattedStatus = (
      cm.status
        ? cm.status.charAt(0).toUpperCase() + cm.status.slice(1).toLowerCase()
        : 'Active'
    ) as 'Active' | 'Delayed' | 'Inactive';

    return {
      id: cm.ruralMartId,
      name: cm.ruralMartName,
      district: cm.district,
      status: formattedStatus,
      salesCr,
      salesRaw,
      grossProfitLakhs,
      grossProfitRaw,
      registeredFarmers,
      farmersReached,
      farmerFootfall: 0,
      score: 0,
      targetScore: 100,
      dataCompleteness: cm.ownerName && cm.district && cm.address ? 100 : 50,
      lastUpdated: cm.lastUpdated || 'N/A',
      manager: cm.ownerName || owner?.ownerName || 'Mart Owner',
      contact: cm.ownerPhone || cm.ownerEmail || owner?.phone || owner?.email || 'N/A',
      scoreBreakdown: {
        salesGrowth: 0,
        profitability: 0,
        farmerEngagement: 0,
        outreachImpact: 0,
        inventoryHealth: 0,
        compliance: 0,
      },
    };
  });
}

// --- INDIVIDUAL RURAL MART REPORT (fellowship-report style Preview/Download) ---
// Centralizes all real data-fetching + calculation reuse for the Admin "Individual Rural
// Mart Report" so the UI (ReportPreviewModal) never duplicates business logic or invents data.
export interface MartReportProductBreakdownItem {
  productName: string;
  unit: string;
  quantitySold: number;
  salesValue: number;
  sellingPrice?: number;
  costPrice?: number;
}

export interface IndividualMartReportData {
  mart: CanonicalRuralMart | null;
  ownerName: string;
  ownerContact: string;
  outreachRecords: CanonicalOutreachRecord[];
  reviewTrainingRecords: CanonicalOutreachRecord[];
  sales: CanonicalSaleRecord[];
  purchases: CanonicalPurchaseRecord[];
  expenses: CanonicalExpenseRecord[];
  farmersCount: number;
  totalSalesValue: number;
  totalProcurementValue: number;
  totalOperatingExpenses: number;
  grossProfit: number;
  netProfit: number;
  totalBills: number;
  avgBillValue: number;
  productBreakdown: MartReportProductBreakdownItem[];
  photos: string[];
}

function isDateWithinPeriod(dateStr: string | undefined, start: Date | null, end: Date | null): boolean {
  if (!start && !end) return true;
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  if (start && d < start) return false;
  if (end && d > end) return false;
  return true;
}

export function getIndividualMartReportData(
  ruralMartId: string,
  periodStart: Date | null = null,
  periodEnd: Date | null = null
): IndividualMartReportData {
  const mart = getRuralMartById(ruralMartId);
  const owner = getOwners().find((o) => o.ruralMartId === ruralMartId) || null;

  const outreachRecords = getOutreachByRuralMart(ruralMartId).filter((o) =>
    isDateWithinPeriod(o.date || o.programDate, periodStart, periodEnd)
  );
  const reviewTrainingRecords = outreachRecords.filter((o) => {
    const label = `${o.activityType || ''} ${o.programName || ''} ${o.title || ''}`.toLowerCase();
    return label.includes('training') || label.includes('review') || label.includes('meeting');
  });

  const sales = getSalesByRuralMart(ruralMartId).filter((s) =>
    isDateWithinPeriod(s.date, periodStart, periodEnd)
  );
  const purchases = getPurchasesByRuralMart(ruralMartId).filter((p) =>
    isDateWithinPeriod(p.date, periodStart, periodEnd)
  );
  const expenses = getExpensesByRuralMart(ruralMartId).filter((e) =>
    isDateWithinPeriod(e.date, periodStart, periodEnd)
  );

  const products = getProductsByRuralMart(ruralMartId);
  const farmersCount = getFarmersByRuralMart(ruralMartId).length;

  const totalSalesValue = sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const totalProcurementValue = purchases.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalOperatingExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const grossProfit = totalSalesValue - totalProcurementValue;
  const netProfit = grossProfit - totalOperatingExpenses;

  const totalBills = sales.length;
  const avgBillValue = totalBills > 0 ? Math.round(totalSalesValue / totalBills) : 0;

  const productMap = new Map<string, MartReportProductBreakdownItem>();
  sales.forEach((s) => {
    if (Array.isArray(s.lineItems)) {
      s.lineItems.forEach((item) => {
        const key = item.productName;
        const prd = products.find((p) => p.name === item.productName);
        const existing = productMap.get(key);
        if (existing) {
          existing.quantitySold += item.quantity || 0;
          existing.salesValue += item.lineTotal || 0;
        } else {
          productMap.set(key, {
            productName: item.productName,
            unit: item.unit || prd?.unit || 'units',
            quantitySold: item.quantity || 0,
            salesValue: item.lineTotal || 0,
            sellingPrice: prd?.sellingPrice,
            costPrice: prd?.costPrice,
          });
        }
      });
    }
  });
  const productBreakdown = Array.from(productMap.values()).sort((a, b) => b.salesValue - a.salesValue);

  const photos: string[] = [];
  outreachRecords.forEach((o) => {
    if (Array.isArray(o.photos)) {
      o.photos.forEach((p) => {
        if (p && typeof p === 'string') photos.push(p);
      });
    }
  });

  return {
    mart,
    ownerName: mart?.ownerName || owner?.ownerName || '',
    ownerContact: mart?.ownerPhone || mart?.ownerEmail || owner?.phone || owner?.email || '',
    outreachRecords,
    reviewTrainingRecords,
    sales,
    purchases,
    expenses,
    farmersCount,
    totalSalesValue,
    totalProcurementValue,
    totalOperatingExpenses,
    grossProfit,
    netProfit,
    totalBills,
    avgBillValue,
    productBreakdown,
    photos,
  };
}

// --- 11. ALERTS & TRENDS SERVICES ---
export function getAlerts(): AlertItem[] {
  const alerts = currentRepository.get<AlertItem[]>(STORAGE_KEYS.ALERTS);
  return alerts || INITIAL_ALERTS;
}

export function saveAlerts(alerts: AlertItem[]): void {
  currentRepository.set(STORAGE_KEYS.ALERTS, alerts);
}

export function getNetworkTrendData(timeGrouping: TimeGrouping): ChartDataPoint[] {
  const financials = getFinancialRecords();
  if (financials.length === 0) return [];

  const totalSalesRaw = financials.reduce((sum, f) => sum + f.salesRaw, 0);
  const totalProfitRaw = financials.reduce((sum, f) => sum + f.grossProfitRaw, 0);

  if (totalSalesRaw === 0 && totalProfitRaw === 0) return [];

  return [
    {
      period: 'Current',
      sales: Number((totalSalesRaw / 100000).toFixed(1)),
      salesRaw: totalSalesRaw,
      grossProfit: Number((totalProfitRaw / 100000).toFixed(1)),
      grossProfitRaw: totalProfitRaw,
      prevSales: 0,
      prevGrossProfit: 0,
      salesChange: '0%',
      profitChange: '0%',
    },
  ];
}
