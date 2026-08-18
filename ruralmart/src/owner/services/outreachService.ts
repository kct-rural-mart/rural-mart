import { supabase } from '../../lib/supabaseClient';

const ACTIVITY_TYPES = ['Animal Health Camp', 'Soil Health Workshop', 'Product Demonstration', 'FPG Mela', 'Farmer Training', 'Other'];

export interface OwnerOutreachProgram {
  id: string; program_date: string; activity_type: string; activity_brief: string | null;
  village: string; topics_covered: string[];
  reported_attendance_count?: number; reported_new_leads_count?: number;
}

export interface OutreachRegisteredFarmer {
  id: string;
  farmer_code: string;
  name: string;
  mobile: string;
  village: string | null;
}

function validActivity(value: string) {
  if (value === 'Soil Health Camp') return 'Soil Health Workshop';
  return ACTIVITY_TYPES.includes(value) ? value : 'Other';
}

export async function getOwnerOutreachPrograms(ruralMartId: string): Promise<OwnerOutreachProgram[]> {
  if (!ruralMartId) return [];
  const { data, error } = await supabase.from('outreach_programs').select('*')
    .eq('rural_mart_id', ruralMartId).order('program_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as OwnerOutreachProgram[];
}

export async function getRegisteredFarmerCount(ruralMartId: string): Promise<number> {
  if (!ruralMartId) return 0;
  const { count, error } = await supabase
    .from('farmers')
    .select('id', { count: 'exact', head: true })
    .eq('rural_mart_id', ruralMartId);
  if (error) throw error;
  return count ?? 0;
}

export async function getOutreachRegisteredFarmers(ruralMartId: string): Promise<OutreachRegisteredFarmer[]> {
  if (!ruralMartId) return [];
  const { data, error } = await supabase
    .from('farmers')
    .select('id, farmer_code, name, mobile, village')
    .eq('rural_mart_id', ruralMartId)
    .order('farmer_code');
  if (error) throw error;
  return (data ?? []) as OutreachRegisteredFarmer[];
}

export async function createOwnerOutreachProgram(input: {
  ruralMartId: string; date: string; activityType: string; description: string;
  village: string; topics: string[]; attended: number; attendingFarmerCodes: string[];
}) {
  const result = await supabase.rpc('record_outreach_aggregate', {
    p_rural_mart_id: input.ruralMartId,
    p_program_date: input.date,
    p_activity_type: validActivity(input.activityType),
    p_activity_brief: input.description || '',
    p_village: input.village,
    p_topics_covered: input.topics,
    p_total_attendance: input.attended,
    p_attending_farmer_codes: [...new Set(input.attendingFarmerCodes)],
  });
  if (result.error) throw result.error;
  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  return {
    id: row.program_id,
    program_date: input.date,
    activity_type: validActivity(input.activityType),
    activity_brief: input.description || null,
    village: input.village,
    topics_covered: input.topics,
    reported_attendance_count: Number(row.reported_attendance_count) || 0,
    reported_new_leads_count: Number(row.reported_new_leads_count) || 0,
  } as OwnerOutreachProgram;
}

export async function updateOwnerOutreachProgram(id: string, input: {
  activityType: string; description: string; village: string; topics: string[];
  attended: number; newLeads: number;
}) {
  const { error } = await supabase.from('outreach_programs').update({
    activity_type: validActivity(input.activityType), activity_brief: input.description || null,
    village: input.village, topics_covered: input.topics,
    reported_attendance_count: input.attended,
    reported_new_leads_count: input.newLeads,
  }).eq('id', id);
  if (error) throw error;
}

export async function deleteOwnerOutreachProgram(id: string) {
  const { error } = await supabase.from('outreach_programs').delete().eq('id', id);
  if (error) throw error;
}
