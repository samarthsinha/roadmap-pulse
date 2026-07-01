import { isDatabaseAvailable, prisma } from "@/lib/db/prisma";
import {
  getFallbackBlockers,
  getFallbackEngineers,
  getFallbackEngineerSkills,
  getFallbackInitiatives,
  getFallbackRisks,
  getFallbackSkills,
  getFallbackTrackSkills,
  getFallbackTracks,
  getFallbackWeeklyStatuses,
  weeksMatch,
} from "@/lib/db/fallback-store";
import type {
  EngineerWithSkills,
  InitiativeWithTracks,
  TrackWithRelations,
  WeeklyStatusWithTrack,
} from "@/lib/db/types";
import { getCurrentWeekStart } from "@/lib/db/types";

let useFallback: boolean | null = null;

async function shouldUseFallback(): Promise<boolean> {
  if (useFallback !== null) return useFallback;
  useFallback = !(await isDatabaseAvailable());
  return useFallback;
}

function buildEngineersWithSkills(): EngineerWithSkills[] {
  return getFallbackEngineers().map((engineer) => ({
    ...engineer,
    skills: getFallbackEngineerSkills()
      .filter((es) => es.engineerId === engineer.id)
      .map((es) => ({
        ...es,
        skill: getFallbackSkills().find((s) => s.id === es.skillId)!,
      })),
  }));
}

function buildTracksWithRelations(): TrackWithRelations[] {
  return getFallbackTracks().map((track) => ({
    ...track,
    initiative: getFallbackInitiatives().find((i) => i.id === track.initiativeId)!,
    skillRequirements: getFallbackTrackSkills()
      .filter((ts) => ts.trackId === track.id)
      .map((ts) => ({
        ...ts,
        skill: getFallbackSkills().find((s) => s.id === ts.skillId)!,
      })),
    weeklyStatuses: getFallbackWeeklyStatuses().filter(
      (ws) => ws.trackId === track.id,
    ),
    risks: getFallbackRisks().filter((r) => r.trackId === track.id),
    blockers: getFallbackBlockers().filter((b) => b.trackId === track.id),
  }));
}

export async function getInitiativesWithTracks(): Promise<InitiativeWithTracks[]> {
  if (await shouldUseFallback()) {
    return getFallbackInitiatives().map((initiative) => ({
      ...initiative,
      tracks: getFallbackTracks().filter((t) => t.initiativeId === initiative.id),
    }));
  }

  return prisma.initiative.findMany({
    include: { tracks: true },
    orderBy: { name: "asc" },
  });
}

export async function getTracksWithRelations(): Promise<TrackWithRelations[]> {
  if (await shouldUseFallback()) {
    return buildTracksWithRelations();
  }

  return prisma.track.findMany({
    include: {
      initiative: true,
      skillRequirements: { include: { skill: true } },
      weeklyStatuses: { orderBy: { weekStartDate: "desc" } },
      risks: { where: { status: "open" } },
      blockers: { where: { status: "open" } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getEngineersWithSkills(): Promise<EngineerWithSkills[]> {
  if (await shouldUseFallback()) {
    return buildEngineersWithSkills();
  }

  return prisma.engineer.findMany({
    include: { skills: { include: { skill: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getWeeklyStatuses(
  weekStart?: Date,
): Promise<WeeklyStatusWithTrack[]> {
  const week = weekStart ?? getCurrentWeekStart();

  if (await shouldUseFallback()) {
    const tracks = buildTracksWithRelations();
    return getFallbackWeeklyStatuses()
      .filter((ws) => weeksMatch(ws.weekStartDate, week))
      .map((ws) => {
        const track = tracks.find((t) => t.id === ws.trackId)!;
        return { ...ws, track };
      });
  }

  return prisma.weeklyStatus.findMany({
    where: { weekStartDate: week },
    include: { track: { include: { initiative: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getOpenRisks() {
  if (await shouldUseFallback()) {
    return getFallbackRisks()
      .filter((r) => r.status === "open")
      .map((r) => ({
        ...r,
        track: getFallbackTracks().find((t) => t.id === r.trackId)!,
        initiative: getFallbackInitiatives().find(
          (i) =>
            i.id ===
            getFallbackTracks().find((t) => t.id === r.trackId)?.initiativeId,
        )!,
      }));
  }

  return prisma.risk.findMany({
    where: { status: "open" },
    include: { track: { include: { initiative: true } } },
    orderBy: [{ severity: "asc" }, { dueDate: "asc" }],
  });
}

export async function getOpenBlockers() {
  if (await shouldUseFallback()) {
    return getFallbackBlockers()
      .filter((b) => b.status === "open")
      .map((b) => ({
        ...b,
        track: getFallbackTracks().find((t) => t.id === b.trackId)!,
      }));
  }

  return prisma.blocker.findMany({
    where: { status: "open" },
    include: { track: true },
    orderBy: { blockedSince: "asc" },
  });
}

export async function getSkills() {
  if (await shouldUseFallback()) return getFallbackSkills();
  return prisma.skill.findMany({ orderBy: { name: "asc" } });
}

export async function getDataSourceLabel(): Promise<"database" | "fallback"> {
  return (await shouldUseFallback()) ? "fallback" : "database";
}

export async function getPortfolioStats() {
  const tracks = await getTracksWithRelations();
  const activeTracks = tracks.filter(
    (t) => t.status !== "BLUE" && t.status !== "GREY",
  );
  const initiatives = await getInitiativesWithTracks();
  const risks = await getOpenRisks();
  const blockers = await getOpenBlockers();

  const avgProgress =
    activeTracks.length > 0
      ? Math.round(
          activeTracks.reduce((s, t) => s + t.progressPercentage, 0) /
            activeTracks.length,
        )
      : 0;

  return {
    initiativeCount: initiatives.length,
    trackCount: tracks.length,
    greenCount: tracks.filter((t) => t.status === "GREEN").length,
    amberCount: tracks.filter((t) => t.status === "AMBER").length,
    redCount: tracks.filter((t) => t.status === "RED").length,
    avgProgress,
    openRisks: risks.length,
    openBlockers: blockers.length,
    leadershipAsks: [
      ...initiatives.filter((i) => i.leadershipAsk).map((i) => ({
        source: i.name,
        ask: i.leadershipAsk!,
        owner: i.owner,
      })),
      ...(await getWeeklyStatuses()).filter((ws) => ws.leadershipAsk).map((ws) => ({
        source: ws.track.name,
        ask: ws.leadershipAsk!,
        owner: ws.track.ownerEm,
      })),
    ],
  };
}
