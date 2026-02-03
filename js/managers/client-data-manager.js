// js/managers/client-manager.js
// ORQUESTADOR DE LÓGICA DE CLIENTE
console.log('👔 Cargando ClientManager (Orquestador)...');

const ClientManager = (function() {
    
    function init() {
        console.log('🚀 Inicializando ClientManager...');
        // Esta función solo coordina, no ejecuta lógica pesada
        if (window.ClientDataManager && window.ClientDataManager.init) {
            window.ClientDataManager.init();
        } else {
            console.warn('⚠️ ClientDataManager no está disponible.');
        }
        console.log('✅ ClientDataManager (Orquestador) listo.');
    }
    
    function updateClientLogo() {
        console.log('🎨 Manager: Solicitando actualización de logo...');
        // Delega la tarea al módulo de datos especializado
        if (window.ClientDataManager && window.ClientDataManager.updateClientLogo) {
            return window.ClientDataManager.updateClientLogo();
        }
        console.warn('⚠️ No se pudo actualizar el logo: módulo no disponible.');
        return false;
    }
    
    function detectClientFromCode(code) {
        console.log('🔍 Manager: Detectando cliente desde código...');
        if (window.ClientDataManager && window.ClientDataManager.detectClientFromCode) {
            return window.ClientDataManager.detectClientFromCode(code);
        }
        return null;
    }
    
    // ========== EXPORTACIÓN ==========
    const publicAPI = {
        init,
        updateClientLogo,
        detectClientFromCode
    };
    
    window.ClientDataManager = publicAPI;
    console.log('✅ ClientManager (Orquestador) cargado.');
    return publicAPI;
    
})();

// Auto-inicialización diferida
setTimeout(() => { if (window.ClientDataManager) ClientDataManager.init(); }, 1000);
