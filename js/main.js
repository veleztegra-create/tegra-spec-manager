// Punto de entrada principal de la aplicación
import { appState } from './state.js';
import { apiService } from './api.js';
import { uiManager } from './ui.js';
import { render } from './render.js';
import { presetsManager } from './presets.js';
import { colorParser } from './color-parser.js';
import { teamParser } from './team-parser.js';
import { utils } from './utils.js';

class TegraSpecApp {
    constructor() {
        this.isInitialized = false;
    }

    async init() {
        try {
            console.log('🚀 Iniciando Tegra Spec Manager...');
            
            // Cargar datos de configuración
            await this.loadData();
            
            // Inicializar estado
            this.initializeState();
            
            // Renderizar la aplicación
            render.renderApp();
            
            // Inicializar UI
            uiManager.setupTheme();
            uiManager.initEventListeners();
            
            // Cargar estado guardado
            appState.loadFromLocalStorage();
            
            // Mostrar dashboard inicial
            uiManager.showTab('dashboard');
            
            this.isInitialized = true;
            console.log('✅ Tegra Spec Manager iniciado correctamente');
            
            this.showStatus('Aplicación cargada correctamente', 'success');
            
        } catch (error) {
            console.error('❌ Error al iniciar la aplicación:', error);
            this.showStatus('Error al cargar la aplicación: ' + error.message, 'error');
        }
    }

    async loadData() {
        try {
            console.log('📥 Cargando datos de configuración...');
            
            const data = await apiService.loadAllData();
            
            // Configurar el estado con los datos cargados
            appState.setConfig(data.config);
            appState.setInkPresets(data.inkPresets);
            appState.setColors(data.colors);
            appState.setTeams(data.teams);
            
            console.log('✅ Datos cargados correctamente');
            
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            throw error;
        }
    }

    initializeState() {
        // Inicializar placements si no hay ninguno
        if (appState.getPlacements().length === 0) {
            const firstPlacement = appState.createPlacement('FRONT');
            appState.addPlacement(firstPlacement);
        }
        
        // Configurar suscripciones para renderizado automático
        this.setupStateSubscriptions();
    }

    setupStateSubscriptions() {
        // Suscribirse a cambios en placements
        appState.subscribe('placements', (placements) => {
            render.renderPlacements(placements);
        });
        
        // Suscribirse a cambios en el placement actual
        appState.subscribe('currentPlacement', () => {
            render.updateCurrentPlacement();
        });
        
        // Suscribirse a cambios en datos del formulario
        appState.subscribe('formData', (formData) => {
            render.updateFormUI(formData);
        });
        
        // Suscribirse a cambios de tema
        appState.subscribe('theme', (theme) => {
            uiManager.updateTheme(theme);
        });
    }

    showStatus(message, type = 'success') {
        uiManager.showStatus(message, type);
    }

    // Métodos globales expuestos al window
    exposeGlobalMethods() {
        // Navigation
        window.showTab = (tabName) => uiManager.showTab(tabName);
        
        // Placements
        window.addNewPlacement = (type = null) => {
            const placement = appState.createPlacement(type || 'FRONT');
            appState.addPlacement(placement);
            return placement.id;
        };
        
        window.removePlacement = (id) => appState.removePlacement(id);
        window.duplicatePlacement = (id) => {
            const original = appState.getPlacementById(id);
            if (original) {
                const duplicate = JSON.parse(JSON.stringify(original));
                duplicate.id = Date.now() + Math.random();
                duplicate.name = duplicate.type.includes('CUSTOM:') 
                    ? duplicate.type.replace('CUSTOM: ', '') 
                    : duplicate.type;
                appState.addPlacement(duplicate);
                return duplicate.id;
            }
        };
        
        // Form actions
        window.saveCurrentSpec = () => this.saveSpec();
        window.clearForm = () => this.clearForm();
        window.exportPDF = () => this.exportPDF();
        window.exportToExcel = () => this.exportExcel();
        window.downloadProjectZip = () => this.downloadZip();
        
        // Data management
        window.clearAllSpecs = () => this.clearAllSpecs();
        window.loadSavedSpecsList = () => render.renderSavedSpecsList();
        window.clearErrorLog = () => appState.clearErrorLog();
        window.exportErrorLog = () => this.exportErrorLog();
        
        // Client logo
        window.updateClientLogo = () => uiManager.updateClientLogo();
        window.handleGearForSportLogic = () => this.handleGearForSport();
        
        // Placement actions
        window.updatePlacementType = (id, type) => {
            if (type === 'CUSTOM') {
                appState.updatePlacement(id, { type: 'CUSTOM: ' });
            } else {
                appState.updatePlacement(id, { type });
            }
        };
        
        window.updateCustomPlacement = (id, customName) => {
            appState.updatePlacement(id, { type: `CUSTOM: ${customName}` });
        };
        
        window.updatePlacementInkType = (id, inkType) => {
            presetsManager.applyPresetToPlacement(id, inkType);
        };
        
        window.addPlacementColorItem = (id, type) => {
            const color = appState.createColorItem(type);
            const placement = appState.getPlacementById(id);
            if (placement) {
                placement.colors.push(color);
                appState.updatePlacement(id, { colors: placement.colors });
            }
        };
        
        window.removePlacementColorItem = (placementId, colorId) => {
            const placement = appState.getPlacementById(placementId);
            if (placement) {
                placement.colors = placement.colors.filter(c => c.id !== colorId);
                appState.updatePlacement(placementId, { colors: placement.colors });
            }
        };
        
        window.updatePlacementColorValue = (placementId, colorId, value) => {
            const placement = appState.getPlacementById(placementId);
            if (placement) {
                const color = placement.colors.find(c => c.id === colorId);
                if (color) {
                    color.val = value;
                    appState.updatePlacement(placementId, { colors: placement.colors });
                }
            }
        };
        
        window.updatePlacementScreenLetter = (placementId, colorId, value) => {
            const placement = appState.getPlacementById(placementId);
            if (placement) {
                const color = placement.colors.find(c => c.id === colorId);
                if (color) {
                    color.screenLetter = value.toUpperCase();
                    appState.updatePlacement(placementId, { colors: placement.colors });
                }
            }
        };
        
        window.updatePlacementParam = (id, param, value) => {
            appState.updatePlacement(id, { [param]: value });
        };
        
        window.openImagePickerForPlacement = (id) => {
            const input = document.getElementById('placementImageInput');
            if (input) {
                input.dataset.placementId = id;
                input.click();
            }
        };
        
        window.removePlacementImage = (id) => {
            appState.updatePlacement(id, { imageData: null });
        };
        
        window.showPlacement = (id) => {
            appState.setCurrentPlacement(id);
        };
        
        window.updateAllPlacementTitles = (id) => {
            // Esta función se maneja automáticamente por el renderer
            const placement = appState.getPlacementById(id);
            if (placement) {
                appState.notify('placements');
            }
        };
    }

    async saveSpec() {
        try {
            const data = this.collectSpecData();
            const style = data.style || 'SinEstilo_' + Date.now();
            const storageKey = `spec_${style}_${Date.now()}`;
            
            data.savedAt = new Date().toISOString();
            data.lastModified = new Date().toISOString();
            
            localStorage.setItem(storageKey, JSON.stringify(data));
            
            // Actualizar UI
            render.renderDashboard();
            render.renderSavedSpecsList();
            
            this.showStatus('✅ Spec guardada correctamente', 'success');
            
            // Preguntar si quiere ver las specs guardadas
            setTimeout(() => {
                if (confirm('¿Deseas ver todas las specs guardadas?')) {
                    uiManager.showTab('saved-specs');
                }
            }, 1000);
            
        } catch (error) {
            console.error('Error al guardar spec:', error);
            this.showStatus('❌ Error al guardar: ' + error.message, 'error');
        }
    }

    collectSpecData() {
        const formData = appState.getFormData();
        const placements = appState.getPlacements();
        
        return {
            ...formData,
            placements: placements.map(p => ({
                id: p.id,
                type: p.type,
                name: p.name,
                imageData: p.imageData,
                colors: p.colors,
                placementDetails: p.placementDetails,
                dimensions: p.dimensions,
                width: p.width,
                height: p.height,
                temp: p.temp,
                time: p.time,
                specialties: p.specialties,
                specialInstructions: p.specialInstructions,
                inkType: p.inkType,
                
                // Parámetros de impresión
                meshColor: p.meshColor,
                meshWhite: p.meshWhite,
                meshBlocker: p.meshBlocker,
                durometer: p.durometer,
                strokes: p.strokes,
                angle: p.angle,
                pressure: p.pressure,
                speed: p.speed,
                additives: p.additives
            })),
            savedAt: new Date().toISOString()
        };
    }

    clearForm() {
        if (confirm('⚠️ ¿Estás seguro de que quieres limpiar todo el formulario?\n\nSe perderán todos los datos no guardados.\n\n¿Continuar?')) {
            // Resetear formulario
            appState.setFormData({
                customer: '',
                style: '',
                folder: '',
                colorway: '',
                season: '',
                pattern: '',
                po: '',
                sampleType: '',
                nameTeam: '',
                gender: '',
                designer: ''
            });
            
            // Resetear placements
            appState.setPlacements([]);
            const firstPlacement = appState.createPlacement('FRONT');
            appState.addPlacement(firstPlacement);
            
            // Resetear logo
            const logoElement = document.getElementById('logoCliente');
            if (logoElement) {
                logoElement.style.display = 'none';
            }
            
            this.showStatus('🧹 Formulario limpiado correctamente');
        }
    }

    async exportPDF() {
        try {
            this.showStatus('📄 Generando PDF...', 'warning');
            
            // Implementar generación de PDF
            // Por ahora, solo un mensaje de placeholder
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showStatus('✅ PDF generado correctamente (función en desarrollo)', 'success');
            
        } catch (error) {
            console.error('Error al exportar PDF:', error);
            this.showStatus('❌ Error al generar PDF: ' + error.message, 'error');
        }
    }

    exportExcel() {
        try {
            this.showStatus('📊 Generando Excel...', 'warning');
            
            // Implementar generación de Excel
            // Por ahora, solo un mensaje de placeholder
            setTimeout(() => {
                this.showStatus('✅ Excel generado correctamente (función en desarrollo)', 'success');
            }, 1000);
            
        } catch (error) {
            console.error('Error al exportar Excel:', error);
            this.showStatus('❌ Error al generar Excel: ' + error.message, 'error');
        }
    }

    downloadZip() {
        try {
            this.showStatus('📦 Generando proyecto ZIP...', 'warning');
            
            // Implementar generación de ZIP
            // Por ahora, solo un mensaje de placeholder
            setTimeout(() => {
                this.showStatus('✅ ZIP generado correctamente (función en desarrollo)', 'success');
            }, 1000);
            
        } catch (error) {
            console.error('Error al generar ZIP:', error);
            this.showStatus('❌ Error al generar proyecto ZIP: ' + error.message, 'error');
        }
    }

    clearAllSpecs() {
        if (confirm('⚠️ ¿Estás seguro de que quieres eliminar TODAS las specs guardadas?\n\nEsta acción no se puede deshacer y se perderán todos los datos.')) {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('spec_')) {
                    localStorage.removeItem(key);
                }
            });
            
            render.renderSavedSpecsList();
            render.renderDashboard();
            
            this.showStatus('🗑️ Todas las specs han sido eliminadas', 'success');
        }
    }

    exportErrorLog() {
        try {
            const errors = appState.getState().errorLog;
            const exportData = {
                app: 'Tegra Spec Manager',
                version: '2.0.0',
                exportDate: new Date().toISOString(),
                totalErrors: errors.length,
                errors: errors
            };
            
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `TegraSpec_ErrorLog_${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            
            this.showStatus('✅ Log de errores exportado', 'success');
        } catch (error) {
            console.error('Error al exportar log:', error);
            this.showStatus('❌ Error al exportar log de errores', 'error');
        }
    }

    handleGearForSport() {
        const customerInput = document.getElementById('customer');
        const nameTeamInput = document.getElementById('name-team');
        
        if (!customerInput || !nameTeamInput) return;
        
        const customer = customerInput.value.toUpperCase().trim();
        if (customer !== 'GEAR FOR SPORT') return;
        
        const styleInput = document.getElementById('style');
        const poInput = document.getElementById('po');
        const searchTerm = (styleInput?.value || '') || (poInput?.value || '');
        
        const config = appState.getConfig();
        if (config && config.gearForSportTeamMap) {
            const teamKey = Object.keys(config.gearForSportTeamMap).find(key =>
                searchTerm.toUpperCase().includes(key)
            );
            
            if (teamKey) {
                nameTeamInput.value = config.gearForSportTeamMap[teamKey];
                appState.setFormData({ nameTeam: config.gearForSportTeamMap[teamKey] });
            }
        }
    }

    // Setup de event listeners adicionales
    setupAdditionalListeners() {
        // Excel file upload
        document.getElementById('excelFile')?.addEventListener('change', (e) => {
            uiManager.handleExcelUpload(e);
        });
        
        // Image upload for placements
        document.getElementById('placementImageInput')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const placementId = e.target.dataset.placementId;
            
            if (file && placementId) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    appState.updatePlacement(parseInt(placementId), { imageData: event.target.result });
                    this.showStatus(`✅ Imagen cargada para placement`, 'success');
                };
                reader.readAsDataURL(file);
            }
            
            e.target.value = '';
        });
        
        // Add placement button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#add-placement-btn')) {
                const placement = appState.createPlacement();
                appState.addPlacement(placement);
                this.showStatus('✅ Nuevo placement agregado', 'success');
            }
            
            if (e.target.closest('#save-spec-btn')) {
                this.saveSpec();
            }
            
            if (e.target.closest('#export-pdf-btn')) {
                this.exportPDF();
            }
            
            if (e.target.closest('#export-excel-btn')) {
                this.exportExcel();
            }
            
            if (e.target.closest('#export-zip-btn')) {
                this.downloadZip();
            }
            
            if (e.target.closest('#load-spec-btn')) {
                document.getElementById('excelFile').click();
            }
            
            if (e.target.closest('#clear-form-btn')) {
                this.clearForm();
            }
        });
        
        // Nav tabs
        document.addEventListener('click', (e) => {
            const navTab = e.target.closest('.nav-tab');
            if (navTab) {
                const tabName = navTab.dataset.tab;
                if (tabName) {
                    uiManager.showTab(tabName);
                }
            }
        });
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    const app = new TegraSpecApp();
    
    // Exponer métodos globales
    app.exposeGlobalMethods();
    
    // Setup listeners adicionales
    app.setupAdditionalListeners();
    
    // Inicializar aplicación
    await app.init();
    
    // Hacer referencia global a la app
    window.TegraSpecApp = app;
});

// Exportar para módulos
export default TegraSpecApp;
