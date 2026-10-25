import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function load(files, extra = {}) {
  const window = { ...extra };
  const context = vm.createContext({ window, globalThis: window, console: { log() {}, warn() {}, info() {} }, document: { addEventListener() {} } });
  files.forEach((f) => vm.runInContext(fs.readFileSync(new URL(`../../${f}`, import.meta.url), 'utf8'), context));
  return window;
}

const FILES = ['rules/sequence-rules.js', 'core/sequence-rules-engine.js', 'core/layer-normalizer.js', 'core/sequence-builder.js', 'core/rules-engine.js'];
const plain = (v) => JSON.parse(JSON.stringify(v));
const label = (seq) => plain(seq.map((s) => (s.tipo === 'HOT_HEAD' ? `HOT_HEAD:${s.mesh}` : s.tipo === 'FLASH' || s.tipo === 'COOL' ? s.tipo : `${s.tipo}:${s.mesh}`)));

function run({ textos = [], garmentColor = 'BLACK', inkType = 'WATER', colors = ['RED'], first = true, win } = {}) {
  const w = win || load(FILES);
  const base = w.RulesEngine.generarSecuencia({ garmentColor, inkType, designColors: colors.map((val) => ({ val })) });
  const ctx = {
    textos, garmentColor, inkType, customer: '',
    isDarkFabric: w.RulesEngine.esTelaOscura(garmentColor), isFirstColoredPlacement: first
  };
  return { base, out: w.SequenceRules.apply(base, ctx) };
}

test('PPF in Stage (Sample Type) puts HOT HEAD/TEFLÓN at station 4 and keeps the rest in order', () => {
  const { base, out } = run({ textos: [{ campo: 'generalData.sampleType', valor: 'QRS PPF' }] });
  const seq = label(out.sequence);
  assert.deepEqual(seq.slice(0, 6), ['BLOCKER:110/64', 'FLASH', 'COOL', 'HOT_HEAD:TEFLÓN', 'COOL', 'BLOCKER:122/55']);
  assert.equal(out.sequence.length, base.length + 2);
  assert.equal(out.aplicadas[0].id, 'ppf-hot-head');
});

test('PPF only in the name (PPF-67NM-BBGH-81F) also triggers the rule', () => {
  const { out } = run({ textos: [{ campo: 'input#style', valor: 'PPF-67NM-BBGH-81F' }] });
  assert.equal(out.sequence[3].tipo, 'HOT_HEAD');
});

test('Names without PPF (67NM-BBGH-81F) and other stages do not trigger it', () => {
  const { base, out } = run({ textos: [{ campo: 'style', valor: '67NM-BBGH-81F' }, { campo: 'sampleType', valor: '1st Proto' }] });
  assert.equal(out.sequence.length, base.length);
  assert.equal(out.sequence.some((s) => s.tipo === 'HOT_HEAD'), false);
});

test('Fabric color and ink type do not change where HOT HEAD lands', () => {
  const textos = [{ campo: 'sampleType', valor: 'QRS PPF' }];
  for (const [garmentColor, inkType] of [['BLACK', 'WATER'], ['WHITE', 'WATER'], ['NAVY', 'PLASTISOL'], ['WHITE', 'SILICONE']]) {
    const { out } = run({ textos, garmentColor, inkType });
    assert.equal(out.sequence[3].tipo, 'HOT_HEAD', `${garmentColor}/${inkType}`);
    assert.equal(out.sequence[3].mesh, 'TEFLÓN');
    assert.equal(out.sequence[4].tipo, 'COOL');
  }
});

test('Single-screen sequence is padded with FLASH/COOL so HOT HEAD is still station 4', () => {
  const w = load(['rules/sequence-rules.js', 'core/sequence-rules-engine.js']);
  const out = w.SequenceRules.apply([{ tipo: 'COLOR', nombre: 'RED', mesh: '157/48' }], { textos: [{ campo: 'x', valor: 'ppf' }] });
  assert.deepEqual(label(out.sequence), ['COLOR:157/48', 'FLASH', 'COOL', 'HOT_HEAD:TEFLÓN', 'COOL']);
});

test('Applying twice does not duplicate HOT HEAD', () => {
  const w = load(FILES);
  const textos = [{ campo: 'x', valor: 'QRS PPF' }];
  const first = run({ textos, win: w }).out.sequence;
  const second = w.SequenceRules.apply(first, { textos, isFirstColoredPlacement: true });
  assert.equal(second.sequence.filter((s) => s.tipo === 'HOT_HEAD').length, 1);
});

test('scanData finds PPF anywhere in loaded data but skips ignored free-text fields', () => {
  const w = load(['rules/sequence-rules.js', 'core/sequence-rules-engine.js']);
  const found = w.SequenceRules.scanData({ style: 'PPF-1', swoSnapshot: { stage: 'QRS PPF' }, technicalComments: 'not a PPF job' }, 'generalData');
  const values = plain(found.map((f) => f.valor));
  assert.ok(values.includes('PPF-1'));
  assert.ok(values.includes('QRS PPF'));
  assert.equal(values.includes('not a PPF job'), false);
});

test('Rules are data: a new rule added to the data file works without touching the engine', () => {
  const w = load(['core/sequence-rules-engine.js'], {
    TegraSequenceRules: { version: 1, reglas: [{
      id: 'demo-silicone-black', cuando: { tipoTinta: ['SILICONE'], tela: 'oscura' },
      entonces: [{ accion: 'insertarEnEstacion', estacion: 2, pasos: [{ tipo: 'FLASH', mesh: '-' }] }]
    }] }
  });
  const hit = w.SequenceRules.apply([{ tipo: 'COLOR' }, { tipo: 'COLOR' }], { inkType: 'SILICONE', isDarkFabric: true, textos: [] });
  const miss = w.SequenceRules.apply([{ tipo: 'COLOR' }, { tipo: 'COLOR' }], { inkType: 'WATER', isDarkFabric: true, textos: [] });
  assert.equal(hit.sequence.length, 3);
  assert.equal(miss.sequence.length, 2);
});

test('A rule with activa:false is ignored and placements:"primero" respects the gate', () => {
  const w = load(['core/sequence-rules-engine.js'], {
    TegraSequenceRules: { version: 1, reglas: [
      { id: 'off', activa: false, cuando: {}, entonces: [{ accion: 'insertarEnEstacion', estacion: 1, pasos: [{ tipo: 'FLASH' }] }] },
      { id: 'first-only', cuando: { placements: 'primero' }, entonces: [{ accion: 'insertarEnEstacion', estacion: 1, pasos: [{ tipo: 'FLASH' }] }] }
    ] }
  });
  assert.equal(w.SequenceRules.apply([{ tipo: 'COLOR' }], { isFirstColoredPlacement: true, textos: [] }).sequence.length, 2);
  assert.equal(w.SequenceRules.apply([{ tipo: 'COLOR' }], { isFirstColoredPlacement: false, textos: [] }).sequence.length, 1);
});
