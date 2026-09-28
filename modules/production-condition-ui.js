// =====================================================
// production-conditions-ui.js
// =====================================================

window.ProductionConditionsUI = (function () {
    "use strict";

    let initialized = false;

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function render() {
        const container = document.getElementById("production-conditions-list");
        if (!container || !window.ProductionConditionManager) return;

        const conditions = window.ProductionConditionManager.load();

        if (!conditions.length) {
            container.innerHTML = '<div class="card"><div class="card-body">No hay condiciones registradas.</div></div>';
            return;
        }

        container.innerHTML = conditions.map(condition => {
            const active = condition.active !== false;
            const severityClass = condition.severity === "BLOCKER"
                ? "pc-severity-blocker"
                : condition.severity === "WARNING"
                    ? "pc-severity-warning"
                    : "pc-severity-info";

            return '<div class="card production-condition-card ' + (active ? "" : "production-condition-disabled") + '">' +
                '<div class="card-body">' +
                    '<div class="production-condition-row">' +
                        '<div class="production-condition-main">' +
                            '<div class="production-condition-title">' +
                                '<strong>' + escapeHtml(condition.color) + '</strong>' +
                                '<span class="pc-badge ' + severityClass + '">' + escapeHtml(condition.severity || "INFO") + '</span>' +
                                '<span class="pc-badge">' + escapeHtml(condition.type) + '</span>' +
                                (!active ? '<span class="pc-badge">INACTIVA</span>' : '') +
                            '</div>' +
                            '<div class="production-condition-message">' + escapeHtml(condition.message) + '</div>' +
                            (condition.notes ? '<div class="production-condition-notes"><i class="fas fa-note-sticky"></i> ' + escapeHtml(condition.notes) + '</div>' : '') +
                        '</div>' +
                        '<div class="button-group">' +
                            '<button class="btn btn-outline btn-sm" onclick="ProductionConditionsUI.toggle(\'' + escapeHtml(condition.id) + '\')">' +
                                (active ? '<i class="fas fa-toggle-on"></i> Desactivar' : '<i class="fas fa-toggle-off"></i> Activar') +
                            '</button>' +
                            '<button class="btn btn-danger btn-sm" onclick="ProductionConditionsUI.remove(\'' + escapeHtml(condition.id) + '\')">' +
                                '<i class="fas fa-trash"></i>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }).join("");
    }

    function add() {
        const color = document.getElementById("pc-color")?.value.trim();
        const type = document.getElementById("pc-type")?.value;
        const severity = document.getElementById("pc-severity")?.value;
        const message = document.getElementById("pc-message")?.value.trim();
        const notes = document.getElementById("pc-notes")?.value.trim();

        if (!color) {
            alert("Debes indicar el color o Pantone.");
            return;
        }

        if (!message) {
            alert("Debes indicar el mensaje de la condición.");
            return;
        }

        window.ProductionConditionManager.upsert({
            type,
            color,
            severity,
            message,
            notes,
            tags: [type]
        });

        ["pc-color", "pc-message", "pc-notes"].forEach(id => {
            const field = document.getElementById(id);
            if (field) field.value = "";
        });

        render();
    }

    function toggle(id) {
        window.ProductionConditionManager.toggle(id);
        render();
    }

    function remove(id) {
        if (!confirm("¿Eliminar esta condición de producción?")) return;
        window.ProductionConditionManager.remove(id);
        render();
    }

    function exportData() {
        window.ProductionConditionManager.exportData();
    }

    async function importData(file) {
        try {
            await window.ProductionConditionManager.importData(file);
            render();
            alert("Condiciones de producción importadas correctamente.");
        } catch (error) {
            console.error(error);
            alert("No se pudieron importar las condiciones: " + error.message);
        }
    }

    function initialize() {
        if (initialized) {
            render();
            return;
        }

        initialized = true;
        window.ProductionConditionManager.initialize();
        render();
    }

    return { initialize, render, add, toggle, remove, exportData, importData };
})();
