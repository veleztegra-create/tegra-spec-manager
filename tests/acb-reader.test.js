import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeAcb } from '../modules/acb-reader.js';

function u16(n) { return [n >> 8 & 255, n & 255]; }
function u32(n) { return [n >>> 24 & 255, n >>> 16 & 255, n >>> 8 & 255, n & 255]; }
function str(s) {
  return [...u32(s.length), ...[...s].flatMap((c) => {
    const n = c.charCodeAt(0);
    return [n >> 8, n & 255];
  })];
}
function fixture({ model = 0, tail = 'spflproc', colors = [
  { name: 'Red', code: 'C00001', rgb: [255, 0, 0] },
  { name: 'White', code: 'C00002', rgb: [255, 255, 255] }
] } = {}) {
  const out = [
    ...Buffer.from('8BCB'), ...u16(1), ...u16(3000),
    ...str('Test Book'), ...str(''), ...str(''), ...str('Test description'),
    ...u16(colors.length), ...u16(9), ...u16(4), ...u16(model)
  ];
  for (const color of colors) {
    out.push(...str(color.name), ...Buffer.from(color.code, 'ascii'), ...color.rgb);
  }
  if (tail) out.push(...Buffer.from(tail, 'ascii'));
  return new Uint8Array(out);
}

test('decodes RGB entries and book metadata', () => {
  const book = decodeAcb(fixture());
  assert.equal(book.title, 'Test Book');
  assert.equal(book.bookId, 3000);
  assert.equal(book.colorCount, 2);
  assert.equal(book.colors[0].hex, '#FF0000');
  assert.equal(book.colors[1].name, 'White');
  assert.equal(book.spotProcessIdentifier, 'spflproc');
});

test('rejects invalid signature', () => {
  assert.throws(() => decodeAcb(new Uint8Array([1, 2, 3, 4])), /firma/);
});

test('rejects unsupported version', () => {
  const bytes = fixture();
  bytes[5] = 2;
  assert.throws(() => decodeAcb(bytes), /Versión/);
});

test('rejects unsupported color model instead of guessing', () => {
  assert.throws(() => decodeAcb(fixture({ model: 2 })), /no compatible/);
});

test('decodes Lab books and derives RGB swatches while preserving Lab values', () => {
  const book = decodeAcb(fixture({ model: 7, colors: [
    { name: 'Neutral', code: 'L00001', rgb: [128, 128, 128] }
  ] }));
  assert.equal(book.colorModel, 'Lab');
  assert.equal(book.colorModelId, 7);
  assert.deepEqual(book.colors[0].lab, { l: 128 * 100 / 255, a: 0, b: 0 });
  assert.match(book.colors[0].hex, /^#[0-9A-F]{6}$/);
  assert.ok(book.colors[0].rgb.r >= 0 && book.colors[0].rgb.r <= 255);
});

test('rejects truncated records', () => {
  const bytes = fixture();
  assert.throws(() => decodeAcb(bytes.slice(0, -10)), /truncado/);
});

test('rejects unknown spot/process identifier', () => {
  assert.throws(() => decodeAcb(fixture({ tail: 'xxxxxxxx' })), /no reconocido/);
});

test('accepts a book without the optional spot/process identifier', () => {
  assert.equal(decodeAcb(fixture({ tail: '' })).spotProcessIdentifier, null);
});
