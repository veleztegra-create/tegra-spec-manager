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

    // C. Date is the creation date of the current stage/folder. Older specs
    // may not have specDate populated, so recover it from stageDate, the
    // version creation timestamp, or (as a final fallback) today's date.
    const creationDate = String(
        state.generalData?.stageDate ||
        state.generalData?.specDate ||
        state.generalData?.artworkDate ||
        styleVersion?.createdAt ||
        new Date().toISOString()
    ).slice(0, 10);

    return {
        ...state.generalData,
        specDate: creationDate,
        stageDate: state.generalData?.stageDate || creationDate,
        // Printed Modification Date follows the live date shown in the app
        // header below # Folder; lastModified remains the separate audit value.
        modificationDate: new Date().toISOString(),
        colorwayHex: colorwayHex ? String(colorwayHex).toUpperCase() : '',
        placements: state.placements,
        styleVersion,
        versionHistory: Array.isArray(state.versionHistory)
            ? state.versionHistory
            : [],
        specLifecycle: state.specLifecycle,
        auditTrail: state.auditTrail,
        lastModified: state.lastModified || state.generalData?.lastModified || null,
        savedAt: new Date().toISOString()
    };
}
