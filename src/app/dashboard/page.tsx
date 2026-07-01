import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, PageHeader, StatCard } from "@/components/dashboard/common";
import { getDataSourceLabel, getPortfolioStats } from "@/lib/db/queries";
import { getAlertSummary } from "@/lib/status/alerts";
import { formatWeekStart, getCurrentWeekStart } from "@/lib/db/types";
import { ArrowRight } from "lucide-react";

const modules = [
  { href: "/dashboard/l0", title: "L0 Leadership", desc: "Progress, risks, confidence, asks" },
  { href: "/dashboard/l1", title: "L1 Weekly Tracker", desc: "EM / PM / Lead execution" },
  { href: "/dashboard/tracks", title: "Track Planner", desc: "Skills, effort, ownership" },
  { href: "/dashboard/skills", title: "Skills Matrix", desc: "Engineer skill heatmap" },
  { href: "/dashboard/capacity", title: "Capacity", desc: "Allocation and overload" },
  { href: "/dashboard/risks", title: "Risks & Blockers", desc: "Register and aging" },
  { href: "/dashboard/summary", title: "Weekly Summary", desc: "L0 + L1 markdown export" },
  { href: "/dashboard/alerts", title: "Operational Alerts", desc: "Stale updates, risks, blockers" },
  { href: "/dashboard/data", title: "Import / Export", desc: "CSV data management" },
  { href: "/dashboard/health", title: "Engineering Health", desc: "DORA + SPACE metrics" },
];

export default async function DashboardHomePage() {
  const [stats, dataSource, alertSummary] = await Promise.all([
    getPortfolioStats(),
    getDataSourceLabel(),
    getAlertSummary(),
  ]);
  const week = formatWeekStart(getCurrentWeekStart());

  return (
    <DashboardShell>
      <PageHeader
        title="Roadmap Pulse"
        description="Plan → Execute → Report → Improve. Your engineering operating rhythm in one place."
        badge={`Week of ${week}`}
      />

      {dataSource === "fallback" && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
          Using demo data. Start PostgreSQL with{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">
            docker compose up -d
          </code>{" "}
          then run{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">
            npx prisma migrate dev && npx prisma db seed
          </code>
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Initiatives" value={stats.initiativeCount} />
        <StatCard label="Green Tracks" value={stats.greenCount} sub="on track" />
        <StatCard label="Amber / Red" value={stats.amberCount + stats.redCount} sub="need attention" />
        <StatCard label="Open Asks" value={stats.leadershipAsks.length} />
        <StatCard label="Alerts" value={alertSummary.total} sub={`${alertSummary.critical} critical`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => (
          <Link key={mod.href} href={mod.href} className="group">
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold group-hover:text-zinc-600">{mod.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{mod.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-1" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
