import { generateAlerts } from "@/lib/automation/engine";
import { getAlerts } from "@/lib/store";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "stored";

  if (mode === "generate") {
    return NextResponse.json({ alerts: generateAlerts() });
  }

  return NextResponse.json({ alerts: getAlerts() });
}
