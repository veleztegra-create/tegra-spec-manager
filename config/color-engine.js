import colorDB from './color-database.module.js';

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

function hexToRgb(hex = '') {
  const normalized = normalizeHex(hex);
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return null;

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16)
  };
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
  const source = rgb && typeof rgb === 'object' ? rgb : {};
  const normalized = {
    r: Number.isFinite(Number(source.r)) ? Math.max(0, Math.min(255, Math.trunc(Number(source.r)))) : 0,
    g: Number.isFinite(Number(source.g)) ? Math.max(0, Math.min(255, Math.trunc(Number(source.g)))) : 0,
    b: Number.isFinite(Number(source.b)) ? Math.max(0, Math.min(255, Math.trunc(Number(source.b)))) : 0
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
        ...classifyColor(input.rgb || hexToRgb(normalizedHex))
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
