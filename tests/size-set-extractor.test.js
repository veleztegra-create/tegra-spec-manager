import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadExtractor() {
  const context = vm.createContext({});
  context.window = context;
  context.globalThis = context;
  vm.runInContext(
    fs.readFileSync(new URL('../modules/size-set-extractor.js', import.meta.url), 'utf8'),
    context
  );
  return context.SizeSetExtractor;
}

test('extracts all sizes from SIZE BREAKDOWN header, independent of quantity cells', () => {
  const extractor = loadExtractor();
  const grid = [
    ['PO', 'PO-123'],
    ['SIZE BREAKDOWN'],
    ['Size', 'S', 'M', 'L', 'XL', '2XL'],
    ['Qty per Size', 0, 0, 7, 0, 0]
  ];
  assert.deepEqual(
    Array.from(extractor.extractRequestedSizesFromGrid(grid)),
    ['S', 'M', 'L', 'XL', '2XL']
  );
  assert.equal(
    extractor.formatSizeSetLabel(extractor.extractRequestedSizesFromGrid(grid)),
    'SIZESET / S-M-L-XL-2XL'
  );
});

test('preserves non-contiguous requested sizes without inventing intermediate sizes', () => {
  const extractor = loadExtractor();
  const grid = [
    ['SIZE BREAKDOWN'],
    ['Size', 'S', 'L', '2XL'],
    ['Qty per Size', 1, 2, 1]
  ];
  const sizes = extractor.extractRequestedSizesFromGrid(grid);
  assert.deepEqual(Array.from(sizes), ['S', 'L', '2XL']);
  assert.equal(extractor.formatSizeSetLabel(sizes), 'SIZESET / S-L-2XL');
});

test('returns empty values when no recognizable sizes are present', () => {
  const extractor = loadExtractor();
  assert.deepEqual(Array.from(extractor.extractRequestedSizesFromGrid([['SIZE BREAKDOWN'], ['Size', 'TBD']])), []);
  assert.equal(extractor.formatSizeSetLabel([]), '');
});
