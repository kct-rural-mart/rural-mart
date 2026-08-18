import { supabase } from '../../lib/supabaseClient';

export interface OwnerRuralMart {
  id: string;
  mart_name: string;
  entrepreneur_name: string;
  mobile_number: string | null;
  district: string;
  block: string;
  village: string;
  email?: string | null;
  gst_number?: string | null;
  reference_code?: string | null;
  opening_date?: string | null;
  status?: string;
}

export async function getOwnerRuralMart(ruralMartId: string): Promise<OwnerRuralMart> {
  const { data, error } = await supabase
    .from('rural_marts')
    .select('*')
    .eq('id', ruralMartId)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    throw new Error(
      'No Rural Mart record is linked to this owner account. The mart may have been deleted; ask an administrator to recreate or re-approve the owner account.',
    );
  }
  return data as OwnerRuralMart;
}

export async function updateOwnerRuralMart(
  ruralMartId: string,
  updates: Pick<OwnerRuralMart, 'mart_name' | 'entrepreneur_name' | 'mobile_number'>,
) {
  const { data, error } = await supabase
    .from('rural_marts')
    .update(updates)
    .eq('id', ruralMartId)
    .select()
    .single();
  if (error) throw error;
  return data as OwnerRuralMart;
}
