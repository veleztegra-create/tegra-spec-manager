// spec-normalizer.js - compatibility boundary for legacy Spec documents
(function (global) {
    const PRINT_COLOR_TYPES = new Set(['COLOR', 'METALLIC']);
    const KNOWN_PRODUCTION_TYPES = new Set(['WHITE_BASE', 'BLOCKER', 'FLASH', 'COOL']);

    function normalizedType(item) {
        return String(item?.type || item?.tipo || '').trim().toUpperCase();
    }

    function normalizeLifecycle(value = {}) {
        if (global.SpecLifecycle?.normalizeLifecycle) {
            return global.SpecLifecycle.normalizeLifecycle(value);
        }

        return {
            status: value.status || 'DRAFT',
            source: value.source || 'RULE_ENGINE',
            version: Math.max(1, Number(value.version) || 1),
            approvedBy: value.approvedBy || null,
            approvedAt: value.approvedAt || null,
            lockedAt: value.lockedAt || null,
            parentVersion: value.parentVersion ?? null
        };
    }

    function normalizeStyleVersion(value = {}, generalData = {}) {
        if (global.StyleVersion?.normalizeStyleVersion) {
            return global.StyleVersion.normalizeStyleVersion(value, generalData);
        }
        return value || {};
    }

    function normalizeAuditTrail(entries) {
        if (global.SpecLifecycle?.normalizeAuditTrail) {
            return global.SpecLifecycle.normalizeAuditTrail(entries);
        }
        return Array.isArray(entries) ? entries : [];
    }

    function normalizePlacement(placement = {}) {
        const normalized = { ...placement };
        const legacyColors = Array.isArray(placement.colors) ? placement.colors : [];

        normalized.printColors = Array.isArray(placement.printColors)
            ? placement.printColors
            : legacyColors.filter((item) => PRINT_COLOR_TYPES.has(normalizedType(item)));

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

        // Sequence lifecycle is attached to the placement because the production
        // sequence belongs to a placement and may be approved independently.
        normalized.sequenceLifecycle = normalizeLifecycle(placement.sequenceLifecycle);

        return normalized;
    }

    function normalizeSpecData(spec = {}) {
        const placements = Array.isArray(spec.placements) ? spec.placements : [];

        return {
            ...spec,
            specLifecycle: normalizeLifecycle(spec.specLifecycle),
            styleVersion: normalizeStyleVersion(
                spec.styleVersion || {
                    number: spec.specLifecycle?.version,
                    parentVersion: spec.specLifecycle?.parentVersion
                },
                spec.generalData && typeof spec.generalData === 'object' ? spec.generalData : spec
            ),
            auditTrail: normalizeAuditTrail(spec.auditTrail),
            placements: placements.map(normalizePlacement)
        };
    }

    global.SpecNormalizer = { normalizePlacement, normalizeSpecData };
})(typeof window !== 'undefined' ? window : globalThis);
