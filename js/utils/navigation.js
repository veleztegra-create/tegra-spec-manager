// js/modules/navigation.js
export function showTab(tabName) {
    console.log("Mostrando tab:", tabName);
    
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(t => {
        t.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-tab').forEach(t => {
        t.classList.remove('active');
    });
    
    // Mostrar tab seleccionado
    const tabElement = document.getElementById(tabName);
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    // Activar botón correspondiente
    document.querySelectorAll('.nav-tab').forEach(tab => {
        if (tab.getAttribute('data-tab') === tabName || 
            tab.textContent.includes(tabName.replace('-', ' '))) {
            tab.classList.add('active');
        }
    });
    
    // Acciones específicas
    if (tabName === 'saved-specs') {
        if (typeof window.loadSavedSpecsList === 'function') {
            window.loadSavedSpecsList();
        }
    }
}

// Hacerla global para llamarla desde HTML
window.showTab = showTab;
