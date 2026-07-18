# Progress

## Project status

- `plan`: completed
- `foundation`: completed
- `database-auth`: not started
- `public-site`: completed
- `booking`: completed
- `dashboard-calendar`: in progress
- `email-jobs`: not started
- `seo-security-tests`: not started
- `final-audit`: not started

## Notes

- The initial workspace is a fresh Next.js scaffold with no implementation beyond starter content.
- The implementation plan has been established with a phase-by-phase roadmap.
- Foundation phase completed with actual locale-root layouts for `/fr` and `/ar`, a top-level redirect from `/` to `/fr`, staff route separation, root-level `robots.txt` and `sitemap.xml`, localized public page scaffolding, env validation for foundation variables only, and updated locale-focused tests.
- Fixed Next.js 16 async `params` handling in dynamic routes so `params` is typed as a Promise and awaited before property access.
- Updated `package.json` test scripts to `vitest run` and `test:watch` to preserve watch behavior.
- Added a scoped Supabase-auth foundation for the database-auth phase with server/client helpers, migration SQL, staff-role access helpers, and tests.
- Verified `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` after the async params fix.
- A local placeholder `.env.local` was created to allow build-time validation during verification; it is ignored by `.gitignore`.
- Planning documents were revised to reflect the final schema, UUID profile references, appointment field requirements, recurring availability, business settings, notification uniqueness constraints, and consistent Supabase env naming.
- Public-site phase completed with canonical French/Arabic public subpage routing, registry-driven navigation, localized metadata, sitemap generation, disabled reviews gating, and public page components for cabinet/about, expertise, team, representative matters, booking presentation, contact, privacy, and legal notice.
- Reviews remain disabled through `siteContent.reviewsEnabled = false`; `/fr/avis` and `/ar/reviews` return 404 and are excluded from navigation, static params, and sitemap until approved reviews are available.
- The booking page is presentation-only in this phase. It does not write to Supabase, create appointments, send emails, process payments, or show a false success state.
- Provisional public content still requiring client-approved production replacement includes official Arabic firm name, address, phone, email, lawyer names, lawyer biographies, lawyer photos, approved expertise wording, anonymized representative matters, approved reviews, final privacy text, and final legal/professional notice text.
- Verified `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` after public-site implementation.
- Booking phase completed with a dedicated public `POST /api/booking-requests` endpoint, server-side Zod validation, durable HMAC-hashed database-backed rate limiting, honeypot handling, request idempotency, atomic pending appointment/audit/notification creation through a restricted RPC, console/Resend email provider abstraction, and a localized French/Arabic booking form.
- Booking requests remain pending only. This phase does not implement confirmation, assignment, availability checks, calendar workflows, cancellation tokens, reminders, payment processing, document uploads, or client accounts.
- Booking email delivery failures preserve valid booking requests and update notification delivery status to `failed` when possible.
- Rate limiting is documented in code as 5 accepted attempts per HMAC subject per 15-minute window, keyed from network identifier, normalized email, and the time window using `BOOKING_RATE_LIMIT_SECRET`.
- Verified `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `git diff --check` after booking implementation.
- Dashboard-calendar checkpoint 5A completed the authentication and canonical identity prerequisite only. Staff authentication now uses Supabase SSR cookie sessions, a Next.js 16 proxy for token refresh, server-side `auth.getUser()` validation, and active role loading from `public.profiles`.
- Staff identity for dashboard authorization is now `profiles.id` / `auth.users.id`; `profiles.lawyer_id` is deprecated and no longer used by application authorization helpers.
- A new migration, `20260718021207_dashboard_auth_identity.sql`, preflights legacy staff/lawyer identifiers, converts safe lawyer-profile UUID references to profile UUIDs, adds canonical profile FKs/uniqueness, and replaces the old identity-related RLS foundation.
- Dashboard-calendar views, appointment transitions, scheduling RPCs, payment editing, availability UI, notes UI, and conflict detection remain pending for later checkpoints.
