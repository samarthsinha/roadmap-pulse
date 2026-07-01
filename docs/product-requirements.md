# Product Requirements — Roadmap Pulse

## Overview

**Roadmap Pulse** is a web-based engineering operating dashboard for Senior Engineering Managers. It provides structured visibility across three levels: L0 (leadership), L1 (EM/PM/Lead weekly execution), and L2 (future tool integrations).

## Users

| Persona | Primary need |
|---------|--------------|
| VP / Director (L0) | Portfolio health, risks, leadership asks, predictability |
| Engineering Manager (L1) | Track ownership, capacity, blockers, weekly rhythm |
| Product Manager (L1) | Cross-functional alignment, decisions, stakeholder asks |
| Tech Lead (L1) | Technical progress, risks, skill gaps |

## Core questions (MVP must answer in < 2 min)

1. Which initiatives are off track?
2. Which tracks need leadership help?
3. Who owns each risk?
4. Which engineers are overloaded?
5. Which tracks lack the right skills?
6. What changed this week?
7. What should leadership know?

## Modules

### 1. Track Planner
Plan workstreams using skills, effort, capacity, and ownership. Recommend engineers via skill-fit scoring.

### 2. L1 Weekly Tracker
Weekly execution view for EM / PM / Lead. Captures progress, completed work, next steps, risks, blockers, decisions, and asks.

### 3. L0 Leadership Dashboard
Executive-friendly roll-up: portfolio health, progress by initiative, confidence, top risks, blockers, leadership asks.

### 4. Skills Matrix
Engineer-to-skill mapping with ratings (1–5). Skill gap analysis and expert lookup.

### 5. Capacity Dashboard
Allocation by engineer and track. Overload and unallocated capacity visibility.

### 6. Risk & Blocker Register
Open risks and blockers with owners, severity, aging, and escalation indicators.

### 7. Weekly Summary Generator
Markdown summaries for L1 (operational) and L0 (leadership) reporting.

## Principles

- Keep L0 clean — no ticket-level detail
- Every Red/Amber status must have an owner and next action
- Every leadership ask must be specific, actionable, and have an owner + due date
- Start with manual entry + CSV import; automate integrations later
- Status values: **Green, Amber, Red, Blue, Grey**
- Confidence values: **High, Medium, Low**
- Progress: numeric 0–100

## Out of scope (MVP)

- Jira / Linear / GitHub live sync
- AI-generated summaries (manual template first)
- Auth (Phase 2)
- Real-time collaboration

## Success metrics

MVP is successful when an EM can prepare a leadership update in under 10 minutes using L1 data that auto-rolls into L0.
