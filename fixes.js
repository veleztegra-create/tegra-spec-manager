// fixes.js - Correcciones y parches
document.addEventListener('DOMContentLoaded', function() {
    console.log('Fixes cargados');
    
    // Asegurar que todas las variables globales existan
    if (!window.Config) {
        console.warn('Config no encontrado, creando versión básica');
        window.Config = {
            APP: { VERSION: '1.0.0' },
            COLOR_DATABASES: {},
            TEAM_CODE_MAP: {},
            GENDER_MAP: {},
            METALLIC_CODES: []
        };
    }
    
    if (!window.Utils) {
        console.warn('Utils no encontrado, creando versión básica');
        window.Utils = {};
    }
    
    if (!window.errorHandler) {
        console.warn('errorHandler no encontrado, creando versión básica');
        window.errorHandler = {
            log: function() { console.error.apply(console, arguments); },
            getErrors: function() { return []; },
            clear: function() {}
        };
    }
    
    // Verificar que showTab está disponible
    setTimeout(() => {
        if (typeof window.showTab !== 'function') {
            console.warn('showTab aún no está disponible, esperando...');
        } else {
            console.log('✅ showTab está disponible globalmente');
        }
    }, 1000);
});
