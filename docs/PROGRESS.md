# Progress

## Project status

- `plan`: completed
- `foundation`: completed
- `database-auth`: not started
- `public-site`: not started
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
