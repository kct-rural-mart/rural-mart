# Future Supabase Integration Flow

This document outlines the proposed architecture and data flow for migrating the Rural Mart Management System to a Supabase backend.

## 1. Authentication & Authorization
Currently, authentication is bypassed using a development preview mode. In the future:
- **Supabase Auth** will handle all user sessions (JWT tokens).
- Users will be divided into two primary roles: `admin` and `owner`.
- Row Level Security (RLS) policies will be implemented on all tables to ensure:
  - Admins can read/write all data globally.
  - Owners can only read/write data linked to their specific `rural_mart_id`.

## 2. Database Schema (Proposed)
The frontend relies on canonical types (defined in `src/shared/types/storage.ts`) which will map to Supabase tables:
- `users` (Managed via Supabase Auth + profile metadata table)
- `rural_marts`
- `registration_applications`
- `products` (Inventory items)
- `farmers` (Registered outreach members)
- `sales` (Transaction logs)
- `expenses` (Operational costs)
- `outreach_logs` (Panchayat sessions, etc.)

## 3. Pending Business Logic Decisions
Before the database schema and backend edge functions can be finalized, the following business rules must be clarified:

1. **Calculated Data**: Should dashboard metrics (e.g., monthly sales totals) be saved as snapshots or calculated live from transactions?
2. **Deletions**: Do we use hard delete or soft delete (status='inactive') for Owner/Mart records?
3. **Audit Trails**: Do edited sales/inventory records require an immutable audit log?
4. **Approvals**: Do stock corrections or major expense entries require Admin approval?
5. **Product Scoping**: Are product codes (SKUs) unique globally across all marts, or isolated within each mart?
6. **Farmer Scoping**: Can farmers register and belong to more than one Rural Mart?
7. **Auth Provisioning**: Does Admin approval of a registration application automatically provision a Supabase Auth user?
8. **Onboarding Flow**: Does the newly approved Owner receive a temporary password via email, or a magic invitation link?
9. **Email Service**: Which email service/provider will be used for sending account invitations?
10. **Reports**: Do generated reports require historical, immutable snapshots saved to Supabase Storage?
11. **Expense Scoping**: Do expenses include only product procurement costs, or also overhead (rent, electricity)?
12. **Financial Summaries**: Are financial rollups required daily, monthly, or both?

## 4. Frontend Data Layer
The `src/shared/services/contracts/DatabaseContract.ts` acts as the interface. A future `SupabaseDatabaseService` will implement this contract, replacing the current `NoOpStorageRepository`. The frontend components will remain largely untouched as they will simply consume the Promises returned by this service.
