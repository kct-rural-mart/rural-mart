import { supabase } from '../../lib/supabaseClient';
import type { FinancialEntryRecord } from '../../shared/dataServices';

function databaseExpenseCategory(category: string) {
  return category.trim() || 'Other Expense';
}

export async function getOwnerExpenses(ruralMartId: string): Promise<FinancialEntryRecord[]> {
  if (!ruralMartId) return [];
  const { data, error } = await supabase.from('expenses')
    .select('id, rural_mart_id, expense_date, category, amount, description, created_at')
    .eq('rural_mart_id', ruralMartId)
    .order('expense_date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    financialRecordId: row.id,
    ruralMartId: row.rural_mart_id,
    category: row.category,
    amount: Number(row.amount),
    date: row.expense_date,
    description: row.description ?? '',
    createdAt: row.created_at,
  } as FinancialEntryRecord));
}

export async function addOwnerExpense(input: {
  ruralMartId: string; category: string; amount: number; date: string; description: string;
}) {
  const { error } = await supabase.from('expenses').insert({
    rural_mart_id: input.ruralMartId,
    expense_date: input.date,
    category: databaseExpenseCategory(input.category),
    amount: input.amount,
    description: input.description || null,
  });
  if (error) throw error;
}

export async function deleteOwnerExpense(expenseId: string) {
  const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
  if (error) throw error;
}
