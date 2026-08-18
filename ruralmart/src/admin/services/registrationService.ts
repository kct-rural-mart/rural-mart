import { supabase } from '../../lib/supabaseClient';
import type {
  RegistrationApplication,
  StoredOwnerAccount,
  StoredRuralMart,
} from '../../lib/storageService';

interface PendingRegistrationRow {
  id: string;
  mart_name: string;
  entrepreneur_name: string;
  mobile_number: string;
  email: string;
  district: string;
  block: string;
  village: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
}

function toApplication(row: PendingRegistrationRow): RegistrationApplication {
  return {
    applicationId: row.id,
    ownerName: row.entrepreneur_name,
    email: row.email,
    phone: row.mobile_number,
    ruralMartName: row.mart_name,
    district: row.district,
    block: row.block,
    village: row.village,
    address: [row.village, row.block, row.district].filter(Boolean).join(', '),
    submittedAt: new Date(row.created_at).toLocaleDateString('en-IN'),
    status: row.status,
    rejectionReason: row.rejection_reason ?? undefined,
    reviewedAt: row.status === 'pending' ? undefined : new Date(row.created_at).toLocaleDateString('en-IN'),
  };
}

export async function getRegistrationApplications(): Promise<RegistrationApplication[]> {
  const { data, error } = await supabase
    .from('pending_registrations')
    .select('id, mart_name, entrepreneur_name, mobile_number, email, district, block, village, created_at, status, rejection_reason')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as PendingRegistrationRow[]).map(toApplication);
}

async function freshAccessToken() {
  const { data } = await supabase.auth.getSession();
  const expiresAt = (data.session?.expires_at ?? 0) * 1000;
  if (data.session && expiresAt > Date.now() + 10_000) return data.session.access_token;
  const refreshed = await supabase.auth.refreshSession();
  if (refreshed.error || !refreshed.data.session) throw new Error('Your admin session has expired.');
  return refreshed.data.session.access_token;
}

async function readFunctionError(error: unknown, response?: Response): Promise<string> {
  const typedError = error as {
    message?: string;
    context?: unknown;
  };
  const context = response ?? typedError?.context;

  if (context && typeof context === 'object') {
    const responseLike = context as {
      json?: () => Promise<unknown>;
      text?: () => Promise<string>;
      error?: string;
      message?: string;
      body?: unknown;
    };

    if (typeof responseLike.json === 'function') {
      const body = await responseLike.json().catch(() => null) as { error?: string; message?: string } | null;
      if (body?.error || body?.message) return body.error ?? body.message!;
    }
    if (typeof responseLike.text === 'function') {
      const text = await responseLike.text().catch(() => '');
      if (text) {
        try {
          const body = JSON.parse(text) as { error?: string; message?: string };
          return body.error ?? body.message ?? text;
        } catch {
          return text;
        }
      }
    }
    if (responseLike.error || responseLike.message) {
      return responseLike.error ?? responseLike.message!;
    }
    if (typeof responseLike.body === 'string') return responseLike.body;
  }

  return typedError?.message ?? 'The approval function failed. Check its Supabase Edge Function logs.';
}

export async function approveRegistrationApplication(application: RegistrationApplication) {
  const token = await freshAccessToken();
  const { data, error, response } = await supabase.functions.invoke('approve-registration', {
    body: { registrationId: application.applicationId },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (error) {
    throw new Error(await readFunctionError(error, response));
  }

  const ruralMart: StoredRuralMart = {
    ruralMartId: data.martId,
    ruralMartName: application.ruralMartName,
    ownerName: application.ownerName,
    ownerEmail: data.email,
    district: application.district,
    block: application.block,
    village: application.village,
    status: 'active',
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  const owner: StoredOwnerAccount = {
    ownerId: data.ownerId,
    email: data.email,
    role: 'owner',
    ruralMartId: data.martId,
    ruralMartName: application.ruralMartName,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  return {
    application: { ...application, status: 'approved' as const },
    ruralMart,
    owner,
    temporaryPassword: data.tempPassword as string,
  };
}

export async function rejectRegistrationApplication(applicationId: string, reason: string) {
  const { error } = await supabase
    .from('pending_registrations')
    .update({ status: 'rejected', rejection_reason: reason.trim() || null })
    .eq('id', applicationId);
  if (error) throw error;
}
