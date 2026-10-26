import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const extractorSource = readFileSync(resolve(here, '../js/nikeTechPackExtractor.js'), 'utf8');
const sandbox = { window: {}, console: { log() {}, warn() {}, error() {} } };
runInNewContext(extractorSource, sandbox);
const NikeTechPackExtractor = sandbox.window.NikeTechPackExtractor;

test('extracts explicit polyester composition from tech-pack text', () => {
    const extractor = new NikeTechPackExtractor();
    const fabrics = extractor.extractFabrics('Fabric Composition\n100% Polyester\nPage 2');
    assert.ok(fabrics.some((fabric) => /100% Polyester/i.test(fabric.composicion || '')));
    assert.equal(fabrics.find((fabric) => /100% Polyester/i.test(fabric.composicion || '')).tipo, 'Polyester');
});

test('extracts cotton and blended fiber percentages without assuming a default fabric', () => {
    const extractor = new NikeTechPackExtractor();
    const fabrics = extractor.extractFabrics('Material Content\n80% Polyester\n20% Cotton\nPage 2');
    assert.ok(fabrics.some((fabric) => /80% Polyester/i.test(fabric.composicion || '')));
    assert.ok(fabrics.some((fabric) => /20% Cotton/i.test(fabric.composicion || '')));
    assert.equal(extractor.extractFabrics('No composition listed').length, 0);
});

test('detects a fiber when the PDF text extraction splits percentage and fiber across lines', () => {
    const extractor = new NikeTechPackExtractor();
    const fabrics = extractor.extractFabrics('Fabric Content\n100%\nPolyester\nPage 2');
    assert.ok(fabrics.some((fabric) => /100%.*Polyester/i.test(fabric.composicion || '')));
});
