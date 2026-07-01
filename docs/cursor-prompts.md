# Cursor Prompts — Roadmap Pulse

Reusable prompts for Cursor Agent tasks. Follow the pattern: **plan → implement one feature → verify → review**.

---

## Sprint 0 — Product definition

```text
Create a product requirements document for Roadmap Pulse, an engineering operating dashboard for Senior Engineering Managers. Include L0 leadership dashboard, L1 weekly tracker, track planning, skills matrix, risks, blockers, and weekly summary generation.
```

```text
Create a data model document for this product using Initiative, Track, WeeklyStatus, Engineer, Skill, EngineerSkill, TrackSkillRequirement, Risk, and Blocker.
```

---

## Sprint 1 — Foundation

```text
Set up a Next.js TypeScript app with Tailwind, shadcn/ui, Prisma, and PostgreSQL. Create the initial dashboard layout with sidebar navigation for L0 Dashboard, L1 Tracker, Tracks, Skills, Capacity, Risks, and Settings.
```

```text
Create a Prisma schema for Initiative, Track, WeeklyStatus, Engineer, Skill, EngineerSkill, TrackSkillRequirement, Risk, and Blocker. Add enums for Status and Confidence. Also create seed data for 3 initiatives, 8 tracks, and 10 engineers.
```

---

## Sprint 2 — Track planner

```text
Build the Track Planner page at /dashboard/tracks. It should show tracks, required skills, effort estimate, owners, status, target date, and recommended engineers based on skill fit and availability. Add a skill fit scoring function in lib/metrics/skill-fit.ts.
```

---

## Sprint 3 — L1 tracker

```text
Build the L1 Weekly Tracker page at /dashboard/l1. Create a table grouped by initiative and track. Include status, progress percentage, completed this week, planned next week, risks, blockers, decisions needed, leadership ask, and last updated. Add create/edit forms for weekly status updates with Zod validation.
```

---

## Sprint 4 — L0 dashboard

```text
Build the L0 Leadership Dashboard at /dashboard/l0. Add summary cards for total initiatives, tracks on track, amber/red tracks, average progress, open risks, open blockers, and leadership asks. Add charts for portfolio health, progress by initiative, and milestone confidence. Add tables for top risks and leadership asks.
```

---

## Sprint 5 — Summary generator

```text
Build a weekly summary generator at /dashboard/summary. It should read the latest WeeklyStatus records and generate two summaries: L1 operational summary and L0 leadership summary. Add a page where users can select a week and copy the generated summary as Markdown.
```

---

## Sprint 6 — Import and automation

```text
Add CSV import and export for engineers, tracks, skills, and weekly statuses. Add stale update detection for tracks not updated in the current week. Add blocker aging calculation and escalation indicators for blockers older than 7 days.
```

---

## Working style

### Plan first
```text
Before writing code, inspect the repo and propose an implementation plan for [FEATURE]. Do not modify files yet.
```

### One feature at a time
```text
Implement [FEATURE] according to docs/dashboard-spec.md. Keep components small. Use existing shadcn/ui components. Add types and validation.
```

### Verify
```text
Run lint and typecheck. Fix all TypeScript errors. Do not change unrelated files.
```

### Review
```text
Review the implementation for edge cases, data validation, loading states, and empty states. Suggest improvements before modifying files.
```
