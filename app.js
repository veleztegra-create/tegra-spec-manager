
// =================================================================================
// TEGRA SPEC MANAGER - APP.JS (REFACTORIZADO)
// Descripción: Script principal que orquesta la interfaz de usuario, eventos y lógica de negocio.
// Versión: 3.0 (Arquitectura de Módulos y Carga de Configuración Asíncrona)
// =================================================================================

// ========== INICIALIZACIÓN DE LA APLICACIÓN ==========

// La aplicación no se inicializa aquí directamente.
// Esperamos a que el DOM esté listo y a que nuestra configuración sea cargada.
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ [App] DOM completamente cargado y parseado.');
    // El DOM está listo. Ahora esperamos la señal de que la configuración está cargada.
    document.addEventListener('config-loaded', initializeApplication);
});

/**
 * @function initializeApplication
 * Punto de entrada principal de la aplicación.
 * Se ejecuta solo una vez, después de que la configuración (window.AppConfig) ha sido cargada.
 */
function initializeApplication() {
    console.log('🚀 [App] ¡Configuración recibida! Inicializando la aplicación principal...');

    // Asigna todos los listeners de eventos de la UI.
    setupEventListeners();

    // Configuración inicial de la UI.
    updateDateTime();
    setInterval(updateDateTime, 60000); // Actualizar fecha y hora cada minuto.
    showTab('dashboard');
    loadSavedSpecsList(); 
    updateDashboardStats();

    console.log('✅ [App] Aplicación inicializada y lista para usarse.');
}


// ========== CONFIGURACIÓN DE EVENTOS ==========

/**
 * @function setupEventListeners
 * Centraliza la asignación de todos los listeners de eventos.
 */
function setupEventListeners() {
    // Navegación principal
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => showTab(tab.dataset.tab));
    });

    // Carga de archivos
    document.getElementById('excelFile').addEventListener('change', handleFileSelect, false);

    // Formulario principal
    document.getElementById('customer').addEventListener('input', () => {
        updateClientLogo();
        handleGearForSportLogic();
    });
    document.getElementById('style').addEventListener('input', handleGearForSportLogic);
    document.getElementById('po').addEventListener('input', handleGearForSportLogic);
    document.getElementById('spec-date').valueAsDate = new Date();

    // Toggle de Tema
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Acciones rápidas y de formulario
    document.querySelector('.btn-primary[onclick*="addNewPlacement"]').addEventListener('click', addNewPlacement);
    document.querySelector('.btn-success[onclick*="exportPDF"]').addEventListener('click', exportPDF);
    document.querySelector('.btn-secondary[onclick*="exportToExcel"]').addEventListener('click', exportToExcel);
    document.querySelector('.btn-danger[onclick*="clearForm"]').addEventListener('click', clearForm);
    document.querySelector('.btn-primary[onclick*="downloadProjectZip"]').addEventListener('click', downloadProjectZip);

    console.log('🎧 [App] Listeners de eventos configurados.');
}


// ========== LÓGICA DE NEGOCIO Y DATOS ==========

/**
 * @function handleGearForSportLogic
 * Lógica específica para 'GEAR FOR SPORT'. Intenta autocompletar el nombre del equipo.
 */
function handleGearForSportLogic() {
    const customer = document.getElementById('customer').value.toUpperCase();
    if (customer !== 'GEAR FOR SPORT') return;

    const style = document.getElementById('style').value;
    const po = document.getElementById('po').value;
    const nameTeamInput = document.getElementById('name-team');

    let teamCode = '';
    if (style.startsWith('N')) { // NCAA
        teamCode = style.substring(1, 4);
    } else if (po.startsWith('PO')) { // Pro league
        teamCode = po.substring(2, 5);
    }

    if (teamCode) {
        // Usamos la función de búsqueda centralizada en AppConfig
        const teamInfo = window.AppConfig.findTeam(teamCode);
        if (teamInfo) {
            nameTeamInput.value = teamInfo.name;
        }
    }
}

/**
 * @function updatePlacementColorPreview
 * **LÓGICA DE COLOR CORREGIDA**
 * Actualiza la vista previa de color con búsqueda priorizada.
 * @param {string} colorName - Nombre del color a buscar.
 * @param {HTMLElement} colorPreviewElement - Elemento para mostrar el color.
 */
function updatePlacementColorPreview(colorName, colorPreviewElement) {
    if (!colorName || !colorPreviewElement) return;

    const upperColorName = colorName.toUpperCase().trim();
    let foundColor = null;

    // 1. Búsqueda Exacta en Colores de Equipos (Institucionales y Metálicos)
    if (window.AppConfig.teamsAndColors) {
        for (const league of Object.values(window.AppConfig.teamsAndColors)) {
            const color = league.colors?.institutional?.[upperColorName] || league.colors?.metallic?.[upperColorName];
            if (color) {
                foundColor = color;
                break;
            }
        }
    }
    
    // 2. Búsqueda en Bases de Datos Genéricas (Pantone, etc.)
    if (!foundColor && window.AppConfig.colorDatabases) {
        for (const db of Object.values(window.AppConfig.colorDatabases)) {
            if (db[upperColorName]) {
                foundColor = db[upperColorName];
                break;
            }
        }
    }

    // 3. Búsqueda por Palabra Clave (Último recurso)
    if (!foundColor) {
        const keywords = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'BLACK', 'WHITE', 'PURPLE', 'ORANGE', 'GRAY'];
        const matchedKeyword = keywords.find(kw => upperColorName.includes(kw));
        if (matchedKeyword && window.AppConfig.colorDatabases?.GEARFORSPORT?.[matchedKeyword]) {
            foundColor = window.AppConfig.colorDatabases.GEARFORSPORT[matchedKeyword];
        }
    }
    
    if (foundColor && foundColor.hex) {
        colorPreviewElement.style.backgroundColor = foundColor.hex;
        colorPreviewElement.title = `Color: ${foundColor.name || colorName}
Hex: ${foundColor.hex}`;
    } else {
        colorPreviewElement.style.backgroundColor = 'transparent';
        colorPreviewElement.title = 'Color no encontrado';
    }
}


// ========== MANEJO DE LA INTERFAZ (UI) ==========

/**
 * @function showTab
 * Muestra una pestaña de contenido y actualiza la navegación.
 * @param {string} tabId - ID de la pestaña a mostrar ('dashboard', 'spec-creator', etc.).
 */
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

    const content = document.getElementById(`${tabId}-tab-content`);
    const tab = document.querySelector(`.nav-tab[data-tab='${tabId}']`);

    if (content) content.style.display = 'block';
    if (tab) tab.classList.add('active');

    // Refrescar listas o datos si es necesario al cambiar de pestaña
    if (tabId === 'saved-specs') loadSavedSpecsList();
    if (tabId === 'dashboard') updateDashboardStats();
    if (tabId === 'error-log') displayErrorLog();
}

/**
 * @function updateDateTime
 * Muestra la fecha y hora actual en la cabecera.
 */
function updateDateTime() {
    const el = document.getElementById('current-datetime');
    if (el) el.textContent = new Date().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
}

/**
 * @function toggleTheme
 * Cambia entre el tema claro y oscuro.
 */
function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    document.getElementById('themeToggle').innerHTML = isLight
        ? '<i class="fas fa-moon"></i> Modo Oscuro'
        : '<i class="fas fa-sun"></i> Modo Claro';
}

/**
 * @function updateClientLogo
 * Actualiza el logo del cliente usando la configuración de AppConfig.
 */
function updateClientLogo() {
    const customer = document.getElementById('customer').value.toUpperCase();
    const logoImg = document.getElementById('logoCliente');
    
    const logoUrl = window.AppConfig.clientLogos?.[customer];

    if (logoUrl) {
        logoImg.src = logoUrl;
        logoImg.style.display = 'block';
    } else {
        logoImg.style.display = 'none';
    }
}

/**
 * @function showStatusMessage
 * Muestra un mensaje temporal de estado (éxito, error, etc.).
 * @param {string} message - El mensaje a mostrar.
 * @param {string} type - 'success', 'error', o 'info'.
 */
function showStatusMessage(message, type = 'info') {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type} show`;
    setTimeout(() => {
        statusEl.classList.remove('show');
    }, 3000);
}


// ========== MANEJO DE PLACEMENTS ==========

let placementCounter = 0;

/**
 * @function addNewPlacement
 * Añade una nueva tarjeta de placement al formulario.
 */
function addNewPlacement() {
    placementCounter++;
    const placementId = `p${placementCounter}`;
    const placementHTML = renderPlacementHTML(placementId);

    document.getElementById('placements-container').insertAdjacentHTML('beforeend', placementHTML);
    
    // Activar la nueva pestaña
    const newTab = document.querySelector(`.placement-tab[data-id='${placementId}']`);
    if(newTab) newTab.click();
}

/**
 * @function renderPlacementHTML
 * Genera el HTML para una nueva tarjeta de placement.
 * @param {string} id - El ID único para el nuevo placement.
 * @returns {string} El string HTML del placement.
 */
function renderPlacementHTML(id) {
    // Los tipos de placement y tintas especiales ahora vienen de la configuración
    const placementTypes = window.AppConfig.placementDetails.placementTypes;
    const specialtyInks = window.AppConfig.placementDetails.specialtyInks;

    let typeOptions = Object.keys(placementTypes).map(key => `<option value="${key}">${placementTypes[key].name}</option>`).join('');
    let specialtyOptions = specialtyInks.map(ink => `<option value="${ink}">${ink}</option>`).join('');

    return `
        <div class="placement-card" id="placement-card-${id}" data-id="${id}">
            <div class="card-header">
                <input type="text" id="placement-name-${id}" class="form-control form-control-sm" value="Placement ${placementCounter}">
                <button type="button" class="btn btn-danger btn-sm" onclick="removePlacement('${id}')"><i class="fas fa-trash"></i></button>
            </div>
            <div class="card-body form-grid">
                <div class="form-group">
                    <label>Tipo de Placement</label>
                    <select id="placement-type-${id}" class="form-control">${typeOptions}</select>
                </div>
                <div class="form-group">
                    <label>Tipo de Tinta</label>
                    <select id="placement-ink-type-${id}" class="form-control">
                        <option value="plastisol">Plastisol</option>
                        <option value="water-based">Water-Based</option>
                        <option value="discharge">Discharge</option>
                    </select>
                </div>
                 <div class="form-group">
                    <label>Tintas Especiales</label>
                    <select multiple id="placement-specialties-${id}" class="form-control">${specialtyOptions}</select>
                </div>
                <div class="form-group span-2">
                    <label>Colores (Nombre, Pantone, o Código)</label>
                    <div id="colors-container-${id}"></div>
                    <button type="button" class="btn btn-sm btn-outline" onclick="addColorToPlacement('${id}')"><i class="fas fa-plus"></i> Añadir Color</button>
                </div>
                <div class="form-group span-3">
                    <label>Notas del Placement</label>
                    <textarea id="placement-notes-${id}" class="form-control" rows="2"></textarea>
                </div>
            </div>
        </div>
    `;
}

/**
 * @function removePlacement
 * Elimina una tarjeta de placement del formulario.
 * @param {string} id - El ID del placement a eliminar.
 */
function removePlacement(id) {
    document.getElementById(`placement-card-${id}`)?.remove();
    document.querySelector(`.placement-tab[data-id='${id}']`)?.remove();
    
    // Activa la primera pestaña restante, si existe
    const firstTab = document.querySelector('.placement-tab');
    if(firstTab) firstTab.click();
}

/**
 * @function addColorToPlacement
 * Añade un nuevo campo de color a un placement específico.
 * @param {string} placementId - El ID del placement.
 */
function addColorToPlacement(placementId) {
    const colorId = `c${Date.now()}`;
    const container = document.getElementById(`colors-container-${placementId}`);
    
    const colorHTML = `
        <div class="color-input-group" id="color-group-${colorId}">
            <div class="color-preview" id="color-preview-${colorId}"></div>
            <input type="text" class="form-control" placeholder="Ej: NAVY, PANTONE 123 C" oninput="updatePlacementColorPreview(this.value, document.getElementById('color-preview-${colorId}'))">
            <button type="button" class="btn btn-sm btn-danger-outline" onclick="document.getElementById('color-group-${colorId}').remove()"><i class="fas fa-times"></i></button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', colorHTML);
}


// ========== ACCIONES PRINCIPALES Y EXPORTACIÓN ==========

/**
 * @function exportPDF
 * **FUNCIÓN REFACTORIZADA**
 * Valida, recolecta datos y delega la creación del PDF al módulo PdfGenerator.
 */
function exportPDF() {
    console.log('📦 [Export] Iniciando exportación a PDF...');
    
    if (!validateForm()) {
        showStatusMessage('Por favor, completa los campos requeridos antes de exportar.', 'error');
        console.error('[Export] Validación de formulario fallida.');
        return;
    }
    
    const data = collectDataForExport();
    console.log('📝 [Export] Datos recolectados:', data);

    showStatusMessage('Generando PDF, por favor espera...', 'info');
    
    // Delegación completa. 'PdfGenerator' se encarga de todo el renderizado.
    // El "conteo de píxeles" ya no vive aquí.
    try {
        window.PdfGenerator.generate(data);
        showStatusMessage('PDF exportado con éxito.', 'success');
        saveSpecLocally(data);
    } catch (error) {
        logError('exportPDF', 'Error al delegar la generación del PDF.', error);
        showStatusMessage('Error al generar el PDF. Revisa la consola.', 'error');
    }
}

/**
 * @function collectDataForExport
 * Recolecta todos los datos del formulario en un objeto estructurado.
 * @returns {object} El objeto de datos de la Spec.
 */
function collectDataForExport() {
    const data = {
        general: {
            customer: document.getElementById('customer').value,
            style: document.getElementById('style').value,
            season: document.getElementById('season').value,
            colorway: document.getElementById('colorway').value,
            po: document.getElementById('po').value,
            nameTeam: document.getElementById('name-team').value,
            program: document.getElementById('program').value,
            specDate: document.getElementById('spec-date').value,
            folderNum: document.getElementById('folder-num').value,
        },
        placements: []
    };

    document.querySelectorAll('.placement-card').forEach(pCard => {
        const id = pCard.dataset.id;
        const placementData = {
            id: id,
            name: document.getElementById(`placement-name-${id}`).value,
            type: document.getElementById(`placement-type-${id}`).value,
            inkType: document.getElementById(`placement-ink-type-${id}`).value,
            specialties: Array.from(document.getElementById(`placement-specialties-${id}`).selectedOptions).map(opt => opt.value),
            notes: document.getElementById(`placement-notes-${id}`).value,
            colors: []
        };
        
        pCard.querySelectorAll(`#colors-container-${id} .color-input-group input`).forEach(colorInput => {
            if (colorInput.value) {
                placementData.colors.push(colorInput.value);
            }
        });
        
        data.placements.push(placementData);
    });
    
    data.id = `spec-${data.general.style}-${Date.now()}`;
    return data;
}

/**
 * @function validateForm
 * Valida que los campos requeridos del formulario estén completos.
 * @returns {boolean} - True si es válido, false si no.
 */
function validateForm() {
    // Lógica de validación simple
    const requiredFields = ['customer', 'style', 'spec-date'];
    for (const fieldId of requiredFields) {
        if (!document.getElementById(fieldId).value) {
            return false;
        }
    }
    return true;
}

/**
 * @function clearForm
 * Limpia todos los campos del formulario de creación de specs.
 */
function clearForm() {
    document.getElementById('spec-creator-form').reset();
    document.getElementById('placements-container').innerHTML = '';
    document.getElementById('placements-tabs').innerHTML = '';
    placementCounter = 0;
    document.getElementById('spec-date').valueAsDate = new Date();
    updateClientLogo();
    showStatusMessage('Formulario limpiado.', 'info');
}

/**
 * @function exportToExcel
 * (Funcionalidad de ejemplo) Exporta los datos a un archivo Excel.
 */
function exportToExcel() {
    // Esta función requeriría una implementación detallada con SheetJS (XLSX).
    // Por ahora, es un marcador de posición.
    showStatusMessage('Funcionalidad "Exportar a Excel" aún no implementada.', 'info');
    console.warn('exportToExcel no está implementado.');
}

/**
 * @function downloadProjectZip
 * (Funcionalidad de ejemplo) Descarga un ZIP con los datos del proyecto.
 */
function downloadProjectZip() {
    // Esta función requeriría una implementación detallada con JSZip.
    // Por ahora, es un marcador de posición.
    showStatusMessage('Funcionalidad "Descargar Proyecto" aún no implementada.', 'info');
    console.warn('downloadProjectZip no está implementado.');
}


// ========== MANEJO DE ARCHIVOS (CARGA) ==========

/**
 * @function handleFileSelect
 * Maneja la selección de un archivo de entrada (Excel, JSON, ZIP).
 * @param {Event} evt - El evento de selección de archivo.
 */
function handleFileSelect(evt) {
    const file = evt.target.files[0];
    if (!file) return;

    showStatusMessage(`Cargando archivo: ${file.name}`, 'info');

    if (file.name.endsWith('.json')) {
        // Lógica para cargar desde JSON (una spec guardada)
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Lógica para cargar desde Excel (un SWO)
    } else if (file.name.endsWith('.zip')) {
        // Lógica para cargar un proyecto completo
    } else {
        showStatusMessage('Tipo de archivo no soportado.', 'error');
    }
    // La implementación detallada de cada tipo de carga iría aquí.
    evt.target.value = ''; // Resetear el input para permitir cargar el mismo archivo de nuevo
}


// ========== GESTIÓN DE SPECS GUARDADAS (LOCALSTORAGE) ==========

/**
 * @function saveSpecLocally
 * Guarda una spec en el LocalStorage.
 * @param {object} specData - El objeto de datos de la spec a guardar.
 */
function saveSpecLocally(specData) {
    try {
        const savedSpecs = StateManager.getState('savedSpecs') || [];
        // Evitar duplicados
        const existingIndex = savedSpecs.findIndex(s => s.id === specData.id);
        if (existingIndex > -1) {
            savedSpecs[existingIndex] = specData;
        } else {
            savedSpecs.push(specData);
        }
        StateManager.setState('savedSpecs', savedSpecs);
        showStatusMessage('Spec guardada localmente.', 'success');
        updateDashboardStats();
    } catch (error) {
        logError('saveSpecLocally', 'No se pudo guardar la spec en LocalStorage.', error);
        showStatusMessage('Error al guardar la spec.', 'error');
    }
}

/**
 * @function loadSavedSpecsList
 * Carga y muestra la lista de specs guardadas en la pestaña "Guardadas".
 */
function loadSavedSpecsList() {
    const specs = StateManager.getState('savedSpecs') || [];
    const container = document.getElementById('saved-specs-list');
    
    if (specs.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-secondary);">No hay specs guardadas.</p>';
        return;
    }

    container.innerHTML = specs.map(spec => `
        <div class="saved-spec-item">
            <div>
                <strong>${spec.general.style || 'Sin Estilo'}</strong> - ${spec.general.nameTeam || 'Sin Equipo'}
                <small>${new Date(spec.id.split('-').pop()).toLocaleString()}</small>
            </div>
            <div>
                <button class="btn btn-sm btn-primary-outline" onclick="loadSpec('${spec.id}')"><i class="fas fa-folder-open"></i> Cargar</button>
                <button class="btn btn-sm btn-danger-outline" onclick="deleteSpec('${spec.id}')"><i class="fas fa-trash"></i> Borrar</button>
            </div>
        </div>
    `).join('');
}

/**
 * @function loadSpec
 * Carga los datos de una spec guardada en el formulario.
 * @param {string} specId - El ID de la spec a cargar.
 */
function loadSpec(specId) {
    const specs = StateManager.getState('savedSpecs') || [];
    const specData = specs.find(s => s.id === specId);
    if (!specData) {
        showStatusMessage('No se pudo encontrar la spec seleccionada.', 'error');
        return;
    }

    clearForm();
    showTab('spec-creator');

    // Rellenar datos generales
    Object.keys(specData.general).forEach(key => {
        const input = document.getElementById(key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`));
        if (input) input.value = specData.general[key];
    });
    
    updateClientLogo(); // Actualizar el logo después de poner el cliente

    // Rellenar placements
    specData.placements.forEach(pData => {
        addNewPlacement();
        const id = `p${placementCounter}`;
        // Rellenar cada campo del placement... (implementación más detallada necesaria aquí)
    });
    
    showStatusMessage(`Spec ${specData.general.style} cargada.`, 'success');
}

/**
 * @function deleteSpec
 * Elimina una spec guardada del LocalStorage.
 * @param {string} specId - El ID de la spec a eliminar.
 */
function deleteSpec(specId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta spec guardada?')) return;
    
    let specs = StateManager.getState('savedSpecs') || [];
    specs = specs.filter(s => s.id !== specId);
    StateManager.setState('savedSpecs', specs);

    loadSavedSpecsList();
    updateDashboardStats();
    showStatusMessage('Spec eliminada.', 'info');
}

/**
 * @function clearAllSpecs
 * Elimina TODAS las specs guardadas del LocalStorage.
 */
function clearAllSpecs() {
    if (!confirm('¡ADVERTENCIA! ¿Estás seguro de que quieres eliminar TODAS las specs guardadas? Esta acción no se puede deshacer.')) return;
    StateManager.removeState('savedSpecs');
    loadSavedSpecsList();
    updateDashboardStats();
    showStatusMessage('Todas las specs han sido eliminadas.', 'warning');
}


// ========== DASHBOARD Y LOGS ==========

/**
 * @function updateDashboardStats
 * Actualiza las estadísticas que se muestran en el dashboard.
 */
function updateDashboardStats() {
    const specs = StateManager.getState('savedSpecs') || [];
    const totalSpecs = specs.length;
    const lastSpec = specs[specs.length - 1];

    document.getElementById('total-specs').textContent = totalSpecs;

    if (lastSpec) {
        document.getElementById('last-spec-name').textContent = lastSpec.general.style || 'N/A';
        document.getElementById('last-spec-date').textContent = new Date(lastSpec.id.split('-').pop()).toLocaleDateString();
    } else {
        document.getElementById('last-spec-name').textContent = 'Ninguna';
        document.getElementById('last-spec-date').textContent = '-';
    }

    // Lógica para 'proyectos activos' y 'placements totales' podría ser más compleja.
    document.getElementById('active-projects').textContent = new Set(specs.map(s => s.general.style)).size;
    document.getElementById('total-placements').textContent = specs.reduce((acc, s) => acc + s.placements.length, 0);
}

/**
 * @function displayErrorLog
 * Muestra los errores guardados en la pestaña de Log de Errores.
 */
function displayErrorLog() {
    const errors = ErrorHandler.getErrors();
    const container = document.getElementById('error-log-content');
    if (errors.length === 0) {
        container.innerHTML = '<p>No hay errores registrados. ¡Todo va bien!</p>';
        return;
    }
    container.innerHTML = errors.map(e => `
        <div class="error-item">
            <div class="error-header">
                <strong>[${e.timestamp}]</strong> Error en <code>${e.context}</code>
            </div>
            <div class="error-body">${e.message}</div>
            ${e.error ? `<pre>${e.error.stack || e.error}</pre>` : ''}
        </div>
    `).join('');
}

/**
 * @function clearErrorLog
 * Limpia el log de errores.
 */
function clearErrorLog() {
    ErrorHandler.clearErrors();
    displayErrorLog();
    showStatusMessage('Log de errores limpiado.', 'info');
}

// ========== FIN DEL SCRIPT ==========
