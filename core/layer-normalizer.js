// layer-normalizer.js - normalización y deduplicación de capas
window.LayerNormalizer = (function () {
  'use strict';

  function normalizeLayers(layers = [], options = {}) {
    const mergeTypes = new Set(options.mergeTypes || ['WHITE_BASE', 'BLOCKER']);
    const normalized = [];
    const grouped = new Map();

    layers.forEach((layer) => {
      const current = { ...layer };
      const type = String(current.tipo || '').toUpperCase();

      if (!mergeTypes.has(type)) {
        normalized.push({ ...current, count: 1 });
        return;
      }

      const key = `${type}|${current.mesh || ''}|${current.additives || ''}`;
      if (!grouped.has(key)) {
        grouped.set(key, { ...current, count: 0 });
      }

      grouped.get(key).count += 1;
    });

    return [...normalized, ...grouped.values()];
  }

  return { normalizeLayers };
})();
