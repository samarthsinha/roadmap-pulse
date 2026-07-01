# Data Model

## Entity relationship overview

```text
Initiative 1──* Track 1──* WeeklyStatus
                  ├──* TrackSkillRequirement *──1 Skill
                  ├──* Risk
                  └──* Blocker

Engineer 1──* EngineerSkill *──1 Skill
```

## Entities

### Initiative
Leadership-level business or product initiative.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| name | String | |
| businessGoal | String | |
| owner | String | Leadership owner |
| status | Status | Green / Amber / Red / Blue / Grey |
| progressPercentage | Int | 0–100 |
| confidence | Confidence | High / Medium / Low |
| targetDate | DateTime | |
| leadershipAsk | String? | Open ask text |

### Track
Workstream under an initiative.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| initiativeId | FK | |
| name | String | |
| description | String? | |
| ownerEm | String | EM name |
| ownerPm | String | PM name |
| techLead | String | Lead name |
| status | Status | |
| progressPercentage | Int | 0–100 |
| confidence | Confidence | |
| startDate | DateTime? | |
| targetDate | DateTime | |
| effortEstimateDays | Int | |
| actualEffortDays | Int? | |

### WeeklyStatus
L1 weekly update per track.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| trackId | FK | |
| weekStartDate | DateTime | Monday of week |
| status | Status | |
| progressUpdate | String? | Narrative |
| completedThisWeek | String[] | |
| plannedNextWeek | String[] | |
| risks | String[] | |
| blockers | String[] | |
| decisionsNeeded | String[] | |
| leadershipAsk | String? | |
| updatedBy | String | Role or name |

### Engineer

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| name | String | |
| role | String | engineer / lead / em |
| level | String | IC3, IC4, etc. |
| manager | String? | |
| availabilityPercentage | Int | 0–100 |
| location | String? | |

### Skill

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| name | String | e.g. Backend, Mobile |
| category | String | e.g. Engineering, Domain |

### EngineerSkill

| Field | Type | Notes |
|-------|------|-------|
| engineerId | FK | |
| skillId | FK | |
| rating | Int | 1–5 |

**Rating scale:** 1 = Can support · 2 = With guidance · 3 = Independent · 4 = Strong · 5 = Expert/mentor

### TrackSkillRequirement

| Field | Type | Notes |
|-------|------|-------|
| trackId | FK | |
| skillId | FK | |
| requiredRating | Int | 1–5 |
| effortWeight | Float | Relative weight |

### Risk

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| trackId | FK | |
| title | String | |
| severity | Severity | critical / high / medium / low |
| owner | String | |
| status | String | open / mitigated / closed |
| mitigation | String? | |
| dueDate | DateTime? | |

### Blocker

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| trackId | FK | |
| title | String | |
| owner | String | |
| blockedSince | DateTime | |
| status | String | open / resolved |
| escalationNeeded | Boolean | |

## Enums

```prisma
enum Status { GREEN AMBER RED BLUE GREY }
enum Confidence { HIGH MEDIUM LOW }
enum Severity { CRITICAL HIGH MEDIUM LOW }
```

## Skill fit formula

```text
Skill Fit Score =
  average(engineer_skill_rating / required_skill_rating)
  × (availability_percentage / 100)
```

Clamped to 0–1. Engineers with rating below required contribute proportionally.
