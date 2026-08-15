import { supabase } from '../supabaseClient'
import { getDateWindowISO } from './finance'
import { buildTrendMonths, monthKey } from '../../utils/months'

// Farmers & Outreach dashboard data layer.
//
// "New" vs "Repeat" here is purchase-based (per operational_schema.sql
// section 4: repeat if the farmer has an earlier sale before this one),
// matching this page's own KPI tooltips ("2 or more transactions"). This is
// deliberately a different lens than outreach_attendance.is_new_customer,
// which tracks first-time ATTENDANCE at an outreach event, not first-time
// PURCHASE - that field drives retentionRate/activityTypeBreakdown instead,
// which are about outreach engagement, not buying behavior.
//
// Farmers have no "category" column in this schema (unlike ruralmart's mock
// FarmerRecord.category, e.g. "Dairy Farmer") - dropped rather than invented.

const TREND_MONTHS = 8
const round1 = (val) => Math.round(val * 10) / 10

export async function getFarmersOutreachData({ dateRange } = {}) {
  const { start, end } = getDateWindowISO(dateRange)
  const trendMonths = buildTrendMonths(new Date(end), TREND_MONTHS)
  const trendStartKey = trendMonths[0].key

  const [martsRes, farmersRes, salesRes, programsRes] = await Promise.all([
    supabase.from('rural_marts').select('id, mart_name, district'),
    supabase.from('farmers').select('id, rural_mart_id, name, mobile, village, gender, age, cattle_count, created_at'),
    // All-time - needed for lifetime purchase totals, last-visit, and the
    // New/Repeat classification, which are lifetime concepts, not
    // period-scoped ones.
    supabase.from('sales').select('id, rural_mart_id, farmer_id, sale_date, total_amount'),
    // Windowed to cover both the current filter period and the trailing
    // TREND_MONTHS trend charts in one fetch, same pattern as finance.js.
    supabase.from('outreach_programs').select('id, rural_mart_id, program_date, village, activity_type').gte('program_date', trendStartKey + '-01').lte('program_date', end),
  ])

  for (const res of [martsRes, farmersRes, salesRes, programsRes]) {
    if (res.error) throw res.error
  }

  const marts = martsRes.data ?? []
  const farmers = farmersRes.data ?? []
  const sales = salesRes.data ?? []
  const programs = programsRes.data ?? []

  const programIds = programs.map((p) => p.id)
  let attendance = []
  if (programIds.length > 0) {
    const { data, error } = await supabase.from('outreach_attendance').select('id, outreach_program_id, farmer_id, is_new_customer, animals_covered').in('outreach_program_id', programIds)
    if (error) throw error
    attendance = data ?? []
  }

  const martById = new Map(marts.map((m) => [m.id, m]))

  // --- Per-farmer lifetime purchase aggregation ---
  const salesByFarmer = new Map()
  for (const s of sales) {
    const entry = salesByFarmer.get(s.farmer_id) ?? { count: 0, total: 0, lastDate: null }
    entry.count += 1
    entry.total += Number(s.total_amount)
    if (!entry.lastDate || s.sale_date > entry.lastDate) entry.lastDate = s.sale_date
    salesByFarmer.set(s.farmer_id, entry)
  }

  const farmerRecords = farmers.map((f) => {
    const s = salesByFarmer.get(f.id)
    const mart = martById.get(f.rural_mart_id)
    return {
      id: f.id,
      name: f.name,
      village: f.village || 'N/A',
      district: mart?.district || 'N/A',
      ruralMart: mart?.mart_name || 'N/A',
      ruralMartId: f.rural_mart_id,
      mobile: f.mobile,
      cattleCount: f.cattle_count || 0,
      gender: f.gender,
      age: f.age,
      totalPurchasesVal: s?.total || 0,
      totalBills: s?.count || 0,
      lastVisit: s?.lastDate || null,
      status: !s ? 'No Purchases Yet' : s.count >= 2 ? 'Repeat' : 'New',
      joinedDate: f.created_at,
    }
  })

  // --- Network-wide New vs Repeat split (all-time, purchase-based) ---
  const newCount = farmerRecords.filter((f) => f.status === 'New').length
  const repeatCount = farmerRecords.filter((f) => f.status === 'Repeat').length
  const purchasingBase = newCount + repeatCount
  const newVsRepeatDonut = [
    { name: 'Repeat Farmers', value: repeatCount, percentage: purchasingBase > 0 ? round1((repeatCount / purchasingBase) * 100) : 0 },
    { name: 'New Farmers', value: newCount, percentage: purchasingBase > 0 ? round1((newCount / purchasingBase) * 100) : 0 },
  ]

  // --- Per-mart outreach summary (KPI period-scoped) ---
  const outreachMarts = marts.map((m) => {
    const martFarmers = farmerRecords.filter((f) => f.ruralMartId === m.id)
    const martSalesAllTime = sales.filter((s) => s.rural_mart_id === m.id)
    const currentSales = martSalesAllTime.filter((s) => s.sale_date >= start && s.sale_date <= end)

    const martProgramsAll = programs.filter((p) => p.rural_mart_id === m.id)
    const martProgramsPeriod = martProgramsAll.filter((p) => p.program_date >= start && p.program_date <= end)
    const martProgramIdsPeriod = new Set(martProgramsPeriod.map((p) => p.id))
    const martAttendancePeriod = attendance.filter((a) => martProgramIdsPeriod.has(a.outreach_program_id))

    const newAttendance = martAttendancePeriod.filter((a) => a.is_new_customer).length
    const repeatAttendance = martAttendancePeriod.filter((a) => !a.is_new_customer).length
    const attendanceBase = newAttendance + repeatAttendance

    const activityTypeBreakdown = {}
    for (const p of martProgramsPeriod) {
      activityTypeBreakdown[p.activity_type] = (activityTypeBreakdown[p.activity_type] || 0) + 1
    }

    return {
      id: m.id,
      name: m.mart_name,
      district: m.district || 'N/A',
      status: currentSales.length > 0 ? 'Active' : martProgramsPeriod.length > 0 ? 'Delayed' : 'Inactive',
      totalRegisteredFarmers: martFarmers.length,
      newFarmers: martFarmers.filter((f) => f.status === 'New').length,
      repeatFarmers: martFarmers.filter((f) => f.status === 'Repeat').length,
      farmersReached: new Set(martAttendancePeriod.map((a) => a.farmer_id)).size,
      outreachProgramsConducted: martProgramsPeriod.length,
      villagesCovered: new Set(martProgramsPeriod.map((p) => p.village)).size,
      animalPopulationCovered: martAttendancePeriod.reduce((sum, a) => sum + (a.animals_covered || 0), 0),
      retentionRate: attendanceBase > 0 ? round1((repeatAttendance / attendanceBase) * 100) : 0,
      activityTypeBreakdown,
    }
  })

  // --- Monthly Farmer Growth trend (registered cumulative + new + repeat-purchase-rate) ---
  const monthlyNewCounts = new Map(trendMonths.map((m) => [m.key, 0]))
  let baselineCount = 0
  for (const f of farmerRecords) {
    // f.joinedDate is created_at (a timestamptz with an explicit offset,
    // unlike the bare sale_date/program_date strings elsewhere in this
    // file) - Date parses it correctly, but monthKey() still reads its
    // LOCAL calendar fields rather than toISOString()'s UTC ones, for the
    // same reason toLocalISODate() exists: "this month" means the caller's
    // local month, not whatever UTC lands on.
    const mk = monthKey(new Date(f.joinedDate))
    if (mk < trendStartKey) baselineCount += 1
    else if (monthlyNewCounts.has(mk)) monthlyNewCounts.set(mk, monthlyNewCounts.get(mk) + 1)
  }

  const firstPurchaseMonthByFarmer = new Map()
  for (const s of sales) {
    const mk = s.sale_date.slice(0, 7)
    const cur = firstPurchaseMonthByFarmer.get(s.farmer_id)
    if (!cur || mk < cur) firstPurchaseMonthByFarmer.set(s.farmer_id, mk)
  }
  const purchasersByMonth = new Map(trendMonths.map((m) => [m.key, new Set()]))
  for (const s of sales) {
    const mk = s.sale_date.slice(0, 7)
    if (purchasersByMonth.has(mk)) purchasersByMonth.get(mk).add(s.farmer_id)
  }

  let cumulative = baselineCount
  const growthTrend = trendMonths.map((m) => {
    cumulative += monthlyNewCounts.get(m.key) || 0
    const purchasers = purchasersByMonth.get(m.key)
    let repeatPurchasers = 0
    for (const farmerId of purchasers) {
      if (firstPurchaseMonthByFarmer.get(farmerId) < m.key) repeatPurchasers += 1
    }
    return {
      period: m.label,
      registeredFarmers: cumulative,
      newFarmers: monthlyNewCounts.get(m.key) || 0,
      repeatPurchaseRate: purchasers.size > 0 ? round1((repeatPurchasers / purchasers.size) * 100) : 0,
    }
  })

  // --- Monthly Outreach Performance trend (network-wide) ---
  const programsByMonth = new Map(trendMonths.map((m) => [m.key, []]))
  for (const p of programs) {
    const mk = p.program_date.slice(0, 7)
    if (programsByMonth.has(mk)) programsByMonth.get(mk).push(p)
  }
  const outreachTrend = trendMonths.map((m) => {
    const progs = programsByMonth.get(m.key)
    const progIds = new Set(progs.map((p) => p.id))
    const villages = new Set(progs.map((p) => p.village))
    const farmersReached = new Set(attendance.filter((a) => progIds.has(a.outreach_program_id)).map((a) => a.farmer_id)).size
    return { period: m.label, programsConducted: progs.length, villagesCovered: villages.size, farmersReached }
  })

  return { farmers: farmerRecords, outreachMarts, growthTrend, outreachTrend, newVsRepeatDonut }
}

export async function getFarmerPurchaseHistory(farmerId) {
  const { data: sales, error: salesError } = await supabase.from('sales').select('id, sale_date, bill_number, total_amount').eq('farmer_id', farmerId).order('sale_date', { ascending: false })
  if (salesError) throw salesError

  const saleIds = (sales ?? []).map((s) => s.id)
  let items = []
  if (saleIds.length > 0) {
    const { data, error } = await supabase.from('sale_items').select('id, sale_id, product_id, quantity, unit_price_at_sale').in('sale_id', saleIds)
    if (error) throw error
    items = data ?? []
  }

  const productIds = [...new Set(items.map((i) => i.product_id))]
  let products = []
  if (productIds.length > 0) {
    const { data, error } = await supabase.from('products').select('id, name, unit').in('id', productIds)
    if (error) throw error
    products = data ?? []
  }
  const productById = new Map(products.map((p) => [p.id, p]))

  return (sales ?? []).map((sale) => ({
    id: sale.id,
    date: sale.sale_date,
    billNumber: sale.bill_number,
    amount: Number(sale.total_amount),
    lineItems: items
      .filter((i) => i.sale_id === sale.id)
      .map((i) => ({
        productName: productById.get(i.product_id)?.name || 'Unknown Product',
        unit: productById.get(i.product_id)?.unit || '',
        quantity: Number(i.quantity),
        unitPrice: Number(i.unit_price_at_sale),
        lineTotal: Number(i.quantity) * Number(i.unit_price_at_sale),
      })),
  }))
}
