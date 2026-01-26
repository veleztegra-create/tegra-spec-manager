// =================================================================================
// MAIN SCRIPT - TEGRA TECHNICAL SPEC MANAGER V4.0 (RESTAURADO)
// Lógica basada en la funcionalidad original de index-old.html
// =================================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- ESTADO GLOBAL DE LA APLICACIÓN ---
    const state = {
        currentPlacementId: null,
        nextPlacementId: 1,
        placements: {}, // { id: { data, imageBase64, mockUpBase64, colors: [] } }
        imageBlobs: {},   // Almacena los objetos File para subida/descarga
        currentTheme: localStorage.getItem('theme') || 'dark-mode',
        loadedTemplates: {}, // Cache para los templates HTML
    };

    // --- INICIALIZACIÓN DE LA APLICACIÓN ---
    async function initializeApp() {
        try {
            console.log("Initializing App v4.0 (Restored Logic)...");
            
            // Restaurar tema y listeners globales que no dependen de la pestaña
            applyTheme(state.currentTheme);
            document.getElementById('themeToggle').addEventListener('click', toggleTheme);
            document.querySelector('.app-nav').addEventListener('click', handleNavigation);
            
            // Cargar la pestaña de dashboard por defecto
            await showTab('dashboard');
            
            // Cargar datos que viven fuera del contenido principal
            loadTegraLogo();
            updateDateTime();
            setInterval(updateDateTime, 60000);

            showStatus("Aplicación restaurada y lista.", "success");
        } catch (error) {
            logError("Fallo crítico durante la inicialización: " + error.message, true);
        }
    }

    // --- NAVEGACIÓN Y CARGA DE PESTAÑAS ---
    async function showTab(tabId) {
        const appContent = document.getElementById('app-content');
        if (!appContent) {
            logError("El contenedor principal 'app-content' no se encontró.", true);
            return;
        }

        try {
            // Cargar template desde cache o fetch
            if (!state.loadedTemplates[tabId]) {
                const response = await fetch(`templates/${tabId}-tab.html`);
                if (!response.ok) throw new Error(`No se pudo cargar el template: ${tabId}-tab.html`);
                state.loadedTemplates[tabId] = await response.text();
            }
            appContent.innerHTML = state.loadedTemplates[tabId];

            // Actualizar estado visual de la navegación
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.tab === tabId);
            });

            // Ejecutar lógica específica para cada pestaña DESPUÉS de cargar su contenido
            switch (tabId) {
                case 'spec-creator':
                    restoreSpecCreatorState();
                    break;
                case 'saved-specs':
                    loadSavedSpecsList();
                    break;
                case 'error-log':
                    loadErrorLog();
                    break;
                case 'dashboard':
                    updateDashboardStats();
                    break;
            }
        } catch (error) {
            logError(`Error al cambiar al tab '${tabId}': ${error.message}`, true);
        }
    }
    
    function handleNavigation(e) {
        const tabElement = e.target.closest('.nav-tab');
        if (tabElement && tabElement.dataset.tab) {
            showTab(tabElement.dataset.tab);
        }
    }

    // --- FUNCIONES GLOBALES (ACCESIBLES DESDE EL HTML) ---
    // Estas funciones se asignan a `window` para que los `oninput`/`onchange` las encuentren.

    window.updateClientLogo = () => {
        const customerInput = document.getElementById('customer');
        const logoClienteImg = document.getElementById('logoCliente');
        if(!customerInput || !logoClienteImg) return;

        const customerName = customerInput.value.trim().toUpperCase();
        const clientKey = customerName.replace(/[&. ]/g, '_');
        
        if (window.LogoConfig && LogoConfig[clientKey]) {
            logoClienteImg.src = LogoConfig[clientKey];
            logoClienteImg.style.display = 'block';
        } else {
            logoClienteImg.style.display = 'none';
            logoClienteImg.src = '';
        }
    };

    window.handleGearForSportLogic = () => {
        const customerInput = document.getElementById('customer');
        const nameTeamInput = document.getElementById('name-team');
        if (!customerInput || !nameTeamInput) return;

        if (customerInput.value.toUpperCase().trim() === 'GEAR FOR SPORT') {
            const styleInput = document.getElementById('style');
            const poInput = document.getElementById('po');
            const searchTerm = (styleInput?.value || '') || (poInput?.value || '');
            
            if (window.AppConfig && window.AppConfig.GEARFORSPORT_TEAM_MAP) {
                const teamName = Object.keys(window.AppConfig.GEARFORSPORT_TEAM_MAP).find(key => searchTerm.toUpperCase().includes(key));
                if (teamName) {
                    nameTeamInput.value = window.AppConfig.GEARFORSPORT_TEAM_MAP[teamName];
                }
            }
        }
    };
    
    window.validateColorName = (inputElement, placementId, colorIndex) => {
        if (!window.AppConfig || !window.AppConfig.COLOR_DATABASES) return;

        const colorName = inputElement.value.toUpperCase().trim();
        const { PANTONE, GEARFORSPORT, INSTITUCIONAL } = window.AppConfig.COLOR_DATABASES;

        let isValid = false;
        if (PANTONE[colorName] || (GEARFORSPORT && GEARFORSPORT[colorName]) || (INSTITUCIONAL && INSTITUCIONAL[colorName])) {
            isValid = true;
        }

        // Feedback visual directo como en el original
        inputElement.classList.remove('color-valid', 'color-invalid');
        if (inputElement.value.length > 2) {
            inputElement.classList.add(isValid ? 'color-valid' : 'color-invalid');
        }

        // Actualizar el estado
        if (state.placements[placementId] && state.placements[placementId].colors[colorIndex]) {
            state.placements[placementId].colors[colorIndex].name = inputElement.value;
        }
    };

    window.addNewPlacement = () => {
        const placementId = state.nextPlacementId++;
        state.placements[placementId] = {
            data: { id: placementId, title: `Placement ${placementId}`, type: 'PRINT', area: 'FB', size: 'N/A', specialty: 'N/A', comments: '' },
            colors: [{ name: '', code: '', type: 'Color' }], // Empezar con un color
            imageBase64: null, mockUpBase64: null
        };
        state.imageBlobs[placementId] = { placement: null, mockup: null };
        renderPlacement(placementId, true);
        updateDashboardStats();
    };

    window.addPlacementColorItem = (placementId) => {
        if (!state.placements[placementId]) return;
        state.placements[placementId].colors.push({ name: '', code: '', type: 'Color' });
        renderPlacementColors(placementId);
    };
    
    // --- LÓGICA DE RENDERIZADO DEL SPEC-CREATOR ---

    function restoreSpecCreatorState() {
        const placementsContainer = document.getElementById('placements-container');
        const placementsTabs = document.getElementById('placements-tabs');
        if (!placementsContainer || !placementsTabs) return;

        placementsContainer.innerHTML = '';
        placementsTabs.innerHTML = '';

        if (Object.keys(state.placements).length === 0) {
            addNewPlacement();
        } else {
            Object.keys(state.placements).forEach(pId => renderPlacement(pId, false));
            const idToSelect = state.currentPlacementId || Object.keys(state.placements)[0];
            if (idToSelect) switchPlacementTab(idToSelect);
        }
        updateClientLogo(); // Asegura que el logo se muestre al recargar
    }

    function renderPlacement(placementId, switchTab = true) {
        const placementData = state.placements[placementId];
        if (!placementData) return;

        const placementsTabs = document.getElementById('placements-tabs');
        const placementsContainer = document.getElementById('placements-container');

        // Crear y añadir el tab
        const tabHTML = `<span class="tab-title" onclick="switchPlacementTab(${placementId})">${placementData.data.title}</span><button class="close-tab" onclick="removePlacement(${placementId})">&times;</button>`;
        let tab = placementsTabs.querySelector(`[data-id='${placementId}']`);
        if (!tab) {
            tab = document.createElement('div');
            tab.className = 'placement-tab';
            tab.dataset.id = placementId;
            placementsTabs.appendChild(tab);
        }
        tab.innerHTML = tabHTML;

        // Crear y añadir el contenido del placement
        const containerHTML = createPlacementHTML(placementId, placementData);
        let container = document.getElementById(`placement-${placementId}`);
        if (!container) {
            container = document.createElement('div');
            container.id = `placement-${placementId}`;
            container.className = 'placement-content';
            placementsContainer.appendChild(container);
        }
        container.innerHTML = containerHTML;
        
        renderPlacementColors(placementId);

        if (switchTab) {
            switchPlacementTab(placementId);
        }
    }
    
    // Función para generar el HTML de un solo placement (basado en el viejo index)
    function createPlacementHTML(id, p) {
        return `
            <div class="placement-grid">
                <div class="placement-details">
                    <div class="form-grid-placement">
                        <div class="form-group"><label>Title</label><input type="text" class="form-control" value="${p.data.title}" oninput="updatePlacementData(${id}, 'title', this.value)"></div>
                        <div class="form-group"><label>Type</label><select class="form-control" onchange="updatePlacementData(${id}, 'type', this.value)"><option value="PRINT" ${p.data.type === 'PRINT' ? 'selected' : ''}>PRINT</option><option value="EMB" ${p.data.type === 'EMB' ? 'selected' : ''}>EMB</option><option value="TRANSFER" ${p.data.type === 'TRANSFER' ? 'selected' : ''}>TRANSFER</option><option value="BADGE" ${p.data.type === 'BADGE' ? 'selected' : ''}>BADGE</option></select></div>
                        <div class="form-group"><label>Area</label><input type="text" class="form-control" value="${p.data.area}" oninput="updatePlacementData(${id}, 'area', this.value)"></div>
                        <div class="form-group"><label>Size</label><input type="text" class="form-control" value="${p.data.size}" oninput="updatePlacementData(${id}, 'size', this.value)"></div>
                        <div class="form-group"><label>Specialty</label><input type="text" class="form-control" value="${p.data.specialty}" oninput="updatePlacementData(${id}, 'specialty', this.value)"></div>
                    </div>
                    <div class="form-group"><label>Comments</label><textarea class="form-control" oninput="updatePlacementData(${id}, 'comments', this.value)">${p.data.comments}</textarea></div>
                </div>
                <div class="placement-images">
                     <div class="image-upload-wrapper"><label class="form-label">Mockup Image</label><div class="image-preview" id="mockup-preview-${id}" onclick="triggerImageUpload(${id}, 'mockup')">${p.mockUpBase64 ? `<img src="${p.mockUpBase64}">` : '<i class="fas fa-camera"></i>'}</div></div>
                     <div class="image-upload-wrapper"><label class="form-label">Placement Art</label><div class="image-preview" id="art-preview-${id}" onclick="triggerImageUpload(${id}, 'placement')">${p.imageBase64 ? `<img src="${p.imageBase64}">` : '<i class="fas fa-palette"></i>'}</div></div>
                </div>
                <div class="placement-colors">
                     <label class="form-label">Color Sequence</label>
                     <table class="color-sequence-table"><thead><tr><th>#</th><th>Color Name</th><th>Code</th><th>Type</th><th></th></tr></thead><tbody id="color-sequence-body-${id}"></tbody></table>
                     <button type="button" class="btn btn-outline btn-sm" onclick="addPlacementColorItem(${id})"><i class="fas fa-plus"></i> Add Color</button>
                </div>
            </div>
             <input type="file" id="image-input-${id}-mockup" class="hidden-file-input" accept="image/*" onchange="handleImageUpload(event, ${id}, 'mockup')">
             <input type="file" id="image-input-${id}-placement" class="hidden-file-input" accept="image/*" onchange="handleImageUpload(event, ${id}, 'placement')">
        `;
    }

    function renderPlacementColors(placementId) {
        const placement = state.placements[placementId];
        const tbody = document.getElementById(`color-sequence-body-${placementId}`);
        if (!placement || !tbody) return;
        tbody.innerHTML = '';
        placement.colors.forEach((color, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><input type="text" class="form-control-sm" value="${color.name}" oninput="validateColorName(this, ${placementId}, ${index})"></td>
                <td><input type="text" class="form-control-sm" value="${color.code}" oninput="updateColorData(${placementId}, ${index}, 'code', this.value)"></td>
                <td>
                    <select class="form-control-sm" onchange="updateColorData(${placementId}, ${index}, 'type', this.value)">
                        <option value="Color" ${color.type === 'Color' ? 'selected' : ''}>Color</option>
                        <option value="Blocker" ${color.type === 'Blocker' ? 'selected' : ''}>Blocker</option>
                        <option value="White Base" ${color.type === 'White Base' ? 'selected' : ''}>White Base</option>
                    </select>
                </td>
                <td><button class="btn btn-danger btn-sm" onclick="removePlacementColorItem(${placementId}, ${index})">&times;</button></td>
            `;
            tbody.appendChild(row);
        });
    }

    // --- FUNCIONES DE MANIPULACIÓN DE DATOS (ACCEDIDAS DESDE EL HTML) ---
    
    window.updatePlacementData = (placementId, field, value) => {
        if (state.placements[placementId]) {
            state.placements[placementId].data[field] = value;
            // Actualizar el título del tab si es necesario
            if (field === 'title') {
                const tabTitle = document.querySelector(`.placement-tab[data-id='${placementId}'] .tab-title`);
                if (tabTitle) tabTitle.textContent = value;
            }
        }
    };

    window.updateColorData = (placementId, colorIndex, field, value) => {
        if (state.placements[placementId] && state.placements[placementId].colors[colorIndex]) {
            state.placements[placementId].colors[colorIndex][field] = value;
        }
    };

    window.removePlacementColorItem = (placementId, index) => {
        if (!state.placements[placementId]) return;
        state.placements[placementId].colors.splice(index, 1);
        renderPlacementColors(placementId);
    };

    window.switchPlacementTab = (placementId) => {
        state.currentPlacementId = placementId;
        document.querySelectorAll('.placement-tab').forEach(t => t.classList.toggle('active', t.dataset.id == placementId));
        document.querySelectorAll('.placement-content').forEach(c => c.classList.toggle('active', c.id === `placement-${placementId}`));
    };

    window.removePlacement = (placementId) => {
        if (Object.keys(state.placements).length <= 1) {
            showStatus("Debe haber al menos un placement.", "warning");
            return;
        }

        document.querySelector(`.placement-tab[data-id='${placementId}']`)?.remove();
        document.getElementById(`placement-${placementId}`)?.remove();
        
        delete state.placements[placementId];
        delete state.imageBlobs[placementId];

        if (state.currentPlacementId == placementId) {
            const firstRemainingId = Object.keys(state.placements)[0];
            switchPlacementTab(firstRemainingId || null);
        }
        updateDashboardStats();
    };

    // --- MANEJO DE IMÁGENES ---
    window.triggerImageUpload = (placementId, imageType) => {
        // Necesitamos asegurarnos de que el tab esté activo para que el input exista
        switchPlacementTab(placementId);
        document.getElementById(`image-input-${placementId}-${imageType}`)?.click();
    };

    window.handleImageUpload = (event, placementId, imageType) => {
        const file = event.target.files[0];
        if (!file) return;

        state.imageBlobs[placementId][imageType] = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            if(imageType === 'mockup') state.placements[placementId].mockUpBase64 = base64;
            else state.placements[placementId].imageBase64 = base64;

            const previewEl = document.getElementById(imageType === 'mockup' ? `mockup-preview-${placementId}` : `art-preview-${placementId}`);
            if(previewEl) previewEl.innerHTML = `<img src="${base64}" alt="Preview">`;
            showStatus(`${imageType.charAt(0).toUpperCase() + imageType.slice(1)} image loaded.`, 'success');
        };
        reader.readAsDataURL(file);
        event.target.value = ''; // Permite recargar la misma imagen
    };

    // --- FUNCIONES DE ACCIÓN GLOBAL ---
    window.clearForm = () => {
        state.placements = {};
        state.imageBlobs = {};
        state.nextPlacementId = 1;
        state.currentPlacementId = null;
        showTab('spec-creator'); // Recarga el tab para un estado limpio
        showStatus("Formulario limpiado.", "info");
    };

    // --- HELPERS Y UI ---
    function loadTegraLogo() {
        const appLogo = document.getElementById('app-logo');
        if (appLogo && window.LogoConfig && window.LogoConfig.TEGRA) {
            appLogo.innerHTML = `<img src="${window.Logo-config.js}" alt="Tegra Logo">`;
        }
    }

    function updateDateTime() {
        const el = document.getElementById('current-datetime');
        if (el) el.textContent = new Date().toLocaleString('es-HN', { dateStyle: 'long', timeStyle: 'short' });
    }

    function applyTheme(theme) {
        document.body.className = theme;
        state.currentTheme = theme;
        localStorage.setItem('theme', theme);
        const btn = document.getElementById('themeToggle');
        if(btn) btn.innerHTML = theme === 'dark-mode' ? '<i class="fas fa-sun"></i> Modo Claro' : '<i class="fas fa-moon"></i> Modo Oscuro';
    }

    window.toggleTheme = () => applyTheme(state.currentTheme === 'dark-mode' ? 'light-mode' : 'dark-mode');

    function showStatus(message, type = 'info', duration = 3500) {
        const el = document.getElementById('statusMessage');
        if (!el) return;
        el.textContent = message;
        el.className = `status-message status-${type} show`;
        setTimeout(() => { el.classList.remove('show'); }, duration);
    }
    
    // --- PLACEHOLDERS PARA FUNCIONALIDAD FUTURA ---
    window.exportPDF = () => { logError("PDF export no implementado en V4.", true); };
    window.exportToExcel = () => { logError("Excel export no implementado en V4.", true); };
    window.downloadProjectZip = () => { logError("ZIP download no implementado en V4.", true); };
    window.loadSavedSpecsList = () => { /* Cargar specs guardadas */ };
    window.updateDashboardStats = () => { /* Actualizar stats */ };
    window.loadErrorLog = () => { /* Cargar log */ };
    window.logError = (message, showAlert) => {
        console.error(message);
        if (showAlert) showStatus(message, 'error');
    }

    // --- INICIAR LA APLICACIÓN ---
    initializeApp();
});
