# Decisions

## Approved architecture decisions

- Use a locale-prefixed route architecture with `fr` and `ar` for public content.
- Centralize public content in typed locale files under `src/content`.
- Use Supabase Auth and Row Level Security for staff authentication and appointment authorization.
- Implement the appointment lifecycle with explicit statuses and payment-tracking enums.
- Use a dedicated cancellation token route with hashed tokens and expiry.
- Build an email provider abstraction to support console logging in development and a transactional service in production.
- Keep the internal calendar fully within the website and do not integrate external calendar services.

## Decisions requiring approval

- Stable Latin Arabic route slugs for public pages are acceptable to maintain routing clarity.
- Resend behind an email-provider abstraction is approved as a default architecture, with the provider replaceable later.
- Clearly marked placeholder content is approved so the site remains functional without invented production details.
- Weekly availability plus `blocked_times` is approved as the availability architecture instead of requiring every slot to be manually created.
