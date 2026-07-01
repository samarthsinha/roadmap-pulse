import { EXPORT_FILENAMES, exportCsv } from "@/lib/csv/export";
import type { ImportType } from "@/lib/validations/csv";
import { NextResponse } from "next/server";

const VALID_TYPES: ImportType[] = [
  "engineers",
  "engineer-skills",
  "tracks",
  "weekly-statuses",
  "skills",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as ImportType | null;
  const weekOf = searchParams.get("weekOf");

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: "Invalid type. Use: engineers, engineer-skills, tracks, weekly-statuses, skills" },
      { status: 400 },
    );
  }

  const weekStart = weekOf ? new Date(weekOf) : undefined;
  const csv = await exportCsv(type, weekStart);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${EXPORT_FILENAMES[type]}"`,
    },
  });
}
