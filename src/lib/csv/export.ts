import {
  getEngineersWithSkills,
  getInitiativesWithTracks,
  getSkills,
  getTracksWithRelations,
  getWeeklyStatuses,
} from "@/lib/db/queries";
import { joinList, rowsToCsv } from "@/lib/csv/utils";
import { formatWeekStart, getCurrentWeekStart } from "@/lib/db/types";
import type { ImportType } from "@/lib/validations/csv";

export async function exportCsv(type: ImportType, weekStart?: Date): Promise<string> {
  switch (type) {
    case "engineers":
      return exportEngineers();
    case "engineer-skills":
      return exportEngineerSkills();
    case "tracks":
      return exportTracks();
    case "weekly-statuses":
      return exportWeeklyStatuses(weekStart ?? getCurrentWeekStart());
    case "skills":
      return exportSkills();
    default:
      throw new Error(`Unknown export type: ${type}`);
  }
}

async function exportEngineers() {
  const engineers = await getEngineersWithSkills();
  return rowsToCsv(
    ["name", "role", "level", "manager", "availability_percentage", "location"],
    engineers.map((e) => [
      e.name,
      e.role,
      e.level,
      e.manager ?? "",
      e.availabilityPercentage,
      e.location ?? "",
    ]),
  );
}

async function exportEngineerSkills() {
  const engineers = await getEngineersWithSkills();
  const rows: (string | number)[][] = [];
  for (const eng of engineers) {
    for (const es of eng.skills) {
      rows.push([eng.name, es.skill.name, es.rating]);
    }
  }
  return rowsToCsv(["engineer_name", "skill_name", "rating"], rows);
}

async function exportTracks() {
  const tracks = await getTracksWithRelations();
  return rowsToCsv(
    [
      "initiative_name",
      "name",
      "description",
      "owner_em",
      "owner_pm",
      "tech_lead",
      "status",
      "progress_percentage",
      "confidence",
      "target_date",
      "effort_estimate_days",
    ],
    tracks.map((t) => [
      t.initiative.name,
      t.name,
      t.description ?? "",
      t.ownerEm,
      t.ownerPm,
      t.techLead,
      t.status,
      t.progressPercentage,
      t.confidence,
      t.targetDate.toISOString().slice(0, 10),
      t.effortEstimateDays,
    ]),
  );
}

async function exportWeeklyStatuses(weekStart: Date) {
  const statuses = await getWeeklyStatuses(weekStart);
  return rowsToCsv(
    [
      "track_name",
      "week_start_date",
      "status",
      "progress_percentage",
      "progress_update",
      "completed_this_week",
      "planned_next_week",
      "risks",
      "blockers",
      "decisions_needed",
      "leadership_ask",
      "updated_by",
    ],
    statuses.map((ws) => [
      ws.track.name,
      formatWeekStart(ws.weekStartDate),
      ws.status,
      ws.track.progressPercentage,
      ws.progressUpdate ?? "",
      joinList(ws.completedThisWeek),
      joinList(ws.plannedNextWeek),
      joinList(ws.risks),
      joinList(ws.blockers),
      joinList(ws.decisionsNeeded),
      ws.leadershipAsk ?? "",
      ws.updatedBy,
    ]),
  );
}

async function exportSkills() {
  const skills = await getSkills();
  return rowsToCsv(
    ["name", "category"],
    skills.map((s) => [s.name, s.category]),
  );
}

export const EXPORT_FILENAMES: Record<ImportType, string> = {
  engineers: "engineers.csv",
  "engineer-skills": "engineer-skills.csv",
  tracks: "tracks.csv",
  "weekly-statuses": "weekly-statuses.csv",
  skills: "skills.csv",
};
