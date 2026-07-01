import { isDatabaseAvailable, prisma } from "@/lib/db/prisma";
import {
  createFallbackTrack,
  getFallbackWeeklyStatusById,
  upsertFallbackWeeklyStatus,
  updateFallbackTrack,
  weeksMatch,
} from "@/lib/db/fallback-store";
import {
  parseListField,
  type TrackFormInput,
  type WeeklyStatusFormInput,
} from "@/lib/validations/dashboard";
import type { Status } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type ActionResult =
  | { success: true; id: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

function revalidateDashboard() {
  revalidatePath("/dashboard/l1");
  revalidatePath("/dashboard/l0");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/summary");
  revalidatePath("/dashboard/tracks");
}

export async function upsertWeeklyStatus(
  input: WeeklyStatusFormInput,
): Promise<ActionResult> {
  const weekStartDate = new Date(input.weekStartDate);
  const payload = {
    trackId: input.trackId,
    weekStartDate,
    status: input.status as Status,
    progressUpdate: input.progressUpdate || null,
    completedThisWeek: parseListField(input.completedThisWeek),
    plannedNextWeek: parseListField(input.plannedNextWeek),
    risks: parseListField(input.risks),
    blockers: parseListField(input.blockers),
    decisionsNeeded: parseListField(input.decisionsNeeded),
    leadershipAsk: input.leadershipAsk || null,
    updatedBy: input.updatedBy,
  };

  try {
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      const record = upsertFallbackWeeklyStatus({
        ...payload,
        id: input.id,
      });
      updateFallbackTrack(input.trackId, {
        status: input.status as Status,
        progressPercentage: input.progressPercentage,
      });
      revalidateDashboard();
      return { success: true, id: record.id };
    }

    const record = await prisma.weeklyStatus.upsert({
      where: {
        trackId_weekStartDate: {
          trackId: input.trackId,
          weekStartDate,
        },
      },
      create: payload,
      update: { ...payload, updatedAt: new Date() },
    });

    await prisma.track.update({
      where: { id: input.trackId },
      data: {
        status: input.status as Status,
        progressPercentage: input.progressPercentage,
        updatedAt: new Date(),
      },
    });

    revalidateDashboard();
    return { success: true, id: record.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save status";
    return { success: false, error: message };
  }
}

export async function upsertTrack(input: TrackFormInput): Promise<ActionResult> {
  const data = {
    initiativeId: input.initiativeId,
    name: input.name,
    description: input.description || null,
    ownerEm: input.ownerEm,
    ownerPm: input.ownerPm,
    techLead: input.techLead,
    status: input.status as Status,
    progressPercentage: input.progressPercentage,
    confidence: input.confidence,
    targetDate: new Date(input.targetDate),
    effortEstimateDays: input.effortEstimateDays,
    startDate: null,
    actualEffortDays: null,
  };

  try {
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      if (input.id) {
        updateFallbackTrack(input.id, data);
        revalidateDashboard();
        return { success: true, id: input.id };
      }
      const track = createFallbackTrack(data);
      revalidateDashboard();
      return { success: true, id: track.id };
    }

    if (input.id) {
      await prisma.track.update({ where: { id: input.id }, data });
      revalidateDashboard();
      return { success: true, id: input.id };
    }

    const track = await prisma.track.create({ data });
    revalidateDashboard();
    return { success: true, id: track.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save track";
    return { success: false, error: message };
  }
}

export async function getWeeklyStatusForEdit(id: string) {
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return getFallbackWeeklyStatusById(id) ?? null;
  }
  return prisma.weeklyStatus.findUnique({ where: { id } });
}

export { weeksMatch };
