// =====================================================
// rules-engine.js - Motor de reglas TEGRA
// Versión: 3.0 - Con letras fijas para bases
// =====================================================

window.RulesEngine = (function() {
    "use strict";
    
    // =====================================================
    // CONFIGURACIÓN DE COLORES ESPECIALES
    // =====================================================
    const SPECIAL_COLORS = {
        '77c gold': {
            identificadores: ['77c', '77c gold', 'gold 77c'],
            mallas: ['157', '198', '110'],
            aditivos: '3% CL 500 · 5% ecofix XL'
        },
        '78h amarillo': {
            identificadores: ['78h', '78h amarillo', 'amarillo 78h'],
            mallas: ['157', '198', '110'],
            aditivos: '3% CL 500 · 5% ecofix XL'
        },
        '761 university gold': {
            identificadores: ['761', '761 gold', 'university gold'],
            mallas: ['157', '198', '110'],
            aditivos: '3% CL 500 · 5% ecofix XL'
        },
        '871c metallic': {
            identificadores: ['871c', '871', 'metallic 871'],
            mallas: ['110', '156'],
            aditivos: 'Catalizador especial'
        },
        '877c silver': {
            identificadores: ['877c', '877', 'silver'],
            mallas: ['110', '156'],
            aditivos: 'Catalizador especial'
        }
    };

    // =====================================================
    // REGLAS DE TELA (FABRIC)
    // =====================================================
    const FABRIC_RULES = {
        darkIdentifiers: [
            'negro', 'black', 'navy', 'azul marino', 'charcoal', 'carbon', 
            'maroon', 'granate', 'dark', 'oscuro', 'forest', 'verde oscuro', 
            'hunter', 'midnight', 'midnight navy', 'italy blue', 'royal'
        ],
        lightIdentifiers: [
            'blanco', 'white', 'natural', 'crema', 'ivory', 'beige', 
            'claro', 'light', 'gris claro', 'light gray', 'heather grey'
        ]
    };

    // =====================================================
    // CONFIGURACIÓN DE BASES POR TIPO DE TINTA
    // =====================================================
    const BASE_CONFIG = {
        'PLASTISOL': {
            'GFS': {
                blocker: { nombre: 'BARRIER BASE', malla: '110/64' },
                whiteBase: { nombre: 'TXT POLY WHITE', malla: '156/64' },
                temperatura: '320 °F',
                tiempo: '1:00 min'
            },
            'FANATICS': {
                blocker: { nombre: 'BARRIER CHT', malla: '110/64' },
                whiteBase: { nombre: 'POLY WHITE', malla: '156/64' },
                temperatura: '320 °F',
                tiempo: '1:00 min'
            },
            'DEFAULT': {
                blocker: { nombre: 'BARRIER BASE', malla: '110/64' },
                whiteBase: { nombre: 'TXT POLY WHITE', malla: '156/64' },
                temperatura: '320 °F',
                tiempo: '1:00 min'
            }
        },
        'WATER': {
            'DEFAULT': {
                blocker: { nombre: 'BLOCKER CHT', malla: '122/55' },
                whiteBase: { nombre: 'AQUAFLEX V2 WHITE', malla: '198/40' },
                temperatura: '320 °F',
                tiempo: '1:40 min'
            }
        },
        'SILICONE': {
            'DEFAULT': {
                blocker: { nombre: 'BLOCKER LIBRA', malla: '110/64' },
                whiteBase: { nombre: 'BASE WHITE LIBRA', malla: '122/55' },
                temperatura: '320 °F',
                tiempo: '1:40 min'
            }
        }
    };

    // =====================================================
    // FUNCIONES AUXILIARES
    // =====================================================
    
    function mapInkType(value) {
        const normalized = String(value || '').toUpperCase().trim();
        if (normalized === 'WATERBASE') return 'WATER';
        return normalized;
    }

    function detectCustomerVariant(customer) {
        if (!customer) return 'DEFAULT';
        const upper = customer.toUpperCase();
        if (upper.includes('GFS') || upper.includes('GEAR FOR SPORT')) return 'GFS';
        if (upper.includes('FANATICS')) return 'FANATICS';
        return 'DEFAULT';
    }

    function getBaseConfig(inkType, customer) {
        const normalizedInk = mapInkType(inkType);
        const variant = detectCustomerVariant(customer);
        
        if (BASE_CONFIG[normalizedInk] && BASE_CONFIG[normalizedInk][variant]) {
            return BASE_CONFIG[normalizedInk][variant];
        }
        if (BASE_CONFIG[normalizedInk] && BASE_CONFIG[normalizedInk]['DEFAULT']) {
            return BASE_CONFIG[normalizedInk]['DEFAULT'];
        }
        // Fallback a WATER
        return BASE_CONFIG['WATER']['DEFAULT'];
    }

    function clasificarTela(colorTela) {
        if (!colorTela) return 'clara';
        const telaLower = colorTela.toLowerCase();
        if (FABRIC_RULES.darkIdentifiers.some(o => telaLower.includes(o))) return 'oscura';
        if (FABRIC_RULES.lightIdentifiers.some(c => telaLower.includes(c))) return 'clara';
        return 'clara';
    }

    function esColorEspecial(colorName) {
        if (!colorName) return null;
        const normalized = (colorName || '').toLowerCase().trim();
        for (const key in SPECIAL_COLORS) {
            const entry = SPECIAL_COLORS[key];
            if (entry.identificadores.some(id => normalized.includes(id))) {
                return entry;
            }
        }
        return null;
    }

    // =====================================================
    // FUNCIÓN PRINCIPAL - GENERAR SECUENCIA
    // =====================================================
    
    function generarSecuencia(params) {
        const {
            customer = '',
            garmentColor = '',
            inkType = 'WATER',
            designColors = []
        } = params;

        console.log(`⚙️ RulesEngine: Generando secuencia`);
        console.log(`   Cliente: ${customer || 'N/A'}`);
        console.log(`   Tela: ${garmentColor}`);
        console.log(`   Tinta: ${inkType}`);

        // ===== OBTENER CONFIGURACIÓN DE BASES =====
        const baseConfig = getBaseConfig(inkType, customer);
        console.log(`   📋 Configuración: ${baseConfig.blocker.nombre} / ${baseConfig.whiteBase.nombre}`);

        // ===== CLASIFICACIÓN DE TELA =====
        const telaType = clasificarTela(garmentColor);
        const needsBlocker = telaType === 'oscura';
        
        console.log(`   📊 Tela clasificada como: ${telaType}`);

        // ===== CLASIFICACIÓN DE COLORES =====
        const colors = {
            white: [],      // Tintas blancas
            light: [],      // Colores claros
            special: [],    // Colores especiales (3 pantallas)
            metallic: [],   // Metálicos
            other: []       // Otros colores
        };
        
        designColors.forEach(color => {
            const colorVal = String(color.val || '').toUpperCase().trim();
            if (!colorVal) return;
            
            const especial = esColorEspecial(colorVal);
            if (especial) {
                colors.special.push({ ...color, info: especial });
            } else if (colorVal.includes('WHITE')) {
                colors.white.push(color);
            } else if (colorVal.includes('YELLOW') || colorVal.includes('GOLD') || 
                       colorVal.includes('ORANGE') || colorVal.includes('PINK')) {
                colors.light.push(color);
            } else {
                colors.other.push(color);
            }
        });

        console.log(`   🎨 Blancos: ${colors.white.length}`);
        console.log(`   🎨 Claros: ${colors.light.length}`);
        console.log(`   🎨 Especiales: ${colors.special.length}`);
        
        // ===== CONSTRUCCIÓN DE SECUENCIA =====
        const steps = [];
        let nextLetter = 67; // 'C' para siguientes procesos después de A y B
        let nextNumber = 1;  // 1, 2, 3... para colores
        
        // ===== PASO 1: BLOQUEADORES (SIEMPRE LETRA A) =====
        if (needsBlocker) {
            // Primer bloqueador (A)
            steps.push({
                tipo: 'BLOCKER',
                screenLetter: 'A',
                nombre: baseConfig.blocker.nombre,
                mesh: baseConfig.blocker.malla,
                additives: 'N/A'
            });
            
            // Segundo y tercer bloqueador según tipo de tinta
            if (inkType === 'WATER') {
                steps.push({
                    tipo: 'BLOCKER',
                    screenLetter: String.fromCharCode(nextLetter++), // C
                    nombre: baseConfig.blocker.nombre,
                    mesh: '157/48',
                    additives: 'N/A'
                });
            } else if (inkType === 'PLASTISOL') {
                steps.push({
                    tipo: 'BLOCKER',
                    screenLetter: String.fromCharCode(nextLetter++), // C
                    nombre: baseConfig.blocker.nombre,
                    mesh: '156/64',
                    additives: 'N/A'
                });
                steps.push({
                    tipo: 'BLOCKER',
                    screenLetter: String.fromCharCode(nextLetter++), // D
                    nombre: baseConfig.blocker.nombre,
                    mesh: '156/64',
                    additives: 'N/A'
                });
            } else if (inkType === 'SILICONE') {
                // Silicone solo tiene un bloqueador
            }
        }
        
        // ===== PASO 2: WHITE BASE DE PRENDA (SIEMPRE LETRA B) =====
        // ¿Necesita base blanca la prenda?
        const hasLightOrSpecial = colors.light.length > 0 || colors.special.length > 0;
        const hasWhite = colors.white.length > 0;
        
        if (telaType === 'oscura' && (hasLightOrSpecial || hasWhite)) {
            steps.push({
                tipo: 'WHITE_BASE',
                screenLetter: 'B',
                nombre: baseConfig.whiteBase.nombre,
                mesh: baseConfig.whiteBase.malla,
                additives: inkType === 'WATER' ? '3% CL 500' : ''
            });
        }
        
        // ===== PASO 3: PROCESAR COLORES =====
        
        // 3.1 Blancos (necesitan su propia base)
        colors.white.forEach(ink => {
            // Base blanca para este blanco
            steps.push({
                tipo: 'WHITE_BASE',
                screenLetter: String.fromCharCode(nextLetter++),
                nombre: baseConfig.whiteBase.nombre,
                mesh: inkType === 'PLASTISOL' ? '110/64' : baseConfig.whiteBase.malla,
                additives: inkType === 'WATER' ? '3% CL 500' : ''
            });
            
            // El color blanco
            steps.push({
                tipo: 'COLOR',
                screenLetter: String(nextNumber++),
                nombre: ink.val,
                mesh: inkType === 'PLASTISOL' ? '156/64' : '157/48',
                additives: inkType === 'WATER' ? '3% CL 500 · 5% ecofix XL' : 
                           (inkType === 'PLASTISOL' ? '1% catalyst' : '')
            });
        });
        
        // 3.2 Claros (necesitan base blanca)
        colors.light.forEach(ink => {
            steps.push({
                tipo: 'WHITE_BASE',
                screenLetter: String.fromCharCode(nextLetter++),
                nombre: baseConfig.whiteBase.nombre,
                mesh: inkType === 'PLASTISOL' ? '110/64' : '122/??',
                additives: inkType === 'WATER' ? '3% CL 500' : ''
            });
            
            steps.push({
                tipo: 'COLOR',
                screenLetter: String(nextNumber++),
                nombre: ink.val,
                mesh: '157/48',
                additives: inkType === 'WATER' ? '3% CL 500 · 5% ecofix XL' : 
                           (inkType === 'PLASTISOL' ? '1% catalyst' : '3% cat · 2% ret')
            });
        });
        
        // 3.3 Especiales (3 pantallas)
        colors.special.forEach(special => {
            const colorNumber = nextNumber++;
            const info = special.info;
            
            info.mallas.forEach((mesh, idx) => {
                steps.push({
                    tipo: 'COLOR',
                    screenLetter: idx === 0 ? String(colorNumber) : `${colorNumber}-${idx + 1}`,
                    nombre: special.val + (idx > 0 ? ` (${idx + 1})` : ''),
                    mesh: mesh + (inkType === 'PLASTISOL' ? '/64' : '/48'),
                    additives: info.aditivos
                });
            });
        });
        
        // 3.4 Otros colores
        colors.other.forEach(ink => {
            steps.push({
                tipo: 'COLOR',
                screenLetter: String(nextNumber++),
                nombre: ink.val,
                mesh: inkType === 'PLASTISOL' ? '156/64' : '157/48',
                additives: inkType === 'WATER' ? '3% CL 500 · 5% ecofix XL' : 
                           (inkType === 'PLASTISOL' ? '1% catalyst' : '3% cat · 2% ret')
            });
        });
        
        // ===== AÑADIR FLASH/COOL ENTRE PASOS =====
        const finalSequence = [];
        
        steps.forEach((step, index) => {
            finalSequence.push(step);
            
            if (index < steps.length - 1) {
                finalSequence.push({ 
                    tipo: 'FLASH', 
                    screenLetter: '', 
                    nombre: 'FLASH', 
                    mesh: '-', 
                    additives: '' 
                });
                finalSequence.push({ 
                    tipo: 'COOL', 
                    screenLetter: '', 
                    nombre: 'COOL', 
                    mesh: '-', 
                    additives: '' 
                });
            }
        });
        
        console.log(`✅ Secuencia generada con ${finalSequence.length} pasos totales`);
        
        return {
            sequence: finalSequence,
            temperatura: baseConfig.temperatura,
            tiempo: baseConfig.tiempo
        };
    }

    function getCuringConditions(inkType, customer) {
        const baseConfig = getBaseConfig(inkType, customer);
        return {
            temp: baseConfig.temperatura,
            time: baseConfig.tiempo
        };
    }

    // =====================================================
    // API PÚBLICA
    // =====================================================
    
    return {
        generarSecuencia,
        getCuringConditions,
        clasificarTela,
        esColorEspecial
    };

})();

// =====================================================
// CARGA AUTOMÁTICA
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ RulesEngine v3.0 cargado');
});
