import { AppShell } from "@/components/layout/app-shell";
import {
  Badge,
  Card,
  PageHeader,
  ProgressBar,
  StatCard,
} from "@/components/ui/primitives";
import {
  getCapacitySnapshots,
  getOwnershipMatrix,
  getTeamCapacitySummary,
  getTotalEffortByQuarter,
  getTrackPlanningViews,
} from "@/lib/metrics/planning";
import { cn, statusColors } from "@/lib/utils";

export default function TrackPlanningPage() {
  const views = getTrackPlanningViews();
  const capacity = getTeamCapacitySummary();
  const snapshots = getCapacitySnapshots();
  const ownership = getOwnershipMatrix();
  const effortByQuarter = getTotalEffortByQuarter();

  return (
    <AppShell>
      <PageHeader
        title="Track Planning"
        description="Skills coverage, effort sizing, capacity allocation, and ownership matrix — the foundation of every quarter."
        badge="Planning Layer"
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Team Utilization"
          value={`${capacity.utilization}%`}
          sub={`${capacity.totalAllocated}/${capacity.totalCapacity} pts allocated`}
          trend={capacity.utilization > 100 ? "down" : "up"}
        />
        <StatCard
          label="Over-allocated"
          value={capacity.overAllocated.length}
          sub="people above 100%"
          trend={capacity.overAllocated.length > 0 ? "down" : "flat"}
        />
        <StatCard
          label="Active Tracks"
          value={views.filter((v) => v.track.status === "active").length}
          sub="in execution"
        />
        <StatCard
          label="Skill Gaps"
          value={views.reduce((s, v) => s + v.capacityGap, 0)}
          sub="across all tracks"
          trend={
            views.some((v) => v.capacityGap > 0) ? "down" : "flat"
          }
        />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card title="Capacity by Engineer">
          <div className="space-y-4">
            {snapshots.map((person) => (
              <div key={person.personId}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{person.personName}</span>
                    <span className="ml-2 text-xs text-zinc-500">
                      {person.team}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      person.utilization > 100
                        ? "text-red-600"
                        : person.utilization > 85
                          ? "text-amber-600"
                          : "text-zinc-500",
                    )}
                  >
                    {person.allocated}/{person.capacity} pts ({person.utilization}
                    %)
                  </span>
                </div>
                <ProgressBar value={Math.min(person.utilization, 100)} />
                <div className="mt-1 flex flex-wrap gap-1">
                  {person.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Effort by Quarter">
          <div className="space-y-4">
            {Object.entries(effortByQuarter).map(([quarter, points]) => (
              <div key={quarter}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{quarter}</span>
                  <span className="text-zinc-500">{points} effort pts</span>
                </div>
                <ProgressBar
                  value={Math.min(100, (points / 120) * 100)}
                />
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Effort points represent estimated engineering capacity required per
            track. Compare against team capacity to validate feasibility.
          </p>
        </Card>
      </div>

      <Card title="Ownership Matrix" className="mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                <th className="pb-3 pr-4 font-medium">Track</th>
                <th className="pb-3 pr-4 font-medium">EM</th>
                <th className="pb-3 pr-4 font-medium">Lead</th>
                <th className="pb-3 pr-4 font-medium">PM</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {ownership.map((row) => (
                <tr
                  key={row.trackId}
                  className="border-b border-zinc-50 dark:border-zinc-800/50"
                >
                  <td className="py-3 pr-4 font-medium">{row.trackName}</td>
                  <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">
                    {row.em}
                  </td>
                  <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">
                    {row.lead}
                  </td>
                  <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">
                    {row.pm}
                  </td>
                  <td className="py-3">
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                        statusColors[row.status as keyof typeof statusColors],
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Track Detail — Skills & Effort</h2>
        {views.map(({ track, owner, lead, pm, skillCoverage, capacityGap }) => (
          <Card key={track.id}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{track.name}</h3>
                <p className="mt-1 text-sm text-zinc-500">{track.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="info">{track.quarter}</Badge>
                <Badge>{track.effortPoints} pts</Badge>
                {capacityGap > 0 && (
                  <Badge variant="danger">{capacityGap} skill gap(s)</Badge>
                )}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-zinc-500">EM Owner</p>
                <p className="font-medium">{owner.name}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Tech Lead</p>
                <p className="font-medium">{lead.name}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">PM</p>
                <p className="font-medium">{pm.name}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                    <th className="pb-2 pr-4 font-medium">Skill</th>
                    <th className="pb-2 pr-4 font-medium">Required</th>
                    <th className="pb-2 pr-4 font-medium">Available</th>
                    <th className="pb-2 font-medium">Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {skillCoverage.map((row) => (
                    <tr key={row.skill}>
                      <td className="py-2 pr-4 font-medium">{row.skill}</td>
                      <td className="py-2 pr-4">{row.required}</td>
                      <td className="py-2 pr-4">{row.available}</td>
                      <td className="py-2">
                        {row.gap > 0 ? (
                          <Badge variant="danger">-{row.gap}</Badge>
                        ) : (
                          <Badge variant="success">OK</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
