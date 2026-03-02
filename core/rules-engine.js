// rules-engine.js - Motor de reglas centralizado
// Mantiene separación: placement.colors (solo tintas) vs placement.sequence (incluye FLASH/COOL)

window.RulesEngine = (function () {
    "use strict"; // <-- AÑADIDO: modo estricto para evitar errores comunes

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
        }
    };

    // =====================================================
    // REGLAS DE TELA (FABRIC)
    // =====================================================
    const FABRIC_RULES = {
        darkIdentifiers: [
            'negro', 'black', 'navy', 'azul marino', 'charcoal', 'carbon', 
            'maroon', 'granate', 'dark', 'oscuro', 'forest', 'verde oscuro', 
            'hunter', 'midnight', 'midnight navy'
        ],
        lightIdentifiers: [
            'blanco', 'white', 'natural', 'crema', 'ivory', 'beige', 
            'claro', 'light', 'gris claro', 'light gray', 'italy blue' // <-- AÑADIDO: para tu ejemplo
        ]
    };

    // =====================================================
    // REGLAS DE TINTA (INK)
    // =====================================================
    const INK_RULES = {
        WATER: {
            temperature: '320 °F',
            time: '1:40 min',
            requiresBlocker: true,
            whiteBaseCounts: { dark: 1, light: 2 },
            meshes: {
                blocker: ['122/55', '157/48'],
                whiteBase: ['198/40', '157/48'],
                color: ['157/48', '198/40']
            },
            additives: {
                blocker: 'N/A',
                whiteBase: '3% CL 500',
                color: '3% CL 500 · 5% ecofix XL'
            }
        },
        PLASTISOL: {
            temperature: '320 °F',
            time: '1:00 min',
            requiresBlocker: true,
            whiteBaseCounts: { dark: 1, light: 0 },
            meshes: {
                blocker: ['110/64', '156/64', '156/64'],
                whiteBase: ['156/64', '110/64'],
                color: ['156/64', '156/64']
            },
            additives: {
                blocker: 'N/A',
                whiteBase: 'N/A',
                color: '1% catalyst'
            }
        },
        SILICONE: {
            temperature: '320 °F',
            time: '1:40 min',
            requiresBlocker: true,
            whiteBaseCounts: { dark: 1, light: 1 },
            meshes: {
                blocker: ['110/64'],
                whiteBase: ['122/55'],
                color: ['157/48', '157/48']
            },
            additives: {
                blocker: '',
                whiteBase: '',
                color: '3% cat · 2% ret'
            }
        }
    };

    // =====================================================
    // PRESETS BASE (CORREGIDOS)
    // =====================================================
    const BASE_PRESETS = {
        WATER: {
            inkType: 'WATER',
            blocker: { 
                nombre: 'BLOCKER CHT', 
                additives: 'N/A', 
                meshDark1: '122/55', 
                meshDark2: '157/48', 
                meshDark3: '', 
                meshLight1: '157/??' 
            },
            whiteBase: { 
                nombre: 'AQUAFLEX V2 WHITE', 
                additives: '3% CL 500', 
                mesh1: '198/40', 
                mesh2: '157/48', 
                initialDarkCount: 1, 
                initialLightCount: 2 
            },
            whiteBaseWithCatalyst: { 
                mesh: '122/??', 
                additives: '3% CL 500' 
            },
            color: { 
                additives: '3% CL 500 · 5% ecofix XL', 
                mesh1: '157/48', 
                mesh2: '198/40' 
            },
            curing: { 
                temp: '320 °F', 
                time: '1:40 min' 
            }
        },
        PLASTISOL: {
            inkType: 'PLASTISOL',
            blocker: { 
                nombre: 'BARRIER BASE', 
                additives: 'N/A', 
                meshDark1: '110/64', 
                meshDark2: '156/64', 
                meshDark3: '156/64', 
                meshLight1: '110/64' 
            },
            whiteBase: { 
                nombre: 'TXT POLY WHITE', 
                additives: 'N/A', 
                mesh1: '156/64', 
                mesh2: '110/64', 
                initialDarkCount: 1, 
                initialLightCount: 0 
            },
            whiteBaseWithCatalyst: { 
                mesh: '110/64', 
                additives: '' 
            },
            color: { 
                additives: '1% catalyst', 
                mesh1: '156/64', 
                mesh2: '156/64' 
            },
            curing: { 
                temp: '320 °F', 
                time: '1:00 min' 
            }
        },
        SILICONE: {
            inkType: 'SILICONE',
            blocker: { 
                nombre: 'BLOCKER LIBRA', 
                additives: '', 
                meshDark1: '110/64', 
                meshDark2: '110/64', 
                meshDark3: '110/64', 
                meshLight1: '110/64' 
            },
            whiteBase: { 
                nombre: 'BASE WHITE LIBRA', 
                additives: '', 
                mesh1: '122/55', 
                mesh2: '122/55', 
                initialDarkCount: 1, 
                initialLightCount: 1 
            },
            whiteBaseWithCatalyst: { 
                mesh: '122/55', 
                additives: '' 
            },
            color: { 
                additives: '3% cat · 2% ret', 
                mesh1: '157/48', 
                mesh2: '157/48' 
            },
            curing: { 
                temp: '320 °F', 
                time: '1:40 min' 
            }
        }
    };

    // =====================================================
    // FUNCIONES AUXILIARES
    // =====================================================
    
    function mergeUnique(target, values) {
        (values || []).forEach((value) => {
            const normalized = String(value || '').trim().toLowerCase();
            if (normalized && !target.includes(normalized)) target.push(normalized);
        });
    }

    function mergeInkRuleEntry(base, patch) {
        if (!patch || typeof patch !== 'object') return base;
        const next = { ...base };
        if (patch.temperature) next.temperature = patch.temperature;
        if (patch.time) next.time = patch.time;
        if (typeof patch.requiresBlocker === 'boolean') next.requiresBlocker = patch.requiresBlocker;
        if (patch.whiteBaseCounts) {
            next.whiteBaseCounts = {
                ...next.whiteBaseCounts,
                ...patch.whiteBaseCounts
            };
        }
        if (patch.meshes) next.meshes = { ...next.meshes, ...patch.meshes };
        if (patch.additives) next.additives = { ...next.additives, ...patch.additives };
        return next;
    }

    function mapInkType(value) {
        const normalized = String(value || '').toUpperCase().trim();
        if (normalized === 'WATERBASE') return 'WATER';
        return normalized;
    }

    function parseGeneralInkCatalog(catalog) {
        const rules = catalog?.reglas_generales;
        if (!rules || typeof rules !== 'object') return null;

        const ink = mapInkType(catalog.nombre);
        if (!['WATER', 'PLASTISOL', 'SILICONE'].includes(ink)) return null;

        return {
            [ink]: {
                temperature: rules.temperatura,
                time: rules.tiempo,
                requiresBlocker: typeof rules.requiere_bloqueador === 'boolean' ? rules.requiere_bloqueador : undefined,
                whiteBaseCounts: {
                    dark: rules.bases_blancas?.sobre_oscuro,
                    light: rules.bases_blancas?.sobre_claro
                },
                meshes: {
                    blocker: [rules.mallas?.BLOCKER?.primera, rules.mallas?.BLOCKER?.segunda, rules.mallas?.BLOCKER?.tercera].filter(Boolean),
                    whiteBase: [rules.mallas?.WHITE_BASE?.primera, rules.mallas?.WHITE_BASE?.segunda].filter(Boolean),
                    color: [rules.mallas?.COLOR?.normal, rules.mallas?.COLOR?.segunda_pantalla].filter(Boolean)
                },
                additives: {
                    blocker: rules.aditivos?.BLOCKER,
                    whiteBase: rules.aditivos?.WHITE_BASE,
                    color: rules.aditivos?.COLOR
                }
            }
        };
    }

    function syncPresetsFromInkRules() {
        // WATER
        if (INK_RULES.WATER.meshes?.blocker?.[0]) BASE_PRESETS.WATER.blocker.meshDark1 = INK_RULES.WATER.meshes.blocker[0];
        if (INK_RULES.WATER.meshes?.blocker?.[1]) BASE_PRESETS.WATER.blocker.meshDark2 = INK_RULES.WATER.meshes.blocker[1];
        if (INK_RULES.WATER.meshes?.blocker?.[2]) BASE_PRESETS.WATER.blocker.meshDark3 = INK_RULES.WATER.meshes.blocker[2];
        if (INK_RULES.WATER.additives?.color) BASE_PRESETS.WATER.color.additives = INK_RULES.WATER.additives.color;
        if (INK_RULES.WATER.meshes?.color?.[0]) BASE_PRESETS.WATER.color.mesh1 = INK_RULES.WATER.meshes.color[0];
        if (INK_RULES.WATER.meshes?.color?.[1]) BASE_PRESETS.WATER.color.mesh2 = INK_RULES.WATER.meshes.color[1];
        if (INK_RULES.WATER.whiteBaseCounts?.dark !== undefined) BASE_PRESETS.WATER.whiteBase.initialDarkCount = INK_RULES.WATER.whiteBaseCounts.dark;
        if (INK_RULES.WATER.whiteBaseCounts?.light !== undefined) BASE_PRESETS.WATER.whiteBase.initialLightCount = INK_RULES.WATER.whiteBaseCounts.light;
        BASE_PRESETS.WATER.curing = { temp: INK_RULES.WATER.temperature, time: INK_RULES.WATER.time };

        // PLASTISOL
        if (INK_RULES.PLASTISOL.additives?.color) BASE_PRESETS.PLASTISOL.color.additives = INK_RULES.PLASTISOL.additives.color;
        if (INK_RULES.PLASTISOL.meshes?.color?.[0]) BASE_PRESETS.PLASTISOL.color.mesh1 = INK_RULES.PLASTISOL.meshes.color[0];
        if (INK_RULES.PLASTISOL.meshes?.color?.[1]) BASE_PRESETS.PLASTISOL.color.mesh2 = INK_RULES.PLASTISOL.meshes.color[1];
        if (INK_RULES.PLASTISOL.meshes?.blocker?.[0]) BASE_PRESETS.PLASTISOL.blocker.meshDark1 = INK_RULES.PLASTISOL.meshes.blocker[0];
        if (INK_RULES.PLASTISOL.meshes?.blocker?.[1]) BASE_PRESETS.PLASTISOL.blocker.meshDark2 = INK_RULES.PLASTISOL.meshes.blocker[1];
        if (INK_RULES.PLASTISOL.meshes?.blocker?.[2]) BASE_PRESETS.PLASTISOL.blocker.meshDark3 = INK_RULES.PLASTISOL.meshes.blocker[2];
        if (INK_RULES.PLASTISOL.whiteBaseCounts?.dark !== undefined) BASE_PRESETS.PLASTISOL.whiteBase.initialDarkCount = INK_RULES.PLASTISOL.whiteBaseCounts.dark;
        if (INK_RULES.PLASTISOL.whiteBaseCounts?.light !== undefined) BASE_PRESETS.PLASTISOL.whiteBase.initialLightCount = INK_RULES.PLASTISOL.whiteBaseCounts.light;
        BASE_PRESETS.PLASTISOL.curing = { temp: INK_RULES.PLASTISOL.temperature, time: INK_RULES.PLASTISOL.time };

        // SILICONE
        if (INK_RULES.SILICONE.additives?.color) BASE_PRESETS.SILICONE.color.additives = INK_RULES.SILICONE.additives.color;
        if (INK_RULES.SILICONE.meshes?.color?.[0]) BASE_PRESETS.SILICONE.color.mesh1 = INK_RULES.SILICONE.meshes.color[0];
        if (INK_RULES.SILICONE.meshes?.color?.[1]) BASE_PRESETS.SILICONE.color.mesh2 = INK_RULES.SILICONE.meshes.color[1];
        if (INK_RULES.SILICONE.whiteBaseCounts?.dark !== undefined) BASE_PRESETS.SILICONE.whiteBase.initialDarkCount = INK_RULES.SILICONE.whiteBaseCounts.dark;
        if (INK_RULES.SILICONE.whiteBaseCounts?.light !== undefined) BASE_PRESETS.SILICONE.whiteBase.initialLightCount = INK_RULES.SILICONE.whiteBaseCounts.light;
        BASE_PRESETS.SILICONE.curing = { temp: INK_RULES.SILICONE.temperature, time: INK_RULES.SILICONE.time };
    }

    async function loadExternalRuleCatalogs() {
        if (typeof fetch !== 'function') return;
        // ... (código existente para cargar catálogos)
    }

    // =====================================================
    // FUNCIONES DE CLASIFICACIÓN
    // =====================================================

    function clasificarTela(colorTela) {
        if (!colorTela) return 'clara';
        const telaLower = colorTela.toLowerCase();
        if (FABRIC_RULES.darkIdentifiers.some((o) => telaLower.includes(o))) return 'oscura';
        if (FABRIC_RULES.lightIdentifiers.some((c) => telaLower.includes(c))) return 'clara';
        return 'clara'; // default
    }

    function clasificarColor(colorName) {
        if (!colorName) return { tipo: 'desconocido', esClaro: false, esOscuro: true };
        const colorLower = colorName.toLowerCase().trim();
        const claros = ['amarillo', 'yellow', 'oro', 'gold', 'naranja', 'orange', 'rosa', 'pink', 'beige', 'crema', 'ivory', 'blanco', 'white', 'limon', 'lemon', 'dorado'];
        const oscuros = ['rojo', 'red', 'azul', 'blue', 'verde', 'green', 'morado', 'purple', 'marron', 'brown', 'negro', 'black', 'gris', 'gray', 'grey', 'navy', 'charcoal', 'maroon', 'crimson', 'italy blue'];
        
        if (claros.some((c) => colorLower.includes(c))) return { tipo: 'claro', esClaro: true, esOscuro: false };
        if (oscuros.some((o) => colorLower.includes(o))) return { tipo: 'oscuro', esClaro: false, esOscuro: true };
        return { tipo: 'desconocido', esClaro: false, esOscuro: true };
    }

    function esColorEspecial(colorName) {
        if (!colorName) return null;
        const normalized = (colorName || '').toLowerCase().trim();
        for (const key in SPECIAL_COLORS) {
            const entry = SPECIAL_COLORS[key];
            if (entry.identificadores.some((id) => normalized.includes(id))) {
                return entry;
            }
        }
        return null;
    }

    function obtenerPreset(customer, inkType) {
        syncPresetsFromInkRules();
        const selectedInk = String(inkType || 'WATER').toUpperCase();
        const preset = BASE_PRESETS[selectedInk] || BASE_PRESETS.WATER;
        const customerText = String(customer || '').toUpperCase();
        
        if (selectedInk === 'PLASTISOL' && (customerText.includes('FANATICS') || customerText.includes('FANATIC'))) {
            return {
                ...preset,
                blocker: { ...preset.blocker, nombre: 'BARRIER CHT' },
                whiteBase: { ...preset.whiteBase, nombre: 'POLY WHITE' }
            };
        }
        return preset;
    }

    // =====================================================
    // ⭐ FUNCIÓN PRINCIPAL - GENERAR SECUENCIA CORREGIDA ⭐
    // =====================================================
    
    function generarSecuencia(params) {
        const {
            customer = '',
            garmentColor = '',
            inkType = 'WATER',
            designColors = []
        } = params;

        console.log(`⚙️ RulesEngine: Generando secuencia para Tela: "${garmentColor}", Tinta: ${inkType}`);

        // --- 1. Clasificaciones ---
        const telaType = clasificarTela(garmentColor); // 'clara' u 'oscura'
        const normalizedInkType = mapInkType(inkType || 'WATER');
        const preset = obtenerPreset(customer, normalizedInkType);
        const inkRule = INK_RULES[normalizedInkType] || INK_RULES.WATER;

        // --- 2. Lista de colores de diseño (únicos) ---
        const uniqueColors = [];
        const seen = new Set();
        designColors.forEach((c) => {
            const key = String(c.val || '').toUpperCase().trim();
            if (key && !seen.has(key)) {
                seen.add(key);
                uniqueColors.push({ val: key, original: c });
            }
        });

        // Clasificar los colores únicos
        const lightColors = [];
        const darkColors = [];
        const specialColorsDetails = [];

        uniqueColors.forEach(color => {
            const especial = esColorEspecial(color.val);
            if (especial) {
                specialColorsDetails.push({
                    val: color.val,
                    mallas: especial.mallas,
                    aditivos: especial.aditivos
                });
            } else {
                const clasificacion = clasificarColor(color.val);
                if (clasificacion.esClaro) {
                    lightColors.push(color.val);
                } else {
                    darkColors.push(color.val);
                }
            }
        });

        console.log(`   Colores claros: ${lightColors.join(', ') || 'ninguno'}`);
        console.log(`   Colores oscuros: ${darkColors.join(', ') || 'ninguno'}`);
        console.log(`   Colores especiales: ${specialColorsDetails.map(c => c.val).join(', ') || 'ninguno'}`);

        // --- 3. Construcción de la Secuencia ---
        const steps = [];

        // --- PASO A: Bloqueadores (solo para telas oscuras) ---
        if (telaType === 'oscura' && inkRule.requiresBlocker !== false) {
            const blockerMeshes = [preset.blocker.meshDark1, preset.blocker.meshDark2, preset.blocker.meshDark3].filter(Boolean);
            blockerMeshes.forEach((mesh) => {
                steps.push({
                    tipo: 'BLOCKER',
                    screenLetter: 'A', // Primer bloqueador
                    nombre: preset.blocker.nombre,
                    mesh: mesh,
                    additives: preset.blocker.additives
                });
            });
        }

        // --- PASO B: Bases Blancas Iniciales ---
        let initialWhiteCount = 0;
        const garmentIsMidnightNavy = String(garmentColor || '').toUpperCase().includes('MIDNIGHT NAVY');
        
        if (normalizedInkType === 'PLASTISOL' && garmentIsMidnightNavy) {
            // Excepción: Midnight Navy no lleva Poly White
            initialWhiteCount = 0;
            console.log('   🚫 Midnight Navy detectado: Sin Poly White inicial.');
        } else {
            initialWhiteCount = telaType === 'oscura' 
                ? (preset.whiteBase.initialDarkCount ?? inkRule.whiteBaseCounts?.dark ?? 1)
                : (preset.whiteBase.initialLightCount ?? inkRule.whiteBaseCounts?.light ?? 2);
        }

        for (let i = 0; i < initialWhiteCount; i++) {
            const mesh = i === 0 ? preset.whiteBase.mesh1 : (preset.whiteBase.mesh2 || preset.whiteBase.mesh1);
            steps.push({
                tipo: 'WHITE_BASE',
                screenLetter: String.fromCharCode(66 + i), // B, C, D...
                nombre: preset.whiteBase.nombre,
                mesh: mesh,
                additives: preset.whiteBase.additives
            });
        }

        // --- PASO C: Blocker en Tela Clara (si aplica) ---
        if (telaType === 'clara' && inkRule.requiresBlocker !== false) {
            steps.push({
                tipo: 'BLOCKER',
                screenLetter: '?', // Se asignará después
                nombre: preset.blocker.nombre,
                mesh: preset.blocker.meshLight1 || '157/??',
                additives: preset.blocker.additives
            });
        }

        // --- PASO D: Procesar cada COLOR de diseño ---
        let colorCounter = 0;
        const allDesignColorsToProcess = [...lightColors, ...darkColors, ...specialColorsDetails];

        allDesignColorsToProcess.forEach((colorItem) => {
            let mallasParaEsteColor = [];
            let aditivosParaEsteColor = preset.color.additives;

            if (typeof colorItem === 'string') { // Color normal
                mallasParaEsteColor = [preset.color.mesh1, preset.color.mesh2].filter(Boolean);
                if (mallasParaEsteColor.length === 0) mallasParaEsteColor = ['157/48', '198/40'];
            } else { // Color especial
                mallasParaEsteColor = colorItem.mallas;
                aditivosParaEsteColor = colorItem.aditivos;
            }

            mallasParaEsteColor.forEach((mesh, meshIndex) => {
                const screenLetterBase = String.fromCharCode(70 + colorCounter); // F, G, H...
                const screenLetter = meshIndex === 0 ? screenLetterBase : `${screenLetterBase}${meshIndex + 1}`;
                const nombre = typeof colorItem === 'string' 
                    ? `${colorItem}${meshIndex > 0 ? ` (${meshIndex + 1})` : ''}`
                    : `${colorItem.val}${meshIndex > 0 ? ` (${meshIndex + 1})` : ''}`;

                steps.push({
                    tipo: 'COLOR',
                    screenLetter: screenLetter,
                    nombre: nombre,
                    mesh: mesh,
                    additives: aditivosParaEsteColor
                });
            });

            colorCounter++;
        });

        // --- 4. Asignar Letras de Pantalla Finales y Añadir FLASH/COOL ---
        const finalSequence = [];
        let screenLetterCode = 65; // 'A'

        steps.forEach((step, index) => {
            // Asignar letra de pantalla
            if (!step.screenLetter || step.screenLetter === '?') {
                step.screenLetter = String.fromCharCode(screenLetterCode);
                screenLetterCode++;
            } else {
                // Si ya tiene letra (como 'A' para blockers), actualizar el contador
                const currentCode = step.screenLetter.charCodeAt(0);
                if (currentCode >= screenLetterCode) {
                    screenLetterCode = currentCode + 1;
                }
            }
            
            finalSequence.push(step);

            // Añadir FLASH y COOL después de cada paso de tinta, excepto el último
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

        console.log(`✅ Secuencia generada con ${finalSequence.length} pasos totales.`);
        return finalSequence;
    }

    function getCuringConditions(inkType) {
        syncPresetsFromInkRules();
        const selectedInk = String(inkType || 'WATER').toUpperCase();
        return (BASE_PRESETS[selectedInk] || BASE_PRESETS.WATER).curing;
    }

    // =====================================================
    // EXPORTAR API PÚBLICA
    // =====================================================
    
    return {
        generarSecuencia,
        getCuringConditions,
        clasificarTela,
        clasificarColor,
        esColorEspecial,
        loadExternalRuleCatalogs
    };

})(); // <-- ¡IMPORTANTE! Esta es la llave de cierre que faltaba

// =====================================================
// CARGA AUTOMÁTICA AL INICIAR
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
    if (window.RulesEngine && window.RulesEngine.loadExternalRuleCatalogs) {
        await window.RulesEngine.loadExternalRuleCatalogs();
    }
    console.log('✅ RulesEngine actualizado cargado');
});
