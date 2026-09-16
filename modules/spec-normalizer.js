// spec-normalizer.js - compatibility boundary for legacy Spec documents
(function (global) {
    const PRINT_COLOR_TYPES = new Set(['COLOR', 'METALLIC']);
    const KNOWN_PRODUCTION_TYPES = new Set(['WHITE_BASE', 'BLOCKER', 'FLASH', 'COOL']);

    function normalizedType(item) {
        return String(item?.type || item?.tipo || '').trim().toUpperCase();
    }

    function normalizePlacement(placement = {}) {
        const normalized = { ...placement };
        const legacyColors = Array.isArray(placement.colors) ? placement.colors : [];

        // New documents own printColors. Legacy colors are only adapted when that
        // canonical field is absent; colors remains untouched for round-trip safety.
        normalized.printColors = Array.isArray(placement.printColors)
            ? placement.printColors
            : legacyColors.filter((item) => PRINT_COLOR_TYPES.has(normalizedType(item)));

        // Known production data embedded in legacy colors is deliberately retained
        // in colors. It is never appended to or used to rebuild sequence here.
        normalized.unknownLegacyColors = legacyColors.filter((item) => {
            const type = normalizedType(item);
            return type && !PRINT_COLOR_TYPES.has(type) && !KNOWN_PRODUCTION_TYPES.has(type);
        });

        const legacyCuring = placement.curing && typeof placement.curing === 'object'
            ? placement.curing
            : {};
        normalized.curing = {
            temperature: legacyCuring.temperature ?? legacyCuring.temp ?? placement.temperature ?? placement.temperatura ?? placement.temp ?? '',
            time: legacyCuring.time ?? legacyCuring.tiempo ?? placement.time ?? placement.tiempo ?? ''
        };

        normalized.sequence = Array.isArray(placement.sequence) ? placement.sequence : [];
        return normalized;
    }

    function normalizeSpecData(spec = {}) {
        const placements = Array.isArray(spec.placements) ? spec.placements : [];
        return {
            ...spec,
            placements: placements.map(normalizePlacement)
        };
    }

    global.SpecNormalizer = { normalizePlacement, normalizeSpecData };
})(typeof window !== 'undefined' ? window : globalThis);
