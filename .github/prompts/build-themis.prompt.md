---
name: build-themis
description: Plan or implement one verified phase of the Themis Law Firm project
agent: agent
argument-hint: "phase=plan|foundation|database-auth|public-site|booking|dashboard-calendar|email-jobs|seo-security-tests|final-audit"
---

Read these sources before acting:

- [Copilot instructions](../copilot-instructions.md)
- [Product specification](../../docs/PRODUCT_SPEC.md)
- [Master build requirements](../../docs/MASTER_BUILD_PROMPT.md)
- [Project README](../../README.md)

Also inspect these files when they exist:

- `docs/IMPLEMENTATION_PLAN.md`
- `docs/PROGRESS.md`
- `docs/DECISIONS.md`

Requested phase:

`${input:phase:plan}`

## Universal rules

- Inspect the current workspace before editing.
- Follow `.github/copilot-instructions.md`.
- Treat `docs/PRODUCT_SPEC.md` as the authoritative product specification.
- Do not assume a feature works merely because related files exist.
- Do not implement unrelated phases.
- Do not invent production client information.
- Do not add external calendar synchronization.
- Do not expose secrets.
- Use pnpm.
- Make all changes directly in the workspace.
- Keep existing working behavior unless the requested phase requires a change.

## Phase: plan

When the requested phase is `plan`:

Do not install packages or write application code.

Inspect:

- `package.json`
- Existing Next.js files.
- TypeScript configuration.
- Tailwind configuration.
- Current folder structure.
- Existing documentation.

Create:

- `docs/IMPLEMENTATION_PLAN.md`
- `docs/PROGRESS.md`
- `docs/DECISIONS.md`

The implementation plan must include:

1. Current workspace assessment.
2. Proposed folder architecture.
3. Public routes and locale routing.
4. French and Arabic content architecture.
5. Database schema and relationships.
6. Supabase authentication architecture.
7. Admin and lawyer authorization.
8. Row Level Security policy design.
9. Appointment lifecycle and valid transitions.
10. Internal calendar architecture.
11. Availability and conflict handling.
12. Secure client-cancellation-token flow.
13. Email template architecture.
14. Reminder scheduling and idempotency.
15. Daily 07:00 Africa/Tunis agenda architecture.
16. Payment-tracking architecture.
17. SEO architecture.
18. Accessibility approach.
19. Security threats and mitigations.
20. Testing strategy.
21. Required environment variables.
22. Ordered implementation phases.
23. Acceptance criteria for each phase.
24. External accounts or credentials eventually required.

Stop after producing the planning documents.

Do not begin the foundation phase.

Summarize:

- The proposed architecture.
- Important risks.
- Decisions requiring developer approval.
- The recommended next phase.

## Phase: foundation

When the requested phase is `foundation`, implement only:

- Project scripts for lint, typecheck, test, and build.
- Global design tokens.
- Fonts and typography.
- Locale routing.
- French and Arabic root layouts.
- Correct `lang` and `dir`.
- Header.
- Footer.
- Language switcher.
- Logo component.
- Responsive navigation.
- Central typed firm configuration.
- Central French and Arabic content structure.
- Public route placeholders with meaningful accessible structure.
- Environment-variable validation.
- Base test configuration.

Do not implement:

- Supabase database.
- Authentication.
- Booking persistence.
- Calendar.
- Emails.

## Phase: database-auth

When the requested phase is `database-auth`, implement only:

- Supabase client and server configuration.
- SQL migrations.
- Required database enums and tables.
- Indexes.
- Row Level Security policies.
- Staff authentication.
- Disabled public signup.
- One `admin_lawyer` role.
- Two `lawyer` roles.
- Protected dashboard layout.
- Secure staff-user creation or invitation script.
- Server authorization helpers.
- Database and permission tests.
- `.env.example` additions.

Do not build the complete calendar or public booking workflow yet.

## Phase: public-site

When the requested phase is `public-site`, implement:

- Home.
- About.
- One interactive Expertise page.
- Team.
- Representative matters.
- Reviews.
- Contact.
- Booking page layout.
- Privacy policy placeholder.
- Legal notice and disclaimer placeholder.
- French content.
- Arabic RTL content.
- Responsive desktop, tablet, and mobile layouts.
- Accessible accordions.
- Contact and office-hours components.

Use centralized placeholder content where client content is still missing.

Do not invent production information.

## Phase: booking

When the requested phase is `booking`, implement:

- Complete public booking form.
- Client and server validation.
- Privacy and legal acknowledgement.
- Weekend-request detection.
- Anti-spam protection.
- Rate limiting.
- Appointment request persistence.
- Initial `pending` status.
- Public success page.
- Audit entry.
- Request-received email to the client.
- New-request email to the administrator.
- French and Arabic client email selection.
- Meaningful booking tests.

Do not implement automatic payment processing.

## Phase: dashboard-calendar

When the requested phase is `dashboard-calendar`, implement:

- Dashboard overview.
- Day calendar.
- Week calendar.
- Month calendar.
- Upcoming appointment list.
- Pending requests.
- Cancelled appointments.
- Weekend requests.
- Admin visibility of all appointments.
- Lawyer visibility of assigned appointments only.
- Appointment details.
- Assignment.
- Approval.
- Rejection.
- Confirmation.
- Price.
- Duration.
- Payment tracking.
- Online meeting link.
- Rescheduling.
- Lawyer cancellation.
- Completion and no-show status.
- Audit history.
- Availability and blocked times.
- Conflict detection.
- Responsive mobile dashboard.
- Authorization tests.

Do not add any external calendar integration.

## Phase: email-jobs

When the requested phase is `email-jobs`, implement:

- Email-provider abstraction.
- Development console email provider.
- Production transactional email provider.
- Bilingual client email templates.
- Staff email templates.
- Confirmation emails.
- Rescheduling emails.
- Lawyer-cancellation emails.
- Secure client-cancellation token.
- Public cancellation confirmation page.
- Client-cancellation notifications.
- 24-hour reminders.
- 2-hour reminders.
- Daily lawyer agenda at 07:00 Africa/Tunis.
- Empty daily-agenda email.
- Notification-delivery records.
- Idempotency constraints.
- Retry-safe scheduled job.
- Local scheduled-job runner.
- Email and scheduling tests.

Never send duplicate reminders.

## Phase: seo-security-tests

When the requested phase is `seo-security-tests`, implement and verify:

- Localized page metadata.
- Canonical URLs.
- French and Arabic `hreflang`.
- Sitemap.
- Robots file.
- Open Graph metadata.
- Legal/local-business JSON-LD.
- Search Console verification configuration.
- Analytics configuration.
- Secure headers.
- Input validation review.
- Rate-limit review.
- RLS review.
- Authorization review.
- Sensitive logging review.
- Accessibility audit.
- Responsive audit.
- Performance improvements.
- Unit tests.
- Integration tests.
- Playwright end-to-end workflows.

Do not promise Google ranking positions.

## Phase: final-audit

When the requested phase is `final-audit`:

1. Read every acceptance criterion in `docs/PRODUCT_SPEC.md`.
2. Inspect the complete implementation.
3. Produce a requirement-by-requirement checklist.
4. Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

5. Fix defects that are within the approved scope.
6. Verify authorization for all three roles.
7. Verify French and Arabic mobile layouts.
8. Verify appointment cancellation.
9. Verify reminder idempotency.
10. Verify daily agendas use Africa/Tunis.
11. Verify no external calendar integration exists.
12. Verify no production secrets are committed.
13. Update `README.md`.
14. Update `docs/PROGRESS.md`.
15. Update `docs/DECISIONS.md`.

Report clearly:

- Completed requirements.
- Unfinished requirements.
- Tests executed and results.
- Missing credentials or client content.
- Deployment blockers.
- Recommended launch checklist.

## Completion procedure for implementation phases

For every phase other than `plan`:

1. Read the approved implementation plan.
2. Inspect files related to the requested phase.
3. State the work you are about to perform.
4. Implement only the requested phase.
5. Add or update tests.
6. Run the relevant verification commands.
7. Fix failures introduced by the work.
8. Update `docs/PROGRESS.md`.
9. Update `docs/DECISIONS.md` when an architectural decision was made.
10. Summarize:
    - Files created or changed.
    - Features completed.
    - Tests executed.
    - Known limitations.
    - Required manual configuration.
    - Recommended next phase.

Never state that a phase is complete when its core verification has failed.
