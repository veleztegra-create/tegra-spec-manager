import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadBrowserModule(relativePath) {
  const window = {};
  const context = vm.createContext({ window, globalThis: window, console });
  vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), context);
  return window;
}

test('legacy colors normalize to printColors without losing production entries', () => {
  const { SpecNormalizer } = loadBrowserModule('../../modules/spec-normalizer.js');
  const legacy = {
    colors: [
      { type: 'COLOR', val: 'RED' },
      { type: 'WHITE_BASE', val: 'BASE WHITE' },
      { type: 'BLOCKER', val: 'BLOCKER' }
    ]
  };

  const placement = SpecNormalizer.normalizePlacement(legacy);
  assert.deepEqual(placement.printColors, [{ type: 'COLOR', val: 'RED' }]);
  assert.deepEqual(placement.colors, legacy.colors);
});

test('normalization preserves an existing production sequence unchanged', () => {
  const { SpecNormalizer } = loadBrowserModule('../../modules/spec-normalizer.js');
  const sequence = [
    { type: 'COLOR', val: '872 C', mesh: '122/55', additives: 'A' },
    { type: 'FLASH' },
    { type: 'COLOR', val: '872 C', mesh: '157/48', additives: 'B' },
    { type: 'COOL' }
  ];

  const placement = SpecNormalizer.normalizePlacement({
    colors: [{ type: 'COLOR', val: '872 C' }],
    sequence
  });
  assert.deepEqual(placement.sequence, sequence);
});

test('normalization canonicalizes legacy curing field variants', () => {
  const { SpecNormalizer } = loadBrowserModule('../../modules/spec-normalizer.js');
  const tempTime = SpecNormalizer.normalizePlacement({ temp: '320 °F', time: '1:40 min' }).curing;
  assert.equal(tempTime.temperature, '320 °F');
  assert.equal(tempTime.time, '1:40 min');
  const spanish = SpecNormalizer.normalizePlacement({ temperatura: '300 °F', tiempo: '1:00 min' }).curing;
  assert.equal(spanish.temperature, '300 °F');
  assert.equal(spanish.time, '1:00 min');
});

test('PDF stations consume the existing sequence rather than legacy colors', () => {
  const { PdfSpecRenderer } = loadBrowserModule('../../features/pdf-generator-mejorado.js');
  const stations = PdfSpecRenderer.generateStationsData({
    colors: [{ type: 'COLOR', val: 'LEGACY COLOR' }],
    sequence: [
      { type: 'COLOR', val: 'SEQUENCE COLOR', mesh: '157/48' },
      { type: 'FLASH', val: 'FLASH', mesh: '-' }
    ]
  }, {});

  assert.equal(JSON.stringify(stations.map((station) => station.screenCombined)), JSON.stringify(['SEQUENCE COLOR', 'FLASH']));
  assert.equal(stations.some((station) => station.screenCombined === 'LEGACY COLOR'), false);
});


test('Fanatics Strike Off normalization ignores SWO request and need-by dates', () => {
  const { FanaticsStrikeOffNormalizer } = loadBrowserModule('../../fixes.js');
  const data = [
    ['Customer:', 'Fanatics', 'Team Name:', 'LAC', 'Request Date:', new Date('2026-09-21')],
    ['Category:', 'NFL - Limited', 'Colorway:', 'Rivalry', 'Need by Date:', new Date('2026-10-04')],
    ['Submit #:', '1st Strike Off', 'Requester:', 'Sindy Castro', 'Season:', 'FA27'],
    ['Description:', '37NM-0N4A-97F Los Angeles Chargers-Rivalry Front and Back Number StrikeOff Twill with HSWB', 'PO #:', '210926SCA'],
    ['Artwork Path:', 'https://example.com/art']
  ];

  const normalized = FanaticsStrikeOffNormalizer.normalize(data);
  assert.equal(normalized.style, '37NM-0N4A-97F');
  assert.equal(normalized.sampleType, '1st Strike Off');
  assert.equal(normalized.requestor, 'Sindy Castro');
  assert.equal(normalized.requestDate, undefined);
  assert.equal(normalized.needByDate, undefined);
  assert.equal(normalized.swoSnapshot.requestDate, undefined);
  assert.equal(normalized.swoSnapshot.needByDate, undefined);
});
