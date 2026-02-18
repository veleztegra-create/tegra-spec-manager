// ========== app.js - VERSIÓN FINAL COMPLETA ==========
// ========== VARIABLES GLOBALES ==========
let placements = [];
let currentPlacementId = 1;
let isDarkMode = true;

// ========== FUNCIONES AUXILIARES ==========
function $(id) { return document.getElementById(id); }
function $$(selector) { return document.querySelectorAll(selector); }

function stringToHash(str) {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function updateDateTime() {
    const el = $('current-datetime');
    if (el) {
        el.textContent = new Date().toLocaleDateString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }
}

function showStatus(msg, type = 'success') {
    const el = $('statusMessage');
    if (!el) return;
    el.textContent = msg;
    el.className = `status-message status-${type}`;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 4000);
}

function getInputValue(id, fallback = '') {
    const el = $(id);
    return el ? el.value : fallback;
}

function setInputValue(id, value) {
    const el = $(id);
    if (el) el.value = value || '';
}

// ========== TEMA ==========
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('light-mode', !isDarkMode);
    const btn = $('themeToggle');
    if (btn) {
        btn.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i> Modo Claro' : '<i class="fas fa-moon"></i> Modo Oscuro';
    }
    localStorage.setItem('tegraspec-theme', isDarkMode ? 'dark' : 'light');
    showStatus(isDarkMode ? '🌙 Modo oscuro activado' : '☀️ Modo claro activado');
}

function loadThemePreference() {
    const saved = localStorage.getItem('tegraspec-theme');
    const btn = $('themeToggle');
    if (!btn) return;
    
    if (saved === 'light') {
        isDarkMode = false;
        document.body.classList.add('light-mode');
        btn.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
    } else {
        isDarkMode = true;
        btn.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
    }
}

// ========== NAVEGACIÓN ==========
function showTab(tabName) {
    $$('.tab-content').forEach(t => t.classList.remove('active'));
    $$('.nav-tab').forEach(t => t.classList.remove('active'));
    
    const target = $(tabName);
    if (target) target.classList.add('active');
    
    $$('.nav-tab').forEach(tab => {
        if (tab.textContent.toLowerCase().includes(tabName.replace('-', ' '))) {
            tab.classList.add('active');
        }
    });
    
    // Acciones específicas por tab
    if (tabName === 'saved-specs') loadSavedSpecsList();
    if (tabName === 'dashboard') updateDashboard();
    if (tabName === 'error-log') loadErrorLog();
    if (tabName === 'spec-creator' && placements.length === 0) initializePlacements();
}

// ========== CLIENTE Y LOGOS ==========
function updateClientLogo() {
    const customer = getInputValue('customer').toUpperCase();
    const logo = $('logoCliente');
    if (!logo) return;
    
    const logos = window.LogoConfig || {
        NIKE: 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Nike-Logotipo-PNG-Photo.png',
        FANATICS: 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Fanatics_company_logo.svg.png',
        ADIDAS: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1280px-Adidas_Logo.svg.png',
        'GEAR FOR SPORT': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png'
    };
    
    let url = '';
    if (customer.includes('NIKE')) url = logos.NIKE;
    else if (customer.includes('FANATICS')) url = logos.FANATICS;
    else if (customer.includes('ADIDAS')) url = logos.ADIDAS;
    else if (customer.includes('GEAR FOR SPORT') || customer.includes('GFS')) url = logos['GEAR FOR SPORT'];
    
    if (url) {
        logo.src = url;
        logo.style.display = 'block';
    } else {
        logo.style.display = 'none';
    }
}

function handleGearForSportLogic() {
    const customer = getInputValue('customer').toUpperCase();
    if (!customer.includes('GEAR FOR SPORT') && !customer.includes('GFS')) return;
    
    const style = getInputValue('style');
    const po = getInputValue('po');
    const searchTerm = (style + po).toUpperCase();
    
    const map = window.Config?.GEARFORSPORT_TEAM_MAP;
    if (map) {
        const key = Object.keys(map).find(k => searchTerm.includes(k));
        if (key) setInputValue('name-team', map[key]);
    }
}

// ========== PRESETS DE TINTA ==========
function getInkPresetSafe(inkType = 'WATER') {
    const base = {
        temp: '320 °F',
        time: inkType === 'WATER' ? '1:00 min' : '1:40 min',
        blocker: { name: 'BLOCKER CHT', mesh1: '122/55', additives: 'N/A' },
        white: { name: 'AQUAFLEX WHITE', mesh1: '198/40', additives: 'N/A' },
        color: { mesh: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: '3% cross-linker 500 · 1.5% antitack' }
    };
    
    if (window.Utils?.getInkPreset) {
        return window.Utils.getInkPreset(inkType) || base;
    }
    return base;
}

// ========== GESTIÓN DE PLACEMENTS ==========
function initializePlacements() {
    placements = [];
    const firstId = addNewPlacement('FRONT', true);
    showPlacement(firstId);
}

function addNewPlacement(type = null, isFirst = false) {
    const id = isFirst ? 1 : Date.now();
    const preset = getInkPresetSafe();
    
    const placement = {
        id: id,
        type: type || getNextPlacementType(),
        title: type,
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
        placements = [placement];
    } else {
        placements.push(placement);
        renderPlacementHTML(placement);
        updatePlacementsTabs();
        showPlacement(id);
    }
    return id;
}

function getNextPlacementType() {
    const used = placements.map(p => p.type);
    const types = ['FRONT', 'BACK', 'SLEEVE', 'CHEST', 'TV. NUMBERS', 'SHOULDER', 'COLLAR', 'CUSTOM'];
    return types.find(t => !used.includes(t)) || 'CUSTOM';
}

function removePlacement(id) {
    if (placements.length <= 1) {
        showStatus('⚠️ No puedes eliminar el único placement', 'warning');
        return;
    }
    if (!confirm('¿Eliminar este placement?')) return;
    
    placements = placements.filter(p => p.id !== id);
    $(`placement-section-${id}`)?.remove();
    updatePlacementsTabs();
    
    if (currentPlacementId === id && placements.length) {
        showPlacement(placements[0].id);
    }
    showStatus('🗑️ Placement eliminado');
}

function duplicatePlacement(id) {
    const original = placements.find(p => p.id === id);
    if (!original) return;
    
    const dup = JSON.parse(JSON.stringify(original));
    dup.id = Date.now();
    placements.push(dup);
    renderPlacementHTML(dup);
    updatePlacementsTabs();
    showPlacement(dup.id);
    setTimeout(() => updateAllPlacementTitles(dup.id), 50);
    showStatus('✅ Placement duplicado');
}

function updatePlacementsTabs() {
    const container = $('placements-tabs');
    if (!container) return;
    
    container.innerHTML = placements.map(p => {
        const type = p.type.includes('CUSTOM:') ? p.type.replace('CUSTOM: ', '') : p.type;
        const active = p.id === currentPlacementId ? 'active' : '';
        const removeBtn = placements.length > 1 ? 
            `<span class="remove-tab" onclick="event.stopPropagation(); removePlacement(${p.id})">&times;</span>` : '';
        
        return `<div class="placement-tab ${active}" data-placement-id="${p.id}" onclick="showPlacement(${p.id})">
            <i class="fas fa-${getPlacementIcon(p.type)}"></i> ${type.substring(0, 15)}
            ${removeBtn}
        </div>`;
    }).join('');
}

function getPlacementIcon(type) {
    const icons = {
        'FRONT': 'tshirt', 'BACK': 'tshirt', 'SLEEVE': 'hat-cowboy',
        'CHEST': 'heart', 'TV. NUMBERS': 'hashtag', 'SHOULDER': 'user',
        'COLLAR': 'circle'
    };
    return icons[type] || (type.includes('CUSTOM:') ? 'star' : 'map-marker-alt');
}

function showPlacement(id) {
    $$('.placement-section').forEach(s => s.classList.remove('active'));
    $(`placement-section-${id}`)?.classList.add('active');
    
    $$('.placement-tab').forEach(t => {
        t.classList.toggle('active', parseInt(t.dataset.placementId) === id);
    });
    
    currentPlacementId = id;
}

function updateAllPlacementTitles(id) {
    const p = placements.find(p => p.id === id);
    if (!p) return;
    
    const type = p.type.includes('CUSTOM:') ? p.type.replace('CUSTOM: ', '') : p.type;
    const section = $(`placement-section-${id}`);
    if (!section) return;
    
    section.querySelector('.placement-title span')?.textContent = type;
    
    section.querySelectorAll('.card-title').forEach(t => {
        if (t.textContent.includes('Colores para')) {
            t.textContent = `Colores para ${type}`;
        }
        if (t.textContent.includes('Imagen para')) {
            t.textContent = `Imagen para ${type}`;
        }
        if (t.textContent.includes('Condiciones para')) {
            t.textContent = `Condiciones para ${type}`;
        }
    });
    
    const seq = section.querySelector('h4');
    if (seq?.textContent.includes('Secuencia de')) {
        seq.textContent = `Secuencia de ${type}`;
    }
    
    updatePlacementsTabs();
}

// ========== RENDERIZADO HTML ==========
function renderPlacementHTML(p) {
    const container = $('placements-container');
    if (!container || $(`placement-section-${p.id}`)) return;
    
    const isCustom = p.type.includes('CUSTOM:');
    const type = isCustom ? p.type.replace('CUSTOM: ', '') : p.type;
    
    const html = `
        <div id="placement-section-${p.id}" class="placement-section" data-placement-id="${p.id}">
            <div class="placement-header">
                <div class="placement-title">
                    <i class="fas fa-map-marker-alt"></i> <span>${type}</span>
                </div>
                <div class="placement-actions">
                    <button class="btn btn-outline btn-sm" onclick="duplicatePlacement(${p.id})">
                        <i class="fas fa-copy"></i> Duplicar
                    </button>
                    ${placements.length > 1 ? `
                        <button class="btn btn-danger btn-sm" onclick="removePlacement(${p.id})">
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
                        <select class="form-control" onchange="updatePlacementType(${p.id}, this.value)">
                            ${['FRONT','BACK','SLEEVE','CHEST','TV. NUMBERS','SHOULDER','COLLAR','CUSTOM']
                                .map(t => `<option value="${t}" ${p.type === t || (t === 'CUSTOM' && isCustom) ? 'selected' : ''}>${t}</option>`)
                                .join('')}
                        </select>
                    </div>
                    
                    <!-- Custom name -->
                    <div id="custom-placement-input-${p.id}" style="display:${isCustom ? 'block' : 'none'}; margin-top:10px;">
                        <label class="form-label">NOMBRE DEL PLACEMENT:</label>
                        <input type="text" class="form-control" value="${isCustom ? type : ''}" 
                               oninput="updateCustomPlacement(${p.id}, this.value)">
                    </div>
                    
                    <!-- Imagen -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-image"></i> Imagen para ${type}</h3>
                        </div>
                        <div class="card-body">
                            <div class="file-upload-area" onclick="openImagePickerForPlacement(${p.id})">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>Haz clic para subir una imagen</p>
                                <p style="font-size:0.8rem;">Ctrl+V para pegar</p>
                            </div>
                            <div class="image-preview-container">
                                <img id="placement-image-preview-${p.id}" class="image-preview" style="display: none;">
                                <div class="image-actions" id="placement-image-actions-${p.id}" style="display:none;">
                                    <button class="btn btn-danger btn-sm" onclick="removePlacementImage(${p.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Condiciones -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-print"></i> Condiciones para ${type}</h3>
                        </div>
                        <div class="card-body">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">DETALLES DE UBICACIÓN:</label>
                                    <input type="text" class="form-control" value="${p.placementDetails}" 
                                           oninput="updatePlacementField(${p.id}, 'placementDetails', this.value)">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">DIMENSIONES:</label>
                                    <div style="display: flex; gap: 10px;">
                                        <input type="text" class="form-control" style="width:100px;" 
                                               placeholder="Ancho" value="${p.width}" 
                                               oninput="updatePlacementDimension(${p.id}, 'width', this.value)">
                                        <span style="color: var(--text-secondary);">X</span>
                                        <input type="text" class="form-control" style="width:100px;" 
                                               placeholder="Alto" value="${p.height}" 
                                               oninput="updatePlacementDimension(${p.id}, 'height', this.value)">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">TEMPERATURA:</label>
                                    <input type="text" class="form-control" value="${p.temp}" readonly>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">TIEMPO:</label>
                                    <input type="text" class="form-control" value="${p.time}" readonly>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">SPECIALTIES:</label>
                                    <input type="text" class="form-control" id="specialties-${p.id}" value="${p.specialties}" readonly>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Parámetros de Impresión -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-sliders-h"></i> Parámetros de Impresión</h3>
                        </div>
                        <div class="card-body">
                            <div class="form-grid">
                                ${[
                                    ['meshColor', 'Malla Colores'],
                                    ['meshWhite', 'Malla White Base'],
                                    ['meshBlocker', 'Malla Blocker'],
                                    ['durometer', 'Durómetro'],
                                    ['strokes', 'Strokes'],
                                    ['angle', 'Angle'],
                                    ['pressure', 'Pressure'],
                                    ['speed', 'Speed'],
                                    ['additives', 'Aditivos']
                                ].map(([field, label]) => `
                                    <div class="form-group">
                                        <label class="form-label">${label}:</label>
                                        <input type="text" class="form-control" value="${p[field] || ''}" 
                                               oninput="updatePlacementParam(${p.id}, '${field}', this.value)">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="placement-right-column">
                    <!-- Tipo de Tinta -->
                    <div class="form-group">
                        <label class="form-label">TIPO DE TINTA:</label>
                        <select class="form-control" onchange="updatePlacementInkType(${p.id}, this.value)">
                            <option value="WATER" ${p.inkType === 'WATER' ? 'selected' : ''}>Water-base</option>
                            <option value="PLASTISOL" ${p.inkType === 'PLASTISOL' ? 'selected' : ''}>Plastisol</option>
                            <option value="SILICONE" ${p.inkType === 'SILICONE' ? 'selected' : ''}>Silicone</option>
                        </select>
                    </div>
                    
                    <!-- Colores -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-palette"></i> Colores para ${type}</h3>
                        </div>
                        <div class="card-body">
                            <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
                                <button class="btn btn-danger btn-sm" onclick="addPlacementColorItem(${p.id}, 'BLOCKER')">
                                    <i class="fas fa-plus"></i> Blocker
                                </button>
                                <button class="btn btn-white-base btn-sm" onclick="addPlacementColorItem(${p.id}, 'WHITE_BASE')">
                                    <i class="fas fa-plus"></i> White Base
                                </button>
                                <button class="btn btn-primary btn-sm" onclick="addPlacementColorItem(${p.id}, 'COLOR')">
                                    <i class="fas fa-plus"></i> Color
                                </button>
                                <button class="btn btn-warning btn-sm" onclick="addPlacementColorItem(${p.id}, 'METALLIC')">
                                    <i class="fas fa-star"></i> Metálico
                                </button>
                            </div>
                            <div id="placement-colors-container-${p.id}" class="color-sequence"></div>
                        </div>
                    </div>
                    
                    <!-- Instrucciones Especiales -->
                    <div class="form-group">
                        <label class="form-label">INSTRUCCIONES ESPECIALES:</label>
                        <textarea class="form-control" rows="3" 
                                  oninput="updatePlacementField(${p.id}, 'specialInstructions', this.value)">${p.specialInstructions || ''}</textarea>
                    </div>
                    
                    <!-- Vista previa de colores -->
                    <div id="placement-colors-preview-${p.id}" class="color-legend"></div>
                    
                    <!-- Secuencia de Estaciones -->
                    <h4 style="margin:15px 0 10px;"><i class="fas fa-list-ol"></i> Secuencia de ${type}</h4>
                    <div id="placement-sequence-table-${p.id}"></div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML += html;
    
    renderPlacementColors(p.id);
    updatePlacementStations(p.id);
    updatePlacementColorsPreview(p.id);
    
    if (p.imageData) {
        const img = $(`placement-image-preview-${p.id}`);
        const act = $(`placement-image-actions-${p.id}`);
        if (img && act) {
            img.src = p.imageData;
            img.style.display = 'block';
            act.style.display = 'flex';
        }
    }
}

// ========== FUNCIONES DE ACTUALIZACIÓN DE CAMPOS ==========
function updatePlacementType(id, type) {
    const p = placements.find(p => p.id === id);
    if (!p) return;
    
    const custom = $(`custom-placement-input-${id}`);
    if (type === 'CUSTOM') {
        if (custom) custom.style.display = 'block';
        if (!p.type.startsWith('CUSTOM:')) p.type = 'CUSTOM:';
    } else {
        if (custom) custom.style.display = 'none';
        p.type = type;
    }
    updateAllPlacementTitles(id);
    showStatus(`✅ Tipo cambiado a ${type}`);
}

function updateCustomPlacement(id, name) {
    const p = placements.find(p => p.id === id);
    if (p && name.trim()) {
        p.type = `CUSTOM: ${name}`;
        updateAllPlacementTitles(id);
        showStatus(`✅ Placement personalizado: ${name}`);
    }
}

function updatePlacementInkType(id, inkType) {
    const p = placements.find(p => p.id === id);
    if (!p) return;
    
    p.inkType = inkType;
    const preset = getInkPresetSafe(inkType);
    
    p.temp = preset.temp;
    p.time = preset.time;
    
    const tempField = $(`temp-${id}`);
    const timeField = $(`time-${id}`);
    if (tempField) tempField.value = preset.temp;
    if (timeField) timeField.value = preset.time;
    
    updatePlacementStations(id);
    showStatus(`✅ Tinta: ${inkType}`);
}

function updatePlacementField(id, field, value) {
    const p = placements.find(p => p.id === id);
    if (p) p[field] = value;
}

function updatePlacementParam(id, param, value) {
    const p = placements.find(p => p.id === id);
    if (p) {
        p[param] = value;
        updatePlacementStations(id);
    }
}

function updatePlacementDimension(id, type, value) {
    const p = placements.find(p => p.id === id);
    if (p) {
        p[type] = value;
        p.dimensions = `SIZE: (W) ${p.width || '##'} X (H) ${p.height || '##'}`;
    }
}

// ========== GESTIÓN DE COLORES ==========
function addPlacementColorItem(id, colorType) {
    const p = placements.find(p => p.id === id);
    if (!p) return;
    
    const preset = getInkPresetSafe(p.inkType);
    const colorCount = p.colors.filter(c => c.type === 'COLOR' || c.type === 'METALLIC').length;
    
    let screenLetter = '';
    let initialVal = '';
    
    if (colorType === 'BLOCKER') {
        screenLetter = 'A';
        initialVal = preset.blocker.name;
    } else if (colorType === 'WHITE_BASE') {
        screenLetter = 'B';
        initialVal = preset.white.name;
    } else if (colorType === 'METALLIC') {
        screenLetter = String(colorCount + 1);
        initialVal = 'METALLIC GOLD';
    } else {
        screenLetter = String(colorCount + 1);
        initialVal = '';
    }
    
    p.colors.push({
        id: Date.now() + Math.random(),
        type: colorType,
        screenLetter: screenLetter,
        val: initialVal
    });
    
    renderPlacementColors(id);
    updatePlacementStations(id);
    updatePlacementColorsPreview(id);
    checkForSpecialtiesInColors(id);
    showStatus(`✅ ${colorType} agregado`);
}

function renderPlacementColors(id) {
    const p = placements.find(p => p.id === id);
    if (!p) return;
    
    const container = $(`placement-colors-container-${id}`);
    if (!container) return;
    
    if (!p.colors.length) {
        container.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fas fa-palette"></i> No hay colores</div>';
        return;
    }
    
    container.innerHTML = p.colors.map(c => {
        const badgeClass = {
            'BLOCKER': 'badge-blocker',
            'WHITE_BASE': 'badge-white',
            'METALLIC': 'badge-warning'
        }[c.type] || 'badge-color';
        
        const label = {
            'BLOCKER': 'BLOQUEADOR',
            'WHITE_BASE': 'WHITE BASE',
            'METALLIC': 'METÁLICO',
            'COLOR': 'COLOR'
        }[c.type];
        
        return `
            <div class="color-item">
                <span class="badge ${badgeClass}">${label}</span>
                <input type="text" style="width:60px; text-align:center;" value="${c.screenLetter}" 
                       class="form-control" oninput="updatePlacementScreenLetter(${id}, ${c.id}, this.value)">
                <input type="text" class="form-control" placeholder="Nombre de la tinta..." value="${c.val}" 
                       oninput="updatePlacementColorValue(${id}, ${c.id}, this.value)">
                <div class="color-preview" id="placement-color-preview-${id}-${c.id}"></div>
                <button class="btn btn-outline btn-sm" onclick="movePlacementColorItem(${id}, ${c.id}, -1)">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button class="btn btn-outline btn-sm" onclick="movePlacementColorItem(${id}, ${c.id}, 1)">
                    <i class="fas fa-arrow-down"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="removePlacementColorItem(${id}, ${c.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }).join('');
    
    p.colors.forEach(c => updatePlacementColorPreview(id, c.id));
}

function updatePlacementColorValue(id, colorId, value) {
    const p = placements.find(p => p.id === id);
    const c = p?.colors.find(c => c.id === colorId);
    if (c) {
        c.val = value;
        updatePlacementColorPreview(id, colorId);
        updatePlacementStations(id);
        updatePlacementColorsPreview(id);
        checkForSpecialtiesInColors(id);
    }
}

function updatePlacementScreenLetter(id, colorId, value) {
    const p = placements.find(p => p.id === id);
    const c = p?.colors.find(c => c.id === colorId);
    if (c) {
        c.screenLetter = value.toUpperCase();
        updatePlacementStations(id);
    }
}

function removePlacementColorItem(id, colorId) {
    const p = placements.find(p => p.id === id);
    if (p) {
        p.colors = p.colors.filter(c => c.id !== colorId);
        renderPlacementColors(id);
        updatePlacementStations(id);
        updatePlacementColorsPreview(id);
        checkForSpecialtiesInColors(id);
    }
}

function movePlacementColorItem(id, colorId, direction) {
    const p = placements.find(p => p.id === id);
    if (!p) return;
    
    const index = p.colors.findIndex(c => c.id === colorId);
    if (index === -1) return;
    
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= p.colors.length) return;
    
    [p.colors[index], p.colors[newIndex]] = [p.colors[newIndex], p.colors[index]];
    renderPlacementColors(id);
    updatePlacementStations(id);
    updatePlacementColorsPreview(id);
    checkForSpecialtiesInColors(id);
}

function updatePlacementColorPreview(id, colorId) {
    const p = placements.find(p => p.id === id);
    const c = p?.colors.find(c => c.id === colorId);
    const preview = $(`placement-color-preview-${id}-${colorId}`);
    if (!preview || !c) return;
    
    const name = (c.val || '').toUpperCase().trim();
    let hex = null;
    
    if (window.ColorConfig?.findColorHex) hex = window.ColorConfig.findColorHex(c.val);
    if (!hex && window.Utils?.getColorHex) hex = window.Utils.getColorHex(c.val);
    
    const basics = {
        'RED': '#FF0000', 'BLUE': '#0000FF', 'GREEN': '#00FF00',
        'BLACK': '#000000', 'WHITE': '#FFFFFF', 'GOLD': '#FFD700'
    };
    
    if (!hex) {
        for (const [key, val] of Object.entries(basics)) {
            if (name.includes(key)) { hex = val; break; }
        }
    }
    
    const hexMatch = name.match(/#([0-9A-F]{6})/i);
    if (!hex && hexMatch) hex = `#${hexMatch[1]}`;
    
    preview.style.background = hex || '#CCCCCC';
    preview.style.backgroundImage = hex ? 'none' : 'repeating-linear-gradient(45deg, #999, #999 2px, #CCC 2px, #CCC 4px)';
}

function updatePlacementColorsPreview(id) {
    const p = placements.find(p => p.id === id);
    const container = $(`placement-colors-preview-${id}`);
    if (!container || !p) return;
    
    const seen = new Set();
    const unique = p.colors
        .filter(c => c.type === 'COLOR' || c.type === 'METALLIC')
        .filter(c => {
            if (!c.val || seen.has(c.val)) return false;
            seen.add(c.val);
            return true;
        });
    
    if (!unique.length) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = `
        <div><strong>Leyenda de Colores:</strong></div>
        <div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:10px;">
            ${unique.map(c => {
                const hex = getColorHex(c.val) || '#ccc';
                return `
                    <div style="display:flex; align-items:center;">
                        <div style="background:${hex}; width:15px; height:15px; border:1px solid #666; margin-right:5px;"></div>
                        <span style="font-size:11px;">${c.screenLetter}: ${c.val}</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// ========== DETECCIÓN DE ESPECIALIDADES ==========
function checkForSpecialtiesInColors(id) {
    const p = placements.find(p => p.id === id);
    if (!p) return;
    
    const specialties = new Set();
    
    p.colors.forEach(c => {
        const val = (c.val || '').toUpperCase();
        if (val.includes('HD') || val.includes('HIGH DENSITY')) specialties.add('HIGH DENSITY');
        if (isMetallicColor(val)) specialties.add('METALLIC');
        if (val.includes('FOIL')) specialties.add('FOIL');
    });
    
    p.specialties = Array.from(specialties).join(', ');
    const field = $(`specialties-${id}`);
    if (field) field.value = p.specialties;
}

function isMetallicColor(name) {
    if (!name) return false;
    const upper = name.toUpperCase();
    if (upper.match(/(8[7-9][0-9]\s*C?)/i)) return true;
    const metals = ['871C', '872C', '873C', '874C', '875C', '876C', '877C', 'METALLIC', 'GOLD', 'SILVER'];
    return metals.some(m => upper.includes(m));
}

function getColorHex(name) {
    if (!name) return null;
    if (window.ColorConfig?.findColorHex) return window.ColorConfig.findColorHex(name);
    if (window.Utils?.getColorHex) return window.Utils.getColorHex(name);
    
    const basics = {
        'RED': '#FF0000', 'BLUE': '#0000FF', 'GREEN': '#00FF00',
        'BLACK': '#000000', 'WHITE': '#FFFFFF', 'GOLD': '#FFD700'
    };
    
    const upper = name.toUpperCase();
    for (const [key, hex] of Object.entries(basics)) {
        if (upper.includes(key)) return hex;
    }
    
    const match = name.match(/#([0-9A-F]{6})/i);
    return match ? `#${match[1]}` : null;
}

// ========== SECUENCIA DE IMPRESIÓN ==========
function updatePlacementStations(id, returnOnly = false) {
    const p = placements.find(p => p.id === id);
    if (!p) return returnOnly ? [] : null;
    
    const preset = getInkPresetSafe(p.inkType);
    const stations = [];
    let st = 1;
    
    p.colors.forEach((c, idx) => {
        const base = {
            screenLetter: c.screenLetter || '',
            screenCombined: c.val || '---',
            mesh: p.meshColor || preset.color.mesh,
            strokes: p.strokes || preset.color.strokes,
            duro: p.durometer || preset.color.durometer,
            angle: p.angle || preset.color.angle,
            pressure: p.pressure || preset.color.pressure,
            add: p.additives || preset.color.additives
        };
        
        if (c.type === 'BLOCKER') {
            base.mesh = p.meshBlocker || preset.blocker.mesh1;
            base.add = p.additives || preset.blocker.additives;
            base.screenCombined = preset.blocker.name;
        } else if (c.type === 'WHITE_BASE') {
            base.mesh = p.meshWhite || preset.white.mesh1;
            base.add = p.additives || preset.white.additives;
            base.screenCombined = preset.white.name;
        } else if (c.type === 'METALLIC') {
            base.mesh = '110/64';
            base.strokes = '1';
            base.duro = '70';
            base.add = 'Catalizador especial';
        }
        
        stations.push({ st: st++, ...base });
        
        if (idx < p.colors.length - 1) {
            stations.push({ st: st++, screenCombined: 'FLASH', mesh: '-', strokes: '-', duro: '-', angle: '-', pressure: '-', add: '' });
            stations.push({ st: st++, screenCombined: 'COOL', mesh: '-', strokes: '-', duro: '-', angle: '-', pressure: '-', add: '' });
        }
    });
    
    if (returnOnly) return stations;
    renderPlacementStationsTable(id, stations);
}

function renderPlacementStationsTable(id, data) {
    const div = $(`placement-sequence-table-${id}`);
    if (!div) return;
    
    if (!data.length) {
        div.innerHTML = '<p style="text-align:center; padding:15px;">Agrega colores para generar la secuencia.</p>';
        return;
    }
    
    div.innerHTML = `
        <table class="sequence-table">
            <thead>
                <tr>
                    <th>Est</th><th>Scr.</th><th>Screen (Tinta/Proceso)</th>
                    <th>Aditivos</th><th>Malla</th><th>Strokes</th>
                    <th>Angle</th><th>Pressure</th><th>Duro</th>
                </tr>
            </thead>
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
                        <td>${row.duro}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ========== GESTIÓN DE IMÁGENES ==========
function openImagePickerForPlacement(id) {
    currentPlacementId = id;
    $('placementImageInput')?.click();
}

function removePlacementImage(id) {
    const p = placements.find(p => p.id === id);
    if (!p) return;
    
    const img = $(`placement-image-preview-${id}`);
    const act = $(`placement-image-actions-${id}`);
    
    if (img) { img.src = ''; img.style.display = 'none'; }
    if (act) act.style.display = 'none';
    
    p.imageData = null;
    showStatus('🗑️ Imagen eliminada');
}

function setupPasteHandler() {
    document.addEventListener('paste', e => {
        const active = document.querySelector('.placement-section.active');
        if (!active) return;
        
        const id = parseInt(active.dataset.placementId);
        const p = placements.find(p => p.id === id);
        if (!p) return;
        
        if (e.target.closest('input, textarea, [contenteditable]')) return;
        
        for (let item of e.clipboardData.items) {
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = ev => {
                    p.imageData = ev.target.result;
                    const img = $(`placement-image-preview-${id}`);
                    const act = $(`placement-image-actions-${id}`);
                    if (img && act) {
                        img.src = ev.target.result;
                        img.style.display = 'block';
                        act.style.display = 'flex';
                    }
                    showStatus(`✅ Imagen pegada en ${p.type}`);
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
        
        placements.forEach(p => {
            p.specialties = $(`specialties-${p.id}`)?.value || p.specialties;
            p.specialInstructions = $(`special-instructions-${p.id}`)?.value || p.specialInstructions;
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
    }
}

function loadSpecData(data) {
    // Campos generales
    const fields = ['customer', 'style', 'folder-num', 'colorway', 'season', 'pattern', 'po', 'sample-type', 'name-team', 'gender', 'designer'];
    fields.forEach(id => setInputValue(id, data[id.replace('-num', '')] || ''));
    
    // Limpiar placements actuales
    $('placements-container').innerHTML = '';
    placements = [];
    
    // Cargar placements
    if (data.placements?.length) {
        data.placements.forEach((p, i) => {
            const placement = { ...p, id: i === 0 ? 1 : Date.now() + i };
            placements.push(placement);
            renderPlacementHTML(placement);
            
            if (placement.imageData) {
                const img = $(`placement-image-preview-${placement.id}`);
                const act = $(`placement-image-actions-${placement.id}`);
                if (img && act) {
                    img.src = placement.imageData;
                    img.style.display = 'block';
                    act.style.display = 'flex';
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
    
    $('total-specs').textContent = specs.length;
    
    let lastSpec = null, lastDate = null;
    specs.forEach(key => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            const date = new Date(data.savedAt || 0);
            if (!lastDate || date > lastDate) { lastDate = date; lastSpec = data; }
        } catch (e) {}
    });
    
    const todayEl = $('today-specs');
    if (lastSpec) {
        todayEl.innerHTML = `
            <div style="font-size:0.9rem;">Última Spec:</div>
            <div style="font-size:1.2rem; font-weight:bold; color:var(--primary);">${lastSpec.style || 'Sin nombre'}</div>
            <div style="font-size:0.8rem;">${lastDate.toLocaleDateString()}</div>
        `;
    } else {
        todayEl.innerHTML = '<div style="font-size:0.9rem;">Sin specs creadas</div>';
    }
    
    const active = specs.filter(k => {
        try { return JSON.parse(localStorage.getItem(k)).placements?.length > 0; }
        catch { return false; }
    }).length;
    $('active-projects').textContent = active;
    
    const totalPlacements = specs.reduce((sum, k) => {
        try { return sum + (JSON.parse(localStorage.getItem(k)).placements?.length || 0); }
        catch { return sum; }
    }, 0);
    
    $('completion-rate').innerHTML = `
        <div style="font-size:0.9rem;">Placements totales:</div>
        <div style="font-size:1.5rem; font-weight:bold; color:var(--primary);">${totalPlacements}</div>
    `;
}

// ========== LISTA DE SPECS GUARDADAS ==========
function loadSavedSpecsList() {
    const list = $('saved-specs-list');
    const search = $('saved-specs-search')?.value.toUpperCase().trim() || '';
    const specs = Object.keys(localStorage).filter(k => k.startsWith('spec_'));
    
    if (!specs.length) {
        list.innerHTML = '<p style="text-align:center; padding:30px;"><i class="fas fa-database" style="font-size:2rem; display:block;"></i>No hay specs guardadas.</p>';
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
    if (confirm('⚠️ ¿Eliminar TODAS las specs?')) {
        Object.keys(localStorage).forEach(k => { if (k.startsWith('spec_')) localStorage.removeItem(k); });
        loadSavedSpecsList();
        updateDashboard();
        showStatus('🗑️ Todas las specs eliminadas');
    }
}

// ========== LIMPIEZA ==========
function clearForm() {
    if (!confirm('⚠️ ¿Limpiar todo el formulario?')) return;
    
    $$('input:not(#folder-num), textarea, select').forEach(i => {
        if (i.type !== 'button' && i.type !== 'submit') i.value = '';
    });
    setInputValue('designer', '');
    
    placements = [];
    $('placements-container').innerHTML = '';
    $('placements-tabs').innerHTML = '';
    
    initializePlacements();
    $('logoCliente')?.style.display = 'none';
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
        XLSX.utils.book_append_sheet(XLSX.utils.book_new(), ws, 'Hoja1');
        XLSX.writeFile(XLSX.utils.book_new(), `Calculadora_${data.style || 'Spec'}_${data.folder || '00000'}.xlsx`);
        showStatus('📊 Excel generado');
    } catch (error) {
        console.error('Error en Excel:', error);
        showStatus('❌ Error al generar Excel', 'error');
    }
}

// ========== EXPORTACIÓN A PDF ==========
async function exportPDF() {
    try {
        showStatus('📄 Generando PDF...', 'warning');
        const data = collectData();
        
        if (window.generateProfessionalPDF) {
            try {
                const pdfBlob = await window.generateProfessionalPDF(data);
                downloadPDF(pdfBlob, data);
                return;
            } catch (e) {
                console.warn('PDF profesional falló, usando legacy:', e);
            }
        }
        
        const pdfBlob = await generateLegacyPDF(data);
        downloadPDF(pdfBlob, data);
        
    } catch (error) {
        console.error('Error PDF:', error);
        showStatus('❌ Error al generar PDF', 'error');
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

async function generateLegacyPDF(data) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'letter');
    const pageW = pdf.internal.pageSize.getWidth();
    
    for (let i = 0; i < data.placements.length; i++) {
        if (i > 0) pdf.addPage();
        
        const p = data.placements[i];
        const type = p.type.includes('CUSTOM:') ? p.type.replace('CUSTOM: ', '') : p.type;
        let y = 20;
        
        // Header
        pdf.setFillColor(162, 43, 42);
        pdf.rect(0, 0, pageW, 28, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.text('TECHNICAL SPEC MANAGER', 10, 15);
        pdf.setFontSize(12);
        pdf.text(`Placement ${i + 1}/${data.placements.length}: ${type}`, 10, 23);
        
        // Info general
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
        
        // Colores
        if (p.colors?.length) {
            pdf.setFillColor(240, 240, 240);
            pdf.rect(10, y, pageW - 20, 8, 'F');
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
        
        // Curado
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
        pdf.text(`Generado: ${new Date().toLocaleString()}`, 10, pdf.internal.pageSize.getHeight() - 10);
        pdf.text('TEGRA Spec Manager', pageW - 40, pdf.internal.pageSize.getHeight() - 10);
    }
    
    return pdf.output('blob');
}

// ========== ERROR LOG ==========
function loadErrorLog() {
    const container = $('error-log-content');
    if (!container) return;
    
    const errors = window.errorHandler?.getErrors() || [];
    
    if (!errors.length) {
        container.innerHTML = '<p style="text-align:center; padding:30px;"><i class="fas fa-check-circle" style="font-size:2rem;"></i>No hay errores registrados.</p>';
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

// ========== CARGA DE ARCHIVOS ==========
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
    
    if (extracted.customer) setInputValue('customer', extracted.customer);
    if (extracted.style) setInputValue('style', extracted.style);
    if (extracted.colorway) setInputValue('colorway', extracted.colorway);
    if (extracted.season) setInputValue('season', extracted.season);
    if (extracted.pattern) setInputValue('pattern', extracted.pattern);
    if (extracted.po) setInputValue('po', extracted.po);
    if (extracted.sample) setInputValue('sample-type', extracted.sample);
    if (extracted.team) setInputValue('name-team', extracted.team);
    if (extracted.gender) setInputValue('gender', extracted.gender);
    
    updateClientLogo();
    showStatus(`✅ "${sheetName}" procesado`);
}

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
                    const imgEl = $(`placement-image-preview-${placements[placementIdx].id}`);
                    const act = $(`placement-image-actions-${placements[placementIdx].id}`);
                    if (imgEl && act) {
                        imgEl.src = img.data;
                        imgEl.style.display = 'block';
                        act.style.display = 'flex';
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

// ========== PROYECTOS ZIP ==========
async function downloadProjectZip() {
    try {
        if (typeof JSZip === 'undefined') {
            showStatus('❌ JSZip no está cargado', 'error');
            return;
        }
        
        const data = collectData();
        const style = data.style || 'SinEstilo';
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
        const zip = new JSZip();
        
        zip.file(`${style}.json`, JSON.stringify(data, null, 2));
        
        try {
            const pdfBlob = await generateLegacyPDF(data);
            zip.file(`${style}.pdf`, pdfBlob);
        } catch (pdfError) {
            console.warn('No se pudo generar PDF para ZIP:', pdfError);
        }
        
        data.placements.forEach((p, i) => {
            if (p.imageData?.startsWith('data:')) {
                const blob = dataURLToBlob(p.imageData);
                const type = p.type.includes('CUSTOM:') ? p.type.replace('CUSTOM: ', '') : p.type;
                zip.file(`placement${i + 1}_${type}.jpg`, blob);
            }
        });
        
        const readme = `PROYECTO TEGRA SPEC MANAGER\n\nCliente: ${data.customer}\nEstilo: ${data.style}\nPlacements: ${data.placements.length}\nGenerado: ${new Date().toLocaleString()}`;
        zip.file('LEEME.txt', readme);
        
        const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
        saveAs(zipBlob, `TegraSpec_${style}_${timestamp}.zip`);
        showStatus('📦 ZIP descargado');
        
    } catch (error) {
        console.error('Error al generar ZIP:', error);
        showStatus('❌ Error al generar ZIP', 'error');
    }
}

function dataURLToBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
    return new Blob([u8arr], { type: mime });
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    updateDashboard();
    loadSavedSpecsList();
    setupPasteHandler();
    loadThemePreference();
    
    $('themeToggle')?.addEventListener('click', toggleTheme);
    setInterval(updateDateTime, 60000);
    
    setTimeout(() => {
        if (placements.length === 0) initializePlacements();
    }, 100);
});

// ========== EXPORTAR FUNCIONES AL ÁMBITO GLOBAL ==========
window.showTab = showTab;
window.loadSavedSpecsList = loadSavedSpecsList;
window.clearErrorLog = clearErrorLog;
window.clearAllSpecs = clearAllSpecs;
window.addNewPlacement = addNewPlacement;
window.saveCurrentSpec = saveCurrentSpec;
window.clearForm = clearForm;
window.exportToExcel = exportToExcel;
window.exportPDF = exportPDF;
window.downloadProjectZip = downloadProjectZip;
window.updateClientLogo = updateClientLogo;
window.handleGearForSportLogic = handleGearForSportLogic;

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

window.downloadSingleSpec = downloadSingleSpec;
window.deleteSpec = deleteSpec;
window.loadSpecData = loadSpecData;

console.log('✅ app.js cargado correctamente - Funciones exportadas:', Object.keys(window).filter(k => k.includes('Placement') || k.includes('show') || k.includes('export')).length);
