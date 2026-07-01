"use client";

import { AppShell } from "@/components/layout/app-shell";
import {
  Badge,
  Card,
  PageHeader,
  ProgressBar,
} from "@/components/ui/primitives";
import { getExecutionByRole } from "@/lib/automation/engine";
import { getCurrentWeek } from "@/lib/store";
import { cn, confidenceColors, formatWeek, statusColors } from "@/lib/utils";
import { useState } from "react";

type Role = "em" | "pm" | "lead";

const roleLabels: Record<Role, string> = {
  em: "Engineering Manager",
  pm: "Product Manager",
  lead: "Tech Lead",
};

export default function ExecutionPage() {
  const [role, setRole] = useState<Role>("em");
  const week = getCurrentWeek();
  const items = getExecutionByRole(role);

  return (
    <AppShell>
      <PageHeader
        title="Weekly Execution"
        description="L1 operational tracker — each role logs progress, blockers, and asks for their tracks every week."
        badge={`Week of ${formatWeek(week)}`}
      />

      <div className="mb-6 flex gap-2">
        {(Object.keys(roleLabels) as Role[]).map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              role === r
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400",
            )}
          >
            {roleLabels[r]}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {items.map(({ track, update, rolePerson, notes }) => (
          <Card key={track.id}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{track.name}</h3>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {roleLabels[role]}: {rolePerson.name}
                </p>
              </div>
              {update && (
                <div className="flex flex-wrap gap-2">
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                      statusColors[update.status],
                    )}
                  >
                    {update.status}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium capitalize",
                      confidenceColors[update.confidence],
                    )}
                  >
                    {update.confidence} confidence
                  </span>
                </div>
              )}
            </div>

            {update ? (
              <>
                <div className="mb-4">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-zinc-500">Progress</span>
                    <span className="font-medium">{update.progressPercent}%</span>
                  </div>
                  <ProgressBar value={update.progressPercent} />
                </div>

                <div className="mb-4 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {roleLabels[role]} Notes
                  </p>
                  <p className="mt-1 text-sm">{notes || "No notes this week."}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Accomplishments
                    </p>
                    <ul className="space-y-1">
                      {update.accomplishments.map((item, i) => (
                        <li key={i} className="text-sm text-zinc-700 dark:text-zinc-300">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Next Steps
                    </p>
                    <ul className="space-y-1">
                      {update.nextSteps.map((item, i) => (
                        <li key={i} className="text-sm text-zinc-700 dark:text-zinc-300">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {(update.blockers.length > 0 || update.asks.length > 0) && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {update.blockers.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-500">
                          Blockers
                        </p>
                        <ul className="space-y-1">
                          {update.blockers.map((item, i) => (
                            <li key={i} className="text-sm text-red-700 dark:text-red-400">
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {update.asks.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-600">
                          Asks
                        </p>
                        <ul className="space-y-1">
                          {update.asks.map((item, i) => (
                            <li key={i} className="text-sm text-amber-700 dark:text-amber-400">
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-zinc-500">
                No update logged for this track this week.
              </p>
            )}
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
