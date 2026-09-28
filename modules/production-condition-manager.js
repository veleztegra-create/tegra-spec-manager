// =====================================================
// production-condition-manager.js
// CRUD LOCAL DE CONDICIONES DE PRODUCCIÓN
// =====================================================

window.ProductionConditionManager = (function () {
    "use strict";

    const STORAGE_KEY = "tegra.productionConditions.v1";

    function normalize(value) {
        return String(value || "").trim();
    }

    function defaultConditions() {
        return Array.isArray(window.TegraProductionConditions?.conditions)
            ? window.TegraProductionConditions.conditions.map(condition => ({ ...condition }))
            : [];
    }

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return defaultConditions();
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : defaultConditions();
        } catch (error) {
            console.warn("No se pudieron cargar condiciones locales:", error);
            return defaultConditions();
        }
    }

    function save(conditions) {
        const safe = Array.isArray(conditions) ? conditions : [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
        syncEngine(safe);
        return safe;
    }

    function syncEngine(conditions) {
        window.TegraProductionConditions = {
            version: 1,
            conditions: conditions.map(condition => ({ ...condition }))
        };
    }

    function initialize() {
        const conditions = load();
        syncEngine(conditions);
        return conditions;
    }

    function createCondition(input = {}) {
        const now = new Date().toISOString();
        return {
            id: input.id || "condition-" + Date.now(),
            type: normalize(input.type) || "DIRECT_TO_BLOCKER",
            active: input.active !== false,
            color: normalize(input.color),
            message: normalize(input.message),
            severity: normalize(input.severity) || "INFO",
            tags: Array.isArray(input.tags) ? input.tags : ["DIRECT_TO_BLOCKER"],
            source: normalize(input.source) || "DEVELOPMENT_APPROVAL",
            notes: normalize(input.notes),
            createdAt: input.createdAt || now,
            updatedAt: now
        };
    }

    function upsert(input) {
        const conditions = load();
        const condition = createCondition(input);
        const index = conditions.findIndex(item => item.id === condition.id);

        if (index >= 0) conditions[index] = condition;
        else conditions.push(condition);

        save(conditions);
        return condition;
    }

    function remove(id) {
        const conditions = load().filter(condition => condition.id !== id);
        save(conditions);
        return conditions;
    }

    function toggle(id) {
        const conditions = load();
        const condition = conditions.find(item => item.id === id);
        if (!condition) return null;

        condition.active = condition.active === false;
        condition.updatedAt = new Date().toISOString();
        save(conditions);
        return condition;
    }

    function exportData() {
        const payload = {
            schemaVersion: 1,
            exportedAt: new Date().toISOString(),
            conditions: load()
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], {
            type: "application/json"
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "tegra-production-conditions.json";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    }

    function importData(file) {
        return new Promise((resolve, reject) => {
            if (!file) return reject(new Error("Archivo no seleccionado."));

            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const payload = JSON.parse(reader.result);
                    const conditions = Array.isArray(payload)
                        ? payload
                        : payload.conditions;

                    if (!Array.isArray(conditions)) {
                        throw new Error("El archivo no contiene una lista de condiciones.");
                    }

                    const normalized = conditions
                        .map(condition => createCondition(condition))
                        .filter(condition => condition.color);

                    save(normalized);
                    resolve(normalized);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(reader.error || new Error("No se pudo leer el archivo."));
            reader.readAsText(file);
        });
    }

    return {
        initialize,
        load,
        save,
        createCondition,
        upsert,
        remove,
        toggle,
        exportData,
        importData
    };
})();
