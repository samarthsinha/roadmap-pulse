"use server";

import { importCsv } from "@/lib/csv/import";
import type { ImportType } from "@/lib/validations/csv";

export async function importCsvAction(type: ImportType, csvText: string) {
  return importCsv(type, csvText);
}
