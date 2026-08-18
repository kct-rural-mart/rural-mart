import { supabase } from '../supabaseClient'

// Owner Product & Inventory data layer.
//
// Current stock qty (per product), per operational_schema.sql section 2:
//   COALESCE(SUM(procurement.quantity), 0) - COALESCE(SUM(sale_items.quantity), 0)
// Inventory valuation = purchase_price * current stock qty.
//
// Category values here must exactly match the products.category CHECK
// constraint in operational_schema.sql - kept as a single exported list so
// the dropdown can never drift from what the database will actually accept.
export const PRODUCT_CATEGORIES = ['Farm Equipment', 'Feed', 'Mineral Mixtures', 'Fodder Seeds', 'Veterinary Medicines', 'Seeds', 'Fertilizers', 'Other']

export async function getOwnerProducts(ruralMartId) {
  if (!ruralMartId) return []

  const [productsRes, procurementRes, salesRes] = await Promise.all([
    supabase.from('products').select('id, category, name, unit, purchase_price, selling_price, created_at').eq('rural_mart_id', ruralMartId),
    supabase.from('procurement').select('product_id, quantity, cost, supplier_name, procurement_date').eq('rural_mart_id', ruralMartId),
    supabase.from('sales').select('id').eq('rural_mart_id', ruralMartId),
  ])

  for (const res of [productsRes, procurementRes, salesRes]) {
    if (res.error) throw res.error
  }

  const products = productsRes.data ?? []
  const procurement = procurementRes.data ?? []
  const saleIds = (salesRes.data ?? []).map((s) => s.id)

  let saleItems = []
  if (saleIds.length > 0) {
    const { data, error } = await supabase.from('sale_items').select('product_id, quantity').in('sale_id', saleIds)
    if (error) throw error
    saleItems = data ?? []
  }

  return products.map((p) => {
    const procuredQty = procurement.filter((row) => row.product_id === p.id).reduce((sum, row) => sum + Number(row.quantity), 0)
    const soldQty = saleItems.filter((row) => row.product_id === p.id).reduce((sum, row) => sum + Number(row.quantity), 0)
    const stockQty = procuredQty - soldQty
    const purchasePrice = Number(p.purchase_price)
    const sellingPrice = Number(p.selling_price)

    return {
      id: p.id,
      category: p.category,
      name: p.name,
      unit: p.unit,
      purchasePrice,
      sellingPrice,
      stockQty,
      soldQty,
      inventoryValue: purchasePrice * stockQty,
      revenue: soldQty * sellingPrice,
      createdAt: p.created_at,
    }
  })
}

export async function addProduct({ ruralMartId, category, name, unit, purchasePrice, sellingPrice }) {
  const { data, error } = await supabase
    .from('products')
    .insert({
      rural_mart_id: ruralMartId,
      category,
      name,
      unit,
      purchase_price: purchasePrice,
      selling_price: sellingPrice,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProductPrices(productId, { purchasePrice, sellingPrice }) {
  const { data, error } = await supabase.from('products').update({ purchase_price: purchasePrice, selling_price: sellingPrice }).eq('id', productId).select().single()

  if (error) throw error
  return data
}

export async function recordProcurement({ ruralMartId, productId, quantity, cost, supplierName, procurementDate }) {
  const { data, error } = await supabase
    .from('procurement')
    .insert({
      rural_mart_id: ruralMartId,
      product_id: productId,
      quantity,
      cost,
      supplier_name: supplierName || null,
      procurement_date: procurementDate,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
