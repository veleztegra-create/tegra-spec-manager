// config-app.js - Configuración principal de la aplicación
const AppConfig = {
    // INFORMACIÓN DE LA APLICACIÓN
    APP: {
        VERSION: '1.5.0',
        NAME: 'Tegra Spec Manager',
        MAX_IMAGE_SIZE_MB: 5,
        MAX_PLACEMENTS: 10,
        MAX_COLORS_PER_PLACEMENT: 12
    },
    
    // BASES DE DATOS DE COLORES (inicializadas vacías)
    COLOR_DATABASES: {
        PANTONE: {},
        GEARFORSPORT: {},
        INSTITUCIONAL: {}
    },
    
    // MAPA ESPECÍFICO PARA GEAR FOR SPORT
    GEARFORSPORT_TEAM_MAP: {
        "UM9110-PMD0": "Maryland Terrapins",
        "UM9110-N042": "Notre Dame Fighting Irish", 
        "UM9111-PWI0": "Wisconsin Badgers",
        "UY9112-PGT1": "Georgia Tech Yellow Jackets",
        "UM9110": "Generic Team",
        "UM9111": "Generic Team",
        "UY9112": "Generic Team",
        
        // Códigos abreviados
        "MD0": "Maryland",
        "N042": "Notre Dame",
        "PWI0": "Wisconsin",
        "PGT1": "Georgia Tech",
        "MD": "Maryland",
        "ND": "Notre Dame",
        "WIS": "Wisconsin",
        "GT": "Georgia Tech"
    },
    
    // MAPA GENERAL DE EQUIPOS (se genera dinámicamente)
    get TEAM_CODE_MAP() {
        try {
            const allTeams = {};
            
            // Combinar equipos de todas las ligas disponibles
            if (window.TeamsConfig) {
                // NCAA
                if (window.TeamsConfig.NCAA && window.TeamsConfig.NCAA.teams) {
                    Object.entries(window.TeamsConfig.NCAA.teams).forEach(([code, data]) => {
                        allTeams[code] = data.name;
                    });
                }
                
                // NBA
                if (window.TeamsConfig.NBA && window.TeamsConfig.NBA.teams) {
                    Object.entries(window.TeamsConfig.NBA.teams).forEach(([code, data]) => {
                        allTeams[code] = data.name;
                    });
                }
                
                // NFL
                if (window.TeamsConfig.NFL && window.TeamsConfig.NFL.teams) {
                    Object.entries(window.TeamsConfig.NFL.teams).forEach(([code, data]) => {
                        allTeams[code] = data.name;
                    });
                }
            }
            
            // Añadir mapeos específicos de Gear for Sport
            Object.assign(allTeams, this.GEARFORSPORT_TEAM_MAP);
            
            return allTeams;
            
        } catch (error) {
            console.warn('Error al generar TEAM_CODE_MAP:', error);
            return this.GEARFORSPORT_TEAM_MAP; // Fallback al mapa básico
        }
    },
    
    // MAPA DE GÉNEROS PARA GEAR FOR SPORT
    GEARFORSPORT_GENDER_MAP: {
        "UM": "Men",
        "UW": "Women",
        "UY": "Youth",
        "UB": "Boys",
        "UG": "Girls",
        "UK": "Kids",
        "UT": "Toddler",
        "UI": "Infant",
        "UA": "Adult",
        "UN": "Unisex",
        
        // Códigos de una letra
        "M": "Men",
        "W": "Women",
        "Y": "Youth",
        "B": "Boys",
        "G": "Girls",
        "K": "Kids",
        "T": "Toddler",
        "I": "Infant",
        "A": "Adult",
        "N": "Unisex"
    },
    
    // MAPA GENERAL DE GÉNEROS
    GENDER_MAP: {
        'M': 'Men',
        'W': 'Women', 
        'Y': 'Youth',
        'K': 'Kids',
        'U': 'Unisex',
        'B': 'Boys',
        'G': 'Girls'
    },
    
    // CONFIGURACIÓN DE TINTAS
    INK_PRESETS: {
        'WATER': { 
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
        },
        
        'PLASTISOL': { 
            temp: '320 °F', 
            time: '1:00 min',
            blocker: { 
                name: 'BLOCKER plastisol', 
                mesh1: '110/64', 
                mesh2: '156/64', 
                durometer: '65', 
                speed: '35', 
                angle: '15', 
                strokes: '1', 
                pressure: '40', 
                additives: 'N/A' 
            },
            white: { 
                name: 'PLASTISOL WHITE', 
                mesh1: '156/64', 
                mesh2: '110/64', 
                durometer: '65', 
                speed: '35', 
                angle: '15', 
                strokes: '2', 
                pressure: '40', 
                additives: 'N/A' 
            },
            color: { 
                mesh: '156/64', 
                durometer: '65', 
                speed: '35', 
                angle: '15', 
                strokes: '1', 
                pressure: '40', 
                additives: '1 % catalyst' 
            }
        },
        
        'SILICONE': { 
            temp: '320 °F', 
            time: '1:00 min',
            blocker: { 
                name: 'Bloquer Libra', 
                mesh1: '110/64', 
                mesh2: '157/48', 
                durometer: '70', 
                speed: '35', 
                angle: '15', 
                strokes: '2', 
                pressure: '40', 
                additives: 'N/A' 
            },
            white: { 
                name: 'White Libra', 
                mesh1: '122/55', 
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
                additives: '3 % cat · 2 % ret' 
            }
        }
    },
    
    // CÓDIGOS DE COLORES METÁLICOS
    METALLIC_CODES: [
        "871C", "872C", "873C", "874C", "875C", "876C", "877C",
        "METALLIC", "GOLD", "SILVER", "BRONZE", "METÁLICO", "METALIC",
        "METALLIC GOLD", "METALLIC SILVER", "GOLD METALLIC", "SILVER METALLIC"
    ],
    
    // MÉTODOS UTILITARIOS
    getTeamFromCode: function(code) {
        // Primero buscar en el mapa de Gear for Sport
        if (this.GEARFORSPORT_TEAM_MAP && this.GEARFORSPORT_TEAM_MAP[code]) {
            return this.GEARFORSPORT_TEAM_MAP[code];
        }
        
        // Luego buscar en el mapa general
        const teamMap = this.TEAM_CODE_MAP;
        if (teamMap && teamMap[code]) {
            return teamMap[code];
        }
        
        return null;
    },
    
    getGenderFromCode: function(code) {
        if (this.GEARFORSPORT_GENDER_MAP && this.GEARFORSPORT_GENDER_MAP[code]) {
            return this.GEARFORSPORT_GENDER_MAP[code];
        }
        
        if (this.GENDER_MAP && this.GENDER_MAP[code]) {
            return this.GENDER_MAP[code];
        }
        
        return null;
    },
    
    // MÉTODO PARA CARGAR DATOS DE COLORES DINÁMICAMENTE (si es necesario)
    loadColorDatabase: function(databaseName, data) {
        if (this.COLOR_DATABASES[databaseName]) {
            this.COLOR_DATABASES[databaseName] = data;
            return true;
        }
        return false;
    }
};

// Crear instancia global segura
if (typeof window !== 'undefined') {
    // Inicializar Config con valores por defecto si no existe
    window.Config = window.Config || AppConfig;
    
    // Asegurar que COLOR_DATABASES siempre exista
    if (!window.Config.COLOR_DATABASES) {
        window.Config.COLOR_DATABASES = AppConfig.COLOR_DATABASES;
    }
}