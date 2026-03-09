// autosave.js - LocalStorage persistence with Debounce

(function () {
    let saveTimer;

    function enableAutosave() {
        if (!window.Store) {
            console.error("Store is not initialized for Autosave.");
            return;
        }

        Store.subscribe((state) => {
            // Debounce save to prevent heavy disk writes on every keystroke
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => {
                try {
                    // Crear una copia ligera sin datos grandes
                    const lightState = {
                        generalData: state.generalData,
                        placements: state.placements.map(p => ({
                            ...p,
                            // Excluir imágenes del autosave para ahorrar espacio
                            imageData: p.imageData ? '[IMAGE_DATA]' : null
                        }))
                    };
                    localStorage.setItem("spec-autosave", JSON.stringify(lightState));
                    console.log("[Autosave] State successfully saved locally.");
                } catch (e) {
                    console.error("[Autosave] Failed to save state to localStorage", e);
                    // Si falla, intentar sin datos de placements
                    try {
                        const minimalState = {
                            generalData: state.generalData,
                            placements: []
                        };
                        localStorage.setItem("spec-autosave", JSON.stringify(minimalState));
                        console.log("[Autosave] Minimal state saved");
                    } catch (e2) {
                        console.error("[Autosave] Critical: Cannot save even minimal state");
                    }
                }
            }, 1000); // Aumentar debounce a 1000ms
        });
    }

    window.enableAutosave = enableAutosave;
})();
