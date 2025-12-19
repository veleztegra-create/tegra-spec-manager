// js/app.js - TODA la aplicación en un solo archivo

// ========== CONFIGURACIÓN GLOBAL ==========
const INK_PRESETS = {
    WATER: { temp: '320 °F', time: '1:40 min' },
    PLASTISOL: { temp: '320 °F', time: '0:45 min' },
    SILICONE: { temp: '320 °F', time: '1:00 min' }
};

const PANTONE_DB = {
    'UNI WHITE': '#FFFFFF', 'WHITE': '#FFFFFF', 'BLACK': '#000000',
    'UNI RED': '#C8102E', 'UNI BLUE': '#003A70', 'UNI GREEN': '#008D62',
    'UNI GOLD': '#FFB612', 'UNI SILVER': '#A5ACAF', 'UNI NAVY': '#0B162A',
    'COLLEGE NAVY': '#1C2841', 'MARINE': '#003A70', 'ITALY BLUE': '#0033A0',
    'GYM BLUE': '#005EB8', 'SPORT TEAL': '#008E97', 'ACTION GREEN': '#008D62',
    'SEQUOIA': '#1D2624', 'UNIVERSITY RED': '#C8102E', 'TEAM RED': '#D50A0A',
    'UNI ORANGE': '#FB4F14', 'TEAM ORANGE': '#FB4F14', 'TEAM GOLD': '#FFB612',
    'COLOR RUSH GOLD': '#FFB612', 'MEDIUM SILVER': '#A7A8AA', 'WOLF GREY': '#9B9B9B',
    'PEWTER GREY': '#97999B', 'DARK STEEL GREY': '#53565A'
};

const CLIENT_LOGOS = {
    'NIKE': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Nike-Logotipo-PNG-Photo.png',
    'FANATICS': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Fanatics_company_logo.svg.png',
    'ADIDAS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1280px-Adidas_Logo.svg.png',
    'PUMA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Puma_Logo.svg/1280px-Puma_Logo.svg.png',
    'UNDER ARMOUR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Under_armour_logo.svg/1280px-Under_armour_logo.svg.png'
};

// ========== VARIABLES GLOBALES ==========
let specGlobal = {
    customer: '', style: '', colorway: '', season: '', pattern: '', po: '',
    sampleType: '', nameTeam: '', gender: '', designer: '', inkType: 'WATER',
    folder: '', dimensions: '', placement: '', temp: '320 °F', time: '1:40 min',
    specialties: '', instructions: '', imageB64: '', artes: [], savedAt: null
};

let currentImageData = null;
let pdfAnalysisResults = [];

// ========== FUNCIONES DE UTILIDAD ==========
function showStatus(msg, type = 'success') {
    const el = document.getElementById('statusMessage');
    if (!el) return;
    
    el.textContent = msg;
    el.className = `status-message status-${type}`;
    el.style.display = 'block';
    
    setTimeout(() => {
        el.style.display = 'none';
    }, 4000);
}

function updateDateTime() {
    const dateElement = document.getElementById('current-datetime');
    if (!dateElement) return;
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    
    dateElement.textContent = new Date().toLocaleDateString('es-ES', options);
}

// ========== NAVEGACIÓN ==========
function showTab(tabName) {
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
    if (tabName === 'saved-specs') {
        loadSavedSpecsList();
    }
    
    if (tabName === 'dashboard') {
        updateDashboard();
    }
}

// ========== DASHBOARD ==========
function updateDashboard() {
    const specs = Object.keys(localStorage).filter(k => k.startsWith('spec_'));
    const total = specs.length;
    
    const totalEl = document.getElementById('total-specs');
    const todayEl = document.getElementById('today-specs');
    const activeEl = document.getElementById('active-projects');
    const rateEl = document.getElementById('completion-rate');
    
    if (totalEl) totalEl.textContent = total;
    
    // Contar specs de hoy
    const today = new Date().toDateString();
    let todayCount = 0;
    specs.forEach(k => {
        try {
            const spec = JSON.parse(localStorage.getItem(k));
            if (spec && spec.savedAt && new Date(spec.savedAt).toDateString() === today) {
                todayCount++;
            }
        } catch(e) {
            console.error("Error parsing spec:", e);
        }
    });
    
    if (todayEl) todayEl.textContent = todayCount;
    if (activeEl) activeEl.textContent = Math.floor(total * 0.7);
    if (rateEl) {
        const rate = Math.floor((todayCount / Math.max(total, 1)) * 100);
        rateEl.textContent = rate + '%';
    }
}

// ========== SPEC CREATOR ==========
function updateClientLogo() {
    const customer = document.getElementById('customer')?.value.toUpperCase() || '';
    const img = document.getElementById('logoCliente');
    if (!img) return;
    
    for (const [key, url] of Object.entries(CLIENT_LOGOS)) {
        if (customer.includes(key)) {
            img.src = url;
            img.style.display = 'block';
            return;
        }
    }
    
    img.style.display = 'none';
}

function updateInkPreset() {
    const select = document.getElementById('ink-type-select');
    if (!select) return;
    
    const inkType = select.value;
    const preset = INK_PRESETS[inkType];
    
    if (preset) {
        document.getElementById('temp').value = preset.temp;
        document.getElementById('time').value = preset.time;
        showStatus(`Preset ${inkType} aplicado`, 'info');
    }
}

function addArte() {
    const name = prompt('Nombre de la ubicación (ej: FRONT, BACK, SLEEVE):', 'FRONT');
    if (!name) return;
    
    const arte = {
        name: name.toUpperCase(),
        imageB64: '',
        colors: [],
        dimensions: 'SIZE: (W) ##" X (H) ##"',
        placement: '#.#" FROM COLLAR SEAM',
        specialties: '',
        instructions: ''
    };
    
    specGlobal.artes.push(arte);
    renderArtes();
    showStatus('✅ Ubicación agregada');
}

function renderArtes() {
    const container = document.getElementById('artes-container');
    if (!container) return;
    
    if (!specGlobal.artes || specGlobal.artes.length === 0) {
        container.innerHTML = '<p style="color:var(--gray-light);text-align:center;padding:20px;">No hay ubicaciones. Usa el botón "Nueva Ubicación".</p>';
        return;
    }
    
    container.innerHTML = '';
    specGlobal.artes.forEach((arte, i) => {
        const div = document.createElement('div');
        div.className = 'arte-card';
        div.style.cssText = 'background:white;border-radius:8px;border:1px solid var(--border);margin-bottom:15px;padding:15px;';
        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <h4 style="color:var(--primary);margin:0;">${arte.name}</h4>
                <div>
                    <button class="btn btn-outline btn-sm" onclick="editArte(${i})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="removeArte(${i})" style="margin-left:5px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <p><strong>Dimensiones:</strong> ${arte.dimensions}</p>
            <p><strong>Placement:</strong> ${arte.placement}</p>
            ${arte.colors && arte.colors.length > 0 ? 
                `<p><strong>Colores:</strong> ${arte.colors.length}</p>` : 
                '<p style="color:var(--gray-light);"><em>Sin colores definidos</em></p>'
            }
        `;
        container.appendChild(div);
    });
}

function removeArte(index) {
    if (confirm('¿Eliminar esta ubicación?')) {
        specGlobal.artes.splice(index, 1);
        renderArtes();
        showStatus('🗑️ Ubicación eliminada');
    }
}

function editArte(index) {
    const arte = specGlobal.artes[index];
    const newName = prompt('Nuevo nombre para la ubicación:', arte.name);
    if (newName) {
        arte.name = newName.toUpperCase();
        renderArtes();
        showStatus('✅ Ubicación actualizada');
    }
}

// ========== PDF ANALYSIS ==========
function initPDFAnalyzer() {
    document.getElementById('pdf-file')?.addEventListener('change', function() {
        showStatus('PDF listo para análisis', 'info');
    });
}

function startPDFAnalysis() {
    const fileInput = document.getElementById('pdf-file');
    const file = fileInput?.files[0];
    
    if (!file) {
        showStatus('Selecciona un archivo PDF primero', 'warning');
        return;
    }
    
    showStatus('⚠️ Análisis de PDF en desarrollo. Mostrando resultados simulados.', 'warning');
    
    // Simulación de resultados
    pdfAnalysisResults = [
        {
            page: 1,
            colorName: "UNI RED",
            screenLetter: "A",
            colorType: "COLOR",
            arteName: "FRONT",
            blackPixels: 1500000,
            netBlackPixels: 1200000,
            coveragePercentage: "15.75",
            matchesSpec: true
        },
        {
            page: 2,
            colorName: "BLOCKER CHT",
            screenLetter: "B",
            colorType: "BLOCKER",
            arteName: "FRONT",
            blackPixels: 2000000,
            netBlackPixels: 1800000,
            coveragePercentage: "22.50",
            matchesSpec: true
        }
    ];
    
    displayPDFResults();
    document.getElementById('save-results-btn').style.display = 'inline-flex';
}

function displayPDFResults() {
    const container = document.getElementById('pdf-results-container');
    if (!container) return;
    
    if (!pdfAnalysisResults || pdfAnalysisResults.length === 0) {
        container.innerHTML = '<p>No hay resultados disponibles.</p>';
        return;
    }
    
    let html = `
        <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;padding:20px;border-radius:12px;margin-bottom:20px;">
            <h3 style="color:white;margin-bottom:15px;"><i class="fas fa-chart-pie"></i> Resumen del Análisis</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:15px;">
                <div style="text-align:center;padding:15px;background:rgba(255,255,255,0.2);border-radius:8px;">
                    <div style="font-size:0.9rem;opacity:0.9;">Total Páginas</div>
                    <div style="font-size:1.5rem;font-weight:bold;">${pdfAnalysisResults.length}</div>
                </div>
                <div style="text-align:center;padding:15px;background:rgba(255,255,255,0.2);border-radius:8px;">
                    <div style="font-size:0.9rem;opacity:0.9;">Píxeles Netos</div>
                    <div style="font-size:1.5rem;font-weight:bold;">${pdfAnalysisResults.reduce((sum, r) => sum + r.netBlackPixels, 0).toLocaleString()}</div>
                </div>
            </div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:10px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
            <thead>
                <tr style="background:linear-gradient(to right, var(--primary), var(--primary-dark));color:white;">
                    <th style="padding:12px 8px;text-align:left;">Página</th><th>Color</th><th>Screen</th><th>Tipo</th>
                    <th>Ubicación</th><th>Píxeles Netos</th><th>% Cobertura</th><th>Concuerda</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    pdfAnalysisResults.forEach(result => {
        html += `
            <tr style="border-bottom:1px solid var(--border);">
                <td style="padding:12px 8px;">${result.page}</td>
                <td>${result.colorName}</td>
                <td>${result.screenLetter}</td>
                <td>${result.colorType}</td>
                <td>${result.arteName}</td>
                <td>${result.netBlackPixels.toLocaleString()}</td>
                <td>${result.coveragePercentage}%</td>
                <td>${result.matchesSpec ? '✅' : '❌'}</td>
            </tr>
        `;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

function savePDFResults() {
    if (!pdfAnalysisResults || pdfAnalysisResults.length === 0) {
        showStatus('No hay resultados para guardar', 'warning');
        return;
    }
    
    const data = {
        analysisDate: new Date().toISOString(),
        results: pdfAnalysisResults
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `PDF_Analysis_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    
    showStatus('✅ Resultados guardados como JSON');
}

// ========== STORAGE MANAGER ==========
function loadSavedSpecsList() {
    const list = document.getElementById('saved-specs-list');
    if (!list) return;
    
    const specs = Object.keys(localStorage).filter(k => k.startsWith('spec_'));
    
    if (specs.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:var(--gray-light);padding:30px;">No hay specs guardadas.</p>';
        return;
    }
    
    let html = '';
    specs.forEach(key => {
        try {
            const spec = JSON.parse(localStorage.getItem(key));
            html += `
                <div style="padding:15px;border-bottom:1px solid var(--border);">
                    <div style="font-weight:bold;color:var(--primary)">${spec.style || 'Sin nombre'}</div>
                    <div style="font-size:.85rem;color:var(--gray-medium)">
                        Cliente: ${spec.customer || 'N/A'} | Artes: ${spec.artes?.length || 0}
                    </div>
                    <div style="font-size:.75rem;color:var(--gray-light)">
                        ${spec.savedAt ? new Date(spec.savedAt).toLocaleDateString('es-ES') : 'Fecha desconocida'}
                    </div>
                    <div style="margin-top:10px;">
                        <button class="btn btn-primary btn-sm" onclick="loadSpec('${key}')">
                            <i class="fas fa-edit"></i> Cargar
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="deleteSpec('${key}')" style="margin-left:5px;">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            `;
        } catch(e) {
            console.error("Error cargando spec:", e);
        }
    });
    
    list.innerHTML = html;
}

function loadSpec(key) {
    try {
        const spec = JSON.parse(localStorage.getItem(key));
        
        // Cargar datos básicos
        Object.keys(spec).forEach(k => {
            const el = document.getElementById(k);
            if (el) el.value = spec[k] || '';
        });
        
        // Cargar artes
        if (spec.artes) {
            specGlobal.artes = spec.artes;
            renderArtes();
        }
        
        // Actualizar logo
        updateClientLogo();
        
        // Actualizar tinta
        const inkSelect = document.getElementById('ink-type-select');
        if (inkSelect && spec.inkType) {
            inkSelect.value = spec.inkType;
            updateInkPreset();
        }
        
        showTab('spec-creator');
        showStatus('Spec cargada correctamente');
    } catch(e) {
        showStatus('Error cargando spec', 'error');
    }
}

function deleteSpec(key) {
    if (confirm('¿Eliminar esta spec?')) {
        localStorage.removeItem(key);
        loadSavedSpecsList();
        updateDashboard();
        showStatus('Spec eliminada');
    }
}

function clearAllSpecs() {
    if (confirm('¿Eliminar TODAS las specs guardadas?')) {
        Object.keys(localStorage)
            .filter(k => k.startsWith('spec_'))
            .forEach(k => localStorage.removeItem(k));
        
        loadSavedSpecsList();
        updateDashboard();
        showStatus('Todas las specs eliminadas');
    }
}

// ========== EXCEL IMPORTER ==========
function handleExcelUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    showStatus('⚠️ Importación de Excel en desarrollo. Mostrando datos de ejemplo.', 'warning');
    
    // Datos de ejemplo
    const mockData = {
        customer: 'NIKE',
        style: 'JERSEY-2024',
        colorway: 'TEAM RED/WHITE',
        season: 'FALL 2024',
        pattern: 'PAT-12345',
        po: 'PO-67890',
        sampleType: 'PRODUCTION',
        nameTeam: 'LOS ANGELES',
        gender: 'MENS',
        designer: 'ELMER VELEZ',
        dimensions: 'SIZE: (W) 10" X (H) 12"',
        placement: '4.5" FROM COLLAR SEAM'
    };
    
    // Llenar formulario con datos
    Object.keys(mockData).forEach(key => {
        const el = document.getElementById(key);
        if (el) el.value = mockData[key];
    });
    
    // Actualizar logo
    updateClientLogo();
    
    showTab('spec-creator');
    showStatus('✅ Datos de ejemplo cargados (Excel en desarrollo)');
}

// ========== ZIP EXPORTER ==========
function downloadProjectZip() {
    showStatus('⚠️ Función ZIP en desarrollo. Por ahora usa los otros formatos.', 'warning');
}

function exportPDF() {
    showStatus('⚠️ Función PDF en desarrollo. Próximamente.', 'warning');
}

function exportToExcel() {
    showStatus('⚠️ Función Excel en desarrollo. Próximamente.', 'warning');
}

// ========== CLEAR FORM ==========
function clearForm() {
    if (confirm('¿Limpiar todo el formulario?')) {
        // Resetear objeto global
        specGlobal = {
            customer: '', style: '', colorway: '', season: '', pattern: '', po: '',
            sampleType: '', nameTeam: '', gender: '', designer: '', inkType: 'WATER',
            folder: '', dimensions: '', placement: '', temp: '320 °F', time: '1:40 min',
            specialties: '', instructions: '', imageB64: '', artes: [], savedAt: null
        };
        
        currentImageData = null;
        
        // Limpiar campos del formulario
        const fields = ['customer', 'style', 'colorway', 'season', 'pattern', 'po', 
                       'sampleType', 'nameTeam', 'gender', 'dimensions', 'placement', 
                       'specialties', 'instructions', 'folder-num'];
        
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        
        // Resetear selects
        document.getElementById('designer').value = '';
        document.getElementById('ink-type-select').value = 'WATER';
        document.getElementById('temp').value = '320 °F';
        document.getElementById('time').value = '1:40 min';
        
        // Limpiar imagen
        const preview = document.getElementById('imagePreview');
        if (preview) {
            preview.style.display = 'none';
            preview.src = '';
        }
        
        // Limpiar artes
        specGlobal.artes = [];
        renderArtes();
        
        // Limpiar logo
        const logo = document.getElementById('logoCliente');
        if (logo) logo.style.display = 'none';
        
        showStatus('Formulario limpiado', 'info');
    }
}

// ========== INICIALIZACIÓN ==========
function initApp() {
    console.log("Inicializando Tegra Spec Manager...");
    
    // 1. Crear el HTML de la aplicación
    const appContainer = document.getElementById('app-container');
    if (appContainer) {
        appContainer.innerHTML = `
            <div class="app-container">
                <!-- HEADER -->
                <header class="app-header">
                    <div class="logo-section">
                        <div class="app-logo">
                            <svg viewBox="0 0 145.94 39.05" fill="white" height="45">
                                <path d="M42.24 12.37v1.93h6.91v15.25h4.21V14.3h6.91v-3.88h-16.1l-1.93 1.95zm49.82 7.94v1.87h4.24v2.73c-.53.38-1.13.67-1.8.86s-1.39.29-2.16.29c-.84 0-1.61.15-2.32-.45-.71-.3-1.33-.72-1.84-1.27s-.92-1.19-1.2-1.93c-.28-.74-.42-1.54-.42-2.42v-.05c0-.82.14-1.59.42-2.31.28-.72.67-1.35 1.18-1.89.5-.54 1.08-.97 1.75-1.28.66-.32 1.38-.48 2.15-.48.55 0 1.05.05 1.5.14.46.09.88.22 1.27.38.39.16.77.36 1.13.6.25.16.49.34.74.54l2.94-2.97c-.47-.4-.96-.75-1.46-1.07-.53-.33-1.09-.60-1.70-.82-.60-.22-1.25-.39-1.95-.51s-1.48-.18-2.34-.18c-1.44 0-2.77.26-4.00.78-1.23.52-2.29 1.23-3.18 2.13-.89.90-1.59 1.95-2.09 3.14-.50 1.19-.75 2.47-.75 3.84v.05c0 1.42.25 2.73.74 3.94.49 1.20 1.18 2.24 2.06 3.12.88.87 1.94 1.56 3.17 2.05 1.23.49 2.59.74 4.09.74 1.75 0 3.30-.30 4.66-.89 1.36-.59 2.53-1.31 3.51-2.15v-8.31h-6.56l-1.74 1.76zM68.15 21.80h9.02v-3.74h-9.02v-3.88h10.25v-3.74h-12.55l-1.86 1.88v17.26h14.54v-3.74h-10.39v-4.02zm46.09-11.37h-8.75v19.13h4.21v-6.12h3.31l4.10 6.12h2.57l1.39-1.40-3.71-5.43c1.22-.46 2.21-1.17 2.97-2.15.76-.97 1.13-2.24 1.13-3.79v-.05c0-1.82-.55-3.28-1.64-4.37-1.29-1.29-3.15-1.94-5.58-1.94zm2.95 6.60c0 .82-.28 1.48-.83 1.98-.56.49-1.35.74-2.39.74h-4.26v-5.52h4.18c1.04 0 1.85.23 2.43.69.58.46.87 1.14.87 2.06v.05zm19.51-6.74h-3.88l-8.20 19.27h4.29l1.75-4.29h8.09l1.75 4.29h1.97l1.70-1.72-7.47-17.55zm-4.54 11.29l2.54-6.20 2.54 6.20h-5.08z"/>
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
                <nav class="app-nav">
                    <ul class="nav-tabs">
                        <li class="nav-tab active" onclick="showTab('dashboard')">
                            <i class="fas fa-tachometer-alt"></i> Dashboard
                        </li>
                        <li class="nav-tab" onclick="showTab('spec-creator')">
                            <i class="fas fa-file-alt"></i> Crear Spec
                        </li>
                        <li class="nav-tab" onclick="showTab('pdf-analysis')">
                            <i class="fas fa-search"></i> Analizar PDF
                        </li>
                        <li class="nav-tab" onclick="showTab('saved-specs')">
                            <i class="fas fa-database"></i> Guardadas
                        </li>
                    </ul>
                </nav>

                <!-- CONTENIDO PRINCIPAL -->
                <main class="app-main">
                    <!-- DASHBOARD -->
                    <div id="dashboard" class="tab-content active">
                        <div class="dashboard-grid">
                            <div class="stat-card"><div class="stat-number" id="total-specs">0</div><div class="stat-label">Specs Totales</div></div>
                            <div class="stat-card"><div class="stat-number" id="today-specs">0</div><div class="stat-label">Creadas Hoy</div></div>
                            <div class="stat-card"><div class="stat-number" id="active-projects">0</div><div class="stat-label">Proyectos Activos</div></div>
                            <div class="stat-card"><div class="stat-number" id="completion-rate">0%</div><div class="stat-label">Tasa de Finalización</div></div>
                        </div>
                        <div class="card">
                            <div class="card-body" style="text-align:center">
                                <h2 style="color:var(--primary);margin-bottom:20px">
                                    <i class="fas fa-rocket"></i> Acciones Rápidas
                                </h2>
                                <div style="margin-top:20px;display:flex;gap:15px;justify-content:center;flex-wrap:wrap">
                                    <button class="btn btn-primary btn-lg" onclick="showTab('spec-creator')">
                                        <i class="fas fa-plus"></i> Nueva Spec
                                    </button>
                                    <button class="btn btn-success btn-lg" onclick="document.getElementById('excelFile').click()">
                                        <i class="fas fa-file-excel"></i> Cargar Excel
                                    </button>
                                    <button class="btn btn-warning btn-lg" onclick="showTab('pdf-analysis')">
                                        <i class="fas fa-file-pdf"></i> Analizar PDF
                                    </button>
                                    <button class="btn btn-outline btn-lg" onclick="showTab('saved-specs')">
                                        <i class="fas fa-history"></i> Ver Historial
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- SPEC CREATOR -->
                    <div id="spec-creator" class="tab-content">
                        <!-- Información General -->
                        <div class="card">
                            <div class="card-header">
                                <h2 class="card-title"><i class="fas fa-info-circle"></i> Información General</h2>
                            </div>
                            <div class="card-body">
                                <div class="form-grid">
                                    <div class="form-group"><label class="form-label">CLIENTE:</label><input type="text" id="customer" class="form-control" oninput="updateClientLogo()"></div>
                                    <div class="form-group"><label class="form-label">STYLE:</label><input type="text" id="style" class="form-control"></div>
                                    <div class="form-group"><label class="form-label">COLORWAY:</label><input type="text" id="colorway" class="form-control"></div>
                                    <div class="form-group"><label class="form-label">SEASON:</label><input type="text" id="season" class="form-control"></div>
                                    <div class="form-group"><label class="form-label">PATTERN #:</label><input type="text" id="pattern" class="form-control"></div>
                                    <div class="form-group"><label class="form-label">P.O. #:</label><input type="text" id="po" class="form-control"></div>
                                    <div class="form-group"><label class="form-label">SAMPLE TYPE:</label><input type="text" id="sample-type" class="form-control"></div>
                                    <div class="form-group"><label class="form-label">NAME / TEAM:</label><input type="text" id="name-team" class="form-control"></div>
                                    <div class="form-group"><label class="form-label">GENDER:</label><input type="text" id="gender" class="form-control"></div>
                                    <div class="form-group"><label class="form-label">DISEÑADOR:</label>
                                        <select id="designer" class="form-control">
                                            <option value="">Seleccionar...</option>
                                            <option>ELMER VELEZ</option><option>DANIEL HERNANDEZ</option><option>CINDY PINEDA</option><option>FERNANDO FERRERA</option><option>NILDA CORDOBA</option><option>OTRO</option>
                                        </select>
                                    </div>
                                    <div class="form-group"><label class="form-label">INK TYPE:</label>
                                        <select id="ink-type-select" class="form-control">
                                            <option value="WATER">WATER</option><option value="PLASTISOL">PLASTISOL</option><option value="SILICONE">SILICONE</option>
                                        </select>
                                    </div>
                                    <div class="form-group"><label class="form-label">DIMENSIONES (PULGADAS):</label><input type="text" id="dimensions" class="form-control" placeholder='SIZE: (W) ##" X (H) ##"'></div>
                                    <div class="form-group"><label class="form-label">PLACEMENT:</label><input type="text" id="placement" class="form-control" placeholder='#.#" FROM COLLAR SEAM'></div>
                                    <div class="form-group"><label class="form-label">TEMP:</label><input type="text" id="temp" class="form-control" value="320 °F"></div>
                                    <div class="form-group"><label class="form-label">TIME:</label><input type="text" id="time" class="form-control" value="1:40 min"></div>
                                    <div class="form-group"><label class="form-label">SPECIALTIES:</label><input type="text" id="specialties" class="form-control"></div>
                                    <div class="form-group"><label class="form-label">INSTRUCTIONS:</label><textarea id="instructions" class="form-control" rows="3"></textarea></div>
                                    <div class="form-group"><label class="form-label">IMAGEN (Opcional):</label>
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
                            <div class="card-body" id="artes-container">
                                <!-- Las ubicaciones aparecerán aquí -->
                            </div>
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
                    </div>

                    <!-- PDF ANALYSIS -->
                    <div id="pdf-analysis" class="tab-content">
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
                    </div>

                    <!-- GUARDADAS -->
                    <div id="saved-specs" class="tab-content">
                        <div class="card">
                            <div class="card-header">
                                <h2 class="card-title"><i class="fas fa-database"></i> Specs Guardadas</h2>
                                <button class="btn btn-outline btn-sm" onclick="clearAllSpecs()">
                                    <i class="fas fa-trash"></i> Limpiar Todo
                                </button>
                            </div>
                            <div class="card-body" id="saved-specs-list">
                                <!-- Las specs guardadas aparecerán aquí -->
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }
    
    // 2. Configurar eventos
    setupEventListeners();
    
    // 3. Inicializar componentes
    initPDFAnalyzer();
    updateDateTime();
    updateDashboard();
    renderArtes();
    
    // 4. Actualizar fecha/hora cada minuto
    setInterval(updateDateTime, 60000);
    
    // 5. Mostrar mensaje de éxito
    setTimeout(() => {
        showStatus('✅ Tegra Spec Manager cargado correctamente', 'success');
    }, 1000);
}

function setupEventListeners() {
    // Excel
    document.getElementById('excelFile')?.addEventListener('change', handleExcelUpload);
    
    // Imagen principal
    document.getElementById('imageInput')?.addEventListener('change', function(e) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImageData = e.target.result;
            const preview = document.getElementById('imagePreview');
            if (preview) {
                preview.src = currentImageData;
                preview.style.display = 'block';
            }
            showStatus('✅ Imagen cargada');
        };
        reader.readAsDataURL(e.target.files[0]);
    });
    
    // Pegar imagen
    document.addEventListener('paste', function(e) {
        if (e.clipboardData && e.clipboardData.items) {
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        currentImageData = e.target.result;
                        const preview = document.getElementById('imagePreview');
                        if (preview) {
                            preview.src = currentImageData;
                            preview.style.display = 'block';
                        }
                        showStatus('✅ Imagen pegada desde portapapeles');
                    };
                    reader.readAsDataURL(blob);
                    break;
                }
            }
        }
    });
    
    // Folder number
    document.getElementById('folder-num')?.addEventListener('input', function() {
        specGlobal.folder = this.value;
    });
    
    // Tinta
    document.getElementById('ink-type-select')?.addEventListener('change', updateInkPreset);
}

// ========== EJECUCIÓN PRINCIPAL ==========
// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);
