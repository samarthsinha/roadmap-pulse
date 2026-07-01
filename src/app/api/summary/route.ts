import {
  generateL0Summary,
  generateL1Summary,
} from "@/lib/status/summary";
import { getWeeklyStatuses } from "@/lib/db/queries";
import { formatWeekStart, getCurrentWeekStart } from "@/lib/db/types";
import { NextResponse } from "next/server";

export async function GET() {
  const weekStart = getCurrentWeekStart();
  const statuses = await getWeeklyStatuses(weekStart);
  const week = formatWeekStart(weekStart);

  return NextResponse.json({
    week,
    l1: generateL1Summary(week, statuses),
    l0: generateL0Summary(week, statuses),
  });
}
