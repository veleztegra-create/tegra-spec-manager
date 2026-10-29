import test from 'node:test';
import assert from 'node:assert/strict';
import {
  saveAcbLibrary, loadAcbLibrary, loadAcbLibraries, loadActiveAcbLibrary,
  setActiveAcbLibrary, deleteAcbLibrary, clearAcbLibrary, ACB_LIBRARY_STORAGE_KEY
} from '../modules/acb-library-storage.js';

function makeBook(title = 'Test palette', bookId = 42, hex = '#FF0000') {
  const rgb = { r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) };
  return {
    schemaVersion: 1, sourceFormat: 'ACB', version: 1, bookId, title,
    colorNamePrefix: '', colorNamePostfix: '', description: '', colorCount: 1,
    pageSize: 9, pageKey: 4, colorModel: 'RGB', colorModelId: 0, spotProcessIdentifier: null,
    colors: [{ index: 0, name: 'Red', rawName: 'Red', code: 'C00001', rgb, hex }]
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

test('persists Lab books with their derived RGB swatches', () => {
  const storage = memoryStorage();
  const book = makeBook('Pantone C', 7, '#777777');
  book.colorModel = 'Lab';
  book.colorModelId = 7;
  book.colors[0].lab = { l: 50.2, a: 0, b: 0 };
  assert.equal(saveAcbLibrary(storage, book, 'PANTONE Solid Coated.acb').ok, true);
  const loaded = loadAcbLibrary(storage);
  assert.equal(loaded.book.colorModel, 'Lab');
  assert.deepEqual(loaded.book.colors[0].lab, { l: 50.2, a: 0, b: 0 });
});

test('keeps multiple palettes available and activates the newly imported one', () => {
  const storage = memoryStorage();
  const nike = saveAcbLibrary(storage, makeBook('Nike', 1), 'NIKE.acb');
  const nfl = saveAcbLibrary(storage, makeBook('NFL', 2, '#00FF00'), 'NFL.acb');
  const libraries = loadAcbLibraries(storage);
  assert.equal(libraries.libraries.length, 2);
  assert.equal(loadActiveAcbLibrary(storage).book.title, 'NFL');
  assert.equal(setActiveAcbLibrary(storage, nike.id).ok, true);
  assert.equal(loadActiveAcbLibrary(storage).book.title, 'Nike');
});

test('reimporting the same source updates that library instead of duplicating it', () => {
  const storage = memoryStorage();
  saveAcbLibrary(storage, makeBook('Nike', 1), 'NIKE.acb');
  saveAcbLibrary(storage, makeBook('Nike updated', 1), 'NIKE.acb');
  assert.equal(loadAcbLibraries(storage).libraries.length, 1);
  assert.equal(loadActiveAcbLibrary(storage).book.title, 'Nike updated');
});

test('deleting a library preserves the others and selects a remaining palette', () => {
  const storage = memoryStorage();
  const nike = saveAcbLibrary(storage, makeBook('Nike', 1), 'NIKE.acb');
  saveAcbLibrary(storage, makeBook('NFL', 2), 'NFL.acb');
  assert.equal(deleteAcbLibrary(storage, nike.id).ok, true);
  assert.equal(loadAcbLibraries(storage).libraries.length, 1);
  assert.equal(loadActiveAcbLibrary(storage).book.title, 'NFL');
});

test('migrates the previous single-library storage record', () => {
  const book = makeBook();
  const storage = memoryStorage({
    'tegra-spec-manager:acb-library:v1': JSON.stringify({ schemaVersion: 1, savedAt: '2026-01-01', sourceFile: 'NIKE.acb', book })
  });
  const loaded = loadAcbLibrary(storage);
  assert.equal(loaded.book.title, 'Test palette');
  assert.equal(loadAcbLibraries(storage).libraries.length, 1);
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

test('clear removes all saved palettes', () => {
  const storage = memoryStorage();
  saveAcbLibrary(storage, makeBook('Nike', 1), 'NIKE.acb');
  saveAcbLibrary(storage, makeBook('NFL', 2), 'NFL.acb');
  assert.equal(clearAcbLibrary(storage), true);
  assert.equal(loadAcbLibraries(storage).libraries.length, 0);
});

test('reports browser storage quota errors without throwing', () => {
  const storage = { setItem() { const error = new Error('full'); error.name = 'QuotaExceededError'; throw error; } };
  assert.equal(saveAcbLibrary(storage, makeBook(), 'NIKE.acb').reason, 'quota-exceeded');
});
