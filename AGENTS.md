# Earthwork Takeoff Agent Notes

This file is a working orientation guide for agents reviewing or modifying this repository.

## Snapshot

- Stack: Next.js App Router (v14), React 18, TypeScript strict mode, Prisma + PostgreSQL, NextAuth credentials auth.
- UI: Tailwind + shadcn/ui components.
- Domain: Earthwork estimating with project lifecycle, bid line items, markup, alternates, reports, and pricing library/presets.

## Useful Commands

- `npm run dev` - local app.
- `npm run lint` - ESLint checks.
- `npm run build` - Prisma client generation + production build/type check.
- `npm run db:push` - apply Prisma schema.
- `npm run db:seed` - seed users/sample project.
- `npx tsx prisma/seed-pricing.ts` - seed pricing/unit-price libraries.

## Important Paths

- App pages: `src/app/**`
- API routes: `src/app/api/**`
- Shared logic: `src/lib/**`
- Prisma schema/migrations: `prisma/schema.prisma`, `prisma/migrations/**`
- Seeds: `prisma/seed.ts`, `prisma/seed-pricing.ts`
- Docs/source data: `docs/**` (large local source files, mostly not app runtime inputs)

## Architecture Notes

- Authentication
  - Config: `src/lib/auth.config.ts`
  - Provider/session setup: `src/lib/auth.ts`
  - Middleware guard: `src/middleware.ts`
  - All routes except `/login`, `/api/auth/*`, and static assets are middleware-protected.

- Main project object graph
  - `Project` has `JobInfo`, `BidSection[]`, `CostWriteUpItem[]`, `MarkupConfig`, `CalculatorSnapshot[]`, `AlternateSection[]`, `Report[]`.
  - Bid totals are generally calculated in UI by summing `lineItems[].totalCost`.

- API style
  - Most route handlers call `auth()` and then operate directly via Prisma.
  - Validation/sanitization is minimal in many handlers.

## Feature Route Map

- Project CRUD: `src/app/api/projects/route.ts`, `src/app/api/projects/[id]/route.ts`
- Job info: `src/app/api/projects/[id]/job-info/route.ts`
- Bid sections/items: `src/app/api/bid/sections/**`, `src/app/api/bid/line-items/**`
- Markup: `src/app/api/projects/[id]/markup/route.ts`
- Cost write-up: `src/app/api/projects/[id]/cost-writeup/route.ts`
- Alternates: `src/app/api/projects/[id]/alternates/route.ts`
- Reports: `src/app/api/reports/generate/route.ts`
- Pricing library/presets: `src/app/api/pricing/**`
- Templates: `src/app/api/templates/route.ts`

## Current Gaps To Know Before Editing

1. Report generation is metadata-only.
   - `POST /api/reports/generate` creates a DB record but does not render/upload report files yet.
   - Files: `src/app/api/reports/generate/route.ts`, `src/app/projects/[id]/reports/page.tsx`

2. Seed script uses fixed default credentials.
   - For non-local usage, replace with environment-driven credentials.
   - File: `prisma/seed.ts`

3. Resource-level auth is owner/admin scoped, but global libraries are still shared.
   - Project and project-subresource routes now enforce owner/admin checks.
   - Pricing/template libraries are still accessible to any authenticated user by design today.
   - Files: `src/lib/project-access.ts`, `src/app/api/pricing/**`, `src/app/api/templates/route.ts`

## Conventions/Patterns Used

- Most client editors save on blur and show `AutoSaveIndicator`.
- Calculated fields (`totalCost`, `days`) are recomputed client-side and API-side for line items.
- Many table inputs use `defaultValue` uncontrolled fields with blur-triggered saves.
- JSON blobs are used for calculator snapshots and template defaults.
- Calculators now include: haul truck, compaction, import/export balance, and production/crew costing.
- Markup formulas now include `insuranceRate` in total and breakdown calculations.

## If You Touch Core Flows, Verify

- `npm run lint`
- `npm run build`
- Manual path checks:
  - Project creation + delete
  - Add/edit/delete bid section + line items
  - Cost write-up edits persist after refresh
  - Alternates edits persist after refresh
  - Markup totals match expected formula (including insurance, if implemented)
