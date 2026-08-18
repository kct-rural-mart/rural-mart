import { supabase } from '../../lib/supabaseClient';
import type { ChartDataPoint, RuralMartData, TimeGrouping } from '../../shared/types';

type MartRow = { id: string; reference_code: string; mart_name: string; entrepreneur_name: string; mobile_number: string | null; email: string; district: string };
type SaleRow = { id: string; rural_mart_id: string; farmer_id: string; sale_date: string; total_amount: number | string };

function dateWindow(label: string) {
  const end = new Date();
  const start = new Date(end);
  if (label.includes('Quarter')) start.setMonth(end.getMonth() - 3);
  else if (label.includes('Financial Year')) start.setFullYear(end.getMonth() < 3 ? end.getFullYear() - 1 : end.getFullYear(), 3, 1);
  else if (label.includes('Year to Date')) start.setMonth(0, 1);
  else start.setDate(end.getDate() - 29);
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86_400_000));
  const previousStart = new Date(start); previousStart.setDate(start.getDate() - days);
  const iso = (value: Date) => value.toISOString().slice(0, 10);
  return { start: iso(start), end: iso(end), previousStart: iso(previousStart) };
}

function daysAgo(value?: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));
}

function clamp(value: number, max: number) { return Math.max(0, Math.min(max, value)); }

export async function getLiveRuralMarts(dateRange: string): Promise<RuralMartData[]> {
  const { start, end, previousStart } = dateWindow(dateRange);
  const [martsRes, farmersRes, productsRes, salesRes, procurementRes, outreachRes] = await Promise.all([
    supabase.from('rural_marts').select('id, reference_code, mart_name, entrepreneur_name, mobile_number, email, district').order('mart_name'),
    supabase.from('farmers').select('id, rural_mart_id, cattle_count'),
    supabase.from('products').select('id, rural_mart_id'),
    supabase.from('sales').select('id, rural_mart_id, farmer_id, sale_date, total_amount').gte('sale_date', previousStart).lte('sale_date', end),
    supabase.from('procurement').select('rural_mart_id, procurement_date, cost').gte('procurement_date', start).lte('procurement_date', end),
    supabase.from('outreach_programs').select('*').gte('program_date', start).lte('program_date', end),
  ]);

  for (const response of [martsRes, farmersRes, productsRes, salesRes, procurementRes, outreachRes]) {
    if (response.error) throw response.error;
  }

  const marts = (martsRes.data ?? []) as MartRow[];
  const farmers = farmersRes.data ?? [];
  const products = productsRes.data ?? [];
  const sales = (salesRes.data ?? []) as SaleRow[];
  const procurement = procurementRes.data ?? [];
  const outreach = outreachRes.data ?? [];
  const currentSalesByMart = new Map<string, number>();
  const currentFarmerIdsByMart = new Map<string, Set<string>>();
  const previousSalesByMart = new Map<string, number>();

  for (const sale of sales) {
    const amount = Number(sale.total_amount) || 0;
    if (sale.sale_date >= start) {
      currentSalesByMart.set(sale.rural_mart_id, (currentSalesByMart.get(sale.rural_mart_id) ?? 0) + amount);
      const ids = currentFarmerIdsByMart.get(sale.rural_mart_id) ?? new Set<string>(); ids.add(sale.farmer_id); currentFarmerIdsByMart.set(sale.rural_mart_id, ids);
    } else {
      previousSalesByMart.set(sale.rural_mart_id, (previousSalesByMart.get(sale.rural_mart_id) ?? 0) + amount);
    }
  }

  const raw = marts.map((mart) => {
    const martSales = currentSalesByMart.get(mart.id) ?? 0;
    const previousSales = previousSalesByMart.get(mart.id) ?? 0;
    const salesGrowthPercent = previousSales > 0 ? ((martSales - previousSales) / previousSales) * 100 : (martSales > 0 ? 100 : 0);
    const procurementCost = procurement.filter((row) => row.rural_mart_id === mart.id).reduce((sum, row) => sum + (Number(row.cost) || 0), 0);
    const grossProfit = martSales - procurementCost;
    const registeredFarmers = farmers.filter((row) => row.rural_mart_id === mart.id).length;
    const totalProducts = products.filter((row) => row.rural_mart_id === mart.id).length;
    const martOutreach = outreach.filter((row) => row.rural_mart_id === mart.id);
    const farmersReached = martOutreach.reduce((sum, row) => sum + (Number(row.reported_attendance_count) || 0), 0);
    const newLeads = martOutreach.reduce((sum, row) => sum + (Number(row.reported_new_leads_count) || 0), 0);
    const villagesCovered = new Set(martOutreach.map((row) => row.village).filter(Boolean)).size;
    const medicalCamps = martOutreach.filter((row) => row.activity_type === 'Animal Health Camp').length;
    const animalPopulationCovered = farmers
      .filter((row) => row.rural_mart_id === mart.id)
      .reduce((sum, row) => sum + (Number(row.cattle_count) || 0), 0);
    const totalBills = sales.filter((row) => row.rural_mart_id === mart.id && row.sale_date >= start).length;
    const latestSale = sales.filter((row) => row.rural_mart_id === mart.id).sort((a, b) => b.sale_date.localeCompare(a.sale_date))[0]?.sale_date;
    return { mart, martSales, grossProfit, registeredFarmers, totalProducts, farmersReached, newLeads, villagesCovered, medicalCamps, animalPopulationCovered, totalBills, farmerFootfall: currentFarmerIdsByMart.get(mart.id)?.size ?? 0, outreachCount: martOutreach.length, latestSale, salesGrowthPercent };
  });

  const maxFarmers = Math.max(1, ...raw.map((row) => row.registeredFarmers));
  const maxOutreach = Math.max(1, ...raw.map((row) => row.outreachCount));

  return raw.map((row): RuralMartData => {
    const margin = row.martSales > 0 ? (row.grossProfit / row.martSales) * 100 : 0;
    const scoreBreakdown = {
      salesGrowth: clamp(10 + row.salesGrowthPercent / 5, 20),
      profitability: clamp(margin, 20),
      farmerEngagement: clamp((row.registeredFarmers / maxFarmers) * 20, 20),
      outreachImpact: clamp((row.outreachCount / maxOutreach) * 15, 15),
      inventoryHealth: row.totalProducts > 0 ? 15 : 0,
      compliance: 10,
    };
    const score = Math.round(Object.values(scoreBreakdown).reduce((sum, value) => sum + value, 0));
    const recency = daysAgo(row.latestSale);
    const status = recency > 30 ? 'Inactive' : recency > 7 ? 'Delayed' : 'Active';
    return {
      id: row.mart.reference_code || row.mart.id,
      dbId: row.mart.id,
      name: row.mart.mart_name,
      district: row.mart.district,
      status,
      salesCr: row.martSales / 10_000_000,
      salesRaw: row.martSales,
      grossProfitLakhs: row.grossProfit / 100_000,
      grossProfitRaw: row.grossProfit,
      registeredFarmers: row.registeredFarmers,
      farmersReached: row.farmersReached,
      farmerFootfall: row.farmerFootfall,
      score,
      targetScore: 80,
      dataCompleteness: [row.martSales > 0, row.registeredFarmers > 0, row.totalProducts > 0, row.outreachCount > 0].filter(Boolean).length * 25,
      lastUpdated: row.latestSale ? new Date(row.latestSale).toLocaleDateString('en-IN') : 'No sales recorded',
      manager: row.mart.entrepreneur_name,
      contact: row.mart.mobile_number || row.mart.email,
      scoreBreakdown,
      salesGrowthPercent: row.salesGrowthPercent,
      totalBills: row.totalBills,
      outreachPrograms: row.outreachCount,
      villagesCovered: row.villagesCovered,
      animalPopulationCovered: row.animalPopulationCovered,
      medicalCamps: row.medicalCamps,
      newFarmers: row.newLeads,
    } as RuralMartData & { salesGrowthPercent: number };
  });
}

export async function getLiveNetworkTrend(grouping: TimeGrouping): Promise<ChartDataPoint[]> {
  const [salesRes, procurementRes] = await Promise.all([
    supabase.from('sales').select('sale_date, total_amount').order('sale_date'),
    supabase.from('procurement').select('procurement_date, cost').order('procurement_date'),
  ]);
  if (salesRes.error) throw salesRes.error;
  if (procurementRes.error) throw procurementRes.error;

  const bucketFor = (dateText: string) => {
    const date = new Date(`${dateText}T00:00:00`);
    const year = date.getFullYear();
    const month = date.getMonth();
    if (grouping === 'Yearly') return { key: `${year}`, label: `${year}` };
    if (grouping === 'Half-yearly') {
      const half = month < 6 ? 1 : 2;
      return { key: `${year}-H${half}`, label: `H${half} ${year}` };
    }
    if (grouping === 'Quarterly') {
      const quarter = Math.floor(month / 3) + 1;
      return { key: `${year}-Q${quarter}`, label: `Q${quarter} ${year}` };
    }
    return {
      key: `${year}-${String(month + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    };
  };

  const buckets = new Map<string, { label: string; sales: number; procurement: number }>();
  const add = (date: string, field: 'sales' | 'procurement', value: number) => {
    const bucket = bucketFor(date);
    const current = buckets.get(bucket.key) ?? { label: bucket.label, sales: 0, procurement: 0 };
    current[field] += value;
    buckets.set(bucket.key, current);
  };
  for (const row of salesRes.data ?? []) add(row.sale_date, 'sales', Number(row.total_amount) || 0);
  for (const row of procurementRes.data ?? []) add(row.procurement_date, 'procurement', Number(row.cost) || 0);

  const ordered = [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b));
  return ordered.map(([, row], index) => {
    const grossProfit = row.sales - row.procurement;
    const previous = index > 0 ? ordered[index - 1][1] : null;
    const previousProfit = previous ? previous.sales - previous.procurement : 0;
    const change = (current: number, prior: number) => prior
      ? `${current >= prior ? '+' : ''}${(((current - prior) / Math.abs(prior)) * 100).toFixed(1)}%`
      : '—';
    return {
      period: row.label,
      sales: Number((row.sales / 100_000).toFixed(2)),
      salesRaw: row.sales,
      grossProfit: Number((grossProfit / 100_000).toFixed(2)),
      grossProfitRaw: grossProfit,
      prevSales: previous ? Number((previous.sales / 100_000).toFixed(2)) : undefined,
      prevGrossProfit: previous ? Number((previousProfit / 100_000).toFixed(2)) : undefined,
      salesChange: change(row.sales, previous?.sales ?? 0),
      profitChange: change(grossProfit, previousProfit),
    };
  });
}
