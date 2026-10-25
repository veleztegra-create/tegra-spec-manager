// Production Alerts: advertencias de estilo independientes de los colores.
(function () {
  "use strict";

  const SOURCE_FIELDS = [
    ["sampleType", "Sample Type / Stage"],
    ["style", "Style"],
    ["pattern", "Pattern"],
    ["exportedPatternName", "Exported Pattern Name"],
    ["blankPatternName", "Blank Pattern Name"],
    ["customerTechpackName", "Customer Tech Pack Name"],
    ["customerSchematicName", "Customer Schematic Name"]
  ];

  function hasPpfToken(value) {
    // PPF debe aparecer como token, por ejemplo PPF, STYLE_PPF o STYLE-PPF.
    // No se buscan comentarios libres ni el campo de tela para evitar falsos positivos.
    return /(^|[^A-Z0-9])PPF([^A-Z0-9]|$)/i.test(String(value || "").trim());
  }

  function getPpfSources(data = {}) {
    return SOURCE_FIELDS
      .filter(([key]) => hasPpfToken(data[key]))
      .map(([key, label]) => ({ key, label, value: String(data[key] || "").trim() }));
  }

  function isHotHead(step) {
    const values = [step?.type, step?.tipo, step?.stationType, step?.val, step?.nombre, step?.name];
    return values.some(value => {
      const normalized = String(value || "").toUpperCase().replace(/[\s-]+/g, "_");
      return normalized === "HOT_HEAD" || normalized.includes("HOT_HEAD");
    });
  }

  function evaluate(data = {}) {
    const sources = getPpfSources(data);
    if (!sources.length) return [];

    const placements = Array.isArray(data.placements) ? data.placements : [];
    const hotHeadPlacements = placements.filter(placement =>
      Array.isArray(placement?.sequence) && placement.sequence.some(isHotHead)
    );

    if (!hotHeadPlacements.length) {
      return [{
        id: "PPF_HOT_HEAD",
        code: "PPF_HOT_HEAD_MISSING",
        severity: "WARNING",
        status: "MISSING",
        title: "PPF — HOT HEAD pendiente",
        message: "Se detectó contexto PPF, pero no se encontró una estación HOT HEAD en las secuencias de los placements. Agrégala manualmente en la secuencia de producción correspondiente.",
        sources,
        verified: false
      }];
    }

    return [{
      id: "PPF_HOT_HEAD",
      code: "PPF_HOT_HEAD_REVIEW",
      severity: "WARNING",
      status: "REVIEW",
      title: "PPF — revisar secuencia HOT HEAD",
      message: "Se detectó contexto PPF y HOT HEAD está presente. Confirma que esté en el placement correcto y en el orden aprobado para este proceso; su presencia por sí sola no verifica la secuencia.",
      sources,
      placements: hotHeadPlacements.map(placement => String(placement.title || placement.type || placement.name || ("Placement " + placement.id))),
      verified: false
    }];
  }

  function currentData() {
    const base = typeof window.buildSpecData === "function" ? window.buildSpecData() : {};
    const read = (id, key) => {
      const element = document.getElementById(id);
      return element ? element.value : (base[key] || "");
    };
    return {
      ...base,
      style: read("style", "style"),
      sampleType: read("sample-type", "sampleType"),
      pattern: read("pattern", "pattern"),
      exportedPatternName: read("exported-pattern-name", "exportedPatternName"),
      blankPatternName: read("blank-pattern-name", "blankPatternName"),
      customerTechpackName: read("customer-techpack-name", "customerTechpackName"),
      customerSchematicName: read("customer-schematic-name", "customerSchematicName"),
      placements: Array.isArray(window.placements) ? window.placements : (base.placements || [])
    };
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[character]));
  }

  function render() {
    const container = document.getElementById("production-alerts-panel");
    if (!container) return;
    const alerts = evaluate(currentData());
    container.hidden = alerts.length === 0;
    if (!alerts.length) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = alerts.map(alert => {
      const isMissing = alert.status === "MISSING";
      const sources = alert.sources.map(source => source.label + ": " + source.value).join(" · ");
      const placements = alert.placements?.length
        ? '<p class="production-alert-meta">HOT HEAD encontrado en: ' + escapeHtml(alert.placements.join(", ")) + '</p>'
        : "";
      return '<article class="production-alert-card ' + (isMissing ? "is-missing" : "is-review") + '">' +
        '<div class="production-alert-icon"><i class="fas ' + (isMissing ? "fa-triangle-exclamation" : "fa-clipboard-check") + '"></i></div>' +
        '<div class="production-alert-content"><h3>' + escapeHtml(alert.title) + '</h3>' +
        '<p>' + escapeHtml(alert.message) + '</p>' + placements +
        '<p class="production-alert-meta">Detectado en: ' + escapeHtml(sources) + '</p></div>' +
        '<span class="production-alert-status">' + (isMissing ? "PENDIENTE" : "REVISAR") + '</span></article>';
    }).join("");
  }

  let initialized = false;
  function initialize() {
    render();
    if (initialized) return;
    initialized = true;
    const form = document.getElementById("spec-creator-form");
    if (form) {
      form.addEventListener("input", render);
      form.addEventListener("change", render);
    }
    const placementsContainer = document.getElementById("placements-container");
    if (placementsContainer && typeof MutationObserver !== "undefined") {
      const observer = new MutationObserver(render);
      observer.observe(placementsContainer, { childList: true, subtree: true, characterData: true });
    }
    // También refresca después de cambios de secuencia hechos por los controles de estaciones.
    document.addEventListener("click", event => {
      if (event.target?.closest?.("#placements-container")) {
        window.setTimeout(render, 0);
      }
    });
  }

  window.ProductionAlerts = { evaluate, hasPpfToken };
  window.ProductionAlertsUI = { initialize, render };
})();
