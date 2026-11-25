import test from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeCsvCell,
  filterTableRows,
  generateCsvContent,
  generateTsvContent,
  normalizeTableData,
  validateConversionInput,
} from './tableExport';
import { CONVERTER_TOOLS, MAX_INPUT_CHARS, getToolByPath } from '../data/tools';

test('validateConversionInput rejects empty or oversized strings', () => {
  const empty = validateConversionInput('   \n  ');
  assert.equal(empty.valid, false);

  const oversized = validateConversionInput('a'.repeat(MAX_INPUT_CHARS + 1));
  assert.equal(oversized.valid, false);

  const exactLimit = validateConversionInput('a'.repeat(MAX_INPUT_CHARS));
  assert.equal(exactLimit.valid, true);
});

test('normalizeTableData pads short rows and trims extra cells to header length', () => {
  const normalized = normalizeTableData({
    headers: ['Name', 'Amount', 'City'],
    rows: [
      ['Priya', 2450],
      ['Rohan', '8999', 'Gurugram', 'Extra'],
    ],
  });

  assert.deepEqual(normalized.headers, ['Name', 'Amount', 'City']);
  assert.deepEqual(normalized.rows, [
    ['Priya', '2450', ''],
    ['Rohan', '8999', 'Gurugram'],
  ]);
});

test('escapeCsvCell and generateCsvContent handle commas, quotes, and newlines properly', () => {
  assert.equal(escapeCsvCell('Simple'), 'Simple');
  assert.equal(escapeCsvCell('Pune, India'), '"Pune, India"');
  assert.equal(escapeCsvCell('Said "Hello"'), '"Said ""Hello"""');
  assert.equal(escapeCsvCell('Line1\nLine2'), '"Line1\nLine2"');

  const csv = generateCsvContent({
    headers: ['Customer', 'Notes'],
    rows: [['Meera, Iyer', '2x "Monitor"']],
  });
  assert.equal(csv, 'Customer,Notes\r\n"Meera, Iyer","2x ""Monitor"""');
});

test('generateTsvContent produces tab-separated lines safe for Excel/Sheets paste', () => {
  const tsv = generateTsvContent({
    headers: ['Date', 'Particulars', 'Debit'],
    rows: [['01/11/2026', 'Zomato\tOrder\nLunch', '642.00']],
  });

  assert.equal(tsv, 'Date\tParticulars\tDebit\n01/11/2026\tZomato Order Lunch\t642.00');
});

test('filterTableRows returns matching rows with original indices', () => {
  const matches = filterTableRows(
    {
      headers: ['Name', 'City'],
      rows: [
        ['Priya Nair', 'Pune'],
        ['Rohan Mehta', 'Gurugram'],
        ['Meera Iyer', 'Chennai'],
      ],
    },
    'pune'
  );

  assert.equal(matches.length, 1);
  assert.equal(matches[0].originalIndex, 0);
});

test('all 6 programmatic SEO routes have unique metadata, valid samples, and ~400-word guides', () => {
  assert.equal(CONVERTER_TOOLS.length, 6);

  const titles = new Set<string>();
  const descriptions = new Set<string>();
  const slugs = new Set<string>();

  for (const tool of CONVERTER_TOOLS) {
    assert.ok(!slugs.has(tool.slug), `Duplicate slug: ${tool.slug}`);
    slugs.add(tool.slug);

    assert.ok(!titles.has(tool.metaTitle), `Duplicate metaTitle: ${tool.metaTitle}`);
    titles.add(tool.metaTitle);

    assert.ok(!descriptions.has(tool.metaDescription), `Duplicate metaDescription: ${tool.metaDescription}`);
    descriptions.add(tool.metaDescription);

    assert.ok(tool.sampleData.length > 50 && tool.sampleData.length <= MAX_INPUT_CHARS);
    assert.equal(tool.seoGuide.faqs.length, 3);
    assert.equal(tool.seoGuide.howToUse.length, 3);
    assert.equal(tool.seoGuide.useCases.length, 3);

    const guideWordCount = [
      tool.seoGuide.intro,
      ...tool.seoGuide.howToUse,
      ...tool.seoGuide.useCases.flatMap((u) => [u.title, u.detail]),
      ...tool.seoGuide.faqs.flatMap((f) => [f.question, f.answer]),
    ]
      .join(' ')
      .trim()
      .split(/\s+/).length;

    assert.ok(guideWordCount >= 350, `SEO guide too short for ${tool.slug}: ${guideWordCount} words`);
  }

  assert.equal(getToolByPath('/bank-statement-text-to-excel/').slug, '/bank-statement-text-to-excel');
  assert.equal(getToolByPath('/nonexistent').slug, '/');
});
