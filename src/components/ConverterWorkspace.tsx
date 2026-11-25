import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Copy,
  Download,
  Eraser,
  FileSpreadsheet,
  FileText,
  Loader2,
  Search,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import { ConverterToolConfig, MAX_INPUT_CHARS } from '../data/tools';
import {
  CleanTableData,
  filterTableRows,
  generateCsvContent,
  generateTsvContent,
  normalizeTableData,
  validateConversionInput,
} from '../utils/tableExport';
import {
  FILE_INPUT_ACCEPT,
  formatFileSize,
  processUploadedFileText,
  validateUploadedFileMeta,
} from '../utils/fileUpload';

interface ConverterWorkspaceProps {
  tool: ConverterToolConfig;
}

export function ConverterWorkspace({ tool }: ConverterWorkspaceProps) {
  const textareaId = useId();
  const searchId = useId();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [inputMode, setInputMode] = useState<'type' | 'upload'>('type');
  const [rawText, setRawText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [tableData, setTableData] = useState<CleanTableData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedTable, setCopiedTable] = useState(false);
  const [downloadedCsv, setDownloadedCsv] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setInputMode('type');
    setRawText('');
    setUploadedFile(null);
    setIsDraggingFile(false);
    setTableData(null);
    setErrorMessage(null);
    setCopiedTable(false);
    setDownloadedCsv(false);
    setSearchQuery('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [tool.slug]);

  const charCount = rawText.length;
  const isOverLimit = charCount > MAX_INPUT_CHARS;

  const filteredRows = useMemo(() => {
    if (!tableData) return [];
    return filterTableRows(tableData, searchQuery);
  }, [tableData, searchQuery]);

  const columnMinWidths = useMemo(() => {
    if (!tableData) return [];
    return tableData.headers.map((header, colIdx) => {
      const longestCell = tableData.rows.reduce((max, row) => {
        const len = (row[colIdx] ?? '').length;
        return len > max ? len : max;
      }, header.length);
      return Math.min(Math.max(longestCell * 8.2 + 28, 110), 280);
    });
  }, [tableData]);

  const handleLoadSample = () => {
    setInputMode('type');
    setRawText(tool.sampleData);
    setUploadedFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClear = () => {
    setRawText('');
    setUploadedFile(null);
    setTableData(null);
    setErrorMessage(null);
    setCopiedTable(false);
    setDownloadedCsv(false);
    setSearchQuery('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelected = async (file: File | null | undefined) => {
    if (!file) return;

    const metaValidation = validateUploadedFileMeta({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (metaValidation.valid === false) {
      setErrorMessage(metaValidation.error);
      return;
    }

    try {
      const text = await file.text();
      const processed = processUploadedFileText(text, file.name);

      if (processed.ok === false) {
        setErrorMessage(processed.error);
        return;
      }

      setRawText(processed.text);
      setUploadedFile({ name: file.name, size: file.size });
      setErrorMessage(processed.warning);
    } catch {
      setErrorMessage(`Could not read "${file.name}". Please ensure it is a readable text file.`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingFile) setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    void handleFileSelected(file);
  };

  const handleConvert = async () => {
    const validation = validateConversionInput(rawText);
    if (validation.valid === false) {
      setErrorMessage(validation.error);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setCopiedTable(false);

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: rawText,
          toolSlug: tool.slug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.error || 'Conversion failed. Please try again.');
        return;
      }

      const normalized = normalizeTableData(data);
      setTableData(normalized);
      setSearchQuery('');
    } catch {
      setErrorMessage('Network error while contacting the converter. Please check your connection and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCellEdit = (rowIndex: number, colIndex: number, nextValue: string) => {
    setTableData((prev) => {
      if (!prev) return prev;
      const nextRows = prev.rows.map((row, rIdx) => {
        if (rIdx !== rowIndex) return row;
        const updatedRow = [...row];
        updatedRow[colIndex] = nextValue;
        return updatedRow;
      });
      return { ...prev, rows: nextRows };
    });
  };

  const handleCopyForSheets = async () => {
    if (!tableData) return;
    const tsv = generateTsvContent(tableData);
    try {
      await navigator.clipboard.writeText(tsv);
      setCopiedTable(true);
      window.setTimeout(() => setCopiedTable(false), 2200);
    } catch {
      setErrorMessage('Clipboard access was blocked by the browser. Please use "Download .CSV" instead.');
    }
  };

  const handleDownloadCsv = () => {
    if (!tableData) return;
    const csv = generateCsvContent(tableData);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', tool.exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadedCsv(true);
    window.setTimeout(() => setDownloadedCsv(false), 2200);
  };

  return (
    <section aria-labelledby="tool-heading" className="border-b border-slate-200 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Hero Header */}
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1
              id="tool-heading"
              className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-[34px] lg:leading-tight [text-wrap:balance]"
            >
              {tool.title}
            </h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">{tool.subtitle}</p>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-800 shrink-0">
            <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden="true" />
            <span>100% Private: Processed in memory, zero data saved</span>
          </div>
        </div>

        {/* Split-Screen Workspace */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
          {/* Left Panel: Raw Text Input */}
          <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 sm:p-5 lg:col-span-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <label htmlFor={textareaId} className="text-sm font-semibold text-slate-800">
                Raw Unstructured Text
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  <FileText className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  <span>Try Sample Data</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  disabled={!rawText && !uploadedFile && !tableData && !errorMessage}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-45 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Input Mode Segmented Switcher */}
            <div className="mb-3 flex items-center justify-between gap-3">
              <div
                role="tablist"
                aria-label="Input method"
                className="inline-grid grid-cols-2 rounded-lg bg-slate-100 p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={inputMode === 'type'}
                  onClick={() => setInputMode('type')}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                    inputMode === 'type'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Type or Paste
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={inputMode === 'upload'}
                  onClick={() => setInputMode('upload')}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                    inputMode === 'upload'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upload File
                </button>
              </div>

              {inputMode === 'type' && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded px-1.5 py-1"
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Import file</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              accept={FILE_INPUT_ACCEPT}
              onChange={(e) => void handleFileSelected(e.target.files?.[0])}
              className="sr-only"
            />

            {uploadedFile && (
              <div className="mb-2.5 flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                <div className="flex min-w-0 items-center gap-2 text-slate-700">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                  <span className="truncate font-medium text-slate-900">{uploadedFile.name}</span>
                  <span className="text-slate-400" aria-hidden="true">·</span>
                  <span className="font-mono text-slate-500 tabular-nums shrink-0">
                    {formatFileSize(uploadedFile.size)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedFile(null);
                    setRawText('');
                    setErrorMessage(null);
                  }}
                  aria-label={`Remove uploaded file ${uploadedFile.name}`}
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            )}

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="flex flex-1 flex-col"
            >
              {inputMode === 'upload' && !rawText ? (
                <div
                  className={`flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed px-5 py-10 text-center transition-colors min-h-[270px] ${
                    isDraggingFile
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-slate-200 bg-slate-50/40'
                  }`}
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-emerald-700">
                    <Upload className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    Drop a text file here, or browse from your device
                  </p>
                  <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">
                    Supports .txt, .csv, .tsv, .log, .md, .json, and .eml files up to 512 KB. Read directly in browser memory.
                  </p>
                  <label
                    htmlFor={fileInputId}
                    className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 whitespace-nowrap focus-within:ring-2 focus-within:ring-emerald-600"
                  >
                    <Upload className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                    <span>Choose File</span>
                  </label>
                </div>
              ) : (
                <textarea
                  id={textareaId}
                  value={rawText}
                  onChange={(e) => {
                    setRawText(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={tool.placeholder}
                  rows={12}
                  spellCheck={false}
                  className={`w-full flex-1 resize-y rounded-lg border p-3.5 font-mono text-[13px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-colors ${
                    isDraggingFile
                      ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                      : isOverLimit
                      ? 'border-red-300 bg-slate-50/40 focus:border-red-500 focus:ring-red-500/15'
                      : 'border-slate-200 bg-slate-50/40 focus:border-emerald-600 focus:ring-emerald-600/15'
                  }`}
                />
              )}
            </div>

            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Paste or upload up to 6,000 characters per batch
              </span>
              <span
                className={`font-mono tabular-nums font-medium ${
                  isOverLimit ? 'text-red-600' : 'text-slate-500'
                }`}
              >
                {charCount.toLocaleString('en-US')} / {MAX_INPUT_CHARS.toLocaleString('en-US')}
              </span>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-800"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleConvert}
              disabled={isLoading}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Structuring Table...</span>
                </>
              ) : (
                <>
                  <span>Convert to Clean Table</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>

          {/* Right Panel: Interactive Clean Table Preview */}
          <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 sm:p-5 lg:col-span-7">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <h2 className="text-sm font-semibold text-slate-800">Clean Spreadsheet Output</h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyForSheets}
                  disabled={!tableData || isLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  {copiedTable ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                      <span className="text-emerald-700">Copied for Excel/Sheets</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                      <span>Copy Table (For Excel/Sheets)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  disabled={!tableData || isLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-45 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  {downloadedCsv ? (
                    <>
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>CSV Downloaded</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Download .CSV</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {tableData && tableData.rows.length > 0 && (
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <label htmlFor={searchId} className="sr-only">
                    Filter table rows
                  </label>
                  <input
                    id={searchId}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter rows..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/15"
                  />
                </div>
                <span className="font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap">
                  {tableData.rows.length} rows · {tableData.headers.length} columns
                </span>
              </div>
            )}

            {/* Table Area */}
            <div className="relative flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white min-h-[340px] flex flex-col">
              {isLoading ? (
                <div className="p-4 space-y-3" aria-busy="true" aria-label="Generating clean table">
                  <div className="grid grid-cols-4 gap-3 border-b border-slate-200 pb-3">
                    {[0, 1, 2, 3].map((idx) => (
                      <div key={idx} className="h-4 rounded bg-slate-200 animate-pulse" />
                    ))}
                  </div>
                  {[0, 1, 2, 3, 4, 5].map((row) => (
                    <div key={row} className="grid grid-cols-4 gap-3 py-2 border-b border-slate-100">
                      {[0, 1, 2, 3].map((col) => (
                        <div key={col} className="h-3.5 rounded bg-slate-100 animate-pulse" />
                      ))}
                    </div>
                  ))}
                </div>
              ) : tableData ? (
                <>
                  <div className="flex-1 overflow-auto max-h-[430px]">
                    <table className="w-max min-w-full border-collapse text-left text-xs sm:text-[13px]">
                      <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th
                            scope="col"
                            className="w-10 border-r border-slate-200 px-2.5 py-2.5 text-center font-mono text-[11px] font-medium text-slate-400 tabular-nums"
                          >
                            #
                          </th>
                          {tableData.headers.map((header, colIdx) => (
                            <th
                              key={colIdx}
                              scope="col"
                              style={{ minWidth: `${columnMinWidths[colIdx] ?? 120}px` }}
                              className="border-r border-slate-200 last:border-r-0 px-3 py-2.5 font-semibold text-slate-700 whitespace-nowrap"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredRows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={tableData.headers.length + 1}
                              className="px-4 py-10 text-center text-xs text-slate-500"
                            >
                              No rows match &ldquo;{searchQuery}&rdquo;.
                            </td>
                          </tr>
                        ) : (
                          filteredRows.map(({ row, originalIndex }) => (
                            <tr
                              key={originalIndex}
                              className="hover:bg-emerald-50/35 transition-colors"
                            >
                              <td className="border-r border-slate-100 px-2.5 py-2 text-center font-mono text-[11px] text-slate-400 tabular-nums select-none">
                                {originalIndex + 1}
                              </td>
                              {tableData.headers.map((_, colIdx) => (
                                <td
                                  key={colIdx}
                                  style={{ minWidth: `${columnMinWidths[colIdx] ?? 120}px` }}
                                  className="border-r border-slate-100 last:border-r-0 p-0"
                                >
                                  <input
                                    type="text"
                                    aria-label={`Row ${originalIndex + 1}, ${tableData.headers[colIdx]}`}
                                    value={row[colIdx] ?? ''}
                                    onChange={(e) => handleCellEdit(originalIndex, colIdx, e.target.value)}
                                    className="w-full bg-transparent px-3 py-2 font-mono text-xs text-slate-800 tabular-nums focus:bg-emerald-50/70 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-emerald-600"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 px-3 py-2 text-[11px] text-slate-500">
                    <span>Click any cell to edit values before exporting</span>
                    <span className="font-mono tabular-nums">
                      Showing {filteredRows.length} of {tableData.rows.length} rows
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
                    <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Your clean table will appear here
                  </h3>
                  <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-500">
                    Paste unstructured text on the left and click Convert to Clean Table. You can inspect, edit cells inline, copy directly into Excel or Google Sheets, or download a CSV file.
                  </p>
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                  >
                    <FileText className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                    <span>Load Sample Text to Test</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
