import { MAX_INPUT_CHARS } from '../data/tools';

export interface CleanTableData {
  headers: string[];
  rows: string[][];
}

export function validateConversionInput(text: string): { valid: true; trimmed: string } | { valid: false; error: string } {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return {
      valid: false,
      error: 'Please paste some text or click "Try Sample Data" before converting.',
    };
  }

  if (text.length > MAX_INPUT_CHARS) {
    return {
      valid: false,
      error: `Input exceeds the ${MAX_INPUT_CHARS.toLocaleString('en-US')}-character limit (${text.length.toLocaleString('en-US')} characters entered). Please process in smaller batches.`,
    };
  }

  return { valid: true, trimmed: text };
}

export function normalizeTableData(raw: unknown): CleanTableData {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid conversion response format.');
  }

  const candidate = raw as { headers?: unknown; rows?: unknown };

  if (!Array.isArray(candidate.headers) || candidate.headers.length === 0) {
    throw new Error('Could not detect clear table columns in the provided text.');
  }

  const headers = candidate.headers.map((h, idx) => {
    const str = h == null ? '' : String(h).trim();
    return str.length > 0 ? str : `Column ${idx + 1}`;
  });

  const rawRows = Array.isArray(candidate.rows) ? candidate.rows : [];
  const rows: string[][] = rawRows
    .filter((row): row is unknown[] => Array.isArray(row))
    .map((row) => {
      const normalizedRow: string[] = [];
      for (let i = 0; i < headers.length; i++) {
        const cell = i < row.length ? row[i] : '';
        normalizedRow.push(cell == null ? '' : String(cell).trim());
      }
      return normalizedRow;
    });

  return { headers, rows };
}

export function escapeCsvCell(value: string): string {
  const str = value == null ? '' : String(value);
  const needsQuotes = /[",\r\n]/.test(str);
  const escaped = str.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

export function generateCsvContent(table: CleanTableData): string {
  const lines: string[] = [];
  lines.push(table.headers.map(escapeCsvCell).join(','));
  for (const row of table.rows) {
    const padded = table.headers.map((_, i) => escapeCsvCell(row[i] ?? ''));
    lines.push(padded.join(','));
  }
  return lines.join('\r\n');
}

export function generateTsvContent(table: CleanTableData): string {
  const sanitizeTsv = (val: string) =>
    (val == null ? '' : String(val)).replace(/\t/g, ' ').replace(/\r?\n/g, ' ');

  const lines: string[] = [];
  lines.push(table.headers.map(sanitizeTsv).join('\t'));
  for (const row of table.rows) {
    const padded = table.headers.map((_, i) => sanitizeTsv(row[i] ?? ''));
    lines.push(padded.join('\t'));
  }
  return lines.join('\n');
}

export function filterTableRows(table: CleanTableData, query: string): { row: string[]; originalIndex: number }[] {
  const q = query.trim().toLowerCase();
  return table.rows
    .map((row, originalIndex) => ({ row, originalIndex }))
    .filter(({ row }) => {
      if (!q) return true;
      return row.some((cell) => cell.toLowerCase().includes(q));
    });
}
