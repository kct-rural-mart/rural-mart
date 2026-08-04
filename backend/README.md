# Rural Mart Backend

Spring Boot skeleton for the Rural Mart Management System backend. This is Phase 1:
a running service with a health check, a database connection to the **same**
Supabase Postgres database the frontend uses, and Supabase JWT verification.
It does not yet implement any business logic (e.g. the registration-approval
flow still lives in `supabase/functions/approve-registration/` for now).

- Java 17+, Maven, Spring Boot 4.1.0.
- Shared database, separate backend: this service and the React frontend both
  talk to the same Supabase Postgres instance. The frontend still uses
  Supabase Auth + the Supabase client directly - nothing here replaces that yet.

## Project layout

```
src/main/java/com/ruralmart/backend/
  config/      SecurityConfig (filter chain), CorsConfig (allowed origins)
  controller/  REST endpoints - currently just GET /api/health
  service/     (empty - business logic goes here in later phases)
  repository/  Spring Data JPA repositories
  model/       JPA entities mirroring existing Supabase tables (read-only for now)
  dto/         (empty - request/response DTOs go here in later phases)
  security/    Supabase JWT decoding + role-claim extraction
```

## Running locally

No Maven Wrapper is checked in yet, so you'll need Maven on your PATH (or run
it through an IDE that bundles one, like IntelliJ IDEA). Set the required
environment variables first (see below), then from `backend/`:

```
mvn spring-boot:run
```

The app starts on `http://localhost:8080` by default (override with `SERVER_PORT`).

## Required environment variables

Spring Boot reads these from your OS environment - there's no `.env` loading
built in. See `src/main/resources/application.properties.example` for the
full list with placeholder values; set them in your shell, your IDE's Run
Configuration, or a `backend/.env` you source yourself (gitignored if you
create one).

| Variable | Where to find it in Supabase | Required? |
|---|---|---|
| `SUPABASE_DB_URL` | Project Settings -> Database -> Connection string (reformat as a JDBC URL, e.g. `jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres?sslmode=require`) | Yes |
| `SUPABASE_DB_USERNAME` | Same page - usually `postgres` | Yes |
| `SUPABASE_DB_PASSWORD` | Same page - your database password | Yes |
| `SUPABASE_JWT_JWKS_URI` | Project Settings -> API - `https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`, only if your project has asymmetric JWT signing keys enabled | One of this or the secret below |
| `SUPABASE_JWT_SECRET` | Project Settings -> API -> JWT Secret (legacy HS256 projects) | One of this or the JWKS URI above |
| `SUPABASE_URL` | Project Settings -> API -> Project URL (e.g. `https://<project-ref>.supabase.co`) | Yes - used to call the Supabase Auth Admin API |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings -> API -> service_role key | Yes - used to call the Supabase Auth Admin API |
| `SERVER_PORT` | - | No, defaults to 8080 |
| `APP_CORS_ALLOWED_ORIGINS` | - | No, defaults to `http://localhost:5173` (the Vite dev server) |

If neither `SUPABASE_JWT_JWKS_URI` nor `SUPABASE_JWT_SECRET` is set, the app
fails fast on startup with a clear error instead of silently accepting
unverifiable tokens.

## Testing the health check

```
curl http://localhost:8080/api/health
```

should return `ok`. This endpoint is the only one that doesn't require a JWT.

## Testing JWT verification

Get a real access token (e.g. from the frontend after logging in - check
`localStorage` in devtools for the Supabase session, or call
`supabase.auth.signInWithPassword` from a script), then:

```
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/health
```

`/api/health` always returns `ok` regardless of the header since it's
`permitAll`. To actually confirm JWT validation, hit any other path with and
without the header once a real endpoint exists - for now, an easy check is
requesting a path that doesn't exist (e.g. `/api/whoami`) with a bad or
missing token and confirming you get `401 Unauthorized` rather than a routing
error, and that a valid token is accepted (still 404 for the missing route,
not 401).

## Registration approval (Phase 2)

`POST /api/admin/registrations/{id}/approve` is the Spring Boot equivalent of
`supabase/functions/approve-registration/index.ts` (still left in place as a
fallback - not touched by this migration). Admin-only: `RegistrationApprovalService`
looks up the caller's `profiles.role` via the JWT subject and rejects with 403
if it isn't `admin`. On success it creates a Supabase Auth user via the Admin
REST API, inserts `rural_marts` + `profiles` rows and marks the registration
`approved` in one `@Transactional` step, and rolls back the Auth user if that
step fails partway.

## What's deliberately not built yet

- No Maven Wrapper (`mvnw`) - add one later with `mvn -N wrapper:wrapper` if
  you want contributors to not need Maven installed globally.
