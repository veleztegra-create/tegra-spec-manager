import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../core/sequence-builder.js', import.meta.url), 'utf8');

function buildSequence(layers, options = {}) {
  const window = {};
  vm.runInNewContext(source, { window });
  return window.SequenceBuilder.buildSequence(layers, options).map(step => ({
    type: step.tipo,
    name: step.nombre,
    mesh: step.mesh
  }));
}

test('adds automatic FLASH and COOL after the final color pass', () => {
  const sequence = buildSequence([
    { tipo: 'BLOCKER', nombre: 'BLOCKER CHT' },
    { tipo: 'COLOR', nombre: 'ROYAL', mesh: '157/48' }
  ]);

  assert.deepEqual(sequence.map(step => step.type), [
    'BLOCKER', 'FLASH', 'COOL',
    'COLOR', 'FLASH', 'COOL'
  ]);
  assert.equal(sequence.at(-3).name, 'ROYAL');
  assert.deepEqual(sequence.slice(-2).map(step => step.type), ['FLASH', 'COOL']);
});

test('preserves a separate HOT HEAD and its following COOL for PPF', () => {
  const sequence = buildSequence([{ tipo: 'COLOR', nombre: 'ROYAL' }], { isPpf: true });

  assert.deepEqual(sequence.map(step => step.type), [
    'COLOR', 'FLASH', 'COOL', 'HOT_HEAD', 'COOL'
  ]);
  assert.equal(sequence[3].name, 'HOT HEAD');
  assert.equal(sequence[3].mesh, 'TEFLÓN');
});
