/** Escape a CSV cell value */
export function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function rowToCsv(values: (string | number | null | undefined)[]): string {
  return values.map(escapeCsvCell).join(",");
}

export function rowsToCsv(
  headers: string[],
  rows: (string | number | null | undefined)[][],
): string {
  return [rowToCsv(headers), ...rows.map((r) => rowToCsv(r))].join("\n");
}

/** Parse CSV text into rows of string cells */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell.trim());
      cell = "";
    } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
      row.push(cell.trim());
      if (row.some((c) => c.length > 0)) rows.push(row);
      row = [];
      cell = "";
      if (ch === "\r") i++;
    } else if (ch !== "\r") {
      cell += ch;
    }
  }

  row.push(cell.trim());
  if (row.some((c) => c.length > 0)) rows.push(row);

  return rows;
}

export function csvToObjects(text: string): Record<string, string>[] {
  const rows = parseCsv(text.trim());
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().replace(/\s+/g, "_"));
  return rows.slice(1).map((cells) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = cells[i] ?? "";
    });
    return obj;
  });
}

/** Pipe-separated list in a single CSV cell */
export function joinList(items: string[]): string {
  return items.join("|");
}

export function splitList(value?: string): string[] {
  if (!value?.trim()) return [];
  return value.split("|").map((s) => s.trim()).filter(Boolean);
}
