-- Owner Settings page becomes editable: entrepreneur/KYC/bank fields move onto
-- rural_marts (the live, current record) instead of staying trapped in
-- pending_registrations (which has no owner SELECT/UPDATE access at all, and
-- is meant to stay a frozen record of the original application).
--
-- All new columns are nullable. Existing approved marts will simply show
-- these fields blank in Settings until the owner fills them in — no backfill
-- from pending_registrations, by agreement.

alter table public.rural_marts
  add column if not exists physical_address text,
  add column if not exists secondary_mobile text,
  add column if not exists date_of_birth date,
  add column if not exists gender text,
  add column if not exists qualification text,
  add column if not exists address_permanent text,
  add column if not exists address_temporary text,
  add column if not exists pan_number text,
  add column if not exists bank_account_number text,
  add column if not exists ifsc_code text,
  add column if not exists bank_name text,
  add column if not exists branch text,
  add column if not exists mart_photo_url text,
  add column if not exists entrepreneur_photo_url text;

-- NOTE: no new `aadhaar_number` column. rural_marts already has one, from the
-- original schema (originally an optional mart-level field). Since the form
-- no longer collects a separate mart-level Aadhaar, this existing column is
-- reused as "the entrepreneur's Aadhaar" rather than adding a duplicate.
-- Deliberately NOT adding a format CHECK to it: unlike the other new columns
-- (which are brand new and start NULL on every existing row, so an "is null
-- or ..." check is always safe), this column may already hold legacy values
-- of unknown shape on marts approved before this change. A CHECK constraint
-- — even NOT VALID — is enforced on every future UPDATE of a row, including
-- edits that don't touch that column at all. If a legacy row's aadhaar_number
-- doesn't conform, that owner's *next unrelated Settings save* would fail
-- with a constraint error through no fault of their own. Format is validated
-- in the frontend instead.

-- New columns only — always null on every pre-existing row — so these are
-- safe to validate normally, no legacy-data risk.
alter table public.rural_marts
  drop constraint if exists rural_marts_gender_check;
alter table public.rural_marts
  add constraint rural_marts_gender_check
  check (gender is null or gender in ('Male', 'Female', 'Other'));

alter table public.rural_marts
  drop constraint if exists rural_marts_date_of_birth_check;
alter table public.rural_marts
  add constraint rural_marts_date_of_birth_check
  check (date_of_birth is null or date_of_birth <= current_date);

alter table public.rural_marts
  drop constraint if exists rural_marts_pan_number_check;
alter table public.rural_marts
  add constraint rural_marts_pan_number_check
  check (pan_number is null or pan_number ~ '^[A-Z]{5}[0-9]{4}[A-Z]$');

-- ---------------------------------------------------------------------
-- Storage: let an owner upload/view their OWN mart's photo and selfie
-- after approval, under a new marts/{rural_mart_id}/ prefix in the same
-- registration-photos bucket. The existing policies only cover the
-- pending/ prefix (used at registration, before an owner account even
-- exists) and admin-only reads — an authenticated owner currently has no
-- way to either upload here or read back what they uploaded.
-- ---------------------------------------------------------------------
drop policy if exists rural_mart_photo_owner_insert on storage.objects;
create policy rural_mart_photo_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'registration-photos'
    and (storage.foldername(name))[1] = 'marts'
    and (
      public.is_admin()
      or (storage.foldername(name))[2] = public.current_rural_mart_id()::text
    )
  );

drop policy if exists rural_mart_photo_owner_select on storage.objects;
create policy rural_mart_photo_owner_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'registration-photos'
    and (storage.foldername(name))[1] = 'marts'
    and (
      public.is_admin()
      or (storage.foldername(name))[2] = public.current_rural_mart_id()::text
    )
  );

drop policy if exists rural_mart_photo_owner_delete on storage.objects;
create policy rural_mart_photo_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'registration-photos'
    and (storage.foldername(name))[1] = 'marts'
    and (
      public.is_admin()
      or (storage.foldername(name))[2] = public.current_rural_mart_id()::text
    )
  );
