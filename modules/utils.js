// utils.js - Utilidades robustas con manejo de errores
const Utils = {
    // ========== FUNCIONES BÁSICAS (sin dependencias) ==========
    
    debounce: function(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },
    
    throttle: function(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    formatDate: function(date, format = 'es-ES', includeTime = true) {
        try {
            const d = date instanceof Date ? date : new Date(date);
            
            if (format === 'short') {
                return d.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            }
            
            if (format === 'long') {
                const options = {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                };
                
                if (includeTime) {
                    options.hour = '2-digit';
                    options.minute = '2-digit';
                }
                
                return d.toLocaleDateString('es-ES', options);
            }
            
            return d.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.warn('Error formateando fecha:', error);
            return date || 'Fecha inválida';
        }
    },
    
    generateId: function(prefix = '') {
        return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    capitalize: function(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
    
    truncate: function(text, length = 50) {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    },
    
    stringToHash: function(str) {
        if (!str) return 0;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    },
    
    stringToColor: function(str) {
        const hash = this.stringToHash(str);
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 60%)`;
    },
    
    // ========== FUNCIONES CON DEPENDENCIAS (con verificaciones) ==========
    
  // Reemplazar la función detectTeamFromStyle existente

detectTeamFromStyle: function(style) {
    if (!style) return '';
    
    try {
        const styleStr = style.toString().toUpperCase().trim();
        
        // 1. Primero detectar si es Gear for Sport usando SchoolsConfig
        if (window.SchoolsConfig) {
            const schoolData = window.SchoolsConfig.detectSchoolFromStyle(styleStr);
            if (schoolData) {
                return schoolData.teamName;
            }
        }
        
        // 2. Buscar en Gear for Sport original
        if (window.Config && window.Config.GEARFORSPORT_TEAM_MAP) {
            for (const [code, teamName] of Object.entries(window.Config.GEARFORSPORT_TEAM_MAP)) {
                if (styleStr === code || styleStr.includes(code)) {
                    return teamName;
                }
            }
        }
        
        // 3. Buscar en el mapa general de equipos
        if (window.Config && window.Config.TEAM_CODE_MAP) {
            const teamMap = window.Config.TEAM_CODE_MAP;
            if (typeof teamMap === 'object') {
                for (const [code, teamName] of Object.entries(teamMap)) {
                    if (styleStr.includes(code)) {
                        return teamName;
                    }
                }
            }
        }
        
        // 4. Buscar en TeamsConfig
        if (window.TeamsConfig) {
            const leagues = ['NCAA', 'NBA', 'NFL'];
            
            for (const league of leagues) {
                if (window.TeamsConfig[league] && window.TeamsConfig[league].teams) {
                    for (const [code, teamData] of Object.entries(window.TeamsConfig[league].teams)) {
                        if (styleStr.includes(code)) {
                            return teamData.name;
                        }
                    }
                }
            }
        }
        
    } catch (error) {
        console.warn('Error en detectTeamFromStyle:', error);
    }
    
    return '';
},
    
    extractGenderFromStyle: function(style) {
        if (!style) return '';
        
        try {
            const styleStr = style.toString().toUpperCase().trim();
            
            // Detectar formato Gear for Sport (UM9002, UW9002, etc.)
            const gearForSportMatch = styleStr.match(/U([MWYBGKTIAN])\d+/);
            if (gearForSportMatch && gearForSportMatch[1]) {
                const genderCode = gearForSportMatch[1];
                
                if (window.Config && window.Config.GEARFORSPORT_GENDER_MAP) {
                    const fullCode = `U${genderCode}`;
                    if (window.Config.GEARFORSPORT_GENDER_MAP[fullCode]) {
                        return window.Config.GEARFORSPORT_GENDER_MAP[fullCode];
                    }
                    if (window.Config.GEARFORSPORT_GENDER_MAP[genderCode]) {
                        return window.Config.GEARFORSPORT_GENDER_MAP[genderCode];
                    }
                }
            }
            
            // Buscar en partes del estilo
            const parts = styleStr.split(/[-_ ]/);
            
            if (window.Config && window.Config.GENDER_MAP) {
                for (const part of parts) {
                    if (window.Config.GENDER_MAP[part]) {
                        return window.Config.GENDER_MAP[part];
                    }
                }
            }
            
            // Verificar combinaciones comunes
            if (styleStr.includes(' MEN') || styleStr.includes('_M') || styleStr.endsWith('M')) {
                return 'Men';
            }
            if (styleStr.includes(' WOMEN') || styleStr.includes('_W') || styleStr.endsWith('W')) {
                return 'Women';
            }
            if (styleStr.includes(' YOUTH') || styleStr.includes('_Y') || styleStr.endsWith('Y')) {
                return 'Youth';
            }
            if (styleStr.includes(' KIDS') || styleStr.includes('_K') || styleStr.endsWith('K')) {
                return 'Kids';
            }
            if (styleStr.includes(' UNISEX') || styleStr.includes('_U') || styleStr.endsWith('U')) {
                return 'Unisex';
            }
            
        } catch (error) {
            console.warn('Error en extractGenderFromStyle:', error);
        }
        
        return '';
    },
    
    normalizeGearForSportColor: function(colorName) {
        if (!colorName) return colorName;
        
        try {
            const upperColor = colorName.toUpperCase().trim();
            
            // Verificar si Config y COLOR_DATABASES existen
            if (!window.Config || !window.Config.COLOR_DATABASES || !window.Config.COLOR_DATABASES.GEARFORSPORT) {
                return colorName; // Retornar el nombre original si no hay base de datos
            }
            
            const gearForSportDB = window.Config.COLOR_DATABASES.GEARFORSPORT;
            
            // Buscar coincidencia exacta
            if (gearForSportDB[upperColor]) {
                return upperColor;
            }
            
            // Buscar coincidencia parcial
            for (const [key] of Object.entries(gearForSportDB)) {
                const keyUpper = key.toUpperCase();
                if (keyUpper.includes(upperColor) || upperColor.includes(keyUpper)) {
                    return key;
                }
            }
            
            // Buscar por número
            const numberMatch = upperColor.match(/(\d{3,4})/);
            if (numberMatch) {
                const number = numberMatch[1];
                for (const [key] of Object.entries(gearForSportDB)) {
                    if (key.includes(number)) {
                        return key;
                    }
                }
            }
            
        } catch (error) {
            console.warn('Error en normalizeGearForSportColor:', error);
        }
        
        return colorName;
    },
    
    getColorHex: function(colorName) {
        if (!colorName) return null;

        try {
            // 1) Resolver con capa unificada (config-color.js)
            if (window.ColorConfig && typeof window.ColorConfig.findColorHex === 'function') {
                const resolved = window.ColorConfig.findColorHex(colorName);
                if (resolved) return resolved;
            }

            const name = colorName.toUpperCase().trim();

            // 2) Fallback básico mínimo
            const basicColors = {
                'RED': '#FF0000',
                'GREEN': '#00FF00',
                'BLUE': '#0000FF',
                'BLACK': '#000000',
                'WHITE': '#FFFFFF',
                'YELLOW': '#FFFF00',
                'PURPLE': '#800080',
                'ORANGE': '#FFA500',
                'GRAY': '#808080',
                'GREY': '#808080',
                'GOLD': '#FFD700',
                'SILVER': '#C0C0C0',
                'BROWN': '#A52A2A',
                'PINK': '#FFC0CB',
                'CYAN': '#00FFFF',
                'MAGENTA': '#FF00FF',
                'MAROON': '#800000',
                'OLIVE': '#808000',
                'NAVY': '#000080',
                'TEAL': '#008080',
                'LIME': '#00FF00',
                'AQUA': '#00FFFF',
                'FUCHSIA': '#FF00FF'
            };

            if (basicColors[name]) return basicColors[name];

            for (const [color, hex] of Object.entries(basicColors)) {
                if (name.includes(color) || color.includes(name)) return hex;
            }

        } catch (error) {
            console.warn('Error en getColorHex:', error);
        }

        // 3) Último recurso: color determinístico por hash
        try {
            const hash = this.stringToHash(colorName);
            return `hsl(${hash % 360}, 70%, 60%)`;
        } catch (e) {
            return '#CCCCCC';
        }
    },

    isMetallicColor: function(colorName) {
        if (!colorName) return false;
        
        try {
            const upperColor = colorName.toUpperCase();
            
            // Detectar códigos Pantone metálicos (871C-877C)
            if (upperColor.match(/(8[7-9][0-9]\s*C?)/i)) {
                return true;
            }
            
            // Detectar usando METALLIC_CODES de Config
            if (window.Config && window.Config.METALLIC_CODES) {
                for (const metallicCode of window.Config.METALLIC_CODES) {
                    if (upperColor.includes(metallicCode.toUpperCase())) {
                        return true;
                    }
                }
            } else {
                // Fallback a lista hardcodeada
                const defaultMetallicCodes = [
                    "871C", "872C", "873C", "874C", "875C", "876C", "877C",
                    "METALLIC", "GOLD", "SILVER", "BRONZE", "METÁLICO", "METALIC"
                ];
                
                for (const metallicCode of defaultMetallicCodes) {
                    if (upperColor.includes(metallicCode)) {
                        return true;
                    }
                }
            }
            
        } catch (error) {
            console.warn('Error en isMetallicColor:', error);
        }
        
        return false;
    },
    
    isHighDensityColor: function(colorName) {
        if (!colorName) return false;
        try {
            const upperColor = colorName.toUpperCase();
            return upperColor.includes('HD') || upperColor.includes('HIGH DENSITY');
        } catch (error) {
            return false;
        }
    },
    
    isFoilColor: function(colorName) {
        if (!colorName) return false;
        try {
            return colorName.toUpperCase().includes('FOIL');
        } catch (error) {
            return false;
        }
    },
    
    getClientLogo: function(customerName) {
        if (!customerName) return null;
        
        try {
            const upperCustomer = customerName.toUpperCase();
            
            const logoMap = {
                'NIKE': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Nike-Logotipo-PNG-Photo.png',
                'FANATICS': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Fanatics_company_logo.svg.png',
                'ADIDAS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1280px-Adidas_Logo.svg.png',
                'PUMA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Puma_Logo.svg/1280px-Puma_Logo.svg.png',
                'UNDER ARMOUR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Under_armour_logo.svg/1280px-Under_armour_logo.svg.png',
                'UA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Under_armour_logo.svg/1280px-Under_armour_logo.svg.png',
                'GEAR FOR SPORT': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png',
                'GEARFORSPORT': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png',
                'GFS': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png',
                'G.F.S.': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png',
                'GEAR': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png'
            };
            
            for (const [key, logoUrl] of Object.entries(logoMap)) {
                if (upperCustomer.includes(key)) {
                    return logoUrl;
                }
            }
            
        } catch (error) {
            console.warn('Error en getClientLogo:', error);
        }
        
        return null;
    },
    
    getInkPreset: function(inkType = 'WATER') {
        try {
            // Primero intentar desde Config
            if (window.Config && window.Config.INK_PRESETS && window.Config.INK_PRESETS[inkType]) {
                return window.Config.INK_PRESETS[inkType];
            }
        } catch (error) {
            console.warn('Error al obtener ink preset de Config:', error);
        }
        
        // Valores por defecto si Config no está cargado o hay error
        const defaults = {
            'WATER': { 
                temp: '320 °F', 
                time: '1:40 min',
                blocker: { name: 'BLOCKER CHT', mesh1: '122/55', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
                white: { name: 'AQUAFLEX V2 WHITE', mesh1: '198/40', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
                color: { mesh: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: '3 % cross-linker 500 · 1.5 % antitack' }
            },
            'PLASTISOL': { 
                temp: '320 °F', 
                time: '1:00 min',
                blocker: { name: 'BARRIER BASE', mesh1: '110/64', mesh2: '156/64', durometer: '65', speed: '35', angle: '15', strokes: '1', pressure: '40', additives: 'N/A' },
                white: { name: 'TXT POLY WHITE', mesh1: '156/64', mesh2: '110/64', durometer: '65', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
                color: { mesh: '156/64', durometer: '65', speed: '35', angle: '15', strokes: '1', pressure: '40', additives: '1 % catalyst' }
            },
            'SILICONE': { 
                temp: '320 °F', 
                time: '1:40 min',
                blocker: { name: 'BLOCKER LIBRA', mesh1: '110/64', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
                white: { name: 'BASE WHITE LIBRA', mesh1: '122/55', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
                color: { mesh: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: '3 % cat · 2 % ret' }
            }
        };
        
        return defaults[inkType] || defaults.WATER;
    },
    
    hexToRgb: function(hex) {
        if (!hex) return [0, 0, 0];
        
        try {
            hex = hex.replace('#', '');
            
            // Expandir formato corto (3 dígitos) a largo (6 dígitos)
            if (hex.length === 3) {
                hex = hex.split('').map(char => char + char).join('');
            }
            
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            
            return [r, g, b];
        } catch (error) {
            console.warn('Error en hexToRgb:', error);
            return [0, 0, 0];
        }
    },
    
    // Función para crear placement por defecto
    createDefaultPlacement: function(type = 'FRONT') {
        const inkPreset = this.getInkPreset('WATER');
        
        return {
            id: this.generateId('placement_'),
            type: type,
            name: type,
            imageData: null,
            colors: [],
            placementDetails: '#.#" FROM COLLAR SEAM',
            dimensions: 'SIZE: (W) ##" X (H) ##"',
            temp: inkPreset.temp,
            time: inkPreset.time,
            specialties: '',
            specialInstructions: '',
            inkType: 'WATER',
            placementSelect: type,
            isActive: true,
            meshColor: inkPreset.color.mesh,
            meshWhite: inkPreset.white.mesh1,
            meshBlocker: inkPreset.blocker.mesh1,
            durometer: inkPreset.color.durometer,
            strokes: inkPreset.color.strokes,
            angle: inkPreset.color.angle,
            pressure: inkPreset.color.pressure,
            speed: inkPreset.color.speed,
            additives: inkPreset.color.additives
        };
    }
};

// Hacer disponible globalmente con verificación
if (typeof window !== 'undefined') {
    // Si Utils ya existe, mantener funciones existentes y añadir las nuevas
    if (!window.Utils) {
        window.Utils = Utils;
    } else {
        // Combinar con Utils existente
        Object.assign(window.Utils, Utils);
    }
}
