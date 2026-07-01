import {
  getEngineersWithSkills,
  getOpenBlockers,
  getOpenRisks,
  getTracksWithRelations,
  getWeeklyStatuses,
} from "@/lib/db/queries";
import {
  blockerAgeDays,
  formatWeekStart,
  getCurrentWeekStart,
  isBlockerStale,
} from "@/lib/db/types";

export type AlertCategory =
  | "stale"
  | "status"
  | "blocker"
  | "risk"
  | "capacity";

export type AlertSeverity = "critical" | "warning" | "info";

export interface OperationalAlert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  trackId?: string;
  trackName?: string;
  owner?: string;
}

export async function generateOperationalAlerts(): Promise<OperationalAlert[]> {
  const alerts: OperationalAlert[] = [];
  const weekStart = getCurrentWeekStart();
  const week = formatWeekStart(weekStart);

  const [tracks, statuses, blockers, risks, engineers] = await Promise.all([
    getTracksWithRelations(),
    getWeeklyStatuses(weekStart),
    getOpenBlockers(),
    getOpenRisks(),
    getEngineersWithSkills(),
  ]);

  const updatedTrackIds = new Set(statuses.map((s) => s.trackId));
  const activeTracks = tracks.filter((t) => t.status !== "BLUE");

  // Stale weekly updates
  for (const track of activeTracks) {
    if (!updatedTrackIds.has(track.id) && track.status !== "GREY") {
      alerts.push({
        id: `stale-${track.id}`,
        category: "stale",
        severity: "warning",
        title: `No update for week of ${week}`,
        message: `"${track.name}" has no L1 status logged this week.`,
        trackId: track.id,
        trackName: track.name,
        owner: track.ownerEm,
      });
    }
  }

  // Red / Amber track alerts
  for (const track of activeTracks) {
    if (track.status === "RED") {
      alerts.push({
        id: `status-red-${track.id}`,
        category: "status",
        severity: "critical",
        title: `Track blocked: ${track.name}`,
        message: `Progress at ${track.progressPercentage}% — requires leadership action.`,
        trackId: track.id,
        trackName: track.name,
        owner: track.ownerEm,
      });
    } else if (track.status === "AMBER") {
      alerts.push({
        id: `status-amber-${track.id}`,
        category: "status",
        severity: "warning",
        title: `Track at risk: ${track.name}`,
        message: `Progress at ${track.progressPercentage}% — monitor closely.`,
        trackId: track.id,
        trackName: track.name,
        owner: track.ownerEm,
      });
    }
  }

  // Blocker aging (>7 days or escalation flag)
  for (const blocker of blockers) {
    const age = blockerAgeDays(blocker.blockedSince);
    const escalate = blocker.escalationNeeded || isBlockerStale(blocker.blockedSince);
    if (escalate) {
      alerts.push({
        id: `blocker-${blocker.id}`,
        category: "blocker",
        severity: age >= 14 ? "critical" : "warning",
        title: `Blocker open ${age} days`,
        message: blocker.title,
        trackId: blocker.trackId,
        trackName: blocker.track.name,
        owner: blocker.owner,
      });
    }
  }

  // Critical / high risks
  for (const risk of risks) {
    if (risk.severity === "CRITICAL" || risk.severity === "HIGH") {
      alerts.push({
        id: `risk-${risk.id}`,
        category: "risk",
        severity: risk.severity === "CRITICAL" ? "critical" : "warning",
        title: `${risk.severity} risk: ${risk.title}`,
        message: risk.mitigation
          ? `Mitigation: ${risk.mitigation}`
          : `Track: ${risk.track.name}`,
        trackId: risk.trackId,
        trackName: risk.track.name,
        owner: risk.owner,
      });
    }
  }

  // Overloaded engineers (<80% availability)
  for (const eng of engineers) {
    if (eng.availabilityPercentage < 80) {
      alerts.push({
        id: `capacity-${eng.id}`,
        category: "capacity",
        severity: eng.availabilityPercentage < 60 ? "critical" : "warning",
        title: `${eng.name} over-allocated`,
        message: `Only ${eng.availabilityPercentage}% availability remaining.`,
        owner: eng.manager ?? undefined,
      });
    }
  }

  const severityOrder: Record<AlertSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };

  return alerts.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
  );
}

export async function getAlertSummary() {
  const alerts = await generateOperationalAlerts();
  return {
    total: alerts.length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    byCategory: {
      stale: alerts.filter((a) => a.category === "stale").length,
      status: alerts.filter((a) => a.category === "status").length,
      blocker: alerts.filter((a) => a.category === "blocker").length,
      risk: alerts.filter((a) => a.category === "risk").length,
      capacity: alerts.filter((a) => a.category === "capacity").length,
    },
  };
}
