create sequence if not exists public.farmer_code_seq start 1;

alter table public.farmers
  add column if not exists farmer_code text;

alter table public.farmers
  alter column farmer_code set default
    ('FMR-' || lpad(nextval('public.farmer_code_seq')::text, 6, '0'));

update public.farmers
set farmer_code = 'FMR-' || lpad(nextval('public.farmer_code_seq')::text, 6, '0')
where farmer_code is null or btrim(farmer_code) = '';

alter table public.farmers
  alter column farmer_code set not null;

create unique index if not exists farmers_farmer_code_key
  on public.farmers (farmer_code);
