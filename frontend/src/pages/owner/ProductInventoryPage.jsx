import React, { useState, useMemo } from 'react';
import './ProductInventoryPage.css';

const INITIAL_PRODUCTS = [
  { id: 'PRD-01', productName: 'Mineral Mixture', category: 'Minerals', supplier: 'Shakti Feeds', price: 320, inStock: 145, salesValue: 45440 },
  { id: 'PRD-02', productName: 'Organic NPK Fertilizer', category: 'Organic Fertilizers', supplier: 'Agro Care Pvt. Ltd.', price: 850, inStock: 220, salesValue: 80750 },
  { id: 'PRD-03', productName: 'High Milk Cattle Feed', category: 'Feed', supplier: 'Shakti Feeds', price: 1150, inStock: 80, salesValue: 207000 },
  { id: 'PRD-04', productName: 'Farm Sprayer Pump', category: 'Equip', supplier: 'Kisan Supply Co.', price: 2450, inStock: 35, salesValue: 44100 },
  { id: 'PRD-05', productName: 'Soil Conditioner Concentrate', category: 'Others', supplier: 'Agro Care Pvt. Ltd.', price: 490, inStock: 110, salesValue: 31360 }
];

// Color palette mapping for all 5 categories
const CATEGORY_COLORS = {
  'Feed': '#1F331F',                // Dark Green
  'Minerals': '#C4D6B0',            // Sage Green
  'Organic Fertilizers': '#E8CD78',  // Warm Gold
  'Equip': '#8C948C',               // Muted Gray
  'Others': '#D1D5DB'               // Light Gray
};

export default function ProductInventoryPage() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Interactive Hover State for SVG Donut Chart Slices
  const [hoveredCategory, setHoveredCategory] = useState(null);
  
  // Accordion Toggle State for Legend Dropdown
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockQty, setStockQty] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('Procurement / New Stock Shipment');
  const [auditRemarks, setAuditRemarks] = useState('');

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newCategory, setNewCategory] = useState('Feed');
  const [newSupplier, setNewSupplier] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newInitialStock, setNewInitialStock] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setStockQty(product.inStock);
    setSellingPrice(product.price);
    setAdjustmentReason('Procurement / New Stock Shipment');
    setAuditRemarks('');
    setIsEditModalOpen(true);
  };

  const handleSaveStock = (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingProduct.id
          ? { ...p, inStock: Math.max(0, Number(stockQty)), price: Number(sellingPrice) }
          : p
      )
    );
    setIsEditModalOpen(false);
    triggerToast(`Inventory updated for ${editingProduct.productName}`);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProdName || !newPrice) return;

    const newIdNumber = products.length + 1;
    const formattedId = `PRD-${newIdNumber < 10 ? '0' + newIdNumber : newIdNumber}`;

    const newEntry = {
      id: formattedId,
      productName: newProdName,
      category: newCategory,
      supplier: newSupplier.trim() || 'Local Supplier',
      price: Number(newPrice),
      inStock: Number(newInitialStock) || 0,
      salesValue: 0
    };

    setProducts((prev) => [newEntry, ...prev]);

    setNewProdName('');
    setNewSupplier('');
    setNewPrice('');
    setNewInitialStock('');
    setNewCategory('Feed');
    setIsAddModalOpen(false);

    triggerToast(`"${newEntry.productName}" added to inventory catalog!`);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Calculate total inventory value
  const totalSalesValue = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.price * p.inStock), 0);
  }, [products]);

  // Dynamically compute category shares for all 5 categories
  const categoriesData = useMemo(() => {
    const categoriesList = ['Feed', 'Minerals', 'Organic Fertilizers', 'Equip', 'Others'];

    return categoriesList.map((catName) => {
      const catProducts = products.filter((p) => p.category === catName);
      const totalVal = catProducts.reduce((acc, p) => acc + (p.price * p.inStock), 0);
      const totalUnits = catProducts.reduce((acc, p) => acc + p.inStock, 0);
      const percentNum = totalSalesValue > 0 ? Math.round((totalVal / totalSalesValue) * 100) : 0;

      return {
        title: catName,
        categoryKey: catName,
        percentNum,
        percent: `${percentNum}%`,
        color: CATEGORY_COLORS[catName] || '#1F331F',
        detail: `₹${totalVal.toLocaleString('en-IN')} • ${totalUnits} units`
      };
    }).filter((cat) => cat.percentNum > 0);
  }, [products, totalSalesValue]);

  // Sliced categories for dropdown view (3 default vs all 5)
  const visibleCategories = useMemo(() => {
    return showAllCategories ? categoriesData : categoriesData.slice(0, 3);
  }, [categoriesData, showAllCategories]);

  // Calculate SVG arc paths for interactive Donut slices
  const donutSlices = useMemo(() => {
    let accumulatedAngle = 0;
    return categoriesData.map((cat) => {
      const angle = (cat.percentNum / 100) * 360;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angle;
      accumulatedAngle += angle;

      const x1 = 100 + 70 * Math.cos((Math.PI * (startAngle - 90)) / 180);
      const y1 = 100 + 70 * Math.sin((Math.PI * (startAngle - 90)) / 180);
      const x2 = 100 + 70 * Math.cos((Math.PI * (endAngle - 90)) / 180);
      const y2 = 100 + 70 * Math.sin((Math.PI * (endAngle - 90)) / 180);

      const largeArcFlag = angle > 180 ? 1 : 0;
      const pathData = `M 100 100 L ${x1} ${y1} A 70 70 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      return { ...cat, pathData };
    });
  }, [categoriesData]);

  return (
    <div className="pip-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="pip-toast">
          <span>✅</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="pip-header-card">
        <div className="pip-header-info">
          <span className="pip-date-badge">ACTIVE BUSINESS DATE: 5 AUG 2026, WED</span>
          <h1 className="pip-title">Product-wise Sales & Inventory</h1>
          <p className="pip-subtitle">
            Analyze product performance, manage stock distributions, and adjust pricing.
          </p>
        </div>
        <button className="pip-btn-primary" onClick={() => setIsAddModalOpen(true)}>
          + Add New Product
        </button>
      </div>

      {/* KPI Section */}
      <div className="pip-kpi-grid">
        <div className="pip-kpi-card kpi-bg-1">
          <div className="pip-kpi-header">
            <span className="pip-kpi-label">TOP SELLING PRODUCT</span>
            <span className="pip-kpi-icon">🌾</span>
          </div>
          <h3 className="pip-kpi-val-title">Mineral Mixture</h3>
          <div className="pip-kpi-num">₹45,680</div>
          <span className="pip-trend-badge positive">+18.6% vs last month</span>
        </div>

        <div className="pip-kpi-card kpi-bg-2">
          <div className="pip-kpi-header">
            <span className="pip-kpi-label">CATEGORY SALES TOTAL</span>
            <span className="pip-kpi-icon">📈</span>
          </div>
          <div className="pip-kpi-num" style={{ marginTop: 8 }}>₹2,45,780</div>
          <span className="pip-trend-badge positive">+12.4% overall growth</span>
          <div className="pip-kpi-subtext">Feed: 35% • Minerals: 28% • Equip: 18%</div>
        </div>

        <div className="pip-kpi-card kpi-bg-3">
          <div className="pip-kpi-header">
            <span className="pip-kpi-label">SUPPLIER WISE SALES</span>
            <span className="pip-kpi-icon">🚚</span>
          </div>
          <div className="pip-kpi-num" style={{ marginTop: 8 }}>₹1,78,450</div>
          <span className="pip-trend-badge positive">+9.7% efficiency</span>
          <div className="pip-kpi-subtext">Agro Care: 38% • Shakti: 29% • Kisan: 21%</div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="pip-body-grid">
        {/* Left Column */}
        <div className="pip-left-panel">
          
          {/* Category Share Panel (Side-by-Side SVG Chart + Legend Dropdown) */}
          <div className="pip-panel-card">
            <h2 className="pip-panel-title">📊 Category Share</h2>
            
            <div className="pip-category-body">
              {/* SVG Interactive Donut Chart */}
              <div className="pip-donut-wrapper">
                <svg viewBox="0 0 200 200" className="pip-svg-donut">
                  {donutSlices.map((slice) => (
                    <path
                      key={slice.title}
                      d={slice.pathData}
                      fill={slice.color}
                      onMouseEnter={() => setHoveredCategory(slice)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className="pip-donut-segment"
                    />
                  ))}
                  <circle cx="100" cy="100" r="48" fill="#FFFFFF" />
                </svg>

                {/* Dynamic Center Tooltip Overlay */}
                <div className="pip-donut-center">
                  {hoveredCategory ? (
                    <>
                      <span className="pip-donut-sub">{hoveredCategory.title}</span>
                      <span className="pip-donut-val-hover">{hoveredCategory.detail}</span>
                    </>
                  ) : (
                    <>
                      <span className="pip-donut-sub">TOTAL SALES</span>
                      <span className="pip-donut-val">₹2.45L</span>
                    </>
                  )}
                </div>
              </div>

              {/* Side Legend List */}
              <div className="pip-legend-side-list">
                {visibleCategories.map((cat) => (
                  <div
                    key={cat.title}
                    className={`pip-legend-side-row ${hoveredCategory?.title === cat.title ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredCategory(cat)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div className="pip-legend-left">
                      <span
                        className="dot-color"
                        style={{ backgroundColor: cat.color }}
                      ></span>
                      <span className="pip-legend-name">{cat.title}</span>
                    </div>
                    <strong>{cat.percent}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Dropdown / Accordion Toggle Button for > 3 Categories */}
            {categoriesData.length > 3 && (
              <button 
                type="button" 
                className="pip-legend-dropdown-btn"
                onClick={() => setShowAllCategories(!showAllCategories)}
              >
                <span>{showAllCategories ? 'Show Less' : `+ ${categoriesData.length - 3} More Categories`}</span>
                <span className={`pip-dropdown-arrow ${showAllCategories ? 'open' : ''}`}>▼</span>
              </button>
            )}
          </div>

          {/* Low Stock Alerts */}
          <div className="pip-panel-card">
            <h2 className="pip-panel-title">⚠️ Stock Alerts & Fast Movers</h2>
            <div className="pip-alert-row">
              <div>
                <div className="pip-alert-name">Farm Sprayer Pump</div>
                <div className="pip-alert-sub">Only 35 units remaining</div>
              </div>
              <span className="pip-pill-warning">Reorder Soon</span>
            </div>
            <div className="pip-alert-row">
              <div>
                <div className="pip-alert-name">High Milk Cattle Feed</div>
                <div className="pip-alert-sub">Fastest moving stock item</div>
              </div>
              <span className="pip-pill-success">High Demand</span>
            </div>
          </div>
        </div>

        {/* Right Column: Catalog Table */}
        <div className="pip-panel-card pip-right-panel">
          <div className="pip-table-header">
            <h2 className="pip-panel-title">📦 Active Inventory & Sales Catalog</h2>
            <input
              type="text"
              className="pip-search-input"
              placeholder="Search products, suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="pip-table-responsive">
            <table className="pip-table">
              <thead>
                <tr>
                  <th style={{ width: '24%' }}>PRODUCT NAME</th>
                  <th style={{ width: '18%' }}>CATEGORY</th>
                  <th style={{ width: '20%' }}>SUPPLIER</th>
                  <th style={{ width: '10%' }}>PRICE</th>
                  <th style={{ width: '12%' }}>IN STOCK</th>
                  <th style={{ width: '16%', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="pip-td-name">{p.productName}</td>
                    <td>
                      <span className="pip-cat-badge">{p.category}</span>
                    </td>
                    <td className="pip-td-muted">{p.supplier}</td>
                    <td className="pip-td-price">₹{p.price}</td>
                    <td>
                      <span className={`pip-stock-badge ${p.inStock < 50 ? 'low' : 'good'}`}>
                        {p.inStock} units
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="pip-btn-edit" onClick={() => handleOpenEdit(p)}>
                        ✏️Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Stock Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="pip-modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="pip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pip-modal-header">
              <div className="pip-modal-title-group">
                <div className="pip-modal-icon-badge">📦</div>
                <div>
                  <h3>Edit Stock & Pricing</h3>
                  <p className="pip-modal-sub">
                    {editingProduct.productName} ({editingProduct.id}) • <strong>{editingProduct.category}</strong>
                  </p>
                </div>
              </div>
              <button className="pip-btn-close" onClick={() => setIsEditModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveStock}>
              <div className="pip-inventory-box">
                <div className="pip-inventory-box-header">
                  <label>Current Inventory Stock (Units) *</label>
                  <span className={`pip-status-chip ${Number(stockQty) < 50 ? 'low' : 'healthy'}`}>
                    {Number(stockQty) < 50 ? '⚠️ Low Stock Alert' : '✔ Healthy Stock Level'}
                  </span>
                </div>

                <div className="pip-stepper-container">
                  <button type="button" className="pip-step-btn" onClick={() => setStockQty((q) => Math.max(0, Number(q) - 10))}>-10</button>
                  <button type="button" className="pip-step-btn" onClick={() => setStockQty((q) => Math.max(0, Number(q) - 1))}>-1</button>
                  <input
                    type="number"
                    className="pip-stock-input-main"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                  />
                  <button type="button" className="pip-step-btn" onClick={() => setStockQty((q) => Number(q) + 1)}>+1</button>
                  <button type="button" className="pip-step-btn" onClick={() => setStockQty((q) => Number(q) + 10)}>+10</button>
                </div>

                <div className="pip-quick-add-row">
                  <span className="pip-quick-add-label">QUICK ADD:</span>
                  {[25, 50, 100, 500].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className="pip-chip-btn"
                      onClick={() => setStockQty((q) => Number(q) + amount)}
                    >
                      +{amount}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pip-form-row-2col">
                <div className="pip-form-group">
                  <label>Selling Price per Unit (₹) *</label>
                  <div className="pip-price-input-wrapper">
                    <span className="pip-currency-symbol">₹</span>
                    <input
                      type="number"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="pip-form-group">
                  <label>Adjustment Reason *</label>
                  <select
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    className="pip-select-input"
                  >
                    <option value="Procurement / New Stock Shipment">Procurement / New Stock Shipment</option>
                    <option value="Inventory Audit Adjustment">Inventory Audit Adjustment</option>
                    <option value="Damaged / Expired Stock Removal">Damaged / Expired Stock Removal</option>
                    <option value="Return to Supplier">Return to Supplier</option>
                  </select>
                </div>
              </div>

              <div className="pip-form-group" style={{ marginTop: 14 }}>
                <label>Audit Remarks / Invoice Ref (Optional)</label>
                <input
                  type="text"
                  className="pip-text-input"
                  placeholder="e.g. Batch #402 received from Shakti Feeds"
                  value={auditRemarks}
                  onChange={(e) => setAuditRemarks(e.target.value)}
                />
              </div>

              <div className="pip-modal-actions">
                <button type="button" className="pip-btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="pip-btn-primary">
                  💾 Save Inventory Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {isAddModalOpen && (
        <div className="pip-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="pip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pip-modal-header">
              <div className="pip-modal-title-group">
                <div className="pip-modal-icon-badge">➕</div>
                <div>
                  <h3>Add New Catalog Product</h3>
                  <p className="pip-modal-sub">Create a new item entry in your active inventory catalog.</p>
                </div>
              </div>
              <button className="pip-btn-close" onClick={() => setIsAddModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleAddProduct}>
              <div className="pip-form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  className="pip-text-input"
                  placeholder="e.g. Bio-Organic Growth Promoter"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  required
                />
              </div>

              <div className="pip-form-row-2col" style={{ marginTop: 12 }}>
                <div className="pip-form-group">
                  <label>Category *</label>
                  <select
                    className="pip-select-input"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="Feed">Feed</option>
                    <option value="Minerals">Minerals</option>
                    <option value="Organic Fertilizers">Organic Fertilizers</option>
                    <option value="Equip">Equip</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="pip-form-group">
                  <label>Supplier Name</label>
                  <input
                    type="text"
                    className="pip-text-input"
                    placeholder="e.g. Agro Care Pvt. Ltd."
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                  />
                </div>
              </div>

              <div className="pip-form-row-2col" style={{ marginTop: 12 }}>
                <div className="pip-form-group">
                  <label>Unit Selling Price (₹) *</label>
                  <div className="pip-price-input-wrapper">
                    <span className="pip-currency-symbol">₹</span>
                    <input
                      type="number"
                      placeholder="450"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="pip-form-group">
                  <label>Initial Opening Stock (Units)</label>
                  <input
                    type="number"
                    className="pip-text-input"
                    placeholder="100"
                    value={newInitialStock}
                    onChange={(e) => setNewInitialStock(e.target.value)}
                  />
                </div>
              </div>

              <div className="pip-modal-actions" style={{ marginTop: 24 }}>
                <button type="button" className="pip-btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="pip-btn-primary">
                  ✨ Add to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}