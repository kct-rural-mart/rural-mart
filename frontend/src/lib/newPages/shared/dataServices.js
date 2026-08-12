import { STORAGE_KEYS, currentRepository } from './storageRepository'
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
} from './seedData'
import {
  INITIAL_RURAL_MARTS,
  INITIAL_ALERTS,
} from '../mockData'

// --- INITIALIZATION / SEEDING ---
export function initSharedDataStore() {
  try {
    if (!currentRepository.get(STORAGE_KEYS.RURAL_MARTS)) {
      currentRepository.set(STORAGE_KEYS.RURAL_MARTS, INITIAL_CANONICAL_MARTS)
    }
    if (!currentRepository.get(STORAGE_KEYS.OWNERS)) {
      currentRepository.set(STORAGE_KEYS.OWNERS, INITIAL_CANONICAL_OWNERS)
    }
    if (!currentRepository.get(STORAGE_KEYS.FARMERS)) {
      currentRepository.set(STORAGE_KEYS.FARMERS, INITIAL_CANONICAL_FARMERS)
    }
    if (!currentRepository.get(STORAGE_KEYS.PRODUCTS)) {
      currentRepository.set(STORAGE_KEYS.PRODUCTS, INITIAL_CANONICAL_PRODUCTS)
    }
    if (!currentRepository.get(STORAGE_KEYS.SALES)) {
      currentRepository.set(STORAGE_KEYS.SALES, INITIAL_CANONICAL_SALES)
    }
    if (!currentRepository.get(STORAGE_KEYS.EXPENSES)) {
      currentRepository.set(STORAGE_KEYS.EXPENSES, INITIAL_CANONICAL_EXPENSES)
    }
    if (!currentRepository.get(STORAGE_KEYS.OUTREACH)) {
      currentRepository.set(STORAGE_KEYS.OUTREACH, INITIAL_CANONICAL_OUTREACH)
    }
    if (!currentRepository.get(STORAGE_KEYS.FINANCIAL_RECORDS)) {
      currentRepository.set(STORAGE_KEYS.FINANCIAL_RECORDS, INITIAL_CANONICAL_FINANCIALS)
    }
    if (!currentRepository.get(STORAGE_KEYS.APPLICATIONS)) {
      currentRepository.set(STORAGE_KEYS.APPLICATIONS, INITIAL_CANONICAL_APPLICATIONS)
    }
  } catch (e) {
    console.error('Error initializing shared data store:', e)
  }
}

// Auto-initialize seed on import
initSharedDataStore()

// --- 1. RURAL MARTS SERVICES ---
export function getRuralMarts() {
  const marts = currentRepository.get(STORAGE_KEYS.RURAL_MARTS)
  return marts || INITIAL_CANONICAL_MARTS
}

export function getRuralMartById(id) {
  const marts = getRuralMarts()
  return marts.find((m) => m.ruralMartId === id || m.ruralMartName === id) || null
}

export function saveRuralMart(data) {
  const marts = getRuralMarts()
  const existingIdx = marts.findIndex((m) => m.ruralMartId === data.ruralMartId)
  if (existingIdx >= 0) {
    marts[existingIdx] = { ...marts[existingIdx], ...data, updatedAt: new Date().toISOString() }
  } else {
    marts.unshift(data)
  }
  currentRepository.set(STORAGE_KEYS.RURAL_MARTS, marts)
}

export function updateRuralMart(id, data) {
  const marts = getRuralMarts()
  const index = marts.findIndex((m) => m.ruralMartId === id)
  if (index === -1) return null

  const updated = {
    ...marts[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  marts[index] = updated
  currentRepository.set(STORAGE_KEYS.RURAL_MARTS, marts)
  return updated
}

// --- 2. OWNERS SERVICES ---
export function getOwners() {
  const owners = currentRepository.get(STORAGE_KEYS.OWNERS)
  return owners || INITIAL_CANONICAL_OWNERS
}

export function getOwnerById(id) {
  const owners = getOwners()
  return owners.find((o) => o.ownerId === id) || null
}

export function saveOwner(data) {
  const owners = getOwners()
  const existingIdx = owners.findIndex((o) => o.ownerId === data.ownerId)
  if (existingIdx >= 0) {
    owners[existingIdx] = { ...owners[existingIdx], ...data, updatedAt: new Date().toISOString() }
  } else {
    owners.unshift(data)
  }
  currentRepository.set(STORAGE_KEYS.OWNERS, owners)
}

export function updateOwner(id, data) {
  const owners = getOwners()
  const index = owners.findIndex((o) => o.ownerId === id)
  if (index === -1) return null

  const updated = {
    ...owners[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  owners[index] = updated
  currentRepository.set(STORAGE_KEYS.OWNERS, owners)
  return updated
}

// --- 3. FARMERS SERVICES ---
export function getFarmers() {
  const farmers = currentRepository.get(STORAGE_KEYS.FARMERS)
  return farmers || INITIAL_CANONICAL_FARMERS
}

export function getFarmersByRuralMart(ruralMartId) {
  const farmers = getFarmers()
  return farmers.filter((f) => f.ruralMartId === ruralMartId)
}

export function getFarmerById(id) {
  const farmers = getFarmers()
  return farmers.find((f) => f.id === id) || null
}

export function saveFarmer(data) {
  const farmers = getFarmers()
  const index = farmers.findIndex((f) => f.id === data.id)
  if (index >= 0) {
    farmers[index] = data
  } else {
    farmers.unshift(data)
  }
  currentRepository.set(STORAGE_KEYS.FARMERS, farmers)
}

export function updateFarmer(id, data) {
  const farmers = getFarmers()
  const index = farmers.findIndex((f) => f.id === id)
  if (index === -1) return null

  const updated = { ...farmers[index], ...data }
  farmers[index] = updated
  currentRepository.set(STORAGE_KEYS.FARMERS, farmers)
  return updated
}

// --- 4. PRODUCTS SERVICES ---
export function getProducts() {
  const products = currentRepository.get(STORAGE_KEYS.PRODUCTS)
  return products || INITIAL_CANONICAL_PRODUCTS
}

export function getProductsByRuralMart(ruralMartId) {
  const products = getProducts()
  return products.filter((p) => p.ruralMartId === ruralMartId)
}

export function getProductById(id) {
  const products = getProducts()
  return products.find((p) => p.id === id) || null
}

export function saveProduct(data) {
  const products = getProducts()
  const index = products.findIndex((p) => p.id === data.id)
  if (index >= 0) {
    products[index] = data
  } else {
    products.unshift(data)
  }
  currentRepository.set(STORAGE_KEYS.PRODUCTS, products)
}

export function updateProduct(id, data) {
  const products = getProducts()
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) return null

  const updated = { ...products[index], ...data }
  products[index] = updated
  currentRepository.set(STORAGE_KEYS.PRODUCTS, products)
  return updated
}

// --- 5. INVENTORY SERVICES ---
export function getInventory() {
  const inventory = currentRepository.get(STORAGE_KEYS.INVENTORY)
  if (inventory && inventory.length > 0) return inventory

  const products = getProducts()
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
  }))
}

export function getInventoryByRuralMart(ruralMartId) {
  const inv = getInventory()
  return inv.filter((item) => item.ruralMartId === ruralMartId)
}

export function saveInventory(data) {
  const inv = getInventory()
  const index = inv.findIndex((i) => i.id === data.id)
  if (index >= 0) {
    inv[index] = data
  } else {
    inv.unshift(data)
  }
  currentRepository.set(STORAGE_KEYS.INVENTORY, inv)
}

export function updateInventory(id, data) {
  const inv = getInventory()
  const index = inv.findIndex((i) => i.id === id)
  if (index === -1) return null

  const updated = { ...inv[index], ...data }
  inv[index] = updated
  currentRepository.set(STORAGE_KEYS.INVENTORY, inv)
  return updated
}

// --- 6. SALES / BUSINESS SERVICES ---
export function getSales() {
  const sales = currentRepository.get(STORAGE_KEYS.SALES)
  return sales || INITIAL_CANONICAL_SALES
}

export function getSalesByRuralMart(ruralMartId) {
  const sales = getSales()
  return sales.filter((s) => s.ruralMartId === ruralMartId)
}

export function saveSale(data) {
  const sales = getSales()
  sales.unshift(data)
  currentRepository.set(STORAGE_KEYS.SALES, sales)
}

// --- 7. PURCHASES / PROCUREMENT SERVICES ---
export function getPurchases() {
  const purchases = currentRepository.get(STORAGE_KEYS.PURCHASES)
  return purchases || []
}

export function getPurchasesByRuralMart(ruralMartId) {
  const purchases = getPurchases()
  return purchases.filter((p) => p.ruralMartId === ruralMartId)
}

export function savePurchase(data) {
  const purchases = getPurchases()
  purchases.unshift(data)
  currentRepository.set(STORAGE_KEYS.PURCHASES, purchases)
}

// --- 8. EXPENSES SERVICES ---
export function getExpenses() {
  const expenses = currentRepository.get(STORAGE_KEYS.EXPENSES)
  return expenses || INITIAL_CANONICAL_EXPENSES
}

export function getExpensesByRuralMart(ruralMartId) {
  const expenses = getExpenses()
  return expenses.filter((e) => e.ruralMartId === ruralMartId)
}

export function saveExpense(data) {
  const expenses = getExpenses()
  expenses.unshift(data)
  currentRepository.set(STORAGE_KEYS.EXPENSES, expenses)
}

// --- 9. OUTREACH SERVICES ---
export function getOutreachPrograms() {
  const outreach = currentRepository.get(STORAGE_KEYS.OUTREACH)
  return outreach || INITIAL_CANONICAL_OUTREACH
}

export function getOutreachByRuralMart(ruralMartId) {
  const outreach = getOutreachPrograms()
  return outreach.filter((o) => o.ruralMartId === ruralMartId)
}

export function saveOutreachProgram(data) {
  const outreach = getOutreachPrograms()
  outreach.unshift(data)
  currentRepository.set(STORAGE_KEYS.OUTREACH, outreach)
}

export function getFarmerOutreachMarts() {
  const marts = getRuralMarts()
  const allOutreach = getOutreachPrograms()
  const allFarmers = getFarmers()

  return marts.map((m) => {
    const martOutreach = allOutreach.filter((o) => o.ruralMartId === m.ruralMartId)
    const martFarmers = allFarmers.filter((f) => f.ruralMartId === m.ruralMartId)

    const displayName = m.ruralMartName
      .replace(' Rural Mart', '')
      .replace(' Agro Mart', '')
      .replace(' Farmers Hub', '')

    const totalReg = martFarmers.length
    const totalProg = martOutreach.length
    const totalReached = martOutreach.reduce(
      (sum, item) => sum + (item.farmersAttended || item.farmersReached || 0),
      0
    )

    const villagesSet = new Set(martFarmers.map((f) => f.village).filter(Boolean))
    const animalPop = martFarmers.reduce((sum, f) => sum + (f.animalHeadCount || 0), 0)

    return {
      id: m.ruralMartId.toLowerCase(),
      name: displayName,
      district: m.district,
      status: m.status || 'Active',
      totalRegisteredFarmers: totalReg,
      newFarmers: martFarmers.filter((f) => f.status === 'New').length,
      repeatFarmers: martFarmers.filter((f) => f.status === 'Repeat' || f.status === 'Active').length,
      farmersReached: totalReached,
      outreachProgramsConducted: totalProg,
      villagesCovered: villagesSet.size,
      animalPopulationCovered: animalPop,
      retentionRate: totalReg > 0 ? Number(((martFarmers.filter((f) => f.status === 'Repeat').length / totalReg) * 100).toFixed(1)) : 0,
      sparklineData: [0, 0, 0, 0, 0, totalReg],
    }
  })
}

// --- 10. FINANCIAL RECORDS SERVICES ---
export function getFinancialRecords() {
  const financials = currentRepository.get(STORAGE_KEYS.FINANCIAL_RECORDS)
  return financials || INITIAL_CANONICAL_FINANCIALS
}

export function getFinancialRecordsByRuralMart(ruralMartId) {
  const financials = getFinancialRecords()
  return financials.filter((f) => f.ruralMartId === ruralMartId)
}

export function saveFinancialRecord(data) {
  const financials = getFinancialRecords()
  const index = financials.findIndex((f) => f.id === data.id || f.ruralMartId === data.ruralMartId)
  if (index >= 0) {
    financials[index] = data
  } else {
    financials.unshift(data)
  }
  currentRepository.set(STORAGE_KEYS.FINANCIAL_RECORDS, financials)
}

export function getFinancialLedgerLogs(ruralMartId = 'RM-001') {
  const allLogs = currentRepository.get(STORAGE_KEYS.FINANCIAL_LEDGER_LOGS)
  if (allLogs && allLogs[ruralMartId]) {
    return allLogs[ruralMartId]
  }
  return []
}

export function saveFinancialLedgerLogs(ruralMartId, logs) {
  const allLogs = currentRepository.get(STORAGE_KEYS.FINANCIAL_LEDGER_LOGS) || {}
  allLogs[ruralMartId] = logs
  currentRepository.set(STORAGE_KEYS.FINANCIAL_LEDGER_LOGS, allLogs)

  const currentFinancials = getFinancialRecords()
  const existing = currentFinancials.find((f) => f.ruralMartId === ruralMartId)

  const totalRev = logs.reduce((sum, l) => sum + l.grossRevenue, 0)
  const totalProc = logs.reduce((sum, l) => sum + l.procurementCosts, 0)
  const totalOpex = logs.reduce((sum, l) => sum + l.operatingExpenses, 0)
  const totalNet = totalRev - totalProc - totalOpex
  const grossProfit = totalRev - totalProc
  const margin = totalRev > 0 ? (totalNet / totalRev) * 100 : 0

  if (existing) {
    saveFinancialRecord({
      ...existing,
      salesRaw: totalRev,
      procurementRaw: totalProc,
      operatingExpensesRaw: totalOpex,
      grossProfitRaw: grossProfit,
      netProfitRaw: totalNet,
      profitMargin: Math.round(margin * 100) / 100,
    })
  } else {
    saveFinancialRecord({
      id: `fin-${ruralMartId}`,
      ruralMartId,
      name: ruralMartId,
      district: '',
      status: 'Active',
      salesRaw: totalRev,
      salesDisplay: totalRev > 0 ? `₹${(totalRev / 100000).toFixed(1)} L` : '₹0.0 L',
      procurementRaw: totalProc,
      procurementDisplay: totalProc > 0 ? `₹${(totalProc / 100000).toFixed(1)} L` : '₹0.0 L',
      grossProfitRaw: grossProfit,
      grossProfitDisplay: grossProfit > 0 ? `₹${(grossProfit / 100000).toFixed(1)} L` : '₹0.0 L',
      netProfitRaw: totalNet,
      netProfitDisplay: totalNet > 0 ? `₹${(totalNet / 100000).toFixed(1)} L` : '₹0.0 L',
      operatingExpensesRaw: totalOpex,
      opexDisplay: totalOpex > 0 ? `₹${(totalOpex / 100000).toFixed(1)} L` : '₹0.0 L',
      profitMargin: Math.round(margin * 100) / 100,
      avgBillValue: 0,
      totalBills: logs.length,
      salesGrowthPercent: 0,
    })
  }
}

export function getOperationalEntries(ruralMartId = 'RM-001') {
  const allEntries = currentRepository.get(STORAGE_KEYS.OPERATIONAL_ENTRIES)
  if (allEntries && allEntries[ruralMartId]) {
    return allEntries[ruralMartId]
  }
  return []
}

export function saveOperationalEntry(ruralMartId, entry) {
  const allEntries = currentRepository.get(STORAGE_KEYS.OPERATIONAL_ENTRIES) || {}
  const currentList = allEntries[ruralMartId] || []
  currentList.unshift(entry)
  allEntries[ruralMartId] = currentList
  currentRepository.set(STORAGE_KEYS.OPERATIONAL_ENTRIES, allEntries)

  if (entry.salesValue > 0) {
    saveSale({
      id: `sale-${Date.now()}`,
      ruralMartId,
      billNumber: `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
      time: entry.timestamp || '12:00 PM',
      date: entry.date || new Date().toISOString().split('T')[0],
      customerName: entry.farmerName || 'Daily Counter Customer',
      itemsCount: entry.salesQty || 1,
      paymentMethod: 'Cash',
      amount: entry.salesValue,
      status: 'Completed',
    })
  }
}

export function getFinancialMarts() {
  const canonicalRecords = getFinancialRecords()
  const marts = getRuralMarts()

  return canonicalRecords.map((fin) => {
    const mart = marts.find((m) => m.ruralMartId === fin.ruralMartId)
    let displayName = fin.name.replace(' Rural Mart', '').replace(' Agro Mart', '').replace(' Farmers Hub', '')
    if (!displayName) displayName = mart ? mart.ruralMartName : fin.ruralMartId

    const formatLakhs = (val) => {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`
      if (val > 0) return `₹${(val / 100000).toFixed(1)} L`
      return '₹0.0 L'
    }

    return {
      id: fin.ruralMartId.toLowerCase(),
      name: displayName,
      district: fin.district || (mart ? mart.district : 'N/A'),
      status: fin.status || 'Active',
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
      trend: 'flat',
      sparklineData: [0, 0, 0, 0, 0, 0, 0],
      monthlyBreakdown: [],
    }
  })
}

// --- 11. REGISTRATION & APPROVAL SERVICES ---
export function getApplications() {
  const apps = currentRepository.get(STORAGE_KEYS.APPLICATIONS)
  return apps || INITIAL_CANONICAL_APPLICATIONS
}

export function saveApplications(apps) {
  currentRepository.set(STORAGE_KEYS.APPLICATIONS, apps)
}

export function submitApplication(data) {
  const apps = getApplications()
  const nextIdNum = apps.length + 1
  const appId = `RM-APP-${String(nextIdNum).padStart(3, '0')}`

  const now = new Date()
  const formattedDate = `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`

  const newApp = {
    ...data,
    applicationId: appId,
    submittedAt: formattedDate,
    status: 'pending',
  }

  apps.unshift(newApp)
  saveApplications(apps)
  return newApp
}

export function approveApplication(appId) {
  const apps = getApplications()
  const appIndex = apps.findIndex((a) => a.applicationId === appId)
  if (appIndex === -1) {
    throw new Error('Application not found')
  }

  const app = apps[appIndex]
  const now = new Date()
  const formattedDate = `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`

  app.status = 'approved'
  app.reviewedAt = formattedDate
  app.reviewedBy = 'EDF Executive Admin'
  apps[appIndex] = app
  saveApplications(apps)

  const marts = getRuralMarts()
  let existingMart = marts.find(
    (m) =>
      m.ruralMartName.toLowerCase() === app.ruralMartName.toLowerCase() ||
      m.ownerEmail.toLowerCase() === app.email.trim().toLowerCase()
  )

  let ruralMartId = existingMart ? existingMart.ruralMartId : `RM-${String(marts.length + 1).padStart(3, '0')}`
  let ownerId = existingMart ? existingMart.ownerId : `OWNER-${String(marts.length + 1).padStart(3, '0')}`

  const canonicalMart = {
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
  }

  saveRuralMart(canonicalMart)

  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  const tempPassword = `RM@2026${randomSuffix}`

  const newOwner = {
    ownerId,
    ruralMartId,
    email: app.email.trim().toLowerCase(),
    ownerName: app.ownerName,
    phone: app.phone,
    role: 'owner',
    status: 'active',
    createdAt: formattedDate,
    updatedAt: formattedDate,
  }

  saveOwner(newOwner)

  return {
    application: app,
    ruralMart: canonicalMart,
    owner: newOwner,
    temporaryPassword: tempPassword,
  }
}

export function rejectApplication(appId, rejectionReason) {
  const apps = getApplications()
  const appIndex = apps.findIndex((a) => a.applicationId === appId)
  if (appIndex === -1) {
    throw new Error('Application not found')
  }

  const app = apps[appIndex]
  const now = new Date()
  const formattedDate = `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`

  app.status = 'rejected'
  app.rejectionReason = rejectionReason || 'Application details incomplete or unverified.'
  app.reviewedAt = formattedDate
  app.reviewedBy = 'EDF Executive Admin'

  apps[appIndex] = app
  saveApplications(apps)

  return app
}

// --- 12. AUTHENTICATION SERVICES (mock only - unused; real auth is Supabase) ---
export function authenticateUser(emailInput, passwordInput) {
  const cleanEmail = emailInput.trim().toLowerCase()
  const cleanPassword = passwordInput

  if (!cleanEmail || !cleanPassword) {
    return { success: false, errorMessage: 'Invalid email or password.' }
  }

  if (cleanEmail === 'admin@ruralmart.in' && cleanPassword === 'admin123') {
    return {
      success: true,
      session: { isAuthenticated: true, role: 'admin', email: 'admin@ruralmart.in', userName: 'EDF Executive Admin' },
    }
  }

  const owners = getOwners()
  const matchedOwner = owners.find((o) => o.email.toLowerCase() === cleanEmail)

  if (matchedOwner) {
    const marts = getRuralMarts()
    const mart = marts.find((m) => m.ruralMartId === matchedOwner.ruralMartId)

    return {
      success: true,
      session: {
        isAuthenticated: true,
        role: 'owner',
        email: matchedOwner.email,
        ruralMartId: matchedOwner.ruralMartId,
        ruralMartName: mart ? mart.ruralMartName : 'Rural Mart Outpost',
        ownerId: matchedOwner.ownerId,
        userName: matchedOwner.ownerName || matchedOwner.email.split('@')[0],
      },
    }
  }

  return { success: false, errorMessage: 'Invalid email or password.' }
}

export function getReportsRuralMarts() {
  const canonicalMarts = getRuralMarts()
  const financials = getFinancialRecords()
  const allFarmers = getFarmers()
  const allOutreach = getOutreachPrograms()
  const allOwners = getOwners()

  return canonicalMarts.map((cm) => {
    const fin = financials.find((f) => f.ruralMartId === cm.ruralMartId)
    const martFarmers = allFarmers.filter((f) => f.ruralMartId === cm.ruralMartId)
    const martOutreach = allOutreach.filter((o) => o.ruralMartId === cm.ruralMartId)
    const owner = allOwners.find((o) => o.ruralMartId === cm.ruralMartId)

    const salesRaw = fin ? fin.salesRaw : 0
    const grossProfitRaw = fin ? fin.grossProfitRaw : 0
    const grossProfitLakhs = Number((grossProfitRaw / 100000).toFixed(1))
    const salesCr = Number((salesRaw / 10000000).toFixed(2))

    const registeredFarmers = martFarmers.length

    let farmersReached = 0
    if (martOutreach.length > 0) {
      farmersReached = martOutreach.reduce(
        (sum, item) => sum + (item.farmersAttended || item.farmersReached || 0),
        0
      )
    }

    const formattedStatus = cm.status
      ? cm.status.charAt(0).toUpperCase() + cm.status.slice(1).toLowerCase()
      : 'Active'

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
    }
  })
}

// --- 13. ALERTS & TRENDS SERVICES ---
export function getAlerts() {
  const alerts = currentRepository.get(STORAGE_KEYS.ALERTS)
  return alerts || INITIAL_ALERTS
}

export function saveAlerts(alerts) {
  currentRepository.set(STORAGE_KEYS.ALERTS, alerts)
}

export function getNetworkTrendData(_timeGrouping) {
  const financials = getFinancialRecords()
  if (financials.length === 0) return []

  const totalSalesRaw = financials.reduce((sum, f) => sum + f.salesRaw, 0)
  const totalProfitRaw = financials.reduce((sum, f) => sum + f.grossProfitRaw, 0)

  if (totalSalesRaw === 0 && totalProfitRaw === 0) return []

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
  ]
}
