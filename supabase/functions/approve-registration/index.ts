import { createClient } from 'npm:@supabase/supabase-js@2'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

// Comma-separated list of origins allowed to call this function (ALLOWED_ORIGINS secret).
// Mirrors backend/src/main/resources/application.properties' app.cors.allowed-origins.
const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:3000']

function getAllowedOrigins(): string[] {
  const raw = Deno.env.get('ALLOWED_ORIGINS')
  if (!raw) return DEFAULT_ALLOWED_ORIGINS
  return raw.split(',').map((origin) => origin.trim()).filter(Boolean)
}

function corsHeaders(requestOrigin: string | null): HeadersInit {
  const allowedOrigins = getAllowedOrigins()
  const allowOrigin = requestOrigin && allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0]
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    Vary: 'Origin',
  }
}

function json(body: unknown, status: number, requestOrigin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(requestOrigin), 'Content-Type': 'application/json' },
  })
}

const REFERENCE_CODE_PREFIX = 'RM'
const TEMP_PASSWORD_LENGTH = 12
const PASSWORD_UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const PASSWORD_LOWERCASE = 'abcdefghijkmnopqrstuvwxyz'
const PASSWORD_DIGITS = '23456789'
const PASSWORD_SYMBOLS = '!@#$%'
const TEMP_PASSWORD_CHARS = `${PASSWORD_UPPERCASE}${PASSWORD_LOWERCASE}${PASSWORD_DIGITS}${PASSWORD_SYMBOLS}`

type AdminClient = ReturnType<typeof createClient>

// Matches Spring's `"RM" + zero-padded count of already-approved registrations`.
// Note: like the Spring version, this has a benign race under concurrent approvals
// (two admins approving at once could get the same code) - not addressed here since
// it's a pre-existing limitation being carried over, not a new gap.
async function generateReferenceCode(admin: AdminClient): Promise<string> {
  const { count, error } = await admin
    .from('pending_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  if (error) {
    throw new Error(`Failed to count approved registrations: ${error.message}`)
  }

  const next = (count ?? 0) + 1
  return `${REFERENCE_CODE_PREFIX}${String(next).padStart(4, '0')}`
}

function generateTempPassword(): string {
  const pick = (characters: string) => {
    const value = new Uint32Array(1)
    crypto.getRandomValues(value)
    return characters[value[0] % characters.length]
  }

  // Guarantee compliance with projects that require every character class.
  const password = [
    pick(PASSWORD_UPPERCASE),
    pick(PASSWORD_LOWERCASE),
    pick(PASSWORD_DIGITS),
    pick(PASSWORD_SYMBOLS),
  ]
  while (password.length < TEMP_PASSWORD_LENGTH) password.push(pick(TEMP_PASSWORD_CHARS))

  // Cryptographically shuffle so the required characters are not predictable.
  for (let index = password.length - 1; index > 0; index--) {
    const random = new Uint32Array(1)
    crypto.getRandomValues(random)
    const swapIndex = random[0] % (index + 1)
    ;[password[index], password[swapIndex]] = [password[swapIndex], password[index]]
  }
  return password.join('')
}

async function sendApprovalEmail(toEmail: string, martName: string, referenceCode: string, tempPassword: string) {
  const gmailAddress = Deno.env.get('GMAIL_SENDER_ADDRESS')
  const gmailAppPassword = Deno.env.get('GMAIL_APP_PASSWORD')
  if (!gmailAddress || !gmailAppPassword) {
    throw new Error('GMAIL_SENDER_ADDRESS / GMAIL_APP_PASSWORD are not configured')
  }

  const client = new SMTPClient({
    connection: {
      hostname: 'smtp.gmail.com',
      port: 465,
      tls: true,
      auth: { username: gmailAddress, password: gmailAppPassword },
    },
  })

  try {
    await client.send({
      from: gmailAddress,
      to: toEmail,
      subject: 'Your Rural Mart account is ready',
      content: `Hello,

Your Rural Mart registration for "${martName}" has been approved and your owner account is ready.

Reference code: ${referenceCode}
Temporary password: ${tempPassword}

Please log in and change your password on first use.

- Rural Mart Team`,
    })
  } finally {
    await client.close()
  }
}

// Best-effort teardown of whatever was created before the failure, mirroring the
// rollback Spring's RegistrationApprovalService gets for free from @Transactional.
// Each write here is a separate REST call rather than one DB transaction, so each
// created row has to be unwound individually and in reverse order. Errors are
// logged, never thrown, so a rollback failure never masks the original error.
async function rollback(
  admin: AdminClient,
  { userId, martId, profileCreated }: { userId: string; martId?: string; profileCreated?: boolean },
) {
  if (profileCreated) {
    const { error } = await admin.from('profiles').delete().eq('id', userId)
    if (error) {
      console.error(`[approve-registration] rollback: failed to delete profile ${userId}: ${error.message}`)
    }
  }
  if (martId) {
    const { error } = await admin.from('rural_marts').delete().eq('id', martId)
    if (error) {
      console.error(`[approve-registration] rollback: failed to delete rural_mart ${martId}: ${error.message}`)
    }
  }
  const { error: authError } = await admin.auth.admin.deleteUser(userId)
  if (authError) {
    console.error(`[approve-registration] rollback: failed to delete auth user ${userId}: ${authError.message}`)
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Missing Authorization header' }, 401, origin)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Scoped to the caller's own JWT - only used to find out who is calling.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user: caller },
      error: callerError,
    } = await callerClient.auth.getUser()

    if (callerError || !caller) {
      return json({ error: 'Invalid or expired session' }, 401, origin)
    }

    // Service-role client - bypasses RLS, used for every privileged write below.
    const admin = createClient(supabaseUrl, serviceRoleKey)

    const { data: callerProfile, error: callerProfileError } = await admin
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single()

    if (callerProfileError || callerProfile?.role !== 'admin') {
      return json({ error: 'Only admins can approve registrations' }, 403, origin)
    }

    const { registrationId } = await req.json().catch(() => ({}))
    if (!registrationId) {
      return json({ error: 'registrationId is required' }, 400, origin)
    }

    const { data: registration, error: registrationError } = await admin
      .from('pending_registrations')
      .select('*')
      .eq('id', registrationId)
      .single()

    if (registrationError || !registration) {
      return json({ error: 'Registration not found' }, 404, origin)
    }
    if (registration.status !== 'pending') {
      return json({ error: `Registration is already ${registration.status}` }, 409, origin)
    }

    // Generated server-side - the caller no longer supplies these.
    let username: string
    try {
      username = await generateReferenceCode(admin)
    } catch (err) {
      console.error('[approve-registration] failed to generate reference code:', err)
      return json({ error: 'Failed to prepare the new account. Please try again.' }, 500, origin)
    }
    const tempPassword = generateTempPassword()

    // 1. Create the Supabase Auth user for the new owner.
    const { data: created, error: createUserError } = await admin.auth.admin.createUser({
      email: registration.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { username, mart_name: registration.mart_name },
    })

    if (createUserError || !created?.user) {
      console.error('[approve-registration] failed to create auth user:', createUserError)
      const authMessage = createUserError?.message ?? ''
      const duplicateEmail = /already|registered|exists|duplicate/i.test(authMessage)
      return json(
        {
          error: duplicateEmail
            ? 'An Authentication user already exists for this email. Restore that owner profile or delete the old test Auth user before approving this registration.'
            : 'Failed to create the owner account. Please check the Edge Function logs and try again.',
        },
        duplicateEmail ? 409 : 500,
        origin,
      )
    }
    const newUserId = created.user.id

    // 2. Create the Rural Mart record linked to that user.
    const { data: mart, error: martError } = await admin
      .from('rural_marts')
      .insert({
        registration_id: registration.id,
        owner_id: newUserId,
        reference_code: username,
        mart_name: registration.mart_name,
        entrepreneur_name: registration.entrepreneur_name,
        mobile_number: registration.mobile_number,
        email: registration.email,
        district: registration.district,
        block: registration.block,
        village: registration.village,
        gps_lat: registration.gps_lat,
        gps_lng: registration.gps_lng,
        opening_date: registration.opening_date,
        aadhaar_number: registration.aadhaar_number,
        gst_number: registration.gst_number,
        photo_url: registration.photo_url,
      })
      .select()
      .single()

    if (martError) {
      console.error('[approve-registration] failed to create rural_mart:', martError)
      await rollback(admin, { userId: newUserId })
      return json({ error: 'Failed to create the Rural Mart record. Please try again.' }, 500, origin)
    }

    // 3. Create the profile row - this is what the login flow reads to route/gate the user.
    const { error: profileError } = await admin.from('profiles').insert({
      id: newUserId,
      role: 'owner',
      rural_mart_id: mart.id,
      must_change_password: true,
    })

    if (profileError) {
      console.error('[approve-registration] failed to create profile:', profileError)
      await rollback(admin, { userId: newUserId, martId: mart.id })
      return json({ error: 'Failed to create the owner profile. Please try again.' }, 500, origin)
    }

    // 4. Mark the registration as approved.
    const { error: updateError } = await admin
      .from('pending_registrations')
      .update({ status: 'approved' })
      .eq('id', registrationId)

    if (updateError) {
      console.error('[approve-registration] failed to update registration status:', updateError)
      await rollback(admin, { userId: newUserId, martId: mart.id, profileCreated: true })
      return json(
        { error: 'Failed to finalize the registration. Nothing was created - please try again.' },
        500,
        origin,
      )
    }

    // 5. Send the credentials to the entrepreneur. Account is already fully created at
    // this point - a failed email is not worth rolling back for; the admin falls back
    // to sharing credentials manually, reflected in the response note below.
    let emailSent = false
    try {
      await sendApprovalEmail(registration.email, registration.mart_name, username, tempPassword)
      emailSent = true
    } catch (err) {
      console.error(`[approve-registration] approval email to ${registration.email} failed:`, err)
    }

    return json(
      {
        success: true,
        martId: mart.id,
        ownerId: newUserId,
        email: registration.email,
        username,
        tempPassword,
        emailSent,
        note: emailSent
          ? "Credentials were emailed to the owner. They're also shown here in case you need to share them manually."
          : 'Automatic email delivery failed - share these credentials with the owner manually.',
      },
      200,
      origin,
    )
  } catch (err) {
    console.error('[approve-registration] unexpected error:', err)
    return json({ error: 'Unexpected error. Please try again.' }, 500, origin)
  }
})
