-- =====================================================================
-- Rural Mart — Daily Operations Schema
-- =====================================================================
-- Builds on existing tables assumed already present in Supabase:
--   profiles              (id uuid PK -> auth.users.id, role text
--                           ['admin'|'owner'], rural_mart_id uuid FK,
--                           must_change_password boolean)
--   rural_marts           (id uuid PK, owner_id, registration_id, ...)
--   pending_registrations (id uuid PK, ...)
-- These are not tracked as .sql anywhere in this repo (only reconstructed
-- from frontend/edge-function code) — this script does not recreate them,
-- it only adds the new operational tables and assumes the above shape.
--
-- Source of truth: "Rural Mart Dashboard Framework" (owner-supplied PDF,
-- cross-checked section-by-section against this script) plus owner-
-- confirmed design decisions from conversation. No prior "data audit
-- report" exists in this repo or in project memory.
--
-- Run once, in order, in the Supabase SQL editor.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. RLS helper functions
--    Centralizes "which mart / which role is the caller" so every
--    policy below stays a one-liner and stays consistent.
-- ---------------------------------------------------------------------
create or replace function public.current_rural_mart_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select rural_mart_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select role = 'admin' from public.profiles where id = auth.uid();
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 2. products
--    category is a CHECK-constrained list, not a Postgres ENUM type,
--    so it can be extended with a plain ALTER TABLE ... DROP/ADD
--    CONSTRAINT instead of ALTER TYPE. This CHECK list is the single
--    shared source for categories — do not hardcode a separate list
--    anywhere else (frontend dropdowns should mirror this exact list).
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  rural_mart_id   uuid not null references public.rural_marts(id) on delete cascade,
  category        text not null check (category in (
                    'Farm Equipment',
                    'Feed',
                    'Mineral Mixtures',
                    'Fodder Seeds',
                    'Veterinary Medicines',
                    'Seeds',
                    'Fertilizers',
                    'Other'
                  )),
  name            text not null,
  unit            text not null,                       -- e.g. kg, litre, piece, bag
  purchase_price  numeric(12,2) not null check (purchase_price >= 0),
  selling_price   numeric(12,2) not null check (selling_price >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_products_rural_mart_id on public.products(rural_mart_id);
create index if not exists idx_products_category on public.products(rural_mart_id, category);

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Current stock qty (per product), not stored:
--   COALESCE(SUM(procurement.quantity), 0) - COALESCE(SUM(sale_items.quantity), 0)
--   (sale_items joined via sales.product totals; see sale_items section)
-- Inventory valuation (decision #8) = purchase_price * current stock qty.
-- Opening stock as of date D  = same formula, filtered to rows dated  < D.
-- Closing stock as of date D  = same formula, filtered to rows dated <= D.

-- ---------------------------------------------------------------------
-- 3. farmers
--    mobile is required + unique per mart because "New vs Repeat"
--    (decision #2) depends on reliably recognizing the same farmer
--    across visits. Two farmers sharing one household phone will be
--    merged into a single repeat-customer record — accepted tradeoff,
--    flagged in the cross-check notes.
-- ---------------------------------------------------------------------
create table if not exists public.farmers (
  id            uuid primary key default gen_random_uuid(),
  rural_mart_id uuid not null references public.rural_marts(id) on delete cascade,
  name          text not null,
  mobile        text not null,
  village       text,
  gender        text check (gender in ('Male', 'Female', 'Other')),
  age           integer check (age > 0 and age < 120),
  cattle_count  integer check (cattle_count >= 0) default 0,
  created_at    timestamptz not null default now(),
  unique (rural_mart_id, mobile)
);

create index if not exists idx_farmers_rural_mart_id on public.farmers(rural_mart_id);

-- Farmer "Number of Visits" (framework section 3) is not stored — it is
-- COUNT(DISTINCT sales.sale_date) grouped by farmer_id (a "visit" = a day
-- the farmer bought something, matching how footfall/repeat are defined
-- elsewhere in this schema). Use COUNT(sales.*) instead if you want
-- "number of bills" per farmer rather than "number of distinct days".

-- ---------------------------------------------------------------------
-- 4. sales  (one row per bill)
-- ---------------------------------------------------------------------
create table if not exists public.sales (
  id            uuid primary key default gen_random_uuid(),
  rural_mart_id uuid not null references public.rural_marts(id) on delete cascade,
  farmer_id     uuid not null references public.farmers(id) on delete restrict,
  sale_date     date not null default current_date,
  bill_number   bigserial unique,               -- human-readable receipt no. (auto id)
  total_amount  numeric(12,2) not null check (total_amount >= 0),
  created_at    timestamptz not null default now()
);

create index if not exists idx_sales_rural_mart_id on public.sales(rural_mart_id);
create index if not exists idx_sales_sale_date on public.sales(rural_mart_id, sale_date);
create index if not exists idx_sales_farmer_id on public.sales(farmer_id);

-- total_amount is a stored snapshot; application layer must keep it equal
-- to SUM(sale_items.quantity * sale_items.unit_price_at_sale) for that sale.
--
-- KPIs computed FROM this table (no extra storage needed):
--   Sales Value          = SUM(total_amount) grouped by rural_mart_id, sale_date
--   Number of Bills       = COUNT(*) grouped by rural_mart_id, sale_date
--   Average Bill Value    = Sales Value / Number of Bills
--   Daily Footfall         = COUNT(DISTINCT farmer_id) grouped by rural_mart_id, sale_date
--   New vs Repeat walk-ins = for each (farmer_id, sale_date=D) pair, "repeat" if
--                             EXISTS(a sale for same farmer_id with sale_date < D),
--                             else "new"
--
-- NOTE (cross-check flag): "Conversion Rate" from the framework's Daily
-- Business Dashboard is NOT derivable from this schema. Footfall here is
-- defined (decision #2) as farmers who made a purchase, so conversion
-- from visit->sale is undefined without a separate non-sale visit log,
-- which was not requested. Treat Conversion Rate as unsupported until a
-- walk-in/visit-log table is explicitly scoped.

-- ---------------------------------------------------------------------
-- 5. sale_items
-- ---------------------------------------------------------------------
create table if not exists public.sale_items (
  id                  uuid primary key default gen_random_uuid(),
  sale_id             uuid not null references public.sales(id) on delete cascade,
  product_id          uuid not null references public.products(id) on delete restrict,
  quantity            numeric(12,3) not null check (quantity > 0),
  unit_price_at_sale  numeric(12,2) not null check (unit_price_at_sale >= 0)
);

create index if not exists idx_sale_items_sale_id on public.sale_items(sale_id);
create index if not exists idx_sale_items_product_id on public.sale_items(product_id);

-- Sales Quantity, Top Selling Products, Category-wise Sales, per-product
-- "Quantity Sold" (framework section 4): join sale_items -> products,
-- group by product_id / category, date-filtered via
-- sale_items.sale_id -> sales.sale_date.

-- ---------------------------------------------------------------------
-- 6. procurement
-- ---------------------------------------------------------------------
create table if not exists public.procurement (
  id                uuid primary key default gen_random_uuid(),
  rural_mart_id     uuid not null references public.rural_marts(id) on delete cascade,
  product_id        uuid not null references public.products(id) on delete restrict,
  quantity          numeric(12,3) not null check (quantity > 0),
  cost              numeric(12,2) not null check (cost >= 0),   -- total cost of this batch, not per-unit
  supplier_name     text,
  procurement_date  date not null default current_date,
  created_at        timestamptz not null default now()
);

create index if not exists idx_procurement_rural_mart_id on public.procurement(rural_mart_id);
create index if not exists idx_procurement_product_id on public.procurement(product_id);
create index if not exists idx_procurement_date on public.procurement(rural_mart_id, procurement_date);

-- Procurement Value (Daily Business Dashboard / Financial Dashboard)
--                                      = SUM(cost) grouped by rural_mart_id, date range
-- Procurement Quantity (Daily Business Dashboard, per product: "Quantity
-- Purchased" in section 4)             = SUM(quantity) grouped by rural_mart_id
--                                        (or product_id), date range
-- Supplier-wise Procurement            = SUM(cost) / SUM(quantity) grouped by supplier_name
--
-- NOTE (cross-check flag): the framework labels this KPI "Supplier-wise
-- Sales" (section 4), but suppliers only appear on the procurement side
-- of this schema — a mart doesn't sell TO a supplier. Implemented here as
-- supplier-wise procurement volume/cost, which is the only sense that
-- makes sense given the data model. Flag if the framework intended
-- something else (e.g. which supplier's products sell best downstream —
-- that would need product_id -> supplier_name traced through to
-- sale_items, which isn't tracked since supplier is only a procurement
-- attribute, not a per-product attribute).

-- ---------------------------------------------------------------------
-- 7. outreach_programs
--    activity_type is CHECK-constrained (same pattern as product/expense
--    category) so type-based KPIs like "Animal Health Camps" are
--    reliably queryable instead of depending on free-text consistency.
--    The framework doesn't give an example list for Activity Type (unlike
--    Product Category, which does) — this starter list is a placeholder;
--    extend it the same way product categories are extended.
-- ---------------------------------------------------------------------
create table if not exists public.outreach_programs (
  id                    uuid primary key default gen_random_uuid(),
  rural_mart_id         uuid not null references public.rural_marts(id) on delete cascade,
  program_date          date not null default current_date,
  activity_type         text not null check (activity_type in (
                          'Animal Health Camp',
                          'Soil Health Workshop',
                          'Product Demonstration',
                          'FPG Mela',
                          'Farmer Training',
                          'Other'
                        )),
  activity_brief        text,
  village               text not null,
  topics_covered        text[] not null default '{}',
  products_demonstrated text[] not null default '{}',
  created_at            timestamptz not null default now()
);

create index if not exists idx_outreach_programs_rural_mart_id on public.outreach_programs(rural_mart_id);
create index if not exists idx_outreach_programs_date on public.outreach_programs(rural_mart_id, program_date);

-- Programs/month / Programs Conducted   = COUNT(*) grouped by rural_mart_id, month
-- Villages Covered                       = COUNT(DISTINCT village) grouped by rural_mart_id, period
-- Animal Health Camps                    = COUNT(*) WHERE activity_type = 'Animal Health Camp'
--
-- "Sales from Programs" (framework section 5 KPI) = the CHANGE in revenue
-- attributable to an outreach program, per the owner's clarification:
--   post_revenue = SUM(sales.total_amount) WHERE rural_mart_id = program's mart
--                   AND sale_date BETWEEN program_date AND program_date + N days
--   pre_revenue  = SUM(sales.total_amount) WHERE rural_mart_id = program's mart
--                   AND sale_date BETWEEN program_date - N days AND program_date
--   Sales from Programs = post_revenue - pre_revenue
-- No schema change needed — this is a read-time comparison joining
-- outreach_programs.program_date against sales.sale_date. The window
-- length N (e.g. 7/14/30 days) is a reporting parameter, not stored.

-- ---------------------------------------------------------------------
-- 8. outreach_attendance
-- ---------------------------------------------------------------------
create table if not exists public.outreach_attendance (
  id                    uuid primary key default gen_random_uuid(),
  outreach_program_id   uuid not null references public.outreach_programs(id) on delete cascade,
  farmer_id             uuid not null references public.farmers(id) on delete restrict,
  is_new_customer       boolean not null,
  animals_covered       integer check (animals_covered >= 0) default 0,
  unique (outreach_program_id, farmer_id)
);

create index if not exists idx_outreach_attendance_program_id on public.outreach_attendance(outreach_program_id);
create index if not exists idx_outreach_attendance_farmer_id on public.outreach_attendance(farmer_id);

-- Per-program (framework section 5):
--   No. of Farmers      = COUNT(*) grouped by outreach_program_id
--   Existing Customers  = COUNT(*) WHERE is_new_customer = false, grouped by outreach_program_id
--   New Customers        = COUNT(*) WHERE is_new_customer = true,  grouped by outreach_program_id
--   Animals Covered      = SUM(animals_covered) grouped by outreach_program_id
--
-- Rollup KPIs (section 4 outreach KPIs, Comparison/Impact dashboards):
--   Farmers Reached      = COUNT(DISTINCT farmer_id) over a period, joined to outreach_programs
--   New Farmer Conversion = of farmers with is_new_customer = true at some
--                            outreach_attendance row, the % who have >=1
--                            row in `sales` dated after that attendance's
--                            program_date (i.e. the outreach turned them
--                            into an actual paying customer afterward)
--
-- NOTE (cross-check flag): "Animal Population Served" / "Total Animal
-- Population Covered" (Comparison + Impact dashboards) is ambiguous
-- between two existing columns: farmers.cattle_count (total cattle owned
-- by farmers the mart has ever served — a farmer-level demographic) vs.
-- SUM(outreach_attendance.animals_covered) (animals actually treated/
-- covered during outreach activities — an outreach-activity-level stat).
-- Both are already captured by this schema; which one backs which named
-- KPI is a reporting-layer decision, not a schema gap — flagging so the
-- view/query that's eventually built picks the intended source.

-- ---------------------------------------------------------------------
-- 9. expenses
-- ---------------------------------------------------------------------
create table if not exists public.expenses (
  id            uuid primary key default gen_random_uuid(),
  rural_mart_id uuid not null references public.rural_marts(id) on delete cascade,
  expense_date  date not null default current_date,
  category      text not null check (category in (
                  'Rent', 'Salaries', 'Utilities', 'Transport',
                  'Maintenance', 'Marketing', 'Other'
                )),
  amount        numeric(12,2) not null check (amount > 0),
  description   text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_expenses_rural_mart_id on public.expenses(rural_mart_id);
create index if not exists idx_expenses_date on public.expenses(rural_mart_id, expense_date);

-- Financial Dashboard (decision #5):
--   Revenue            = SUM(sales.total_amount) over period
--   Procurement         = SUM(procurement.cost) over period
--   Operating Expenses  = SUM(expenses.amount) over period    (only manual input)
--   Gross Profit        = Revenue - Procurement
--   Net Profit          = Gross Profit - Operating Expenses
--
-- NOTE (cross-check flag): Gross Profit here uses period Procurement
-- cost as a proxy for cost-of-goods-sold, not true COGS matched to what
-- was actually sold that period. This matches decision #5 as stated;
-- flag if procurement and sale timing diverge significantly (e.g. bulk
-- stockpiling), the "Gross Profit" figure will be noisy period-to-period
-- even though it's directionally correct over longer windows.

-- ---------------------------------------------------------------------
-- 10. Row Level Security
--     Owners: rows where rural_mart_id matches their own profile's mart.
--     Admins: unrestricted, via public.is_admin().
--     sale_items / outreach_attendance have no rural_mart_id column, so
--     their policies check ownership through the parent row.
-- ---------------------------------------------------------------------
alter table public.products             enable row level security;
alter table public.farmers              enable row level security;
alter table public.sales                enable row level security;
alter table public.sale_items           enable row level security;
alter table public.procurement          enable row level security;
alter table public.outreach_programs    enable row level security;
alter table public.outreach_attendance  enable row level security;
alter table public.expenses             enable row level security;

-- products
drop policy if exists products_select on public.products;
create policy products_select on public.products for select
  using (rural_mart_id = public.current_rural_mart_id() or public.is_admin());
drop policy if exists products_insert on public.products;
create policy products_insert on public.products for insert
  with check (rural_mart_id = public.current_rural_mart_id() or public.is_admin());
drop policy if exists products_update on public.products;
create policy products_update on public.products for update
  using (rural_mart_id = public.current_rural_mart_id() or public.is_admin())
  with check (rural_mart_id = public.current_rural_mart_id() or public.is_admin());
drop policy if exists products_delete on public.products;
create policy products_delete on public.products for delete
  using (rural_mart_id = public.current_rural_mart_id() or public.is_admin());

-- farmers
drop policy if exists farmers_select on public.farmers;
create policy farmers_select on public.farmers for select
  using (rural_mart_id = public.current_rural_mart_id() or public.is_admin());
drop policy if exists farmers_insert on public.farmers;
create policy farmers_insert on public.farmers for insert
  with check (rural_mart_id = public.current_rural_mart_id() or public.is_admin());
drop policy if exists farmers_update on public.farmers;
create policy farmers_update on public.farmers for update
  using (rural_mart_id = public.current_rural_mart_id() or public.is_admin())
  with check (rural_mart_id = public.current_rural_mart_id() or public.is_admin());
drop policy if exists farmers_delete on public.farmers;
create policy farmers_delete on public.farmers for delete
  using (rural_mart_id = public.current_rural_mart_id() or public.is_admin());

-- sales
drop policy if exists sales_select on public.sales;
create policy sales_select on public.sales for select
  using (rural_mart_id = public.current_rural_mart_id() or public.is_admin());
drop policy if exists sales_insert on public.sales;
create policy sales_insert on public.sales for insert
  with check (rural_mart_id = public.current_rural_mart_id() or public.is_admin());
drop policy if exists sales_update on public.sales;
create policy sales_update on public.sales for update
  using (rural_mart_id = public.current_rural_mart_id() or public.is_admin())
  with check (rural_mart_id = public.current_rural_mart_id() or public.is_admin());
drop policy if exists sales_delete on public.sales;
create policy sales_delete on public.sales for delete
  using (rural_mart_id = public.current_rural_mart_id() or public.is_admin());

-- sale_items (ownership via parent sale)
drop policy if exists sale_items_select on public.sale_items;
create policy sale_items_select on public.sale_items for select
  using (exists (
    select 1 from public.sales s
    where s.id = sale_items.sale_id
      and (s.rural_mart_id = public.current_rural_mart_id() or public.is_admin())
  ));
drop policy if exists sale_items_insert on public.sale_items;
create policy sale_items_insert on public.sale_items for insert
  with check (exists (
    select 1 from public.sales s
    where s.id = sale_items.sale_id
      and (s.rural_mart_id = public.current_rural_mart_id() or public.is_admin())
  ));
drop policy if exists sale_items_update on public.sale_items;
create policy sale_items_update on public.sale_items for update
  using (exists (
    select 1 from public.sales s
    where s.id = sale_items.sale_id
      and (s.rural_mart_id = public.current_rural_mart_id() or public.is_admin())
  ))
  with check (exists (
    select 1 from public.sales s
    where s.id = sale_items.sale_id
      and (s.rural_mart_id = public.current_rural_mart_id() or public.is_admin())
  ));
drop policy if exists sale_items_delete on public.sale_items;
create policy sale_items_delete on public.sale_items for delete
  using (exists (
    select 1 from public.sales s
    where s.id = sale_items.sale_id
      and (s.rural_mart_id = public.current_rural_mart_id() or public.is_admin())
  ));

-- procurement
drop policy if exists procurement_select on public.procurement;
create policy procurement_select on public.procurement for select
  using (rural_mart_id = public.current_rural_mart_id() or public.is_admin());
drop policy if exists procurement_insert on public.procurement;
create policy procurement_insert on public.procurement for insert
  with check (rural_mart_id = public.current_rural_mart_id() or public.is_admin());
drop policy if exists procurement_update on public.procurement;
create policy procurement_update on public.procurement for update
  using (rural_mart_id = public.current_rural_mart_id() or public.is_admin())
  with check (rural_mart_id = public.current_rural_mart_id() or public.is_admin());
drop policy if exists procurement_delete on public.procurement;
create policy procurement_delete on public.procurement for delete
  using (rural_mart_id = public.current_rural_mart_id() or public.is_admin());

-- outreach_programs
drop policy if exists outreach_programs_select on public.outreach_programs;
create policy outreach_programs_select on public.outreach_programs for select
  using (rural_mart_id = public.current_rural_mart_id() or public.is_admin());
drop policy if exists outreach_programs_insert on public.outreach_programs;
create policy outreach_programs_insert on public.outreach_programs for insert
  with check (rural_mart_id = public.current_rural_mart_id() or public.is_admin());
drop policy if exists outreach_programs_update on public.outreach_programs;
create policy outreach_programs_update on public.outreach_programs for update
  using (rural_mart_id = public.current_rural_mart_id() or public.is_admin())
  with check (rural_mart_id = public.current_rural_mart_id() or public.is_admin());
drop policy if exists outreach_programs_delete on public.outreach_programs;
create policy outreach_programs_delete on public.outreach_programs for delete
  using (rural_mart_id = public.current_rural_mart_id() or public.is_admin());

-- outreach_attendance (ownership via parent program)
drop policy if exists outreach_attendance_select on public.outreach_attendance;
create policy outreach_attendance_select on public.outreach_attendance for select
  using (exists (
    select 1 from public.outreach_programs p
    where p.id = outreach_attendance.outreach_program_id
      and (p.rural_mart_id = public.current_rural_mart_id() or public.is_admin())
  ));
drop policy if exists outreach_attendance_insert on public.outreach_attendance;
create policy outreach_attendance_insert on public.outreach_attendance for insert
  with check (exists (
    select 1 from public.outreach_programs p
    where p.id = outreach_attendance.outreach_program_id
      and (p.rural_mart_id = public.current_rural_mart_id() or public.is_admin())
  ));
drop policy if exists outreach_attendance_update on public.outreach_attendance;
create policy outreach_attendance_update on public.outreach_attendance for update
  using (exists (
    select 1 from public.outreach_programs p
    where p.id = outreach_attendance.outreach_program_id
      and (p.rural_mart_id = public.current_rural_mart_id() or public.is_admin())
  ))
  with check (exists (
    select 1 from public.outreach_programs p
    where p.id = outreach_attendance.outreach_program_id
      and (p.rural_mart_id = public.current_rural_mart_id() or public.is_admin())
  ));
drop policy if exists outreach_attendance_delete on public.outreach_attendance;
create policy outreach_attendance_delete on public.outreach_attendance for delete
  using (exists (
    select 1 from public.outreach_programs p
    where p.id = outreach_attendance.outreach_program_id
      and (p.rural_mart_id = public.current_rural_mart_id() or public.is_admin())
  ));

-- expenses
drop policy if exists expenses_select on public.expenses;
create policy expenses_select on public.expenses for select
  using (rural_mart_id = public.current_rural_mart_id() or public.is_admin());
drop policy if exists expenses_insert on public.expenses;
create policy expenses_insert on public.expenses for insert
  with check (rural_mart_id = public.current_rural_mart_id() or public.is_admin());
drop policy if exists expenses_update on public.expenses;
create policy expenses_update on public.expenses for update
  using (rural_mart_id = public.current_rural_mart_id() or public.is_admin())
  with check (rural_mart_id = public.current_rural_mart_id() or public.is_admin());
drop policy if exists expenses_delete on public.expenses;
create policy expenses_delete on public.expenses for delete
  using (rural_mart_id = public.current_rural_mart_id() or public.is_admin());

-- =====================================================================
-- End of script
-- =====================================================================
