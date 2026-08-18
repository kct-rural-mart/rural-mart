import { supabase } from '../../lib/supabaseClient';
import type { FarmerGrowthDataPoint, FarmerOutreachMartRecord, FarmerRecord, OutreachPerformanceDataPoint } from '../../shared/types';

export interface LiveFarmersOutreachData { farmers: FarmerRecord[]; marts: FarmerOutreachMartRecord[]; growth: FarmerGrowthDataPoint[]; outreach: OutreachPerformanceDataPoint[] }
export interface LiveFarmerSale { id: string; date: string; billNumber: string; amount: number; lineItems: { productName: string; unit: string; quantity: number; unitPrice: number; lineTotal: number }[]; productName?: string; salesQty?: number }

export async function getLiveFarmerSales(farmerId: string): Promise<LiveFarmerSale[]> {
  const { data: sales, error } = await supabase.from('sales').select('id, sale_date, bill_number, total_amount').eq('farmer_id', farmerId).order('sale_date', { ascending: false }); if (error) throw error;
  const saleIds = (sales ?? []).map((sale) => sale.id); const itemsRes = saleIds.length ? await supabase.from('sale_items').select('sale_id, product_id, quantity, unit_price_at_sale').in('sale_id', saleIds) : { data: [], error: null }; if (itemsRes.error) throw itemsRes.error;
  const productIds = [...new Set((itemsRes.data ?? []).map((item) => item.product_id))]; const productsRes = productIds.length ? await supabase.from('products').select('id, name, unit').in('id', productIds) : { data: [], error: null }; if (productsRes.error) throw productsRes.error; const productById = new Map((productsRes.data ?? []).map((product) => [product.id, product]));
  return (sales ?? []).map((sale) => ({ id: sale.id, date: sale.sale_date, billNumber: String(sale.bill_number), amount: Number(sale.total_amount), lineItems: (itemsRes.data ?? []).filter((item) => item.sale_id === sale.id).map((item) => ({ productName: productById.get(item.product_id)?.name ?? 'Unknown Product', unit: productById.get(item.product_id)?.unit ?? 'units', quantity: Number(item.quantity), unitPrice: Number(item.unit_price_at_sale), lineTotal: Number(item.quantity) * Number(item.unit_price_at_sale) })) }));
}

export async function getLiveFarmersOutreach(): Promise<LiveFarmersOutreachData> {
  const [martsRes, farmersRes, salesRes, programsRes] = await Promise.all([
    supabase.from('rural_marts').select('id, mart_name, district'),
    supabase.from('farmers').select('id, rural_mart_id, name, mobile, village, cattle_count, created_at'),
    supabase.from('sales').select('id, rural_mart_id, farmer_id, sale_date, total_amount'),
    supabase.from('outreach_programs').select('*'),
  ]);
  for (const result of [martsRes, farmersRes, salesRes, programsRes]) if (result.error) throw result.error;
  const marts = martsRes.data ?? []; const farmers = farmersRes.data ?? []; const sales = salesRes.data ?? []; const programs = programsRes.data ?? [];
  const martById = new Map(marts.map((mart) => [mart.id, mart]));
  const salesByFarmer = new Map<string, typeof sales>();
  for (const sale of sales) { const rows = salesByFarmer.get(sale.farmer_id) ?? []; rows.push(sale); salesByFarmer.set(sale.farmer_id, rows); }
  const farmerRecords = farmers.map((farmer): FarmerRecord => {
    const purchases = salesByFarmer.get(farmer.id) ?? []; const mart = martById.get(farmer.rural_mart_id);
    const latest = [...purchases].sort((a, b) => b.sale_date.localeCompare(a.sale_date))[0];
    return { id: farmer.id, name: farmer.name, village: farmer.village || 'Not provided', district: mart?.district || 'Unknown', ruralMart: mart?.mart_name || 'Unknown Rural Mart', category: 'Registered Farmer', animalHeadCount: Number(farmer.cattle_count) || 0, lastVisit: latest?.sale_date || 'No purchase', status: purchases.length >= 2 ? 'Repeat' : 'New', phone: farmer.mobile, totalPurchasesVal: purchases.reduce((sum, sale) => sum + Number(sale.total_amount), 0), joinedDate: farmer.created_at };
  });
  const outreachMarts = marts.map((mart): FarmerOutreachMartRecord => {
    const martFarmers = farmers.filter((farmer) => farmer.rural_mart_id === mart.id); const martSales = sales.filter((sale) => sale.rural_mart_id === mart.id); const martPrograms = programs.filter((program) => program.rural_mart_id === mart.id);
    const repeatIds = new Set(martSales.map((sale) => sale.farmer_id).filter((id) => (salesByFarmer.get(id)?.length ?? 0) >= 2));
    const newIds = new Set(martSales.map((sale) => sale.farmer_id).filter((id) => (salesByFarmer.get(id)?.length ?? 0) === 1));
    const reached = martPrograms.reduce((sum, program) => sum + (Number(program.reported_attendance_count) || 0), 0);
    return { id: mart.id, name: mart.mart_name, district: mart.district, status: martSales.length ? 'Active' : martPrograms.length ? 'Delayed' : 'Inactive', totalRegisteredFarmers: martFarmers.length, newFarmers: newIds.size, repeatFarmers: repeatIds.size, farmersReached: reached, outreachProgramsConducted: martPrograms.length, villagesCovered: new Set(martPrograms.map((program) => program.village)).size, animalPopulationCovered: 0, retentionRate: newIds.size + repeatIds.size ? Math.round((repeatIds.size / (newIds.size + repeatIds.size)) * 1000) / 10 : 0, sparklineData: [] };
  });
  const months = Array.from({ length: 8 }, (_, index) => { const date = new Date(); date.setDate(1); date.setMonth(date.getMonth() - (7 - index)); return { key: date.toISOString().slice(0, 7), period: date.toLocaleDateString('en-IN', { month: 'short' }) }; });
  const growth = months.map((month): FarmerGrowthDataPoint => { const joined = farmers.filter((farmer) => farmer.created_at.slice(0, 7) === month.key).length; const monthSales = sales.filter((sale) => sale.sale_date.startsWith(month.key)); const ids = new Set(monthSales.map((sale) => sale.farmer_id)); const repeat = [...ids].filter((id) => (salesByFarmer.get(id)?.filter((sale) => sale.sale_date < `${month.key}-01`).length ?? 0) > 0).length; return { period: month.period, registeredFarmers: farmers.filter((farmer) => farmer.created_at.slice(0, 7) <= month.key).length, newFarmers: joined, repeatFarmers: repeat }; });
  const outreach = months.map((month): OutreachPerformanceDataPoint => { const rows = programs.filter((program) => program.program_date.startsWith(month.key)); return { period: month.period, programsConducted: rows.length, farmersReached: rows.reduce((sum, row) => sum + (Number(row.reported_attendance_count) || 0), 0), villagesCovered: new Set(rows.map((row) => row.village)).size }; });
  return { farmers: farmerRecords, marts: outreachMarts, growth, outreach };
}
