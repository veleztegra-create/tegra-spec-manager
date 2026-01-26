// =================================================================================
// UTILS.JS - TEGRA TECHNICAL SPEC MANAGER
// Funciones de ayuda, validación y lógica de negocio.
// =================================================================================

window.Utils = {

    /**
     * Normaliza y valida un nombre de color contra las bases de datos disponibles.
     * @param {string} colorName - El nombre del color a verificar.
     * @returns {{isValid: boolean, foundIn: string|null, finalName: string}} 
     *          - isValid: true si se encuentra en alguna DB.
     *          - foundIn: El nombre de la DB donde se encontró (e.g., 'PANTONE').
     *          - finalName: El nombre del color normalizado (mayúsculas, sin espacios extra).
     */
    validateColor: function(colorName) {
        if (!colorName) return { isValid: false, foundIn: null, finalName: '' };

        const normalizedName = colorName.toUpperCase().trim();
        const result = { isValid: false, foundIn: null, finalName: normalizedName };

        if (!window.AppConfig || !window.AppConfig.COLOR_DATABASES) {
            console.error("Utils.validateColor: AppConfig.COLOR_DATABASES no está definido.");
            return result; // No se puede validar si las bases de datos no existen.
        }

        const { PANTONE, GEARFORSPORT, INSTITUCIONAL } = window.AppConfig.COLOR_DATABASES;

        // 1. Búsqueda en PANTONE (la más común)
        if (PANTONE && PANTONE[normalizedName]) {
            result.isValid = true;
            result.foundIn = 'PANTONE';
            return result;
        }

        // 2. Búsqueda en GEARFORSPORT
        if (GEARFORSPORT && GEARFORSPORT[normalizedName]) {
            result.isValid = true;
            result.foundIn = 'GEARFORSPORT';
            return result;
        }

        // 3. Búsqueda en INSTITUCIONAL
        if (INSTITUCIONAL && INSTITUCIONAL[normalizedName]) {
            result.isValid = true;
            result.foundIn = 'INSTITUCIONAL';
            return result;
        }

        // Si no se encuentra en ninguna base de datos, el color no es válido.
        return result;
    },

    /**
     * Busca un nombre de equipo en el mapa de Gear For Sport basado en el Style/PO.
     * @param {string} styleOrPo - El número de estilo o PO.
     * @returns {string|null} El nombre del equipo encontrado o null si no hay coincidencia.
     */
    findTeamForGear: function(styleOrPo) {
        if (!styleOrPo) return null;

        const normalizedInput = styleOrPo.toUpperCase().trim();

        if (!window.AppConfig || !window.AppConfig.GEARFORSPORT_TEAM_MAP) {
            console.error("Utils.findTeamForGear: AppConfig.GEARFORSPORT_TEAM_MAP no está definido.");
            return null;
        }

        const teamMap = window.AppConfig.GEARFORSPORT_TEAM_MAP;

        // Búsqueda de coincidencia exacta primero
        if (teamMap[normalizedInput]) {
            return teamMap[normalizedInput];
        }

        // Búsqueda de coincidencia parcial (por si el usuario solo pone el final)
        for (const key in teamMap) {
            if (normalizedInput.includes(key)) {
                return teamMap[key];
            }
        }

        return null; // No se encontró coincidencia
    }
};
