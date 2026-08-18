import React, { useEffect, useState, useMemo } from 'react';
import { Theme, ProductInventoryRecord, InventoryMovementDataPoint, TopProductDataPoint } from '../../../shared/types';
import { getAdminInventory } from '../../services/inventoryService';
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
  const [allProducts, setAllProducts] = useState<ProductInventoryRecord[]>([]);
  const [movement, setMovement] = useState<InventoryMovementDataPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true; setLoading(true); setError('');
    void getAdminInventory(filters.dateRange).then((data) => {
      if (!active) return; setAllProducts(data.products); setMovement(data.movement); setTopProducts(data.topProducts);
    }).catch((reason: unknown) => {
      if (!active) return;
      const message = reason && typeof reason === 'object' && 'message' in reason ? String((reason as { message: unknown }).message) : 'Unable to load inventory.';
      const code = reason && typeof reason === 'object' && 'code' in reason ? ` (Code: ${String((reason as { code: unknown }).code)})` : '';
      setError(`${message}${code}`);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filters.dateRange]);

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
      {loading && <div className="rounded-xl border border-[#DDE6E0] bg-white p-4 text-sm font-semibold text-[#174F3A]">Loading live inventory...</div>}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
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
        <InventoryMovementLineChart theme={theme} data={movement} />
        <Top10ProductsBarChart theme={theme} products={topProducts} />
      </section>

      {/* Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
