// main.js - PUNTO DE ENTRADA PRINCIPAL
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando Tegra Spec Manager...');
    
    // 1. Primero, inicializa configuraciones globales (que NO dependen del DOM)
    console.log('Cargando configuraciones base...');
    // (Asegúrate de que config.js, config-teams.js, config-logos.js ya se cargaron antes)
    
    // 2. Inicializa el State Manager (el cerebro de la app)
    if (window.stateManager) {
        window.stateManager.init();
    }
    
    // 3. Inicializa módulos que manipulan la UI
    initFileUpload();
    initPDFAnalyzer();
    initLogoManager(); // ¡Este es crucial para tu problema!
    initTabSwitcher();
    
    // 4. Carga el estado inicial (ej: última spec trabajada)
    loadInitialState();
    
    console.log('✅ Aplicación inicializada');
});

// Función específica para tu problema de logos
function initLogoManager() {
    console.log('Inicializando gestor de logos...');
    
    // A. Verifica que la configuración de logos esté cargada
    if (typeof window.logoConfig === 'undefined') {
        console.error('❌ config-logos.js no se cargó correctamente');
        return;
    }
    
    // B. Obtén el cliente seleccionado (de un dropdown, del state, etc.)
    const selectedClient = window.stateManager.getCurrentClient(); // Ejemplo
    // C. Busca el logo correspondiente en la configuración
    const clientLogo = window.logoConfig[selectedClient];
    
    if (clientLogo) {
        // D. Actualiza la imagen en el DOM para la vista previa
        const logoPreview = document.getElementById('client-logo-preview');
        if (logoPreview) {
            logoPreview.src = clientLogo;
            console.log(`✅ Logo de ${selectedClient} cargado: ${clientLogo}`);
        }
        
        // E. Guarda la ruta en el estado para el PDF
        window.stateManager.setCurrentLogo(clientLogo);
    } else {
        console.warn(`⚠️ No se encontró logo para el cliente: ${selectedClient}`);
        // Podrías cargar un logo por defecto (Tegra)
        const defaultLogo = window.logoConfig['TEGRA'] || 'logos/tegra-default.png';
        window.stateManager.setCurrentLogo(defaultLogo);
    }
}
