import { getTeamCapacitySummary } from "@/lib/metrics/planning";
import { getDoraOverview, getSpaceOverview } from "@/lib/metrics/health";
import {
  getCurrentWeek,
  getLatestUpdateForTrack,
  getPerson,
  getTracks,
  getWeeklyUpdates,
} from "@/lib/store";
import type {
  Alert,
  AlertCategory,
  AlertSeverity,
  LeadershipTrackRollup,
  WeeklySummary,
} from "@/lib/types";

export function getLeadershipRollup(): LeadershipTrackRollup[] {
  return getTracks()
    .filter((t) => t.status === "active" || t.status === "blocked")
    .map((track) => {
      const latestUpdate = getLatestUpdateForTrack(track.id) ?? null;
      return {
        track,
        latestUpdate,
        owner: getPerson(track.ownerId)!,
        openAsks: latestUpdate?.asks ?? [],
        openBlockers: latestUpdate?.blockers ?? [],
      };
    });
}

export function getLeadershipStats() {
  const rollups = getLeadershipRollup();
  const updates = rollups.map((r) => r.latestUpdate).filter(Boolean);

  return {
    totalTracks: rollups.length,
    onTrack: updates.filter((u) => u!.status === "on-track").length,
    atRisk: updates.filter((u) => u!.status === "at-risk").length,
    blocked: updates.filter((u) => u!.status === "blocked").length,
    avgProgress: updates.length
      ? Math.round(
          updates.reduce((s, u) => s + u!.progressPercent, 0) / updates.length,
        )
      : 0,
    lowConfidence: updates.filter((u) => u!.confidence === "low").length,
    totalAsks: rollups.reduce((s, r) => s + r.openAsks.length, 0),
    totalBlockers: rollups.reduce((s, r) => s + r.openBlockers.length, 0),
  };
}

export function getExecutionByRole(role: "em" | "pm" | "lead") {
  const weekOf = getCurrentWeek();
  const updates = getWeeklyUpdates(weekOf);

  return getTracks()
    .filter((t) => t.status === "active" || t.status === "blocked")
    .map((track) => {
      const update = updates.find((u) => u.trackId === track.id);
      const rolePersonId =
        role === "em"
          ? track.ownerId
          : role === "pm"
            ? track.pmId
            : track.leadId;
      const rolePerson = getPerson(rolePersonId)!;
      const notes =
        role === "em"
          ? update?.emNotes
          : role === "pm"
            ? update?.pmNotes
            : update?.leadNotes;

      return { track, update, rolePerson, notes: notes ?? "" };
    });
}

export function generateAlerts(): Alert[] {
  const generated: Alert[] = [];
  const now = new Date().toISOString();
  let counter = 100;

  const capacity = getTeamCapacitySummary();
  for (const person of capacity.overAllocated) {
    generated.push({
      id: `gen-${counter++}`,
      category: "capacity",
      severity: "warning",
      title: `${person.personName} over-allocated (${person.utilization}%)`,
      message: `${person.personName} on ${person.team} is at ${person.utilization}% capacity.`,
      createdAt: now,
      acknowledged: false,
    });
  }

  for (const track of getTracks()) {
    const update = getLatestUpdateForTrack(track.id);
    if (!update) continue;

    if (update.status === "blocked" && update.blockers.length > 0) {
      generated.push({
        id: `gen-${counter++}`,
        category: "blocker",
        severity: "critical",
        title: `${track.name} is blocked`,
        message: update.blockers[0],
        trackId: track.id,
        createdAt: now,
        acknowledged: false,
      });
    }

    if (update.confidence === "low") {
      generated.push({
        id: `gen-${counter++}`,
        category: "confidence",
        severity: "warning",
        title: `Low confidence on ${track.name}`,
        message: `Track confidence is low at ${update.progressPercent}% progress.`,
        trackId: track.id,
        createdAt: now,
        acknowledged: false,
      });
    }

    if (update.status === "at-risk") {
      generated.push({
        id: `gen-${counter++}`,
        category: "risk",
        severity: "warning",
        title: `${track.name} at risk`,
        message: `Track is at-risk with ${update.progressPercent}% progress toward ${track.targetDate}.`,
        trackId: track.id,
        createdAt: now,
        acknowledged: false,
      });
    }
  }

  return generated;
}

export function generateWeeklySummary(weekOf?: string): WeeklySummary {
  const week = weekOf ?? getCurrentWeek();
  const updates = getWeeklyUpdates(week);
  const capacity = getTeamCapacitySummary();
  const { overall: doraOverall } = getDoraOverview();
  const { overall: spaceOverall } = getSpaceOverview();
  const alerts = generateAlerts();

  const blocked = updates.filter((u) => u.status === "blocked").length;
  const atRisk = updates.filter((u) => u.status === "at-risk").length;
  const headline =
    blocked > 0
      ? `${blocked} track${blocked > 1 ? "s" : ""} blocked — leadership action needed`
      : atRisk > 0
        ? `${atRisk} track${atRisk > 1 ? "s" : ""} at risk — monitor closely`
        : "All active tracks on track this week";

  return {
    weekOf: week,
    generatedAt: new Date().toISOString(),
    headline,
    trackSummaries: updates.map((u) => {
      const track = getTracks().find((t) => t.id === u.trackId)!;
      return {
        trackId: u.trackId,
        trackName: track.name,
        status: u.status,
        progressPercent: u.progressPercent,
        confidence: u.confidence,
        highlight: u.accomplishments[0] ?? "No accomplishments logged",
      };
    }),
    openAsks: updates.flatMap((u) => {
      const track = getTracks().find((t) => t.id === u.trackId)!;
      return u.asks.map((ask) => ({
        trackId: u.trackId,
        trackName: track.name,
        ask,
      }));
    }),
    blockers: updates.flatMap((u) => {
      const track = getTracks().find((t) => t.id === u.trackId)!;
      return u.blockers.map((blocker) => ({
        trackId: u.trackId,
        trackName: track.name,
        blocker,
      }));
    }),
    capacityUtilization: capacity.utilization,
    healthSnapshot: { doraOverall, spaceOverall },
    alertCount: alerts.length,
  };
}

export type { AlertCategory, AlertSeverity };
