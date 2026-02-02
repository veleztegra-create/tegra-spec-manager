// js/config/config.js - CONFIGURACIÓN ÚNICA Y COMPLETA
console.log('⚙️ Cargando configuración unificada...');

// ========== CONFIGURACIÓN PRINCIPAL ==========
window.Config = {
    // INFORMACIÓN DE LA APLICACIÓN
    APP: {
        VERSION: '1.5.0',
        NAME: 'Tegra Spec Manager',
        MAX_IMAGE_SIZE_MB: 5,
        MAX_PLACEMENTS: 10,
        MAX_COLORS_PER_PLACEMENT: 12
    },
    
    // ========== BASES DE DATOS DE COLORES ==========
    COLOR_DATABASES: {
        PANTONE: {
            // Rojos
            "185 C": { "hex": "#E40046", "name": "PANTONE 185 C", "type": "Solid" },
            "186 C": { "hex": "#C8102E", "name": "PANTONE 186 C", "type": "Solid" },
            "199 C": { "hex": "#E40046", "name": "PANTONE 199 C", "type": "Solid" },
            "200 C": { "hex": "#C8102E", "name": "PANTONE 200 C", "type": "Solid" },
            
            // Azules
            "286 C": { "hex": "#0033A0", "name": "PANTONE 286 C", "type": "Solid" },
            "287 C": { "hex": "#002D72", "name": "PANTONE 287 C", "type": "Solid" },
            "294 C": { "hex": "#002F5F", "name": "PANTONE 294 C", "type": "Solid" },
            "295 C": { "hex": "#002855", "name": "PANTONE 295 C", "type": "Solid" },
            
            // Verdes
            "347 C": { "hex": "#00A550", "name": "PANTONE 347 C", "type": "Solid" },
            "348 C": { "hex": "#009A44", "name": "PANTONE 348 C", "type": "Solid" },
            "361 C": { "hex": "#00A550", "name": "PANTONE 361 C", "type": "Solid" },
            
            // Amarillos/Naranjas
            "116 C": { "hex": "#FFCD00", "name": "PANTONE 116 C", "type": "Solid" },
            "1235 C": { "hex": "#FFD100", "name": "PANTONE 1235 C", "type": "Solid" },
            "130 C": { "hex": "#FF8200", "name": "PANTONE 130 C", "type": "Solid" },
            "151 C": { "hex": "#FF6A13", "name": "PANTONE 151 C", "type": "Solid" },
            
            // Metálicos
            "871 C": { "hex": "#8D6F3A", "name": "PANTONE 871 C", "type": "Metallic", "metallic": true },
            "872 C": { "hex": "#7D6137", "name": "PANTONE 872 C", "type": "Metallic", "metallic": true },
            "873 C": { "hex": "#6B5434", "name": "PANTONE 873 C", "type": "Metallic", "metallic": true },
            "874 C": { "hex": "#5A4931", "name": "PANTONE 874 C", "type": "Metallic", "metallic": true },
            "875 C": { "hex": "#45322D", "name": "PANTONE 875 C", "type": "Metallic", "metallic": true },
            "876 C": { "hex": "#372D2B", "name": "PANTONE 876 C", "type": "Metallic", "metallic": true },
            "877 C": { "hex": "#8A8D8F", "name": "PANTONE 877 C", "type": "Metallic", "metallic": true }
        },
        
        GEARFORSPORT: {
            // Universidad de Maryland
            "MD_RED": { "hex": "#E03A3E", "name": "Maryland Red", "type": "Institutional" },
            "MD_WHITE": { "hex": "#FFFFFF", "name": "Maryland White", "type": "Institutional" },
            "MD_BLACK": { "hex": "#000000", "name": "Maryland Black", "type": "Institutional" },
            "MD_GOLD": { "hex": "#FFD520", "name": "Maryland Gold", "type": "Institutional" },
            
            // Universidad de Notre Dame
            "ND_BLUE": { "hex": "#0C2340", "name": "Notre Dame Blue", "type": "Institutional" },
            "ND_GOLD": { "hex": "#C99700", "name": "Notre Dame Gold", "type": "Institutional" },
            "ND_METALLIC_GOLD": { "hex": "#D4AF37", "name": "Notre Dame Metallic Gold", "type": "Metallic", "metallic": true },
            
            // Universidad de Wisconsin
            "WIS_RED": { "hex": "#C5050C", "name": "Wisconsin Red", "type": "Institutional" },
            "WIS_WHITE": { "hex": "#FFFFFF", "name": "Wisconsin White", "type": "Institutional" },
            
            // Georgia Tech
            "GT_NAVY": { "hex": "#003366", "name": "Georgia Tech Navy", "type": "Institutional" },
            "GT_GOLD": { "hex": "#B3A369", "name": "Georgia Tech Gold", "type": "Institutional" },
            "GT_WHITE": { "hex": "#FFFFFF", "name": "Georgia Tech White", "type": "Institutional" },
            
            // Colores genéricos
            "GFS_ROYAL": { "hex": "#0051BA", "name": "GFS Royal", "type": "Basic" },
            "GFS_SCARLET": { "hex": "#BB0000", "name": "GFS Scarlet", "type": "Basic" },
            "GFS_FOREST": { "hex": "#154733", "name": "GFS Forest Green", "type": "Basic" },
            "GFS_BLACK": { "hex": "#000000", "name": "GFS Black", "type": "Basic" },
            "GFS_WHITE": { "hex": "#FFFFFF", "name": "GFS White", "type": "Basic" },
            "GFS_GREY": { "hex": "#666666", "name": "GFS Grey", "type": "Basic" }
        },
        
        RAL: {
            "RAL 1003": { "hex": "#F3A505", "name": "RAL 1003 Signal Yellow", "type": "RAL" },
            "RAL 1004": { "hex": "#ED7600", "name": "RAL 1004 Golden Yellow", "type": "RAL" },
            "RAL 2004": { "hex": "#C93C20", "name": "RAL 2004 Pure Orange", "type": "RAL" },
            "RAL 3000": { "hex": "#A52019", "name": "RAL 3000 Flame Red", "type": "RAL" },
            "RAL 3002": { "hex": "#9B2423", "name": "RAL 3002 Carmine Red", "type": "RAL" },
            "RAL 3003": { "hex": "#861A22", "name": "RAL 3003 Ruby Red", "type": "RAL" },
            "RAL 5002": { "hex": "#00387B", "name": "RAL 5002 Ultramarine Blue", "type": "RAL" },
            "RAL 5005": { "hex": "#005387", "name": "RAL 5005 Signal Blue", "type": "RAL" },
            "RAL 5010": { "hex": "#004F7C", "name": "RAL 5010 Gentian Blue", "type": "RAL" },
            "RAL 6002": { "hex": "#227F4D", "name": "RAL 6002 Leaf Green", "type": "RAL" },
            "RAL 6005": { "hex": "#1E5945", "name": "RAL 6005 Moss Green", "type": "RAL" },
            "RAL 7001": { "hex": "#828A8B", "name": "RAL 7001 Silver Grey", "type": "RAL" },
            "RAL 7021": { "hex": "#4C514A", "name": "RAL 7021 Black Grey", "type": "RAL" },
            "RAL 8004": { "hex": "#8D4931", "name": "RAL 8004 Copper Brown", "type": "RAL" },
            "RAL 9005": { "hex": "#0A0A0A", "name": "RAL 9005 Jet Black", "type": "RAL" }
        },
        
        INSTITUCIONAL: {
            "CRIMSON": { "hex": "#9E1B32", "name": "Crimson", "type": "Institutional" },
            "NAVY": { "hex": "#0C2340", "name": "Navy", "type": "Institutional" },
            "ROYAL_BLUE": { "hex": "#0033A0", "name": "Royal Blue", "type": "Institutional" },
            "SCARLET": { "hex": "#BB0000", "name": "Scarlet", "type": "Institutional" },
            "ORANGE": { "hex": "#FF8200", "name": "Orange", "type": "Institutional" },
            "GOLD": { "hex": "#FFD100", "name": "Gold", "type": "Institutional" },
            "METALLIC_GOLD": { "hex": "#D4AF37", "name": "Metallic Gold", "type": "Metallic", "metallic": true },
            "SILVER": { "hex": "#C0C0C0", "name": "Silver", "type": "Metallic", "metallic": true },
            "FOREST_GREEN": { "hex": "#154733", "name": "Forest Green", "type": "Institutional" },
            "KELLY_GREEN": { "hex": "#4CBB17", "name": "Kelly Green", "type": "Institutional" },
            "PURPLE": { "hex": "#4B2E83", "name": "Purple", "type": "Institutional" },
            "MAROON": { "hex": "#800000", "name": "Maroon", "type": "Institutional" }
        },
        
        CUSTOM: {}
    },
    
    // ========== MAPAS DE EQUIPOS ==========
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
    
    // Mapa general de equipos (se combina dinámicamente)
    get TEAM_CODE_MAP() {
        const allTeams = {...this.GEARFORSPORT_TEAM_MAP};
        
        // Añadir equipos de config-teams.js si existe
        if (window.TeamsConfig) {
            ['NCAA', 'NBA', 'NFL'].forEach(league => {
                if (window.TeamsConfig[league] && window.TeamsConfig[league].teams) {
                    Object.assign(allTeams, window.TeamsConfig[league].teams);
                }
            });
        }
        
        return allTeams;
    },
    
    // ========== MAPAS DE GÉNEROS ==========
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
    
    GENDER_MAP: {
        'M': 'Men',
        'W': 'Women', 
        'Y': 'Youth',
        'K': 'Kids',
        'U': 'Unisex',
        'B': 'Boys',
        'G': 'Girls'
    },
    
    // ========== CÓDIGOS METÁLICOS ==========
    METALLIC_CODES: [
        "871C", "872C", "873C", "874C", "875C", "876C", "877C",
        "METALLIC", "GOLD", "SILVER", "BRONZE", "METÁLICO", "METALIC",
        "METALLIC GOLD", "METALLIC SILVER", "GOLD METALLIC", "SILVER METALLIC",
        "CHROME", "PLATINUM", "COPPER", "ROSE GOLD"
    ],
    
    // ========== PRESETS DE TINTA ==========
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
                name: 'PLASTISOL BLOCKER', 
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
                mesh2: '156/64', 
                durometer: '65', 
                speed: '35', 
                angle: '15', 
                strokes: '1', 
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
                name: 'BLOQUEADOR LIBRA', 
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
                name: 'WHITE LIBRA', 
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
                additives: '3 % catalizador · 2 % retardante' 
            }
        }
    },
    
    // ========== CONFIGURACIÓN ADICIONAL ==========
    PLACEMENT_TYPES: ['FRONT', 'BACK', 'SLEEVE', 'CHEST', 'TV. NUMBERS', 'SHOULDER', 'COLLAR', 'CUSTOM'],
    INK_TYPES: ['WATER', 'PLASTISOL', 'SILICONE'],
    
    SAMPLE_TYPES: ['PROTO 1', 'PROTO 2', 'PROTO 3', 'PROTO 4', 'PPS', 'TOP OF PRODUCTION', 'SALESMAN', 'PHOTO'],
    SEASONS: ['SS24', 'FW24', 'SS25', 'FW25', 'SS26', 'FW26'],
    
    DESIGNERS: ['ELMER VELEZ', 'DANIEL HERNANDEZ', 'CINDY PINEDA', 'FERNANDO FERRERA', 'NILDA CORDOBA', 'OTRO']
};

// ========== MÉTODOS DE CONFIG ==========

// Buscar color en todas las bases de datos
Config.findColor = function(colorName) {
    if (!colorName) return null;
    
    const searchName = colorName.toUpperCase().trim();
    const databases = ['PANTONE', 'GEARFORSPORT', 'RAL', 'INSTITUCIONAL', 'CUSTOM'];
    
    for (const dbName of databases) {
        const db = this.COLOR_DATABASES[dbName];
        if (!db) continue;
        
        // Coincidencia exacta
        if (db[searchName]) {
            return {
                ...db[searchName],
                database: dbName,
                originalName: colorName
            };
        }
        
        // Búsqueda parcial
        for (const [key, colorData] of Object.entries(db)) {
            const keyUpper = key.toUpperCase();
            if (searchName.includes(keyUpper) || keyUpper.includes(searchName)) {
                return {
                    ...colorData,
                    database: dbName,
                    originalName: colorName
                };
            }
        }
    }
    
    return null;
};

// Obtener HEX de un color
Config.getHexColor = function(colorName) {
    const color = this.findColor(colorName);
    return color ? color.hex : '#CCCCCC';
};

// Determinar si es color metálico
Config.isMetallicColor = function(colorName) {
    if (!colorName) return false;
    
    const upperColor = colorName.toUpperCase();
    
    // Buscar en códigos metálicos
    for (const metallicCode of this.METALLIC_CODES) {
        if (upperColor.includes(metallicCode)) {
            return true;
        }
    }
    
    // Buscar en la base de datos
    const color = this.findColor(colorName);
    return color ? (color.metallic === true || color.type === 'Metallic') : false;
};

// Obtener equipo desde código
Config.getTeamFromCode = function(code) {
    // Buscar en Gear for Sport primero
    if (this.GEARFORSPORT_TEAM_MAP && this.GEARFORSPORT_TEAM_MAP[code]) {
        return this.GEARFORSPORT_TEAM_MAP[code];
    }
    
    // Buscar en mapa general
    const teamMap = this.TEAM_CODE_MAP;
    if (teamMap && teamMap[code]) {
        return teamMap[code];
    }
    
    return null;
};

// Obtener género desde código
Config.getGenderFromCode = function(code) {
    if (this.GEARFORSPORT_GENDER_MAP && this.GEARFORSPORT_GENDER_MAP[code]) {
        return this.GEARFORSPORT_GENDER_MAP[code];
    }
    
    if (this.GENDER_MAP && this.GENDER_MAP[code]) {
        return this.GENDER_MAP[code];
    }
    
    return null;
};

// Obtener preset de tinta
Config.getInkPreset = function(inkType) {
    return this.INK_PRESETS[inkType] || this.INK_PRESETS.WATER;
};

// Normalizar color Gear for Sport
Config.normalizeGFSColor = function(colorName) {
    if (!colorName) return colorName;
    
    const upperColor = colorName.toUpperCase().trim();
    const gfsDB = this.COLOR_DATABASES.GEARFORSPORT;
    
    // Buscar coincidencia exacta
    if (gfsDB[upperColor]) {
        return upperColor;
    }
    
    // Buscar coincidencia parcial
    for (const [key, data] of Object.entries(gfsDB)) {
        const keyUpper = key.toUpperCase();
        if (upperColor.includes(keyUpper) || keyUpper.includes(upperColor)) {
            return key;
        }
    }
    
    return colorName;
};

// Añadir color personalizado
Config.addCustomColor = function(name, hex, metadata = {}) {
    const key = name.toUpperCase().replace(/\s+/g, '_');
    this.COLOR_DATABASES.CUSTOM[key] = {
        hex: hex,
        name: name,
        type: 'Custom',
        ...metadata
    };
    
    console.log(`✅ Color personalizado añadido: ${name} (${hex})`);
    return true;
};

// Generar leyenda de colores
Config.generateColorLegend = function(colorsArray) {
    if (!Array.isArray(colorsArray)) return [];
    
    return colorsArray.map(color => {
        const colorData = this.findColor(color.val || color.name || '');
        
        return {
            name: color.val || color.name || 'Desconocido',
            hex: colorData ? colorData.hex : '#CCCCCC',
            database: colorData ? colorData.database : 'Custom',
            metallic: this.isMetallicColor(color.val || color.name || ''),
            screenLetter: color.screenLetter || 'A',
            original: color
        };
    });
};

console.log('✅ Configuración unificada cargada:', {
    version: window.Config.APP.VERSION,
    colores: Object.keys(window.Config.COLOR_DATABASES.PANTONE).length + 
             Object.keys(window.Config.COLOR_DATABASES.GEARFORSPORT).length +
             ' colores totales'
});
