"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, PageHeader } from "@/components/dashboard/common";
import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";

interface SummaryResponse {
  l1: string;
  l0: string;
  week: string;
}

export default function SummaryPage() {
  const [summaries, setSummaries] = useState<SummaryResponse | null>(null);
  const [copied, setCopied] = useState<"l1" | "l0" | null>(null);

  useEffect(() => {
    fetch("/api/summary")
      .then((r) => r.json())
      .then(setSummaries);
  }, []);

  async function copy(text: string, type: "l1" | "l0") {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Weekly Summary Generator"
        description="L1 operational and L0 leadership markdown summaries from latest weekly statuses."
        badge={summaries?.week ? `Week of ${summaries.week}` : "Loading…"}
      />

      {!summaries ? (
        <p className="text-sm text-zinc-500">Generating summaries…</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {(["l1", "l0"] as const).map((type) => (
            <Card
              key={type}
              title={type === "l1" ? "L1 Operational Summary" : "L0 Leadership Summary"}
            >
              <button
                onClick={() => copy(summaries[type], type)}
                className="mb-4 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                {copied === type ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copy Markdown
                  </>
                )}
              </button>
              <pre className="max-h-96 overflow-auto rounded-lg bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap">
                {summaries[type]}
              </pre>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
