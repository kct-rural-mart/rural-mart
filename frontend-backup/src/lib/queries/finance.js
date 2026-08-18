import { supabase } from '../supabaseClient'
import { toLocalISODate } from '../../utils/date'
import { buildTrendMonths } from '../../utils/months'

// Business & Finance dashboard data layer.
//
// Formulas (per database/operational_schema.sql section 9):
//   Revenue            = SUM(sales.total_amount)
//   Procurement         = SUM(procurement.cost)
//   Operating Expenses  = SUM(expenses.amount)
//   Gross Profit        = Revenue - Procurement
//   Net Profit          = Gross Profit - Operating Expenses
//
// RLS on rural_marts/sales/procurement/expenses already scopes rows to the
// caller (owner -> own rural_mart_id, admin -> unrestricted), so these
// queries never filter by rural_mart_id explicitly - Postgres does it.

const MS_PER_DAY = 24 * 60 * 60 * 1000
const TREND_MONTHS = 8
const GROWTH_FLAT_THRESHOLD = 0.5
const EXPENSE_CATEGORIES = ['Rent', 'Salaries', 'Utilities', 'Transport', 'Maintenance', 'Marketing', 'Other']

// The dateRange filter values come from two different static select lists -
// Header.jsx (Admin: 'Last 30 Days' / 'This Quarter (Q3)' / 'Financial Year
// 2026-27' / 'Year to Date 2026') and OwnerHeader.jsx (Owner: 'Today' /
// 'Last 7 Days' / 'Last 30 Days' / 'This Month'). Every label from both
// lists must be recognized here, or an unrecognized one silently falls back
// to "Last 30 Days" - which previously happened for every Owner-side option
// except 'Last 30 Days' itself, since only the Admin labels were handled.
//
// "This Quarter (Q3)" / "Financial Year 2026-27" / "Year to Date 2026" carry
// specific years/quarters in their label text, so the year is parsed out of
// the label rather than hardcoded, and the quarter is always "today's"
// calendar quarter rather than trusting the "(Q3)" text to stay accurate.
function resolveDateWindow(dateRangeLabel, now = new Date()) {
  const end = new Date(now)
  let start

  if (dateRangeLabel?.startsWith('Financial Year')) {
    const match = dateRangeLabel.match(/(\d{4})/)
    const fyStartYear = match ? Number(match[1]) : now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
    start = new Date(fyStartYear, 3, 1)
    const fyEnd = new Date(fyStartYear + 1, 2, 31)
    if (fyEnd.getTime() < end.getTime()) end.setTime(fyEnd.getTime())
  } else if (dateRangeLabel?.startsWith('Year to Date')) {
    const match = dateRangeLabel.match(/(\d{4})/)
    const year = match ? Number(match[1]) : now.getFullYear()
    start = new Date(year, 0, 1)
  } else if (dateRangeLabel?.startsWith('This Quarter')) {
    const q = Math.floor(now.getMonth() / 3)
    start = new Date(now.getFullYear(), q * 3, 1)
  } else if (dateRangeLabel === 'Today') {
    start = new Date(now)
  } else if (dateRangeLabel === 'Last 7 Days') {
    start = new Date(now)
    start.setDate(start.getDate() - 6)
  } else if (dateRangeLabel === 'This Month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
  } else {
    // 'Last 30 Days' and fallback
    start = new Date(now)
    start.setDate(start.getDate() - 29)
  }

  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  const durationMs = end.getTime() - start.getTime()
  const prevEnd = new Date(start.getTime() - MS_PER_DAY)
  const prevStart = new Date(prevEnd.getTime() - durationMs)

  return { start, end, prevStart, prevEnd }
}

function inWindow(isoDateStr, windowStart, windowEnd) {
  return isoDateStr >= toLocalISODate(windowStart) && isoDateStr <= toLocalISODate(windowEnd)
}

// Exposed so other admin pages (Rural Marts, ...) can scope their own
// period-based queries to the exact same [start, end] boundary Finance
// uses for a given dateRange filter value, instead of re-deriving it.
export function getDateWindowISO(dateRangeLabel) {
  const { start, end } = resolveDateWindow(dateRangeLabel)
  return { start: toLocalISODate(start), end: toLocalISODate(end) }
}

const toLakhs = (raw) => Math.round((raw / 100000) * 100) / 100
const round1 = (val) => Math.round(val * 10) / 10

// Amounts under 1 Lakh render as plain rupees (₹400, ₹12,500) - rounding
// straight to "L" notation made every sub-Lakh value display as ₹0.0L,
// indistinguishable from actually having no data.
export function formatLakhsCr(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`
  return `₹${Math.round(val).toLocaleString('en-IN')}`
}

function sumBy(rows, key) {
  return rows.reduce((sum, row) => sum + Number(row[key]), 0)
}

export async function getFinanceDashboardData({ dateRange } = {}) {
  const { start, end, prevStart, prevEnd } = resolveDateWindow(dateRange)

  const trendMonths = buildTrendMonths(end, TREND_MONTHS)
  const trendStart = new Date(end.getFullYear(), end.getMonth() - (TREND_MONTHS - 1), 1)
  const overallStart = new Date(Math.min(start.getTime(), prevStart.getTime(), trendStart.getTime()))

  const [martsRes, salesRes, procurementRes, expensesRes] = await Promise.all([
    supabase.from('rural_marts').select('id, mart_name, district, entrepreneur_name, mobile_number'),
    supabase
      .from('sales')
      .select('id, rural_mart_id, sale_date, total_amount')
      .gte('sale_date', toLocalISODate(overallStart))
      .lte('sale_date', toLocalISODate(end)),
    supabase
      .from('procurement')
      .select('id, rural_mart_id, procurement_date, cost')
      .gte('procurement_date', toLocalISODate(overallStart))
      .lte('procurement_date', toLocalISODate(end)),
    supabase
      .from('expenses')
      .select('id, rural_mart_id, expense_date, category, amount')
      .gte('expense_date', toLocalISODate(overallStart))
      .lte('expense_date', toLocalISODate(end)),
  ])

  for (const res of [martsRes, salesRes, procurementRes, expensesRes]) {
    if (res.error) throw res.error
  }

  const marts = martsRes.data ?? []
  const sales = salesRes.data ?? []
  const procurement = procurementRes.data ?? []
  const expenses = expensesRes.data ?? []

  const financialMarts = marts.map((mart) => {
    const martSales = sales.filter((s) => s.rural_mart_id === mart.id)
    const martProcurement = procurement.filter((p) => p.rural_mart_id === mart.id)
    const martExpenses = expenses.filter((e) => e.rural_mart_id === mart.id)

    const currentSales = martSales.filter((s) => inWindow(s.sale_date, start, end))
    const currentProcurement = martProcurement.filter((p) => inWindow(p.procurement_date, start, end))
    const currentExpenses = martExpenses.filter((e) => inWindow(e.expense_date, start, end))
    const prevSales = martSales.filter((s) => inWindow(s.sale_date, prevStart, prevEnd))
    const prevProcurement = martProcurement.filter((p) => inWindow(p.procurement_date, prevStart, prevEnd))
    const prevExpenses = martExpenses.filter((e) => inWindow(e.expense_date, prevStart, prevEnd))

    const salesRaw = sumBy(currentSales, 'total_amount')
    const procurementRaw = sumBy(currentProcurement, 'cost')
    const operatingExpensesRaw = sumBy(currentExpenses, 'amount')
    const grossProfitRaw = salesRaw - procurementRaw
    const netProfitRaw = grossProfitRaw - operatingExpensesRaw
    const totalBills = currentSales.length
    const avgBillValue = totalBills > 0 ? Math.round(salesRaw / totalBills) : 0
    const profitMargin = salesRaw > 0 ? round1((netProfitRaw / salesRaw) * 100) : 0

    const prevSalesRaw = sumBy(prevSales, 'total_amount')
    const prevProcurementRaw = sumBy(prevProcurement, 'cost')
    const prevOperatingExpensesRaw = sumBy(prevExpenses, 'amount')
    const prevGrossProfitRaw = prevSalesRaw - prevProcurementRaw
    const prevNetProfitRaw = prevGrossProfitRaw - prevOperatingExpensesRaw
    const prevTotalBills = prevSales.length

    const salesGrowthPercent = prevSalesRaw > 0 ? round1(((salesRaw - prevSalesRaw) / prevSalesRaw) * 100) : salesRaw > 0 ? 100 : 0
    const trend = salesGrowthPercent > GROWTH_FLAT_THRESHOLD ? 'up' : salesGrowthPercent < -GROWTH_FLAT_THRESHOLD ? 'down' : 'flat'

    // No "mart status" concept exists in the schema - this dashboard's own
    // convention: a bill in the window means active; procurement with no
    // sales means restocking but not yet trading (delayed); neither means
    // dormant for the period.
    const status = totalBills > 0 ? 'Active' : currentProcurement.length > 0 ? 'Delayed' : 'Inactive'

    const expenseBreakdown = {}
    for (const category of EXPENSE_CATEGORIES) {
      const total = sumBy(
        currentExpenses.filter((e) => e.category === category),
        'amount'
      )
      if (total > 0) expenseBreakdown[category] = total
    }

    return {
      id: mart.id,
      name: mart.mart_name,
      district: mart.district || 'N/A',
      status,
      salesRaw,
      salesDisplay: formatLakhsCr(salesRaw),
      procurementRaw,
      procurementDisplay: formatLakhsCr(procurementRaw),
      grossProfitRaw,
      grossProfitDisplay: formatLakhsCr(grossProfitRaw),
      netProfitRaw,
      netProfitDisplay: formatLakhsCr(netProfitRaw),
      operatingExpensesRaw,
      opexDisplay: formatLakhsCr(operatingExpensesRaw),
      profitMargin,
      avgBillValue,
      totalBills,
      salesGrowthPercent,
      trend,
      entrepreneurName: mart.entrepreneur_name,
      phone: mart.mobile_number,
      expenseBreakdown,
      prevSalesRaw,
      prevProcurementRaw,
      prevGrossProfitRaw,
      prevOperatingExpensesRaw,
      prevNetProfitRaw,
      prevTotalBills,
    }
  })

  // Network-wide monthly trend (last TREND_MONTHS months), independent of
  // the district/rural-mart/search filters applied to financialMarts above -
  // matches the source design where these three charts are always
  // network-wide.
  const monthBuckets = trendMonths.map((m) => ({ ...m, sales: 0, procurement: 0, expenses: 0, bills: 0 }))
  const bucketIndex = new Map(monthBuckets.map((b, idx) => [b.key, idx]))

  for (const s of sales) {
    const idx = bucketIndex.get(s.sale_date.slice(0, 7))
    if (idx === undefined) continue
    monthBuckets[idx].sales += Number(s.total_amount)
    monthBuckets[idx].bills += 1
  }
  for (const p of procurement) {
    const idx = bucketIndex.get(p.procurement_date.slice(0, 7))
    if (idx === undefined) continue
    monthBuckets[idx].procurement += Number(p.cost)
  }
  for (const e of expenses) {
    const idx = bucketIndex.get(e.expense_date.slice(0, 7))
    if (idx === undefined) continue
    monthBuckets[idx].expenses += Number(e.amount)
  }

  const trendData = []
  const revenueOpexData = []
  const billsGrowthData = []
  let prevMonthSales = null

  for (const b of monthBuckets) {
    const grossProfit = b.sales - b.procurement
    const netProfit = grossProfit - b.expenses

    trendData.push({
      period: b.label,
      sales: toLakhs(b.sales),
      procurement: toLakhs(b.procurement),
      grossProfit: toLakhs(grossProfit),
      netProfit: toLakhs(netProfit),
    })

    revenueOpexData.push({
      period: b.label,
      revenue: toLakhs(b.sales),
      cogs: toLakhs(b.procurement),
      opex: toLakhs(b.expenses),
      netProfit: toLakhs(netProfit),
    })

    const growthPercent = prevMonthSales !== null && prevMonthSales > 0 ? round1(((b.sales - prevMonthSales) / prevMonthSales) * 100) : 0
    billsGrowthData.push({
      period: b.label,
      bills: b.bills,
      growthPercent,
      avgBillValue: b.bills > 0 ? Math.round(b.sales / b.bills) : 0,
    })
    prevMonthSales = b.sales
  }

  return { financialMarts, trendData, revenueOpexData, billsGrowthData }
}
