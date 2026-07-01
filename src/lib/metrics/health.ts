import { getDoraMetrics, getSpaceMetrics } from "@/lib/store";
import type { DoraRating } from "@/lib/types";

const DORA_WEIGHTS = {
  deploymentFrequency: 0.25,
  leadTimeForChanges: 0.25,
  changeFailureRate: 0.25,
  meanTimeToRestore: 0.25,
} as const;

const RATING_SCORE: Record<DoraRating, number> = {
  elite: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function getDoraOverview() {
  const dora = getDoraMetrics();
  const metrics = [
    dora.deploymentFrequency,
    dora.leadTimeForChanges,
    dora.changeFailureRate,
    dora.meanTimeToRestore,
  ];

  const rated = metrics.filter((m) => m.rating);
  const avgScore =
    rated.length > 0
      ? rated.reduce((s, m) => s + RATING_SCORE[m.rating!], 0) / rated.length
      : 0;

  let overall: DoraRating = "medium";
  if (avgScore >= 3.5) overall = "elite";
  else if (avgScore >= 2.5) overall = "high";
  else if (avgScore >= 1.5) overall = "medium";
  else overall = "low";

  return { dora, overall, avgScore };
}

export function getSpaceOverview() {
  const space = getSpaceMetrics();
  const dimensions = [
    space.satisfaction,
    space.performance,
    space.activity,
    space.collaboration,
    space.efficiency,
  ];

  const improving = dimensions.filter((d) => d.trend === "up").length;
  const declining = dimensions.filter((d) => d.trend === "down").length;

  const normalized = dimensions.map((d) => {
    if (d.unit === "/5") return (d.value / 5) * 100;
    if (d.unit === "%") return d.value;
    if (d.unit === "PRs merged") return Math.min(100, (d.value / 200) * 100);
    if (d.unit === "cross-team PRs/person")
      return Math.min(100, (d.value / 5) * 100);
    if (d.unit === "% sprint goal hit") return d.value;
    if (d.unit === "% focus time") return d.value;
    return d.value;
  });

  const overall = Math.round(
    normalized.reduce((s, v) => s + v, 0) / normalized.length,
  );

  return { space, overall, improving, declining };
}

export function getHealthInsights(): string[] {
  const { dora, overall: doraOverall } = getDoraOverview();
  const { space, declining } = getSpaceOverview();
  const insights: string[] = [];

  if (doraOverall === "elite" || doraOverall === "high") {
    insights.push(
      `DORA performance is ${doraOverall} — delivery velocity is strong.`,
    );
  } else {
    insights.push(
      `DORA performance is ${doraOverall} — focus on deployment frequency and lead time.`,
    );
  }

  if (dora.meanTimeToRestore.rating === "elite") {
    insights.push("MTTR is elite — incident response is a team strength.");
  }

  if (space.efficiency.trend === "down") {
    insights.push(
      `Focus time dropped to ${space.efficiency.value}% — investigate meeting load and context switching.`,
    );
  }

  if (space.satisfaction.trend === "up") {
    insights.push(
      `Developer satisfaction improved to ${space.satisfaction.value}/5.`,
    );
  }

  if (declining >= 2) {
    insights.push(
      `${declining} SPACE dimensions trending down — schedule a team health check.`,
    );
  }

  return insights;
}
