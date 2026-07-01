import { generateWeeklySummary } from "@/lib/automation/engine";
import { getCurrentWeek } from "@/lib/store";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const weekOf = searchParams.get("weekOf") ?? getCurrentWeek();
  const summary = generateWeeklySummary(weekOf);

  return NextResponse.json(summary);
}
