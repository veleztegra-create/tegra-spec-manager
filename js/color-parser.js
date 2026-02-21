// Módulo para parsear y normalizar colores
import { appState } from './state.js';

export class ColorParser {
    constructor() {
        this.aliases = this.loadColorAliases();
    }

    loadColorAliases() {
        return {
            // Alias comunes
            'AZUL MARINO': 'NAVY BLUE',
            'AZUL REAL': 'ROYAL BLUE',
            'AZUL CIELO': 'SKY BLUE',
            'AZUL CLARO': 'LIGHT BLUE',
            'AZUL OSCURO': 'DARK BLUE',
            
            'ROJO BRILLANTE': 'BRIGHT RED',
            'ROJO OSCURO': 'DARK RED',
            'ROJO BORGOÑA': 'BURGUNDY',
            
            'VERDE BOSQUE': 'FOREST GREEN',
            'VERDE LIMA': 'LIME GREEN',
            'VERDE OSCURO': 'DARK GREEN',
            
            'GRIS OSCURO': 'DARK GRAY',
            'GRIS CLARO': 'LIGHT GRAY',
            
            'ORO METÁLICO': 'METALLIC GOLD',
            'PLATA METÁLICA': 'METALLIC SILVER',
            'BRONCE METÁLICO': 'METALLIC BRONZE',
            'COBRE METÁLICO': 'METALLIC COPPER',
            
            // Abreviaturas
            'BLK': 'BLACK',
            'WHT': 'WHITE',
            'RED': 'RED',
            'BLU': 'BLUE',
            'GRN': 'GREEN',
            'YEL': 'YELLOW',
            'ORG': 'ORANGE',
            'PUR': 'PURPLE',
            'PNK': 'PINK',
            'BRN': 'BROWN',
            'GRY': 'GRAY',
            'GLD': 'GOLD',
            'SLV': 'SILVER',
            'TEL': 'TEAL',
            'NAV': 'NAVY'
        };
    }

    parse(colorName) {
        if (!colorName || typeof colorName !== 'string') {
            return {
                original: colorName || '',
                normalized: '',
                hex: null,
                type: 'unknown'
            };
        }

        const original = colorName.trim();
        let normalized = original.toUpperCase();
        
        // Reemplazar alias
        for (const [alias, standard] of Object.entries(this.aliases)) {
            if (normalized === alias.toUpperCase() || normalized.includes(alias.toUpperCase())) {
                normalized = normalized.replace(new RegExp(alias.toUpperCase(), 'g'), standard);
            }
        }
        
        // Limpiar espacios extras
        normalized = normalized.replace(/\s+/g, ' ').trim();
        
        // Determinar tipo de color
        let type = 'basic';
        if (this.isMetallic(normalized)) {
            type = 'metallic';
        } else if (this.isPantone(normalized)) {
            type = 'pantone';
        } else if (this.isSpecial(normalized)) {
            type = 'special';
        }
        
        // Obtener código HEX
        const hex = this.getHexCode(normalized);
        
        return {
            original: original,
            normalized: normalized,
            hex: hex,
            type: type,
            displayName: this.getDisplayName(normalized)
        };
    }

    getHexCode(colorName) {
        // Usar el estado de la aplicación para buscar el color
        const hex = appState.getColorHex(colorName);
        if (hex) return hex;
        
        // Si no se encuentra, generar un color basado en el hash
        const hash = this.stringToHash(colorName);
        return `hsl(${hash % 360}, 70%, 60%)`;
    }

    isMetallic(colorName) {
        const metallicKeywords = [
            'METALLIC', 'GOLD', 'SILVER', 'BRONZE', 'COPPER', 'PLATINUM',
            'METÁLICO', 'ORO', 'PLATA', 'BRONCE', 'COBRE'
        ];
        
        return metallicKeywords.some(keyword => 
            colorName.includes(keyword) || 
            colorName.match(/(8[7-9][0-9]\s*C?)/i)
        );
    }

    isPantone(colorName) {
        return colorName.match(/PMS?\s*\d{1,4}\s*[A-Z]?/i) || 
               colorName.match(/PANTONE\s+\d{1,4}/i);
    }

    isSpecial(colorName) {
        const specialKeywords = [
            'NEON', 'FLUORESCENT', 'GLITTER', 'FOIL', 'PEARL',
            'IRIDESCENT', 'GLOW', 'REFLECTIVE'
        ];
        
        return specialKeywords.some(keyword => colorName.includes(keyword));
    }

    getDisplayName(colorName) {
        // Si es un color Pantone, mantener el formato
        if (this.isPantone(colorName)) {
            return colorName;
        }
        
        // Capitalizar palabras
        return colorName.toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    stringToHash(str) {
        if (!str) return 0;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    normalizeGearForSportColor(colorName) {
        if (!colorName) return colorName;
        
        const colors = appState.getColors();
        if (!colors || !colors.gearForSport) return colorName;
        
        const upperColor = colorName.toUpperCase().trim();
        const gearColors = colors.gearForSport;
        
        // Buscar coincidencia exacta
        if (gearColors[upperColor]) {
            return upperColor;
        }
        
        // Buscar por número
        const numberMatch = upperColor.match(/(\d{3,4})/);
        if (numberMatch) {
            const number = numberMatch[1];
            for (const key of Object.keys(gearColors)) {
                if (key.includes(number)) {
                    return key;
                }
            }
        }
        
        return colorName;
    }

    // Método para detectar especialidades en una lista de colores
    detectSpecialties(colors) {
        const specialties = new Set();
        
        colors.forEach(color => {
            const parsed = this.parse(color.val || '');
            
            if (parsed.type === 'metallic') {
                specialties.add('METALLIC');
            }
            
            if (color.val?.toUpperCase().includes('HD') || 
                color.val?.toUpperCase().includes('HIGH DENSITY')) {
                specialties.add('HIGH DENSITY');
            }
            
            if (color.val?.toUpperCase().includes('FOIL')) {
                specialties.add('FOIL');
            }
            
            if (color.val?.toUpperCase().includes('GLITTER') ||
                color.val?.toUpperCase().includes('BRIGHT')) {
                specialties.add('GLITTER');
            }
        });
        
        return Array.from(specialties);
    }
}

// Instancia singleton
export const colorParser = new ColorParser();
