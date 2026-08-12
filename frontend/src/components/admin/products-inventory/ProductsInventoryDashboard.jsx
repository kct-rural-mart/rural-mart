import { useMemo, useState } from 'react'
import ProductsKpiCards from './ProductsKpiCards'
import ProductInventoryTable from './ProductInventoryTable'
import InventoryMovementLineChart from './InventoryMovementLineChart'
import Top10ProductsBarChart from './Top10ProductsBarChart'
import CategoryPerformanceDonutChart from './CategoryPerformanceDonutChart'
import StockHealthStackedBarChart from './StockHealthStackedBarChart'
import FastSlowMovingTable from './FastSlowMovingTable'
import ProductDetailModal from './ProductDetailModal'
import { getProducts, getRuralMarts } from '../../../lib/newPages/shared/dataServices'

export default function ProductsInventoryDashboard({ filters, searchQuery, setSearchQuery }) {
  const [selectedProduct, setSelectedProduct] = useState(null)

  const allProducts = useMemo(() => {
    const canonicalProducts = getProducts()
    const canonicalMarts = getRuralMarts()

    return canonicalProducts.map((p) => {
      const mart = canonicalMarts.find((m) => m.ruralMartId === p.ruralMartId)
      let martDisplayName = p.ruralMartId || 'Rural Mart'
      if (mart) {
        martDisplayName = mart.ruralMartName.replace(' Rural Mart', '').replace(' Agro Mart', '').replace(' Farmers Hub', '')
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
        salesQty: p.salesQty ?? 0,
        procurementQty: p.procurementQty ?? 0,
        inventoryValue: p.inventoryValue ?? p.stockQty * p.sellingPrice,
        status: p.status,
        lastRestocked: p.lastRestocked,
      }
    })
  }, [])

  const filteredProducts = useMemo(() => {
    return allProducts.filter((item) => {
      const matchDistrict = filters.district === 'All Districts' || item.district === filters.district
      const matchMart = filters.ruralMart === 'All Rural Marts' || item.ruralMart.toLowerCase().includes(filters.ruralMart.toLowerCase())
      return matchDistrict && matchMart
    })
  }, [allProducts, filters.district, filters.ruralMart])

  return (
    <div className="space-y-6">
      <section>
        <ProductsKpiCards products={filteredProducts} />
      </section>

      <section>
        <ProductInventoryTable products={filteredProducts} onSelectProduct={setSelectedProduct} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryMovementLineChart />
        <Top10ProductsBarChart />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPerformanceDonutChart />
        <StockHealthStackedBarChart />
      </section>

      <section>
        <FastSlowMovingTable />
      </section>

      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  )
}
