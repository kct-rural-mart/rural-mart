# Rural Mart Management System

A dashboard and data-entry platform for rural agri-retail outlets ("Rural Marts") — built for KCT's Rural Mart programme.

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Tech Stack](#2-tech-stack)
- [3. Project Structure](#3-project-structure)
- [4. Setup Instructions](#4-setup-instructions)
- [5. Database Setup Notes](#5-database-setup-notes)
- [6. Core Feature: Real Data Flow](#6-core-feature-real-data-flow)
- [7. Git Workflow](#7-git-workflow)
- [8. Conventions &amp; Gotchas](#8-conventions--gotchas)
- [9. Current Status](#9-current-status)

---

## 1. Project Overview

Rural Mart Management is a platform for tracking the day-to-day business of rural agri-retail outlets — small shops that sell farm inputs (feed, seeds, fertilizers, veterinary supplies, equipment) to local farmers, and also run outreach programs (health camps, workshops, demonstrations) in surrounding villages.

There are two user roles:

- **Owner** — runs a single Rural Mart. Logs sales, manages their own product catalog and stock, records procurement, logs outreach sessions, tracks expenses, and views their own mart's performance.
- **Admin** — oversees the entire network of Rural Marts. Approves new mart registrations, and views aggregated performance (finance, inventory, outreach) across every mart.

Row Level Security in the database automatically scopes an Owner to their own mart's data and gives Admin unrestricted read access — the same query code runs for both roles, and the database decides what each one is allowed to see.

## 2. Tech Stack

- **Frontend:** React 19 + Vite, `react-router-dom` for routing, Tailwind CSS 4 for styling, Recharts for charts, `lucide-react` for icons.
- **Backend:** [Supabase](https://supabase.com) — Postgres database, Supabase Auth (email/password), and Row Level Security (RLS) policies for authorization.
- **No separate backend application server.** Authorization is handled entirely by Postgres RLS policies (see `database/operational_schema.sql`), not by an API layer — the frontend talks to Supabase directly via `@supabase/supabase-js`. The one exception is `supabase/functions/approve-registration`, a Supabase Edge Function that runs server-side with elevated (service-role) privileges to create a new Owner's auth account and mart record when Admin approves a pending registration — that one operation genuinely needs privileges a browser client can't have.
- **Atomic multi-table writes** (a sale + its line items, an outreach session + its attendees) are handled by two Postgres functions in `database/owner_actions_rpc.sql`, called via `supabase.rpc(...)`. These run with the *caller's* permissions (`security invoker`), so RLS still applies — they exist purely to make a multi-table write one transaction instead of several separate round trips.

## 3. Project Structure

```
RURAL_MART/
├── frontend/                    # The actual application (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/            # Admin dashboard pages & widgets
│   │   │   └── owner/            # Owner dashboard pages & widgets
│   │   ├── lib/
│   │   │   ├── queries/           # Real Supabase data-layer modules (see below)
│   │   │   ├── newPages/          # Legacy mock-data layer - only used by
│   │   │   │                       pages not yet wired to real data
│   │   │   └── supabaseClient.js  # Supabase client instance
│   │   ├── context/AuthContext.jsx # Auth session + profile (role, rural_mart_id)
│   │   ├── utils/                 # Shared helpers - date.js, months.js
│   │   └── pages/                 # Route-level page components
│   └── .env.example               # Copy to .env, see Setup below
│
├── database/
│   ├── operational_schema.sql     # Core tables, RLS policies, helper functions
│   └── owner_actions_rpc.sql      # record_sale() and log_outreach_program() RPCs
│
├── supabase/functions/
│   └── approve-registration/      # Edge Function: admin approves a pending mart
│
└── ruralmart/                    # A teammate's more finished reference UI design.
                                    # NOT part of the running app - components are
                                    # ported INTO frontend/src/ one feature at a
                                    # time, converted from TSX to JSX and rewired
                                    # to real Supabase data. Kept around only as
                                    # design/layout reference for features not yet
                                    # ported (see Current Status). Not imported by
                                    # anything in frontend/.
```

### The `lib/queries/` data layer

Each file owns one feature area's real Supabase queries:

| File | Feature area |
|---|---|
| `finance.js` | Revenue/Procurement/Gross Profit/Net Profit calculations, shared date-window resolution (`getDateWindowISO`), currency formatting (`formatLakhsCr`) |
| `ruralMarts.js` | Admin's Rural Marts directory |
| `farmersOutreach.js` | Admin's Farmers & Outreach dashboard |
| `adminProducts.js` | Admin's Products & Inventory dashboard |
| `ownerMart.js` | Owner's own rural_marts row (profile info) |
| `ownerProducts.js` | Owner's product catalog + procurement |
| `ownerBilling.js` | Farmer search/registration + `record_sale` RPC call |
| `ownerOutreach.js` | Owner's outreach logging + `log_outreach_program` RPC call |
| `ownerDailyBusiness.js` | Owner's Daily Business summary metrics |
| `ownerOverview.js` | Owner's Overall Dashboard KPIs |
| `ownerExpenses.js` | Owner's expense entry |

## 4. Setup Instructions

**Prerequisites:** [Node.js](https://nodejs.org) (v18+), Git.

```bash
# 1. Clone the repo
git clone https://github.com/kct-rural-mart/rural-mart.git
cd rural-mart/frontend

# 2. Install dependencies
npm install

# 3. Set up your environment file
cp .env.example .env
```

Open `.env` and fill in:

```
VITE_SUPABASE_URL=<ask the project owner for this>
VITE_SUPABASE_ANON_KEY=<ask the project owner for this>
```

These point at the **shared** Supabase project everyone develops against — get the values from whoever set up the project. **Never commit `.env`** (it's already gitignored) — the anon key alone is safe to expose in a browser, but keep the URL/key pair private to the team regardless.

```bash
# 4. Start the dev server
npm run dev
```

The app will be running at `http://localhost:5173` (or the next available port).

## 5. Database Setup Notes

The database schema lives in this repo for reference and version history, but **it's already been run against the live, shared Supabase project** — a fresh clone does *not* need to run these files. The database is shared infrastructure, not something each developer spins up locally.

- **`database/operational_schema.sql`** — creates the core operational tables (`products`, `farmers`, `sales`, `sale_items`, `procurement`, `outreach_programs`, `outreach_attendance`, `expenses`), the RLS helper functions (`current_rural_mart_id()`, `is_admin()`), and the RLS policies themselves (owner scoped to their own `rural_mart_id`, admin unrestricted). It assumes `profiles`, `rural_marts`, and `pending_registrations` already exist (created earlier, outside this script).
- **`database/owner_actions_rpc.sql`** — two `security invoker` Postgres functions: `record_sale()` (atomically inserts a `sales` row + its `sale_items`) and `log_outreach_program()` (atomically inserts an `outreach_programs` row + its `outreach_attendance` rows). Both validate that the farmer/product referenced actually belongs to the mart being written to, beyond what RLS alone checks.

If you ever need to point the app at a *different* Supabase project (e.g. a personal sandbox), run both files in order via the Supabase SQL editor first.

## 6. Core Feature: Real Data Flow

Every number on every dashboard — Owner and Admin — is calculated live from real rows in Supabase. Nothing in the active app is hardcoded or mocked.

1. **An Owner logs real activity** through actual forms:
   - **Add Sale** — search/select or register a farmer, add products with quantities, submit → calls the `record_sale` RPC → writes to `sales` + `sale_items`, and stock (`procurement.quantity − sale_items.quantity`) updates immediately.
   - **Log Outreach** — logs a village session with a real attendee list (not just a headcount) → calls `log_outreach_program` → writes to `outreach_programs` + `outreach_attendance`.
   - **Record Procurement**, **Add Expense**, **Add/Edit Product**, **Register Farmer** — direct inserts/updates against `procurement`, `expenses`, `products`, `farmers` respectively (single-table writes don't need an RPC).

2. **Every dashboard reads from those same tables and computes KPIs on the fly** — Revenue, Procurement, Gross Profit, Net Profit, stock levels, farmer footfall, new-vs-repeat customers, outreach reach, all derived from `SUM`/`COUNT`/date-window queries against `sales`, `sale_items`, `procurement`, `products`, `farmers`, `outreach_programs`, `outreach_attendance`, and `expenses` — never stored as a snapshot.

3. **Owner and Admin see the same underlying data at different scopes.** An Owner's Financial Dashboard and Admin's Business & Finance page call the *same* function (`getFinanceDashboardData`) — RLS is what makes an Owner see only their own mart while Admin sees all of them, not separate code paths.

The `ruralmart/` reference folder still contains mock/placeholder data internally, but it is not imported by anything in `frontend/` and never runs in the live app — it's source material only.

## 7. Git Workflow

**Never commit directly to `main`.** Always work on a feature branch and open a Pull Request.

```bash
# 1. Start from an up-to-date main
git checkout main
git pull origin main

# 2. Create a branch for your task
git checkout -b feature/your-task-name

# 3. Make your changes, test locally (npm run dev, click through it)

# 4. Review what you're about to commit
git add .
git status
#   ^ check the file list carefully - make sure no .env file is staged

# 5. Commit
git commit -m "Describe what you changed and why"

# 6. Push your branch
git push -u origin feature/your-task-name

# 7. Open a Pull Request on GitHub (main <- feature/your-task-name)
#    Wait for review/merge before continuing.

# 8. Before starting your NEXT task, sync main again
git checkout main
git pull origin main
```

## 8. Conventions &amp; Gotchas

These are real bugs we hit during development — please don't reintroduce them.

- **Currency formatting:** always use the shared `formatLakhsCr()` from `lib/queries/finance.js`. Never format currency inline. We had a real bug where a second, independent copy of this exact function existed inside a KPI-card component — it had a subtly different rounding rule, so `₹400` displayed as `₹0.0L` in one place but not another. One shared function, imported everywhere, or the two copies *will* drift.
- **Dates — never use raw `Date` math or `.toISOString()` for calendar dates.** Always use `toLocalISODate()`, `getLocalToday()`, and `daysSince()` from `utils/date.js`. We hit **two separate timezone bugs** from this: (1) `.toISOString().slice(0,10)` converts to UTC before formatting, which silently shifts "today" back a day for any timezone ahead of UTC; (2) `new Date('2026-08-15')` (a bare date string) parses as UTC midnight, so diffing it against `Date.now()` (a local instant) miscounts "days ago." Both bugs looked like "the data is wrong" when the data was actually fine — the date math was wrong.
- **CHECK constraints define the valid dropdown values — not the other way around.** `products.category`, `outreach_programs.activity_type`, and `expenses.category` are all `CHECK`-constrained columns in the database. The frontend dropdowns must offer *exactly* those values (`PRODUCT_CATEGORIES` in `ownerProducts.js`, `ACTIVITY_TYPES` in `ownerOutreach.js`, `EXPENSE_CATEGORIES` in `ownerExpenses.js`) — if you add a category, add it to the database constraint first, then update the one exported constant, never a local copy.
- **No fabricated numbers, ever.** If a metric has no real column/table to back it (e.g. a "reorder level" stock threshold, a "performance score", a "conversion rate" formula with an invented percentage), we do not invent a plausible-looking number for it. Either derive it honestly from what's actually stored, or leave it out and note why in a comment.
- **Intentionally not built:** a "Performance Score" concept, Comparison Dashboard, Impact Dashboard, and Admin Reports/Settings pages are deferred - see Current Status below. Don't assume `ruralmart/`'s version of these is something to port as-is; several of ruralmart's own metrics (score, conversion rate, stock threshold) are themselves fabricated placeholders with no real data source, which is exactly why they were dropped rather than copied.

## 9. Current Status

### Admin — built, wired to real Supabase data
- Rural Marts (`/admin/rural-marts`)
- Business & Finance (`/admin/finance`)
- Farmers & Outreach (`/admin/outreach`)
- Products & Inventory (`/admin/inventory`)
- Pending Registrations (`/admin/registrations`) — via the `approve-registration` Edge Function

### Admin — not yet wired / deferred
- **Executive Overview** (`/admin/dashboard`) — still on the old mock data layer, not yet touched
- **Reports** (`/admin/reports`) — deferred
- **Settings** (`/admin/settings`) — deferred

### Owner — built, wired to real Supabase data
- Overall Dashboard (incl. Add Sale / New Procurement quick actions)
- Daily Business (incl. the Add Sale billing panel, farmer directory, entry history)
- Product & Inventory (incl. Add Product, Edit Prices, Record Procurement)
- Farmer Outreach (incl. Log Outreach session with real attendee tracking)
- Financial Dashboard (incl. Add Expense)
- Settings

All Owner-side pages are complete. Auth flow (Login, Register, Change Password, `AuthContext`, `ProtectedRoute`) is untouched from the original implementation and is out of scope for this data-integration work.
