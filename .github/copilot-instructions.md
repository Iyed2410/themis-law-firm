# Themis Law Firm — Copilot Instructions

## Sources of truth

Before planning or implementing work, consult:

- [Product specification](../docs/PRODUCT_SPEC.md)
- [Master build requirements](../docs/MASTER_BUILD_PROMPT.md)
- [Project setup](../README.md)

When they exist, also consult:

- `docs/IMPLEMENTATION_PLAN.md`
- `docs/PROGRESS.md`
- `docs/DECISIONS.md`

`docs/PRODUCT_SPEC.md` is the authoritative business and functional specification.

When another project document conflicts with `PRODUCT_SPEC.md`, follow `PRODUCT_SPEC.md` and report the conflict.

## Working method

- Inspect the existing repository before editing files.
- Work in small, reviewable phases.
- Implement only the requested phase.
- Do not rebuild or replace working code unnecessarily.
- Explain important architectural choices.
- Do not leave fake buttons or disconnected interfaces for required features.
- Do not claim that a phase is complete until its verification commands pass.
- Update `docs/PROGRESS.md` after completing a phase.
- Record meaningful architectural decisions in `docs/DECISIONS.md`.
- Ask for clarification when a missing business decision prevents a correct implementation.
- Do not ask for clarification when a safe placeholder or typed configuration value can be used.

## Technology requirements

Use:

- Next.js App Router.
- TypeScript in strict mode.
- Tailwind CSS.
- Supabase PostgreSQL.
- Supabase Auth.
- Supabase Row Level Security.
- Zod for all external input validation.
- React Hook Form for complex forms.
- FullCalendar or an equivalent internal calendar component.
- A transactional email service abstraction.
- Vitest for unit and integration tests.
- Playwright for end-to-end tests.

Use current stable, mutually compatible package releases.

Do not change the package manager. This project uses pnpm.

## Core product rules

The application contains:

1. A bilingual French and Arabic public law-firm website.
2. A private internal appointment dashboard.
3. One administrator account that is also a lawyer.
4. Two restricted lawyer accounts.

The calendar exists only inside the website.

Never add:

- Google Calendar synchronization.
- Outlook synchronization.
- Apple Calendar synchronization.
- A client portal.
- Legal-document uploads.
- A case-management system.
- AI-generated legal advice.
- Automatic payment processing without real merchant credentials.

## Languages

- French uses left-to-right layout.
- Arabic uses genuine right-to-left layout.
- Set correct `lang` and `dir` attributes.
- Arabic RTL must affect navigation, spacing, forms, icons, cards, and layout, not only text alignment.
- Keep French and Arabic page structures equivalent.
- Client emails use the language selected in the booking form.
- The staff dashboard may use French as its primary language.

## Business time

- Use `Africa/Tunis` for business rules and displayed times.
- Store database timestamps in UTC.
- Normal office hours are Monday through Friday, 08:00–17:00.
- Weekend appointments are exceptional requests requiring manual approval.

## Expertise page

All legal fields must exist on one Expertise page.

Do not create one page per expertise.

The page must contain accessible, server-rendered expandable sections for:

- Criminal law.
- Civil law.
- Real-estate and property law.
- Commercial and business law.
- Corporate law.
- Maritime law.
- Family law.
- Intellectual property.
- Labour and employment law.

The complete expertise text must exist in the HTML and must not be fetched only after clicking an item.

## Appointment permissions

### Administrator and lawyer

The administrator can:

- See all appointments.
- See all lawyers' calendars.
- Approve and reject booking requests.
- Assign appointments.
- Create and edit appointments.
- Reschedule or cancel any appointment.
- Set price and duration.
- Update payment information.
- Add online meeting links.
- Manage availability.
- Manage lawyer accounts.
- View audit history.

### Lawyer

A lawyer can:

- See only appointments assigned to them.
- See only their personal calendar.
- Edit price and duration for their appointments.
- Update payment method and payment status for their appointments.
- Add meeting links and private notes.
- Reschedule or cancel their appointments.
- Mark their appointments completed or no-show.

A lawyer cannot:

- See another lawyer's appointments.
- Manage users.
- Assign appointments to another lawyer.
- Change global application settings.

Enforce permissions in:

- Server actions or route handlers.
- Database Row Level Security policies.

Never rely only on hidden frontend buttons.

## Appointment lifecycle

Use explicit statuses:

- `pending`
- `confirmed`
- `rescheduled`
- `completed`
- `cancelled_by_client`
- `cancelled_by_lawyer`
- `rejected`
- `no_show`

Never permanently delete appointments through the normal application.

Record important changes in an audit log.

## Client cancellation

- Confirmation and reminder emails include a secure cancellation link.
- Generate a cryptographically secure random token.
- Store only a hash of the token.
- Never expose sequential database IDs.
- Invalidate the token after use or after the appointment.
- Apply a configurable cancellation cutoff.
- Default the cutoff to 24 hours.
- Notify the client, assigned lawyer, and administrator after cancellation.

## Emails and scheduled jobs

Implement:

- Request-received email.
- Appointment-confirmation email.
- Rescheduling email.
- Cancellation email.
- Reminder 24 hours before.
- Reminder 2 hours before.
- Daily agenda email at 07:00 Africa/Tunis for each lawyer.

The daily agenda must contain only that lawyer's appointments.

Use idempotency records so scheduled emails are never sent twice.

Provide a development mode that logs emails or sends them to a local test inbox.

## Payments

Initial payment support is manual tracking only.

Support:

- Flouci.
- e-Dinar.
- Bank transfer.
- Payment at the office.

Staff can set:

- Consultation amount in TND.
- Payment method.
- Payment status.
- Optional payment reference.

Never:

- Collect card numbers.
- Collect wallet passwords.
- Fake successful payment transactions.
- Claim a payment gateway is integrated when credentials are unavailable.

## Security

- Never expose service-role keys to the browser.
- Never commit secrets.
- Keep secrets in `.env.local`.
- Keep empty documented placeholders in `.env.example`.
- Disable public staff registration.
- Validate every public and dashboard mutation.
- Rate-limit login, booking, and cancellation endpoints.
- Use secure authentication cookies.
- Sanitize or escape user-provided text.
- Do not log cancellation tokens or secrets.
- Do not place appointment data in browser `localStorage`.
- Add safe production error handling.
- Use secure headers.
- Preserve appointment history.
- Add database backup and restoration documentation.

## Content

Do not invent production:

- Addresses.
- Phone numbers.
- Lawyer biographies.
- Qualifications.
- Reviews.
- Representative cases.
- Consultation prices.
- Legal claims.

Mark missing client content clearly in the centralized content configuration.

Representative cases must be anonymized.

Do not guarantee:

- Legal outcomes.
- Search-engine rankings.
- A first position on Google.

The firm's lawyers must approve final privacy, disclaimer, case, and review text.

## Design

The visual identity is:

- Premium.
- Elegant.
- Serious.
- Trustworthy.
- Modern with restrained Roman influence.

Use:

- Black.
- Deep navy.
- Gold accents.
- Silver.
- Ivory.
- Fine architectural lines.
- Subtle arches.
- Spacious layouts.

Avoid:

- Excessive pillars.
- Repeated gavels or scales.
- Loud gradients.
- Excessive gold.
- Casino styling.
- Generic law-firm template appearance.

Preserve the proportions of the supplied Themis logo.

## Accessibility

Target WCAG 2.1 AA fundamentals:

- Keyboard-accessible controls.
- Visible focus states.
- Proper form labels.
- Accessible validation errors.
- Logical heading structure.
- Sufficient contrast.
- Reduced-motion support.
- Screen-reader-friendly status updates.
- No information represented by color alone.
- Accessible accordion and calendar controls.

## SEO

Implement:

- Localized metadata.
- Canonical URLs.
- French and Arabic `hreflang`.
- XML sitemap.
- Robots file.
- Open Graph metadata.
- Appropriate legal/local-business JSON-LD.
- Server-rendered public content.
- Direct expertise-section anchors.
- Fast responsive pages.
- Consistent name, address, phone, and office hours.

Do not use:

- Keyword stuffing.
- Hidden content.
- Fake reviews.
- Fake locations.
- Thin automatically generated pages.

## Code quality

- Use strict TypeScript types.
- Avoid `any` unless there is a documented unavoidable reason.
- Keep server and client responsibilities explicit.
- Keep authorization and business rules in reusable server modules.
- Keep provider-specific email and payment code behind interfaces.
- Centralize business content and configuration.
- Add comments only when they explain non-obvious decisions.
- Remove dead code and unused imports.
- Do not suppress lint or TypeScript errors without justification.

## Required verification

After each relevant phase, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run Playwright when a phase affects complete user workflows.

If a script does not yet exist, add it during the appropriate phase.

Fix errors caused by the implementation before reporting completion.

When a command cannot be run, report:

- The exact command.
- The reason it could not run.
- What remains unverified.
