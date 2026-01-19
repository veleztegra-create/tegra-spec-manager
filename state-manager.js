/**
 * STATE MANAGER - FULL VERSION (CORREGIDA)
 * Mantiene toda la lógica de Gear for Sport, Géneros y Errores
 */
class StateManager {
    constructor() {
        this.state = {
            placements: [],
            currentClient: 'FANATICS',
            teamInfo: null,
            errors: [],
            theme: 'light'
        };
        this.MAX_ERRORS = 100;
        this.init();
    }

    init() {
        this.loadFromLocalStorage();
        this.setupErrorHandling();
    }

    // --- GESTIÓN DE PLACEMENTS (PARTE CORREGIDA) ---
    updatePlacement(id, updates) {
        const placements = this.state.placements.map(p => {
            if (p.id === id) {
                // Si el usuario escribe un nombre personalizado (ej: SHORT)
                // lo guardamos correctamente en name para que persista
                if (updates.customType) {
                    updates.name = updates.customType.toUpperCase();
                }
                return { ...p, ...updates };
            }
            return p;
        });
        this.setState({ placements });
    }

    // --- LÓGICA DE DETECCIÓN DE EQUIPOS ---
    detectTeamFromText(text) {
        if (!text) return null;
        const upperText = text.toUpperCase();
        
        // Buscar en Gear for Sport
        for (const [code, name] of Object.entries(Config.GEARFORSPORT_TEAM_MAP || {})) {
            if (upperText.includes(code)) return { code, name, source: 'GFS' };
        }
        
        // Buscar en Fanatics/General
        for (const [code, name] of Object.entries(Config.TEAM_CODE_MAP || {})) {
            if (upperText.includes(code)) return { code, name, source: 'FAN' };
        }
        return null;
    }

    // --- LÓGICA COMPLETA DE GÉNEROS (TU LÓGICA ORIGINAL) ---
    detectGenderFromText(text) {
        if (!text) return 'N/A';
        const t = text.toUpperCase();
        
        // Lógica específica de códigos GFS
        if (t.includes('UM') || t.includes('MEN')) return 'MENS';
        if (t.includes('UW') || t.includes('WOMEN') || t.includes('LADIES')) return 'WOMENS';
        if (t.includes('UY') || t.includes('YOUTH') || t.includes('KIDS')) return 'YOUTH';
        
        return 'ADULT';
    }

    // --- DETECCIÓN DE METÁLICOS ---
    isMetallicColor(colorName) {
        if (!colorName) return false;
        const name = colorName.toUpperCase();
        const pantoneMatch = name.match(/(\d{3,4})/);
        
        if (pantoneMatch) {
            const num = parseInt(pantoneMatch[1]);
            if (num >= 870 && num <= 899) return true;
        }
        
        const keywords = ['GOLD', 'SILVER', 'METALLIC', 'METÁLICO', 'BRONZE', 'COPPER'];
        return keywords.some(key => name.includes(key));
    }

    // --- PERSISTENCIA Y ERRORES ---
    saveToLocalStorage() {
        try {
            const data = JSON.stringify(this.state);
            localStorage.setItem('tegra_spec_state', data);
        } catch (e) {
            this.logError('LocalStorage Save', e.message);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('tegra_spec_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
            }
        } catch (e) {
            this.logError('LocalStorage Load', e.message);
        }
    }

    logError(type, message, stack = '') {
        const error = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            type,
            message,
            stack,
            userAgent: navigator.userAgent
        };
        
        this.state.errors.unshift(error);
        if (this.state.errors.length > this.MAX_ERRORS) {
            this.state.errors.pop();
        }
        this.saveErrors();
    }

    saveErrors() {
        localStorage.setItem('tegra_errors_log', JSON.stringify(this.state.errors));
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.saveToLocalStorage();
    }
}

// Inicialización global
window.StateManager = new StateManager();
