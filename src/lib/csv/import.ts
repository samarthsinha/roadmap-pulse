import { isDatabaseAvailable, prisma } from "@/lib/db/prisma";
import {
  createFallbackTrack,
  getFallbackInitiatives,
  getFallbackTracks,
  upsertFallbackEngineer,
  upsertFallbackEngineerSkill,
  upsertFallbackSkill,
  upsertFallbackWeeklyStatus,
  updateFallbackTrack,
} from "@/lib/db/fallback-store";
import { csvToObjects, splitList } from "@/lib/csv/utils";
import { upsertWeeklyStatus } from "@/lib/db/mutations";
import {
  engineerCsvRowSchema,
  engineerSkillCsvRowSchema,
  skillCsvRowSchema,
  trackCsvRowSchema,
  weeklyStatusCsvRowSchema,
  type ImportType,
} from "@/lib/validations/csv";
import type { Status } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
}

function revalidateAll() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/l0");
  revalidatePath("/dashboard/l1");
  revalidatePath("/dashboard/tracks");
  revalidatePath("/dashboard/skills");
  revalidatePath("/dashboard/capacity");
  revalidatePath("/dashboard/data");
  revalidatePath("/dashboard/alerts");
}

export async function importCsv(
  type: ImportType,
  csvText: string,
): Promise<ImportResult> {
  const objects = csvToObjects(csvText);
  if (objects.length === 0) {
    return { success: false, imported: 0, errors: ["CSV is empty or has no data rows"] };
  }

  switch (type) {
    case "engineers":
      return importEngineers(objects);
    case "engineer-skills":
      return importEngineerSkills(objects);
    case "tracks":
      return importTracks(objects);
    case "weekly-statuses":
      return importWeeklyStatuses(objects);
    case "skills":
      return importSkills(objects);
    default:
      return { success: false, imported: 0, errors: ["Unknown import type"] };
  }
}

async function importEngineers(
  rows: Record<string, string>[],
): Promise<ImportResult> {
  const errors: string[] = [];
  let imported = 0;
  const dbAvailable = await isDatabaseAvailable();

  for (let i = 0; i < rows.length; i++) {
    const parsed = engineerCsvRowSchema.safeParse(rows[i]);
    if (!parsed.success) {
      errors.push(`Row ${i + 2}: ${parsed.error.issues[0]?.message}`);
      continue;
    }
    const d = parsed.data;

    try {
      if (dbAvailable) {
        const existing = await prisma.engineer.findFirst({ where: { name: d.name } });
        if (existing) {
          await prisma.engineer.update({
            where: { id: existing.id },
            data: {
              role: d.role,
              level: d.level,
              manager: d.manager || null,
              availabilityPercentage: d.availability_percentage,
              location: d.location || null,
            },
          });
        } else {
          await prisma.engineer.create({
            data: {
              name: d.name,
              role: d.role,
              level: d.level,
              manager: d.manager || null,
              availabilityPercentage: d.availability_percentage,
              location: d.location || null,
            },
          });
        }
      } else {
        upsertFallbackEngineer({
          name: d.name,
          role: d.role,
          level: d.level,
          manager: d.manager || null,
          availabilityPercentage: d.availability_percentage,
          location: d.location || null,
        });
      }
      imported++;
    } catch (e) {
      errors.push(`Row ${i + 2}: ${e instanceof Error ? e.message : "Failed"}`);
    }
  }

  if (imported > 0) revalidateAll();
  return { success: errors.length === 0, imported, errors };
}

async function importEngineerSkills(
  rows: Record<string, string>[],
): Promise<ImportResult> {
  const errors: string[] = [];
  let imported = 0;
  const dbAvailable = await isDatabaseAvailable();

  for (let i = 0; i < rows.length; i++) {
    const parsed = engineerSkillCsvRowSchema.safeParse(rows[i]);
    if (!parsed.success) {
      errors.push(`Row ${i + 2}: ${parsed.error.issues[0]?.message}`);
      continue;
    }
    const d = parsed.data;

    try {
      if (dbAvailable) {
        const engineer = await prisma.engineer.findFirst({ where: { name: d.engineer_name } });
        const skill = await prisma.skill.findFirst({ where: { name: d.skill_name } });
        if (!engineer) {
          errors.push(`Row ${i + 2}: Engineer "${d.engineer_name}" not found`);
          continue;
        }
        if (!skill) {
          errors.push(`Row ${i + 2}: Skill "${d.skill_name}" not found`);
          continue;
        }
        await prisma.engineerSkill.upsert({
          where: { engineerId_skillId: { engineerId: engineer.id, skillId: skill.id } },
          create: { engineerId: engineer.id, skillId: skill.id, rating: d.rating },
          update: { rating: d.rating },
        });
      } else {
        const ok = upsertFallbackEngineerSkill(d.engineer_name, d.skill_name, d.rating);
        if (!ok) {
          errors.push(`Row ${i + 2}: Engineer or skill not found`);
          continue;
        }
      }
      imported++;
    } catch (e) {
      errors.push(`Row ${i + 2}: ${e instanceof Error ? e.message : "Failed"}`);
    }
  }

  if (imported > 0) revalidateAll();
  return { success: errors.length === 0, imported, errors };
}

async function importTracks(
  rows: Record<string, string>[],
): Promise<ImportResult> {
  const errors: string[] = [];
  let imported = 0;
  const dbAvailable = await isDatabaseAvailable();

  for (let i = 0; i < rows.length; i++) {
    const parsed = trackCsvRowSchema.safeParse(rows[i]);
    if (!parsed.success) {
      errors.push(`Row ${i + 2}: ${parsed.error.issues[0]?.message}`);
      continue;
    }
    const d = parsed.data;

    try {
      if (dbAvailable) {
        const initiative = await prisma.initiative.findFirst({
          where: { name: d.initiative_name },
        });
        if (!initiative) {
          errors.push(`Row ${i + 2}: Initiative "${d.initiative_name}" not found`);
          continue;
        }
        const existing = await prisma.track.findFirst({ where: { name: d.name } });
        const data = {
          initiativeId: initiative.id,
          name: d.name,
          description: d.description || null,
          ownerEm: d.owner_em,
          ownerPm: d.owner_pm,
          techLead: d.tech_lead,
          status: d.status as Status,
          progressPercentage: d.progress_percentage,
          confidence: d.confidence,
          targetDate: new Date(d.target_date),
          effortEstimateDays: d.effort_estimate_days,
        };
        if (existing) {
          await prisma.track.update({ where: { id: existing.id }, data });
        } else {
          await prisma.track.create({ data: { ...data, startDate: null, actualEffortDays: null } });
        }
      } else {
        const initiative = getFallbackInitiatives().find(
          (init) => init.name === d.initiative_name,
        );
        if (!initiative) {
          errors.push(`Row ${i + 2}: Initiative "${d.initiative_name}" not found`);
          continue;
        }
        const existing = getFallbackTracks().find((t) => t.name === d.name);
        const trackData = {
          initiativeId: initiative.id,
          name: d.name,
          description: d.description || null,
          ownerEm: d.owner_em,
          ownerPm: d.owner_pm,
          techLead: d.tech_lead,
          status: d.status as Status,
          progressPercentage: d.progress_percentage,
          confidence: d.confidence,
          targetDate: new Date(d.target_date),
          effortEstimateDays: d.effort_estimate_days,
          startDate: null,
          actualEffortDays: null,
        };
        if (existing) {
          updateFallbackTrack(existing.id, trackData);
        } else {
          createFallbackTrack(trackData);
        }
      }
      imported++;
    } catch (e) {
      errors.push(`Row ${i + 2}: ${e instanceof Error ? e.message : "Failed"}`);
    }
  }

  if (imported > 0) revalidateAll();
  return { success: errors.length === 0, imported, errors };
}

async function importWeeklyStatuses(
  rows: Record<string, string>[],
): Promise<ImportResult> {
  const errors: string[] = [];
  let imported = 0;

  for (let i = 0; i < rows.length; i++) {
    const parsed = weeklyStatusCsvRowSchema.safeParse(rows[i]);
    if (!parsed.success) {
      errors.push(`Row ${i + 2}: ${parsed.error.issues[0]?.message}`);
      continue;
    }
    const d = parsed.data;
    const dbAvailable = await isDatabaseAvailable();

    try {
      let trackId: string | undefined;
      if (dbAvailable) {
        const track = await prisma.track.findFirst({ where: { name: d.track_name } });
        trackId = track?.id;
      } else {
        trackId = getFallbackTracks().find((t) => t.name === d.track_name)?.id;
      }
      if (!trackId) {
        errors.push(`Row ${i + 2}: Track "${d.track_name}" not found`);
        continue;
      }

      if (dbAvailable) {
        const result = await upsertWeeklyStatus({
          trackId,
          weekStartDate: d.week_start_date,
          status: d.status,
          progressPercentage: d.progress_percentage,
          progressUpdate: d.progress_update,
          completedThisWeek: splitList(d.completed_this_week).join("\n"),
          plannedNextWeek: splitList(d.planned_next_week).join("\n"),
          risks: splitList(d.risks).join("\n"),
          blockers: splitList(d.blockers).join("\n"),
          decisionsNeeded: splitList(d.decisions_needed).join("\n"),
          leadershipAsk: d.leadership_ask,
          updatedBy: d.updated_by,
        });
        if (!result.success) {
          errors.push(`Row ${i + 2}: ${result.error}`);
          continue;
        }
      } else {
        upsertFallbackWeeklyStatus({
          trackId,
          weekStartDate: new Date(d.week_start_date),
          status: d.status as Status,
          progressUpdate: d.progress_update || null,
          completedThisWeek: splitList(d.completed_this_week),
          plannedNextWeek: splitList(d.planned_next_week),
          risks: splitList(d.risks),
          blockers: splitList(d.blockers),
          decisionsNeeded: splitList(d.decisions_needed),
          leadershipAsk: d.leadership_ask || null,
          updatedBy: d.updated_by,
        });
        updateFallbackTrack(trackId, {
          status: d.status as Status,
          progressPercentage: d.progress_percentage,
        });
      }
      imported++;
    } catch (e) {
      errors.push(`Row ${i + 2}: ${e instanceof Error ? e.message : "Failed"}`);
    }
  }

  if (imported > 0) revalidateAll();
  return { success: errors.length === 0, imported, errors };
}

async function importSkills(
  rows: Record<string, string>[],
): Promise<ImportResult> {
  const errors: string[] = [];
  let imported = 0;
  const dbAvailable = await isDatabaseAvailable();

  for (let i = 0; i < rows.length; i++) {
    const parsed = skillCsvRowSchema.safeParse(rows[i]);
    if (!parsed.success) {
      errors.push(`Row ${i + 2}: ${parsed.error.issues[0]?.message}`);
      continue;
    }
    const d = parsed.data;

    try {
      if (dbAvailable) {
        await prisma.skill.upsert({
          where: { name: d.name },
          create: { name: d.name, category: d.category },
          update: { category: d.category },
        });
      } else {
        upsertFallbackSkill(d.name, d.category);
      }
      imported++;
    } catch (e) {
      errors.push(`Row ${i + 2}: ${e instanceof Error ? e.message : "Failed"}`);
    }
  }

  if (imported > 0) revalidateAll();
  return { success: errors.length === 0, imported, errors };
}
