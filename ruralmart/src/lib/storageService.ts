// Storage Service Wrapper over Shared Data Layer

import {
  RegistrationApplication as BaseRegistrationApplication,
  CanonicalRuralMart,
  CanonicalOwner,
} from '../shared/types/storage';
import * as sharedServices from '../shared/dataServices';

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

export interface StoredRuralMart {
  ruralMartId: string;
  ruralMartName: string;
  ownerName: string;
  ownerEmail: string;
  district: string;
  block: string;
  village: string;
  status: 'active' | 'inactive';
  lastUpdated: string;
  createdAt: string;
}

export interface StoredOwnerAccount {
  ownerId: string;
  email: string;
  password?: string;
  role: 'owner';
  ruralMartId: string;
  ruralMartName: string;
  status: 'active';
  createdAt: string;
}

export interface AuthSession {
  isAuthenticated: boolean;
  role: 'owner' | 'admin' | null;
  email: string;
  ruralMartId?: string;
  ruralMartName?: string;
  ruralMart?: string;
  userName?: string;
  ownerId?: string;
}

// Re-export initialization
export function initLocalStorageSeed(): void {
  sharedServices.initSharedDataStore();
}

// Application Functions
export function getApplications(): RegistrationApplication[] {
  return sharedServices.getApplications();
}

export function saveApplications(apps: RegistrationApplication[]): void {
  sharedServices.saveApplications(apps);
}

export function submitApplication(
  data: Omit<RegistrationApplication, 'applicationId' | 'submittedAt' | 'status'>
): RegistrationApplication {
  return sharedServices.submitApplication(data);
}

export function approveApplication(appId: string): {
  application: RegistrationApplication;
  ruralMart: StoredRuralMart;
  owner: StoredOwnerAccount;
  temporaryPassword: string;
} {
  const result = sharedServices.approveApplication(appId);
  return {
    application: result.application,
    ruralMart: {
      ruralMartId: result.ruralMart.ruralMartId,
      ruralMartName: result.ruralMart.ruralMartName,
      ownerName: result.ruralMart.ownerName,
      ownerEmail: result.ruralMart.ownerEmail,
      district: result.ruralMart.district,
      block: result.ruralMart.block,
      village: result.ruralMart.village,
      status: result.ruralMart.status.toLowerCase() === 'active' ? 'active' : 'inactive',
      lastUpdated: result.ruralMart.lastUpdated,
      createdAt: result.ruralMart.createdAt,
    },
    owner: {
      ownerId: result.owner.ownerId,
      email: result.owner.email,
      role: 'owner',
      ruralMartId: result.owner.ruralMartId,
      ruralMartName: result.ruralMart.ruralMartName,
      status: 'active',
      createdAt: result.owner.createdAt,
    },
    temporaryPassword: result.temporaryPassword,
  };
}

export function rejectApplication(appId: string, rejectionReason: string): RegistrationApplication {
  return sharedServices.rejectApplication(appId, rejectionReason);
}

// Rural Mart Directory Functions
export function getRuralMarts(): StoredRuralMart[] {
  const canonical = sharedServices.getRuralMarts();
  return canonical.map((c) => ({
    ruralMartId: c.ruralMartId,
    ruralMartName: c.ruralMartName,
    ownerName: c.ownerName,
    ownerEmail: c.ownerEmail,
    district: c.district,
    block: c.block,
    village: c.village,
    status: c.status.toLowerCase() === 'active' ? 'active' : 'inactive',
    lastUpdated: c.lastUpdated,
    createdAt: c.createdAt,
  }));
}

export function saveRuralMarts(marts: StoredRuralMart[]): void {
  marts.forEach((m) => {
    sharedServices.saveRuralMart({
      ruralMartId: m.ruralMartId,
      ruralMartName: m.ruralMartName,
      ownerId: `OWNER-${m.ruralMartId}`,
      ownerName: m.ownerName,
      ownerEmail: m.ownerEmail,
      ownerPhone: '',
      district: m.district,
      block: m.block,
      village: m.village,
      address: '',
      openingDate: m.createdAt,
      status: m.status === 'active' ? 'Active' : 'Inactive',
      registrationStatus: 'approved',
      lastUpdated: m.lastUpdated,
      createdAt: m.createdAt,
      updatedAt: m.lastUpdated,
    });
  });
}

// Owner Accounts Functions
export function getOwnerAccounts(): StoredOwnerAccount[] {
  const owners = sharedServices.getOwners();
  const marts = sharedServices.getRuralMarts();

  return owners.map((o) => {
    const mart = marts.find((m) => m.ruralMartId === o.ruralMartId);
    return {
      ownerId: o.ownerId,
      email: o.email,
      password: 'owner123',
      role: 'owner',
      ruralMartId: o.ruralMartId,
      ruralMartName: mart ? mart.ruralMartName : 'Rural Mart Outpost',
      status: 'active',
      createdAt: o.createdAt,
    };
  });
}

export function saveOwnerAccounts(owners: StoredOwnerAccount[]): void {
  owners.forEach((o) => {
    sharedServices.saveOwner({
      ownerId: o.ownerId,
      ruralMartId: o.ruralMartId,
      email: o.email,
      ownerName: o.email.split('@')[0],
      phone: '',
      role: 'owner',
      status: 'active',
      createdAt: o.createdAt,
      updatedAt: o.createdAt,
    });
  });
}

// Authentication Logic
export function authenticateUser(emailInput: string, passwordInput: string) {
  return sharedServices.authenticateUser(emailInput, passwordInput);
}

// Session Persistence
export function getAuthSession(): AuthSession | null {
  return null;
}

export function setAuthSession(_session: AuthSession | null): void {
  // No-op for Supabase preparation
}
