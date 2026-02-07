// ========== VARIABLES GLOBALES ==========
const stateManager = new StateManager();
let placements = [];
let currentPlacementId = 1;
let clientLogoCache = {};
let isDarkMode = true;

// ========== CONFIGURACIÓN PDF ==========
const pdfConfig = {
    margin: 15,
    pageWidth: 210, // A4 en mm
    pageHeight: 297,
    col1: 15,
    col2: 110,
    labelW: 35,
    lineHeight: 6,
    smallLineHeight: 4,
    headerColor: [41, 128, 185], // Azul TEGRA
    accentColor: [231, 76, 60],  // Rojo para destacar
    grayLight: [240, 240, 240],
    grayMedium: [200, 200, 200],
    grayDark: [100, 100, 100]
};

// ========== FUNCIONES AUXILIARES ==========
function stringToHash(str) {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    document.getElementById('current-datetime').textContent = 
        now.toLocaleDateString('es-ES', options);
}

function showStatus(msg, type = 'success') {
    const el = document.getElementById('statusMessage');
    el.textContent = msg;
    el.className = `status-message status-${type}`;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 4000);
}

function getInkPresetSafe(inkType = 'WATER') {
    const defaultPreset = {
        temp: '320 °F',
        time: inkType === 'WATERBASE' ? '1:00 min' : '1:40 min',
        blocker: { name: 'BLOCKER CHT', mesh1: '122/55', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
        white: { name: 'AQUAFLEX WHITE', mesh1: '198/40', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
        color: { mesh: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: '3 % cross-linker 500 · 1.5 % antitack' }
    };

    if (window.Utils && typeof window.Utils.getInkPreset === 'function') {
        const preset = window.Utils.getInkPreset(inkType);
        if (preset && preset.color) {
            return preset;
        }
    }

    return defaultPreset;
}

function bindSpecCreatorFormSafety() {
    const form = document.getElementById('spec-creator-form');
    if (!form || form.dataset.submitGuardBound === '1') return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
    });

    form.dataset.submitGuardBound = '1';
}

async function loadTabTemplates() {
    const templateSections = Array.from(document.querySelectorAll('[data-template]'));
    await Promise.all(templateSections.map(async (section) => {
        const templatePath = section.dataset.template;
        if (!templatePath) return;
        const response = await fetch(templatePath);
        if (!response.ok) {
            throw new Error(`No se pudo cargar el template: ${templatePath}`);
        }
        section.innerHTML = await response.text();
    }));
}

// ========== FUNCIONES DE TEMA ==========
function toggleTheme() {
    isDarkMode = !isDarkMode;
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    
    if (isDarkMode) {
        body.classList.remove('light-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
        showStatus('🌙 Modo oscuro activado');
    } else {
        body.classList.add('light-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
        showStatus('☀️ Modo claro activado');
    }
    
    localStorage.setItem('tegraspec-theme', isDarkMode ? 'dark' : 'light');
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('tegraspec-theme');
    const themeToggle = document.getElementById('themeToggle');
    
    if (savedTheme === 'light') {
        isDarkMode = false;
        document.body.classList.add('light-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
    } else {
        isDarkMode = true;
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
    }
}

// ========== FUNCIONES DE NAVEGACIÓN ==========
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        if (tab.innerText.toLowerCase().includes(tabName.replace('-', ' '))) {
            tab.classList.add('active');
        }
    });
    
    if (tabName === 'saved-specs') loadSavedSpecsList();
    if (tabName === 'dashboard') updateDashboard();
    if (tabName === 'error-log') loadErrorLog();
    if (tabName === 'spec-creator') {
        if (placements.length === 0) {
            initializePlacements();
        }
    }
}

// ========== FUNCIÓN SETUP PASTE HANDLER ==========
function setupPasteHandler() {
    document.addEventListener('paste', function(e) {
        const activePlacement = document.querySelector('.placement-section.active');
        if (!activePlacement) return;
        
        const items = e.clipboardData.items;
        
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    const placementId = activePlacement.dataset.placementId;
                    const placement = placements.find(p => p.id === parseInt(placementId));
                    
                    if (placement) {
                        placement.imageData = event.target.result;
                        
                        const img = document.getElementById(`placement-image-preview-${placementId}`);
                        const imageActions = document.getElementById(`placement-image-actions-${placementId}`);
                        
                        if (img && imageActions) {
                            img.src = event.target.result;
                            img.style.display = 'block';
                            imageActions.style.display = 'flex';
                        }
                        
                        showStatus(`✅ Imagen pegada en ${placement.type}`);
                    }
                };
                
                reader.readAsDataURL(blob);
                e.preventDefault();
                break;
            }
        }
    });
}

// ========== FUNCIONES DE DETECCIÓN ==========
function detectTeamFromStyle(style) {
    return window.Utils ? window.Utils.detectTeamFromStyle(style) : '';
}

function extractGenderFromStyle(style) {
    return window.Utils ? window.Utils.extractGenderFromStyle(style) : '';
}

// ========== FUNCIÓN ACTUALIZADA updateClientLogo ==========
function updateClientLogo() {
    const customer = document.getElementById('customer').value.toUpperCase().trim();
    const logoElement = document.getElementById('logoCliente');
    if (!logoElement) return;
    
    let logoUrl = '';
    
    // Detectar Gear for Sport con todas sus variaciones
    const gfsVariations = ['GEAR FOR SPORT', 'GEARFORSPORT', 'GFS', 'G.F.S.', 'G.F.S', 'GEAR', 'G-F-S'];
    const isGFS = gfsVariations.some(variation => customer.includes(variation));
    
    if (customer.includes('NIKE') || customer.includes('NIQUE')) {
        logoUrl = 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Nike-Logotipo-PNG-Photo.png';
    } else if (customer.includes('FANATICS') || customer.includes('FANATIC')) {
        logoUrl = 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Fanatics_company_logo.svg.png';
    } else if (customer.includes('ADIDAS')) {
        logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1280px-Adidas_Logo.svg.png';
    } else if (customer.includes('PUMA')) {
        logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Puma_Logo.svg/1280px-Puma_Logo.svg.png';
    } else if (customer.includes('UNDER ARMOUR') || customer.includes('UA')) {
        logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Under_armour_logo.svg/1280px-Under_armour_logo.svg.png';
    } else if (isGFS) {
        logoUrl = 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png';
    }
    
    if (logoUrl) {
        logoElement.src = logoUrl;
        logoElement.style.display = 'block';
        clientLogoCache[customer] = logoUrl;
    } else {
        logoElement.style.display = 'none';
    }
}

function setInputValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value;
    }
}

function handleGearForSportLogic() {
    const customerInput = document.getElementById('customer');
    const nameTeamInput = document.getElementById('name-team');
    if (!customerInput || !nameTeamInput) return;
    if (customerInput.value.toUpperCase().trim() !== 'GEAR FOR SPORT') return;
    const styleInput = document.getElementById('style');
    const poInput = document.getElementById('po');
    const searchTerm = (styleInput?.value || '') || (poInput?.value || '');
    if (window.Config && window.Config.GEARFORSPORT_TEAM_MAP) {
        const teamKey = Object.keys(window.Config.GEARFORSPORT_TEAM_MAP).find(key =>
            searchTerm.toUpperCase().includes(key)
        );
        if (teamKey) nameTeamInput.value = window.Config.GEARFORSPORT_TEAM_MAP[teamKey];
    }
}

// ========== FUNCIONES PARA MÚLTIPLES PLACEMENTS ==========
function initializePlacements() {
    const firstPlacementId = addNewPlacement('FRONT', true);
    
    if (placements.length > 0) {
        renderPlacementHTML(placements[0]);
    }
    
    updatePlacementsTabs();
    showPlacement(firstPlacementId);
}

function addNewPlacement(type = null, isFirst = false) {
    const placementId = isFirst ? 1 : Date.now();
    const placementType = type || getNextPlacementType();
    
    const newPlacement = {
        id: placementId,
        type: placementType,
        name: `Placement ${getNextPlacementNumber()}`,
        imageData: null,
        colors: [],
        placementDetails: '#.#" FROM COLLAR SEAM',
        dimensions: 'SIZE: (W) ##" X (H) ##"',
        temp: '320 °F',
        time: '1:40 min',
        specialties: '',
        specialInstructions: '',
        inkType: 'WATER',
        placementSelect: 'FRONT',
        isActive: true,
        // Nuevos campos para parámetros editables
        meshColor: '',
        meshWhite: '',
        meshBlocker: '',
        durometer: '',
        strokes: '',
        additives: '',
        width: '',
        height: ''
    };
    
    if (!isFirst) {
        placements.push(newPlacement);
    } else {
        placements = [newPlacement];
    }
    
    if (!isFirst) {
        renderPlacementHTML(newPlacement);
        showPlacement(placementId);
        updatePlacementsTabs();
    }
    
    return placementId;
}

function getNextPlacementType() {
    const usedTypes = placements.map(p => p.type);
    const allTypes = ['FRONT', 'BACK', 'SLEEVE', 'CHEST', 'TV. NUMBERS', 'SHOULDER', 'COLLAR', 'CUSTOM'];
    
    for (const type of allTypes) {
        if (!usedTypes.includes(type)) {
            return type;
        }
    }
    return 'CUSTOM';
}

function getNextPlacementNumber() {
    return placements.length + 1;
}

// ========== RENDER PLACEMENT HTML ==========
function renderPlacementHTML(placement) {
    const container = document.getElementById('placements-container');
    
    if (document.getElementById(`placement-section-${placement.id}`)) {
        return;
    }
    
    const sectionId = `placement-section-${placement.id}`;
    const isCustom = placement.type.includes('CUSTOM:');
    const displayType = isCustom ? 'CUSTOM' : placement.type;
    const customName = isCustom ? placement.type.replace('CUSTOM: ', '') : '';
    
    // Obtener valores por defecto
    const preset = getInkPresetSafe(placement.inkType || 'WATER');
    
    const defaultMeshColor = preset.color.mesh || '157/48';
    const defaultMeshWhite = preset.white.mesh1 || '198/40';
    const defaultMeshBlocker = preset.blocker.mesh1 || '122/55';
    const defaultDurometer = preset.color.durometer || '70';
    const defaultStrokes = preset.color.strokes || '2';
    const defaultAngle = preset.color.angle || '15';
    const defaultPressure = preset.color.pressure || '40';
    const defaultSpeed = preset.color.speed || '35';
    const defaultAdditives = preset.color.additives || '3 % cross-linker 500 · 1.5 % antitack';
    
    // Extraer dimensiones
    const dimensions = extractDimensions(placement.dimensions);
    
    const sectionHTML = `
        <div id="${sectionId}" class="placement-section" data-placement-id="${placement.id}">
            <div class="placement-header">
                <div class="placement-title">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${displayType}</span>
                </div>
                <div class="placement-actions">
                    <button class="btn btn-outline btn-sm" onclick="duplicatePlacement(${placement.id})">
                        <i class="fas fa-copy"></i> Duplicar
                    </button>
                    ${placements.length > 1 ? `
                    <button class="btn btn-danger btn-sm" onclick="removePlacement(${placement.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                    ` : ''}
                </div>
            </div>
            
            <div class="placement-grid">
                <div class="placement-left-column">
                    <!-- Tipo de Placement -->
                    <div class="form-group">
                        <label class="form-label">TIPO DE PLACEMENT:</label>
                        <select class="form-control placement-type-select" 
                                data-placement-id="${placement.id}"
                                onchange="updatePlacementType(${placement.id}, this.value)">
                            <option value="FRONT" ${placement.type === 'FRONT' || displayType === 'FRONT' ? 'selected' : ''}>FRONT (Frente)</option>
                            <option value="BACK" ${placement.type === 'BACK' || displayType === 'BACK' ? 'selected' : ''}>BACK (Espalda)</option>
                            <option value="SLEEVE" ${placement.type === 'SLEEVE' || displayType === 'SLEEVE' ? 'selected' : ''}>SLEEVE (Manga)</option>
                            <option value="CHEST" ${placement.type === 'CHEST' || displayType === 'CHEST' ? 'selected' : ''}>CHEST (Pecho)</option>
                            <option value="TV. NUMBERS" ${placement.type === 'TV. NUMBERS' || displayType === 'TV. NUMBERS' ? 'selected' : ''}>TV. NUMBERS (Números TV)</option>
                            <option value="SHOULDER" ${placement.type === 'SHOULDER' || displayType === 'SHOULDER' ? 'selected' : ''}>SHOULDER (Hombro)</option>
                            <option value="COLLAR" ${placement.type === 'COLLAR' || displayType === 'COLLAR' ? 'selected' : ''}>COLLAR (Cuello)</option>
                            <option value="CUSTOM" ${isCustom ? 'selected' : ''}>CUSTOM (Personalizado)</option>
                        </select>
                    </div>
                    
                    <!-- Input para custom placement -->
                    <div id="custom-placement-input-${placement.id}" style="display:${isCustom ? 'block' : 'none'}; margin-top:10px;">
                        <label class="form-label">NOMBRE DEL PLACEMENT:</label>
                        <input type="text" 
                               class="form-control custom-placement-name"
                               data-placement-id="${placement.id}"
                               placeholder="Escribe el nombre del placement personalizado..."
                               value="${customName}"
                               oninput="updateCustomPlacement(${placement.id}, this.value)">
                    </div>
                    
                    <!-- Imagen de Referencia -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title" style="font-size: 1rem;">
                                <i class="fas fa-image"></i> Imagen para ${displayType}
                            </h3>
                        </div>
                        <div class="card-body">
                            <div class="file-upload-area" onclick="openImagePickerForPlacement(${placement.id})">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>Haz clic para subir una imagen para este placement</p>
                                <p style="font-size:0.8rem; color:var(--text-secondary);">Ctrl+V para pegar</p>
                            </div>
                            <div class="image-preview-container">
                                <img id="placement-image-preview-${placement.id}" 
                                     class="image-preview placement-image" 
                                     alt="Vista previa"
                                     style="display: none;">
                                <div class="image-actions" id="placement-image-actions-${placement.id}" style="display:none;">
                                    <button class="btn btn-danger btn-sm" onclick="removePlacementImage(${placement.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Condiciones de Impresión -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title" style="font-size: 1rem;">
                                <i class="fas fa-print"></i> Condiciones para ${displayType}
                            </h3>
                        </div>
                        <div class="card-body">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">DETALLES DE UBICACIÓN:</label>
                                    <input type="text" 
                                           id="placement-details-${placement.id}"
                                           class="form-control placement-details"
                                           value="${placement.placementDetails}"
                                           oninput="updatePlacementField(${placement.id}, 'placementDetails', this.value)">
                                </div>
                                
                                <!-- Dimensiones separadas -->
                                <div class="form-group">
                                    <label class="form-label">DIMENSIONES:</label>
                                    <div style="display: flex; gap: 10px; align-items: center;">
                                        <input type="text" 
                                               id="dimension-w-${placement.id}"
                                               class="form-control placement-dimension-w"
                                               placeholder="Ancho"
                                               value="${placement.width || dimensions.width.replace('"', '')}"
                                               oninput="updatePlacementDimension(${placement.id}, 'width', this.value)"
                                               style="width: 100px;">
                                        <span style="color: var(--text-secondary);">X</span>
                                        <input type="text" 
                                               id="dimension-h-${placement.id}"
                                               class="form-control placement-dimension-h"
                                               placeholder="Alto"
                                               value="${placement.height || dimensions.height.replace('"', '')}"
                                               oninput="updatePlacementDimension(${placement.id}, 'height', this.value)"
                                               style="width: 100px;">
                                        <span style="color: var(--text-secondary);">pulgadas</span>
                                    </div>
                                </div>
                                
                                <!-- Campos de temperatura y tiempo -->
                                <div class="form-group">
                                    <label class="form-label">TEMPERATURA:</label>
                                    <input type="text" 
                                           id="temp-${placement.id}"
                                           class="form-control placement-temp"
                                           value="${placement.temp}"
                                           readonly
                                           title="Determinado por el tipo de tinta seleccionado">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">TIEMPO:</label>
                                    <input type="text" 
                                           id="time-${placement.id}"
                                           class="form-control placement-time"
                                           value="${placement.time}"
                                           readonly
                                           title="Determinado por el tipo de tinta seleccionado">
                                </div>
                                
                                <!-- CAMPO SPECIALTIES AGREGADO -->
                                <div class="form-group">
                                    <label class="form-label">SPECIALTIES:</label>
                                    <input type="text" 
                                           id="specialties-${placement.id}"
                                           class="form-control placement-specialties"
                                           placeholder="Detectado automáticamente..."
                                           value="${placement.specialties || ''}"
                                           readonly
                                           title="Detectado automáticamente de los colores">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Parámetros de Impresión Editables -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title" style="font-size: 1rem;">
                                <i class="fas fa-sliders-h"></i> Parámetros de Impresión
                            </h3>
                        </div>
                        <div class="card-body">
                            <div class="form-grid">
                                <!-- Malla para colores regulares -->
                                <div class="form-group">
                                    <label class="form-label">MALLA COLORES:</label>
                                    <input type="text" 
                                           id="mesh-color-${placement.id}"
                                           class="form-control placement-mesh-color"
                                           value="${placement.meshColor || defaultMeshColor}"
                                           oninput="updatePlacementParam(${placement.id}, 'meshColor', this.value)"
                                           title="Malla para colores regulares">
                                </div>
                                
                                <!-- Malla para White Base -->
                                <div class="form-group">
                                    <label class="form-label">MALLA WHITE BASE:</label>
                                    <input type="text" 
                                           id="mesh-white-${placement.id}"
                                           class="form-control placement-mesh-white"
                                           value="${placement.meshWhite || defaultMeshWhite}"
                                           oninput="updatePlacementParam(${placement.id}, 'meshWhite', this.value)"
                                           title="Malla para White Base">
                                </div>
                                
                                <!-- Malla para Blocker -->
                                <div class="form-group">
                                    <label class="form-label">MALLA BLOCKER:</label>
                                    <input type="text" 
                                           id="mesh-blocker-${placement.id}"
                                           class="form-control placement-mesh-blocker"
                                           value="${placement.meshBlocker || defaultMeshBlocker}"
                                           oninput="updatePlacementParam(${placement.id}, 'meshBlocker', this.value)"
                                           title="Malla para Blocker">
                                </div>
                                
                                <!-- Durómetro -->
                                <div class="form-group">
                                    <label class="form-label">DURÓMETRO:</label>
                                    <input type="text" 
                                           id="durometer-${placement.id}"
                                           class="form-control placement-durometer"
                                           value="${placement.durometer || defaultDurometer}"
                                           oninput="updatePlacementParam(${placement.id}, 'durometer', this.value)"
                                           title="Durometer (dureza de la racleta)">
                                </div>
                                
                                <!-- STROKES -->
                                <div class="form-group">
                                    <label class="form-label">STROKES:</label>
                                    <input type="text" 
                                           id="strokes-${placement.id}"
                                           class="form-control placement-strokes"
                                           value="${placement.strokes || defaultStrokes}"
                                           oninput="updatePlacementParam(${placement.id}, 'strokes', this.value)"
                                           title="Número de strokes">
                                </div>
                                
                                <!-- ANGLE -->
                                <div class="form-group">
                                    <label class="form-label">ANGLE:</label>
                                    <input type="text" 
                                           id="angle-${placement.id}"
                                           class="form-control placement-angle"
                                           value="${placement.angle || defaultAngle}"
                                           oninput="updatePlacementParam(${placement.id}, 'angle', this.value)"
                                           title="Ángulo de la racleta">
                                </div>
                                
                                <!-- PRESSURE -->
                                <div class="form-group">
                                    <label class="form-label">PRESSURE:</label>
                                    <input type="text" 
                                           id="pressure-${placement.id}"
                                           class="form-control placement-pressure"
                                           value="${placement.pressure || defaultPressure}"
                                           oninput="updatePlacementParam(${placement.id}, 'pressure', this.value)"
                                           title="Presión de impresión">
                                </div>
                                
                                <!-- SPEED -->
                                <div class="form-group">
                                    <label class="form-label">SPEED:</label>
                                    <input type="text" 
                                           id="speed-${placement.id}"
                                           class="form-control placement-speed"
                                           value="${placement.speed || defaultSpeed}"
                                           oninput="updatePlacementParam(${placement.id}, 'speed', this.value)"
                                           title="Velocidad de impresión">
                                </div>
                                
                                <!-- Aditivos -->
                                <div class="form-group">
                                    <label class="form-label">ADITIVOS:</label>
                                    <input type="text" 
                                           id="additives-${placement.id}"
                                           class="form-control placement-additives"
                                           value="${placement.additives || defaultAdditives}"
                                           oninput="updatePlacementParam(${placement.id}, 'additives', this.value)"
                                           title="Aditivos para la tinta">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="placement-right-column">
                    <!-- Tipo de Tinta -->
                    <div class="form-group">
                        <label class="form-label">TIPO DE TINTA:</label>
                        <select class="form-control placement-ink-type"
                                data-placement-id="${placement.id}"
                                onchange="updatePlacementInkType(${placement.id}, this.value)">
                            <option value="WATER" ${placement.inkType === 'WATER' ? 'selected' : ''}>Water-base</option>
                            <option value="PLASTISOL" ${placement.inkType === 'PLASTISOL' ? 'selected' : ''}>Plastisol</option>
                            <option value="SILICONE" ${placement.inkType === 'SILICONE' ? 'selected' : ''}>Silicone</option>
                        </select>
                    </div>
                    
                    <!-- Colores y Tintas -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title" style="font-size: 1rem;">
                                <i class="fas fa-palette"></i> Colores para ${displayType}
                            </h3>
                        </div>
                        <div class="card-body">
                            <div class="no-print" style="margin-bottom:20px; display:flex; gap:10px; flex-wrap:wrap;">
                                <button type="button" class="btn btn-danger btn-sm" onclick="addPlacementColorItem(${placement.id}, 'BLOCKER')">
                                    <i class="fas fa-plus"></i> Blocker
                                </button>
                                <button type="button" class="btn btn-white-base btn-sm" onclick="addPlacementColorItem(${placement.id}, 'WHITE_BASE')">
                                    <i class="fas fa-plus"></i> White Base
                                </button>
                                <button type="button" class="btn btn-primary btn-sm" onclick="addPlacementColorItem(${placement.id}, 'COLOR')">
                                    <i class="fas fa-plus"></i> Color
                                </button>
                                <button type="button" class="btn btn-warning btn-sm" onclick="addPlacementColorItem(${placement.id}, 'METALLIC')">
                                    <i class="fas fa-star"></i> Metálico
                                </button>
                            </div>
                            <div id="placement-colors-container-${placement.id}" class="color-sequence"></div>
                        </div>
                    </div>
                    
                    <!-- Instrucciones Especiales -->
                    <div class="form-group">
                        <label class="form-label">INSTRUCCIONES ESPECIALES:</label>
                        <textarea id="special-instructions-${placement.id}"
                                  class="form-control placement-special-instructions"
                                  rows="3"
                                  placeholder="Instrucciones especiales para este placement..."
                                  oninput="updatePlacementField(${placement.id}, 'specialInstructions', this.value)">${placement.specialInstructions}</textarea>
                    </div>
                    
                    <!-- Vista previa de colores -->
                    <div id="placement-colors-preview-${placement.id}" class="color-legend"></div>
                    
                    <!-- Secuencia de Estaciones -->
                    <h4 style="margin:15px 0 10px; font-size:0.9rem; color:var(--primary);">
                        <i class="fas fa-list-ol"></i> Secuencia de ${displayType}
                    </h4>
                    <div id="placement-sequence-table-${placement.id}"></div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML += sectionHTML;
    
    renderPlacementColors(placement.id);
    updatePlacementStations(placement.id);
    updatePlacementColorsPreview(placement.id);
    
    if (placement.imageData) {
        const img = document.getElementById(`placement-image-preview-${placement.id}`);
        const imageActions = document.getElementById(`placement-image-actions-${placement.id}`);
        
        if (img && imageActions) {
            img.src = placement.imageData;
            img.style.display = 'block';
            imageActions.style.display = 'flex';
        }
    }
}

// ========== FUNCIONES DE GESTIÓN DE PLACEMENTS ==========
function updatePlacementsTabs() {
    const tabsContainer = document.getElementById('placements-tabs');
    tabsContainer.innerHTML = '';
    
    placements.forEach(placement => {
        const displayType = placement.type.includes('CUSTOM:') 
            ? placement.type.replace('CUSTOM: ', '')
            : placement.type;
            
        const tab = document.createElement('div');
        tab.className = `placement-tab ${placement.id === currentPlacementId ? 'active' : ''}`;
        tab.setAttribute('data-placement-id', placement.id);
        tab.innerHTML = `
            <i class="fas fa-${getPlacementIcon(placement.type)}"></i>
            ${displayType.substring(0, 15)}${displayType.length > 15 ? '...' : ''}
            ${placements.length > 1 ? `<span class="remove-tab" onclick="removePlacement(${placement.id})">&times;</span>` : ''}
        `;
        
        tab.addEventListener('click', (e) => {
            if (!e.target.classList.contains('remove-tab')) {
                showPlacement(placement.id);
            }
        });
        tabsContainer.appendChild(tab);
    });
}

function showPlacement(placementId) {
    document.querySelectorAll('.placement-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const section = document.getElementById(`placement-section-${placementId}`);
    if (section) {
        section.classList.add('active');
    }
    
    document.querySelectorAll('.placement-tab').forEach(tab => {
        tab.classList.toggle('active', parseInt(tab.dataset.placementId) === placementId);
    });
    
    currentPlacementId = placementId;
}

function getPlacementIcon(type) {
    const icons = {
        'FRONT': 'tshirt',
        'BACK': 'tshirt',
        'SLEEVE': 'hat-cowboy',
        'CHEST': 'heart',
        'TV. NUMBERS': 'hashtag',
        'SHOULDER': 'user',
        'COLLAR': 'circle',
        'CUSTOM': 'star'
    };
    
    if (type.includes('CUSTOM:')) {
        return 'star';
    }
    return icons[type] || 'map-marker-alt';
}

function updatePlacementType(placementId, type) {
    const placement = placements.find(p => p.id === placementId);
    if (placement) {
        const customInput = document.getElementById(`custom-placement-input-${placementId}`);
        
        if (type === 'CUSTOM') {
            if (customInput) customInput.style.display = 'block';
            if (!placement.type.startsWith('CUSTOM:')) {
                placement.type = 'CUSTOM:';
            }
        } else {
            if (customInput) customInput.style.display = 'none';
            placement.type = type;
            placement.name = type;
        }
        
        updateAllPlacementTitles(placementId);
        showStatus(`✅ Tipo de placement cambiado a ${type}`);
    }
}

function updateCustomPlacement(placementId, customName) {
    const placement = placements.find(p => p.id === placementId);
    if (placement && customName.trim()) {
        placement.type = `CUSTOM: ${customName}`;
        placement.name = customName;
        updateAllPlacementTitles(placementId);
        showStatus(`✅ Placement personalizado: "${customName}" creado`);
    }
}

function updateAllPlacementTitles(placementId) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;
    
    const displayType = placement.type.includes('CUSTOM:') 
        ? placement.type.replace('CUSTOM: ', '')
        : placement.type;
    
    const section = document.getElementById(`placement-section-${placementId}`);
    if (!section) return;
    
    // 1. Título principal
    const mainTitle = section.querySelector('.placement-title span');
    if (mainTitle) mainTitle.textContent = displayType;
    
    // 2. Actualizar todos los títulos de cards
    const cardTitles = section.querySelectorAll('.card-title');
    cardTitles.forEach(title => {
        const text = title.textContent;
        if (text.includes('Colores para')) {
            title.textContent = `Colores para ${displayType}`;
        } else if (text.includes('Imagen para')) {
            title.textContent = `Imagen para ${displayType}`;
        } else if (text.includes('Condiciones para')) {
            title.textContent = `Condiciones para ${displayType}`;
        }
    });
    
    // 3. Título de secuencia
    const sequenceTitle = section.querySelector('h4');
    if (sequenceTitle && sequenceTitle.textContent.includes('Secuencia de')) {
        sequenceTitle.textContent = `Secuencia de ${displayType}`;
    }
    
    // 4. Actualizar pestaña
    updatePlacementsTabs();
}

function duplicatePlacement(placementId) {
    const original = placements.find(p => p.id === placementId);
    if (!original) return;

    const newId = Date.now();
    const duplicate = JSON.parse(JSON.stringify(original));
    duplicate.id = newId;
    duplicate.name = duplicate.type.includes('CUSTOM:') 
        ? duplicate.type.replace('CUSTOM: ', '') 
        : duplicate.type;
    
    placements.push(duplicate);
    
    renderPlacementHTML(duplicate);
    updatePlacementsTabs();
    showPlacement(newId);
    
    setTimeout(() => {
        updateAllPlacementTitles(newId);
    }, 50);
    
    showStatus('✅ Placement duplicado correctamente');
}

function removePlacement(placementId) {
    if (placements.length <= 1) {
        showStatus('⚠️ No puedes eliminar el único placement', 'warning');
        return;
    }
    
    if (!confirm(`¿Estás seguro de que quieres eliminar este placement?`)) {
        return;
    }
    
    const index = placements.findIndex(p => p.id === placementId);
    if (index === -1) return;
    
    const removedType = placements[index].type;
    placements.splice(index, 1);
    
    const section = document.getElementById(`placement-section-${placementId}`);
    if (section) section.remove();
    
    updatePlacementsTabs();
    
    if (currentPlacementId === placementId && placements.length > 0) {
        showPlacement(placements[0].id);
    }
    
    showStatus(`🗑️ Placement "${removedType}" eliminado`, 'success');
}

// ========== FUNCIONES PARA PARÁMETROS EDITABLES ==========
function updatePlacementParam(placementId, param, value) {
    const placement = placements.find(p => p.id === placementId);
    if (placement) {
        placement[param] = value;
        updatePlacementStations(placementId);
        showStatus(`✅ ${param} actualizado`);
    }
}

// ========== FUNCIONES PARA DIMENSIONES ==========
function extractDimensions(dimensionsText) {
    if (!dimensionsText) return { width: '15.34', height: '12' };
    
    const patterns = [
        /SIZE:\s*\(W\)\s*([\d\.]+)\s*["']?\s*X\s*\(H\)\s*([\d\.]+)/i,
        /([\d\.]+)\s*["']?\s*[xX×]\s*([\d\.]+)/,
        /W\s*:\s*([\d\.]+).*H\s*:\s*([\d\.]+)/i,
        /ANCHO\s*:\s*([\d\.]+).*ALTO\s*:\s*([\d\.]+)/i,
        /(\d+)\s*["']?\s*[xX]\s*(\d+)/
    ];
    
    for (const pattern of patterns) {
        const match = dimensionsText.match(pattern);
        if (match) {
            return {
                width: match[1],
                height: match[2]
            };
        }
    }
    
    return { width: '15.34', height: '12' };
}

function updatePlacementDimension(placementId, type, value) {
    const placement = placements.find(p => p.id === placementId);
    if (placement) {
        const wField = document.getElementById(`dimension-w-${placementId}`);
        const hField = document.getElementById(`dimension-h-${placementId}`);
        
        const width = type === 'width' ? value : (wField ? wField.value : '');
        const height = type === 'height' ? value : (hField ? hField.value : '');
        
        placement.width = width;
        placement.height = height;
        placement.dimensions = `SIZE: (W) ${width || '##'}" X (H) ${height || '##'}"`;
        
        showStatus(`✅ Dimensión ${type === 'width' ? 'ancho' : 'alto'} actualizada`);
    }
}

// ========== FUNCIONES PARA COLORS DE PLACEMENTS ==========
function addPlacementColorItem(placementId, type) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;
    
    let initialLetter = '';
    let initialVal = '';
    
    if (type === 'BLOCKER') {
        initialLetter = 'A';
        initialVal = 'BLOCKER CHT';
    } else if (type === 'WHITE_BASE') {
        initialLetter = 'B';
        initialVal = 'AQUAFLEX WHITE';
    } else if (type === 'METALLIC') {
        const colorItems = placement.colors.filter(c => c.type === 'COLOR' || c.type === 'METALLIC');
        initialLetter = String(colorItems.length + 1);
        initialVal = 'METALLIC GOLD';
    } else {
        const colorItems = placement.colors.filter(c => c.type === 'COLOR' || c.type === 'METALLIC');
        initialLetter = String(colorItems.length + 1);
    }
    
    const colorId = Date.now() + Math.random();
    placement.colors.push({
        id: colorId,
        type: type,
        screenLetter: initialLetter,
        val: initialVal
    });
    
    renderPlacementColors(placementId);
    updatePlacementStations(placementId);
    updatePlacementColorsPreview(placementId);
    checkForSpecialtiesInColors(placementId);
}

function renderPlacementColors(placementId) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;
    
    const container = document.getElementById(`placement-colors-container-${placementId}`);
    if (!container) return;
    
    if (placement.colors.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                <i class="fas fa-palette" style="font-size: 1.5rem; margin-bottom: 10px; display: block;"></i>
                <p>No hay colores agregados para este placement.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    placement.colors.forEach(color => {
        let badgeClass = 'badge-color';
        let label = 'COLOR';
        
        if (color.type === 'BLOCKER') {
            badgeClass = 'badge-blocker';
            label = 'BLOQUEADOR';
        } else if (color.type === 'WHITE_BASE') {
            badgeClass = 'badge-white';
            label = 'WHITE BASE';
        } else if (color.type === 'METALLIC') {
            badgeClass = 'badge-warning';
            label = 'METÁLICO';
        }
        
        const div = document.createElement('div');
        div.className = 'color-item';
        div.innerHTML = `
            <span class="badge ${badgeClass}">${label}</span>
            <input type="text" 
                   style="width: 60px; text-align: center; font-weight: bold;" 
                   value="${color.screenLetter}" 
                   class="form-control placement-screen-letter"
                   data-color-id="${color.id}"
                   data-placement-id="${placementId}"
                   oninput="updatePlacementScreenLetter(${placementId}, ${color.id}, this.value)"
                   title="Letra/Número de Pantalla">
            <input type="text" 
                   class="form-control placement-ink-input"
                   data-color-id="${color.id}"
                   data-placement-id="${placementId}"
                   placeholder="Nombre de la tinta..." 
                   value="${color.val}"
                   oninput="updatePlacementColorValue(${placementId}, ${color.id}, this.value)">
            <div class="color-preview" 
                 id="placement-color-preview-${placementId}-${color.id}" 
                 title="Vista previa del color"></div>
            <button type="button" class="btn btn-danger btn-sm" onclick="removePlacementColorItem(${placementId}, ${color.id})">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(div);
        
        setTimeout(() => updatePlacementColorPreview(placementId, color.id), 10);
    });
}

function updatePlacementColorValue(placementId, colorId, value) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;
    
    const color = placement.colors.find(c => c.id === colorId);
    if (color) {
        color.val = value;
        updatePlacementColorPreview(placementId, colorId);
        updatePlacementStations(placementId);
        updatePlacementColorsPreview(placementId);
        checkForSpecialtiesInColors(placementId);
    }
}

function updatePlacementScreenLetter(placementId, colorId, value) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;
    
    const color = placement.colors.find(c => c.id === colorId);
    if (color) {
        color.screenLetter = value.toUpperCase();
        updatePlacementStations(placementId);
    }
}

function removePlacementColorItem(placementId, colorId) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;
    
    placement.colors = placement.colors.filter(c => c.id !== colorId);
    renderPlacementColors(placementId);
    updatePlacementStations(placementId);
    updatePlacementColorsPreview(placementId);
    checkForSpecialtiesInColors(placementId);
}

function updatePlacementColorPreview(placementId, colorId) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;
    
    const color = placement.colors.find(c => c.id === colorId);
    if (!color) return;
    
    const preview = document.getElementById(`placement-color-preview-${placementId}-${colorId}`);
    if (!preview) return;
    
    const colorName = (color.val || '').toUpperCase().trim();
    let colorHex = null;
    
    if (window.Utils && window.Utils.getColorHex) {
        colorHex = window.Utils.getColorHex(color.val);
    }
    
    if (!colorHex) {
        const hexMatch = colorName.match(/#([0-9A-F]{6})/i);
        if (hexMatch) {
            colorHex = `#${hexMatch[1]}`;
        }
    }
    
    if (colorHex) {
        preview.style.background = colorHex;
        preview.style.backgroundImage = 'none';
        preview.title = `${color.val} - ${colorHex}`;
    } else if (colorName) {
        const hash = stringToHash(colorName);
        const randomColor = `hsl(${hash % 360}, 70%, 60%)`;
        preview.style.background = randomColor;
        preview.title = colorName;
    } else {
        preview.style.background = 'var(--gray-dark)';
        preview.style.backgroundImage = 'linear-gradient(45deg, var(--gray-medium) 25%, transparent 25%, transparent 75%, var(--gray-medium) 75%, var(--gray-medium)), linear-gradient(45deg, var(--gray-medium) 25%, transparent 25%, transparent 75%, var(--gray-medium) 75%, var(--gray-medium))';
        preview.style.backgroundSize = '10px 10px';
        preview.style.backgroundPosition = '0 0, 5px 5px';
        preview.title = 'Color no especificado';
    }
}

// ========== DETECCIÓN DE ESPECIALIDADES ==========
function checkForSpecialtiesInColors(placementId) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;
    
    let specialties = [];
    
    placement.colors.forEach(color => {
        if (color.val) {
            const colorVal = (color.val || '').toUpperCase();
            
            if (colorVal.includes('HD') || colorVal.includes('HIGH DENSITY')) {
                if (!specialties.includes('HIGH DENSITY')) {
                    specialties.push('HIGH DENSITY');
                }
            }
            
            if (isMetallicColor(colorVal)) {
                if (!specialties.includes('METALLIC')) {
                    specialties.push('METALLIC');
                }
            }
            
            if (colorVal.includes('FOIL')) {
                if (!specialties.includes('FOIL')) {
                    specialties.push('FOIL');
                }
            }
        }
    });
    
    const specialtiesField = document.getElementById(`specialties-${placementId}`);
    if (specialtiesField) {
        specialtiesField.value = specialties.join(', ');
        updatePlacementField(placementId, 'specialties', specialtiesField.value);
    }
    
    return specialties;
}

function isMetallicColor(colorName) {
    if (!colorName) return false;
    
    const upperColor = colorName.toUpperCase();
    
    if (upperColor.match(/(8[7-9][0-9]\s*C?)/i)) {
        return true;
    }
    
    const METALLIC_CODES = [
        "871C", "872C", "873C", "874C", "875C", "876C", "877C",
        "METALLIC", "GOLD", "SILVER", "BRONZE", "METÁLICO", "METALIC"
    ];
    
    for (const metallicCode of METALLIC_CODES) {
        if (upperColor.includes(metallicCode)) {
            return true;
        }
    }
    
    return false;
}

function getColorHex(colorName) {
    if (!colorName) return null;
    
    const name = colorName.toUpperCase().trim();
    
    if (Config?.COLOR_DATABASES) {
        for (const db of Object.values(Config.COLOR_DATABASES)) {
            for (const [key, data] of Object.entries(db)) {
                if (name === key || name.includes(key) || key.includes(name)) {
                    return data.hex;
                }
            }
        }
    }
    
    const hexMatch = name.match(/#([0-9A-F]{6})/i);
    if (hexMatch) {
        return `#${hexMatch[1]}`;
    }
    
    return null;
}

function updatePlacementColorsPreview(placementId) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;
    
    const container = document.getElementById(`placement-colors-preview-${placementId}`);
    if (!container) return;
    
    const uniqueColors = [];
    const seenColors = new Set();
    
    placement.colors.forEach(color => {
        if (color.type === 'COLOR' || color.type === 'METALLIC') {
            const colorVal = (color.val || '').toUpperCase().trim();
            if (colorVal && !seenColors.has(colorVal)) {
                seenColors.add(colorVal);
                uniqueColors.push({
                    val: colorVal,
                    screenLetter: color.screenLetter
                });
            }
        }
    });
    
    if (uniqueColors.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<div><strong>Leyenda de Colores:</strong></div><div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 10px;">';
    
    uniqueColors.forEach(color => {
        const colorHex = getColorHex(color.val) || '#cccccc';
        html += `
            <div class="color-legend-item" style="display: flex; align-items: center; margin-bottom: 5px;">
                <div class="color-legend-swatch" style="background-color: ${colorHex}; border: 1px solid #666; width: 15px; height: 15px; margin-right: 5px;"></div>
                <span style="font-size: 11px;">${color.screenLetter}: ${color.val}</span>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// ========== FUNCIONES DE SECUENCIA DE PLACEMENTS ==========
function updatePlacementStations(placementId, returnOnly = false) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return [];
    
    const preset = getInkPresetSafe(placement.inkType || 'WATER');
    
    const stationsData = [];
    let stNum = 1;
    
    const meshColor = placement.meshColor || preset.color.mesh;
    const meshWhite = placement.meshWhite || preset.white.mesh1;
    const meshBlocker = placement.meshBlocker || preset.blocker.mesh1;
    const durometer = placement.durometer || preset.color.durometer;
    const strokes = placement.strokes || preset.color.strokes;
    const angle = placement.angle || preset.color.angle;
    const pressure = placement.pressure || preset.color.pressure;
    const speed = placement.speed || preset.color.speed;
    const additives = placement.additives || preset.color.additives;
    
    placement.colors.forEach((item, idx) => {
        let mesh, strokesVal, duro, ang, press, spd, add, screenLetter, screenTypeLabel;
        
        screenLetter = item.screenLetter || 'N/A';
        
        if (item.type === 'BLOCKER') {
            screenTypeLabel = preset.blocker.name;
            mesh = stNum <= 3 ? meshBlocker : (placement.meshBlocker || preset.blocker.mesh2);
            strokesVal = strokes;
            duro = durometer;
            ang = angle;
            press = pressure;
            spd = speed;
            add = placement.additives || preset.blocker.additives;
        } else if (item.type === 'WHITE_BASE') {
            screenTypeLabel = preset.white.name;
            mesh = stNum <= 9 ? meshWhite : (placement.meshWhite || preset.white.mesh2);
            strokesVal = strokes;
            duro = durometer;
            ang = angle;
            press = pressure;
            spd = speed;
            add = placement.additives || preset.white.additives;
        } else if (item.type === 'METALLIC') {
            screenTypeLabel = item.val || '---';
            mesh = '110/64';
            strokesVal = '1';
            duro = '70';
            ang = '15';
            press = '40';
            spd = '35';
            add = 'Catalizador especial para metálicos';
        } else {
            screenTypeLabel = item.val || '---';
            mesh = meshColor;
            strokesVal = strokes;
            duro = durometer;
            ang = angle;
            press = pressure;
            spd = speed;
            add = additives;
        }
        
        const screenCombined = (item.type === 'BLOCKER' || item.type === 'WHITE_BASE' || item.type === 'METALLIC') 
                       ? screenTypeLabel
                       : item.val || '---';
        
        stationsData.push({ 
            st: stNum++, 
            screenLetter: screenLetter,
            screenCombined: screenCombined,
            mesh: mesh, 
            ink: item.val || '---',
            strokes: strokesVal, 
            duro: duro,
            angle: ang,
            pressure: press,
            speed: spd,
            add: add 
        });
        
        if (idx < placement.colors.length - 1) {
            stationsData.push({ 
                st: stNum++, 
                screenLetter: '', 
                screenCombined: 'FLASH', 
                mesh: '-', 
                ink: '-', 
                strokes: '-', 
                duro: '-',
                angle: '-',
                pressure: '-',
                speed: '-',
                add: '' 
            });
            
            stationsData.push({ 
                st: stNum++, 
                screenLetter: '', 
                screenCombined: 'COOL', 
                mesh: '-', 
                ink: '-', 
                strokes: '-', 
                duro: '-',
                angle: '-',
                pressure: '-',
                speed: '-',
                add: '' 
            });
        }
    });
    
    if (returnOnly) return stationsData;
    
    renderPlacementStationsTable(placementId, stationsData);
}

function renderPlacementStationsTable(placementId, data) {
    const div = document.getElementById(`placement-sequence-table-${placementId}`);
    if (!div) return;
    
    if (data.length === 0) {
        div.innerHTML = '<p style="color:var(--text-secondary); font-style:italic; text-align:center; padding:15px; background:var(--gray-dark); border-radius:var(--radius);">Agrega colores para generar la secuencia de impresión.</p>';
        return;
    }
    
    let html = `<table class="sequence-table">
        <thead><tr>
            <th>Est</th>
            <th>Screen Letter</th>
            <th>Screen (Tinta/Proceso)</th>
            <th>Aditivos</th>
            <th>Malla</th>
            <th>Strokes</th>
            <th>Angle</th>
            <th>Pressure</th>
            <th>Speed</th>
            <th>Duro</th>
        </tr></thead><tbody>`;
    
    data.forEach((row, idx) => {
        const isMetallic = row.screenCombined && (
            row.screenCombined.includes('METALLIC') || 
            row.screenCombined.includes('GOLD') || 
            row.screenCombined.includes('SILVER') ||
            row.screenCombined.match(/(8[7-9][0-9])\s*C?/i)
        );
        
        html += `<tr ${isMetallic ? 'style="background: linear-gradient(90deg, rgba(255,215,0,0.1) 0%, var(--bg-card) 100%);"' : ''}>
            <td><strong>${row.st}</strong></td>
            <td><b style="color: var(--primary);">${row.screenLetter}</b></td>
            <td>${row.screenCombined}</td>
            <td style="font-size:11px; color:var(--primary); font-weight:600;">${row.add}</td>
            <td>${row.mesh}</td>
            <td>${row.strokes}</td>
            <td>${row.angle}</td>
            <td>${row.pressure}</td>
            <td>${row.speed}</td>
            <td>${row.duro}</td>
        </tr>`;
    });
    html += '</tbody></table>';
    div.innerHTML = html;
}

// ========== FUNCIONES DE IMÁGENES ==========
function openImagePickerForPlacement(placementId) {
    currentPlacementId = placementId;
    document.getElementById('placementImageInput').click();
}

function removePlacementImage(placementId) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;
    
    const img = document.getElementById(`placement-image-preview-${placementId}`);
    const imageActions = document.getElementById(`placement-image-actions-${placementId}`);
    
    if (img) {
        img.src = '';
        img.style.display = 'none';
    }
    
    if (imageActions) {
        imageActions.style.display = 'none';
    }
    
    placement.imageData = null;
    showStatus('🗑️ Imagen eliminada del placement');
}

// ========== FUNCIONES DE ACTUALIZACIÓN ==========
function updatePlacementField(placementId, field, value) {
    const placement = placements.find(p => p.id === placementId);
    if (placement) {
        if (field === 'specialties') {
            let specialties = value.toUpperCase();
            
            if (specialties.includes('HD') && !specialties.includes('HIGH DENSITY')) {
                specialties = specialties.replace(/\bHD\b/g, 'HIGH DENSITY');
            }
            
            placement[field] = specialties;
            
            const specialtiesField = document.getElementById(`specialties-${placementId}`);
            if (specialtiesField && specialtiesField.value !== specialties) {
                specialtiesField.value = specialties;
            }
        } else {
            placement[field] = value;
        }
    }
}

function updatePlacementInkType(placementId, inkType) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;
    
    placement.inkType = inkType;
    const preset = getInkPresetSafe(inkType);
    
    const tempField = document.getElementById(`temp-${placementId}`);
    const timeField = document.getElementById(`time-${placementId}`);
    
    if (tempField) tempField.value = preset.temp;
    if (timeField) timeField.value = preset.time;
    
    placement.temp = preset.temp;
    placement.time = preset.time;
    
    updatePlacementStations(placementId);
    showStatus(`✅ Tinta cambiada a ${inkType}`);
}

// ========== GENERACIÓN DE PDF MEJORADA ==========
window.exportPDF = async function() {
    try {
        showStatus('📄 Generando PDF...', 'warning');
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'letter'
        });
        
        const getInputValue = (id, fallback = 'N/A') => {
            const element = document.getElementById(id);
            return element && element.value ? element.value : fallback;
        };
        
        let currentY = pdfConfig.margin;
        
        // 1. CABECERA
        pdf.setFillColor(...pdfConfig.headerColor);
        pdf.rect(0, 0, pdfConfig.pageWidth, 20, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("TECHNICAL SPEC MANAGER", pdfConfig.margin, 12);
        
        pdf.setFontSize(10);
        pdf.text(new Date().toLocaleDateString('es-ES'), pdfConfig.pageWidth - pdfConfig.margin, 12, { align: 'right' });
        
        // Logo del cliente
        const logoElement = document.getElementById('logoCliente');
        if (logoElement && logoElement.src && logoElement.style.display !== 'none') {
            try {
                pdf.addImage(logoElement, 'PNG', pdfConfig.pageWidth - 60, 5, 45, 10);
            } catch (e) {
                console.log("No se pudo añadir logo del cliente");
            }
        }
        
        currentY = 30;
        
        // 2. INFORMACIÓN GENERAL - ORGANIZADA EN 2 COLUMNAS
        pdf.setFillColor(...pdfConfig.grayLight);
        pdf.rect(pdfConfig.margin, currentY, pdfConfig.pageWidth - (2 * pdfConfig.margin), 8, 'F');
        pdf.setTextColor(...pdfConfig.headerColor);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text("INFORMACIÓN GENERAL", pdfConfig.margin + 2, currentY + 5);
        
        currentY += 12;
        pdf.setFontSize(9);
        
        const generalInfo = [
            { label: "CLIENTE:", value: getInputValue('customer'), column: 1 },
            { label: "STYLE:", value: getInputValue('style'), column: 2 },
            { label: "COLORWAY:", value: getInputValue('colorway'), column: 1 },
            { label: "SEASON:", value: getInputValue('season'), column: 2 },
            { label: "PATTERN #:", value: getInputValue('pattern'), column: 1 },
            { label: "P.O. #:", value: getInputValue('po'), column: 2 },
            { label: "TEAM:", value: getInputValue('name-team'), column: 1 },
            { label: "GENDER:", value: getInputValue('gender'), column: 2 },
            { label: "DESIGNER:", value: getInputValue('designer'), column: 1 },
            { label: "SAMPLE TYPE:", value: getInputValue('sample-type'), column: 2 }
        ];
        
        let tempY = currentY;
        generalInfo.forEach((item, index) => {
            const xPos = item.column === 1 ? pdfConfig.col1 : pdfConfig.col2;
            
            pdf.setTextColor(0, 0, 0);
            pdf.setFont("helvetica", "bold");
            pdf.text(item.label, xPos, tempY);
            
            pdf.setFont("helvetica", "normal");
            const valueText = pdf.splitTextToSize(String(item.value), 60);
            pdf.text(valueText, xPos + pdfConfig.labelW, tempY);
            
            if (item.column === 2) {
                tempY += 7;
            }
        });
        
        currentY = tempY + 10;
        
        // 3. PLACEMENTS
        placements.forEach((placement, placementIndex) => {
            // Verificar si necesitamos nueva página
            if (currentY > pdfConfig.pageHeight - 50) {
                pdf.addPage();
                currentY = pdfConfig.margin;
            }
            
            const displayType = placement.type.includes('CUSTOM:') 
                ? placement.type.replace('CUSTOM: ', '')
                : placement.type;
            
            // Encabezado del placement
            pdf.setFillColor(...pdfConfig.headerColor);
            pdf.rect(pdfConfig.margin, currentY, pdfConfig.pageWidth - (2 * pdfConfig.margin), 8, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(11);
            pdf.setFont("helvetica", "bold");
            pdf.text(`PLACEMENT: ${displayType.toUpperCase()}`, pdfConfig.margin + 2, currentY + 5);
            
            currentY += 12;
            
            // Imagen si existe
            if (placement.imageData) {
                try {
                    const imgWidth = 80;
                    const imgHeight = 60;
                    pdf.addImage(placement.imageData, 'JPEG', pdfConfig.margin, currentY, imgWidth, imgHeight);
                    currentY += imgHeight + 5;
                } catch (e) {
                    console.log("No se pudo añadir imagen del placement");
                }
            }
            
            // Detalles del placement
            const placementDetails = [
                `Ubicación: ${placement.placementDetails || 'N/A'}`,
                `Dimensiones: ${placement.width || '##'}" X ${placement.height || '##'}"`,
                `Temperatura: ${placement.temp || '320 °F'}`,
                `Tiempo: ${placement.time || '1:40 min'}`,
                `Especialidades: ${placement.specialties || 'N/A'}`
            ];
            
            pdf.setFontSize(9);
            pdf.setTextColor(0, 0, 0);
            pdf.setFont("helvetica", "normal");
            
            placementDetails.forEach(detail => {
                pdf.text(detail, pdfConfig.margin, currentY);
                currentY += 5;
            });
            
            currentY += 5;
            
            // Colores del placement
            const colors = placement.colors.filter(c => c.type === 'COLOR' || c.type === 'METALLIC');
            if (colors.length > 0) {
                pdf.setFont("helvetica", "bold");
                pdf.text("COLORES:", pdfConfig.margin, currentY);
                currentY += 5;
                
                pdf.setFont("helvetica", "normal");
                let colorX = pdfConfig.margin;
                colors.forEach((color, idx) => {
                    if (idx > 0 && idx % 3 === 0) {
                        currentY += 8;
                        colorX = pdfConfig.margin;
                    }
                    
                    const colorText = `${color.screenLetter || ''}: ${color.val || ''}`;
                    pdf.text(colorText, colorX, currentY);
                    colorX += 65;
                });
                
                currentY += 12;
            }
            
            // Secuencia de impresión - TABLA MEJORADA
            const stationsData = updatePlacementStations(placement.id, true);
            if (stationsData.length > 0) {
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor(...pdfConfig.headerColor);
                pdf.text(`SECUENCIA DE IMPRESIÓN - ${displayType}`, pdfConfig.margin, currentY);
                currentY += 7;
                
                // Encabezados de tabla
                pdf.setFillColor(...pdfConfig.grayLight);
                pdf.rect(pdfConfig.margin, currentY, pdfConfig.pageWidth - (2 * pdfConfig.margin), 6, 'F');
                
                const tableHeaders = [
                    { text: "Est", x: pdfConfig.margin + 2 },
                    { text: "Scr", x: pdfConfig.margin + 15 },
                    { text: "Screen (Tinta/Proceso)", x: pdfConfig.margin + 30 },
                    { text: "Aditivos", x: pdfConfig.margin + 85 },
                    { text: "Malla", x: pdfConfig.margin + 125 },
                    { text: "Strokes", x: pdfConfig.margin + 145 },
                    { text: "Angle", x: pdfConfig.margin + 160 },
                    { text: "Pressure", x: pdfConfig.margin + 175 },
                    { text: "Speed", x: pdfConfig.margin + 190 }
                ];
                
                pdf.setFontSize(8);
                pdf.setTextColor(0, 0, 0);
                tableHeaders.forEach(header => {
                    pdf.text(header.text, header.x, currentY + 4);
                });
                
                currentY += 8;
                
                // Filas de la tabla
                pdf.setFontSize(7);
                pdf.setFont("helvetica", "normal");
                
                stationsData.forEach((row, rowIndex) => {
                    // Verificar si necesitamos nueva página para la tabla
                    if (currentY > pdfConfig.pageHeight - 20) {
                        pdf.addPage();
                        currentY = pdfConfig.margin;
                        
                        // Redibujar encabezados de tabla en nueva página
                        pdf.setFillColor(...pdfConfig.grayLight);
                        pdf.rect(pdfConfig.margin, currentY, pdfConfig.pageWidth - (2 * pdfConfig.margin), 6, 'F');
                        
                        pdf.setFontSize(8);
                        pdf.setTextColor(0, 0, 0);
                        tableHeaders.forEach(header => {
                            pdf.text(header.text, header.x, currentY + 4);
                        });
                        
                        currentY += 8;
                        pdf.setFontSize(7);
                    }
                    
                    // Fondo alternado para mejor legibilidad
                    if (rowIndex % 2 === 0) {
                        pdf.setFillColor(250, 250, 250);
                        pdf.rect(pdfConfig.margin, currentY - 2, pdfConfig.pageWidth - (2 * pdfConfig.margin), 5, 'F');
                    }
                    
                    // Datos de la fila
                    pdf.text(row.st.toString(), pdfConfig.margin + 2, currentY);
                    pdf.text(row.screenLetter || '', pdfConfig.margin + 15, currentY);
                    
                    // Texto de tinta (puede ser largo, lo dividimos)
                    const screenText = pdf.splitTextToSize(row.screenCombined || '', 50);
                    pdf.text(screenText, pdfConfig.margin + 30, currentY);
                    
                    // Texto de aditivos (puede ser largo)
                    const addText = pdf.splitTextToSize(row.add || '', 40);
                    pdf.text(addText, pdfConfig.margin + 85, currentY);
                    
                    pdf.text(row.mesh || '', pdfConfig.margin + 125, currentY);
                    pdf.text(row.strokes || '', pdfConfig.margin + 145, currentY);
                    pdf.text(row.angle || '', pdfConfig.margin + 160, currentY);
                    pdf.text(row.pressure || '', pdfConfig.margin + 175, currentY);
                    pdf.text(row.speed || '', pdfConfig.margin + 190, currentY);
                    
                    // Ajustar altura según el texto más largo
                    const maxLines = Math.max(screenText.length, addText.length);
                    currentY += (maxLines * 3.5) + 2;
                });
                
                currentY += 10;
            }
            
            // Instrucciones especiales
            if (placement.specialInstructions && placement.specialInstructions.trim()) {
                pdf.setFillColor(255, 255, 200);
                pdf.rect(pdfConfig.margin, currentY, pdfConfig.pageWidth - (2 * pdfConfig.margin), 25, 'F');
                
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor(255, 140, 0);
                pdf.text("INSTRUCCIONES ESPECIALES:", pdfConfig.margin + 2, currentY + 5);
                
                pdf.setFont("helvetica", "normal");
                pdf.setTextColor(0, 0, 0);
                const instructions = pdf.splitTextToSize(placement.specialInstructions, pdfConfig.pageWidth - (2 * pdfConfig.margin) - 10);
                pdf.text(instructions, pdfConfig.margin + 2, currentY + 10);
                
                currentY += 30;
            }
            
            currentY += 10;
        });
        
        // Pie de página
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Generado el ${new Date().toLocaleDateString('es-ES')} - Página 1 de 1`, 
                pdfConfig.pageWidth / 2, pdfConfig.pageHeight - 10, { align: 'center' });
        
        // Guardar PDF
        const fileName = `TegraSpec_${getInputValue('style', 'Spec')}_${getInputValue('folder-num', '00000')}.pdf`;
        pdf.save(fileName);
        
        showStatus('✅ PDF generado correctamente', 'success');
        
    } catch (error) {
        console.error('Error al generar PDF:', error);
        showStatus('❌ Error al generar PDF: ' + error.message, 'error');
    }
};

// ========== FUNCIONES DE EXPORTACIÓN ADICIONALES ==========
window.exportToExcel = function() {
    try {
        if (typeof XLSX === 'undefined') {
            showStatus('❌ Error: Biblioteca Excel no cargada', 'error');
            return;
        }
        
        const data = {
            designer: document.getElementById('designer')?.value || '',
            customer: document.getElementById('customer')?.value || '',
            season: document.getElementById('season')?.value || '',
            folder: document.getElementById('folder-num')?.value || '',
            nameTeam: document.getElementById('name-team')?.value || '',
            colorway: document.getElementById('colorway')?.value || '',
            style: document.getElementById('style')?.value || ''
        };
        
        const wb = XLSX.utils.book_new();
        const headers = [
            'Area', 'Designer', 'Customer', 'Division', 'SEASON',
            '', '#Folder/SPEC', '', '', '', '', '', '', '', '', '', '', '', '', '',
            'TEAM', '', '', 'COLORWAY', '', 'PLACEMENTS', '', 'SPEC #', '#SCREEN', 
            'NO. COLORES', 'Stations', 'setup', 'size', 'W', 'H', 'TYPE OF ART', 'INK TYPE'
        ];
        
        const rows = [];
        
        if (placements && placements.length > 0) {
            placements.forEach((placement, index) => {
                const placementType = placement.type.includes('CUSTOM:') 
                    ? placement.type.replace('CUSTOM: ', '').toLowerCase()
                    : placement.type.toLowerCase();
                
                const screenCount = placement.colors ? placement.colors.length : 0;
                const colorCount = screenCount;
                const stationCount = colorCount > 0 ? (colorCount * 3 - 2) : 0;
                const artType = 'Vector';
                
                let inkType = 'WB MAGNA';
                if (placement.inkType === 'WATER') inkType = 'WB MAGNA';
                if (placement.inkType === 'PLASTISOL') inkType = 'PLASTISOL';
                if (placement.inkType === 'SILICONE') inkType = 'SILICONE';
                
                const width = placement.width || extractDimensions(placement.dimensions).width;
                const height = placement.height || extractDimensions(placement.dimensions).height;
                
                const row = [
                    'Development',                            
                    data.designer,                          
                    data.customer,                          
                    'NFL / jersey',                         
                    data.season,                            
                    '',                                     
                    data.folder,                            
                    '', '', '', '', '', '', '', '', '', '', '', '', '', 
                    data.nameTeam,                          
                    '', '',                                 
                    data.colorway,                          
                    '',                                     
                    placementType,                          
                    '',                                     
                    `SPEC ${index + 1}`,                     
                    screenCount,                            
                    colorCount,                             
                    stationCount,                           
                    1,                                      
                    'L',                                    
                    `${width}"`,                          
                    `${height}"`,                         
                    artType,                                
                    inkType                                 
                ];
                
                rows.push(row);
            });
        }
        
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        XLSX.utils.book_append_sheet(wb, ws, 'Hoja1');
        
        const fileName = `Calculadora_${data.style || 'Spec'}_${data.folder || '00000'}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        showStatus('📊 Spec Excel generada correctamente', 'success');
        
    } catch (error) {
        console.error('Error al exportar Excel:', error);
        showStatus('❌ Error al generar Spec Excel: ' + error.message, 'error');
    }
};

// ========== FUNCIONES DE INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    loadTabTemplates()
        .then(() => {
            updateDateTime();
            updateDashboard();
            loadSavedSpecsList();
            setupPasteHandler();
            loadThemePreference();
            bindSpecCreatorFormSafety();

            document.getElementById('themeToggle').addEventListener('click', toggleTheme);
            setInterval(updateDateTime, 60000);

            setTimeout(() => {
                if (placements.length === 0) {
                    initializePlacements();
                }
            }, 100);

            // Cargar configuración inicial del state manager
            if (stateManager) {
                stateManager.loadFromLocalStorage();
            }
        })
        .catch((error) => {
            console.error('Error al cargar templates:', error);
            showStatus('❌ Error al cargar los templates', 'error');
        });
});

// ========== FUNCIONES DE DASHBOARD Y STORAGE (simplificadas) ==========
function updateDashboard() {
    try {
        const specs = Object.keys(localStorage).filter(k => k.startsWith('spec_'));
        const total = specs.length;
        document.getElementById('total-specs').textContent = total;
        
        // Más código de dashboard...
    } catch (error) {
        console.error('Error en updateDashboard:', error);
    }
}

function loadSavedSpecsList() {
    const list = document.getElementById('saved-specs-list');
    const specs = Object.keys(localStorage).filter(key => key.startsWith('spec_'));
    
    if (specs.length === 0) {
        list.innerHTML = `
            <p style="text-align: center; color: var(--text-secondary); padding: 30px;">
                <i class="fas fa-database" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                No hay specs guardadas. Crea una nueva spec para verla aquí.
            </p>
        `;
        return;
    }
    
    list.innerHTML = '';
    specs.forEach(key => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            const div = document.createElement('div');
            div.style.cssText = "padding:15px; border-bottom:1px solid var(--border-dark); display:flex; justify-content:space-between; align-items:center; transition: var(--transition);";
            div.innerHTML = `
                <div style="flex: 1;">
                    <div style="font-weight: 700; color: var(--primary);">${data.style || 'N/A'}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">Cliente: ${data.customer || 'N/A'} | Colorway: ${data.colorway || 'N/A'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Guardado: ${new Date(data.savedAt).toLocaleDateString('es-ES')}</div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary btn-sm" onclick='loadSpecData(${JSON.stringify(data)})'><i class="fas fa-edit"></i> Cargar</button>
                    <button class="btn btn-outline btn-sm" onclick="downloadSingleSpec('${key}')"><i class="fas fa-download"></i> JSON</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSpec('${key}')"><i class="fas fa-trash"></i></button>
                </div>
            `;
            list.appendChild(div);
        } catch (e) {
            console.error('Error al parsear spec guardada:', key, e);
            localStorage.removeItem(key);
        }
    });
}

// ========== HACER FUNCIONES DISPONIBLES GLOBALMENTE ==========
window.showTab = showTab;
window.loadSavedSpecsList = loadSavedSpecsList;
window.addNewPlacement = addNewPlacement;
window.saveCurrentSpec = saveCurrentSpec;
window.clearForm = clearForm;
window.exportToExcel = exportToExcel;
window.exportPDF = exportPDF;
window.updateClientLogo = updateClientLogo;
window.handleGearForSportLogic = handleGearForSportLogic;
window.removePlacement = removePlacement;
window.duplicatePlacement = duplicatePlacement;
window.showPlacement = showPlacement;
window.updatePlacementType = updatePlacementType;
window.updatePlacementInkType = updatePlacementInkType;
window.openImagePickerForPlacement = openImagePickerForPlacement;
window.removePlacementImage = removePlacementImage;
window.addPlacementColorItem = addPlacementColorItem;
window.removePlacementColorItem = removePlacementColorItem;
window.updatePlacementColorValue = updatePlacementColorValue;
window.updatePlacementScreenLetter = updatePlacementScreenLetter;
window.updatePlacementParam = updatePlacementParam;
window.updateCustomPlacement = updateCustomPlacement;
window.updateAllPlacementTitles = updateAllPlacementTitles;
