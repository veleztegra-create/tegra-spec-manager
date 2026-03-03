// =====================================================
// rules-engine.js - Versión 7.1 - DEFINITIVA
// CORREGIDO: generarSecuencia devuelve array directamente
// =====================================================

window.RulesEngine = (function() {
    "use strict";
    
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
                nombre: 'AQUAFLEX MAGNA'
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
    // COLORES ESPECIALES (3 PANTALLAS)
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

    function esColorEspecial(colorName) {
        if (!colorName) return null;
        const normalized = colorName.toLowerCase().trim();
        for (const key in SPECIAL_COLORS) {
            const entry = SPECIAL_COLORS[key];
            if (entry.identificadores.some(id => normalized.includes(id))) {
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

    function esColorMetalico(colorName) {
        if (!colorName) return false;
        const upper = colorName.toUpperCase();
        // Buscar números de 3 dígitos 871-877 seguidos de C (opcional)
        const regex3 = /\b(87[1-7])C?\b/;
        const match3 = upper.match(regex3);
        if (match3) {
            let num = parseInt(match3[1]);
            if (num >= 871 && num <= 877) return true;
        }
        // Buscar números de 4 dígitos 8001-8965 seguidos de C
        const regex4 = /\b(8[0-9]{3})C?\b/;
        const match4 = upper.match(regex4);
        if (match4) {
            let num = parseInt(match4[1]);
            if (num >= 8001 && num <= 8965) return true;
        }
        return false;
    }

    // Mapa de sufijos para mallas según tipo de tinta
    const meshSuffixMap = {
        'WATER': { '110': '/64', '122': '/55', '157': '/48', '198': '/40' },
        'PLASTISOL': { '110': '/64', '122': '/55', '157': '/64', '198': '/64' },
        'SILICONE': { '110': '/64', '122': '/55', '157': '/48', '198': '/40' }
    };

    // =====================================================
    // FUNCIÓN PRINCIPAL - AHORA DEVUELVE ARRAY DIRECTAMENTE
    // =====================================================
    
    function generarSecuencia(params) {
        const {
            customer = '',
            garmentColor = '',
            inkType = 'WATER',
            designColors = []
        } = params;

        console.log(`⚙️ RulesEngine v7.1: Generando secuencia`);
        console.log(`   Cliente: ${customer || 'N/A'}`);
        console.log(`   Tela: ${garmentColor}`);
        console.log(`   Tinta: ${inkType}`);

        // ===== CONFIGURACIÓN =====
        const baseConfig = getBaseConfig(inkType, customer);
        const esOscura = esTelaOscura(garmentColor);
        const inkUpper = inkType.toUpperCase();
        
        console.log(`   📋 Config: ${baseConfig.blocker.nombre} / ${baseConfig.whiteBase.nombre}`);
        console.log(`   📊 Tela: ${esOscura ? 'oscura' : 'clara'}`);

        // ===== CLASIFICAR COLORES =====
        const coloresInfo = [];
        let hayColorClaro = false;

        designColors.forEach(color => {
            const val = String(color.val || '').toUpperCase().trim();
            if (!val) return;
            
            const esClaro = esColorClaro(val);
            if (esClaro) hayColorClaro = true;
            
            coloresInfo.push({
                val: val,
                esClaro: esClaro,
                especial: esColorEspecial(val),
                metalico: esColorMetalico(val)
            });
        });

        console.log(`   🎨 Colores a procesar: ${coloresInfo.length}`);
        console.log(`   🌟 ¿Hay colores claros? ${hayColorClaro ? 'Sí' : 'No'}`);

        // ===== CONSTRUIR SECUENCIA =====
        const steps = []; // pasos de impresión
        let nextLetter = 'A'.charCodeAt(0); // Letras para bloqueadores y bases
        let nextNumber = 1;                  // Números para colores

        // Función para añadir un paso de impresión
        function addStep(tipo, nombre, mesh, additives) {
            steps.push({
                tipo: tipo,
                screenLetter: String.fromCharCode(nextLetter++),
                nombre: nombre,
                mesh: mesh,
                additives: additives
            });
        }

        // ===== PASOS PREVIOS SEGÚN TIPO DE TINTA =====
        if (inkUpper === 'WATER') {
            if (esOscura) {
                // Tela oscura: 3 bloqueadores
                const blockerMallas = ['110/64', '122/55', '157/48'];
                blockerMallas.forEach(malla => {
                    addStep('BLOCKER', baseConfig.blocker.nombre, malla, '');
                });
                // Luego bases con aditivo: 1 o 2 según haya colores claros
                const numBases = hayColorClaro ? 2 : 1;
                for (let i = 0; i < numBases; i++) {
                    addStep('WHITE_BASE', baseConfig.whiteBaseRefuerzo.nombre, '122/55', baseConfig.baseAdditives);
                }
            } else {
                // Tela clara: 2 bases sin aditivo, luego 1 bloqueador, luego 1 base con aditivo
                const baseMallasIniciales = ['110/64', '122/55'];
                baseMallasIniciales.forEach(malla => {
                    addStep('WHITE_BASE', baseConfig.whiteBase.nombre, malla, '');
                });
                addStep('BLOCKER', baseConfig.blocker.nombre, '157/48', '');
                addStep('WHITE_BASE', baseConfig.whiteBaseRefuerzo.nombre, '122/55', baseConfig.baseAdditives);
            }
        } 
        else if (inkUpper === 'PLASTISOL') {
            // Para plastisol, usar la variante correcta
            const variant = detectCustomerVariant(customer);
            const configPlast = (variant === 'PLASTISOL_GFS') ? BASE_CONFIG.PLASTISOL_GFS : BASE_CONFIG.PLASTISOL_FANATICS;
            
            // Bloqueadores: siempre dos
            const blockerMallas = ['110/64', '122/55'];
            blockerMallas.forEach(malla => {
                addStep('BLOCKER', configPlast.blocker.nombre, malla, '');
            });
            
            // Bases blancas: solo si hay colores claros
            if (hayColorClaro) {
                const baseMallas = ['157/64', '122/55'];
                baseMallas.forEach(malla => {
                    addStep('WHITE_BASE', configPlast.whiteBase.nombre, malla, '');
                });
            }
        } 
        else if (inkUpper === 'SILICONE') {
            // Un bloqueador y una base blanca
            addStep('BLOCKER', baseConfig.blocker.nombre, '110/64', '');
            addStep('WHITE_BASE', baseConfig.whiteBase.nombre, '122/55', '');
        }

        // ===== PROCESAR CADA COLOR =====
        coloresInfo.forEach(color => {
            const colorNumber = nextNumber++;
            let mallasColor = [];
            let additivesColor = '';
            let nombreBase = color.val;

            // Obtener el mapa de sufijos según tipo de tinta
            const suffixMap = meshSuffixMap[inkUpper] || meshSuffixMap['WATER'];

            if (color.metalico) {
                // Colores metálicos (871-877C, 8001-8965C)
                mallasColor = ['122/55', '157/48'];
                additivesColor = '3% cross linker 500 · 3% Binder Flex';
            } 
            else if (color.especial) {
                // Colores especiales (3 pantallas)
                color.especial.mallas.forEach((meshNum, idx) => {
                    let fullMesh = meshNum + (suffixMap[meshNum] || '');
                    // Si no se encontró sufijo, usar el genérico
                    if (!fullMesh.includes('/')) {
                        fullMesh = meshNum + (inkUpper === 'PLASTISOL' ? '/64' : '/48');
                    }
                    mallasColor.push(fullMesh);
                });
                additivesColor = color.especial.aditivos;
            } 
            else {
                // Colores normales
                if (inkUpper === 'WATER') {
                    // En waterbase, el orden de mallas depende de la tela
                    if (esOscura) {
                        mallasColor = ['198/40', '157/48']; // primero 198, luego 157
                    } else {
                        mallasColor = ['157/48', '198/40']; // primero 157, luego 198
                    }
                } else if (inkUpper === 'PLASTISOL') {
                    mallasColor = ['157/64', '122/55'];
                } else if (inkUpper === 'SILICONE') {
                    mallasColor = ['157/48', '157/48'];
                }
                additivesColor = baseConfig.color.additives;
            }

            // Añadir cada malla del color
            mallasColor.forEach((mesh, idx) => {
                let screenLetter;
                if (idx === 0) {
                    screenLetter = String(colorNumber);
                } else {
                    screenLetter = `${colorNumber}-${idx + 1}`;
                }
                let nombre = nombreBase;
                if (mallasColor.length > 1) {
                    nombre += ` (${idx + 1})`;
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
        console.log(`   📝 Letras usadas: A - ${String.fromCharCode(nextLetter-1)}`);
        console.log(`   🔢 Números de color: 1 - ${nextNumber-1}`);

        // ===== IMPORTANTE: Devolver SOLO el array (lo que espera app.js) =====
        return finalSequence;
    }

    // ===== Función adicional para obtener condiciones de curado =====
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
        generarSecuencia,        // Ahora devuelve array directamente
        getCuringConditions,      // Para obtener temp/tiempo por separado
        esTelaOscura,
        esColorEspecial,
        esColorMetalico
    };

})();

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ RulesEngine v7.1 - DEFINITIVO (devuelve array directamente)');
});
