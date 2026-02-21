// Estado global de la aplicación
export class AppState {
    constructor() {
        this.state = {
            // Tema
            theme: localStorage.getItem('tegraspec-theme') || 'dark',
            
            // Datos del formulario principal
            formData: {
                customer: '',
                style: '',
                folder: '',
                colorway: '',
                season: '',
                pattern: '',
                po: '',
                sampleType: '',
                nameTeam: '',
                gender: '',
                designer: ''
            },
            
            // Placements
            placements: [],
            currentPlacementId: null,
            
            // Configuración cargada
            config: null,
            inkPresets: null,
            colors: null,
            teams: null,
            
            // UI state
            activeTab: 'dashboard',
            isLoading: false,
            
            // Cache
            clientLogoCache: {},
            errorLog: []
        };
    }

    // Getters
    getState() {
        return this.state;
    }

    getTheme() {
        return this.state.theme;
    }

    getFormData() {
        return this.state.formData;
    }

    getPlacements() {
        return this.state.placements;
    }

    getCurrentPlacement() {
        return this.state.placements.find(p => p.id === this.state.currentPlacementId);
    }

    getPlacementById(id) {
        return this.state.placements.find(p => p.id === id);
    }

    getConfig() {
        return this.state.config;
    }

    getInkPresets() {
        return this.state.inkPresets;
    }

    getColors() {
        return this.state.colors;
    }

    getTeams() {
        return this.state.teams;
    }

    // Setters
    setTheme(theme) {
        this.state.theme = theme;
        localStorage.setItem('tegraspec-theme', theme);
        this.notify('theme');
    }

    setFormData(data) {
        this.state.formData = { ...this.state.formData, ...data };
        this.notify('formData');
    }

    setPlacements(placements) {
        this.state.placements = placements;
        this.notify('placements');
    }

    addPlacement(placement) {
        this.state.placements.push(placement);
        this.state.currentPlacementId = placement.id;
        this.notify('placements');
    }

    updatePlacement(id, updates) {
        const index = this.state.placements.findIndex(p => p.id === id);
        if (index !== -1) {
            this.state.placements[index] = { ...this.state.placements[index], ...updates };
            this.notify('placements');
        }
    }

    removePlacement(id) {
        this.state.placements = this.state.placements.filter(p => p.id !== id);
        if (this.state.placements.length > 0 && this.state.currentPlacementId === id) {
            this.state.currentPlacementId = this.state.placements[0].id;
        }
        this.notify('placements');
    }

    setCurrentPlacement(id) {
        this.state.currentPlacementId = id;
        this.notify('currentPlacement');
    }

    setConfig(config) {
        this.state.config = config;
        this.notify('config');
    }

    setInkPresets(presets) {
        this.state.inkPresets = presets;
        this.notify('inkPresets');
    }

    setColors(colors) {
        this.state.colors = colors;
        this.notify('colors');
    }

    setTeams(teams) {
        this.state.teams = teams;
        this.notify('teams');
    }

    setActiveTab(tab) {
        this.state.activeTab = tab;
        this.notify('activeTab');
    }

    setIsLoading(loading) {
        this.state.isLoading = loading;
        this.notify('loading');
    }

    addToErrorLog(error) {
        this.state.errorLog.push({
            ...error,
            timestamp: new Date().toISOString()
        });
        this.notify('errorLog');
    }

    clearErrorLog() {
        this.state.errorLog = [];
        this.notify('errorLog');
    }

    // Persistencia
    saveToLocalStorage() {
        const data = {
            formData: this.state.formData,
            placements: this.state.placements,
            theme: this.state.theme
        };
        localStorage.setItem('tegraspec-state', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('tegraspec-state');
            if (saved) {
                const data = JSON.parse(saved);
                this.state.formData = data.formData || this.state.formData;
                this.state.placements = data.placements || this.state.placements;
                this.state.theme = data.theme || this.state.theme;
                
                if (this.state.placements.length > 0) {
                    this.state.currentPlacementId = this.state.placements[0].id;
                }
                
                this.notify('all');
            }
        } catch (error) {
            console.error('Error cargando estado desde localStorage:', error);
        }
    }

    // Observadores
    subscribers = new Map();

    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set());
        }
        this.subscribers.get(key).add(callback);
        
        // Retornar función para desuscribirse
        return () => {
            this.subscribers.get(key)?.delete(callback);
        };
    }

    notify(key) {
        if (this.subscribers.has(key)) {
            this.subscribers.get(key).forEach(callback => {
                callback(this.state[key], key, this.state);
            });
        }
        // También notificar a los suscriptores de 'all'
        if (this.subscribers.has('all')) {
            this.subscribers.get('all').forEach(callback => {
                callback(this.state, key, this.state);
            });
        }
    }

    // Helper methods
    getInkPreset(inkType = 'WATER') {
        if (!this.state.inkPresets || !this.state.inkPresets[inkType]) {
            return this.getDefaultInkPreset();
        }
        return this.state.inkPresets[inkType];
    }

    getDefaultInkPreset() {
        return {
            temp: '320 °F',
            time: '1:40 min',
            blocker: { 
                name: 'BLOCKER CHT', 
                mesh1: '122/55', 
                mesh2: '157/48', 
                durometer: '70', 
                speed: '35', 
                angle: '15', 
                strokes: '2', 
                pressure: '40', 
                additives: 'N/A' 
            },
            white: { 
                name: 'AQUAFLEX WHITE', 
                mesh1: '198/40', 
                mesh2: '157/48', 
                durometer: '70', 
                speed: '35', 
                angle: '15', 
                strokes: '2', 
                pressure: '40', 
                additives: 'N/A' 
            },
            color: { 
                mesh: '157/48', 
                durometer: '70', 
                speed: '35', 
                angle: '15', 
                strokes: '2', 
                pressure: '40', 
                additives: '3 % cross-linker 500 · 1.5 % antitack' 
            }
        };
    }

    getColorHex(colorName) {
        if (!colorName || !this.state.colors) return null;
        
        const name = colorName.toUpperCase().trim();
        
        // Buscar en todas las categorías de colores
        const categories = ['basic', 'metallic', 'pantone'];
        for (const category of categories) {
            if (this.state.colors[category]) {
                for (const [key, hex] of Object.entries(this.state.colors[category])) {
                    if (name === key || name.includes(key) || key.includes(name)) {
                        return hex;
                    }
                }
            }
        }
        
        // Buscar código hex directo
        const hexMatch = name.match(/#([0-9A-F]{6})/i);
        if (hexMatch) {
            return `#${hexMatch[1]}`;
        }
        
        return null;
    }

    findTeamByAbbreviation(abbr) {
        if (!this.state.teams || !abbr) return null;
        
        const upperAbbr = abbr.toUpperCase();
        
        for (const league of Object.values(this.state.teams)) {
            for (const teamData of Object.values(league)) {
                if (teamData.abbreviations?.some(a => a.toUpperCase() === upperAbbr)) {
                    return teamData;
                }
            }
        }
        
        return null;
    }

    // Factory methods para crear objetos
    createPlacement(type = 'FRONT') {
        const preset = this.getDefaultInkPreset();
        
        return {
            id: Date.now() + Math.random(),
            type: type,
            name: type,
            imageData: null,
            colors: [],
            placementDetails: '#.#" FROM COLLAR SEAM',
            dimensions: 'SIZE: (W) ##" X (H) ##"',
            width: '',
            height: '',
            temp: preset.temp,
            time: preset.time,
            specialties: '',
            specialInstructions: '',
            inkType: 'WATER',
            placementSelect: type,
            
            // Parámetros editables
            meshColor: '',
            meshWhite: '',
            meshBlocker: '',
            durometer: '',
            strokes: '',
            angle: '',
            pressure: '',
            speed: '',
            additives: '',
            
            isActive: true
        };
    }

    createColorItem(type = 'COLOR') {
        let screenLetter = '';
        let initialVal = '';
        
        if (type === 'BLOCKER') {
            screenLetter = 'A';
            initialVal = 'BLOCKER CHT';
        } else if (type === 'WHITE_BASE') {
            screenLetter = 'B';
            initialVal = 'AQUAFLEX WHITE';
        } else if (type === 'METALLIC') {
            screenLetter = '1';
            initialVal = 'METALLIC GOLD';
        } else {
            screenLetter = '1';
        }
        
        return {
            id: Date.now() + Math.random(),
            type: type,
            screenLetter: screenLetter,
            val: initialVal
        };
    }
}

// Instancia singleton
export const appState = new AppState();
