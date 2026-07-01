"use client";

import {
  WeeklyStatusForm,
  type WeeklyStatusFormDefaults,
} from "@/components/dashboard/l1/weekly-status-form";
import { ProgressBar } from "@/components/dashboard/common";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { Status } from "@prisma/client";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";

export interface L1TableRow {
  statusId?: string;
  trackId: string;
  initiative: string;
  trackName: string;
  owner: string;
  status: Status;
  progress: number;
  completed: string[];
  planned: string[];
  blockers: string[];
  risks: string[];
  decisions: string[];
  ask: string | null;
  progressUpdate: string | null;
  updatedAt: string | null;
  updatedBy: string;
  hasUpdate: boolean;
}

interface L1TrackerProps {
  week: string;
  rows: L1TableRow[];
  tracks: { id: string; name: string; ownerEm: string }[];
}

function ListCell({ items }: { items: string[] }) {
  if (items.length === 0) return <span className="text-zinc-400">—</span>;
  return (
    <ul className="space-y-0.5">
      {items.map((item, i) => (
        <li key={i} className="text-xs leading-relaxed">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function L1Tracker({ week, rows, tracks }: L1TrackerProps) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [formDefaults, setFormDefaults] = useState<WeeklyStatusFormDefaults | null>(
    null,
  );

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (statusFilter !== "ALL" && row.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          row.trackName.toLowerCase().includes(q) ||
          row.initiative.toLowerCase().includes(q) ||
          row.owner.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rows, statusFilter, search]);

  const columns = useMemo<ColumnDef<L1TableRow>[]>(
    () => [
      { accessorKey: "initiative", header: "Initiative", cell: (i) => (
        <span className="text-xs text-zinc-500">{i.getValue() as string}</span>
      )},
      { accessorKey: "trackName", header: "Track", cell: (i) => (
        <span className="font-medium">{i.getValue() as string}</span>
      )},
      { accessorKey: "owner", header: "Owner" },
      { accessorKey: "status", header: "Status", cell: (i) => (
        <StatusBadge status={i.getValue() as Status} />
      )},
      { accessorKey: "progress", header: "Progress", cell: (i) => (
        <div className="w-16">
          <ProgressBar value={i.getValue() as number} />
        </div>
      )},
      { accessorKey: "completed", header: "Completed", cell: (i) => (
        <ListCell items={i.getValue() as string[]} />
      )},
      { accessorKey: "planned", header: "Next week", cell: (i) => (
        <ListCell items={i.getValue() as string[]} />
      )},
      { accessorKey: "blockers", header: "Blockers", cell: (i) => (
        <ListCell items={i.getValue() as string[]} />
      )},
      { accessorKey: "ask", header: "Ask", cell: (i) => (
        <span className="text-xs">{(i.getValue() as string) ?? "—"}</span>
      )},
      { id: "actions", header: "", cell: ({ row }) => (
        <button
          type="button"
          onClick={() => openEdit(row.original)}
          className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          title={row.original.hasUpdate ? "Edit" : "Add update"}
        >
          {row.original.hasUpdate ? (
            <Pencil className="h-4 w-4 text-zinc-500" />
          ) : (
            <Plus className="h-4 w-4 text-zinc-500" />
          )}
        </button>
      )},
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [week],
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  function openEdit(row: L1TableRow) {
    setFormDefaults({
      id: row.statusId,
      trackId: row.trackId,
      trackName: row.trackName,
      weekStartDate: week,
      status: row.status,
      progressPercentage: row.progress,
      progressUpdate: row.progressUpdate ?? undefined,
      completedThisWeek: row.completed,
      plannedNextWeek: row.planned,
      risks: row.risks,
      blockers: row.blockers,
      decisionsNeeded: row.decisions,
      leadershipAsk: row.ask ?? undefined,
      updatedBy: row.updatedBy || row.owner,
    });
  }

  function openCreate() {
    const first = tracks[0];
    if (!first) return;
    setFormDefaults({
      trackId: first.id,
      trackName: first.name,
      weekStartDate: week,
      status: "GREEN",
      progressPercentage: 0,
      completedThisWeek: [],
      plannedNextWeek: [],
      risks: [],
      blockers: [],
      decisionsNeeded: [],
      updatedBy: first.ownerEm,
    });
  }

  const green = rows.filter((r) => r.hasUpdate && r.status === "GREEN").length;
  const amber = rows.filter((r) => r.hasUpdate && r.status === "AMBER").length;
  const red = rows.filter((r) => r.hasUpdate && r.status === "RED").length;
  const stale = rows.filter((r) => !r.hasUpdate).length;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Green", value: green, color: "text-emerald-600" },
            { label: "Amber", value: amber, color: "text-amber-600" },
            { label: "Red", value: red, color: "text-red-600" },
            { label: "Not updated", value: stale, color: "text-zinc-500" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <p className="text-xs uppercase text-zinc-500">{item.label}</p>
              <p className={`mt-1 text-2xl font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          <Plus className="h-4 w-4" /> Add update
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search track, initiative, owner…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="ALL">All statuses</option>
          {(["GREEN", "AMBER", "RED", "BLUE", "GREY"] as Status[]).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {stale > 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
          {stale} active track(s) missing updates this week — click + to add.
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b text-left text-xs uppercase text-zinc-500">
                {hg.headers.map((header) => (
                  <th key={header.id} className="px-3 py-3 font-medium">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-zinc-50 align-top dark:border-zinc-800/50 ${
                  !row.original.hasUpdate ? "bg-amber-50/30 dark:bg-amber-950/10" : ""
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formDefaults && (
        <WeeklyStatusForm
          defaults={formDefaults}
          tracks={tracks.map((t) => ({ id: t.id, name: t.name }))}
          onClose={() => setFormDefaults(null)}
        />
      )}
    </>
  );
}
