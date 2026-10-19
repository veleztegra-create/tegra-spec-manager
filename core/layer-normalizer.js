// layer-normalizer.js - normalización y deduplicación de capas
window.LayerNormalizer = (function () {
  'use strict';

  function normalizePart(value) {
    return String(value ?? '').trim();
  }

  function getNormalizationKey(layer) {
    const type = String(layer?.tipo || layer?.type || '').trim().toUpperCase();
    const screenLetter = normalizePart(layer?.screenLetter);
    const name = normalizePart(layer?.nombre || layer?.name || layer?.val);
    const mesh = normalizePart(layer?.mesh);
    const additives = normalizePart(layer?.additives);
    const purpose = normalizePart(layer?.purpose || layer?.role || layer?.position);

    // The key represents semantic production identity. It intentionally excludes
    // volatile fields such as id/count so repeated equivalent passes can still be
    // represented by count when they are consecutive.
    return [type, screenLetter, name, mesh, additives, purpose].join('|');
  }

  function normalizeLayers(layers = [], options = {}) {
    const mergeTypes = new Set(options.mergeTypes || ['WHITE_BASE', 'BLOCKER']);
    const ordered = [];

    layers.forEach((layer) => {
      const current = { ...layer };
      const type = String(current.tipo || current.type || '').toUpperCase();

      if (!mergeTypes.has(type)) {
        ordered.push({ ...current, count: 1 });
        return;
      }

      // Only merge adjacent equivalent production layers. Global grouping is
      // unsafe because it moves later passes to the first occurrence and can
      // change the manufacturing order.
      const previous = ordered[ordered.length - 1];
      if (previous && getNormalizationKey(previous) === getNormalizationKey(current)) {
        previous.count += 1;
        return;
      }

      ordered.push({ ...current, count: 1 });
    });

    return ordered;
  }

  return {
    normalizeLayers,
    getNormalizationKey
  };
})();
