import { supabase } from '../../lib/supabaseClient';

export const PRODUCT_CATEGORIES = [
  'Farm Equipment',
  'Feed',
  'Mineral Mixtures',
  'Fodder Seeds',
  'Veterinary Medicines',
  'Seeds',
  'Fertilizers',
  'Other',
] as const;

export interface OwnerProduct {
  id: string;
  code: string;
  name: string;
  category: string;
  supplier: string;
  price: number;
  costPrice: number;
  stockQty: number;
  unit: string;
  procurementQty: number;
  procurementValue: number;
  openingStockQty: number;
  salesQty: number;
  salesValue: number;
  reorderLevel: number;
  isLowStock: boolean;
}

export async function getOwnerProducts(ruralMartId: string): Promise<OwnerProduct[]> {
  if (!ruralMartId) return [];

  const [productsResult, procurementResult, salesResult] = await Promise.all([
    supabase.from('products').select('id, category, name, unit, purchase_price, selling_price, created_at').eq('rural_mart_id', ruralMartId),
    supabase.from('procurement').select('product_id, quantity, cost, supplier_name, procurement_date').eq('rural_mart_id', ruralMartId),
    supabase.from('sales').select('id').eq('rural_mart_id', ruralMartId),
  ]);

  if (productsResult.error) throw productsResult.error;
  if (procurementResult.error) throw procurementResult.error;
  if (salesResult.error) throw salesResult.error;

  const saleIds = (salesResult.data ?? []).map((sale) => sale.id);
  const saleItemsResult = saleIds.length
    ? await supabase.from('sale_items').select('product_id, quantity, unit_price_at_sale').in('sale_id', saleIds)
    : { data: [], error: null };
  if (saleItemsResult.error) throw saleItemsResult.error;

  return (productsResult.data ?? []).map((product, index) => {
    const procurements = (procurementResult.data ?? []).filter((row) => row.product_id === product.id);
    const soldItems = (saleItemsResult.data ?? []).filter((row) => row.product_id === product.id);
    const procurementQty = procurements.reduce((sum, row) => sum + Number(row.quantity), 0);
    const procurementValue = procurements.reduce((sum, row) => sum + Number(row.cost), 0);
    const salesQty = soldItems.reduce((sum, row) => sum + Number(row.quantity), 0);
    const salesValue = soldItems.reduce((sum, row) => sum + Number(row.quantity) * Number(row.unit_price_at_sale), 0);
    const stockQty = procurementQty - salesQty;
    const latestProcurement = [...procurements].sort((a, b) => String(b.procurement_date).localeCompare(String(a.procurement_date)))[0];

    return {
      id: product.id,
      code: `PRD-${String(index + 1001).padStart(4, '0')}`,
      name: product.name,
      category: product.category,
      supplier: latestProcurement?.supplier_name ?? '',
      price: Number(product.selling_price),
      costPrice: Number(product.purchase_price),
      stockQty,
      unit: product.unit,
      procurementQty,
      procurementValue,
      openingStockQty: 0,
      salesQty,
      salesValue,
      reorderLevel: 35,
      isLowStock: stockQty <= 35,
    };
  });
}

export async function addOwnerProduct(input: {
  ruralMartId: string;
  name: string;
  category: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  openingQuantity: number;
  supplier: string;
}) {
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      rural_mart_id: input.ruralMartId,
      name: input.name,
      category: input.category,
      unit: input.unit,
      purchase_price: input.purchasePrice,
      selling_price: input.sellingPrice,
    })
    .select('id')
    .single();
  if (error) throw error;

  if (input.openingQuantity > 0) {
    const { error: procurementError } = await supabase.from('procurement').insert({
      rural_mart_id: input.ruralMartId,
      product_id: product.id,
      quantity: input.openingQuantity,
      cost: input.openingQuantity * input.purchasePrice,
      supplier_name: input.supplier || null,
      procurement_date: new Date().toISOString().slice(0, 10),
    });
    if (procurementError) {
      await supabase.from('products').delete().eq('id', product.id);
      throw procurementError;
    }
  }

  return product;
}

export async function updateOwnerProduct(productId: string, updates: {
  name: string;
  category: string;
  unit: string;
  sellingPrice: number;
}) {
  const { error } = await supabase
    .from('products')
    .update({ name: updates.name, category: updates.category, unit: updates.unit, selling_price: updates.sellingPrice })
    .eq('id', productId);
  if (error) throw error;
}

export async function deleteOwnerProduct(productId: string) {
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw error;
}

export async function recordOwnerProcurement(input: {
  ruralMartId: string;
  productId: string;
  quantity: number;
  pricePerUnit: number;
  supplier: string;
}) {
  const { error } = await supabase.from('procurement').insert({
    rural_mart_id: input.ruralMartId,
    product_id: input.productId,
    quantity: input.quantity,
    cost: input.quantity * input.pricePerUnit,
    supplier_name: input.supplier || null,
    procurement_date: new Date().toISOString().slice(0, 10),
  });
  if (error) throw error;
}
