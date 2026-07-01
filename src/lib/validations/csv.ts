import { z } from "zod";
import { statusEnum } from "@/lib/validations/dashboard";

export const engineerCsvRowSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  level: z.string().min(1),
  manager: z.string().optional(),
  availability_percentage: z.coerce.number().min(0).max(100),
  location: z.string().optional(),
});

export const engineerSkillCsvRowSchema = z.object({
  engineer_name: z.string().min(1),
  skill_name: z.string().min(1),
  rating: z.coerce.number().min(1).max(5),
});

export const trackCsvRowSchema = z.object({
  initiative_name: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  owner_em: z.string().min(1),
  owner_pm: z.string().min(1),
  tech_lead: z.string().min(1),
  status: statusEnum,
  progress_percentage: z.coerce.number().min(0).max(100),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
  target_date: z.string().min(1),
  effort_estimate_days: z.coerce.number().min(1),
});

export const weeklyStatusCsvRowSchema = z.object({
  track_name: z.string().min(1),
  week_start_date: z.string().min(1),
  status: statusEnum,
  progress_percentage: z.coerce.number().min(0).max(100),
  progress_update: z.string().optional(),
  completed_this_week: z.string().optional(),
  planned_next_week: z.string().optional(),
  risks: z.string().optional(),
  blockers: z.string().optional(),
  decisions_needed: z.string().optional(),
  leadership_ask: z.string().optional(),
  updated_by: z.string().min(1),
});

export const skillCsvRowSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
});

export type ImportType =
  | "engineers"
  | "engineer-skills"
  | "tracks"
  | "weekly-statuses"
  | "skills";
