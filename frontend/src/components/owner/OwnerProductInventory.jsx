import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Package, Plus, AlertTriangle, Search, Edit2, PieChart as PieChartIcon, X, CheckCircle2, Truck, Loader2, AlertCircle } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { getChartTheme } from '../../lib/newPages/chartColors'
import { getOwnerProducts, addProduct, updateProductPrices, recordProcurement, PRODUCT_CATEGORIES } from '../../lib/queries/ownerProducts'
import { getLocalToday } from '../../utils/date'

const CATEGORY_COLORS = ['#174F3A', '#22C55E', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']

export default function OwnerProductInventory() {
  const { ruralMartId, refreshKey: layoutRefreshKey } = useOutletContext()
  const chartTheme = getChartTheme()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [localRefresh, setLocalRefresh] = useState(0)
  const [tableSearch, setTableSearch] = useState('')
  const [toastMessage, setToastMessage] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const result = await getOwnerProducts(ruralMartId)
        if (isMounted) setProducts(result)
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load products.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (ruralMartId) load()
    return () => {
      isMounted = false
    }
  }, [ruralMartId, layoutRefreshKey, localRefresh])

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const categoryShareData = useMemo(() => {
    if (products.length === 0) return []
    const counts = {}
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + p.purchasePrice * p.stockQty
    })
    const totalVal = Object.values(counts).reduce((a, b) => a + b, 0)
    if (totalVal === 0) return []
    return Object.entries(counts).map(([name, val], idx) => ({
      name,
      percentage: Math.round((val / totalVal) * 100),
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    }))
  }, [products])

  // No reorder-level column exists in the schema, so "Low Stock" (a
  // threshold below full) isn't something we can honestly compute - only
  // "Out of Stock" (qty <= 0) is unambiguous from real data.
  const outOfStockItems = useMemo(() => products.filter((p) => p.stockQty <= 0), [products])

  const topSellingProduct = useMemo(() => {
    if (products.length === 0) return null
    const sorted = [...products].sort((a, b) => b.soldQty - a.soldQty)
    return sorted[0]?.soldQty > 0 ? sorted[0] : null
  }, [products])

  const totalStockValue = useMemo(() => products.reduce((acc, p) => acc + p.inventoryValue, 0), [products])

  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [addName, setAddName] = useState('')
  const [addCategory, setAddCategory] = useState(PRODUCT_CATEGORIES[0])
  const [addUnit, setAddUnit] = useState('')
  const [addPurchasePrice, setAddPurchasePrice] = useState('')
  const [addSellingPrice, setAddSellingPrice] = useState('')
  const [addSubmitting, setAddSubmitting] = useState(false)
  const [addError, setAddError] = useState('')

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editPurchasePrice, setEditPurchasePrice] = useState('')
  const [editSellingPrice, setEditSellingPrice] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState('')

  const [isProcureModalOpen, setIsProcureModalOpen] = useState(false)
  const [procureProductId, setProcureProductId] = useState('')
  const [procureQty, setProcureQty] = useState('')
  const [procureCost, setProcureCost] = useState('')
  const [procureSupplier, setProcureSupplier] = useState('')
  const [procureDate, setProcureDate] = useState(getLocalToday())
  const [procureSubmitting, setProcureSubmitting] = useState(false)
  const [procureError, setProcureError] = useState('')

  const resetAddForm = () => {
    setAddName('')
    setAddCategory(PRODUCT_CATEGORIES[0])
    setAddUnit('')
    setAddPurchasePrice('')
    setAddSellingPrice('')
    setAddError('')
  }

  const handleAddProductSubmit = async (e) => {
    e.preventDefault()
    if (!addName.trim() || !addUnit.trim()) return
    setAddSubmitting(true)
    setAddError('')
    try {
      await addProduct({
        ruralMartId,
        category: addCategory,
        name: addName.trim(),
        unit: addUnit.trim(),
        purchasePrice: Number(addPurchasePrice) || 0,
        sellingPrice: Number(addSellingPrice) || 0,
      })
      setIsAddProductOpen(false)
      resetAddForm()
      setLocalRefresh((k) => k + 1)
      triggerToast(`"${addName.trim()}" added to inventory catalog!`)
    } catch (err) {
      setAddError(err.message || 'Failed to add product.')
    } finally {
      setAddSubmitting(false)
    }
  }

  const handleOpenEdit = (prd) => {
    setEditingProduct(prd)
    setEditPurchasePrice(String(prd.purchasePrice))
    setEditSellingPrice(String(prd.sellingPrice))
    setEditError('')
    setIsEditModalOpen(true)
  }

  const handleEditProductSubmit = async (e) => {
    e.preventDefault()
    if (!editingProduct) return
    setEditSubmitting(true)
    setEditError('')
    try {
      await updateProductPrices(editingProduct.id, {
        purchasePrice: Number(editPurchasePrice) || 0,
        sellingPrice: Number(editSellingPrice) || 0,
      })
      setIsEditModalOpen(false)
      setEditingProduct(null)
      setLocalRefresh((k) => k + 1)
      triggerToast(`"${editingProduct.name}" prices updated.`)
    } catch (err) {
      setEditError(err.message || 'Failed to update product.')
    } finally {
      setEditSubmitting(false)
    }
  }

  const resetProcureForm = () => {
    setProcureProductId('')
    setProcureQty('')
    setProcureCost('')
    setProcureSupplier('')
    setProcureDate(getLocalToday())
    setProcureError('')
  }

  const handleProcureSubmit = async (e) => {
    e.preventDefault()
    if (!procureProductId || !procureQty || !procureCost) return
    setProcureSubmitting(true)
    setProcureError('')
    try {
      await recordProcurement({
        ruralMartId,
        productId: procureProductId,
        quantity: Number(procureQty),
        cost: Number(procureCost),
        supplierName: procureSupplier.trim(),
        procurementDate: procureDate,
      })
      setIsProcureModalOpen(false)
      resetProcureForm()
      setLocalRefresh((k) => k + 1)
      triggerToast('Procurement recorded and stock updated.')
    } catch (err) {
      setProcureError(err.message || 'Failed to record procurement.')
    } finally {
      setProcureSubmitting(false)
    }
  }

  const effectiveSearch = tableSearch.toLowerCase().trim()
  const filteredProducts = products.filter((p) => {
    if (!effectiveSearch) return true
    return p.name.toLowerCase().includes(effectiveSearch) || p.category.toLowerCase().includes(effectiveSearch)
  })

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-brand-text-muted gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Loading products…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-xl bg-brand-danger-light border border-brand-danger-border text-brand-danger text-sm">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-lg border border-white/20 flex items-center justify-between transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-brand-surface border border-brand-border rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-brand-text-muted uppercase block mb-0.5">
            ACTIVE BUSINESS DATE: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
          </span>
          <h1 className="text-xl font-bold text-brand-text">Product-wise Sales &amp; Inventory</h1>
          <p className="text-xs text-brand-text-muted">Manage your catalog, record procurement, and adjust pricing.</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsProcureModalOpen(true)}
            className="h-9 px-4 bg-brand-surface hover:bg-brand-bg-subtle border border-brand-border text-brand-text text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Truck className="w-4 h-4" />
            <span>Record Procurement</span>
          </button>
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="h-9 px-4 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card-enterprise p-4 space-y-2">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">TOP SELLING PRODUCT</span>
          <div>
            <h3 className="text-sm font-bold text-brand-text">{topSellingProduct ? topSellingProduct.name : 'No sales recorded'}</h3>
            <div className="text-xl font-extrabold text-brand-text mt-0.5">₹{(topSellingProduct?.revenue ?? 0).toLocaleString('en-IN')}</div>
          </div>
          <div className="text-[11px] font-semibold text-brand-success flex items-center gap-1">
            <span>{topSellingProduct ? `${topSellingProduct.soldQty} ${topSellingProduct.unit} sold` : 'No sales recorded'}</span>
          </div>
        </div>

        <div className="card-enterprise p-4 space-y-2">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">STOCK VALUE</span>
          <div>
            <div className="text-xl font-extrabold text-brand-text">₹{totalStockValue.toLocaleString('en-IN')}</div>
            <div className="text-[11px] font-semibold text-brand-success flex items-center gap-1 mt-0.5">
              <span>{products.length} Active Catalog SKUs</span>
            </div>
          </div>
          <p className="text-[11px] text-brand-text-muted font-medium border-t border-brand-border/60 pt-2">Purchase price × current stock, across all products</p>
        </div>

        <div className="card-enterprise p-4 space-y-2">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">OUT OF STOCK</span>
          <div>
            <div className="text-xl font-extrabold text-brand-text">{outOfStockItems.length}</div>
            <div className="text-[11px] font-semibold text-brand-warning flex items-center gap-1 mt-0.5">
              <span>{outOfStockItems.length > 0 ? 'Needs procurement' : 'All products in stock'}</span>
            </div>
          </div>
          <p className="text-[11px] text-brand-text-muted font-medium border-t border-brand-border/60 pt-2">Products with zero or negative stock</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 space-y-4">
          <div className="card-enterprise p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-brand-primary" />
                <h2 className="text-sm font-bold text-brand-text uppercase tracking-wider">CATEGORY SHARE</h2>
              </div>
            </div>

            {categoryShareData.length === 0 ? (
              <div className="text-xs text-brand-text-muted italic py-8 text-center">No category data</div>
            ) : (
              <>
                <div className="relative h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryShareData} cx="50%" cy="50%" outerRadius={75} innerRadius={0} dataKey="percentage">
                        {categoryShareData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderColor: chartTheme.tooltipBorder, color: chartTheme.tooltipTextColor, borderRadius: '8px', fontSize: '11px' }}
                        formatter={(val, name) => [`${val}%`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 pt-1 border-t border-brand-border/60">
                  {categoryShareData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-brand-bg-subtle text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-brand-text">{item.name}</span>
                      </div>
                      <span className="font-bold text-brand-text">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="card-enterprise p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-brand-border/60 pb-2.5">
              <AlertTriangle className="w-4 h-4 text-brand-warning" />
              <h2 className="text-sm font-bold text-brand-text uppercase tracking-wider">OUT OF STOCK</h2>
            </div>

            <div className="space-y-2 text-xs">
              {outOfStockItems.length === 0 ? (
                <div className="p-3 text-xs text-brand-text-muted italic text-center">No out-of-stock products</div>
              ) : (
                outOfStockItems.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-brand-text">{item.name}</h3>
                      <p className="text-[11px] text-brand-text-muted">{item.stockQty} {item.unit} in stock</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-warning-light text-brand-warning-dark">Procure Soon</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 card-enterprise p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-primary" />
              <h2 className="text-sm font-bold text-brand-text uppercase tracking-wider">ACTIVE INVENTORY &amp; SALES CATALOG</h2>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-subtle" />
              <input
                type="text"
                placeholder="Search products, categories..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-border text-brand-text-muted font-semibold text-[11px]">
                  <th className="pb-2.5">PRODUCT NAME</th>
                  <th className="pb-2.5">CATEGORY</th>
                  <th className="pb-2.5 text-right">PURCHASE PRICE</th>
                  <th className="pb-2.5 text-right">SELLING PRICE</th>
                  <th className="pb-2.5 text-center">IN STOCK</th>
                  <th className="pb-2.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-brand-bg-subtle transition-colors">
                    <td className="py-2.5 font-bold text-brand-text">{p.name}</td>
                    <td className="py-2.5 text-brand-text-muted">
                      <span className="px-2 py-0.5 rounded-md bg-brand-primary-light text-brand-primary font-semibold text-[10px]">{p.category}</span>
                    </td>
                    <td className="py-2.5 text-right text-brand-text-muted">₹{p.purchasePrice.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 text-right font-bold text-brand-text">₹{p.sellingPrice.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${p.stockQty <= 0 ? 'bg-brand-warning-light text-brand-warning-dark' : 'bg-brand-success-light text-brand-success'}`}>
                        {p.stockQty} {p.unit}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="h-7 px-3 bg-brand-surface hover:bg-brand-primary-light border border-brand-border text-brand-primary text-[11px] font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Prices</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-brand-text-muted">
                      No products match your search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-brand-text/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-primary" />
                  <span>Add New Catalog Product</span>
                </h3>
                <p className="text-[11px] text-brand-text-muted">Create a new item entry in your active inventory catalog.</p>
              </div>
              <button
                onClick={() => {
                  setIsAddProductOpen(false)
                  resetAddForm()
                }}
                className="text-brand-text-subtle hover:text-brand-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-3">
              {addError && (
                <div className="p-2.5 rounded-lg bg-brand-danger-light border border-brand-danger-border text-brand-danger text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Product Name <span className="text-brand-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cattle Feed Supplement"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Category <span className="text-brand-danger">*</span>
                </label>
                <select value={addCategory} onChange={(e) => setAddCategory(e.target.value)} className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text">
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Unit <span className="text-brand-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. kg, litre, piece, bag"
                  value={addUnit}
                  onChange={(e) => setAddUnit(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-text">
                    Purchase Price (₹) <span className="text-brand-danger">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="350"
                    value={addPurchasePrice}
                    onChange={(e) => setAddPurchasePrice(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-text">
                    Selling Price (₹) <span className="text-brand-danger">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="450"
                    value={addSellingPrice}
                    onChange={(e) => setAddSellingPrice(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                  />
                </div>
              </div>

              <p className="text-[11px] text-brand-text-muted italic">New products start with zero stock — use "Record Procurement" to add opening stock.</p>

              <div className="pt-3 flex justify-end gap-2 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddProductOpen(false)
                    resetAddForm()
                  }}
                  className="h-9 px-4 rounded-xl border border-brand-border text-xs font-semibold hover:bg-brand-bg-subtle cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSubmitting}
                  className="h-9 px-5 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
                >
                  {addSubmitting ? 'Adding…' : '+ Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-brand-text/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-brand-primary" />
                  <span>Edit Pricing</span>
                </h3>
                <p className="text-[11px] font-medium text-brand-text-muted">
                  {editingProduct.name} • {editingProduct.category}
                </p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-brand-text-subtle hover:text-brand-text cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProductSubmit} className="space-y-3">
              {editError && (
                <div className="p-2.5 rounded-lg bg-brand-danger-light border border-brand-danger-border text-brand-danger text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-text">
                    Purchase Price (₹) <span className="text-brand-danger">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={editPurchasePrice}
                    onChange={(e) => setEditPurchasePrice(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-text">
                    Selling Price (₹) <span className="text-brand-danger">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={editSellingPrice}
                    onChange={(e) => setEditSellingPrice(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-brand-border/60">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="h-9 px-4 rounded-xl border border-brand-border text-xs font-semibold hover:bg-brand-bg-subtle cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={editSubmitting} className="h-9 px-5 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60">
                  {editSubmitting ? 'Saving…' : 'Save Prices'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isProcureModalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-text/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-primary" />
                  <span>Record Procurement</span>
                </h3>
                <p className="text-[11px] text-brand-text-muted">Log a new stock purchase batch. This updates the product's current stock.</p>
              </div>
              <button
                onClick={() => {
                  setIsProcureModalOpen(false)
                  resetProcureForm()
                }}
                className="text-brand-text-subtle hover:text-brand-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcureSubmit} className="space-y-3">
              {procureError && (
                <div className="p-2.5 rounded-lg bg-brand-danger-light border border-brand-danger-border text-brand-danger text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{procureError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Product <span className="text-brand-danger">*</span>
                </label>
                <select
                  required
                  value={procureProductId}
                  onChange={(e) => setProcureProductId(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                >
                  <option value="">Select a product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-text">
                    Quantity <span className="text-brand-danger">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0.001"
                    step="0.001"
                    value={procureQty}
                    onChange={(e) => setProcureQty(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-text">
                    Total Cost (₹) <span className="text-brand-danger">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={procureCost}
                    onChange={(e) => setProcureCost(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">Supplier Name</label>
                <input
                  type="text"
                  placeholder="e.g. Agro Care Pvt. Ltd."
                  value={procureSupplier}
                  onChange={(e) => setProcureSupplier(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Procurement Date <span className="text-brand-danger">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={procureDate}
                  onChange={(e) => setProcureDate(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsProcureModalOpen(false)
                    resetProcureForm()
                  }}
                  className="h-9 px-4 rounded-xl border border-brand-border text-xs font-semibold hover:bg-brand-bg-subtle cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={procureSubmitting || products.length === 0}
                  className="h-9 px-5 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
                >
                  {procureSubmitting ? 'Recording…' : 'Record Procurement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
