// state-manager.js
class StateManager {
    constructor() {
        this.state = {
            placements: [],
            currentPlacementId: 1,
            currentSpec: null,
            settings: {
                theme: 'dark',
                folderNumber: '',
                lastSaved: null
            },
            clientLogoCache: {},
            errors: []
        };
        
        this.subscribers = [];
    }
    
    // Suscribirse a cambios de estado
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    }
    
    // Notificar a todos los suscriptores
    notify() {
        this.subscribers.forEach(callback => {
            try {
                callback(this.state);
            } catch (error) {
                console.error('Error en suscriptor:', error);
            }
        });
    }
    
    // Actualizar estado
    setState(updates) {
        const oldState = {...this.state};
        this.state = {...this.state, ...updates};
        this.notify();
        return { oldState, newState: this.state };
    }
    
    // Getters específicos
    getPlacement(id) {
        return this.state.placements.find(p => p.id === id);
    }
    
    addPlacement(placement) {
        const placements = [...this.state.placements, placement];
        this.setState({ placements });
        return placement;
    }
    
    updatePlacement(id, updates) {
        const placements = this.state.placements.map(p => 
            p.id === id ? {...p, ...updates} : p
        );
        this.setState({ placements });
    }
    
    removePlacement(id) {
        const placements = this.state.placements.filter(p => p.id !== id);
        this.setState({ placements });
    }
    
    // Validación
    validatePlacement(placement) {
        const errors = [];
        
        if (!placement.type) {
            errors.push('Tipo de placement requerido');
        }
        
        if (placement.colors && placement.colors.length === 0) {
            errors.push('Debe agregar al menos un color');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    validateSpec(spec) {
        const errors = [];
        
        if (!spec.customer || spec.customer.trim().length < 2) {
            errors.push('Cliente es requerido (mínimo 2 caracteres)');
        }
        
        if (!spec.style || spec.style.trim().length < 2) {
            errors.push('Estilo es requerido (mínimo 2 caracteres)');
        }
        
        if (!spec.placements || spec.placements.length === 0) {
            errors.push('Debe crear al menos un placement');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    // Persistencia
    saveToLocalStorage(key = 'tegraspec_state') {
        try {
            localStorage.setItem(key, JSON.stringify({
                ...this.state,
                _version: Config.APP.VERSION || '1.0.0',
                _savedAt: new Date().toISOString()
            }));
            return true;
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
            this.addError('saveToLocalStorage', error);
            return false;
        }
    }
    
    loadFromLocalStorage(key = 'tegraspec_state') {
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Validar versión
                if (parsed._version !== Config.APP.VERSION) {
                    console.warn(`Versión diferente: ${parsed._version} vs ${Config.APP.VERSION}`);
                }
                this.state = {...this.state, ...parsed};
                this.notify();
                return true;
            }
        } catch (error) {
            console.error('Error al cargar desde localStorage:', error);
            this.addError('loadFromLocalStorage', error);
        }
        return false;
    }
    
    // Manejo de errores
    addError(context, error, extraData = {}) {
        const errorEntry = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            context,
            error: {
                message: error.message || String(error),
                stack: error.stack,
                name: error.name || 'UnknownError'
            },
            extraData,
            userAgent: navigator.userAgent
        };
        
        const errors = [...this.state.errors, errorEntry];
        if (errors.length > 100) {
            errors.shift(); // Mantener solo los últimos 100 errores
        }
        
        this.setState({ errors });
        
        // También guardar en localStorage para persistencia
        this.saveErrorsToLocalStorage();
        
        return errorEntry;
    }
    
    saveErrorsToLocalStorage() {
        try {
            localStorage.setItem('tegraspec_errors', JSON.stringify({
                errors: this.state.errors.slice(-50), // Solo los últimos 50
                lastUpdated: new Date().toISOString()
            }));
        } catch (error) {
            console.warn('No se pudieron guardar errores:', error);
        }
    }
    
    loadErrorsFromLocalStorage() {
        try {
            const saved = localStorage.getItem('tegraspec_errors');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state.errors = parsed.errors || [];
            }
        } catch (error) {
            console.warn('No se pudieron cargar errores:', error);
        }
    }
    
    getErrors(limit = 20) {
        return this.state.errors.slice(-limit).reverse();
    }
    
    clearErrors() {
        this.setState({ errors: [] });
        localStorage.removeItem('tegraspec_errors');
    }
    
    // Utilidades
    generateId(prefix = '') {
        return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Métodos para búsqueda en bases de datos
    findColorInDatabases(colorName) {
        if (!colorName) return null;
        
        const name = colorName.toUpperCase().trim();
        
        // Buscar en todas las bases de datos
        for (const [dbName, db] of Object.entries(Config.COLOR_DATABASES)) {
            for (const [key, data] of Object.entries(db)) {
                if (name === key.toUpperCase() || 
                    name.includes(key.toUpperCase()) || 
                    key.toUpperCase().includes(name)) {
                    return {
                        database: dbName,
                        key,
                        data,
                        originalName: colorName
                    };
                }
            }
        }
        
        return null;
    }
    
    detectTeamFromText(text) {
        if (!text) return '';
        
        const upperText = text.toUpperCase();
        
        // Buscar en Gear for Sport primero
        for (const [code, name] of Object.entries(Config.GEARFORSPORT_TEAM_MAP)) {
            if (upperText.includes(code)) {
                return name;
            }
        }
        
        // Buscar en el mapa general
        for (const [code, name] of Object.entries(Config.TEAM_CODE_MAP)) {
            if (upperText.includes(code)) {
                return name;
            }
        }
        
        return '';
    }
    
detectGenderFromText(text) {
    if (!text) return '';
    
    const upperText = text.toUpperCase();
    
    // Detectar formato Gear for Sport (UM9002, UW9002, UY9002)
    const gearForSportMatch = upperText.match(/^U([MWYBGKTIAN])\d+/);
    if (gearForSportMatch && gearForSportMatch[1]) {
        const genderCode = `U${gearForSportMatch[1]}`;
        if (Config.GEARFORSPORT_GENDER_MAP && Config.GEARFORSPORT_GENDER_MAP[genderCode]) {
            return Config.GEARFORSPORT_GENDER_MAP[genderCode];
        }
    }
    
    // Buscar códigos de género en el texto
    const parts = upperText.split(/[-_ ]/);
    
    for (const part of parts) {
        if (Config.GENDER_MAP && Config.GENDER_MAP[part]) {
            return Config.GENDER_MAP[part];
        }
    }
    
    // Verificar combinaciones comunes
    if (upperText.includes(' MEN') || upperText.includes('_M') || upperText.endsWith('M')) return 'Men';
    if (upperText.includes(' WOMEN') || upperText.includes('_W') || upperText.endsWith('W')) return 'Women';
    if (upperText.includes(' YOUTH') || upperText.includes('_Y') || upperText.endsWith('Y')) return 'Youth';
    if (upperText.includes(' KIDS') || upperText.includes('_K') || upperText.endsWith('K')) return 'Kids';
    if (upperText.includes(' UNISEX') || upperText.includes('_U') || upperText.endsWith('U')) return 'Unisex';
    
    return '';
}
    
    isMetallicColor(colorName) {
        if (!colorName) return false;
        
        const upperColor = colorName.toUpperCase();
        
        // Detectar códigos Pantone metálicos (871C-877C)
        if (upperColor.match(/(8[7-9][0-9]\s*C?)/i)) {
            return true;
        }
        
        // Detectar palabras clave metálicas
        for (const metallicCode of Config.METALLIC_CODES) {
            if (upperColor.includes(metallicCode)) {
                return true;
            }
        }
        
        return false;
    }
}

// Instancia global
window.stateManager = new StateManager();
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
