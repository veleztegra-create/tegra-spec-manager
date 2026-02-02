// js/main.js - PUNTO DE ENTRADA PRINCIPAL CORREGIDO

console.log('🎯 Tegra Spec Manager - Inicializando aplicación');

// CONFIGURACIÓN DE MÓDULOS (ORDEN CRÍTICO)
const MODULES = [
    // 1. Configuraciones
    { type: 'config', path: 'js/config/app-config.js', name: 'AppConfig' },
    { type: 'config', path: 'js/config/teams-config.js', name: 'TeamsConfig' },
    { type: 'config', path: 'js/config/logos-config.js', name: 'LogoConfig' },
    { type: 'config', path: 'js/config/color-databases.js', name: 'ColorDatabases' },
    
    // 2. Utilerías
    { type: 'util', path: 'js/utils/helpers.js', name: 'Utils' },
    { type: 'util', path: 'js/utils/validators.js', name: 'Validators' },
    { type: 'util', path: 'js/utils/detectors.js', name: 'Detectors' },
    { type: 'util', path: 'js/utils/render-helpers.js', name: 'RenderHelpers' },
    
    // 3. Core
    { type: 'core', path: 'js/core/state-manager.js', name: 'StateManager' },
    { type: 'core', path: 'js/core/error-handler.js', name: 'ErrorHandler' },
    
    // 4. Módulos de datos
    { type: 'data', path: 'js/modules/data/client-manager.js', name: 'ClientManager' },
    { type: 'data', path: 'js/modules/data/specs-manager.js', name: 'SpecsManager' },
    { type: 'data', path: 'js/modules/data/storage-manager.js', name: 'StorageManager' },
    
    // 5. Módulos UI
    { type: 'ui', path: 'js/modules/ui/theme-manager.js', name: 'ThemeManager' },
    { type: 'ui', path: 'js/modules/ui/dashboard-manager.js', name: 'DashboardManager' },
    { type: 'ui', path: 'js/modules/ui/tabs-manager.js', name: 'TabsManager' },
    
    // 6. Módulos de placements (ORDEN ESPECÍFICO)
    { type: 'placement', path: 'js/modules/placements/placements-core.js', name: 'PlacementsCore' },
    { type: 'placement', path: 'js/modules/placements/placements-ui.js', name: 'PlacementsUI' },
    { type: 'placement', path: 'js/modules/placements/placements-colors.js', name: 'PlacementsColors' },
    { type: 'placement', path: 'js/modules/placements/placements-export.js', name: 'PlacementsExport' },
    
    // 7. Módulos de exportación
    { type: 'export', path: 'js/modules/export/pdf-exporter.js', name: 'PDFExporter' },
    { type: 'export', path: 'js/modules/export/excel-exporter.js', name: 'ExcelExporter' },
    { type: 'export', path: 'js/modules/export/zip-exporter.js', name: 'ZipExporter' }
];

// Estado de la aplicación
const AppState = {
    loadedModules: {},
    errors: [],
    initialized: false
};

// Función para cargar módulos secuencialmente
async function loadModulesSequentially() {
    console.log('📦 Iniciando carga secuencial de módulos...');
    
    for (let i = 0; i < MODULES.length; i++) {
        const module = MODULES[i];
        console.log(`📥 Cargando (${i+1}/${MODULES.length}): ${module.name}`);
        
        try {
            await loadModule(module);
            AppState.loadedModules[module.name] = true;
            console.log(`✅ ${module.name} cargado correctamente`);
        } catch (error) {
            console.error(`❌ Error al cargar ${module.name}:`, error);
            AppState.errors.push({
                module: module.name,
                error: error.message
            });
        }
    }
    
    console.log('✅ Todos los módulos cargados');
    console.log('📊 Estado:', {
        total: MODULES.length,
        success: Object.keys(AppState.loadedModules).length,
        errors: AppState.errors.length
    });
}

// Función para cargar un módulo individual
function loadModule(module) {
    return new Promise((resolve, reject) => {
        // Verificar si ya está cargado
        if (window[module.name]) {
            console.log(`⚠️ ${module.name} ya cargado, omitiendo...`);
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = module.path;
        script.async = false; // IMPORTANTE: carga síncrona
        
        script.onload = () => {
            // Verificar que el módulo se exportó correctamente
            setTimeout(() => {
                if (window[module.name] || module.type === 'config') {
                    resolve();
                } else {
                    reject(new Error(`Módulo ${module.name} no se exportó correctamente`));
                }
            }, 100);
        };
        
        script.onerror = () => {
            reject(new Error(`Error de red al cargar ${module.path}`));
        };
        
        document.head.appendChild(script);
    });
}

// Inicializar aplicación
async function initializeApp() {
    console.log('🚀 Inicializando Tegra Spec Manager...');
    
    try {
        // 1. Cargar módulos
        await loadModulesSequentially();
        
        // 2. Verificar módulos críticos
        const criticalModules = ['PlacementsCore', 'PlacementsUI', 'SpecsManager', 'TabsManager'];
        const missing = criticalModules.filter(m => !AppState.loadedModules[m]);
        
        if (missing.length > 0) {
            throw new Error(`Módulos críticos faltantes: ${missing.join(', ')}`);
        }
        
        // 3. Inicializar variables globales
        if (!window.globalPlacements) window.globalPlacements = [];
        if (!window.globalCurrentPlacementId) window.globalCurrentPlacementId = 1;
        
        // 4. Inicializar módulos
        if (window.PlacementsCore && window.PlacementsCore.initializePlacements) {
            window.PlacementsCore.initializePlacements();
        }
        
        if (window.TabsManager && window.TabsManager.init) {
            window.TabsManager.init();
        }
        
        if (window.ThemeManager && window.ThemeManager.init) {
            window.ThemeManager.init();
        }
        
        // 5. Configurar eventos
        setupGlobalEventListeners();
        
        // 6. Mostrar dashboard inicial
        if (window.TabsManager && window.TabsManager.showTab) {
            window.TabsManager.showTab('dashboard');
        }
        
        // 7. Actualizar dashboard
        if (window.DashboardManager && window.DashboardManager.updateDashboard) {
            setTimeout(() => {
                window.DashboardManager.updateDashboard();
                window.DashboardManager.updateDateTime();
                setInterval(() => window.DashboardManager.updateDateTime(), 60000);
            }, 1000);
        }
        
        AppState.initialized = true;
        console.log('🎉 Tegra Spec Manager inicializado correctamente');
        showAppStatus('✅ Aplicación lista para usar', 'success');
        
    } catch (error) {
        console.error('❌ Error fatal al inicializar:', error);
        showAppStatus(`❌ Error: ${error.message}`, 'error');
        
        // Modo de emergencia
        setTimeout(() => {
            if (confirm('La aplicación tuvo un error. ¿Cargar versión de emergencia?')) {
                loadEmergencyMode();
            }
        }, 2000);
    }
}

// Configurar event listeners globales
function setupGlobalEventListeners() {
    console.log('🔗 Configurando event listeners...');
    
    // Navegación por pestañas
    document.addEventListener('click', (e) => {
        const tabElement = e.target.closest('.nav-tab');
        if (tabElement && window.TabsManager && window.TabsManager.showTab) {
            const tabName = tabElement.getAttribute('data-tab');
            window.TabsManager.showTab(tabName);
        }
    });
    
    // Botones con data-tab
    document.addEventListener('click', (e) => {
        const button = e.target.closest('[data-tab]');
        if (button && !button.classList.contains('nav-tab') && window.TabsManager) {
            const tabName = button.getAttribute('data-tab');
            window.TabsManager.showTab(tabName);
        }
    });
    
    // Input de cliente para logo
    const customerInput = document.getElementById('customer');
    if (customerInput && window.ClientManager) {
        customerInput.addEventListener('input', () => {
            if (window.ClientManager.updateClientLogo) {
                window.ClientManager.updateClientLogo();
            }
        });
    }
    
    // Input de estilo para team/gender
    const styleInput = document.getElementById('style');
    if (styleInput) {
        styleInput.addEventListener('input', function() {
            // Detectar team
            if (window.Detectors && window.Detectors.detectTeamFromStyle) {
                const team = window.Detectors.detectTeamFromStyle(this.value);
                const nameTeamInput = document.getElementById('name-team');
                if (nameTeamInput && team) {
                    nameTeamInput.value = team;
                }
            }
            
            // Detectar gender
            if (window.Detectors && window.Detectors.extractGenderFromStyle) {
                const gender = window.Detectors.extractGenderFromStyle(this.value);
                const genderInput = document.getElementById('gender');
                if (genderInput && gender) {
                    genderInput.value = gender;
                }
            }
        });
    }
}

// Función para mostrar estado
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
        }, 4000);
    }
}
// Configurar auto-detección en el input de STYLE
const styleInput = document.getElementById('style');
if (styleInput && window.Detectors) {
    styleInput.addEventListener('input', window.Utils.debounce(function() {
        window.Detectors.autoDetectFromStyleInput(this);
    }, 500));
}

// Modo de emergencia
function loadEmergencyMode() {
    console.log('🆘 Cargando modo de emergencia...');
    
    // Cargar versiones simplificadas de los módulos críticos
    const emergencyScripts = [
        'js/modules/ui/tabs-manager.js',
        'js/modules/placements/placements-core.js',
        'js/modules/placements/placements-ui.js'
    ];
    
    emergencyScripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        document.head.appendChild(script);
    });
    
    setTimeout(() => {
        showAppStatus('🔧 Modo de emergencia activado', 'warning');
    }, 1000);
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// API global para debugging
window.TegraDebug = {
    getState: () => AppState,
    reloadModule: (moduleName) => {
        const module = MODULES.find(m => m.name === moduleName);
        if (module) {
            return loadModule(module);
        }
    },
    showModules: () => {
        console.table(MODULES.map(m => ({
            name: m.name,
            loaded: !!window[m.name],
            type: m.type
        })));
    }
};

console.log('✅ Main.js cargado - Esperando DOM...');
