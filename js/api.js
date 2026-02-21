// Módulo para manejar peticiones de datos
export class ApiService {
    constructor() {
        this.cache = new Map();
    }

    async loadJSON(filePath) {
        // Verificar cache primero
        if (this.cache.has(filePath)) {
            return this.cache.get(filePath);
        }

        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Error al cargar ${filePath}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.cache.set(filePath, data);
            return data;
        } catch (error) {
            console.error(`Error cargando ${filePath}:`, error);
            throw error;
        }
    }

    async loadAllData() {
        try {
            const [config, inkPresets, colors, teams] = await Promise.all([
                this.loadJSON('data/config.json'),
                this.loadJSON('data/ink-presets.json'),
                this.loadJSON('data/colors.json'),
                this.loadJSON('data/teams.json')
            ]);

            return {
                config,
                inkPresets,
                colors,
                teams
            };
        } catch (error) {
            console.error('Error cargando datos:', error);
            throw error;
        }
    }

    clearCache() {
        this.cache.clear();
    }
}

// Instancia singleton
export const apiService = new ApiService();
