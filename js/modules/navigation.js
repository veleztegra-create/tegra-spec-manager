import { updateDashboard } from './dashboard.js';
import { loadSavedSpecsList } from './storage-manager.js';
import { renderArtes } from './spec-creator.js';

export function showTab(tabName) {
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
    
    // Activar botón de navegación correspondiente
    document.querySelectorAll('.nav-tab').forEach(tab => {
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        }
    });
    
    // Ejecutar acciones específicas del tab
    switch(tabName) {
        case 'saved-specs':
            loadSavedSpecsList();
            break;
        case 'dashboard':
            updateDashboard();
            break;
        case 'spec-creator':
            renderArtes();
            break;
    }
}

export function createNavigation() {
    return `
        <nav class="app-nav">
            <ul class="nav-tabs">
                <li class="nav-tab active" data-tab="dashboard" onclick="showTab('dashboard')">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </li>
                <li class="nav-tab" data-tab="spec-creator" onclick="showTab('spec-creator')">
                    <i class="fas fa-file-alt"></i> Crear Spec
                </li>
                <li class="nav-tab" data-tab="pdf-analysis" onclick="showTab('pdf-analysis')">
                    <i class="fas fa-search"></i> Analizar PDF
                </li>
                <li class="nav-tab" data-tab="saved-specs" onclick="showTab('saved-specs')">
                    <i class="fas fa-database"></i> Guardadas
                </li>
            </ul>
        </nav>
    `;
}
