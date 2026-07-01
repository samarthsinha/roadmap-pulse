import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatWeek(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export const statusColors = {
  "on-track": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  "at-risk": "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  blocked: "bg-red-500/15 text-red-700 dark:text-red-400",
  active: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  planning: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  complete: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
} as const;

export const confidenceColors = {
  high: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  low: "text-red-600 dark:text-red-400",
} as const;

export const severityColors = {
  critical: "border-red-500/40 bg-red-500/10",
  warning: "border-amber-500/40 bg-amber-500/10",
  info: "border-blue-500/40 bg-blue-500/10",
} as const;

export const doraRatingColors = {
  elite: "text-emerald-600 dark:text-emerald-400",
  high: "text-blue-600 dark:text-blue-400",
  medium: "text-amber-600 dark:text-amber-400",
  low: "text-red-600 dark:text-red-400",
} as const;
