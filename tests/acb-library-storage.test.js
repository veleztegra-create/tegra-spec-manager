import test from 'node:test';
import assert from 'node:assert/strict';
import { saveAcbLibrary, loadAcbLibrary, clearAcbLibrary, ACB_LIBRARY_STORAGE_KEY } from '../modules/acb-library-storage.js';

function makeBook() {
  return {
    schemaVersion: 1, sourceFormat: 'ACB', version: 1, bookId: 42, title: 'Test palette',
    colorNamePrefix: '', colorNamePostfix: '', description: '', colorCount: 1,
    pageSize: 9, pageKey: 4, colorModel: 'RGB', colorModelId: 0, spotProcessIdentifier: null,
    colors: [{ index: 0, name: 'Red', rawName: 'Red', code: 'C00001', rgb: { r: 255, g: 0, b: 0 }, hex: '#FF0000' }]
  };
}
function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); },
    has(key) { return data.has(key); }
  };
}

test('saves and restores a validated ACB book locally', () => {
  const storage = memoryStorage();
  assert.equal(saveAcbLibrary(storage, makeBook(), 'NIKE.acb').ok, true);
  const loaded = loadAcbLibrary(storage);
  assert.equal(loaded.sourceFile, 'NIKE.acb');
  assert.equal(loaded.book.title, 'Test palette');
  assert.equal(loaded.book.colors[0].hex, '#FF0000');
});

test('rejects invalid books without saving them', () => {
  const storage = memoryStorage();
  const book = makeBook();
  book.colors[0].hex = '#000000';
  assert.equal(saveAcbLibrary(storage, book, 'bad.acb').reason, 'invalid-book');
  assert.equal(storage.has(ACB_LIBRARY_STORAGE_KEY), false);
});

test('removes corrupt persisted JSON instead of returning it', () => {
  const storage = memoryStorage({ [ACB_LIBRARY_STORAGE_KEY]: '{broken' });
  assert.equal(loadAcbLibrary(storage), null);
  assert.equal(storage.has(ACB_LIBRARY_STORAGE_KEY), false);
});

test('clear removes the saved palette', () => {
  const storage = memoryStorage();
  saveAcbLibrary(storage, makeBook(), 'NIKE.acb');
  assert.equal(clearAcbLibrary(storage), true);
  assert.equal(loadAcbLibrary(storage), null);
});

test('reports browser storage quota errors without throwing', () => {
  const storage = { setItem() { const error = new Error('full'); error.name = 'QuotaExceededError'; throw error; } };
  assert.equal(saveAcbLibrary(storage, makeBook(), 'NIKE.acb').reason, 'quota-exceeded');
});
