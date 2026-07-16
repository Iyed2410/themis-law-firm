# PROMPT.md — Full Build Prompt for an AI Coding Agent

You are a senior full-stack engineer, product designer, security-minded architect, and QA engineer. Build a production-ready bilingual website and private appointment-management application for **Themis Law Firm — Saadaoui & Haddad**.

Do not produce only a mockup, static landing page, or disconnected UI. Implement the database, authentication, role permissions, booking lifecycle, internal calendar, email templates, scheduled reminders, secure cancellation links, tests, migrations, setup documentation, and deployment-ready configuration.

Read and follow `INSTRUCTIONS.md` as the authoritative product specification. Use `README.md` for setup and operational expectations. When a detail conflicts, `INSTRUCTIONS.md` wins.

## Objective

Create:

1. A premium French/Arabic public law-firm website focused on trust, authority, and Google presence.
2. A secure staff dashboard with a calendar stored locally in the website database.
3. One admin/lawyer account with full access.
4. Two lawyer accounts that see and manage only their own appointments.
5. End-to-end appointment emails, reminders, daily agendas, and client cancellation.

There must be **no Google Calendar, Outlook, Apple Calendar, or external calendar synchronization**.

## Required stack

Use:

- Next.js App Router.
- TypeScript with strict mode.
- Tailwind CSS.
- Accessible UI primitives.
- next-intl for French and Arabic.
- Supabase PostgreSQL.
- Supabase Auth.
- Supabase Row Level Security.
- FullCalendar for the internal calendar.
- React Hook Form.
- Zod.
- Resend through an email service abstraction.
- Supabase Edge Functions and scheduled jobs for reminders/agendas.
- Vitest.
- Playwright.

Use current stable compatible package releases. Avoid deprecated patterns.

## Brand and visual direction

Brand:

- Themis Law Firm — Saadaoui & Haddad.
- Use supplied logo files from `public/brand`.
- Preserve logo proportions.
- Build a safe logo component that works on dark and light backgrounds.

Style:

- Classy, elegant, premium, serious, and trustworthy.
- Modern with restrained Roman/classical influence.
- Deep navy and black foundations.
- Controlled gold accents.
- Silver and ivory secondary tones.
- Spacious editorial composition.
- Fine lines, arches, and subtle architectural geometry.
- No excessive gavels, scales, pillars, marble, or ornamental clutter.
- No casino-like gold, loud gradients, or generic template appearance.

Use design tokens beginning with:

```css
--black: #050607;
--navy: #0A1628;
--gold: #C6A15B;
--silver: #B8BCC3;
--ivory: #F4F1E8;
--muted: #9DA3AE;
```

Use accessible contrast.

Typography direction:

- Latin display: Cinzel or Cormorant Garamond.
- Latin body: Inter or Manrope.
- Arabic: Noto Kufi Arabic or Noto Sans Arabic.
- Use proper `lang` and `dir` attributes.
- Do not use a Latin decorative font for Arabic.

Animations must be subtle and respect reduced-motion preferences.

## Public routing and pages

Build French and Arabic versions of:

- Home.
- About the firm.
- Expertise.
- Team.
- Representative matters.
- Reviews.
- Book a consultation.
- Contact.
- Privacy policy.
- Legal notice and professional disclaimer.

Use a locale-prefixed route architecture. Implement a language switcher that preserves the equivalent page.

Implement:

- Canonical URLs.
- French/Arabic `hreflang`.
- Localized metadata.
- Sitemap.
- Robots file.
- Open Graph metadata.
- JSON-LD for the legal/local business.
- Search Console verification configuration.
- Analytics environment hook.

## Public content behavior

Do not invent real team biographies, addresses, phone numbers, reviews, or cases.

Create a centralized typed content/config system with explicit placeholders for the client-supplied data. Include seed/example content clearly marked as non-production. The app must remain functional while making missing production content obvious.

Known facts:

- Normal hours: Monday–Friday 08:00–17:00.
- Weekend appointments are exceptional and manually approved.
- Two lawyers speak Arabic and French.
- One lawyer speaks Arabic, French, and English.
- Exact names, titles, address, phone numbers, and biographies will be inserted later.
- Official Arabic firm name is pending.

## Expertise page

All expertise must live on one page, never on separate expertise routes.

Create accessible server-rendered accordion or expandable cards for:

1. Droit pénal — القانون الجزائي
2. Droit civil — القانون المدني
3. Droit immobilier et foncier — القانون العقاري
4. Droit commercial et des affaires — القانون التجاري وقانون الأعمال
5. Droit des sociétés — قانون الشركات
6. Droit maritime — القانون البحري
7. Droit de la famille — قانون الأسرة
8. Propriété intellectuelle — الملكية الفكرية
9. Droit du travail et de l’emploi — قانون الشغل والتوظيف

Requirements:

- All text exists in the server-rendered DOM.
- Keyboard accessible.
- Proper ARIA behavior.
- Unique anchor ID for every field.
- Each field has a consultation CTA.
- French and Arabic copy structures correspond.
- Content files make later editing simple.

## Public booking form

Create a complete booking-request page and server flow.

Fields:

- Full name.
- Email.
- Phone.
- Preferred language.
- Legal expertise.
- Preferred lawyer or no preference.
- Consultation type: online or in office.
- Preferred date.
- Preferred time.
- Preferred payment method:
  - Flouci
  - e-Dinar
  - Bank transfer
  - Payment at the office
- Short reason, maximum 500 characters.
- Privacy consent.
- Acknowledgement that the request does not establish a lawyer-client relationship.

Do not implement document upload.

Add a warning not to send urgent, confidential, or highly sensitive information.

Behavior:

- Validate with Zod on client and server.
- Rate-limit submissions.
- Add a honeypot or equivalent spam control.
- Store timestamps in UTC.
- Use Africa/Tunis for business rules and display.
- Detect weekends and set `is_weekend_request`.
- Save as `pending`.
- Create an audit event.
- Send the client a localized request-received email.
- Send the admin a new-request email.
- Return a safe success page with no internal ID.

## Authentication

Use Supabase Auth.

Rules:

- Disable public signup.
- Staff accounts are created/invited only by a secure server-side script.
- Provide `scripts/create-staff-users.ts`.
- Use password reset/invitation in production.
- Support future MFA.
- Create one `admin_lawyer` role and two `lawyer` roles.
- Never trust role information supplied by the browser.

## Role authorization

Admin/lawyer can:

- See all appointments and calendars.
- Approve, reject, assign, create, edit, reschedule, and cancel any appointment.
- Set price, duration, payment, meeting link, and status.
- Manage availability and the two lawyer accounts.
- View audit history and basic statistics.
- Also operate as a lawyer for assigned appointments.

Lawyer can:

- See only appointments assigned to them.
- See only their own day/week/month calendar.
- Set/change price and duration for their own appointments.
- See/change payment method and status for their own appointments.
- Add meeting link and notes.
- Reschedule/cancel their own appointments.
- Mark their own appointments completed or no-show.
- Never see another lawyer’s appointment.
- Never manage users or global settings.

Enforce authorization in server actions/API handlers and RLS policies. Add tests proving unauthorized access fails.

## Database

Create SQL migrations and typed data access.

Implement at minimum:

- `profiles`
- `lawyer_profiles`
- `appointments`
- `appointment_audit_logs`
- `notification_deliveries`
- `lawyer_availability`
- `blocked_times`
- `business_settings`

Use UUID primary keys.

Appointment must include:

- Public random reference.
- Client contact details.
- Client language.
- Expertise.
- Preferred and assigned lawyer.
- Consultation type.
- Requested and confirmed date/time.
- Duration.
- Price TND.
- Status.
- Payment method/status/reference.
- Meeting link.
- Short client message.
- Admin notes.
- Lawyer notes.
- Weekend flag.
- Hashed cancellation token and expiration.
- Created and updated timestamps.

Store timestamps in UTC.

Create indexes for:

- Assigned lawyer and confirmed start.
- Status and requested start.
- Reminder queries.
- Client cancellation token hash.
- Notification idempotency.

## Appointment statuses

Use:

```ts
type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "rescheduled"
  | "completed"
  | "cancelled_by_client"
  | "cancelled_by_lawyer"
  | "rejected"
  | "no_show";
```

Use explicit payment enums matching `INSTRUCTIONS.md`.

Implement a server-side state transition service. Reject invalid transitions.

## Confirmation flow

Admin or assigned lawyer sets:

- Assigned lawyer.
- Confirmed date/time.
- Duration preset or custom duration.
- Price in TND, including zero.
- Online/in-office.
- Meeting link or office location.
- Payment method.
- Payment status.

On confirmation:

- Validate role and all fields.
- Validate schedule.
- Set confirmed status.
- Generate a cryptographically secure client cancellation token.
- Store only a strong hash.
- Set expiration.
- Create audit record.
- Send localized client confirmation.
- Send assigned lawyer confirmation.
- Include secure cancellation URL in client email.
- Initialize reminder state without scheduling duplicates.

## Internal dashboard

Create a polished responsive French dashboard.

Routes or equivalent:

- Dashboard overview.
- Calendar.
- Pending requests.
- Appointment details.
- Settings, admin only.
- User management, admin only.

Dashboard overview:

- Today’s appointments.
- Pending requests.
- Upcoming appointments.
- Weekend requests.
- Unpaid appointments.
- Counts by status.

Calendar:

- Day, week, month.
- Upcoming list.
- Filters.
- Status and payment indicators with text/icons, not color only.
- Admin sees all.
- Lawyer sees only own.
- Click opens details.
- Optional drag/resizing is allowed only if implemented with server validation, audit logs, and notifications. Otherwise provide an explicit reschedule dialog.

Appointment detail:

- Client information.
- Expertise and language.
- Request details.
- Assignment.
- Date/time/duration.
- Price/payment.
- Meeting link.
- Status.
- Notes.
- Audit history.
- Role-appropriate actions.

The dashboard must be usable on mobile.

## Client cancellation

Create a public route using a secure random token.

Security:

- Use at least 32 random bytes.
- Store only the hash.
- Compare safely server-side.
- Never reveal database IDs.
- Rate-limit the endpoint.
- Invalidate token after use.
- Reject expired, cancelled, completed, or past appointments.

Flow:

1. Open link.
2. Show limited appointment information.
3. Ask for explicit confirmation.
4. Apply configurable cutoff, default 24 hours.
5. Set `cancelled_by_client`.
6. Create audit entry.
7. Email client confirmation.
8. Email assigned lawyer.
9. Email admin.
10. Preserve the appointment record.

If cutoff passed, show the firm’s phone/email and instruct the client to contact the firm.

## Lawyer cancellation

Allow lawyer to cancel only their appointment.

- Confirmation modal.
- Optional reason.
- Set `cancelled_by_lawyer`.
- Audit.
- Email client immediately.
- Email admin if performed by a non-admin lawyer.
- Keep record.
- Allow payment status to be set to refund pending/refunded when relevant.

## Email system

Create reusable bilingual React email templates or equivalent.

Client templates in French and Arabic:

- Request received.
- Confirmed.
- Rescheduled.
- Cancelled by lawyer.
- Client cancellation confirmed.
- 24-hour reminder.
- 2-hour reminder.
- Payment instructions.

Staff templates in French:

- New request.
- Weekend request.
- Assigned/confirmed appointment.
- Rescheduled.
- Cancelled.
- Client cancellation.
- Reminder.
- Daily agenda.

Every email must include:

- Themis branding.
- Clear date/time in Africa/Tunis.
- Consultation type.
- Lawyer name.
- Expertise.
- Price and payment status when applicable.
- Meeting link or address when applicable.
- Support contact.
- Legal/confidentiality footer where appropriate.

Build an email service interface with:

- Resend production provider.
- Console/local provider.
- Structured result and error handling.

## Scheduled reminders and daily agenda

Implement a scheduled worker/Edge Function called at least every 10–15 minutes.

Reminder rules:

- Confirmed/rescheduled upcoming appointments only.
- Send 24-hour reminder once.
- Send 2-hour reminder once.
- Client receives localized reminder.
- Assigned lawyer receives staff reminder.
- Rescheduling must make reminder calculations use the new time.
- Cancelled/rejected/completed appointments receive no reminders.

Daily agenda:

- At 07:00 Africa/Tunis every day.
- Send every lawyer their own agenda only.
- Include appointment time, client, expertise, type, payment state, meeting link, and dashboard link.
- Send a “no appointments today” email when empty.
- Send once per lawyer per local date.

Reliability:

- `notification_deliveries` must enforce unique idempotency keys.
- Log provider response/status.
- Retry transient failures safely.
- Never send duplicates.
- Add a local command to execute jobs with console email output.
- Add tests for time windows and idempotency.

## Payment handling

Do not implement fake online payment.

For the initial release:

- Client selects preferred method.
- Staff edits method/status.
- Staff sets price.
- Store optional payment reference.
- Display payment details in dashboard and email.
- Do not collect card or wallet credentials.
- Create an interface for future Flouci/e-Dinar providers, but keep it disabled without credentials.

## Availability

Create basic weekly availability for each lawyer and blocked-time records.

- Default business hours Monday–Friday, 08:00–17:00.
- Weekend requests allowed but flagged.
- The public form requests preferred time; it does not guarantee availability.
- Admin can override and confirm exceptional times.
- Detect schedule conflicts and show a warning. Admin may override with explicit confirmation; ordinary lawyer accounts should not create overlaps by default.

## Audit logging

Audit:

- Creation.
- Assignment.
- Confirmation.
- Reschedule.
- Price change.
- Duration change.
- Payment change.
- Meeting-link change.
- Status change.
- Client cancellation.
- Lawyer cancellation.
- Notes updates if appropriate.

Record:

- Appointment.
- Actor.
- Action.
- Timestamp.
- Safe old/new value summary.

Do not store secrets or cancellation tokens in logs.

## Security

Implement:

- RLS policies.
- Server-side role checks.
- Strict schemas.
- Rate limiting.
- Secure headers.
- Safe errors.
- No service keys in browser.
- No public signup.
- Cryptographic cancellation tokens.
- No sensitive data in client logs.
- Escaping/sanitization.
- HTTP-only secure auth cookies as supported.
- Optional CAPTCHA/Turnstile adapter.
- Database backup notes.
- No permanent appointment deletion from UI.

## Accessibility

Implement WCAG 2.1 AA basics:

- Keyboard navigation.
- Focus states.
- Labels and errors.
- Semantic headings.
- Accessible accordion.
- Accessible calendar controls.
- Contrast.
- `dir` and `lang`.
- Reduced motion.
- Screen-reader status updates.
- No color-only status meaning.

## SEO

Implement technically correct SEO, but never claim rankings.

- Branded and local authority orientation.
- Unique localized titles and descriptions.
- Canonical.
- `hreflang`.
- Sitemap.
- Robots.
- JSON-LD.
- Contact/address consistency.
- Fast mobile pages.
- Server-rendered expertise content.
- Descriptive alt text.
- Search Console and analytics environment support.
- Direct expertise section anchors.
- No keyword stuffing.
- No fake reviews or locations.

## Legal/privacy UX

Add:

- No lawyer-client relationship disclaimer.
- No confidential or urgent submissions warning.
- Privacy consent.
- Anonymized representative matter format.
- Past results do not guarantee future outcomes.
- Review content can be disabled pending approval.
- No document uploads.
- No client portal.
- No AI legal advice.

The client’s lawyer must review and approve final legal texts before production.

## Tests

Write meaningful tests, not superficial snapshots.

Unit/integration:

- State transitions.
- Role authorization.
- RLS assumptions where testable.
- Timezone conversion.
- Weekend detection.
- Schedule conflicts.
- Duration and price.
- Token hashing/validation.
- Cancellation cutoff.
- Reminder windows.
- Daily agenda local date.
- Notification idempotency.
- Email locale.

Playwright:

1. French booking submission.
2. Arabic RTL booking submission.
3. Admin confirms and assigns.
4. Assigned lawyer sees it.
5. Other lawyer receives access denied/not found.
6. Lawyer changes price/duration.
7. Client cancellation works.
8. Lawyer cancellation works.
9. Reminder worker sends once.
10. Daily agenda contains only correct appointments.
11. Mobile calendar works.
12. Public signup is unavailable.

## Developer experience

Generate:

- Complete source code.
- SQL migrations.
- RLS policies.
- Seed data.
- `.env.example`.
- Staff creation script.
- Local notification runner.
- Email templates.
- Unit and E2E tests.
- Lint/typecheck/test/build scripts.
- Clear README.
- Deployment instructions.
- No committed secrets.
- No broken placeholder buttons.
- No TODOs for core functionality.

## Build order

Follow this order:

1. Initialize project and quality tooling.
2. Add design tokens, fonts, locale routing, and public shell.
3. Create typed content/config.
4. Build all public pages.
5. Build database migrations and RLS.
6. Implement auth and staff creation.
7. Implement booking request.
8. Implement admin/lawyer permission service.
9. Implement dashboard and calendar.
10. Implement confirmation/reschedule/cancellation.
11. Implement email templates and provider abstraction.
12. Implement secure client cancellation.
13. Implement scheduled reminders and daily agenda.
14. Add SEO.
15. Add tests.
16. Verify accessibility, mobile layout, and security.
17. Update README with exact commands.
18. Run lint, typecheck, tests, E2E tests, and production build.

## Definition of done

Do not declare completion until:

- The app runs locally from the README.
- Migrations create a working database.
- Three staff users can be created securely.
- Public booking works.
- Role separation is enforced.
- Internal calendar works.
- Confirmation and cancellation work.
- Emails render in French/Arabic as required.
- 24-hour and 2-hour reminders are idempotent.
- 07:00 daily agendas work in Africa/Tunis.
- Payment tracking works manually.
- No external calendar integration exists.
- Core tests pass.
- Production build passes.
- Missing client content is centralized and clearly marked.
- No sensitive secrets or fake production data are committed.

Start by reading `INSTRUCTIONS.md` and then implement the complete application. Do not stop after scaffolding or UI generation.
