import { useState } from 'react'
import {
  Search,
  X,
  History,
  UserCheck,
  UserPlus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Save,
  Check,
} from 'lucide-react'
import { getOwnerFarmers } from '../../lib/newPages/ownerMockData'
import {
  getFarmersByRuralMart,
  saveFarmer,
  updateFarmer,
  getOperationalEntries,
  saveOperationalEntry,
} from '../../lib/newPages/shared/dataServices'

export default function OwnerDailyBusiness() {
  // --- ENTRY HISTORY STATE ---
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [savedEntries, setSavedEntries] = useState(() => getOperationalEntries('RM-001'))
  const [historySearch, setHistorySearch] = useState('')
  const [historyDate, setHistoryDate] = useState('')
  const [historyFilterStatus, setHistoryFilterStatus] = useState('All')

  // --- OPERATIONAL METRICS FORM STATE ---
  const [opCategory, setOpCategory] = useState('Select a category')
  const [opSalesValue, setOpSalesValue] = useState('')
  const [opProcurementValue, setOpProcurementValue] = useState('')
  const [opOpeningStock, setOpOpeningStock] = useState('')
  const [opClosingStock, setOpClosingStock] = useState('')
  const [opSalesQty, setOpSalesQty] = useState('')
  const [opProcurementQty, setOpProcurementQty] = useState('')
  const [opCustomerBills, setOpCustomerBills] = useState('')

  const [opErrors, setOpErrors] = useState({})
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('')

  // --- FARMER LOOKUP & CUSTOMER STATE ---
  const [farmerTab, setFarmerTab] = useState('existing')
  const [farmerSearchInput, setFarmerSearchInput] = useState('')

  const [matchedFarmer, setMatchedFarmer] = useState(null)
  const [isEditingFarmer, setIsEditingFarmer] = useState(false)
  const [editCattleCount, setEditCattleCount] = useState('0')
  const [editFarmerName, setEditFarmerName] = useState('')
  const [editFarmerVillage, setEditFarmerVillage] = useState('')
  const [farmerUpdateMsg, setFarmerUpdateMsg] = useState('')

  // New Customer Form State
  const [newName, setNewName] = useState('')
  const [newMobile, setNewMobile] = useState('')
  const [newVillage, setNewVillage] = useState('')
  const [newGender, setNewGender] = useState('Select gender')
  const [newAge, setNewAge] = useState('')
  const [newCustomerErrors, setNewCustomerErrors] = useState({})

  // ----------------------------------------------------
  // CALCULATED TOP METRICS
  // ----------------------------------------------------
  const totalDailySales = savedEntries.reduce((acc, item) => acc + item.salesValue, 0)
  const totalBills = savedEntries.reduce((acc, item) => acc + item.customerBills, 0)
  const avgBillValue = totalBills > 0 ? Math.round(totalDailySales / totalBills) : 0
  const dailyFootfall = totalBills > 0 ? totalBills : 0
  const conversionRate = dailyFootfall > 0 ? ((totalBills / dailyFootfall) * 100).toFixed(1) : '0'

  // ----------------------------------------------------
  // OPERATIONAL METRICS FORM HANDLERS
  // ----------------------------------------------------
  const handleClearOpForm = () => {
    setOpCategory('Select a category')
    setOpSalesValue('')
    setOpProcurementValue('')
    setOpOpeningStock('')
    setOpClosingStock('')
    setOpSalesQty('')
    setOpProcurementQty('')
    setOpCustomerBills('')
    setOpErrors({})
    setSaveSuccessMsg('')
  }

  const handleSaveOpEntry = (e) => {
    e.preventDefault()
    const errors = {}

    if (!opCategory || opCategory === 'Select a category') {
      errors.category = 'This field is required.'
    }
    if (opSalesValue.trim() === '') errors.salesValue = 'This field is required.'
    if (opProcurementValue.trim() === '') errors.procurementValue = 'This field is required.'
    if (opOpeningStock.trim() === '') errors.openingStock = 'This field is required.'
    if (opClosingStock.trim() === '') errors.closingStock = 'This field is required.'
    if (opSalesQty.trim() === '') errors.salesQty = 'This field is required.'
    if (opProcurementQty.trim() === '') errors.procurementQty = 'This field is required.'
    if (opCustomerBills.trim() === '') errors.customerBills = 'This field is required.'

    if (Object.keys(errors).length > 0) {
      setOpErrors(errors)
      setSaveSuccessMsg('')
      return
    }

    const newEntry = {
      id: `op-entry-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      category: opCategory,
      salesValue: Number(opSalesValue) || 0,
      procurementValue: Number(opProcurementValue) || 0,
      openingStock: Number(opOpeningStock) || 0,
      closingStock: Number(opClosingStock) || 0,
      salesQty: Number(opSalesQty) || 0,
      procurementQty: Number(opProcurementQty) || 0,
      customerBills: Number(opCustomerBills) || 0,
      farmerName: matchedFarmer ? matchedFarmer.name : undefined,
      status: 'Saved',
    }

    saveOperationalEntry('RM-001', newEntry)
    setSavedEntries((prev) => [newEntry, ...prev])
    setOpErrors({})
    setSaveSuccessMsg('Daily operational entry successfully saved!')
    setTimeout(() => setSaveSuccessMsg(''), 4000)

    setOpCategory('Select a category')
    setOpSalesValue('')
    setOpProcurementValue('')
    setOpOpeningStock('')
    setOpClosingStock('')
    setOpSalesQty('')
    setOpProcurementQty('')
    setOpCustomerBills('')
  }

  // ----------------------------------------------------
  // FARMER LOOKUP HANDLERS
  // ----------------------------------------------------
  const handleFarmerSearch = (e) => {
    if (e) e.preventDefault()
    if (!farmerSearchInput.trim()) return

    const term = farmerSearchInput.trim().toLowerCase()
    const currentFarmers = getOwnerFarmers('RM-001')
    const found = currentFarmers.find(
      (f) => f.id.toLowerCase().includes(term) || f.phone.includes(term) || f.name.toLowerCase().includes(term)
    )

    if (found) {
      setMatchedFarmer({
        ...found,
        tempId: `TEMP-${found.phone}`,
        lastPurchase: '10 Aug 2026',
        totalVisits: 1,
      })
      setEditCattleCount(String(found.animalCount || 0))
      setEditFarmerName(found.name)
      setEditFarmerVillage(found.village)
    } else {
      setMatchedFarmer(null)
    }
  }

  const handleStartEditFarmer = () => {
    if (!matchedFarmer) return
    setIsEditingFarmer(true)
    setEditCattleCount(String(matchedFarmer.cattleCount || matchedFarmer.animalCount || 2))
    setEditFarmerName(matchedFarmer.name)
    setEditFarmerVillage(matchedFarmer.village)
  }

  const handleSaveChangesFarmer = (e) => {
    e.preventDefault()
    if (!matchedFarmer) return

    const updatedName = editFarmerName || matchedFarmer.name
    const updatedVillage = editFarmerVillage || matchedFarmer.village
    const updatedCount = Number(editCattleCount) || 0

    if (matchedFarmer.id) {
      updateFarmer(matchedFarmer.id, {
        name: updatedName,
        village: updatedVillage,
        animalHeadCount: updatedCount,
      })
    }

    setMatchedFarmer((prev) => ({
      ...prev,
      name: updatedName,
      village: updatedVillage,
      cattleCount: updatedCount,
      animalCount: updatedCount,
    }))

    setIsEditingFarmer(false)
    setFarmerUpdateMsg('Customer details updated successfully.')
    setTimeout(() => setFarmerUpdateMsg(''), 3000)
  }

  // ----------------------------------------------------
  // NEW CUSTOMER REGISTRATION
  // ----------------------------------------------------
  const handleSaveNewCustomer = (e) => {
    e.preventDefault()
    const errors = {}

    if (!newName.trim()) errors.name = 'This field is required.'

    const cleanMobile = newMobile.trim()
    if (!cleanMobile) {
      errors.mobile = 'This field is required.'
    } else if (!/^\d{10}$/.test(cleanMobile)) {
      errors.mobile = 'Enter a valid 10-digit Indian mobile number.'
    }

    if (!newVillage.trim()) errors.village = 'This field is required.'
    if (!newGender || newGender === 'Select gender') errors.gender = 'This field is required.'
    if (!newAge.trim() || isNaN(Number(newAge))) errors.age = 'This field is required.'

    if (Object.keys(errors).length > 0) {
      setNewCustomerErrors(errors)
      return
    }

    const newFarmerId = `FMR-${1040 + Math.floor(Math.random() * 8000)}`

    saveFarmer({
      id: newFarmerId,
      farmerCode: newFarmerId,
      ruralMartId: 'RM-001',
      name: newName.trim(),
      phone: cleanMobile.startsWith('+91') ? cleanMobile : `+91 ${cleanMobile}`,
      village: newVillage.trim(),
      district: 'Erode',
      category: 'Dairy Farmer',
      animalHeadCount: 0,
      lastVisit: '10 Aug 2026',
      status: 'New',
      totalPurchases: 0,
      totalSpent: 0,
      totalPurchasesVal: 0,
      joinedDate: '10 Aug 2026',
      gender: newGender,
      age: Number(newAge),
    })

    const createdFarmer = {
      id: newFarmerId,
      tempId: `TEMP-${cleanMobile}`,
      name: newName.trim(),
      phone: cleanMobile,
      village: newVillage.trim(),
      gender: newGender,
      age: Number(newAge),
      cattleCount: 0,
      lastPurchase: 'No prior purchase',
      totalVisits: 1,
    }

    setMatchedFarmer(createdFarmer)
    setEditCattleCount('0')
    setEditFarmerName(createdFarmer.name)
    setEditFarmerVillage(createdFarmer.village)

    setFarmerTab('existing')
    setIsEditingFarmer(true)

    setNewName('')
    setNewMobile('')
    setNewVillage('')
    setNewGender('Select gender')
    setNewAge('')
    setNewCustomerErrors({})

    setFarmerUpdateMsg('New farmer registered. You can now update cattle count.')
    setTimeout(() => setFarmerUpdateMsg(''), 4000)
  }

  // ----------------------------------------------------
  // ENTRY HISTORY FILTERING
  // ----------------------------------------------------
  const filteredHistory = savedEntries.filter((entry) => {
    const matchSearch =
      !historySearch ||
      entry.category.toLowerCase().includes(historySearch.toLowerCase()) ||
      (entry.farmerName && entry.farmerName.toLowerCase().includes(historySearch.toLowerCase()))

    const matchDate = !historyDate || entry.date === historyDate
    const matchStatus = historyFilterStatus === 'All' || entry.status === historyFilterStatus

    return matchSearch && matchDate && matchStatus
  })

  const clearHistoryFilters = () => {
    setHistorySearch('')
    setHistoryDate('')
    setHistoryFilterStatus('All')
  }

  const inputClass = (hasError) =>
    `w-full h-9 px-3 text-xs rounded-xl border bg-brand-bg-subtle text-brand-text transition-colors ${
      hasError ? 'border-brand-danger focus:ring-1 focus:ring-brand-danger' : 'border-brand-border'
    }`

  return (
    <div className="space-y-4">
      {/* PAGE HEADER */}
      <div className="bg-brand-surface border border-brand-border rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-text">Daily Business Register</h1>
          <p className="text-xs text-brand-text-muted">Record daily transactional sales, stock levels and farmer purchases.</p>
        </div>

        <button
          onClick={() => setIsHistoryOpen(true)}
          className="h-9 px-3.5 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <History className="w-4 h-4 text-white" />
          <span>Entry History</span>
          <span className="inline-flex items-center justify-center bg-white/20 text-white font-mono text-[11px] font-bold px-2 py-0.5 rounded-full border border-white/30 min-w-[20px]">
            {savedEntries.length}
          </span>
        </button>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[11px] font-semibold text-brand-text-muted uppercase tracking-wider block">Daily Sales</span>
          <div className="text-2xl font-extrabold text-brand-text">₹{totalDailySales.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-brand-success font-semibold block">Accumulated store revenue today</span>
        </div>

        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[11px] font-semibold text-brand-text-muted uppercase tracking-wider block">Average Bill Value</span>
          <div className="text-2xl font-extrabold text-brand-text">₹{avgBillValue.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-brand-text-subtle block">Across {totalBills} customer transactions</span>
        </div>

        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[11px] font-semibold text-brand-text-muted uppercase tracking-wider block">Daily Footfall</span>
          <div className="text-2xl font-extrabold text-brand-text">{dailyFootfall}</div>
          <span className="text-[10px] text-brand-text-subtle block">Estimated store visitor count</span>
        </div>

        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[11px] font-semibold text-brand-text-muted uppercase tracking-wider block">Conversion Rate</span>
          <div className="text-2xl font-extrabold text-brand-success">{conversionRate}%</div>
          <span className="text-[10px] text-brand-success font-semibold block">Visitors converted to purchases</span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT: Operational Metrics Entry Form */}
        <div className="lg:col-span-7 card-enterprise p-4 sm:p-5 space-y-4">
          <div className="border-b border-brand-border/60 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-brand-text">Operational Metrics Entry</h2>
              <p className="text-[11px] text-brand-text-muted">Enter product category stock, procurement, and daily transactional figures.</p>
            </div>
          </div>

          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-brand-success-light border border-brand-success/30 text-brand-success text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveOpEntry} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Product Category <span className="text-brand-danger">*</span>
                </label>
                <select
                  value={opCategory}
                  onChange={(e) => {
                    setOpCategory(e.target.value)
                    if (opErrors.category) setOpErrors((prev) => ({ ...prev, category: '' }))
                  }}
                  className={inputClass(opErrors.category)}
                >
                  <option value="Select a category">Select a category</option>
                  <option value="Seeds">Seeds</option>
                  <option value="Fertilizers">Fertilizers</option>
                  <option value="Pesticides">Pesticides</option>
                  <option value="Cattle Feed">Cattle Feed</option>
                  <option value="Farm Tools">Farm Tools</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Other">Other</option>
                </select>
                {opErrors.category && (
                  <p className="text-[11px] text-brand-danger font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{opErrors.category}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Sales Value (₹) <span className="text-brand-danger">*</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={opSalesValue}
                  onChange={(e) => {
                    setOpSalesValue(e.target.value)
                    if (opErrors.salesValue) setOpErrors((prev) => ({ ...prev, salesValue: '' }))
                  }}
                  className={inputClass(opErrors.salesValue)}
                />
                {opErrors.salesValue && (
                  <p className="text-[11px] text-brand-danger font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{opErrors.salesValue}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Procurement Value (₹) <span className="text-brand-danger">*</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={opProcurementValue}
                  onChange={(e) => {
                    setOpProcurementValue(e.target.value)
                    if (opErrors.procurementValue) setOpErrors((prev) => ({ ...prev, procurementValue: '' }))
                  }}
                  className={inputClass(opErrors.procurementValue)}
                />
                {opErrors.procurementValue && (
                  <p className="text-[11px] text-brand-danger font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{opErrors.procurementValue}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Opening Stock <span className="text-brand-danger">*</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={opOpeningStock}
                  onChange={(e) => {
                    setOpOpeningStock(e.target.value)
                    if (opErrors.openingStock) setOpErrors((prev) => ({ ...prev, openingStock: '' }))
                  }}
                  className={inputClass(opErrors.openingStock)}
                />
                {opErrors.openingStock && (
                  <p className="text-[11px] text-brand-danger font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{opErrors.openingStock}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Closing Stock <span className="text-brand-danger">*</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={opClosingStock}
                  onChange={(e) => {
                    setOpClosingStock(e.target.value)
                    if (opErrors.closingStock) setOpErrors((prev) => ({ ...prev, closingStock: '' }))
                  }}
                  className={inputClass(opErrors.closingStock)}
                />
                {opErrors.closingStock && (
                  <p className="text-[11px] text-brand-danger font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{opErrors.closingStock}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Sales Quantity <span className="text-brand-danger">*</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={opSalesQty}
                  onChange={(e) => {
                    setOpSalesQty(e.target.value)
                    if (opErrors.salesQty) setOpErrors((prev) => ({ ...prev, salesQty: '' }))
                  }}
                  className={inputClass(opErrors.salesQty)}
                />
                {opErrors.salesQty && (
                  <p className="text-[11px] text-brand-danger font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{opErrors.salesQty}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Procurement Quantity <span className="text-brand-danger">*</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={opProcurementQty}
                  onChange={(e) => {
                    setOpProcurementQty(e.target.value)
                    if (opErrors.procurementQty) setOpErrors((prev) => ({ ...prev, procurementQty: '' }))
                  }}
                  className={inputClass(opErrors.procurementQty)}
                />
                {opErrors.procurementQty && (
                  <p className="text-[11px] text-brand-danger font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{opErrors.procurementQty}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Number of Customer Bills <span className="text-brand-danger">*</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={opCustomerBills}
                  onChange={(e) => {
                    setOpCustomerBills(e.target.value)
                    if (opErrors.customerBills) setOpErrors((prev) => ({ ...prev, customerBills: '' }))
                  }}
                  className={inputClass(opErrors.customerBills)}
                />
                {opErrors.customerBills && (
                  <p className="text-[11px] text-brand-danger font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{opErrors.customerBills}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
              <button
                type="button"
                onClick={handleClearOpForm}
                className="h-9 px-4 text-xs font-bold text-brand-text-muted hover:text-brand-text border border-brand-border rounded-xl hover:bg-brand-bg-subtle transition-colors cursor-pointer"
              >
                Clear Form
              </button>

              <button
                type="submit"
                className="h-9 px-5 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5 text-white" />
                <span>Save Daily Entry</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: Farmer Purchase Lookup */}
        <div className="lg:col-span-5 card-enterprise p-4 sm:p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="border-b border-brand-border/60 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-brand-text">Farmer Purchase Lookup</h2>
                <p className="text-[11px] text-brand-text-muted">Search registered member or register new farmer customer.</p>
              </div>
            </div>

            {farmerUpdateMsg && (
              <div className="p-2.5 rounded-xl bg-brand-success-light border border-brand-success/30 text-brand-success text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-brand-success shrink-0" />
                <span>{farmerUpdateMsg}</span>
              </div>
            )}

            <div className="flex bg-brand-bg-subtle p-1 rounded-xl border border-brand-border">
              <button
                type="button"
                onClick={() => {
                  setFarmerTab('existing')
                  setNewCustomerErrors({})
                }}
                className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  farmerTab === 'existing' ? 'bg-brand-surface text-brand-primary shadow-xs' : 'text-brand-text-muted hover:text-brand-text'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Existing Customer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFarmerTab('new')
                  setIsEditingFarmer(false)
                }}
                className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  farmerTab === 'new' ? 'bg-brand-surface text-brand-primary shadow-xs' : 'text-brand-text-muted hover:text-brand-text'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>New Customer</span>
              </button>
            </div>

            {farmerTab === 'existing' && (
              <div className="space-y-3 pt-1">
                <form onSubmit={handleFarmerSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search by Farmer ID or Mobile"
                      value={farmerSearchInput}
                      onChange={(e) => setFarmerSearchInput(e.target.value)}
                      className="w-full h-9 pl-3 pr-8 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-9 px-3.5 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </form>

                {matchedFarmer && !isEditingFarmer && (
                  <div className="p-3.5 rounded-xl bg-brand-bg-subtle border border-brand-border space-y-3">
                    <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-brand-primary bg-brand-primary-light px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit mb-1">
                          {matchedFarmer.tempId || matchedFarmer.id}
                        </span>
                        <h3 className="text-sm font-bold text-brand-text">{matchedFarmer.name}</h3>
                      </div>
                      <span className="text-xs text-brand-text-muted font-mono font-semibold">{matchedFarmer.phone}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-brand-text-muted block">Village</span>
                        <span className="font-semibold text-brand-text">{matchedFarmer.village}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-brand-text-muted block">Gender / Age</span>
                        <span className="font-semibold text-brand-text">
                          {matchedFarmer.gender}, {matchedFarmer.age} yrs
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-brand-text-muted block">Cattle Count</span>
                        <span className="font-bold text-brand-primary">{matchedFarmer.cattleCount} Cattle</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-brand-text-muted block">Total Visits</span>
                        <span className="font-semibold text-brand-text">{matchedFarmer.totalVisits || 1} Visits</span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-brand-border/60 flex justify-between items-center text-[11px]">
                        <span className="text-brand-text-muted">Last Purchase:</span>
                        <span className="font-semibold text-brand-text">{matchedFarmer.lastPurchase || 'No prior purchase'}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleStartEditFarmer}
                        className="flex-1 h-8 bg-brand-surface hover:bg-brand-primary-light border border-brand-border text-brand-primary text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFarmerSearchInput('')
                          setMatchedFarmer(null)
                        }}
                        className="h-8 px-3 bg-brand-surface border border-brand-border text-brand-text-muted hover:text-brand-text text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}

                {matchedFarmer && isEditingFarmer && (
                  <form onSubmit={handleSaveChangesFarmer} className="p-3.5 rounded-xl bg-brand-bg-subtle border border-brand-border space-y-3">
                    <div className="border-b border-brand-border/60 pb-2 flex justify-between items-center">
                      <span className="text-xs font-bold text-brand-text">Edit Customer Details</span>
                      <span className="text-[10px] font-mono text-brand-text-subtle">{matchedFarmer.tempId || matchedFarmer.id}</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-brand-text mb-0.5">Farmer Name</label>
                        <input
                          type="text"
                          value={editFarmerName}
                          onChange={(e) => setEditFarmerName(e.target.value)}
                          className="w-full h-8 px-2.5 text-xs rounded-lg border border-brand-border bg-brand-surface text-brand-text"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-brand-text mb-0.5">Village</label>
                        <input
                          type="text"
                          value={editFarmerVillage}
                          onChange={(e) => setEditFarmerVillage(e.target.value)}
                          className="w-full h-8 px-2.5 text-xs rounded-lg border border-brand-border bg-brand-surface text-brand-text"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-brand-text mb-0.5">Cattle Count</label>
                        <input
                          type="number"
                          min="0"
                          value={editCattleCount}
                          onChange={(e) => setEditCattleCount(e.target.value)}
                          className="w-full h-8 px-2.5 text-xs rounded-lg border border-brand-border bg-brand-surface text-brand-text"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-brand-border/60">
                      <button
                        type="button"
                        onClick={() => setIsEditingFarmer(false)}
                        className="flex-1 h-8 bg-brand-surface border border-brand-border text-brand-text-muted text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="flex-1 h-8 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}

                {!matchedFarmer && (
                  <div className="p-6 text-center text-xs text-brand-text-muted border border-dashed border-brand-border rounded-xl">
                    No farmer selected. Use search above or switch to "New Customer" to register.
                  </div>
                )}
              </div>
            )}

            {farmerTab === 'new' && (
              <form onSubmit={handleSaveNewCustomer} className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-text">
                    Name <span className="text-brand-danger">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Farmer full name"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value)
                      if (newCustomerErrors.name) setNewCustomerErrors((prev) => ({ ...prev, name: '' }))
                    }}
                    className={`w-full h-8 px-3 text-xs rounded-xl border bg-brand-bg-subtle text-brand-text ${
                      newCustomerErrors.name ? 'border-brand-danger' : 'border-brand-border'
                    }`}
                  />
                  {newCustomerErrors.name && (
                    <p className="text-[11px] text-brand-danger font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{newCustomerErrors.name}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-text">
                    Mobile <span className="text-brand-danger">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={newMobile}
                    onChange={(e) => {
                      setNewMobile(e.target.value)
                      if (newCustomerErrors.mobile) setNewCustomerErrors((prev) => ({ ...prev, mobile: '' }))
                    }}
                    className={`w-full h-8 px-3 text-xs rounded-xl border bg-brand-bg-subtle text-brand-text ${
                      newCustomerErrors.mobile ? 'border-brand-danger' : 'border-brand-border'
                    }`}
                  />
                  {newCustomerErrors.mobile && (
                    <p className="text-[11px] text-brand-danger font-medium flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      <span>{newCustomerErrors.mobile}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-text">
                    Village <span className="text-brand-danger">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Village name"
                    value={newVillage}
                    onChange={(e) => {
                      setNewVillage(e.target.value)
                      if (newCustomerErrors.village) setNewCustomerErrors((prev) => ({ ...prev, village: '' }))
                    }}
                    className={`w-full h-8 px-3 text-xs rounded-xl border bg-brand-bg-subtle text-brand-text ${
                      newCustomerErrors.village ? 'border-brand-danger' : 'border-brand-border'
                    }`}
                  />
                  {newCustomerErrors.village && (
                    <p className="text-[11px] text-brand-danger font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{newCustomerErrors.village}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-brand-text">
                      Gender <span className="text-brand-danger">*</span>
                    </label>
                    <select
                      value={newGender}
                      onChange={(e) => {
                        setNewGender(e.target.value)
                        if (newCustomerErrors.gender) setNewCustomerErrors((prev) => ({ ...prev, gender: '' }))
                      }}
                      className={`w-full h-8 px-2 text-xs rounded-xl border bg-brand-bg-subtle text-brand-text ${
                        newCustomerErrors.gender ? 'border-brand-danger' : 'border-brand-border'
                      }`}
                    >
                      <option value="Select gender">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {newCustomerErrors.gender && <p className="text-[11px] text-brand-danger font-medium">{newCustomerErrors.gender}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-brand-text">
                      Age <span className="text-brand-danger">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Age in years"
                      value={newAge}
                      onChange={(e) => {
                        setNewAge(e.target.value)
                        if (newCustomerErrors.age) setNewCustomerErrors((prev) => ({ ...prev, age: '' }))
                      }}
                      className={`w-full h-8 px-3 text-xs rounded-xl border bg-brand-bg-subtle text-brand-text ${
                        newCustomerErrors.age ? 'border-brand-danger' : 'border-brand-border'
                      }`}
                    />
                    {newCustomerErrors.age && <p className="text-[11px] text-brand-danger font-medium">{newCustomerErrors.age}</p>}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-9 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-white" />
                    <span>Save Customer</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* SLIDE-OVER PANEL: ENTRY HISTORY */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div onClick={() => setIsHistoryOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-brand-surface border-l border-brand-border shadow-2xl flex flex-col justify-between">
              <div className="p-4 sm:p-5 border-b border-brand-border/60 flex items-center justify-between bg-brand-bg-subtle">
                <div>
                  <h2 className="text-base font-bold text-brand-text">Entry History</h2>
                  <p className="text-xs text-brand-text-muted">{savedEntries.length} saved entries</p>
                </div>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-brand-border text-brand-text-muted transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-3 border-b border-brand-border/60">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-brand-text-subtle" />
                  <input
                    type="text"
                    placeholder="Search by product category or farmer/customer..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="date"
                      value={historyDate}
                      onChange={(e) => setHistoryDate(e.target.value)}
                      className="w-full h-8 px-2 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                    />
                  </div>

                  <select
                    value={historyFilterStatus}
                    onChange={(e) => setHistoryFilterStatus(e.target.value)}
                    className="w-full h-8 px-2 text-xs font-medium rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Saved">Saved</option>
                    <option value="Edited">Edited</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={clearHistoryFilters}
                    className="text-[11px] font-semibold text-brand-primary hover:underline cursor-pointer"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredHistory.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-brand-bg-subtle border border-brand-border flex items-center justify-center text-brand-text-subtle">
                      <History className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-brand-text">No entries saved yet</h3>
                    <p className="text-xs text-brand-text-muted max-w-xs mx-auto">Daily entries you save will show up here.</p>
                  </div>
                ) : (
                  filteredHistory.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-xl bg-brand-bg-subtle border border-brand-border space-y-2">
                      <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-brand-text">{item.category}</span>
                          <span className="text-[10px] bg-brand-success-light text-brand-success font-bold px-2 py-0.5 rounded-full">
                            {item.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-brand-text-subtle font-mono">{item.timestamp}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-brand-text-muted block">Sales Value:</span>
                          <span className="font-bold text-brand-text">₹{item.salesValue.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-brand-text-muted block">Procurement:</span>
                          <span className="font-semibold text-brand-text">₹{item.procurementValue.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-brand-text-muted block">Opening/Closing:</span>
                          <span className="font-semibold text-brand-text">{item.openingStock} / {item.closingStock}</span>
                        </div>
                        <div>
                          <span className="text-brand-text-muted block">Bills Count:</span>
                          <span className="font-semibold text-brand-text">{item.customerBills} bills</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-brand-border/60 bg-brand-bg-subtle">
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(false)}
                  className="w-full h-9 rounded-xl border border-brand-border bg-brand-surface text-xs font-bold text-brand-text hover:bg-brand-primary-light transition-colors cursor-pointer"
                >
                  Close Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
