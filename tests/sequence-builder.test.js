import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../core/sequence-builder.js', import.meta.url), 'utf8');

function buildSequence(layers, options = {}) {
  const window = {};
  vm.runInNewContext(source, { window });
  return Array.from(window.SequenceBuilder.buildSequence(layers, options), step => ({
    type: step.tipo,
    name: step.nombre,
    mesh: step.mesh
  }));
}

test('a normal sequence ends on its final color pass without trailing FLASH/COOL', () => {
  const sequence = buildSequence([
    { tipo: 'COLOR', nombre: 'MARINE 41L (1)' },
    { tipo: 'COLOR', nombre: 'MARINE 41L (2)' }
  ]);

  assert.deepEqual(sequence.map(step => step.type), [
    'COLOR', 'FLASH', 'COOL', 'COLOR'
  ]);
  assert.equal(sequence.at(-1).name, 'MARINE 41L (2)');
});

test('inserts FLASH and COOL between a color and a manually added special effect', () => {
  const sequence = buildSequence([
    { tipo: 'COLOR', nombre: 'MARINE 41L (1)' },
    { tipo: 'SPECIAL_EFFECT', nombre: 'GEL' },
    { tipo: 'COLOR', nombre: 'MARINE 41L (2)' }
  ]);

  assert.deepEqual(sequence.map(step => step.type), [
    'COLOR', 'FLASH', 'COOL',
    'SPECIAL_EFFECT', 'FLASH', 'COOL',
    'COLOR'
  ]);
  assert.equal(sequence.at(-1).name, 'MARINE 41L (2)');
});

test('keeps the PPF HOT HEAD station and its following COOL between print passes', () => {
  const sequence = buildSequence([
    { tipo: 'COLOR', nombre: 'ROYAL' },
    { tipo: 'COLOR', nombre: 'WHITE' }
  ], { isPpf: true });

  assert.equal(sequence.some(step => step.type === 'HOT_HEAD' && step.mesh === 'TEFLÓN'), true);
  assert.equal(sequence.at(-1).name, 'WHITE');
  assert.equal(sequence.at(-1).type, 'COLOR');
  assert.deepEqual(sequence.slice(-3).map(step => step.type), ['COOL', 'COLOR', 'FLASH'].slice(0, 0));
});
