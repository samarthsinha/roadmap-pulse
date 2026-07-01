import { CONFIDENCE_LABELS, STATUS_LABELS, statusVariant } from "@/lib/db/types";
import type { Confidence, Status } from "@prisma/client";
import { cn } from "@/lib/utils";

const variantStyles = {
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  danger: "bg-red-500/15 text-red-700 dark:text-red-400",
  info: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  default: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
} as const;

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: keyof typeof variantStyles;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        variantStyles[variant],
      )}
    >
      {children}
    </span>
  );
}

export { statusVariant };

export function StatusBadge({ status }: { status: Status }) {
  return <Badge variant={statusVariant(status)}>{STATUS_LABELS[status]}</Badge>;
}

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const variant =
    confidence === "HIGH"
      ? "success"
      : confidence === "MEDIUM"
        ? "warning"
        : "danger";
  return (
    <Badge variant={variant}>{CONFIDENCE_LABELS[confidence]}</Badge>
  );
}

export { STATUS_LABELS, CONFIDENCE_LABELS };
