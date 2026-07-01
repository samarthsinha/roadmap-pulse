# Dashboard Specification

## Navigation

| Route | Name | Layer |
|-------|------|-------|
| `/dashboard/l0` | Leadership Dashboard | L0 |
| `/dashboard/l1` | Weekly Tracker | L1 |
| `/dashboard/tracks` | Track Planner | Planning |
| `/dashboard/skills` | Skills Matrix | Planning |
| `/dashboard/capacity` | Capacity | Planning |
| `/dashboard/risks` | Risks & Blockers | Ops |
| `/dashboard/summary` | Weekly Summary | Automation |
| `/dashboard/health` | Engineering Health | Health |

---

## L0 — `/dashboard/l0`

**Audience:** VP, Director, leadership staff  
**Update cadence:** Weekly roll-up from L1

### Sections

1. **Portfolio health cards** — total initiatives, tracks on track (Green), Amber/Red count, avg progress, open risks, open blockers, leadership asks
2. **Progress by initiative** — bar chart, 0–100%
3. **Status distribution** — pie: Green / Amber / Red / Blue / Grey
4. **Confidence distribution** — High / Medium / Low counts
5. **Top 5 risks** — severity-sorted table with owner
6. **Top 5 blockers** — aging-sorted with escalation flag
7. **Leadership asks** — actionable items with owner + due date
8. **Milestone slippage** — tracks past target with < 90% progress

### L0 answers

- What is progressing?
- What is at risk?
- What needs leadership attention?
- Are we predictable?

---

## L1 — `/dashboard/l1`

**Audience:** EM, PM, Tech Lead  
**Update cadence:** Weekly (Monday/Tuesday)

### Table columns

| Column | Source |
|--------|--------|
| Initiative | Track → Initiative |
| Track | Track.name |
| Owner | ownerEm |
| Status | WeeklyStatus.status |
| Progress % | WeeklyStatus or Track |
| Completed this week | WeeklyStatus.completedThisWeek |
| Planned next week | WeeklyStatus.plannedNextWeek |
| Risks | WeeklyStatus.risks |
| Blockers | WeeklyStatus.blockers |
| Ask | WeeklyStatus.leadershipAsk |
| Last updated | WeeklyStatus.updatedAt |

### Filters

- Week (default: current)
- Initiative
- Owner
- Status

### Forms (Phase 2)

Create/edit WeeklyStatus with Zod validation.

---

## Track Planner — `/dashboard/tracks`

### Track list columns

Name, Initiative, Status, Progress, EM, PM, Lead, Target date, Effort (est/actual)

### Track detail

- Ownership block
- Required skills table (skill, required rating, effort weight)
- Recommended engineers (skill-fit score ranked)
- Capacity impact

---

## Skills Matrix — `/dashboard/skills`

- Heatmap: engineers × skills (rating color)
- Skill gap analysis per active track
- Experts by skill (rating ≥ 4)

---

## Capacity — `/dashboard/capacity`

- Engineer allocation table (availability vs allocated %)
- Overloaded engineers (> 100%)
- Unallocated capacity
- Capacity grouped by skill category

---

## Risks — `/dashboard/risks`

- Open risks register
- Open blockers register
- Blocker aging (> 7 days = escalation indicator)
- Filter by severity, owner, track

---

## Summary — `/dashboard/summary`

### L1 summary template

```markdown
# Weekly L1 Status — {week}

## Overall
- Green: {n}
- Amber: {n}
- Red: {n}

## Completed this week
- ...

## Planned next week
- ...

## Risks and blockers
- ...

## Decisions needed
- ...

## Leadership asks
- ...
```

### L0 summary template

```markdown
# Leadership Update — {week}

## Overall status
...

## Progress
...

## Key wins
...

## Top risks
...

## Leadership asks
...

## Decisions needed
...
```

Actions: copy to clipboard, export markdown, save history (Phase 2).

---

## Status & confidence rules

| Status | Meaning |
|--------|---------|
| Green | On track |
| Amber | At risk — needs action |
| Red | Blocked or severely off track |
| Blue | Complete / shipped |
| Grey | Not started / planning |

Every Amber/Red row must display owner + next action in UI.
