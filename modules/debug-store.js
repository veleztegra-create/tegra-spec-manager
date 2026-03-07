// debug-store.js - Console debug utility

(function () {
    function enableStateDebugger() {
        if (!window.Store) {
            console.error("Store is not initialized for Debugger.");
            return;
        }

        Store.subscribe((state) => {
            console.log("🟦 [STATE UPDATE]");
            console.log(state);
        });
    }

    window.enableStateDebugger = enableStateDebugger;
})();
