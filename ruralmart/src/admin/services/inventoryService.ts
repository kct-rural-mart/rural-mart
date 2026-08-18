import { supabase } from '../../lib/supabaseClient';
import type { InventoryMovementDataPoint, ProductInventoryRecord, TopProductDataPoint } from '../../shared/types';

export interface AdminInventoryData {
  products: ProductInventoryRecord[];
  movement: InventoryMovementDataPoint[];
  topProducts: TopProductDataPoint[];
}

function dateStart(label: string) {
  const date = new Date();
  if (label.includes('Quarter')) date.setMonth(date.getMonth() - 3);
  else if (label.includes('Financial Year')) date.setFullYear(date.getMonth() < 3 ? date.getFullYear() - 1 : date.getFullYear(), 3, 1);
  else if (label.includes('Year to Date')) date.setMonth(0, 1);
  else date.setDate(date.getDate() - 29);
  return date.toISOString().slice(0, 10);
}

export async function getAdminInventory(dateRange: string): Promise<AdminInventoryData> {
  const start = dateStart(dateRange);
  const end = new Date().toISOString().slice(0, 10);
  const [martsRes, productsRes, procurementRes, salesRes] = await Promise.all([
    supabase.from('rural_marts').select('id, mart_name, district'),
    supabase.from('products').select('id, rural_mart_id, category, name, unit, purchase_price, selling_price, created_at'),
    supabase.from('procurement').select('product_id, rural_mart_id, quantity, cost, procurement_date'),
    supabase.from('sales').select('id, rural_mart_id, sale_date').lte('sale_date', end),
  ]);
  for (const result of [martsRes, productsRes, procurementRes, salesRes]) if (result.error) throw result.error;

  const marts = martsRes.data ?? [];
  const sourceProducts = productsRes.data ?? [];
  const procurement = procurementRes.data ?? [];
  const sales = salesRes.data ?? [];
  const saleIds = sales.map((sale) => sale.id);
  const saleItemsRes = saleIds.length
    ? await supabase.from('sale_items').select('sale_id, product_id, quantity, unit_price_at_sale').in('sale_id', saleIds)
    : { data: [], error: null };
  if (saleItemsRes.error) throw saleItemsRes.error;
  const saleItems = saleItemsRes.data ?? [];
  const martById = new Map(marts.map((mart) => [mart.id, mart]));
  const saleDateById = new Map(sales.map((sale) => [sale.id, sale.sale_date]));

  const products = sourceProducts.map((product): ProductInventoryRecord => {
    const batches = procurement.filter((row) => row.product_id === product.id);
    const items = saleItems.filter((row) => row.product_id === product.id);
    const procuredAll = batches.reduce((sum, row) => sum + Number(row.quantity), 0);
    const soldAll = items.reduce((sum, row) => sum + Number(row.quantity), 0);
    const stockQty = procuredAll - soldAll;
    const periodBatches = batches.filter((row) => row.procurement_date >= start && row.procurement_date <= end);
    const periodItems = items.filter((row) => { const date = saleDateById.get(row.sale_id); return date && date >= start && date <= end; });
    const latestBatch = [...batches].sort((a, b) => b.procurement_date.localeCompare(a.procurement_date))[0];
    const mart = martById.get(product.rural_mart_id);
    return {
      id: product.id,
      code: `PRD-${product.id.slice(0, 8).toUpperCase()}`,
      name: product.name,
      category: product.category,
      ruralMart: mart?.mart_name ?? 'Unknown Rural Mart',
      district: mart?.district ?? 'Unknown',
      stockQty,
      reorderLevel: 0,
      unitPrice: Number(product.selling_price),
      salesQty: periodItems.reduce((sum, row) => sum + Number(row.quantity), 0),
      procurementQty: periodBatches.reduce((sum, row) => sum + Number(row.quantity), 0),
      inventoryValue: Math.max(0, stockQty) * Number(product.purchase_price),
      status: stockQty <= 0 ? 'Out of Stock' : 'Healthy',
      lastRestocked: latestBatch?.procurement_date ?? 'Never',
    };
  });

  const months = Array.from({ length: 8 }, (_, index) => {
    const date = new Date(); date.setDate(1); date.setMonth(date.getMonth() - (7 - index));
    return { key: date.toISOString().slice(0, 7), period: date.toLocaleDateString('en-IN', { month: 'short' }) };
  });
  const firstMonth = `${months[0].key}-01`;
  let runningStock = procurement.filter((row) => row.procurement_date < firstMonth).reduce((sum, row) => sum + Number(row.quantity), 0)
    - saleItems.filter((row) => (saleDateById.get(row.sale_id) ?? '') < firstMonth).reduce((sum, row) => sum + Number(row.quantity), 0);
  const movement = months.map((month): InventoryMovementDataPoint => {
    const procured = procurement.filter((row) => row.procurement_date.startsWith(month.key)).reduce((sum, row) => sum + Number(row.quantity), 0);
    const sold = saleItems.filter((row) => (saleDateById.get(row.sale_id) ?? '').startsWith(month.key)).reduce((sum, row) => sum + Number(row.quantity), 0);
    const openingStock = runningStock; runningStock += procured - sold;
    return { period: month.period, openingStock, procurement: procured, sales: sold, closingStock: runningStock };
  });

  const topProducts = products
    .filter((product) => product.salesQty > 0)
    .sort((a, b) => b.salesQty - a.salesQty)
    .slice(0, 10)
    .map((product) => ({ name: product.name, category: product.category, salesQty: product.salesQty, revenue: product.salesQty * product.unitPrice }));
  return { products, movement, topProducts };
}
