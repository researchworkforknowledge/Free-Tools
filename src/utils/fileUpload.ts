import { MAX_INPUT_CHARS } from '../data/tools';

export const SUPPORTED_UPLOAD_EXTENSIONS = [
  '.txt',
  '.csv',
  '.tsv',
  '.log',
  '.md',
  '.json',
  '.eml',
] as const;

export const FILE_INPUT_ACCEPT = '.txt,.csv,.tsv,.log,.md,.json,.eml,text/plain,text/csv,text/tab-separated-values,application/json';

export const MAX_UPLOAD_BYTES = 512 * 1024; // 512 KB

export interface FileMetaLike {
  name: string;
  size: number;
  type?: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  return `${kb.toFixed(kb >= 10 ? 0 : 1)} KB`;
}

export function isSupportedTextFile(file: FileMetaLike): boolean {
  const lowerName = file.name.toLowerCase();
  const hasSupportedExt = SUPPORTED_UPLOAD_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const isTextMime = typeof file.type === 'string' && file.type.startsWith('text/');
  const isJsonMime = file.type === 'application/json';
  return hasSupportedExt || isTextMime || isJsonMime;
}

export function validateUploadedFileMeta(file: FileMetaLike): { valid: true } | { valid: false; error: string } {
  if (!isSupportedTextFile(file)) {
    return {
      valid: false,
      error: `Unsupported file type for "${file.name}". Please upload a text-based file (${SUPPORTED_UPLOAD_EXTENSIONS.join(', ')}).`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: `"${file.name}" is empty. Please choose a file with text content.`,
    };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      valid: false,
      error: `"${file.name}" (${formatFileSize(file.size)}) exceeds the 512 KB upload limit. Please split it into smaller batches.`,
    };
  }

  return { valid: true };
}

export function processUploadedFileText(
  content: string,
  fileName: string
): { ok: true; text: string; warning: string | null } | { ok: false; error: string } {
  if (content.includes('\u0000')) {
    return {
      ok: false,
      error: `"${fileName}" appears to be a binary file. Please upload plain text, CSV, TSV, LOG, MD, JSON, or EML files.`,
    };
  }

  const normalized = content.replace(/\r\n/g, '\n');
  if (normalized.trim().length === 0) {
    return {
      ok: false,
      error: `"${fileName}" contains only whitespace. Please choose a file with data.`,
    };
  }

  if (normalized.length > MAX_INPUT_CHARS) {
    return {
      ok: true,
      text: normalized,
      warning: `Loaded "${fileName}" (${normalized.length.toLocaleString('en-US')} characters). Please trim below ${MAX_INPUT_CHARS.toLocaleString('en-US')} characters before converting.`,
    };
  }

  return {
    ok: true,
    text: normalized,
    warning: null,
  };
}
