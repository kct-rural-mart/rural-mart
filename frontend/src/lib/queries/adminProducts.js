import { supabase } from '../supabaseClient'
import { getDateWindowISO } from './finance'
import { buildTrendMonths } from '../../utils/months'

// Admin Products & Inventory data layer - network-wide (all marts), unlike
// ownerProducts.js which RLS-scopes to one mart.
//
// Current stock qty (per product), per operational_schema.sql section 2:
//   COALESCE(SUM(procurement.quantity), 0) - COALESCE(SUM(sale_items.quantity), 0)
// computed all-time (stock is a running total, not period-scoped).
// Procurement/Sales quantities and values ARE period-scoped to the
// dateRange filter, matching every other admin page's convention.
//
// No reorder_level column exists on products, so - same decision already
// made for Owner's Product & Inventory page - there is no "Low Stock"
// tier here either, only the unambiguous "Out of Stock" (qty <= 0).

const TREND_MONTHS = 8

export async function getAdminProductsData({ dateRange } = {}) {
  const { start, end } = getDateWindowISO(dateRange)
  const trendMonths = buildTrendMonths(new Date(end), TREND_MONTHS)
  const trendStartDate = `${trendMonths[0].key}-01`

  const [martsRes, productsRes, procurementRes, salesRes] = await Promise.all([
    supabase.from('rural_marts').select('id, mart_name, district'),
    supabase.from('products').select('id, rural_mart_id, category, name, unit, purchase_price, selling_price'),
    supabase.from('procurement').select('product_id, rural_mart_id, quantity, cost, procurement_date'),
    supabase.from('sales').select('id, rural_mart_id, sale_date'),
  ])
  for (const res of [martsRes, productsRes, procurementRes, salesRes]) {
    if (res.error) throw res.error
  }

  const marts = martsRes.data ?? []
  const products = productsRes.data ?? []
  const procurement = procurementRes.data ?? []
  const sales = salesRes.data ?? []

  const saleIds = sales.map((s) => s.id)
  let saleItems = []
  if (saleIds.length > 0) {
    const { data, error } = await supabase.from('sale_items').select('sale_id, product_id, quantity').in('sale_id', saleIds)
    if (error) throw error
    saleItems = data ?? []
  }
  const saleDateById = new Map(sales.map((s) => [s.id, s.sale_date]))
  const martById = new Map(marts.map((m) => [m.id, m]))

  const productRecords = products.map((p) => {
    const proc = procurement.filter((x) => x.product_id === p.id)
    const items = saleItems.filter((x) => x.product_id === p.id)

    const stockQty = proc.reduce((sum, x) => sum + Number(x.quantity), 0) - items.reduce((sum, x) => sum + Number(x.quantity), 0)

    const procWindow = proc.filter((x) => x.procurement_date >= start && x.procurement_date <= end)
    const procuredQty = procWindow.reduce((sum, x) => sum + Number(x.quantity), 0)
    const procuredValue = procWindow.reduce((sum, x) => sum + Number(x.cost), 0)

    const itemsWindow = items.filter((x) => {
      const d = saleDateById.get(x.sale_id)
      return d && d >= start && d <= end
    })
    const soldQty = itemsWindow.reduce((sum, x) => sum + Number(x.quantity), 0)

    const purchasePrice = Number(p.purchase_price)
    const sellingPrice = Number(p.selling_price)
    const mart = martById.get(p.rural_mart_id)

    return {
      id: p.id,
      name: p.name,
      category: p.category,
      unit: p.unit,
      ruralMart: mart?.mart_name || 'N/A',
      district: mart?.district || 'N/A',
      purchasePrice,
      sellingPrice,
      stockQty,
      inventoryValue: purchasePrice * stockQty,
      procuredQty,
      procuredValue,
      soldQty,
      revenue: soldQty * sellingPrice,
      status: stockQty <= 0 ? 'Out of Stock' : 'Healthy',
    }
  })

  // Network-wide monthly inventory movement (last TREND_MONTHS months),
  // independent of the district/mart filters applied to products above -
  // matches the convention already established for Finance/Rural Marts.
  const monthBuckets = trendMonths.map((m) => ({ ...m, procurement: 0, sales: 0 }))
  const bucketIndex = new Map(monthBuckets.map((b, i) => [b.key, i]))

  for (const x of procurement) {
    const idx = bucketIndex.get(x.procurement_date.slice(0, 7))
    if (idx === undefined) continue
    monthBuckets[idx].procurement += Number(x.quantity)
  }
  for (const item of saleItems) {
    const d = saleDateById.get(item.sale_id)
    if (!d) continue
    const idx = bucketIndex.get(d.slice(0, 7))
    if (idx === undefined) continue
    monthBuckets[idx].sales += Number(item.quantity)
  }

  const priorProcuredQty = procurement.filter((x) => x.procurement_date < trendStartDate).reduce((sum, x) => sum + Number(x.quantity), 0)
  const priorSoldQty = saleItems
    .filter((x) => {
      const d = saleDateById.get(x.sale_id)
      return d && d < trendStartDate
    })
    .reduce((sum, x) => sum + Number(x.quantity), 0)

  let runningStock = priorProcuredQty - priorSoldQty
  const trendData = monthBuckets.map((b) => {
    const openingStock = runningStock
    const closingStock = openingStock + b.procurement - b.sales
    runningStock = closingStock
    return { period: b.label, openingStock, procurement: b.procurement, sales: b.sales, closingStock }
  })

  return { products: productRecords, trendData }
}
