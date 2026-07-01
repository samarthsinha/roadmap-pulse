import type { Status, WeeklyStatus } from "@prisma/client";
import type { WeeklyStatusWithTrack } from "@/lib/db/types";
import { CONFIDENCE_LABELS, STATUS_LABELS } from "@/lib/db/types";

function countByStatus(statuses: WeeklyStatus[], status: Status): number {
  return statuses.filter((s) => s.status === status).length;
}

function bulletList(items: string[], fallback = "- None"): string {
  if (items.length === 0) return fallback;
  return items.map((i) => `- ${i}`).join("\n");
}

export function generateL1Summary(
  weekLabel: string,
  statuses: WeeklyStatusWithTrack[],
): string {
  const green = countByStatus(statuses, "GREEN");
  const amber = countByStatus(statuses, "AMBER");
  const red = countByStatus(statuses, "RED");

  const completed = statuses.flatMap((s) =>
    s.completedThisWeek.map((c) => `[${s.track.name}] ${c}`),
  );
  const planned = statuses.flatMap((s) =>
    s.plannedNextWeek.map((p) => `[${s.track.name}] ${p}`),
  );
  const risks = statuses.flatMap((s) =>
    s.risks.map((r) => `[${s.track.name}] ${r}`),
  );
  const blockers = statuses.flatMap((s) =>
    s.blockers.map((b) => `[${s.track.name}] ${b}`),
  );
  const decisions = statuses.flatMap((s) =>
    s.decisionsNeeded.map((d) => `[${s.track.name}] ${d}`),
  );
  const asks = statuses
    .filter((s) => s.leadershipAsk)
    .map((s) => `[${s.track.name}] ${s.leadershipAsk}`);

  return `# Weekly L1 Status — ${weekLabel}

## Overall
- Green: ${green}
- Amber: ${amber}
- Red: ${red}

## Completed this week
${bulletList(completed)}

## Planned next week
${bulletList(planned)}

## Risks and blockers
${bulletList([...risks, ...blockers], "- None reported")}

## Decisions needed
${bulletList(decisions)}

## Leadership asks
${bulletList(asks)}
`;
}

export function generateL0Summary(
  weekLabel: string,
  statuses: WeeklyStatusWithTrack[],
): string {
  const avgProgress =
    statuses.length > 0
      ? Math.round(
          statuses.reduce((s, ws) => s + ws.track.progressPercentage, 0) /
            statuses.length,
        )
      : 0;

  const wins = statuses
    .filter((s) => s.status === "GREEN")
    .flatMap((s) => s.completedThisWeek.slice(0, 1))
    .slice(0, 5);

  const topRisks = statuses
    .flatMap((s) => s.risks.map((r) => `[${s.track.initiative.name}] ${r}`))
    .slice(0, 5);

  const asks = statuses
    .filter((s) => s.leadershipAsk)
    .map(
      (s) =>
        `[${s.track.name}] ${s.leadershipAsk} (Owner: ${s.track.ownerEm})`,
    );

  const decisions = statuses.flatMap((s) =>
    s.decisionsNeeded.map((d) => `[${s.track.name}] ${d}`),
  );

  const statusBreakdown = (["GREEN", "AMBER", "RED"] as Status[])
    .map(
      (st) =>
        `${STATUS_LABELS[st]}: ${countByStatus(statuses, st)} tracks`,
    )
    .join(" · ");

  const confidenceBreakdown = statuses.reduce(
    (acc, s) => {
      acc[s.track.confidence] = (acc[s.track.confidence] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return `# Leadership Update — ${weekLabel}

## Overall status
${statusBreakdown}

## Progress
Average track progress: ${avgProgress}%
Confidence: ${Object.entries(confidenceBreakdown)
    .map(([k, v]) => `${CONFIDENCE_LABELS[k as keyof typeof CONFIDENCE_LABELS]}: ${v}`)
    .join(" · ")}

## Key wins
${bulletList(wins, "- No green-track wins logged")}

## Top risks
${bulletList(topRisks)}

## Leadership asks
${bulletList(asks)}

## Decisions needed
${bulletList(decisions)}
`;
}

export function getStaleTracks(
  statuses: WeeklyStatusWithTrack[],
  allTrackIds: string[],
  weekStart: Date,
): string[] {
  const updatedTrackIds = new Set(
    statuses
      .filter((s) => s.weekStartDate.getTime() === weekStart.getTime())
      .map((s) => s.trackId),
  );
  return allTrackIds.filter((id) => !updatedTrackIds.has(id));
}
