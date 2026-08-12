import { useMemo, useState } from 'react'
import { Package, Plus, AlertTriangle, Search, Edit2, PieChart as PieChartIcon, X, CheckCircle2 } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { getChartTheme } from '../../lib/newPages/chartColors'
import { getProductsByRuralMart, saveProduct, updateProduct } from '../../lib/newPages/shared/dataServices'
import { getStoredSession } from '../../lib/newPages/storageService'

// Fixed categorical palette for the pie chart - not tied to a single semantic token,
// each entry is a distinct product category color.
const CATEGORY_COLORS = ['#174F3A', '#22C55E', '#3B82F6', '#F59E0B', '#8B5CF6']

export default function OwnerProductInventory() {
  const chartTheme = getChartTheme()

  const session = getStoredSession()
  const ruralMartId = session?.ruralMartId || session?.email || ''

  const [products, setProducts] = useState(() => {
    if (!ruralMartId) return []
    const canonical = getProductsByRuralMart(ruralMartId)
    if (canonical && canonical.length > 0) {
      return canonical.map((cp) => ({
        id: cp.id,
        code: cp.code,
        name: cp.name,
        category: cp.category,
        supplier: cp.supplier || 'N/A',
        price: cp.sellingPrice,
        stockQty: cp.stockQty,
        unit: cp.unit || 'units',
        isLowStock: cp.status === 'Low Stock' || cp.stockQty <= (cp.reorderLevel || 35),
      }))
    }
    return []
  })
  const [tableSearch, setTableSearch] = useState('')

  const categoryShareData = useMemo(() => {
    if (products.length === 0) return []
    const counts = {}
    products.forEach((p) => {
      const cat = p.category || 'Others'
      counts[cat] = (counts[cat] || 0) + p.price * p.stockQty
    })
    const totalVal = Object.values(counts).reduce((a, b) => a + b, 0)
    if (totalVal === 0) return []
    return Object.entries(counts).map(([name, val], idx) => ({
      name,
      percentage: Math.round((val / totalVal) * 100),
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    }))
  }, [products])

  const lowStockItems = useMemo(() => products.filter((p) => p.isLowStock || p.stockQty <= 35), [products])

  const [toastMessage, setToastMessage] = useState(null)

  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [addName, setAddName] = useState('')
  const [addCategory, setAddCategory] = useState('Feed')
  const [addSupplier, setAddSupplier] = useState('')
  const [addPrice, setAddPrice] = useState('')
  const [addStock, setAddStock] = useState('')

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState('Feed')
  const [editSupplier, setEditSupplier] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editStock, setEditStock] = useState('')

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleAddProductSubmit = (e) => {
    e.preventDefault()
    if (!addName.trim()) return

    const priceVal = Number(addPrice) || 0
    const stockVal = Number(addStock) || 0

    const newPrdCode = `PRD-0${products.length + 1}`
    const newPrdId = `prd-${Date.now()}`
    const supplierVal = addSupplier.trim() || 'N/A'
    const newProduct = {
      id: newPrdId,
      code: newPrdCode,
      name: addName.trim(),
      category: addCategory,
      supplier: supplierVal,
      price: priceVal,
      stockQty: stockVal,
      unit: 'units',
      isLowStock: stockVal <= 35,
    }

    saveProduct({
      id: newPrdId,
      ruralMartId: 'RM-001',
      code: newPrdCode,
      name: addName.trim(),
      category: addCategory,
      district: 'Erode',
      supplier: supplierVal,
      costPrice: Math.round(priceVal * 0.85),
      sellingPrice: priceVal,
      stockQty: stockVal,
      unit: 'units',
      reorderLevel: 35,
      status: stockVal === 0 ? 'Out of Stock' : stockVal <= 35 ? 'Low Stock' : 'Healthy',
      lastRestocked: 'Today',
      salesQty: 0,
      procurementQty: stockVal,
      inventoryValue: stockVal * priceVal,
    })

    setProducts((prev) => [newProduct, ...prev])
    setIsAddProductOpen(false)
    triggerToast(`"${addName.trim()}" added to inventory catalog!`)

    setAddName('')
    setAddCategory('Feed')
    setAddSupplier('')
    setAddPrice('')
    setAddStock('')
  }

  const handleOpenEdit = (prd) => {
    setEditingProduct(prd)
    setEditName(prd.name)
    setEditCategory(prd.category)
    setEditSupplier(prd.supplier)
    setEditPrice(String(prd.price))
    setEditStock(String(prd.stockQty))
    setIsEditModalOpen(true)
  }

  const handleEditProductSubmit = (e) => {
    e.preventDefault()
    if (!editingProduct) return

    const priceVal = Number(editPrice) || 0
    const stockVal = Number(editStock) || 0
    const updatedName = editName.trim() || editingProduct.name
    const updatedSupplier = editSupplier.trim() || editingProduct.supplier

    updateProduct(editingProduct.id, {
      name: updatedName,
      category: editCategory,
      supplier: updatedSupplier,
      sellingPrice: priceVal,
      stockQty: stockVal,
      status: stockVal === 0 ? 'Out of Stock' : stockVal <= 35 ? 'Low Stock' : 'Healthy',
      inventoryValue: stockVal * priceVal,
    })

    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingProduct.id
          ? { ...p, name: updatedName, category: editCategory, supplier: updatedSupplier, price: priceVal, stockQty: stockVal, isLowStock: stockVal <= 35 }
          : p
      )
    )

    setIsEditModalOpen(false)
    setEditingProduct(null)
    triggerToast(`"${updatedName}" updated successfully.`)
  }

  const effectiveSearch = tableSearch.toLowerCase().trim()
  const filteredProducts = products.filter((p) => {
    if (!effectiveSearch) return true
    return (
      p.name.toLowerCase().includes(effectiveSearch) ||
      p.category.toLowerCase().includes(effectiveSearch) ||
      p.supplier.toLowerCase().includes(effectiveSearch) ||
      p.code.toLowerCase().includes(effectiveSearch)
    )
  })

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
          <p className="text-xs text-brand-text-muted">Analyze product performance, manage stock distributions, and adjust pricing.</p>
        </div>

        <button
          onClick={() => setIsAddProductOpen(true)}
          className="h-9 px-4 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Product</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card-enterprise p-4 space-y-2">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">TOP SELLING PRODUCT</span>
          <div>
            <h3 className="text-sm font-bold text-brand-text">{products.length > 0 ? products[0].name : 'No product data'}</h3>
            <div className="text-xl font-extrabold text-brand-text mt-0.5">
              {products.length > 0 ? `₹${(products[0].price * products[0].stockQty).toLocaleString('en-IN')}` : '₹0'}
            </div>
          </div>
          <div className="text-[11px] font-semibold text-brand-success flex items-center gap-1">
            <span>{products.length > 0 ? 'Top Stock Item' : 'No sales recorded'}</span>
          </div>
        </div>

        <div className="card-enterprise p-4 space-y-2">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">STOCK VALUE</span>
          <div>
            <div className="text-xl font-extrabold text-brand-text">
              ₹{products.reduce((acc, p) => acc + p.price * p.stockQty, 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] font-semibold text-brand-success flex items-center gap-1 mt-0.5">
              <span>{products.length} Active Catalog SKUs</span>
            </div>
          </div>
          <p className="text-[11px] text-brand-text-muted font-medium border-t border-brand-border/60 pt-2">
            {products.length > 0 ? 'Dynamic Category Inventory' : 'No inventory records found'}
          </p>
        </div>

        <div className="card-enterprise p-4 space-y-2">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">SUPPLIER INVENTORY VALUE</span>
          <div>
            <div className="text-xl font-extrabold text-brand-text">
              ₹{products.reduce((acc, p) => acc + p.price * p.stockQty, 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] font-semibold text-brand-success flex items-center gap-1 mt-0.5">
              <span>{Array.from(new Set(products.map((p) => p.supplier))).filter((s) => s && s !== 'N/A').length} Active Suppliers</span>
            </div>
          </div>
          <p className="text-[11px] text-brand-text-muted font-medium border-t border-brand-border/60 pt-2">
            {products.length > 0 ? 'Supplier Inventory Breakdown' : 'No supplier data available'}
          </p>
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
                        contentStyle={{
                          backgroundColor: chartTheme.tooltipBg,
                          borderColor: chartTheme.tooltipBorder,
                          color: chartTheme.tooltipTextColor,
                          borderRadius: '8px',
                          fontSize: '11px',
                        }}
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
              <h2 className="text-sm font-bold text-brand-text uppercase tracking-wider">STOCK ALERTS &amp; FAST MOVERS</h2>
            </div>

            <div className="space-y-2 text-xs">
              {lowStockItems.length === 0 ? (
                <div className="p-3 text-xs text-brand-text-muted italic text-center">No stock alerts</div>
              ) : (
                lowStockItems.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-brand-text">{item.name}</h3>
                      <p className="text-[11px] text-brand-text-muted">Only {item.stockQty} {item.unit || 'units'} remaining</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-warning-light text-brand-warning-dark">
                      Reorder Soon
                    </span>
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
                placeholder="Search products, suppliers..."
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
                  <th className="pb-2.5">SUPPLIER</th>
                  <th className="pb-2.5 text-right">PRICE</th>
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
                    <td className="py-2.5 text-brand-text-muted">{p.supplier}</td>
                    <td className="py-2.5 text-right font-bold text-brand-text">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isLowStock || p.stockQty <= 35 ? 'bg-brand-warning-light text-brand-warning-dark' : 'bg-brand-success-light text-brand-success'
                        }`}
                      >
                        {p.stockQty} {p.unit || 'units'}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="h-7 px-3 bg-brand-surface hover:bg-brand-primary-light border border-brand-border text-brand-primary text-[11px] font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
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
              <button onClick={() => setIsAddProductOpen(false)} className="text-brand-text-subtle hover:text-brand-text cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Product Name <span className="text-brand-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bio-Organic Growth Promoter"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Category <span className="text-brand-danger">*</span>
                </label>
                <select
                  value={addCategory}
                  onChange={(e) => setAddCategory(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                >
                  <option value="Feed">Feed</option>
                  <option value="Minerals">Minerals</option>
                  <option value="Organic Fertilizers">Organic Fertilizers</option>
                  <option value="Equip">Equip</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">Supplier Name</label>
                <input
                  type="text"
                  placeholder="e.g. Agro Care Pvt. Ltd."
                  value={addSupplier}
                  onChange={(e) => setAddSupplier(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-text">
                    Unit Selling Price (₹) <span className="text-brand-danger">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="450"
                    value={addPrice}
                    onChange={(e) => setAddPrice(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-text">Initial Opening Stock (Units)</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={addStock}
                    onChange={(e) => setAddStock(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="h-9 px-4 rounded-xl border border-brand-border text-xs font-semibold hover:bg-brand-bg-subtle cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  + Add to Catalog
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
                  <span>Edit Stock &amp; Pricing</span>
                </h3>
                <p className="text-[11px] font-medium text-brand-text-muted">
                  {editingProduct.name} ({editingProduct.code}) • {editingProduct.category}
                </p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-brand-text-subtle hover:text-brand-text cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(editingProduct.isLowStock || Number(editStock) <= 35) && (
              <div className="p-2.5 rounded-xl bg-brand-warning-light border border-brand-warning-border text-brand-warning-dark text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-brand-warning shrink-0" />
                <span>Low Stock Alert — Reorder recommended</span>
              </div>
            )}

            <form onSubmit={handleEditProductSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Product Name <span className="text-brand-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Category <span className="text-brand-danger">*</span>
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                >
                  <option value="Feed">Feed</option>
                  <option value="Minerals">Minerals</option>
                  <option value="Organic Fertilizers">Organic Fertilizers</option>
                  <option value="Equip">Equip</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-text">Supplier Name</label>
                <input
                  type="text"
                  value={editSupplier}
                  onChange={(e) => setEditSupplier(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-text">
                    Unit Selling Price (₹) <span className="text-brand-danger">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-text">
                    Current Stock (Units) <span className="text-brand-danger">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="h-9 px-4 rounded-xl border border-brand-border text-xs font-semibold hover:bg-brand-bg-subtle cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save Inventory Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
