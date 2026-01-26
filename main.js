
// =================================================================================
// MAIN SCRIPT - TEGRA TECHNICAL SPEC MANAGER V3.1 (CON LÓGICA DE NEGOCIO)
// =================================================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- APLICACIÓN Y ESTADO ---
    const state = {
        currentPlacementId: null,
        nextPlacementId: 1,
        placements: {}, 
        imageBlobs: {},
        currentTheme: localStorage.getItem('theme') || 'dark-mode',
        loadedTemplates: {},
    };

    // --- INICIALIZACIÓN ---
    async function initializeApp() {
        try {
            console.log("Initializing App v3.1...");
            applyTheme(state.currentTheme);
            setupGlobalEventListeners();
            await showTab('dashboard'); 
            loadInitialData();
            updateDateTime();
            setInterval(updateDateTime, 60000);
            showStatus("Aplicación iniciada y lista.", "success");
        } catch (error) {
            logError("Fallo crítico durante la inicialización: " + error.message, true);
        }
    }

    // --- CARGA DE DATOS INICIAL ---
    function loadInitialData() {
        loadTegraLogo();
        loadSavedSpecsList();
        loadErrorLog();
        updateDashboardStats();
    }
    
    // --- GESTIÓN DE LA NAVEGACIÓN Y TEMPLATES ---
    async function showTab(tabId) {
        const appContent = document.getElementById('app-content');
        if (!appContent) {
            logError("El contenedor principal 'app-content' no se encontró.", true);
            return;
        }

        try {
            if (!state.loadedTemplates[tabId]) {
                const response = await fetch(`templates/${tabId}-tab.html`);
                if (!response.ok) throw new Error(`No se pudo cargar el template: ${tabId}-tab.html`);
                state.loadedTemplates[tabId] = await response.text();
            }
            
            appContent.innerHTML = state.loadedTemplates[tabId];

            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.tab === tabId);
            });

            if (tabId === 'spec-creator') {
                restoreSpecCreatorState();
                 // Añadimos los listeners específicos de 'spec-creator' después de que se cargue el contenido
                setupSpecCreatorListeners();
            } else if (tabId === 'saved-specs') {
                loadSavedSpecsList();
            } else if (tabId === 'error-log') {
                loadErrorLog();
            }

        } catch (error) {
            logError(`Error al cambiar al tab '${tabId}': ${error.message}`, true);
            appContent.innerHTML = `<div class='card'><div class='card-body'><p style='color:var(--error);'>Error al cargar el contenido. Revise el log de errores.</p></div></div>`;
        }
    }

    // --- SETUP DE EVENT LISTENERS ---
    function setupGlobalEventListeners() {
        document.getElementById('themeToggle').addEventListener('click', toggleTheme);
        document.querySelector('.app-nav').addEventListener('click', (e) => {
            const tabElement = e.target.closest('.nav-tab');
            if (tabElement && tabElement.dataset.tab) {
                showTab(tabElement.dataset.tab);
            }
        });
    
        document.body.addEventListener('change', (e) => {
            if (e.target.id === 'excelFile') handleFileSelect(e);
            if (e.target.id === 'imageInput') handleImageUpload(e, 'mockup');
            if (e.target.id === 'placementImageInput') handleImageUpload(e, 'placement');
        });
    }

    function setupSpecCreatorListeners() {
        // Listener para la lógica de Gear for Sport
        const customerInput = document.getElementById('customer');
        const styleInput = document.getElementById('style');
        const poInput = document.getElementById('po');

        if(customerInput) customerInput.addEventListener('input', handleGearLogic);
        if(styleInput) styleInput.addEventListener('input', handleGearLogic);
        if(poInput) poInput.addEventListener('input', handleGearLogic);
    }

    // --- LÓGICA DE NEGOCIO ESPECÍFICA ---
    function handleGearLogic() {
        const customerInput = document.getElementById('customer');
        const nameTeamInput = document.getElementById('name-team');
        if (!customerInput || !nameTeamInput) return;

        if (customerInput.value.toUpperCase().trim() === 'GEAR FOR SPORT') {
            const styleInput = document.getElementById('style');
            const poInput = document.getElementById('po');
            const searchTerm = (styleInput ? styleInput.value : '') || (poInput ? poInput.value : '');
            
            if (window.Utils && typeof window.Utils.findTeamForGear === 'function') {
                const teamName = window.Utils.findTeamForGear(searchTerm);
                if (teamName) {
                    nameTeamInput.value = teamName;
                }
            }
        } 
    }

    window.handleColorValidation = (inputElement, placementId, colorIndex) => {
        if (!window.Utils || typeof window.Utils.validateColor !== 'function') return;

        const colorName = inputElement.value;
        const validationResult = window.Utils.validateColor(colorName);

        // Actualizar el estado en main.js
        state.placements[placementId].colors[colorIndex].name = validationResult.finalName;

        // Feedback visual
        inputElement.classList.remove('color-valid', 'color-invalid');
        if (colorName.length > 2) { // Evita validar strings muy cortos
            if (validationResult.isValid) {
                inputElement.classList.add('color-valid');
            } else {
                inputElement.classList.add('color-invalid');
            }
        }
    };

    // --- GESTIÓN DE PLACEMENTS (LÓGICA RESTAURADA Y MEJORADA) ---

    window.addNewPlacement = () => {
        const placementId = state.nextPlacementId++;
        state.placements[placementId] = {
            data: { id: placementId, title: `Placement ${placementId}`, type: 'PRINT', area: 'FB', size: 'N/A', specialty: 'N/A', comments: '' },
            colors: [],
            imageBase64: null, mockUpBase64: null,
        };
        state.imageBlobs[placementId] = { placement: null, mockup: null };

        renderPlacement(placementId, true);
        updateDashboardStats();
    };

    function renderPlacement(placementId, switchTab = true) {
        const placementData = state.placements[placementId];
        if (!placementData) return;

        const placementsTabs = document.getElementById('placements-tabs');
        const placementsContainer = document.getElementById('placements-container');

        const tab = document.createElement('div');
        tab.className = 'placement-tab';
        tab.dataset.id = placementId;
        tab.innerHTML = `<span class="tab-title" onclick="switchPlacementTab(${placementId})">${placementData.data.title}</span><button class="close-tab" onclick="removePlacement(${placementId})">&times;</button>`;
        placementsTabs.appendChild(tab);

        const container = document.createElement('div');
        container.id = `placement-${placementId}`;
        container.className = 'placement-content';
        container.innerHTML = `
            <div class="placement-grid">
                <div class="placement-details">
                    <div class="form-grid-placement">
                        <div class="form-group">
                            <label class="form-label">Placement Title</label>
                            <input type="text" class="form-control" value="${placementData.data.title}" oninput="state.placements[${placementId}].data.title = this.value; document.querySelector('.placement-tab[data-id=\'${placementId}\'] .tab-title').textContent = this.value;">
                        </div>
                        <div class="form-group"><label class="form-label">Type</label><select class="form-control" onchange="state.placements[${placementId}].data.type = this.value;"><option value="PRINT" ${placementData.data.type === 'PRINT' ? 'selected' : ''}>PRINT</option><option value="EMB" ${placementData.data.type === 'EMB' ? 'selected' : ''}>EMB</option><option value="TRANSFER" ${placementData.data.type === 'TRANSFER' ? 'selected' : ''}>TRANSFER</option><option value="BADGE" ${placementData.data.type === 'BADGE' ? 'selected' : ''}>BADGE</option></select></div>
                        <div class="form-group"><label class="form-label">Area</label><input type="text" class="form-control" value="${placementData.data.area}" oninput="state.placements[${placementId}].data.area = this.value;"></div>
                        <div class="form-group"><label class="form-label">Size</label><input type="text" class="form-control" value="${placementData.data.size}" oninput="state.placements[${placementId}].data.size = this.value;"></div>
                        <div class="form-group"><label class="form-label">Specialty</label><input type="text" class="form-control" value="${placementData.data.specialty}" oninput="state.placements[${placementId}].data.specialty = this.value;"></div>
                    </div>
                    <div class="form-group"><label class="form-label">Placement Comments</label><textarea class="form-control" rows="4" oninput="state.placements[${placementId}].data.comments = this.value;">${placementData.data.comments}</textarea></div>
                </div>
                <div class="placement-images">
                    <div class="image-upload-wrapper"><label class="form-label">Mockup Image</label><div class="image-preview" id="mockup-preview-${placementId}" onclick="document.getElementById('imageInput').click()">${placementData.mockUpBase64 ? `<img src="${placementData.mockUpBase64}" alt="Mockup">` : '<i class="fas fa-camera"></i>'}</div></div>
                    <div class="image-upload-wrapper"><label class="form-label">Placement Art</label><div class="image-preview" id="art-preview-${placementId}" onclick="document.getElementById('placementImageInput').click()">${placementData.imageBase64 ? `<img src="${placementData.imageBase64}" alt="Placement Art">` : '<i class="fas fa-palette"></i>'}</div></div>
                </div>
                <div class="placement-colors">
                     <label class="form-label">Color Sequence</label>
                     <table class="color-sequence-table"><thead><tr><th>#</th><th>Color Name</th><th>Code</th><th>Type</th><th></th></tr></thead><tbody id="color-sequence-body-${placementId}"></tbody></table>
                     <button type="button" class="btn btn-outline btn-sm" onclick="addPlacementColorItem(${placementId})"><i class="fas fa-plus"></i> Add Color</button>
                </div>
            </div>
            <div class="placement-actions"><button type="button" class="btn btn-secondary btn-sm" onclick="duplicatePlacement(${placementId})"><i class="fas fa-copy"></i> Duplicar</button></div>`;
        placementsContainer.appendChild(container);
        renderPlacementColors(placementId);

        if (switchTab) {
            switchPlacementTab(placementId);
        }
    }

    function renderPlacementColors(placementId) {
        const placement = state.placements[placementId];
        const tbody = document.getElementById(`color-sequence-body-${placementId}`);
        if (!placement || !tbody) return;

        tbody.innerHTML = '';
        placement.colors.forEach((color, index) => {
            const row = document.createElement('tr');
            // Integración de la validación de color en el oninput
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><input type="text" class="form-control-sm" value="${color.name}" oninput="handleColorValidation(this, ${placementId}, ${index})"></td>
                <td><input type="text" class="form-control-sm" value="${color.code}" oninput="state.placements[${placementId}].colors[${index}].code = this.value"></td>
                <td>
                    <select class="form-control-sm" onchange="state.placements[${placementId}].colors[${index}].type = this.value">
                        <option value="Color" ${color.type === 'Color' ? 'selected' : ''}>Color</option>
                        <option value="Blocker" ${color.type === 'Blocker' ? 'selected' : ''}>Blocker</option>
                        <option value="White Base" ${color.type === 'White Base' ? 'selected' : ''}>White Base</option>
                    </select>
                </td>
                <td><button class="btn btn-danger btn-sm" onclick="removePlacementColorItem(${placementId}, ${index})">&times;</button></td>
            `;
            tbody.appendChild(row);
            // Re-evaluar el estado visual después de renderizar
            const input = row.querySelector('input[type="text"]');
            if (input) handleColorValidation(input, placementId, index);
        });
    }

    window.addPlacementColorItem = (placementId) => {
        state.placements[placementId].colors.push({ name: '', code: '', type: 'Color' });
        renderPlacementColors(placementId);
    };

    // (El resto de las funciones de placement y UI helpers permanecen mayormente igual...)

    window.removePlacementColorItem = (placementId, index) => {
        state.placements[placementId].colors.splice(index, 1);
        renderPlacementColors(placementId);
    };

    window.switchPlacementTab = (placementId) => {
        state.currentPlacementId = placementId;
        document.querySelectorAll('.placement-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.placement-tab[data-id='${placementId}']`)?.classList.add('active');
        
        document.querySelectorAll('.placement-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`placement-${placementId}`)?.classList.add('active');
    };

    window.removePlacement = (placementId) => {
        if (Object.keys(state.placements).length <= 1) {
            showStatus("Debe haber al menos un placement.", "warning");
            return;
        }

        delete state.placements[placementId];
        delete state.imageBlobs[placementId];

        document.querySelector(`.placement-tab[data-id='${placementId}']`)?.remove();
        document.getElementById(`placement-${placementId}`)?.remove();

        if (state.currentPlacementId === placementId) {
            const firstRemainingId = Object.keys(state.placements)[0];
            if (firstRemainingId) switchPlacementTab(Number(firstRemainingId));
            else state.currentPlacementId = null;
        }
        updateDashboardStats();
    };
    
    window.duplicatePlacement = (placementId) => {
        const originalPlacement = state.placements[placementId];
        if (!originalPlacement) return;

        const newId = state.nextPlacementId++;
        const newPlacement = JSON.parse(JSON.stringify(originalPlacement));
        newPlacement.data.id = newId;
        newPlacement.data.title = `${originalPlacement.data.title} (Copia)`;
        
        state.placements[newId] = newPlacement;
        state.imageBlobs[newId] = JSON.parse(JSON.stringify(state.imageBlobs[placementId]));
        
        renderPlacement(newId, true);
        showStatus(`Placement "${originalPlacement.data.title}" duplicado.`, "success");
    };

    function restoreSpecCreatorState() {
        const placementsContainer = document.getElementById('placements-container');
        const placementsTabs = document.getElementById('placements-tabs');
        if (!placementsContainer || !placementsTabs) return;

        placementsContainer.innerHTML = '';
        placementsTabs.innerHTML = '';

        if (Object.keys(state.placements).length === 0) {
            addNewPlacement();
        } else {
            Object.keys(state.placements).forEach(pId => {
                renderPlacement(pId, false);
            });
            if (state.currentPlacementId) {
                switchPlacementTab(state.currentPlacementId);
            } else {
                const firstId = Object.keys(state.placements)[0];
                if(firstId) switchPlacementTab(firstId);
            }
        }
    }

    // ... (El resto del código como clearForm, UI helpers, imágenes, logs, etc. se mantiene) ...
    // Asegúrate de que las funciones existentes permanezcan aquí.

    // --- UI HELPERS ---
    function loadTegraLogo() {
        const appLogo = document.getElementById('app-logo');
        if (appLogo && window.LogoConfig && window.LogoConfig.TEGRA) {
            appLogo.innerHTML = `<img src="${window.LogoConfig.TEGRA}" alt="Tegra Logo" style="height: 40px;">`;
        } else if(appLogo) {
            logError("Logo de Tegra no encontrado en 'config-logos.js'.", true);
            appLogo.innerHTML = '<p style="color:yellow;">Error: Logo</p>';
        }
    }
    
    function updateClientLogo() {
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
    }

    function applyTheme(theme) {
        document.body.className = theme;
        state.currentTheme = theme;
        localStorage.setItem('theme', theme);
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
             themeToggle.innerHTML = theme === 'dark-mode' 
                ? '<i class="fas fa-sun"></i> Modo Claro' 
                : '<i class="fas fa-moon"></i> Modo Oscuro';
        }
    }

    function toggleTheme() {
        const newTheme = state.currentTheme === 'dark-mode' ? 'light-mode' : 'dark-mode';
        applyTheme(newTheme);
    }

    function updateDateTime() {
        const dateTimeEl = document.getElementById('current-datetime');
        if(dateTimeEl) {
            dateTimeEl.textContent = new Date().toLocaleString('es-HN', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        }
    }

    function showStatus(message, type = 'info', duration = 3000) {
        const statusMessage = document.getElementById('statusMessage');
        if (!statusMessage) return;
        statusMessage.textContent = message;
        statusMessage.className = `status-message status-${type} show`;
        setTimeout(() => {
            statusMessage.classList.remove('show');
        }, duration);
    }

    // --- MANEJO DE IMÁGENES ---
    function handleImageUpload(event, imageType) {
        const file = event.target.files[0];
        if (!file || !state.currentPlacementId) return;

        const placementId = state.currentPlacementId;
        state.imageBlobs[placementId][imageType] = file;

        convertFileToBase64(file, (base64) => {
            const previewId = imageType === 'mockup' ? `mockup-preview-${placementId}` : `art-preview-${placementId}`;
            const previewEl = document.getElementById(previewId);

            if (imageType === 'mockup') {
                state.placements[placementId].mockUpBase64 = base64;
            } else {
                state.placements[placementId].imageBase64 = base64;
            }
            
            if (previewEl) {
                previewEl.innerHTML = `<img src="${base64}" alt="${imageType} preview">`;
            }
            showStatus(`Imagen de ${imageType} cargada.`, 'success');
        });
        
        event.target.value = '';
    }
    
    function convertFileToBase64(file, callback) {
        const reader = new FileReader();
        reader.onload = () => callback(reader.result);
        reader.onerror = (error) => logError("Error al leer el archivo de imagen: " + error, true);
        reader.readAsDataURL(file);
    }

    // --- GESTIÓN DE SPECS GUARDADAS ---
    window.saveCurrentSpec = () => { /* Implementación pendiente */ showStatus("Función no implementada", "warning");};
    window.loadSavedSpecsList = () => { /* Se ejecuta al cargar el tab */ };
    window.loadSpec = (key) => { /* Implementación pendiente */ };
    window.deleteSpec = (key) => { /* Implementación pendiente */ };
    window.clearAllSpecs = () => { /* Implementación pendiente */ };

    // --- LOG DE ERRORES ---
    function logError(message, showAlert = false) {
        console.error(message);
        try {
            const log = JSON.parse(localStorage.getItem('errorLog') || '[]');
            log.unshift({ time: new Date().toISOString(), message });
            if (log.length > 100) log.pop();
            localStorage.setItem('errorLog', JSON.stringify(log));
            if (showAlert) showStatus(message, "error", 5000);
            
            const errorLogContent = document.getElementById('error-log-content');
            if (errorLogContent) loadErrorLog();

        } catch (e) {
            console.error("No se pudo escribir en el log de errores:", e);
        }
    }

    function loadErrorLog() {
        const errorLogContent = document.getElementById('error-log-content');
        if (!errorLogContent) return;
        try {
            const log = JSON.parse(localStorage.getItem('errorLog') || '[]');
            errorLogContent.innerHTML = log.length === 0
                ? '<p>No hay errores registrados.</p>'
                : log.map(e => `<div class="error-item"><strong>${new Date(e.time).toLocaleString()}:</strong> ${e.message}</div>`).join('');
        } catch (e) {
            errorLogContent.innerHTML = '<p>Error al cargar el log de errores.</p>';
        }
    }

    window.clearErrorLog = () => {
        localStorage.removeItem('errorLog');
        loadErrorLog();
        showStatus("Log de errores limpiado.", "info");
    };
    
    // --- ESTADÍSTICAS ---
    function updateDashboardStats() {
        const totalSpecs = Object.keys(localStorage).filter(k => k.startsWith('spec_')).length;
        const totalSpecsEl = document.getElementById('total-specs');
        if (totalSpecsEl) totalSpecsEl.textContent = totalSpecs;
        
        const totalPlacements = Object.keys(state.placements).length;
        const totalPlacementsEl = document.getElementById('total-placements');
        if (totalPlacementsEl) totalPlacementsEl.textContent = totalPlacements;
    }

    // --- FUNCIONES DE EXPORTACIÓN ---
    function generateEditablePDF() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'letter' });
        showStatus("Iniciando generación de PDF editable...", "info");
        logError("La función generateEditablePDF aún no está implementada.", false);
        pdf.setFontSize(18);
        pdf.text("Reporte de Spec Técnica (Editable)", 105, 20, { align: 'center' });
        pdf.setFontSize(12);
        pdf.text("Esta funcionalidad está en desarrollo.", 105, 40, { align: 'center' });
        pdf.text("Los datos del formulario se insertarán aquí como texto y tablas.", 105, 50, { align: 'center' });
        pdf.save("spec_editable_en_progreso.pdf");
        showStatus("Versión preliminar del PDF generada.", "warning");
    }

    window.exportPDF = async () => {
        showStatus("Generando PDF (versión editable en progreso)...", "info", 5000);
        generateEditablePDF();
    };
    
    window.exportToExcel = () => showStatus("Función no implementada.", "warning");
    window.downloadProjectZip = () => showStatus("Función no implementada.", "warning");
    window.handleFileSelect = (e) => showStatus("Carga de archivos no implementada.", "warning");

    // --- INICIAR LA APLICACIÓN ---
    initializeApp();
});
