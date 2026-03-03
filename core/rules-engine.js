// =====================================================
// rules-engine.js - Versión 8.2 - CON SOPORTE PARA TINTA BLANCA
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
        const regex3 = /\b(87[1-7])C?\b/;
        const match3 = upper.match(regex3);
        if (match3) {
            let num = parseInt(match3[1]);
            if (num >= 871 && num <= 877) return true;
        }
        const regex4 = /\b(8[0-9]{3})C?\b/;
        const match4 = upper.match(regex4);
        if (match4) {
            let num = parseInt(match4[1]);
            if (num >= 8001 && num <= 8965) return true;
        }
        return false;
    }

    const meshSuffixMap = {
        'WATER': { '110': '/64', '122': '/55', '157': '/48', '198': '/40' },
        'PLASTISOL': { '110': '/64', '122': '/55', '157': '/64', '198': '/64' },
        'SILICONE': { '110': '/64', '122': '/55', '157': '/48', '198': '/40' }
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

        console.log(`⚙️ RulesEngine v8.2: Generando secuencia`);
        console.log(`   Cliente: ${customer || 'N/A'}`);
        console.log(`   Tela: ${garmentColor}`);
        console.log(`   Tinta: ${inkType}`);

        const baseConfig = getBaseConfig(inkType, customer);
        const esOscura = esTelaOscura(garmentColor);
        const inkUpper = inkType.toUpperCase();
        
        console.log(`   📋 Config: ${baseConfig.blocker.nombre} / ${baseConfig.whiteBase.nombre}`);
        console.log(`   📊 Tela: ${esOscura ? 'oscura' : 'clara'}`);

        // ===== PROCESAR COLORES CON DETECCIÓN DE WHITE =====
        const coloresInfo = [];
        let hayColorClaro = false;
        let whiteYaProcesado = false; // Control para evitar duplicados

        designColors.forEach(color => {
            const val = String(color.val || '').toUpperCase().trim();
            if (!val) return;
            
            // ===== DETECCIÓN DE TINTA BLANCA (SOLO WATER) =====
            const isWhiteInk = inkUpper === 'WATER' && val === 'WHITE';
            
            if (isWhiteInk) {
                // Solo procesamos una vez aunque venga repetido
                if (!whiteYaProcesado) {
                    coloresInfo.push({
                        val: val,
                        esBlanco: true,
                        esClaro: false,
                        especial: null,
                        metalico: false
                    });
                    whiteYaProcesado = true;
                }
                return; // No contar para hayColorClaro
            }
            
            // ===== PROCESAMIENTO NORMAL PARA NO-BLANCOS =====
            const esClaro = esColorClaro(val);
            if (esClaro) hayColorClaro = true;
            
            coloresInfo.push({
                val: val,
                esClaro: esClaro,
                especial: esColorEspecial(val),
                metalico: esColorMetalico(val),
                esBlanco: false
            });
        });

        console.log(`   🎨 Colores a procesar: ${coloresInfo.length}`);
        console.log(`   🌟 ¿Hay colores claros? ${hayColorClaro ? 'Sí' : 'No'}`);
        console.log(`   ⚪ ¿Hay tinta blanca? ${whiteYaProcesado ? 'Sí' : 'No'}`);

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

        // ===== PROCESAR CADA COLOR (LA NUMERACIÓN OCURRE AQUÍ DENTRO) =====
        coloresInfo.forEach(color => {
            if (color.esBlanco) {
                // CASO ESPECIAL: TINTA BLANCA EN WATER
                // Usamos el número actual y luego incrementamos
                const colorNumber = nextNumber++;
                
                steps.push({
                    tipo: 'COLOR',
                    screenLetter: String(colorNumber),
                    nombre: 'REF. AQUAFLEX MAGNA',
                    mesh: '122/55',
                    additives: baseConfig.baseAdditives
                });
                
                return; // No procesar como color normal
            }
            
            // CASO NORMAL: procesar color con sus mallas
            const colorNumber = nextNumber++;
            let mallasColor = [];
            let additivesColor = '';
            let nombreBase = color.val;

            const suffixMap = meshSuffixMap[inkUpper] || meshSuffixMap['WATER'];

            if (color.metalico) {
                mallasColor = ['122/55', '157/48'];
                additivesColor = '3% cross linker 500 · 3% Binder Flex';
            } 
            else if (color.especial) {
                color.especial.mallas.forEach((meshNum, idx) => {
                    let fullMesh = meshNum + (suffixMap[meshNum] || '');
                    if (!fullMesh.includes('/')) {
                        fullMesh = meshNum + (inkUpper === 'PLASTISOL' ? '/64' : '/48');
                    }
                    mallasColor.push(fullMesh);
                });
                additivesColor = color.especial.aditivos;
            } 
            else {
                if (inkUpper === 'WATER') {
                    if (esOscura) {
                        mallasColor = ['198/40', '157/48'];
                    } else {
                        mallasColor = ['157/48', '198/40'];
                    }
                } else if (inkUpper === 'PLASTISOL') {
                    mallasColor = ['157/64', '122/55'];
                } else if (inkUpper === 'SILICONE') {
                    mallasColor = ['157/48', '157/48'];
                }
                additivesColor = baseConfig.color.additives;
            }

            // Añadir cada malla del color (TODAS CON EL MISMO NÚMERO)
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
        esColorEspecial,
        esColorMetalico
    };

})();

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ RulesEngine v8.2 - CON SOPORTE PARA TINTA BLANCA EN WATER');
});
