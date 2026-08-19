drop function if exists public.record_outreach_aggregate(
  uuid, date, text, text, text, text[], integer
);
drop function if exists public.record_outreach_aggregate(
  uuid, date, text, text, text, text[], integer, uuid[]
);
drop function if exists public.record_outreach_aggregate(
  uuid, date, text, text, text, text[], integer, text[]
);

create or replace function public.record_outreach_aggregate(
  p_rural_mart_id uuid,
  p_program_date date,
  p_activity_type text,
  p_activity_brief text,
  p_village text,
  p_topics_covered text[],
  p_total_attendance integer,
  p_attending_farmer_codes text[] default '{}'
)
returns table (
  program_id uuid,
  reported_attendance_count integer,
  registered_attendance_count integer,
  reported_new_leads_count integer
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_program_id uuid;
  v_farmer_code text;
  v_registered_attendance integer;
  v_new_count integer;
begin
  if p_total_attendance is null or p_total_attendance < 0 then
    raise exception 'Total attendance must be zero or greater';
  end if;
  if p_village is null or btrim(p_village) = '' then
    raise exception 'Village is required';
  end if;

  select count(distinct upper(btrim(code)))::integer
  into v_registered_attendance
  from unnest(coalesce(p_attending_farmer_codes, '{}'::text[])) as codes(code)
  where btrim(code) <> '';

  if v_registered_attendance > p_total_attendance then
    raise exception 'Verified registered attendees cannot exceed total attendance';
  end if;

  -- Every supplied Farmer ID must exist and belong to this Rural Mart.
  for v_farmer_code in
    select distinct upper(btrim(code))
    from unnest(coalesce(p_attending_farmer_codes, '{}'::text[])) as codes(code)
    where btrim(code) <> ''
  loop
    if not exists (
      select 1 from public.farmers
      where upper(farmer_code) = v_farmer_code
        and rural_mart_id = p_rural_mart_id
    ) then
      raise exception 'Farmer ID % is not registered with this Rural Mart', v_farmer_code;
    end if;
  end loop;

  v_registered_attendance := coalesce(v_registered_attendance, 0);
  v_new_count := p_total_attendance - v_registered_attendance;

  insert into public.outreach_programs (
    rural_mart_id, program_date, activity_type, activity_brief,
    village, topics_covered, products_demonstrated,
    reported_attendance_count, reported_new_leads_count
  ) values (
    p_rural_mart_id, coalesce(p_program_date, current_date), p_activity_type,
    nullif(btrim(p_activity_brief), ''), btrim(p_village),
    coalesce(p_topics_covered, '{}'), '{}',
    p_total_attendance, v_new_count
  ) returning id into v_program_id;

  insert into public.outreach_attendance (
    outreach_program_id, farmer_id, is_new_customer, animals_covered
  )
  select v_program_id, farmer.id, false, 0
  from public.farmers farmer
  join (
    select distinct upper(btrim(code)) as farmer_code
    from unnest(coalesce(p_attending_farmer_codes, '{}'::text[])) as codes(code)
    where btrim(code) <> ''
  ) attendees on upper(farmer.farmer_code) = attendees.farmer_code
  where farmer.rural_mart_id = p_rural_mart_id;

  return query select v_program_id, p_total_attendance, v_registered_attendance, v_new_count;
end;
$$;

grant execute on function public.record_outreach_aggregate(
  uuid, date, text, text, text, text[], integer, text[]
) to authenticated;

-- Make the new RPC signature immediately visible to the Supabase Data API.
notify pgrst, 'reload schema';
