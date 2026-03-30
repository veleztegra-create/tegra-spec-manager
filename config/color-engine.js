import colorDB from './color-database.js';

const cache = new Map();

function normalizeHex(hex = '') {
  return String(hex).replace('#', '').toLowerCase();
}

function normalizeInputHex(hex = '') {
  const normalized = normalizeHex(hex);
  return normalized ? `#${normalized}` : '';
}

function getLuminance(r, g, b) {
  return Number((0.299 * r + 0.587 * g + 0.114 * b).toFixed(2));
}

export function validateColor(input = {}) {
  if (!input?.hex && !input?.rgb) {
    throw new Error('Color must include hex or rgb');
  }
}

export function findExactColor(hex) {
  const normalized = normalizeHex(hex);
  return colorDB.find((color) => normalizeHex(color.hex) === normalized);
}

export function classifyColor(rgb = {}) {
  const normalized = {
    r: Number.isFinite(Number(rgb.r)) ? Math.max(0, Math.min(255, Math.trunc(Number(rgb.r)))) : 0,
    g: Number.isFinite(Number(rgb.g)) ? Math.max(0, Math.min(255, Math.trunc(Number(rgb.g)))) : 0,
    b: Number.isFinite(Number(rgb.b)) ? Math.max(0, Math.min(255, Math.trunc(Number(rgb.b)))) : 0
  };

  const luminance = getLuminance(normalized.r, normalized.g, normalized.b);
  const isLight = luminance > 60;

  return {
    rgb: normalized,
    luminance,
    toneCategory: isLight ? 'light' : 'dark',
    recommendedInk: isLight ? 'waterbased' : 'plastisol',
    contrastText: isLight ? 'black' : 'white'
  };
}

export function resolveColor(input = {}) {
  validateColor(input);

  const key = normalizeInputHex(input.hex || `${input.rgb?.r ?? ''}-${input.rgb?.g ?? ''}-${input.rgb?.b ?? ''}`);
  if (cache.has(key)) return cache.get(key);

  const normalizedHex = normalizeInputHex(input.hex);
  const exact = normalizedHex ? findExactColor(normalizedHex) : null;

  const result = exact
    ? {
        source: 'database',
        ...exact,
        recommendedInk: exact.properties?.recommendedInk,
        contrastText: exact.properties?.contrastText
      }
    : {
        source: 'computed',
        hex: normalizedHex || null,
        ...classifyColor(input.rgb)
      };

  cache.set(key, result);
  return result;
}

if (typeof globalThis !== 'undefined') {
  globalThis.ColorEngine = {
    findExactColor,
    classifyColor,
    resolveColor,
    validateColor
  };
}
