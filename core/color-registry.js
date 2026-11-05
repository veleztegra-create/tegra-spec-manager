/* Tegra Spec Manager — shared color registry.
 * JSON is the canonical metadata model; ACB is an Illustrator interchange format.
 * This module is intentionally synchronous and local-first for GitHub Pages/offline use.
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'tegraspec-color-registry-v1';
  const FORMAT = 'TEGRA-COLOR-REGISTRY';
  const VERSION = 1;

  function normalizeHex(value) {
    const hex = String(value || '').trim().replace(/^#/, '').toUpperCase();
    return /^[0-9A-F]{6}$/.test(hex) ? '#' + hex : '';
  }

  function normalizeKey(value) {
    return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .toUpperCase().trim().replace(/[_\s]+/g, '-').replace(/-+/g, '-');
  }

  function rgbFromHex(hex) {
    const value = normalizeHex(hex).slice(1);
    if (!value) return null;
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16)
    };
  }

  function normalizeColor(input) {
    if (!input || typeof input !== 'object') throw new Error('Color record must be an object.');
    const name = String(input.name || input.colorName || '').trim();
    const hex = normalizeHex(input.hex || input.HEX);
    if (!name) throw new Error('Color name is required.');
    if (!hex) throw new Error('Valid HEX (#RRGGBB) is required.');

    const aliases = Array.isArray(input.aliases)
      ? [...new Set(input.aliases.map(v => String(v || '').trim()).filter(Boolean))]
      : [];

    return {
      id: String(input.id || 'clr-' + hex.slice(1).toLowerCase()),
      name,
      code: String(input.code || '').trim(),
      aliases,
      hex,
      rgb: rgbFromHex(hex),
      classifications: {
        underbase: ['yes', 'no', 'unknown'].includes(String(input.classifications?.underbase || input.underbase || '').toLowerCase())
          ? String(input.classifications?.underbase || input.underbase).toLowerCase()
          : 'unknown',
        fabricTone: ['light', 'dark', 'unknown'].includes(String(input.classifications?.fabricTone || input.fabricTone || '').toLowerCase())
          ? String(input.classifications?.fabricTone || input.fabricTone).toLowerCase()
          : 'unknown'
      },
      tags: Array.isArray(input.tags) ? [...new Set(input.tags.map(v => String(v || '').trim()).filter(Boolean))] : [],
      source: String(input.source || 'manual'),
      updatedAt: input.updatedAt || new Date().toISOString()
    };
  }

  function emptyRegistry() {
    return { format: FORMAT, version: VERSION, updatedAt: new Date().toISOString(), colors: [] };
  }

  function readStorage() {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyRegistry();
      const parsed = JSON.parse(raw);
      if (parsed.format !== FORMAT || !Array.isArray(parsed.colors)) return emptyRegistry();
      return { ...emptyRegistry(), ...parsed, colors: parsed.colors.map(normalizeColor) };
    } catch (error) {
      console.warn('[ColorRegistry] Could not read local registry:', error);
      return emptyRegistry();
    }
  }

  let registry = readStorage();

  function persist() {
    registry.updatedAt = new Date().toISOString();
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(registry));
      return true;
    } catch (error) {
      console.error('[ColorRegistry] Could not persist registry:', error);
      return false;
    }
  }

  function getAll() {
    return registry.colors.map(color => ({ ...color, aliases: [...color.aliases], tags: [...color.tags] }));
  }

  function find(query) {
    const key = normalizeKey(query);
    if (!key) return null;
    const matches = registry.colors.filter(color =>
      [color.name, color.code, ...color.aliases].some(value => normalizeKey(value) === key)
    );
    return matches.length === 1 ? { ...matches[0] } : null;
  }

  function upsert(input) {
    const color = normalizeColor(input);
    const byId = registry.colors.findIndex(item => item.id === color.id);
    const byHex = registry.colors.findIndex(item => item.hex === color.hex);
    const index = byId >= 0 ? byId : byHex;

    if (index >= 0) {
      const existing = registry.colors[index];
      // Preserve user-defined classifications if an incoming import does not specify them.
      if (!input.classifications && input.underbase == null) color.classifications.underbase = existing.classifications.underbase;
      if (!input.classifications && input.fabricTone == null) color.classifications.fabricTone = existing.classifications.fabricTone;
      color.id = existing.id;
      registry.colors[index] = color;
    } else {
      registry.colors.push(color);
    }

    if (!persist()) throw new Error('Could not save color registry to local storage.');
    return { ...color };
  }

  function remove(id) {
    const before = registry.colors.length;
    registry.colors = registry.colors.filter(color => color.id !== String(id));
    if (registry.colors.length === before) return false;
    return persist();
  }

  function importJson(data, mode = 'merge') {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    if (!parsed || !Array.isArray(parsed.colors)) throw new Error('JSON file must contain a colors array.');
    if (parsed.format && parsed.format !== FORMAT && parsed.format !== 'GFSEXTR-Palette' && parsed.format !== 'GFSEXTR-Backup') {
      throw new Error('Unsupported color JSON format: ' + parsed.format);
    }

    const incoming = [];
    if (parsed.format === 'GFSEXTR-Backup' && Array.isArray(parsed.palettes)) {
      parsed.palettes.forEach(palette => (palette.colors || []).forEach(color => incoming.push({
        ...color, name: color.name || color.colorName, source: 'GFSEXTR:' + (palette.name || 'palette')
      })));
    } else {
      incoming.push(...parsed.colors);
    }

    const normalized = incoming.map(color => normalizeColor({
      ...color,
      name: color.name || color.colorName,
      classifications: color.classifications || {
        underbase: color.underbase ? 'yes' : 'unknown',
        fabricTone: color.fabricTone || 'unknown'
      },
      source: color.source || 'json-import'
    }));

    if (mode === 'replace') registry.colors = [];
    normalized.forEach(color => {
      const existing = registry.colors.find(item => item.hex === color.hex || item.id === color.id);
      if (existing) {
        // Merge aliases and preserve known classifications unless the import explicitly sets them.
        existing.aliases = [...new Set([...existing.aliases, ...color.aliases])];
        if (color.classifications.underbase !== 'unknown') existing.classifications.underbase = color.classifications.underbase;
        if (color.classifications.fabricTone !== 'unknown') existing.classifications.fabricTone = color.classifications.fabricTone;
        if (color.name && existing.name !== color.name) existing.aliases.push(color.name);
      } else registry.colors.push(color);
    });

    if (!persist()) throw new Error('Could not save imported registry.');
    return { imported: normalized.length, total: registry.colors.length };
  }

  function exportJson() {
    return JSON.stringify({ ...registry, colors: getAll() }, null, 2);
  }

  global.ColorRegistry = {
    format: FORMAT,
    version: VERSION,
    storageKey: STORAGE_KEY,
    getAll,
    find,
    upsert,
    remove,
    importJson,
    exportJson,
    normalizeHex,
    normalizeKey,
    rgbFromHex
  };
})(typeof window !== 'undefined' ? window : globalThis);
