/**
 * Mutable in-memory store for demo mode (no PostgreSQL).
 * Initialized from fallback-data; supports create/update mutations.
 */

import {
  fallbackBlockers,
  fallbackEngineers,
  fallbackEngineerSkills,
  fallbackInitiatives,
  fallbackRisks,
  fallbackSkills,
  fallbackTrackSkills,
  fallbackTracks,
  fallbackWeeklyStatuses,
} from "@/lib/db/fallback-data";
import { getCurrentWeekStart } from "@/lib/db/types";
import type {
  Blocker,
  Engineer,
  EngineerSkill,
  Initiative,
  Risk,
  Skill,
  Status,
  Track,
  TrackSkillRequirement,
  WeeklyStatus,
} from "@prisma/client";

function clone<T>(value: T): T {
  return structuredClone(value);
}

const currentWeek = getCurrentWeekStart();

function normalizeWeek(date: Date): Date {
  const d = new Date(currentWeek);
  d.setHours(0, 0, 0, 0);
  return d;
}

let initiatives: Initiative[] = clone(fallbackInitiatives);
let tracks: Track[] = clone(fallbackTracks);
let weeklyStatuses: WeeklyStatus[] = clone(fallbackWeeklyStatuses).map((ws) => ({
  ...ws,
  weekStartDate: normalizeWeek(ws.weekStartDate),
}));
let engineers: Engineer[] = clone(fallbackEngineers);
let engineerSkills: EngineerSkill[] = clone(fallbackEngineerSkills);
let skills: Skill[] = clone(fallbackSkills);
let trackSkills: TrackSkillRequirement[] = clone(fallbackTrackSkills);
let risks: Risk[] = clone(fallbackRisks);
let blockers: Blocker[] = clone(fallbackBlockers);

export function getFallbackInitiatives() {
  return initiatives;
}

export function getFallbackTracks() {
  return tracks;
}

export function getFallbackWeeklyStatuses() {
  return weeklyStatuses;
}

export function getFallbackEngineers() {
  return engineers;
}

export function getFallbackEngineerSkills() {
  return engineerSkills;
}

export function getFallbackSkills() {
  return skills;
}

export function getFallbackTrackSkills() {
  return trackSkills;
}

export function getFallbackRisks() {
  return risks;
}

export function getFallbackBlockers() {
  return blockers;
}

export function upsertFallbackWeeklyStatus(
  data: Omit<WeeklyStatus, "id" | "createdAt" | "updatedAt"> & { id?: string },
): WeeklyStatus {
  const now = new Date();
  const weekStart = normalizeWeek(data.weekStartDate);
  const existingIdx = weeklyStatuses.findIndex(
    (ws) =>
      ws.trackId === data.trackId &&
      normalizeWeek(ws.weekStartDate).getTime() === weekStart.getTime(),
  );

  const record: WeeklyStatus = {
    id:
      data.id ??
      (existingIdx >= 0 ? weeklyStatuses[existingIdx].id : `ws-${Date.now()}`),
    trackId: data.trackId,
    weekStartDate: weekStart,
    status: data.status,
    progressUpdate: data.progressUpdate ?? null,
    completedThisWeek: data.completedThisWeek,
    plannedNextWeek: data.plannedNextWeek,
    risks: data.risks,
    blockers: data.blockers,
    decisionsNeeded: data.decisionsNeeded,
    leadershipAsk: data.leadershipAsk ?? null,
    updatedBy: data.updatedBy,
    createdAt: existingIdx >= 0 ? weeklyStatuses[existingIdx].createdAt : now,
    updatedAt: now,
  };

  if (existingIdx >= 0) {
    weeklyStatuses[existingIdx] = record;
  } else {
    weeklyStatuses.push(record);
  }

  return record;
}

export function updateFallbackTrack(
  trackId: string,
  patch: Partial<
    Pick<
      Track,
      | "status"
      | "progressPercentage"
      | "confidence"
      | "name"
      | "description"
      | "ownerEm"
      | "ownerPm"
      | "techLead"
      | "targetDate"
      | "effortEstimateDays"
      | "initiativeId"
    >
  >,
): Track | undefined {
  const idx = tracks.findIndex((t) => t.id === trackId);
  if (idx === -1) return undefined;
  tracks[idx] = { ...tracks[idx], ...patch, updatedAt: new Date() };
  return tracks[idx];
}

export function createFallbackTrack(
  data: Omit<Track, "id" | "createdAt" | "updatedAt">,
): Track {
  const now = new Date();
  const track: Track = {
    ...data,
    startDate: data.startDate ?? null,
    actualEffortDays: data.actualEffortDays ?? null,
    description: data.description ?? null,
    id: `trk-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  tracks.push(track);
  return track;
}

export function getFallbackWeeklyStatusById(id: string) {
  return weeklyStatuses.find((ws) => ws.id === id);
}

export function weeksMatch(a: Date, b: Date): boolean {
  return normalizeWeek(a).getTime() === normalizeWeek(b).getTime();
}

export function upsertFallbackSkill(name: string, category: string): Skill {
  const existing = skills.find((s) => s.name === name);
  if (existing) {
    existing.category = category;
    return existing;
  }
  const skill: Skill = {
    id: `sk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    category,
    createdAt: new Date(),
  };
  skills.push(skill);
  return skill;
}

export function upsertFallbackEngineer(
  data: Pick<
    Engineer,
    "name" | "role" | "level" | "manager" | "availabilityPercentage" | "location"
  >,
): Engineer {
  const idx = engineers.findIndex((e) => e.name === data.name);
  const now = new Date();
  if (idx >= 0) {
    engineers[idx] = { ...engineers[idx], ...data, updatedAt: now };
    return engineers[idx];
  }
  const engineer: Engineer = {
    ...data,
    id: `eng-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  engineers.push(engineer);
  return engineer;
}

export function upsertFallbackEngineerSkill(
  engineerName: string,
  skillName: string,
  rating: number,
): boolean {
  const engineer = engineers.find((e) => e.name === engineerName);
  const skill = skills.find((s) => s.name === skillName);
  if (!engineer || !skill) return false;

  const idx = engineerSkills.findIndex(
    (es) => es.engineerId === engineer.id && es.skillId === skill.id,
  );
  if (idx >= 0) {
    engineerSkills[idx].rating = rating;
  } else {
    engineerSkills.push({ engineerId: engineer.id, skillId: skill.id, rating });
  }
  return true;
}

export { currentWeek as fallbackCurrentWeek };
