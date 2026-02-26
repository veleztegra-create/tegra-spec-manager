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
    // Asegurar que Config.APP existe
    if (!window.Config.APP) {
        window.Config.APP = { VERSION: '1.0.0' };
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
    
    // Corrección para que los botones funcionen
    setTimeout(() => {
        if (typeof showTab !== 'function') {
            console.error('showTab no está definido');
        }
    }, 1000);
});
