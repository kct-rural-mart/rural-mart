import React, { useState, useEffect } from 'react';

export default function ExistingProductModal({ categoriesMap, inventoryItems, onClose, onSave }) {
  const [category, setCategory] = useState('');
  const [productName, setProductName] = useState('');
  const [unit, setUnit] = useState('Kg');
  const [openingStock, setOpeningStock] = useState(0);
  const [quantityPurchased, setQuantityPurchased] = useState(0);
  const [quantitySold, setQuantitySold] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [errors, setErrors] = useState({});

  // Reset product when category changes
  const availableProducts = category ? categoriesMap[category] || [] : [];

  // Auto-populate existing product stock data if present
  useEffect(() => {
    if (category && productName) {
      const match = inventoryItems.find(
        (i) => i.category === category && i.productName === productName
      );
      if (match) {
        setUnit(match.unit || 'Kg');
        setOpeningStock(match.openingStock || 0);
        setQuantityPurchased(match.quantityPurchased || 0);
        setQuantitySold(match.quantitySold || 0);
        setPurchasePrice(match.purchasePrice || 0);
        setSellingPrice(match.sellingPrice || 0);
      }
    }
  }, [category, productName, inventoryItems]);

  const closingStock = Math.max(0, Number(openingStock) + Number(quantityPurchased) - Number(quantitySold));

  const validate = () => {
    const errs = {};
    if (!category) errs.category = 'Category is required';
    if (!productName) errs.productName = 'Product name is required';
    if (openingStock < 0) errs.openingStock = 'Cannot be negative';
    if (quantityPurchased < 0) errs.quantityPurchased = 'Cannot be negative';
    if (quantitySold < 0) errs.quantitySold = 'Cannot be negative';
    if (purchasePrice <= 0) errs.purchasePrice = 'Must be greater than 0';
    if (sellingPrice < purchasePrice) errs.sellingPrice = 'Selling price cannot be lower than purchase price';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      category,
      productName,
      unit,
      openingStock: Number(openingStock),
      quantityPurchased: Number(quantityPurchased),
      quantitySold: Number(quantitySold),
      closingStock,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice)
    });

    onClose();
  };

  return (
    <div className="pip-modal-backdrop" onClick={onClose}>
      <div className="pip-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="pip-modal-header">
          <h2 className="pip-modal-title">Update Existing Product Inventory</h2>
          <button type="button" className="pip-modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="pip-form">
          <div className="pip-form-row">
            <div className="pip-field">
              <label>Category <span className="pip-req">*</span></label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setProductName('');
                }}
                className={errors.category ? 'pip-input-error' : ''}
              >
                <option value="">Select Category</option>
                {Object.keys(categoriesMap).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <span className="pip-err">{errors.category}</span>}
            </div>

            <div className="pip-field">
              <label>Product <span className="pip-req">*</span></label>
              <select
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                disabled={!category}
                className={errors.productName ? 'pip-input-error' : ''}
              >
                <option value="">Select Product</option>
                {availableProducts.map((prod) => (
                  <option key={prod} value={prod}>{prod}</option>
                ))}
              </select>
              {errors.productName && <span className="pip-err">{errors.productName}</span>}
            </div>
          </div>

          <div className="pip-form-row pip-three-col">
            <div className="pip-field">
              <label>Unit</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="Kg">Kg</option>
                <option value="Litre">Litre</option>
                <option value="Packet">Packet</option>
                <option value="Piece">Piece</option>
                <option value="Bag">Bag</option>
              </select>
            </div>

            <div className="pip-field">
              <label>Opening Stock</label>
              <input
                type="number"
                min="0"
                value={openingStock}
                onChange={(e) => setOpeningStock(e.target.value)}
              />
            </div>

            <div className="pip-field">
              <label>Qty Purchased</label>
              <input
                type="number"
                min="0"
                value={quantityPurchased}
                onChange={(e) => setQuantityPurchased(e.target.value)}
              />
            </div>
          </div>

          <div className="pip-form-row pip-three-col">
            <div className="pip-field">
              <label>Qty Sold</label>
              <input
                type="number"
                min="0"
                value={quantitySold}
                onChange={(e) => setQuantitySold(e.target.value)}
              />
            </div>

            <div className="pip-field">
              <label>Closing Stock (Calculated)</label>
              <input type="number" value={closingStock} disabled className="pip-readonly" />
            </div>

            <div className="pip-field">
              <label>Purchase Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className={errors.purchasePrice ? 'pip-input-error' : ''}
              />
            </div>
          </div>

          <div className="pip-form-row">
            <div className="pip-field">
              <label>Selling Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className={errors.sellingPrice ? 'pip-input-error' : ''}
              />
              {errors.sellingPrice && <span className="pip-err">{errors.sellingPrice}</span>}
            </div>
          </div>

          <div className="pip-modal-actions">
            <button type="button" className="pip-btn pip-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="pip-btn pip-btn-primary">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}