// js/modules/data/specs-manager.js
console.log('🔄 Cargando módulo SpecsManager...');

const SpecsManager = (function() {
    // ========== CONFIGURACIÓN ==========
    const CONFIG = {
        STORAGE_PREFIX: 'spec_',
        AUTO_SAVE_INTERVAL: 120000, // 2 minutos
        MAX_SPECS: 100,
        BACKUP_ENABLED: true
    };
    
    // ========== FUNCIONES PRIVADAS ==========
    function generateSpecId(style) {
        console.log('🔑 Generando ID de spec...');
        try {
            const timestamp = Date.now();
            const stylePart = style ? style.replace(/\s+/g, '_').substring(0, 20) : 'SinEstilo';
            const random = Math.floor(Math.random() * 1000);
            return `${CONFIG.STORAGE_PREFIX}${stylePart}_${timestamp}_${random}`;
        } catch (error) {
            console.error('❌ Error en generateSpecId:', error);
            return `${CONFIG.STORAGE_PREFIX}backup_${Date.now()}`;
        }
    }
    
    function validateSpecData(data) {
        console.log('🔍 Validando datos de spec...');
        try {
            if (!data) {
                throw new Error('Datos de spec vacíos');
            }
            
            const requiredFields = ['customer', 'style'];
            for (const field of requiredFields) {
                if (!data[field]) {
                    console.warn(`⚠️ Campo requerido faltante: ${field}`);
                }
            }
            
            // Validar placements
            if (data.placements && !Array.isArray(data.placements)) {
                console.warn('⚠️ Placements no es un array, convirtiendo...');
                data.placements = [];
            }
            
            console.log('✅ Validación de spec completada');
            return true;
        } catch (error) {
            console.error('❌ Error en validateSpecData:', error);
            return false;
        }
    }
    
    function showStatus(message, type = 'info') {
        console.log(`📢 [${type.toUpperCase()}] ${message}`);
        
        if (window.AppManager && window.AppManager.showStatus) {
            window.AppManager.showStatus(message, type);
            return;
        }
        
        // Fallback básico
        const statusEl = document.getElementById('statusMessage');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `status-message status-${type}`;
            statusEl.style.display = 'block';
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 4000);
        }
    }
    
    // ========== FUNCIONES PÚBLICAS ==========
    function saveCurrentSpec() {
        console.log('💾 Guardando spec actual...');
        try {
            const data = collectData();
            
            if (!validateSpecData(data)) {
                showStatus('❌ Error: Datos de spec inválidos', 'error');
                return false;
            }
            
            const style = data.style || 'SinEstilo_' + Date.now();
            const storageKey = generateSpecId(style);
            
            // Asegurar que todos los campos necesarios estén presentes
            data.savedAt = new Date().toISOString();
            data.lastModified = new Date().toISOString();
            data.version = window.Config?.APP?.VERSION || '1.0.0';
            
            // Asegurar specialties en placements
            if (data.placements && Array.isArray(data.placements)) {
                const placements = window.PlacementsCore ? 
                    window.PlacementsCore.getAllPlacements() : 
                    window.globalPlacements || [];
                
                data.placements.forEach((placement, index) => {
                    const currentPlacement = placements[index];
                    if (currentPlacement) {
                        const specialtiesField = document.getElementById(`specialties-${currentPlacement.id}`);
                        if (specialtiesField) {
                            placement.specialties = specialtiesField.value;
                        }
                        
                        const instructionsField = document.getElementById(`special-instructions-${currentPlacement.id}`);
                        if (instructionsField) {
                            placement.specialInstructions = instructionsField.value;
                        }
                    }
                });
            }
            
            // Guardar en localStorage
            localStorage.setItem(storageKey, JSON.stringify(data));
            
            // Actualizar dashboard
            if (window.DashboardManager && window.DashboardManager.updateDashboard) {
                window.DashboardManager.updateDashboard();
            }
            
            // Actualizar lista de specs
            if (window.SpecsManager && window.SpecsManager.loadSavedSpecsList) {
                window.SpecsManager.loadSavedSpecsList();
            }
            
            showStatus(`✅ Spec "${style}" guardada correctamente`, 'success');
            
            // Ofrecer ver specs guardadas
            setTimeout(() => {
                if (confirm('¿Deseas ver todas las specs guardadas?')) {
                    if (window.TabsManager && window.TabsManager.showTab) {
                        window.TabsManager.showTab('saved-specs');
                    }
                }
            }, 1000);
            
            return storageKey;
            
        } catch (error) {
            console.error('❌ Error al guardar spec:', error);
            showStatus('❌ Error al guardar: ' + error.message, 'error');
            return false;
        }
    }
    
    function collectData() {
        console.log('📦 Recopilando datos de spec...');
        try {
            const generalData = {
                customer: document.getElementById('customer')?.value || '',
                style: document.getElementById('style')?.value || '',
                folder: document.getElementById('folder-num')?.value || '',
                colorway: document.getElementById('colorway')?.value || '',
                season: document.getElementById('season')?.value || '',
                pattern: document.getElementById('pattern')?.value || '',
                po: document.getElementById('po')?.value || '',
                sampleType: document.getElementById('sample-type')?.value || '',
                nameTeam: document.getElementById('name-team')?.value || '',
                gender: document.getElementById('gender')?.value || '',
                designer: document.getElementById('designer')?.value || ''
            };
            
            // Obtener placements
            let placementsData = [];
            
            if (window.PlacementsCore && typeof window.PlacementsCore.getAllPlacements === 'function') {
                const placements = window.PlacementsCore.getAllPlacements();
                
                placementsData = placements.map(placement => ({
                    id: placement.id,
                    type: placement.type,
                    name: placement.name,
                    imageData: placement.imageData,
                    colors: (placement.colors || []).map(c => ({
                        id: c.id,
                        type: c.type,
                        val: c.val,
                        screenLetter: c.screenLetter
                    })),
                    placementDetails: placement.placementDetails,
                    dimensions: placement.dimensions,
                    width: placement.width,
                    height: placement.height,
                    temp: placement.temp,
                    time: placement.time,
                    specialties: placement.specialties,
                    specialInstructions: placement.specialInstructions,
                    inkType: placement.inkType,
                    // Parámetros de impresión
                    meshColor: placement.meshColor,
                    meshWhite: placement.meshWhite,
                    meshBlocker: placement.meshBlocker,
                    durometer: placement.durometer,
                    strokes: placement.strokes,
                    angle: placement.angle,
                    pressure: placement.pressure,
                    speed: placement.speed,
                    additives: placement.additives
                }));
            } else {
                // Fallback usando globalPlacements
                const placements = window.globalPlacements || [];
                placementsData = placements.map(placement => ({
                    id: placement.id,
                    type: placement.type,
                    name: placement.name,
                    imageData: placement.imageData,
                    colors: placement.colors || [],
                    placementDetails: placement.placementDetails,
                    dimensions: placement.dimensions,
                    width: placement.width,
                    height: placement.height,
                    temp: placement.temp,
                    time: placement.time,
                    specialties: placement.specialties,
                    specialInstructions: placement.specialInstructions,
                    inkType: placement.inkType
                }));
            }
            
            const completeData = {
                ...generalData,
                placements: placementsData,
                savedAt: new Date().toISOString(),
                appVersion: window.Config?.APP?.VERSION || '1.0.0'
            };
            
            console.log('✅ Datos recopilados:', {
                customer: completeData.customer,
                style: completeData.style,
                placements: completeData.placements?.length || 0
            });
            
            return completeData;
            
        } catch (error) {
            console.error('❌ Error en collectData:', error);
            return {
                error: error.message,
                savedAt: new Date().toISOString()
            };
        }
    }
    
    function loadSpecData(data) {
        console.log('📂 Cargando datos de spec...');
        try {
            if (!data) {
                showStatus('❌ No hay datos para cargar', 'error');
                return false;
            }
            
            // Cargar datos generales
            const fields = [
                { id: 'customer', value: data.customer },
                { id: 'style', value: data.style },
                { id: 'folder-num', value: data.folder },
                { id: 'colorway', value: data.colorway },
                { id: 'season', value: data.season },
                { id: 'pattern', value: data.pattern },
                { id: 'po', value: data.po },
                { id: 'sample-type', value: data.sampleType },
                { id: 'name-team', value: data.nameTeam },
                { id: 'gender', value: data.gender },
                { id: 'designer', value: data.designer }
            ];
            
            fields.forEach(field => {
                const element = document.getElementById(field.id);
                if (element) {
                    element.value = field.value || '';
                }
            });
            
            // Limpiar placements existentes
            if (window.PlacementsCore && window.PlacementsCore.clearAllPlacements) {
                window.PlacementsCore.clearAllPlacements();
            } else {
                // Fallback
                const container = document.getElementById('placements-container');
                const tabs = document.getElementById('placements-tabs');
                if (container) container.innerHTML = '';
                if (tabs) tabs.innerHTML = '';
                window.globalPlacements = [];
            }
            
            // Cargar placements
            if (data.placements && Array.isArray(data.placements)) {
                data.placements.forEach((placementData, index) => {
                    // Crear nuevo placement
                    let placementId;
                    
                    if (index === 0) {
                        // Primer placement
                        if (window.PlacementsCore && window.PlacementsCore.addNewPlacement) {
                            placementId = window.PlacementsCore.addNewPlacement(placementData.type, true);
                        } else {
                            placementId = 1;
                            const newPlacement = {
                                id: placementId,
                                type: placementData.type || 'FRONT',
                                name: placementData.name || 'Placement 1',
                                imageData: null,
                                colors: [],
                                placementDetails: '#.#" FROM COLLAR SEAM',
                                dimensions: 'SIZE: (W) ##" X (H) ##"',
                                temp: '320 °F',
                                time: '1:40 min',
                                specialties: '',
                                specialInstructions: '',
                                inkType: 'WATER'
                            };
                            window.globalPlacements = [newPlacement];
                        }
                    } else {
                        // Placements adicionales
                        if (window.PlacementsCore && window.PlacementsCore.addNewPlacement) {
                            placementId = window.PlacementsCore.addNewPlacement(placementData.type);
                        } else {
                            placementId = Date.now() + index;
                            const newPlacement = {
                                id: placementId,
                                type: placementData.type || `Placement ${index + 1}`,
                                name: placementData.name || `Placement ${index + 1}`,
                                imageData: null,
                                colors: [],
                                placementDetails: '#.#" FROM COLLAR SEAM',
                                dimensions: 'SIZE: (W) ##" X (H) ##"',
                                temp: '320 °F',
                                time: '1:40 min',
                                specialties: '',
                                specialInstructions: '',
                                inkType: 'WATER'
                            };
                            window.globalPlacements.push(newPlacement);
                        }
                    }
                    
                    // Obtener el placement actual
                    const placements = window.PlacementsCore ? 
                        window.PlacementsCore.getAllPlacements() : 
                        window.globalPlacements;
                    
                    const placement = placements.find(p => p.id === placementId);
                    
                    if (placement) {
                        // Actualizar datos del placement
                        Object.keys(placementData).forEach(key => {
                            if (key !== 'id' && key !== 'colors') {
                                placement[key] = placementData[key];
                            }
                        });
                        
                        // Cargar colores
                        if (placementData.colors && Array.isArray(placementData.colors)) {
                            placement.colors = placementData.colors;
                        }
                        
                        // Cargar imagen si existe
                        if (placementData.imageData) {
                            placement.imageData = placementData.imageData;
                            
                            const img = document.getElementById(`placement-image-preview-${placementId}`);
                            const imageActions = document.getElementById(`placement-image-actions-${placementId}`);
                            
                            if (img && imageActions) {
                                img.src = placementData.imageData;
                                img.style.display = 'block';
                                imageActions.style.display = 'flex';
                            }
                        }
                        
                        // Actualizar UI del placement
                        if (window.PlacementsUI && window.PlacementsUI.updatePlacementUI) {
                            window.PlacementsUI.updatePlacementUI(placementId);
                        }
                        
                        // Renderizar colores
                        if (window.PlacementsColors && window.PlacementsColors.renderPlacementColors) {
                            window.PlacementsColors.renderPlacementColors(placementId);
                        }
                        
                        // Actualizar estaciones
                        if (window.PlacementsExport && window.PlacementsExport.updatePlacementStations) {
                            window.PlacementsExport.updatePlacementStations(placementId);
                        }
                    }
                });
            } else {
                // Si no hay placements, inicializar uno por defecto
                if (window.PlacementsUI && window.PlacementsUI.initializePlacements) {
                    window.PlacementsUI.initializePlacements();
                }
            }
            
            // Actualizar UI
            if (window.PlacementsUI && window.PlacementsUI.updatePlacementsTabs) {
                window.PlacementsUI.updatePlacementsTabs();
            }
            
            // Mostrar primer placement
            if (window.PlacementsUI && window.PlacementsUI.showPlacement) {
                const placements = window.PlacementsCore ? 
                    window.PlacementsCore.getAllPlacements() : 
                    window.globalPlacements;
                
                if (placements.length > 0) {
                    window.PlacementsUI.showPlacement(placements[0].id);
                }
            }
            
            // Actualizar logo del cliente
            if (window.ClientManager && window.ClientManager.updateClientLogo) {
                window.ClientManager.updateClientLogo();
            } else if (window.updateClientLogo) {
                window.updateClientLogo();
            }
            
            // Cambiar a pestaña de spec creator
            if (window.TabsManager && window.TabsManager.showTab) {
                window.TabsManager.showTab('spec-creator');
            }
            
            showStatus('✅ Spec cargada correctamente', 'success');
            return true;
            
        } catch (error) {
            console.error('❌ Error en loadSpecData:', error);
            showStatus('❌ Error al cargar spec: ' + error.message, 'error');
            return false;
        }
    }
    
    function loadSavedSpecsList() {
        console.log('📋 Cargando lista de specs guardadas...');
        try {
            const list = document.getElementById('saved-specs-list');
            if (!list) {
                console.warn('⚠️ Elemento saved-specs-list no encontrado');
                return;
            }
            
            const specs = Object.keys(localStorage).filter(key => key.startsWith(CONFIG.STORAGE_PREFIX));
            
            if (specs.length === 0) {
                list.innerHTML = `
                    <p style="text-align: center; color: var(--text-secondary); padding: 30px;">
                        <i class="fas fa-database" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        No hay specs guardadas. Crea una nueva spec para verla aquí.
                    </p>
                `;
                return;
            }
            
            list.innerHTML = '';
            
            specs.forEach(key => {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    const div = document.createElement('div');
                    div.style.cssText = "padding:15px; border-bottom:1px solid var(--border-dark); display:flex; justify-content:space-between; align-items:center; transition: var(--transition);";
                    div.innerHTML = `
                        <div style="flex: 1;">
                            <div style="font-weight: 700; color: var(--primary);">${data.style || 'N/A'}</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">Cliente: ${data.customer || 'N/A'} | Colorway: ${data.colorway || 'N/A'}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">Guardado: ${new Date(data.savedAt).toLocaleDateString('es-ES')}</div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-primary btn-sm" onclick='window.SpecsManager.loadSpecData(${JSON.stringify(data)})'><i class="fas fa-edit"></i> Cargar</button>
                            <button class="btn btn-outline btn-sm" onclick="window.SpecsManager.downloadSingleSpec('${key}')"><i class="fas fa-download"></i> JSON</button>
                            <button class="btn btn-danger btn-sm" onclick="window.SpecsManager.deleteSpec('${key}')"><i class="fas fa-trash"></i></button>
                        </div>
                    `;
                    list.appendChild(div);
                } catch (e) {
                    console.error('Error al parsear spec guardada:', key, e);
                    localStorage.removeItem(key);
                }
            });
            
            console.log(`✅ Lista de specs cargada: ${specs.length} specs`);
            
        } catch (error) {
            console.error('❌ Error en loadSavedSpecsList:', error);
        }
    }
    
    function downloadSingleSpec(key) {
        console.log(`📥 Descargando spec: ${key}`);
        try {
            const data = JSON.parse(localStorage.getItem(key));
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `TegraSpec_${data.style || 'Backup'}.json`);
            document.body.appendChild(downloadAnchorNode); 
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            showStatus('✅ Spec descargada como JSON', 'success');
        } catch (e) {
            console.error('❌ Error al descargar spec:', e);
            showStatus('❌ Error al descargar la spec', 'error');
        }
    }
    
    function deleteSpec(key) {
        console.log(`🗑️ Eliminando spec: ${key}`);
        if (confirm('¿Estás seguro de que quieres eliminar esta spec?')) {
            localStorage.removeItem(key);
            
            // Recargar lista
            if (window.SpecsManager && window.SpecsManager.loadSavedSpecsList) {
                window.SpecsManager.loadSavedSpecsList();
            }
            
            // Actualizar dashboard
            if (window.DashboardManager && window.DashboardManager.updateDashboard) {
                window.DashboardManager.updateDashboard();
            }
            
            showStatus('🗑️ Spec eliminada', 'success');
        }
    }
    
    function clearAllSpecs() {
        console.log('🗑️ Eliminando todas las specs...');
        if (confirm('⚠️ ¿Estás seguro de que quieres eliminar TODAS las specs guardadas?\n\nEsta acción no se puede deshacer y se perderán todos los datos.')) {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(CONFIG.STORAGE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            
            // Recargar lista
            if (window.SpecsManager && window.SpecsManager.loadSavedSpecsList) {
                window.SpecsManager.loadSavedSpecsList();
            }
            
            // Actualizar dashboard
            if (window.DashboardManager && window.DashboardManager.updateDashboard) {
                window.DashboardManager.updateDashboard();
            }
            
            showStatus('🗑️ Todas las specs han sido eliminadas', 'success');
        }
    }
    
    function clearForm() {
        console.log('🧹 Limpiando formulario...');
        if (confirm('⚠️ ¿Estás seguro de que quieres limpiar todo el formulario?\n\nSe perderán todos los datos no guardados.\n\n¿Continuar?')) {
            // Limpiar campos generales
            document.querySelectorAll('input:not(#folder-num), textarea, select').forEach(i => {
                if (i.type !== 'button' && i.type !== 'submit') {
                    i.value = '';
                }
            });
            document.getElementById('designer').value = '';
            
            // Limpiar placements
            if (window.PlacementsCore && window.PlacementsCore.clearAllPlacements) {
                window.PlacementsCore.clearAllPlacements();
            } else {
                const container = document.getElementById('placements-container');
                const tabs = document.getElementById('placements-tabs');
                if (container) container.innerHTML = '';
                if (tabs) tabs.innerHTML = '';
                window.globalPlacements = [];
            }
            
            // Inicializar placements
            if (window.PlacementsUI && window.PlacementsUI.initializePlacements) {
                window.PlacementsUI.initializePlacements();
            }
            
            // Ocultar logo
            const logoElement = document.getElementById('logoCliente');
            if (logoElement) {
                logoElement.style.display = 'none';
            }
            
            showStatus('🧹 Formulario limpiado correctamente', 'success');
        }
    }
    
    function autoSave() {
        console.log('🤖 Auto-guardando...');
        try {
            // Solo auto-guardar si hay datos
            const style = document.getElementById('style')?.value;
            const customer = document.getElementById('customer')?.value;
            
            if (style || customer) {
                const data = collectData();
                if (validateSpecData(data)) {
                    const backupKey = `${CONFIG.STORAGE_PREFIX}autosave_${Date.now()}`;
                    localStorage.setItem(backupKey, JSON.stringify(data));
                    console.log('✅ Auto-guardado completado');
                }
            }
        } catch (error) {
            console.error('❌ Error en autoSave:', error);
        }
    }
    
    // ========== INICIALIZACIÓN ==========
    function init() {
        console.log('🚀 Inicializando SpecsManager...');
        
        // Configurar auto-guardado
        if (CONFIG.AUTO_SAVE_INTERVAL > 0) {
            setInterval(autoSave, CONFIG.AUTO_SAVE_INTERVAL);
            console.log(`⏰ Auto-guardado configurado cada ${CONFIG.AUTO_SAVE_INTERVAL / 60000} minutos`);
        }
        
        // Cargar lista inicial de specs
        setTimeout(() => {
            loadSavedSpecsList();
        }, 2000);
        
        console.log('✅ SpecsManager inicializado');
    }
    
    // ========== EXPORTACIÓN PÚBLICA ==========
    return {
        // Funciones principales
        saveCurrentSpec,
        collectData,
        loadSpecData,
        loadSavedSpecsList,
        downloadSingleSpec,
        deleteSpec,
        clearAllSpecs,
        clearForm,
        autoSave,
        
        // Utilidades
        validateSpecData,
        generateSpecId,
        
        // Inicialización
        init
    };
})();

// ========== EXPORTACIÓN GLOBAL ==========
window.SpecsManager = SpecsManager;
window.saveCurrentSpec = SpecsManager.saveCurrentSpec; // Para compatibilidad
window.collectData = SpecsManager.collectData; // Para compatibilidad
window.loadSpecData = SpecsManager.loadSpecData; // Para compatibilidad
window.loadSavedSpecsList = SpecsManager.loadSavedSpecsList; // Para compatibilidad
window.clearAllSpecs = SpecsManager.clearAllSpecs; // Para compatibilidad
window.clearForm = SpecsManager.clearForm; // Para compatibilidad

console.log('✅ Módulo SpecsManager completamente cargado');

// Inicialización automática
setTimeout(() => {
    if (window.SpecsManager && window.SpecsManager.init) {
        window.SpecsManager.init();
    }
}, 1000);
