import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const source = await readFile(new URL('../core/sequence-builder.js', import.meta.url), 'utf8');
function buildSequence(layers, options = {}) {
  const window = {};
  vm.runInNewContext(source, { window });
  return Array.from(window.SequenceBuilder.buildSequence(layers, options), step => ({type: step.tipo, name: step.nombre, mesh: step.mesh}));
}
test('normal sequence ends on its final color pass', () => {
  const sequence = buildSequence([{tipo:'COLOR',nombre:'MARINE 41L (1)'},{tipo:'COLOR',nombre:'MARINE 41L (2)'}]);
  assert.deepEqual(sequence.map(step=>step.type), ['COLOR','FLASH','COOL','COLOR']);
  assert.equal(sequence.at(-1).name, 'MARINE 41L (2)');
});
test('adds FLASH and COOL before an intermediate special effect, not after final color', () => {
  const sequence = buildSequence([{tipo:'COLOR',nombre:'MARINE 41L (1)'},{tipo:'SPECIAL_EFFECT',nombre:'GEL'},{tipo:'COLOR',nombre:'MARINE 41L (2)'}]);
  assert.deepEqual(sequence.map(step=>step.type), ['COLOR','FLASH','COOL','SPECIAL_EFFECT','FLASH','COOL','COLOR']);
  assert.equal(sequence.at(-1).name, 'MARINE 41L (2)');
});
test('PPF HOT HEAD and its COOL stay between print passes', () => {
  const sequence = buildSequence([{tipo:'COLOR',nombre:'ROYAL'},{tipo:'COLOR',nombre:'WHITE'}], {isPpf:true});
  assert.equal(sequence.some(step=>step.type === 'HOT_HEAD' && step.mesh === 'TEFLÓN'), true);
  assert.equal(sequence.at(-1).name, 'WHITE');
  assert.deepEqual(sequence.slice(-2).map(step=>step.type), ['COOL','COLOR']);
});
