import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../core/sequence-builder.js', import.meta.url), 'utf8');

function build(layers) {
    const window = {};
    vm.runInNewContext(source, { window });
    return Array.from(window.SequenceBuilder.buildSequence(layers), step => step.tipo);
}

test('normal sequence inserts FLASH and COOL only between production passes', () => {
    assert.deepEqual(build([
        { tipo: 'COLOR', nombre: 'BLACK' },
        { tipo: 'COLOR', nombre: 'WHITE' },
        { tipo: 'COLOR', nombre: 'RED' }
    ]), ['COLOR', 'FLASH', 'COOL', 'COLOR', 'FLASH', 'COOL', 'COLOR']);
});

test('single-pass sequence does not invent a final curing cycle', () => {
    assert.deepEqual(build([{ tipo: 'COLOR', nombre: 'BLACK' }]), ['COLOR']);
});

test('GEL remains a distinct step between print passes', () => {
    assert.deepEqual(build([
        { tipo: 'COLOR', nombre: 'BLACK' },
        { tipo: 'SPECIAL_EFFECT', nombre: 'GEL' },
        { tipo: 'COLOR', nombre: 'WHITE' }
    ]), ['COLOR', 'FLASH', 'COOL', 'SPECIAL_EFFECT', 'FLASH', 'COOL', 'COLOR']);
});

test('layer count expands repeated non-color passes without changing final pass order', () => {
    assert.deepEqual(build([
        { tipo: 'WHITE_BASE', nombre: 'WHITE BASE', count: 2 },
        { tipo: 'COLOR', nombre: 'RED' }
    ]), ['WHITE_BASE', 'FLASH', 'COOL', 'WHITE_BASE', 'FLASH', 'COOL', 'COLOR']);
});
