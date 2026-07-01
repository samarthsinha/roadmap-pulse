"use client";

import { saveTrackAction } from "@/app/dashboard/tracks/actions";
import type { Status, Confidence } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export interface TrackFormDefaults {
  id?: string;
  initiativeId: string;
  name: string;
  description?: string;
  ownerEm: string;
  ownerPm: string;
  techLead: string;
  status: Status;
  progressPercentage: number;
  confidence: Confidence;
  targetDate: string;
  effortEstimateDays: number;
}

interface TrackFormProps {
  defaults: TrackFormDefaults;
  initiatives: { id: string; name: string }[];
  onClose: () => void;
}

const STATUSES: Status[] = ["GREEN", "AMBER", "RED", "BLUE", "GREY"];
const CONFIDENCES: Confidence[] = ["HIGH", "MEDIUM", "LOW"];

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";
const labelClass = "mb-1 block text-xs font-medium text-zinc-500";

export function TrackForm({ defaults, initiatives, onClose }: TrackFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await saveTrackAction(formData);
      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {defaults.id ? "Edit Track" : "Create Track"}
          </h2>
          <button type="button" onClick={onClose} className="text-zinc-400">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {defaults.id && <input type="hidden" name="id" value={defaults.id} />}

          <div>
            <label className={labelClass}>Initiative</label>
            <select
              name="initiativeId"
              defaultValue={defaults.initiativeId}
              className={inputClass}
            >
              {initiatives.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Track name</label>
            <input name="name" defaultValue={defaults.name} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={defaults.description ?? ""}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>EM</label>
              <input name="ownerEm" defaultValue={defaults.ownerEm} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>PM</label>
              <input name="ownerPm" defaultValue={defaults.ownerPm} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Lead</label>
              <input name="techLead" defaultValue={defaults.techLead} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" defaultValue={defaults.status} className={inputClass}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Confidence</label>
              <select name="confidence" defaultValue={defaults.confidence} className={inputClass}>
                {CONFIDENCES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Progress %</label>
              <input
                type="number"
                name="progressPercentage"
                min={0}
                max={100}
                defaultValue={defaults.progressPercentage}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Target date</label>
              <input
                type="date"
                name="targetDate"
                defaultValue={defaults.targetDate}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Effort (days)</label>
              <input
                type="number"
                name="effortEstimateDays"
                min={1}
                defaultValue={defaults.effortEstimateDays}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {pending ? "Saving…" : "Save track"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
