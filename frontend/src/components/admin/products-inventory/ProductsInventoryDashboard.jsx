import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import ProductsKpiCards from './ProductsKpiCards'
import ProductInventoryTable from './ProductInventoryTable'
import InventoryMovementLineChart from './InventoryMovementLineChart'
import Top10ProductsBarChart from './Top10ProductsBarChart'
import CategoryPerformanceDonutChart from './CategoryPerformanceDonutChart'
import StockHealthStackedBarChart from './StockHealthStackedBarChart'
import FastSlowMovingTable from './FastSlowMovingTable'
import ProductDetailModal from './ProductDetailModal'
import { getAdminProductsData } from '../../../lib/queries/adminProducts'

export default function ProductsInventoryDashboard({ filters, searchQuery, setSearchQuery, refreshKey: layoutRefreshKey }) {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const result = await getAdminProductsData({ dateRange: filters.dateRange })
        if (isMounted) setData(result)
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load product inventory data.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [filters.dateRange, layoutRefreshKey])

  const filteredProducts = useMemo(() => {
    const allProducts = data?.products ?? []
    return allProducts.filter((item) => {
      const matchDistrict = filters.district === 'All Districts' || item.district === filters.district
      const matchMart = filters.ruralMart === 'All Rural Marts' || item.ruralMart.toLowerCase().includes(filters.ruralMart.toLowerCase())
      return matchDistrict && matchMart
    })
  }, [data, filters.district, filters.ruralMart])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64 text-brand-text-muted gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Loading Products &amp; Inventory…</span>
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
    <div className="space-y-6">
      <section>
        <ProductsKpiCards products={filteredProducts} />
      </section>

      <section>
        <ProductInventoryTable products={filteredProducts} onSelectProduct={setSelectedProduct} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryMovementLineChart trendData={data.trendData} />
        <Top10ProductsBarChart products={filteredProducts} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPerformanceDonutChart products={filteredProducts} />
        <StockHealthStackedBarChart products={filteredProducts} />
      </section>

      <section>
        <FastSlowMovingTable products={filteredProducts} />
      </section>

      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  )
}
