// store.js - Responsive State Manager for Tegra Specs
(function () {
    const listeners = [];
    let history = [];
    let future = [];

    const DEFAULT_STATE = {
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

    function normalizeState(candidateState) {
        const safeCandidate = (candidateState && typeof candidateState === 'object') ? candidateState : {};
        const legacyGeneralData = (safeCandidate.generalData && typeof safeCandidate.generalData === 'object')
            ? safeCandidate.generalData
            : safeCandidate;

        return {
            ...safeCandidate,
            generalData: {
                ...DEFAULT_STATE.generalData,
                ...legacyGeneralData
            },
            placements: Array.isArray(safeCandidate.placements)
                ? safeCandidate.placements
                : []
        };
    }

    let rawState = normalizeState(DEFAULT_STATE);

    function deepCloneFallback(value, seen = new WeakMap()) {
        if (value === null || typeof value !== 'object') return value;
        if (seen.has(value)) return seen.get(value);

        if (Array.isArray(value)) {
            const arr = [];
            seen.set(value, arr);
            value.forEach((item, idx) => {
                arr[idx] = deepCloneFallback(item, seen);
            });
            return arr;
        }

        const out = {};
        seen.set(value, out);
        Object.keys(value).forEach((key) => {
            out[key] = deepCloneFallback(value[key], seen);
        });
        return out;
    }

    function safeClone(value) {
        try {
            return structuredClone(value);
        } catch (error) {
            return deepCloneFallback(value);
        }
    }

    function notify() {
        // Pass a clean snapshot to listeners
        const snapshot = Store.getState();
        listeners.forEach(fn => fn(snapshot));
    }

    function saveHistory() {
        history.push(safeClone(rawState));
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
                    target[prop] = safeClone(value);
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
            return safeClone(rawState);
        },

        replaceState(newState) {
            // Used for initial load from autosave or completely overriding state without polluting history
            rawState = normalizeState(safeClone(newState));
            stateProxy = createReactive(rawState);
            notify();
        },

        undo() {
            if (history.length === 0) return;
            // Save current state into future for redo
            future.push(safeClone(rawState));
            // Pop last state from history
            rawState = history.pop();
            stateProxy = createReactive(rawState);
            notify();
        },

        redo() {
            if (future.length === 0) return;
            // Save current state into history for undo
            history.push(safeClone(rawState));
            // Pop first future state 
            rawState = future.pop();
            stateProxy = createReactive(rawState);
            notify();
        }
    };

    // Expose globally
    window.Store = Store;
})();
