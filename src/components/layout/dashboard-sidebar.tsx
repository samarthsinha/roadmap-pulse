"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  Database,
  FileText,
  LayoutDashboard,
  Map,
  Users,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/l0", label: "L0 Leadership", icon: BarChart3 },
  { href: "/dashboard/l1", label: "L1 Weekly Tracker", icon: CalendarCheck },
  { href: "/dashboard/tracks", label: "Track Planner", icon: Map },
  { href: "/dashboard/skills", label: "Skills Matrix", icon: Users },
  { href: "/dashboard/capacity", label: "Capacity", icon: Activity },
  { href: "/dashboard/risks", label: "Risks & Blockers", icon: AlertTriangle },
  { href: "/dashboard/summary", label: "Weekly Summary", icon: FileText },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
  { href: "/dashboard/data", label: "Import / Export", icon: Database },
  { href: "/dashboard/health", label: "Engineering Health", icon: Activity },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-5 py-5 dark:border-zinc-800">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Engineering OS
        </p>
        <h1 className="mt-1 text-lg font-bold">EM Dashboard</h1>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
