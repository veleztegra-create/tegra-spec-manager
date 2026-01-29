// js/main.js - PUNTO DE ENTRADA PRINCIPAL
console.log('🎯 Tegra Spec Manager - Punto de entrada principal cargado');

// ========== CONFIGURACIÓN INICIAL ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, iniciando aplicación...');
    
    // 1. Verificar que las configuraciones estén cargadas
    checkRequiredConfigs();
    
    // 2. Inicializar módulos
    initializeModules();
    
    // 3. Configurar eventos globales
    setupGlobalEventListeners();
    
    console.log('✅ Aplicación inicializada correctamente');
});

// ========== VERIFICAR CONFIGURACIONES REQUERIDAS ==========
function checkRequiredConfigs() {
    console.log('🔍 Verificando configuraciones...');
    
    // Verificar Config
    if (!window.Config) {
        console.error('❌ ERROR: Config no está definida');
        console.log('💡 Solución: Asegúrate que config.js se cargue antes que main.js');
        // Crear configuración mínima de emergencia
        window.Config = {
            APP: { VERSION: '1.0.0' },
            COLOR_DATABASES: {
                PANTONE: {},
                GEARFORSPORT: {},
                RAL: {}
            }
        };
    } else {
        console.log('✅ Config cargada correctamente');
    }
    
    // Verificar LogoConfig
    if (!window.LogoConfig) {
        console.warn('⚠️ ADVERTENCIA: LogoConfig no está definida');
    } else {
        console.log('✅ LogoConfig cargada correctamente');
    }
    
    // Verificar TeamsConfig
    if (!window.TeamsConfig) {
        console.warn('⚠️ ADVERTENCIA: TeamsConfig no está definida');
    } else {
        console.log('✅ TeamsConfig cargada correctamente');
    }
}

function initializeModules() {
    console.log('📦 Inicializando módulos...');
    
    // 1. Cargar módulo de tema
    loadThemeModule();
    
    // 2. Cargar módulo de dashboard
    loadDashboardModule();
    
    // 3. NOTA: Ya NO llamamos directamente a updateDateTime ni updateDashboard
    // porque ahora los módulos se encargan de eso
    
    // 4. Verificar placements
    if (typeof window.placements === 'undefined') {
        window.placements = [];
        window.currentPlacementId = 1;
        console.log('✅ Variables globales de placements inicializadas');
    }
    
    console.log('✅ Todos los módulos cargados');
}

// ========== CARGAR MÓDULO DE TEMA ==========
function loadThemeModule() {
    console.log('🎨 Cargando módulo de tema...');
    
    // Crear elemento script dinámicamente
    const script = document.createElement('script');
    script.src = 'js/modules/ui/theme-manager.js';
    script.onload = function() {
        console.log('✅ Módulo de tema cargado');
        
        // Inicializar tema
        if (window.ThemeManager && typeof window.ThemeManager.initialize === 'function') {
            window.ThemeManager.initialize();
        }
    };
    
    script.onerror = function() {
        console.error('❌ Error al cargar módulo de tema');
        // Fallback: usar funciones globales si existen
        if (typeof loadThemePreference === 'function') {
            loadThemePreference();
            console.log('🔄 Usando funciones globales de tema como fallback');
        }
    };
    
    document.head.appendChild(script);
}
// ========== CARGAR MÓDULO DE DASHBOARD ==========
function loadDashboardModule() {
    console.log('📊 Cargando módulo de dashboard...');
    
    const script = document.createElement('script');
    script.src = 'js/modules/ui/dashboard-manager.js';
    
    script.onload = function() {
        console.log('✅ Módulo de dashboard cargado');
        
        // El módulo se auto-inicializa, pero podemos verificarlo
        if (window.DashboardManager) {
            console.log('🎯 DashboardManager disponible');
        }
    };
    
    script.onerror = function() {
        console.error('❌ Error al cargar módulo de dashboard');
        // Fallback a funciones globales
        if (typeof updateDateTime === 'function') {
            updateDateTime();
            setInterval(updateDateTime, 60000);
        }
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
    };
    
    document.head.appendChild(script);
}

// ========== CONFIGURAR EVENTOS GLOBALES ==========
function setupGlobalEventListeners() {
    console.log('🔗 Configurando eventos globales...');
    
    // 1. Evento para el botón de tema
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function(e) {
            // Intentar usar el módulo primero
            if (window.ThemeManager && typeof window.ThemeManager.toggleTheme === 'function') {
                window.ThemeManager.toggleTheme();
            } 
            // Fallback a función global
            else if (typeof toggleTheme === 'function') {
                toggleTheme();
            }
            // Último recurso
            else {
                console.warn('⚠️ No se encontró función toggleTheme');
                alert('Función de tema no disponible');
            }
        });
        console.log('✅ Botón de tema configurado');
    }
    
    // 2. Evento para input de cliente
    const customerInput = document.getElementById('customer');
    if (customerInput) {
        customerInput.addEventListener('input', function() {
            if (typeof updateClientLogo === 'function') {
                updateClientLogo();
            }
        });
        console.log('✅ Input de cliente configurado');
    }
    
    // 3. Setup para pegar imágenes si existe
    if (typeof setupPasteHandler === 'function') {
        setupPasteHandler();
        console.log('✅ Handler para pegar imágenes configurado');
    }
    
    console.log('✅ Todos los eventos configurados');
}

// ========== FUNCIONES DE UTILIDAD ==========
function showAppStatus(message, type = 'info') {
    const statusEl = document.getElementById('statusMessage');
    if (!statusEl) {
        console.log(`📢 ${message}`);
        return;
    }
    
    statusEl.textContent = message;
    statusEl.className = `status-message status-${type}`;
    statusEl.style.display = 'block';
    
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 3000);
}

// ========== HACER DISPONIBLE GLOBALMENTE ==========
window.AppManager = {
    showStatus: showAppStatus,
    initialize: initializeModules,
    setupEvents: setupGlobalEventListeners
};

console.log('🎯 AppManager disponible globalmente');
