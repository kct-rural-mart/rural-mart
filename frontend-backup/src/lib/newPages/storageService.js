// Storage Service Wrapper over the mock shared data layer (shared/dataServices.js).
// This is the ported dashboards' own mock data store - unrelated to the real
// Supabase/Spring Boot backend the rest of the app uses. Kept as-is for now;
// wiring these pages to real data is a separate later task.

import * as sharedServices from './shared/dataServices'

// Re-export initialization
export function initLocalStorageSeed() {
  sharedServices.initSharedDataStore()
}

// Application Functions
export function getApplications() {
  return sharedServices.getApplications()
}

export function saveApplications(apps) {
  sharedServices.saveApplications(apps)
}

export function submitApplication(data) {
  return sharedServices.submitApplication(data)
}

export function approveApplication(appId) {
  const result = sharedServices.approveApplication(appId)
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
  }
}

export function rejectApplication(appId, rejectionReason) {
  return sharedServices.rejectApplication(appId, rejectionReason)
}

// Rural Mart Directory Functions
export function getRuralMarts() {
  const canonical = sharedServices.getRuralMarts()
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
  }))
}

export function saveRuralMarts(marts) {
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
    })
  })
}

// Owner Accounts Functions
export function getOwnerAccounts() {
  const owners = sharedServices.getOwners()
  const marts = sharedServices.getRuralMarts()

  return owners.map((o) => {
    const mart = marts.find((m) => m.ruralMartId === o.ruralMartId)
    return {
      ownerId: o.ownerId,
      email: o.email,
      password: 'owner123',
      role: 'owner',
      ruralMartId: o.ruralMartId,
      ruralMartName: mart ? mart.ruralMartName : 'Rural Mart Outpost',
      status: 'active',
      createdAt: o.createdAt,
    }
  })
}

export function saveOwnerAccounts(owners) {
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
    })
  })
}

// Authentication Logic (mock only - unused; real auth is Supabase via AuthContext)
export function authenticateUser(emailInput, passwordInput) {
  return sharedServices.authenticateUser(emailInput, passwordInput)
}

// Session Persistence (mock only - unused; real session is Supabase via AuthContext)
export function getStoredSession() {
  try {
    const raw = localStorage.getItem('ruralMartAuth')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredSession(session) {
  try {
    if (session && session.isAuthenticated) {
      localStorage.setItem('ruralMartAuth', JSON.stringify(session))
    } else {
      localStorage.removeItem('ruralMartAuth')
    }
  } catch (e) {
    console.error('Failed to set auth session in localStorage:', e)
  }
}
