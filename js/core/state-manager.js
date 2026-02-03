// js/core/state-manager.js - VERSIÓN A PRUEBA DE REDECLARACIONES
if (!window.StateManager) {
    window.StateManager = (function() {
        console.log('🔄 StateManager cargando...');
        
        let currentSpec = null;
        let placements = [];
        let currentPlacementId = 1;
        
        const StateManager = {
            // Métodos públicos
            getCurrentSpec: function() {
                return currentSpec;
            },
            
            setCurrentSpec: function(spec) {
                currentSpec = spec;
                console.log('📝 Spec actualizada:', spec?.styleNumber);
                return this;
            },
            
            getPlacements: function() {
                return [...placements];
            },
            
            addPlacement: function(placement) {
                if (!placement.id) {
                    placement.id = `placement-${currentPlacementId++}`;
                }
                placements.push(placement);
                console.log('📍 Placement añadido:', placement.id);
                return placement.id;
            },
            
            removePlacement: function(placementId) {
                const index = placements.findIndex(p => p.id === placementId);
                if (index > -1) {
                    placements.splice(index, 1);
                    console.log('🗑️ Placement removido:', placementId);
                    return true;
                }
                return false;
            },
            
            updatePlacement: function(placementId, updates) {
                const index = placements.findIndex(p => p.id === placementId);
                if (index > -1) {
                    placements[index] = { ...placements[index], ...updates };
                    console.log('✏️ Placement actualizado:', placementId);
                    return true;
                }
                return false;
            },
            
            getPlacementById: function(placementId) {
                return placements.find(p => p.id === placementId) || null;
            },
            
            clearPlacements: function() {
                placements = [];
                currentPlacementId = 1;
                console.log('🧹 Placements limpiados');
                return this;
            },
            
            // Persistencia
            saveToLocalStorage: function(key = 'tegra-state') {
                try {
                    const state = {
                        placements: placements,
                        currentPlacementId: currentPlacementId,
                        timestamp: new Date().toISOString()
                    };
                    localStorage.setItem(key, JSON.stringify(state));
                    console.log('💾 Estado guardado en localStorage');
                    return true;
                } catch (error) {
                    console.error('❌ Error al guardar estado:', error);
                    return false;
                }
            },
            
            loadFromLocalStorage: function(key = 'tegra-state') {
                try {
                    const saved = localStorage.getItem(key);
                    if (saved) {
                        const state = JSON.parse(saved);
                        placements = state.placements || [];
                        currentPlacementId = state.currentPlacementId || 1;
                        console.log('📂 Estado cargado desde localStorage');
                        return true;
                    }
                } catch (error) {
                    console.error('❌ Error al cargar estado:', error);
                }
                return false;
            },
            
            // Debug
            getStateInfo: function() {
                return {
                    placementsCount: placements.length,
                    currentPlacementId: currentPlacementId,
                    hasCurrentSpec: !!currentSpec
                };
            }
        };
        
        console.log('✅ StateManager cargado correctamente');
        return StateManager;
        
    })();
}
