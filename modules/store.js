// store.js - Responsive State Manager for Tegra Specs
(function () {
    const listeners = [];
    let history = [];
    let future = [];

    let rawState = {
        generalData: {
            customer: "",
            style: "",
            season: "",
            colorway: "",
            po: "",
            nameTeam: "",
            program: "",
            specDate: ""
        },
        placements: []
    };

    function notify() {
        // Pass a clean snapshot to listeners
        const snapshot = Store.getState();
        listeners.forEach(fn => fn(snapshot));
    }

    function saveHistory() {
        history.push(structuredClone(rawState));
        future = []; // Clear future when a new action is performed
    }

    function createReactive(obj) {
        return new Proxy(obj, {
            get(target, prop) {
                const value = target[prop];
                // Deep proxy wrapper for nested objects and arrays
                if (typeof value === "object" && value !== null) {
                    return createReactive(value);
                }
                return value;
            },
            set(target, prop, value) {
                // Prevent loops: only update if value actually changed
                if (target[prop] !== value) {
                    saveHistory();
                    target[prop] = value;
                    notify();
                }
                return true;
            }
        });
    }

    // Initialize root proxy
    let stateProxy = createReactive(rawState);

    const Store = {
        get state() {
            return stateProxy;
        },

        subscribe(fn) {
            listeners.push(fn);
        },

        getState() {
            // Returns a deep clone of the raw state losing the Proxy wrapper (safe for JSON/Backend)
            return structuredClone(rawState);
        },

        replaceState(newState) {
            // Used for initial load from autosave or completely overriding state without polluting history
            rawState = structuredClone(newState);
            stateProxy = createReactive(rawState);
            notify();
        },

        undo() {
            if (history.length === 0) return;
            // Save current state into future for redo
            future.push(structuredClone(rawState));
            // Pop last state from history
            rawState = history.pop();
            stateProxy = createReactive(rawState);
            notify();
        },

        redo() {
            if (future.length === 0) return;
            // Save current state into history for undo
            history.push(structuredClone(rawState));
            // Pop first future state 
            rawState = future.pop();
            stateProxy = createReactive(rawState);
            notify();
        }
    };

    // Expose globally
    window.Store = Store;
})();
