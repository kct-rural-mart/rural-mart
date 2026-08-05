import React from 'react';

export default function ProductKPICards({ metrics }) {
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="pip-kpi-grid">
      {/* KPI 1: Top Selling Product */}
      <div className="pip-kpi-card">
        <div className="pip-kpi-top">
          <span className="pip-kpi-label">Top Selling Product</span>
          <div className="pip-kpi-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
        </div>
        <div className="pip-kpi-title">{metrics.topSellingProduct.name}</div>
        <div className="pip-kpi-subval">{metrics.topSellingProduct.units} Units Sold</div>
        <div className="pip-kpi-trend positive">
          <span>↑ {metrics.topSellingProduct.trend}%</span>
        </div>
      </div>

      {/* KPI 2: Category-wise Sales */}
      <div className="pip-kpi-card">
        <div className="pip-kpi-top">
          <span className="pip-kpi-label">Category-wise Sales</span>
          <div className="pip-kpi-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
              <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
            </svg>
          </div>
        </div>
        <div className="pip-kpi-title">{metrics.topCategory.name}</div>
        <div className="pip-kpi-subval">{formatCurrency(metrics.topCategory.revenue)}</div>
        <div className="pip-kpi-trend positive">
          <span>↑ {metrics.topCategory.trend}%</span>
        </div>
      </div>

      {/* KPI 3: Supplier-wise Sales */}
      <div className="pip-kpi-card">
        <div className="pip-kpi-top">
          <span className="pip-kpi-label">Supplier-wise Sales</span>
          <div className="pip-kpi-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
        </div>
        <div className="pip-kpi-title">{metrics.topSupplier.name}</div>
        <div className="pip-kpi-subval">{formatCurrency(metrics.topSupplier.revenue)}</div>
        <div className="pip-kpi-trend positive">
          <span>↑ {metrics.topSupplier.trend}%</span>
        </div>
      </div>
    </div>
  );
}