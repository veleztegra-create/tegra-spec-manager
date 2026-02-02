// js/config/color-databases.js - BASE DE DATOS COMPLETA DE COLORES
console.log('🎨 Cargando base de datos completa de colores...');

window.ColorDatabases = {
    // ========== PANTONE ==========
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
        
        // Metálicos (CRÍTICOS para especialidades)
        "871 C": { "hex": "#8D6F3A", "name": "PANTONE 871 C", "type": "Metallic", "metallic": true },
        "872 C": { "hex": "#7D6137", "name": "PANTONE 872 C", "type": "Metallic", "metallic": true },
        "873 C": { "hex": "#6B5434", "name": "PANTONE 873 C", "type": "Metallic", "metallic": true },
        "874 C": { "hex": "#5A4931", "name": "PANTONE 874 C", "type": "Metallic", "metallic": true },
        "875 C": { "hex": "#45322D", "name": "PANTONE 875 C", "type": "Metallic", "metallic": true },
        "876 C": { "hex": "#372D2B", "name": "PANTONE 876 C", "type": "Metallic", "metallic": true },
        "877 C": { "hex": "#8A8D8F", "name": "PANTONE 877 C", "type": "Metallic", "metallic": true }
    },
    
    // ========== GEAR FOR SPORT ==========
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
        
        // Colores genéricos Gear for Sport
        "GFS_ROYAL": { "hex": "#0051BA", "name": "GFS Royal", "type": "Basic" },
        "GFS_SCARLET": { "hex": "#BB0000", "name": "GFS Scarlet", "type": "Basic" },
        "GFS_FOREST": { "hex": "#154733", "name": "GFS Forest Green", "type": "Basic" },
        "GFS_BLACK": { "hex": "#000000", "name": "GFS Black", "type": "Basic" },
        "GFS_WHITE": { "hex": "#FFFFFF", "name": "GFS White", "type": "Basic" },
        "GFS_GREY": { "hex": "#666666", "name": "GFS Grey", "type": "Basic" }
    },
    
    // ========== RAL ==========
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
    
    // ========== COLORES INSTITUCIONALES ==========
    INSTITUCIONAL: {
        // Ya tienes muchos en config-teams.js, aquí agregamos algunos genéricos
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
    
    // ========== COLORES PERSONALIZADOS ==========
    CUSTOM: {},
    
    // ========== MÉTODOS UTILITARIOS ==========
    
    /**
     * Busca un color en todas las bases de datos
     */
    findColor: function(colorName) {
        if (!colorName) return null;
        
        const searchName = colorName.toUpperCase().trim();
        
        // Buscar en todas las bases de datos
        const databases = ['PANTONE', 'GEARFORSPORT', 'RAL', 'INSTITUCIONAL', 'CUSTOM'];
        
        for (const dbName of databases) {
            const db = this[dbName];
            if (db && db[searchName]) {
                return {
                    ...db[searchName],
                    database: dbName,
                    originalName: colorName
                };
            }
        }
        
        // Búsqueda parcial
        for (const dbName of databases) {
            const db = this[dbName];
            if (db) {
                for (const [key, colorData] of Object.entries(db)) {
                    if (key.includes(searchName) || searchName.includes(key)) {
                        return {
                            ...colorData,
                            database: dbName,
                            originalName: colorName
                        };
                    }
                }
            }
        }
        
        return null;
    },
    
    /**
     * Determina si un color es metálico
     */
    isMetallic: function(colorName) {
        const color = this.findColor(colorName);
        return color ? (color.metallic === true || color.type === 'Metallic') : false;
    },
    
    /**
     * Obtiene el código HEX de un color
     */
    getHexColor: function(colorName) {
        const color = this.findColor(colorName);
        return color ? color.hex : '#CCCCCC'; // Gris por defecto
    },
    
    /**
     * Genera la leyenda de colores para un placement
     */
    generateColorLegend: function(colorsArray) {
        if (!Array.isArray(colorsArray)) return [];
        
        return colorsArray.map(color => {
            const colorData = this.findColor(color.val || color.name || '');
            
            return {
                name: color.val || color.name || 'Desconocido',
                hex: colorData ? colorData.hex : '#CCCCCC',
                database: colorData ? colorData.database : 'Custom',
                metallic: this.isMetallic(color.val || color.name || ''),
                screenLetter: color.screenLetter || 'A',
                original: color
            };
        });
    },
    
    /**
     * Añade un color personalizado
     */
    addCustomColor: function(name, hex, metadata = {}) {
        const key = name.toUpperCase().replace(/\s+/g, '_');
        this.CUSTOM[key] = {
            hex: hex,
            name: name,
            type: 'Custom',
            ...metadata
        };
        
        console.log(`✅ Color personalizado añadido: ${name} (${hex})`);
        return true;
    }
};

console.log('✅ Base de datos de colores cargada:', {
    pantone: Object.keys(window.ColorDatabases.PANTONE).length,
    gearforsport: Object.keys(window.ColorDatabases.GEARFORSPORT).length,
    ral: Object.keys(window.ColorDatabases.RAL).length,
    institucional: Object.keys(window.ColorDatabases.INSTITUCIONAL).length
});
