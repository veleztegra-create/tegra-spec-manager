// rules-engine.js - Motor de reglas centralizado
// Mantiene separación: placement.colors (solo tintas) vs placement.sequence (incluye FLASH/COOL)

window.RulesEngine = (function () {
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

    const FABRIC_RULES = {
        darkIdentifiers: ['negro', 'black', 'navy', 'azul marino', 'charcoal', 'carbon', 'maroon', 'granate', 'dark', 'oscuro', 'forest', 'verde oscuro', 'hunter', 'midnight'],
        lightIdentifiers: ['blanco', 'white', 'natural', 'crema', 'ivory', 'beige', 'claro', 'light', 'gris claro', 'light gray']
    };

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

    const EXTERNAL_RULE_FILES = [
        'rules/telas/catalogo_telas_nfl.json',
        'rules/telas/ncaa_telas.json',
        'rules/tintas/catalogo_tintas_nfl.json.json',
        'rules/tintas/ncaa_tintas.json.json',
        'rules/tintas/waterbase.json',
        'rules/tintas/plastisol.json',
        'rules/tintas/silicone.json'
    ];

    const BASE_PRESETS = {
        WATER: {
            inkType: 'WATER',
            blocker: { nombre: 'BLOCKER CHT', additives: 'N/A', meshDark1: '122/55', meshDark2: '157/48', meshDark3: '', meshLight1: '157' },
            whiteBase: { nombre: 'AQUAFLEX V2 WHITE', additives: '3% CL 500', mesh1: '198/40', mesh2: '122', initialDarkCount: 1, initialLightCount: 2 },
            whiteBaseWithCatalyst: { mesh: '122', additives: '3% CL 500' },
            color: { additives: '3% CL 500 · 5% ecofix XL', mesh1: '157/48', mesh2: '198/40' },
            curing: { temp: '320 °F', time: '1:40 min' }
        },
        PLASTISOL: {
            inkType: 'PLASTISOL',
            blocker: { nombre: 'BARRIER BASE', additives: 'N/A', meshDark1: '110/64', meshDark2: '156/64', meshDark3: '156/64', meshLight1: '110/64' },
            whiteBase: { nombre: 'TXT POLY WHITE', additives: 'N/A', mesh1: '156/64', mesh2: '110/64', initialDarkCount: 1, initialLightCount: 0 },
            whiteBaseWithCatalyst: { mesh: '110/64', additives: '' },
            color: { additives: '1% catalyst', mesh1: '156/64', mesh2: '156/64' },
            curing: { temp: '320 °F', time: '1:00 min' }
        },
        SILICONE: {
            inkType: 'SILICONE',
            blocker: { nombre: 'BLOCKER LIBRA', additives: '', meshDark1: '110/64', meshDark2: '110/64', meshDark3: '110/64', meshLight1: '110/64' },
            whiteBase: { nombre: 'BASE WHITE LIBRA', additives: '', mesh1: '122/55', mesh2: '122/55', initialDarkCount: 1, initialLightCount: 1 },
            whiteBaseWithCatalyst: { mesh: '122/55', additives: '' },
            color: { additives: '3% cat · 2% ret', mesh1: '157/48', mesh2: '157/48' },
            curing: { temp: '320 °F', time: '1:40 min' }
        }
    };

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
        BASE_PRESETS.WATER.blocker.meshDark1 = INK_RULES.WATER.meshes.blocker[0] || BASE_PRESETS.WATER.blocker.meshDark1;
        BASE_PRESETS.WATER.blocker.meshDark2 = INK_RULES.WATER.meshes.blocker[1] || BASE_PRESETS.WATER.blocker.meshDark2;
        BASE_PRESETS.WATER.blocker.meshDark3 = INK_RULES.WATER.meshes.blocker[2] || BASE_PRESETS.WATER.blocker.meshDark3;
        BASE_PRESETS.WATER.color.additives = INK_RULES.WATER.additives.color;
        BASE_PRESETS.WATER.color.mesh1 = INK_RULES.WATER.meshes.color[0] || BASE_PRESETS.WATER.color.mesh1;
        BASE_PRESETS.WATER.color.mesh2 = INK_RULES.WATER.meshes.color[1] || BASE_PRESETS.WATER.color.mesh2;
        BASE_PRESETS.WATER.whiteBase.initialDarkCount = INK_RULES.WATER.whiteBaseCounts?.dark ?? BASE_PRESETS.WATER.whiteBase.initialDarkCount;
        BASE_PRESETS.WATER.whiteBase.initialLightCount = INK_RULES.WATER.whiteBaseCounts?.light ?? BASE_PRESETS.WATER.whiteBase.initialLightCount;
        BASE_PRESETS.WATER.curing = { temp: INK_RULES.WATER.temperature, time: INK_RULES.WATER.time };

        BASE_PRESETS.PLASTISOL.color.additives = INK_RULES.PLASTISOL.additives.color;
        BASE_PRESETS.PLASTISOL.color.mesh1 = INK_RULES.PLASTISOL.meshes.color[0] || BASE_PRESETS.PLASTISOL.color.mesh1;
        BASE_PRESETS.PLASTISOL.color.mesh2 = INK_RULES.PLASTISOL.meshes.color[1] || BASE_PRESETS.PLASTISOL.color.mesh2;
        BASE_PRESETS.PLASTISOL.blocker.meshDark1 = INK_RULES.PLASTISOL.meshes.blocker[0] || BASE_PRESETS.PLASTISOL.blocker.meshDark1;
        BASE_PRESETS.PLASTISOL.blocker.meshDark2 = INK_RULES.PLASTISOL.meshes.blocker[1] || BASE_PRESETS.PLASTISOL.blocker.meshDark2;
        BASE_PRESETS.PLASTISOL.blocker.meshDark3 = INK_RULES.PLASTISOL.meshes.blocker[2] || BASE_PRESETS.PLASTISOL.blocker.meshDark3;
        BASE_PRESETS.PLASTISOL.whiteBase.initialDarkCount = INK_RULES.PLASTISOL.whiteBaseCounts?.dark ?? BASE_PRESETS.PLASTISOL.whiteBase.initialDarkCount;
        BASE_PRESETS.PLASTISOL.whiteBase.initialLightCount = INK_RULES.PLASTISOL.whiteBaseCounts?.light ?? BASE_PRESETS.PLASTISOL.whiteBase.initialLightCount;
        BASE_PRESETS.PLASTISOL.curing = { temp: INK_RULES.PLASTISOL.temperature, time: INK_RULES.PLASTISOL.time };

        BASE_PRESETS.SILICONE.color.additives = INK_RULES.SILICONE.additives.color;
        BASE_PRESETS.SILICONE.color.mesh1 = INK_RULES.SILICONE.meshes.color[0] || BASE_PRESETS.SILICONE.color.mesh1;
        BASE_PRESETS.SILICONE.color.mesh2 = INK_RULES.SILICONE.meshes.color[1] || BASE_PRESETS.SILICONE.color.mesh2;
        BASE_PRESETS.SILICONE.whiteBase.initialDarkCount = INK_RULES.SILICONE.whiteBaseCounts?.dark ?? BASE_PRESETS.SILICONE.whiteBase.initialDarkCount;
        BASE_PRESETS.SILICONE.whiteBase.initialLightCount = INK_RULES.SILICONE.whiteBaseCounts?.light ?? BASE_PRESETS.SILICONE.whiteBase.initialLightCount;
        BASE_PRESETS.SILICONE.curing = { temp: INK_RULES.SILICONE.temperature, time: INK_RULES.SILICONE.time };
    }

    async function loadExternalRuleCatalogs() {
        if (typeof fetch !== 'function') return;
        for (const file of EXTERNAL_RULE_FILES) {
            try {
                const response = await fetch(file, { cache: 'no-store' });
                if (!response.ok) continue;
                const catalog = await response.json();

                if (file.includes('/telas/')) {
                    mergeUnique(FABRIC_RULES.darkIdentifiers, catalog.darkIdentifiers || catalog.identificadores_oscuros || catalog.oscuras);
                    mergeUnique(FABRIC_RULES.lightIdentifiers, catalog.lightIdentifiers || catalog.identificadores_claros || catalog.claras);
                }

                if (file.includes('/tintas/')) {
                    const inkRulesPatch = catalog.inkRules || catalog.tintas || parseGeneralInkCatalog(catalog) || {};
                    ['WATER', 'PLASTISOL', 'SILICONE'].forEach((ink) => {
                        if (inkRulesPatch[ink]) {
                            INK_RULES[ink] = mergeInkRuleEntry(INK_RULES[ink], inkRulesPatch[ink]);
                        }
                    });
                }
            } catch (error) {
                console.warn('No se pudo cargar catálogo de reglas:', file, error);
            }
        }
        syncPresetsFromInkRules();
    }

    function clasificarTela(colorTela) {
        if (!colorTela) return 'clara';
        const telaLower = colorTela.toLowerCase();
        if (FABRIC_RULES.darkIdentifiers.some((o) => telaLower.includes(o))) return 'oscura';
        if (FABRIC_RULES.lightIdentifiers.some((c) => telaLower.includes(c))) return 'clara';
        return 'clara';
    }

    function clasificarColor(colorName) {
        if (!colorName) return { tipo: 'desconocido', esClaro: false, esOscuro: true };
        const colorLower = colorName.toLowerCase().trim();
        const claros = ['amarillo', 'yellow', 'oro', 'gold', 'naranja', 'orange', 'rosa', 'pink', 'beige', 'crema', 'ivory', 'blanco', 'white', 'limon', 'lemon', 'dorado'];
        const oscuros = ['rojo', 'red', 'azul', 'blue', 'verde', 'green', 'morado', 'purple', 'marron', 'brown', 'negro', 'black', 'gris', 'gray', 'grey', 'navy', 'charcoal', 'maroon', 'crimson'];
        if (claros.some((c) => colorLower.includes(c))) return { tipo: 'claro', esClaro: true, esOscuro: false };
        if (oscuros.some((o) => colorLower.includes(o))) return { tipo: 'oscuro', esClaro: false, esOscuro: true };
        return { tipo: 'desconocido', esClaro: false, esOscuro: true };
    }

    function esColorEspecial(colorName) {
        const normalized = (colorName || '').toLowerCase().trim();
        return Object.values(SPECIAL_COLORS).find((entry) => entry.identificadores.some((id) => normalized.includes(id))) || null;
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

    function generateCoreSteps({ customer, garmentColor, inkType = 'WATER', designColors = [] }) {
        const telaType = clasificarTela(garmentColor);
        const normalizedInkType = mapInkType(inkType || 'WATER');
        const preset = obtenerPreset(customer, normalizedInkType);
        const steps = [];
        const inkRule = INK_RULES[normalizedInkType] || INK_RULES.WATER;

        if (inkRule.requiresBlocker !== false && telaType === 'oscura') {
            const blockerMeshes = [preset.blocker.meshDark1, preset.blocker.meshDark2, preset.blocker.meshDark3].filter(Boolean);
            blockerMeshes.forEach((mesh) => {
                steps.push({ tipo: 'BLOCKER', screenLetter: 'A', nombre: preset.blocker.nombre, mesh, additives: preset.blocker.additives });
            });
        } else if (inkRule.requiresBlocker !== false) {
            steps.push({ tipo: 'BLOCKER', screenLetter: 'A', nombre: preset.blocker.nombre, mesh: preset.blocker.meshLight1 || '157', additives: preset.blocker.additives });
        }

        const garmentIsMidnightNavy = String(garmentColor || '').toUpperCase().includes('MIDNIGHT NAVY');
        const skipInitialWhite = normalizedInkType === 'PLASTISOL' && garmentIsMidnightNavy;
        if (!skipInitialWhite) {
            const initialWhiteCount = telaType === 'oscura'
                ? (preset.whiteBase.initialDarkCount ?? 1)
                : (preset.whiteBase.initialLightCount ?? 2);

            for (let i = 0; i < initialWhiteCount; i++) {
                const mesh = i === 0 ? (preset.whiteBase.mesh1 || '157') : (preset.whiteBase.mesh2 || preset.whiteBaseWithCatalyst.mesh || preset.whiteBase.mesh1 || '157');
                const additives = i === 0 ? preset.whiteBase.additives : (preset.whiteBaseWithCatalyst.additives || preset.whiteBase.additives);
                steps.push({ tipo: 'WHITE_BASE', screenLetter: 'B', nombre: preset.whiteBase.nombre, mesh, additives });
            }
        }

        const uniqueColors = [];
        const seen = new Set();
        designColors.forEach((c) => {
            const key = String(c.val || '').toUpperCase().trim();
            if (key && !seen.has(key)) {
                seen.add(key);
                uniqueColors.push(c);
            }
        });

        let numeroColor = 1;
        uniqueColors.forEach((color) => {
            const especial = esColorEspecial(color.val);
            if (especial) {
                especial.mallas.forEach((mesh, index) => {
                    steps.push({ tipo: 'COLOR', screenLetter: String(numeroColor), nombre: color.val + (index ? ` (${index + 1})` : ''), mesh, additives: especial.aditivos });
                });
            } else {
                const darkFabric = telaType === 'oscura';
                const primaryMesh = darkFabric ? (preset.color.mesh2 || preset.color.mesh1 || '198') : (preset.color.mesh1 || '157');
                const secondaryMesh = darkFabric ? (preset.color.mesh1 || '') : (preset.color.mesh2 || '');
                steps.push({ tipo: 'COLOR', screenLetter: String(numeroColor), nombre: color.val, mesh: primaryMesh, additives: preset.color.additives });
                if (secondaryMesh) {
                    steps.push({ tipo: 'COLOR', screenLetter: String(numeroColor), nombre: `${color.val} (2)`, mesh: secondaryMesh, additives: preset.color.additives });
                }
            }
            numeroColor += 1;
        });

        return steps;
    }

    // =====================================================
// rules-engine.js - FUNCIÓN CORREGIDA
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

    // --- 3. Construcción de la Secuencia (PASO a PASO) ---
    const steps = [];

    // --- PASO A: Bloqueadores ---
    // Solo para telas oscuras y si la tinta lo requiere
    if (telaType === 'oscura' && inkRule.requiresBlocker !== false) {
        const blockerMeshes = [preset.blocker.meshDark1, preset.blocker.meshDark2, preset.blocker.meshDark3].filter(Boolean);
        blockerMeshes.forEach((mesh, index) => {
            steps.push({
                tipo: 'BLOCKER',
                screenLetter: 'A', // Primera letra para el primer blocker
                nombre: preset.blocker.nombre,
                mesh: mesh,
                additives: preset.blocker.additives
            });
        });
    } else if (telaType === 'clara' && inkRule.requiresBlocker !== false) {
        // En tela clara, a veces va un blocker después de las bases.
        // Lo añadiremos después de las bases blancas.
    }

    // --- PASO B: Bases Blancas Iniciales ---
    // Determinar cuántas bases blancas van al inicio
    let initialWhiteCount = 0;
    if (normalizedInkType === 'PLASTISOL') {
        // Regla especial para GFS/PLASTISOL en Midnight Navy
        const garmentIsMidnightNavy = String(garmentColor || '').toUpperCase().includes('MIDNIGHT NAVY');
        if (!garmentIsMidnightNavy) {
            initialWhiteCount = telaType === 'oscura' ? preset.whiteBase.initialDarkCount : preset.whiteBase.initialLightCount;
        } else {
            console.log('   🚫 Midnight Navy detectado: Sin Poly White inicial.');
        }
    } else {
        // WATERBASE y SILICONE
        initialWhiteCount = telaType === 'oscura' ? inkRule.whiteBaseCounts?.dark || 1 : inkRule.whiteBaseCounts?.light || 2;
    }

    for (let i = 0; i < initialWhiteCount; i++) {
        // La primera base a veces usa una malla diferente (ej. 110), las siguientes otra (ej. 122)
        const mesh = i === 0 ? (preset.whiteBase.mesh1 || '110/??') : (preset.whiteBase.mesh2 || preset.whiteBase.mesh1 || '122/??');
        // Los aditivos a veces solo van en la última base inicial o en todas.
        // Por simplicidad, usamos los aditivos del preset, pero podrías refinarlo.
        steps.push({
            tipo: 'WHITE_BASE',
            screenLetter: String.fromCharCode(66 + i), // B, C, D...
            nombre: preset.whiteBase.nombre,
            mesh: mesh,
            additives: preset.whiteBase.additives // Asumimos que todas llevan aditivos si están definidos
        });
    }

    // --- PASO C: Blocker en Tela Clara (si aplica) ---
    if (telaType === 'clara' && inkRule.requiresBlocker !== false) {
        // Añadir el blocker después de las bases blancas en tela clara
        steps.push({
            tipo: 'BLOCKER',
            screenLetter: '?', // Asignar letra después
            nombre: preset.blocker.nombre,
            mesh: preset.blocker.meshLight1 || '157/??',
            additives: preset.blocker.additives
        });
    }

    // --- PASO D: Procesar cada COLOR de diseño ---
    let colorCounter = 0;
    const allDesignColorsToProcess = [...lightColors, ...darkColors, ...specialColorsDetails];

    allDesignColorsToProcess.forEach((colorItem, index) => {
        // Determinar si el color es especial o no para saber sus mallas
        let mallasParaEsteColor = [];
        let aditivosParaEsteColor = preset.color.additives;
        let esEspecial = false;

        if (colorItem.val) { // Es un color normal (light o dark)
            const colorValue = colorItem;
            // Decidir sobre qué superficie va
            const esClaro = lightColors.includes(colorValue);
            // La regla: "Colores de tinta claros sobre AquaFlex" y "Colores oscuros sobre Blocker"
            // Asumimos que la base ya está puesta. Para colores claros en tela oscura, a veces necesitan una base blanca extra.
            // Por simplicidad, asumimos que la preparación ya está hecha.

            // Mallas para color normal: Dependen de si es claro u oscuro? En tus reglas, para ambos son 157 y 198.
            mallasParaEsteColor = [preset.color.mesh1, preset.color.mesh2].filter(Boolean);
            if (mallasParaEsteColor.length === 0) mallasParaEsteColor = ['157/48', '198/40']; // fallback
            aditivosParaEsteColor = preset.color.additives;

        } else { // Es un color especial
            esEspecial = true;
            mallasParaEsteColor = colorItem.mallas;
            aditivosParaEsteColor = colorItem.aditivos;
        }

        // Añadir las pantallas de este color
        mallasParaEsteColor.forEach((mesh, meshIndex) => {
            const screenLetterBase = String.fromCharCode(70 + colorCounter); // F, G, H...
            const screenLetter = meshIndex === 0 ? screenLetterBase : `${screenLetterBase}${meshIndex + 1}`;
            steps.push({
                tipo: 'COLOR',
                screenLetter: screenLetter,
                nombre: colorItem.val ? `${colorItem.val}${meshIndex > 0 ? ` (${meshIndex + 1})` : ''}` : `${colorItem.val}`, // Usar el val si es string
                mesh: mesh,
                additives: aditivosParaEsteColor
            });
        });

        colorCounter++;
    });

    // --- 4. Asignar Letras de Pantalla Finales y Añadir FLASH/COOL ---
    const finalSequence = [];
    let screenLetterCode = 65; // Empezar con 'A'

    steps.forEach((step, index) => {
        // Asignar letra de pantalla si es un paso de tinta (no FLASH/COOL aún)
        if (step.tipo !== 'FLASH' && step.tipo !== 'COOL') {
            // Si la letra ya está definida (como 'A' para blockers), la usamos, si no, asignamos la siguiente.
            if (!step.screenLetter || step.screenLetter === '?') {
                step.screenLetter = String.fromCharCode(screenLetterCode);
                screenLetterCode++;
            } else {
                // Si ya tiene letra, aseguramos que el contador avance más allá de ella.
                // Esto es un poco complejo, simplificamos: si la letra es 'A', el código debe ser al menos 66.
                const currentCode = step.screenLetter.charCodeAt(0);
                if (currentCode >= screenLetterCode) {
                    screenLetterCode = currentCode + 1;
                }
            }
            finalSequence.push(step);

            // Añadir FLASH y COOL después de cada paso de tinta, excepto el último
            if (index < steps.length - 1) {
                finalSequence.push({ tipo: 'FLASH', screenLetter: '', nombre: 'FLASH', mesh: '-', additives: '' });
                finalSequence.push({ tipo: 'COOL', screenLetter: '', nombre: 'COOL', mesh: '-', additives: '' });
            }
        } else {
            finalSequence.push(step);
        }
    });

    console.log(`✅ Secuencia generada con ${finalSequence.length} pasos totales.`);
    return finalSequence;
}

// Asegúrate de que la función sea accesible desde el objeto exportado
window.RulesEngine = {
    // ... otras funciones
    generarSecuencia,
    getCuringConditions,
    clasificarTela,
    clasificarColor,
    esColorEspecial,
    loadExternalRuleCatalogs
};
