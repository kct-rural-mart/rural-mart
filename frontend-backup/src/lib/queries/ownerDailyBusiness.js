import { supabase } from '../supabaseClient'
import { getFinanceDashboardData, getDateWindowISO } from './finance'

// Owner Daily Business - a read-only summary derived from the same real
// sales data and the same formulas as Admin's Finance/Rural Marts pages
// (getFinanceDashboardData), not a separate manually-entered "operational
// metrics" log. RLS already scopes an owner's queries to their own
// rural_mart_id, so financialMarts contains exactly one entry here.
export async function getOwnerDailyBusinessData({ ruralMartId, dateRange } = {}) {
  const finance = await getFinanceDashboardData({ dateRange })
  const mart = finance.financialMarts.find((m) => m.id === ruralMartId) ?? null

  const { start, end } = getDateWindowISO(dateRange)
  const { data, error } = await supabase.from('sales').select('farmer_id').eq('rural_mart_id', ruralMartId).gte('sale_date', start).lte('sale_date', end)
  if (error) throw error

  // Daily Footfall, per operational_schema.sql section 4:
  // COUNT(DISTINCT farmer_id) grouped by rural_mart_id, sale_date.
  const footfall = new Set((data ?? []).map((s) => s.farmer_id)).size

  return {
    salesRaw: mart?.salesRaw ?? 0,
    salesDisplay: mart?.salesDisplay ?? '₹0',
    totalBills: mart?.totalBills ?? 0,
    avgBillValue: mart?.avgBillValue ?? 0,
    salesGrowthPercent: mart?.salesGrowthPercent ?? 0,
    trend: mart?.trend ?? 'flat',
    footfall,
    trendData: finance.trendData,
    billsGrowthData: finance.billsGrowthData,
  }
}

// Opening/closing stock are network-wide unit counts (summed across every
// product), not per-product - matching the "Automated Operational Metrics"
// panel on Daily Business. closingStock = openingStock + procured - sold
// within the window, avoiding a second full cumulative pass.
export async function getOperationalMetrics(ruralMartId, dateRange) {
  const { start, end } = getDateWindowISO(dateRange)

  const [procurementRes, salesRes] = await Promise.all([
    supabase.from('procurement').select('quantity, cost, procurement_date').eq('rural_mart_id', ruralMartId),
    supabase.from('sales').select('id, sale_date').eq('rural_mart_id', ruralMartId),
  ])
  if (procurementRes.error) throw procurementRes.error
  if (salesRes.error) throw salesRes.error

  const procurement = procurementRes.data ?? []
  const sales = salesRes.data ?? []

  const priorProcurementQty = procurement.filter((p) => p.procurement_date < start).reduce((sum, p) => sum + Number(p.quantity), 0)
  const windowProcurement = procurement.filter((p) => p.procurement_date >= start && p.procurement_date <= end)
  const procurementQty = windowProcurement.reduce((sum, p) => sum + Number(p.quantity), 0)
  const procurementValue = windowProcurement.reduce((sum, p) => sum + Number(p.cost), 0)

  const priorSaleIds = sales.filter((s) => s.sale_date < start).map((s) => s.id)
  const windowSaleIds = sales.filter((s) => s.sale_date >= start && s.sale_date <= end).map((s) => s.id)
  const allRelevantSaleIds = [...priorSaleIds, ...windowSaleIds]

  let saleItems = []
  if (allRelevantSaleIds.length > 0) {
    const { data, error } = await supabase.from('sale_items').select('sale_id, quantity').in('sale_id', allRelevantSaleIds)
    if (error) throw error
    saleItems = data ?? []
  }
  const priorSaleIdSet = new Set(priorSaleIds)
  const windowSaleIdSet = new Set(windowSaleIds)
  const priorSalesQty = saleItems.filter((i) => priorSaleIdSet.has(i.sale_id)).reduce((sum, i) => sum + Number(i.quantity), 0)
  const salesQty = saleItems.filter((i) => windowSaleIdSet.has(i.sale_id)).reduce((sum, i) => sum + Number(i.quantity), 0)

  const openingStock = priorProcurementQty - priorSalesQty
  const closingStock = openingStock + procurementQty - salesQty

  return { openingStock, closingStock, procurementQty, procurementValue, salesQty }
}
