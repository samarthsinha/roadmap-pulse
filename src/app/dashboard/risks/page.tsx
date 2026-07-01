import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, PageHeader } from "@/components/dashboard/common";
import { Badge } from "@/components/dashboard/status-badge";
import { getOpenBlockers, getOpenRisks } from "@/lib/db/queries";
import { blockerAgeDays, isBlockerStale, SEVERITY_ORDER } from "@/lib/db/types";

export default async function RisksPage() {
  const risks = await getOpenRisks();
  const blockers = await getOpenBlockers();

  const sortedRisks = [...risks].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );

  const sortedBlockers = [...blockers].sort(
    (a, b) => b.blockedSince.getTime() - a.blockedSince.getTime(),
  );

  const escalationBlockers = sortedBlockers.filter(
    (b) => b.escalationNeeded || isBlockerStale(b.blockedSince),
  );

  return (
    <DashboardShell>
      <PageHeader
        title="Risks & Blockers"
        description="Open register with severity, aging, and escalation indicators."
        badge={`${risks.length} risks · ${blockers.length} blockers`}
      />

      {escalationBlockers.length > 0 && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {escalationBlockers.length} blocker(s) need escalation (7+ days or flagged)
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <Card title="Open Risks">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-zinc-500">
                <th className="pb-3 font-medium">Risk</th>
                <th className="pb-3 font-medium">Severity</th>
                <th className="pb-3 font-medium">Owner</th>
                <th className="pb-3 font-medium">Due</th>
              </tr>
            </thead>
            <tbody>
              {sortedRisks.map((risk) => (
                <tr key={risk.id} className="border-b border-zinc-50 align-top">
                  <td className="py-3">
                    <p>{risk.title}</p>
                    <p className="text-xs text-zinc-500">{risk.track.name}</p>
                    {risk.mitigation && (
                      <p className="mt-1 text-xs text-zinc-400">
                        Mitigation: {risk.mitigation}
                      </p>
                    )}
                  </td>
                  <td className="py-3">
                    <Badge
                      variant={
                        risk.severity === "CRITICAL" || risk.severity === "HIGH"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {risk.severity}
                    </Badge>
                  </td>
                  <td className="py-3 text-zinc-600">{risk.owner}</td>
                  <td className="py-3 text-xs text-zinc-500">
                    {risk.dueDate?.toISOString().slice(0, 10) ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Open Blockers">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-zinc-500">
                <th className="pb-3 font-medium">Blocker</th>
                <th className="pb-3 font-medium">Age</th>
                <th className="pb-3 font-medium">Owner</th>
                <th className="pb-3 font-medium">Escalate</th>
              </tr>
            </thead>
            <tbody>
              {sortedBlockers.map((blocker) => {
                const age = blockerAgeDays(blocker.blockedSince);
                const escalate =
                  blocker.escalationNeeded || isBlockerStale(blocker.blockedSince);
                return (
                  <tr key={blocker.id} className="border-b border-zinc-50 align-top">
                    <td className="py-3">
                      <p>{blocker.title}</p>
                      <p className="text-xs text-zinc-500">{blocker.track.name}</p>
                    </td>
                    <td className="py-3">
                      <span className={age >= 7 ? "font-medium text-red-600" : ""}>
                        {age}d
                      </span>
                    </td>
                    <td className="py-3 text-zinc-600">{blocker.owner}</td>
                    <td className="py-3">
                      {escalate ? (
                        <Badge variant="danger">Yes</Badge>
                      ) : (
                        <span className="text-zinc-400">No</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </DashboardShell>
  );
}
