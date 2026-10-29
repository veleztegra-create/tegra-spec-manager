// =================================================================================
// MAIN SCRIPT - TEGRA TECHNICAL SPEC MANAGER V4.2 (PDF COMPLETO)
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
            console.log("Initializing App v4.2 (Full PDF Export)...");
            applyTheme(state.currentTheme);
            document.getElementById('themeToggle').addEventListener('click', toggleTheme);
            document.querySelector('.app-nav').addEventListener('click', handleNavigation);
            
            await showTab('dashboard');
            
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
        if (!appContent) { logError("El contenedor 'app-content' no se encontró.", true); return; }
        try {
            if (!state.loadedTemplates[tabId]) {
                const response = await fetch(`templates/${tabId}-tab.html`);
                if (!response.ok) throw new Error(`No se pudo cargar el template: ${tabId}-tab.html`);
                state.loadedTemplates[tabId] = await response.text();
            }
            appContent.innerHTML = state.loadedTemplates[tabId];

            document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === tabId));

            switch (tabId) {
                case 'spec-creator':
                    restoreSpecCreatorState();
                    const specDateInput = document.getElementById('spec-date');
                    if (specDateInput && !specDateInput.value) specDateInput.value = new Date().toISOString().slice(0, 10);
                    break;
                case 'saved-specs': loadSavedSpecsList(); break;
                case 'error-log': loadErrorLog(); break;
                case 'dashboard': updateDashboardStats(); break;
            }
        } catch (error) {
            logError(`Error al cambiar al tab '${tabId}': ${error.message}`, true);
        }
    }
    
    function handleNavigation(e) {
        const tabElement = e.target.closest('.nav-tab');
        if (tabElement?.dataset.tab) showTab(tabElement.dataset.tab);
    }

    // --- FUNCIONES GLOBALES (ACCESIBLES DESDE EL HTML) ---
    window.updateClientLogo = () => {
        const customerInput = document.getElementById('customer');
        const logoClienteImg = document.getElementById('logoCliente');
        if(!customerInput || !logoClienteImg) return;
        const customerName = customerInput.value.trim().toUpperCase();
        const clientKey = customerName.replace(/[&. ]/g, '_');
        logoClienteImg.src = (window.LogoConfig && LogoConfig[clientKey]) ? LogoConfig[clientKey] : '';
        logoClienteImg.style.display = logoClienteImg.src ? 'block' : 'none';
    };

    window.handleGearForSportLogic = () => {
        const customerInput = document.getElementById('customer');
        const nameTeamInput = document.getElementById('name-team');
        if (!customerInput || !nameTeamInput || customerInput.value.toUpperCase().trim() !== 'GEAR FOR SPORT') return;
        const styleInput = document.getElementById('style');
        const poInput = document.getElementById('po');
        const searchTerm = (styleInput?.value || '') || (poInput?.value || '');
        if (window.AppConfig && window.AppConfig.GEARFORSPORT_TEAM_MAP) {
            const teamKey = Object.keys(window.AppConfig.GEARFORSPORT_TEAM_MAP).find(key => searchTerm.toUpperCase().includes(key));
            if (teamKey) nameTeamInput.value = window.AppConfig.GEARFORSPORT_TEAM_MAP[teamKey];
        }
    };
    
    window.validateColorName = (inputElement, placementId, colorIndex) => {
        if (!window.AppConfig || !window.AppConfig.COLOR_DATABASES) return;
        const colorName = inputElement.value.toUpperCase().trim();
        const { PANTONE, GEARFORSPORT, INSTITUCIONAL } = window.AppConfig.COLOR_DATABASES;
        const isValid = !!(PANTONE[colorName] || (GEARFORSPORT && GEARFORSPORT[colorName]) || (INSTITUCIONAL && INSTITUCIONAL[colorName]));
        inputElement.classList.remove('color-valid', 'color-invalid');
        if (inputElement.value.length > 2) inputElement.classList.add(isValid ? 'color-valid' : 'color-invalid');
        if (state.placements[placementId]?.colors[colorIndex]) state.placements[placementId].colors[colorIndex].name = inputElement.value;
    };

    // --- GESTIÓN DE PLACEMENTS ---
    window.addNewPlacement = () => {
        const id = state.nextPlacementId++;
        state.placements[id] = { data: { id, title: `Placement ${id}`, type: 'PRINT', area: 'FB', size: 'N/A', specialty: 'N/A', comments: '' }, colors: [{ name: '', code: '', type: 'Color' }], imageBase64: null, mockUpBase64: null };
        state.imageBlobs[id] = { placement: null, mockup: null };
        renderPlacement(id, true); updateDashboardStats();
    };

    function restoreSpecCreatorState() {
        const placementsContainer = document.getElementById('placements-container');
        const placementsTabs = document.getElementById('placements-tabs');
        if (!placementsContainer || !placementsTabs) return;
        placementsContainer.innerHTML = ''; placementsTabs.innerHTML = '';
        if (Object.keys(state.placements).length === 0) addNewPlacement();
        else {
            Object.keys(state.placements).forEach(pId => renderPlacement(pId, false));
            const idToSelect = state.currentPlacementId || Object.keys(state.placements)[0];
            if (idToSelect) switchPlacementTab(idToSelect);
        }
        updateClientLogo();
    }

    function renderPlacement(id, switchTab = true) {
        const pData = state.placements[id]; if (!pData) return;
        const placementsTabs = document.getElementById('placements-tabs');
        const placementsContainer = document.getElementById('placements-container');
        let tab = placementsTabs.querySelector(`[data-id='${id}']`);
        if (!tab) { tab = document.createElement('div'); tab.className = 'placement-tab'; tab.dataset.id = id; placementsTabs.appendChild(tab); }
        tab.innerHTML = `<span class="tab-title" onclick="switchPlacementTab(${id})">${pData.data.title}</span><button class="close-tab" onclick="removePlacement(${id})">&times;</button>`;
        let container = document.getElementById(`placement-${id}`);
        if (!container) { container = document.createElement('div'); container.id = `placement-${id}`; container.className = 'placement-content'; placementsContainer.appendChild(container); }
        container.innerHTML = createPlacementHTML(id, pData);
        renderPlacementColors(id);
        if (switchTab) switchPlacementTab(id);
    }
    
    function createPlacementHTML(id, p) {
        // HTML interno de un placement (reducido por brevedad)
        return `
            <div class="placement-grid">
                <div class="placement-details">
                    <div class="form-grid-placement">
                        <div class="form-group"><label>Title</label><input type="text" class="form-control" value="${p.data.title}" oninput="updatePlacementData(${id}, 'title', this.value)"></div>
                        <div class="form-group"><label>Type</label><select class="form-control" onchange="updatePlacementData(${id}, 'type', this.value)"><option value="PRINT">PRINT</option><option value="EMB">EMB</option></select></div>
                        <div class="form-group"><label>Area</label><input type="text" class="form-control" value="${p.data.area}" oninput="updatePlacementData(${id}, 'area', this.value)"></div>
                        <div class="form-group"><label>Size</label><input type="text" class="form-control" value="${p.data.size}" oninput="updatePlacementData(${id}, 'size', this.value)"></div>
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
        const p = state.placements[placementId];
        const tbody = document.getElementById(`color-sequence-body-${placementId}`);
        if (!p || !tbody) return; tbody.innerHTML = '';
        p.colors.forEach((color, index) => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><input type="text" class="form-control-sm" value="${color.name}" oninput="validateColorName(this, ${placementId}, ${index})"></td>
                <td><input type="text" class="form-control-sm" value="${color.code}" oninput="updateColorData(${placementId}, ${index}, 'code', this.value)"></td>
                <td><select class="form-control-sm" onchange="updateColorData(${placementId}, ${index}, 'type', this.value)"><option>Color</option><option>Blocker</option></select></td>
                <td><button class="btn btn-danger btn-sm" onclick="removePlacementColorItem(${placementId}, ${index})">&times;</button></td>
            `;
        });
    }

    window.addPlacementColorItem = (id) => { if(state.placements[id]) { state.placements[id].colors.push({ name: '', code: '', type: 'Color' }); renderPlacementColors(id); }};
    window.removePlacementColorItem = (id, index) => { if(state.placements[id]) { state.placements[id].colors.splice(index, 1); renderPlacementColors(id); }};
    window.updatePlacementData = (id, field, value) => { if (state.placements[id]) { state.placements[id].data[field] = value; if (field === 'title') document.querySelector(`.placement-tab[data-id='${id}'] .tab-title`).textContent = value; }};
    window.updateColorData = (id, i, f, v) => { if (state.placements[id]?.colors[i]) state.placements[id].colors[i][f] = v; };
    window.switchPlacementTab = (id) => { state.currentPlacementId = id; document.querySelectorAll('.placement-tab').forEach(t => t.classList.toggle('active', t.dataset.id == id)); document.querySelectorAll('.placement-content').forEach(c => c.classList.toggle('active', c.id === `placement-${id}`)); };
    window.removePlacement = (id) => { if (Object.keys(state.placements).length <= 1) { showStatus("Debe haber al menos un placement.", "warning"); return; } document.querySelector(`.placement-tab[data-id='${id}']`)?.remove(); document.getElementById(`placement-${id}`)?.remove(); delete state.placements[id]; delete state.imageBlobs[id]; if (state.currentPlacementId == id) switchPlacementTab(Object.keys(state.placements)[0] || null); updateDashboardStats(); };

    // --- MANEJO DE IMÁGENES ---
    window.triggerImageUpload = (id, type) => { switchPlacementTab(id); document.getElementById(`image-input-${id}-${type}`)?.click(); };
    window.handleImageUpload = (event, id, type) => {
        const file = event.target.files[0]; if (!file) return; state.imageBlobs[id][type] = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            if(type === 'mockup') state.placements[id].mockUpBase64 = base64; else state.placements[id].imageBase64 = base64;
            document.getElementById(`${type}-preview-${id}`).innerHTML = `<img src="${base64}" alt="Preview">`;
            showStatus(`${type.charAt(0).toUpperCase() + type.slice(1)} image loaded.`, 'success');
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    // --- EXPORTACIÓN A PDF (COMPLETA) ---
    window.exportPDF = () => { showStatus("Generando PDF...", "info"); try { generateEditablePDF(); } catch (e) { logError("Error generando PDF: " + e.message, true); } };

    function generateEditablePDF() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'letter' });
        const getVal = (id) => document.getElementById(id)?.value || 'N/A';
        const generalData = { customer: getVal('customer'), style: getVal('style'), season: getVal('season'), colorway: getVal('colorway'), po: getVal('po'), nameTeam: getVal('name-team'), program: getVal('program'), specDate: getVal('spec-date') };
        const MARGIN = 10, PAGE_WIDTH = pdf.internal.pageSize.getWidth(), PAGE_HEIGHT = pdf.internal.pageSize.getHeight(), FONT_SIZE_SUB = 10, FONT_SIZE_BODY = 9;
        let y = MARGIN;

        // --- CABECERA ---
        if (window.LogoConfig?.TEGRA) pdf.addImage(window.LogoConfig.TEGRA, 'PNG', MARGIN, y, 30, 15);
        pdf.setFont('helvetica', 'bold').setFontSize(16).text('TECHNICAL SPECIFICATION', PAGE_WIDTH / 2, y + 7, { align: 'center' });
        pdf.setFont('helvetica', 'normal').setFontSize(8).text(new Date().toLocaleDateString('en-US', { dateStyle: 'long' }), PAGE_WIDTH - MARGIN, y + 5, { align: 'right' });
        const clientLogo = document.getElementById('logoCliente');
        if (clientLogo?.src) try { pdf.addImage(clientLogo, 'PNG', PAGE_WIDTH - MARGIN - 30, y + 10, 30, 10, '', 'FAST'); } catch(e){ logError("No se pudo añadir logo de cliente al PDF."); }
        y += 25;

        // --- TABLA DE DATOS GENERALES ---
        pdf.setFontSize(FONT_SIZE_SUB).setFont('helvetica', 'bold').setFillColor(240, 240, 240).rect(MARGIN, y, PAGE_WIDTH - (MARGIN * 2), 7, 'F').text('GENERAL INFORMATION', MARGIN + 2, y + 5);
        pdf.autoTable({ startY: y + 7, body: [[{content:'CUSTOMER:', styles:{fontStyle:'bold'}}, generalData.customer, {content:'SEASON:', styles:{fontStyle:'bold'}}, generalData.season],[{content:'STYLE #:', styles:{fontStyle:'bold'}}, generalData.style, {content:'GARMENT COLOR:', styles:{fontStyle:'bold'}}, generalData.colorway],[{content:'P.O. #:', styles:{fontStyle:'bold'}}, generalData.po, {content:'PROGRAM:', styles:{fontStyle:'bold'}}, generalData.program],[{content:'NAME / TEAM:', styles:{fontStyle:'bold'}}, generalData.nameTeam, {content:'SPEC DATE:', styles:{fontStyle:'bold'}}, generalData.specDate]], theme: 'grid', styles: { fontSize: FONT_SIZE_BODY, cellPadding: 2 }, columnStyles: { 0: { cellWidth: 35 }, 2: { cellWidth: 35 } }, margin: { left: MARGIN, right: MARGIN } });
        y = pdf.autoTable.previous.finalY + 10;

        // --- LOOP DE PLACEMENTS ---
        Object.values(state.placements).forEach((p, index) => {
            const estHeight = 120; // Estimación de altura por placement
            if (y + estHeight > PAGE_HEIGHT - MARGIN) { pdf.addPage(); y = MARGIN; }

            pdf.setFontSize(FONT_SIZE_SUB).setFont('helvetica', 'bold').setFillColor(240, 240, 240).rect(MARGIN, y, PAGE_WIDTH - (MARGIN * 2), 7, 'F').text(`PLACEMENT ${index + 1}: ${p.data.title.toUpperCase()}`, MARGIN + 2, y + 5);
            y += 12;

            const imgWidth = (PAGE_WIDTH - MARGIN * 3) / 2;
            const imgHeight = imgWidth * 0.75;
            if (p.mockUpBase64) try { pdf.addImage(p.mockUpBase64, 'PNG', MARGIN, y, imgWidth, imgHeight); } catch(e){ pdf.text('Mockup err', MARGIN, y + 10); }
            if (p.imageBase64) try { pdf.addImage(p.imageBase64, 'PNG', MARGIN + imgWidth + MARGIN, y, imgWidth, imgHeight); } catch(e){ pdf.text('Art err', MARGIN + imgWidth + MARGIN, y + 10); }
            y += imgHeight + 5;

            const detailsBody = [[{content: 'Type:', styles:{fontStyle:'bold'}}, p.data.type, {content: 'Area:', styles:{fontStyle:'bold'}}, p.data.area, {content: 'Specialty:', styles:{fontStyle:'bold'}}, p.data.specialty, {content: 'Size:', styles:{fontStyle:'bold'}}, p.data.size]];
            pdf.autoTable({ startY: y, body: detailsBody, theme: 'grid', styles: { fontSize: FONT_SIZE_BODY, cellPadding: 1.5 }});
            y = pdf.autoTable.previous.finalY + 5;

            if (p.colors && p.colors.length > 0) {
                const colorsBody = p.colors.map((c, i) => [i + 1, c.name, c.code, c.type]);
                pdf.autoTable({ startY: y, head: [['#', 'Color Name', 'Code', 'Type']], body: colorsBody, theme: 'grid', headStyles: { fillColor: [50, 50, 50] }, styles: { fontSize: FONT_SIZE_BODY, cellPadding: 1.5 }});
                y = pdf.autoTable.previous.finalY + 5;
            }

            if (p.data.comments) {
                pdf.setFont('helvetica', 'bold').setFontSize(FONT_SIZE_BODY).text('Comments:', MARGIN, y);
                y += 4;
                const commentLines = pdf.splitTextToSize(p.data.comments, PAGE_WIDTH - MARGIN * 2);
                pdf.setFont('helvetica', 'normal').setFontSize(FONT_SIZE_BODY).text(commentLines, MARGIN, y);
                y += commentLines.length * (LINE_HEIGHT - 2) + 5;
            }
            y += 5; // Espacio extra entre placements
        });

        // --- GUARDAR PDF ---
        const fileName = `Spec_${generalData.customer}_${generalData.style}.pdf`.replace(/[^a-zA-Z0-9_\.]/g, '_');
        pdf.save(fileName);
        showStatus("PDF Completo generado con éxito!", "success");
    }

    // --- FUNCIONES DE ACCIÓN GLOBAL ---
    window.clearForm = () => { state.placements = {}; state.imageBlobs = {}; state.nextPlacementId = 1; state.currentPlacementId = null; showTab('spec-creator'); showStatus("Formulario limpiado.", "info"); };

    // --- HELPERS Y UI ---
    function loadTegraLogo() { const el = document.getElementById('app-logo'); if (el && window.LogoConfig?.TEGRA) el.innerHTML = `<img src="${window.LogoConfig.TEGRA}" alt="Tegra Logo">`; }
    function updateDateTime() { const el = document.getElementById('current-datetime'); if (el) el.textContent = new Date().toLocaleString('es-HN', { dateStyle: 'long', timeStyle: 'short' }); }
    function applyTheme(theme) { document.body.className = theme; state.currentTheme = theme; localStorage.setItem('theme', theme); const btn = document.getElementById('themeToggle'); if(btn) btn.innerHTML = theme === 'dark-mode' ? '<i class="fas fa-sun"></i> Modo Claro' : '<i class="fas fa-moon"></i> Modo Oscuro'; }
    window.toggleTheme = () => applyTheme(state.currentTheme === 'dark-mode' ? 'light-mode' : 'dark-mode');
    function showStatus(message, type = 'info', duration = 3500) { const el = document.getElementById('statusMessage'); if (!el) return; el.textContent = message; el.className = `status-message status-${type} show`; setTimeout(() => { el.classList.remove('show'); }, duration); }
    
    // --- LOGS Y STATS (PLACEHOLDERS) ---
    window.exportToExcel = () => { logError("Excel export no está implementado.", true); };
    window.downloadProjectZip = () => { logError("Descarga de ZIP no está implementada.", true); };
    window.loadSavedSpecsList = () => { /* Implementación futura */ };
    window.updateDashboardStats = () => { /* Implementación futura */ };
    window.loadErrorLog = () => { /* Implementación futura */ };
    window.logError = (message, showAlert) => { console.error(message); if (showAlert) showStatus(message, 'error'); }

    // --- INICIAR LA APLICACIÓN ---
    initializeApp();
});
