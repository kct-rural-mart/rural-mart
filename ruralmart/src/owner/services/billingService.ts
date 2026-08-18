import { supabase } from '../../lib/supabaseClient';
import type { CanonicalFarmer, CanonicalProduct } from '../../shared/types/storage';
import type { BillLineItem } from '../../shared/dataServices';
import { getOwnerProducts } from './productService';

export async function getBillingProducts(ruralMartId: string): Promise<CanonicalProduct[]> {
  const products = await getOwnerProducts(ruralMartId);
  return products.map((product) => ({
    id: product.id,
    ruralMartId,
    code: product.code,
    name: product.name,
    productName: product.name,
    category: product.category,
    district: '',
    supplier: product.supplier,
    supplierName: product.supplier,
    unit: product.unit,
    costPrice: product.costPrice,
    sellingPrice: product.price,
    stockQty: product.stockQty,
    procurementQty: product.procurementQty,
    procurementValue: product.procurementValue,
    openingStockQty: product.openingStockQty,
    salesQty: product.salesQty,
    salesValue: product.salesValue,
    reorderLevel: product.reorderLevel,
    status: product.stockQty === 0 ? 'Out of Stock' : product.isLowStock ? 'Low Stock' : 'Healthy',
  } as CanonicalProduct));
}

export async function getBillingFarmers(ruralMartId: string): Promise<CanonicalFarmer[]> {
  const { data, error } = await supabase
    .from('farmers')
    .select('id, farmer_code, rural_mart_id, name, mobile, village, gender, age, cattle_count, created_at')
    .eq('rural_mart_id', ruralMartId)
    .order('name');
  if (error) throw error;

  return (data ?? []).map((farmer) => ({
    id: farmer.id,
    farmerCode: farmer.farmer_code,
    ruralMartId: farmer.rural_mart_id,
    name: farmer.name,
    phone: farmer.mobile,
    village: farmer.village ?? '',
    district: '',
    registrationDate: farmer.created_at,
    animalHeadCount: farmer.cattle_count ?? 0,
    numCattle: farmer.cattle_count ?? 0,
    category: 'Farmer',
    lastVisit: '',
    status: 'New',
    totalPurchases: 0,
    totalSpent: 0,
    totalPurchasesVal: 0,
    joinedDate: farmer.created_at,
  } as CanonicalFarmer));
}

export async function addBillingFarmer(input: {
  ruralMartId: string;
  name: string;
  mobile: string;
  village: string;
  cattleCount: number;
}) {
  const { data, error } = await supabase
    .from('farmers')
    .insert({
      rural_mart_id: input.ruralMartId,
      name: input.name,
      mobile: input.mobile.replace(/\D/g, '').slice(-10),
      village: input.village,
      cattle_count: input.cattleCount,
    })
    .select('id, farmer_code, rural_mart_id, name, mobile, village, cattle_count, created_at')
    .single();
  if (error) throw error;
  return data;
}

export async function updateBillingFarmer(farmerId: string, input: { name: string; village: string; cattleCount: number }) {
  const { error } = await supabase
    .from('farmers')
    .update({ name: input.name, village: input.village, cattle_count: input.cattleCount })
    .eq('id', farmerId);
  if (error) throw error;
}

export async function recordBillingSale(input: {
  ruralMartId: string;
  farmerId: string;
  items: Array<{ productId: string; quantity: number; unitPrice: number }>;
}) {
  const { data, error } = await supabase.rpc('record_sale', {
    p_rural_mart_id: input.ruralMartId,
    p_farmer_id: input.farmerId,
    p_sale_date: new Date().toISOString().slice(0, 10),
    p_items: input.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    })),
  });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  return { billNumber: String(result?.bill_number ?? ''), totalAmount: Number(result?.total_amount ?? 0) };
}

export interface LiveBillingEntry {
  id: string;
  farmerId?: string;
  timestamp: string;
  date: string;
  category: string;
  salesValue: number;
  procurementValue: number;
  openingStock: number;
  closingStock: number;
  salesQty: number;
  procurementQty: number;
  customerBills: number;
  farmerName?: string;
  status: 'Saved' | 'Edited';
  billNumber?: string;
  lineItems?: BillLineItem[];
}

function localIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function selectedPeriod(dateRange: string) {
  const now = new Date();
  const end = localIsoDate(now);
  if (dateRange === 'Today') return { start: end, end };
  if (dateRange === 'Last 7 Days' || dateRange === 'Last 30 Days') {
    const days = dateRange === 'Last 7 Days' ? 7 : 30;
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days + 1);
    return { start: localIsoDate(startDate), end };
  }
  const monthMatch = dateRange.match(/This Month \(([A-Za-z]+) (\d{4})\)/);
  if (monthMatch) {
    const monthIndex = new Date(`${monthMatch[1]} 1, ${monthMatch[2]}`).getMonth();
    const year = Number(monthMatch[2]);
    return {
      start: localIsoDate(new Date(year, monthIndex, 1)),
      end: localIsoDate(new Date(year, monthIndex + 1, 0)),
    };
  }
  const explicitMatch = dateRange.match(/^[A-Za-z]{3}, ([A-Za-z]{3}) (\d{1,2}), (\d{4})$/);
  if (explicitMatch) {
    const parsed = new Date(`${explicitMatch[1]} ${explicitMatch[2]}, ${explicitMatch[3]}`);
    const date = localIsoDate(parsed);
    return { start: date, end: date };
  }
  return { start: '0001-01-01', end: '9999-12-31' };
}

export async function getDailyBusinessLiveData(ruralMartId: string, dateRange: string) {
  const period = selectedPeriod(dateRange);
  const [salesResult, products, farmers, procurementResult] = await Promise.all([
    supabase
      .from('sales')
      .select('id, farmer_id, sale_date, bill_number, total_amount, created_at')
      .eq('rural_mart_id', ruralMartId)
      .order('created_at', { ascending: false }),
    getBillingProducts(ruralMartId),
    getBillingFarmers(ruralMartId),
    supabase
      .from('procurement')
      .select('quantity, cost, procurement_date')
      .eq('rural_mart_id', ruralMartId),
  ]);

  if (salesResult.error) throw salesResult.error;
  if (procurementResult.error) throw procurementResult.error;

  const sales = salesResult.data ?? [];
  const saleIds = sales.map((sale) => sale.id);
  const { data: saleItems, error: saleItemsError } = saleIds.length
    ? await supabase
        .from('sale_items')
        .select('sale_id, product_id, quantity, unit_price_at_sale')
        .in('sale_id', saleIds)
    : { data: [], error: null };
  if (saleItemsError) throw saleItemsError;

  const productById = new Map(products.map((product) => [product.id, product]));
  const farmerById = new Map(farmers.map((farmer) => [farmer.id, farmer]));
  const itemsBySale = new Map<string, BillLineItem[]>();
  for (const item of saleItems ?? []) {
    const product = productById.get(item.product_id);
    const quantity = Number(item.quantity ?? 0);
    const unitPrice = Number(item.unit_price_at_sale ?? 0);
    const lineItem: BillLineItem = {
      productId: item.product_id,
      productName: product?.name ?? 'Product',
      category: product?.category ?? 'General Store',
      quantity,
      unit: product?.unit ?? 'units',
      unitPrice,
      lineTotal: quantity * unitPrice,
    };
    itemsBySale.set(item.sale_id, [...(itemsBySale.get(item.sale_id) ?? []), lineItem]);
  }

  const entries: LiveBillingEntry[] = sales.map((sale) => {
    const lineItems = itemsBySale.get(sale.id) ?? [];
    return {
      id: sale.id,
      farmerId: sale.farmer_id,
      timestamp: new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: sale.sale_date,
      category: Array.from(new Set(lineItems.map((item) => item.category))).join(', ') || 'Customer Bill',
      salesValue: Number(sale.total_amount ?? 0),
      procurementValue: 0,
      openingStock: 0,
      closingStock: 0,
      salesQty: lineItems.reduce((sum, item) => sum + item.quantity, 0),
      procurementQty: 0,
      customerBills: 1,
      farmerName: farmerById.get(sale.farmer_id)?.name ?? 'Customer',
      status: 'Saved',
      billNumber: String(sale.bill_number ?? sale.id),
      lineItems,
    };
  });

  const periodEntries = entries.filter((entry) => entry.date >= period.start && entry.date <= period.end);
  const periodProcurement = (procurementResult.data ?? []).filter(
    (row) => row.procurement_date >= period.start && row.procurement_date <= period.end
  );
  const totalSales = periodEntries.reduce((sum, entry) => sum + entry.salesValue, 0);
  const customerBills = periodEntries.length;

  return {
    metrics: {
      procurementQty: periodProcurement.reduce((sum, row) => sum + Number(row.quantity ?? 0), 0),
      procurementValue: periodProcurement.reduce((sum, row) => sum + Number(row.cost ?? 0), 0),
      openingStock: products.reduce((sum, product) => sum + Number(product.openingStockQty ?? 0), 0),
      closingStock: products.reduce((sum, product) => sum + Number(product.stockQty ?? 0), 0),
      salesQty: periodEntries.reduce((sum, entry) => sum + entry.salesQty, 0),
      totalSales,
      customerBills,
      avgBillValue: customerBills > 0 ? Math.round(totalSales / customerBills) : 0,
    },
    entries: periodEntries,
    farmers,
  };
}
