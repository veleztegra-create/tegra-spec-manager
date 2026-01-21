/**
 * TEGRA - Technical Spec Manager
 * Mantenimiento: Limpieza de lógica de píxeles y parches de UI
 */

(function() {
    console.log("Iniciando fixes.js: Versión de mantenimiento (Sin conteo de píxeles)");

    // 1. ELIMINAR REFERENCIAS A PÍXELES EN EL DOM
    const removePixelUI = () => {
        const pixelElements = [
            document.getElementById('pixel-analysis-results'),
            document.getElementById('noise-filter-status'),
            document.querySelector('.pixel-counter-badge')
        ];
        
        pixelElements.forEach(el => {
            if (el) el.remove();
        });
    };

    // 2. PARCHE DE RENDERIZADO PARA PDF
    // Evita que el texto se desborde sin depender del análisis de imagen
    const fixTextOverflow = () => {
        const textAreas = document.querySelectorAll('.placement-notes');
        textAreas.forEach(area => {
            area.style.maxHeight = '150px';
            area.style.overflow = 'hidden';
        });
    };

    // 3. INICIALIZACIÓN SEGURA
    const initFixes = () => {
        removePixelUI();
        fixTextOverflow();
        
        // Verificación de carga de dependencias
        if (typeof window.updateDashboard === 'function') {
            console.log("Dependencias cargadas correctamente.");
        } else {
            console.warn("Advertencia: Algunas funciones de dashboard podrían no estar disponibles.");
        }
    };

    // Ejecutar cuando el DOM esté listo o después del mantenimiento-loader
    if (document.readyState === 'complete') {
        initFixes();
    } else {
        window.addEventListener('load', initFixes);
    }

})();
