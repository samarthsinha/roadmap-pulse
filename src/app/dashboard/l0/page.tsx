import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, PageHeader, ProgressBar, StatCard } from "@/components/dashboard/common";
import { ConfidenceBadge, StatusBadge } from "@/components/dashboard/status-badge";
import {
  ConfidenceBarChart,
  ProgressBarChart,
  StatusPieChart,
} from "@/components/charts/portfolio-charts";
import {
  getInitiativesWithTracks,
  getOpenBlockers,
  getOpenRisks,
  getPortfolioStats,
  getTracksWithRelations,
} from "@/lib/db/queries";
import { CONFIDENCE_LABELS, SEVERITY_ORDER, blockerAgeDays, formatWeekStart, getCurrentWeekStart, isBlockerStale } from "@/lib/db/types";
import type { Confidence, Status } from "@prisma/client";
import { Badge } from "@/components/dashboard/status-badge";

export default async function L0DashboardPage() {
  const stats = await getPortfolioStats();
  const initiatives = await getInitiativesWithTracks();
  const tracks = await getTracksWithRelations();
  const risks = await getOpenRisks();
  const blockers = await getOpenBlockers();
  const week = formatWeekStart(getCurrentWeekStart());

  const statusData = (["GREEN", "AMBER", "RED", "BLUE", "GREY"] as Status[])
    .map((status) => ({
      status,
      name: status.charAt(0) + status.slice(1).toLowerCase(),
      value: tracks.filter((t) => t.status === status).length,
    }))
    .filter((d) => d.value > 0);

  const progressData = initiatives.map((i) => ({
    name: i.name.length > 18 ? i.name.slice(0, 18) + "…" : i.name,
    progress: i.progressPercentage,
  }));

  const confidenceCounts = (["HIGH", "MEDIUM", "LOW"] as Confidence[]).map(
    (c) => ({
      name: CONFIDENCE_LABELS[c],
      count: tracks.filter((t) => t.confidence === c).length,
    }),
  );

  const topRisks = [...risks]
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
    .slice(0, 5);

  const topBlockers = [...blockers]
    .sort((a, b) => a.blockedSince.getTime() - b.blockedSince.getTime())
    .slice(0, 5);

  const slippage = tracks.filter(
    (t) =>
      t.targetDate < new Date() ||
      (t.progressPercentage < 90 &&
        t.targetDate.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000),
  );

  return (
    <DashboardShell>
      <PageHeader
        title="L0 Leadership Dashboard"
        description="Executive view — portfolio health, progress, confidence, risks, and leadership asks."
        badge={`Week of ${week}`}
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Initiatives" value={stats.initiativeCount} />
        <StatCard label="Tracks" value={stats.trackCount} />
        <StatCard label="Green" value={stats.greenCount} sub="on track" />
        <StatCard label="Amber" value={stats.amberCount} sub="at risk" />
        <StatCard label="Red" value={stats.redCount} sub="blocked" />
        <StatCard label="Avg Progress" value={`${stats.avgProgress}%`} />
        <StatCard label="Open Asks" value={stats.leadershipAsks.length} />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card title="Status Distribution">
          <StatusPieChart data={statusData} />
        </Card>
        <Card title="Progress by Initiative">
          <ProgressBarChart data={progressData} />
        </Card>
        <Card title="Milestone Confidence">
          <ConfidenceBarChart data={confidenceCounts} />
        </Card>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card title="Leadership Asks">
          {stats.leadershipAsks.length > 0 ? (
            <div className="space-y-3">
              {stats.leadershipAsks.map((item, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20"
                >
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                    {item.source} · Owner: {item.owner}
                  </p>
                  <p className="mt-1 text-sm">{item.ask}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No open leadership asks.</p>
          )}
        </Card>

        <Card title="Milestone Slippage Watch">
          {slippage.length > 0 ? (
            <div className="space-y-3">
              {slippage.map((track) => (
                <div key={track.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{track.name}</p>
                    <p className="text-xs text-zinc-500">
                      Target: {track.targetDate.toISOString().slice(0, 10)}
                    </p>
                  </div>
                  <div className="w-24">
                    <ProgressBar value={track.progressPercentage} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No slippage signals.</p>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Top Risks">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-zinc-500">
                <th className="pb-2 font-medium">Risk</th>
                <th className="pb-2 font-medium">Severity</th>
                <th className="pb-2 font-medium">Owner</th>
              </tr>
            </thead>
            <tbody>
              {topRisks.map((risk) => (
                <tr key={risk.id} className="border-b border-zinc-50 dark:border-zinc-800/50">
                  <td className="py-2.5">
                    <p>{risk.title}</p>
                    <p className="text-xs text-zinc-500">{risk.track.name}</p>
                  </td>
                  <td className="py-2.5">
                    <Badge variant={risk.severity === "CRITICAL" || risk.severity === "HIGH" ? "danger" : "warning"}>
                      {risk.severity}
                    </Badge>
                  </td>
                  <td className="py-2.5 text-zinc-600">{risk.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Top Blockers (by age)">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-zinc-500">
                <th className="pb-2 font-medium">Blocker</th>
                <th className="pb-2 font-medium">Age</th>
                <th className="pb-2 font-medium">Escalate</th>
              </tr>
            </thead>
            <tbody>
              {topBlockers.map((blocker) => {
                const age = blockerAgeDays(blocker.blockedSince);
                return (
                  <tr key={blocker.id} className="border-b border-zinc-50 dark:border-zinc-800/50">
                    <td className="py-2.5">
                      <p>{blocker.title}</p>
                      <p className="text-xs text-zinc-500">{blocker.track.name}</p>
                    </td>
                    <td className="py-2.5">{age}d</td>
                    <td className="py-2.5">
                      {(blocker.escalationNeeded || isBlockerStale(blocker.blockedSince)) && (
                        <Badge variant="danger">Yes</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>

      <Card title="Track Roll-up" className="mt-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase text-zinc-500">
              <th className="pb-3 font-medium">Track</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Progress</th>
              <th className="pb-3 font-medium">Confidence</th>
              <th className="pb-3 font-medium">EM</th>
            </tr>
          </thead>
          <tbody>
            {tracks
              .filter((t) => t.status !== "BLUE")
              .map((track) => (
                <tr key={track.id} className="border-b border-zinc-50 dark:border-zinc-800/50">
                  <td className="py-3 font-medium">{track.name}</td>
                  <td className="py-3"><StatusBadge status={track.status} /></td>
                  <td className="py-3">
                    <div className="w-20">
                      <ProgressBar value={track.progressPercentage} />
                      <span className="text-xs text-zinc-500">{track.progressPercentage}%</span>
                    </div>
                  </td>
                  <td className="py-3"><ConfidenceBadge confidence={track.confidence} /></td>
                  <td className="py-3 text-zinc-600">{track.ownerEm}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>
    </DashboardShell>
  );
}
