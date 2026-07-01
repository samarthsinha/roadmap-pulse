"use client";

import { saveWeeklyStatusAction } from "@/app/dashboard/l1/actions";
import { formatListField } from "@/lib/validations/dashboard";
import type { Status } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export interface WeeklyStatusFormDefaults {
  id?: string;
  trackId: string;
  trackName: string;
  weekStartDate: string;
  status: Status;
  progressPercentage: number;
  progressUpdate?: string;
  completedThisWeek: string[];
  plannedNextWeek: string[];
  risks: string[];
  blockers: string[];
  decisionsNeeded: string[];
  leadershipAsk?: string;
  updatedBy: string;
}

interface WeeklyStatusFormProps {
  defaults: WeeklyStatusFormDefaults;
  tracks: { id: string; name: string }[];
  onClose: () => void;
}

const STATUSES: Status[] = ["GREEN", "AMBER", "RED", "BLUE", "GREY"];

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";
const labelClass = "mb-1 block text-xs font-medium text-zinc-500";

export function WeeklyStatusForm({
  defaults,
  tracks,
  onClose,
}: WeeklyStatusFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await saveWeeklyStatusAction(formData);
      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {defaults.id ? "Edit Weekly Status" : "Add Weekly Status"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {defaults.id && (
            <input type="hidden" name="id" value={defaults.id} />
          )}
          <input type="hidden" name="weekStartDate" value={defaults.weekStartDate} />

          <div>
            <label className={labelClass}>Track</label>
            <select
              name="trackId"
              defaultValue={defaults.trackId}
              disabled={!!defaults.id}
              className={inputClass}
            >
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {fieldErrors.trackId && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.trackId[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" defaultValue={defaults.status} className={inputClass}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
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

          <div>
            <label className={labelClass}>Updated by</label>
            <input
              name="updatedBy"
              defaultValue={defaults.updatedBy}
              placeholder="Your name"
              className={inputClass}
            />
            {fieldErrors.updatedBy && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.updatedBy[0]}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Progress update (narrative)</label>
            <textarea
              name="progressUpdate"
              rows={2}
              defaultValue={defaults.progressUpdate ?? ""}
              className={inputClass}
            />
          </div>

          {(
            [
              ["completedThisWeek", "Completed this week (one per line)"],
              ["plannedNextWeek", "Planned next week (one per line)"],
              ["risks", "Risks (one per line)"],
              ["blockers", "Blockers (one per line)"],
              ["decisionsNeeded", "Decisions needed (one per line)"],
            ] as const
          ).map(([name, label]) => (
            <div key={name}>
              <label className={labelClass}>{label}</label>
              <textarea
                name={name}
                rows={3}
                defaultValue={formatListField(defaults[name as keyof WeeklyStatusFormDefaults] as string[] ?? [])}
                className={inputClass}
              />
            </div>
          ))}

          <div>
            <label className={labelClass}>Leadership ask</label>
            <textarea
              name="leadershipAsk"
              rows={2}
              defaultValue={defaults.leadershipAsk ?? ""}
              className={inputClass}
              placeholder="Specific, actionable ask with owner context"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {pending ? "Saving…" : "Save status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
