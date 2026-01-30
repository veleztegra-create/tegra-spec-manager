// js/modules/placements/placements-core.js
// Módulo central de gestión de placements

console.log('🎯 Módulo placements-core.js cargado');

const PlacementsCore = (function() {
    // ========== VARIABLES DEL MÓDULO ==========
    let placements = [];
    let currentPlacementId = 1;
    
    // ========== FUNCIONES PRINCIPALES ==========
    
    /**
     * Inicializa el sistema de placements
     * @returns {number} ID del primer placement creado
     */
    function initializePlacements() {
        console.log('🔄 Inicializando sistema de placements...');
        
        const firstPlacementId = addNewPlacement('FRONT', true);
        
        if (placements.length > 0) {
            // Usar el renderizador si está disponible
            if (window.PlacementsUI && window.PlacementsUI.renderPlacementHTML) {
                window.PlacementsUI.renderPlacementHTML(placements[0]);
            } else {
                // Fallback a función global
                if (typeof window.renderPlacementHTML === 'function') {
                    window.renderPlacementHTML(placements[0]);
                }
            }
        }
        
        // Actualizar UI si está disponible
        if (window.PlacementsUI && window.PlacementsUI.updatePlacementsTabs) {
            window.PlacementsUI.updatePlacementsTabs();
        }
        
        if (window.PlacementsUI && window.PlacementsUI.showPlacement) {
            window.PlacementsUI.showPlacement(firstPlacementId);
        }
        
        console.log(`✅ Sistema de placements inicializado. ID: ${firstPlacementId}`);
        return firstPlacementId;
    }
    
    /**
     * Agrega un nuevo placement
     * @param {string} type - Tipo de placement (FRONT, BACK, etc.)
     * @param {boolean} isFirst - Si es el primer placement
     * @returns {number} ID del nuevo placement
     */
    function addNewPlacement(type = null, isFirst = false) {
        const placementId = isFirst ? 1 : Date.now();
        const placementType = type || getNextPlacementType();
        
        const newPlacement = {
            id: placementId,
            type: placementType,
            name: `Placement ${getNextPlacementNumber()}`,
            imageData: null,
            colors: [],
            placementDetails: '#.#" FROM COLLAR SEAM',
            dimensions: 'SIZE: (W) ##" X (H) ##"',
            temp: '320 °F',
            time: '1:40 min',
            specialties: '',
            specialInstructions: '',
            inkType: 'WATER',
            placementSelect: 'FRONT',
            isActive: true,
            // Nuevos campos para parámetros editables
            meshColor: '',
            meshWhite: '',
            meshBlocker: '',
            durometer: '',
            strokes: '',
            additives: '',
            width: '',
            height: ''
        };
        
        if (!isFirst) {
            placements.push(newPlacement);
        } else {
            placements = [newPlacement];
        }
        
        console.log(`➕ Placement agregado: ${placementType} (ID: ${placementId})`);
        return placementId;
    }
    
    /**
     * Obtiene el siguiente tipo de placement disponible
     * @returns {string} Tipo de placement
     */
    function getNextPlacementType() {
        const usedTypes = placements.map(p => p.type);
        const allTypes = ['FRONT', 'BACK', 'SLEEVE', 'CHEST', 'TV. NUMBERS', 'SHOULDER', 'COLLAR', 'CUSTOM'];
        
        for (const type of allTypes) {
            if (!usedTypes.includes(type)) {
                return type;
            }
        }
        return 'CUSTOM';
    }
    
    /**
     * Obtiene el siguiente número de placement
     * @returns {number} Número del siguiente placement
     */
    function getNextPlacementNumber() {
        return placements.length + 1;
    }
    
    /**
     * Duplica un placement existente
     * @param {number} placementId - ID del placement a duplicar
     * @returns {number} ID del nuevo placement duplicado
     */
    function duplicatePlacement(placementId) {
        const original = placements.find(p => p.id === placementId);
        if (!original) {
            console.error(`❌ Placement ${placementId} no encontrado para duplicar`);
            return null;
        }
        
        const newId = Date.now();
        const displayType = original.type.includes('CUSTOM:') 
            ? original.type.replace('CUSTOM: ', '')
            : original.type;
        
        // Crear copia profunda
        const duplicate = JSON.parse(JSON.stringify(original));
        duplicate.id = newId;
        duplicate.name = displayType;
        
        // Asegurar que specialties esté definido
        if (!duplicate.specialties) duplicate.specialties = '';
        
        placements.push(duplicate);
        
        console.log(`📋 Placement duplicado: ${original.type} → ID: ${newId}`);
        return newId;
    }
    
    /**
     * Elimina un placement
     * @param {number} placementId - ID del placement a eliminar
     * @returns {boolean} True si se eliminó, False si no
     */
    function removePlacement(placementId) {
        if (placements.length <= 1) {
            console.warn('⚠️ No se puede eliminar el único placement');
            return false;
        }
        
        // Encontrar índice del placement
        const index = placements.findIndex(p => p.id === placementId);
        if (index === -1) {
            console.error(`❌ Placement ${placementId} no encontrado`);
            return false;
        }
        
        const removedType = placements[index].type;
        const wasCurrent = currentPlacementId === placementId;
        
        // Eliminar del array
        placements.splice(index, 1);
        
        console.log(`🗑️ Placement eliminado: ${removedType} (ID: ${placementId})`);
        
        // Si eliminamos el placement actual, mostrar el primero
        if (wasCurrent && placements.length > 0) {
            currentPlacementId = placements[0].id;
        }
        
        return true;
    }
    
    /**
     * Actualiza el tipo de un placement
     * @param {number} placementId - ID del placement
     * @param {string} type - Nuevo tipo
     */
    function updatePlacementType(placementId, type) {
        const placement = placements.find(p => p.id === placementId);
        if (!placement) {
            console.error(`❌ Placement ${placementId} no encontrado`);
            return;
        }
        
        if (type === 'CUSTOM') {
            if (!placement.type.startsWith('CUSTOM:')) {
                placement.type = 'CUSTOM:';
            }
        } else {
            placement.type = type;
            placement.name = type;
        }
        
        console.log(`🔄 Tipo de placement ${placementId} cambiado a: ${type}`);
    }
    
    /**
     * Actualiza el nombre de un placement personalizado
     * @param {number} placementId - ID del placement
     * @param {string} customName - Nombre personalizado
     */
    function updateCustomPlacement(placementId, customName) {
        const placement = placements.find(p => p.id === placementId);
        if (!placement || !customName.trim()) {
            return;
        }
        
        placement.type = `CUSTOM: ${customName}`;
        placement.name = customName;
        
        console.log(`✏️ Placement personalizado: "${customName}" (ID: ${placementId})`);
    }
    
    /**
     * Actualiza el tipo de tinta de un placement
     * @param {number} placementId - ID del placement
     * @param {string} inkType - Tipo de tinta (WATER, PLASTISOL, SILICONE)
     */
    function updatePlacementInkType(placementId, inkType) {
        const placement = placements.find(p => p.id === placementId);
        if (!placement) return;
        
        placement.inkType = inkType;
        
        // Obtener valores de la configuración
        const preset = window.Utils ? window.Utils.getInkPreset(inkType) : 
            (inkType === 'PLASTISOL' ? 
                { temp: '320 °F', time: '1:00 min', color: { mesh: '156/64', durometer: '65', speed: '35', angle: '15', strokes: '1', pressure: '40' } } : 
                { temp: '320 °F', time: '1:40 min', color: { mesh: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40' } }
            );
        
        placement.temp = preset.temp;
        placement.time = preset.time;
        
        console.log(`🎨 Tinta de placement ${placementId} cambiada a: ${inkType}`);
    }
    
    /**
     * Actualiza un parámetro editable de un placement
     * @param {number} placementId - ID del placement
     * @param {string} param - Nombre del parámetro
     * @param {string} value - Nuevo valor
     */
    function updatePlacementParam(placementId, param, value) {
        const placement = placements.find(p => p.id === placementId);
        if (!placement) return;
        
        placement[param] = value;
        console.log(`⚙️ Parámetro ${param} del placement ${placementId} actualizado: ${value}`);
    }
    
    /**
     * Actualiza las dimensiones de un placement
     * @param {number} placementId - ID del placement
     * @param {string} type - 'width' o 'height'
     * @param {string} value - Nuevo valor
     */
    function updatePlacementDimension(placementId, type, value) {
        const placement = placements.find(p => p.id === placementId);
        if (!placement) return;
        
        placement[type] = value;
        placement.dimensions = `SIZE: (W) ${placement.width || '##'}" X (H) ${placement.height || '##'}"`;
        
        console.log(`📐 Dimensión ${type} del placement ${placementId} actualizada: ${value}`);
    }
    
    /**
     * Extrae dimensiones de un texto
     * @param {string} dimensionsText - Texto con dimensiones
     * @returns {Object} Objeto con width y height
     */
    function extractDimensions(dimensionsText) {
        if (!dimensionsText) return { width: '15.34', height: '12' };
        
        const patterns = [
            /SIZE:\s*\(W\)\s*([\d\.]+)\s*["']?\s*X\s*\(H\)\s*([\d\.]+)/i,
            /([\d\.]+)\s*["']?\s*[xX×]\s*([\d\.]+)/,
            /W\s*:\s*([\d\.]+).*H\s*:\s*([\d\.]+)/i,
            /ANCHO\s*:\s*([\d\.]+).*ALTO\s*:\s*([\d\.]+)/i,
            /(\d+)\s*["']?\s*[xX]\s*(\d+)/
        ];
        
        for (const pattern of patterns) {
            const match = dimensionsText.match(pattern);
            if (match) {
                return {
                    width: match[1],
                    height: match[2]
                };
            }
        }
        
        return { width: '15.34', height: '12' };
    }
    
    // ========== GETTERS Y UTILIDADES ==========
    
    /**
     * Obtiene todos los placements
     * @returns {Array} Array de placements
     */
    function getAllPlacements() {
        return placements;
    }
    
    /**
     * Obtiene un placement por ID
     * @param {number} placementId - ID del placement
     * @returns {Object} Placement o null
     */
    function getPlacementById(placementId) {
        return placements.find(p => p.id === placementId) || null;
    }
    
    /**
     * Obtiene el placement actual
     * @returns {Object} Placement actual
     */
    function getCurrentPlacement() {
        return placements.find(p => p.id === currentPlacementId) || placements[0];
    }
    
    /**
     * Obtiene el ID del placement actual
     * @returns {number} ID del placement actual
     */
    function getCurrentPlacementId() {
        return currentPlacementId;
    }
    
    /**
     * Establece el placement actual
     * @param {number} placementId - ID del placement
     */
    function setCurrentPlacementId(placementId) {
        if (placements.some(p => p.id === placementId)) {
            currentPlacementId = placementId;
            console.log(`📍 Placement actual cambiado a: ${placementId}`);
        }
    }
    
    /**
     * Obtiene el icono para un tipo de placement
     * @param {string} type - Tipo de placement
     * @returns {string} Nombre del icono de FontAwesome
     */
    function getPlacementIcon(type) {
        const icons = {
            'FRONT': 'tshirt',
            'BACK': 'tshirt',
            'SLEEVE': 'hat-cowboy',
            'CHEST': 'heart',
            'TV. NUMBERS': 'hashtag',
            'SHOULDER': 'user',
            'COLLAR': 'circle',
            'CUSTOM': 'star'
        };
        
        if (type.includes('CUSTOM:')) {
            return 'star';
        }
        return icons[type] || 'map-marker-alt';
    }
    
    /**
     * Cuenta el total de placements
     * @returns {number} Total de placements
     */
    function getTotalPlacements() {
        return placements.length;
    }
    
    /**
     * Limpia todos los placements (excepto el primero)
     */
    function clearPlacements() {
        if (placements.length > 0) {
            const firstPlacement = placements[0];
            placements = [firstPlacement];
            currentPlacementId = firstPlacement.id;
            console.log('🧹 Placements limpiados (se mantiene el primero)');
        }
    }
    
    // ========== EXPORTACIÓN PÚBLICA ==========
    return {
        // Funciones principales
        initializePlacements,
        addNewPlacement,
        duplicatePlacement,
        removePlacement,
        updatePlacementType,
        updateCustomPlacement,
        updatePlacementInkType,
        updatePlacementParam,
        updatePlacementDimension,
        
        // Getters y utilidades
        getAllPlacements,
        getPlacementById,
        getCurrentPlacement,
        getCurrentPlacementId,
        setCurrentPlacementId,
        getPlacementIcon,
        getTotalPlacements,
        clearPlacements,
        extractDimensions,
        
        // Variables para compatibilidad (exportar con cuidado)
        _getPlacementsArray: () => placements,
        _setPlacementsArray: (newPlacements) => { placements = newPlacements; }
    };
})();

// ========== EXPORTACIÓN GLOBAL ==========
// Exportar al objeto global para compatibilidad
window.PlacementsCore = PlacementsCore;

// Exportar funciones individuales para compatibilidad con código existente
window.initializePlacements = PlacementsCore.initializePlacements;
window.addNewPlacement = PlacementsCore.addNewPlacement;
window.duplicatePlacement = PlacementsCore.duplicatePlacement;
window.removePlacement = PlacementsCore.removePlacement;
window.updatePlacementType = PlacementsCore.updatePlacementType;
window.updateCustomPlacement = PlacementsCore.updateCustomPlacement;
window.updatePlacementInkType = PlacementsCore.updatePlacementInkType;
window.updatePlacementParam = PlacementsCore.updatePlacementParam;
window.updatePlacementDimension = PlacementsCore.updatePlacementDimension;

// Exportar getters
window.getAllPlacements = PlacementsCore.getAllPlacements;
window.getPlacementById = PlacementsCore.getPlacementById;
window.getCurrentPlacementId = PlacementsCore.getCurrentPlacementId;
window.setCurrentPlacementId = PlacementsCore.setCurrentPlacementId;

console.log('✅ Módulo PlacementsCore completamente cargado y exportado');
