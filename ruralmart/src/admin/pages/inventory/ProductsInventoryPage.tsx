import React, { useState, useMemo } from 'react';
import { Theme, ProductInventoryRecord } from '../../../shared/types';
import { getProducts, getRuralMarts } from '../../../shared/dataServices';
import { ProductsKpiCards } from './ProductsKpiCards';
import { InventoryMovementLineChart } from './InventoryMovementLineChart';
import { Top10ProductsBarChart } from './Top10ProductsBarChart';
import { ProductInventoryTable } from './ProductInventoryTable';
import { ProductDetailModal } from './ProductDetailModal';

interface ProductsInventoryPageProps {
  theme: Theme;
  filters: {
    district: string;
    ruralMart: string;
    dateRange: string;
    comparisonPeriod: string;
  };
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const ProductsInventoryPage: React.FC<ProductsInventoryPageProps> = ({
  theme,
  filters,
  searchQuery,
  setSearchQuery,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<ProductInventoryRecord | null>(null);

  // Derive products from shared data layer
  const allProducts = useMemo(() => {
    const canonicalProducts = getProducts();
    const canonicalMarts = getRuralMarts();

    return canonicalProducts.map((p) => {
      const mart = canonicalMarts.find((m) => m.ruralMartId === p.ruralMartId);
      let martDisplayName = p.ruralMartId || 'Rural Mart';
      if (mart) {
        martDisplayName = mart.ruralMartName
          .replace(' Rural Mart', '')
          .replace(' Agro Mart', '')
          .replace(' Farmers Hub', '');
      }
      return {
        id: p.id,
        code: p.code,
        name: p.name,
        category: p.category,
        ruralMart: martDisplayName,
        district: p.district || (mart ? mart.district : 'Erode'),
        stockQty: p.stockQty,
        reorderLevel: p.reorderLevel,
        unitPrice: p.sellingPrice,
        salesQty: (p as any).salesQty ?? 0,
        procurementQty: (p as any).procurementQty ?? 0,
        inventoryValue: (p as any).inventoryValue ?? (p.stockQty * p.sellingPrice),
        status: p.status,
        lastRestocked: p.lastRestocked,
      } as ProductInventoryRecord;
    });
  }, []);

  // Filter products based on selected district / rural mart
  const filteredProducts = useMemo(() => {
    return allProducts.filter((item) => {
      const matchDistrict =
        filters.district === 'All Districts' || item.district === filters.district;
      const matchMart =
        filters.ruralMart === 'All Rural Marts' ||
        item.ruralMart.toLowerCase().includes(filters.ruralMart.toLowerCase());

      return matchDistrict && matchMart;
    });
  }, [allProducts, filters.district, filters.ruralMart]);

  return (
    <div className="space-y-6">
      {/* SECTION 1 — 6 KPI Cards */}
      <section>
        <ProductsKpiCards products={filteredProducts} />
      </section>

      {/* SECTION 2 — Product Inventory Table */}
      <section>
        <ProductInventoryTable
          products={filteredProducts}
          onSelectProduct={(product) => setSelectedProduct(product)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </section>

      {/* SECTION 3 — Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryMovementLineChart theme={theme} />
        <Top10ProductsBarChart theme={theme} />
      </section>

      {/* Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
