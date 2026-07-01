import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, PageHeader, StatCard } from "@/components/dashboard/common";
import { Badge } from "@/components/dashboard/status-badge";
import {
  generateOperationalAlerts,
  getAlertSummary,
} from "@/lib/status/alerts";
import { formatWeekStart, getCurrentWeekStart } from "@/lib/db/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

const severityStyles = {
  critical: "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20",
  warning: "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20",
  info: "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20",
};

const categoryLabels = {
  stale: "Stale update",
  status: "Track status",
  blocker: "Blocker aging",
  risk: "Risk",
  capacity: "Capacity",
};

export default async function AlertsPage() {
  const week = formatWeekStart(getCurrentWeekStart());
  const [alerts, summary] = await Promise.all([
    generateOperationalAlerts(),
    getAlertSummary(),
  ]);

  return (
    <DashboardShell>
      <PageHeader
        title="Operational Alerts"
        description="Automated signals: stale L1 updates, red/amber tracks, aging blockers, risks, and capacity."
        badge={`Week of ${week}`}
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total alerts" value={summary.total} />
        <StatCard label="Critical" value={summary.critical} />
        <StatCard label="Warning" value={summary.warning} />
        <StatCard label="Stale tracks" value={summary.byCategory.stale} />
        <StatCard label="Aging blockers" value={summary.byCategory.blocker} />
      </div>

      {alerts.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-sm text-zinc-500">
            No alerts — portfolio looks healthy this week.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "rounded-xl border p-4",
                severityStyles[alert.severity],
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        alert.severity === "critical" ? "danger" : "warning"
                      }
                    >
                      {alert.severity}
                    </Badge>
                    <Badge variant="info">
                      {categoryLabels[alert.category]}
                    </Badge>
                  </div>
                  <p className="mt-2 font-medium">{alert.title}</p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {alert.message}
                  </p>
                </div>
                <div className="text-right text-xs text-zinc-500">
                  {alert.owner && <p>Owner: {alert.owner}</p>}
                  {alert.trackName && (
                    <Link
                      href="/dashboard/l1"
                      className="mt-1 block text-blue-600 hover:underline"
                    >
                      {alert.trackName} →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Card title="Alert rules" className="mt-8">
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li>• <strong>Stale</strong> — active track with no L1 update this week</li>
          <li>• <strong>Status</strong> — track in RED (critical) or AMBER (warning)</li>
          <li>• <strong>Blocker</strong> — open 7+ days or escalation flag set</li>
          <li>• <strong>Risk</strong> — HIGH or CRITICAL severity open risks</li>
          <li>• <strong>Capacity</strong> — engineer availability below 80%</li>
        </ul>
      </Card>
    </DashboardShell>
  );
}
