import { supabase } from '../../lib/supabaseClient';
import { getOwnerProducts } from './productService';

export interface OwnerOverviewData {
  salesRecords: Array<{ date: string; amount: number }>;
  expenseRecords: Array<{ date: string; amount: number }>;
  purchaseRecords: Array<{ date: string; amount: number }>;
  productRecords: Array<{
    id: string;
    name: string;
    category: string;
    supplier: string;
    unit: string;
    costPrice: number;
    sellingPrice: number;
    salesQty: number;
    stockQty: number;
  }>;
  newFarmerLeads: number;
  totalFarmersReached: number;
  convertedFarmers: number;
}

export async function getOwnerOverview(ruralMartId: string): Promise<OwnerOverviewData> {
  if (!ruralMartId) {
    return {
      salesRecords: [], expenseRecords: [], purchaseRecords: [], productRecords: [],
      newFarmerLeads: 0, totalFarmersReached: 0, convertedFarmers: 0,
    };
  }

  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - 29);
  const periodStartIso = `${periodStart.toISOString().slice(0, 10)}T00:00:00`;

  const [sales, expenses, procurement, farmers, products] = await Promise.all([
    supabase.from('sales').select('farmer_id, sale_date, total_amount').eq('rural_mart_id', ruralMartId),
    supabase.from('expenses').select('expense_date, amount').eq('rural_mart_id', ruralMartId),
    supabase.from('procurement').select('procurement_date, cost').eq('rural_mart_id', ruralMartId),
    supabase.from('farmers').select('id, created_at').eq('rural_mart_id', ruralMartId),
    getOwnerProducts(ruralMartId),
  ]);

  for (const result of [sales, expenses, procurement, farmers]) {
    if (result.error) throw result.error;
  }

  const newFarmerIds = new Set(
    (farmers.data ?? [])
      .filter((farmer) => String(farmer.created_at) >= periodStartIso)
      .map((farmer) => farmer.id),
  );
  const convertedFarmers = new Set(
    (sales.data ?? [])
      .filter((sale) => newFarmerIds.has(sale.farmer_id))
      .map((sale) => sale.farmer_id),
  ).size;

  return {
    salesRecords: (sales.data ?? []).map((row) => ({ date: row.sale_date, amount: Number(row.total_amount) })),
    expenseRecords: (expenses.data ?? []).map((row) => ({ date: row.expense_date, amount: Number(row.amount) })),
    purchaseRecords: (procurement.data ?? []).map((row) => ({ date: row.procurement_date, amount: Number(row.cost) })),
    productRecords: products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      supplier: product.supplier,
      unit: product.unit,
      costPrice: product.costPrice,
      sellingPrice: product.price,
      salesQty: product.salesQty,
      stockQty: product.stockQty,
    })),
    newFarmerLeads: newFarmerIds.size,
    totalFarmersReached: (farmers.data ?? []).length,
    convertedFarmers,
  };
}
