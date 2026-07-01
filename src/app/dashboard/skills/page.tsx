import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, PageHeader } from "@/components/dashboard/common";
import { Badge } from "@/components/dashboard/status-badge";
import { getEngineersWithSkills, getSkills } from "@/lib/db/queries";

function ratingColor(rating: number): string {
  if (rating >= 4) return "bg-emerald-500 text-white";
  if (rating >= 3) return "bg-blue-400 text-white";
  if (rating >= 2) return "bg-amber-400 text-white";
  if (rating >= 1) return "bg-orange-300 text-zinc-900";
  return "bg-zinc-100 text-zinc-400";
}

export default async function SkillsPage() {
  const skills = await getSkills();
  const engineers = await getEngineersWithSkills();

  const expertsBySkill = skills.map((skill) => ({
    skill: skill.name,
    experts: engineers.filter((e) => {
      const es = e.skills.find((s) => s.skillId === skill.id);
      return (es?.rating ?? 0) >= 4;
    }),
  }));

  return (
    <DashboardShell>
      <PageHeader
        title="Skills Matrix"
        description="Engineer skill heatmap, gap analysis, and expert lookup."
        badge="Planning"
      />

      <Card title="Engineer × Skill Heatmap" className="mb-8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-3 pr-4 text-left text-xs uppercase text-zinc-500">
                  Engineer
                </th>
                {skills.map((skill) => (
                  <th
                    key={skill.id}
                    className="pb-3 px-1 text-center text-xs font-medium text-zinc-500"
                  >
                    {skill.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {engineers.map((engineer) => (
                <tr key={engineer.id} className="border-b border-zinc-50">
                  <td className="py-2 pr-4 font-medium">{engineer.name}</td>
                  {skills.map((skill) => {
                    const es = engineer.skills.find((s) => s.skillId === skill.id);
                    const rating = es?.rating ?? 0;
                    return (
                      <td key={skill.id} className="px-1 py-2 text-center">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded text-xs font-medium ${ratingColor(rating)}`}
                        >
                          {rating || "—"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-zinc-500">
          Rating: 1 = support · 2 = guided · 3 = independent · 4 = strong · 5 = expert
        </p>
      </Card>

      <Card title="Experts by Skill">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {expertsBySkill.map(({ skill, experts }) => (
            <div
              key={skill}
              className="rounded-lg border border-zinc-100 p-4 dark:border-zinc-800"
            >
              <h3 className="font-medium">{skill}</h3>
              {experts.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {experts.map((e) => {
                    const rating =
                      e.skills.find((s) => s.skill.name === skill)?.rating ?? 0;
                    return (
                      <li key={e.id} className="flex justify-between text-sm">
                        <span>{e.name}</span>
                        <Badge variant="success">{rating}</Badge>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-zinc-500">No experts (rating ≥ 4)</p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </DashboardShell>
  );
}
