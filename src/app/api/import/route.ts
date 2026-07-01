import { importCsv } from "@/lib/csv/import";
import type { ImportType } from "@/lib/validations/csv";
import { NextResponse } from "next/server";

const VALID_TYPES: ImportType[] = [
  "engineers",
  "engineer-skills",
  "tracks",
  "weekly-statuses",
  "skills",
];

export async function POST(request: Request) {
  const formData = await request.formData();
  const type = formData.get("type") as ImportType | null;
  const file = formData.get("file");

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid import type" }, { status: 400 });
  }

  let csvText = "";
  if (file instanceof File) {
    csvText = await file.text();
  } else {
    const text = formData.get("csv");
    if (typeof text === "string") csvText = text;
  }

  if (!csvText.trim()) {
    return NextResponse.json({ error: "No CSV content provided" }, { status: 400 });
  }

  const result = await importCsv(type, csvText);
  return NextResponse.json(result);
}
