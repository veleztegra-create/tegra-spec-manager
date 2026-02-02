// js/managers/specs-manager.js

// Dentro de tu función que carga la lista:
loadSavedSpecs: function() {
    const listContainer = document.getElementById('saved-specs-list');
    
    // VALIDACIÓN DE SEGURIDAD
    if (!listContainer) {
        console.warn('⚠️ SpecsManager: No se encontró el contenedor de lista (ID: saved-specs-list). Se omite el renderizado.');
        return;
    }
    
    // ... resto de tu lógica para renderizar la lista
}
