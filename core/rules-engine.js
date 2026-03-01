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
        'rules/tintas/ncaa_tintas.json.json'
    ];

    const BASE_PRESETS = {
        WATER: {
            inkType: 'WATER',
            blocker: { nombre: 'BLOCKER CHT', additives: 'N/A', meshDark1: '110', meshDark2: '122', meshDark3: '157', meshLight1: '157' },
            whiteBase: { nombre: 'AquaFlex V2', additives: '3% CL 500', mesh1: '198/40', mesh2: '122' },
            whiteBaseWithCatalyst: { mesh: '122', additives: '3% CL 500' },
            color: { additives: '3% CL 500 · 5% ecofix XL', mesh1: '157/48', mesh2: '198/40' },
            curing: { temp: '320 °F', time: '1:40 min' }
        },
        PLASTISOL: {
            inkType: 'PLASTISOL',
            blocker: { nombre: 'BARRIER BASE', additives: 'N/A', meshDark1: '110/64', meshDark2: '156/64', meshDark3: '156/64', meshLight1: '110/64' },
            whiteBase: { nombre: 'Poly White', additives: 'N/A', mesh1: '156/64', mesh2: '110/64' },
            whiteBaseWithCatalyst: { mesh: '110/64', additives: '' },
            color: { additives: '1% catalyst', mesh1: '156/64', mesh2: '156/64' },
            curing: { temp: '320 °F', time: '1:00 min' }
        },
        SILICONE: {
            inkType: 'SILICONE',
            blocker: { nombre: 'Bloquer Libra', additives: '', meshDark1: '110/64', meshDark2: '110/64', meshDark3: '110/64', meshLight1: '110/64' },
            whiteBase: { nombre: 'BASE WHITE LIBRA', additives: '', mesh1: '122/55', mesh2: '122/55' },
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
        if (patch.meshes) next.meshes = { ...next.meshes, ...patch.meshes };
        if (patch.additives) next.additives = { ...next.additives, ...patch.additives };
        return next;
    }

    function syncPresetsFromInkRules() {
        BASE_PRESETS.WATER.color.additives = INK_RULES.WATER.additives.color;
        BASE_PRESETS.WATER.color.mesh1 = INK_RULES.WATER.meshes.color[0] || BASE_PRESETS.WATER.color.mesh1;
        BASE_PRESETS.WATER.color.mesh2 = INK_RULES.WATER.meshes.color[1] || BASE_PRESETS.WATER.color.mesh2;
        BASE_PRESETS.WATER.curing = { temp: INK_RULES.WATER.temperature, time: INK_RULES.WATER.time };

        BASE_PRESETS.PLASTISOL.color.additives = INK_RULES.PLASTISOL.additives.color;
        BASE_PRESETS.PLASTISOL.color.mesh1 = INK_RULES.PLASTISOL.meshes.color[0] || BASE_PRESETS.PLASTISOL.color.mesh1;
        BASE_PRESETS.PLASTISOL.color.mesh2 = INK_RULES.PLASTISOL.meshes.color[1] || BASE_PRESETS.PLASTISOL.color.mesh2;
        BASE_PRESETS.PLASTISOL.blocker.meshDark1 = INK_RULES.PLASTISOL.meshes.blocker[0] || BASE_PRESETS.PLASTISOL.blocker.meshDark1;
        BASE_PRESETS.PLASTISOL.blocker.meshDark2 = INK_RULES.PLASTISOL.meshes.blocker[1] || BASE_PRESETS.PLASTISOL.blocker.meshDark2;
        BASE_PRESETS.PLASTISOL.blocker.meshDark3 = INK_RULES.PLASTISOL.meshes.blocker[2] || BASE_PRESETS.PLASTISOL.blocker.meshDark3;
        BASE_PRESETS.PLASTISOL.curing = { temp: INK_RULES.PLASTISOL.temperature, time: INK_RULES.PLASTISOL.time };

        BASE_PRESETS.SILICONE.color.additives = INK_RULES.SILICONE.additives.color;
        BASE_PRESETS.SILICONE.color.mesh1 = INK_RULES.SILICONE.meshes.color[0] || BASE_PRESETS.SILICONE.color.mesh1;
        BASE_PRESETS.SILICONE.color.mesh2 = INK_RULES.SILICONE.meshes.color[1] || BASE_PRESETS.SILICONE.color.mesh2;
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
                    const inkRulesPatch = catalog.inkRules || catalog.tintas || {};
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
                whiteBase: { ...preset.whiteBase, nombre: 'AQUAFLEX V2 WHITE' }
            };
        }
        return preset;
    }

    function generateCoreSteps({ customer, garmentColor, inkType = 'WATER', designColors = [] }) {
        const telaType = clasificarTela(garmentColor);
        const preset = obtenerPreset(customer, inkType);
        const steps = [];

        if (telaType === 'oscura') {
            steps.push({ tipo: 'BLOCKER', screenLetter: 'A', nombre: preset.blocker.nombre, mesh: preset.blocker.meshDark1 || '110', additives: preset.blocker.additives });
            steps.push({ tipo: 'BLOCKER', screenLetter: 'A', nombre: preset.blocker.nombre, mesh: preset.blocker.meshDark2 || '122', additives: preset.blocker.additives });
            steps.push({ tipo: 'BLOCKER', screenLetter: 'A', nombre: preset.blocker.nombre, mesh: preset.blocker.meshDark3 || '157', additives: preset.blocker.additives });
        } else {
            steps.push({ tipo: 'BLOCKER', screenLetter: 'A', nombre: preset.blocker.nombre, mesh: preset.blocker.meshLight1 || '157', additives: preset.blocker.additives });
        }

        const garmentIsMidnightNavy = String(garmentColor || '').toUpperCase().includes('MIDNIGHT NAVY');
        const skipInitialWhite = String(inkType || '').toUpperCase() === 'PLASTISOL' && garmentIsMidnightNavy;
        if (!skipInitialWhite) {
            steps.push({ tipo: 'WHITE_BASE', screenLetter: 'B', nombre: preset.whiteBase.nombre, mesh: preset.whiteBase.mesh1 || '157', additives: preset.whiteBase.additives });
            steps.push({ tipo: 'WHITE_BASE', screenLetter: 'B', nombre: preset.whiteBase.nombre, mesh: preset.whiteBaseWithCatalyst.mesh, additives: preset.whiteBaseWithCatalyst.additives });
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
                const malla1 = darkFabric ? (preset.color.mesh2 || '198') : (preset.color.mesh1 || '157');
                const malla2 = darkFabric ? (preset.color.mesh1 || '157') : (preset.color.mesh2 || '198');
                steps.push({ tipo: 'COLOR', screenLetter: String(numeroColor), nombre: color.val, mesh: malla1, additives: preset.color.additives });
                steps.push({ tipo: 'COLOR', screenLetter: String(numeroColor), nombre: `${color.val} (2)`, mesh: malla2, additives: preset.color.additives });
            }
            numeroColor += 1;
        });

        return steps;
    }

    function generarSecuencia(params) {
        const core = generateCoreSteps(params);
        const sequence = [];
        core.forEach((step, index) => {
            sequence.push(step);
            if (index < core.length - 1) {
                sequence.push({ tipo: 'FLASH', screenLetter: '', nombre: 'FLASH', mesh: '-', additives: '' });
                sequence.push({ tipo: 'COOL', screenLetter: '', nombre: 'COOL', mesh: '-', additives: '' });
            }
        });
        return sequence;
    }

    function getCuringConditions(inkType) {
        syncPresetsFromInkRules();
        const selectedInk = String(inkType || 'WATER').toUpperCase();
        return (BASE_PRESETS[selectedInk] || BASE_PRESETS.WATER).curing;
    }

    return {
        generarSecuencia,
        getCuringConditions,
        clasificarTela,
        clasificarColor,
        esColorEspecial,
        loadExternalRuleCatalogs
    };
})();

document.addEventListener('DOMContentLoaded', async () => {
    if (window.RulesEngine && window.RulesEngine.loadExternalRuleCatalogs) {
        await window.RulesEngine.loadExternalRuleCatalogs();
    }
    console.log('✅ RulesEngine actualizado cargado');
});
