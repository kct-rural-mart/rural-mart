import { supabase } from '../supabaseClient'

// The owner's own rural_marts row - name, district, contact details.
// ruralMartId always comes from the caller's own profile.rural_mart_id
// (AuthContext), never from user input, so RLS's owner-scoped SELECT
// policy on rural_marts always matches this exact row.
export async function getOwnerRuralMart(ruralMartId) {
  if (!ruralMartId) return null

  const { data, error } = await supabase
    .from('rural_marts')
    .select('id, mart_name, district, entrepreneur_name, mobile_number, email, village, block')
    .eq('id', ruralMartId)
    .single()

  if (error) throw error
  return data
}

export async function updateOwnerRuralMart(ruralMartId, { martName, entrepreneurName, mobileNumber }) {
  const { data, error } = await supabase
    .from('rural_marts')
    .update({ mart_name: martName, entrepreneur_name: entrepreneurName, mobile_number: mobileNumber })
    .eq('id', ruralMartId)
    .select()
    .single()

  if (error) throw error
  return data
}
