// =====================================================
// production-condition-engine.js
// LÓGICA PARA EVALUAR CONDICIONES DE PRODUCCIÓN
// =====================================================

window.ProductionConditionEngine = (function () {
    "use strict";

    function normalize(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase()
            .replace(/[\u2013\u2014]/g, "-")
            .replace(/\s+/g, " ")
            .trim();
    }

    function getConditions() {
        const source = window.TegraProductionConditions;
        return Array.isArray(source?.conditions) ? source.conditions : [];
    }

    function getActiveConditions(type) {
        const wantedType = normalize(type);
        return getConditions().filter(condition =>
            condition?.active !== false &&
            normalize(condition?.type) === wantedType
        );
    }

    function colorMatches(conditionColor, actualColor) {
        const expected = normalize(conditionColor);
        const actual = normalize(actualColor);
        if (!expected || !actual) return false;

        // Exact match first. The containment fallback supports catalog
        // values such as "41L MARINE 3%" without weakening the match too much.
        if (expected === actual) return true;
        return actual.includes(expected) || expected.includes(actual);
    }

    function findMatchingConditions(colors, type = "DIRECT_TO_BLOCKER") {
        const actualColors = Array.isArray(colors)
            ? colors.map(color => typeof color === "string" ? color : color?.val).filter(Boolean)
            : [];

        const conditions = getActiveConditions(type);

        return actualColors.map(color => ({
            color,
            matches: conditions.filter(condition => colorMatches(condition.color, color))
        }));
    }

    function allColorsHaveCondition(colors, type = "DIRECT_TO_BLOCKER") {
        const actualColors = Array.isArray(colors)
            ? colors.map(color => typeof color === "string" ? color : color?.val).filter(Boolean)
            : [];

        if (actualColors.length === 0) return false;

        const results = findMatchingConditions(actualColors, type);
        return results.every(result => result.matches.length > 0);
    }

    function getApplicableConditions(colors, type = "DIRECT_TO_BLOCKER") {
        return findMatchingConditions(colors, type)
            .flatMap(result => result.matches.map(condition => ({
                ...condition,
                matchedColor: result.color
            })));
    }

    function evaluatePlacement(params = {}) {
        const colors = Array.isArray(params.designColors)
            ? params.designColors
            : [];

        const directToBlocker = allColorsHaveCondition(colors, "DIRECT_TO_BLOCKER");

        return {
            directToBlocker,
            matchedConditions: getApplicableConditions(colors, "DIRECT_TO_BLOCKER"),
            reason: directToBlocker
                ? "Todos los colores del arte tienen una condición aprobada DIRECT_TO_BLOCKER."
                : "El conjunto de colores no tiene una condición DIRECT_TO_BLOCKER completa."
        };
    }

    return {
        getConditions,
        findMatchingConditions,
        allColorsHaveCondition,
        getApplicableConditions,
        evaluatePlacement
    };
})();
