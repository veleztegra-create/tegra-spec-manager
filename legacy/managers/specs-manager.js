// js/managers/specs-manager.js
// ORQUESTADOR DE LÓGICA DE SPECS
console.log('📋 Cargando SpecsManager (Orquestador)...');

const SpecsManager = (function() {
    
    function init() {
        console.log('🚀 Inicializando SpecsManager (Orquestador)...');
        // Coordina la inicialización de los submódulos
        if (window.SpecsDataManager && window.SpecsDataManager.init) {
            window.SpecsDataManager.init();
        }
        if (window.DashboardManager && window.DashboardManager.initialize) {
            setTimeout(() => window.DashboardManager.initialize(), 1500);
        }
        console.log('✅ SpecsManager (Orquestador) listo.');
    }
    
    function saveCurrentSpec() {
        console.log('💾 Manager: Orquestando guardado de spec...');
        if (window.SpecsDataManager && window.SpecsDataManager.saveCurrentSpec) {
            return window.SpecsDataManager.saveCurrentSpec();
        }
        alert('❌ Módulo de datos no disponible');
        return false;
    }
    
    function loadSpecData(data) {
        console.log('📂 Manager: Orquestando carga de spec...');
        if (window.SpecsDataManager && window.SpecsDataManager.loadSpecData) {
            return window.SpecsDataManager.loadSpecData(data);
        }
        return false;
    }
    
    function clearForm() {
        console.log('🧹 Manager: Orquestando limpieza de formulario...');
        if (window.SpecsDataManager && window.SpecsDataManager.clearForm) {
            return window.SpecsDataManager.clearForm();
        }
        return false;
    }
    
    // ========== EXPORTACIÓN ==========
    const publicAPI = {
        init,
        saveCurrentSpec,
        loadSpecData,
        clearForm,
        // Puedes agregar más funciones de orquestación aquí
    };
    
    window.SpecsManager = publicAPI;
    // Mantén estos alias globales para compatibilidad
    window.saveCurrentSpec = publicAPI.saveCurrentSpec;
    window.loadSpecData = publicAPI.loadSpecData;
    window.clearForm = publicAPI.clearForm;
    
    console.log('✅ SpecsManager (Orquestador) cargado.');
    return publicAPI;
    
})();

// Auto-inicialización
setTimeout(() => { if (window.SpecsManager) SpecsManager.init(); }, 800);
