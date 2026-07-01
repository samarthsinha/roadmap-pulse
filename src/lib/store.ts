import {
  alerts as seedAlerts,
  CURRENT_WEEK,
  doraMetrics as seedDora,
  people as seedPeople,
  spaceMetrics as seedSpace,
  tracks as seedTracks,
  weeklyUpdates as seedUpdates,
} from "@/lib/data/seed";
import type {
  Alert,
  DoraMetrics,
  Person,
  SpaceMetrics,
  Track,
  WeeklyUpdate,
} from "@/lib/types";

// In-memory store — swap for DB/API in production
let people = [...seedPeople];
let tracks = [...seedTracks];
let weeklyUpdates = [...seedUpdates];
let alerts = [...seedAlerts];
const doraMetrics = seedDora;
const spaceMetrics = seedSpace;

export function getCurrentWeek(): string {
  return CURRENT_WEEK;
}

export function getPeople(): Person[] {
  return people;
}

export function getPerson(id: string): Person | undefined {
  return people.find((p) => p.id === id);
}

export function getTracks(): Track[] {
  return tracks;
}

export function getTrack(id: string): Track | undefined {
  return tracks.find((t) => t.id === id);
}

export function getWeeklyUpdates(weekOf?: string): WeeklyUpdate[] {
  if (weekOf) {
    return weeklyUpdates.filter((u) => u.weekOf === weekOf);
  }
  return weeklyUpdates;
}

export function getLatestUpdateForTrack(trackId: string): WeeklyUpdate | undefined {
  return weeklyUpdates
    .filter((u) => u.trackId === trackId)
    .sort((a, b) => b.weekOf.localeCompare(a.weekOf))[0];
}

export function getDoraMetrics(): DoraMetrics {
  return doraMetrics;
}

export function getSpaceMetrics(): SpaceMetrics {
  return spaceMetrics;
}

export function getAlerts(): Alert[] {
  return alerts;
}

export function acknowledgeAlert(id: string): void {
  alerts = alerts.map((a) =>
    a.id === id ? { ...a, acknowledged: true } : a,
  );
}

export function updateWeeklyUpdate(
  id: string,
  patch: Partial<WeeklyUpdate>,
): WeeklyUpdate | undefined {
  const idx = weeklyUpdates.findIndex((u) => u.id === id);
  if (idx === -1) return undefined;
  weeklyUpdates[idx] = {
    ...weeklyUpdates[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  return weeklyUpdates[idx];
}

export function updateTrack(id: string, patch: Partial<Track>): Track | undefined {
  const idx = tracks.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  tracks[idx] = { ...tracks[idx], ...patch };
  return tracks[idx];
}
