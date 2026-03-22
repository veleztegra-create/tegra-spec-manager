import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLuminance,
  clampColorThreshold,
  clampLimit,
  mapPlacementForDb,
  normalizeColor,
  normalizeDateOrNow,
  normalizePalettePayload,
  normalizeSpecPayload,
  normalizeRgb,
  toOptionalString
} from '../src/routes/normalizers.js';

test('clampLimit normalizes bad, negative and high values', () => {
  assert.equal(clampLimit(undefined), 20);
  assert.equal(clampLimit('abc'), 20);
  assert.equal(clampLimit(-5), 1);
  assert.equal(clampLimit(0), 1);
  assert.equal(clampLimit(999), 100);
  assert.equal(clampLimit(15.8), 15);
});

test('toOptionalString trims values and converts empty to null', () => {
  assert.equal(toOptionalString('  demo  '), 'demo');
  assert.equal(toOptionalString(''), null);
  assert.equal(toOptionalString('   '), null);
  assert.equal(toOptionalString(null), null);
});

test('normalizeDateOrNow falls back for invalid dates', () => {
  const date = normalizeDateOrNow('not-a-date');
  assert.equal(Number.isNaN(date.getTime()), false);
});

test('normalizeRgb coerces to 0..255 integers', () => {
  assert.deepEqual(normalizeRgb({ r: '260', g: '-1', b: 13.9 }), { r: 255, g: 0, b: 13 });
  assert.deepEqual(normalizeRgb(null), { r: 0, g: 0, b: 0 });
});

test('clampColorThreshold keeps values in 0..255', () => {
  assert.equal(clampColorThreshold(undefined), 155);
  assert.equal(clampColorThreshold(-20), 0);
  assert.equal(clampColorThreshold(400), 255);
  assert.equal(clampColorThreshold('140.9'), 140);
});

test('calculateLuminance derives brightness from RGB', () => {
  assert.equal(calculateLuminance({ r: 255, g: 255, b: 255 }), 255);
  assert.equal(calculateLuminance({ r: 0, g: 0, b: 0 }), 0);
});

test('normalizeColor validates hex and rgb payload', () => {
  const color = normalizeColor({ hex: 'bad', rgb: { r: 1, g: 2, b: 3 }, name: '  Navy ' }, 2, 155);
  assert.equal(color.hex, '#000000');
  assert.equal(color.orderIndex, 2);
  assert.equal(color.name, 'Navy');
  assert.deepEqual(color.rgbJson, { r: 1, g: 2, b: 3 });
  assert.equal(color.toneCategory, 'dark');
  assert.equal(color.luminance, 1.81);
});

test('normalizePalettePayload builds safe defaults', () => {
  const payload = normalizePalettePayload({
    totalColors: -2,
    extractedAt: 'invalid-date',
    classificationThreshold: 170,
    colors: [{ hex: '#fff', rgb: { r: 255, g: 255, b: 255 } }]
  });

  assert.equal(payload.totalColors, 1);
  assert.equal(payload.source, 'dashboard-techpack-palette-extractor');
  assert.equal(payload.classificationThreshold, 170);
  assert.equal(Number.isNaN(payload.extractedAt.getTime()), false);
  assert.equal(payload.colors.length, 1);
  assert.equal(payload.colors[0].hex, '#fff');
  assert.equal(payload.colors[0].toneCategory, 'light');
});

test('normalizeSpecPayload and mapPlacementForDb sanitize entities', () => {
  const specPayload = normalizeSpecPayload({
    generalData: 'invalid',
    meta: 'invalid',
    placements: [null, { name: ' Chest ', inkType: '' }]
  });

  assert.deepEqual(specPayload.generalData, {});
  assert.deepEqual(specPayload.meta, {});
  assert.equal(specPayload.placements.length, 1);

  const mapped = mapPlacementForDb(specPayload.placements[0], 0);
  assert.equal(mapped.name, 'Chest');
  assert.equal(mapped.inkType, null);
  assert.equal(mapped.orderIndex, 0);
});

test('normalizeSpecPayload accepts legacy flat general-data fields', () => {
  const specPayload = normalizeSpecPayload({
    style: 'FB-100',
    customer: 'Nike',
    po: 'PO-55',
    placements: []
  });

  assert.equal(specPayload.generalData.style, 'FB-100');
  assert.equal(specPayload.generalData.customer, 'Nike');
  assert.equal(specPayload.generalData.po, 'PO-55');
});
