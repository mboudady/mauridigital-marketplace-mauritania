# Souq — Marketplace Mauritania

Video-first social commerce marketplace for Mauritania. See the five
planning documents (business assessment, PRD, technical architecture,
database schema, roadmap) for full context.

## Status: Phase 1 — Foundation

- [x] Database schema deployed to Supabase (26 tables, RLS on every table)
- [x] `public.users` linked to Supabase Auth via trigger
- [x] Email-link auth (phone OTP deferred until an SMS provider is chosen)
- [x] Merchant store onboarding (auto-provisions role + default settings)
- [x] Minimal merchant dashboard
- [x] Minimal admin dashboard (merchant list + verify)
- [ ] Consumer video feed (Phase 2)
- [ ] Product upload with media (Phase 2)
- [ ] Checkout + Moosyl payment integration (Phase 2)
- [ ] Phone OTP via SMS provider (pending provider choice)

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Supabase (Postgres, Auth, RLS) — project `marketplace-mauritania`
- Deployed on Vercel

## Local development

```bash
npm install
npm run dev
```

The `.env` file contains the Supabase **publishable** URL and anon key —
these are safe to commit; all access control is enforced by Postgres Row
Level Security, not by keeping this key secret. Never add a `service_role`
key to this repo or any client-side code.

## Making yourself an admin

There's no self-serve way to become an admin (by design — `user_roles`
only allows self-assigning `merchant` or `creator`). After signing up once,
grant yourself admin from the Supabase SQL editor:

```sql
insert into user_roles (user_id, role)
values ('<your-auth-user-id>', 'admin')
on conflict do nothing;
```

## Database migrations

All schema changes live in the Supabase project's migration history
(`supabase migrations list` via the CLI, or the Database → Migrations tab
in the dashboard). The full schema design rationale is in
`marketplace-database-schema-v1.md`.

## Roadmap

See `marketplace-development-roadmap-v1.md` for the full 5-phase plan.
