"use client";

import { TrackForm, type TrackFormDefaults } from "@/components/dashboard/tracks/track-form";
import { ConfidenceBadge, StatusBadge, Badge } from "@/components/dashboard/status-badge";
import { ProgressBar } from "@/components/dashboard/common";
import {
  getSkillGaps,
  rankEngineersForTrack,
} from "@/lib/metrics/skill-fit";
import type { Status, Confidence } from "@prisma/client";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";

interface SkillReq {
  skill: { id: string; name: string };
  requirement: { requiredRating: number; effortWeight: number };
}

interface Engineer {
  id: string;
  name: string;
  role: string;
  availabilityPercentage: number;
  skills: { skillId: string; rating: number; skill: { id: string; name: string } }[];
}

interface TrackItem {
  id: string;
  initiativeId: string;
  initiativeName: string;
  name: string;
  description: string | null;
  ownerEm: string;
  ownerPm: string;
  techLead: string;
  status: Status;
  progressPercentage: number;
  confidence: Confidence;
  targetDate: string;
  effortEstimateDays: number;
  skillRequirements: SkillReq[];
}

interface TracksPlannerProps {
  tracks: TrackItem[];
  engineers: Engineer[];
  initiatives: { id: string; name: string }[];
}

export function TracksPlanner({
  tracks,
  engineers,
  initiatives,
}: TracksPlannerProps) {
  const [formDefaults, setFormDefaults] = useState<TrackFormDefaults | null>(null);

  function openCreate() {
    const init = initiatives[0];
    if (!init) return;
    setFormDefaults({
      initiativeId: init.id,
      name: "",
      ownerEm: "",
      ownerPm: "",
      techLead: "",
      status: "GREY",
      progressPercentage: 0,
      confidence: "MEDIUM",
      targetDate: new Date().toISOString().slice(0, 10),
      effortEstimateDays: 20,
    });
  }

  function openEdit(track: TrackItem) {
    setFormDefaults({
      id: track.id,
      initiativeId: track.initiativeId,
      name: track.name,
      description: track.description ?? undefined,
      ownerEm: track.ownerEm,
      ownerPm: track.ownerPm,
      techLead: track.techLead,
      status: track.status,
      progressPercentage: track.progressPercentage,
      confidence: track.confidence,
      targetDate: track.targetDate,
      effortEstimateDays: track.effortEstimateDays,
    });
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          <Plus className="h-4 w-4" /> New track
        </button>
      </div>

      <div className="space-y-8">
        {tracks.map((track) => {
          const requirements = track.skillRequirements.map((sr) => ({
            skill: sr.skill,
            requirement: {
              requiredRating: sr.requirement.requiredRating,
              effortWeight: sr.requirement.effortWeight,
            },
          }));
          const recommendations = rankEngineersForTrack(engineers, requirements);
          const gaps = getSkillGaps(requirements, engineers);

          return (
            <div
              key={track.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-zinc-500">{track.initiativeName}</p>
                  <h3 className="text-lg font-semibold">{track.name}</h3>
                  {track.description && (
                    <p className="mt-1 text-sm text-zinc-500">{track.description}</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={track.status} />
                  <ConfidenceBadge confidence={track.confidence} />
                  <Badge variant="info">{track.effortEstimateDays}d est</Badge>
                  <button
                    type="button"
                    onClick={() => openEdit(track)}
                    className="rounded p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Pencil className="h-4 w-4 text-zinc-500" />
                  </button>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                {[
                  ["EM", track.ownerEm],
                  ["PM", track.ownerPm],
                  ["Lead", track.techLead],
                  ["Target", track.targetDate],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-zinc-500">{label}</p>
                    <p className="font-medium">{val}</p>
                  </div>
                ))}
              </div>

              <ProgressBar value={track.progressPercentage} />

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase text-zinc-500">
                    Required Skills
                  </h4>
                  {gaps.length > 0 ? (
                    <table className="w-full text-sm">
                      <tbody>
                        {gaps.map((g) => (
                          <tr key={g.skillName} className="border-b border-zinc-50">
                            <td className="py-2">{g.skillName}</td>
                            <td className="py-2">
                              {g.gap ? (
                                <Badge variant="danger">Gap</Badge>
                              ) : (
                                <Badge variant="success">{g.availableEngineers} avail</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-sm text-zinc-500">No skill requirements defined.</p>
                  )}
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase text-zinc-500">
                    Recommended Engineers
                  </h4>
                  {recommendations.length > 0 ? (
                    <div className="space-y-2">
                      {recommendations.map((rec) => (
                        <div
                          key={rec.engineerId}
                          className="flex justify-between rounded-lg border border-zinc-100 p-2 dark:border-zinc-800"
                        >
                          <span className="text-sm font-medium">{rec.engineerName}</span>
                          <Badge variant={rec.score >= 0.7 ? "success" : "warning"}>
                            Fit {Math.round(rec.score * 100)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">No qualified engineers.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {formDefaults && (
        <TrackForm
          defaults={formDefaults}
          initiatives={initiatives}
          onClose={() => setFormDefaults(null)}
        />
      )}
    </>
  );
}
