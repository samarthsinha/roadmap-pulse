import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, PageHeader, StatCard } from "@/components/dashboard/common";
import { getDoraOverview, getHealthInsights, getSpaceOverview } from "@/lib/metrics/health";
import { cn, doraRatingColors } from "@/lib/utils";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-zinc-400" />;
}

export default function HealthDashboardPage() {
  const { dora, overall: doraOverall } = getDoraOverview();
  const { space, overall: spaceOverall, improving, declining } = getSpaceOverview();
  const insights = getHealthInsights();

  const doraMetrics = [
    { label: "Deployment Frequency", ...dora.deploymentFrequency },
    { label: "Lead Time for Changes", ...dora.leadTimeForChanges },
    { label: "Change Failure Rate", ...dora.changeFailureRate },
    { label: "Mean Time to Restore", ...dora.meanTimeToRestore },
  ];

  const spaceKeys = ["satisfaction", "performance", "activity", "collaboration", "efficiency"] as const;

  return (
    <DashboardShell>
      <PageHeader
        title="Engineering Health"
        description="DORA delivery metrics and SPACE developer experience."
        badge="Health"
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="DORA Overall" value={doraOverall} sub={dora.period} />
        <StatCard label="SPACE Score" value={`${spaceOverall}/100`} sub={space.period} />
        <StatCard label="Improving" value={improving} sub="dimensions ↑" />
        <StatCard label="Declining" value={declining} sub="dimensions ↓" />
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        {doraMetrics.map((m) => (
          <Card key={m.label}>
            <div className="flex justify-between">
              <div>
                <p className="text-xs uppercase text-zinc-500">{m.label}</p>
                <p className="mt-2 text-2xl font-bold">
                  {m.value} <span className="text-base font-normal text-zinc-500">{m.unit}</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <TrendIcon trend={m.trend} />
                {m.rating && (
                  <span className={cn("text-xs font-semibold uppercase", doraRatingColors[m.rating])}>
                    {m.rating}
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {spaceKeys.map((key) => {
          const metric = space[key];
          return (
            <Card key={key}>
              <div className="flex justify-between">
                <div>
                  <p className="text-xs uppercase text-zinc-500">{key}</p>
                  <p className="mt-2 text-2xl font-bold">
                    {metric.value}{" "}
                    <span className="text-base font-normal text-zinc-500">{metric.unit}</span>
                  </p>
                </div>
                <TrendIcon trend={metric.trend} />
              </div>
            </Card>
          );
        })}
      </div>

      <Card title="Health Insights">
        <ul className="space-y-2">
          {insights.map((insight, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
              {insight}
            </li>
          ))}
        </ul>
      </Card>
    </DashboardShell>
  );
}
