// ========== app.js - VERSIÓN ULTRA SIMPLIFICADA ==========
// ========== VARIABLES GLOBALES ==========
let placements = [];
let currentPlacementId = 1;
let isDarkMode = true;

// ========== FUNCIONES AUXILIARES ==========
function $(id) { return document.getElementById(id); }
function $$(sel) { return document.querySelectorAll(sel); }

function showStatus(msg, type = 'success') {
    const el = $('statusMessage');
    if (!el) return;
    el.textContent = msg;
    el.className = `status-message status-${type}`;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 4000);
}

function getVal(id, fallback = '') {
    const el = $(id);
    return el ? el.value : fallback;
}

function setVal(id, val) {
    const el = $(id);
    if (el) el.value = val || '';
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
    
    if (tabName === 'saved-specs') loadSavedSpecsList();
    if (tabName === 'dashboard') updateDashboard();
    if (tabName === 'error-log') loadErrorLog();
    if (tabName === 'spec-creator' && placements.length === 0) initializePlacements();
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
    showStatus(isDarkMode ? '🌙 Modo oscuro' : '☀️ Modo claro');
}

function loadThemePreference() {
    const saved = localStorage.getItem('tegraspec-theme');
    if (saved === 'light') {
        isDarkMode = false;
        document.body.classList.add('light-mode');
        const btn = $('themeToggle');
        if (btn) btn.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
    }
}

// ========== LOGO CLIENTE ==========
function updateClientLogo() {
    const customer = getVal('customer').toUpperCase();
    const logo = $('logoCliente');
    if (!logo) return;
    
    if (customer.includes('NIKE')) {
        logo.src = 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Nike-Logotipo-PNG-Photo.png';
        logo.style.display = 'block';
    } else if (customer.includes('FANATICS')) {
        logo.src = 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Fanatics_company_logo.svg.png';
        logo.style.display = 'block';
    } else {
        logo.style.display = 'none';
    }
}

// ========== GESTIÓN DE PLACEMENTS ==========
function initializePlacements() {
    placements = [];
    addNewPlacement('FRONT', true);
}

function addNewPlacement(type = null, isFirst = false) {
    const id = isFirst ? 1 : Date.now();
    const placement = {
        id: id,
        type: type || 'FRONT',
        imageData: null,
        colors: [],
        placementDetails: '#.#" FROM COLLAR SEAM',
        specialInstructions: '',
        inkType: 'WATER',
        width: '',
        height: '',
        temp: '320 °F',
        time: '1:40 min',
        specialties: '',
        meshColor: '157/48',
        meshWhite: '198/40',
        meshBlocker: '122/55',
        durometer: '70',
        strokes: '2',
        angle: '15',
        pressure: '40',
        speed: '35',
        additives: '3% cross-linker'
    };
    
    if (isFirst) {
        placements = [placement];
    } else {
        placements.push(placement);
        renderPlacementHTML(placement);
        updateTabs();
        showPlacement(id);
    }
    return id;
}

function updateTabs() {
    const container = $('placements-tabs');
    if (!container) return;
    
    container.innerHTML = placements.map(p => {
        const type = p.type.includes('CUSTOM:') ? p.type.replace('CUSTOM: ', '') : p.type;
        const active = p.id === currentPlacementId ? 'active' : '';
        const remove = placements.length > 1 ? `<span class="remove-tab" onclick="event.stopPropagation(); removePlacement(${p.id})">&times;</span>` : '';
        
        return `<div class="placement-tab ${active}" data-placement-id="${p.id}" onclick="showPlacement(${p.id})">
            <i class="fas fa-tshirt"></i> ${type.substring(0, 15)}${remove}
        </div>`;
    }).join('');
}

function showPlacement(id) {
    $$('.placement-section').forEach(s => s.classList.remove('active'));
    $(`placement-section-${id}`)?.classList.add('active');
    $$('.placement-tab').forEach(t => t.classList.toggle('active', parseInt(t.dataset.placementId) === id));
    currentPlacementId = id;
}

function removePlacement(id) {
    if (placements.length <= 1) return showStatus('⚠️ No puedes eliminar el único placement', 'warning');
    if (!confirm('¿Eliminar este placement?')) return;
    
    placements = placements.filter(p => p.id !== id);
    $(`placement-section-${id}`)?.remove();
    updateTabs();
    
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
    updateTabs();
    showPlacement(dup.id);
    showStatus('✅ Placement duplicado');
}

// ========== RENDERIZADO BÁSICO ==========
function renderPlacementHTML(p) {
    const container = $('placements-container');
    if (!container || $(`placement-section-${p.id}`)) return;
    
    const isCustom = p.type.includes('CUSTOM:');
    const type = isCustom ? p.type.replace('CUSTOM: ', '') : p.type;
    
    container.innerHTML += `
        <div id="placement-section-${p.id}" class="placement-section" data-placement-id="${p.id}">
            <div class="placement-header">
                <div class="placement-title"><i class="fas fa-map-marker-alt"></i> <span>${type}</span></div>
                <div class="placement-actions">
                    <button class="btn btn-outline btn-sm" onclick="duplicatePlacement(${p.id})"><i class="fas fa-copy"></i> Duplicar</button>
                    ${placements.length > 1 ? `<button class="btn btn-danger btn-sm" onclick="removePlacement(${p.id})"><i class="fas fa-trash"></i> Eliminar</button>` : ''}
                </div>
            </div>
            
            <div class="placement-grid">
                <div class="placement-left-column">
                    <!-- Tipo -->
                    <div class="form-group">
                        <label>TIPO DE PLACEMENT:</label>
                        <select class="form-control" onchange="updatePlacementType(${p.id}, this.value)">
                            ${['FRONT','BACK','SLEEVE','CHEST','CUSTOM'].map(t => 
                                `<option value="${t}" ${p.type === t || (t === 'CUSTOM' && isCustom) ? 'selected' : ''}>${t}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <!-- Custom name -->
                    <div id="custom-input-${p.id}" style="display:${isCustom ? 'block' : 'none'}; margin-top:10px;">
                        <label>NOMBRE:</label>
                        <input type="text" class="form-control" value="${isCustom ? type : ''}" oninput="updateCustomPlacement(${p.id}, this.value)">
                    </div>
                    
                    <!-- Imagen -->
                    <div class="card">
                        <div class="card-header"><h3 class="card-title"><i class="fas fa-image"></i> Imagen</h3></div>
                        <div class="card-body">
                            <div class="file-upload-area" onclick="openImagePickerForPlacement(${p.id})">
                                <i class="fas fa-cloud-upload-alt"></i><p>Subir imagen</p>
                            </div>
                            <div class="image-preview-container">
                                <img id="img-preview-${p.id}" class="image-preview" style="display: none;">
                                <div class="image-actions" id="img-actions-${p.id}" style="display:none;">
                                    <button class="btn btn-danger btn-sm" onclick="removePlacementImage(${p.id})"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Condiciones -->
                    <div class="card">
                        <div class="card-header"><h3 class="card-title">Condiciones</h3></div>
                        <div class="card-body">
                            <div class="form-group">
                                <label>UBICACIÓN:</label>
                                <input type="text" class="form-control" value="${p.placementDetails}" oninput="p.placementDetails=this.value">
                            </div>
                            <div class="form-group">
                                <label>DIMENSIONES:</label>
                                <div style="display:flex; gap:10px;">
                                    <input type="text" class="form-control" style="width:100px;" placeholder="Ancho" value="${p.width}" oninput="p.width=this.value; p.dimensions='SIZE: (W) '+p.width+' X (H) '+p.height">
                                    <span>X</span>
                                    <input type="text" class="form-control" style="width:100px;" placeholder="Alto" value="${p.height}" oninput="p.height=this.value; p.dimensions='SIZE: (W) '+p.width+' X (H) '+p.height">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Tipo de Tinta -->
                    <div class="form-group">
                        <label>TIPO DE TINTA:</label>
                        <select class="form-control" onchange="p.inkType=this.value">
                            <option value="WATER" ${p.inkType==='WATER'?'selected':''}>Water-base</option>
                            <option value="PLASTISOL" ${p.inkType==='PLASTISOL'?'selected':''}>Plastisol</option>
                        </select>
                    </div>
                </div>
                
                <div class="placement-right-column">
                    <!-- Colores -->
                    <div class="card">
                        <div class="card-header"><h3 class="card-title">Colores</h3></div>
                        <div class="card-body">
                            <div style="margin-bottom:10px;">
                                <button class="btn btn-primary btn-sm" onclick="addColor(${p.id})"><i class="fas fa-plus"></i> Agregar Color</button>
                            </div>
                            <div id="colors-${p.id}"></div>
                        </div>
                    </div>
                    
                    <!-- Instrucciones -->
                    <div class="form-group">
                        <label>INSTRUCCIONES:</label>
                        <textarea class="form-control" rows="3" oninput="p.specialInstructions=this.value">${p.specialInstructions || ''}</textarea>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    renderColors(p.id);
    
    if (p.imageData) {
        const img = $(`img-preview-${p.id}`);
        const act = $(`img-actions-${p.id}`);
        if (img && act) {
            img.src = p.imageData;
            img.style.display = 'block';
            act.style.display = 'flex';
        }
    }
}

// ========== COLORES ==========
function addColor(id) {
    const p = placements.find(p => p.id === id);
    if (!p) return;
    
    p.colors.push({
        id: Date.now() + Math.random(),
        screenLetter: String(p.colors.length + 1),
        val: ''
    });
    
    renderColors(id);
}

function renderColors(id) {
    const p = placements.find(p => p.id === id);
    const container = $(`colors-${id}`);
    if (!container || !p) return;
    
    if (!p.colors.length) {
        container.innerHTML = '<p class="muted">No hay colores</p>';
        return;
    }
    
    container.innerHTML = p.colors.map(c => `
        <div class="color-item" style="display:flex; gap:5px; margin-bottom:5px;">
            <input type="text" style="width:40px;" value="${c.screenLetter}" oninput="c.screenLetter=this.value">
            <input type="text" class="form-control" value="${c.val}" oninput="c.val=this.value">
            <button class="btn btn-danger btn-sm" onclick="removeColor(${id}, ${c.id})"><i class="fas fa-times"></i></button>
        </div>
    `).join('');
}

function removeColor(id, colorId) {
    const p = placements.find(p => p.id === id);
    if (p) {
        p.colors = p.colors.filter(c => c.id !== colorId);
        renderColors(id);
    }
}

// ========== TIPOS Y CUSTOM ==========
function updatePlacementType(id, type) {
    const p = placements.find(p => p.id === id);
    if (!p) return;
    
    const custom = $(`custom-input-${id}`);
    if (type === 'CUSTOM') {
        if (custom) custom.style.display = 'block';
    } else {
        if (custom) custom.style.display = 'none';
        p.type = type;
    }
    updateTabs();
}

function updateCustomPlacement(id, name) {
    const p = placements.find(p => p.id === id);
    if (p && name.trim()) {
        p.type = `CUSTOM: ${name}`;
        updateTabs();
    }
}

// ========== IMÁGENES ==========
function openImagePickerForPlacement(id) {
    currentPlacementId = id;
    $('placementImageInput')?.click();
}

function removePlacementImage(id) {
    const p = placements.find(p => p.id === id);
    if (!p) return;
    
    const img = $(`img-preview-${id}`);
    const act = $(`img-actions-${id}`);
    
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
        if (!p || e.target.closest('input, textarea')) return;
        
        for (let item of e.clipboardData.items) {
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = ev => {
                    p.imageData = ev.target.result;
                    const img = $(`img-preview-${id}`);
                    const act = $(`img-actions-${id}`);
                    if (img && act) {
                        img.src = ev.target.result;
                        img.style.display = 'block';
                        act.style.display = 'flex';
                    }
                    showStatus('✅ Imagen pegada');
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
    return {
        customer: getVal('customer'),
        style: getVal('style'),
        folder: getVal('folder-num'),
        colorway: getVal('colorway'),
        season: getVal('season'),
        po: getVal('po'),
        sampleType: getVal('sample-type'),
        nameTeam: getVal('name-team'),
        gender: getVal('gender'),
        designer: getVal('designer'),
        placements: placements.map(p => ({
            type: p.type,
            imageData: p.imageData,
            colors: p.colors,
            placementDetails: p.placementDetails,
            width: p.width,
            height: p.height,
            specialInstructions: p.specialInstructions,
            inkType: p.inkType
        }))
    };
}

// ========== GUARDADO ==========
function saveCurrentSpec() {
    try {
        const data = collectData();
        const key = `spec_${data.style || 'SinEstilo'}_${Date.now()}`;
        data.savedAt = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify(data));
        loadSavedSpecsList();
        updateDashboard();
        showStatus('✅ Spec guardada');
    } catch (e) {
        showStatus('❌ Error al guardar', 'error');
    }
}

function loadSpecData(data) {
    setVal('customer', data.customer);
    setVal('style', data.style);
    setVal('folder-num', data.folder);
    setVal('colorway', data.colorway);
    setVal('season', data.season);
    setVal('po', data.po);
    setVal('sample-type', data.sampleType);
    setVal('name-team', data.nameTeam);
    setVal('gender', data.gender);
    setVal('designer', data.designer);
    
    $('placements-container').innerHTML = '';
    placements = [];
    
    if (data.placements?.length) {
        data.placements.forEach((p, i) => {
            const placement = { ...p, id: i === 0 ? 1 : Date.now() + i };
            placements.push(placement);
            renderPlacementHTML(placement);
        });
    } else {
        initializePlacements();
    }
    
    updateTabs();
    showPlacement(1);
    updateClientLogo();
    showTab('spec-creator');
    showStatus('📂 Spec cargada');
}

// ========== DASHBOARD ==========
function updateDashboard() {
    const specs = Object.keys(localStorage).filter(k => k.startsWith('spec_'));
    $('total-specs').textContent = specs.length;
    $('active-projects').textContent = specs.length;
}

// ========== SPECS GUARDADAS ==========
function loadSavedSpecsList() {
    const list = $('saved-specs-list');
    const specs = Object.keys(localStorage).filter(k => k.startsWith('spec_'));
    
    if (!specs.length) {
        list.innerHTML = '<p style="text-align:center;">No hay specs guardadas</p>';
        return;
    }
    
    list.innerHTML = specs.map(key => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            return `
                <div style="padding:10px; border-bottom:1px solid #ccc;">
                    <div><strong>${data.style || 'N/A'}</strong> - ${data.customer || 'N/A'}</div>
                    <div style="display:flex; gap:5px; margin-top:5px;">
                        <button class="btn btn-primary btn-sm" onclick='loadSpecData(${JSON.stringify(data)})'>Cargar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteSpec('${key}')">Eliminar</button>
                    </div>
                </div>
            `;
        } catch (e) {
            return '';
        }
    }).join('');
}

function deleteSpec(key) {
    if (confirm('¿Eliminar?')) {
        localStorage.removeItem(key);
        loadSavedSpecsList();
        updateDashboard();
    }
}

function clearAllSpecs() {
    if (confirm('¿Eliminar TODAS?')) {
        Object.keys(localStorage).forEach(k => {
            if (k.startsWith('spec_')) localStorage.removeItem(k);
        });
        loadSavedSpecsList();
        updateDashboard();
    }
}

// ========== EXPORTACIÓN ==========
function exportPDF() {
    showStatus('📄 Generando PDF simple...', 'warning');
    setTimeout(() => {
        alert('PDF generado (simulado)');
        showStatus('✅ PDF simulado');
    }, 1000);
}

function exportToExcel() {
    showStatus('📊 Excel generado (simulado)');
}

function downloadProjectZip() {
    showStatus('📦 ZIP generado (simulado)');
}

// ========== ERROR LOG ==========
function loadErrorLog() {
    const container = $('error-log-content');
    if (container) {
        container.innerHTML = '<p>Log de errores vacío</p>';
    }
}

function clearErrorLog() {
    loadErrorLog();
    showStatus('🗑️ Log limpiado');
}

function clearForm() {
    if (!confirm('¿Limpiar formulario?')) return;
    $$('input, textarea, select').forEach(i => {
        if (i.type !== 'button' && i.type !== 'submit') i.value = '';
    });
    placements = [];
    $('placements-container').innerHTML = '';
    $('placements-tabs').innerHTML = '';
    initializePlacements();
    showStatus('🧹 Formulario limpiado');
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    loadSavedSpecsList();
    setupPasteHandler();
    loadThemePreference();
    
    $('themeToggle')?.addEventListener('click', toggleTheme);
    
    setTimeout(() => {
        if (placements.length === 0) initializePlacements();
    }, 100);
});

// ========== INPUT FILE HANDLER ==========
document.getElementById('excelFile')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                loadSpecData(JSON.parse(ev.target.result));
            } catch (err) {
                showStatus('❌ Error leyendo JSON', 'error');
            }
        };
        reader.readAsText(file);
    }
    e.target.value = '';
});

document.getElementById('placementImageInput')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file || !currentPlacementId) return;
    
    const p = placements.find(p => p.id === currentPlacementId);
    if (!p) return;
    
    const reader = new FileReader();
    reader.onload = ev => {
        p.imageData = ev.target.result;
        const img = $(`img-preview-${currentPlacementId}`);
        const act = $(`img-actions-${currentPlacementId}`);
        if (img && act) {
            img.src = ev.target.result;
            img.style.display = 'block';
            act.style.display = 'flex';
        }
        showStatus('✅ Imagen cargada');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
});

// ========== EXPORTAR FUNCIONES GLOBALES ==========
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

window.removePlacement = removePlacement;
window.duplicatePlacement = duplicatePlacement;
window.showPlacement = showPlacement;
window.updatePlacementType = updatePlacementType;
window.updateCustomPlacement = updateCustomPlacement;
window.openImagePickerForPlacement = openImagePickerForPlacement;
window.removePlacementImage = removePlacementImage;
window.addColor = addColor;
window.removeColor = removeColor;

console.log('✅ app.js cargado - Versión ultra simplificada');
