// config.js - Configuración central de la aplicación - VERSIÓN MEJORADA
window.Config = window.Config || {
    APP: {
        VERSION: '1.0.0',
        NAME: 'Tegra Spec Manager'
    },
    
    // Mapa de códigos de equipo
    TEAM_CODE_MAP: {},
    
    // Mapa de códigos de género
    GENDER_MAP: {
        'M': 'Men',
        'W': 'Women',
        'Y': 'Youth',
        'K': 'Kids',
        'U': 'Unisex',
        'B': 'Boys',
        'G': 'Girls'
    },
    
    // Configuración Gear for Sport
    GEARFORSPORT_TEAM_MAP: {},
    GEARFORSPORT_GENDER_MAP: {
        'UM': 'Men',
        'UW': 'Women',
        'UY': 'Youth',
        'U': 'Unisex'
    },
    
    // ========== BASES DE DATOS DE COLORES COMPLETAS ==========
    COLOR_DATABASES: {
        PANTONE: {
            // Pantone básicos que SÍ deben existir para getColorHex
            "PANTONE 185 C": { hex: "#E4002B", name: "Red 032 C" },
            "PANTONE 186 C": { hex: "#C60C30", name: "Red 485 C" },
            "PANTONE 199 C": { hex: "#E40046", name: "Rubine Red C" },
            "PANTONE 287 C": { hex: "#0033A0", name: "Reflex Blue C" },
            "PANTONE 286 C": { hex: "#0033A0", name: "Blue 072 C" },
            "PANTONE 300 C": { hex: "#0066B3", name: "Process Blue C" },
            "PANTONE 301 C": { hex: "#004B87", name: "Blue 0821 C" },
            "PANTONE 347 C": { hex: "#009639", name: "Green C" },
            "PANTONE 355 C": { hex: "#009639", name: "Green 356 C" },
            "PANTONE 382 C": { hex: "#C4D600", name: "Yellow Green C" },
            "PANTONE 1235 C": { hex: "#FFD100", name: "Yellow 012 C" },
            "PANTONE 116 C": { hex: "#FFCD00", name: "Yellow C" },
            "PANTONE 021 C": { hex: "#FE5000", name: "Orange 021 C" },
            "PANTONE 165 C": { hex: "#FF6900", name: "Warm Red C" },
            "PANTONE 200 C": { hex: "#C1172C", name: "Rhodamine Red C" },
            "PANTONE 258 C": { hex: "#C6007E", name: "Purple C" },
            "PANTONE 2597 C": { hex: "#6600CC", name: "Violet C" },
            "PANTONE 2665 C": { hex: "#7442C8", name: "Blue 0721 C" },
            "PANTONE Black C": { hex: "#000000", name: "Black C" },
            "PANTONE White C": { hex: "#FFFFFF", name: "White C" },
            "PANTONE 877 C": { hex: "#8A8D8F", name: "Silver Metallic" },
            "PANTONE 876 C": { hex: "#C99700", name: "Gold Metallic" },
            "PANTONE 873 C": { hex: "#B58500", name: "Gold 873 C" }
        },
        
        GEARFORSPORT: {
            'BLUE': { hex: '#0000FF', name: 'Blue' },
            'RED': { hex: '#FF0000', name: 'Red' },
            'GREEN': { hex: '#008000', name: 'Green' },
            'YELLOW': { hex: '#FFFF00', name: 'Yellow' },
            'BLACK': { hex: '#000000', name: 'Black' },
            'WHITE': { hex: '#FFFFFF', name: 'White' },
            'ORANGE': { hex: '#FFA500', name: 'Orange' },
            'PURPLE': { hex: '#800080', name: 'Purple' },
            'BROWN': { hex: '#A52A2A', name: 'Brown' },
            'GRAY': { hex: '#808080', name: 'Gray' },
            'PINK': { hex: '#FFC0CB', name: 'Pink' },
            'GOLD': { hex: '#FFD700', name: 'Gold' },
            'SILVER': { hex: '#C0C0C0', name: 'Silver' },
            'NAVY': { hex: '#000080', name: 'Navy Blue' },
            'ROYAL BLUE': { hex: '#4169E1', name: 'Royal Blue' },
            'SKY BLUE': { hex: '#87CEEB', name: 'Sky Blue' },
            'LIGHT BLUE': { hex: '#ADD8E6', name: 'Light Blue' },
            'DARK BLUE': { hex: '#00008B', name: 'Dark Blue' },
            'MAROON': { hex: '#800000', name: 'Maroon' },
            'BURGUNDY': { hex: '#800020', name: 'Burgundy' },
            'CRIMSON': { hex: '#DC143C', name: 'Crimson' },
            'SCARLET': { hex: '#FF2400', name: 'Scarlet' },
            'CARDINAL': { hex: '#C41E3A', name: 'Cardinal' },
            'FOREST GREEN': { hex: '#228B22', name: 'Forest Green' },
            'KHAKI': { hex: '#C3B091', name: 'Khaki' },
            'OLIVE': { hex: '#808000', name: 'Olive' },
            'TEAL': { hex: '#008080', name: 'Teal' },
            'TURQUOISE': { hex: '#40E0D0', name: 'Turquoise' },
            'LAVENDER': { hex: '#E6E6FA', name: 'Lavender' },
            'VIOLET': { hex: '#8F00FF', name: 'Violet' },
            'INDIGO': { hex: '#4B0082', name: 'Indigo' },
            'CYAN': { hex: '#00FFFF', name: 'Cyan' },
            'MAGENTA': { hex: '#FF00FF', name: 'Magenta' },
            'CORAL': { hex: '#FF7F50', name: 'Coral' },
            'SALMON': { hex: '#FA8072', name: 'Salmon' }
        },
        
        RAL: {
            "RAL 1000": { hex: "#CDBA88", name: "Green beige" },
            "RAL 1001": { hex: "#D0B084", name: "Beige" },
            "RAL 1002": { hex: "#D2AA6D", name: "Sand yellow" },
            "RAL 1003": { hex: "#F9A800", name: "Signal yellow" },
            "RAL 1004": { hex: "#E49E00", name: "Golden yellow" },
            "RAL 1005": { hex: "#CB8E00", name: "Honey yellow" },
            "RAL 1006": { hex: "#E29000", name: "Maize yellow" },
            "RAL 1007": { hex: "#E88C00", name: "Daffodil yellow" },
            "RAL 1011": { hex: "#AF804F", name: "Brown beige" },
            "RAL 1012": { hex: "#DDAF27", name: "Lemon yellow" },
            "RAL 1013": { hex: "#E3D9C6", name: "Oyster white" },
            "RAL 1014": { hex: "#DDC49A", name: "Ivory" },
            "RAL 1015": { hex: "#E6D2B5", name: "Light ivory" },
            "RAL 1016": { hex: "#F1DD38", name: "Sulfur yellow" },
            "RAL 1017": { hex: "#F6A950", name: "Saffron yellow" },
            "RAL 1018": { hex: "#FACA30", name: "Zinc yellow" },
            "RAL 1019": { hex: "#A48F7A", name: "Grey beige" },
            "RAL 1020": { hex: "#A08F65", name: "Olive yellow" },
            "RAL 1021": { hex: "#F6B600", name: "Rape yellow" },
            "RAL 1023": { hex: "#F7B500", name: "Traffic yellow" },
            "RAL 1024": { hex: "#BA8F4C", name: "Ochre yellow" },
            "RAL 1026": { hex: "#FFFF00", name: "Luminous yellow" },
            "RAL 1027": { hex: "#A77F0E", name: "Curry" },
            "RAL 1028": { hex: "#FF9B00", name: "Melon yellow" },
            "RAL 1032": { hex: "#E2A300", name: "Broom yellow" },
            "RAL 1033": { hex: "#F99A1C", name: "Dahlia yellow" },
            "RAL 1034": { hex: "#EB9C52", name: "Pastel yellow" },
            "RAL 1035": { hex: "#908370", name: "Pearl beige" },
            "RAL 1036": { hex: "#80643F", name: "Pearl gold" },
            "RAL 1037": { hex: "#F09200", name: "Sun yellow" },
            "RAL 2000": { hex: "#DA6E00", name: "Yellow orange" },
            "RAL 2001": { hex: "#BA481B", name: "Red orange" },
            "RAL 2002": { hex: "#BF3922", name: "Vermilion" },
            "RAL 2003": { hex: "#F67828", name: "Pastel orange" },
            "RAL 2004": { hex: "#E25303", name: "Pure orange" },
            "RAL 2005": { hex: "#FF4D06", name: "Luminous orange" },
            "RAL 2007": { hex: "#FFB200", name: "Bright red orange" },
            "RAL 2008": { hex: "#ED6B21", name: "Bright orange" },
            "RAL 2009": { hex: "#DE5307", name: "Traffic orange" },
            "RAL 2010": { hex: "#D05D28", name: "Signal orange" },
            "RAL 2011": { hex: "#E26E0E", name: "Deep orange" },
            "RAL 2012": { hex: "#D5654D", name: "Salmon orange" },
            "RAL 2013": { hex: "#923E25", name: "Pearl orange" },
            "RAL 3000": { hex: "#AB2524", name: "Flame red" },
            "RAL 3001": { hex: "#A02128", name: "Signal red" },
            "RAL 3002": { hex: "#A1232B", name: "Carmine red" },
            "RAL 3003": { hex: "#8D1D2C", name: "Ruby red" },
            "RAL 3004": { hex: "#701F29", name: "Purple red" },
            "RAL 3005": { hex: "#5E2028", name: "Wine red" },
            "RAL 3007": { hex: "#402225", name: "Black red" },
            "RAL 3009": { hex: "#703731", name: "Oxide red" },
            "RAL 3011": { hex: "#7E292C", name: "Brown red" },
            "RAL 3012": { hex: "#CB8D73", name: "Beige red" },
            "RAL 3013": { hex: "#9C322E", name: "Tomato red" },
            "RAL 3014": { hex: "#D47479", name: "Antique pink" },
            "RAL 3015": { hex: "#E1A6AD", name: "Light pink" },
            "RAL 3016": { hex: "#AC4034", name: "Coral red" },
            "RAL 3017": { hex: "#D3545F", name: "Rose" },
            "RAL 3018": { hex: "#D14152", name: "Strawberry red" },
            "RAL 3020": { hex: "#C1121C", name: "Traffic red" },
            "RAL 3022": { hex: "#D56D56", name: "Salmon pink" },
            "RAL 3024": { hex: "#F80000", name: "Luminous red" },
            "RAL 3026": { hex: "#FE0000", name: "Luminous bright red" },
            "RAL 3027": { hex: "#B42041", name: "Raspberry red" },
            "RAL 3028": { hex: "#CB3234", name: "Pure red" },
            "RAL 3031": { hex: "#B32428", name: "Orient red" },
            "RAL 3032": { hex: "#663D3E", name: "Pearl ruby red" },
            "RAL 3033": { hex: "#9A1A2D", name: "Pearl pink" }
        },
        
        CUSTOM: {}
    },
    
    // ========== CÓDIGOS METÁLICOS COMPLETOS ==========
    METALLIC_CODES: [
        "871C", "872C", "873C", "874C", "875C", "876C", "877C",
        "METALLIC", "GOLD", "SILVER", "BRONZE", "METÁLICO", "METALIC",
        "8", "87", // Para coincidencias parciales
        "METALLIC GOLD", "METALLIC SILVER", "GOLD METALLIC", "SILVER METALLIC",
        "CHROME", "PLATINUM", "COPPER", "ROSE GOLD"
    ],
    
    // ========== PRESETS DE TINTA MEJORADOS ==========
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
    
    // Tipos de placement disponibles
    PLACEMENT_TYPES: [
        'FRONT',
        'BACK', 
        'SLEEVE',
        'CHEST',
        'TV. NUMBERS',
        'SHOULDER',
        'COLLAR',
        'CUSTOM'
    ],
    
    // Tipos de tinta
    INK_TYPES: ['WATER', 'PLASTISOL', 'SILICONE'],
    
    // Tipos de muestra
    SAMPLE_TYPES: [
        'PROTO 1',
        'PROTO 2', 
        'PROTO 3',
        'PROTO 4',
        'PPS',
        'TOP OF PRODUCTION',
        'SALESMAN',
        'PHOTO'
    ],
    
    // Temporadas
    SEASONS: [
        'SS24',
        'FW24', 
        'SS25',
        'FW25',
        'SS26',
        'FW26'
    ],
    
    // Diseñadores
    DESIGNERS: [
        'ELMER VELEZ',
        'DANIEL HERNANDEZ', 
        'CINDY PINEDA',
        'FERNANDO FERRERA',
        'NILDA CORDOBA',
        'OTRO'
    ]
};

// ========== FUNCIONES HELPER ==========

// Obtener preset de tinta
Config.getInkPreset = function(inkType) {
    return this.INK_PRESETS[inkType] || this.INK_PRESETS.WATER;
};

// Buscar color en todas las bases de datos
Config.findColor = function(colorName) {
    if (!colorName) return null;
    
    const searchName = colorName.toUpperCase().trim();
    
    // Buscar en todas las bases de datos
    const databases = ['PANTONE', 'GEARFORSPORT', 'RAL', 'CUSTOM'];
    
    for (const dbName of databases) {
        const db = this.COLOR_DATABASES[dbName];
        if (!db) continue;
        
        // 1. Coincidencia exacta
        if (db[searchName]) {
            return {
                hex: db[searchName].hex,
                name: db[searchName].name || searchName,
                database: dbName
            };
        }
        
        // 2. Buscar parcialmente
        for (const [key, data] of Object.entries(db)) {
            const keyUpper = key.toUpperCase();
            if (searchName.includes(keyUpper) || keyUpper.includes(searchName)) {
                return {
                    hex: data.hex,
                    name: data.name || key,
                    database: dbName
                };
            }
        }
        
        // 3. Buscar por código Pantone (ej: "185 C")
        if (dbName === 'PANTONE') {
            const pantoneMatch = searchName.match(/(\d{3,4})\s*C?/i);
            if (pantoneMatch) {
                const pantoneCode = `PANTONE ${pantoneMatch[1]} C`;
                if (db[pantoneCode]) {
                    return {
                        hex: db[pantoneCode].hex,
                        name: db[pantoneCode].name || pantoneCode,
                        database: 'PANTONE'
                    };
                }
            }
        }
    }
    
    // 4. Buscar código hex directo
    const hexMatch = searchName.match(/#([0-9A-F]{6})/i);
    if (hexMatch) {
        return {
            hex: `#${hexMatch[1]}`,
            name: searchName,
            database: 'HEX'
        };
    }
    
    return null;
};

// Detectar si es color metálico
Config.isMetallicColor = function(colorName) {
    if (!colorName) return false;
    
    const upperColor = colorName.toUpperCase();
    
    // Buscar en códigos metálicos
    for (const metallicCode of this.METALLIC_CODES) {
        if (upperColor.includes(metallicCode)) {
            return true;
        }
    }
    
    // Buscar patrones Pantone metálicos (87X C)
    if (upperColor.match(/(8[7-9][0-9]\s*C?)/i)) {
        return true;
    }
    
    return false;
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

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.Config = window.Config;
}
