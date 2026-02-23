// sequence-automation-REACTIVE.js
// Sistema reactivo que sigue las reglas exactas de Fanatics

window.SequenceAutomation = {
    // Reglas de negocio basadas en colorway (color de tela)
    FABRIC_RULES: {
        // Tela BLANCA/CLARA - Colores de tinta CLAROS
        FABRIC_WHITE_LIGHT_INK: {
            baseSteps: [
                { type: 'WHITE_BASE', name: 'AquaFlex V2', mesh: '110', additives: 'N/A', screenLetter: 'A' },
                { type: 'WHITE_BASE', name: 'AquaFlex V2', mesh: '122', additives: 'N/A', screenLetter: 'B' },
                { type: 'BLOCKER', name: 'Bloquer CHT', mesh: '157', additives: 'N/A', screenLetter: 'C' },
                { type: 'WHITE_BASE', name: 'AquaFlex V2', mesh: '122', additives: '3 % CL 500', screenLetter: 'D' },
                { type: 'WHITE_BASE', name: 'AquaFlex V2', mesh: '198', additives: '3 % CL 500', screenLetter: 'E' }
            ],
            colorRules: {
                LIGHT: { 
                    base: 'AquaFlex', 
                    mesh1: '157', 
                    mesh2: '198', 
                    additives: '3 % CL 500 · 5 % ecofix XL' 
                },
                DARK: { 
                    base: 'Bloquer CHT', 
                    mesh1: '157', 
                    mesh2: '198', 
                    additives: '3 % CL 500 · 5 % ecofix XL' 
                },
                SPECIAL: { 
                    base: 'AquaFlex', 
                    mesh1: '157', 
                    mesh2: '198', 
                    mesh3: '110', 
                    additives: '3 % CL 500 · 5 % ecofix XL' 
                }
            }
        },

        // Tela BLANCA/CLARA - Colores de tinta OSCUROS
        FABRIC_WHITE_DARK_INK: {
            baseSteps: [
                { type: 'WHITE_BASE', name: 'AquaFlex V2', mesh: '110', additives: 'N/A', screenLetter: 'A' },
                { type: 'WHITE_BASE', name: 'AquaFlex V2', mesh: '122', additives: 'N/A', screenLetter: 'B' },
                { type: 'BLOCKER', name: 'Bloquer CHT', mesh: '157', additives: 'N/A', screenLetter: 'C' }
            ],
            colorRules: {
                LIGHT: { 
                    base: 'AquaFlex', 
                    mesh1: '157', 
                    mesh2: '198', 
                    additives: '3 % CL 500 · 5 % ecofix XL' 
                },
                DARK: { 
                    base: 'Bloquer CHT', 
                    mesh1: '157', 
                    mesh2: '198', 
                    additives: '3 % CL 500 · 5 % ecofix XL' 
                },
                SPECIAL: { 
                    base: 'AquaFlex', 
                    mesh1: '157', 
                    mesh2: '198', 
                    mesh3: '110', 
                    additives: '3 % CL 500 · 5 % ecofix XL' 
                }
            }
        },

        // Tela NEGRA/OSCURA - TODOS los colores de tinta
        FABRIC_BLACK: {
            baseSteps: [
                { type: 'BLOCKER', name: 'Bloquer CHT', mesh: '110', additives: 'N/A', screenLetter: 'A' },
                { type: 'BLOCKER', name: 'Bloquer CHT', mesh: '122', additives: 'N/A', screenLetter: 'B' },
                { type: 'BLOCKER', name: 'Bloquer CHT', mesh: '157', additives: 'N/A', screenLetter: 'C' }
            ],
            colorRules: {
                LIGHT: { 
                    requiresWhiteBase: true,
                    basePrep: { type: 'WHITE_BASE', name: 'AquaFlex V2', mesh: '122', additives: '3 % CL 500', screenLetter: 'D' },
                    color1: { mesh: '198', additives: '3 % CL 500 · 5 % ecofix XL' },
                    color2: { mesh: '157', additives: '3 % CL 500 · 5 % ecofix XL' }
                },
                DARK: { 
                    requiresWhiteBase: false,
                    color1: { mesh: '198', additives: '3 % CL 500 · 5 % ecofix XL' },
                    color2: { mesh: '157', additives: '3 % CL 500 · 5 % ecofix XL' }
                },
                SPECIAL: { 
                    requiresWhiteBase: true,
                    basePrep: { type: 'WHITE_BASE', name: 'AquaFlex V2', mesh: '122', additives: '3 % CL 500', screenLetter: 'D' },
                    color1: { mesh: '198', additives: '3 % CL 500 · 5 % ecofix XL' },
                    color2: { mesh: '157', additives: '3 % CL 500 · 5 % ecofix XL' },
                    color3: { mesh: '110', additives: '3 % CL 500 · 5 % ecofix XL' }
                }
            }
        }
    },

    // Colores especiales que requieren 3 pantallas
    SPECIAL_COLORS: [
        '77C GOLD', '77C', '78H', '78H AMARILLO', 
        '761 UNIVERSITY GOLD', '761', 'GOLD', 'YELLOW',
        'AMARILLO', 'UNIVERSITY GOLD'
    ],

    // Palabras clave para colores claros
    LIGHT_KEYWORDS: ['WHITE', 'YELLOW', 'GOLD', 'LEMON', 'CREAM', 'IVORY', 'PINK', 'LIGHT', 'PASTEL', 'AMARILLO'],

    // Determinar configuración basada en colorway (color de tela)
    getFabricConfig: function(colorway, customer) {
        const customerUpper = (customer || '').toUpperCase();
        const colorwayUpper = (colorway || '').toUpperCase();

        // Detectar GFS
        if (customerUpper.includes('GEAR') || customerUpper.includes('GFS')) {
            return { type: 'GFS', config: null };
        }

        // Determinar si la tela es oscura
        const isDarkFabric = ['BLACK', 'NAVY', 'CHARCOAL', 'DK ', 'DARK ', 'FOREST', 'HUNTER', 'MAROON'].some(
            c => colorwayUpper.includes(c)
        );

        if (isDarkFabric) {
            return { type: 'FABRIC_BLACK', config: this.FABRIC_RULES.FABRIC_BLACK };
        }

        // Si no podemos determinar, asumimos tela blanca/clara
        // Pero necesitamos saber si los colores de tinta son claros u oscuros
        // Esto se determinará en generateFullSequence
        return { type: 'FABRIC_WHITE', config: null };
    },

    // Clasificar color de tinta
    classifyInkColor: function(colorName) {
        if (!colorName) return 'UNKNOWN';
        const upper = colorName.toUpperCase();

        // 1. Verificar si es color especial (3 pantallas)
        if (this.SPECIAL_COLORS.some(c => upper.includes(c))) {
            return 'SPECIAL';
        }

        // 2. Verificar si es Pantone metálico (871C-877C)
        if (upper.match(/(8[7-9][0-9]\s*C)/i)) {
            return 'SPECIAL';
        }

        // 3. Analizar códigos Pantone
        if (upper.match(/\d{3}\s*C/)) {
            const match = upper.match(/(\d{3})\s*C/);
            if (match) {
                const number = parseInt(match[1]);
                
                // Amarillos y dorados (100-199) - claros
                if (number >= 100 && number <= 199) {
                    return 'LIGHT';
                }
                
                // Rojos, azules, verdes - asumir oscuros
                return 'DARK';
            }
        }

        // 4. Verificar palabras clave para colores claros
        if (this.LIGHT_KEYWORDS.some(k => upper.includes(k))) {
            return 'LIGHT';
        }

        // Por defecto, asumir color oscuro
        return 'DARK';
    },

    // Verificar si hay al menos un color claro entre los colores
    hasLightColors: function(colors) {
        return colors.some(color => {
            const classification = this.classifyInkColor(color.val || '');
            return classification === 'LIGHT' || classification === 'SPECIAL';
        });
    },

    // Generar secuencia completa
    generateFullSequence: function(placementId) {
        const placement = window.placements ? window.placements.find(p => p.id === placementId) : null;
        if (!placement) return null;

        const colorway = document.getElementById('colorway')?.value || '';
        const customer = document.getElementById('customer')?.value || '';
        
        console.log('=== GENERANDO SECUENCIA ===');
        console.log('Colorway (tela):', colorway);
        console.log('Cliente:', customer);

        // Manejar GFS
        if (customer.toUpperCase().includes('GEAR') || customer.toUpperCase().includes('GFS')) {
            return this.handleGFSSequence(placement);
        }

        // Determinar si la tela es oscura
        const isDarkFabric = ['BLACK', 'NAVY', 'CHARCOAL', 'DK ', 'DARK ', 'FOREST', 'HUNTER', 'MAROON'].some(
            c => (colorway || '').toUpperCase().includes(c)
        );

        // Obtener colores del placement
        const currentColors = placement.colors || [];
        
        // Determinar si hay colores claros
        const hasLightInks = this.hasLightColors(currentColors);

        console.log('Tela oscura:', isDarkFabric);
        console.log('Hay tintas claras:', hasLightInks);

        const fullSequence = [];
        let letterIndex = 0;
        let numberIndex = 1;

        // SELECCIONAR CONFIGURACIÓN CORRECTA SEGÚN TELA Y TINTAS
        let config;
        if (isDarkFabric) {
            // Tela NEGRA - usar configuración FABRIC_BLACK
            config = this.FABRIC_RULES.FABRIC_BLACK;
        } else {
            // Tela BLANCA - elegir según si hay tintas claras
            if (hasLightInks) {
                config = this.FABRIC_RULES.FABRIC_WHITE_LIGHT_INK;
                console.log('Usando: FABRIC_WHITE_LIGHT_INK (tela blanca + tintas claras)');
            } else {
                config = this.FABRIC_RULES.FABRIC_WHITE_DARK_INK;
                console.log('Usando: FABRIC_WHITE_DARK_INK (tela blanca + tintas oscuras)');
            }
        }

        // 1. Agregar pasos base según configuración
        config.baseSteps.forEach(step => {
            fullSequence.push({
                ...step,
                id: Date.now() + letterIndex,
                screenLetter: step.screenLetter
            });
            letterIndex++;
        });

        // 2. Clasificar y procesar cada color
        currentColors.forEach((color, idx) => {
            const colorName = color.val || '';
            const classification = this.classifyInkColor(colorName);
            
            console.log(`Color ${idx + 1}: "${colorName}" → ${classification}`);

            // Para tela NEGRA, manejo especial
            if (isDarkFabric) {
                const rules = config.colorRules[classification];
                
                // Si requiere white base, agregarlo (solo una vez)
                if (rules.requiresWhiteBase && idx === 0) {
                    fullSequence.push({
                        ...rules.basePrep,
                        id: Date.now() + letterIndex,
                        screenLetter: rules.basePrep.screenLetter
                    });
                    letterIndex++;
                }

                // Agregar pantallas del color con NÚMEROS
                if (classification === 'SPECIAL') {
                    // 3 pantallas para colores especiales
                    fullSequence.push({
                        type: 'COLOR',
                        name: colorName,
                        mesh: rules.color3.mesh,
                        additives: rules.color3.additives,
                        screenNumber: numberIndex,
                        screenDisplay: numberIndex.toString(),
                        id: Date.now() + letterIndex
                    });
                    letterIndex++;
                    numberIndex++;

                    fullSequence.push({
                        type: 'COLOR',
                        name: colorName + ' (2)',
                        mesh: rules.color2.mesh,
                        additives: rules.color2.additives,
                        screenNumber: numberIndex,
                        screenDisplay: numberIndex.toString(),
                        id: Date.now() + letterIndex
                    });
                    letterIndex++;
                    numberIndex++;

                    fullSequence.push({
                        type: 'COLOR',
                        name: colorName + ' (3)',
                        mesh: rules.color1.mesh,
                        additives: rules.color1.additives,
                        screenNumber: numberIndex,
                        screenDisplay: numberIndex.toString(),
                        id: Date.now() + letterIndex
                    });
                    letterIndex++;
                    numberIndex++;
                } else {
                    // 2 pantallas para colores normales
                    fullSequence.push({
                        type: 'COLOR',
                        name: colorName,
                        mesh: rules.color1.mesh,
                        additives: rules.color1.additives,
                        screenNumber: numberIndex,
                        screenDisplay: numberIndex.toString(),
                        id: Date.now() + letterIndex
                    });
                    letterIndex++;
                    numberIndex++;

                    fullSequence.push({
                        type: 'COLOR',
                        name: colorName + ' (2)',
                        mesh: rules.color2.mesh,
                        additives: rules.color2.additives,
                        screenNumber: numberIndex,
                        screenDisplay: numberIndex.toString(),
                        id: Date.now() + letterIndex
                    });
                    letterIndex++;
                    numberIndex++;
                }
            } 
            // Para tela BLANCA
            else {
                const rules = config.colorRules[classification];
                
                // Agregar pantallas del color con NÚMEROS
                if (classification === 'SPECIAL') {
                    fullSequence.push({
                        type: 'COLOR',
                        name: colorName,
                        mesh: rules.mesh1,
                        additives: rules.additives,
                        screenNumber: numberIndex,
                        screenDisplay: numberIndex.toString(),
                        id: Date.now() + letterIndex
                    });
                    letterIndex++;
                    numberIndex++;

                    fullSequence.push({
                        type: 'COLOR',
                        name: colorName + ' (2)',
                        mesh: rules.mesh2,
                        additives: rules.additives,
                        screenNumber: numberIndex,
                        screenDisplay: numberIndex.toString(),
                        id: Date.now() + letterIndex
                    });
                    letterIndex++;
                    numberIndex++;

                    fullSequence.push({
                        type: 'COLOR',
                        name: colorName + ' (3)',
                        mesh: rules.mesh3 || '110',
                        additives: rules.additives,
                        screenNumber: numberIndex,
                        screenDisplay: numberIndex.toString(),
                        id: Date.now() + letterIndex
                    });
                    letterIndex++;
                    numberIndex++;
                } else {
                    fullSequence.push({
                        type: 'COLOR',
                        name: colorName,
                        mesh: rules.mesh1,
                        additives: rules.additives,
                        screenNumber: numberIndex,
                        screenDisplay: numberIndex.toString(),
                        id: Date.now() + letterIndex
                    });
                    letterIndex++;
                    numberIndex++;

                    fullSequence.push({
                        type: 'COLOR',
                        name: colorName + ' (2)',
                        mesh: rules.mesh2,
                        additives: rules.additives,
                        screenNumber: numberIndex,
                        screenDisplay: numberIndex.toString(),
                        id: Date.now() + letterIndex
                    });
                    letterIndex++;
                    numberIndex++;
                }
            }
        });

        // Insertar FLASH y COOL entre cada paso
        const finalSequence = this.insertFlashCool(fullSequence);

        return {
            sequence: finalSequence,
            stats: {
                totalStations: finalSequence.length,
                totalColors: currentColors.length,
                fabricType: isDarkFabric ? 'NEGRA' : 'BLANCA',
                hasLightInks: hasLightInks
            }
        };
    },

    // Insertar FLASH y COOL
    insertFlashCool: function(sequence) {
        const result = [];
        
        sequence.forEach((step, index) => {
            result.push(step);
            
            if (index < sequence.length - 1) {
                result.push(
                    { type: 'FLASH', name: 'FLASH', mesh: '-', additives: '-', screenDisplay: '' },
                    { type: 'COOL', name: 'COOL', mesh: '-', additives: '-', screenDisplay: '' }
                );
            }
        });

        return result;
    },

    // Aplicar secuencia al placement
    applySequence: function(placementId) {
        const sequenceData = this.generateFullSequence(placementId);
        if (!sequenceData) return false;

        const placement = window.placements.find(p => p.id === placementId);
        if (!placement) return false;

        // Actualizar propiedades
        placement.inkType = 'WATER';
        placement.temp = '320 °F';
        placement.time = '1:40 min';

        // Convertir secuencia a colores
        placement.colors = sequenceData.sequence
            .filter(step => ['WHITE_BASE', 'BLOCKER', 'COLOR'].includes(step.type))
            .map(step => ({
                id: step.id || Date.now() + Math.random(),
                type: step.type,
                screenLetter: step.screenLetter || step.screenDisplay || '',
                val: step.name,
                mesh: step.mesh,
                additives: step.additives
            }));

        // Notas informativas
        placement.specialInstructions = `Tela ${sequenceData.stats.fabricType}${sequenceData.stats.hasLightInks ? ' con tintas claras' : ' con tintas oscuras'}`;

        // Actualizar UI
        if (window.renderPlacementColors) window.renderPlacementColors(placementId);
        if (window.updatePlacementStations) window.updatePlacementStations(placementId);

        return true;
    },

    handleGFSSequence: function(placement) {
        // Implementación para GFS (Plastisol)
        console.log('Manejando secuencia GFS');
        return null;
    }
};

// Integración con los botones existentes
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        // Hook para addPlacementColorItem
        if (window.addPlacementColorItem) {
            const original = window.addPlacementColorItem;
            window.addPlacementColorItem = function(placementId, type) {
                original(placementId, type);
                setTimeout(() => window.SequenceAutomation?.applySequence(placementId), 150);
            };
        }

        // Hook para removePlacementColorItem
        if (window.removePlacementColorItem) {
            const original = window.removePlacementColorItem;
            window.removePlacementColorItem = function(placementId, colorId) {
                original(placementId, colorId);
                setTimeout(() => window.SequenceAutomation?.applySequence(placementId), 150);
            };
        }

        console.log('✅ Sequence Automation listo');
        console.log('Reglas cargadas con mallas específicas:');
        console.log('- Bases: 110, 122, 157, 198');
        console.log('- Colores: 157, 198 (y 110 para especiales)');
        console.log('- Letras para bases, Números para colores');
    }, 2000);
});
