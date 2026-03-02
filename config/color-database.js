// =====================================================
// color-database.js - Base de Datos Maestra de Colores
// Versión: 1.0
// Clasifica telas y tintas para decisiones inteligentes
// =====================================================

window.ColorDatabase = (function() {
    "use strict";
    
    // =====================================================
    // 1. TELAS (FABRICS) - Clasificación por color/base
    // =====================================================
    const fabrics = {
        // ===== BLANCOS Y CASI BLANCOS (no requieren blocker) =====
        'WHITE': { 
            type: 'light', 
            base: 'white', 
            needsBlocker: false,
            blockerCount: 0,
            needsWhiteBase: false,
            description: 'Blanco puro'
        },
        'NATURAL': { 
            type: 'light', 
            base: 'off-white', 
            needsBlocker: false,
            blockerCount: 0,
            needsWhiteBase: false,
            description: 'Natural/Beige'
        },
        'CREAM': { 
            type: 'light', 
            base: 'cream', 
            needsBlocker: false,
            blockerCount: 0,
            needsWhiteBase: false 
        },
        'IVORY': { 
            type: 'light', 
            base: 'ivory', 
            needsBlocker: false,
            blockerCount: 0,
            needsWhiteBase: false 
        },
        'HEATHER GREY': { 
            type: 'light', 
            base: 'grey', 
            needsBlocker: false,
            blockerCount: 0,
            needsWhiteBase: false 
        },
        'LIGHT GREY': { 
            type: 'light', 
            base: 'grey', 
            needsBlocker: false,
            blockerCount: 0,
            needsWhiteBase: false 
        },
        'ASH': { 
            type: 'light', 
            base: 'grey', 
            needsBlocker: false,
            blockerCount: 0,
            needsWhiteBase: false 
        },
        
        // ===== COLORES CLAROS (requieren blocker pero menos) =====
        'ITALY BLUE': { 
            type: 'medium-light', 
            base: 'blue', 
            needsBlocker: true,
            blockerCount: 2,
            needsWhiteBase: true,
            description: 'Azul Italia claro'
        },
        'COLUMBIA BLUE': { 
            type: 'medium-light', 
            base: 'blue', 
            needsBlocker: true,
            blockerCount: 2,
            needsWhiteBase: true 
        },
        'LIGHT ROYAL': { 
            type: 'medium-light', 
            base: 'blue', 
            needsBlocker: true,
            blockerCount: 2,
            needsWhiteBase: true 
        },
        'LIGHT RED': { 
            type: 'medium-light', 
            base: 'red', 
            needsBlocker: true,
            blockerCount: 2,
            needsWhiteBase: true 
        },
        'PINK': { 
            type: 'medium-light', 
            base: 'pink', 
            needsBlocker: true,
            blockerCount: 2,
            needsWhiteBase: true 
        },
        'LIGHT PURPLE': { 
            type: 'medium-light', 
            base: 'purple', 
            needsBlocker: true,
            blockerCount: 2,
            needsWhiteBase: true 
        },
        
        // ===== COLORES MEDIOS (bloqueador completo) =====
        'ROYAL': { 
            type: 'medium', 
            base: 'blue', 
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: true,
            description: 'Azul royal'
        },
        'RED': { 
            type: 'medium', 
            base: 'red', 
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: true 
        },
        'KELLY GREEN': { 
            type: 'medium', 
            base: 'green', 
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: true 
        },
        'FOREST GREEN': { 
            type: 'medium-dark', 
            base: 'green', 
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: true 
        },
        'PURPLE': { 
            type: 'medium', 
            base: 'purple', 
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: true 
        },
        'ORANGE': { 
            type: 'medium', 
            base: 'orange', 
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: true 
        },
        'GOLD': { 
            type: 'medium', 
            base: 'gold', 
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: true 
        },
        
        // ===== COLORES OSCUROS (bloqueador completo) =====
        'NAVY': { 
            type: 'dark', 
            base: 'navy', 
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: true,
            description: 'Azul marino'
        },
        'DARK NAVY': { 
            type: 'dark', 
            base: 'navy', 
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: true 
        },
        'BLACK': { 
            type: 'dark', 
            base: 'black', 
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: true 
        },
        'CHARCOAL': { 
            type: 'dark', 
            base: 'grey', 
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: true 
        },
        'BROWN': { 
            type: 'dark', 
            base: 'brown', 
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: true 
        },
        'MAROON': { 
            type: 'dark', 
            base: 'red', 
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: true 
        },
        'BURGUNDY': { 
            type: 'dark', 
            base: 'red', 
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: true 
        },
        'HUNTER GREEN': { 
            type: 'dark', 
            base: 'green', 
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: true 
        },
        
        // ===== CASOS ESPECIALES =====
        'MIDNIGHT NAVY': { 
            type: 'very-dark', 
            base: 'navy', 
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: false,  // ← REGLA ESPECIAL: no necesita base blanca
            specialRules: { noWhiteBase: true },
            description: 'Midnight Navy - NO requiere Poly White en prenda'
        },
        'MIDNIGHT': { 
            type: 'very-dark', 
            base: 'navy', 
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: false,
            specialRules: { noWhiteBase: true } 
        },
        
        // ===== CÓDIGOS GFS =====
        'PND0': { 
            name: 'Notre Dame Navy', 
            type: 'dark', 
            base: 'navy',
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: true 
        },
        'PMD5': { 
            name: 'Maryland Red', 
            type: 'medium', 
            base: 'red',
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: true 
        },
        'PWI0': { 
            name: 'Wisconsin White', 
            type: 'light', 
            base: 'white',
            needsBlocker: false,
            blockerCount: 0,
            needsWhiteBase: false 
        },
        'PND1': { 
            name: 'Notre Dame Navy Alternate', 
            type: 'dark', 
            base: 'navy',
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: true 
        },
        'PGT1': { 
            name: 'Georgia Tech Gold', 
            type: 'medium', 
            base: 'gold',
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: true 
        }
    };
    
    // =====================================================
    // 2. TINTAS (INKS) - Clasificación por comportamiento
    // =====================================================
    const inks = {
        // ===== BLANCOS (nunca necesitan base blanca debajo) =====
        'WHITE': { 
            type: 'opaque', 
            family: 'white', 
            requiresWhiteBase: false,
            mesh: '156/64',
            additives: { plastisol: '', water: '3% CL 500' }
        },
        'POLY WHITE': { 
            type: 'opaque', 
            family: 'white', 
            requiresWhiteBase: false,
            mesh: '156/64',
            additives: { plastisol: '', water: '3% CL 500' }
        },
        'TXT POLY WHITE': { 
            type: 'opaque', 
            family: 'white', 
            requiresWhiteBase: false,
            mesh: '156/64' 
        },
        'AQUAFLEX WHITE': { 
            type: 'opaque', 
            family: 'white', 
            requiresWhiteBase: false,
            mesh: '198/40' 
        },
        
        // ===== COLORES CLAROS (siempre necesitan base blanca) =====
        'YELLOW': { 
            type: 'light', 
            family: 'yellow', 
            requiresWhiteBase: true,
            mesh: '157/48',
            additives: { plastisol: '1% catalyst', water: '3% CL 500 · 5% ecofix XL' }
        },
        'GOLD': { 
            type: 'light', 
            family: 'gold', 
            requiresWhiteBase: true,
            mesh: '157/48' 
        },
        'ORANGE': { 
            type: 'light', 
            family: 'orange', 
            requiresWhiteBase: true,
            mesh: '157/48' 
        },
        'PINK': { 
            type: 'light', 
            family: 'pink', 
            requiresWhiteBase: true,
            mesh: '157/48' 
        },
        'LIME': { 
            type: 'light', 
            family: 'green', 
            requiresWhiteBase: true,
            mesh: '157/48' 
        },
        'NEON YELLOW': { 
            type: 'light', 
            family: 'yellow', 
            requiresWhiteBase: true,
            mesh: '157/48' 
        },
        'NEON PINK': { 
            type: 'light', 
            family: 'pink', 
            requiresWhiteBase: true,
            mesh: '157/48' 
        },
        'SKY BLUE': { 
            type: 'light', 
            family: 'blue', 
            requiresWhiteBase: true,
            mesh: '157/48' 
        },
        
        // ===== COLORES MEDIOS (pueden ir sobre blocker) =====
        'RED': { 
            type: 'medium', 
            family: 'red', 
            requiresWhiteBase: false,
            mesh: '156/64',
            additives: { plastisol: '1% catalyst', water: '3% CL 500 · 5% ecofix XL' }
        },
        'ROYAL': { 
            type: 'medium', 
            family: 'blue', 
            requiresWhiteBase: false,
            mesh: '156/64' 
        },
        'KELLY GREEN': { 
            type: 'medium', 
            family: 'green', 
            requiresWhiteBase: false,
            mesh: '156/64' 
        },
        'PURPLE': { 
            type: 'medium', 
            family: 'purple', 
            requiresWhiteBase: false,
            mesh: '156/64' 
        },
        'TEAL': { 
            type: 'medium', 
            family: 'blue-green', 
            requiresWhiteBase: false,
            mesh: '156/64' 
        },
        'TURQUOISE': { 
            type: 'medium', 
            family: 'blue', 
            requiresWhiteBase: false,
            mesh: '156/64' 
        },
        
        // ===== COLORES OSCUROS (sobre blocker directo) =====
        'BLACK': { 
            type: 'dark', 
            family: 'black', 
            requiresWhiteBase: false,
            mesh: '156/64',
            additives: { plastisol: '1% catalyst', water: '3% CL 500 · 5% ecofix XL' }
        },
        'NAVY': { 
            type: 'dark', 
            family: 'blue', 
            requiresWhiteBase: false,
            mesh: '156/64' 
        },
        'DARK NAVY': { 
            type: 'dark', 
            family: 'blue', 
            requiresWhiteBase: false,
            mesh: '156/64' 
        },
        'MAROON': { 
            type: 'dark', 
            family: 'red', 
            requiresWhiteBase: false,
            mesh: '156/64' 
        },
        'BURGUNDY': { 
            type: 'dark', 
            family: 'red', 
            requiresWhiteBase: false,
            mesh: '156/64' 
        },
        'BROWN': { 
            type: 'dark', 
            family: 'brown', 
            requiresWhiteBase: false,
            mesh: '156/64' 
        },
        'CHARCOAL': { 
            type: 'dark', 
            family: 'grey', 
            requiresWhiteBase: false,
            mesh: '156/64' 
        },
        'FOREST GREEN': { 
            type: 'dark', 
            family: 'green', 
            requiresWhiteBase: false,
            mesh: '156/64' 
        },
        
        // ===== METÁLICOS (requieren manejo especial) =====
        'GOLD METALLIC': { 
            type: 'metallic', 
            family: 'gold', 
            requiresWhiteBase: true,
            mesh: '110/64',
            additives: 'Catalizador especial',
            screens: 2
        },
        'SILVER METALLIC': { 
            type: 'metallic', 
            family: 'silver', 
            requiresWhiteBase: true,
            mesh: '110/64',
            additives: 'Catalizador especial',
            screens: 2
        },
        
        // ===== COLORES ESPECIALES (3 pantallas) =====
        '77C GOLD': { 
            type: 'special', 
            family: 'gold', 
            requiresWhiteBase: true,
            screens: 3,
            meshes: ['157', '198', '110'],
            additives: '3% CL 500 · 5% ecofix XL'
        },
        '78H AMARILLO': { 
            type: 'special', 
            family: 'yellow', 
            requiresWhiteBase: true,
            screens: 3,
            meshes: ['157', '198', '110'],
            additives: '3% CL 500 · 5% ecofix XL'
        },
        '761 UNIVERSITY GOLD': { 
            type: 'special', 
            family: 'gold', 
            requiresWhiteBase: true,
            screens: 3,
            meshes: ['157', '198', '110'],
            additives: '3% CL 500 · 5% ecofix XL'
        },
        '871C METALLIC': { 
            type: 'special', 
            family: 'metallic', 
            requiresWhiteBase: true,
            screens: 2,
            meshes: ['110', '156'],
            additives: 'Catalizador especial'
        },
        '877C SILVER': { 
            type: 'special', 
            family: 'metallic', 
            requiresWhiteBase: true,
            screens: 2,
            meshes: ['110', '156'],
            additives: 'Catalizador especial'
        }
    };
    
    // =====================================================
    // 3. MÉTODOS DE CLASIFICACIÓN
    // =====================================================
    
    /**
     * Clasifica una tela por su nombre/color
     */
    function classifyFabric(fabricName) {
        if (!fabricName) return {
            type: 'unknown',
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: true,
            matchType: 'default'
        };
        
        const upper = fabricName.toUpperCase().trim();
        
        // 1. Buscar coincidencia exacta
        if (fabrics[upper]) {
            return { 
                ...fabrics[upper],
                original: fabricName,
                matchType: 'exact',
                confidence: 100
            };
        }
        
        // 2. Buscar por código GFS (ej: "PND0")
        for (const [code, data] of Object.entries(fabrics)) {
            if (code.length <= 5 && upper.includes(code)) {
                return { 
                    ...data,
                    original: fabricName,
                    matchType: 'code',
                    matchedCode: code,
                    confidence: 90
                };
            }
        }
        
        // 3. Buscar por palabras clave
        if (upper.includes('MIDNIGHT NAVY')) {
            return { 
                type: 'very-dark', 
                base: 'navy', 
                needsBlocker: true, 
                blockerCount: 3,
                needsWhiteBase: false,
                specialRules: { noWhiteBase: true },
                matchType: 'keyword',
                confidence: 85
            };
        }
        
        if (upper.includes('WHITE') || upper.includes('NATURAL') || 
            upper.includes('CREAM') || upper.includes('IVORY')) {
            return { 
                type: 'light', 
                base: 'white', 
                needsBlocker: false, 
                blockerCount: 0,
                needsWhiteBase: false,
                matchType: 'keyword',
                confidence: 70
            };
        }
        
        if (upper.includes('BLACK') || upper.includes('CHARCOAL')) {
            return { 
                type: 'dark', 
                base: 'black', 
                needsBlocker: true, 
                blockerCount: 3,
                needsWhiteBase: true,
                matchType: 'keyword',
                confidence: 70
            };
        }
        
        if (upper.includes('NAVY') || upper.includes('ROYAL')) {
            if (upper.includes('LIGHT')) {
                return { 
                    type: 'medium-light', 
                    base: 'blue', 
                    needsBlocker: true, 
                    blockerCount: 2,
                    needsWhiteBase: true,
                    matchType: 'keyword',
                    confidence: 70
                };
            }
            return { 
                type: 'dark', 
                base: 'blue', 
                needsBlocker: true, 
                blockerCount: 3,
                needsWhiteBase: true,
                matchType: 'keyword',
                confidence: 70
            };
        }
        
        if (upper.includes('RED') || upper.includes('GREEN') || upper.includes('PURPLE')) {
            return { 
                type: 'medium', 
                base: 'color', 
                needsBlocker: true, 
                blockerCount: 3,
                needsWhiteBase: true,
                matchType: 'keyword',
                confidence: 50
            };
        }
        
        // 4. Default conservador
        return {
            type: 'unknown',
            needsBlocker: true,
            blockerCount: 3,
            needsWhiteBase: true,
            matchType: 'default',
            confidence: 10
        };
    }
    
    /**
     * Clasifica una tinta por su nombre
     */
    function classifyInk(inkName) {
        if (!inkName) return {
            type: 'unknown',
            requiresWhiteBase: false,
            matchType: 'default'
        };
        
        const upper = inkName.toUpperCase().trim();
        
        // 1. Coincidencia exacta
        if (inks[upper]) {
            return { 
                ...inks[upper],
                original: inkName,
                matchType: 'exact',
                confidence: 100
            };
        }
        
        // 2. Buscar por patrones de códigos especiales
        if (upper.match(/77C|78H|761|871C|877C/)) {
            const match = upper.match(/(77C|78H|761|871C|877C)/);
            if (match && inks[match[0] + ' GOLD'] || inks[match[0] + ' METALLIC']) {
                const key = match[0] + (match[0].includes('C') ? ' GOLD' : ' METALLIC');
                if (inks[key]) {
                    return { 
                        ...inks[key],
                        original: inkName,
                        matchType: 'pattern',
                        confidence: 90
                    };
                }
            }
        }
        
        // 3. Palabras clave
        if (upper.includes('WHITE')) {
            return { 
                type: 'opaque', 
                family: 'white', 
                requiresWhiteBase: false,
                mesh: '156/64',
                matchType: 'keyword',
                confidence: 80
            };
        }
        
        if (upper.includes('YELLOW') || upper.includes('GOLD') || 
            upper.includes('ORANGE') || upper.includes('PINK') ||
            upper.includes('NEON')) {
            return { 
                type: 'light', 
                family: 'color', 
                requiresWhiteBase: true,
                mesh: '157/48',
                matchType: 'keyword',
                confidence: 75
            };
        }
        
        if (upper.includes('BLACK') || upper.includes('NAVY') || 
            upper.includes('MAROON') || upper.includes('BURGUNDY') ||
            upper.includes('BROWN') || upper.includes('CHARCOAL')) {
            return { 
                type: 'dark', 
                family: 'color', 
                requiresWhiteBase: false,
                mesh: '156/64',
                matchType: 'keyword',
                confidence: 75
            };
        }
        
        if (upper.includes('RED') || upper.includes('BLUE') || 
            upper.includes('GREEN') || upper.includes('PURPLE')) {
            if (upper.includes('LIGHT') || upper.includes('SKY')) {
                return { 
                    type: 'light', 
                    family: 'color', 
                    requiresWhiteBase: true,
                    mesh: '157/48',
                    matchType: 'keyword',
                    confidence: 70
                };
            }
            return { 
                type: 'medium', 
                family: 'color', 
                requiresWhiteBase: false,
                mesh: '156/64',
                matchType: 'keyword',
                confidence: 70
            };
        }
        
        if (upper.includes('METALLIC') || upper.includes('GOLD') || 
            upper.includes('SILVER') || upper.includes('BRONZE')) {
            return { 
                type: 'metallic', 
                family: 'metallic', 
                requiresWhiteBase: true,
                mesh: '110/64',
                matchType: 'keyword',
                confidence: 65
            };
        }
        
        // 4. Default
        return {
            type: 'medium',
            family: 'unknown',
            requiresWhiteBase: false,
            mesh: '156/64',
            matchType: 'default',
            confidence: 10
        };
    }
    
    /**
     * Determina si un color necesita base blanca
     */
    function needsWhiteBase(inkName, context = {}) {
        const ink = classifyInk(inkName);
        
        // Reglas especiales por contexto
        if (context.fabricType === 'very-dark' && ink.type === 'light') {
            return true; // Colores claros en telas muy oscuras siempre necesitan base
        }
        
        return ink.requiresWhiteBase;
    }
    
    /**
     * Obtiene la malla recomendada para una tinta
     */
    function getMeshForInk(inkName, inkType = 'WATER') {
        const ink = classifyInk(inkName);
        
        if (ink.meshes) {
            return ink.meshes; // Para colores especiales con múltiples mallas
        }
        
        if (ink.mesh) {
            return ink.mesh;
        }
        
        // Default por tipo de tinta
        const defaults = {
            'WATER': '157/48',
            'PLASTISOL': '156/64',
            'SILICONE': '157/48'
        };
        
        return defaults[inkType] || '157/48';
    }
    
    /**
     * Obtiene aditivos para una tinta
     */
    function getAdditivesForInk(inkName, inkType = 'WATER') {
        const ink = classifyInk(inkName);
        
        if (ink.additives) {
            if (typeof ink.additives === 'string') {
                return ink.additives;
            }
            if (ink.additives[inkType.toLowerCase()]) {
                return ink.additives[inkType.toLowerCase()];
            }
        }
        
        // Default por tipo de tinta
        const defaults = {
            'WATER': '3% CL 500 · 5% ecofix XL',
            'PLASTISOL': '1% catalyst',
            'SILICONE': '3% cat · 2% ret'
        };
        
        return defaults[inkType] || '';
    }
    
    // =====================================================
    // API Pública
    // =====================================================
    
    return {
        fabrics,
        inks,
        classifyFabric,
        classifyInk,
        needsWhiteBase,
        getMeshForInk,
        getAdditivesForInk
    };
    
})();

console.log('✅ ColorDatabase cargado');
