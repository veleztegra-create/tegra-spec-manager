// ========== app.js - VERSIÓN LIMPIA Y OPTIMIZADA ==========
// ========== VARIABLES GLOBALES ==========
let placements = [];
let currentPlacementId = 1;
let isDarkMode = true;

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
    const el = document.getElementById('current-datetime');
    if (el) el.textContent = now.toLocaleDateString('es-ES', options);
}

function showStatus(msg, type = 'success') {
    const el = document.getElementById('statusMessage');
    if (!el) return;
    el.textContent = msg;
    el.className = `status-message status-${type}`;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 4000);
}

function getInputValue(id, fallback = '') {
    const el = document.getElementById(id);
    return el ? el.value : fallback;
}

function setInputValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
}

// ========== TEMA ==========
function toggleTheme() {
    isDarkMode = !isDarkMode;
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    
    if (isDarkMode) {
        body.classList.remove('light-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
        localStorage.setItem('tegraspec-theme', 'dark');
        showStatus('🌙 Modo oscuro activado');
    } else {
        body.classList.add('light-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
        localStorage.setItem('tegraspec-theme', 'light');
        showStatus('☀️ Modo claro activado');
    }
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('tegraspec-theme');
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    if (savedTheme === 'light') {
        isDarkMode = false;
        document.body.classList.add('light-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
    } else {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
    }
}

// ========== NAVEGACIÓN DE TABS ==========
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    
    const targetTab = document.getElementById(tabName);
    if (targetTab) targetTab.classList.add('active');
    
    // Activar el botón de navegación correspondiente
    document.querySelectorAll('.nav-tab').forEach(tab => {
        if (tab.textContent.toLowerCase().includes(tabName.replace('-', ' '))) {
            tab.classList.add('active');
        }
    });
    
    // Acciones específicas por tab
    switch(tabName) {
        case 'saved-specs':
            loadSavedSpecsList();
            break;
        case 'dashboard':
            updateDashboard();
            break;
        case 'error-log':
            loadErrorLog();
            break;
        case 'spec-creator':
            if (placements.length === 0) initializePlacements();
            break;
    }
}

// ========== CLIENTE Y LOGOS ==========
function updateClientLogo() {
    const customer = document.getElementById('customer')?.value.toUpperCase().trim() || '';
    const logoElement = document.getElementById('logoCliente');
    if (!logoElement) return;
    
    // Mapa de logos usando window.LogoConfig si existe
    const logoMap = {
        'NIKE': window.LogoConfig?.NIKE || 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Nike-Logotipo-PNG-Photo.png',
        'FANATICS': window.LogoConfig?.FANATICS || 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Fanatics_company_logo.svg.png',
        'ADIDAS': window.LogoConfig?.ADIDAS || 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1280px-Adidas_Logo.svg.png',
        'PUMA': window.LogoConfig?.PUMA || 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Puma_Logo.svg/1280px-Puma_Logo.svg.png',
        'UNDER ARMOUR': window.LogoConfig?.UNDER_ARMOUR || 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Under_armour_logo.svg/1280px-Under_armour_logo.svg.png',
        'GEAR FOR SPORT': window.LogoConfig?.GEAR_FOR_SPORT || 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png'
    };
    
    // Detectar cliente
    let logoUrl = '';
    if (customer.includes('NIKE')) logoUrl = logoMap.NIKE;
    else if (customer.includes('FANATICS')) logoUrl = logoMap.FANATICS;
    else if (customer.includes('ADIDAS')) logoUrl = logoMap.ADIDAS;
    else if (customer.includes('PUMA')) logoUrl = logoMap.PUMA;
    else if (customer.includes('UNDER ARMOUR')) logoUrl = logoMap['UNDER ARMOUR'];
    else if (customer.includes('GEAR FOR SPORT') || customer.includes('GFS')) logoUrl = logoMap['GEAR FOR SPORT'];
    
    if (logoUrl) {
        logoElement.src = logoUrl;
        logoElement.style.display = 'block';
    } else {
        logoElement.style.display = 'none';
    }
}

function handleGearForSportLogic() {
    const customer = document.getElementById('customer')?.value.toUpperCase().trim() || '';
    if (customer !== 'GEAR FOR SPORT' && !customer.includes('GFS')) return;
    
    const style = document.getElementById('style')?.value || '';
    const po = document.getElementById('po')?.value || '';
    const searchTerm = style || po;
    
    if (window.Config?.GEARFORSPORT_TEAM_MAP) {
        const teamKey = Object.keys(window.Config.GEARFORSPORT_TEAM_MAP).find(key =>
            searchTerm.toUpperCase().includes(key)
        );
        if (teamKey) {
            const teamInput = document.getElementById('name-team');
            if (teamInput) teamInput.value = window.Config.GEARFORSPORT_TEAM_MAP[teamKey];
        }
    }
}

// ========== GESTIÓN DE PLACEMENTS ==========
function initializePlacements() {
    placements = [];
    const firstId = addNewPlacement('FRONT', true);
    showPlacement(firstId);
}

function addNewPlacement(type = null, isFirst = false) {
    const placementId = isFirst ? 1 : Date.now();
    const placementType = type || getNextPlacementType();
    
    const preset = getInkPresetSafe();
    
    const newPlacement = {
        id: placementId,
        type: placementType,
        title: placementType,
        imageData: null,
        colors: [],
        placementDetails: '#.#" FROM COLLAR SEAM',
        dimensions: 'SIZE: (W) ## X (H) ##',
        temp: preset.temp,
        time: preset.time,
        specialties: '',
        specialInstructions: '',
        inkType: 'WATER',
        width: '',
        height: '',
        // Parámetros editables (se llenan con preset)
        meshColor: preset.color.mesh,
        meshWhite: preset.white.mesh1,
        meshBlocker: preset.blocker.mesh1,
        durometer: preset.color.durometer,
        strokes: preset.color.strokes,
        angle: preset.color.angle,
        pressure: preset.color.pressure,
        speed: preset.color.speed,
        additives: preset.color.additives
    };
    
    if (isFirst) {
        placements = [newPlacement];
    } else {
        placements.push(newPlacement);
        renderPlacementHTML(newPlacement);
        updatePlacementsTabs();
        showPlacement(placementId);
    }
    
    return placementId;
}

function getNextPlacementType() {
    const usedTypes = placements.map(p => p.type);
    const allTypes = ['FRONT', 'BACK', 'SLEEVE', 'CHEST', 'TV. NUMBERS', 'SHOULDER', 'COLLAR', 'CUSTOM'];
    return allTypes.find(t => !usedTypes.includes(t)) || 'CUSTOM';
}

function removePlacement(placementId) {
    if (placements.length <= 1) {
        showStatus('⚠️ No puedes eliminar el único placement', 'warning');
        return;
    }
    
    if (!confirm('¿Eliminar este placement?')) return;
    
    const index = placements.findIndex(p => p.id === placementId);
    if (index === -1) return;
    
    placements.splice(index, 1);
    document.getElementById(`placement-section-${placementId}`)?.remove();
    
    updatePlacementsTabs();
    
    if (currentPlacementId === placementId && placements.length > 0) {
        showPlacement(placements[0].id);
    }
    
    showStatus('🗑️ Placement eliminado');
}

function duplicatePlacement(placementId) {
    const original = placements.find(p => p.id === placementId);
    if (!original) return;
    
    const newId = Date.now();
    const duplicate = JSON.parse(JSON.stringify(original));
    duplicate.id = newId;
    
    placements.push(duplicate);
    renderPlacementHTML(duplicate);
    updatePlacementsTabs();
    showPlacement(newId);
    
    setTimeout(() => updateAllPlacementTitles(newId), 50);
    showStatus('✅ Placement duplicado');
}

function updatePlacementsTabs() {
    const container = document.getElementById('placements-tabs');
    if (!container) return;
    
    container.innerHTML = placements.map(p => {
        const displayType = p.type.includes('CUSTOM:') ? p.type.replace('CUSTOM: ', '') : p.type;
        const isActive = p.id === currentPlacementId ? 'active' : '';
        return `
            <div class="placement-tab ${isActive}" data-placement-id="${p.id}" onclick="showPlacement(${p.id})">
                <i class="fas fa-${getPlacementIcon(p.type)}"></i>
                ${displayType.substring(0, 15)}${displayType.length > 15 ? '...' : ''}
                ${placements.length > 1 ? `<span class="remove-tab" onclick="event.stopPropagation(); removePlacement(${p.id})">&times;</span>` : ''}
            </div>
        `;
    }).join('');
}

function getPlacementIcon(type) {
    const icons = {
        'FRONT': 'tshirt',
        'BACK': 'tshirt',
        'SLEEVE': 'hat-cowboy',
        'CHEST': 'heart',
        'TV. NUMBERS': 'hashtag',
        'SHOULDER': 'user',
        'COLLAR': 'circle'
    };
    return icons[type] || (type.includes('CUSTOM:') ? 'star' : 'map-marker-alt');
}

function showPlacement(placementId) {
    document.querySelectorAll('.placement-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`placement-section-${placementId}`)?.classList.add('active');
    
    document.querySelectorAll('.placement-tab').forEach(tab => {
        tab.classList.toggle('active', parseInt(tab.dataset.placementId) === placementId);
    });
    
    currentPlacementId = placementId;
}

// ========== PRESETS DE TINTA ==========
function getInkPresetSafe(inkType = 'WATER') {
    const defaultPreset = {
        temp: '320 °F',
        time: inkType === 'WATER' ? '1:00 min' : '1:40 min',
        blocker: { name: 'BLOCKER CHT', mesh1: '122/55', mesh2: '157/48', additives: 'N/A' },
        white: { name: 'AQUAFLEX WHITE', mesh1: '198/40', mesh2: '157/48', additives: 'N/A' },
        color: { mesh: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: '3% cross-linker 500 · 1.5% antitack' }
    };
    
    // Usar Config global si existe
    if (window.Utils?.getInkPreset) {
        const preset = window.Utils.getInkPreset(inkType);
        if (preset?.color) return preset;
    }
    
    return defaultPreset;
}

// ========== ACTUALIZACIÓN DE TÍTULOS ==========
function updateAllPlacementTitles(placementId) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;
    
    const displayType = placement.type.includes('CUSTOM:') ? placement.type.replace('CUSTOM: ', '') : placement.type;
    const section = document.getElementById(`placement-section-${placementId}`);
    if (!section) return;
    
    // Título principal
    section.querySelector('.placement-title span')?.textContent = displayType;
    
    // Títulos de cards
    section.querySelectorAll('.card-title').forEach(title => {
        const text = title.textContent;
        if (text.includes('Colores para')) title.textContent = `Colores para ${displayType}`;
        else if (text.includes('Imagen para')) title.textContent = `Imagen para ${displayType}`;
        else if (text.includes('Condiciones para')) title.textContent = `Condiciones para ${displayType}`;
    });
    
    // Título de secuencia
    const seqTitle = section.querySelector('h4');
    if (seqTitle?.textContent.includes('Secuencia de')) {
        seqTitle.textContent = `Secuencia de ${displayType}`;
    }
    
    updatePlacementsTabs();
}

// ========== RENDERIZADO DE PLACEMENTS ==========
function renderPlacementHTML(placement) {
    const container = document.getElementById('placements-container');
    if (!container || document.getElementById(`placement-section-${placement.id}`)) return;
    
    const sectionId = `placement-section-${placement.id}`;
    const isCustom = placement.type.includes('CUSTOM:');
    const displayType = isCustom ? placement.type.replace('CUSTOM: ', '') : placement.type;
    
    const sectionHTML = `
        <div id="${sectionId}" class="placement-section" data-placement-id="${placement.id}">
            <div class="placement-header">
                <div class="placement-title"><i class="fas fa-map-marker-alt"></i> <span>${displayType}</span></div>
                <div class="placement-actions">
                    <button class="btn btn-outline btn-sm" onclick="duplicatePlacement(${placement.id})"><i class="fas fa-copy"></i> Duplicar</button>
                    ${placements.length > 1 ? `<button class="btn btn-danger btn-sm" onclick="removePlacement(${placement.id})"><i class="fas fa-trash"></i> Eliminar</button>` : ''}
                </div>
            </div>
            
            <div class="placement-grid">
                <div class="placement-left-column">
                    <!-- Tipo de Placement -->
                    <div class="form-group">
                        <label class="form-label">TIPO DE PLACEMENT:</label>
                        <select class="form-control placement-type-select" data-placement-id="${placement.id}" onchange="updatePlacementType(${placement.id}, this.value)">
                            ${['FRONT', 'BACK', 'SLEEVE', 'CHEST', 'TV. NUMBERS', 'SHOULDER', 'COLLAR', 'CUSTOM'].map(t => 
                                `<option value="${t}" ${placement.type === t || (t === 'CUSTOM' && isCustom) ? 'selected' : ''}>${t}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <!-- Custom name input -->
                    <div id="custom-placement-input-${placement.id}" style="display:${isCustom ? 'block' : 'none'}; margin-top:10px;">
                        <label class="form-label">NOMBRE DEL PLACEMENT:</label>
                        <input type="text" class="form-control" placeholder="Nombre personalizado..." 
                               value="${isCustom ? displayType : ''}" oninput="updateCustomPlacement(${placement.id}, this.value)">
                    </div>
                    
                    <!-- Imagen -->
                    <div class="card">
                        <div class="card-header"><h3 class="card-title"><i class="fas fa-image"></i> Imagen para ${displayType}</h3></div>
                        <div class="card-body">
                            <div class="file-upload-area" onclick="openImagePickerForPlacement(${placement.id})">
                                <i class="fas fa-cloud-upload-alt"></i><p>Haz clic para subir una imagen</p><p style="font-size:0.8rem;">Ctrl+V para pegar</p>
                            </div>
                            <div class="image-preview-container">
                                <img id="placement-image-preview-${placement.id}" class="image-preview" style="display: none;">
                                <div class="image-actions" id="placement-image-actions-${placement.id}" style="display:none;">
                                    <button class="btn btn-danger btn-sm" onclick="removePlacementImage(${placement.id})"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Condiciones -->
                    <div class="card">
                        <div class="card-header"><h3 class="card-title"><i class="fas fa-print"></i> Condiciones para ${displayType}</h3></div>
                        <div class="card-body">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">DETALLES DE UBICACIÓN:</label>
                                    <input type="text" class="form-control" value="${placement.placementDetails}" oninput="updatePlacementField(${placement.id}, 'placementDetails', this.value)">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">DIMENSIONES:</label>
                                    <div style="display: flex; gap: 10px;">
                                        <input type="text" class="form-control" placeholder="Ancho" value="${placement.width}" oninput="updatePlacementDimension(${placement.id}, 'width', this.value)" style="width:100px;">
                                        <span style="color: var(--text-secondary);">X</span>
                                        <input type="text" class="form-control" placeholder="Alto" value="${placement.height}" oninput="updatePlacementDimension(${placement.id}, 'height', this.value)" style="width:100px;">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">TEMPERATURA:</label>
                                    <input type="text" class="form-control" value="${placement.temp}" readonly>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">TIEMPO:</label>
                                    <input type="text" class="form-control" value="${placement.time}" readonly>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">SPECIALTIES:</label>
                                    <input type="text" class="form-control" value="${placement.specialties}" readonly>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Parámetros de Impresión -->
                    <div class="card">
                        <div class="card-header"><h3 class="card-title"><i class="fas fa-sliders-h"></i> Parámetros de Impresión</h3></div>
                        <div class="card-body">
                            <div class="form-grid">
                                <div class="form-group"><label>MALLA COLORES:</label><input type="text" class="form-control" value="${placement.meshColor}" oninput="updatePlacementParam(${placement.id}, 'meshColor', this.value)"></div>
                                <div class="form-group"><label>MALLA WHITE BASE:</label><input type="text" class="form-control" value="${placement.meshWhite}" oninput="updatePlacementParam(${placement.id}, 'meshWhite', this.value)"></div>
                                <div class="form-group"><label>MALLA BLOCKER:</label><input type="text" class="form-control" value="${placement.meshBlocker}" oninput="updatePlacementParam(${placement.id}, 'meshBlocker', this.value)"></div>
                                <div class="form-group"><label>DURÓMETRO:</label><input type="text" class="form-control" value="${placement.durometer}" oninput="updatePlacementParam(${placement.id}, 'durometer', this.value)"></div>
                                <div class="form-group"><label>STROKES:</label><input type="text" class="form-control" value="${placement.strokes}" oninput="updatePlacementParam(${placement.id}, 'strokes', this.value)"></div>
                                <div class="form-group"><label>ANGLE:</label><input type="text" class="form-control" value="${placement.angle}" oninput="updatePlacementParam(${placement.id}, 'angle', this.value)"></div>
                                <div class="form-group"><label>PRESSURE:</label><input type="text" class="form-control" value="${placement.pressure}" oninput="updatePlacementParam(${placement.id}, 'pressure', this.value)"></div>
                                <div class="form-group"><label>SPEED:</label><input type="text" class="form-control" value="${placement.speed}" oninput="updatePlacementParam(${placement.id}, 'speed', this.value)"></div>
                                <div class="form-group"><label>ADITIVOS:</label><input type="text" class="form-control" value="${placement.additives}" oninput="updatePlacementParam(${placement.id}, 'additives', this.value)"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="placement-right-column">
                    <!-- Tipo de Tinta -->
                    <div class="form-group">
                        <label class="form-label">TIPO DE TINTA:</label>
                        <select class="form-control" onchange="updatePlacementInkType(${placement.id}, this.value)">
                            <option value="WATER" ${placement.inkType === 'WATER' ? 'selected' : ''}>Water-base</option>
                            <option value="PLASTISOL" ${placement.inkType === 'PLASTISOL' ? 'selected' : ''}>Plastisol</option>
                            <option value="SILICONE" ${placement.inkType === 'SILICONE' ? 'selected' : ''}>Silicone</option>
                        </select>
                    </div>
                    
                    <!-- Colores -->
                    <div class="card">
                        <div class="card-header"><h3 class="card-title"><i class="fas fa-palette"></i> Colores para ${displayType}</h3></div>
                        <div class="card-body">
                            <div class="no-print" style="margin-bottom:20px; display:flex; gap:10px; flex-wrap:wrap;">
                                <button type="button" class="btn btn-danger btn-sm" onclick="addPlacementColorItem(${placement.id}, 'BLOCKER')"><i class="fas fa-plus"></i> Blocker</button>
                                <button type="button" class="btn btn-white-base btn-sm" onclick="addPlacementColorItem(${placement.id}, 'WHITE_BASE')"><i class="fas fa-plus"></i> White Base</button>
                                <button type="button" class="btn btn-primary btn-sm" onclick="addPlacementColorItem(${placement.id}, 'COLOR')"><i class="fas fa-plus"></i> Color</button>
                                <button type="button" class="btn btn-warning btn-sm" onclick="addPlacementColorItem(${placement.id}, 'METALLIC')"><i class="fas fa-star"></i> Metálico</button>
                            </div>
                            <div id="placement-colors-container-${placement.id}" class="color-sequence"></div>
                        </div>
                    </div>
                    
                    <!-- Instrucciones Especiales -->
                    <div class="form-group">
                        <label class="form-label">INSTRUCCIONES ESPECIALES:</label>
                        <textarea class="form-control" rows="3" oninput="updatePlacementField(${placement.id}, 'specialInstructions', this.value)">${placement.specialInstructions || ''}</textarea>
                    </div>
                    
                    <!-- Vista previa de colores -->
                    <div id="placement-colors-preview-${placement.id}" class="color-legend"></div>
                    
                    <!-- Secuencia de Estaciones -->
                    <h4 style="margin:15px 0 10px;"><i class="fas fa-list-ol"></i> Secuencia de ${displayType}</h4>
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
        const actions = document.getElementById(`placement-image-actions-${placement.id}`);
        if (img && actions) {
            img.src = placement.imageData;
            img.style.display = 'block';
            actions.style.display = 'flex';
        }
    }
}

// ========== FUNCIONES DE ACTUALIZACIÓN DE CAMPOS ==========
function updatePlacementType(placementId, type) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;
    
    const customInput = document.getElementById(`custom-placement-input-${placementId}`);
    
    if (type === 'CUSTOM') {
        if (customInput) customInput.style.display = 'block';
        if (!placement.type.startsWith('CUSTOM:')) placement.type = 'CUSTOM:';
    } else {
        if (customInput) customInput.style.display = 'none';
        placement.type = type;
    }
    
    updateAllPlacementTitles(placementId);
    showStatus(`✅ Tipo cambiado a ${type}`);
}

function updateCustomPlacement(placementId, customName) {
    const placement = placements.find(p => p.id === placementId);
    if (placement && customName.trim()) {
        placement.type = `CUSTOM: ${customName}`;
        updateAllPlacementTitles(placementId);
        showStatus(`✅ Placement personalizado: ${customName}`);
    }
}

function updatePlacementInkType(placementId, inkType) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;
    
    placement.inkType = inkType;
    const preset = getInkPresetSafe(inkType);
    
    placement.temp = preset.temp;
    placement.time = preset.time;
    
    // Actualizar UI
    const tempField = document.getElementById(`temp-${placementId}`);
    const timeField = document.getElementById(`time-${placementId}`);
    if (tempField) tempField.value = preset.temp;
    if (timeField) timeField.value = preset.time;
    
    updatePlacementStations(placementId);
    showStatus(`✅ Tinta: ${inkType}`);
}

function updatePlacementField(placementId, field, value) {
    const placement = placements.find(p => p.id === placementId);
    if (placement) placement[field] = value;
}

function updatePlacementParam(placementId, param, value) {
    const placement = placements.find(p => p.id === placementId);
    if (placement) {
        placement[param] = value;
        updatePlacementStations(placementId);
    }
}

function updatePlacementDimension(placementId, type, value) {
    const placement = placements.find(p => p.id === placementId);
    if (placement) {
        placement[type] = value;
        placement.dimensions = `SIZE: (W) ${placement.width || '##'} X (H) ${placement.height || '##'}`;
    }
}

// ========== GESTIÓN DE COLORES ==========
function addPlacementColorItem(placementId, type) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;
    
    const preset = getInkPresetSafe(placement.inkType);
    const colorCount = placement.colors.filter(c => c.type === 'COLOR' || c.type === 'METALLIC').length;
    
    const defaults = {
        BLOCKER: { screenLetter: 'A', val: preset.blocker.name },
        WHITE_BASE: { screenLetter: 'B', val: preset.white.name },
        METALLIC: { screenLetter: String(colorCount + 1), val: 'METALLIC GOLD' },
        COLOR: { screenLetter: String(colorCount + 1), val: '' }
    };
    
    placement.colors.push({
        id: Date.now() + Math.random(),
        type: type,
        screenLetter: defaults[type]?.screenLetter || '',
        val: defaults[type]?.val || ''
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
        container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-secondary);"><i class="fas fa-palette" style="font-size:1.5rem; display:block; margin-bottom:10px;"></i>No hay colores agregados.</div>';
        return;
    }
    
    container.innerHTML = placement.colors.map(color => {
        const badgeClass = {
            BLOCKER: 'badge-blocker',
            WHITE_BASE: 'badge-white',
            METALLIC: 'badge-warning'
        }[color.type] || 'badge-color';
        
        const label = {
            BLOCKER: 'BLOQUEADOR',
            WHITE_BASE: 'WHITE BASE',
            METALLIC: 'METÁLICO',
            COLOR: 'COLOR'
        }[color.type];
        
        return `
            <div class="color-item">
                <span class="badge ${badgeClass}">${label}</span>
                <input type="text" style="width:60px; text-align:center;" value="${color.screenLetter}" class="form-control" oninput="updatePlacementScreenLetter(${placementId}, ${color.id}, this.value)">
                <input type="text" class="form-control" placeholder="Nombre de la tinta..." value="${color.val}" oninput="updatePlacementColorValue(${placementId}, ${color.id}, this.value)">
                <div class="color-preview" id="placement-color-preview-${placementId}-${color.id}"></div>
                <button class="btn btn-outline btn-sm" onclick="movePlacementColorItem(${placementId}, ${color.id}, -1)"><i class="fas fa-arrow-up"></i></button>
                <button class="btn btn-outline btn-sm" onclick="movePlacementColorItem(${placementId}, ${color.id}, 1)"><i class="fas fa-arrow-down"></i></button>
                <button class="btn btn-danger btn-sm" onclick="removePlacementColorItem(${placementId}, ${color.id})"><i class="fas fa-times"></i></button>
            </div>
        `;
    }).join('');
    
    placement.colors.forEach(c => updatePlacementColorPreview(placementId, c.id));
}

function updatePlacementColorValue(placementId, colorId, value) {
    const placement = placements.find(p => p.id === placementId);
    const color = placement?.colors.find(c => c.id === colorId);
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
    const color = placement?.colors.find(c => c.id === colorId);
    if (color) {
        color.screenLetter = value.toUpperCase();
        updatePlacementStations(placementId);
    }
}

function removePlacementColorItem(placementId, colorId) {
    const placement = placements.find(p => p.id === placementId);
    if (placement) {
        placement.colors = placement.colors.filter(c => c.id !== colorId);
        renderPlacementColors(placementId);
        updatePlacementStations(placementId);
        updatePlacementColorsPreview(placementId);
        checkForSpecialtiesInColors(placementId);
    }
}

function movePlacementColorItem(placementId, colorId, direction) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;
    
    const index = placement.colors.findIndex(c => c.id === colorId);
    if (index === -1) return;
    
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= placement.colors.length) return;
    
    [placement.colors[index], placement.colors[newIndex]] = [placement.colors[newIndex], placement.colors[index]];
    renderPlacementColors(placementId);
    updatePlacementStations(placementId);
    updatePlacementColorsPreview(placementId);
    checkForSpecialtiesInColors(placementId);
}

function updatePlacementColorPreview(placementId, colorId) {
    const placement = placements.find(p => p.id === placementId);
    const color = placement?.colors.find(c => c.id === colorId);
    const preview = document.getElementById(`placement-color-preview-${placementId}-${colorId}`);
    if (!preview || !color) return;
    
    const colorName = (color.val || '').toUpperCase().trim();
    let hex = null;
    
    // Resolver color usando múltiples fuentes
    if (window.ColorConfig?.findColorHex) hex = window.ColorConfig.findColorHex(color.val);
    if (!hex && window.Utils?.getColorHex) hex = window.Utils.getColorHex(color.val);
    
    // Colores básicos
    const basicColors = {
        'RED': '#FF0000', 'BLUE': '#0000FF', 'GREEN': '#00FF00', 'BLACK': '#000000',
        'WHITE': '#FFFFFF', 'YELLOW': '#FFFF00', 'PURPLE': '#800080', 'ORANGE': '#FFA500',
        'GRAY': '#808080', 'GREY': '#808080', 'GOLD': '#FFD700', 'SILVER': '#C0C0C0',
        'NAVY': '#000080', 'MAROON': '#800000', 'PINK': '#FFC0CB'
    };
    
    if (!hex) {
        for (const [name, code] of Object.entries(basicColors)) {
            if (colorName.includes(name)) { hex = code; break; }
        }
    }
    
    if (!hex) {
        const hexMatch = colorName.match(/#([0-9A-F]{6})/i);
        if (hexMatch) hex = `#${hexMatch[1]}`;
    }
    
    preview.style.background = hex || '#CCCCCC';
    preview.style.backgroundImage = hex ? 'none' : 'repeating-linear-gradient(45deg, #999, #999 2px, #CCC 2px, #CCC 4px)';
    preview.title = hex ? `${color.val} - ${hex}` : color.val;
}

function updatePlacementColorsPreview(placementId) {
    const placement = placements.find(p => p.id === placementId);
    const container = document.getElementById(`placement-colors-preview-${placementId}`);
    if (!container || !placement) return;
    
    const seen = new Set();
    const unique = placement.colors
        .filter(c => c.type === 'COLOR' || c.type === 'METALLIC')
        .filter(c => {
            if (!c.val || seen.has(c.val)) return false;
            seen.add(c.val);
            return true;
        });
    
    if (unique.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = `
        <div><strong>Leyenda de Colores:</strong></div>
        <div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:10px;">
            ${unique.map(c => {
                const hex = window.Utils?.getColorHex?.(c.val) || '#ccc';
                return `<div style="display:flex; align-items:center;"><div style="background:${hex}; width:15px; height:15px; border:1px solid #666; margin-right:5px;"></div><span style="font-size:11px;">${c.screenLetter}: ${c.val}</span></div>`;
            }).join('')}
        </div>
    `;
}

// ========== DETECCIÓN DE ESPECIALIDADES ==========
function checkForSpecialtiesInColors(placementId) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;
    
    const specialties = new Set();
    
    placement.colors.forEach(c => {
        const val = (c.val || '').toUpperCase();
        if (val.includes('HD') || val.includes('HIGH DENSITY')) specialties.add('HIGH DENSITY');
        if (isMetallicColor(val)) specialties.add('METALLIC');
        if (val.includes('FOIL')) specialties.add('FOIL');
    });
    
    placement.specialties = Array.from(specialties).join(', ');
    
    const field = document.getElementById(`specialties-${placementId}`);
    if (field) field.value = placement.specialties;
}

function isMetallicColor(colorName) {
    if (!colorName) return false;
    const upper = colorName.toUpperCase();
    if (upper.match(/(8[7-9][0-9]\s*C?)/i)) return true;
    const metallicCodes = ['871C', '872C', '873C', '874C', '875C', '876C', '877C', 'METALLIC', 'GOLD', 'SILVER', 'BRONZE'];
    return metallicCodes.some(code => upper.includes(code));
}

// ========== SECUENCIA DE IMPRESIÓN ==========
function updatePlacementStations(placementId, returnOnly = false) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return returnOnly ? [] : null;
    
    const preset = getInkPresetSafe(placement.inkType);
    const stations = [];
    let stNum = 1;
    
    placement.colors.forEach((item, idx) => {
        const base = {
            screenLetter: item.screenLetter || '',
            screenCombined: item.val || '---',
            mesh: placement.meshColor || preset.color.mesh,
            strokes: placement.strokes || preset.color.strokes,
            duro: placement.durometer || preset.color.durometer,
            angle: placement.angle || preset.color.angle,
            pressure: placement.pressure || preset.color.pressure,
            speed: placement.speed || preset.color.speed,
            add: placement.additives || preset.color.additives
        };
        
        // Ajustes por tipo
        if (item.type === 'BLOCKER') {
            base.mesh = placement.meshBlocker || preset.blocker.mesh1;
            base.add = placement.additives || preset.blocker.additives;
            base.screenCombined = preset.blocker.name;
        } else if (item.type === 'WHITE_BASE') {
            base.mesh = placement.meshWhite || preset.white.mesh1;
            base.add = placement.additives || preset.white.additives;
            base.screenCombined = preset.white.name;
        } else if (item.type === 'METALLIC') {
            base.mesh = '110/64';
            base.strokes = '1';
            base.duro = '70';
            base.add = 'Catalizador especial';
        }
        
        stations.push({ st: stNum++, ...base });
        
        if (idx < placement.colors.length - 1) {
            stations.push({ st: stNum++, screenCombined: 'FLASH', mesh: '-', strokes: '-', duro: '-', angle: '-', pressure: '-', speed: '-', add: '', screenLetter: '' });
            stations.push({ st: stNum++, screenCombined: 'COOL', mesh: '-', strokes: '-', duro: '-', angle: '-', pressure: '-', speed: '-', add: '', screenLetter: '' });
        }
    });
    
    if (returnOnly) return stations;
    renderPlacementStationsTable(placementId, stations);
}

function renderPlacementStationsTable(placementId, data) {
    const div = document.getElementById(`placement-sequence-table-${placementId}`);
    if (!div) return;
    
    if (data.length === 0) {
        div.innerHTML = '<p style="color:var(--text-secondary); text-align:center; padding:15px;">Agrega colores para generar la secuencia.</p>';
        return;
    }
    
    div.innerHTML = `
        <table class="sequence-table">
            <thead><tr><th>Est</th><th>Scr.</th><th>Screen (Tinta/Proceso)</th><th>Aditivos</th><th>Malla</th><th>Strokes</th><th>Angle</th><th>Pressure</th><th>Speed</th><th>Duro</th></tr></thead>
            <tbody>
                ${data.map(row => `
                    <tr>
                        <td><strong>${row.st}</strong></td>
                        <td><b style="color:var(--primary);">${row.screenLetter}</b></td>
                        <td>${row.screenCombined}</td>
                        <td style="color:var(--primary);">${row.add}</td>
                        <td>${row.mesh}</td>
                        <td>${row.strokes}</td>
                        <td>${row.angle}</td>
                        <td>${row.pressure}</td>
                        <td>${row.speed}</td>
                        <td>${row.duro}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ========== GESTIÓN DE IMÁGENES ==========
function openImagePickerForPlacement(placementId) {
    currentPlacementId = placementId;
    document.getElementById('placementImageInput')?.click();
}

function removePlacementImage(placementId) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;
    
    const img = document.getElementById(`placement-image-preview-${placementId}`);
    const actions = document.getElementById(`placement-image-actions-${placementId}`);
    
    if (img) { img.src = ''; img.style.display = 'none'; }
    if (actions) actions.style.display = 'none';
    
    placement.imageData = null;
    showStatus('🗑️ Imagen eliminada');
}

function setupPasteHandler() {
    document.addEventListener('paste', e => {
        const activeSection = document.querySelector('.placement-section.active');
        if (!activeSection) return;
        
        const placementId = parseInt(activeSection.dataset.placementId);
        const placement = placements.find(p => p.id === placementId);
        if (!placement) return;
        
        // Si es texto en campo editable, ignorar
        if (e.target.closest('input, textarea, [contenteditable]')) return;
        
        for (let item of e.clipboardData.items) {
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = ev => {
                    placement.imageData = ev.target.result;
                    const img = document.getElementById(`placement-image-preview-${placementId}`);
                    const actions = document.getElementById(`placement-image-actions-${placementId}`);
                    if (img && actions) {
                        img.src = ev.target.result;
                        img.style.display = 'block';
                        actions.style.display = 'flex';
                    }
                    showStatus(`✅ Imagen pegada en ${placement.type}`);
                };
                reader.readAsDataURL(blob);
                e.preventDefault();
                break;
            }
        }
    });
}

// ========== RECOLECCIÓN DE DATOS ==========
function collectData() {
    const general = {
        customer: getInputValue('customer'),
        style: getInputValue('style'),
        folder: getInputValue('folder-num'),
        colorway: getInputValue('colorway'),
        season: getInputValue('season'),
        pattern: getInputValue('pattern'),
        po: getInputValue('po'),
        sampleType: getInputValue('sample-type'),
        nameTeam: getInputValue('name-team'),
        gender: getInputValue('gender'),
        designer: getInputValue('designer'),
        developedBy: '',
        savedAt: new Date().toISOString()
    };
    
    const placementsData = placements.map(p => ({
        id: p.id,
        type: p.type,
        title: p.type.includes('CUSTOM:') ? p.type.replace('CUSTOM: ', '') : p.type,
        imageData: p.imageData,
        colors: p.colors.map(c => ({ id: c.id, type: c.type, val: c.val, screenLetter: c.screenLetter })),
        placementDetails: p.placementDetails,
        dimensions: p.dimensions,
        width: p.width || '',
        height: p.height || '',
        temp: p.temp,
        time: p.time,
        specialties: p.specialties,
        technicalComments: p.specialInstructions || '',
        specialInstructions: p.specialInstructions || '',
        inkType: p.inkType,
        meshColor: p.meshColor,
        meshWhite: p.meshWhite,
        meshBlocker: p.meshBlocker,
        durometer: p.durometer,
        strokes: p.strokes,
        angle: p.angle,
        pressure: p.pressure,
        speed: p.speed,
        additives: p.additives
    }));
    
    return { ...general, placements: placementsData };
}

// ========== GUARDADO EN LOCALSTORAGE ==========
function saveCurrentSpec() {
    try {
        const data = collectData();
        const style = data.style || 'SinEstilo_' + Date.now();
        const key = `spec_${style}_${Date.now()}`;
        
        // Actualizar campos de placements
        placements.forEach(p => {
            p.specialties = document.getElementById(`specialties-${p.id}`)?.value || p.specialties;
            p.specialInstructions = document.getElementById(`special-instructions-${p.id}`)?.value || p.specialInstructions;
        });
        
        data.savedAt = new Date().toISOString();
        data.lastModified = data.savedAt;
        
        localStorage.setItem(key, JSON.stringify(data));
        updateDashboard();
        loadSavedSpecsList();
        showStatus('✅ Spec guardada');
        
        setTimeout(() => {
            if (confirm('¿Ver specs guardadas?')) showTab('saved-specs');
        }, 1000);
    } catch (error) {
        console.error('Error al guardar:', error);
        showStatus('❌ Error al guardar', 'error');
        window.errorHandler?.log('save_spec', error);
    }
}

function loadSpecData(data) {
    // Campos generales
    ['customer', 'style', 'folder-num', 'colorway', 'season', 'pattern', 'po', 'sample-type', 'name-team', 'gender', 'designer']
        .forEach(id => setInputValue(id, data[id.replace('-num', '')] || ''));
    
    // Limpiar placements actuales
    document.getElementById('placements-container').innerHTML = '';
    placements = [];
    
    // Cargar placements
    if (data.placements?.length) {
        data.placements.forEach((p, i) => {
            const placement = { ...p, id: i === 0 ? 1 : Date.now() + i };
            placements.push(placement);
            renderPlacementHTML(placement);
            
            if (placement.imageData) {
                const img = document.getElementById(`placement-image-preview-${placement.id}`);
                const actions = document.getElementById(`placement-image-actions-${placement.id}`);
                if (img && actions) {
                    img.src = placement.imageData;
                    img.style.display = 'block';
                    actions.style.display = 'flex';
                }
            }
            
            renderPlacementColors(placement.id);
            updatePlacementStations(placement.id);
            updatePlacementColorsPreview(placement.id);
        });
    } else {
        initializePlacements();
    }
    
    updatePlacementsTabs();
    showPlacement(1);
    updateClientLogo();
    showTab('spec-creator');
    showStatus('📂 Spec cargada');
}

// ========== DASHBOARD ==========
function updateDashboard() {
    const specs = Object.keys(localStorage).filter(k => k.startsWith('spec_'));
    
    document.getElementById('total-specs').textContent = specs.length;
    
    let lastSpec = null, lastDate = null;
    specs.forEach(key => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            const date = new Date(data.savedAt || 0);
            if (!lastDate || date > lastDate) { lastDate = date; lastSpec = data; }
        } catch (e) {}
    });
    
    const todayEl = document.getElementById('today-specs');
    if (lastSpec) {
        todayEl.innerHTML = `<div style="font-size:0.9rem;">Última Spec:</div><div style="font-size:1.2rem; font-weight:bold; color:var(--primary);">${lastSpec.style || 'Sin nombre'}</div><div style="font-size:0.8rem;">${lastDate.toLocaleDateString()}</div>`;
    } else {
        todayEl.innerHTML = '<div style="font-size:0.9rem;">Sin specs creadas</div>';
    }
    
    const active = specs.filter(k => {
        try { return JSON.parse(localStorage.getItem(k)).placements?.length > 0; }
        catch { return false; }
    }).length;
    document.getElementById('active-projects').textContent = active;
    
    const totalPlacements = specs.reduce((sum, k) => {
        try { return sum + (JSON.parse(localStorage.getItem(k)).placements?.length || 0); }
        catch { return sum; }
    }, 0);
    
    document.getElementById('completion-rate').innerHTML = `<div style="font-size:0.9rem;">Placements totales:</div><div style="font-size:1.5rem; font-weight:bold; color:var(--primary);">${totalPlacements}</div>`;
}

// ========== LISTA DE SPECS GUARDADAS ==========
function loadSavedSpecsList() {
    const list = document.getElementById('saved-specs-list');
    const search = document.getElementById('saved-specs-search')?.value.toUpperCase().trim() || '';
    const specs = Object.keys(localStorage).filter(k => k.startsWith('spec_'));
    
    if (!specs.length) {
        list.innerHTML = '<p style="text-align:center; padding:30px;"><i class="fas fa-database" style="font-size:2rem; display:block; margin-bottom:10px;"></i>No hay specs guardadas.</p>';
        return;
    }
    
    let html = '';
    let visible = 0;
    
    specs.forEach(key => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            const searchable = [key, data.style, data.customer, data.po, data.colorway].join(' ').toUpperCase();
            if (search && !searchable.includes(search)) return;
            
            visible++;
            html += `
                <div style="padding:15px; border-bottom:1px solid var(--border-dark); display:flex; justify-content:space-between; align-items:center;">
                    <div style="flex:1;">
                        <div style="font-weight:700; color:var(--primary);">${data.style || 'N/A'}</div>
                        <div style="font-size:0.85rem;">Cliente: ${data.customer || 'N/A'} | PO: ${data.po || 'N/A'}</div>
                        <div style="font-size:0.75rem;">Guardado: ${new Date(data.savedAt).toLocaleDateString()}</div>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button class="btn btn-primary btn-sm" onclick='loadSpecData(${JSON.stringify(data)})'><i class="fas fa-edit"></i> Cargar</button>
                        <button class="btn btn-outline btn-sm" onclick="downloadSingleSpec('${key}')"><i class="fas fa-download"></i> JSON</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteSpec('${key}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        } catch (e) {
            console.warn('Error al leer spec:', key, e);
            localStorage.removeItem(key);
        }
    });
    
    list.innerHTML = visible ? html : '<p style="text-align:center; padding:20px;">No se encontraron specs.</p>';
}

function downloadSingleSpec(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TegraSpec_${data.style || 'Backup'}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showStatus('✅ Spec descargada');
    } catch (e) {
        showStatus('❌ Error al descargar', 'error');
    }
}

function deleteSpec(key) {
    if (confirm('¿Eliminar esta spec?')) {
        localStorage.removeItem(key);
        loadSavedSpecsList();
        updateDashboard();
        showStatus('🗑️ Spec eliminada');
    }
}

function clearAllSpecs() {
    if (confirm('⚠️ ¿Eliminar TODAS las specs? Esta acción no se puede deshacer.')) {
        Object.keys(localStorage).forEach(k => { if (k.startsWith('spec_')) localStorage.removeItem(k); });
        loadSavedSpecsList();
        updateDashboard();
        showStatus('🗑️ Todas las specs eliminadas');
    }
}

// ========== LIMPIEZA DE FORMULARIO ==========
function clearForm() {
    if (!confirm('⚠️ ¿Limpiar todo el formulario? Se perderán los datos no guardados.')) return;
    
    document.querySelectorAll('input:not(#folder-num), textarea, select').forEach(i => {
        if (i.type !== 'button' && i.type !== 'submit') i.value = '';
    });
    setInputValue('designer', '');
    
    placements = [];
    document.getElementById('placements-container').innerHTML = '';
    document.getElementById('placements-tabs').innerHTML = '';
    
    initializePlacements();
    document.getElementById('logoCliente')?.style.display = 'none';
    showStatus('🧹 Formulario limpiado');
}

// ========== EXPORTACIÓN A EXCEL ==========
function exportToExcel() {
    try {
        if (typeof XLSX === 'undefined') {
            showStatus('❌ Biblioteca Excel no cargada', 'error');
            return;
        }
        
        const data = collectData();
        const headers = ['Area', 'Designer', 'Customer', 'Division', 'SEASON', '', '#Folder', '', '', '', '', '', '', '', '', '', '', '', '', '', 'TEAM', '', '', 'COLORWAY', '', 'PLACEMENT', '', 'SPEC #', '#SCREEN', 'NO. COLORES', 'Stations', 'setup', 'size', 'W', 'H', 'TYPE OF ART', 'INK TYPE'];
        
        const rows = (data.placements?.length ? data.placements : [{}]).map((p, i) => {
            const screenCount = p.colors?.length || 0;
            const stations = screenCount > 0 ? screenCount * 3 - 2 : 0;
            const inkType = { 'WATER': 'WB MAGNA', 'PLASTISOL': 'PLASTISOL', 'SILICONE': 'SILICONE' }[p.inkType] || 'WB MAGNA';
            
            return [
                'Development', data.designer || '', data.customer || '', 'NFL / jersey', data.season || '',
                '', data.folder || '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                data.nameTeam || '', '', '', data.colorway || '', '',
                p.type?.includes('CUSTOM:') ? p.type.replace('CUSTOM: ', '').toLowerCase() : (p.type || 'front').toLowerCase(),
                '', `SPEC ${i + 1}`, screenCount, screenCount, stations, 1, 'L',
                `${p.width || '15.34'}"`, `${p.height || '12'}"`, 'Vector', inkType
            ];
        });
        
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws['!cols'] = headers.map((_, i) => ({ wch: [0,1,2,3,4,6,20,23,25,27,28,29,30,34,35].includes(i) ? 12 : 3 }));
        
        XLSX.utils.book_append_sheet(XLSX.utils.book_new(), ws, 'Hoja1');
        XLSX.writeFile(XLSX.utils.book_new(), `Calculadora_${data.style || 'Spec'}_${data.folder || '00000'}.xlsx`);
        showStatus('📊 Excel generado');
    } catch (error) {
        console.error('Error en Excel:', error);
        showStatus('❌ Error al generar Excel', 'error');
    }
}

// ========== EXPORTACIÓN A PDF (VERSIÓN OPTIMIZADA) ==========
async function exportPDF() {
    try {
        showStatus('📄 Generando PDF...', 'warning');
        const data = collectData();
        
        // Intentar con generador profesional
        if (window.generateProfessionalPDF) {
            try {
                const pdfBlob = await window.generateProfessionalPDF(data);
                downloadPDF(pdfBlob, data);
                return;
            } catch (e) {
                console.warn('PDF profesional falló, usando legacy:', e);
            }
        }
        
        // Fallback a generador legacy
        const pdfBlob = await generateLegacyPDF(data);
        downloadPDF(pdfBlob, data);
        
    } catch (error) {
        console.error('Error PDF:', error);
        showStatus('❌ Error al generar PDF', 'error');
        window.errorHandler?.log('pdf_export', error);
    }
}

function downloadPDF(blob, data) {
    const style = data.style || 'SinEstilo';
    const folder = data.folder || '00000';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TegraSpec_${style}_${folder}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    showStatus('✅ PDF generado');
}

// ========== GENERADOR LEGACY (SIMPLIFICADO) ==========
async function generateLegacyPDF(data) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'letter');
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    
    // Generar páginas para cada placement
    for (let i = 0; i < data.placements.length; i++) {
        if (i > 0) pdf.addPage();
        
        const p = data.placements[i];
        const displayType = p.type.includes('CUSTOM:') ? p.type.replace('CUSTOM: ', '') : p.type;
        let y = 20;
        
        // Header
        pdf.setFillColor(162, 43, 42);
        pdf.rect(0, 0, pageW, 28, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.text('TECHNICAL SPEC MANAGER', 10, 15);
        pdf.setFontSize(12);
        pdf.text(`Placement ${i + 1}/${data.placements.length}: ${displayType}`, 10, 23);
        
        // Información general
        y = 35;
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.text(`Cliente: ${data.customer || 'N/A'}`, 10, y);
        pdf.text(`Style: ${data.style || 'N/A'}`, 70, y);
        pdf.text(`Colorway: ${data.colorway || 'N/A'}`, 130, y);
        y += 6;
        pdf.text(`PO: ${data.po || 'N/A'}`, 10, y);
        pdf.text(`Team: ${data.nameTeam || 'N/A'}`, 70, y);
        pdf.text(`Tinta: ${p.inkType || 'WATER'}`, 130, y);
        y += 10;
        
        // Tabla de colores/secuencia
        if (p.colors?.length) {
            pdf.setFillColor(240, 240, 240);
            pdf.rect(10, y, pageW - 20, 8, 'F');
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Secuencia de Impresión', 15, y + 6);
            y += 10;
            
            let x = 10;
            const headers = ['Est', 'Scr.', 'Tinta', 'Malla', 'Strokes'];
            const colW = [10, 10, 70, 20, 20];
            
            headers.forEach((h, i) => {
                pdf.text(h, x + 1, y);
                x += colW[i];
            });
            y += 5;
            
            p.colors.forEach((c, idx) => {
                pdf.text(String(idx + 1), 11, y);
                pdf.text(c.screenLetter || '', 21, y);
                pdf.text(c.val || '---', 31, y);
                pdf.text(p.meshColor || '157/48', 101, y);
                pdf.text(p.strokes || '2', 121, y);
                y += 5;
                
                if (idx < p.colors.length - 1) {
                    pdf.text('FLASH', 31, y);
                    y += 5;
                    pdf.text('COOL', 31, y);
                    y += 5;
                }
            });
            
            y += 5;
        }
        
        // Condiciones de curado
        pdf.setFillColor(240, 240, 240);
        pdf.rect(10, y, pageW - 20, 18, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.text('Condiciones de Curado', 15, y + 5);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Temp: ${p.temp || '320°F'}`, 15, y + 12);
        pdf.text(`Tiempo: ${p.time || '1:40 min'}`, 80, y + 12);
        pdf.text(`Tinta: ${p.inkType || 'WATER'}`, 145, y + 12);
        
        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Generado: ${new Date().toLocaleString()}`, 10, pageH - 10);
        pdf.text('TEGRA Spec Manager', pageW - 40, pageH - 10);
    }
    
    return pdf.output('blob');
}

// ========== ERROR LOG ==========
function loadErrorLog() {
    const container = document.getElementById('error-log-content');
    if (!container) return;
    
    const errors = window.errorHandler?.getErrors() || [];
    
    if (!errors.length) {
        container.innerHTML = '<p style="text-align:center; padding:30px;"><i class="fas fa-check-circle" style="font-size:2rem; color:var(--success); display:block; margin-bottom:10px;"></i>No hay errores registrados.</p>';
        return;
    }
    
    container.innerHTML = `
        <div style="margin-bottom:20px;">Total de errores: <strong>${errors.length}</strong> - ${new Date().toLocaleString()}</div>
        ${errors.map(e => `
            <div class="card" style="margin-bottom:15px; border-left:4px solid var(--error);">
                <div class="card-body">
                    <strong style="color:var(--error);">${e.context}</strong>
                    <div style="font-size:0.85rem;">${new Date(e.timestamp).toLocaleString()}</div>
                    <code style="display:block; background:var(--gray-dark); padding:10px; margin-top:10px;">${e.error.message || 'Sin mensaje'}</code>
                </div>
            </div>
        `).join('')}
    `;
}

function clearErrorLog() {
    if (confirm('¿Limpiar log de errores?')) {
        window.errorHandler?.clearErrors();
        loadErrorLog();
        showStatus('🗑️ Log limpiado');
    }
}

// ========== CARGA DE ARCHIVOS EXCEL/SWO ==========
document.getElementById('excelFile')?.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.name.endsWith('.zip')) {
        await loadProjectZip(file);
    } else if (file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = ev => {
            try { loadSpecData(JSON.parse(ev.target.result)); }
            catch (err) { showStatus('❌ Error leyendo JSON', 'error'); }
        };
        reader.readAsText(file);
    } else {
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const workbook = XLSX.read(new Uint8Array(ev.target.result), { type: 'array' });
                const sheetName = workbook.SheetNames.find(n => ['SWO', 'PPS', 'Proto'].includes(n)) || workbook.SheetNames[0];
                processExcelData(workbook.Sheets[sheetName], sheetName);
            } catch (err) {
                showStatus('❌ Error leyendo archivo', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    }
    
    e.target.value = '';
});

function processExcelData(worksheet, sheetName) {
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    const extracted = {};
    
    data.forEach(row => {
        if (!row || row.length < 2) return;
        const label = String(row[1] || '').trim();
        const val = String(row[2] || '').trim();
        
        if (label.includes('CUSTOMER:')) extracted.customer = val;
        else if (label.includes('STYLE:')) extracted.style = val;
        else if (label.includes('COLORWAY')) extracted.colorway = val;
        else if (label.includes('SEASON:')) extracted.season = val;
        else if (label.includes('PATTERN')) extracted.pattern = val;
        else if (label.includes('P.O.')) extracted.po = val;
        else if (label.includes('SAMPLE TYPE')) extracted.sample = val;
        else if (label.includes('TEAM:')) extracted.team = val;
        else if (label.includes('GENDER:')) extracted.gender = val;
    });
    
    // Aplicar valores
    Object.entries(extracted).forEach(([key, val]) => {
        if (key === 'sample') setInputValue('sample-type', val);
        else if (key === 'team') setInputValue('name-team', val);
        else setInputValue(key, val);
    });
    
    updateClientLogo();
    showStatus(`✅ "${sheetName}" procesado`);
}

// ========== PROYECTOS ZIP ==========
async function loadProjectZip(file) {
    try {
        showStatus('📦 Cargando ZIP...', 'warning');
        const zip = new JSZip();
        const contents = await zip.loadAsync(file);
        
        let jsonData = null;
        const images = [];
        
        for (const [name, entry] of Object.entries(contents.files)) {
            if (entry.dir) continue;
            
            if (name.endsWith('.json')) {
                jsonData = JSON.parse(await entry.async('text'));
            } else if (name.match(/\.(jpg|jpeg|png)$/i)) {
                const blob = await entry.async('blob');
                const reader = new FileReader();
                images.push(new Promise(resolve => {
                    reader.onload = e => resolve({ name, data: e.target.result });
                    reader.readAsDataURL(blob);
                }));
            }
        }
        
        if (jsonData) {
            loadSpecData(jsonData);
            const imageResults = await Promise.all(images);
            imageResults.forEach((img, idx) => {
                const placementIdx = parseInt(img.name.match(/placement(\d+)/)?.[1]) - 1;
                if (placementIdx >= 0 && placements[placementIdx]) {
                    placements[placementIdx].imageData = img.data;
                    const imgEl = document.getElementById(`placement-image-preview-${placements[placementIdx].id}`);
                    const actions = document.getElementById(`placement-image-actions-${placements[placementIdx].id}`);
                    if (imgEl && actions) {
                        imgEl.src = img.data;
                        imgEl.style.display = 'block';
                        actions.style.display = 'flex';
                    }
                }
            });
            showStatus('✅ ZIP cargado');
        } else {
            throw new Error('No se encontró archivo JSON');
        }
    } catch (error) {
        showStatus('❌ Error al cargar ZIP', 'error');
        console.error(error);
    }
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    updateDashboard();
    loadSavedSpecsList();
    setupPasteHandler();
    loadThemePreference();
    
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    setInterval(updateDateTime, 60000);
    
    setTimeout(() => {
        if (placements.length === 0) initializePlacements();
    }, 100);
});

// ========== AL FINAL DE app.js, DESPUÉS DE TODAS LAS FUNCIONES ==========

// ========== EXPORTAR FUNCIONES AL ÁMBITO GLOBAL ==========
window.showTab = showTab;
window.loadSavedSpecsList = loadSavedSpecsList;
window.clearErrorLog = clearErrorLog;
window.exportErrorLog = exportErrorLog;
window.clearAllSpecs = clearAllSpecs;
window.addNewPlacement = addNewPlacement;
window.saveCurrentSpec = saveCurrentSpec;
window.clearForm = clearForm;
window.exportToExcel = exportToExcel;
window.exportPDF = exportPDF;
window.downloadProjectZip = downloadProjectZip;
window.updateClientLogo = updateClientLogo;
window.handleGearForSportLogic = handleGearForSportLogic;

// Funciones de placements
window.removePlacement = removePlacement;
window.duplicatePlacement = duplicatePlacement;
window.showPlacement = showPlacement;
window.updatePlacementType = updatePlacementType;
window.updatePlacementInkType = updatePlacementInkType;
window.updateCustomPlacement = updateCustomPlacement;
window.updateAllPlacementTitles = updateAllPlacementTitles;
window.openImagePickerForPlacement = openImagePickerForPlacement;
window.removePlacementImage = removePlacementImage;
window.addPlacementColorItem = addPlacementColorItem;
window.removePlacementColorItem = removePlacementColorItem;
window.movePlacementColorItem = movePlacementColorItem;
window.updatePlacementColorValue = updatePlacementColorValue;
window.updatePlacementScreenLetter = updatePlacementScreenLetter;
window.updatePlacementParam = updatePlacementParam;
window.updatePlacementField = updatePlacementField;
window.updatePlacementDimension = updatePlacementDimension;
window.updatePlacementInkType = updatePlacementInkType;

// Funciones de utilidad
window.downloadSingleSpec = downloadSingleSpec;
window.deleteSpec = deleteSpec;
window.loadSpecData = loadSpecData;

console.log('✅ Funciones exportadas globalmente');
