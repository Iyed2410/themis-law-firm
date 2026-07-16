# Themis Law Firm Website

A bilingual French/Arabic law-firm website with an internal appointment calendar, secure staff accounts, confirmation and reminder emails, client cancellation links, and local SEO foundations.

## Product summary

**Brand:** Themis Law Firm — Saadaoui & Haddad  
**Time zone:** Africa/Tunis  
**Public languages:** French and Arabic  
**Staff:** One admin/lawyer plus two lawyers  
**Normal hours:** Monday–Friday, 08:00–17:00  
**Weekend appointments:** Exceptional requests requiring manual approval  
**Calendar:** Internal to the website only; no external synchronization

## Core features

### Public website

- Premium responsive design based on black, navy, gold, silver, and ivory.
- French LTR and Arabic RTL experiences.
- Home, About, Expertise, Team, Representative Matters, Reviews, Booking, Contact, Privacy, and Legal Notice pages.
- One Expertise page with expandable, indexable legal fields.
- Contact details, location, office hours, and map.
- Bilingual SEO metadata, `hreflang`, sitemap, JSON-LD, canonical URLs, and Open Graph data.

### Booking

- Appointment request form.
- Online or in-office consultation.
- Preferred lawyer or no preference.
- Preferred date and time.
- Exceptional weekend request handling.
- Manual consultation price, duration, payment method, and payment status.
- No public document uploads.
- No instant confirmation until staff approves the request.

### Staff dashboard

- Secure staff-only login.
- One admin/lawyer account.
- Two lawyer accounts.
- Internal day/week/month calendar.
- Pending, upcoming, cancelled, and weekend-request views.
- Appointment assignment, confirmation, rescheduling, cancellation, and completion.
- Role-based visibility.
- Audit history.
- Payment tracking.
- Manual online-meeting link entry.

### Email automation

- Request received.
- Appointment confirmation.
- Rescheduling.
- Cancellation.
- 24-hour reminder.
- 2-hour reminder.
- Daily agenda at 07:00 Africa/Tunis for every lawyer.
- Secure client cancellation link.
- Idempotent delivery records to prevent duplicate emails.

---

## Recommended stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Accessible UI primitives
- next-intl
- Supabase PostgreSQL
- Supabase Auth and Row Level Security
- FullCalendar
- React Hook Form
- Zod
- Resend
- Supabase Edge Functions and scheduled jobs
- Vitest
- Playwright

Use current stable mutually compatible releases.

---

## Suggested repository structure

```text
themis-law-firm/
├─ app/
│  ├─ [locale]/
│  │  ├─ (marketing)/
│  │  │  ├─ page.tsx
│  │  │  ├─ cabinet/page.tsx
│  │  │  ├─ expertises/page.tsx
│  │  │  ├─ equipe/page.tsx
│  │  │  ├─ experience/page.tsx
│  │  │  ├─ avis/page.tsx
│  │  │  ├─ rendez-vous/page.tsx
│  │  │  ├─ contact/page.tsx
│  │  │  ├─ confidentialite/page.tsx
│  │  │  └─ mentions-legales/page.tsx
│  │  └─ layout.tsx
│  ├─ dashboard/
│  │  ├─ page.tsx
│  │  ├─ calendar/page.tsx
│  │  ├─ appointments/
│  │  │  └─ [id]/page.tsx
│  │  ├─ requests/page.tsx
│  │  ├─ settings/page.tsx
│  │  └─ layout.tsx
│  ├─ cancel/
│  │  └─ [token]/page.tsx
│  ├─ auth/
│  │  └─ login/page.tsx
│  ├─ api/
│  │  ├─ bookings/route.ts
│  │  ├─ appointments/
│  │  ├─ cancel/
│  │  └─ internal/
│  ├─ sitemap.ts
│  ├─ robots.ts
│  └─ layout.tsx
├─ components/
│  ├─ marketing/
│  ├─ booking/
│  ├─ calendar/
│  ├─ dashboard/
│  ├─ email/
│  └─ ui/
├─ content/
│  ├─ fr/
│  ├─ ar/
│  └─ firm-config.ts
├─ lib/
│  ├─ auth/
│  ├─ appointments/
│  ├─ email/
│  ├─ notifications/
│  ├─ permissions/
│  ├─ rate-limit/
│  ├─ seo/
│  ├─ supabase/
│  ├─ time/
│  └─ validation/
├─ emails/
│  ├─ client/
│  ├─ lawyer/
│  └─ admin/
├─ public/
│  └─ brand/
│     ├─ themis-logo-light.png
│     └─ themis-logo-dark.png
├─ scripts/
│  ├─ create-staff-users.ts
│  ├─ seed-content.ts
│  └─ run-notification-jobs.ts
├─ supabase/
│  ├─ migrations/
│  ├─ functions/
│  │  └─ appointment-jobs/
│  └─ seed.sql
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  └─ e2e/
├─ .env.example
├─ INSTRUCTIONS.md
├─ README.md
└─ PROMPT.md
```

The exact route names can differ, but preserve the product requirements and role boundaries.

---

## Environment variables

Create `.env.local` from `.env.example`.

Suggested variables:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=fr
NEXT_PUBLIC_SUPPORTED_LOCALES=fr,ar
APP_TIMEZONE=Africa/Tunis

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

RESEND_API_KEY=
EMAIL_FROM="Themis Law Firm <appointments@example.com>"
ADMIN_NOTIFICATION_EMAIL=
EMAIL_MODE=console

CRON_SECRET=
CANCELLATION_TOKEN_SECRET=
DEFAULT_CANCELLATION_CUTOFF_HOURS=24

NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL=
NEXT_PUBLIC_ANALYTICS_ID=
NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION=

FIRM_NAME_FR="Themis Law Firm — Saadaoui & Haddad"
FIRM_NAME_AR=
FIRM_ADDRESS_FR=
FIRM_ADDRESS_AR=
FIRM_PHONE=
FIRM_WHATSAPP=
FIRM_EMAIL=
```

Never expose `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CRON_SECRET`, or token secrets to the browser.

---

## Local setup

### Prerequisites

- Current Node.js LTS
- pnpm
- Supabase CLI
- A local or hosted Supabase project
- A Resend account for production email

### Install

```bash
pnpm install
cp .env.example .env.local
```

### Start Supabase locally

```bash
supabase start
supabase db reset
```

Copy the local Supabase URL and keys into `.env.local`.

### Start the app

```bash
pnpm dev
```

Open:

```text
http://localhost:3000/fr
http://localhost:3000/ar
http://localhost:3000/auth/login
```

### Development email mode

Set:

```bash
EMAIL_MODE=console
```

Emails should be rendered and logged without contacting real clients.

For production:

```bash
EMAIL_MODE=resend
RESEND_API_KEY=...
```

---

## Database setup

All schema changes must be committed as timestamped SQL migrations inside `supabase/migrations`.

After migrations:

```bash
supabase db reset
```

Do not manually create production-only columns through the dashboard without a migration.

### Required tables

- `profiles`
- `lawyer_profiles`
- `appointments`
- `appointment_audit_logs`
- `notification_deliveries`
- `lawyer_availability`
- `blocked_times`
- `business_settings`

### RLS expectations

- Anonymous users have no direct read access to appointments.
- Public booking is handled through a validated server action or API route.
- Admin can access all appointments.
- Lawyer can select and update only appointments where `assigned_lawyer_id` matches their profile.
- Audit and email logs are server-controlled.
- Public account registration is disabled.

---

## Creating the three staff users

Use the provided staff creation script rather than public signup.

Example:

```bash
pnpm staff:create \
  --email admin@example.com \
  --role admin_lawyer \
  --name "Maître Admin"

pnpm staff:create \
  --email lawyer1@example.com \
  --role lawyer \
  --name "Maître Lawyer One"

pnpm staff:create \
  --email lawyer2@example.com \
  --role lawyer \
  --name "Maître Lawyer Two"
```

The script should:

1. Create or invite the Supabase Auth user through the server admin API.
2. Create/update the profile.
3. Create/update the lawyer profile.
4. Never print passwords or service keys.
5. Require password reset or secure invitation in production.

Replace the example emails and names with the client-provided details.

---

## Content configuration

Do not hard-code addresses, phone numbers, names, and biographies across components.

Store them in one typed configuration layer, for example:

```text
content/firm-config.ts
content/fr/*.json
content/ar/*.json
```

Pending content that must be replaced before launch:

- Official Arabic firm name.
- Firm address in both languages.
- Phone/WhatsApp/email.
- Team names and titles.
- Team biographies.
- Lawyer profile photos.
- Approved expertise descriptions.
- Approved anonymized representative matters.
- Approved client reviews.
- Consultation pricing policy.
- Cancellation/refund text.
- Privacy/legal texts.

Do not invent production facts.

---

## Booking flow

### Request submission

1. Validate the form with Zod.
2. Apply rate limiting and anti-spam protection.
3. Normalize phone and email.
4. Store request as `pending`.
5. Flag weekend request.
6. Create audit entry.
7. Email client and admin.
8. Show a neutral confirmation page without exposing internal IDs.

### Confirmation

1. Admin assigns a lawyer.
2. Admin or assigned lawyer sets date, duration, price, type, payment, and location/link.
3. Server verifies role permissions and schedule validity.
4. Status becomes `confirmed`.
5. Generate a cancellation token.
6. Store only its hash.
7. Email client and lawyer.
8. Create notification schedule state.

### Cancellation

1. Client token is validated server-side.
2. Confirm cutoff and appointment state.
3. Status becomes `cancelled_by_client`.
4. Invalidate token.
5. Audit the event.
6. Email client, assigned lawyer, and admin.

---

## Scheduled jobs

Use a reliable server-side scheduler. A recommended setup is one Supabase Edge Function called every 10 minutes.

The job should:

- Locate confirmed appointments due for a 24-hour reminder.
- Locate confirmed appointments due for a 2-hour reminder.
- Send each notification once.
- At local 07:00, send each lawyer that day’s agenda.
- Record success/failure in `notification_deliveries`.
- Retry temporary failures safely.
- Never duplicate a delivery.
- Ignore cancelled/rejected/completed appointments as appropriate.

For local testing:

```bash
pnpm jobs:run
```

The script should execute the same business logic in dry-run or console-email mode.

---

## Calendar behavior

- Store all timestamps in UTC.
- Display them in Africa/Tunis.
- Day/week/month views.
- Admin sees all appointments.
- Lawyer sees only assigned appointments.
- Weekend requests have a visible badge.
- Status and payment state are visible but not communicated by color alone.
- Calendar edits must use server mutations with permission checks.
- Every schedule change triggers audit logging and relevant emails.

---

## SEO setup

Before launch:

1. Replace all placeholder firm data.
2. Set the production site URL.
3. Add French and Arabic metadata.
4. Verify canonical and `hreflang`.
5. Generate sitemap and robots files.
6. Add LegalService/local business JSON-LD.
7. Configure analytics only with the client’s approval.
8. Add Search Console verification.
9. Ensure contact data matches the Google Business Profile.
10. Verify each expertise anchor can be linked directly.
11. Test branded searches after indexing, without promising ranking position.

---

## Testing

### Unit and integration tests

Cover:

- Date/time calculations.
- Weekend detection.
- Appointment state transitions.
- Permission rules.
- Price/duration validation.
- Cancellation cutoff.
- Token hashing and validation.
- Reminder windows.
- Notification idempotency.
- Email locale selection.

### End-to-end tests

Cover:

1. French visitor submits a request.
2. Arabic visitor submits a request in RTL.
3. Admin logs in and confirms.
4. Assigned lawyer can see the appointment.
5. Other lawyer cannot access it.
6. Lawyer edits price and duration.
7. Client cancels through secure email link.
8. Admin and lawyer receive cancellation notices.
9. Lawyer cancels and client receives notice.
10. Reminder job sends once.
11. Daily agenda contains only the lawyer’s own appointments.
12. Mobile calendar is usable.

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

All must pass before deployment.

---

## Deployment

Recommended:

- Next.js app: Vercel or another Node-compatible host.
- Database/Auth: Supabase.
- Email: Resend.
- Scheduled jobs: Supabase Edge Functions/Cron.

Deployment checklist:

- Production environment variables configured.
- Database migrations applied.
- RLS policies verified.
- Staff accounts created through secure invitations.
- Public signup disabled.
- Production email domain verified.
- Cron/Edge Function deployed.
- Backups enabled.
- Logo and content replaced.
- Legal texts approved by the firm.
- Booking and cancellation tested with real email addresses.
- Arabic RTL checked on mobile.
- Search sitemap submitted.
- Admin training completed.

---

## Operational notes

- Appointments are not legal case files.
- Keep client messages short and avoid storing unnecessary sensitive details.
- Never permanently delete appointments through the normal UI.
- Maintain audit history.
- Review failed email logs.
- Test database restoration periodically.
- Apply security updates.
- Keep monthly maintenance and SEO as separate commercial services.

See `INSTRUCTIONS.md` for the complete non-negotiable requirements.
