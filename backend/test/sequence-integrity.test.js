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

test('LayerNormalizer preserves production order for repeated non-adjacent base steps', () => {
  const { LayerNormalizer } = loadBrowserModule('../../core/layer-normalizer.js');
  const layers = [
    { tipo: 'WHITE_BASE', nombre: 'AQUAFLEX V2', mesh: '122/55', additives: '3% CL 500' },
    { tipo: 'BLOCKER', nombre: 'BLOCKER CHT', mesh: '157/48', additives: '' },
    { tipo: 'WHITE_BASE', nombre: 'AQUAFLEX V2', mesh: '122/55', additives: '3% CL 500' }
  ];

  const normalized = LayerNormalizer.normalizeLayers(layers);

  assert.equal(normalized.length, 3);
  assert.deepEqual(normalized.map((layer) => layer.tipo), ['WHITE_BASE', 'BLOCKER', 'WHITE_BASE']);
  assert.deepEqual(normalized.map((layer) => layer.count), [1, 1, 1]);
});

test('LayerNormalizer only merges adjacent semantically equivalent base steps', () => {
  const { LayerNormalizer } = loadBrowserModule('../../core/layer-normalizer.js');
  const layers = [
    { tipo: 'WHITE_BASE', nombre: 'AQUAFLEX V2', mesh: '122/55', additives: '3% CL 500' },
    { tipo: 'WHITE_BASE', nombre: 'AQUAFLEX V2', mesh: '122/55', additives: '3% CL 500' },
    { tipo: 'WHITE_BASE', nombre: 'REF. AQUAFLEX MAGNA', mesh: '122/55', additives: '3% CL 500' }
  ];

  const normalized = LayerNormalizer.normalizeLayers(layers);

  assert.equal(normalized.length, 2);
  assert.equal(normalized[0].count, 2);
  assert.equal(normalized[0].nombre, 'AQUAFLEX V2');
  assert.equal(normalized[1].nombre, 'REF. AQUAFLEX MAGNA');
});

test('SequenceBuilder preserves repeated production passes and inserts process stations between screens', () => {
  const { SequenceBuilder } = loadBrowserModule('../../core/sequence-builder.js');
  const sequence = SequenceBuilder.buildSequence([
    { tipo: 'WHITE_BASE', nombre: 'AQUAFLEX V2', mesh: '122/55', additives: '', count: 1 },
    { tipo: 'BLOCKER', nombre: 'BLOCKER CHT', mesh: '157/48', additives: '', count: 1 },
    { tipo: 'WHITE_BASE', nombre: 'REF. AQUAFLEX MAGNA', mesh: '122/55', additives: '3% CL 500', count: 1 }
  ]);

  assert.deepEqual(
    sequence.map((step) => step.tipo),
    ['WHITE_BASE', 'FLASH', 'COOL', 'BLOCKER', 'FLASH', 'COOL', 'WHITE_BASE']
  );
  assert.deepEqual(
    sequence.filter((step) => step.tipo !== 'FLASH' && step.tipo !== 'COOL').map((step) => step.nombre),
    ['AQUAFLEX V2', 'BLOCKER CHT', 'REF. AQUAFLEX MAGNA']
  );
});

test('Excel screen count ignores future non-screen process steps', () => {
  const { SpecExcelUtils } = loadBrowserModule('../../modules/export-excel.js');
  const sequence = [
    { type: 'BLOCKER' },
    { type: 'FLASH' },
    { type: 'COOL' },
    { type: 'HOT_HEAD', stationType: 'PROCESS' },
    { type: 'COLOR' },
    { type: 'FLASH' },
    { type: 'COOL' }
  ];

  assert.equal(SpecExcelUtils.countScreensFromSequence(sequence), 2);
  assert.equal(SpecExcelUtils.countStationsFromSequence(sequence), 7);
});

test('Excel screen count uses explicit station type when available', () => {
  const { SpecExcelUtils } = loadBrowserModule('../../modules/export-excel.js');
  const sequence = [
    { type: 'HOT_HEAD', stationType: 'SCREEN' },
    { type: 'COLOR', stationType: 'PROCESS' },
    { type: 'FLASH', stationType: 'PROCESS' }
  ];

  assert.equal(SpecExcelUtils.countScreensFromSequence(sequence), 1);
});

test('Existing sequence remains authoritative over printColors', () => {
  const { SpecNormalizer } = loadBrowserModule('../../modules/spec-normalizer.js');
  const sequence = [
    { type: 'BLOCKER', val: 'BLOCKER CHT', mesh: '110/64' },
    { type: 'FLASH' },
    { type: 'COLOR', val: 'SEQUENCE COLOR', mesh: '198/40' }
  ];
  const placement = SpecNormalizer.normalizePlacement({
    printColors: [{ type: 'COLOR', val: 'DIFFERENT COLOR' }],
    sequence
  });

  assert.deepEqual(placement.sequence, sequence);
  assert.deepEqual(placement.printColors, [{ type: 'COLOR', val: 'DIFFERENT COLOR' }]);
});
