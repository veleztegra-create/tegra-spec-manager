// js/modules/placements/core.js
// MÓDULO 1: Lógica central de placements

const PlacementsModule = (function() {
    console.log('📦 Cargando módulo de placements...');
    
    // Variables locales (no contaminan el scope global)
    let placements = [];
    let currentPlacementId = 1;
    
    // ========== FUNCIONES PÚBLICAS ==========
    
    function initializePlacements() {
        console.log('🔄 Inicializando placements...');
        
        // Usar la función global existente si está disponible
        if (typeof window.initializePlacements === 'function') {
            return window.initializePlacements();
        }
        
        // Implementación de respaldo
        const firstPlacementId = addNewPlacement('FRONT', true);
        
        if (placements.length > 0) {
            // Necesitaríamos renderPlacementHTML aquí
            console.log('✅ Placement inicial creado');
        }
        
        return firstPlacementId;
    }
    
    function addNewPlacement(type = null, isFirst = false) {
        console.log(`➕ Agregando placement: ${type || 'nuevo'}`);
        
        // Usar la función global si existe
        if (typeof window.addNewPlacement === 'function') {
            return window.addNewPlacement(type, isFirst);
        }
        
        // Implementación de respaldo
        const placementId = isFirst ? 1 : Date.now();
        const placementType = type || getNextPlacementType();
        
        const newPlacement = {
            id: placementId,
            type: placementType,
            name: `Placement ${placements.length + 1}`,
            imageData: null,
            colors: [],
            placementDetails: '#.#" FROM COLLAR SEAM',
            dimensions: 'SIZE: (W) ##" X (H) ##"',
            temp: '320 °F',
            time: '1:40 min',
            specialties: '',
            specialInstructions: '',
            inkType: 'WATER'
        };
        
        if (!isFirst) {
            placements.push(newPlacement);
        } else {
            placements = [newPlacement];
        }
        
        return placementId;
    }
    
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
    
    // ========== GETTERS ==========
    
    function getPlacements() {
        return placements;
    }
    
    function getCurrentPlacementId() {
        return currentPlacementId;
    }
    
    function getPlacementById(id) {
        return placements.find(p => p.id === id);
    }
    
    // ========== EXPORTAR MÓDULO ==========
    
    return {
        // Funciones públicas
        initializePlacements,
        addNewPlacement,
        
        // Getters
        getPlacements,
        getCurrentPlacementId,
        getPlacementById,
        
        // Para depuración
        _debug: {
            placements,
            currentPlacementId
        }
    };
})();

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.PlacementsModule = PlacementsModule;
    console.log('✅ Módulo de placements cargado');
}
