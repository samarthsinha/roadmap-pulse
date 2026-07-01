"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Badge, Card, PageHeader, StatCard } from "@/components/ui/primitives";
import {
  generateAlerts,
  generateWeeklySummary,
} from "@/lib/automation/engine";
import { getAlerts, getCurrentWeek } from "@/lib/store";
import { cn, formatDate, formatWeek, severityColors } from "@/lib/utils";
import { Bell, FileText, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function AutomationPage() {
  const week = getCurrentWeek();
  const [summary, setSummary] = useState(() => generateWeeklySummary(week));
  const [generatedAlerts, setGeneratedAlerts] = useState(() =>
    generateAlerts(),
  );
  const storedAlerts = getAlerts();
  const unacked = storedAlerts.filter((a) => !a.acknowledged);

  function regenerate() {
    setSummary(generateWeeklySummary(week));
    setGeneratedAlerts(generateAlerts());
  }

  return (
    <AppShell>
      <PageHeader
        title="Automation"
        description="Weekly summaries, alert generation, and operational signals — the system runs itself so you don't have to chase updates."
        badge="Automation Layer"
        actions={
          <button
            onClick={regenerate}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </button>
        }
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Generated Alerts"
          value={generatedAlerts.length}
          sub="this run"
        />
        <StatCard label="Stored Alerts" value={storedAlerts.length} />
        <StatCard
          label="Unacknowledged"
          value={unacked.length}
          trend={unacked.length > 0 ? "down" : "flat"}
        />
        <StatCard
          label="Open Asks"
          value={summary.openAsks.length}
          sub="in weekly summary"
        />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card
          title="Weekly Summary"
          action={
            <FileText className="h-4 w-4 text-zinc-400" />
          }
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs text-zinc-500">
                Week of {formatWeek(summary.weekOf)} · Generated{" "}
                {formatDate(summary.generatedAt)}
              </p>
              <p className="mt-2 text-lg font-semibold">{summary.headline}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                <p className="text-xs text-zinc-500">Capacity</p>
                <p className="font-semibold">
                  {summary.capacityUtilization}% utilized
                </p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                <p className="text-xs text-zinc-500">Health</p>
                <p className="font-semibold">
                  DORA {summary.healthSnapshot.doraOverall} · SPACE{" "}
                  {summary.healthSnapshot.spaceOverall}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Track Highlights
              </p>
              <div className="space-y-2">
                {summary.trackSummaries.map((ts) => (
                  <div
                    key={ts.trackId}
                    className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{ts.trackName}</p>
                      <Badge
                        variant={
                          ts.status === "on-track"
                            ? "success"
                            : ts.status === "at-risk"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {ts.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">{ts.highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Generated Alerts" action={<Bell className="h-4 w-4 text-zinc-400" />}>
          <div className="space-y-3">
            {generatedAlerts.length > 0 ? (
              generatedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "rounded-lg border p-3",
                    severityColors[alert.severity],
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <Badge
                      variant={
                        alert.severity === "critical" ? "danger" : "warning"
                      }
                    >
                      {alert.category}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {alert.message}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">No alerts generated.</p>
            )}
          </div>
        </Card>
      </div>

      <Card title="Summary Export Preview">
        <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-300">
          {JSON.stringify(summary, null, 2)}
        </pre>
        <p className="mt-3 text-xs text-zinc-500">
          In production, this summary would be sent via Slack/email webhook on
          schedule (e.g., Monday 9am). API route:{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
            GET /api/automation/summary
          </code>
        </p>
      </Card>
    </AppShell>
  );
}
