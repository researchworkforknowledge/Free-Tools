import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_UPLOAD_BYTES,
  formatFileSize,
  processUploadedFileText,
  validateUploadedFileMeta,
} from './fileUpload';
import { MAX_INPUT_CHARS } from '../data/tools';

test('formatFileSize formats bytes and kilobytes cleanly', () => {
  assert.equal(formatFileSize(512), '512 B');
  assert.equal(formatFileSize(1536), '1.5 KB');
  assert.equal(formatFileSize(25600), '25 KB');
});

test('validateUploadedFileMeta accepts supported text files and rejects unsupported or oversized ones', () => {
  assert.equal(validateUploadedFileMeta({ name: 'orders.csv', size: 1200, type: 'text/csv' }).valid, true);
  assert.equal(validateUploadedFileMeta({ name: 'notes.txt', size: 400, type: '' }).valid, true);
  assert.equal(validateUploadedFileMeta({ name: 'dump.log', size: 800, type: '' }).valid, true);

  const pdfRes = validateUploadedFileMeta({ name: 'report.pdf', size: 1024, type: 'application/pdf' });
  assert.equal(pdfRes.valid, false);

  const emptyRes = validateUploadedFileMeta({ name: 'empty.txt', size: 0, type: 'text/plain' });
  assert.equal(emptyRes.valid, false);

  const largeRes = validateUploadedFileMeta({ name: 'huge.txt', size: MAX_UPLOAD_BYTES + 1, type: 'text/plain' });
  assert.equal(largeRes.valid, false);
});

test('processUploadedFileText rejects binary/blank content and warns cleanly when over 6,000 chars', () => {
  const binaryRes = processUploadedFileText('abc\u0000def', 'bad.txt');
  assert.equal(binaryRes.ok, false);

  const blankRes = processUploadedFileText('   \n\t  ', 'blank.txt');
  assert.equal(blankRes.ok, false);

  const validRes = processUploadedFileText('line1\r\nline2', 'good.txt');
  assert.equal(validRes.ok, true);
  if (validRes.ok) {
    assert.equal(validRes.text, 'line1\nline2');
    assert.equal(validRes.warning, null);
  }

  const longRes = processUploadedFileText('x'.repeat(MAX_INPUT_CHARS + 25), 'long.txt');
  assert.equal(longRes.ok, true);
  if (longRes.ok) {
    assert.equal(longRes.text.length, MAX_INPUT_CHARS + 25);
    assert.ok(longRes.warning && longRes.warning.includes('6,000'));
  }
});
