import { supabase } from '../supabaseClient'
import { getDateWindowISO } from './finance'
import { getLocalToday } from '../../utils/date'

// Must match the outreach_programs.activity_type CHECK constraint exactly.
export const ACTIVITY_TYPES = ['Animal Health Camp', 'Soil Health Workshop', 'Product Demonstration', 'FPG Mela', 'Farmer Training', 'Other']

export async function hasPriorSales(farmerId) {
  const { data, error } = await supabase.from('sales').select('id').eq('farmer_id', farmerId).limit(1)
  if (error) throw error
  return (data ?? []).length > 0
}

// attendees: [{ farmerId, animalsCovered, isNewCustomer }]
export async function logOutreachProgram({ ruralMartId, programDate, activityType, activityBrief, village, topicsCovered, productsDemonstrated, attendees }) {
  const { data, error } = await supabase.rpc('log_outreach_program', {
    p_rural_mart_id: ruralMartId,
    p_program_date: programDate || getLocalToday(),
    p_activity_type: activityType,
    p_activity_brief: activityBrief || null,
    p_village: village,
    p_topics_covered: topicsCovered,
    p_products_demonstrated: productsDemonstrated,
    p_attendees: attendees.map((a) => ({ farmer_id: a.farmerId, animals_covered: a.animalsCovered, is_new_customer: a.isNewCustomer })),
  })

  if (error) throw error
  return data
}

export async function getOwnerOutreachSummary(ruralMartId, dateRange) {
  const { start, end } = getDateWindowISO(dateRange)

  const { data: programs, error } = await supabase.from('outreach_programs').select('id').eq('rural_mart_id', ruralMartId).gte('program_date', start).lte('program_date', end)
  if (error) throw error

  const programIds = (programs ?? []).map((p) => p.id)
  let attendance = []
  if (programIds.length > 0) {
    const { data, error: attError } = await supabase.from('outreach_attendance').select('farmer_id, is_new_customer, animals_covered').in('outreach_program_id', programIds)
    if (attError) throw attError
    attendance = data ?? []
  }

  return {
    totalSessions: (programs ?? []).length,
    farmersReached: new Set(attendance.map((a) => a.farmer_id)).size,
    newFarmers: attendance.filter((a) => a.is_new_customer).length,
    animalsCovered: attendance.reduce((sum, a) => sum + (a.animals_covered || 0), 0),
  }
}

export async function getRecentOutreachPrograms(ruralMartId, limit = 20) {
  const { data: programs, error } = await supabase
    .from('outreach_programs')
    .select('id, program_date, activity_type, activity_brief, village, topics_covered, products_demonstrated, created_at')
    .eq('rural_mart_id', ruralMartId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error

  const programsList = programs ?? []
  const programIds = programsList.map((p) => p.id)
  let attendance = []
  if (programIds.length > 0) {
    const { data, error: attError } = await supabase.from('outreach_attendance').select('outreach_program_id, farmer_id, is_new_customer, animals_covered').in('outreach_program_id', programIds)
    if (attError) throw attError
    attendance = data ?? []
  }

  return programsList.map((p) => {
    const att = attendance.filter((a) => a.outreach_program_id === p.id)
    return {
      id: p.id,
      date: p.program_date,
      activityType: p.activity_type,
      activityBrief: p.activity_brief,
      village: p.village,
      topicsCovered: p.topics_covered || [],
      productsDemonstrated: p.products_demonstrated || [],
      attended: att.length,
      newFarmers: att.filter((a) => a.is_new_customer).length,
      animalsCovered: att.reduce((sum, a) => sum + (a.animals_covered || 0), 0),
    }
  })
}
