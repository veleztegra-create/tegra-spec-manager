const STORAGE_KEY = 'tegra-spec-manager:acb-library:v2';
const LEGACY_STORAGE_KEY = 'tegra-spec-manager:acb-library:v1';
const MAX_STORED_CHARS = 8_000_000;
const MAX_COLORS = 8000;
const MAX_LIBRARIES = 100;

function isByte(value) {
  return Number.isInteger(value) && value >= 0 && value <= 255;
}

function isValidBook(book) {
  if (!book || book.sourceFormat !== 'ACB' || book.version !== 1 || book.colorModel !== 'RGB') return false;
  if (!Array.isArray(book.colors) || book.colors.length > MAX_COLORS || book.colorCount !== book.colors.length) return false;
  return book.colors.every((color, index) => {
    if (!color || color.index !== index || typeof color.name !== 'string' || typeof color.rawName !== 'string') return false;
    if (typeof color.code !== 'string' || !/^[\x20-\x7E]{6}$/.test(color.code)) return false;
    if (!color.rgb || !isByte(color.rgb.r) || !isByte(color.rgb.g) || !isByte(color.rgb.b)) return false;
    const expectedHex = \`#\${[color.rgb.r, color.rgb.g, color.rgb.b].map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase()}\`;
    return color.hex === expectedHex;
  });
}

function makeLibraryId(book, sourceFile) {
  const identity = \`\${String(sourceFile || '').trim().toLocaleLowerCase()}|\${String(book.bookId ?? '').trim()}|\${String(book.title || '').trim().toLocaleLowerCase()}\`;
  let hash = 2166136261;
  for (let index = 0; index < identity.length; index += 1) {
    hash ^= identity.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return \`acb-\${(hash >>> 0).toString(16)}\`;
}

function validateCollection(collection) {
  if (!collection || collection.schemaVersion !== 2 || !Array.isArray(collection.libraries) || collection.libraries.length > MAX_LIBRARIES) return false;
  if (!collection.libraries.every((item) => item && typeof item.id === 'string' && typeof item.sourceFile === 'string' && isValidBook(item.book))) return false;
  return !collection.activeLibraryId || collection.libraries.some((item) => item.id === collection.activeLibraryId);
}

function readCollection(storage) {
  if (!storage || typeof storage.getItem !== 'function') return { schemaVersion: 2, activeLibraryId: null, libraries: [] };
  try {
    const serialized = storage.getItem(STORAGE_KEY);
    if (serialized) {
      if (serialized.length > MAX_STORED_CHARS) throw new Error('stored collection too large');
      const parsed = JSON.parse(serialized);
      if (!validateCollection(parsed)) throw new Error('invalid collection');
      return parsed;
    }
  } catch {
    try { storage.removeItem(STORAGE_KEY); } catch {}
  }

  // Migrate the original single-library record without discarding it if storage fails.
  try {
    const legacyRaw = storage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      if (legacy?.schemaVersion === 1 && isValidBook(legacy.book) && typeof legacy.sourceFile === 'string') {
        const item = {
          id: makeLibraryId(legacy.book, legacy.sourceFile),
          sourceFile: legacy.sourceFile,
          book: legacy.book,
          savedAt: typeof legacy.savedAt === 'string' ? legacy.savedAt : ''
        };
        return { schemaVersion: 2, activeLibraryId: item.id, libraries: [item] };
      }
    }
  } catch {}
  return { schemaVersion: 2, activeLibraryId: null, libraries: [] };
}

function writeCollection(storage, collection) {
  if (!storage || typeof storage.setItem !== 'function') return { ok: false, reason: 'storage-unavailable' };
  const serialized = JSON.stringify(collection);
  if (serialized.length > MAX_STORED_CHARS) return { ok: false, reason: 'too-large' };
  try {
    storage.setItem(STORAGE_KEY, serialized);
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: error?.name === 'QuotaExceededError' ? 'quota-exceeded' : 'storage-error' };
  }
}

export function loadAcbLibraries(storage) {
  const collection = readCollection(storage);
  // Persist migration to v2 when possible.
  if (collection.libraries.length && storage?.getItem && !storage.getItem(STORAGE_KEY)) writeCollection(storage, collection);
  return {
    libraries: collection.libraries.map((item) => ({ ...item })),
    activeLibraryId: collection.activeLibraryId
  };
}

export function loadActiveAcbLibrary(storage) {
  const collection = readCollection(storage);
  const active = collection.libraries.find((item) => item.id === collection.activeLibraryId) || collection.libraries[0];
  if (!active) return null;
  return { ...active, title: active.book.title || '' };
}

export function setActiveAcbLibrary(storage, libraryId) {
  const collection = readCollection(storage);
  if (!collection.libraries.some((item) => item.id === libraryId)) return { ok: false, reason: 'not-found' };
  collection.activeLibraryId = libraryId;
  return writeCollection(storage, collection);
}

export function saveAcbLibrary(storage, book, sourceFile = '') {
  if (!storage || typeof storage.setItem !== 'function') return { ok: false, reason: 'storage-unavailable' };
  if (!isValidBook(book)) return { ok: false, reason: 'invalid-book' };
  const collection = readCollection(storage);
  const id = makeLibraryId(book, sourceFile);
  const existingIndex = collection.libraries.findIndex((item) => item.id === id);
  const item = { id, sourceFile: String(sourceFile || ''), book, savedAt: new Date().toISOString() };
  if (existingIndex >= 0) collection.libraries[existingIndex] = item;
  else {
    if (collection.libraries.length >= MAX_LIBRARIES) return { ok: false, reason: 'library-limit' };
    collection.libraries.push(item);
  }
  collection.activeLibraryId = id;
  const result = writeCollection(storage, collection);
  return result.ok ? { ...result, id, savedAt: item.savedAt } : result;
}

export function deleteAcbLibrary(storage, libraryId) {
  const collection = readCollection(storage);
  const next = collection.libraries.filter((item) => item.id !== libraryId);
  if (next.length === collection.libraries.length) return { ok: false, reason: 'not-found' };
  collection.libraries = next;
  if (collection.activeLibraryId === libraryId) collection.activeLibraryId = next[0]?.id || null;
  return writeCollection(storage, collection);
}

export function loadAcbLibrary(storage) {
  const active = loadActiveAcbLibrary(storage);
  return active ? { book: active.book, sourceFile: active.sourceFile, savedAt: active.savedAt, id: active.id } : null;
}

export function clearAcbLibrary(storage) {
  if (!storage || typeof storage.removeItem !== 'function') return false;
  try {
    storage.removeItem(STORAGE_KEY);
    storage.removeItem(LEGACY_STORAGE_KEY);
    return true;
  } catch { return false; }
}

export const ACB_LIBRARY_STORAGE_KEY = STORAGE_KEY;
