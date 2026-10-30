// PPF production alerts. HOT HEAD is intentionally semimanual:
// detection informs the operator but never inserts the station automatically.
(function () {
    "use strict";

    const SOURCE_FIELDS = [
        ["sample-type", "Sample Type / Stage"],
        ["style", "Style"],
        ["pattern", "Pattern"],
        ["exported-pattern-name", "Exported Pattern Name"],
        ["blank-pattern-name", "Blank Pattern Name"],
        ["customer-techpack-name", "Customer Tech Pack Name"],
        ["customer-schematic-name", "Customer Schematic Name"]
    ];

    function hasPpfToken(value) {
        return /(^|[^A-Z0-9])PPF([^A-Z0-9]|$)/i.test(String(value || "").trim());
    }

    function isHotHead(step) {
        const values = [step?.type, step?.tipo, step?.stationType, step?.val, step?.nombre];
        return values.some(value =>
            String(value || "").toUpperCase().replace(/[\s-]+/g, "_").includes("HOT_HEAD")
        );
    }

    function getSources(data = {}) {
        return SOURCE_FIELDS
            .filter(([id]) => hasPpfToken(data[id]))
            .map(([id, label]) => ({ id, label, value: String(data[id] || "").trim() }));
    }

    function evaluate(data = {}) {
        const sources = getSources(data);
        if (!sources.length) return [];

        const placements = Array.isArray(data.placements) ? data.placements : [];
        const found = placements
            .filter(placement => Array.isArray(placement?.sequence) && placement.sequence.some(isHotHead))
            .map(placement => ({
                title: String(placement.title || placement.type || placement.name || ("Placement " + placement.id)),
                sequence: placement.sequence
            }));

        if (!found.length) {
            return [{
                code: "PPF_HOT_HEAD_MISSING",
                severity: "WARNING",
                title: "PPF detectado — HOT HEAD pendiente",
                message: "El programa detectó un dato PPF. Agrega HOT HEAD manualmente en el placement que corresponda y confirma el orden de producción.",
                sources
            }];
        }

        const duplicatePlacements = found.filter(item => item.sequence.filter(isHotHead).length > 1);
        const badOrder = found.filter(item => {
            const index = item.sequence.findIndex(isHotHead);
            const before = item.sequence.slice(0, index);
            const after = item.sequence.slice(index + 1);
            const hasFlashCoolBefore = before.some(step => String(step.type || step.tipo || "").toUpperCase() === "FLASH") &&
                before.some(step => String(step.type || step.tipo || "").toUpperCase() === "COOL");
            const hasCoolAfter = after.some(step => String(step.type || step.tipo || "").toUpperCase() === "COOL");
            return !hasFlashCoolBefore || !hasCoolAfter;
        });

        return [{
            code: duplicatePlacements.length || badOrder.length ? "PPF_HOT_HEAD_REVIEW" : "PPF_HOT_HEAD_PRESENT",
            severity: "WARNING",
            title: "PPF detectado — revisar HOT HEAD",
            message: duplicatePlacements.length
                ? "Se encontró más de un HOT HEAD en un placement. Revisa y elimina duplicados."
                : badOrder.length
                    ? "HOT HEAD está presente, pero no se pudo confirmar automáticamente el ciclo FLASH / COOL anterior y COOL posterior. Revisa el orden manualmente."
                    : "HOT HEAD está presente. Confirma que esté en el placement correcto y que la secuencia coincida con la instrucción de producción. La detección no equivale a aprobación.",
            placements: found.map(item => item.title),
            sources
        }];
    }

    function readCurrentData() {
        const read = id => document.getElementById(id)?.value || "";
        return {
            "sample-type": read("sample-type"),
            style: read("style"),
            pattern: read("pattern"),
            "exported-pattern-name": read("exported-pattern-name"),
            "blank-pattern-name": read("blank-pattern-name"),
            "customer-techpack-name": read("customer-techpack-name"),
            "customer-schematic-name": read("customer-schematic-name"),
            placements: Array.isArray(window.placements) ? window.placements : []
        };
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[character]));
    }

    function render() {
        const panel = document.getElementById("production-alerts-panel");
        if (!panel) return;
        const alerts = evaluate(readCurrentData());
        panel.hidden = alerts.length === 0;
        if (!alerts.length) {
            panel.innerHTML = "";
            return;
        }
        panel.innerHTML = alerts.map(alert => {
            const sources = alert.sources.map(source => source.label + ": " + source.value).join(" · ");
            const placements = alert.placements?.length
                ? '<p class="production-alert-meta">HOT HEAD encontrado en: ' + escapeHtml(alert.placements.join(", ")) + '</p>'
                : "";
            return '<article class="production-alert-card">' +
                '<div class="production-alert-content"><h3>' + escapeHtml(alert.title) + '</h3>' +
                '<p>' + escapeHtml(alert.message) + '</p>' + placements +
                '<p class="production-alert-meta">Detectado en: ' + escapeHtml(sources) + '</p></div></article>';
        }).join("");
    }

    function initialize() {
        document.addEventListener("input", render);
        document.addEventListener("change", render);
        const observer = new MutationObserver(records => {
            const panel = document.getElementById("production-alerts-panel");
            if (records.some(record => !panel || !panel.contains(record.target))) render();
        });
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        render();
    }

    window.ProductionAlerts = { evaluate, hasPpfToken };
    window.ProductionAlertsUI = { initialize, render };
    if (typeof document !== "undefined") {
        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
        else initialize();
    }
})();