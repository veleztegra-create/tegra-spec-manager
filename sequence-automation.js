// sequence-automation.js - Secuencias inteligentes CORREGIDO
// Reglas:
// 1. FLASH y COOL entre CADA paso (Blockers, White Bases, Colores)
// 2. Los placements se generan por ubicación (Front, Shoulder, Back)
// 3. Cada placement tiene su propia secuencia completa
// 4. El color se infiere del colorway o se agrega manualmente después

window.SequenceAutomation = {
    // Colores especiales que necesitan 3 pantallas
    SPECIAL_LIGHT_COLORS: [
        '77C GOLD', '77C', 'GOLD 77C',
        '78H', '78H AMARILLO', 'AMARILLO 78H', 'YELLOW 78H',
        '761 UNIVERSITY GOLD', '761', 'UNIVERSITY GOLD 761'
    ],

    // Secuencias base por tipo de jersey y tintas
    SEQUENCES: {
        // FANATICS - Jersey BLANCO/CLARO + Tintas CLARAS
        'FANATICS_WHITE_LIGHT': {
            name: 'Fanatics - White/Light Jersey - Light Inks',
            inkType: 'WATER',
            baseSequence: [
                { type: 'WHITE_BASE', name: 'AquaFlex V2', mesh: '110', additives: 'N/A', letter: 'WB1' },
                { type: 'WHITE_BASE', name: 'AquaFlex V2', mesh: '122', additives: 'N/A', letter: 'WB2' },
                { type: 'BLOCKER', name: 'Blocker CHT', mesh: '157', additives: 'N/A', letter: 'BL' },
                { type: 'WHITE_BASE', name: 'AquaFlex V2', mesh: '122', additives: '3% CL 500', letter: 'WB3' },
                { type: 'WHITE_BASE', name: 'AquaFlex V2', mesh: '198', additives: '3% CL 500', letter: 'WB4' }
            ],
            colorSteps: [
                { mesh: '157', additives: '3% CL 500 · 5% ecofix XL', base: 'AQUAFLEX' },
                { mesh: '198', additives: '3% CL 500 · 5% ecofix XL', base: 'AQUAFLEX' }
            ],
            rules: {
                temp: '320 °F',
                time: '1:40 min',
                flashCoolBetweenAll: true
            }
        },

        // FANATICS - Jersey BLANCO/CLARO + Tintas OSCURAS
        'FANATICS_WHITE_DARK': {
            name: 'Fanatics - White/Light Jersey - Dark Inks',
            inkType: 'WATER',
            baseSequence: [
                { type: 'WHITE_BASE', name: 'AquaFlex V2', mesh: '110', additives: 'N/A', letter: 'WB1' },
                { type: 'WHITE_BASE', name: 'AquaFlex V2', mesh: '122', additives: 'N/A', letter: 'WB2' },
                { type: 'BLOCKER', name: 'Blocker CHT', mesh: '157', additives: 'N/A', letter: 'BL' },
                { type: 'WHITE_BASE', name: 'AquaFlex V2', mesh: '122', additives: '3% CL 500', letter: 'WB3' }
                // Los colores oscuros NO llevan white base adicional
            ],
            colorSteps: [
                { mesh: '157', additives: '3% CL 500 · 5% ecofix XL', base: 'BLOCKER' },
                { mesh: '198', additives: '3% CL 500 · 5% ecofix XL', base: 'BLOCKER' }
            ],
            rules: {
                temp: '320 °F',
                time: '1:40 min',
                flashCoolBetweenAll: true,
                darkColorsSkipFinalWB: true
            }
        },

        // FANATICS - Jersey NEGRO/OSCuro + Tintas (cualquiera)
        'FANATICS_BLACK': {
            name: 'Fanatics - Black/Dark Jersey',
            inkType: 'WATER',
            baseSequence: [
                { type: 'BLOCKER', name: 'Blocker CHT', mesh: '110', additives: 'N/A', letter: 'BL1' },
                { type: 'BLOCKER', name: 'Blocker CHT', mesh: '122', additives: 'N/A', letter: 'BL2' },
                { type: 'BLOCKER', name: 'Blocker CHT', mesh: '157', additives: 'N/A', letter: 'BL3' },
                { type: 'WHITE_BASE', name: 'AquaFlex V2', mesh: '122', additives: '3% CL 500', letter: 'WB' }
            ],
            colorSteps: [
                { mesh: '157', additives: '3% CL 500 · 5% ecofix XL', base: 'AQUAFLEX' },
                { mesh: '198', additives: '3% CL 500 · 5% ecofix XL', base: 'AQUAFLEX' }
            ],
            rules: {
                temp: '320 °F',
                time: '1:40 min',
                flashCoolBetweenAll: true
            }
        },

        // GFS - Plastisol (usar configuración existente del sistema)
        'GFS_PLASTISOL': {
            name: 'GFS - Plastisol Standard',
            inkType: 'PLASTISOL',
            useExistingPreset: true,
            rules: {
                flashCoolBetweenAll: true
            }
        }
    },

    // Determinar qué secuencia usar basado en colorway y cliente
    determineSequence: function(colorway, customer, inkColors) {
        if (!colorway) return null;

        const customerUpper = (customer || '').toUpperCase();
        const colorwayUpper = colorway.toUpperCase();

        // Detectar cliente
        const isGFS = customerUpper.includes('GEAR FOR SPORT') || 
                      customerUpper.includes('GEARFORSPORT') || 
                      customerUpper.includes('GFS');

        if (isGFS) {
            return this.SEQUENCES.GFS_PLASTISOL;
        }

        // Para Fanatics y otros waterbase
        const isDarkJersey = this.isDarkJersey(colorwayUpper);
        
        if (isDarkJersey) {
            // Jersey negro/oscuro: siempre triple blocker
            return this.SEQUENCES.FANATICS_BLACK;
        }

        // Jersey blanco/claro: determinar por tipo de tintas
        const hasLightInks = inkColors?.some(c => this.isLightColor(c));
        const hasDarkInks = inkColors?.some(c => this.isDarkColor(c));

        if (hasDarkInks && !hasLightInks) {
            // Solo tintas oscuras
            return this.SEQUENCES.FANATICS_WHITE_DARK;
        }

        // Default: tintas claras o mixto (usar la más completa)
        return this.SEQUENCES.FANATICS_WHITE_LIGHT;
    },

    // Verificar si el jersey es oscuro
    isDarkJersey: function(colorway) {
        const darkColors = ['BLACK', 'NAVY', 'CHARCOAL', 'DK ', 'DARK ', 
                           'FOREST', 'HUNTER', 'MAROON', 'BURGUNDY'];
        return darkColors.some(dark => colorway.includes(dark));
    },

    // Verificar si una tinta es clara
    isLightColor: function(colorName) {
        if (!colorName) return false;
        const upper = colorName.toUpperCase();
        
        // Colores especiales (siempre claros)
        if (this.SPECIAL_LIGHT_COLORS.some(c => upper.includes(c))) return true;
        
        // Keywords claros
        const lightKeywords = ['WHITE', 'YELLOW', 'GOLD', 'LEMON', 'CREAM', 
                              'IVORY', 'PINK', 'LIGHT', 'PALE', 'ORANGE'];
        return lightKeywords.some(k => upper.includes(k));
    },

    // Verificar si una tinta es oscura
    isDarkColor: function(colorName) {
        if (!colorName) return false;
        const upper = colorName.toUpperCase();
        
        // Si es especial claro, no es oscuro
        if (this.SPECIAL_LIGHT_COLORS.some(c => upper.includes(c))) return false;
        
        const darkKeywords = ['BLACK', 'NAVY', 'BLUE', 'PURPLE', 'MAROON',
                             'GREEN', 'RED', 'BROWN', 'GRAY', 'GREY', 'CHARCOAL'];
        return darkKeywords.some(k => upper.includes(k));
    },

    // Generar secuencia completa con FLASH y COOL entre cada paso
    generateSequence: function(sequenceConfig, inkColors) {
        if (sequenceConfig.useExistingPreset) {
            // Para GFS, usar la configuración existente del sistema
            return this.generateGFSSequence(inkColors);
        }

        const fullSequence = [];
        const baseSeq = sequenceConfig.baseSequence;
        const colorSteps = sequenceConfig.colorSteps;
        
        // Agregar pasos base con FLASH/COOL entre cada uno
        baseSeq.forEach((step, index) => {
            fullSequence.push(step);
            
            // Agregar FLASH/COOL después de cada paso (excepto el último si no hay colores)
            if (index < baseSeq.length - 1 || (inkColors && inkColors.length > 0)) {
                fullSequence.push(
                    { type: 'FLASH', name: 'FLASH', mesh: '-', additives: '-', letter: '' },
                    { type: 'COOL', name: 'COOL', mesh: '-', additives: '-', letter: '' }
                );
            }
        });

        // Agregar colores si existen
        if (inkColors && inkColors.length > 0) {
            inkColors.forEach((color, colorIdx) => {
                const isLight = this.isLightColor(color);
                const isSpecial = this.SPECIAL_LIGHT_COLORS.some(c => 
                    color.toUpperCase().includes(c)
                );
                
                const letter = String.fromCharCode(65 + colorIdx); // A, B, C...
                
                // Pantalla 1 del color
                fullSequence.push({
                    type: 'COLOR',
                    name: color,
                    mesh: colorSteps[0].mesh,
                    additives: colorSteps[0].additives,
                    letter: letter,
                    baseLayer: colorSteps[0].base
                });

                // FLASH/COOL
                fullSequence.push(
                    { type: 'FLASH', name: 'FLASH', mesh: '-', additives: '-', letter: '' },
                    { type: 'COOL', name: 'COOL', mesh: '-', additives: '-', letter: '' }
                );

                // Pantalla 2 del color
                fullSequence.push({
                    type: 'COLOR',
                    name: `${color} (2)`,
                    mesh: colorSteps[1].mesh,
                    additives: colorSteps[1].additives,
                    letter: `${letter}2`,
                    baseLayer: colorSteps[1].base
                });

                // Si es color especial (amarillo/dorado claro), agregar 3ra pantalla
                if (isSpecial) {
                    fullSequence.push(
                        { type: 'FLASH', name: 'FLASH', mesh: '-', additives: '-', letter: '' },
                        { type: 'COOL', name: 'COOL', mesh: '-', additives: '-', letter: '' }
                    );
                    
                    fullSequence.push({
                        type: 'COLOR',
                        name: `${color} (3)`,
                        mesh: '110',
                        additives: '3% CL 500 · 5% ecofix XL',
                        letter: `${letter}3`,
                        baseLayer: 'AQUAFLEX',
                        note: 'EXTRA - Amarillo/Dorado claro'
                    });
                }

                // FLASH/COOL después del color (excepto si es el último)
                if (colorIdx < inkColors.length - 1) {
                    fullSequence.push(
                        { type: 'FLASH', name: 'FLASH', mesh: '-', additives: '-', letter: '' },
                        { type: 'COOL', name: 'COOL', mesh: '-', additives: '-', letter: '' }
                    );
                }
            });
        }

        return {
            sequence: fullSequence,
            config: sequenceConfig,
            totalStations: fullSequence.length
        };
    },

    // Generar secuencia para GFS (usar preset existente)
    generateGFSSequence: function(inkColors) {
        // Usar la función existente del sistema si está disponible
        if (typeof getInkPresetSafe === 'function') {
            const preset = getInkPresetSafe('PLASTISOL');
            // Aquí podrías expandir según los colores
            return {
                sequence: [], // Se llenará con la lógica existente
                usePreset: true,
                preset: preset
            };
        }
        
        return { sequence: [], usePreset: true };
    },

    // Aplicar secuencia generada a un placement específico
    applyToPlacement: function(placementId, sequenceData) {
        const placement = placements.find(p => p.id === placementId);
        if (!placement) {
            console.error('Placement no encontrado:', placementId);
            return false;
        }

        const config = sequenceData.config;
        
        // Actualizar tipo de tinta
        placement.inkType = config.inkType;
        
        // Actualizar temp/tiempo
        if (config.rules) {
            placement.temp = config.rules.temp || placement.temp;
            placement.time = config.rules.time || placement.time;
        }

        // Convertir secuencia a colores del placement
        if (sequenceData.usePreset) {
            // Para GFS, dejar que el sistema maneje con el preset existente
            placement.colors = [];
        } else {
            // Convertir pasos a formato de colores
            placement.colors = sequenceData.sequence
                .filter(step => ['WHITE_BASE', 'BLOCKER', 'COLOR'].includes(step.type))
                .map((step, idx) => ({
                    id: Date.now() + idx,
                    type: step.type,
                    screenLetter: step.letter || String.fromCharCode(65 + idx),
                    val: step.name,
                    mesh: step.mesh,
                    additives: step.additives
                }));
        }

        // Agregar notas especiales
        const notes = [];
        if (config.name) notes.push(`Secuencia: ${config.name}`);
        if (sequenceData.sequence.some(s => s.note)) {
            notes.push('⚠️ Incluye colores especiales (3 pantallas)');
        }
        
        if (notes.length > 0) {
            placement.specialInstructions = notes.join(' | ') + 
                (placement.specialInstructions ? ' | ' + placement.specialInstructions : '');
        }

        // Actualizar UI
        if (typeof renderPlacementColors === 'function') {
            renderPlacementColors(placementId);
        }
        if (typeof updatePlacementStations === 'function') {
            updatePlacementStations(placementId);
        }
        if (typeof updatePlacementColorsPreview === 'function') {
            updatePlacementColorsPreview(placementId);
        }

        return true;
    },

    // Función principal: procesar placement automáticamente
    processPlacement: function(placementId, colorway, customer, inkColors) {
        const sequenceConfig = this.determineSequence(colorway, customer, inkColors);
        
        if (!sequenceConfig) {
            console.warn('No se pudo determinar secuencia para:', { colorway, customer });
            return false;
        }

        const sequenceData = this.generateSequence(sequenceConfig, inkColors);
        const applied = this.applyToPlacement(placementId, sequenceData);

        if (applied && typeof showStatus === 'function') {
            const stationCount = sequenceData.totalStations || sequenceData.sequence?.length || 0;
            showStatus(
                `✅ ${sequenceConfig.name} aplicada (${stationCount} estaciones)`,
                'success'
            );
        }

        return applied;
    }
};

// Integración con excel-automation.js
// Cada placement generado desde Excel recibe su secuencia automáticamente

if (typeof window.ExcelAutomation !== 'undefined') {
    const originalAutoCreate = window.ExcelAutomation.autoCreatePlacements;
    
    window.ExcelAutomation.autoCreatePlacements = function(detectedPlacements) {
        // Crear placements con función original
        const result = originalAutoCreate.call(this, detectedPlacements);
        
        // Aplicar secuencias automáticas
        setTimeout(() => {
            const colorway = document.getElementById('colorway')?.value;
            const customer = document.getElementById('customer')?.value;
            
            if (!colorway || !placements) return;

            // Procesar cada placement auto-generado
            placements.forEach(placement => {
                if (placement.isAutoGenerated) {
                    // Para cada placement, los colores se agregarán manualmente después
                    // o se pueden inferir del tipo de diseño
                    const inferredColors = [];
                    
                    // Si es número de jugador, asumir colores del equipo
                    if (placement.isNumbers) {
                        inferredColors.push('White'); // Default para números
                    }
                    
                    window.SequenceAutomation.processPlacement(
                        placement.id,
                        colorway,
                        customer,
                        inferredColors // Por ahora vacío o con defaults
                    );
                }
            });
        }, 500);
        
        return result;
    };
}

console.log('✅ Sequence Automation v2.0 cargado (FLASH/COOL entre todos los pasos)');
