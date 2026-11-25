import { GoogleGenAI, Type } from '@google/genai';
import { getToolByPath, MAX_INPUT_CHARS } from '../data/tools';
import { CleanTableData, normalizeTableData, validateConversionInput } from '../utils/tableExport';

export interface ConvertRequestPayload {
  text?: unknown;
  toolSlug?: unknown;
}

export interface ConvertServiceResult {
  status: number;
  body: CleanTableData | { error: string };
}

let cachedClient: GoogleGenAI | null = null;
let cachedKey: string | undefined;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!cachedClient || cachedKey !== apiKey) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    cachedKey = apiKey;
  }
  return cachedClient;
}

export async function convertMessyTextToTable(payload: ConvertRequestPayload): Promise<ConvertServiceResult> {
  const rawText = typeof payload.text === 'string' ? payload.text : '';
  const validation = validateConversionInput(rawText);

  if (validation.valid === false) {
    return {
      status: 400,
      body: { error: validation.error },
    };
  }

  if (rawText.length > MAX_INPUT_CHARS) {
    return {
      status: 400,
      body: {
        error: `Input exceeds the ${MAX_INPUT_CHARS.toLocaleString('en-US')}-character limit. Please split your text into smaller batches.`,
      },
    };
  }

  const ai = getGeminiClient();
  if (!ai) {
    return {
      status: 503,
      body: {
        error: 'Gemini API key is not configured on the server. Please add GEMINI_API_KEY in Settings > Secrets.',
      },
    };
  }

  const slug = typeof payload.toolSlug === 'string' ? payload.toolSlug : '/';
  const tool = getToolByPath(slug);

  const systemInstruction = [
    'You are CleanSheet AI, a high-precision data extraction and spreadsheet normalization engine.',
    'Convert the user-provided unstructured text into a clean, rectangular JSON table with exactly two keys: "headers" (array of concise Title Case column names) and "rows" (array of string arrays, where every row has the exact same length as "headers").',
    `Tool Context: ${tool.title}.`,
    `Extraction Rules: ${tool.aiHint}`,
    'General Rules:',
    '- Never invent or hallucinate data that is not present in the input.',
    '- Use empty string "" for missing cell values.',
    '- Every cell value must be a clean string (convert numbers/booleans to clean display strings).',
    '- Strip noisy chat timestamps, bullet symbols, and stray separator punctuation unless semantically needed.',
    '- Do not include summary or total rows unless they are explicitly distinct items in the input.',
  ].join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Convert the following messy text into a structured table:\n\n${validation.trimmed}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headers: {
              type: Type.ARRAY,
              description: 'Clean, concise column header names.',
              items: { type: Type.STRING },
            },
            rows: {
              type: Type.ARRAY,
              description: 'Normalized data rows matching the headers length.',
              items: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
          },
          required: ['headers', 'rows'],
        },
      },
    });

    const rawJson = (response.text ?? '').trim();
    if (!rawJson) {
      return {
        status: 502,
        body: { error: 'The AI engine returned an empty response. Please try again.' },
      };
    }

    const parsed = JSON.parse(rawJson);
    const normalized = normalizeTableData(parsed);

    if (normalized.rows.length === 0) {
      return {
        status: 422,
        body: {
          error: 'No tabular records could be extracted from that text. Try pasting structured lines, lists, or click "Try Sample Data".',
        },
      };
    }

    return {
      status: 200,
      body: normalized,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const lower = message.toLowerCase();

    if (lower.includes('429') || lower.includes('resource_exhausted') || lower.includes('quota') || lower.includes('rate')) {
      return {
        status: 429,
        body: {
          error: 'Free-tier conversion quota is temporarily busy. Please wait a few seconds and try again.',
        },
      };
    }

    if (lower.includes('api_key_invalid') || lower.includes('permission_denied') || lower.includes('403')) {
      return {
        status: 503,
        body: {
          error: 'Server API key is invalid or unauthorized. Please verify GEMINI_API_KEY in Settings > Secrets.',
        },
      };
    }

    return {
      status: 500,
      body: {
        error: 'Unable to parse that text right now. Please refine the input or try again shortly.',
      },
    };
  }
}
