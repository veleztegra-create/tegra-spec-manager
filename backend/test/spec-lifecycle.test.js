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
