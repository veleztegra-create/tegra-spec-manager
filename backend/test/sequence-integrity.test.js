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


test('RulesEngine treats WHITE 10A as explicit reinforcement and does not duplicate an automatic B reinforcement', () => {
  const window = {
    ColorConfig: {
      findColorHex: (name) => String(name).toUpperCase().includes('WHITE') ? '#FFFFFF' : '#111111'
    },
    ColorEngine: {
      resolveColor: ({ hex }) => ({ toneCategory: hex === '#FFFFFF' ? 'light' : 'dark' })
    }
  };
  const context = vm.createContext({ window, globalThis: window, console });

  for (const relativePath of ['../../core/layer-normalizer.js', '../../core/sequence-builder.js', '../../core/rules-engine.js']) {
    vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), context);
  }

  const sequence = window.RulesEngine.generarSecuencia({
    customer: 'Fanatics',
    garmentColor: 'Black00A',
    inkType: 'WATER',
    designColors: [{ id: 'white-10a', val: 'WHITE 10A' }, { id: 'red', val: '7555 C' }]
  });

  const screens = sequence.filter((step) => step.tipo !== 'FLASH' && step.tipo !== 'COOL');
  const whiteBaseScreens = screens.filter((step) => step.tipo === 'WHITE_BASE');

  assert.deepEqual(
    whiteBaseScreens.map((step) => step.nombre),
    ['BLOCKER CHT', 'BLOCKER CHT', 'BLOCKER CHT', 'AQUAFLEX V2', 'AQUAFLEX V2']
  );
  assert.equal(
    screens.filter((step) => step.tipo === 'COLOR' && step.screenLetter === '1' && step.nombre === 'REF. AQUAFLEX MAGNA').length,
    1
  );
  assert.equal(
    screens.filter((step) => step.nombre === 'REF. AQUAFLEX MAGNA' && step.tipo === 'WHITE_BASE').length,
    0
  );
});


test('SpecLifecycle records a small sequence change without creating a new version', () => {
  const { SpecLifecycle } = loadBrowserModule('../../modules/spec-lifecycle.js');
  const styleVersion = { number: 4, updatedAt: null, updatedBy: null, auditTrail: [] };
  const entry = SpecLifecycle.createAuditEntry({
    actor: 'Development',
    path: 'placements[1].sequence[4].screenLetter',
    oldValue: '2',
    newValue: '4',
    reason: 'Desarrollo solicitó abrir el color 2 en dos pantallas',
    fromVersion: 4,
    toVersion: 4,
    at: '2026-09-25T10:00:00.000Z'
  });

  SpecLifecycle.touchVersionMetadata(styleVersion, {
    at: entry.at,
    actor: entry.actor,
    entry
  });

  assert.equal(styleVersion.number, 4);
  assert.equal(styleVersion.updatedAt, entry.at);
  assert.equal(styleVersion.updatedBy, 'Development');
  assert.equal(styleVersion.auditTrail.length, 1);
  assert.equal(styleVersion.auditTrail[0].oldValue, '2');
  assert.equal(styleVersion.auditTrail[0].newValue, '4');
  assert.equal(styleVersion.auditTrail[0].fromVersion, 4);
  assert.equal(styleVersion.auditTrail[0].toVersion, 4);
});

test('StyleVersion preserves audit trail while ignoring SWO request dates', () => {
  const { StyleVersion } = loadBrowserModule('../../modules/style-version.js');
  const normalized = StyleVersion.normalizeStyleVersion({
    number: 2,
    createdAt: '2026-09-25T09:00:00.000Z',
    updatedAt: '2026-09-25T10:00:00.000Z',
    updatedBy: 'Development',
    auditTrail: [{
      action: 'CHANGE',
      actor: 'Development',
      at: '2026-09-25T10:00:00.000Z',
      path: 'sequence[4].screenLetter',
      oldValue: '2',
      newValue: '4'
    }],
    swoSnapshot: {
      requestDate: '2026-09-21',
      needByDate: '2026-10-04'
    }
  });

  assert.equal(normalized.createdAt, '2026-09-25T09:00:00.000Z');
  assert.equal(normalized.updatedBy, 'Development');
  assert.equal(normalized.auditTrail.length, 1);
  assert.equal(normalized.swoSnapshot.requestDate, undefined);
  assert.equal(normalized.swoSnapshot.needByDate, undefined);
});
