"use client";

import { importCsvAction } from "@/app/dashboard/data/actions";
import { Card, PageHeader } from "@/components/dashboard/common";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { ImportType } from "@/lib/validations/csv";
import { Download, Upload } from "lucide-react";
import { useState, useTransition } from "react";

const DATA_TYPES: {
  type: ImportType;
  label: string;
  description: string;
}[] = [
  {
    type: "engineers",
    label: "Engineers",
    description: "name, role, level, manager, availability_percentage, location",
  },
  {
    type: "engineer-skills",
    label: "Engineer Skills",
    description: "engineer_name, skill_name, rating (1–5)",
  },
  {
    type: "skills",
    label: "Skills",
    description: "name, category",
  },
  {
    type: "tracks",
    label: "Tracks",
    description: "initiative_name, name, owners, status, progress, confidence, target_date, effort",
  },
  {
    type: "weekly-statuses",
    label: "Weekly Statuses",
    description: "track_name, week_start_date, status, lists (pipe-separated: a|b|c)",
  },
];

export function DataManagementClient() {
  const [selectedType, setSelectedType] = useState<ImportType>("weekly-statuses");
  const [importResult, setImportResult] = useState<{
    imported: number;
    errors: string[];
  } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleExport(type: ImportType) {
    window.location.href = `/api/export?type=${type}`;
  }

  function handleImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setImportResult(null);
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) return;

    startTransition(async () => {
      const text = await file.text();
      const result = await importCsvAction(selectedType, text);
      setImportResult({ imported: result.imported, errors: result.errors });
      if (result.imported > 0) fileInput.value = "";
    });
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Data Import / Export"
        description="CSV import and export for engineers, tracks, skills, and weekly statuses. List fields use pipe (|) separators."
        badge="Sprint 6"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DATA_TYPES.map(({ type, label, description }) => (
          <Card key={type}>
            <h3 className="font-semibold">{label}</h3>
            <p className="mt-1 text-xs text-zinc-500">{description}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => handleExport(type)}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <Download className="h-3.5 w-3.5" /> Export
              </button>
              <button
                type="button"
                onClick={() => setSelectedType(type)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${
                  selectedType === type
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "border hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                <Upload className="h-3.5 w-3.5" /> Import
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card title={`Import ${DATA_TYPES.find((d) => d.type === selectedType)?.label}`}>
        <form onSubmit={handleImport} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              CSV file
            </label>
            <input
              type="file"
              name="file"
              accept=".csv,text/csv"
              className="block w-full text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {pending ? "Importing…" : "Upload and import"}
          </button>
        </form>

        {importResult && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-emerald-600">
              Imported {importResult.imported} row(s)
            </p>
            {importResult.errors.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                  {importResult.errors.length} issue(s)
                </p>
                <ul className="mt-2 max-h-40 overflow-y-auto text-xs text-amber-700 dark:text-amber-500">
                  {importResult.errors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card title="CSV format notes" className="mt-8">
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li>• First row must be column headers (lowercase, underscores)</li>
          <li>• List fields (completed, blockers, etc.) use pipe separator: <code>item one|item two</code></li>
          <li>• Status values: GREEN, AMBER, RED, BLUE, GREY</li>
          <li>• Tracks and weekly statuses match by name — import initiatives/skills first</li>
          <li>• Export current data as a template, edit in Sheets, re-import</li>
        </ul>
      </Card>
    </DashboardShell>
  );
}
