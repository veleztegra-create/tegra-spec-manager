// js/modules/navigation.js
function showTab(tabName) {
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
        if (tab.textContent.toLowerCase().includes(tabName.replace('-', ' '))) {
            tab.classList.add('active');
        }
    });
    
    // Acciones específicas
    if (tabName === 'saved-specs' && typeof window.loadSavedSpecsList === 'function') {
        window.loadSavedSpecsList();
    }
    
    if (tabName === 'dashboard' && typeof window.updateDashboard === 'function') {
        window.updateDashboard();
    }
}

// Hacerla global para llamarla desde HTML
window.showTab = showTab;
