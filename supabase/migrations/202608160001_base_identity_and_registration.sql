create extension if not exists pgcrypto;

create table if not exists public.pending_registrations (
  id uuid primary key default gen_random_uuid(),
  mart_name text not null,
  entrepreneur_name text not null,
  mobile_number text not null check (mobile_number ~ '^\d{10}$'),
  email text not null,
  district text not null,
  block text not null,
  village text not null,
  gps_lat numeric(10,7) not null check (gps_lat between -90 and 90),
  gps_lng numeric(10,7) not null check (gps_lng between -180 and 180),
  opening_date date not null,
  aadhaar_number text check (aadhaar_number is null or aadhaar_number ~ '^\d{12}$'),
  gst_number text check (gst_number is null or char_length(gst_number) = 15),
  photo_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists pending_registrations_open_email_unique
  on public.pending_registrations (lower(email)) where status = 'pending';

create table if not exists public.rural_marts (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid unique references public.pending_registrations(id) on delete restrict,
  owner_id uuid unique references auth.users(id) on delete restrict,
  reference_code text not null unique,
  mart_name text not null,
  entrepreneur_name text not null,
  mobile_number text,
  email text not null,
  district text not null,
  block text not null,
  village text not null,
  gps_lat numeric(10,7),
  gps_lng numeric(10,7),
  opening_date date,
  aadhaar_number text,
  gst_number text,
  photo_url text,
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rural_marts_district_idx on public.rural_marts(district);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'owner')),
  rural_mart_id uuid references public.rural_marts(id) on delete set null,
  must_change_password boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((role = 'admin' and rural_mart_id is null) or (role = 'owner' and rural_mart_id is not null))
);

alter table public.pending_registrations enable row level security;
alter table public.rural_marts enable row level security;
alter table public.profiles enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on public.pending_registrations to anon, authenticated;
grant select, update on public.pending_registrations to authenticated;
grant select on public.rural_marts to authenticated;
grant update (mart_name, entrepreneur_name, mobile_number) on public.rural_marts to authenticated;
grant select on public.profiles to authenticated;
grant update (must_change_password) on public.profiles to authenticated;

drop policy if exists pending_registration_public_insert on public.pending_registrations;
create policy pending_registration_public_insert on public.pending_registrations
  for insert to anon, authenticated
  with check (status = 'pending' and rejection_reason is null);

drop policy if exists profile_self_select on public.profiles;
create policy profile_self_select on public.profiles
  for select to authenticated using (id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('registration-photos', 'registration-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists registration_photo_public_insert on storage.objects;
create policy registration_photo_public_insert on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'registration-photos'
    and (storage.foldername(name))[1] = 'pending'
  );

drop policy if exists registration_photo_public_cleanup on storage.objects;
create policy registration_photo_public_cleanup on storage.objects
  for delete to anon, authenticated
  using (bucket_id = 'registration-photos' and owner_id = auth.uid()::text);
