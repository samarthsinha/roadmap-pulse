"use server";

import { upsertTrack } from "@/lib/db/mutations";
import { trackFormSchema } from "@/lib/validations/dashboard";

export async function saveTrackAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = trackFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false as const,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  return upsertTrack(parsed.data);
}
