import { z } from "zod";

export const statusEnum = z.enum(["GREEN", "AMBER", "RED", "BLUE", "GREY"]);

export const weeklyStatusFormSchema = z.object({
  id: z.string().optional(),
  trackId: z.string().min(1, "Track is required"),
  weekStartDate: z.string().min(1, "Week is required"),
  status: statusEnum,
  progressUpdate: z.string().optional(),
  progressPercentage: z.coerce.number().min(0).max(100),
  completedThisWeek: z.string().optional(),
  plannedNextWeek: z.string().optional(),
  risks: z.string().optional(),
  blockers: z.string().optional(),
  decisionsNeeded: z.string().optional(),
  leadershipAsk: z.string().optional(),
  updatedBy: z.string().min(1, "Updated by is required"),
});

export type WeeklyStatusFormInput = z.infer<typeof weeklyStatusFormSchema>;

export const trackFormSchema = z.object({
  id: z.string().optional(),
  initiativeId: z.string().min(1, "Initiative is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  ownerEm: z.string().min(1, "EM owner is required"),
  ownerPm: z.string().min(1, "PM owner is required"),
  techLead: z.string().min(1, "Tech lead is required"),
  status: statusEnum,
  progressPercentage: z.coerce.number().min(0).max(100),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
  targetDate: z.string().min(1, "Target date is required"),
  effortEstimateDays: z.coerce.number().min(1),
});

export type TrackFormInput = z.infer<typeof trackFormSchema>;

/** Split newline-or-comma-separated text into trimmed non-empty strings */
export function parseListField(value?: string): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Join array back to newline-separated text for form textarea */
export function formatListField(items: string[]): string {
  return items.join("\n");
}
