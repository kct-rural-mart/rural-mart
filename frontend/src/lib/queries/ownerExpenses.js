import { supabase } from '../supabaseClient'

// Must match the expenses.category CHECK constraint in operational_schema.sql exactly.
export const EXPENSE_CATEGORIES = ['Rent', 'Salaries', 'Utilities', 'Transport', 'Maintenance', 'Marketing', 'Other']

export async function addExpense({ ruralMartId, category, amount, description, expenseDate }) {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      rural_mart_id: ruralMartId,
      category,
      amount,
      description: description || null,
      expense_date: expenseDate,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
