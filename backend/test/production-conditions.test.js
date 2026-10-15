import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadProductionConditionEngine() {
  const window = {};
  const context = vm.createContext({ window, globalThis: window, console });
  vm.runInContext(
    fs.readFileSync(new URL('../../config/production-conditions.js', import.meta.url), 'utf8'),
    context
  );
  vm.runInContext(
    fs.readFileSync(new URL('../../core/production-condition-engine.js', import.meta.url), 'utf8'),
    context
  );
  return window;
}

function loadRulesEngineWithProductionConditions() {
  const window = {
    TegraProductionConditions: {
      version: 1,
      conditions: [
        '2GM BROWN BASALT',
        'PMS 430C',
        '4FA PITCH BLUE',
        '41L MARINE',
        'PMS281C',
        '0AV OFF NOIR',
        '01P DARK STEEL GREY',
        '41S COLLEGE NAVY',
        '01V WOLF GREY',
        '00A BLACK'
      ].map((color) => ({
        id: 'test-' + color,
        type: 'DIRECT_TO_BLOCKER',
        active: true,
        color,
        message: 'Approved direct to blocker',
        severity: 'INFO',
        source: 'TEST'
      }))
    },
    ColorConfig: {
      findColorHex: (name) => String(name).toUpperCase().includes('WHITE') ? '#FFFFFF' : '#111111'
    },
    ColorEngine: {
      resolveColor: ({ hex }) => ({ toneCategory: hex === '#FFFFFF' ? 'light' : 'dark' })
    }
  };

  const context = vm.createContext({ window, globalThis: window, console });
  for (const relativePath of [
    '../../core/production-condition-engine.js',
    '../../core/layer-normalizer.js',
    '../../core/sequence-builder.js',
    '../../core/rules-engine.js'
  ]) {
    vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), context);
  }

  return window;
}

test('ProductionConditionEngine requires every current color to have an approved condition', () => {
  const window = loadProductionConditionEngine();

  assert.equal(
    window.ProductionConditionEngine.allColorsHaveCondition([
      '41L MARINE',
      '41S COLLEGE NAVY',
      '00A BLACK'
    ]),
    true
  );

  assert.equal(
    window.ProductionConditionEngine.allColorsHaveCondition([
      '41L MARINE',
      '877 C'
    ]),
    false
  );
});

test('RulesEngine omits White Base when the complete dark-waterbase color set is approved direct to Blocker', () => {
  const window = loadRulesEngineWithProductionConditions();

  const sequence = window.RulesEngine.generarSecuencia({
    customer: 'Fanatics',
    garmentColor: 'SQUADRON BLUE 4LC',
    inkType: 'WATER',
    designColors: [
      { id: 'marine', val: '41L MARINE' },
      { id: 'navy', val: '41S COLLEGE NAVY' },
      { id: 'black', val: '00A BLACK' }
    ]
  });

  const screens = sequence.filter((step) => step.tipo !== 'FLASH' && step.tipo !== 'COOL');

  assert.equal(screens.some((step) => step.tipo === 'WHITE_BASE'), false);
  assert.equal(screens.filter((step) => step.tipo === 'BLOCKER').length, 3);
  assert.equal(screens.filter((step) => step.tipo === 'COLOR').length, 6);
});

test('RulesEngine keeps White Base when one color lacks the approved direct-to-Blocker condition', () => {
  const window = loadRulesEngineWithProductionConditions();

  const sequence = window.RulesEngine.generarSecuencia({
    customer: 'Fanatics',
    garmentColor: 'SQUADRON BLUE 4LC',
    inkType: 'WATER',
    designColors: [
      { id: 'marine', val: '41L MARINE' },
      { id: 'metallic', val: '877 C' }
    ]
  });

  const screens = sequence.filter((step) => step.tipo !== 'FLASH' && step.tipo !== 'COOL');

  assert.equal(screens.some((step) => step.tipo === 'WHITE_BASE'), true);
});

test('Production condition matching exposes the approved production evidence', () => {
  const window = loadProductionConditionEngine();

  const evaluation = window.ProductionConditionEngine.evaluatePlacement({
    designColors: [
      { val: '41L MARINE' },
      { val: 'PMS 430C' }
    ]
  });

  assert.equal(evaluation.directToBlocker, true);
  assert.equal(evaluation.matchedConditions.length, 2);
  assert.deepEqual(
    evaluation.matchedConditions.map((condition) => condition.color),
    ['41L MARINE', 'PMS 430C']
  );
});
