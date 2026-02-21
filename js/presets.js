// Módulo para manejar presets de tinta y configuración
import { appState } from './state.js';

export class PresetsManager {
    constructor() {
        this.presets = {};
    }

    async loadPresets() {
        try {
            const response = await fetch('data/ink-presets.json');
            this.presets = await response.json();
            appState.setInkPresets(this.presets);
            return this.presets;
        } catch (error) {
            console.error('Error cargando presets:', error);
            return this.getDefaultPresets();
        }
    }

    getPreset(inkType = 'WATER') {
        return this.presets[inkType] || this.getDefaultPreset();
    }

    getDefaultPreset() {
        return {
            name: 'Water-base',
            temp: '320 °F',
            time: '1:00 min',
            blocker: {
                name: 'BLOCKER CHT',
                mesh1: '122/55',
                mesh2: '157/48',
                durometer: '70',
                speed: '35',
                angle: '15',
                strokes: '2',
                pressure: '40',
                additives: 'N/A'
            },
            white: {
                name: 'AQUAFLEX WHITE',
                mesh1: '198/40',
                mesh2: '157/48',
                durometer: '70',
                speed: '35',
                angle: '15',
                strokes: '2',
                pressure: '40',
                additives: 'N/A'
            },
            color: {
                mesh: '157/48',
                durometer: '70',
                speed: '35',
                angle: '15',
                strokes: '2',
                pressure: '40',
                additives: '3 % cross-linker 500 · 1.5 % antitack'
            }
        };
    }

    getDefaultPresets() {
        return {
            WATER: this.getDefaultPreset(),
            PLASTISOL: {
                name: 'Plastisol',
                temp: '330 °F',
                time: '1:20 min',
                blocker: {
                    name: 'PLASTISOL BLOCKER',
                    mesh1: '110/64',
                    mesh2: '110/64',
                    durometer: '70',
                    speed: '40',
                    angle: '15',
                    strokes: '2',
                    pressure: '40',
                    additives: 'N/A'
                },
                white: {
                    name: 'PLASTISOL WHITE',
                    mesh1: '160/48',
                    mesh2: '160/48',
                    durometer: '70',
                    speed: '40',
                    angle: '15',
                    strokes: '2',
                    pressure: '40',
                    additives: 'N/A'
                },
                color: {
                    mesh: '160/48',
                    durometer: '70',
                    speed: '40',
                    angle: '15',
                    strokes: '2',
                    pressure: '40',
                    additives: 'Catalizador plastisol'
                }
            }
        };
    }

    applyPresetToPlacement(placementId, inkType) {
        const placement = appState.getPlacementById(placementId);
        if (!placement) return;
        
        const preset = this.getPreset(inkType);
        
        const updates = {
            inkType: inkType,
            temp: preset.temp,
            time: preset.time,
            // Actualizar valores por defecto si no están personalizados
            meshColor: placement.meshColor || preset.color.mesh,
            meshWhite: placement.meshWhite || preset.white.mesh1,
            meshBlocker: placement.meshBlocker || preset.blocker.mesh1,
            durometer: placement.durometer || preset.color.durometer,
            strokes: placement.strokes || preset.color.strokes,
            angle: placement.angle || preset.color.angle,
            pressure: placement.pressure || preset.color.pressure,
            speed: placement.speed || preset.color.speed,
            additives: placement.additives || preset.color.additives
        };
        
        appState.updatePlacement(placementId, updates);
        return updates;
    }

    getAvailableInkTypes() {
        return Object.keys(this.presets).map(key => ({
            value: key,
            label: this.presets[key].name || key
        }));
    }

    getPlacementTypes() {
        return [
            { value: 'FRONT', label: 'FRONT (Frente)', icon: 'tshirt' },
            { value: 'BACK', label: 'BACK (Espalda)', icon: 'tshirt' },
            { value: 'SLEEVE', label: 'SLEEVE (Manga)', icon: 'hat-cowboy' },
            { value: 'CHEST', label: 'CHEST (Pecho)', icon: 'heart' },
            { value: 'TV. NUMBERS', label: 'TV. NUMBERS (Números TV)', icon: 'hashtag' },
            { value: 'SHOULDER', label: 'SHOULDER (Hombro)', icon: 'user' },
            { value: 'COLLAR', label: 'COLLAR (Cuello)', icon: 'circle' },
            { value: 'CUSTOM', label: 'CUSTOM (Personalizado)', icon: 'star' }
        ];
    }

    validatePreset(preset) {
        const requiredFields = ['name', 'temp', 'time'];
        const missingFields = requiredFields.filter(field => !preset[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Preset incompleto: Faltan campos ${missingFields.join(', ')}`);
        }
        
        return true;
    }

    // Método para crear presets personalizados
    createCustomPreset(name, settings) {
        const customPreset = {
            name: name,
            ...this.getDefaultPreset(),
            ...settings
        };
        
        this.validatePreset(customPreset);
        return customPreset;
    }
}

// Instancia singleton
export const presetsManager = new PresetsManager();
