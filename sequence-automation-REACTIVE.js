
# Código CORREGIDO - Sistema reactivo: al agregar color, se genera la secuencia completa

reactive_code = '''// sequence-automation-REACTIVE.js
// Sistema reactivo: La secuencia se genera cuando AGREGAS colores, no antes
// Cada vez que agregas un color, el sistema recalcula toda la secuencia

window.SequenceAutomation = {
    // Configuración de secuencias por tipo
    SEQUENCES: {
        // FANATICS - Jersey BLANCO/CLARO
        FANATICS_WHITE: {
            inkType: 'WATER',
            temp: '320 °F',
            time: '1:40 min',
            // Secuencia base siempre presente
            baseSteps: [
                { type: 'WHITE_BASE', name: 'AquaFlex V2', mesh: '110', additives: 'N/A' },
                { type: 'WHITE_BASE', name: 'AquaFlex V2', mesh: '122', additives: 'N/A' },
                { type: 'BLOCKER', name: 'Blocker CHT', mesh: '157', additives: 'N/A' }
            ],
            // White base adicional para colores claros
            lightColorPrep: [
                { type: 'WHITE_BASE', name: 'AquaFlex V2', mesh: '122', additives: '3% CL 500' },
                { type: 'WHITE_BASE', name: 'AquaFlex V2', mesh: '198', additives: '3% CL 500' }
            ],
            // Pasos para cada color CLARO
            lightColorSteps: [
                { mesh: '157', base: 'AQUAFLEX', additives: '3% CL 500 · 5% ecofix XL' },
                { mesh: '198', base: 'AQUAFLEX', additives: '3% CL 500 · 5% ecofix XL' }
            ],
            // Pasos para cada color OSCURO
            darkColorSteps: [
                { mesh: '157', base: 'BLOCKER', additives: '3% CL 500 · 5% ecofix XL' },
                { mesh: '198', base: 'BLOCKER', additives: '3% CL 500 · 5% ecofix XL' }
            ]
        },

        // FANATICS - Jersey NEGRO/OSCuro
        FANATICS_BLACK: {
            inkType: 'WATER',
            temp: '320 °F',
            time: '1:40 min',
            baseSteps: [
                { type: 'BLOCKER', name: 'Blocker CHT', mesh: '110', additives: 'N/A' },
                { type: 'BLOCKER', name: 'Blocker CHT', mesh: '122', additives: 'N/A' },
                { type: 'BLOCKER', name: 'Blocker CHT', mesh: '157', additives: 'N/A' }
            ],
            // White base solo para colores claros
            lightColorPrep: [
                { type: 'WHITE_BASE', name: 'AquaFlex V2', mesh: '122', additives: '3% CL 500' }
            ],
            lightColorSteps: [
                { mesh: '157', base: 'AQUAFLEX', additives: '3% CL 500 · 5% ecofix XL' },
                { mesh: '198', base: 'AQUAFLEX', additives: '3% CL 500 · 5% ecofix XL' }
            ],
            darkColorSteps: [
                { mesh: '157', base: 'BLOCKER', additives: '3% CL 500 · 5% ecofix XL' },
                { mesh: '198', base: 'BLOCKER', additives: '3% CL 500 · 5% ecofix XL' }
            ]
        },

        // GFS - Plastisol
        GFS_PLASTISOL: {
            inkType: 'PLASTISOL',
            usePreset: true
        }
    },

    // Colores especiales (3 pantallas)
    SPECIAL_COLORS: ['77C GOLD', '77C', '78H', '761 UNIVERSITY GOLD', '761'],

    // Determinar configuración basada en colorway y cliente
    getConfig: function(colorway, customer) {
        const customerUpper = (customer || '').toUpperCase();
        const colorwayUpper = (colorway || '').toUpperCase();

        // Detectar GFS
        if (customerUpper.includes('GEAR') || customerUpper.includes('GFS')) {
            return { type: 'GFS', config: this.SEQUENCES.GFS_PLASTISOL };
        }

        // Detectar color de tela
        const isBlack = ['BLACK', 'NAVY', 'CHARCOAL', 'DK ', 'DARK ', 'FOREST', 'HUNTER', 'MAROON'].some(
            c => colorwayUpper.includes(c)
        );

        if (isBlack) {
            return { type: 'FANATICS_BLACK', config: this.SEQUENCES.FANATICS_BLACK };
        }

        return { type: 'FANATICS_WHITE', config: this.SEQUENCES.FANATICS_WHITE };
    },

    // Clasificar color de tinta
    classifyInkColor: function(colorName) {
        if (!colorName) return 'UNKNOWN';
        const upper = colorName.toUpperCase();

        // Colores especiales (amarillos/dorados muy claros)
        if (this.SPECIAL_COLORS.some(c => upper.includes(c))) {
            return 'SPECIAL_LIGHT';
        }

        // Colores claros
        const lightKeywords = ['WHITE', 'YELLOW', 'GOLD', 'LEMON', 'CREAM', 'IVORY', 'PINK', 'LIGHT', 'ORANGE'];
        if (lightKeywords.some(k => upper.includes(k))) {
            // Excepciones
            if (upper.includes('DARK ORANGE') || upper.includes('BURNT ORANGE')) return 'DARK';
            return 'LIGHT';
        }

        // Colores oscuros
        return 'DARK';
    },

    // Generar secuencia COMPLETA basada en los colores agregados
    generateFullSequence: function(placementId) {
        const placement = placements.find(p => p.id === placementId);
        if (!placement) return null;

        // Obtener configuración
        const colorway = document.getElementById('colorway')?.value || '';
        const customer = document.getElementById('customer')?.value || '';
        const { type, config } = this.getConfig(colorway, customer);

        // Si es GFS, usar preset existente
        if (type === 'GFS') {
            return this.generateGFSSequence(placement);
        }

        // Obtener colores actuales del placement
        const currentColors = placement.colors || [];
        
        // Separar colores por tipo
        const lightColors = [];
        const darkColors = [];
        const specialColors = [];

        currentColors.forEach(color => {
            const colorName = color.val || color.name || '';
            const classification = this.classifyInkColor(colorName);

            if (classification === 'SPECIAL_LIGHT') {
                specialColors.push(color);
            } else if (classification === 'LIGHT') {
                lightColors.push(color);
            } else {
                darkColors.push(color);
            }
        });

        // Construir secuencia
        const fullSequence = [];
        let letterIndex = 0;

        // 1. Pasos base (siempre)
        config.baseSteps.forEach(step => {
            fullSequence.push({
                ...step,
                id: Date.now() + letterIndex,
                screenLetter: this.getLetter(letterIndex)
            });
            letterIndex++;
        });

        // 2. Si hay colores CLAROS, agregar preparación especial
        if (lightColors.length > 0 || specialColors.length > 0) {
            config.lightColorPrep.forEach(step => {
                fullSequence.push({
                    ...step,
                    id: Date.now() + letterIndex,
                    screenLetter: this.getLetter(letterIndex)
                });
                letterIndex++;
            });
        }

        // 3. Agregar colores CLAROS
        lightColors.forEach((color, idx) => {
            const letter = String.fromCharCode(65 + idx);
            
            // Pantalla 1
            fullSequence.push({
                type: 'COLOR',
                name: color.val,
                mesh: config.lightColorSteps[0].mesh,
                additives: config.lightColorSteps[0].additives,
                baseLayer: config.lightColorSteps[0].base,
                id: Date.now() + letterIndex,
                screenLetter: letter,
                originalColorId: color.id
            });
            letterIndex++;

            // Pantalla 2
            fullSequence.push({
                type: 'COLOR',
                name: color.val + ' (2)',
                mesh: config.lightColorSteps[1].mesh,
                additives: config.lightColorSteps[1].additives,
                baseLayer: config.lightColorSteps[1].base,
                id: Date.now() + letterIndex,
                screenLetter: letter + '2',
                originalColorId: color.id
            });
            letterIndex++;
        });

        // 4. Agregar colores ESPECIALES (3 pantallas)
        specialColors.forEach((color, idx) => {
            const letter = String.fromCharCode(65 + lightColors.length + idx);
            
            // Pantalla 1
            fullSequence.push({
                type: 'COLOR',
                name: color.val,
                mesh: config.lightColorSteps[0].mesh,
                additives: config.lightColorSteps[0].additives,
                baseLayer: 'AQUAFLEX',
                id: Date.now() + letterIndex,
                screenLetter: letter,
                originalColorId: color.id
            });
            letterIndex++;

            // Pantalla 2
            fullSequence.push({
                type: 'COLOR',
                name: color.val + ' (2)',
                mesh: config.lightColorSteps[1].mesh,
                additives: config.lightColorSteps[1].additives,
                baseLayer: 'AQUAFLEX',
                id: Date.now() + letterIndex,
                screenLetter: letter + '2',
                originalColorId: color.id
            });
            letterIndex++;

            // Pantalla 3 (EXTRA)
            fullSequence.push({
                type: 'COLOR',
                name: color.val + ' (3) EXTRA',
                mesh: '110',
                additives: '3% CL 500 · 5% ecofix XL',
                baseLayer: 'AQUAFLEX',
                id: Date.now() + letterIndex,
                screenLetter: letter + '3',
                originalColorId: color.id,
                isExtra: true
            });
            letterIndex++;
        });

        // 5. Agregar colores OSCUROS
        darkColors.forEach((color, idx) => {
            const letter = String.fromCharCode(65 + lightColors.length + specialColors.length + idx);
            
            // Pantalla 1
            fullSequence.push({
                type: 'COLOR',
                name: color.val,
                mesh: config.darkColorSteps[0].mesh,
                additives: config.darkColorSteps[0].additives,
                baseLayer: config.darkColorSteps[0].base,
                id: Date.now() + letterIndex,
                screenLetter: letter,
                originalColorId: color.id
            });
            letterIndex++;

            // Pantalla 2
            fullSequence.push({
                type: 'COLOR',
                name: color.val + ' (2)',
                mesh: config.darkColorSteps[1].mesh,
                additives: config.darkColorSteps[1].additives,
                baseLayer: config.darkColorSteps[1].base,
                id: Date.now() + letterIndex,
                screenLetter: letter + '2',
                originalColorId: color.id
            });
            letterIndex++;
        });

        // Insertar FLASH/COOL entre cada paso
        const finalSequence = this.insertFlashCool(fullSequence);

        return {
            sequence: finalSequence,
            config: config,
            stats: {
                totalStations: finalSequence.length,
                lightColors: lightColors.length,
                darkColors: darkColors.length,
                specialColors: specialColors.length,
                type: type
            }
        };
    },

    // Insertar FLASH y COOL entre cada paso
    insertFlashCool: function(sequence) {
        const result = [];
        
        sequence.forEach((step, index) => {
            result.push(step);
            
            // Agregar FLASH/COOL después de cada paso excepto el último
            if (index < sequence.length - 1) {
                result.push(
                    { type: 'FLASH', name: 'FLASH', mesh: '-', additives: '-', screenLetter: '' },
                    { type: 'COOL', name: 'COOL', mesh: '-', additives: '-', screenLetter: '' }
                );
            }
        });

        return result;
    },

    getLetter: function(index) {
        if (index < 26) return String.fromCharCode(65 + index);
        return String.fromCharCode(65 + Math.floor(index / 26) - 1) + String.fromCharCode(65 + (index % 26));
    },

    // Aplicar secuencia generada al placement
    applySequence: function(placementId) {
        const sequenceData = this.generateFullSequence(placementId);
        if (!sequenceData) return false;

        const placement = placements.find(p => p.id === placementId);
        if (!placement) return false;

        // Actualizar propiedades del placement
        placement.inkType = sequenceData.config.inkType;
        placement.temp = sequenceData.config.temp;
        placement.time = sequenceData.config.time;

        // Convertir secuencia a formato de colores del placement
        placement.colors = sequenceData.sequence
            .filter(step => ['WHITE_BASE', 'BLOCKER', 'COLOR'].includes(step.type))
            .map(step => ({
                id: step.id || Date.now() + Math.random(),
                type: step.type,
                screenLetter: step.screenLetter,
                val: step.name,
                mesh: step.mesh,
                additives: step.additives,
                isExtra: step.isExtra || false
            }));

        // Agregar notas
        const notes = [];
        if (sequenceData.stats.specialColors > 0) {
            notes.push(`⚠️ ${sequenceData.stats.specialColors} color(es) especial(es) - 3 pantallas`);
        }
        notes.push(`Secuencia: ${sequenceData.stats.type}`);
        notes.push(`${sequenceData.stats.lightColors} claro(s), ${sequenceData.stats.darkColors} oscuro(s)`);
        
        placement.specialInstructions = notes.join(' | ');

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

        if (typeof showStatus === 'function') {
            showStatus(
                `✅ Secuencia actualizada: ${sequenceData.stats.totalStations} estaciones`,
                'success'
            );
        }

        return true;
    },

    // Para GFS - usar preset existente
    generateGFSSequence: function(placement) {
        if (typeof getInkPresetSafe === 'function') {
            const preset = getInkPresetSafe('PLASTISOL');
            // Mantener colores actales pero actualizar base
            return {
                usePreset: true,
                preset: preset
            };
        }
        return null;
    }
};

// INTEGRACIÓN REACTIVA
// Sobrescribir la función de agregar color para regenerar secuencia automáticamente

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        // Guardar referencia original
        if (typeof window.addPlacementColorItem === 'function') {
            const originalAddColor = window.addPlacementColorItem;
            
            window.addPlacementColorItem = function(placementId, type = 'COLOR') {
                // Llamar función original
                originalAddColor(placementId, type);
                
                // Si es un color (no blocker/white_base), regenerar secuencia
                if (type === 'COLOR' || type === 'METALLIC') {
                    setTimeout(() => {
                        if (window.SequenceAutomation) {
                            window.SequenceAutomation.applySequence(placementId);
                        }
                    }, 100);
                }
            };
            
            console.log('✅ Sistema reactivo activado: addPlacementColorItem');
        }

        // También para eliminar color
        if (typeof window.removePlacementColorItem === 'function') {
            const originalRemoveColor = window.removePlacementColorItem;
            
            window.removePlacementColorItem = function(placementId, colorId) {
                originalRemoveColor(placementId, colorId);
                
                setTimeout(() => {
                    if (window.SequenceAutomation) {
                        window.SequenceAutomation.applySequence(placementId);
                    }
                }, 100);
            };
            
            console.log('✅ Sistema reactivo activado: removePlacementColorItem');
        }

        // También para cambiar nombre de color
        if (typeof window.updatePlacementColorValue === 'function') {
            const originalUpdateColor = window.updatePlacementColorValue;
            
            window.updatePlacementColorValue = function(placementId, colorId, value) {
                originalUpdateColor(placementId, colorId, value);
                
                // Solo regenerar si el valor cambió significativamente
                if (value && value.length > 2) {
                    setTimeout(() => {
                        if (window.SequenceAutomation) {
                            window.SequenceAutomation.applySequence(placementId);
                        }
                    }, 500); // Delay para no regenerar mientras escribe
                }
            };
            
            console.log('✅ Sistema reactivo activado: updatePlacementColorValue');
        }

        console.log('✅ Sequence Automation REACTIVO cargado');
        console.log('Instrucciones:');
        console.log('1. Crea un placement');
        console.log('2. Agrega un color de tinta');
        console.log('3. El sistema automáticamente genera Blockers + White Bases + Secuencia');
        console.log('4. Si cambias el nombre del color, la secuencia se recalcula');
        
    }, 2000);
});
'''

print(reactive_code)
print("\n" + "="*80)
print("ARCHIVO: sequence-automation-REACTIVE.js")
print("="*80)
