import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, PageHeader, ProgressBar } from "@/components/dashboard/common";
import { Badge } from "@/components/dashboard/status-badge";
import { getEngineersWithSkills, getTracksWithRelations } from "@/lib/db/queries";

export default async function CapacityPage() {
  const engineers = await getEngineersWithSkills();
  const tracks = await getTracksWithRelations().then((t) =>
    t.filter((tr) => tr.status === "GREEN" || tr.status === "AMBER" || tr.status === "RED"),
  );

  const trackAllocation = tracks.map((track) => ({
    name: track.name,
    effortDays: track.effortEstimateDays,
    em: track.ownerEm,
  }));

  const overloaded = engineers.filter((e) => e.availabilityPercentage < 80);
  const underutilized = engineers.filter((e) => e.availabilityPercentage >= 90);

  return (
    <DashboardShell>
      <PageHeader
        title="Capacity Planning"
        description="Engineer availability, track allocation, and overload signals."
        badge="Planning"
      />

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border p-5">
          <p className="text-xs uppercase text-zinc-500">Engineers</p>
          <p className="mt-1 text-2xl font-bold">{engineers.length}</p>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-xs uppercase text-zinc-500">Overloaded (&lt;80% avail)</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{overloaded.length}</p>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-xs uppercase text-zinc-500">Available capacity</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {underutilized.length}
          </p>
        </div>
      </div>

      <Card title="Engineer Availability" className="mb-8">
        <div className="space-y-4">
          {engineers.map((engineer) => (
            <div key={engineer.id}>
              <div className="mb-1 flex justify-between text-sm">
                <div>
                  <span className="font-medium">{engineer.name}</span>
                  <span className="ml-2 text-xs text-zinc-500">
                    {engineer.role} · {engineer.level}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {engineer.availabilityPercentage < 80 && (
                    <Badge variant="danger">Overloaded</Badge>
                  )}
                  <span className="text-zinc-500">
                    {engineer.availabilityPercentage}% available
                  </span>
                </div>
              </div>
              <ProgressBar value={engineer.availabilityPercentage} />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Track Effort Allocation">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase text-zinc-500">
              <th className="pb-3 font-medium">Track</th>
              <th className="pb-3 font-medium">EM Owner</th>
              <th className="pb-3 font-medium">Est. Days</th>
            </tr>
          </thead>
          <tbody>
            {trackAllocation.map((row) => (
              <tr key={row.name} className="border-b border-zinc-50">
                <td className="py-2.5 font-medium">{row.name}</td>
                <td className="py-2.5 text-zinc-600">{row.em}</td>
                <td className="py-2.5">{row.effortDays}d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </DashboardShell>
  );
}
