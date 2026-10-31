import test from 'node:test';
import assert from 'node:assert/strict';
import '../features/artwork-sizing-rules.js';

const rules = globalThis.ArtworkSizingRules;

test('automatic variants are limited to Front and Back', () => {
  assert.deepEqual(rules.getAutomaticSizes({ type: 'SLEEVE', width: '10', height: '5' }, { fabric: 'PPF' }), []);
});

test('PPF adds 3 mm to the original width and height', () => {
  const [size] = rules.getAutomaticSizes({ type: 'FRONT', width: '14.6', height: '12' }, { fabric: 'PPF' });
  assert.equal(size.label, 'PPF +3 mm');
  assert.equal(size.width, '14.72');
  assert.equal(size.height, '12.12');
});

test('Twill generates 101% and 101% plus 4 mm from the original', () => {
  const sizes = rules.getAutomaticSizes({ type: 'BACK', width: '14.6', height: '12' }, { fabric: 'TWILL' });
  assert.equal(sizes.length, 2);
  assert.equal(sizes[0].width, '14.75');
  assert.equal(sizes[0].height, '12.12');
  assert.equal(sizes[1].width, '14.90');
  assert.equal(sizes[1].height, '12.28');
});

test('NCAA normal uses 2.5%, NCAA Silicone uses only 1%', () => {
  const normal = rules.getAutomaticSizes({ type: 'FRONT', width: '10', height: '8', inkType: 'WATER' }, { customer: 'NCAA' });
  const silicone = rules.getAutomaticSizes({ type: 'BACK', width: '10', height: '8', inkType: 'SILICONE' }, { customer: 'NCAA' });
  assert.equal(normal[0].label, '102.5% (NCAA)');
  assert.equal(normal[0].width, '10.25');
  assert.equal(silicone.length, 1);
  assert.equal(silicone[0].label, '101% (NCAA Silicone)');
  assert.equal(silicone[0].width, '10.10');
});

test('manual sizes are retained on the placement', () => {
  const custom = [{ id: 'one', label: '95%', width: '12', height: '8' }];
  assert.deepEqual(rules.getManualSizes({ additionalArtworkSizes: custom }), custom);
});
