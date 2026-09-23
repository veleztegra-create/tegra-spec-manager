import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadBrowserModules(relativePaths) {
  const window = {};
  const context = vm.createContext({ window, globalThis: window, console });
  for (const relativePath of relativePaths) {
    vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), context);
  }
  return window;
}

test('legacy specs normalize lifecycle and style version separately without losing sequence', () => {
  const { SpecNormalizer } = loadBrowserModules([
    '../../modules/spec-lifecycle.js',
    '../../modules/style-version.js',
    '../../modules/spec-normalizer.js'
  ]);

  const sequence = [
    { type: 'BLOCKER', val: 'BLOCKER CHT', mesh: '157/48' },
    { type: 'FLASH', val: 'FLASH' }
  ];

  const spec = SpecNormalizer.normalizeSpecData({
    style: '67NM',
    sampleType: 'QRS PPF',
    pattern: '530926F_24',
    specLifecycle: { status: 'DRAFT', source: 'RULE_ENGINE', version: 1 },
    placements: [{ sequence }]
  });

  assert.equal(spec.specLifecycle.status, 'DRAFT');
  assert.equal(spec.specLifecycle.source, 'RULE_ENGINE');
  assert.equal(spec.specLifecycle.version, undefined);
  assert.equal(spec.styleVersion.number, 1);
  assert.equal(spec.styleVersion.stage.sampleType, 'QRS PPF');
  assert.equal(spec.styleVersion.stage.isPPF, true);
  assert.equal(spec.styleVersion.swoSnapshot.pattern, '530926F_24');
  assert.deepEqual(spec.placements[0].sequence, sequence);
});

test('overall lifecycle status is derived conservatively from placement lifecycles', () => {
  const { SpecLifecycle } = loadBrowserModules(['../../modules/spec-lifecycle.js']);

  assert.equal(SpecLifecycle.deriveOverallStatus([]), 'DRAFT');
  assert.equal(
    SpecLifecycle.deriveOverallStatus([
      { sequenceLifecycle: { status: 'DEVELOPMENT_APPROVED' } },
      { sequenceLifecycle: { status: 'DEVELOPMENT_APPROVED' } }
    ]),
    'DEVELOPMENT_APPROVED'
  );
  assert.equal(
    SpecLifecycle.deriveOverallStatus([
      { sequenceLifecycle: { status: 'DEVELOPMENT_APPROVED' } },
      { sequenceLifecycle: { status: 'DRAFT' } }
    ]),
    'DRAFT'
  );
  assert.equal(
    SpecLifecycle.deriveOverallStatus([
      { sequenceLifecycle: { status: 'DEVELOPMENT_APPROVED' } },
      { sequenceLifecycle: { status: 'DEVELOPMENT' } }
    ]),
    'DEVELOPMENT'
  );
  assert.equal(
    SpecLifecycle.deriveOverallStatus([
      { sequenceLifecycle: { status: 'PRODUCTION_LOCKED' } },
      { sequenceLifecycle: { status: 'PRODUCTION_LOCKED' } }
    ]),
    'PRODUCTION_LOCKED'
  );
});

test('locked sequence is not editable without explicit permission', () => {
  const { SpecLifecycle } = loadBrowserModules(['../../modules/spec-lifecycle.js']);

  assert.equal(
    SpecLifecycle.canEditSequence(
      { status: 'PRODUCTION_LOCKED' },
      { canEditLockedSequence: false }
    ),
    false
  );
  assert.equal(
    SpecLifecycle.canEditSequence(
      { status: 'PRODUCTION_LOCKED' },
      { canEditLockedSequence: true }
    ),
    true
  );
});

test('authorized override creates a new style version and preserves the parent version', () => {
  const { StyleVersion } = loadBrowserModules(['../../modules/style-version.js']);

  const next = StyleVersion.createDerivedVersion(
    {
      number: 4,
      label: '1st Proto',
      stage: { sampleType: '1st Proto', isPPF: false },
      swoSnapshot: { style: '67NM' }
    },
    {
      authorized: true,
      override: true,
      currentStatus: 'PRODUCTION_LOCKED',
      label: 'External Testing'
    }
  );

  assert.equal(next.number, 5);
  assert.equal(next.parentVersion, 4);
  assert.equal(next.label, 'External Testing');
  assert.equal(next.stage.sampleType, '1st Proto');
});

test('locked style version cannot be forked without authorization', () => {
  const { StyleVersion } = loadBrowserModules(['../../modules/style-version.js']);

  assert.throws(
    () => StyleVersion.createDerivedVersion(
      { number: 4, stage: { sampleType: '1st Proto' } },
      { authorized: false, override: true, currentStatus: 'PRODUCTION_LOCKED' }
    ),
    /autorización explícita/
  );
});

test('stage remains data-driven and is not inferred from version number', () => {
  const { StyleVersion } = loadBrowserModules(['../../modules/style-version.js']);

  const version = StyleVersion.createStyleVersion(
    {
      style: '67NM',
      sampleType: 'QRS PPF',
      pattern: '530926F_24'
    },
    {
      number: 4,
      label: 'Custom Stage'
    }
  );

  assert.equal(version.number, 4);
  assert.equal(version.label, 'Custom Stage');
  assert.equal(version.stage.sampleType, 'QRS PPF');
  assert.equal(version.stage.isPPF, true);
});

test('audit entry records actor, authorization, reason and before/after values', () => {
  const { SpecLifecycle } = loadBrowserModules(['../../modules/spec-lifecycle.js']);

  const audit = SpecLifecycle.appendAuditEntry([], {
    id: 'audit-1',
    action: 'AUTHORIZED_OVERRIDE',
    actor: 'production-user',
    authorizedBy: 'supervisor-user',
    reason: 'Corrección urgente de malla',
    at: '2026-09-21T20:00:00.000Z',
    path: 'placements[0].sequence[4].mesh',
    oldValue: '157/48',
    newValue: '198/40',
    fromVersion: 4,
    toVersion: 5
  });

  assert.equal(audit.length, 1);
  assert.equal(audit[0].authorizedBy, 'supervisor-user');
  assert.equal(audit[0].oldValue, '157/48');
  assert.equal(audit[0].newValue, '198/40');
  assert.equal(audit[0].fromVersion, 4);
  assert.equal(audit[0].toVersion, 5);
});

test('Store and spec data model preserve styleVersion, lifecycle, audit trail and sequence', () => {
  const window = {};
  const context = vm.createContext({ window, globalThis: window, console });
  for (const relativePath of [
    '../../modules/spec-lifecycle.js',
    '../../modules/style-version.js',
    '../../modules/spec-normalizer.js',
    '../../modules/store.js',
    '../../modules/spec-data-model.js'
  ]) {
    vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), context);
  }

  window.Store.replaceState({
    generalData: {
      style: '67NM',
      customer: 'Fanatics',
      season: 'FA26',
      pattern: '530926F_24',
      sampleType: 'QRS PPF',
      po: '111825SRB'
    },
    styleVersion: {
      number: 3,
      label: 'PPS',
      parentVersion: 2,
      stage: { sampleType: 'QRS PPF' },
      swoSnapshot: { style: '67NM' }
    },
    specLifecycle: {
      status: 'DEVELOPMENT_APPROVED',
      source: 'DEVELOPMENT',
      approvedBy: 'development-user',
      approvedAt: '2026-09-21T20:00:00.000Z'
    },
    auditTrail: [{
      action: 'APPROVED',
      actor: 'development-user',
      at: '2026-09-21T20:00:00.000Z',
      fromVersion: 2,
      toVersion: 3
    }],
    placements: [{
      id: 1,
      sequenceLifecycle: { status: 'DEVELOPMENT_APPROVED', source: 'DEVELOPMENT' },
      sequence: [{ type: 'COLOR', val: '872 C', mesh: '122/55' }]
    }]
  });

  const data = window.buildSpecData();
  assert.equal(data.styleVersion.number, 3);
  assert.equal(data.styleVersion.label, 'PPS');
  assert.equal(data.styleVersion.parentVersion, 2);
  assert.equal(data.styleVersion.stage.sampleType, 'QRS PPF');
  assert.equal(data.styleVersion.stage.isPPF, true);
  assert.equal(data.specLifecycle.status, 'DEVELOPMENT_APPROVED');
  assert.equal(data.specLifecycle.approvedBy, 'development-user');
  assert.equal(data.auditTrail.length, 1);
  assert.deepEqual(data.placements[0].sequence, [{ type: 'COLOR', val: '872 C', mesh: '122/55' }]);
});
