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

  // Rural Mart Details
  physical_address?: string | null;
  mart_photo_url?: string | null;

  // Entrepreneur Details (KYC)
  secondary_mobile?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  qualification?: string | null;
  address_permanent?: string | null;
  address_temporary?: string | null;
  aadhaar_number?: string | null;
  pan_number?: string | null;
  entrepreneur_photo_url?: string | null;

  // Bank Details
  bank_account_number?: string | null;
  ifsc_code?: string | null;
  bank_name?: string | null;
  branch?: string | null;
}

export type OwnerRuralMartUpdate = Partial<
  Pick<
    OwnerRuralMart,
    | 'mart_name'
    | 'entrepreneur_name'
    | 'mobile_number'
    | 'district'
    | 'block'
    | 'village'
    | 'gst_number'
    | 'physical_address'
    | 'mart_photo_url'
    | 'secondary_mobile'
    | 'date_of_birth'
    | 'gender'
    | 'qualification'
    | 'address_permanent'
    | 'address_temporary'
    | 'aadhaar_number'
    | 'pan_number'
    | 'entrepreneur_photo_url'
    | 'bank_account_number'
    | 'ifsc_code'
    | 'bank_name'
    | 'branch'
  >
>;

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
  updates: OwnerRuralMartUpdate,
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

async function uploadMartPhoto(ruralMartId: string, file: File, prefix: 'mart' | 'entrepreneur'): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `marts/${ruralMartId}/${prefix}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from('registration-photos')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  return path;
}

export async function uploadOwnerMartPhoto(ruralMartId: string, file: File): Promise<string> {
  return uploadMartPhoto(ruralMartId, file, 'mart');
}

export async function uploadOwnerEntrepreneurPhoto(ruralMartId: string, file: File): Promise<string> {
  return uploadMartPhoto(ruralMartId, file, 'entrepreneur');
}
