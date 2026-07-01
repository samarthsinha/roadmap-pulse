import { AppShell } from "@/components/layout/app-shell";
import {
  Badge,
  Card,
  PageHeader,
  ProgressBar,
  StatCard,
} from "@/components/ui/primitives";
import {
  getLeadershipRollup,
  getLeadershipStats,
} from "@/lib/automation/engine";
import { getCurrentWeek } from "@/lib/store";
import {
  cn,
  confidenceColors,
  formatWeek,
  statusColors,
} from "@/lib/utils";
import { AlertCircle, HelpCircle, ShieldAlert } from "lucide-react";

export default function LeadershipPage() {
  const week = getCurrentWeek();
  const stats = getLeadershipStats();
  const rollups = getLeadershipRollup();

  return (
    <AppShell>
      <PageHeader
        title="Leadership Visibility"
        description="L0 dashboard — rolled-up progress, confidence, risks, and asks across all active tracks. Built for VP+ consumption."
        badge="L0 Roll-up"
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Active Tracks" value={stats.totalTracks} />
        <StatCard
          label="Avg Progress"
          value={`${stats.avgProgress}%`}
          trend="up"
        />
        <StatCard
          label="On Track"
          value={stats.onTrack}
          sub="green"
          trend="up"
        />
        <StatCard
          label="At Risk"
          value={stats.atRisk}
          trend={stats.atRisk > 0 ? "down" : "flat"}
        />
        <StatCard
          label="Blocked"
          value={stats.blocked}
          trend={stats.blocked > 0 ? "down" : "flat"}
        />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <Card title="Open Asks — Leadership Action Required">
          {rollups.some((r) => r.openAsks.length > 0) ? (
            <div className="space-y-3">
              {rollups.flatMap((r) =>
                r.openAsks.map((ask, i) => (
                  <div
                    key={`${r.track.id}-ask-${i}`}
                    className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30"
                  >
                    <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <div>
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-400">
                        {r.track.name}
                      </p>
                      <p className="mt-0.5 text-sm">{ask}</p>
                    </div>
                  </div>
                )),
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No open asks this week.</p>
          )}
        </Card>

        <Card title="Active Blockers">
          {rollups.some((r) => r.openBlockers.length > 0) ? (
            <div className="space-y-3">
              {rollups.flatMap((r) =>
                r.openBlockers.map((blocker, i) => (
                  <div
                    key={`${r.track.id}-block-${i}`}
                    className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30"
                  >
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    <div>
                      <p className="text-xs font-medium text-red-800 dark:text-red-400">
                        {r.track.name}
                      </p>
                      <p className="mt-0.5 text-sm">{blocker}</p>
                    </div>
                  </div>
                )),
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No blockers this week.</p>
          )}
        </Card>
      </div>

      <Card title={`Track Status — Week of ${formatWeek(week)}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                <th className="pb-3 pr-4 font-medium">Track</th>
                <th className="pb-3 pr-4 font-medium">EM</th>
                <th className="pb-3 pr-4 font-medium">Progress</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium">Confidence</th>
                <th className="pb-3 pr-4 font-medium">Target</th>
                <th className="pb-3 font-medium">Risk Signals</th>
              </tr>
            </thead>
            <tbody>
              {rollups.map(({ track, latestUpdate, owner }) => {
                const risks: string[] = [];
                if (latestUpdate?.status === "blocked") risks.push("Blocked");
                if (latestUpdate?.status === "at-risk") risks.push("At risk");
                if (latestUpdate?.confidence === "low")
                  risks.push("Low confidence");
                if ((latestUpdate?.asks.length ?? 0) > 0)
                  risks.push(`${latestUpdate!.asks.length} ask(s)`);

                return (
                  <tr
                    key={track.id}
                    className="border-b border-zinc-50 dark:border-zinc-800/50"
                  >
                    <td className="py-4 pr-4">
                      <p className="font-medium">{track.name}</p>
                      <p className="text-xs text-zinc-500">{track.quarter}</p>
                    </td>
                    <td className="py-4 pr-4 text-zinc-600 dark:text-zinc-400">
                      {owner.name}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="w-24">
                        <ProgressBar
                          value={latestUpdate?.progressPercent ?? 0}
                        />
                        <p className="mt-1 text-xs text-zinc-500">
                          {latestUpdate?.progressPercent ?? 0}%
                        </p>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      {latestUpdate ? (
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                            statusColors[latestUpdate.status],
                          )}
                        >
                          {latestUpdate.status}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      {latestUpdate ? (
                        <span
                          className={cn(
                            "text-xs font-medium capitalize",
                            confidenceColors[latestUpdate.confidence],
                          )}
                        >
                          {latestUpdate.confidence}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-4 pr-4 text-xs text-zinc-500">
                      {track.targetDate}
                    </td>
                    <td className="py-4">
                      {risks.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {risks.map((risk) => (
                            <Badge
                              key={risk}
                              variant={
                                risk.includes("Blocked") ||
                                risk.includes("Low")
                                  ? "danger"
                                  : "warning"
                              }
                            >
                              {risk}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <Badge variant="success">Clear</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {stats.lowConfidence > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-400">
              {stats.lowConfidence} track(s) with low confidence
            </p>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-500">
              Low confidence tracks need leadership review before the next
              planning cycle.
            </p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
