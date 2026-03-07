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
                    localStorage.setItem("spec-autosave", JSON.stringify(state));
                    console.log("[Autosave] State successfully saved locally.");
                } catch (e) {
                    console.error("[Autosave] Failed to save state to localStorage", e);
                }
            }, 500); // 500ms debounce
        });
    }

    window.enableAutosave = enableAutosave;
})();
