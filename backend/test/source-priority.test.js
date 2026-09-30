import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadSourcePriority(initial = {}) {
  const elements = {};
  const document = {
    getElementById(id) {
      return elements[id] || null;
    },
    addEventListener() {}
  };

  const window = {
    Store: {
      state: {
        generalData: { ...initial.generalData },
        fieldSources: { ...(initial.fieldSources || {}) },
        sourceConflicts: []
      }
    },
    document,
    console
  };

  const context = vm.createContext({ window, globalThis: window, document, console, Event: class Event {} });
  vm.runInContext(
    fs.readFileSync(new URL('../../fixes.js', import.meta.url), 'utf8'),
    context
  );

  return { window, elements };
}

test('Tech Pack fills SWO-vacant fields without overwriting SWO fields', () => {
  const { window, elements } = loadSourcePriority({
    generalData: { season: 'FA26', gender: '', fabric: '' },
    fieldSources: { season: 'SWO' }
  });

  elements.season = { value: 'FA26', dispatchEvent() {} };
  elements.gender = { value: '', dispatchEvent() {} };
  elements.fabric = { value: '', dispatchEvent() {} };

  const season = window.SourcePriority.mergeTechPackField('season', 'FA27', 'season');
  const gender = window.SourcePriority.mergeTechPackField('gender', 'Women', 'gender');
  const fabric = window.SourcePriority.mergeTechPackField('fabric', 'PPF', 'fabric');

  assert.equal(season.action, 'conflict');
  assert.equal(elements.season.value, 'FA26');
  assert.equal(window.Store.state.generalData.season, 'FA26');

  assert.equal(gender.action, 'filled');
  assert.equal(window.Store.state.generalData.gender, 'Women');
  assert.equal(window.Store.state.fieldSources.gender, 'TECHPACK');

  assert.equal(fabric.action, 'filled');
  assert.equal(window.Store.state.generalData.fabric, 'PPF');
  assert.equal(window.Store.state.fieldSources.fabric, 'TECHPACK');

  assert.equal(window.Store.state.sourceConflicts.length, 1);
  assert.equal(window.Store.state.sourceConflicts[0].field, 'season');
  assert.equal(window.Store.state.sourceConflicts[0].swoValue, 'FA26');
  assert.equal(window.Store.state.sourceConflicts[0].techPackValue, 'FA27');
});

test('Fanatics Water Base expectation raises a conflict when Tech Pack explicitly says Silicone', () => {
  const { window, elements } = loadSourcePriority({
    generalData: { customer: 'Fanatics' },
    fieldSources: { customer: 'SWO' }
  });

  elements.customer = { value: 'Fanatics', dispatchEvent() {} };

  const result = window.SourcePriority.evaluateTechPackInkConflict('SILICONE');

  assert.equal(result.action, 'conflict');
  assert.equal(result.conflict.field, 'inkType');
  assert.equal(result.conflict.expectedValue, 'WATER');
  assert.equal(result.conflict.techPackValue, 'SILICONE');
  assert.equal(window.Store.state.sourceConflicts.length, 1);
});

test('Tech Pack source does not overwrite an already populated non-SWO field either', () => {
  const { window, elements } = loadSourcePriority({
    generalData: { fabric: 'Cotton' },
    fieldSources: { fabric: 'USER' }
  });

  elements.fabric = { value: 'Cotton', dispatchEvent() {} };

  const result = window.SourcePriority.mergeTechPackField('fabric', 'PPF', 'fabric');

  assert.equal(result.action, 'protected');
  assert.equal(elements.fabric.value, 'Cotton');
  assert.equal(window.Store.state.generalData.fabric, 'Cotton');
  assert.equal(window.Store.state.sourceConflicts.length, 0);
});
