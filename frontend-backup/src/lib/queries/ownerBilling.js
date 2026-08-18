import { supabase } from '../supabaseClient'
import { getLocalToday } from '../../utils/date'

// Owner Billing (Add Sale) data layer - the real backing for BillingPanel.jsx.

export async function searchFarmers(ruralMartId, query) {
  const term = query.trim()
  if (!term) return []

  const { data, error } = await supabase
    .from('farmers')
    .select('id, name, mobile, village, gender, age, cattle_count, created_at')
    .eq('rural_mart_id', ruralMartId)
    .or(`name.ilike.%${term}%,mobile.ilike.%${term}%`)
    .limit(10)

  if (error) throw error
  return data ?? []
}

export async function addFarmer({ ruralMartId, name, mobile, village, gender, age, cattleCount }) {
  const { data, error } = await supabase
    .from('farmers')
    .insert({
      rural_mart_id: ruralMartId,
      name,
      mobile,
      village,
      gender: gender || null,
      age: age || null,
      cattle_count: cattleCount || 0,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// items: [{ productId, quantity, unitPrice }]
export async function recordSale({ ruralMartId, farmerId, saleDate, items }) {
  const { data, error } = await supabase.rpc('record_sale', {
    p_rural_mart_id: ruralMartId,
    p_farmer_id: farmerId,
    p_sale_date: saleDate || getLocalToday(),
    p_items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity, unit_price: i.unitPrice })),
  })

  if (error) throw error
  return Array.isArray(data) ? data[0] : data
}

export async function getFarmerDirectory(ruralMartId) {
  const { data, error } = await supabase.from('farmers').select('id, name, mobile, village, gender, age, cattle_count, created_at').eq('rural_mart_id', ruralMartId).order('name')

  if (error) throw error
  return (data ?? []).map((f) => ({
    id: f.id,
    name: f.name,
    mobile: f.mobile,
    village: f.village,
    gender: f.gender,
    age: f.age,
    cattleCount: f.cattle_count || 0,
    joinedDate: f.created_at,
  }))
}

export async function getRecentSales(ruralMartId, limit = 20) {
  const { data: sales, error } = await supabase
    .from('sales')
    .select('id, farmer_id, sale_date, bill_number, total_amount, created_at')
    .eq('rural_mart_id', ruralMartId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  const salesList = sales ?? []
  if (salesList.length === 0) return []

  const farmerIds = [...new Set(salesList.map((s) => s.farmer_id))]
  const saleIds = salesList.map((s) => s.id)

  const [farmersRes, itemsRes] = await Promise.all([
    supabase.from('farmers').select('id, name').in('id', farmerIds),
    supabase.from('sale_items').select('sale_id, product_id, quantity, unit_price_at_sale').in('sale_id', saleIds),
  ])
  if (farmersRes.error) throw farmersRes.error
  if (itemsRes.error) throw itemsRes.error

  const farmerById = new Map((farmersRes.data ?? []).map((f) => [f.id, f.name]))
  const items = itemsRes.data ?? []

  const productIds = [...new Set(items.map((i) => i.product_id))]
  let products = []
  if (productIds.length > 0) {
    const { data, error: productsError } = await supabase.from('products').select('id, name, unit').in('id', productIds)
    if (productsError) throw productsError
    products = data ?? []
  }
  const productById = new Map(products.map((p) => [p.id, p]))

  return salesList.map((s) => ({
    id: s.id,
    farmerName: farmerById.get(s.farmer_id) || 'Unknown',
    saleDate: s.sale_date,
    billNumber: s.bill_number,
    amount: Number(s.total_amount),
    createdAt: s.created_at,
    lineItems: items
      .filter((i) => i.sale_id === s.id)
      .map((i) => ({
        productName: productById.get(i.product_id)?.name || 'Unknown',
        unit: productById.get(i.product_id)?.unit || '',
        quantity: Number(i.quantity),
        unitPrice: Number(i.unit_price_at_sale),
        lineTotal: Number(i.quantity) * Number(i.unit_price_at_sale),
      })),
  }))
}
