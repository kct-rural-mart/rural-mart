import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { Search, UserCheck, UserPlus, CheckCircle2, AlertCircle, RotateCcw, Plus, Trash2, Receipt, ShoppingBag, Loader2 } from 'lucide-react'
import { getOwnerProducts, PRODUCT_CATEGORIES } from '../../lib/queries/ownerProducts'
import { searchFarmers, addFarmer, recordSale } from '../../lib/queries/ownerBilling'
import { getLocalToday } from '../../utils/date'

// The single reusable "Farmer Purchase & Bill Entry" experience - rendered
// as the primary content of Daily Business, and inside the Overall
// Dashboard's "Daily Sale" Quick Action modal. Both consumers get the same
// UI, state, and record_sale RPC call, no duplicated implementation.

const BillingPanel = forwardRef(function BillingPanel({ ruralMartId, refreshKey, onDataChanged, onMatchedFarmerChange, onSaleGenerated }, ref) {
  const [localRefresh, setLocalRefresh] = useState(0)
  const bumpLocal = () => setLocalRefresh((k) => k + 1)

  const [products, setProducts] = useState([])
  useEffect(() => {
    let isMounted = true
    if (ruralMartId) {
      getOwnerProducts(ruralMartId)
        .then((result) => {
          if (isMounted) setProducts(result)
        })
        .catch((err) => console.error('Failed to load products for billing:', err.message))
    }
    return () => {
      isMounted = false
    }
  }, [ruralMartId, refreshKey, localRefresh])

  // --- FARMER LOOKUP & CUSTOMER STATE ---
  const [farmerTab, setFarmerTab] = useState('existing')
  const [farmerSearchInput, setFarmerSearchInput] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [matchedFarmer, setMatchedFarmer] = useState(null)

  useEffect(() => {
    onMatchedFarmerChange?.(matchedFarmer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedFarmer])

  useEffect(() => {
    const term = farmerSearchInput.trim()
    if (!term || !ruralMartId) {
      setSearchResults([])
      return
    }
    let isMounted = true
    setSearching(true)
    const timer = setTimeout(() => {
      searchFarmers(ruralMartId, term)
        .then((results) => {
          if (isMounted) setSearchResults(results)
        })
        .catch((err) => console.error('Farmer search failed:', err.message))
        .finally(() => {
          if (isMounted) setSearching(false)
        })
    }, 250)
    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [farmerSearchInput, ruralMartId])

  // New Customer Form State
  const [newName, setNewName] = useState('')
  const [newMobile, setNewMobile] = useState('')
  const [newVillage, setNewVillage] = useState('')
  const [newGender, setNewGender] = useState('')
  const [newAge, setNewAge] = useState('')
  const [newCattleCount, setNewCattleCount] = useState('')
  const [newCustomerErrors, setNewCustomerErrors] = useState({})
  const [newCustomerSubmitting, setNewCustomerSubmitting] = useState(false)
  const [newCustomerError, setNewCustomerError] = useState('')

  // --- BILL DRAFT STATE ---
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [inputQuantity, setInputQuantity] = useState('')
  const [billDraftItems, setBillDraftItems] = useState([])
  const [billError, setBillError] = useState('')
  const [billSuccessMsg, setBillSuccessMsg] = useState('')
  const [saleSubmitting, setSaleSubmitting] = useState(false)

  const filteredCatalogProducts = useMemo(() => {
    if (selectedCategory === 'All Categories') return products
    return products.filter((p) => p.category === selectedCategory)
  }, [products, selectedCategory])

  const currentSelectedProduct = useMemo(() => products.find((p) => p.id === selectedProductId) || null, [products, selectedProductId])

  const lineItemPreviewTotal = useMemo(() => {
    if (!currentSelectedProduct) return 0
    return (Number(inputQuantity) || 0) * currentSelectedProduct.sellingPrice
  }, [currentSelectedProduct, inputQuantity])

  const totalBillAmount = useMemo(() => billDraftItems.reduce((sum, item) => sum + item.lineTotal, 0), [billDraftItems])
  const totalBillQuantity = useMemo(() => billDraftItems.reduce((sum, item) => sum + item.quantity, 0), [billDraftItems])

  const attachFarmerToBill = (farmer) => {
    setMatchedFarmer({
      id: farmer.id,
      name: farmer.name,
      mobile: farmer.mobile,
      village: farmer.village,
      gender: farmer.gender,
      age: farmer.age,
      cattleCount: farmer.cattle_count ?? farmer.cattleCount ?? 0,
    })
    setFarmerSearchInput('')
    setSearchResults([])
  }

  useImperativeHandle(ref, () => ({
    attachFarmer: attachFarmerToBill,
  }))

  const handleSaveNewCustomer = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!newName.trim()) errors.name = 'Farmer name is required.'

    const cleanMobile = newMobile.trim()
    if (!cleanMobile) {
      errors.mobile = 'Mobile number is required.'
    } else if (!/^\d{10}$/.test(cleanMobile)) {
      errors.mobile = 'Enter a valid 10-digit mobile number.'
    }
    if (!newVillage.trim()) errors.village = 'Village is required.'

    if (Object.keys(errors).length > 0) {
      setNewCustomerErrors(errors)
      return
    }

    setNewCustomerSubmitting(true)
    setNewCustomerError('')
    try {
      const farmer = await addFarmer({
        ruralMartId,
        name: newName.trim(),
        mobile: cleanMobile,
        village: newVillage.trim(),
        gender: newGender,
        age: newAge ? Number(newAge) : null,
        cattleCount: newCattleCount ? Number(newCattleCount) : 0,
      })

      attachFarmerToBill(farmer)
      setNewName('')
      setNewMobile('')
      setNewVillage('')
      setNewGender('')
      setNewAge('')
      setNewCattleCount('')
      setNewCustomerErrors({})
      setFarmerTab('existing')

      bumpLocal()
      onDataChanged?.()
    } catch (err) {
      setNewCustomerError(err.message?.includes('duplicate') || err.code === '23505' ? 'A farmer with this mobile number is already registered at your mart.' : err.message || 'Failed to register farmer.')
    } finally {
      setNewCustomerSubmitting(false)
    }
  }

  const handleAddItemToBill = () => {
    setBillError('')
    setBillSuccessMsg('')

    if (!currentSelectedProduct) {
      setBillError('Please select a product from the catalog.')
      return
    }
    const qty = Number(inputQuantity)
    if (!qty || qty <= 0) {
      setBillError('Please enter a valid purchase quantity greater than 0.')
      return
    }
    if (qty > currentSelectedProduct.stockQty) {
      setBillError(`Insufficient stock for ${currentSelectedProduct.name}. Available: ${currentSelectedProduct.stockQty} ${currentSelectedProduct.unit}.`)
      return
    }

    const existingIndex = billDraftItems.findIndex((item) => item.productId === currentSelectedProduct.id)
    if (existingIndex >= 0) {
      const newQty = billDraftItems[existingIndex].quantity + qty
      if (newQty > currentSelectedProduct.stockQty) {
        setBillError(`Total quantity (${newQty} ${currentSelectedProduct.unit}) exceeds available stock (${currentSelectedProduct.stockQty} ${currentSelectedProduct.unit}).`)
        return
      }
      const updated = [...billDraftItems]
      updated[existingIndex] = { ...updated[existingIndex], quantity: newQty, lineTotal: newQty * currentSelectedProduct.sellingPrice }
      setBillDraftItems(updated)
    } else {
      setBillDraftItems((prev) => [
        ...prev,
        {
          productId: currentSelectedProduct.id,
          productName: currentSelectedProduct.name,
          category: currentSelectedProduct.category,
          quantity: qty,
          unit: currentSelectedProduct.unit,
          unitPrice: currentSelectedProduct.sellingPrice,
          lineTotal: qty * currentSelectedProduct.sellingPrice,
        },
      ])
    }

    setSelectedProductId('')
    setInputQuantity('')
  }

  const handleRemoveDraftItem = (index) => {
    setBillDraftItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleClearBillDraft = () => {
    setBillDraftItems([])
    setSelectedProductId('')
    setInputQuantity('')
    setBillError('')
    setBillSuccessMsg('')
  }

  const handleGenerateBill = async (e) => {
    e.preventDefault()
    setBillError('')
    setBillSuccessMsg('')

    if (!matchedFarmer) {
      setBillError('Customer selection is required. Every bill must be attached to a registered customer.')
      return
    }
    if (billDraftItems.length === 0) {
      setBillError('Please add at least one product to the bill before completing the transaction.')
      return
    }

    setSaleSubmitting(true)
    try {
      const result = await recordSale({
        ruralMartId,
        farmerId: matchedFarmer.id,
        saleDate: getLocalToday(),
        items: billDraftItems.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
      })

      const billAmount = totalBillAmount
      const billNumber = result?.bill_number
      const customerName = matchedFarmer.name

      setBillSuccessMsg(`Bill #${billNumber} generated for ${customerName} (₹${billAmount.toLocaleString('en-IN')})! Stock updated.`)
      setBillDraftItems([])
      setSelectedProductId('')
      setInputQuantity('')

      bumpLocal()
      onDataChanged?.()
      onSaleGenerated?.({ billNumber, amount: billAmount, customerName })

      setTimeout(() => setBillSuccessMsg(''), 5000)
    } catch (err) {
      setBillError(err.message || 'Failed to record sale.')
    } finally {
      setSaleSubmitting(false)
    }
  }

  return (
    <div className="card-enterprise p-4 sm:p-5 space-y-4">
      <div className="border-b border-brand-border/60 pb-3">
        <h2 className="text-base font-bold text-brand-text flex items-center gap-2">
          <Receipt className="w-4 h-4 text-brand-primary" />
          <span>Farmer Purchase &amp; Bill Entry</span>
        </h2>
        <p className="text-[11px] text-brand-text-muted">Select products from catalog to generate a customer bill. Stock updates automatically.</p>
      </div>

      {billSuccessMsg && (
        <div className="p-3 rounded-xl bg-brand-success-light border border-brand-success/30 text-brand-success text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{billSuccessMsg}</span>
        </div>
      )}
      {billError && (
        <div className="p-3 rounded-xl bg-brand-danger-light border border-brand-danger-border text-brand-danger text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{billError}</span>
        </div>
      )}

      {/* CUSTOMER SELECTION */}
      <div className="p-4 rounded-xl bg-brand-bg-subtle border border-brand-border space-y-3">
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
            <UserCheck className="w-4 h-4" />
            <span>Customer Selection (Required for Bill) *</span>
          </span>
          {matchedFarmer && (
            <button
              type="button"
              onClick={() => setMatchedFarmer(null)}
              className="text-xs font-bold text-brand-danger hover:underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Change / Clear</span>
            </button>
          )}
        </div>

        {matchedFarmer ? (
          <div className="p-3.5 bg-brand-success-light/70 border border-brand-success/40 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between gap-2 border-b border-brand-success/30 pb-2">
              <div>
                <span className="text-sm font-extrabold text-brand-text">{matchedFarmer.name}</span>
                <div className="text-xs text-brand-text-muted mt-0.5">
                  Village: <span className="font-semibold">{matchedFarmer.village || 'N/A'}</span> • Mobile: <span className="font-semibold">{matchedFarmer.mobile || 'N/A'}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold bg-brand-success-light text-brand-success rounded-full border border-brand-success/40 shrink-0">✓ Attached</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="bg-brand-surface p-2 rounded-lg border border-brand-border/60">
                <span className="text-brand-text-muted block text-[10px]">Cattle Count</span>
                <span className="font-bold text-brand-primary">{matchedFarmer.cattleCount}</span>
              </div>
              <div className="bg-brand-surface p-2 rounded-lg border border-brand-border/60">
                <span className="text-brand-text-muted block text-[10px]">Gender / Age</span>
                <span className="font-bold text-brand-text">
                  {matchedFarmer.gender || 'N/A'}{matchedFarmer.age ? `, ${matchedFarmer.age}` : ''}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="flex bg-brand-border/30 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setFarmerTab('existing')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  farmerTab === 'existing' ? 'bg-brand-surface text-brand-primary shadow-xs' : 'text-brand-text-muted hover:text-brand-text'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Select Existing Customer</span>
              </button>
              <button
                type="button"
                onClick={() => setFarmerTab('new')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  farmerTab === 'new' ? 'bg-brand-surface text-brand-primary shadow-xs' : 'text-brand-text-muted hover:text-brand-text'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Register New Customer</span>
              </button>
            </div>

            {farmerTab === 'existing' ? (
              <div className="space-y-1 bg-brand-surface p-3 rounded-xl border border-brand-border">
                <label className="block text-[11px] font-bold text-brand-text">Search by Name or Mobile Number:</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-subtle pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search customer by name or mobile..."
                    value={farmerSearchInput}
                    onChange={(e) => setFarmerSearchInput(e.target.value)}
                    className="w-full h-9 pl-8 pr-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                  />
                </div>

                {farmerSearchInput.trim() && (
                  <div className="border border-brand-border rounded-xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-brand-border/60">
                    {searching ? (
                      <div className="p-3 flex items-center justify-center gap-2 text-[11px] text-brand-text-muted">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching…
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-3 text-center text-[11px] text-brand-text-muted">No matching registered customer found.</div>
                    ) : (
                      searchResults.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => attachFarmerToBill(f)}
                          className="w-full text-left p-2.5 bg-brand-surface hover:bg-brand-bg-subtle transition-colors cursor-pointer"
                        >
                          <span className="text-xs font-bold text-brand-text">{f.name}</span>
                          <div className="text-[10px] text-brand-text-muted mt-0.5">
                            {f.mobile} • {f.village}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSaveNewCustomer} className="space-y-3 bg-brand-surface p-3.5 rounded-xl border border-brand-border">
                {newCustomerError && (
                  <div className="p-2.5 rounded-lg bg-brand-danger-light border border-brand-danger-border text-brand-danger text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{newCustomerError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-brand-text">
                      Farmer Name <span className="text-brand-danger">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={newName}
                      onChange={(e) => {
                        setNewName(e.target.value)
                        if (newCustomerErrors.name) setNewCustomerErrors((prev) => ({ ...prev, name: '' }))
                      }}
                      className={`w-full h-8 px-2.5 text-xs rounded-lg border bg-brand-bg-subtle text-brand-text ${newCustomerErrors.name ? 'border-brand-danger' : 'border-brand-border'}`}
                    />
                    {newCustomerErrors.name && <p className="text-[10px] text-brand-danger font-medium">{newCustomerErrors.name}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-brand-text">
                      Mobile Number <span className="text-brand-danger">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      value={newMobile}
                      onChange={(e) => {
                        setNewMobile(e.target.value)
                        if (newCustomerErrors.mobile) setNewCustomerErrors((prev) => ({ ...prev, mobile: '' }))
                      }}
                      className={`w-full h-8 px-2.5 text-xs rounded-lg border bg-brand-bg-subtle text-brand-text ${newCustomerErrors.mobile ? 'border-brand-danger' : 'border-brand-border'}`}
                    />
                    {newCustomerErrors.mobile && <p className="text-[10px] text-brand-danger font-medium">{newCustomerErrors.mobile}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-brand-text">
                    Village <span className="text-brand-danger">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Athani"
                    value={newVillage}
                    onChange={(e) => {
                      setNewVillage(e.target.value)
                      if (newCustomerErrors.village) setNewCustomerErrors((prev) => ({ ...prev, village: '' }))
                    }}
                    className={`w-full h-8 px-2.5 text-xs rounded-lg border bg-brand-bg-subtle text-brand-text ${newCustomerErrors.village ? 'border-brand-danger' : 'border-brand-border'}`}
                  />
                  {newCustomerErrors.village && <p className="text-[10px] text-brand-danger font-medium">{newCustomerErrors.village}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-brand-text">Gender</label>
                    <select value={newGender} onChange={(e) => setNewGender(e.target.value)} className="w-full h-8 px-2.5 text-xs rounded-lg border border-brand-border bg-brand-bg-subtle text-brand-text">
                      <option value="">Select…</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-brand-text">Age</label>
                    <input type="number" min="1" max="119" placeholder="e.g. 42" value={newAge} onChange={(e) => setNewAge(e.target.value)} className="w-full h-8 px-2.5 text-xs rounded-lg border border-brand-border bg-brand-bg-subtle text-brand-text" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-brand-text">Cattle Count</label>
                    <input type="number" min="0" placeholder="e.g. 4" value={newCattleCount} onChange={(e) => setNewCattleCount(e.target.value)} className="w-full h-8 px-2.5 text-xs rounded-lg border border-brand-border bg-brand-bg-subtle text-brand-text" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={newCustomerSubmitting}
                  className="w-full h-9 mt-1 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-extrabold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{newCustomerSubmitting ? 'Registering…' : 'Register & Attach Customer'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* PRODUCT ADDITION */}
      <div className="space-y-3 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-4 space-y-1">
            <label className="block text-[11px] font-semibold text-brand-text">Category Filter</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setSelectedProductId('')
              }}
              className="w-full h-9 px-2.5 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
            >
              <option value="All Categories">All Categories</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-8 space-y-1">
            <label className="block text-[11px] font-semibold text-brand-text">
              Select Product <span className="text-brand-danger">*</span>
            </label>
            <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="w-full h-9 px-2.5 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text">
              <option value="">Select a product from inventory catalog</option>
              {filteredCatalogProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ₹{p.sellingPrice}/{p.unit} ({p.stockQty} in stock)
                </option>
              ))}
            </select>
          </div>
        </div>

        {products.length === 0 && (
          <div className="p-3 rounded-xl bg-brand-warning-light border border-brand-warning-border text-brand-warning-dark text-xs">No products registered in Product &amp; Inventory catalog yet.</div>
        )}

        {currentSelectedProduct && (
          <div className="p-3 rounded-xl bg-brand-primary-light/50 border border-brand-primary/20 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-xs">
            <div>
              <span className="text-[10px] text-brand-text-muted block">Selling Price per Unit</span>
              <span className="font-extrabold text-brand-primary text-sm">
                ₹{currentSelectedProduct.sellingPrice} / {currentSelectedProduct.unit}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-brand-text-muted block">Available Stock</span>
              <span className="font-bold text-brand-text">
                {currentSelectedProduct.stockQty} {currentSelectedProduct.unit}
              </span>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-brand-text">Quantity ({currentSelectedProduct.unit})</label>
              <input
                type="number"
                min="0.001"
                step="0.001"
                max={currentSelectedProduct.stockQty}
                placeholder="Qty"
                value={inputQuantity}
                onChange={(e) => setInputQuantity(e.target.value)}
                className="w-full h-8 px-2.5 text-xs font-bold rounded-lg border border-brand-border bg-brand-surface text-brand-text"
              />
            </div>
          </div>
        )}

        {currentSelectedProduct && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-brand-text">
              Line Total: <span className="text-brand-primary">₹{lineItemPreviewTotal.toLocaleString('en-IN')}</span>
            </span>
            <button type="button" onClick={handleAddItemToBill} className="h-8 px-4 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item to Bill</span>
            </button>
          </div>
        )}
      </div>

      {/* BILL DRAFT */}
      <div className="space-y-2 pt-2 border-t border-brand-border/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-brand-text uppercase tracking-wider">Bill Line Items ({billDraftItems.length})</span>
          {billDraftItems.length > 0 && (
            <button type="button" onClick={handleClearBillDraft} className="text-[11px] text-brand-danger hover:underline cursor-pointer">
              Clear Bill
            </button>
          )}
        </div>

        {billDraftItems.length === 0 ? (
          <div className="p-6 text-center text-xs text-brand-text-muted border border-dashed border-brand-border rounded-xl space-y-1">
            <ShoppingBag className="w-5 h-5 mx-auto text-brand-text-subtle" />
            <p className="font-semibold text-brand-text">No items added to bill yet</p>
            <p>Select a product and quantity above to add items to this customer transaction.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-brand-border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-brand-bg-subtle border-b border-brand-border text-brand-text-muted text-[10px] uppercase font-bold">
                  <th className="py-2 px-3">Product Name</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Selling Price</th>
                  <th className="py-2 px-3 text-right">Line Total</th>
                  <th className="py-2 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {billDraftItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-brand-bg-subtle">
                    <td className="py-2 px-3 font-semibold text-brand-text">
                      {item.productName}
                      <span className="block text-[10px] text-brand-text-muted font-normal">{item.category}</span>
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-brand-text">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-2 px-3 text-right text-brand-text-muted">₹{item.unitPrice}</td>
                    <td className="py-2 px-3 text-right font-bold text-brand-primary">₹{item.lineTotal.toLocaleString('en-IN')}</td>
                    <td className="py-2 px-2 text-center">
                      <button type="button" onClick={() => handleRemoveDraftItem(idx)} className="p-1 hover:bg-brand-danger-light text-brand-danger rounded-md cursor-pointer transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {billDraftItems.length > 0 && (
        <form onSubmit={handleGenerateBill} className="p-3.5 rounded-xl bg-brand-bg-subtle border border-brand-border space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] text-brand-text-muted uppercase font-bold">Total Bill Amount</span>
            <div className="text-right">
              <span className="text-xl font-extrabold text-brand-primary">₹{totalBillAmount.toLocaleString('en-IN')}</span>
              <span className="block text-[10px] text-brand-text-subtle">
                {billDraftItems.length} items • {totalBillQuantity} total units
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-brand-border/60 flex justify-end">
            <button type="submit" disabled={saleSubmitting} className="h-10 px-6 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60">
              <Receipt className="w-4 h-4" />
              <span>{saleSubmitting ? 'Recording…' : 'Generate Bill & Update Stock'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  )
})

export default BillingPanel
