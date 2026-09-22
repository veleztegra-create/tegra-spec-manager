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

test('legacy specs normalize with a DRAFT lifecycle without losing sequence', () => {
  const { SpecNormalizer } = loadBrowserModules([
    '../../modules/spec-lifecycle.js',
    '../../modules/spec-normalizer.js'
  ]);

  const sequence = [
    { type: 'BLOCKER', val: 'BLOCKER CHT', mesh: '157/48' },
    { type: 'FLASH', val: 'FLASH' }
  ];

  const spec = SpecNormalizer.normalizeSpecData({
    placements: [{ sequence }]
  });

  assert.equal(spec.specLifecycle.status, 'DRAFT');
  assert.equal(spec.specLifecycle.source, 'RULE_ENGINE');
  assert.equal(spec.specLifecycle.version, 1);
  assert.deepEqual(spec.placements[0].sequence, sequence);
  assert.equal(spec.placements[0].sequenceLifecycle.status, 'DRAFT');
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
      { status: 'PRODUCTION_LOCKED', version: 4 },
      { canEditLockedSequence: false }
    ),
    false
  );

  assert.equal(
    SpecLifecycle.canEditSequence(
      { status: 'PRODUCTION_LOCKED', version: 4 },
      { canEditLockedSequence: true }
    ),
    true
  );
});

test('authorized override creates a new derived version and preserves the parent version', () => {
  const { SpecLifecycle } = loadBrowserModules(['../../modules/spec-lifecycle.js']);

  const next = SpecLifecycle.createDerivedVersion(
    {
      status: 'PRODUCTION_LOCKED',
      source: 'DEVELOPMENT',
      version: 4
    },
    {
      authorized: true,
      override: true,
      source: 'PRODUCTION',
      status: 'DEVELOPMENT'
    }
  );

  assert.equal(next.version, 5);
  assert.equal(next.parentVersion, 4);
  assert.equal(next.source, 'PRODUCTION');
  assert.equal(next.status, 'DEVELOPMENT');
  assert.equal(next.approvedBy, null);
  assert.equal(next.lockedAt, null);
});

test('locked version cannot be forked without authorization', () => {
  const { SpecLifecycle } = loadBrowserModules(['../../modules/spec-lifecycle.js']);

  assert.throws(
    () => SpecLifecycle.createDerivedVersion(
      { status: 'PRODUCTION_LOCKED', version: 4 },
      { authorized: false, override: true }
    ),
    /autorización explícita/
  );
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


test('Store preserves spec lifecycle and audit trail through serialization state', () => {
  const window = {};
  const context = vm.createContext({ window, globalThis: window, console });
  for (const relativePath of ['../../modules/spec-lifecycle.js', '../../modules/spec-normalizer.js', '../../modules/store.js', '../../modules/spec-data-model.js']) {
    vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), context);
  }

  window.Store.replaceState({
    generalData: { style: '67NM' },
    specLifecycle: {
      status: 'DEVELOPMENT_APPROVED',
      source: 'DEVELOPMENT',
      version: 3,
      approvedBy: 'development-user',
      approvedAt: '2026-09-21T20:00:00.000Z'
    },
    auditTrail: [{
      action: 'APPROVED',
      actor: 'development-user',
      at: '2026-09-21T20:00:00.000Z'
    }],
    placements: [{
      id: 1,
      sequenceLifecycle: { status: 'DEVELOPMENT_APPROVED', source: 'DEVELOPMENT', version: 3 },
      sequence: [{ type: 'COLOR', val: '872 C', mesh: '122/55' }]
    }]
  });

  const data = window.buildSpecData();
  assert.equal(data.specLifecycle.status, 'DEVELOPMENT_APPROVED');
  assert.equal(data.specLifecycle.version, 3);
  assert.equal(data.specLifecycle.approvedBy, 'development-user');
  assert.equal(data.auditTrail.length, 1);
  assert.equal(data.placements[0].sequenceLifecycle.status, 'DEVELOPMENT_APPROVED');
  assert.deepEqual(data.placements[0].sequence, [{ type: 'COLOR', val: '872 C', mesh: '122/55' }]);
});
