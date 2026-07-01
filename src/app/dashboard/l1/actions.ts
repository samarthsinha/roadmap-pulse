"use server";

import { upsertWeeklyStatus } from "@/lib/db/mutations";
import { weeklyStatusFormSchema } from "@/lib/validations/dashboard";

export async function saveWeeklyStatusAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = weeklyStatusFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false as const,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  return upsertWeeklyStatus(parsed.data);
}
