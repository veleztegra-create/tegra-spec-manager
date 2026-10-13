const STORAGE_KEY = 'tegra-spec-manager:acb-library:v1';
const MAX_STORED_CHARS = 1_750_000;
const MAX_COLORS = 8000;

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
    const expectedHex = `#${[color.rgb.r, color.rgb.g, color.rgb.b].map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
    return color.hex === expectedHex;
  });
}

export function saveAcbLibrary(storage, book, sourceFile = '') {
  if (!storage || typeof storage.setItem !== 'function') return { ok: false, reason: 'storage-unavailable' };
  if (!isValidBook(book)) return { ok: false, reason: 'invalid-book' };

  const payload = { schemaVersion: 1, savedAt: new Date().toISOString(), sourceFile: String(sourceFile || ''), book };
  const serialized = JSON.stringify(payload);
  if (serialized.length > MAX_STORED_CHARS) return { ok: false, reason: 'too-large' };

  try {
    storage.setItem(STORAGE_KEY, serialized);
    return { ok: true, savedAt: payload.savedAt };
  } catch (error) {
    return { ok: false, reason: error?.name === 'QuotaExceededError' ? 'quota-exceeded' : 'storage-error' };
  }
}

export function loadAcbLibrary(storage) {
  if (!storage || typeof storage.getItem !== 'function') return null;
  let serialized;
  try { serialized = storage.getItem(STORAGE_KEY); } catch { return null; }
  if (!serialized) return null;

  try {
    if (serialized.length > MAX_STORED_CHARS) throw new Error('stored library too large');
    const payload = JSON.parse(serialized);
    if (payload?.schemaVersion !== 1 || !isValidBook(payload.book) || typeof payload.sourceFile !== 'string') {
      throw new Error('invalid stored library');
    }
    return { book: payload.book, sourceFile: payload.sourceFile, savedAt: typeof payload.savedAt === 'string' ? payload.savedAt : '' };
  } catch {
    try { storage.removeItem(STORAGE_KEY); } catch {}
    return null;
  }
}

export function clearAcbLibrary(storage) {
  if (!storage || typeof storage.removeItem !== 'function') return false;
  try { storage.removeItem(STORAGE_KEY); return true; } catch { return false; }
}

export const ACB_LIBRARY_STORAGE_KEY = STORAGE_KEY;
