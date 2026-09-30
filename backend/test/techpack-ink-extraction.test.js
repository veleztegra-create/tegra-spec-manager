import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadExtractor() {
  const window = {};
  const context = vm.createContext({
    window,
    globalThis: window,
    console,
    pdfjsLib: {}
  });

  vm.runInContext(
    fs.readFileSync(new URL('../../js/nikeTechPackExtractor.js', import.meta.url), 'utf8'),
    context
  );

  return new window.NikeTechPackExtractor();
}

test('Tech Pack extractor recognizes Silicone before Water Base', () => {
  const extractor = loadExtractor();

  assert.equal(extractor.extractInkType('Printing Method: Silicone').tipo, 'SILICONE');
  assert.equal(extractor.extractInkType('Ink: Plastisol').tipo, 'PLASTISOL');
  assert.equal(extractor.extractInkType('High Solids Water Base').tipo, 'WATER');
  assert.equal(extractor.extractInkType('No explicit ink type here').tipo, null);
});
