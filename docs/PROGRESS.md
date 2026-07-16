# Progress

## Project status

- `plan`: completed
- `foundation`: completed
- `database-auth`: not started
- `public-site`: completed
- `booking`: not started
- `dashboard-calendar`: not started
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
