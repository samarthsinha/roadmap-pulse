"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bot,
  CalendarCheck,
  LayoutDashboard,
  Map,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/track-planning", label: "Track Planning", icon: Map },
  { href: "/execution", label: "Weekly Execution", icon: CalendarCheck },
  { href: "/leadership", label: "Leadership L0", icon: Zap },
  { href: "/health", label: "Engineering Health", icon: Activity },
  { href: "/automation", label: "Automation", icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-5 py-5 dark:border-zinc-800">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Engineering OS
        </p>
        <h1 className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          EM Lead System
        </h1>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-xs text-zinc-500">
          Plan → Execute → Report → Improve
        </p>
      </div>
    </aside>
  );
}
