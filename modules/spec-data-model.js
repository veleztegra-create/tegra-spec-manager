// =====================================================
// MODELO CENTRAL DE DATOS SPEC
// =====================================================

function buildSpecData() {
    if (!window.Store) {
        console.error("Store is not initialized. Cannot build spec data.");
        // Fallback or empty struct if called prematurely
        return { placements: [] };
    }

    // El Store es ahora la única fuente de la verdad
    const state = Store.getState();

    return {
        ...state.generalData,
        placements: state.placements,
        savedAt: new Date().toISOString()
    };
}
