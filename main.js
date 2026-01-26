
// =================================================================================
// MAIN SCRIPT - TEGRA TECHNICAL SPEC MANAGER V2.3
// =================================================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURACIÓN Y ESTADO INICIAL ---
    const state = {
        currentPlacementId: null,
        nextPlacementId: 1,
        placements: {},
        imageBlobs: {},
        currentTheme: localStorage.getItem('theme') || 'dark-mode',
    };

    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
    const DOMElements = {
        body: document.body,
        appLogo: document.getElementById('app-logo'),
        themeToggle: document.getElementById('themeToggle'),
        logoCliente: document.getElementById('logoCliente'),
        customerInput: document.getElementById('customer'),
        folderNumInput: document.getElementById('folder-num'),
        dateTime: document.getElementById('current-datetime'),
        excelFileInput: document.getElementById('excelFile'),
        imageInput: document.getElementById('imageInput'),
        placementImageInput: document.getElementById('placementImageInput'),
        placementsContainer: document.getElementById('placements-container'),
        placementsTabs: document.getElementById('placements-tabs'),
        statusMessage: document.getElementById('statusMessage'),
        errorLogContent: document.getElementById('error-log-content'),
        savedSpecsList: document.getElementById('saved-specs-list'),
        designerSelect: document.getElementById('designer'),
    };

    // --- INICIALIZACIÓN DE LA APLICACIÓN ---
    function initializeApp() {
        try {
            loadTegraLogo();
            updateDateTime();
            setInterval(updateDateTime, 60000);
            applyTheme(state.currentTheme);
            setupGlobalEventListeners();
            loadInitialData();
            addNewPlacement(); // Añade el primer placement al cargar
            showStatus("Aplicación iniciada y lista.", "success");
        } catch (error) {
            logError("Fallo crítico durante la inicialización: " + error.message, true);
            showStatus("Error crítico al iniciar. La aplicación puede ser inestable.", "error", 10000);
        }
    }

    // --- GESTIÓN DE EVENTOS GLOBALES ---
    function setupGlobalEventListeners() {
        DOMElements.themeToggle.addEventListener('click', toggleTheme);
        DOMElements.excelFileInput.addEventListener('change', handleFileSelect);
        DOMElements.imageInput.addEventListener('change', (e) => handleImageUpload(e, 'mockup'));
        DOMElements.placementImageInput.addEventListener('change', (e) => handleImageUpload(e, 'placement'));
        DOMElements.customerInput.addEventListener('input', updateClientLogo);
    }
    
    // --- CARGA DE DATOS INICIAL ---
    function loadInitialData() {
        loadSavedSpecsList();
        loadErrorLog();
        updateDashboardStats();
    }

    // =========================================================
    // FUNCIONES DE UI (NAVEGACIÓN, TEMA, LOGOS, ETC.)
    // =========================================================
    
    window.showTab = (tabId) => {
        document.querySelectorAll('.tab-content.active').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.nav-tab.active').forEach(tab => tab.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        const activeNavTab = document.querySelector(`.nav-tab[onclick="showTab('${tabId}')"]`);
        if (activeNavTab) activeNavTab.classList.add('active');
        
        if (tabId === 'saved-specs') loadSavedSpecsList();
        if (tabId === 'error-log') loadErrorLog();
        updateDashboardStats();
    };

    function loadTegraLogo() {
        if (window.LogoConfig && window.LogoConfig.TEGRA) {
            const img = document.createElement('img');
            img.src = window.LogoConfig.TEGRA;
            img.alt = "Tegra Logo";
            img.style.height = '40px';
            DOMElements.appLogo.innerHTML = '';
            DOMElements.appLogo.appendChild(img);
        } else {
            logError("El logo de Tegra no se encontró en 'config-logos.js'.", true);
            DOMElements.appLogo.innerHTML = '<p style="color:yellow;">Error: Logo</p>';
        }
    }

    window.updateClientLogo = () => {
        const customerName = DOMElements.customerInput.value.trim().toUpperCase();
        const clientKey = customerName.replace(/[&. ]/g, '_');
        const logoImg = DOMElements.logoCliente;
        
        if (window.LogoConfig && LogoConfig[clientKey]) {
            logoImg.src = LogoConfig[clientKey];
            logoImg.style.display = 'block';
        } else {
            logoImg.style.display = 'none';
            logoImg.src = '';
        }
    }

    function applyTheme(theme) {
        DOMElements.body.className = theme;
        state.currentTheme = theme;
        localStorage.setItem('theme', theme);
        DOMElements.themeToggle.innerHTML = theme === 'dark-mode' 
            ? '<i class="fas fa-sun"></i> Modo Claro' 
            : '<i class="fas fa-moon"></i> Modo Oscuro';
    }

    function toggleTheme() {
        const newTheme = state.currentTheme === 'dark-mode' ? 'light-mode' : 'dark-mode';
        applyTheme(newTheme);
    }

    function updateDateTime() {
        DOMElements.dateTime.textContent = new Date().toLocaleString('es-HN', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }

    function showStatus(message, type = 'info', duration = 3000) {
        DOMElements.statusMessage.textContent = message;
        DOMElements.statusMessage.className = `status-message status-${type} show`;
        setTimeout(() => {
            DOMElements.statusMessage.classList.remove('show');
        }, duration);
    }

    // =========================================================
    // GESTIÓN DE PLACEMENTS
    // =========================================================

    window.addNewPlacement = () => {
        const placementId = state.nextPlacementId++;
        const placementData = {
            id: placementId,
            title: `Placement ${placementId}`,
        };
        state.placements[placementId] = { data: placementData, imageBase64: null, mockUpBase64: null };
        state.imageBlobs[placementId] = { placement: null, mockup: null };

        renderPlacement(placementId);
        switchPlacementTab(placementId);
        updateDashboardStats();
    };
    
    function renderPlacement(placementId) {
        const placement = state.placements[placementId];
        if (!placement) return;

        const tab = document.createElement('div');
        tab.className = 'placement-tab';
        tab.dataset.id = placementId;
        tab.innerHTML = `
            <span class="tab-title" onclick="switchPlacementTab(${placementId})">${placement.data.title}</span>
            <button class="close-tab" onclick="removePlacement(${placementId})">&times;</button>
        `;
        DOMElements.placementsTabs.appendChild(tab);

        const container = document.createElement('div');
        container.id = `placement-${placementId}`;
        container.className = 'placement-content';
        container.innerHTML = `<h2>Contenido para ${placement.data.title}</h2>`;
        DOMElements.placementsContainer.appendChild(container);
    }
    
    window.switchPlacementTab = (placementId) => {
        state.currentPlacementId = placementId;

        document.querySelectorAll('.placement-tab.active').forEach(t => t.classList.remove('active'));
        document.querySelector(`.placement-tab[data-id='${placementId}']`)?.classList.add('active');
        
        document.querySelectorAll('.placement-content.active').forEach(c => c.classList.remove('active'));
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
        }
        updateDashboardStats();
    };

    // =========================================================
    // MANEJO DE FORMULARIO Y DATOS
    // =========================================================
    
    window.clearForm = () => {
        document.getElementById('spec-creator').querySelectorAll('input, select').forEach(el => {
            if (el.type !== 'button' && el.type !== 'submit') el.value = '';
        });
        
        DOMElements.placementsContainer.innerHTML = '';
        DOMElements.placementsTabs.innerHTML = '';
        state.placements = {};
        state.imageBlobs = {};
        state.nextPlacementId = 1;
        
        addNewPlacement();
        updateClientLogo();
        showStatus("Formulario limpiado.", "info");
    };

    function getFormData() {
        const generalData = {
            customer: DOMElements.customerInput.value,
            style: document.getElementById('style').value,
            colorway: document.getElementById('colorway').value,
            season: document.getElementById('season').value,
            pattern: document.getElementById('pattern').value,
            po: document.getElementById('po').value,
            sampleType: document.getElementById('sample-type').value,
            nameTeam: document.getElementById('name-team').value,
            gender: document.getElementById('gender').value,
            designer: DOMElements.designerSelect.value,
            folderNum: DOMElements.folderNumInput.value,
        };
        return { general: generalData, placements: state.placements };
    }

    // =========================================================
    // CARGA DE ARCHIVOS (SWO, JSON, ZIP)
    // =========================================================
    
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();
        if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
             showStatus("Carga de Excel (SWO) aún no implementada.", "warning");
        } else if (fileName.endsWith('.json')) {
            loadFromJSON(file);
        } else if (fileName.endsWith('.zip')) {
             showStatus("Carga de ZIP aún no implementada.", "warning");
        } else {
            logError(`Tipo de archivo no soportado: ${file.name}`);
        }
        event.target.value = ''; 
    }
    
    function loadFromJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                showStatus(`Spec "${data.general.style}" cargada desde JSON.`, "success");
            } catch (error) {
                logError("Error al parsear el archivo JSON: " + error.message, true);
            }
        };
        reader.readAsText(file);
    }
    
    // =========================================================
    // MANEJO DE IMÁGENES
    // =========================================================

    function handleImageUpload(event, imageType) {
        const file = event.target.files[0];
        if (!file || !state.currentPlacementId) return;

        const placementId = state.currentPlacementId;
        state.imageBlobs[placementId][imageType] = file;

        convertFileToBase64(file, (base64) => {
            if (imageType === 'mockup') {
                state.placements[placementId].mockUpBase64 = base64;
            } else {
                state.placements[placementId].imageBase64 = base64;
            }
            showStatus(`Imagen de ${imageType} cargada para el placement actual.`, 'success');
        });
        
        event.target.value = '';
    }
    
    function convertFileToBase64(file, callback) {
        const reader = new FileReader();
        reader.onload = () => callback(reader.result);
        reader.onerror = (error) => logError("Error al leer el archivo de imagen: " + error, true);
        reader.readAsDataURL(file);
    }

    // =========================================================
    // GESTIÓN DE SPECS GUARDADAS (LOCAL STORAGE) - ROBUSTO
    // =========================================================
    
    window.saveCurrentSpec = () => {
        const data = getFormData();
        if (!data.general.style) {
            showStatus("El campo 'STYLE' es obligatorio para guardar.", "error");
            return;
        }
        const key = `spec_${new Date().getTime()}`;
        try {
            localStorage.setItem(key, JSON.stringify(data));
            showStatus(`Spec "${data.general.style}" guardada localmente.`, "success");
            loadSavedSpecsList();
            updateDashboardStats();
        } catch (error) {
            logError("No se pudo guardar la spec en Local Storage. ¿Está lleno?", true);
        }
    };

    window.loadSavedSpecsList = () => {
        DOMElements.savedSpecsList.innerHTML = '';
        let specs = [];
        try {
            specs = Object.keys(localStorage)
                .filter(k => k.startsWith('spec_'))
                .map(k => {
                    try {
                        const data = JSON.parse(localStorage.getItem(k));
                        if (data && data.general && typeof data.general.style !== 'undefined') {
                            return { key: k, data: data };
                        }
                        console.warn(`Ignorando spec guardada con formato inválido (key: ${k})`);
                        return null; 
                    } catch (e) {
                        console.warn(`No se pudo parsear la spec guardada (key: ${k}):`, e);
                        return null;
                    }
                })
                .filter(Boolean) 
                .sort((a, b) => b.key.split('_ ')[1] - a.key.split('_')[1]);
        } catch(error) {
            logError('Error al procesar las specs guardadas de localStorage: ' + error.message, true);
            return;
        }
        
        if (specs.length === 0) {
            DOMElements.savedSpecsList.innerHTML = '<p style="text-align:center; color:var(--text-secondary); padding:20px;"><i class="fas fa-database" style="font-size:2rem; margin-bottom:10px; display:block;"></i>No hay specs guardadas.</p>';
            return;
        }
        
        specs.forEach(spec => {
            const item = document.createElement('div');
            item.className = 'saved-spec-item';
            item.innerHTML = `
                <div>
                    <strong>STYLE:</strong> ${spec.data.general.style || 'N/A'}<br>
                    <small>Cliente: ${spec.data.general.customer || 'N/A'} | Guardado: ${new Date(parseInt(spec.key.split('_')[1])).toLocaleDateString()}</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-primary" onclick="loadSpec('${spec.key}')"><i class="fas fa-upload"></i> Cargar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSpec('${spec.key}')"><i class="fas fa-trash"></i></button>
                </div>
            `;
            DOMElements.savedSpecsList.appendChild(item);
        });
    };

    window.loadSpec = (key) => {
        const data = JSON.parse(localStorage.getItem(key));
        showTab('spec-creator');
        showStatus(`Spec "${data.general.style}" cargada.`, "success");
    };

    window.deleteSpec = (key) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta spec guardada?')) {
            localStorage.removeItem(key);
            loadSavedSpecsList();
            updateDashboardStats();
            showStatus("Spec eliminada.", "info");
        }
    };

    window.clearAllSpecs = () => {
        if (confirm('¡ATENCIÓN! ¿Estás seguro de que quieres eliminar TODAS las specs guardadas? Esta acción no se puede deshacer.')) {
            Object.keys(localStorage).filter(k => k.startsWith('spec_')).forEach(k => localStorage.removeItem(k));
            loadSavedSpecsList();
            updateDashboardStats();
            showStatus("Todas las specs guardadas han sido eliminadas.", "warning");
        }
    };
    
    // =========================================================
    // LOG DE ERRORES
    // =========================================================
    
    function logError(message, showAlert = false) {
        console.error(message);
        const log = JSON.parse(localStorage.getItem('errorLog') || '[]');
        log.unshift({ time: new Date().toISOString(), message });
        if (log.length > 100) log.pop();
        localStorage.setItem('errorLog', JSON.stringify(log));
        if (showAlert) showStatus(message, "error", 5000);
        loadErrorLog();
    }

    function loadErrorLog() {
        const log = JSON.parse(localStorage.getItem('errorLog') || '[]');
        DOMElements.errorLogContent.innerHTML = log.length === 0
            ? '<p>No hay errores registrados.</p>'
            : log.map(e => `<div class="error-item"><strong>${new Date(e.time).toLocaleString()}:</strong> ${e.message}</div>`).join('');
    }

    window.clearErrorLog = () => {
        localStorage.removeItem('errorLog');
        loadErrorLog();
        showStatus("Log de errores limpiado.", "info");
    };
    
    // =========================================================
    // ESTADÍSTICAS DEL DASHBOARD
    // =========================================================

    function updateDashboardStats() {
        const totalSpecs = Object.keys(localStorage).filter(k => k.startsWith('spec_')).length;
        document.getElementById('total-specs').textContent = totalSpecs;
        
        const totalPlacements = Object.keys(state.placements).length;
        document.querySelector('#completion-rate > div:nth-child(2)').textContent = totalPlacements;
    }

    // =========================================================
    // FUNCIONES DE EXPORTACIÓN (PDF, EXCEL, ZIP)
    // =========================================================
    
    window.exportPDF = async () => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'letter' });

        showStatus("Generando PDF...", "info", 10000);

        try {
            const specElement = document.getElementById('spec-creator');
            const canvas = await html2canvas(specElement, {
                scale: 2, useCORS: true, logging: false,
                onclone: (doc) => {
                    const tegraLogoImg = doc.querySelector('#app-logo img');
                    if (tegraLogoImg) tegraLogoImg.src = window.LogoConfig.TEGRA_B64;
                    doc.querySelectorAll('.image-preview img').forEach(img => {
                       if(img.src) img.style.display = 'block';
                    });
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            
            const pageCount = pdf.internal.getNumberOfPages();
            for(let i = 1; i <= pageCount; i++) {
                pdf.setPage(i);
                pdf.setFontSize(8);
                pdf.setTextColor(150);
                pdf.text(`Spec generado por Tegra Technical Spec Manager - ${new Date().toLocaleDateString()}`, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
                pdf.text(`Página ${i} de ${pageCount}`, pdfWidth - 15, pdfHeight - 10, { align: 'right' });
            }

            const folder = DOMElements.folderNumInput.value || 'SPEC';
            const style = document.getElementById('style').value || 'STYLE';
            pdf.save(`${folder}_${style}.pdf`);
            showStatus("PDF exportado con éxito.", "success");

        } catch (error) {
            logError("Error al generar el PDF: " + error.message, true);
        }
    };
    
    window.exportToExcel = () => showStatus("Función no implementada.", "warning");
    window.downloadProjectZip = () => showStatus("Función no implementada.", "warning");

    // --- INICIAR LA APLICACIÓN ---
    initializeApp();
});
