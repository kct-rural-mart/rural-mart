import { supabase } from '../supabaseClient'
import { getFinanceDashboardData, getDateWindowISO } from './finance'
import { daysSince } from '../../utils/date'

// Rural Marts dashboard data layer.
//
// Reuses Finance's per-mart financial aggregates (same Revenue/Procurement/
// Gross Profit/Net Profit/status/growth formulas, same date window) instead
// of recomputing them, then layers on farmer/outreach/product counts that
// Finance doesn't need.
//
// No "Performance Score" here - ruralmart's source design ranks marts with
// an invented 0-100 "6-factor NABARD composite" that has no basis in this
// schema. Per explicit decision, that's dropped: KPIs, sorting, and chart
// coloring use real, directly-computed metrics (Net Profit, Sales Growth,
// Profit Margin) instead.

export async function getRuralMartsDashboardData({ dateRange } = {}) {
  const finance = await getFinanceDashboardData({ dateRange })
  const martIds = finance.financialMarts.map((m) => m.id)

  if (martIds.length === 0) {
    return { marts: [], trendData: finance.trendData, billsGrowthData: finance.billsGrowthData }
  }

  const { start, end } = getDateWindowISO(dateRange)

  const [farmersRes, programsRes, productsRes, lastSaleRes] = await Promise.all([
    supabase.from('farmers').select('id, rural_mart_id').in('rural_mart_id', martIds),
    supabase
      .from('outreach_programs')
      .select('id, rural_mart_id, village')
      .in('rural_mart_id', martIds)
      .gte('program_date', start)
      .lte('program_date', end),
    supabase.from('products').select('id, rural_mart_id').in('rural_mart_id', martIds),
    // All-time, only the two columns needed to find each mart's most recent
    // sale - drives "Last Updated" / sync-recency, independent of the
    // period-based Active/Delayed/Inactive status from Finance.
    supabase.from('sales').select('rural_mart_id, sale_date').in('rural_mart_id', martIds).order('sale_date', { ascending: false }),
  ])

  for (const res of [farmersRes, programsRes, productsRes, lastSaleRes]) {
    if (res.error) throw res.error
  }

  const farmers = farmersRes.data ?? []
  const programs = programsRes.data ?? []
  const products = productsRes.data ?? []
  const salesByRecency = lastSaleRes.data ?? []

  const programIds = programs.map((p) => p.id)
  let attendance = []
  if (programIds.length > 0) {
    const { data, error } = await supabase.from('outreach_attendance').select('id, outreach_program_id, farmer_id, animals_covered').in('outreach_program_id', programIds)
    if (error) throw error
    attendance = data ?? []
  }

  const lastSaleDateByMart = new Map()
  for (const s of salesByRecency) {
    // Rows arrive sorted by sale_date descending, so the first hit per mart
    // is its most recent sale.
    if (!lastSaleDateByMart.has(s.rural_mart_id)) lastSaleDateByMart.set(s.rural_mart_id, s.sale_date)
  }

  const marts = finance.financialMarts.map((fm) => {
    const martFarmers = farmers.filter((f) => f.rural_mart_id === fm.id)
    const martPrograms = programs.filter((p) => p.rural_mart_id === fm.id)
    const martProducts = products.filter((p) => p.rural_mart_id === fm.id)
    const martProgramIds = new Set(martPrograms.map((p) => p.id))
    const martAttendance = attendance.filter((a) => martProgramIds.has(a.outreach_program_id))

    const lastSaleDate = lastSaleDateByMart.get(fm.id) || null
    const daysSinceLastSale = daysSince(lastSaleDate)

    return {
      ...fm,
      registeredFarmers: martFarmers.length,
      outreachProgramsConducted: martPrograms.length,
      villagesCovered: new Set(martPrograms.map((p) => p.village)).size,
      animalsCoveredOutreach: martAttendance.reduce((sum, a) => sum + (a.animals_covered || 0), 0),
      farmersReachedOutreach: new Set(martAttendance.map((a) => a.farmer_id)).size,
      totalProducts: martProducts.length,
      lastSaleDate,
      daysSinceLastSale,
    }
  })

  return { marts, trendData: finance.trendData, billsGrowthData: finance.billsGrowthData }
}
