// js/main.js - PUNTO DE ENTRADA PRINCIPAL DE TEGRA SPEC MANAGER
console.log('🎯 Tegra Spec Manager - Punto de entrada principal cargado');

// ========== CONFIGURACIÓN INICIAL ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, iniciando aplicación...');
    
    // 1. Verificar configuraciones críticas
    checkRequiredConfigs();
    
    // 2. Inicializar módulos
    initializeModules();
    
    // 3. Configurar eventos globales (solo los que no tienen módulo)
    setupGlobalEventListeners();
    
    // 4. Mostrar estado inicial
    showAppStatus('✅ Tegra Spec Manager inicializado', 'success');
    
    console.log('✅ Aplicación inicializada correctamente');
});

// ========== VERIFICAR CONFIGURACIONES REQUERIDAS ==========
function checkRequiredConfigs() {
    console.log('🔍 Verificando configuraciones...');
    
    // Verificar Config
    if (!window.Config) {
        console.error('❌ ERROR: Config no está definida');
        console.log('💡 Asegúrate que config.js se cargue antes que main.js');
        
        // Crear configuración mínima de emergencia
        window.Config = {
            APP: { VERSION: '1.0.0', NAME: 'Tegra Spec Manager' },
            COLOR_DATABASES: {
                PANTONE: {},
                GEARFORSPORT: {},
                RAL: {},
                CUSTOM: {}
            },
            INK_PRESETS: {
                WATER: { temp: '320 °F', time: '1:40 min' },
                PLASTISOL: { temp: '320 °F', time: '1:00 min' },
                SILICONE: { temp: '300 °F', time: '2:00 min' }
            },
            METALLIC_CODES: [],
            GENDER_MAP: {},
            PLACEMENT_TYPES: [],
            INK_TYPES: [],
            DESIGNERS: []
        };
    } else {
        console.log('✅ Config cargada correctamente');
    }
    
    // Verificar LogoConfig
    if (!window.LogoConfig) {
        console.warn('⚠️ ADVERTENCIA: LogoConfig no está definida');
        // Configuración básica de emergencia
        window.LogoConfig = {
            'NIKE': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Nike-Logotipo-PNG-Photo.png',
            'FANATICS': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Fanatics_company_logo.svg.png',
            'GEAR FOR SPORT': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png'
        };
    } else {
        console.log('✅ LogoConfig cargada correctamente');
    }
    
    // Verificar TeamsConfig
    if (!window.TeamsConfig) {
        console.warn('⚠️ ADVERTENCIA: TeamsConfig no está definida');
    } else {
        console.log('✅ TeamsConfig cargada correctamente');
    }
    
    // Verificar módulos core existentes
    if (!window.Utils) {
        console.warn('⚠️ Utils no está definida - algunas funciones pueden fallar');
    }
    
    if (!window.stateManager) {
        console.warn('⚠️ stateManager no está definido');
    }
    
    console.log('✅ Configuraciones verificadas');
}

// ========== INICIALIZAR MÓDULOS ==========
function initializeModules() {
    console.log('📦 Inicializando módulos...');
    
    // 1. Cargar módulo de tema (UI)
    loadThemeModule();
    
    // 2. Cargar módulo de dashboard (UI)
    loadDashboardModule();
    
    // 3. Cargar módulo de pestañas (UI)
    loadTabsModule();
    
    // 4. Cargar módulo de clientes (Data)
    loadClientModule();
    
    // 5. NUEVO: Cargar módulo de placements (CRÍTICO)
    loadPlacementsModule();
    
    // 6. Inicializar variables globales esenciales
    initGlobalVariables();
    
    // 7. Cargar handlers especiales (sin módulo aún)
    loadSpecialHandlers();
    
    console.log('✅ Todos los módulos cargados');
}

// Agregar esta nueva función:
function loadPlacementsModule() {
    console.log('📍 Cargando módulo de placements...');
    
    // Cargar core primero
    const coreScript = document.createElement('script');
    coreScript.src = 'js/modules/placements/placements-core.js';
    
    coreScript.onload = function() {
        console.log('✅ PlacementsCore cargado');
        
        // Cargar UI después
        const uiScript = document.createElement('script');
        uiScript.src = 'js/modules/placements/placements-ui.js';
        
        uiScript.onload = function() {
            console.log('✅ PlacementsUI cargado');
            
            // Inicializar UI de placements
            if (window.PlacementsUI && window.PlacementsUI.initializePlacementsUI) {
                setTimeout(() => {
                    window.PlacementsUI.initializePlacementsUI();
                }, 500);
            }
        };
        
        uiScript.onerror = function() {
            console.error('❌ Error al cargar PlacementsUI');
        };
        
        document.head.appendChild(uiScript);
    };
    
    coreScript.onerror = function() {
        console.error('❌ Error al cargar PlacementsCore');
    };
    
    document.head.appendChild(coreScript);
}
// ========== FUNCIONES DE CARGA DE MÓDULOS ==========

function loadThemeModule() {
    console.log('🎨 Cargando módulo de tema...');
    
    const script = document.createElement('script');
    script.src = 'js/modules/ui/theme-manager.js';
    
    script.onload = function() {
        console.log('✅ Módulo de tema cargado');
        
        if (window.ThemeManager) {
            console.log('🎯 ThemeManager disponible');
            // El módulo se auto-inicializa
        }
    };
    
    script.onerror = function() {
        console.error('❌ Error al cargar módulo de tema');
        
        // Fallback a funciones globales si existen
        if (typeof loadThemePreference === 'function') {
            loadThemePreference();
            console.log('🔄 Usando loadThemePreference global como fallback');
        }
    };
    
    document.head.appendChild(script);
}

function loadDashboardModule() {
    console.log('📊 Cargando módulo de dashboard...');
    
    const script = document.createElement('script');
    script.src = 'js/modules/ui/dashboard-manager.js';
    
    script.onload = function() {
        console.log('✅ Módulo de dashboard cargado');
        
        if (window.DashboardManager) {
            console.log('🎯 DashboardManager disponible');
            // El módulo se auto-inicializa
        }
    };
    
    script.onerror = function() {
        console.error('❌ Error al cargar módulo de dashboard');
        
        // Fallback a funciones globales
        if (typeof updateDateTime === 'function') {
            updateDateTime();
            setInterval(updateDateTime, 60000);
            console.log('🔄 Usando updateDateTime global como fallback');
        }
        
        if (typeof updateDashboard === 'function') {
            updateDashboard();
            console.log('🔄 Usando updateDashboard global como fallback');
        }
    };
    
    document.head.appendChild(script);
}

function loadTabsModule() {
    console.log('🗂️ Cargando módulo de pestañas...');
    
    const script = document.createElement('script');
    script.src = 'js/modules/ui/tabs-manager.js';
    
    script.onload = function() {
        console.log('✅ Módulo de pestañas cargado');
        
        if (window.TabsManager) {
            console.log('🎯 TabsManager disponible');
            // El módulo se auto-inicializa
        }
    };
    
    script.onerror = function() {
        console.error('❌ Error al cargar módulo de pestañas');
        console.log('🔄 Usando funciones globales para pestañas');
    };
    
    document.head.appendChild(script);
}

function loadClientModule() {
    console.log('🏢 Cargando módulo de clientes...');
    
    const script = document.createElement('script');
    script.src = 'js/modules/data/client-manager.js';
    
    script.onload = function() {
        console.log('✅ Módulo de clientes cargado');
        
        if (window.ClientManager) {
            console.log('🎯 ClientManager disponible');
            // El módulo se auto-inicializa
        }
    };
    
    script.onerror = function() {
        console.error('❌ Error al cargar módulo de clientes');
        
        // Fallback a función global
        const customerInput = document.getElementById('customer');
        if (customerInput && typeof updateClientLogo === 'function') {
            customerInput.addEventListener('input', updateClientLogo);
            console.log('🔄 Configurando updateClientLogo global como fallback');
        }
    };
    
    document.head.appendChild(script);
}

// ========== INICIALIZACIÓN DE VARIABLES GLOBALES ==========

function initGlobalVariables() {
    console.log('🌍 Inicializando variables globales...');
    
    // Variables esenciales para placements
    if (typeof window.placements === 'undefined') {
        window.placements = [];
        console.log('✅ placements inicializado como array vacío');
    }
    
    if (typeof window.currentPlacementId === 'undefined') {
        window.currentPlacementId = 1;
        console.log('✅ currentPlacementId inicializado como 1');
    }
    
    if (typeof window.clientLogoCache === 'undefined') {
        window.clientLogoCache = {};
        console.log('✅ clientLogoCache inicializado como objeto vacío');
    }
    
    if (typeof window.isDarkMode === 'undefined') {
        window.isDarkMode = true;
        console.log('✅ isDarkMode inicializado como true');
    }
    
    console.log('✅ Variables globales inicializadas');
}

// ========== HANDLERS ESPECIALES (sin módulo aún) ==========

function loadSpecialHandlers() {
    console.log('🔧 Cargando handlers especiales...');
    
    // Handler para pegar imágenes (si existe globalmente)
    if (typeof setupPasteHandler === 'function') {
        try {
            setupPasteHandler();
            console.log('✅ Handler para pegar imágenes configurado');
        } catch (error) {
            console.error('❌ Error al configurar paste handler:', error);
        }
    } else {
        console.log('ℹ️ setupPasteHandler no disponible');
    }
    
    // Handler para file upload (si existe globalmente)
    setupFileUploadListeners();
    
    console.log('✅ Handlers especiales cargados');
}

function setupFileUploadListeners() {
    const excelFileInput = document.getElementById('excelFile');
    if (excelFileInput && !excelFileInput.hasAttribute('data-listener-added')) {
        excelFileInput.addEventListener('change', function(e) {
            if (typeof handleFileUpload === 'function') {
                handleFileUpload(e);
            } else {
                console.warn('⚠️ handleFileUpload no disponible');
            }
        });
        excelFileInput.setAttribute('data-listener-added', 'true');
        console.log('✅ Listener para excelFile configurado');
    }
    
    const placementImageInput = document.getElementById('placementImageInput');
    if (placementImageInput && !placementImageInput.hasAttribute('data-listener-added')) {
        placementImageInput.addEventListener('change', function(e) {
            if (typeof handlePlacementImageUpload === 'function') {
                handlePlacementImageUpload(e);
            } else {
                console.warn('⚠️ handlePlacementImageUpload no disponible');
            }
        });
        placementImageInput.setAttribute('data-listener-added', 'true');
        console.log('✅ Listener para placementImageInput configurado');
    }
}

// ========== CONFIGURAR EVENTOS GLOBALES (solo los sin módulo) ==========

function setupGlobalEventListeners() {
    console.log('🔗 Configurando eventos globales (sin módulo)...');
    
    // NOTA: Los siguientes eventos son manejados por sus respectivos módulos:
    // - Botón de tema → ThemeManager
    // - Input de cliente → ClientManager  
    // - Pestañas de navegación → TabsManager
    // - Dashboard auto-update → DashboardManager
    
    // Configurar solo eventos que no tienen módulo:
    
    // 1. Eventos para botones de acción rápida en dashboard
    setupDashboardQuickActions();
    
    // 2. Eventos para botones en spec-creator
    setupSpecCreatorButtons();
    
    // 3. Eventos para botones en saved-specs
    setupSavedSpecsButtons();
    
    // 4. Eventos para botones en error-log
    setupErrorLogButtons();
    
    console.log('✅ Eventos globales configurados');
}

function setupDashboardQuickActions() {
    // Botón "Limpiar Log" en dashboard
    const clearLogBtn = document.querySelector('button[onclick*="clearErrorLog"]');
    if (clearLogBtn) {
        clearLogBtn.addEventListener('click', function(e) {
            if (typeof clearErrorLog === 'function') {
                if (confirm('¿Estás seguro de que quieres limpiar el log de errores?')) {
                    clearErrorLog();
                }
            }
        });
        console.log('✅ Botón "Limpiar Log" configurado');
    }
    
    // Botones de acción rápida
    const quickActions = document.querySelectorAll('.btn[onclick*="showTab"]');
    quickActions.forEach(btn => {
        const originalOnClick = btn.getAttribute('onclick');
        if (originalOnClick) {
            btn.addEventListener('click', function(e) {
                // Permitir que el módulo TabsManager maneje la navegación
                // El onclick original seguirá funcionando como fallback
            });
        }
    });
}

function setupSpecCreatorButtons() {
    // Estos botones serán manejados por sus módulos correspondientes
    // Por ahora solo los registramos
    const buttons = [
        'button[onclick*="saveCurrentSpec"]',
        'button[onclick*="exportToExcel"]',
        'button[onclick*="exportPDF"]',
        'button[onclick*="downloadProjectZip"]',
        'button[onclick*="clearForm"]'
    ];
    
    buttons.forEach(selector => {
        const btn = document.querySelector(selector);
        if (btn) {
            console.log(`✅ Botón detectado: ${selector}`);
        }
    });
}

function setupSavedSpecsButtons() {
    // Botón "Limpiar Todo" en saved-specs
    const clearAllBtn = document.querySelector('button[onclick*="clearAllSpecs"]');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function(e) {
            if (typeof clearAllSpecs === 'function') {
                if (confirm('⚠️ ¿Estás seguro de que quieres eliminar TODAS las specs guardadas?')) {
                    clearAllSpecs();
                }
            }
        });
        console.log('✅ Botón "Limpiar Todo" configurado');
    }
}

function setupErrorLogButtons() {
    // Botones en error-log serán manejados por su módulo futuro
    console.log('ℹ️ Botones de error-log pendientes de módulo');
}

// ========== FUNCIONES DE UTILIDAD ==========

function showAppStatus(message, type = 'info') {
    console.log(`📢 [${type.toUpperCase()}] ${message}`);
    
    const statusEl = document.getElementById('statusMessage');
    if (!statusEl) {
        // Crear elemento si no existe
        const newStatusEl = document.createElement('div');
        newStatusEl.id = 'statusMessage';
        newStatusEl.className = 'status-message';
        document.body.appendChild(newStatusEl);
        return showAppStatus(message, type); // Intentar de nuevo
    }
    
    // Limpiar clases anteriores
    statusEl.className = 'status-message';
    
    // Agregar clase de tipo
    statusEl.classList.add(`status-${type}`);
    
    // Establecer mensaje
    statusEl.textContent = message;
    statusEl.style.display = 'block';
    
    // Ocultar después de 4 segundos
    setTimeout(() => {
        if (statusEl.textContent === message) {
            statusEl.style.display = 'none';
        }
    }, 4000);
}

function showModuleStatus(moduleName, status = 'loaded') {
    const statusIcons = {
        'loaded': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    };
    
    const icon = statusIcons[status] || '🔹';
    console.log(`${icon} Módulo ${moduleName}: ${status}`);
}

// ========== FUNCIONES DE DIAGNÓSTICO ==========

function diagnoseApp() {
    console.log('🩺 Diagnóstico de la aplicación:');
    console.log('===============================');
    
    // Verificar módulos cargados
    const modules = ['ThemeManager', 'DashboardManager', 'TabsManager', 'ClientManager'];
    modules.forEach(module => {
        const exists = typeof window[module] !== 'undefined';
        console.log(`${exists ? '✅' : '❌'} ${module}: ${exists ? 'CARGADO' : 'NO CARGADO'}`);
    });
    
    // Verificar funciones globales esenciales
    const essentialFunctions = [
        'showTab',
        'updateClientLogo',
        'updateDashboard',
        'updateDateTime',
        'toggleTheme',
        'saveCurrentSpec'
    ];
    
    console.log('\n🔍 Funciones globales:');
    essentialFunctions.forEach(func => {
        const exists = typeof window[func] === 'function';
        console.log(`${exists ? '✅' : '⚠️'} ${func}(): ${exists ? 'Disponible' : 'No disponible'}`);
    });
    
    // Verificar elementos DOM críticos
    const criticalElements = [
        'customer',
        'logoCliente',
        'current-datetime',
        'themeToggle',
        'dashboard',
        'spec-creator',
        'saved-specs',
        'error-log'
    ];
    
    console.log('\n🎯 Elementos DOM críticos:');
    criticalElements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`${element ? '✅' : '❌'} #${id}: ${element ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);
    });
    
    console.log('===============================');
    console.log('🩺 Diagnóstico completado');
}

// ========== MANEJO DE ERRORES ==========

window.addEventListener('error', function(e) {
    console.error('🚨 ERROR GLOBAL CAPTURADO:', e.message);
    console.error('Archivo:', e.filename);
    console.error('Línea:', e.lineno);
    console.error('Columna:', e.colno);
    console.error('Error completo:', e.error);
    
    // Mostrar notificación amigable
    showAppStatus(`Error: ${e.message}`, 'error');
    
    // Registrar en error handler si existe
    if (window.errorHandler && typeof window.errorHandler.log === 'function') {
        window.errorHandler.log('global_error', e.error, {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            timestamp: new Date().toISOString()
        });
    }
});

// ========== HACER DISPONIBLE GLOBALMENTE ==========

window.AppManager = {
    // Funciones principales
    showStatus: showAppStatus,
    diagnose: diagnoseApp,
    reloadModules: initializeModules,
    
    // Información
    getModules: function() {
        return {
            ThemeManager: !!window.ThemeManager,
            DashboardManager: !!window.DashboardManager,
            TabsManager: !!window.TabsManager,
            ClientManager: !!window.ClientManager,
            Config: !!window.Config,
            LogoConfig: !!window.LogoConfig,
            TeamsConfig: !!window.TeamsConfig,
            Utils: !!window.Utils,
            stateManager: !!window.stateManager
        };
    },
    
    // Utilidades
    showModuleStatus,
    
    // Información de la app
    _info: {
        name: 'AppManager',
        version: '1.0.0',
        description: 'Gestor principal de Tegra Spec Manager'
    }
};

// ========== INICIALIZACIÓN ADICIONAL RETARDADA ==========

// Esperar un poco y verificar que todo esté bien
setTimeout(() => {
    console.log('🕒 Verificación de estado posterior a la carga...');
    
    // Verificar que el dashboard se muestre
    const dashboardTab = document.getElementById('dashboard');
    if (dashboardTab && !dashboardTab.classList.contains('active')) {
        console.log('⚠️ Dashboard no activo, activando...');
        if (window.TabsManager && typeof window.TabsManager.showTab === 'function') {
            window.TabsManager.showTab('dashboard');
        } else if (typeof showTab === 'function') {
            showTab('dashboard');
        }
    }
    
    // Mostrar diagnóstico si se presiona Ctrl+Shift+D
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            diagnoseApp();
            showAppStatus('Diagnóstico ejecutado - Ver consola', 'info');
        }
    });
    
    console.log('✅ Verificación completada');
    console.log('🎉 Tegra Spec Manager listo para usar!');
    
    // Mostrar mensaje de bienvenida
    setTimeout(() => {
        showAppStatus('🎉 ¡Bienvenido a Tegra Spec Manager!', 'success');
    }, 1000);
    
}, 2000);

console.log('🎯 Main.js completamente cargado y listo');
