// =====================================================
// MODELO CENTRAL DE DATOS SPEC
// =====================================================

function buildSpecData() {
    if (!window.Store) {
        console.error("Store is not initialized. Cannot build spec data.");
        return { placements: [] };
    }

    // El Store es la única fuente de verdad para la serialización.
    const state = Store.getState();

    const styleVersion = window.StyleVersion?.normalizeStyleVersion
        ? window.StyleVersion.normalizeStyleVersion(
            {
                ...(state.styleVersion || {}),
                swoSnapshot: {
                    ...(state.styleVersion?.swoSnapshot || {}),
                    ...(state.generalData || {})
                }
            },
            state.generalData || {}
        )
        : state.styleVersion;

    const colorway = String(state.generalData?.colorway || '').trim();
    const colorwayHex = colorway && window.ColorConfig?.findColorHex
        ? window.ColorConfig.findColorHex(colorway)
        : null;

    return {
        ...state.generalData,
        colorwayHex: colorwayHex ? String(colorwayHex).toUpperCase() : '',
        placements: state.placements,
        styleVersion,
        versionHistory: Array.isArray(state.versionHistory)
            ? state.versionHistory
            : [],
        specLifecycle: state.specLifecycle,
        auditTrail: state.auditTrail,
        savedAt: new Date().toISOString()
    };
}
