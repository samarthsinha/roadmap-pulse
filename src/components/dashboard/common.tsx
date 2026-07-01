import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  badge,
}: {
  title: string;
  description?: string;
  badge?: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {badge && (
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800">
            {badge}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-1.5 max-w-3xl text-sm text-zinc-500">{description}</p>
      )}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}

export function Card({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
    >
      {title && (
        <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const color =
    value >= 70 ? "bg-emerald-500" : value >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
      <div
        className={cn("h-full rounded-full", color)}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="py-6 text-center text-sm text-zinc-500">{message}</p>;
}
