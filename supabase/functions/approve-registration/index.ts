import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Missing Authorization header' }, 401)
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
      return json({ error: 'Invalid or expired session' }, 401)
    }

    // Service-role client - bypasses RLS, used for every privileged write below.
    const admin = createClient(supabaseUrl, serviceRoleKey)

    const { data: callerProfile, error: callerProfileError } = await admin
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single()

    if (callerProfileError || callerProfile?.role !== 'admin') {
      return json({ error: 'Only admins can approve registrations' }, 403)
    }

    const { registrationId, username, tempPassword } = await req.json()
    if (!registrationId || !username || !tempPassword) {
      return json({ error: 'registrationId, username and tempPassword are required' }, 400)
    }

    const { data: registration, error: registrationError } = await admin
      .from('pending_registrations')
      .select('*')
      .eq('id', registrationId)
      .single()

    if (registrationError || !registration) {
      return json({ error: 'Registration not found' }, 404)
    }
    if (registration.status !== 'pending') {
      return json({ error: `Registration is already ${registration.status}` }, 409)
    }

    // 1. Create the Supabase Auth user for the new owner.
    const { data: created, error: createUserError } = await admin.auth.admin.createUser({
      email: registration.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { username, mart_name: registration.mart_name },
    })

    if (createUserError || !created?.user) {
      return json({ error: `Failed to create auth user: ${createUserError?.message}` }, 500)
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
      await admin.auth.admin.deleteUser(newUserId)
      return json({ error: `Failed to create Rural Mart record: ${martError.message}` }, 500)
    }

    // 3. Create the profile row - this is what the login flow reads to route/gate the user.
    const { error: profileError } = await admin.from('profiles').insert({
      id: newUserId,
      role: 'owner',
      rural_mart_id: mart.id,
      must_change_password: true,
    })

    if (profileError) {
      await admin.auth.admin.deleteUser(newUserId)
      await admin.from('rural_marts').delete().eq('id', mart.id)
      return json({ error: `Failed to create profile: ${profileError.message}` }, 500)
    }

    const { error: updateError } = await admin
      .from('pending_registrations')
      .update({ status: 'approved' })
      .eq('id', registrationId)

    if (updateError) {
      return json(
        { error: `Account created but failed to update registration status: ${updateError.message}` },
        500
      )
    }

    // 4. Send the credentials to the entrepreneur.
    // TODO: wire up a real transactional email provider here (Resend, Postmark, SES...).
    // Supabase's built-in SMTP only fires on its own auth events (signup/magic-link/reset),
    // it has no API for sending an arbitrary custom email, so this needs a separate provider.
    // Until that's configured, log the credentials so they're visible via
    // `supabase functions logs approve-registration` and return them in the response for testing.
    console.log(
      `[approve-registration] Credentials for ${registration.email}: username=${username} tempPassword=${tempPassword}`
    )

    return json({
      success: true,
      martId: mart.id,
      ownerId: newUserId,
      email: registration.email,
      username,
      tempPassword,
      emailSent: false,
      note: 'Email sending is not configured yet - credentials are logged server-side and returned here for testing only.',
    })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500)
  }
})
