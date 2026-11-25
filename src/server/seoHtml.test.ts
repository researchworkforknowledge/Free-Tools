import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSitemapXml, injectRouteSeoMeta } from './seoHtml';
import { convertMessyTextToTable } from './convertService';
import { CONVERTER_TOOLS, MAX_INPUT_CHARS } from '../data/tools';

test('generateSitemapXml includes all 6 converter routes', () => {
  const xml = generateSitemapXml('https://cleansheet.example.com');
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  for (const tool of CONVERTER_TOOLS) {
    const expectedLoc = `https://cleansheet.example.com${tool.slug === '/' ? '/' : tool.slug}`;
    assert.ok(xml.includes(`<loc>${expectedLoc}</loc>`), `Missing ${expectedLoc} in sitemap`);
  }
});

test('injectRouteSeoMeta injects unique title, description, canonical, and JSON-LD per route', () => {
  const baseHtml = `<!doctype html><html><head><title>Old</title><meta name="description" content="Old" /><meta property="og:title" content="Old" /><meta property="og:description" content="Old" /></head><body></body></html>`;

  const bankHtml = injectRouteSeoMeta(baseHtml, '/bank-statement-text-to-excel', 'https://cleansheet.example.com');
  assert.ok(bankHtml.includes('Bank Statement &amp; UPI Text to Excel Converter | CleanSheet AI'));
  assert.ok(bankHtml.includes('https://cleansheet.example.com/bank-statement-text-to-excel'));
  assert.ok(bankHtml.includes('application/ld+json'));
});

test('convertMessyTextToTable rejects empty and >6,000 character payloads cleanly', async () => {
  const emptyRes = await convertMessyTextToTable({ text: '   ', toolSlug: '/' });
  assert.equal(emptyRes.status, 400);
  assert.ok('error' in emptyRes.body);

  const oversizedRes = await convertMessyTextToTable({
    text: 'x'.repeat(MAX_INPUT_CHARS + 1),
    toolSlug: '/invoice-text-to-spreadsheet',
  });
  assert.equal(oversizedRes.status, 400);
  assert.ok('error' in oversizedRes.body);
  assert.ok(oversizedRes.body.error.includes('6,000'));
});
