import { DashboardShell } from "@/components/layout/dashboard-shell";
import { L1Tracker, type L1TableRow } from "@/components/dashboard/l1/l1-tracker";
import { PageHeader } from "@/components/dashboard/common";
import { getTracksWithRelations, getWeeklyStatuses } from "@/lib/db/queries";
import { formatWeekStart, getCurrentWeekStart } from "@/lib/db/types";

export default async function L1TrackerPage() {
  const weekStart = getCurrentWeekStart();
  const week = formatWeekStart(weekStart);
  const statuses = await getWeeklyStatuses(weekStart);
  const allTracks = await getTracksWithRelations();

  const activeTracks = allTracks.filter(
    (t) => t.status !== "BLUE",
  );

  const statusByTrackId = new Map(statuses.map((s) => [s.trackId, s]));

  const rows: L1TableRow[] = activeTracks.map((track) => {
    const ws = statusByTrackId.get(track.id);
    return {
      statusId: ws?.id,
      trackId: track.id,
      initiative: track.initiative.name,
      trackName: track.name,
      owner: track.ownerEm,
      status: ws?.status ?? track.status,
      progress: track.progressPercentage,
      completed: ws?.completedThisWeek ?? [],
      planned: ws?.plannedNextWeek ?? [],
      blockers: ws?.blockers ?? [],
      risks: ws?.risks ?? [],
      decisions: ws?.decisionsNeeded ?? [],
      ask: ws?.leadershipAsk ?? null,
      progressUpdate: ws?.progressUpdate ?? null,
      updatedAt: ws?.updatedAt.toISOString().slice(0, 10) ?? null,
      updatedBy: ws?.updatedBy ?? track.ownerEm,
      hasUpdate: !!ws,
    };
  });

  const tracks = activeTracks.map((t) => ({
    id: t.id,
    name: t.name,
    ownerEm: t.ownerEm,
  }));

  return (
    <DashboardShell>
      <PageHeader
        title="L1 Weekly Tracker"
        description="Track-level weekly execution for EM, PM, and Tech Lead. Click + or edit to update."
        badge={`Week of ${week}`}
      />
      <L1Tracker week={week} rows={rows} tracks={tracks} />
    </DashboardShell>
  );
}
