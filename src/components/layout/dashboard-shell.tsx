import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-zinc-950">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
