alter table public.pending_registrations enable row level security;
alter table public.rural_marts enable row level security;
alter table public.profiles enable row level security;

drop policy if exists profiles_admin_select on public.profiles;
create policy profiles_admin_select on public.profiles
  for select to authenticated using (public.is_admin());

drop policy if exists profiles_self_password_flag_update on public.profiles;
create policy profiles_self_password_flag_update on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists rural_marts_owner_select on public.rural_marts;
create policy rural_marts_owner_select on public.rural_marts
  for select to authenticated
  using (id = public.current_rural_mart_id() or public.is_admin());

drop policy if exists rural_marts_owner_update on public.rural_marts;
create policy rural_marts_owner_update on public.rural_marts
  for update to authenticated
  using (id = public.current_rural_mart_id() or public.is_admin())
  with check (id = public.current_rural_mart_id() or public.is_admin());

drop policy if exists pending_registrations_admin_select on public.pending_registrations;
create policy pending_registrations_admin_select on public.pending_registrations
  for select to authenticated using (public.is_admin());

drop policy if exists pending_registrations_admin_update on public.pending_registrations;
create policy pending_registrations_admin_update on public.pending_registrations
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists registration_photos_admin_read on storage.objects;
create policy registration_photos_admin_read on storage.objects
  for select to authenticated
  using (bucket_id = 'registration-photos' and public.is_admin());
