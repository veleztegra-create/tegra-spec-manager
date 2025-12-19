import { showTab } from './modules/navigation.js';
import { updateDashboard } from './modules/dashboard.js';
import { initSpecCreator } from './modules/spec-creator.js';
import { initPDFAnalyzer } from './modules/pdf-analyzer.js';
import { loadSavedSpecsList } from './modules/storage-manager.js';
import { showStatus } from './modules/ui-helpers.js';

// Variables globales
let specGlobal = {
    customer: '', style: '', colorway: '', season: '', pattern: '', po: '',
    sampleType: '', nameTeam: '', gender: '', designer: '', inkType: 'WATER',
    folder: '', dimensions: '', placement: '', temp: '320 °F', time: '1:40 min',
    specialties: '', instructions: '', imageB64: '', artes: [], savedAt: null
};

let currentImageData = null;
let pdfAnalysisResults = [];

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    updateDateTime();
    updateDashboard();
    renderArtes();
    
    // Configurar eventos
    document.getElementById('ink-type-select')?.addEventListener('change', handleInkTypeChange);
    document.getElementById('excelFile')?.addEventListener('change', handleExcelUpload);
    document.getElementById('imageInput')?.addEventListener('change', handleImageUpload);
    
    // Permitir pegar imágenes
    document.addEventListener('paste', handleImagePaste);
});

function initApp() {
    // Inicializar módulos
    initSpecCreator();
    initPDFAnalyzer();
    
    // Mostrar dashboard por defecto
    showTab('dashboard');
}

function updateDateTime() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const dateElement = document.getElementById('current-datetime');
    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString('es-ES', options);
    }
}

// Exportar variables globales para otros módulos
window.specGlobal = specGlobal;
window.currentImageData = currentImageData;
window.pdfAnalysisResults = pdfAnalysisResults;
