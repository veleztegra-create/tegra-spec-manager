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
function fixture({ model = 0, tail = 'spflproc', prefix = '', postfix = '', colors = [
  { name: 'Red', code: 'C00001', rgb: [255, 0, 0] },
  { name: 'White', code: 'C00002', rgb: [255, 255, 255] }
] } = {}) {
  const out = [
    ...Buffer.from('8BCB'), ...u16(1), ...u16(3000),
    ...str('Test Book'), ...str(prefix), ...str(postfix), ...str('Test description'),
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

test('preserves raw color name and applies book prefix and postfix', () => {
  const book = decodeAcb(fixture({ prefix: 'Nike ', postfix: ' C' }));
  assert.equal(book.colors[0].rawName, 'Red');
  assert.equal(book.colors[0].name, 'Nike Red C');
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

test('rejects truncated records', () => {
  const bytes = fixture();
  assert.throws(() => decodeAcb(bytes.slice(0, -10)), /truncado/);
});

test('rejects non-printable color codes', () => {
  const bytes = fixture({ colors: [{ name: 'Bad code', code: '\u0001ABCDE', rgb: [1, 2, 3] }] });
  assert.throws(() => decodeAcb(bytes), /no ASCII imprimible/);
});

test('rejects unknown spot/process identifier', () => {
  assert.throws(() => decodeAcb(fixture({ tail: 'xxxxxxxx' })), /no reconocido/);
});

test('rejects unexpected trailing bytes', () => {
  const bytes = fixture({ tail: '' });
  const withExtraByte = new Uint8Array(bytes.length + 1);
  withExtraByte.set(bytes);
  withExtraByte[withExtraByte.length - 1] = 1;
  assert.throws(() => decodeAcb(withExtraByte), /bytes inesperados/);
});

test('accepts a book without the optional spot/process identifier', () => {
  assert.equal(decodeAcb(fixture({ tail: '' })).spotProcessIdentifier, null);
});

test('rejects an excessive string length before attempting to read it', () => {
  const bytes = fixture();
  // The first string length begins at byte 8 (after signature, version, and book ID).
  bytes.set(u32(1_000_001), 8);
  assert.throws(() => decodeAcb(bytes), /longitud excesiva/);
});
