import { AppShell } from "@/components/layout/app-shell";
import { Badge, Card, PageHeader, StatCard } from "@/components/ui/primitives";
import {
  getDoraOverview,
  getHealthInsights,
  getSpaceOverview,
} from "@/lib/metrics/health";
import { cn, doraRatingColors } from "@/lib/utils";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up")
    return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (trend === "down")
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-zinc-400" />;
}

export default function HealthPage() {
  const { dora, overall: doraOverall } = getDoraOverview();
  const { space, overall: spaceOverall, improving, declining } =
    getSpaceOverview();
  const insights = getHealthInsights();

  const doraMetrics = [
    {
      label: "Deployment Frequency",
      ...dora.deploymentFrequency,
      description: "How often code reaches production",
    },
    {
      label: "Lead Time for Changes",
      ...dora.leadTimeForChanges,
      description: "Commit to production duration",
    },
    {
      label: "Change Failure Rate",
      ...dora.changeFailureRate,
      description: "% of deploys causing incidents",
    },
    {
      label: "Mean Time to Restore",
      ...dora.meanTimeToRestore,
      description: "Recovery time after failure",
    },
  ];

  const spaceMetrics = [
    {
      label: "Satisfaction",
      key: "satisfaction" as const,
      description: "Developer happiness & fulfillment",
    },
    {
      label: "Performance",
      key: "performance" as const,
      description: "Outcome quality & delivery",
    },
    {
      label: "Activity",
      key: "activity" as const,
      description: "Volume of engineering work",
    },
    {
      label: "Collaboration",
      key: "collaboration" as const,
      description: "Cross-team interaction",
    },
    {
      label: "Efficiency",
      key: "efficiency" as const,
      description: "Flow & focus time",
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Engineering Health"
        description="DORA delivery metrics and SPACE developer experience — the improvement layer of the operating system."
        badge="Health Layer"
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="DORA Overall"
          value={doraOverall}
          sub={dora.period}
        />
        <StatCard
          label="SPACE Score"
          value={`${spaceOverall}/100`}
          sub={space.period}
        />
        <StatCard
          label="Improving"
          value={improving}
          sub="SPACE dimensions ↑"
          trend="up"
        />
        <StatCard
          label="Declining"
          value={declining}
          sub="SPACE dimensions ↓"
          trend={declining > 0 ? "down" : "flat"}
        />
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">DORA Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {doraMetrics.map((metric) => (
            <Card key={metric.label}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {metric.value}{" "}
                    <span className="text-base font-normal text-zinc-500">
                      {metric.unit}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {metric.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <TrendIcon trend={metric.trend} />
                  {metric.rating && (
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase",
                        doraRatingColors[metric.rating],
                      )}
                    >
                      {metric.rating}
                    </span>
                  )}
                </div>
              </div>
              {metric.previousValue !== undefined && (
                <p className="mt-3 text-xs text-zinc-400">
                  Previous: {metric.previousValue} {metric.unit}
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">SPACE Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {spaceMetrics.map(({ label, key, description }) => {
            const metric = space[key];
            return (
              <Card key={key}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      {label}
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {metric.value}{" "}
                      <span className="text-base font-normal text-zinc-500">
                        {metric.unit}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">{description}</p>
                  </div>
                  <TrendIcon trend={metric.trend} />
                </div>
                {metric.previousValue !== undefined && (
                  <p className="mt-3 text-xs text-zinc-400">
                    Previous: {metric.previousValue} {metric.unit}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <Card title="Health Insights">
        <ul className="space-y-2">
          {insights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
              {insight}
            </li>
          ))}
        </ul>
      </Card>
    </AppShell>
  );
}
