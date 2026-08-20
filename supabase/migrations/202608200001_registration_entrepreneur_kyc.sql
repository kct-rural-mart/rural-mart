-- Registration form redesign: split "Register Rural Mart" into Mart Details +
-- Entrepreneur KYC Details. Replaces the GPS lat/lng fields with a physical
-- address, adds the entrepreneur's personal/bank KYC fields, and splits the
-- single photo upload into a mart photo and an entrepreneur selfie.
--
-- This file was never applied to the live database, so it's edited in place
-- rather than layered with a follow-up migration (unlike the older,
-- already-applied migrations, which are never edited after the fact).
--
-- pending_registrations already has real submitted rows, so this migration
-- only ADDS nullable columns (never NOT NULL) and only DROPS the two GPS
-- columns being replaced — it does not touch the table itself, the existing
-- `email` column (now understood as the entrepreneur's email — see below),
-- or the existing `photo_url` column (kept for rows submitted under the old
-- single-photo form).

alter table public.pending_registrations
  add column if not exists physical_address text,
  add column if not exists mart_photo_url text,
  add column if not exists entrepreneur_photo_url text,
  add column if not exists entrepreneur_primary_mobile text,
  add column if not exists entrepreneur_secondary_mobile text,
  add column if not exists entrepreneur_dob date,
  add column if not exists entrepreneur_gender text,
  add column if not exists entrepreneur_address_permanent text,
  add column if not exists entrepreneur_address_temporary text,
  add column if not exists entrepreneur_qualification text,
  add column if not exists entrepreneur_aadhaar_number text,
  add column if not exists entrepreneur_pan_number text,
  add column if not exists bank_account_number text,
  add column if not exists ifsc_code text,
  add column if not exists bank_name text,
  add column if not exists bank_branch text;

-- No separate entrepreneur_email column: the form now asks for email once,
-- in the Entrepreneur section, and it's stored in the existing `email`
-- column (already NOT NULL, already relied on by approve-registration to
-- create the owner's login and by rural_marts.email).

-- Format guards — all "or null" so they never reject existing/legacy rows,
-- only malformed *new* values.
alter table public.pending_registrations
  drop constraint if exists pending_registrations_entrepreneur_gender_check;
alter table public.pending_registrations
  add constraint pending_registrations_entrepreneur_gender_check
  check (entrepreneur_gender is null or entrepreneur_gender in ('Male', 'Female', 'Other'));

alter table public.pending_registrations
  drop constraint if exists pending_registrations_entrepreneur_dob_check;
alter table public.pending_registrations
  add constraint pending_registrations_entrepreneur_dob_check
  check (entrepreneur_dob is null or entrepreneur_dob <= current_date);

alter table public.pending_registrations
  drop constraint if exists pending_registrations_entrepreneur_aadhaar_check;
alter table public.pending_registrations
  add constraint pending_registrations_entrepreneur_aadhaar_check
  check (entrepreneur_aadhaar_number is null or entrepreneur_aadhaar_number ~ '^\d{12}$');

alter table public.pending_registrations
  drop constraint if exists pending_registrations_entrepreneur_pan_check;
alter table public.pending_registrations
  add constraint pending_registrations_entrepreneur_pan_check
  check (entrepreneur_pan_number is null or entrepreneur_pan_number ~ '^[A-Z]{5}[0-9]{4}[A-Z]$');

-- District: constrained to Tamil Nadu's 38 districts so admin filtering by
-- district can't be broken by typos/inconsistent spelling. Added NOT VALID
-- so it's enforced for every new/updated row from today onward without
-- requiring every existing row to already match it — run
-- `validate constraint` separately later once any older rows are confirmed
-- clean, if you want it fully enforced retroactively too.
alter table public.pending_registrations
  drop constraint if exists pending_registrations_district_check;
alter table public.pending_registrations
  add constraint pending_registrations_district_check
  check (district in (
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
    'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
    'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
    'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
    'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
    'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
    'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
    'Vellore', 'Viluppuram', 'Virudhunagar'
  )) not valid;

-- GPS coordinates are replaced by physical_address above. Dropping only these
-- two columns (not the table) also drops their old NOT NULL / range checks
-- automatically.
alter table public.pending_registrations
  drop column if exists gps_lat,
  drop column if exists gps_lng;
