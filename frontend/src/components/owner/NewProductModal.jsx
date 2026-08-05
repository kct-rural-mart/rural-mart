import React, { useState } from 'react';

export default function NewProductModal({ categoriesMap, onClose, onSave }) {
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [productName, setProductName] = useState('');
  const [customProduct, setCustomProduct] = useState('');
  const [unit, setUnit] = useState('Kg');
  const [openingStock, setOpeningStock] = useState(0);
  const [quantityPurchased, setQuantityPurchased] = useState(0);
  const [quantitySold, setQuantitySold] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [errors, setErrors] = useState({});

  const availableProducts = category && category !== 'Other' ? [...(categoriesMap[category] || []), 'Other'] : ['Other'];

  const closingStock = Math.max(0, Number(openingStock) + Number(quantityPurchased) - Number(quantitySold));

  const validate = () => {
    const errs = {};
    if (!category) errs.category = 'Category is required';
    if (category === 'Other' && !customCategory.trim()) errs.customCategory = 'New category name is required';
    if (!productName) errs.productName = 'Product selection is required';
    if (productName === 'Other' && !customProduct.trim()) errs.customProduct = 'New product name is required';
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
      customCategory,
      productName,
      customProduct,
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
          <h2 className="pip-modal-title">Add New Product</h2>
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
              >
                <option value="">Select Category</option>
                {Object.keys(categoriesMap).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>

            {category === 'Other' && (
              <div className="pip-field">
                <label>Enter New Category <span className="pip-req">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Bio-Fertilizers"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className={errors.customCategory ? 'pip-input-error' : ''}
                />
              </div>
            )}
          </div>

          <div className="pip-form-row">
            <div className="pip-field">
              <label>Product <span className="pip-req">*</span></label>
              <select
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                disabled={!category}
              >
                <option value="">Select Product</option>
                {availableProducts.map((prod) => (
                  <option key={prod} value={prod}>{prod}</option>
                ))}
              </select>
            </div>

            {productName === 'Other' && (
              <div className="pip-field">
                <label>Enter Product Name <span className="pip-req">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. High Protein Blend"
                  value={customProduct}
                  onChange={(e) => setCustomProduct(e.target.value)}
                  className={errors.customProduct ? 'pip-input-error' : ''}
                />
              </div>
            )}
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
              <input type="number" min="0" value={openingStock} onChange={(e) => setOpeningStock(e.target.value)} />
            </div>

            <div className="pip-field">
              <label>Qty Purchased</label>
              <input type="number" min="0" value={quantityPurchased} onChange={(e) => setQuantityPurchased(e.target.value)} />
            </div>
          </div>

          <div className="pip-form-row pip-three-col">
            <div className="pip-field">
              <label>Qty Sold</label>
              <input type="number" min="0" value={quantitySold} onChange={(e) => setQuantitySold(e.target.value)} />
            </div>

            <div className="pip-field">
              <label>Closing Stock</label>
              <input type="number" value={closingStock} disabled className="pip-readonly" />
            </div>

            <div className="pip-field">
              <label>Purchase Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
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