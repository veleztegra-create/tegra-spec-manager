// js/main.js - VERSIÓN CORREGIDA Y FINAL
console.log('🎯 Tegra Spec Manager - Inicializando aplicación');

// ========== CONFIGURACIÓN DE MÓDULOS OPTIMIZADA ==========
// NOTA: Estos módulos NO están en index.html, los cargamos aquí:
const MODULES = [
    // Utilerías
    { type: 'util', path: 'js/utils/helpers.js', name: 'Utils' },
    { type: 'util', path: 'js/utils/validators.js', name: 'Validators' },
    { type: 'util', path: 'js/utils/detectors.js', name: 'Detectors' },
    { type: 'util', path: 'js/utils/render-helpers.js', name: 'RenderHelpers' },
    
    // Core
    { type: 'core', path: 'js/core/state-manager.js', name: 'StateManager' },
    { type: 'core', path: 'js/core/error-handler.js', name: 'ErrorHandler' },
    
    // Placements
    { type: 'placement', path: 'js/modules/placements/placements-core.js', name: 'PlacementsCore' },
    { type: 'placement', path: 'js/modules/placements/placements-ui.js', name: 'PlacementsUI' },
    { type: 'placement', path: 'js/modules/placements/placements-colors.js', name: 'PlacementsColors' },
    { type: 'placement', path: 'js/modules/placements/placements-export.js', name: 'PlacementsExport' },
    
    // Export
    { type: 'export', path: 'js/modules/export/pdf-exporter.js', name: 'PDFExporter' },
    { type: 'export', path: 'js/modules/export/excel-exporter.js', name: 'ExcelExporter' },
    { type: 'export', path: 'js/modules/export/zip-exporter.js', name: 'ZipExporter' }
];

// Estado de la aplicación
const AppState = {
    loadedModules: {},
    errors: [],
    initialized: false,
    configsReady: false
};

// ========== FUNCIONES AUXILIARES ==========

// Esperar a que un módulo global esté disponible
function waitForGlobal(moduleName, maxAttempts = 15, interval = 200) {
    return new Promise((resolve) => {
        let attempts = 0;
        
        const check = () => {
            if (window[moduleName]) {
                console.log(`✅ ${moduleName} disponible`);
                resolve(true);
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(check, interval);
            } else {
                console.warn(`⏳ ${moduleName} no disponible después de ${maxAttempts * interval}ms`);
                resolve(false);
            }
        };
        
        check();
    });
}

// Función segura para inicializar módulos
function safeInit(moduleName, initFunction, ...args) {
    try {
        if (window[moduleName] && typeof window[moduleName][initFunction] === 'function') {
            const result = window[moduleName][initFunction](...args);
            console.log(`✅ ${moduleName}.${initFunction}() ejecutado`);
            return result;
        } else {
            console.warn(`⚠️ ${moduleName}.${initFunction} no disponible`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Error en ${moduleName}.${initFunction}():`, error);
        if (window.ErrorHandler) {
            window.ErrorHandler.log(error, { module: moduleName, function: initFunction });
        }
        return null;
    }
}

// Cargar un módulo individual
function loadModule(module) {
    return new Promise((resolve) => {
        // Verificar si ya está cargado
        if (window[module.name] || AppState.loadedModules[module.name]) {
            console.log(`📌 ${module.name} ya cargado, omitiendo...`);
            AppState.loadedModules[module.name] = true;
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = module.path;
        script.async = false;
        script.setAttribute('data-module', module.name);
        
        script.onload = () => {
            setTimeout(() => {
                AppState.loadedModules[module.name] = true;
                console.log(`✅ ${module.type.toUpperCase()}: ${module.name} - OK`);
                resolve();
            }, 50);
        };
        
        script.onerror = () => {
            console.warn(`⚠️ No se pudo cargar ${module.name}, continuando...`);
            AppState.errors.push({
                module: module.name,
                error: `No se pudo cargar ${module.path}`
            });
            resolve(); // Continuar aunque falle
        };
        
        // Evitar duplicados
        if (!document.querySelector(`script[src="${module.path}"]`)) {
            document.head.appendChild(script);
        } else {
            console.log(`📌 Script para ${module.name} ya existe, omitiendo...`);
            resolve();
        }
    });
}

// Cargar módulos secuencialmente
async function loadModulesSequentially() {
    console.log('📦 Cargando módulos adicionales...');
    console.log(`📊 Total a cargar: ${MODULES.length} módulos`);
    
    for (let i = 0; i < MODULES.length; i++) {
        const module = MODULES[i];
        console.log(`📥 (${i+1}/${MODULES.length}): ${module.name} [${module.type}]`);
        await loadModule(module);
    }
    
    console.log('✅ Todos los módulos cargados');
}

// Verificar configuraciones críticas
async function checkCriticalConfigs() {
    console.log('🔍 Verificando configuraciones...');
    
    const criticalConfigs = [
        { name: 'Config', required: true },
        { name: 'TeamsConfig', required: false },
        { name: 'LogoConfig', required: false }
    ];
    
    for (const config of criticalConfigs) {
        const isAvailable = await waitForGlobal(config.name, 10, 200);
        
        if (config.required && !isAvailable) {
            throw new Error(`Configuración crítica faltante: ${config.name}`);
        }
    }
    
    AppState.configsReady = true;
    return true;
}

// Esperar módulos cargados en index.html
async function waitForIndexModules() {
    console.log('⏳ Esperando módulos de index.html...');
    
    const indexModules = [
        'ThemeManager',
        'DashboardManager', 
        'TabsManager',
        'ClientManager',
        'SpecsManager',
        'StorageManager'
    ];
    
    const results = await Promise.all(
        indexModules.map(module => waitForGlobal(module, 10, 300))
    );
    
    // Contar cuántos están disponibles
    const available = results.filter(Boolean).length;
    console.log(`📊 Módulos index.html: ${available}/${indexModules.length} disponibles`);
    
    return available >= 3; // Necesitamos al menos 3 para funcionar
}

// Configurar event listeners globales
function setupGlobalEventListeners() {
    console.log('🔗 Configurando event listeners globales...');
    
    // Auto-detección en input de STYLE
    const styleInput = document.getElementById('style');
    if (styleInput && window.Detectors) {
        styleInput.addEventListener('input', function() {
            if (window.Detectors.autoDetectFromStyleInput) {
                setTimeout(() => {
                    window.Detectors.autoDetectFromStyleInput(this);
                }, 300);
            }
        });
    }
    
    // Input de cliente
    const customerInput = document.getElementById('customer');
    if (customerInput && window.ClientManager) {
        customerInput.addEventListener('input', () => {
            if (window.ClientManager.updateClientLogo) {
                setTimeout(() => window.ClientManager.updateClientLogo(), 500);
            }
        });
    }
    
    // Botón para agregar placement
    const addPlacementBtn = document.getElementById('add-placement-btn');
    if (addPlacementBtn && window.PlacementsUI) {
        addPlacementBtn.addEventListener('click', () => {
            safeInit('PlacementsUI', 'addNewPlacement');
        });
    }
    
    // Botón para guardar spec
    const saveSpecBtn = document.getElementById('save-spec-btn');
    if (saveSpecBtn && window.SpecsManager) {
        saveSpecBtn.addEventListener('click', () => {
            // Recoger datos del formulario
            const specData = collectSpecFormData();
            if (specData) {
                safeInit('SpecsManager', 'saveSpec', specData);
                showAppStatus('Spec guardada correctamente', 'success');
            }
        });
    }
}

// Recoger datos del formulario de spec
function collectSpecFormData() {
    const fields = [
        'customer', 'style', 'name-team', 'gender', 
        'folder-num', 'season', 'designer', 'ink-type'
    ];
    
    const specData = {};
    let hasRequired = false;
    
    fields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element && element.value) {
            // Mapear nombres de campos
            const specKey = fieldId === 'style' ? 'styleNumber' : 
                           fieldId === 'name-team' ? 'teamName' :
                           fieldId === 'folder-num' ? 'folderNumber' :
                           fieldId === 'ink-type' ? 'inkType' : fieldId;
            
            specData[specKey] = element.value;
            
            if (fieldId === 'style' || fieldId === 'customer') {
                hasRequired = true;
            }
        }
    });
    
    // Agregar placements si existen
    if (window.StateManager) {
        const placements = window.StateManager.getPlacements();
        if (placements.length > 0) {
            specData.placements = placements;
        }
    }
    
    if (!hasRequired) {
        showAppStatus('Error: Se requiere Cliente y Style Number', 'error');
        return null;
    }
    
    return specData;
}

// Inicializar módulos en orden correcto
function initializeModules() {
    console.log('🔄 Inicializando módulos...');
    
    // Orden de inicialización CRÍTICO
    const initOrder = [
        { module: 'TabsManager', func: 'init' },
        { module: 'ThemeManager', func: 'init' },
        { module: 'PlacementsCore', func: 'initializePlacements' },
        { module: 'SpecsManager', func: 'init' },
        { module: 'DashboardManager', func: 'init' },
        { module: 'ClientManager', func: 'init' },
        { module: 'StorageManager', func: 'init' }
    ];
    
    // Ejecutar inicializaciones
    initOrder.forEach(item => {
        safeInit(item.module, item.func);
    });
}

// Configurar auto-updates
function setupAutoUpdates() {
    console.log('⏰ Configurando auto-updates...');
    
    // Actualizar fecha/hora cada minuto
    if (window.DashboardManager && window.DashboardManager.updateDateTime) {
        window.DashboardManager.updateDateTime();
        setInterval(() => {
            if (window.DashboardManager.updateDateTime) {
                window.DashboardManager.updateDateTime();
            }
        }, 60000);
    }
    
    // Actualizar dashboard cada 30 segundos
    if (window.DashboardManager && window.DashboardManager.updateDashboard) {
        setTimeout(() => {
            window.DashboardManager.updateDashboard();
        }, 1000);
        
        setInterval(() => {
            if (window.DashboardManager.updateDashboard) {
                window.DashboardManager.updateDashboard();
            }
        }, 30000);
    }
}

// Inicializar aplicación principal
async function initializeApp() {
    console.log('🚀 Inicializando Tegra Spec Manager v1.5...');
    
    try {
        // 1. Verificar configuraciones
        await checkCriticalConfigs();
        
        // 2. Esperar módulos de index.html
        const indexModulesReady = await waitForIndexModules();
        
        if (!indexModulesReady) {
            console.warn('⚠️ Pocos módulos de index.html disponibles');
            // Continuar de todos modos
        }
        
        // 3. Cargar módulos adicionales (los que NO están en index.html)
        await loadModulesSequentially();
        
        // 4. Inicializar variables globales
        if (!window.globalPlacements) window.globalPlacements = [];
        if (!window.globalCurrentPlacementId) window.globalCurrentPlacementId = 1;
        
        // 5. Inicializar módulos
        initializeModules();
        
        // 6. Configurar event listeners
        setupGlobalEventListeners();
        
        // 7. Mostrar dashboard inicial
        setTimeout(() => {
            if (window.TabsManager && window.TabsManager.showTab) {
                window.TabsManager.showTab('dashboard');
            } else {
                // Fallback básico
                showTab('dashboard');
            }
        }, 800);
        
        // 8. Configurar auto-updates
        setupAutoUpdates();
        
        // 9. Marcar como inicializado
        AppState.initialized = true;
        
        // 10. Mostrar resumen
        console.log('🎉 Tegra Spec Manager inicializado correctamente');
        console.log('📊 Resumen:', {
            totalModules: MODULES.length,
            loadedSuccessfully: Object.keys(AppState.loadedModules).length,
            errors: AppState.errors.length,
            configsReady: AppState.configsReady
        });
        
        showAppStatus('✅ Aplicación lista para usar', 'success');
        
        // 11. Si hay errores, mostrarlos como warnings
        if (AppState.errors.length > 0) {
            console.warn(`⚠️ Advertencias (${AppState.errors.length}):`);
            AppState.errors.forEach(err => {
                console.warn(`   - ${err.module}: ${err.error}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error fatal al inicializar:', error);
        showAppStatus(`❌ Error: ${error.message}`, 'error');
        
        // Intentar modo de recuperación
        setTimeout(initializeRecoveryMode, 1000);
    }
}

// Función de navegación básica (fallback)
function showTab(tabName) {
    const tabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(tc => tc.classList.remove('active'));
    
    const targetTab = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
    const targetContent = document.getElementById(tabName);
    
    if (targetTab) targetTab.classList.add('active');
    if (targetContent) targetContent.classList.add('active');
}

// Modo de recuperación
function initializeRecoveryMode() {
    console.log('🔄 Iniciando modo de recuperación...');
    
    // Configurar navegación básica
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            showTab(tabName);
        });
    });
    
    // Mostrar dashboard
    showTab('dashboard');
    
    showAppStatus('🔧 Modo de recuperación activado', 'warning');
}

// Mostrar mensaje de estado
function showAppStatus(message, type = 'info') {
    console.log(`📢 [${type.toUpperCase()}] ${message}`);
    
    const statusEl = document.getElementById('statusMessage');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `status-message status-${type}`;
        statusEl.style.display = 'block';
        
        setTimeout(() => {
            if (statusEl.textContent === message) {
                statusEl.style.display = 'none';
            }
        }, type === 'error' ? 8000 : 4000);
    }
}

// ========== INICIO DE LA APLICACIÓN ==========

// Esperar a que el DOM esté completamente cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeApp, 500); // Pequeño delay para estabilidad
    });
} else {
    setTimeout(initializeApp, 500);
}

// ========== API GLOBAL PARA DEBUGGING ==========
window.TegraDebug = {
    getState: () => ({ ...AppState }),
    
    showModules: () => {
        console.table(MODULES.map(m => ({
            name: m.name,
            path: m.path,
            loaded: !!window[m.name] || AppState.loadedModules[m.name],
            type: m.type
        })));
    },
    
    testConfig: () => {
        console.log('🧪 Test de configuraciones:');
        console.log('- Config:', window.Config ? '✅' : '❌');
        console.log('- TeamsConfig:', window.TeamsConfig ? '✅' : '❌');
        console.log('- LogoConfig:', window.LogoConfig ? '✅' : '❌');
        console.log('- Utils:', window.Utils ? '✅' : '❌');
    },
    
    reloadModule: (moduleName) => {
        const module = MODULES.find(m => m.name === moduleName);
        if (module) {
            delete window[moduleName];
            delete AppState.loadedModules[moduleName];
            return loadModule(module);
        }
        return Promise.reject('Módulo no encontrado');
    },
    
    showStats: () => {
        if (window.SpecsManager && window.SpecsManager.getStats) {
            const stats = window.SpecsManager.getStats();
            console.log('📈 Estadísticas:', stats);
            return stats;
        }
        return null;
    },
    
    forceReload: () => {
        console.log('🔄 Forzando recarga de la aplicación...');
        location.reload();
    }
};

console.log('✅ Main.js cargado - Esperando inicialización...');
