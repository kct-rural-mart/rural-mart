import { supabase } from '../supabaseClient'
import { getFinanceDashboardData, getDateWindowISO } from './finance'
import { getOwnerProducts } from './ownerProducts'

// "New Farmer Leads" = farmers registered in the selected period.
// "Conversion Rate" = of those new farmers, the % who have gone on to make
// at least one purchase (any time, not just within the period) - a real,
// well-defined "did registering them turn into a paying customer" metric.
export async function getOwnerOverviewData({ ruralMartId, dateRange } = {}) {
  const [finance, products] = await Promise.all([getFinanceDashboardData({ dateRange }), getOwnerProducts(ruralMartId)])
  const mart = finance.financialMarts.find((m) => m.id === ruralMartId) ?? null

  const { start, end } = getDateWindowISO(dateRange)
  const { data: newFarmers, error } = await supabase.from('farmers').select('id').eq('rural_mart_id', ruralMartId).gte('created_at', `${start}T00:00:00`).lte('created_at', `${end}T23:59:59`)
  if (error) throw error

  const newFarmerIds = (newFarmers ?? []).map((f) => f.id)
  let convertedCount = 0
  if (newFarmerIds.length > 0) {
    const { data: salesForNew, error: salesError } = await supabase.from('sales').select('farmer_id').in('farmer_id', newFarmerIds)
    if (salesError) throw salesError
    convertedCount = new Set((salesForNew ?? []).map((s) => s.farmer_id)).size
  }

  const topProduct = [...products].sort((a, b) => b.soldQty - a.soldQty).find((p) => p.soldQty > 0) ?? null

  return {
    salesRaw: mart?.salesRaw ?? 0,
    netProfitRaw: mart?.netProfitRaw ?? 0,
    topProduct,
    newFarmersCount: newFarmerIds.length,
    conversionRate: newFarmerIds.length > 0 ? Math.round((convertedCount / newFarmerIds.length) * 1000) / 10 : 0,
    trendData: finance.trendData,
  }
}
