// js/main.js - PUNTO DE ENTRADA PRINCIPAL CORREGIDO Y SIMPLIFICADO
console.log('🎯 Tegra Spec Manager - Inicializando aplicación');

// ========== CONFIGURACIÓN DE MÓDULOS SIMPLIFICADA ==========
const MODULES = [
    // NOTA: Config, TeamsConfig y LogoConfig ya se cargan en index.html
    // Por eso NO están en esta lista
    
    // 1. Utilerías (RUTAS CORREGIDAS)
    { type: 'util', path: 'js/utils/helpers.js', name: 'Utils' },
    { type: 'util', path: 'js/utils/validators.js', name: 'Validators' },
    { type: 'util', path: 'js/utils/detectors.js', name: 'Detectors' },
    { type: 'util', path: 'js/utils/render-helpers.js', name: 'RenderHelpers' },
    
    // 2. Core
    { type: 'core', path: 'js/core/state-manager.js', name: 'StateManager' },
    { type: 'core', path: 'js/core/error-handler.js', name: 'ErrorHandler' },
    
    // 3. Módulos de datos
    { type: 'data', path: 'js/modules/data/client-manager.js', name: 'ClientManager' },
    { type: 'data', path: 'js/modules/data/specs-manager.js', name: 'SpecsManager' },
    { type: 'data', path: 'js/modules/data/storage-manager.js', name: 'StorageManager' },
    
    // 4. Módulos UI
    { type: 'ui', path: 'js/modules/ui/theme-manager.js', name: 'ThemeManager' },
    { type: 'ui', path: 'js/modules/ui/dashboard-manager.js', name: 'DashboardManager' },
    { type: 'ui', path: 'js/modules/ui/tabs-manager.js', name: 'TabsManager' },
    
    // 5. Módulos de placements
    { type: 'placement', path: 'js/modules/placements/placements-core.js', name: 'PlacementsCore' },
    { type: 'placement', path: 'js/modules/placements/placements-ui.js', name: 'PlacementsUI' },
    { type: 'placement', path: 'js/modules/placements/placements-colors.js', name: 'PlacementsColors' },
    { type: 'placement', path: 'js/modules/placements/placements-export.js', name: 'PlacementsExport' },
    
    // 6. Módulos de exportación
    { type: 'export', path: 'js/modules/export/pdf-exporter.js', name: 'PDFExporter' },
    { type: 'export', path: 'js/modules/export/excel-exporter.js', name: 'ExcelExporter' },
    { type: 'export', path: 'js/modules/export/zip-exporter.js', name: 'ZipExporter' }
];

// Estado de la aplicación
const AppState = {
    loadedModules: {},
    errors: [],
    initialized: false,
    
    // Verificar configuraciones críticas
    checkCriticalConfigs: function() {
        const criticalConfigs = [
            { name: 'Config', obj: window.Config, required: true },
            { name: 'TeamsConfig', obj: window.TeamsConfig, required: false },
            { name: 'LogoConfig', obj: window.LogoConfig, required: false }
        ];
        
        let allGood = true;
        criticalConfigs.forEach(config => {
            if (config.required && !config.obj) {
                console.error(`❌ Configuración crítica faltante: ${config.name}`);
                allGood = false;
            } else if (config.obj) {
                console.log(`✅ ${config.name} cargado`);
            }
        });
        
        return allGood;
    }
};

// Función para cargar módulos secuencialmente
async function loadModulesSequentially() {
    console.log('📦 Iniciando carga secuencial de módulos...');
    
    for (let i = 0; i < MODULES.length; i++) {
        const module = MODULES[i];
        console.log(`📥 Cargando (${i+1}/${MODULES.length}): ${module.name} [${module.type}]`);
        
        try {
            await loadModule(module);
            AppState.loadedModules[module.name] = true;
            console.log(`✅ ${module.type.toUpperCase()}: ${module.name} - OK`);
        } catch (error) {
            console.error(`❌ Error al cargar ${module.name}:`, error);
            AppState.errors.push({
                module: module.name,
                error: error.message,
                type: module.type
            });
        }
    }
}

// Función para cargar un módulo individual

function loadModule(module) {
    return new Promise((resolve, reject) => {
        // Verificar si ya está cargado - CON MÁS TOLERANCIA
        if (window[module.name] || AppState.loadedModules[module.name]) {
            console.log(`⚠️ ${module.name} ya cargado, omitiendo...`);
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = module.path;
        script.async = false;
        
        // Usar un identificador único para evitar duplicados
        script.setAttribute('data-module', module.name);
        
        script.onload = () => {
            setTimeout(() => {
                AppState.loadedModules[module.name] = true;
                resolve();
            }, 50);
        };
        
        script.onerror = () => {
            // No rechazar, solo registrar error
            console.warn(`⚠️ No se pudo cargar ${module.name}, continuando...`);
            AppState.errors.push({
                module: module.name,
                error: `No se pudo cargar ${module.path}`
            });
            resolve(); // RESOLVER DE TODOS MODOS, NO RECHAZAR
        };
        
        // Verificar que no exista ya el script
        const existingScript = document.querySelector(`script[data-module="${module.name}"]`);
        if (!existingScript) {
            document.head.appendChild(script);
        } else {
            console.log(`⚠️ Script para ${module.name} ya existe, omitiendo...`);
            resolve();
        }
    });
}

// Inicializar aplicación
async function initializeApp() {
    console.log('🚀 Inicializando Tegra Spec Manager...');
    console.log('📊 Verificando configuraciones...');
    
    try {
        // 1. Verificar configuraciones críticas
        if (!AppState.checkCriticalConfigs()) {
            throw new Error('Configuraciones críticas faltantes');
        }
        
        // 2. Cargar módulos
        await loadModulesSequentially();
        
        // 3. Verificar módulos críticos
        const criticalModules = ['PlacementsCore', 'PlacementsUI', 'SpecsManager', 'TabsManager'];
        const missingCritical = criticalModules.filter(m => !AppState.loadedModules[m] && !window[m]);
        
        if (missingCritical.length > 0) {
            console.warn(`⚠️ Módulos críticos faltantes: ${missingCritical.join(', ')}`);
            console.log('Intentando cargar versiones de respaldo...');
            // Continuar de todos modos, algunos módulos pueden estar en window
        }
        
        // 4. Inicializar variables globales
        if (!window.globalPlacements) window.globalPlacements = [];
        if (!window.globalCurrentPlacementId) window.globalCurrentPlacementId = 1;
        
        // 5. Inicializar módulos en orden correcto
        console.log('🔄 Inicializando módulos...');
        
        // TabsManager primero (para navegación)
        if (window.TabsManager && window.TabsManager.init) {
            window.TabsManager.init();
        } else {
            console.warn('TabsManager no disponible, usando navegación básica');
            setupBasicTabs();
        }
        
        // ThemeManager
        if (window.ThemeManager && window.ThemeManager.init) {
            window.ThemeManager.init();
        }
        
        // PlacementsCore
        if (window.PlacementsCore && window.PlacementsCore.initializePlacements) {
            window.PlacementsCore.initializePlacements();
        }
        
        // SpecsManager
        if (window.SpecsManager && window.SpecsManager.init) {
            window.SpecsManager.init();
        }
        
        // ClientManager
        if (window.ClientManager && window.ClientManager.init) {
            window.ClientManager.init();
        }
        
        // DashboardManager
        if (window.DashboardManager && window.DashboardManager.updateDashboard) {
            setTimeout(() => {
                window.DashboardManager.updateDashboard();
                window.DashboardManager.updateDateTime();
                setInterval(() => {
                    if (window.DashboardManager.updateDateTime) {
                        window.DashboardManager.updateDateTime();
                    }
                }, 60000);
            }, 500);
        }
        
        // 6. Configurar event listeners globales
        setupGlobalEventListeners();
        
        // 7. Mostrar dashboard inicial
        if (window.TabsManager && window.TabsManager.showTab) {
            window.TabsManager.showTab('dashboard');
        } else {
            showTab('dashboard');
        }
        
        AppState.initialized = true;
        
        // 8. Mostrar resumen
        console.log('🎉 Tegra Spec Manager inicializado correctamente');
        console.log('📊 Resumen:', {
            totalModules: MODULES.length,
            loadedSuccessfully: Object.keys(AppState.loadedModules).length,
            errors: AppState.errors.length,
            configs: {
                Config: !!window.Config,
                TeamsConfig: !!window.TeamsConfig,
                LogoConfig: !!window.LogoConfig
            }
        });
        
        showAppStatus('✅ Aplicación lista para usar', 'success');
        
        // 9. Si hay errores, mostrarlos pero no bloquear
        if (AppState.errors.length > 0) {
            console.warn(`⚠️ Se encontraron ${AppState.errors.length} errores no críticos:`);
            AppState.errors.forEach(err => {
                console.warn(`   - ${err.module}: ${err.error}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error fatal al inicializar:', error);
        showAppStatus(`❌ Error: ${error.message}`, 'error');
        
        // Intentar modo mínimo funcional
        setTimeout(() => {
            console.log('🔄 Intentando modo mínimo...');
            initializeMinimalMode();
        }, 1000);
    }
}

// Navegación básica de pestañas (fallback)
function setupBasicTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Remover activo de todos
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            // Activar actual
            this.classList.add('active');
            const targetTab = document.getElementById(tabName);
            if (targetTab) {
                targetTab.classList.add('active');
            }
        });
    });
}

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

// Configurar event listeners globales
function setupGlobalEventListeners() {
    console.log('🔗 Configurando event listeners...');
    
    // Navegación por pestañas (si no hay TabsManager)
    if (!window.TabsManager) {
        document.addEventListener('click', (e) => {
            const tabElement = e.target.closest('.nav-tab');
            if (tabElement) {
                const tabName = tabElement.getAttribute('data-tab');
                showTab(tabName);
            }
        });
    }
    
    // Auto-detección en input de STYLE
    const styleInput = document.getElementById('style');
    if (styleInput && window.Detectors) {
        styleInput.addEventListener('input', function() {
            if (window.Detectors.autoDetectFromStyleInput) {
                window.Detectors.autoDetectFromStyleInput(this);
            }
        });
    }
}

// Modo mínimo funcional
function initializeMinimalMode() {
    console.log('🔧 Iniciando modo mínimo funcional...');
    
    // Cargar solo lo esencial
    const essentialScripts = [
        'js/modules/ui/tabs-manager.js',
        'js/modules/placements/placements-ui.js'
    ];
    
    essentialScripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        document.head.appendChild(script);
    });
    
    // Configurar navegación básica
    setTimeout(() => {
        setupBasicTabs();
        showAppStatus('🔧 Modo mínimo activado', 'warning');
    }, 1500);
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

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    setTimeout(initializeApp, 100); // Dar tiempo extra
}

// API global para debugging
window.TegraDebug = {
    getState: () => AppState,
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
    }
};

console.log('✅ Main.js cargado - Esperando DOM...');
