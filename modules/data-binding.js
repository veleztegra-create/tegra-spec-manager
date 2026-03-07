// data-binding.js - Two-way data binding for Vanilla JS

(function () {
    function initBindings() {
        if (!window.Store) {
            console.error("Store is not initialized for Data Binding.");
            return;
        }

        const generalInputs = document.querySelectorAll("[data-bind-general]");

        // 1. View -> Store (User typing)
        generalInputs.forEach(input => {
            const key = input.getAttribute("data-bind-general");

            input.addEventListener("input", (e) => {
                // Updating the Proxy triggers notify()
                Store.state.generalData[key] = e.target.value;
            });

            // Handle checkboxes or selects if needed
            input.addEventListener("change", (e) => {
                if (input.type === 'checkbox') {
                    Store.state.generalData[key] = e.target.checked;
                } else {
                    Store.state.generalData[key] = e.target.value;
                }
            });
        });

        // 2. Store -> View (State changed externally, e.g., Undo, Load, Init)
        Store.subscribe((state) => {
            generalInputs.forEach(input => {
                const key = input.getAttribute("data-bind-general");
                const stateValue = state.generalData[key] || "";

                // Prevent infinite loop (Input -> State -> Input -> State)
                if (input.type === 'checkbox') {
                    if (input.checked !== Boolean(stateValue)) {
                        input.checked = Boolean(stateValue);
                    }
                } else {
                    if (input.value !== String(stateValue)) {
                        input.value = stateValue;
                    }
                }
            });
        });

        // Trigger an initial sync from View to Store (to capture HTML default values)
        // or from Store to View (if loaded from Autosave previously)
        // We do Store -> View here to populate UI with loaded data.
        const currentState = Store.getState();
        generalInputs.forEach(input => {
            const key = input.getAttribute("data-bind-general");
            if (currentState.generalData[key]) {
                input.value = currentState.generalData[key];
            } else {
                // If store is empty, grab the HTML value to initialize the store
                Store.state.generalData[key] = input.value;
            }
        });
    }

    // Expose globally
    window.initBindings = initBindings;
})();
