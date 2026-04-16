// layer-normalizer.js - normalización y deduplicación de capas
window.LayerNormalizer = (function () {
  'use strict';

  function getNormalizationKey(layer) {
    const type = String(layer?.tipo || '').toUpperCase();
    const mesh = layer?.mesh || '';
    const additives = layer?.additives || '';

    // Nunca mezclar colores de pantallas distintas aunque compartan malla/aditivos.
    if (type === 'COLOR') {
      const screenLetter = layer?.screenLetter || '';
      return `${type}|${screenLetter}|${mesh}|${additives}`;
    }

    return `${type}|${mesh}|${additives}`;
  }

  function normalizeLayers(layers = [], options = {}) {
    const mergeTypes = new Set(options.mergeTypes || ['WHITE_BASE', 'BLOCKER']);
    const ordered = [];
    const groupedIndex = new Map();

    layers.forEach((layer) => {
      const current = { ...layer };
      const type = String(current.tipo || '').toUpperCase();

      if (!mergeTypes.has(type)) {
        ordered.push({ ...current, count: 1 });
        return;
      }

      const key = getNormalizationKey(current);
      if (groupedIndex.has(key)) {
        const index = groupedIndex.get(key);
        ordered[index].count += 1;
        return;
      }

      groupedIndex.set(key, ordered.length);
      ordered.push({ ...current, count: 1 });
    });

    return ordered;
  }

  return {
    normalizeLayers,
    getNormalizationKey
  };
})();
