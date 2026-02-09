// =================================================================================
// TEGRA SPEC MANAGER - APP.JS (REFACTORIZADO)
// Descripción: Script principal que orquesta la interfaz de usuario, eventos y lógica de negocio.
// Versión: 4.0 (Compatibilidad y Robustez)
// =================================================================================

// ========== INICIALIZACIÓN DE LA APLICACIÓN ==========

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ [App] DOM completamente cargado y parseado.');
    // Espera a que la configuración se cargue antes de inicializar
    document.addEventListener('config-loaded', initializeApplication);
});

function initializeApplication() {
    console.log('🚀 [App] ¡Configuración recibida! Inicializando la aplicación principal...');
    setupEventListeners();
    updateDateTime();
    setInterval(updateDateTime, 60000);
    showTab('dashboard');
    console.log('✅ [App] Aplicación inicializada y lista para usarse.');
}

// ========== CONFIGURACIÓN DE EVENTOS ==========

function setupEventListeners() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => showTab(tab.dataset.tab));
    });
    document.getElementById('excelFile').addEventListener('change', handleFileSelect, false);
    document.getElementById('customer').addEventListener('input', () => {
        updateClientLogo();
        handleGearForSportLogic();
    });
    document.getElementById('style').addEventListener('input', handleGearForSportLogic);
    document.getElementById('po').addEventListener('input', handleGearForSportLogic);
    document.getElementById('spec-date').valueAsDate = new Date();
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // ======== SELECCIÓN POR ID (ROBUSTO) ========
    document.getElementById('add-placement-btn').addEventListener('click', () => addNewPlacement());
    document.getElementById('export-pdf-btn').addEventListener('click', exportPDF);
    document.getElementById('export-excel-btn').addEventListener('click', exportToExcel);
    document.getElementById('clear-form-btn').addEventListener('click', clearForm);
    document.getElementById('download-zip-btn').addEventListener('click', downloadProjectZip);

    console.log('🎧 [App] Listeners de eventos configurados.');
}

// ========== LÓGICA DE NEGOCIO Y DATOS ==========

function getGfsTeamName(style, po) {
    const teamMap = window.AppConfig.gfsMappings?.team_map;
    if (!teamMap) return null;
    if (teamMap[style]) return teamMap[style];
    if (teamMap[po]) return teamMap[po];
    const styleMatch = style.match(/^UM\d{4}-([A-Z0-9]{3,4})$/);
    if (styleMatch && styleMatch[1] && teamMap[styleMatch[1]]) {
        return teamMap[styleMatch[1]];
    }
    return null;
}

function handleGearForSportLogic() {
    const customer = document.getElementById('customer').value.toUpperCase();
    if (customer !== 'GEAR FOR SPORT') return;

    const style = document.getElementById('style').value.trim().toUpperCase();
    const po = document.getElementById('po').value.trim().toUpperCase();
    const nameTeamInput = document.getElementById('name-team');

    let teamName = getGfsTeamName(style, po);
    if (!teamName) {
        let teamCode = '';
        if (style.startsWith('N')) { // NCAA
            teamCode = style.substring(1, 4);
        } else if (po.startsWith('PO')) { // Pro league
            teamCode = po.substring(2, 5);
        }
        if (teamCode) {
            const teamInfo = window.AppConfig.findTeam(teamCode);
            if (teamInfo) teamName = teamInfo.name;
        }
    }
    if (teamName) nameTeamInput.value = teamName;
}

function updatePlacementColorPreview(colorName, colorPreviewElement) {
    if (!colorName || !colorPreviewElement) return;
    const upperColorName = colorName.toUpperCase().trim();
    let foundColor = null;

    // Búsqueda en la base de datos de la app
    if (window.AppConfig.teamsAndColors) {
        for (const league of Object.values(window.AppConfig.teamsAndColors)) {
            const color = league.colors?.institutional?.[upperColorName] || league.colors?.metallic?.[upperColorName];
            if (color) {
                foundColor = color;
                break;
            }
        }
    }
    if (!foundColor && window.AppConfig.colorDatabases) {
        for (const db of Object.values(window.AppConfig.colorDatabases)) {
            if (db[upperColorName]) {
                foundColor = db[upperColorName];
                break;
            }
        }
    }

    if (foundColor && foundColor.hex) {
        colorPreviewElement.style.backgroundColor = foundColor.hex;
        colorPreviewElement.title = `Color: ${foundColor.name || colorName}\nHex: ${foundColor.hex}`;
    } else {
        colorPreviewElement.style.backgroundColor = 'transparent';
        colorPreviewElement.title = 'Color no encontrado';
    }
}

// ========== MANEJO DE LA INTERFAZ (UI) ==========

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    
    const content = document.getElementById(`${tabId}-tab-content`);
    const tab = document.querySelector(`.nav-tab[data-tab='${tabId}']`);
    
    if (content) content.style.display = 'block';
    if (tab) tab.classList.add('active');

    if (tabId === 'saved-specs') loadSavedSpecsList();
    if (tabId === 'dashboard') updateDashboardStats();
    if (tabId === 'error-log') displayErrorLog();
}

function updateDateTime() {
    const el = document.getElementById('current-datetime');
    if (el) el.textContent = new Date().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    document.getElementById('themeToggle').innerHTML = isLight
        ? '<i class="fas fa-moon"></i> Modo Oscuro'
        : '<i class="fas fa-sun"></i> Modo Claro';
}

function updateClientLogo() {
    const customer = document.getElementById('customer').value.toUpperCase();
    const logoImg = document.getElementById('logoCliente');
    const logoUrl = window.AppConfig.clientLogos?.[customer];
    logoImg.src = logoUrl || '';
    logoImg.style.display = logoUrl ? 'block' : 'none';
}

function showStatusMessage(message, type = 'info') {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type} show`;
    setTimeout(() => statusEl.classList.remove('show'), 3000);
}

// ========== MANEJO DE PLACEMENTS ==========

let placementCounter = 0;

function addNewPlacement(pData = null) {
    placementCounter++;
    const id = `p${placementCounter}`;
    const placementHTML = renderPlacementHTML(id, pData ? pData.name : `Placement ${placementCounter}`);
    document.getElementById('placements-container').insertAdjacentHTML('beforeend', placementHTML);

    if (pData) {
        document.getElementById(`placement-type-${id}`).value = pData.type;
        document.getElementById(`placement-ink-type-${id}`).value = pData.inkType;
        document.getElementById(`placement-notes-${id}`).value = pData.notes;
        pData.specialties.forEach(specialty => {
            const option = document.querySelector(`#placement-specialties-${id} option[value="${specialty}"]`);
            if (option) option.selected = true;
        });
        pData.colors.forEach(color => addColorToPlacement(id, color));
    }
}

function renderPlacementHTML(id, name) {
    const { placementTypes, specialtyInks } = window.AppConfig.placementDetails;
    const typeOptions = Object.keys(placementTypes).map(key => `<option value="${key}">${placementTypes[key].name}</option>`).join('');
    const specialtyOptions = specialtyInks.map(ink => `<option value="${ink}">${ink}</option>`).join('');

    return `
        <div class="placement-card" id="placement-card-${id}" data-id="${id}">
            <div class="card-header">
                <input type="text" id="placement-name-${id}" class="form-control form-control-sm" value="${name}">
                <button type="button" class="btn btn-danger btn-sm" onclick="removePlacement('${id}')"><i class="fas fa-trash"></i></button>
            </div>
            <div class="card-body form-grid">
                <div class="form-group"><label>Tipo</label><select id="placement-type-${id}" class="form-control">${typeOptions}</select></div>
                <div class="form-group"><label>Tinta</label><select id="placement-ink-type-${id}" class="form-control"><option value="plastisol">Plastisol</option><option value="water-based">Water-Based</option></select></div>
                <div class="form-group"><label>Especiales</label><select multiple id="placement-specialties-${id}" class="form-control">${specialtyOptions}</select></div>
                <div class="form-group span-2"><label>Colores</label><div id="colors-container-${id}"></div><button type="button" class="btn btn-sm btn-outline" onclick="addColorToPlacement('${id}')"><i class="fas fa-plus"></i> Añadir Color</button></div>
                <div class="form-group span-3"><label>Notas</label><textarea id="placement-notes-${id}" class="form-control" rows="2"></textarea></div>
            </div>
        </div>`;
}

function removePlacement(id) {
    document.getElementById(`placement-card-${id}`)?.remove();
}

function addColorToPlacement(placementId, colorValue = '') {
    const colorId = `c${Date.now()}`;
    const container = document.getElementById(`colors-container-${placementId}`);
    const colorHTML = `
        <div class="color-input-group" id="color-group-${colorId}">
            <div class="color-preview" id="color-preview-${colorId}"></div>
            <input type="text" class="form-control" placeholder="Ej: NAVY, PANTONE 123 C" value="${colorValue}" oninput="updatePlacementColorPreview(this.value, document.getElementById('color-preview-${colorId}'))">
            <button type="button" class="btn btn-sm btn-danger-outline" onclick="this.closest('.color-input-group').remove()"><i class="fas fa-times"></i></button>
        </div>`;
    container.insertAdjacentHTML('beforeend', colorHTML);
    if (colorValue) {
        updatePlacementColorPreview(colorValue, document.getElementById(`color-preview-${colorId}`));
    }
}

// ========== ACCIONES PRINCIPALES Y EXPORTACIÓN ==========

function exportPDF() {
    if (!validateForm()) {
        showStatusMessage('Por favor, completa los campos requeridos.', 'error');
        return;
    }
    const data = collectDataForExport();
    showStatusMessage('Generando PDF...', 'info');
    try {
        window.PdfGenerator.generate(data);
        showStatusMessage('PDF exportado con éxito.', 'success');
        saveSpecLocally(data);
    } catch (error) {
        errorHandler.log('exportPDF', error); // CORREGIDO
        showStatusMessage('Error al generar el PDF. Revisa la consola.', 'error');
    }
}

function collectDataForExport() {
    const data = { general: {}, placements: [] };
    ['customer', 'style', 'season', 'colorway', 'po', 'name-team', 'program', 'spec-date', 'folder-num'].forEach(id => {
        const key = id.replace(/-(\w)/g, (_, p1) => p1.toUpperCase());
        data.general[key] = document.getElementById(id).value;
    });

    document.querySelectorAll('.placement-card').forEach(pCard => {
        const id = pCard.dataset.id;
        data.placements.push({
            id,
            name: document.getElementById(`placement-name-${id}`).value,
            type: document.getElementById(`placement-type-${id}`).value,
            inkType: document.getElementById(`placement-ink-type-${id}`).value,
            specialties: Array.from(document.getElementById(`placement-specialties-${id}`).selectedOptions).map(opt => opt.value),
            notes: document.getElementById(`placement-notes-${id}`).value,
            colors: Array.from(pCard.querySelectorAll('.color-input-group input')).map(input => input.value).filter(Boolean)
        });
    });
    data.id = `spec-${data.general.style}-${Date.now()}`;
    return data;
}

function validateForm() {
    return ['customer', 'style', 'spec-date'].every(id => document.getElementById(id).value.trim() !== '');
}

function clearForm() {
    document.getElementById('spec-creator-form').reset();
    document.getElementById('placements-container').innerHTML = '';
    placementCounter = 0;
    document.getElementById('spec-date').valueAsDate = new Date();
    updateClientLogo();
    showStatusMessage('Formulario limpiado.', 'info');
}

function exportToExcel() { showStatusMessage('Exportar a Excel no implementado.', 'info'); }
function downloadProjectZip() { showStatusMessage('Descargar Proyecto no implementado.', 'info'); }

// ========== MANEJO DE ARCHIVOS (CARGA) ==========

function handleFileSelect(evt) {
    const file = evt.target.files[0];
    if (file) showStatusMessage(`Cargando: ${file.name}`, 'info');
    evt.target.value = '';
}

// ========== GESTIÓN DE SPECS GUARDADAS (LOCALSTORAGE - PUENTEO) ==========

const getSavedSpecs = () => JSON.parse(localStorage.getItem('savedSpecs') || '[]');
const saveSpecs = (specs) => localStorage.setItem('savedSpecs', JSON.stringify(specs));

function saveSpecLocally(specData) {
    try {
        const savedSpecs = getSavedSpecs();
        const existingIndex = savedSpecs.findIndex(s => s.id === specData.id);
        if (existingIndex > -1) {
            savedSpecs[existingIndex] = specData;
        } else {
            savedSpecs.push(specData);
        }
        saveSpecs(savedSpecs);
        showStatusMessage('Spec guardada localmente.', 'success');
        updateDashboardStats();
    } catch (error) {
        errorHandler.log('saveSpecLocally', error); // CORREGIDO
        showStatusMessage('Error al guardar la spec.', 'error');
    }
}

function loadSavedSpecsList() {
    const specs = getSavedSpecs();
    const container = document.getElementById('saved-specs-list');
    container.innerHTML = specs.length === 0
        ? '<p style="text-align:center; color:var(--text-secondary);">No hay specs guardadas.</p>'
        : specs.map(spec => `
            <div class="saved-spec-item">
                <div>
                    <strong>${spec.general.style || 'Sin Estilo'}</strong> - ${spec.general.nameTeam || 'Sin Equipo'}
                    <small>${new Date(parseInt(spec.id.split('-').pop())).toLocaleString()}</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-primary-outline" onclick="loadSpec('${spec.id}')"><i class="fas fa-folder-open"></i> Cargar</button>
                    <button class="btn btn-sm btn-danger-outline" onclick="deleteSpec('${spec.id}')"><i class="fas fa-trash"></i> Borrar</button>
                </div>
            </div>`).join('');
}

function loadSpec(specId) {
    const specData = getSavedSpecs().find(s => s.id === specId);
    if (!specData) {
        showStatusMessage('No se pudo encontrar la spec.', 'error');
        return;
    }
    clearForm();
    Object.keys(specData.general).forEach(key => {
        const elementId = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
        const input = document.getElementById(elementId);
        if (input) input.value = specData.general[key];
    });
    updateClientLogo();
    if (specData.placements) {
        specData.placements.forEach(pData => addNewPlacement(pData));
    }
    showTab('spec-creator');
    showStatusMessage(`Spec ${specData.general.style} cargada.`, 'success');
}

function deleteSpec(specId) {
    if (!confirm('¿Seguro que quieres eliminar esta spec?')) return;
    saveSpecs(getSavedSpecs().filter(s => s.id !== specId));
    loadSavedSpecsList();
    updateDashboardStats();
    showStatusMessage('Spec eliminada.', 'info');
}

function clearAllSpecs() {
    if (!confirm('¡ADVERTENCIA! ¿Eliminar TODAS las specs?')) return;
    localStorage.removeItem('savedSpecs'); // CORREGIDO
    loadSavedSpecsList();
    updateDashboardStats();
    showStatusMessage('Todas las specs han sido eliminadas.', 'warning');
}

// ========== DASHBOARD Y LOGS ==========

function updateDashboardStats() {
    const specs = getSavedSpecs();
    const totalSpecs = specs.length;
    document.getElementById('total-specs').textContent = totalSpecs;
    const lastSpec = totalSpecs > 0 ? specs[specs.length - 1] : null;
    if (lastSpec) {
        document.getElementById('last-spec-name').textContent = lastSpec.general.style || 'N/A';
        document.getElementById('last-spec-date').textContent = new Date(parseInt(lastSpec.id.split('-').pop())).toLocaleDateString();
    } else {
        document.getElementById('last-spec-name').textContent = 'Ninguna';
        document.getElementById('last-spec-date').textContent = '-';
    }
    document.getElementById('active-projects').textContent = new Set(specs.map(s => s.general.style)).size;
    document.getElementById('total-placements').textContent = specs.reduce((acc, s) => acc + (s.placements?.length || 0), 0);
}

function displayErrorLog() {
    const errors = errorHandler.getErrors(); // CORREGIDO
    const container = document.getElementById('error-log-content');
    container.innerHTML = errors.length === 0
        ? '<p>No hay errores registrados. ¡Todo va bien!</p>'
        : errors.map(e => `
            <div class="error-item">
                <div class="error-header"><strong>[${new Date(e.timestamp).toLocaleString()}]</strong> en <code>${e.context}</code></div>
                <div class="error-body">${e.error.message}</div>
                ${e.error.stack ? `<pre>${e.error.stack}</pre>` : ''}
            </div>`).join('');
}

function clearErrorLog() {
    errorHandler.clear(); // CORREGIDO
    displayErrorLog();
    showStatusMessage('Log de errores limpiado.', 'info');
}
