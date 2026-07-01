import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TracksPlanner } from "@/components/dashboard/tracks/tracks-planner";
import { PageHeader } from "@/components/dashboard/common";
import {
  getEngineersWithSkills,
  getInitiativesWithTracks,
  getTracksWithRelations,
} from "@/lib/db/queries";

export default async function TracksPage() {
  const tracks = await getTracksWithRelations();
  const engineers = await getEngineersWithSkills();
  const initiatives = await getInitiativesWithTracks();

  const trackItems = tracks.map((track) => ({
    id: track.id,
    initiativeId: track.initiativeId,
    initiativeName: track.initiative.name,
    name: track.name,
    description: track.description,
    ownerEm: track.ownerEm,
    ownerPm: track.ownerPm,
    techLead: track.techLead,
    status: track.status,
    progressPercentage: track.progressPercentage,
    confidence: track.confidence,
    targetDate: track.targetDate.toISOString().slice(0, 10),
    effortEstimateDays: track.effortEstimateDays,
    skillRequirements: track.skillRequirements.map((sr) => ({
      skill: { id: sr.skill.id, name: sr.skill.name },
      requirement: {
        requiredRating: sr.requiredRating,
        effortWeight: sr.effortWeight,
      },
    })),
  }));

  const engineerItems = engineers.map((e) => ({
    id: e.id,
    name: e.name,
    role: e.role,
    availabilityPercentage: e.availabilityPercentage,
    skills: e.skills.map((s) => ({
      skillId: s.skillId,
      rating: s.rating,
      skill: { id: s.skill.id, name: s.skill.name },
    })),
  }));

  return (
    <DashboardShell>
      <PageHeader
        title="Track Planner"
        description="Plan workstreams with skills, effort, capacity, and ownership."
        badge="Planning"
      />
      <TracksPlanner
        tracks={trackItems}
        engineers={engineerItems}
        initiatives={initiatives.map((i) => ({ id: i.id, name: i.name }))}
      />
    </DashboardShell>
  );
}
