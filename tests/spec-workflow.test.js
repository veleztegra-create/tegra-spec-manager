import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadWorkflow() {
  const context = vm.createContext({ console, Date });
  context.window = context;
  context.globalThis = context;
  vm.runInContext(
    fs.readFileSync(new URL('../modules/spec-workflow.js', import.meta.url), 'utf8'),
    context
  );
  return context.SpecWorkflow;
}

test('legacy single-PO specs normalize to one linked order without changing their stage', () => {
  const workflow = loadWorkflow();
  const normalized = workflow.normalizeWorkflow({}, {
    po: 'PO-1001',
    sampleType: 'DEV 1st Proto',
    customer: 'Fanatics',
    season: 'FA27'
  });

  assert.equal(normalized.orders.length, 1);
  assert.equal(normalized.orders[0].po, 'PO-1001');
  assert.equal(normalized.orders[0].stage, 'DEV 1st Proto');
  assert.equal(normalized.sequenceScope, 'SHARED_ARTWORK');
});

test('one shared spec can link multiple POs with different stages', () => {
  const workflow = loadWorkflow();
  let spec = workflow.createWorkflow({ id: 'SPEC-381893F', artwork: { sharingConfirmed: true } });
  spec = workflow.linkOrder(spec, {
    po: 'PO-1001', stage: 'DEV 1st Proto', swoId: 'SWO-01'
  }, { confirmSameArtwork: true, confirmedBy: 'Diana' });
  spec = workflow.linkOrder(spec, {
    po: 'PO-1002', stage: 'Size Set', swoId: 'SWO-02'
  }, { confirmSameArtwork: true, confirmedBy: 'Diana' });

  assert.equal(spec.orders.length, 2);
  assert.deepEqual(
    Array.from(spec.orders, (order) => [order.po, order.stage]),
    [['PO-1001', 'DEV 1st Proto'], ['PO-1002', 'Size Set']]
  );
  assert.equal(spec.artwork.sharingConfirmed, true);
});

test('legacy PO is recovered when the workflow object was initialized before Excel import', () => {
  const workflow = loadWorkflow();
  const initialized = workflow.normalizeWorkflow({});
  const afterExcelImport = workflow.normalizeWorkflow(initialized, {
    po: 'PO-2001',
    sampleType: 'Size Set'
  });
  assert.equal(afterExcelImport.orders.length, 1);
  assert.equal(afterExcelImport.orders[0].po, 'PO-2001');
  assert.equal(afterExcelImport.orders[0].stage, 'Size Set');
});

test('linking a second PO requires explicit same-artwork confirmation', () => {
  const workflow = loadWorkflow();
  let spec = workflow.createWorkflow({ id: 'SPEC-1' });
  spec = workflow.linkOrder(spec, { po: 'PO-1', stage: 'Proto' });
  assert.throws(
    () => workflow.linkOrder(spec, { po: 'PO-2', stage: 'Size Set' }),
    /mismo arte/
  );
});

test('the last active order cannot be detached from its Spec', () => {
  const workflow = loadWorkflow();
  let spec = workflow.createWorkflow({ id: 'SPEC-1' });
  spec = workflow.linkOrder(spec, { po: 'PO-1', stage: 'Proto' });
  assert.throws(
    () => workflow.unlinkOrder(spec, { po: 'PO-1', stage: 'Proto' }),
    /última orden/
  );
});

test('duplicate PO/stage/SWO association is not added twice', () => {
  const workflow = loadWorkflow();
  let spec = workflow.createWorkflow({ id: 'SPEC-1' });
  spec = workflow.linkOrder(spec, { po: 'PO-1', stage: 'Proto', swoId: 'SWO-1' });
  spec = workflow.linkOrder(spec, { po: 'PO-1', stage: 'Proto', swoId: 'SWO-1' });

  assert.equal(spec.orders.length, 1);
});

test('review rounds preserve outbound and returned files and declared supervisor validation', () => {
  const workflow = loadWorkflow();
  let spec = workflow.createWorkflow({
    id: 'SPEC-1',
    orders: [
      { po: 'PO-1', stage: 'Proto' },
      { po: 'PO-2', stage: 'Size Set' }
    ]
  });

  spec = workflow.startReviewRound(spec, {
    sentAt: '2026-11-07T09:00:00.000Z',
    sentBy: 'Diana',
    outgoingFileName: 'SPEC-1-R01.html'
  });
  spec = workflow.returnFromReview(spec, {
    round: 1,
    returnedAt: '2026-11-07T11:00:00.000Z',
    returnedBy: 'Diana',
    incomingFileName: 'SPEC-1-R01-validated.html',
    validation: {
      status: 'VALIDATED',
      declaredBy: 'Anibal',
      role: 'Screen Printing Development Supervisor',
      validatedAt: '2026-11-07T10:55:00.000Z'
    },
    changeSummary: 'Mesh updated'
  });

  assert.equal(spec.currentRound, 1);
  assert.equal(spec.status, 'SUPERVISOR_VALIDATED');
  assert.equal(spec.reviewHistory[0].outgoingFileName, 'SPEC-1-R01.html');
  assert.equal(spec.reviewHistory[0].incomingFileName, 'SPEC-1-R01-validated.html');
  assert.equal(spec.reviewHistory[0].validation.declaredBy, 'Anibal');
  assert.equal(spec.reviewHistory[0].validation.verification, 'FILE_DECLARATION');
});

test('a second review round can start after the first one is returned', () => {
  const workflow = loadWorkflow();
  let spec = workflow.createWorkflow({ id: 'SPEC-1', orders: [{ po: 'PO-1', stage: 'Proto' }] });
  spec = workflow.startReviewRound(spec, { sentAt: '2026-11-07T09:00:00.000Z' });
  spec = workflow.returnFromReview(spec, {
    round: 1,
    returnedAt: '2026-11-07T10:00:00.000Z',
    validation: { status: 'CHANGES_REQUESTED', declaredBy: 'Anibal' }
  });
  spec = workflow.startReviewRound(spec, { sentAt: '2026-11-07T12:00:00.000Z' });

  assert.equal(spec.currentRound, 2);
  assert.equal(spec.reviewHistory.length, 2);
  assert.equal(spec.status, 'AWAITING_REVIEW');
});

test('review cannot start without active orders or while another round is pending', () => {
  const workflow = loadWorkflow();
  assert.throws(() => workflow.startReviewRound(workflow.createWorkflow()), /sin órdenes activas/);

  let spec = workflow.createWorkflow({ id: 'SPEC-1', orders: [{ po: 'PO-1', stage: 'Proto' }] });
  spec = workflow.startReviewRound(spec);
  assert.throws(() => workflow.startReviewRound(spec), /pendiente de revisión/);
});

test('returned file declarations are not treated as authenticated identity', () => {
  const workflow = loadWorkflow();
  let spec = workflow.createWorkflow({ id: 'SPEC-1', orders: [{ po: 'PO-1', stage: 'Proto' }] });
  spec = workflow.startReviewRound(spec);
  spec = workflow.returnFromReview(spec, {
    validation: { status: 'VALIDATED', declaredBy: 'Anibal' }
  });

  assert.equal(spec.reviewHistory[0].validation.verification, 'FILE_DECLARATION');
});
