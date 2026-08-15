import {
  CanonicalRuralMart,
  CanonicalOwner,
  CanonicalFarmer,
  CanonicalProduct,
  CanonicalSaleRecord,
  CanonicalExpenseRecord,
  CanonicalOutreachRecord,
  CanonicalFinancialRecord,
} from '../../types/storage';
import { RegistrationApplication } from '../../../lib/storageService';

/**
 * Supabase Database Contract
 * 
 * This interface defines the expected operations that the future Supabase
 * integration will need to implement to support the frontend functionality.
 * 
 * It acts as a bridge during the transition period and ensures that all
 * data fetching, creation, updating, and deletion are properly typed and
 * accounted for.
 */
export interface IDatabaseService {
  // Authentication & Session
  getCurrentUser(): Promise<{ id: string; role: 'admin' | 'owner' | null } | null>;
  
  // Rural Marts
  getRuralMarts(): Promise<CanonicalRuralMart[]>;
  getRuralMartById(id: string): Promise<CanonicalRuralMart | null>;
  saveRuralMart(mart: CanonicalRuralMart): Promise<void>;
  
  // Owners
  getOwners(): Promise<CanonicalOwner[]>;
  getOwnerById(id: string): Promise<CanonicalOwner | null>;
  saveOwner(owner: CanonicalOwner): Promise<void>;
  
  // Farmers
  getFarmersByRuralMart(martId: string): Promise<CanonicalFarmer[]>;
  saveFarmer(farmer: CanonicalFarmer): Promise<void>;
  
  // Products & Inventory
  getProductsByRuralMart(martId: string): Promise<CanonicalProduct[]>;
  saveProduct(product: CanonicalProduct): Promise<void>;
  updateProduct(id: string, updates: Partial<CanonicalProduct>): Promise<void>;
  deleteProduct(id: string): Promise<void>;
  procureProduct(productId: string, quantity: number, costPrice: number, supplier?: string, invoiceRef?: string): Promise<void>;
  
  // Sales
  getSalesByRuralMart(martId: string): Promise<CanonicalSaleRecord[]>;
  recordSale(sale: CanonicalSaleRecord): Promise<void>;
  
  // Expenses
  getExpensesByRuralMart(martId: string): Promise<CanonicalExpenseRecord[]>;
  recordExpense(expense: CanonicalExpenseRecord): Promise<void>;
  
  // Outreach
  getOutreachByRuralMart(martId: string): Promise<CanonicalOutreachRecord[]>;
  recordOutreach(outreach: CanonicalOutreachRecord): Promise<void>;
  
  // Financials
  getFinancialRecordsByRuralMart(martId: string): Promise<CanonicalFinancialRecord[]>;
  saveFinancialRecord(record: CanonicalFinancialRecord): Promise<void>;
  
  // Applications (Admin)
  getApplications(): Promise<RegistrationApplication[]>;
  saveApplications(apps: RegistrationApplication[]): Promise<void>;
  submitApplication(data: Omit<RegistrationApplication, 'applicationId' | 'submittedAt' | 'status'>): Promise<RegistrationApplication>;
}
