import test from 'node:test';
import assert from 'node:assert/strict';
import { matchExactAcbColor } from '../modules/acb-color-matcher.js';

const book = {
  colors: [
    { index: 0, name: 'Deep Jungle 3MG v18', rawName: 'Deep Jungle 3MG v18', code: 'C00001', hex: '#123456', rgb: { r: 18, g: 52, b: 86 } },
    { index: 1, name: 'University Gold', rawName: 'University Gold', code: 'C00002', hex: '#F2AE2D', rgb: { r: 242, g: 174, b: 45 } }
  ]
};

test('matches an exact color name case-insensitively and ignores extra whitespace', () => {
  assert.equal(matchExactAcbColor(book, '  deep   jungle 3mg V18  ').code, 'C00001');
});

test('supports exact raw ACB names', () => {
  assert.equal(matchExactAcbColor(book, 'University Gold').code, 'C00002');
});

test('resolves a Pantone code without requiring its full color name', () => {
  const pantoneBook = { colors: [
    { index: 0, name: 'PANTONE Yellow 012 C', rawName: 'Yellow 012 C', code: 'Y012C', hex: '#F7D417' },
    { index: 1, name: 'PANTONE Red 032 C', rawName: 'Red 032 C', code: 'R032C', hex: '#EF3340' }
  ] };
  assert.equal(matchExactAcbColor(pantoneBook, '012 C')?.name, 'PANTONE Yellow 012 C');
  assert.equal(matchExactAcbColor(pantoneBook, '012C')?.name, 'PANTONE Yellow 012 C');
  assert.equal(matchExactAcbColor(pantoneBook, 'PANTONE 012 C')?.name, 'PANTONE Yellow 012 C');
});

test('does not guess when a Pantone code matches multiple ACB colors', () => {
  const duplicateCodeBook = { colors: [
    { name: 'PANTONE Yellow 012 C', rawName: 'Yellow 012 C' },
    { name: 'Custom Yellow 012 C', rawName: 'Custom Yellow 012 C' }
  ] };
  assert.equal(matchExactAcbColor(duplicateCodeBook, '012 C'), null);
});
test('does not accept partial or fuzzy matches', () => {
  assert.equal(matchExactAcbColor(book, 'Deep Jungle'), null);
  assert.equal(matchExactAcbColor(book, 'Deep Jungle 3MG v19'), null);
});

test('returns null when multiple ACB records share the exact name', () => {
  const duplicateBook = { colors: [...book.colors, { ...book.colors[0], index: 2, code: 'C00003', hex: '#654321' }] };
  assert.equal(matchExactAcbColor(duplicateBook, 'Deep Jungle 3MG v18'), null);
});

test('returns null for empty queries or missing libraries', () => {
  assert.equal(matchExactAcbColor(book, '   '), null);
  assert.equal(matchExactAcbColor(null, 'Deep Jungle 3MG v18'), null);
});
