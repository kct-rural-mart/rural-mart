import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  Plus,
  AlertTriangle,
  Search,
  Edit2,
  PieChart as PieChartIcon,
  X,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  Eye,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { getChartTheme } from '../../shared/theme';
import {
  addOwnerProduct,
  deleteOwnerProduct,
  getOwnerProducts,
  PRODUCT_CATEGORIES,
  recordOwnerProcurement,
  updateOwnerProduct,
} from '../services/productService';

interface ProductInventoryPageProps {
  currentMartId?: string | null;
  theme: 'light' | 'dark';
  searchQuery: string;
}

export interface CatalogProduct {
  id: string;
  code: string;
  name: string;
  category: string;
  supplier: string;
  price: number;
  costPrice: number;
  stockQty: number;
  unit: string;
  procurementQty: number;
  procurementValue: number;
  openingStockQty: number;
  salesQty: number;
  salesValue: number;
  reorderLevel?: number;
  sellingPrice?: number;
  isLowStock?: boolean;
}

const CATEGORY_SUGGESTIONS: string[] = [...PRODUCT_CATEGORIES];

const UNIT_OPTIONS = [
  'kg',
  'gram',
  'litre',
  'ml',
  'piece',
  'bag',
  'packet',
  'box',
];

export const ProductInventoryPage: React.FC<ProductInventoryPageProps> = ({
  currentMartId,
  theme,
  searchQuery: externalSearchQuery,
}) => {
  const isDark = theme === 'dark';
  const chartTheme = getChartTheme(isDark);

    const ruralMartId = currentMartId || '';

  // Load Products from canonical store
  const [products, setProducts] = useState<CatalogProduct[]>([]);

  const loadProductsFromStore = async () => {
    if (!ruralMartId) {
      setProducts([]);
      return;
    }
    try {
      setProducts(await getOwnerProducts(ruralMartId));
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : 'Unable to load products.');
    }
  };

  useEffect(() => {
    void loadProductsFromStore();
  }, [ruralMartId]);

  const [tableSearch, setTableSearch] = useState<string>('');

  // Top metric computations
  const totalStockValue = useMemo(() => {
    return products.reduce((sum, p) => sum + p.price * p.stockQty, 0);
  }, [products]);

  const activeSuppliers = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      const sup = (p.supplier || '').trim();
      if (sup && sup.toLowerCase() !== 'n/a') {
        set.add(sup);
      }
    });
    return Array.from(set);
  }, [products]);

  const topSellingProduct = useMemo(() => {
    if (products.length === 0) return null;
    const sorted = [...products].sort((a, b) => {
      if (b.salesValue !== a.salesValue) return b.salesValue - a.salesValue;
      if (b.salesQty !== a.salesQty) return b.salesQty - a.salesQty;
      return (b.price * b.stockQty) - (a.price * a.stockQty);
    });
    return sorted[0];
  }, [products]);

  // Category Share Data
  const categoryShareData = useMemo(() => {
    if (products.length === 0) return [];
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.category || 'Others';
      counts[cat] = (counts[cat] || 0) + p.price * p.stockQty;
    });
    const totalVal = Object.values(counts).reduce((a, b) => a + b, 0);
    if (totalVal === 0) return [];
    const colors = ['#174F3A', '#22C55E', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];
    return Object.entries(counts).map(([name, val], idx) => ({
      name,
      percentage: Math.round((val / totalVal) * 100),
      color: colors[idx % colors.length],
    }));
  }, [products]);

  // Low stock items
  const lowStockItems = useMemo(() => {
    return products.filter((p) => p.isLowStock || p.stockQty <= 35);
  }, [products]);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // View & Delete Modal States
  const [viewProductItem, setViewProductItem] = useState<CatalogProduct | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<CatalogProduct | null>(null);

  const handleConfirmDeleteProduct = async () => {
    if (!deleteConfirmItem) return;
    try {
      await deleteOwnerProduct(deleteConfirmItem.id);
      await loadProductsFromStore();
      triggerToast(`Product "${deleteConfirmItem.name}" removed from the catalog.`);
      setDeleteConfirmItem(null);
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : 'Unable to remove the product.');
    }
  };

  // --- MODAL 1: ADD NEW CATALOG PRODUCT FORM STATE ---
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);
  const [addName, setAddName] = useState<string>('');
  const [addCategorySelect, setAddCategorySelect] = useState<string>('Feed');
  const [addCustomCategory, setAddCustomCategory] = useState<string>('');
  const [addSupplier, setAddSupplier] = useState<string>('');
  const [addProcurementQty, setAddProcurementQty] = useState<string>('');
  const [addUnitSelect, setAddUnitSelect] = useState<string>('kg');
  const [addCustomUnit, setAddCustomUnit] = useState<string>('');
  const [addProcurementPrice, setAddProcurementPrice] = useState<string>('');
  const [addSellingPrice, setAddSellingPrice] = useState<string>('');

  // Auto Calculations for Add Form
  const numProcQty = Math.max(0, Number(addProcurementQty) || 0);
  const numProcPrice = Math.max(0, Number(addProcurementPrice) || 0);
  const calculatedProcurementValue = numProcQty * numProcPrice;

  // Submit Add New Product
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;

    const sellPrice = Math.max(0, Number(addSellingPrice) || 0);
    const finalCategory =
      addCategorySelect === 'CUSTOM'
        ? 'Other'
        : addCategorySelect;
    const finalUnit =
      addUnitSelect === 'CUSTOM'
        ? addCustomUnit.trim() || 'units'
        : addUnitSelect;
    const supplierVal = addSupplier.trim();

    await addOwnerProduct({ ruralMartId, name: addName.trim(), category: finalCategory, unit: finalUnit, purchasePrice: numProcPrice, sellingPrice: sellPrice, openingQuantity: numProcQty, supplier: supplierVal });
    await loadProductsFromStore();
    setIsAddProductOpen(false);

    triggerToast(`"${addName.trim()}" added to inventory catalog!`);

    // Reset Form
    setAddName('');
    setAddCategorySelect('Feed');
    setAddCustomCategory('');
    setAddSupplier('');
    setAddProcurementQty('');
    setAddUnitSelect('kg');
    setAddCustomUnit('');
    setAddProcurementPrice('');
    setAddSellingPrice('');
  };

  // --- MODAL 2: EDIT PRODUCT STATE ---
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editCategorySelect, setEditCategorySelect] = useState<string>('Feed');
  const [editCustomCategory, setEditCustomCategory] = useState<string>('');
  const [editSupplier, setEditSupplier] = useState<string>('');
  const [editUnitSelect, setEditUnitSelect] = useState<string>('kg');
  const [editCustomUnit, setEditCustomUnit] = useState<string>('');
  const [editSellingPrice, setEditSellingPrice] = useState<string>('');

  const handleOpenEdit = (prd: CatalogProduct) => {
    setEditingProduct(prd);
    setEditName(prd.name);

    if (CATEGORY_SUGGESTIONS.includes(prd.category)) {
      setEditCategorySelect(prd.category);
      setEditCustomCategory('');
    } else {
      setEditCategorySelect('CUSTOM');
      setEditCustomCategory(prd.category);
    }

    setEditSupplier(prd.supplier);

    if (UNIT_OPTIONS.includes(prd.unit)) {
      setEditUnitSelect(prd.unit);
      setEditCustomUnit('');
    } else {
      setEditUnitSelect('CUSTOM');
      setEditCustomUnit(prd.unit);
    }

    setEditSellingPrice(String(prd.price));
    setIsEditModalOpen(true);
  };

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const sellPrice = Math.max(0, Number(editSellingPrice) || 0);
    const updatedName = editName.trim() || editingProduct.name;
    const finalCategory =
      editCategorySelect === 'CUSTOM'
        ? 'Other'
        : editCategorySelect;
    const finalUnit =
      editUnitSelect === 'CUSTOM'
        ? editCustomUnit.trim() || editingProduct.unit
        : editUnitSelect;
    const updatedSupplier = editSupplier.trim();

    await updateOwnerProduct(editingProduct.id, { name: updatedName, category: finalCategory, unit: finalUnit, sellingPrice: sellPrice });
    await loadProductsFromStore();
    setIsEditModalOpen(false);
    setEditingProduct(null);
    triggerToast(`"${updatedName}" updated successfully.`);
  };

  // --- MODAL 3: RESTOCK PRODUCT STATE ---
  const [isRestockOpen, setIsRestockOpen] = useState<boolean>(false);
  const [restockProductItem, setRestockProductItem] = useState<CatalogProduct | null>(null);
  const [restockQty, setRestockQty] = useState<string>('');
  const [restockPricePerUnit, setRestockPricePerUnit] = useState<string>('');

  const handleOpenRestock = (prd: CatalogProduct) => {
    setRestockProductItem(prd);
    setRestockQty('');
    setRestockPricePerUnit(String(prd.costPrice || ''));
    setIsRestockOpen(true);
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProductItem) return;

    const addQty = Math.max(0, Number(restockQty) || 0);
    const addCost = Math.max(0, Number(restockPricePerUnit) || 0);
    if (addQty === 0) return;

    await recordOwnerProcurement({ ruralMartId, productId: restockProductItem.id, quantity: addQty, pricePerUnit: addCost > 0 ? addCost : restockProductItem.costPrice, supplier: restockProductItem.supplier });
    await loadProductsFromStore();
    setIsRestockOpen(false);
    setRestockProductItem(null);
    triggerToast(`Procured +${addQty} ${restockProductItem.unit} of "${restockProductItem.name}". Opening Stock unchanged, Closing Stock updated.`);
  };

  // Filtered Table Data
  const effectiveSearch = (tableSearch || externalSearchQuery || '').toLowerCase().trim();
  const filteredProducts = products.filter((p) => {
    if (!effectiveSearch) return true;
    return (
      p.name.toLowerCase().includes(effectiveSearch) ||
      p.category.toLowerCase().includes(effectiveSearch) ||
      p.supplier.toLowerCase().includes(effectiveSearch) ||
      p.code.toLowerCase().includes(effectiveSearch)
    );
  });

  return (
    <div className="space-y-4">
      {/* Toast Notification Near Header */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#174F3A] text-white text-xs font-bold shadow-lg border border-emerald-500/30 flex items-center justify-between animate-fade-in transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#A3E6C5]" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-200 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-[#66736C] dark:text-[#8E9E96] uppercase block mb-0.5">
            ACTIVE BUSINESS DATE:{' '}
            {new Date()
              .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              .toUpperCase()}
          </span>
          <h1 className="text-xl font-bold text-[#17221D] dark:text-[#E6ECE8]">
            Product-wise Sales & Inventory
          </h1>
          <p className="text-xs text-[#66736C] dark:text-[#8E9E96]">
            Analyze product performance, manage stock distributions, and adjust pricing.
          </p>
        </div>

        <button
          onClick={() => setIsAddProductOpen(true)}
          className="h-9 px-4 bg-[#174F3A] hover:bg-[#103A2B] dark:bg-[#1B3D30] dark:hover:bg-[#234F3F] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Product</span>
        </button>
      </div>

      {/* THREE SUMMARY CARDS (Top Row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Top Selling Product */}
        <div className="card-enterprise p-4 space-y-2">
          <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase tracking-wider block">
            TOP SELLING PRODUCT
          </span>
          <div>
            <h3 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8]">
              {topSellingProduct ? topSellingProduct.name : 'No product data'}
            </h3>
            <div className="text-xl font-extrabold text-[#17221D] dark:text-[#E6ECE8] mt-0.5">
              {topSellingProduct
                ? topSellingProduct.salesValue > 0
                  ? `₹${topSellingProduct.salesValue.toLocaleString('en-IN')}`
                  : `₹${(topSellingProduct.price * topSellingProduct.stockQty).toLocaleString('en-IN')}`
                : '₹0'}
            </div>
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span>
              {topSellingProduct
                ? topSellingProduct.salesValue > 0
                  ? `${topSellingProduct.salesQty} ${topSellingProduct.unit} sold`
                  : 'Top Stock Item'
                : 'No sales recorded'}
            </span>
          </div>
        </div>

        {/* Card 2: Stock Value */}
        <div className="card-enterprise p-4 space-y-2">
          <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase tracking-wider block">
            STOCK VALUE
          </span>
          <div>
            <div className="text-xl font-extrabold text-[#17221D] dark:text-[#E6ECE8]">
              ₹{totalStockValue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
              <span>{products.length} Active Catalog SKUs</span>
            </div>
          </div>
          <p className="text-[11px] text-[#66736C] dark:text-[#8E9E96] font-medium border-t border-[#E9EFEB] dark:border-[#16241E] pt-2">
            {products.length > 0 ? 'Dynamic Category Inventory' : 'No inventory records found'}
          </p>
        </div>

        {/* Card 3: Supplier Inventory Value */}
        <div className="card-enterprise p-4 space-y-2">
          <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase tracking-wider block">
            SUPPLIER INVENTORY VALUE
          </span>
          <div>
            <div className="text-xl font-extrabold text-[#17221D] dark:text-[#E6ECE8]">
              ₹{totalStockValue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
              <span>{activeSuppliers.length} Active Suppliers</span>
            </div>
          </div>
          <p className="text-[11px] text-[#66736C] dark:text-[#8E9E96] font-medium border-t border-[#E9EFEB] dark:border-[#16241E] pt-2">
            {activeSuppliers.length > 0 ? 'Supplier Inventory Breakdown' : 'No supplier data available'}
          </p>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Category Share & Stock Alerts */}
        <div className="lg:col-span-5 space-y-4">
          {/* CATEGORY SHARE SECTION */}
          <div className="card-enterprise p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E9EFEB] dark:border-[#16241E] pb-2.5">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-[#174F3A] dark:text-[#8ECAAA]" />
                <h2 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase tracking-wider">
                  CATEGORY SHARE
                </h2>
              </div>
            </div>

            {categoryShareData.length === 0 ? (
              <div className="text-xs text-[#66736C] dark:text-[#8E9E96] italic py-8 text-center">
                No category data
              </div>
            ) : (
              <>
                <div className="relative h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryShareData}
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        innerRadius={0}
                        dataKey="percentage"
                      >
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
                        formatter={(val: any, name: any) => [`${val}%`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 pt-1 border-t border-[#E9EFEB] dark:border-[#16241E]">
                  {categoryShareData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAF7] dark:bg-[#16241E] text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-bold text-[#17221D] dark:text-[#E6ECE8]">
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* STOCK ALERTS & FAST MOVERS SECTION */}
          <div className="card-enterprise p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-[#E9EFEB] dark:border-[#16241E] pb-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h2 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase tracking-wider">
                STOCK ALERTS & FAST MOVERS
              </h2>
            </div>

            <div className="space-y-2 text-xs">
              {lowStockItems.length === 0 ? (
                <div className="p-3 text-xs text-[#66736C] dark:text-[#8E9E96] italic text-center">
                  No stock alerts
                </div>
              ) : (
                lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-[#17221D] dark:text-[#E6ECE8]">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-[#66736C] dark:text-[#8E9E96]">
                        Only {item.stockQty} {item.unit} remaining
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-[#3D2D10] dark:text-amber-300">
                      Reorder Soon
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Inventory & Sales Catalog Table */}
        <div className="lg:col-span-7 card-enterprise p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9EFEB] dark:border-[#16241E] pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#174F3A] dark:text-[#8ECAAA]" />
              <h2 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase tracking-wider">
                ACTIVE INVENTORY & SALES CATALOG
              </h2>
            </div>

            {/* Table Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A958F]" />
              <input
                type="text"
                placeholder="Search products, suppliers..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
              />
            </div>
          </div>

          {/* Catalog Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DDE6E0] dark:border-[#1E3129] text-[#66736C] dark:text-[#8E9E96] font-semibold text-[11px]">
                  <th className="pb-2.5">PRODUCT NAME</th>
                  <th className="pb-2.5">CATEGORY</th>
                  <th className="pb-2.5">SUPPLIER</th>
                  <th className="pb-2.5 text-right">PRICE</th>
                  <th className="pb-2.5 text-center">IN STOCK</th>
                  <th className="pb-2.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EFEB] dark:divide-[#16241E]">
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-[#F8FAF7] dark:hover:bg-[#16241E] transition-colors"
                  >
                    <td className="py-2.5 font-bold text-[#17221D] dark:text-[#E6ECE8]">
                      {p.name}
                    </td>
                    <td className="py-2.5 text-[#66736C] dark:text-[#8E9E96]">
                      <span className="px-2 py-0.5 rounded-md bg-[#E7F2EC] dark:bg-[#1B3D30] text-[#174F3A] dark:text-[#A3E6C5] font-semibold text-[10px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-2.5 text-[#66736C] dark:text-[#8E9E96]">
                      {p.supplier || '—'}
                    </td>
                    <td className="py-2.5 text-right font-bold text-[#17221D] dark:text-[#E6ECE8]">
                      ₹{p.price.toLocaleString('en-IN')}/{p.unit}
                    </td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isLowStock || p.stockQty <= 35
                            ? 'bg-amber-100 text-amber-800 dark:bg-[#3D2D10] dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-[#143825] dark:text-emerald-300'
                        }`}
                      >
                        {p.stockQty} {p.unit}
                      </span>
                    </td>
                    <td className="py-2.5 text-right space-x-1">
                      <button
                        onClick={() => setViewProductItem(p)}
                        className="h-7 px-2 bg-slate-100 dark:bg-[#1A2C23] hover:bg-slate-200 dark:hover:bg-[#233A2F] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="View Product Details"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => handleOpenRestock(p)}
                        className="h-7 px-2 bg-emerald-50 dark:bg-[#18382B] hover:bg-emerald-100 dark:hover:bg-[#204A39] border border-emerald-200 dark:border-emerald-800 text-[#174F3A] dark:text-[#A3E6C5] text-[11px] font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restock</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="h-7 px-2 bg-white dark:bg-[#121E19] hover:bg-[#E7F2EC] dark:hover:bg-[#182921] border border-[#DDE6E0] dark:border-[#1E3129] text-[#174F3A] dark:text-[#A3E6C5] text-[11px] font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => setDeleteConfirmItem(p)}
                        className="h-7 px-2 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-[11px] font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-xs text-[#66736C] dark:text-[#8E9E96]"
                    >
                      No products match your search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL 1: ADD NEW PRODUCT MODAL */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-[#17221D]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E9EFEB] dark:border-[#16241E] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
                  <span>Add New Catalog Product</span>
                </h3>
                <p className="text-[11px] text-[#66736C] dark:text-[#8E9E96]">
                  Register a new product with procurement details and selling price.
                </p>
              </div>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-3">
              {/* Product Information Section */}
              <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] space-y-3 border border-[#DDE6E0] dark:border-[#1E3129]">
                <h4 className="text-xs font-bold text-[#174F3A] dark:text-[#A3E6C5] uppercase tracking-wider">
                  1. Product Information
                </h4>

                {/* Product Name * */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rice Bran Cattle Feed"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8]"
                  />
                </div>

                {/* Category * */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={addCategorySelect}
                    onChange={(e) => setAddCategorySelect(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8]"
                  >
                    {CATEGORY_SUGGESTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="CUSTOM">+ Add Custom Category...</option>
                  </select>

                  {addCategorySelect === 'CUSTOM' && (
                    <input
                      type="text"
                      required
                      placeholder="Enter new custom category (e.g. Animal Nutrition)"
                      value={addCustomCategory}
                      onChange={(e) => setAddCustomCategory(e.target.value)}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-emerald-500 bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8] mt-1.5"
                    />
                  )}
                </div>

                {/* Supplier Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                    Supplier Name <span className="text-[10px] text-[#8A958F] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Green Valley Co-Op"
                    value={addSupplier}
                    onChange={(e) => setAddSupplier(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8]"
                  />
                </div>
              </div>

              {/* Inventory & Procurement Section */}
              <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] space-y-3 border border-[#DDE6E0] dark:border-[#1E3129]">
                <h4 className="text-xs font-bold text-[#174F3A] dark:text-[#A3E6C5] uppercase tracking-wider">
                  2. Inventory & Procurement
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {/* Procurement Quantity * */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                      Procurement Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 100"
                      value={addProcurementQty}
                      onChange={(e) => setAddProcurementQty(e.target.value)}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8]"
                    />
                  </div>

                  {/* Measurement Unit * */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={addUnitSelect}
                      onChange={(e) => setAddUnitSelect(e.target.value)}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8]"
                    >
                      {UNIT_OPTIONS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                      <option value="CUSTOM">+ Custom Unit...</option>
                    </select>

                    {addUnitSelect === 'CUSTOM' && (
                      <input
                        type="text"
                        required
                        placeholder="e.g. bottle / tray"
                        value={addCustomUnit}
                        onChange={(e) => setAddCustomUnit(e.target.value)}
                        className="w-full h-8 px-3 text-xs rounded-xl border border-emerald-500 bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8] mt-1.5"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Procurement Price Per Unit * */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                      Procurement Price/Unit (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="e.g. 40"
                      value={addProcurementPrice}
                      onChange={(e) => setAddProcurementPrice(e.target.value)}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8]"
                    />
                  </div>

                  {/* Selling Price Per Unit * */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                      Selling Price/Unit (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="e.g. 55"
                      value={addSellingPrice}
                      onChange={(e) => setAddSellingPrice(e.target.value)}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8]"
                    />
                  </div>
                </div>

                {/* Auto Calculated Procurement Value & Opening Stock Note */}
                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-[#18382B]/60 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-[#174F3A] dark:text-[#A3E6C5]">
                    <span>Calculated Procurement Value:</span>
                    <span className="text-sm font-extrabold">
                      ₹{calculatedProcurementValue.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#66736C] dark:text-[#8E9E96]">
                    Opening Stock Quantity = Initial Procurement Quantity ({numProcQty}{' '}
                    {addUnitSelect === 'CUSTOM' ? addCustomUnit || 'units' : addUnitSelect})
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex justify-end gap-2 border-t border-[#E9EFEB] dark:border-[#16241E]">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="h-9 px-4 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] text-xs font-semibold hover:bg-[#F8FAF7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-[#174F3A] hover:bg-[#103A2B] dark:bg-[#1B3D30] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  + Add to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PRODUCT MODAL */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-[#17221D]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E9EFEB] dark:border-[#16241E] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
                  <span>Edit Product Master</span>
                </h3>
                <p className="text-[11px] font-medium text-[#66736C] dark:text-[#8E9E96]">
                  {editingProduct.name} ({editingProduct.code})
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProductSubmit} className="space-y-3">
              {/* Product Name * */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                />
              </div>

              {/* Category * */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={editCategorySelect}
                  onChange={(e) => setEditCategorySelect(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                >
                  {CATEGORY_SUGGESTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="CUSTOM">+ Custom Category...</option>
                </select>

                {editCategorySelect === 'CUSTOM' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom category"
                    value={editCustomCategory}
                    onChange={(e) => setEditCustomCategory(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-emerald-500 bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8] mt-1.5"
                  />
                )}
              </div>

              {/* Supplier Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  Supplier Name
                </label>
                <input
                  type="text"
                  value={editSupplier}
                  onChange={(e) => setEditSupplier(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                />
              </div>

              {/* Unit & Selling Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editUnitSelect}
                    onChange={(e) => setEditUnitSelect(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                    <option value="CUSTOM">+ Custom Unit...</option>
                  </select>

                  {editUnitSelect === 'CUSTOM' && (
                    <input
                      type="text"
                      required
                      placeholder="Enter custom unit"
                      value={editCustomUnit}
                      onChange={(e) => setEditCustomUnit(e.target.value)}
                      className="w-full h-8 px-3 text-xs rounded-xl border border-emerald-500 bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8] mt-1.5"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                    Selling Price/Unit (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={editSellingPrice}
                    onChange={(e) => setEditSellingPrice(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                  />
                </div>
              </div>

              {/* Current Stock info */}
              <div className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] text-xs text-[#66736C] dark:text-[#8E9E96]">
                Current Available Stock: <strong className="text-[#17221D] dark:text-[#E6ECE8]">{editingProduct.stockQty} {editingProduct.unit}</strong>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex justify-end gap-2 border-t border-[#E9EFEB] dark:border-[#16241E]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="h-9 px-4 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] text-xs font-semibold hover:bg-[#F8FAF7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-[#174F3A] hover:bg-[#103A2B] dark:bg-[#1B3D30] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save Product Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESTOCK PRODUCT MODAL */}
      {isRestockOpen && restockProductItem && (
        <div className="fixed inset-0 z-50 bg-[#17221D]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E9EFEB] dark:border-[#16241E] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
                  <span>Restock Inventory Batch</span>
                </h3>
                <p className="text-[11px] font-medium text-[#66736C] dark:text-[#8E9E96]">
                  {restockProductItem.name} • Current Stock: {restockProductItem.stockQty} {restockProductItem.unit}
                </p>
              </div>
              <button
                onClick={() => setIsRestockOpen(false)}
                className="text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  Additional Procurement Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder={`e.g. 50 ${restockProductItem.unit}`}
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                  Batch Procurement Price/Unit (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="e.g. 40"
                  value={restockPricePerUnit}
                  onChange={(e) => setRestockPricePerUnit(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-[#18382B] border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                <div className="flex justify-between font-bold text-[#174F3A] dark:text-[#A3E6C5]">
                  <span>Batch Value:</span>
                  <span>
                    ₹{(Math.max(0, Number(restockQty) || 0) * Math.max(0, Number(restockPricePerUnit) || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[#66736C] dark:text-[#8E9E96]">
                  <span>New Stock Balance:</span>
                  <span className="font-bold text-[#17221D] dark:text-[#E6ECE8]">
                    {restockProductItem.stockQty + Math.max(0, Number(restockQty) || 0)} {restockProductItem.unit}
                  </span>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E9EFEB] dark:border-[#16241E]">
                <button
                  type="button"
                  onClick={() => setIsRestockOpen(false)}
                  className="h-9 px-4 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] text-xs font-semibold hover:bg-[#F8FAF7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-[#174F3A] hover:bg-[#103A2B] dark:bg-[#1B3D30] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  + Add Stock Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: VIEW PRODUCT DETAILS */}
      {viewProductItem && (
        <div className="fixed inset-0 z-50 bg-[#17221D]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E9EFEB] dark:border-[#16241E] pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E7F2EC] text-[#174F3A] uppercase">
                  {viewProductItem.code}
                </span>
                <h3 className="text-lg font-bold text-[#17221D] dark:text-[#E6ECE8] mt-1">
                  {viewProductItem.name}
                </h3>
              </div>
              <button
                onClick={() => setViewProductItem(null)}
                className="text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129]">
                <span className="text-[#66736C] dark:text-[#8E9E96] block text-[11px]">Category</span>
                <span className="font-bold text-[#17221D] dark:text-[#E6ECE8]">{viewProductItem.category}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129]">
                <span className="text-[#66736C] dark:text-[#8E9E96] block text-[11px]">Supplier / Source</span>
                <span className="font-bold text-[#17221D] dark:text-[#E6ECE8]">{viewProductItem.supplier || '—'}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129]">
                <span className="text-[#66736C] dark:text-[#8E9E96] block text-[11px]">Current Available Stock</span>
                <span className="font-extrabold text-[#174F3A] dark:text-[#A3E6C5] text-sm">
                  {viewProductItem.stockQty} {viewProductItem.unit}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129]">
                <span className="text-[#66736C] dark:text-[#8E9E96] block text-[11px]">Reorder Warning Level</span>
                <span className="font-bold text-amber-700 dark:text-amber-300">
                  {viewProductItem.reorderLevel ?? 10} {viewProductItem.unit}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129]">
                <span className="text-[#66736C] dark:text-[#8E9E96] block text-[11px]">Cost Price (Procurement)</span>
                <span className="font-bold text-[#17221D] dark:text-[#E6ECE8]">
                  ₹{viewProductItem.costPrice.toLocaleString('en-IN')} / {viewProductItem.unit}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129]">
                <span className="text-[#66736C] dark:text-[#8E9E96] block text-[11px]">Selling Price (MRP)</span>
                <span className="font-bold text-[#174F3A] dark:text-[#A3E6C5]">
                  ₹{(viewProductItem.sellingPrice ?? viewProductItem.price).toLocaleString('en-IN')} / {viewProductItem.unit}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] col-span-2">
                <span className="text-[#66736C] dark:text-[#8E9E96] block text-[11px]">Total Active Inventory Value</span>
                <span className="font-extrabold text-[#17221D] dark:text-[#E6ECE8] text-base">
                  ₹{(viewProductItem.stockQty * (viewProductItem.sellingPrice ?? viewProductItem.price)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-[#E9EFEB] dark:border-[#16241E]">
              <button
                onClick={() => {
                  const p = viewProductItem;
                  setViewProductItem(null);
                  handleOpenEdit(p);
                }}
                className="h-9 px-4 bg-[#174F3A] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Edit Product
              </button>
              <button
                onClick={() => setViewProductItem(null)}
                className="h-9 px-4 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: DELETE CONFIRMATION */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-[#17221D]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-2.5 rounded-full bg-red-100 dark:bg-red-950/50">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8]">
                  Remove Product Catalog Record?
                </h3>
                <p className="text-xs text-[#66736C] dark:text-[#8E9E96]">
                  "{deleteConfirmItem.name}" ({deleteConfirmItem.code})
                </p>
              </div>
            </div>

            <p className="text-xs text-[#66736C] dark:text-[#8E9E96] bg-[#F8FAF7] dark:bg-[#16241E] p-3 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129]">
              This will remove the product from the active sales &amp; billing catalog. Previous sales bills and procurement history associated with this product will remain preserved for accounting compliance.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E9EFEB] dark:border-[#16241E]">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="h-9 px-4 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] text-xs font-semibold hover:bg-[#F8FAF7] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProduct}
                className="h-9 px-5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
