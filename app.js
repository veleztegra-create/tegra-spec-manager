// app.js - Código principal de Tegra Spec Manager (versión corregida y con mejoras)
 
// ========== VARIABLES GLOBALES ==========
let placements = [];
let currentPlacementId = 1;
let clientLogoCache = {};
let isDarkMode = true;
// Contador único para generar IDs de placements sin colisiones
let nextPlacementCounter = Date.now();
 
// ========== FUNCIONES BÁSICAS ==========
 
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
    const el = document.getElementById('current-datetime');
    if (el) {
        el.textContent = now.toLocaleDateString('es-ES', {
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit'
        });
    }
}
 
function showStatus(msg, type = 'success') {
    const el = document.getElementById('statusMessage');
    if (el) {
        el.textContent = msg;
        el.className = `status-message status-${type}`;
        el.style.display = 'block';
        setTimeout(() => {
            if (el.parentElement) {
                el.style.display = 'none';
            }
        }, 4000);
    }
}
 
function toggleTheme() {
    isDarkMode = !isDarkMode;
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    
    if (isDarkMode) {
        body.classList.remove('light-mode');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
        showStatus('🌙 Modo oscuro activado');
    } else {
        body.classList.add('light-mode');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
        showStatus('☀️ Modo claro activado');
    }
    
    localStorage.setItem('tegraspec-theme', isDarkMode ? 'dark' : 'light');
}
 
function showTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Ocultar todos los botones de nav
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar el tab seleccionado
    const tabElement = document.getElementById(tabName);
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    // Activar el botón correspondiente
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        const tabText = tab.textContent || tab.innerText;
        if (tabText.toLowerCase().includes(tabName.replace('-', ' '))) {
            tab.classList.add('active');
        }
    });
    
    // Ejecutar funciones específicas del tab
    switch(tabName) {
        case 'saved-specs':
            setTimeout(() => loadSavedSpecsList(), 100);
            break;
        case 'dashboard':
            setTimeout(() => updateDashboard(), 100);
            break;
        case 'error-log':
            setTimeout(() => loadErrorLog(), 100);
            break;
        case 'spec-creator':
            setTimeout(() => {
                if (placements.length === 0) initializePlacements();
            }, 100);
            break;
    }
}
 
// ========== FUNCIONES DE CLIENTE ==========
 
function updateClientLogo() {
    const customerEl = document.getElementById('customer');
    if (!customerEl) return;
    const customer = customerEl.value.toUpperCase().trim();
    const logoElement = document.getElementById('logoCliente');
    if (!logoElement) return;
    
    let logoUrl = '';
    if (customer.includes('NIKE')) logoUrl = Config.CLIENT_LOGOS.NIKE || '';
    else if (customer.includes('FANATICS')) logoUrl = Config.CLIENT_LOGOS.FANATICS || '';
    else if (customer.includes('ADIDAS')) logoUrl = Config.CLIENT_LOGOS.ADIDAS || '';
    else if (customer.includes('PUMA')) logoUrl = Config.CLIENT_LOGOS.PUMA || '';
    else if (customer.includes('UNDER ARMOUR')) logoUrl = Config.CLIENT_LOGOS['UNDER ARMOUR'] || '';
    else if (customer.includes('GEAR FOR SPORT')) logoUrl = Config.CLIENT_LOGOS['GEAR FOR SPORT'] || '';
    
    if (logoUrl) {
        logoElement.src = logoUrl;
        logoElement.style.display = 'block';
        clientLogoCache[customer] = logoUrl;
    } else {
        logoElement.style.display = 'none';
    }
}
 
// ========== FUNCIONES DE DASHBOARD ==========
 
function updateDashboard() {
    try {
        const specs = Object.keys(localStorage).filter(k => k.startsWith('spec_'));
        const total = specs.length;
        const totalEl = document.getElementById('total-specs');
        if (totalEl) totalEl.textContent = total;
        
        let lastSpec = null;
        let lastSpecDate = null;
        
        specs.forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                const specDate = new Date(data.savedAt || 0);
                if (!lastSpecDate || specDate > lastSpecDate) {
                    lastSpecDate = specDate;
                    lastSpec = data;
                }
            } catch(e) {}
        });
        
        const todayEl = document.getElementById('today-specs');
        if (todayEl) {
            if (lastSpec) {
                todayEl.innerHTML = `
                    <div style="font-size:0.9rem; color:var(--text-secondary);">Última Spec:</div>
                    <div style="font-size:1.2rem; font-weight:bold; color:var(--primary);">${(lastSpec.style || 'Sin nombre')}</div>
                    <div style="font-size:0.8rem; color:var(--text-secondary);">${lastSpecDate.toLocaleDateString('es-ES')}</div>
                `;
            }
        }
        
        const activeEl = document.getElementById('active-projects');
        if (activeEl) activeEl.textContent = specs.length;
        
        const totalPlacements = specs.reduce((total, key) => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                return total + (data.placements?.length || 0);
            } catch(e) { return total; }
        }, 0);
        
        const rateEl = document.getElementById('completion-rate');
        if (rateEl) {
            rateEl.innerHTML = `
                <div style="font-size:0.9rem; color:var(--text-secondary);">Placements totales:</div>
                <div style="font-size:1.5rem; font-weight:bold; color:var(--primary);">${totalPlacements}</div>
            `;
        }
    } catch (error) {
        console.error('Error en updateDashboard:', error);
    }
}
 
// ========== FUNCIONES BÁSICAS DE PLACEMENTS ==========
 
function initializePlacements() {
    placements = [];
    addNewPlacement('FRONT', true);
    if (placements.length > 0) {
        renderPlacementHTML(placements[0]);
        showPlacement(placements[0].id);
    }
    updatePlacementsTabs();
}
 
function addNewPlacement(type = null, isFirst = false) {
    const placementId = isFirst ? 1 : ++nextPlacementCounter;
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
        meshColor: '',
        meshWhite: '',
        meshBlocker: '',
        durometer: '',
        strokes: '',
        additives: '',
        width: '',
        height: ''
    };
    
    if (!isFirst) placements.push(newPlacement);
    else placements = [newPlacement];
    
    // Render y mostrar
    renderPlacementHTML(newPlacement);
    updatePlacementsTabs();
    showPlacement(placementId);
    
    return placementId;
}
 
function getNextPlacementType() {
    const usedTypes = placements.map(p => p.type);
    const allTypes = ['FRONT', 'BACK', 'SLEEVE', 'CHEST', 'TV. NUMBERS', 'SHOULDER', 'COLLAR', 'CUSTOM'];
    for (const type of allTypes) {
        if (!usedTypes.includes(type)) return type;
    }
    return 'CUSTOM';
}
 
function getNextPlacementNumber() {
    return placements.length + 1;
}
 
// ========== FUNCIONES DE UI DE PLACEMENTS ==========
 
function renderPlacementHTML(placement) {
    // Implementación mínima segura: crea una sección para el placement con campos básicos.
    const container = document.getElementById('placements-container');
    if (!container) return;
 
    // Si ya existe, actualizar su contenido en vez de duplicar
    const existing = document.getElementById(`placement-section-${placement.id}`);
    let section;
    if (existing) {
        section = existing;
        section.innerHTML = '';
    } else {
        section = document.createElement('section');
        section.id = `placement-section-${placement.id}`;
        section.className = 'placement-section';
    }
 
    const title = document.createElement('h4');
    title.textContent = placement.name || `Placement ${placement.id}`;
    section.appendChild(title);
 
    // Campo nombre
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Nombre:';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = placement.name || '';
    nameInput.addEventListener('input', (e) => {
        placement.name = e.target.value;
        updatePlacementsTabs();
    });
    section.appendChild(nameLabel);
    section.appendChild(nameInput);
 
    // Campo tipo
    const typeLabel = document.createElement('label');
    typeLabel.textContent = 'Tipo:';
    const typeInput = document.createElement('input');
    typeInput.type = 'text';
    typeInput.value = placement.type || '';
    typeInput.addEventListener('input', (e) => {
        placement.type = e.target.value;
        updatePlacementsTabs();
    });
    section.appendChild(typeLabel);
    section.appendChild(typeInput);
 
    // Botón eliminar (si hay más de 1)
    if (placements.length > 1) {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-outline btn-sm';
        removeBtn.textContent = 'Eliminar placement';
        removeBtn.addEventListener('click', () => removePlacement(placement.id));
        section.appendChild(removeBtn);
    }
 
    // Si fue nueva, añadir al container
    if (!existing) container.appendChild(section);
}
 
function showPlacement(placementId) {
    document.querySelectorAll('.placement-section').forEach(section => {
        section.classList.remove('active');
    });
    const section = document.getElementById(`placement-section-${placementId}`);
    if (section) section.classList.add('active');
    
    document.querySelectorAll('.placement-tab').forEach(tab => {
        tab.classList.toggle('active', parseInt(tab.dataset.placementId) === placementId);
    });
    
    currentPlacementId = placementId;
}
 
function updatePlacementsTabs() {
    const tabsContainer = document.getElementById('placements-tabs');
    if (!tabsContainer) return;
    
    tabsContainer.innerHTML = '';
    
    placements.forEach(placement => {
        const displayType = placement.type && placement.type.includes('CUSTOM:') 
            ? placement.type.replace('CUSTOM: ', '')
            : (placement.type || 'PLACEMENT');
            
        const tab = document.createElement('div');
        tab.className = `placement-tab ${placement.id === currentPlacementId ? 'active' : ''}`;
        tab.setAttribute('data-placement-id', String(placement.id));
        tab.innerHTML = `
            <i class="fas fa-map-marker-alt"></i>
            <span class="placement-tab-text">${displayType.substring(0, 15)}${displayType.length > 15 ? '...' : ''}</span>
        `;
        
        // Remove icon
        if (placements.length > 1) {
            const removeSpan = document.createElement('span');
            removeSpan.className = 'remove-tab';
            removeSpan.innerHTML = '&times;';
            removeSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                removePlacement(placement.id);
            });
            tab.appendChild(removeSpan);
        }
        
        tab.addEventListener('click', () => showPlacement(placement.id));
        tabsContainer.appendChild(tab);
    });
}
 
function removePlacement(id) {
    if (placements.length > 1) {
        placements = placements.filter(p => p.id !== id);
        const section = document.getElementById(`placement-section-${id}`);
        if (section) section.remove();
        updatePlacementsTabs();
        if (placements.length > 0) showPlacement(placements[0].id);
    }
}
 
// ========== FUNCIONES DE GUARDADO ==========
 
function saveCurrentSpec() {
    try {
        const data = collectData();
        const style = data.style || 'SinEstilo';
        // Sanear style para usar en la key
        const styleSafe = style.replace(/[^a-z0-9_\-]/gi, '_');
        const storageKey = `spec_${styleSafe}_${Date.now()}`;
        
        data.savedAt = new Date().toISOString();
        data.lastModified = new Date().toISOString();
        
        localStorage.setItem(storageKey, JSON.stringify(data));
        
        updateDashboard();
        loadSavedSpecsList();
        showStatus('✅ Spec guardada correctamente', 'success');
        
    } catch (error) {
        console.error('Error al guardar:', error);
        showStatus('❌ Error al guardar: ' + (error.message || error), 'error');
    }
}
 
function collectData() {
    const safeGet = id => {
        const el = document.getElementById(id);
        return el ? el.value : '';
    };
    const generalData = {
        customer: safeGet('customer'),
        style: safeGet('style'),
        folder: safeGet('folder-num'),
        colorway: safeGet('colorway'),
        season: safeGet('season'),
        pattern: safeGet('pattern'),
        po: safeGet('po'),
        sampleType: safeGet('sample-type'),
        nameTeam: safeGet('name-team'),
        gender: safeGet('gender'),
        designer: safeGet('designer')
    };
    
    const placementsData = placements.map(placement => ({
        id: placement.id,
        type: placement.type,
        name: placement.name,
        imageData: placement.imageData,
        colors: placement.colors,
        placementDetails: placement.placementDetails,
        dimensions: placement.dimensions,
        temp: placement.temp,
        time: placement.time,
        specialties: placement.specialties,
        specialInstructions: placement.specialInstructions,
        inkType: placement.inkType
    }));
    
    return {
        ...generalData,
        placements: placementsData
    };
}
 
// ========== FUNCIONES DE LIMPIEZA ==========
 
function clearForm() {
    if (confirm('¿Limpiar todo el formulario?')) {
        document.querySelectorAll('input:not(#folder-num), textarea, select').forEach(i => {
            if (i.type !== 'button' && i.type !== 'submit') i.value = '';
        });
        const designerEl = document.getElementById('designer');
        if (designerEl) designerEl.value = '';
        
        placements = [];
        const container = document.getElementById('placements-container');
        const tabs = document.getElementById('placements-tabs');
        if (container) container.innerHTML = '';
        if (tabs) tabs.innerHTML = '';
        
        initializePlacements();
        const logo = document.getElementById('logoCliente');
        if (logo) logo.style.display = 'none';
        showStatus('🧹 Formulario limpiado');
    }
}
 
// ========== FUNCIONES DE STORAGE ==========
 
function loadSavedSpecsList() {
    const list = document.getElementById('saved-specs-list');
    if (!list) return;
    
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
            const raw = localStorage.getItem(key);
            if (!raw) return;
            const data = JSON.parse(raw);
 
            const div = document.createElement('div');
            div.style.cssText = "padding:15px; border-bottom:1px solid var(--border-dark); display:flex; justify-content:space-between; align-items:center;";
 
            const left = document.createElement('div');
            left.style.flex = '1';
            const title = document.createElement('div');
            title.style.fontWeight = '700';
            title.style.color = 'var(--primary)';
            title.textContent = data.style || 'N/A';
            const meta = document.createElement('div');
            meta.style.fontSize = '0.85rem';
            meta.style.color = 'var(--text-secondary)';
            meta.textContent = `Cliente: ${data.customer || 'N/A'} | Colorway: ${data.colorway || 'N/A'}`;
            const date = document.createElement('div');
            date.style.fontSize = '0.75rem';
            date.style.color = 'var(--text-muted)';
            date.textContent = `Guardado: ${new Date(data.savedAt).toLocaleDateString('es-ES')}`;
            left.appendChild(title);
            left.appendChild(meta);
            left.appendChild(date);
 
            const right = document.createElement('div');
            right.style.display = 'flex';
            right.style.gap = '8px';
 
            const loadBtn = document.createElement('button');
            loadBtn.className = 'btn btn-primary btn-sm';
            loadBtn.innerHTML = '<i class="fas fa-edit"></i> Cargar';
            loadBtn.addEventListener('click', () => {
                loadSpecData(data);
            });
 
            const delBtn = document.createElement('button');
            delBtn.className = 'btn btn-outline btn-sm';
            delBtn.innerHTML = '<i class="fas fa-trash"></i>';
            delBtn.addEventListener('click', () => {
                deleteSpec(key);
            });
 
            right.appendChild(loadBtn);
            right.appendChild(delBtn);
 
            div.appendChild(left);
            div.appendChild(right);
            list.appendChild(div);
        } catch (e) {
            console.error('Error al parsear spec:', key, e);
            localStorage.removeItem(key);
        }
    });
}
 
function loadSpecData(data) {
    // Cargar datos generales
    const setVal = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
    };
    setVal('customer', data.customer || '');
    setVal('style', data.style || '');
    setVal('folder-num', data.folder || '');
    setVal('colorway', data.colorway || '');
    setVal('season', data.season || '');
    setVal('pattern', data.pattern || '');
    setVal('po', data.po || '');
    setVal('sample-type', data.sampleType || '');
    setVal('name-team', data.nameTeam || '');
    setVal('gender', data.gender || '');
    setVal('designer', data.designer || '');
    
    // Limpiar placements actuales
    placements = [];
    const container = document.getElementById('placements-container');
    const tabs = document.getElementById('placements-tabs');
    if (container) container.innerHTML = '';
    if (tabs) tabs.innerHTML = '';
    
    // Cargar placements
    if (data.placements && Array.isArray(data.placements)) {
        data.placements.forEach((placementData, index) => {
            const placementId = index === 0 ? 1 : ++nextPlacementCounter;
            const placement = {
                ...placementData,
                id: placementId
            };
            
            placements.push(placement);
        });
    } else {
        initializePlacements();
    }
    
    // Render de todos los placements
    placements.forEach(p => renderPlacementHTML(p));
    updatePlacementsTabs();
    if (placements.length > 0) showPlacement(placements[0].id);
    
    updateClientLogo();
    showTab('spec-creator');
    showStatus('📂 Spec cargada correctamente');
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
    if (confirm('¿Eliminar TODAS las specs?')) {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('spec_')) localStorage.removeItem(key);
        });
        loadSavedSpecsList();
        updateDashboard();
        showStatus('🗑️ Todas las specs eliminadas');
    }
}
 
// ========== FUNCIONES DE ERROR LOG ==========
 
function loadErrorLog() {
    const container = document.getElementById('error-log-content');
    if (!container) return;
    
    if (!window.errorHandler) {
        container.innerHTML = '<p>ErrorHandler no disponible</p>';
        return;
    }
    
    const errors = errorHandler.getErrors();
    
    if (errors.length === 0) {
        container.innerHTML = '<p>No hay errores registrados</p>';
        return;
    }
    
    let html = `<p>Total de errores: ${errors.length}</p>`;
    errors.forEach(error => {
        html += `
            <div class="card" style="margin-bottom:10px;">
                <div class="card-body">
                    <strong>${error.context}</strong>
                    <p>${error.error.message}</p>
                    <small>${error.timestamp}</small>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}
 
function clearErrorLog() {
    if (window.errorHandler) {
        errorHandler.clearErrors();
        loadErrorLog();
        showStatus('Log limpiado');
    }
}
 
// ========== FUNCIONES DE EXPORTACIÓN (SIMPLIFICADAS POR AHORA) ==========
 
function exportPDF() {
    showStatus('⚠️ Función PDF en desarrollo', 'warning');
}
 
function exportToExcel() {
    showStatus('⚠️ Función Excel en desarrollo', 'warning');
}
 
function downloadProjectZip() {
    showStatus('⚠️ Función ZIP en desarrollo', 'warning');
}
 
function exportErrorLog() {
    showStatus('⚠️ Función exportar log en desarrollo', 'warning');
}
 
// ========== INICIALIZACIÓN ==========
 
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Configurar eventos
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
        
        // Configurar input de archivo Excel
        const excelFileInput = document.getElementById('excelFile');
        if (excelFileInput) {
            excelFileInput.addEventListener('change', function(e) {
                // Implementar manejo de archivo Excel
                showStatus('📂 Archivo seleccionado', 'info');
            });
        }
        
        // Configurar input de imagen de placement
        const placementImageInput = document.getElementById('placementImageInput');
        if (placementImageInput) {
            placementImageInput.addEventListener('change', function(e) {
                // Implementar manejo de imagen
                showStatus('🖼️ Imagen seleccionada', 'info');
            });
        }
        
        // Inicializar
        updateDateTime();
        updateDashboard();
        loadSavedSpecsList();
        
        // Cargar tema guardado
        const savedTheme = localStorage.getItem('tegraspec-theme');
        if (savedTheme === 'light') {
            isDarkMode = false;
            document.body.classList.add('light-mode');
            const themeToggleBtn = document.getElementById('themeToggle');
            if (themeToggleBtn) {
                themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
            }
        }
        
        // Actualizar hora cada minuto
        setInterval(updateDateTime, 60000);
        
        showStatus('✅ Aplicación cargada correctamente');
        
    } catch (error) {
        console.error('Error en inicialización:', error);
        showStatus('❌ Error al iniciar la aplicación', 'error');
    }
});
