import { getPeople, getPerson, getTracks } from "@/lib/store";
import type {
  CapacitySnapshot,
  Person,
  SkillRequirement,
  TrackPlanningView,
} from "@/lib/types";

function engineersWithSkill(skill: string, minLevel: number): Person[] {
  return getPeople().filter(
    (p) =>
      (p.role === "engineer" || p.role === "lead") &&
      p.skills.some((s) => s.skill === skill && s.level >= minLevel),
  );
}

export function getCapacitySnapshots(): CapacitySnapshot[] {
  return getPeople()
    .filter((p) => p.role === "engineer" || p.role === "lead")
    .map((p) => ({
      personId: p.id,
      personName: p.name,
      team: p.team,
      capacity: p.capacityPoints,
      allocated: p.allocatedPoints,
      utilization:
        p.capacityPoints > 0
          ? Math.round((p.allocatedPoints / p.capacityPoints) * 100)
          : 0,
      skills: p.skills.map((s) => s.skill),
    }));
}

export function getTeamCapacitySummary() {
  const snapshots = getCapacitySnapshots();
  const totalCapacity = snapshots.reduce((s, p) => s + p.capacity, 0);
  const totalAllocated = snapshots.reduce((s, p) => s + p.allocated, 0);
  return {
    totalCapacity,
    totalAllocated,
    utilization:
      totalCapacity > 0
        ? Math.round((totalAllocated / totalCapacity) * 100)
        : 0,
    overAllocated: snapshots.filter((p) => p.utilization > 100),
    underUtilized: snapshots.filter((p) => p.utilization < 70),
  };
}

function skillCoverage(req: SkillRequirement) {
  const available = engineersWithSkill(req.skill, req.minLevel).length;
  return {
    skill: req.skill,
    required: req.headcount,
    available,
    gap: Math.max(0, req.headcount - available),
  };
}

export function getTrackPlanningViews(): TrackPlanningView[] {
  return getTracks().map((track) => {
    const owner = getPerson(track.ownerId)!;
    const lead = getPerson(track.leadId)!;
    const pm = getPerson(track.pmId)!;
    const coverage = track.skillsRequired.map(skillCoverage);
    const capacityGap = coverage.reduce((s, c) => s + c.gap, 0);

    return { track, owner, lead, pm, skillCoverage: coverage, capacityGap };
  });
}

export function getTotalEffortByQuarter() {
  const byQuarter: Record<string, number> = {};
  for (const track of getTracks()) {
    byQuarter[track.quarter] = (byQuarter[track.quarter] ?? 0) + track.effortPoints;
  }
  return byQuarter;
}

export function getOwnershipMatrix() {
  return getTracks().map((track) => ({
    trackId: track.id,
    trackName: track.name,
    em: getPerson(track.ownerId)?.name ?? "—",
    lead: getPerson(track.leadId)?.name ?? "—",
    pm: getPerson(track.pmId)?.name ?? "—",
    status: track.status,
  }));
}
