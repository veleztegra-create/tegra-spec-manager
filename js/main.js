// Importar funciones de módulos
import { showTab, createNavigation } from './modules/navigation.js';
import { updateDashboard, createDashboard } from './modules/dashboard.js';
import { 
    initSpecCreator, 
    renderArtes, 
    addArte, 
    updateClientLogo,
    collectData 
} from './modules/spec-creator.js';
import { initPDFAnalyzer, startPDFAnalysis } from './modules/pdf-analyzer.js';
import { loadSavedSpecsList } from './modules/storage-manager.js';
import { showStatus, updateDateTime } from './utils/ui-helpers.js';
import { handleExcelUpload } from './modules/excel-importer.js';
import { handleImageUpload, handleImagePaste } from './utils/image-helpers.js';

// Variables globales (exportadas para otros módulos)
window.specGlobal = {
    customer: '', style: '', colorway: '', season: '', pattern: '', po: '',
    sampleType: '', nameTeam: '', gender: '', designer: '', inkType: 'WATER',
    folder: '', dimensions: '', placement: '', temp: '320 °F', time: '1:40 min',
    specialties: '', instructions: '', imageB64: '', artes: [], savedAt: null
};

window.currentImageData = null;
window.pdfAnalysisResults = [];
window.originalPDFResults = [];

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    initEventListeners();
});

function initApp() {
    // Crear estructura HTML
    const appContainer = document.getElementById('app-container');
    
    if (!appContainer) {
        console.error('No se encontró el contenedor de la app');
        return;
    }
    
    appContainer.innerHTML = `
        <!-- HEADER -->
        <header class="app-header">
            <div class="logo-section">
                <div class="app-logo">
                    <svg viewBox="0 0 145.94 39.05" fill="white" height="45">
                        <path d="M42.24 12.37v1.93h6.91v15.25h4.21V14.3h6.91v-3.88h-16.1l-1.93 1.95zm49.82 7.94v1.87h4.24v2.73c-.53.38-1.13.67-1.8.86s-1.39.29-2.16.29c-.84 0-1.61.15-2.32-.45-.71-.3-1.33-.72-1.84-1.27s-.92-1.19-1.2-1.93c-.28-.74-.42-1.54-.42-2.42v-.05c0-.82.14-1.59.42-2.31.28-.72.67-1.35 1.18-1.89.5-.54 1.08-.97 1.75-1.28.66-.32 1.38-.48 2.15-.48.55 0 1.05.05 1.5.14.46.09.88.22 1.27.38.39.16.77.36 1.13.6.25.16.49.34.74.54l2.94-2.97c-.47-.4-.96-.75-1.46-1.07-.53-.33-1.09-.6-1.7-.82-.6-.22-1.25-.39-1.95-.51s-1.48-.18-2.34-.18c-1.44 0-2.77.26-4 .78-1.23.52-2.29 1.23-3.18 2.13-.89.9-1.59 1.95-2.09 3.14-.5 1.19-.75 2.47-.75 3.84v.05c0 1.42.25 2.73.74 3.94.49 1.2 1.18 2.24 2.06 3.12.88.87 1.94 1.56 3.17 2.05 1.23.49 2.59.74 4.09.74 1.75 0 3.3-.3 4.66-.89 1.36-.59 2.53-1.31 3.51-2.15v-8.31h-6.56l-1.74 1.76zM68.15 21.8h9.02v-3.74h-9.02v-3.88h10.25v-3.74h-12.55l-1.86 1.88v17.26h14.54v-3.74h-10.39v-4.02zm46.09-11.37h-8.75v19.13h4.21v-6.12h3.31l4.1 6.12h2.57l1.39-1.4-3.71-5.43c1.22-.46 2.21-1.17 2.97-2.15.76-.97 1.13-2.24 1.13-3.79v-.05c0-1.82-.55-3.28-1.64-4.37-1.29-1.29-3.15-1.94-5.58-1.94zm2.95 6.6c0 .82-.28 1.48-.83 1.98-.56.49-1.35.74-2.39.74h-4.26v-5.52h4.18c1.04 0 1.85.23 2.43.69.58.46.87 1.14.87 2.06v.05zm19.51-6.74h-3.88l-8.2 19.27h4.29l1.75-4.29h8.09l1.75 4.29h1.97l1.7-1.72-7.47-17.55zm-4.54 11.29l2.54-6.2 2.54 6.2h-5.08z"/>
                    </svg>
                </div>
                <div>
                    <h1 class="app-title">Technical Spec Manager</h1>
                    <p class="app-subtitle">Sistema integrado: Specs + Análisis de PDF</p>
                </div>
            </div>
            <div class="client-section">
                <span class="client-label">CLIENTE:</span>
                <div class="client-logo-wrapper">
                    <img id="logoCliente" alt="Logo del cliente" style="max-height:35px;display:none">
                </div>
            </div>
            <div class="header-actions">
                <div class="folder-input-container">
                    <span class="client-label"># FOLDER:</span>
                    <input type="text" id="folder-num" class="form-control" placeholder="#####">
                </div>
                <div id="current-datetime"></div>
            </div>
        </header>
        
        <!-- NAVEGACIÓN -->
        ${createNavigation()}
        
        <!-- CONTENIDO PRINCIPAL -->
        <main class="app-main">
            <!-- DASHBOARD -->
            <div id="dashboard" class="tab-content active">
                ${createDashboard()}
            </div>
            
            <!-- SPEC CREATOR -->
            <div id="spec-creator" class="tab-content">
                ${createSpecCreator()}
            </div>
            
            <!-- PDF ANALYSIS -->
            <div id="pdf-analysis" class="tab-content">
                ${createPDFAnalyzer()}
            </div>
            
            <!-- GUARDADAS -->
            <div id="saved-specs" class="tab-content">
                ${createSavedSpecs()}
            </div>
        </main>
    `;
    
    // Inicializar módulos
    initSpecCreator();
    initPDFAnalyzer();
    
    // Inicializar valores
    updateDateTime();
    updateDashboard();
    renderArtes();
    
    // Configurar intervalo para fecha/hora
    setInterval(updateDateTime, 60000);
    
    // Mostrar dashboard por defecto
    showTab('dashboard');
    
    showStatus('Aplicación cargada correctamente', 'success');
}

function initEventListeners() {
    // Eventos de Excel
    document.getElementById('excelFile')?.addEventListener('change', handleExcelUpload);
    
    // Eventos de imagen
    document.getElementById('imageInput')?.addEventListener('change', handleImageUpload);
    
    // Pegar imagen
    document.addEventListener('paste', handleImagePaste);
    
    // Cambio de tipo de tinta
    document.getElementById('ink-type-select')?.addEventListener('change', function() {
        const inkType = this.value;
        updateInkPreset(inkType);
    });
    
    // Folder number
    document.getElementById('folder-num')?.addEventListener('input', function() {
        window.specGlobal.folder = this.value;
    });
    
    // Customer para logo
    document.getElementById('customer')?.addEventListener('input', updateClientLogo);
}

function updateInkPreset(inkType) {
    const preset = INK_PRESETS[inkType];
    if (!preset) return;
    
    window.specGlobal.inkType = inkType;
    
    const tempElement = document.getElementById('temp');
    const timeElement = document.getElementById('time');
    
    if (tempElement) tempElement.value = preset.temp;
    if (timeElement) timeElement.value = preset.time;
    
    showStatus(`Preset ${inkType} aplicado`, 'info');
}

// Funciones auxiliares para crear contenido
function createSpecCreator() {
    return `
        <!-- Información General -->
        <div class="card">
            <div class="card-header">
                <h2 class="card-title"><i class="fas fa-info-circle"></i> Información General</h2>
            </div>
            <div class="card-body">
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">CLIENTE:</label>
                        <input type="text" id="customer" class="form-control" oninput="updateClientLogo()">
                    </div>
                    <div class="form-group">
                        <label class="form-label">STYLE:</label>
                        <input type="text" id="style" class="form-control">
                    </div>
                    <div class="form-group">
                        <label class="form-label">COLORWAY:</label>
                        <input type="text" id="colorway" class="form-control">
                    </div>
                    <div class="form-group">
                        <label class="form-label">SEASON:</label>
                        <input type="text" id="season" class="form-control">
                    </div>
                    <div class="form-group">
                        <label class="form-label">PATTERN #:</label>
                        <input type="text" id="pattern" class="form-control">
                    </div>
                    <div class="form-group">
                        <label class="form-label">P.O. #:</label>
                        <input type="text" id="po" class="form-control">
                    </div>
                    <div class="form-group">
                        <label class="form-label">SAMPLE TYPE:</label>
                        <input type="text" id="sample-type" class="form-control">
                    </div>
                    <div class="form-group">
                        <label class="form-label">NAME / TEAM:</label>
                        <input type="text" id="name-team" class="form-control">
                    </div>
                    <div class="form-group">
                        <label class="form-label">GENDER:</label>
                        <input type="text" id="gender" class="form-control">
                    </div>
                    <div class="form-group">
                        <label class="form-label">DISEÑADOR:</label>
                        <select id="designer" class="form-control">
                            <option value="">Seleccionar...</option>
                            ${DESIGNERS.map(designer => `<option>${designer}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">INK TYPE:</label>
                        <select id="ink-type-select" class="form-control">
                            ${INK_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">DIMENSIONES (PULGADAS):</label>
                        <input type="text" id="dimensions" class="form-control" placeholder='SIZE: (W) ##" X (H) ##"'>
                    </div>
                    <div class="form-group">
                        <label class="form-label">PLACEMENT:</label>
                        <input type="text" id="placement" class="form-control" placeholder='#.#" FROM COLLAR SEAM'>
                    </div>
                    <div class="form-group">
                        <label class="form-label">TEMP:</label>
                        <input type="text" id="temp" class="form-control" value="320 °F">
                    </div>
                    <div class="form-group">
                        <label class="form-label">TIME:</label>
                        <input type="text" id="time" class="form-control" value="1:40 min">
                    </div>
                    <div class="form-group">
                        <label class="form-label">SPECIALTIES:</label>
                        <input type="text" id="specialties" class="form-control">
                    </div>
                    <div class="form-group">
                        <label class="form-label">INSTRUCTIONS:</label>
                        <textarea id="instructions" class="form-control" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">IMAGEN (Opcional):</label>
                        <div class="file-upload-area" onclick="document.getElementById('imageInput').click()">
                            <i class="fas fa-cloud-upload-alt" style="font-size:2.5rem;color:var(--primary);margin-bottom:15px;"></i>
                            <p>Haz clic para cargar imagen o pega (Ctrl+V)</p>
                        </div>
                        <div class="image-preview-container">
                            <img id="imagePreview" class="image-preview" style="display:none;" alt="Vista previa">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Artes / Ubicaciones -->
        <div class="card">
            <div class="card-header">
                <h2 class="card-title"><i class="fas fa-layer-group"></i> Artes / Ubicaciones</h2>
                <button class="btn btn-primary btn-sm" onclick="addArte()">
                    <i class="fas fa-plus"></i> Nueva Ubicación
                </button>
            </div>
            <div class="card-body" id="artes-container"></div>
        </div>

        <!-- Botones finales -->
        <div class="card">
            <div class="card-body" style="display:flex;gap:15px;flex-wrap:wrap;justify-content:center">
                <button class="btn btn-primary btn-lg" onclick="downloadProjectZip()">
                    <i class="fas fa-file-archive"></i> Descargar Proyecto ZIP
                </button>
                <button class="btn btn-success btn-lg" onclick="exportPDF()">
                    <i class="fas fa-file-pdf"></i> Exportar PDF Maestro
                </button>
                <button class="btn btn-warning btn-lg" onclick="exportToExcel()">
                    <i class="fas fa-file-excel"></i> Exportar Excel
                </button>
                <button class="btn btn-outline btn-lg" onclick="clearForm()">
                    <i class="fas fa-broom"></i> Limpiar
                </button>
            </div>
        </div>
    `;
}

function createPDFAnalyzer() {
    return `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title"><i class="fas fa-file-pdf"></i> Análisis de Separaciones PDF</h2>
            </div>
            <div class="card-body">
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">ARCHIVO PDF:</label>
                        <input type="file" id="pdf-file" accept="application/pdf" class="form-control">
                    </div>
                    <div class="form-group">
                        <label class="form-label">DPI DE ANÁLISIS:</label>
                        <select id="analysis-dpi" class="form-control">
                            <option value="300" selected>300 DPI</option>
                            <option value="150">150 DPI</option>
                            <option value="72">72 DPI</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">PÍXELES DE RUIDO A RESTAR:</label>
                        <input type="number" id="noise-pixels" class="form-control" value="15870446">
                        <small style="color:var(--gray-light)">Guías, texto y elementos no deseados</small>
                    </div>
                </div>
                
                <div class="progress-container" id="progress-container" style="display:none;">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill"></div>
                    </div>
                    <div id="progress-text" style="text-align:center;margin-top:5px;"></div>
                </div>
                
                <div style="text-align:center;margin-top:20px;">
                    <button class="btn btn-primary btn-lg" onclick="startPDFAnalysis()">
                        <i class="fas fa-play"></i> Iniciar Análisis de PDF
                    </button>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h2 class="card-title"><i class="fas fa-chart-bar"></i> Resultados del Análisis</h2>
                <div>
                    <button class="btn btn-success btn-sm" onclick="savePDFResults()" id="save-results-btn" style="display:none;">
                        <i class="fas fa-save"></i> Guardar Resultados
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div id="pdf-results-container">
                    <p style="text-align:center;color:var(--gray-light);padding:30px;">
                        Los resultados del análisis aparecerán aquí después de procesar un PDF.
                    </p>
                </div>
            </div>
        </div>
    `;
}

function createSavedSpecs() {
    return `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title"><i class="fas fa-database"></i> Specs Guardadas</h2>
                <button class="btn btn-outline btn-sm" onclick="clearAllSpecs()">
                    <i class="fas fa-trash"></i> Limpiar Todo
                </button>
            </div>
            <div class="card-body" id="saved-specs-list"></div>
        </div>
    `;
}

// Hacer funciones disponibles globalmente
window.showTab = showTab;
window.addArte = addArte;
window.startPDFAnalysis = startPDFAnalysis;
window.updateClientLogo = updateClientLogo;
window.collectData = collectData;
