import type {
  Blocker,
  Confidence,
  Engineer,
  EngineerSkill,
  Initiative,
  Risk,
  Severity,
  Skill,
  Status,
  Track,
  TrackSkillRequirement,
  WeeklyStatus,
} from "@prisma/client";

export type TrackWithRelations = Track & {
  initiative: Initiative;
  skillRequirements: (TrackSkillRequirement & { skill: Skill })[];
  weeklyStatuses: WeeklyStatus[];
  risks: Risk[];
  blockers: Blocker[];
};

export type EngineerWithSkills = Engineer & {
  skills: (EngineerSkill & { skill: Skill })[];
};

export type WeeklyStatusWithTrack = WeeklyStatus & {
  track: Track & { initiative: Initiative };
};

export type InitiativeWithTracks = Initiative & {
  tracks: Track[];
};

export const STATUS_LABELS: Record<Status, string> = {
  GREEN: "Green",
  AMBER: "Amber",
  RED: "Red",
  BLUE: "Blue",
  GREY: "Grey",
};

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export const SEVERITY_ORDER: Record<Severity, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export function statusVariant(
  status: Status,
): "success" | "warning" | "danger" | "info" | "default" {
  switch (status) {
    case "GREEN":
      return "success";
    case "AMBER":
      return "warning";
    case "RED":
      return "danger";
    case "BLUE":
      return "info";
    default:
      return "default";
  }
}

export function getCurrentWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function formatWeekStart(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function blockerAgeDays(blockedSince: Date): number {
  return Math.floor(
    (Date.now() - blockedSince.getTime()) / (1000 * 60 * 60 * 24),
  );
}

export function isBlockerStale(blockedSince: Date, thresholdDays = 7): boolean {
  return blockerAgeDays(blockedSince) >= thresholdDays;
}
