import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import ProductsInventoryDashboard from '../../components/admin/products-inventory/ProductsInventoryDashboard'

export default function InventoryPage() {
  const { filters, refreshKey } = useOutletContext()
  const [searchQuery, setSearchQuery] = useState('')
  return <ProductsInventoryDashboard filters={filters} searchQuery={searchQuery} setSearchQuery={setSearchQuery} refreshKey={refreshKey} />
}
