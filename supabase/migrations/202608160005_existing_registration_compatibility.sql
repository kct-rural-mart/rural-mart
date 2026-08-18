-- Bring projects created from the earlier registration schema up to the
-- current application shape. Safe to run repeatedly.
alter table public.pending_registrations
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_pending_registration_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_pending_registrations_updated_at
  on public.pending_registrations;

create trigger trg_pending_registrations_updated_at
  before update on public.pending_registrations
  for each row execute function public.set_pending_registration_updated_at();

