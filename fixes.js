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
    
    // Corrección para que los botones funcionen
    setTimeout(() => {
        if (typeof showTab !== 'function') {
            console.error('showTab no está definido');
        }
    }, 1000);

    // --- INICIO DE LA OPERACIÓN "EL INTERCEPTOR" ---
    console.log('[Fixes.js] Preparando el interceptor de PDF...');

    // Esperar un poco para asegurar que el generador original esté cargado
    setTimeout(() => {
        if (window.generateProfessionalPDF) {
            const originalPdfGenerator = window.generateProfessionalPDF;

            window.generateProfessionalPDF = function(data) {
                console.log("DATA ENVIADA AL PDF:", JSON.stringify(data, null, 2));
                
                // Llamar a la función original para que el PDF se genere normalmente
                return originalPdfGenerator(data);
            };

            console.log('[Fixes.js] ✅ Interceptor de PDF instalado y activo.');
        } else {
            console.error('[Fixes.js] ❌ No se pudo instalar el interceptor: window.generateProfessionalPDF no existe.');
            // Intentar de nuevo por si acaso
            setTimeout(() => {
                 if (window.generateProfessionalPDF) {
                    const originalPdfGenerator = window.generateProfessionalPDF;
                    window.generateProfessionalPDF = function(data) {
                        console.log("DATA ENVIADA AL PDF:", JSON.stringify(data, null, 2));
                        return originalPdfGenerator(data);
                    };
                    console.log('[Fixes.js] ✅ Interceptor de PDF instalado en el segundo intento.');
                 }
            }, 2000);
        }
    }, 500); // Un pequeño retraso para asegurar que pdf-generator.js se cargue primero.
    // --- FIN DE LA OPERACIÓN ---
});
