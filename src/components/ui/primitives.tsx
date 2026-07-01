import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  badge,
  actions,
}: {
  title: string;
  description?: string;
  badge?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {title}
          </h1>
          {badge && (
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-zinc-500">{description}</p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  trend,
  className,
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "flat";
  className?: string;
}) {
  const trendColor =
    trend === "up"
      ? "text-emerald-600"
      : trend === "down"
        ? "text-red-600"
        : "text-zinc-400";

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
      <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
      {sub && (
        <p className={cn("mt-1 text-xs", trend ? trendColor : "text-zinc-500")}>
          {sub}
        </p>
      )}
    </div>
  );
}

const badgeVariants = {
  default: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  danger: "bg-red-500/15 text-red-700 dark:text-red-400",
  info: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
} as const;

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: keyof typeof badgeVariants;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        badgeVariants[variant],
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className,
  title,
  action,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          {title && (
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const color =
    value >= 70
      ? "bg-emerald-500"
      : value >= 40
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800",
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full transition-all", color)}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="py-8 text-center text-sm text-zinc-500">{message}</p>
  );
}
