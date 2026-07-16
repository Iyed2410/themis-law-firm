# INSTRUCTIONS.md — Themis Law Firm Website

## 1. Purpose

Build a production-ready bilingual website and private appointment-management application for:

**Themis Law Firm — Saadaoui & Haddad**

The product has two connected parts:

1. A premium public law-firm website in French and Arabic.
2. A secure internal calendar and appointment dashboard used by one administrator/lawyer and two lawyer accounts.

The calendar must exist only inside the Themis website. Do not synchronize with Google Calendar, Outlook, Apple Calendar, or any external calendar service.

The website's primary business objective is **brand authority, credibility, and Google visibility**, rather than aggressive lead generation. Never guarantee a first-place Google ranking.

---

## 2. Confirmed business requirements

### Brand

- Public name: **Themis Law Firm — Saadaoui & Haddad**
- The client may later provide an official Arabic business name.
- Use the supplied logo assets.
- The final logo should ideally be replaced with an SVG or transparent PNG when the client supplies one.
- Do not distort, redraw, or alter the logo proportions.

### Languages

- French: left-to-right.
- Arabic: right-to-left.
- Every public page must exist in both languages.
- The language switcher must preserve the equivalent current page whenever possible.
- Client emails must use the language selected during booking.
- The internal dashboard may use French as its primary interface.

### Office hours

- Monday to Friday: 08:00–17:00.
- Weekend appointments are exceptional and subject to manual approval.
- The booking interface must clearly label weekend requests as exceptional.
- All dates and scheduled jobs must use the `Africa/Tunis` time zone.

### Legal expertise

All expertise areas must appear on **one single Expertise page**, not separate pages.

The page must contain accessible, server-rendered expandable sections for:

1. Droit pénal — القانون الجزائي
2. Droit civil — القانون المدني
3. Droit immobilier et foncier — القانون العقاري
4. Droit commercial et des affaires — القانون التجاري وقانون الأعمال
5. Droit des sociétés — قانون الشركات
6. Droit maritime — القانون البحري
7. Droit de la famille — قانون الأسرة
8. Propriété intellectuelle — الملكية الفكرية
9. Droit du travail et de l’emploi — قانون الشغل والتوظيف

Each section must include:

- A short introduction.
- Typical matters handled.
- Who the service is intended for.
- How the firm assists.
- A “Request a consultation” call to action.
- A unique anchor ID so the section can be linked directly.

The full text must be present in the initial HTML for accessibility and SEO. Do not load expertise content only after a click.

---

## 3. Required public pages

Create the following routes in French and Arabic:

1. Home
2. About the firm
3. Expertise
4. Team
5. Representative matters
6. Client reviews
7. Book a consultation
8. Contact
9. Privacy policy
10. Legal notice and professional disclaimer

Suggested locale structure:

```text
/fr
/fr/cabinet
/fr/expertises
/fr/equipe
/fr/experience
/fr/avis
/fr/rendez-vous
/fr/contact
/fr/confidentialite
/fr/mentions-legales

/ar
/ar/about
/ar/expertise
/ar/team
/ar/experience
/ar/reviews
/ar/booking
/ar/contact
/ar/privacy
/ar/legal
```

Arabic slugs may be used, but keep routing reliable and easy to maintain. Add correct canonical and `hreflang` links between equivalent pages.

---

## 4. Public booking workflow

The public form creates an **appointment request**, not an instantly confirmed reservation.

Collect:

- Full name.
- Email.
- Phone number.
- Preferred language.
- Legal expertise.
- Preferred lawyer or “No preference.”
- Online or in-office consultation.
- Preferred date.
- Preferred time.
- Payment method preference:
  - Flouci
  - e-Dinar
  - Bank transfer
  - Payment at the office
- A short reason for the consultation, maximum 500 characters.
- Consent to privacy policy.
- Acknowledgement that submitting the form does not create a lawyer-client relationship.

Do not allow document uploads in the initial release.

Display a warning not to submit confidential, urgent, or highly sensitive information.

### Request behavior

- New requests receive `pending` status.
- Send a “request received” email to the client.
- Send a new-request email to the administrator.
- Weekend requests must be visibly marked.
- The requested date and time are not guaranteed until confirmed by the firm.

---

## 5. Users and permissions

There are exactly three initial staff accounts.

### Account A: Admin + lawyer

This account can:

- View every appointment.
- View every lawyer’s calendar.
- Approve, reject, assign, create, edit, reschedule, and cancel appointments.
- Manage their own lawyer calendar.
- Assign any appointment to any of the three lawyers.
- Set and edit consultation price.
- Set and edit consultation duration.
- Change payment method and payment status.
- Add or edit an online meeting link.
- Add private notes.
- Manage lawyer availability.
- Manage the two lawyer accounts.
- View audit history and appointment statistics.
- Configure cancellation cutoff and reminder settings.

### Accounts B and C: Lawyer

Each lawyer can:

- See only appointments assigned to them.
- View their own day, week, and month calendar.
- Open their assigned appointment details.
- Set or change price and duration for their own appointments.
- View and change payment method and payment status for their own appointments.
- Add or edit an online meeting link.
- Reschedule or cancel their own appointments.
- Mark their own appointments completed or no-show.
- Add private notes to their own appointments.

A lawyer cannot:

- See another lawyer’s appointments.
- Assign appointments to another lawyer.
- Manage user accounts.
- Change global website or notification settings.
- Delete audit history.

Enforce permissions on the server and at the database level. Hiding buttons in the UI is not sufficient.

---

## 6. Appointment lifecycle

Use explicit statuses:

```text
pending
confirmed
rescheduled
completed
cancelled_by_client
cancelled_by_lawyer
rejected
no_show
```

Use payment statuses:

```text
awaiting_payment
paid
bank_transfer_pending
payment_at_office
refunded
not_required
```

Use payment methods:

```text
flouci
edinar
bank_transfer
cash_at_office
undecided
```

### Confirmation

The administrator or assigned lawyer confirms:

- Assigned lawyer.
- Date.
- Start time.
- Duration.
- End time, calculated from duration.
- Price in TND.
- Consultation type.
- Office location or online meeting link.
- Payment method and status.

After confirmation:

- Email the client in their selected language.
- Email the assigned lawyer.
- Include a secure client cancellation button in the client email.

### Price and duration

Allowed duration presets:

- 30 minutes.
- 45 minutes.
- 60 minutes.
- 90 minutes.
- Custom duration.

Allow a custom price in TND, including zero for a free consultation.

Record price, duration, schedule, payment, status, and assignment changes in the audit log.

### Rescheduling

When an appointment is rescheduled:

- Keep the same appointment record.
- Record old and new values in audit history.
- Notify the client and assigned lawyer.
- Recalculate reminder delivery times.
- Do not send duplicate reminders.

### Lawyer cancellation

A lawyer can cancel only their own appointment. The admin can cancel any appointment.

On lawyer cancellation:

- Ask for confirmation.
- Allow an optional reason.
- Set status to `cancelled_by_lawyer`.
- Notify the client immediately.
- Notify the administrator when a non-admin lawyer performs the cancellation.
- Preserve the record and audit trail.
- Never permanently delete the appointment.

---

## 7. Client cancellation link

Every confirmed and reminder email sent to a client must include a button:

- French: **Annuler mon rendez-vous**
- Arabic: **إلغاء الموعد**

The button must use a random, unguessable token. Store only a cryptographic hash of the token in the database.

Cancellation flow:

1. Client opens the secure link.
2. A confirmation page shows only limited appointment information.
3. Client confirms cancellation.
4. Appointment changes to `cancelled_by_client`.
5. Client receives cancellation confirmation.
6. Assigned lawyer and administrator receive cancellation notification.
7. The event remains in history.
8. The token becomes unusable after cancellation or after the appointment start time.

Use a configurable online-cancellation cutoff. Default to 24 hours before the appointment, but store it in settings so the administrator can change it without code changes.

When the cutoff has passed, instruct the client to contact the firm directly.

Rate-limit cancellation endpoints and never expose sequential database IDs.

---

## 8. Internal calendar

Provide a private responsive calendar inside the dashboard.

Required views:

- Day.
- Week.
- Month.
- Upcoming list.
- Pending requests.
- Cancelled appointments.
- Weekend requests.

Calendar functionality:

- Appointment status labels.
- Consultation type indicator.
- Payment status indicator.
- Legal expertise.
- Client name.
- Assigned lawyer.
- Filters appropriate to the user’s role.
- Clicking an appointment opens a detail panel or page.
- Admin can drag/reschedule only if this is implemented safely and always triggers server validation, audit logging, and email notifications.
- Lawyers can reschedule only their own appointments.
- Do not implement external calendar synchronization.

The calendar must be usable on desktop, tablet, and mobile.

---

## 9. Email notifications

Use a transactional email provider. Resend is recommended, but isolate the provider behind a small email service so it can be replaced.

### Client emails

Send in the booking language:

- Request received.
- Appointment confirmed.
- Appointment rescheduled.
- Appointment cancelled by lawyer.
- Appointment cancellation confirmed.
- 24-hour reminder.
- 2-hour reminder.
- Payment instructions when entered by staff.

### Admin emails

Send:

- New appointment request.
- Exceptional weekend request.
- Client cancellation.
- Cancellation by a non-admin lawyer.
- Important email delivery failure when available.

### Lawyer emails

Send:

- Appointment assigned/confirmed.
- Appointment rescheduled.
- Appointment cancelled.
- 24-hour reminder.
- 2-hour reminder.
- Daily agenda at 07:00 Tunisia time.

### Daily 07:00 agenda

Every day at 07:00 `Africa/Tunis`, send each of the three lawyers an email containing only their appointments for that day.

Include:

- Time.
- Client name.
- Expertise.
- Online/in-office type.
- Payment status.
- Meeting link when online.
- A link to the appointment inside the dashboard.

Send an email even when the lawyer has no appointments, stating that no appointments are scheduled.

### Reliability

- Run reminder checks at least every 10–15 minutes.
- Use idempotency records so the same email is never sent twice.
- Store email type, appointment, recipient, scheduled time, sent time, provider ID, and status.
- If an appointment is rescheduled, previously scheduled reminder state must not cause an incorrect reminder.
- Build a development email mode that logs emails or sends them to a local test inbox.

---

## 10. Payment scope

The initial release does **not** require automatic Flouci or e-Dinar gateway integration unless merchant credentials and API documentation are later supplied.

The application must:

- Let the client select a preferred payment method.
- Let admin and the assigned lawyer set/change method.
- Let admin and the assigned lawyer set/change payment status.
- Store consultation amount in TND.
- Store an optional payment reference.
- Display payment information in relevant confirmation emails.
- Never collect card numbers or wallet credentials.

Keep payment gateway code behind a future integration interface. Do not fake successful online payments.

---

## 11. Content and confidentiality

### Representative matters

- Use anonymized summaries.
- Do not publish client names, case numbers, documents, confidential amounts, or identifying facts without written approval.
- Avoid promises of outcomes.
- Include a disclaimer that past matters do not guarantee similar results.

### Reviews

- Publish only genuine, approved reviews.
- Do not invent reviews.
- Avoid revealing confidential legal details.
- Make review publication easy to disable until the firm approves the content.

### Forms

- Collect only data necessary to arrange a consultation.
- Do not collect full case files.
- Do not claim that the form creates a lawyer-client relationship.
- Add a clear privacy consent checkbox.

---

## 12. Design system

The visual style must be:

- Classy.
- Elegant.
- Premium.
- Trustworthy.
- Modern with restrained Roman/classical influence.

### Palette

Use the following as starting tokens:

```text
Black:        #050607
Deep navy:    #0A1628
Gold:         #C6A15B
Silver:       #B8BCC3
Ivory:        #F4F1E8
Muted text:   #9DA3AE
```

Maintain accessible contrast.

### Typography

Recommended direction:

- Latin display headings: an elegant classical serif such as Cinzel or Cormorant Garamond.
- Latin body: a highly readable sans-serif such as Inter or Manrope.
- Arabic headings/body: a professional Arabic family such as Noto Kufi Arabic or Noto Sans Arabic.

Do not force a Latin Roman display font onto Arabic text.

### Roman influence

Use sparingly:

- Thin classical arches.
- Subtle column lines.
- Restrained marble texture.
- Geometric frames.
- Gold rules and borders.
- Architectural spacing.

Avoid:

- Excessive pillars.
- Repeated gavels or scales.
- Heavy gradients.
- Loud gold everywhere.
- Casino or movie-poster styling.
- Generic courtroom stock images on every section.

### Motion

Use subtle fades, reveals, and hover states. Respect `prefers-reduced-motion`.

---

## 13. SEO and discoverability

The client wants strong presence in Google search. Implement:

- Unique bilingual metadata.
- Canonical URLs.
- `hreflang` between French and Arabic equivalents.
- XML sitemap.
- Robots file.
- Open Graph and social metadata.
- Fast mobile performance.
- Semantic headings.
- Accessible server-rendered expertise content.
- Descriptive image alt text.
- Local firm name, address, phone, and hours consistently.
- JSON-LD using an appropriate legal/local business schema.
- Google Search Console verification support.
- Analytics integration through environment configuration.
- Contact/location information in the footer.
- Direct section anchors on the Expertise page.

Do not:

- Promise a number-one ranking.
- Keyword-stuff headings.
- Generate thin pages.
- hide content solely for search engines.
- create fake locations or reviews.

The codebase should support ongoing content and SEO work after launch.

---

## 14. Security requirements

- Use a proper hosted PostgreSQL database.
- Do not use browser `localStorage` as the appointment database.
- Use secure authentication.
- Hash passwords through the authentication provider.
- Implement role-based authorization server-side.
- Enable database row-level security.
- Keep service-role keys server-only.
- Validate every input with a schema.
- Escape or sanitize user-generated text.
- Add rate limiting to booking, login, and cancellation endpoints.
- Use secure, HTTP-only cookies where applicable.
- Add CSRF protection where required by the chosen auth flow.
- Generate cryptographically secure cancellation tokens.
- Log meaningful appointment changes.
- Avoid logging sensitive form contents.
- Add secure headers.
- Do not expose stack traces in production.
- Restrict account creation; public signup must be disabled.
- Add optional MFA support for staff.
- Back up the database and document restoration.
- Keep all secrets in environment variables.

---

## 15. Accessibility and quality

Target WCAG 2.1 AA basics:

- Keyboard-operable navigation and accordions.
- Visible focus states.
- Proper labels and validation errors.
- Logical heading order.
- Sufficient color contrast.
- Screen-reader-friendly status messages.
- Correct `dir` and `lang` attributes.
- Accessible calendar controls.
- Reduced-motion support.
- No information communicated by color alone.

Performance goals:

- Optimize logos and images.
- Use responsive image sizes.
- Avoid large client-side bundles.
- Lazy-load noncritical media.
- Prefer server rendering for public content.
- Keep the booking form responsive on slow mobile connections.

---

## 16. Recommended implementation stack

Use:

- Next.js App Router.
- TypeScript in strict mode.
- Tailwind CSS.
- Accessible component primitives.
- `next-intl` or an equivalent robust locale solution.
- Supabase PostgreSQL and Supabase Auth.
- Supabase Row Level Security.
- FullCalendar or an equivalent internal calendar component.
- React Hook Form and Zod.
- Resend or an equivalent transactional email provider.
- Supabase scheduled jobs/Edge Functions or another reliable server-side scheduler.
- Vitest for unit/integration tests.
- Playwright for end-to-end tests.

Use the latest stable compatible releases when implementation begins. Keep vendor-specific logic behind service modules.

---

## 17. Minimum database entities

At minimum implement:

- `profiles`
- `lawyer_profiles`
- `appointments`
- `appointment_audit_logs`
- `notification_deliveries`
- `lawyer_availability`
- `blocked_times`
- `business_settings`

Recommended key appointment fields:

```text
id
public_reference
client_name
client_email
client_phone
client_language
expertise_key
preferred_lawyer_id
assigned_lawyer_id
consultation_type
requested_start_at
confirmed_start_at
duration_minutes
price_tnd
status
payment_method
payment_status
payment_reference
meeting_link
client_message
internal_admin_notes
lawyer_notes
is_weekend_request
cancellation_token_hash
cancellation_token_expires_at
created_at
updated_at
```

Use UUIDs and timestamps stored in UTC. Convert to `Africa/Tunis` for display and scheduling.

---

## 18. Required acceptance criteria

The project is not complete until all of the following work:

1. French and Arabic public routes render correctly.
2. Arabic layout is genuinely RTL, not only text-aligned right.
3. All expertise areas exist on one indexable page.
4. A visitor can submit a booking request.
5. Client and admin receive request emails.
6. Admin can log in and view all requests.
7. Admin can assign and confirm an appointment.
8. Assigned lawyer sees the appointment; the other lawyer does not.
9. Lawyer can set price and duration for their own appointment.
10. Lawyer can reschedule and cancel their own appointment.
11. Client receives confirmation with secure cancellation button.
12. Client can cancel through the secure link.
13. Admin and assigned lawyer receive client-cancellation emails.
14. 24-hour and 2-hour reminders are sent once only.
15. Every lawyer receives a 07:00 daily agenda.
16. Calendar day/week/month views work on mobile and desktop.
17. Payment status and method can be tracked manually.
18. Appointment changes appear in audit history.
19. Public signup is disabled.
20. Authorization is enforced server-side and by RLS.
21. Sitemap, canonical, metadata, `hreflang`, and JSON-LD are present.
22. Forms have validation, spam/rate protection, and accessible errors.
23. No external calendar synchronization exists.
24. No sensitive document-upload feature exists.
25. Tests cover core role permissions, booking, confirmation, cancellation, and notification idempotency.

---

## 19. Out of scope for the initial release

Do not include unless separately approved:

- Google/Outlook/Apple calendar synchronization.
- Full legal case-management system.
- Document or evidence uploads.
- Client accounts or client portal.
- Automatic Flouci/e-Dinar gateway processing.
- WhatsApp or SMS automation.
- Electronic signatures.
- Invoicing/accounting.
- AI legal advice or chatbot.
- Multiple offices.
- More than the three initial staff accounts.
- Unlimited content-management features.
- Guaranteed SEO rankings.
