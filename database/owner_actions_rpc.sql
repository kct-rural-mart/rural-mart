-- =====================================================================
-- Rural Mart — Owner Data-Entry RPCs
-- =====================================================================
-- Two atomic multi-table writes the Owner-side UI needs (Add Sale, Log
-- Outreach Program). Both insert into a parent + child table together;
-- wrapping each in a single plpgsql function makes that atomic for free
-- (a function body is one transaction - any exception rolls back every
-- insert it already made).
--
-- Both are `security invoker`, NOT `security definer`: they run as the
-- calling authenticated user, so every insert they perform is still
-- checked against the existing RLS policies in operational_schema.sql
-- (owner -> own rural_mart_id, admin -> unrestricted). This function
-- grants no privilege the caller didn't already have via RLS - it only
-- makes "insert a sale + all its line items" a single round trip instead
-- of N, and rejects the request atomically if any line item is invalid.
--
-- Beyond RLS, each function also checks that the referenced farmer_id /
-- product_id actually belongs to p_rural_mart_id - foreign keys alone
-- don't enforce that a product used in a sale belongs to the same mart
-- as the sale itself.
--
-- Run once, in the Supabase SQL editor, after operational_schema.sql.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. record_sale
--    p_items: jsonb array of {product_id, quantity, unit_price}
--    Returns the new sale's id, human-readable bill_number, and total.
-- ---------------------------------------------------------------------
create or replace function public.record_sale(
  p_rural_mart_id uuid,
  p_farmer_id     uuid,
  p_sale_date     date,
  p_items         jsonb
)
returns table (sale_id uuid, bill_number bigint, total_amount numeric)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_sale_id     uuid;
  v_bill_number bigint;
  v_total       numeric(12,2) := 0;
  v_item        jsonb;
  v_product_id  uuid;
  v_quantity    numeric;
  v_unit_price  numeric;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one product line item is required';
  end if;

  if not exists (
    select 1 from public.farmers
    where id = p_farmer_id and rural_mart_id = p_rural_mart_id
  ) then
    raise exception 'Farmer % does not belong to this Rural Mart', p_farmer_id;
  end if;

  -- Validate every line item and compute the total before writing
  -- anything, so a bad item aborts cleanly with no partial insert.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity   := (v_item->>'quantity')::numeric;
    v_unit_price := (v_item->>'unit_price')::numeric;

    if not exists (
      select 1 from public.products
      where id = v_product_id and rural_mart_id = p_rural_mart_id
    ) then
      raise exception 'Product % does not belong to this Rural Mart', v_product_id;
    end if;

    if v_quantity <= 0 then
      raise exception 'Quantity must be greater than zero';
    end if;
    if v_unit_price < 0 then
      raise exception 'Unit price cannot be negative';
    end if;

    v_total := v_total + (v_quantity * v_unit_price);
  end loop;

  if v_total <= 0 then
    raise exception 'Sale total must be greater than zero';
  end if;

  insert into public.sales (rural_mart_id, farmer_id, sale_date, total_amount)
  values (p_rural_mart_id, p_farmer_id, coalesce(p_sale_date, current_date), v_total)
  returning id, public.sales.bill_number into v_sale_id, v_bill_number;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.sale_items (sale_id, product_id, quantity, unit_price_at_sale)
    values (
      v_sale_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::numeric,
      (v_item->>'unit_price')::numeric
    );
  end loop;

  return query select v_sale_id, v_bill_number, v_total;
end;
$$;

grant execute on function public.record_sale(uuid, uuid, date, jsonb) to authenticated;

-- ---------------------------------------------------------------------
-- 2. log_outreach_program
--    p_attendees: jsonb array of {farmer_id, animals_covered, is_new_customer}
--    Returns the new outreach_programs.id.
--
--    outreach_attendance has UNIQUE(outreach_program_id, farmer_id) - if
--    the same farmer_id appears twice in p_attendees, the second insert
--    fails the unique constraint and the whole call rolls back. That's
--    intentional (fail loudly on a duplicate attendee, don't silently
--    dedupe), but the frontend should also dedupe client-side so a user
--    doesn't hit this as a confusing runtime error.
-- ---------------------------------------------------------------------
create or replace function public.log_outreach_program(
  p_rural_mart_id         uuid,
  p_program_date          date,
  p_activity_type         text,
  p_activity_brief        text,
  p_village               text,
  p_topics_covered        text[],
  p_products_demonstrated text[],
  p_attendees             jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_program_id uuid;
  v_attendee   jsonb;
  v_farmer_id  uuid;
begin
  if p_village is null or btrim(p_village) = '' then
    raise exception 'Village is required';
  end if;
  if p_attendees is null or jsonb_array_length(p_attendees) = 0 then
    raise exception 'At least one attendee is required';
  end if;

  for v_attendee in select * from jsonb_array_elements(p_attendees)
  loop
    v_farmer_id := (v_attendee->>'farmer_id')::uuid;
    if not exists (
      select 1 from public.farmers
      where id = v_farmer_id and rural_mart_id = p_rural_mart_id
    ) then
      raise exception 'Farmer % does not belong to this Rural Mart', v_farmer_id;
    end if;
  end loop;

  insert into public.outreach_programs (
    rural_mart_id, program_date, activity_type, activity_brief,
    village, topics_covered, products_demonstrated
  )
  values (
    p_rural_mart_id,
    coalesce(p_program_date, current_date),
    p_activity_type,
    p_activity_brief,
    p_village,
    coalesce(p_topics_covered, '{}'),
    coalesce(p_products_demonstrated, '{}')
  )
  returning id into v_program_id;

  for v_attendee in select * from jsonb_array_elements(p_attendees)
  loop
    insert into public.outreach_attendance (outreach_program_id, farmer_id, is_new_customer, animals_covered)
    values (
      v_program_id,
      (v_attendee->>'farmer_id')::uuid,
      coalesce((v_attendee->>'is_new_customer')::boolean, false),
      coalesce((v_attendee->>'animals_covered')::integer, 0)
    );
  end loop;

  return v_program_id;
end;
$$;

grant execute on function public.log_outreach_program(uuid, date, text, text, text, text[], text[], jsonb) to authenticated;

-- =====================================================================
-- End of script
-- =====================================================================
