# Roadmap Pulse

Senior EM productivity system — track planning, weekly L1 tracker, L0 leadership dashboard, and automation.

Built following the phased implementation plan in `docs/`.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

Demo data works out of the box (in-memory fallback). For PostgreSQL:

```bash
cp .env.example .env
docker compose up -d
npm run db:migrate
npm run db:seed
```

## Architecture

| Layer | Routes | Purpose |
|-------|--------|---------|
| L0 | `/dashboard/l0` | Leadership — progress, risks, confidence, asks |
| L1 | `/dashboard/l1` | Weekly tracker for EM / PM / Lead |
| Planning | `/dashboard/tracks`, `/skills`, `/capacity` | Skills, effort, ownership, fit scoring |
| Ops | `/dashboard/risks` | Risk and blocker register with aging |
| Automation | `/dashboard/summary` | L0 + L1 markdown generation |
| Health | `/dashboard/summary` | L1 + L0 markdown summaries |
| `/dashboard/alerts` | Automated operational alerts |
| `/dashboard/data` | CSV import and export |
| `/dashboard/health` | DORA + SPACE metrics |

## Docs & Cursor rules

| Path | Contents |
|------|----------|
| `docs/product-requirements.md` | PRD, users, MVP scope |
| `docs/data-model.md` | Entities, enums, skill-fit formula |
| `docs/dashboard-spec.md` | Page specs for L0, L1, planner |
| `docs/cursor-prompts.md` | Reusable Cursor Agent prompts |
| `.cursor/rules/` | Product context, code style, dashboard rules |

## Build order (from plan)

1. ✅ Docs, data model, Cursor rules
2. ✅ Prisma schema + seed (3 initiatives, 8 tracks, 10 engineers)
3. ✅ App shell + read-only dashboards
4. ✅ Create/edit forms (WeeklyStatus, Track) with Zod validation
5. ✅ CSV import/export
6. ✅ Operational alerts (stale updates, blocker aging, status)
7. 🔲 Jira/GitHub integrations
8. 🔲 Auth (Clerk/Auth.js)

## Tech stack

- Next.js 16 + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Recharts (L0 charts)
- Zod (validation — forms in Phase 2)

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/export?type=tracks` | Download CSV export |
| `POST /api/import` | Upload CSV (multipart: type, file) |
| `GET /api/summary` | L1 + L0 markdown summaries |
| `GET /api/automation/summary` | JSON weekly summary (legacy) |
| `GET /api/automation/alerts` | Alert generation |

## Cursor workflow

See `docs/cursor-prompts.md`. Pattern: plan → implement one feature → lint/typecheck → review.

**Node requirement:** Next.js 16 and Prisma 5 work best with Node ≥ 20.9. Upgrade with `nvm install 20` if needed.
