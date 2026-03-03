// =====================================================
// rules-engine.js - Versión 8.3 - JERARQUÍA CORREGIDA
// =====================================================

window.RulesEngine = (function() {
    "use strict";
    
    // =====================================================
    // CONSTANTES SÍMBOLICAS (NUNCA CAMBIAN)
    // =====================================================
    const SYMBOL_CODES = {
        BLOCKER: 'A',        // Siempre A
        WHITE_BASE: 'B'      // Siempre B
    };

    // =====================================================
    // RANGOS METÁLICOS OFICIALES (REGLA MATEMÁTICA)
    // =====================================================
    const METALLIC_RANGES = [
        { start: 871, end: 877 },
        { start: 8001, end: 8965 }
    ];

    const METALLIC_CONFIG = {
        mallas: ['122/55', '157/48'],
        aditivos: '3% cross linker 500 · 3% Binder Flex'
    };

    // =====================================================
    // COLORES ESPECIALES 3 PANTALLAS (NO METÁLICOS)
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
        }
    };

    // =====================================================
    // IDENTIFICADORES DE TELA OSCURA
    // =====================================================
    const DARK_FABRICS = [
        'negro', 'black', 'navy', 'azul marino', 'charcoal', 'carbon',
        'maroon', 'granate', 'dark', 'oscuro', 'forest', 'verde oscuro',
        'hunter', 'midnight', 'midnight navy', 'italy blue', 'royal'
    ];

    // =====================================================
    // FUNCIONES AUXILIARES
    // =====================================================
    
    function detectCustomerVariant(customer) {
        if (!customer) return 'WATER';
        const upper = customer.toUpperCase();
        if (upper.includes('GFS') || upper.includes('GEAR FOR SPORT')) return 'PLASTISOL_GFS';
        if (upper.includes('FANATICS')) return 'PLASTISOL_FANATICS';
        return 'WATER';
    }

    function getBaseConfig(inkType, customer) {
        const ink = String(inkType || 'WATER').toUpperCase();
        
        if (ink === 'PLASTISOL') {
            const variant = detectCustomerVariant(customer);
            if (variant === 'PLASTISOL_GFS') return BASE_CONFIG.PLASTISOL_GFS;
            if (variant === 'PLASTISOL_FANATICS') return BASE_CONFIG.PLASTISOL_FANATICS;
        }
        
        if (ink === 'SILICONE') return BASE_CONFIG.SILICONE;
        return BASE_CONFIG.WATER;
    }

    function esTelaOscura(colorTela) {
        if (!colorTela) return false;
        const telaLower = colorTela.toLowerCase();
        return DARK_FABRICS.some(o => telaLower.includes(o));
    }

    function extractPantoneNumber(colorName) {
        if (!colorName) return null;
        const match = colorName.toUpperCase().match(/\b(\d{3,4})C?\b/);
        return match ? parseInt(match[1], 10) : null;
    }

    function esColorMetalico(colorName) {
        const number = extractPantoneNumber(colorName);
        if (!number) return false;
        return METALLIC_RANGES.some(range => number >= range.start && number <= range.end);
    }

    function esThreeScreenSpecial(colorName) {
        if (!colorName) return null;
        const upper = colorName.toUpperCase();
        for (const key in SPECIAL_COLORS) {
            const entry = SPECIAL_COLORS[key];
            if (entry.identificadores.some(id => upper.includes(id.toUpperCase()))) {
                return entry;
            }
        }
        return null;
    }

    function esColorClaro(colorName) {
        if (!colorName) return false;
        const upper = colorName.toUpperCase();
        const claros = ['YELLOW', 'GOLD', 'ORANGE', 'PINK', 'AMARILLO', 'DORADO', 'NARANJA', 'ROSA', 'LIGHT', 'CLARO'];
        return claros.some(c => upper.includes(c));
    }

    // Detección de grises oscuros (para posibles reglas futuras, pero por ahora solo afecta la clasificación)
    const DARK_GREY_TERMS = ['GREY', 'GRAY', 'GRIS', 'CHARCOAL', 'CARBON', 'OSCURO', 'DARK'];
    function esGrisOscuro(colorName) {
        if (!colorName) return false;
        const upper = colorName.toUpperCase();
        const tieneGris = DARK_GREY_TERMS.some(term => upper.includes(term));
        const noEsClaro = !esColorClaro(colorName);
        return tieneGris && noEsClaro;
    }

    const meshSuffixMap = {
        'WATER': { '110': '/64', '122': '/55', '157': '/48', '198': '/40' },
        'PLASTISOL': { '110': '/64', '122': '/55', '157': '/64', '198': '/64' },
        'SILICONE': { '110': '/64', '122': '/55', '157': '/48', '198': '/40' }
    };

    // =====================================================
    // CONFIGURACIÓN DE BASES
    // =====================================================
    const BASE_CONFIG = {
        'WATER': {
            blocker: { 
                nombre: 'BLOCKER CHT'
            },
            whiteBase: { 
                nombre: 'AQUAFLEX V2'
            },
            whiteBaseRefuerzo: { 
                nombre: 'REF. AQUAFLEX MAGNA'
            },
            color: {
                mallas: ['157/48', '198/40'],
                additives: '3% CL 500 · 5% ecofix XL'
            },
            baseAdditives: '3% CL 500',
            temperatura: '320 °F',
            tiempo: '1:40 min'
        },
        
        'PLASTISOL_GFS': {
            blocker: { 
                nombre: 'BARRIER BASE'
            },
            whiteBase: { 
                nombre: 'TXT POLY WHITE'
            },
            color: {
                mallas: ['157/64', '122/55'],
                additives: '1% catalyst'
            },
            temperatura: '320 °F',
            tiempo: '1:00 min'
        },
        
        'PLASTISOL_FANATICS': {
            blocker: { 
                nombre: 'BARRIER CHT'
            },
            whiteBase: { 
                nombre: 'POLY WHITE'
            },
            color: {
                mallas: ['157/64', '122/55'],
                additives: '1% catalyst'
            },
            temperatura: '320 °F',
            tiempo: '1:00 min'
        },
        
        'SILICONE': {
            blocker: { 
                nombre: 'BLOCKER LIBRA'
            },
            whiteBase: { 
                nombre: 'BASE WHITE LIBRA'
            },
            color: {
                mallas: ['157/48', '157/48'],
                additives: '3% cat · 2% ret'
            },
            temperatura: '320 °F',
            tiempo: '1:40 min'
        }
    };

    // =====================================================
    // FUNCIÓN PRINCIPAL
    // =====================================================
    
    function generarSecuencia(params) {
        const {
            customer = '',
            garmentColor = '',
            inkType = 'WATER',
            designColors = []
        } = params;

        console.log(`⚙️ RulesEngine v8.3: Generando secuencia`);
        console.log(`   Cliente: ${customer || 'N/A'}`);
        console.log(`   Tela: ${garmentColor}`);
        console.log(`   Tinta: ${inkType}`);

        const baseConfig = getBaseConfig(inkType, customer);
        const esOscura = esTelaOscura(garmentColor);
        const inkUpper = inkType.toUpperCase();
        
        console.log(`   📋 Config: ${baseConfig.blocker.nombre} / ${baseConfig.whiteBase.nombre}`);
        console.log(`   📊 Tela: ${esOscura ? 'oscura' : 'clara'}`);

        // ===== PROCESAR COLORES CON JERARQUÍA CORRECTA =====
        const coloresInfo = [];
        let hayColorClaro = false;

        designColors.forEach(color => {
            const val = String(color.val || '').toUpperCase().trim();
            if (!val) return;

            // 1️⃣ METÁLICOS (máxima prioridad)
            if (esColorMetalico(val)) {
                coloresInfo.push({
                    val: val,
                    esMetalico: true,
                    esClaro: false, // no afecta bases
                    config: null
                });
                return;
            }

            // 2️⃣ ESPECIALES DE 3 PANTALLAS (amarillos muy claros)
            const especial3 = esThreeScreenSpecial(val);
            if (especial3) {
                coloresInfo.push({
                    val: val,
                    esEspecial3: true,
                    config: especial3,
                    esClaro: true // son claros, afectan bases
                });
                hayColorClaro = true;
                return;
            }

            // 3️⃣ GRISES OSCUROS (no afectan bases, pero se identifican)
            if (esGrisOscuro(val)) {
                coloresInfo.push({
                    val: val,
                    esGrisOscuro: true,
                    esClaro: false,
                    config: null
                });
                return;
            }

            // 4️⃣ RESTO (colores normales)
            const esClaro = esColorClaro(val);
            if (esClaro) hayColorClaro = true;
            
            coloresInfo.push({
                val: val,
                esClaro: esClaro,
                esMetalico: false,
                esEspecial3: false,
                esGrisOscuro: false,
                config: null
            });
        });

        console.log(`   🎨 Colores a procesar: ${coloresInfo.length}`);
        console.log(`   🌟 ¿Hay colores claros? ${hayColorClaro ? 'Sí' : 'No'}`);

        // ===== CONSTRUIR SECUENCIA =====
        const steps = [];
        let nextNumber = 1; // Solo para colores

        function addStep(tipo, nombre, mesh, additives) {
            let screenLetter = '';
            
            if (tipo === 'BLOCKER') {
                screenLetter = SYMBOL_CODES.BLOCKER;
            } else if (tipo === 'WHITE_BASE') {
                screenLetter = SYMBOL_CODES.WHITE_BASE;
            }
            
            steps.push({
                tipo: tipo,
                screenLetter: screenLetter,
                nombre: nombre,
                mesh: mesh,
                additives: additives
            });
        }

        // ===== PASOS PREVIOS SEGÚN TIPO DE TINTA =====
        if (inkUpper === 'WATER') {
            if (esOscura) {
                const blockerMallas = ['110/64', '122/55', '157/48'];
                blockerMallas.forEach(malla => {
                    addStep('BLOCKER', baseConfig.blocker.nombre, malla, '');
                });
                
                const numBases = hayColorClaro ? 2 : 1;
                for (let i = 0; i < numBases; i++) {
                    addStep('WHITE_BASE', baseConfig.whiteBase.nombre, '122/55', baseConfig.baseAdditives);
                }
            } else {
                const baseMallasIniciales = ['110/64', '122/55'];
                baseMallasIniciales.forEach(malla => {
                    addStep('WHITE_BASE', baseConfig.whiteBase.nombre, malla, '');
                });
                
                addStep('BLOCKER', baseConfig.blocker.nombre, '157/48', '');
                
                addStep('WHITE_BASE', baseConfig.whiteBaseRefuerzo.nombre, '122/55', baseConfig.baseAdditives);
            }
        } 
        else if (inkUpper === 'PLASTISOL') {
            const variant = detectCustomerVariant(customer);
            const configPlast = (variant === 'PLASTISOL_GFS') ? BASE_CONFIG.PLASTISOL_GFS : BASE_CONFIG.PLASTISOL_FANATICS;
            
            const blockerMallas = ['110/64', '122/55'];
            blockerMallas.forEach(malla => {
                addStep('BLOCKER', configPlast.blocker.nombre, malla, '');
            });
            
            if (hayColorClaro) {
                const baseMallas = ['157/64', '122/55'];
                baseMallas.forEach(malla => {
                    addStep('WHITE_BASE', configPlast.whiteBase.nombre, malla, '');
                });
            }
        } 
        else if (inkUpper === 'SILICONE') {
            addStep('BLOCKER', baseConfig.blocker.nombre, '110/64', '');
            addStep('WHITE_BASE', baseConfig.whiteBase.nombre, '122/55', '');
        }

        // ===== PROCESAR CADA COLOR CON LA JERARQUÍA ESTABLECIDA =====
        coloresInfo.forEach(color => {
            const colorNumber = nextNumber++;
            let mallasColor = [];
            let additivesColor = '';
            let nombreBase = color.val;

            if (color.esMetalico) {
                // Metálicos: configuración especial
                mallasColor = METALLIC_CONFIG.mallas;
                additivesColor = METALLIC_CONFIG.aditivos;
            }
            else if (color.esEspecial3) {
                // Especiales 3 pantallas: usar la configuración de SPECIAL_COLORS
                const config = color.config;
                const suffixMap = meshSuffixMap[inkUpper] || meshSuffixMap['WATER'];
                mallasColor = config.mallas.map(meshNum => {
                    let fullMesh = meshNum + (suffixMap[meshNum] || '');
                    if (!fullMesh.includes('/')) {
                        fullMesh = meshNum + (inkUpper === 'PLASTISOL' ? '/64' : '/48');
                    }
                    return fullMesh;
                });
                additivesColor = config.aditivos;
            }
            else {
                // Colores normales (incluyendo grises oscuros, que se tratan igual)
                if (inkUpper === 'WATER') {
                    if (esOscura) {
                        mallasColor = ['198/40', '157/48']; // orden para tela oscura
                    } else {
                        mallasColor = ['157/48', '198/40']; // orden para tela clara
                    }
                } else if (inkUpper === 'PLASTISOL') {
                    mallasColor = ['157/64', '122/55'];
                } else if (inkUpper === 'SILICONE') {
                    mallasColor = ['157/48', '157/48'];
                }
                additivesColor = baseConfig.color.additives;
            }

            // Añadir cada malla del color (todas con el mismo número)
            mallasColor.forEach((mesh, idx) => {
                let screenLetter = String(colorNumber);
                let nombre = nombreBase;
                if (mallasColor.length > 1 && idx > 0) {
                    nombre = nombreBase + ' (2)';
                }
                
                steps.push({
                    tipo: 'COLOR',
                    screenLetter: screenLetter,
                    nombre: nombre,
                    mesh: mesh,
                    additives: additivesColor
                });
            });
        });

        // ===== AÑADIR FLASH Y COOL ENTRE PASOS =====
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

        console.log(`✅ Secuencia generada con ${finalSequence.length} pasos`);
        console.log(`   🔢 Números de color usados: 1 - ${nextNumber-1}`);

        return finalSequence;
    }

    function getCuringConditions(inkType, customer) {
        const config = getBaseConfig(inkType, customer);
        return {
            temperatura: config.temperatura,
            tiempo: config.tiempo
        };
    }

    // =====================================================
    // API PÚBLICA
    // =====================================================
    
    return {
        generarSecuencia,
        getCuringConditions,
        esTelaOscura,
        esColorMetalico,
        esThreeScreenSpecial,
        esGrisOscuro
    };

})();

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ RulesEngine v8.3 - JERARQUÍA CORREGIDA (metálicos, 3 pantallas, grises)');
});
