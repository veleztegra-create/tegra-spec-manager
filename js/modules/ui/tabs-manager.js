// js/modules/ui/tabs-manager.js
// MÓDULO PARA GESTIÓN DE PESTAÑAS/NAVEGACIÓN

const TabsManager = (function() {
    console.log('🗂️ Módulo TabsManager cargando...');
    
    // ========== VARIABLES PRIVADAS ==========
    let currentTab = 'dashboard';
    const tabHistory = [];
    
    // ========== FUNCIONES PRIVADAS ==========
    
    function updateActiveTabIndicator() {
        // Remover clase 'active' de todas las pestañas
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Agregar clase 'active' a la pestaña actual
        const tabElement = document.getElementById(currentTab);
        if (tabElement) {
            tabElement.classList.add('active');
        }
        
        // Activar la pestaña correspondiente en la navegación
        document.querySelectorAll('.nav-tab').forEach(tab => {
            if (tab.innerText.toLowerCase().includes(currentTab.replace('-', ' '))) {
                tab.classList.add('active');
            }
        });
    }
    
    function executeTabSpecificActions(tabName) {
        console.log(`🎯 Ejecutando acciones para pestaña: ${tabName}`);
        
        switch(tabName) {
            case 'saved-specs':
                if (typeof loadSavedSpecsList === 'function') {
                    loadSavedSpecsList();
                }
                break;
                
            case 'dashboard':
                if (window.DashboardManager && typeof window.DashboardManager.updateDashboard === 'function') {
                    window.DashboardManager.updateDashboard();
                } else if (typeof updateDashboard === 'function') {
                    updateDashboard();
                }
                break;
                
            case 'error-log':
                if (typeof loadErrorLog === 'function') {
                    loadErrorLog();
                }
                break;
                
            case 'spec-creator':
                if (typeof window.placements === 'undefined' || window.placements.length === 0) {
                    if (typeof initializePlacements === 'function') {
                        initializePlacements();
                    }
                }
                break;
        }
    }
    
    // ========== FUNCIONES PÚBLICAS ==========
    
    function initialize() {
        console.log('⚙️ Inicializando TabsManager...');
        
        // 1. Configurar event listeners para pestañas
        setupTabListeners();
        
        // 2. Mostrar pestaña inicial
        showTab('dashboard');
        
        console.log('✅ TabsManager inicializado');
        return true;
    }
    
    function setupTabListeners() {
        console.log('🔗 Configurando listeners de pestañas...');
        
        // Pestaña Dashboard
        const dashboardTab = document.querySelector('.nav-tab[onclick*="dashboard"]');
        if (dashboardTab) {
            dashboardTab.addEventListener('click', function(e) {
                e.preventDefault();
                showTab('dashboard');
            });
        }
        
        // Pestaña Crear Spec
        const specTab = document.querySelector('.nav-tab[onclick*="spec-creator"]');
        if (specTab) {
            specTab.addEventListener('click', function(e) {
                e.preventDefault();
                showTab('spec-creator');
            });
        }
        
        // Pestaña Guardadas
        const savedTab = document.querySelector('.nav-tab[onclick*="saved-specs"]');
        if (savedTab) {
            savedTab.addEventListener('click', function(e) {
                e.preventDefault();
                showTab('saved-specs');
            });
        }
        
        // Pestaña Error Log
        const errorTab = document.querySelector('.nav-tab[onclick*="error-log"]');
        if (errorTab) {
            errorTab.addEventListener('click', function(e) {
                e.preventDefault();
                showTab('error-log');
            });
        }
        
        console.log('✅ Listeners de pestañas configurados');
    }
    
    function showTab(tabName) {
        console.log(`🔄 Cambiando a pestaña: ${tabName}`);
        
        // Validar que la pestaña existe
        const tabElement = document.getElementById(tabName);
        if (!tabElement) {
            console.error(`❌ Pestaña "${tabName}" no encontrada`);
            return false;
        }
        
        // Guardar en historial
        if (currentTab !== tabName) {
            tabHistory.push(currentTab);
            if (tabHistory.length > 10) {
                tabHistory.shift(); // Mantener solo últimos 10
            }
        }
        
        // Actualizar pestaña actual
        currentTab = tabName;
        
        // Actualizar UI
        updateActiveTabIndicator();
        
        // Ejecutar acciones específicas
        executeTabSpecificActions(tabName);
        
        // Mostrar notificación
        showTabNotification(tabName);
        
        return true;
    }
    
    function showTabNotification(tabName) {
        const tabNames = {
            'dashboard': 'Dashboard',
            'spec-creator': 'Crear Spec',
            'saved-specs': 'Specs Guardadas',
            'error-log': 'Log de Errores'
        };
        
        const displayName = tabNames[tabName] || tabName;
        
        if (window.AppManager && typeof window.AppManager.showStatus === 'function') {
            window.AppManager.showStatus(`📁 ${displayName}`, 'info');
        }
    }
    
    function goBack() {
        if (tabHistory.length === 0) {
            console.log('📜 Historial vacío');
            return false;
        }
        
        const previousTab = tabHistory.pop();
        return showTab(previousTab);
    }
    
    function getCurrentTab() {
        return {
            id: currentTab,
            name: getTabDisplayName(currentTab),
            history: [...tabHistory]
        };
    }
    
    function getTabDisplayName(tabId) {
        const names = {
            'dashboard': 'Dashboard',
            'spec-creator': 'Crear Spec',
            'saved-specs': 'Specs Guardadas',
            'error-log': 'Log de Errores'
        };
        return names[tabId] || tabId;
    }
    
    function getAllTabs() {
        return [
            { id: 'dashboard', name: 'Dashboard', icon: 'fa-tachometer-alt' },
            { id: 'spec-creator', name: 'Crear Spec', icon: 'fa-file-alt' },
            { id: 'saved-specs', name: 'Specs Guardadas', icon: 'fa-database' },
            { id: 'error-log', name: 'Log de Errores', icon: 'fa-exclamation-triangle' }
        ];
    }
    
    // ========== EXPORTAR MÓDULO ==========
    
    const publicAPI = {
        // Métodos principales
        initialize,
        showTab,
        goBack,
        
        // Información
        getCurrentTab,
        getAllTabs,
        getTabDisplayName,
        
        // Para compatibilidad con código existente
        show: showTab, // alias
        
        // Información del módulo
        _info: {
            name: 'TabsManager',
            version: '1.0.0'
        }
    };
    
    // Hacer disponible globalmente
    if (typeof window !== 'undefined') {
        window.TabsManager = publicAPI;
        
        // Mantener compatibilidad con showTab global
        window.showTab = function(tabName) {
            console.log('🔗 showTab llamado globalmente, redirigiendo a TabsManager');
            return publicAPI.showTab(tabName);
        };
        
        console.log('✅ TabsManager disponible como window.TabsManager');
        console.log('✅ showTab global redirigido a TabsManager');
    }
    
    return publicAPI;
})();

// Auto-inicialización
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (TabsManager && typeof TabsManager.initialize === 'function') {
            setTimeout(() => TabsManager.initialize(), 1000);
        }
    });
} else {
    if (TabsManager && typeof TabsManager.initialize === 'function') {
        setTimeout(() => TabsManager.initialize(), 1000);
    }
}

console.log('🗂️ Módulo TabsManager cargado correctamente');
