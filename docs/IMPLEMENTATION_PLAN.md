# Implementation Plan

## 1. Current workspace assessment

The repository currently contains a freshly scaffolded Next.js App Router project with Tailwind CSS.

Existing assets and configuration:
- `package.json` with Next.js 16, React 19, Tailwind CSS 4, ESLint, TypeScript
- `src/app/layout.tsx` and `src/app/page.tsx` still contain Create Next App starter content
- Minimal `next.config.ts` and `postcss.config.mjs`
- No existing content directories, no Supabase integration, no locale routing, no dashboard, no email/job infrastructure
- `README.md`, `docs/INSTRUCTIONS.md`, `docs/MASTER_BUILD_PROMPT.md`, and `docs/PRODUCT_SPEC.md` are present and define the target product scope

Overall status:
- Project foundation exists only at the framework level
- Important product requirements are documented but not implemented
- The repository is ready for a planned multi-phase build

## 2. Proposed folder architecture

Use a clear domain-oriented structure under `src/`:

- `src/app/`
  - `[locale]/`
    - `(marketing)/` public marketing pages
    - `layout.tsx` locale-aware layout
  - `dashboard/` staff application
  - `auth/` login and auth-related public routes
  - `cancel/` secure client cancellation route
  - `api/` server routes for booking, cancel, and internal jobs
  - `sitemap.ts`, `robots.ts`
- `src/components/`
  - `marketing/` public page UI
  - `booking/` booking form and validation
  - `dashboard/` calendar and appointment UI
  - `email/` reusable email components/templates
  - `ui/` accessibility primitives and layout components
- `src/content/`
  - `fr/`, `ar/` locale content data
  - `firm-config.ts` typed firm configuration and placeholders
- `src/lib/`
  - `auth/`, `supabase/`, `appointments/`, `email/`, `notifications/`, `permissions/`, `seo/`, `time/`, `validation/`
- `src/emails/` localized email templates
- `supabase/`
  - `migrations/`
  - `functions/`
  - `seed.sql`
- `scripts/`
  - `create-staff-users.ts`
  - `run-notification-jobs.ts`
- `tests/`
  - `unit/`
  - `integration/`
  - `e2e/`

This architecture separates public site content, staff dashboard concerns, database and auth logic, and email/job automation.

## 3. Public routes and locale routing

Use locale-prefixed routes with `fr` and `ar`.

Public routes:
- `/fr`
- `/fr/cabinet`
- `/fr/expertises`
- `/fr/equipe`
- `/fr/experience`
- `/fr/avis`
- `/fr/rendez-vous`
- `/fr/contact`
- `/fr/confidentialite`
- `/fr/mentions-legales`

Arabic equivalents with reliable paths:
- `/ar`
- `/ar/about`
- `/ar/expertise`
- `/ar/team`
- `/ar/experience`
- `/ar/reviews`
- `/ar/booking`
- `/ar/contact`
- `/ar/privacy`
- `/ar/legal`

Additional internal and shared routes:
- `/auth/login`
- `/dashboard`
- `/cancel/[token]`
- `/api/bookings`
- `/api/cancel`
- `/api/internal/*`

Route design will preserve canonical URLs and support `hreflang` between language equivalents.

## 4. French and Arabic content architecture

Centralize content in a typed content layer under `src/content`.

- `src/content/firm-config.ts` for firm identity, business hours, feature placeholders, and SEO metadata
- `src/content/fr/*` and `src/content/ar/*` for localized page copy, FAQ sections, accordions, labels, and email text
- Each expertise item and marketing section has matching French/Arabic schema
- The public booking form and consent copy are localized at the same level as page metadata

The architecture will ensure:
- content is available server-side
- RTL layout is driven by locale metadata
- placeholders are explicitly marked for missing production content

## 5. Database schema and relationships

The database will be designed for appointment requests, authenticated profiles, weekly availability, audit logs, notifications, and business settings.

Core tables:
- `profiles`
  - `id` (UUID referencing `auth.users(id)`), `email`, `full_name`, `role`, `created_at`, `updated_at`, `is_active`, `language_preferences`
- `lawyer_profiles`
  - `id` (UUID referencing `profiles.id`), `bio`, `expertise_area`, `office_location`, `languages`, `is_active`, `created_at`, `updated_at`
- `appointments`
  - `id`, `public_reference`, `client_name`, `client_email`, `client_phone`, `client_language`, `expertise`, `preferred_lawyer_id`, `assigned_lawyer_id`, `consultation_type`, `requested_date`, `requested_time`, `confirmed_date`, `confirmed_time`, `duration_minutes`, `price_tnd`, `payment_method`, `payment_status`, `payment_reference`, `meeting_link`, `private_notes`, `is_weekend_request`, `status`, `cancellation_token_hash`, `cancellation_token_expires_at`, `created_at`, `updated_at`
- `appointment_audit_logs`
  - `id`, `appointment_id`, `actor_profile_id`, `event_type`, `details`, `created_at`
- `notification_deliveries`
  - `id`, `appointment_id`, `recipient_email`, `recipient_role`, `notification_type`, `status`, `scheduled_for`, `sent_at`, `language`, `provider_id`, `metadata`, `idempotency_key`
- `lawyer_availability`
  - `id`, `lawyer_profile_id`, `day_of_week`, `starts_at`, `ends_at`, `created_at`, `updated_at`
- `blocked_times`
  - `id`, `lawyer_profile_id`, `starts_at`, `ends_at`, `reason`, `created_at`, `updated_at`
- `business_settings`
  - `id`, `key`, `value`, `created_at`, `updated_at`

Supporting enums:
- `appointment_status`
- `payment_status`
- `payment_method`
- `appointment_event_type`
- `notification_type`
- `profile_role`

Relationships:
- `profiles.id` references `auth.users(id)`
- `lawyer_profiles.id` references `profiles.id`
- `appointments.preferred_lawyer_id` → `profiles.id`
- `appointments.assigned_lawyer_id` → `profiles.id`
- `appointment_audit_logs.appointment_id` → `appointments.id`
- `appointment_audit_logs.actor_profile_id` → `profiles.id`
- `lawyer_availability.lawyer_profile_id` → `lawyer_profiles.id`
- `blocked_times.lawyer_profile_id` → `lawyer_profiles.id`
- `notification_deliveries.appointment_id` → `appointments.id`

Persistence rules:
- timestamps stored in UTC
- client-facing display uses `Africa/Tunis`
- no deletion of normal appointment records; use status transitions and audit logs
- appointment inserts occur through a validated server endpoint, not through anonymous direct table access
- notification idempotency is enforced with unique constraints on `(appointment_id, notification_type, recipient_email)` and `(appointment_id, notification_type, scheduled_for)` where appropriate

## 6. Supabase authentication architecture

Use Supabase Auth for staff authentication only.

Architecture:
- server-side Supabase client with service-role key for migrations and secure profile creation
- browser-side Supabase client with anon key for auth flows
- disabled public registration via Supabase Auth settings and RLS
- staff provisioning script `scripts/create-staff-users.ts`
- password resets or invitation flows configured in production
- a secure fallback admin account seeded through script

Auth state:
- `admin_lawyer`
- `lawyer`

Identity:
- `profiles.id` references `auth.users(id)`
- lawyer ownership and assignment relationships use UUID profile references
- `lawyer_profiles` extend `profiles` with lawyer-specific data

The dashboard will use authentication status and role claims verified by server-side helpers.

## 7. Admin and lawyer authorization

Authorization will be enforced in three layers:
1. UI: route guards and conditional controls
2. server: route handlers, server actions, and API checks
3. database: Supabase Row Level Security and policies

Role capabilities:
- `admin_lawyer` can manage all appointments, all calendars, all lawyers, and global settings
- `lawyer` can view and act only on assigned appointments
- both roles can update their own lawyer calendar and appointment details for assigned work
- only admin can assign appointments and manage other staff

Authorization helpers will include:
- `requireStaffSession()`
- `assertAdminOrAssignedLawyer()`
- `assertAdminOnly()`
- `assertAssignedLawyer()`

## 8. Row Level Security policy design

RLS policies will protect `appointments`, `lawyer_availability`, `blocked_times`, `appointment_audit_logs`, and `notification_deliveries`.

Policy design:
- `profiles` row access only for authenticated service and admin contexts
- `lawyer_profiles` rows are accessible only to admin and the associated profile owner
- `appointments`:
  - admin can select/update all rows
  - lawyers can select/update rows where `assigned_lawyer_id = auth.uid()`
  - insert allowed for service role only via validated booking/API endpoint
- `lawyer_availability`:
  - lawyers can manage only their own availability records
  - admin can manage all records
- `blocked_times`:
  - lawyers can manage only their own blocked times
  - admin can manage all records
- `appointment_audit_logs`:
  - insert allowed via service role
  - select allowed for admin and assigned lawyer on related appointment
- `notification_deliveries`:
  - insert allowed via service role
  - select limited to related appointment for assigned lawyer and admin
- `business_settings`:
  - admin-only access

Authentication claims will be derived from Supabase JWT role and a custom `profile_role` claim.

## 9. Appointment lifecycle and valid transitions

Status values:
- `pending`
- `confirmed`
- `rescheduled`
- `completed`
- `cancelled_by_client`
- `cancelled_by_lawyer`
- `rejected`
- `no_show`

Valid transitions:
- `pending` → `confirmed`
- `pending` → `rejected`
- `pending` → `cancelled_by_client`
- `confirmed` → `rescheduled`
- `confirmed` → `completed`
- `confirmed` → `cancelled_by_client`
- `confirmed` → `cancelled_by_lawyer`
- `confirmed` → `no_show`
- `rescheduled` → `rescheduled`
- `rescheduled` → `confirmed`
- `rescheduled` → `completed`
- `rescheduled` → `cancelled_by_client`
- `rescheduled` → `cancelled_by_lawyer`
- `rescheduled` → `no_show`

Rescheduling preserves audit history and creates an event.
Cancellation statuses are terminal except for assignment of a new cancellation token.

## 10. Internal calendar architecture

The staff calendar will be implemented with an internal calendar UI and server-backed appointment data.

Calendar views:
- day view
- week view
- month view

Core components:
- calendar grid component with accessible navigation and keyboard support
- appointment card with status, lawyer, client time, and location type
- appointment details drawer/modal
- filters for status, assigned lawyer, and weekend requests
- upcoming appointment list and pending request panel

Data flow:
- dashboard loads appointments from the server for the current user and view range
- admin views can load all lawyers and calendars
- lawyer views are restricted to assigned appointment events

The calendar will avoid external calendar APIs and rely only on internal date handling.

## 11. Availability and conflict handling

Availability will be modeled through recurring weekly lawyer availability plus blocked times.

Rules:
- default business hours are Monday–Friday 08:00–17:00
- lawyers may define weekly available hours in `lawyer_availability`
- `blocked_times` record exceptions, vacations, and out-of-office periods
- appointment creation/rescheduling validates against weekly availability and blocked times
- weekend requests are flagged and require explicit approval

Conflict handling:
- UI warns staff about overlapping appointments and blocked times
- server-side validation rejects conflicting updates
- blocked_times can be used to mark vacations or out-of-office periods

## 12. Secure client-cancellation-token flow

Use a secure, random cancellation token flow.

Flow:
- generate a strong random token on appointment creation or when cancellation is enabled
- store only a hash of the token in `appointments.cancellation_token_hash`
- include no sequential IDs in public cancellation URLs
- expose cancellation route `/cancel/[token]`
- validate token by comparing hash and checking expiration
- invalidate the token after use or after the appointment date passes
- apply configurable cutoff hours stored in `business_settings`, default 24
- send cancellation confirmation email to client, assigned lawyer, and admin

Secrets and security:
- use `CANCELLATION_TOKEN_SECRET` or equivalent key for hashing
- never log raw cancellation tokens

## 13. Email template architecture

Use a provider abstraction with localized template content.

Template categories:
- client emails
- staff emails
- lawyer agenda emails

Email types:
- request received
- appointment confirmed
- appointment rescheduled
- cancellation confirmed
- cancellation notification to staff
- 24-hour reminder
- 2-hour reminder
- daily agenda at 07:00
- notifications for newly assigned requests

Implementation:
- `src/lib/email/provider.ts` interface
- `src/lib/email/console-provider.ts` for development
- `src/lib/email/resend-provider.ts` or equivalent for production
- templates in `src/emails/fr/*` and `src/emails/ar/*`
- email assembly uses the booking language choice

## 14. Reminder scheduling and idempotency

The notification system will be idempotent and retry-safe.

Design:
- generate unique idempotency keys per appointment and notification type
- store sent notifications in `notification_deliveries`
- skip sending when a matching sent record exists
- retain records for audit and duplicate-prevention
- support job restarts without duplicate deliveries

Reminder schedule:
- 24-hour reminder for confirmed and rescheduled appointments
- 2-hour reminder for confirmed and rescheduled appointments
- only for appointments still active and not cancelled
- use appointment local `Africa/Tunis` time for cutoff calculations

## 15. Daily 07:00 Africa/Tunis agenda architecture

Design a daily agenda job that runs at 07:00 `Africa/Tunis`.

Behavior:
- send one agenda email per lawyer with that lawyer’s confirmed and rescheduled appointments for the day
- include a separate action-required section for pending requests assigned to the lawyer
- include an empty state email when there are no appointments
- record job execution and idempotency per date and lawyer
- use `scheduled_job_runs` and `notification_deliveries` for safety

Implementation path:
- scheduled job triggered by Supabase scheduler or local cron in dev
- job computes date boundary in `Africa/Tunis`
- job sends one email per lawyer email address

## 16. Payment-tracking architecture

Payment data remains manual tracking only.

Fields and values:
- `payment_method`: `flouci`, `edinar`, `bank_transfer`, `cash_at_office`, `undecided`
- `payment_status`: `awaiting_payment`, `paid`, `bank_transfer_pending`, `payment_at_office`, `refunded`, `not_required`
- staff can edit method and status after booking
- optional payment reference field for manual transfer receipts

Presentation:
- show payment metadata prominently in appointment details
- avoid any payment gateway or card data collection in this phase

## 17. SEO architecture

Implement all required SEO foundations.

Key elements:
- localized metadata per page
- `hreflang` links between French and Arabic equivalents
- canonical URLs
- `sitemap.xml` route
- `robots.txt` route
- Open Graph metadata for home and core pages
- local business JSON-LD in page metadata
- search console placeholder configuration via env
- analytics hook without tracking secrets

Public pages will be rendered server-side with proper metadata structured by locale.

## 18. Accessibility approach

Target WCAG 2.1 AA fundamentals.

Accessibility rules:
- keyboard-accessible controls
- visible focus states
- form labels and accessible validation errors
- meaningful heading structure
- sufficient contrast and text semantics
- reduced-motion support
- logical page landmarks
- accessible accordion/expanders
- no information conveyed by color alone
- status updates announced for form submissions and notifications

The Expertise page and booking form will use accessible interactive patterns.

## 19. Security threats and mitigations

Primary threats:
- public auth or staff role bypass
- SQL/RLS misconfiguration
- duplicate email sends
- cancellation token leakage
- weekend appointment approval bypass
- content injection from user-entered text
- exposure of service-role keys
- misconfigured environment variables

Mitigations:
- enforce server-side auth and role checks
- implement Supabase RLS policies
- use typed Zod validation for all public inputs
- store only hashed cancellation tokens
- disable browser-side public signup
- keep service keys in server env only
- validate env variables on startup
- rate-limit booking, login, and cancellation routes
- sanitize user-provided text in rendered templates
- never log secrets or tokens

## 20. Testing strategy

Add tests at multiple levels.

Unit tests:
- content schemas
- validation schemas
- utility functions
- auth helpers
- appointment lifecycle rules

Integration tests:
- public booking form submission and server handling
- email notification idempotency
- cancellation-token validation
- RLS authorization behavior (database-level)
- locale route metadata

E2E tests:
- French and Arabic public site navigation
- booking request workflow
- staff login and dashboard access
- appointment assignment/confirmation flow
- client cancellation flow
- reminder and agenda job behavior as mock or dry run

Validation:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e` once Playwright is configured in later phases

## 21. Required environment variables

Base required variables:
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_DEFAULT_LOCALE=fr`
- `NEXT_PUBLIC_SUPPORTED_LOCALES=fr,ar`
- `APP_TIMEZONE=Africa/Tunis`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY` or equivalent transactional email key
- `EMAIL_FROM`
- `ADMIN_NOTIFICATION_EMAIL`
- `EMAIL_MODE` (`console` or `provider`)
- `CRON_SECRET`
- `CANCELLATION_TOKEN_SECRET`
- `DEFAULT_CANCELLATION_CUTOFF_HOURS=24`
- `NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION` (optional placeholder)
- `NEXT_PUBLIC_ANALYTICS_ID` (optional placeholder)

Additional envs for production:
- `NODE_ENV`

## 22. Ordered implementation phases

The plan follows the requested phase model:

1. `foundation`
   - project scripts
   - global tokens
   - fonts and typography
   - locale routing
   - French/Arabic root layouts
   - header/footer/language switcher
   - public placeholders
   - central typed configuration
   - environment validation
   - base tests

2. `database-auth`
   - Supabase client and server setup
   - SQL migrations and enums
   - authentication and RLS policies
   - staff-only dashboard scaffold
   - creation script and env examples
   - permission tests

3. `public-site`
   - public marketing content
   - Expertise page with accessible accordions
   - contact, booking layout, privacy, legal notices
   - responsive French/Arabic UI

4. `booking`
   - full booking form
   - validation, rate limiting, anti-spam
   - request persistence and pending status
   - localized emails for client and admin
   - success page and booking tests

5. `dashboard-calendar`
   - appointment calendar views
   - staff appointment management
   - assignment, approval, rejection, rescheduling
   - payment tracking and meeting links
   - audit history and availability checks
   - role-based authorization tests

6. `email-jobs`
   - email provider abstraction
   - reminder and daily agenda jobs
   - notification records and idempotency
   - cancellation email workflow
   - scheduled-job runner and tests

7. `seo-security-tests`
   - localized metadata, sitemap, robots
   - Open Graph, JSON-LD, secure headers
   - input validation, rate-limit, RLS review
   - accessibility/performance audits
   - analytics and search-console support
   - final verification tests

8. `final-audit`
   - requirement checklist
   - full verification commands
   - documentation updates
   - launch readiness assessment

## 23. Acceptance criteria for each phase

`foundation`
- `pnpm lint`, `pnpm typecheck`, `pnpm build` should pass after foundation work
- French and Arabic routes exist as placeholders
- root layouts set correct `lang` and `dir`
- header, footer, and language switcher are present
- central content configuration exists
- environment validation is added

`database-auth`
- Supabase client configuration exists
- migrations define staff, appointments, enums, and RLS
- public signup is disabled
- one admin and two lawyer roles are supported
- dashboard layout is protected by auth
- staff creation script exists
- permission tests verify denied access

`public-site`
- all required public pages exist in both locales
- Expertise page contains server-rendered expandable sections
- booking page and marketing pages are responsive
- public content uses centralized placeholders for missing info
- French and Arabic pages maintain equivalent structure

`booking`
- booking form includes all required fields and consent
- weekends are detected and marked
- requests persist with `pending` status
- request-received client email and admin notification email are sent or logged
- audit event is created
- booking tests cover validation and persistence

`dashboard-calendar`
- calendar day/week/month views are available
- admin sees all appointments, lawyers see assigned only
- appointment status transitions work
- conflict detection and availability rules exist
- payment tracking and meeting links are editable
- authorization tests cover both roles

`email-jobs`
- email provider abstraction is implemented
- reminder and agenda jobs run with idempotency
- secure cancellation token flow works
- cancellation confirmation page exists
- emails are localized
- job tests validate schedule and duplicate prevention

`seo-security-tests`
- metadata, sitemap, robots, Open Graph, JSON-LD are present
- security review passes for auth, RLS, and rate limiting
- accessibility and responsive audits show no critical failures
- Playwright end-to-end workflows cover the key user journeys

`final-audit`
- every acceptance criterion from `docs/PRODUCT_SPEC.md` is verified
- all command checks pass
- documentation and progress artifacts are updated

## 24. External accounts or credentials eventually required

The final product will require:
- Supabase project credentials
- Supabase service role key and anon key
- SMTP or transactional email provider account (Resend or equivalent)
- Search Console verification settings if deployed in production
- Analytics measurement ID if tracking is enabled
- Secure environment secrets for cancellation token hashing and cron jobs

---

## Summary

This product will be built as a bilingual Next.js App Router application with a clear separation between the public marketing site, staff dashboard, and backend services.

Important architectural choices:
- locale-prefixed route structure for French (`fr`) and Arabic (`ar`)
- centralized typed content for public copy and SEO
- Supabase Auth plus strong Row Level Security for staff authorization
- appointment lifecycle modeled explicitly with `pending`, `confirmed`, `rescheduled`, `completed`, `cancelled_by_client`, `cancelled_by_lawyer`, `rejected`, and `no_show`
- internal calendar views with no external synchronization
- secure hashed cancellation tokens and idempotent notification records

Important risks:
- RLS complexity and authorization errors if not carefully tested
- duplicate email reminders without an idempotency strategy
- RTL layout regressions if locale direction is not consistently applied
- a public booking flow that must safely handle weekend requests and legal disclaimers

Decisions requiring developer approval:
- exact Arabic route slugs versus simplified English slugs
- whether to use Resend or an alternative transactional email provider
- whether to model availability as slots only or also as daily work patterns
- approval of placeholder public content patterns and client-facing copy

Recommended next phase:
- `foundation`
  - establish locale routing, typography, layout, navigation, placeholder pages, and typed content configuration
  - this will create the stable public scaffolding needed for later database, auth, and booking work
