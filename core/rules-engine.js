// =====================================================
// rules-engine.js - Motor de reglas TEGRA
// Versión: 2.0 - Con clasificación de colores y números
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
    // PRESETS BASE
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
        if (!target || !values) return;
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
        // Aquí iría el código para cargar JSONs externos
    }

    // =====================================================
    // FUNCIONES DE CLASIFICACIÓN
    // =====================================================

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
    // FUNCIÓN PRINCIPAL - GENERAR SECUENCIA
    // =====================================================
    
    function generarSecuencia(params) {
        const {
            customer = '',
            garmentColor = '',
            inkType = 'WATER',
            designColors = []
        } = params;

        console.log(`⚙️ RulesEngine: Generando secuencia para Tela: "${garmentColor}", Tinta: ${inkType}`);

        // ===== CLASIFICACIÓN DE TELA =====
        let fabricInfo;
        if (window.ColorDatabase) {
            fabricInfo = window.ColorDatabase.classifyFabric(garmentColor);
        } else {
            const telaLower = garmentColor.toLowerCase();
            const esOscura = FABRIC_RULES.darkIdentifiers.some(o => telaLower.includes(o));
            fabricInfo = {
                type: esOscura ? 'dark' : 'light',
                needsBlocker: esOscura,
                blockerCount: esOscura ? 3 : 0,
                needsWhiteBase: true
            };
        }
        
        const telaType = fabricInfo.type;
        const needsGarmentWhiteBase = fabricInfo.needsWhiteBase !== false;
        
        console.log(`   📊 Tela clasificada como: ${telaType}`);
        
        // ===== CLASIFICACIÓN DE COLORES =====
        const classifiedColors = {
            white: [],      // Tintas blancas
            light: [],      // Colores claros
            medium: [],     // Colores medios
            dark: [],       // Colores oscuros
            special: [],    // Colores especiales (3 pantallas)
            metallic: []    // Metálicos
        };
        
        designColors.forEach(color => {
            const colorVal = String(color.val || '').toUpperCase().trim();
            if (!colorVal) return;
            
            if (window.ColorDatabase) {
                const inkInfo = window.ColorDatabase.classifyInk(colorVal);
                
                if (inkInfo.type === 'special') {
                    classifiedColors.special.push({ ...color, inkInfo });
                } else if (inkInfo.type === 'metallic') {
                    classifiedColors.metallic.push({ ...color, inkInfo });
                } else if (inkInfo.type === 'opaque' || colorVal.includes('WHITE')) {
                    classifiedColors.white.push({ ...color, inkInfo });
                } else if (inkInfo.type === 'light') {
                    classifiedColors.light.push({ ...color, inkInfo });
                } else if (inkInfo.type === 'dark') {
                    classifiedColors.dark.push({ ...color, inkInfo });
                } else {
                    classifiedColors.medium.push({ ...color, inkInfo });
                }
            } else {
                // Fallback manual
                if (colorVal.includes('WHITE')) {
                    classifiedColors.white.push(color);
                } else if (colorVal.match(/77C|78H|761|UNIVERSITY GOLD|871C|877C/i)) {
                    classifiedColors.special.push(color);
                } else if (colorVal.includes('YELLOW') || colorVal.includes('GOLD') || 
                           colorVal.includes('ORANGE') || colorVal.includes('PINK')) {
                    classifiedColors.light.push(color);
                } else if (colorVal.includes('BLACK') || colorVal.includes('NAVY') || 
                           colorVal.includes('MAROON') || colorVal.includes('BROWN')) {
                    classifiedColors.dark.push(color);
                } else {
                    classifiedColors.medium.push(color);
                }
            }
        });
        
        console.log(`   🎨 Blancos: ${classifiedColors.white.length}`);
        console.log(`   🎨 Claros: ${classifiedColors.light.length}`);
        console.log(`   🎨 Especiales: ${classifiedColors.special.length}`);
        console.log(`   🎨 Metálicos: ${classifiedColors.metallic.length}`);
        console.log(`   🎨 Medios/Oscuros: ${classifiedColors.medium.length + classifiedColors.dark.length}`);
        
        // ===== CONSTRUCCIÓN DE SECUENCIA =====
        const steps = [];
        let nextLetter = 65; // 'A' para procesos (Blocker, White Base)
        let nextNumber = 1;  // 1, 2, 3... para colores (tintas)
        
        // PASO 1: BLOQUEADORES (usan LETRAS)
        if (fabricInfo.needsBlocker) {
            const blockerCount = fabricInfo.blockerCount || 3;
            const blockerName = inkType === 'PLASTISOL' ? 'BARRIER BASE' : 'BLOCKER CHT';
            const blockerMeshes = inkType === 'PLASTISOL' 
                ? ['110/64', '156/64', '156/64']
                : ['122/55', '157/48', ''];
            
            for (let i = 0; i < blockerCount; i++) {
                if (!blockerMeshes[i]) continue;
                steps.push({
                    tipo: 'BLOCKER',
                    screenLetter: String.fromCharCode(nextLetter++),
                    nombre: blockerName,
                    mesh: blockerMeshes[i],
                    additives: 'N/A'
                });
            }
        }
        
        // PASO 2: BASE BLANCA DE PRENDA (usa LETRAS)
        if (needsGarmentWhiteBase) {
            const hasLightOrSpecial = classifiedColors.light.length > 0 || 
                                      classifiedColors.special.length > 0 ||
                                      classifiedColors.metallic.length > 0;
            
            if (telaType === 'dark' && hasLightOrSpecial) {
                steps.push({
                    tipo: 'WHITE_BASE',
                    screenLetter: String.fromCharCode(nextLetter++),
                    nombre: inkType === 'PLASTISOL' ? 'TXT POLY WHITE' : 'AQUAFLEX V2',
                    mesh: inkType === 'PLASTISOL' ? '156/64' : '122/??',
                    additives: inkType === 'PLASTISOL' ? '' : '3% CL 500'
                });
            }
        }
        
        // PASO 3: PROCESAR CADA COLOR (usan NÚMEROS)
        
        // 3.1 Blancos
        classifiedColors.white.forEach(ink => {
            // Base blanca para este blanco (usa LETRA)
            steps.push({
                tipo: 'WHITE_BASE',
                screenLetter: String.fromCharCode(nextLetter++),
                nombre: inkType === 'PLASTISOL' ? 'TXT POLY WHITE' : 'AQUAFLEX V2',
                mesh: inkType === 'PLASTISOL' ? '110/64' : '122/??',
                additives: inkType === 'PLASTISOL' ? '' : '3% CL 500'
            });
            
            // El color blanco (usa NÚMERO)
            steps.push({
                tipo: 'COLOR',
                screenLetter: String(nextNumber++),
                nombre: ink.val || 'WHITE',
                mesh: window.ColorDatabase?.getMeshForInk(ink.val, inkType) || 
                      (inkType === 'PLASTISOL' ? '156/64' : '157/48'),
                additives: window.ColorDatabase?.getAdditivesForInk(ink.val, inkType) || ''
            });
        });
        
        // 3.2 Claros
        classifiedColors.light.forEach(ink => {
            // Base blanca para color claro (usa LETRA)
            steps.push({
                tipo: 'WHITE_BASE',
                screenLetter: String.fromCharCode(nextLetter++),
                nombre: inkType === 'PLASTISOL' ? 'TXT POLY WHITE' : 'AQUAFLEX V2',
                mesh: inkType === 'PLASTISOL' ? '110/64' : '122/??',
                additives: inkType === 'PLASTISOL' ? '' : '3% CL 500'
            });
            
            // El color claro (usa NÚMERO)
            steps.push({
                tipo: 'COLOR',
                screenLetter: String(nextNumber++),
                nombre: ink.val,
                mesh: window.ColorDatabase?.getMeshForInk(ink.val, inkType) || '157/48',
                additives: window.ColorDatabase?.getAdditivesForInk(ink.val, inkType) || ''
            });
        });
        
        // 3.3 Especiales (3 pantallas - usan NÚMEROS)
        classifiedColors.special.forEach(ink => {
            const inkInfo = ink.inkInfo || {};
            const meshes = inkInfo.meshes || ['157', '198', '110'];
            const additives = inkInfo.additives || '3% CL 500 · 5% ecofix XL';
            const colorNumber = nextNumber++; // Número base para este color
            
            meshes.forEach((mesh, idx) => {
                steps.push({
                    tipo: 'COLOR',
                    screenLetter: idx === 0 ? String(colorNumber) : `${colorNumber}-${idx + 1}`,
                    nombre: ink.val + (idx > 0 ? ` (${idx + 1})` : ''),
                    mesh: mesh + (inkType === 'PLASTISOL' ? '/64' : '/48'),
                    additives: additives
                });
            });
        });
        
        // 3.4 Metálicos (2 pantallas - usan NÚMEROS)
        classifiedColors.metallic.forEach(ink => {
            const colorNumber = nextNumber++;
            const screens = ink.inkInfo?.screens || 2;
            
            for (let i = 0; i < screens; i++) {
                steps.push({
                    tipo: 'COLOR',
                    screenLetter: i === 0 ? String(colorNumber) : `${colorNumber}-${i + 1}`,
                    nombre: ink.val + (i > 0 ? ` (${i + 1})` : ''),
                    mesh: i === 0 ? '110/64' : '156/64',
                    additives: 'Catalizador especial'
                });
            }
        });
        
        // 3.5 Medios y Oscuros (usan NÚMEROS)
        [...classifiedColors.medium, ...classifiedColors.dark].forEach(ink => {
            steps.push({
                tipo: 'COLOR',
                screenLetter: String(nextNumber++),
                nombre: ink.val,
                mesh: window.ColorDatabase?.getMeshForInk(ink.val, inkType) || '156/64',
                additives: window.ColorDatabase?.getAdditivesForInk(ink.val, inkType) || ''
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
        console.log(`   📝 Letras usadas: ${steps.filter(s => s.tipo !== 'COLOR').length} procesos`);
        console.log(`   🔢 Números usados: ${nextNumber - 1} colores`);
        
        return finalSequence;
    }

    function getCuringConditions(inkType) {
        syncPresetsFromInkRules();
        const selectedInk = String(inkType || 'WATER').toUpperCase();
        return (BASE_PRESETS[selectedInk] || BASE_PRESETS.WATER).curing;
    }

    // =====================================================
    // API PÚBLICA
    // =====================================================
    
    return {
        generarSecuencia,
        getCuringConditions,
        clasificarTela,
        clasificarColor,
        esColorEspecial,
        loadExternalRuleCatalogs
    };

})(); // <-- CIERRE CORRECTO DEL IIFE

// =====================================================
// CARGA AUTOMÁTICA
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
    if (window.RulesEngine && window.RulesEngine.loadExternalRuleCatalogs) {
        await window.RulesEngine.loadExternalRuleCatalogs();
    }
    console.log('✅ RulesEngine actualizado cargado');
});
