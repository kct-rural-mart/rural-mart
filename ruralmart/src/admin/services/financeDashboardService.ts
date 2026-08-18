import { supabase } from '../../lib/supabaseClient';
import type { BillsGrowthPoint, FinancialTrendPoint, MartFinancialRecord, RevenueOpexPoint } from '../../shared/types';

export interface LiveFinanceData { marts: MartFinancialRecord[]; trend: FinancialTrendPoint[]; revenueOpex: RevenueOpexPoint[]; bills: BillsGrowthPoint[] }
const display = (value: number) => value >= 10_000_000 ? `₹${(value / 10_000_000).toFixed(2)} Cr` : value >= 100_000 ? `₹${(value / 100_000).toFixed(1)} L` : `₹${Math.round(value).toLocaleString('en-IN')}`;

export async function getLiveFinance(): Promise<LiveFinanceData> {
  const [martsRes, salesRes, procurementRes, expensesRes] = await Promise.all([
    supabase.from('rural_marts').select('id, mart_name, district'),
    supabase.from('sales').select('id, rural_mart_id, sale_date, total_amount'),
    supabase.from('procurement').select('rural_mart_id, procurement_date, cost'),
    supabase.from('expenses').select('rural_mart_id, expense_date, amount'),
  ]);
  for (const result of [martsRes, salesRes, procurementRes, expensesRes]) if (result.error) throw result.error;
  const marts = martsRes.data ?? []; const sales = salesRes.data ?? []; const procurement = procurementRes.data ?? []; const expenses = expensesRes.data ?? [];
  const start = new Date(); start.setDate(start.getDate() - 29); const startKey = start.toISOString().slice(0, 10);
  const previous = new Date(start); previous.setDate(previous.getDate() - 30); const previousKey = previous.toISOString().slice(0, 10);
  const financialMarts = marts.map((mart): MartFinancialRecord => {
    const currentSales = sales.filter((row) => row.rural_mart_id === mart.id && row.sale_date >= startKey); const previousSales = sales.filter((row) => row.rural_mart_id === mart.id && row.sale_date >= previousKey && row.sale_date < startKey);
    const revenue = currentSales.reduce((sum, row) => sum + Number(row.total_amount), 0); const previousRevenue = previousSales.reduce((sum, row) => sum + Number(row.total_amount), 0);
    const proc = procurement.filter((row) => row.rural_mart_id === mart.id && row.procurement_date >= startKey).reduce((sum, row) => sum + Number(row.cost), 0);
    const opex = expenses.filter((row) => row.rural_mart_id === mart.id && row.expense_date >= startKey).reduce((sum, row) => sum + Number(row.amount), 0);
    const gross = revenue - proc; const net = gross - opex; const growth = previousRevenue ? ((revenue - previousRevenue) / previousRevenue) * 100 : revenue ? 100 : 0;
    return { id: mart.id, name: mart.mart_name, district: mart.district, status: currentSales.length ? 'Active' : proc ? 'Delayed' : 'Inactive', salesRaw: revenue, salesDisplay: display(revenue), procurementRaw: proc, procurementDisplay: display(proc), grossProfitRaw: gross, grossProfitDisplay: display(gross), netProfitRaw: net, netProfitDisplay: display(net), operatingExpensesRaw: opex, opexDisplay: display(opex), profitMargin: revenue ? Math.round((net / revenue) * 1000) / 10 : 0, avgBillValue: currentSales.length ? Math.round(revenue / currentSales.length) : 0, totalBills: currentSales.length, salesGrowthPercent: Math.round(growth * 10) / 10, trend: growth > .5 ? 'up' : growth < -.5 ? 'down' : 'flat', sparklineData: [] };
  });
  const months = Array.from({ length: 8 }, (_, index) => { const date = new Date(); date.setDate(1); date.setMonth(date.getMonth() - (7 - index)); return { key: date.toISOString().slice(0, 7), period: date.toLocaleDateString('en-IN', { month: 'short' }) }; });
  const monthly = months.map((month) => { const revenue = sales.filter((row) => row.sale_date.startsWith(month.key)).reduce((sum, row) => sum + Number(row.total_amount), 0); const proc = procurement.filter((row) => row.procurement_date.startsWith(month.key)).reduce((sum, row) => sum + Number(row.cost), 0); const opex = expenses.filter((row) => row.expense_date.startsWith(month.key)).reduce((sum, row) => sum + Number(row.amount), 0); const bills = sales.filter((row) => row.sale_date.startsWith(month.key)).length; return { period: month.period, revenue, proc, opex, bills }; });
  const trend = monthly.map((row): FinancialTrendPoint => ({ period: row.period, sales: row.revenue / 100_000, procurement: row.proc / 100_000, grossProfit: (row.revenue - row.proc) / 100_000, netProfit: (row.revenue - row.proc - row.opex) / 100_000 }));
  const revenueOpex = monthly.map((row): RevenueOpexPoint => ({ period: row.period, revenue: row.revenue / 100_000, cogs: row.proc / 100_000, opex: row.opex / 100_000, netProfit: (row.revenue - row.proc - row.opex) / 100_000 }));
  const bills = monthly.map((row, index): BillsGrowthPoint => { const previousBills = monthly[index - 1]?.bills ?? 0; return { period: row.period, bills: row.bills, growthPercent: previousBills ? Math.round(((row.bills - previousBills) / previousBills) * 1000) / 10 : row.bills ? 100 : 0, avgBillValue: row.bills ? Math.round(row.revenue / row.bills) : 0 }; });
  return { marts: financialMarts, trend, revenueOpex, bills };
}
