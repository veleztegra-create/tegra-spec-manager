// Módulo para manejar la interfaz de usuario
import { appState } from './state.js';
import { colorParser } from './color-parser.js';
import { teamParser } from './team-parser.js';
import { presetsManager } from './presets.js';
import { render } from './render.js';

export class UIManager {
    constructor() {
        this.initEventListeners();
        this.setupTheme();
        this.setupSubscriptions();
    }

    setupSubscriptions() {
        // Suscribirse a cambios en el estado
        appState.subscribe('theme', (theme) => this.updateTheme(theme));
        appState.subscribe('activeTab', (tab) => this.showTab(tab));
        appState.subscribe('placements', (placements) => this.renderPlacements(placements));
        appState.subscribe('currentPlacement', () => this.updateCurrentPlacement());
        appState.subscribe('formData', (formData) => this.updateFormUI(formData));
    }

    initEventListeners() {
        // Theme toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('#themeToggle')) {
                this.toggleTheme();
            }
        });

        // Form inputs
        document.addEventListener('input', (e) => {
            if (e.target.matches('#customer')) {
                this.updateClientLogo();
            }
            
            // Actualizar estado de formulario
            const formInputs = [
                'customer', 'style', 'folder-num', 'colorway', 'season',
                'pattern', 'po', 'sample-type', 'name-team', 'gender', 'designer'
            ];
            
            if (formInputs.includes(e.target.id)) {
                this.updateFormState(e.target.id, e.target.value);
            }
        });

        // Excel file upload
        document.getElementById('excelFile')?.addEventListener('change', (e) => {
            this.handleExcelUpload(e);
        });

        // Setup paste handler
        this.setupPasteHandler();
    }

    updateFormState(field, value) {
        const formData = appState.getFormData();
        const fieldMap = {
            'customer': 'customer',
            'style': 'style',
            'folder-num': 'folder',
            'colorway': 'colorway',
            'season': 'season',
            'pattern': 'pattern',
            'po': 'po',
            'sample-type': 'sampleType',
            'name-team': 'nameTeam',
            'gender': 'gender',
            'designer': 'designer'
        };
        
        if (fieldMap[field]) {
            formData[fieldMap[field]] = value;
            appState.setFormData(formData);
        }
    }

    updateFormUI(formData) {
        const fieldMap = {
            'customer': 'customer',
            'style': 'style',
            'folder': 'folder-num',
            'colorway': 'colorway',
            'season': 'season',
            'pattern': 'pattern',
            'po': 'po',
            'sampleType': 'sample-type',
            'nameTeam': 'name-team',
            'gender': 'gender',
            'designer': 'designer'
        };
        
        for (const [stateField, domId] of Object.entries(fieldMap)) {
            const element = document.getElementById(domId);
            if (element && element.value !== formData[stateField]) {
                element.value = formData[stateField] || '';
            }
        }
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('tegraspec-theme') || 'dark';
        appState.setTheme(savedTheme);
    }

    updateTheme(theme) {
        const isDarkMode = theme === 'dark';
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        
        if (isDarkMode) {
            body.classList.remove('light-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
        } else {
            body.classList.add('light-mode');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
        }
        
        this.showStatus(`🌙 ${isDarkMode ? 'Modo oscuro' : 'Modo claro'} activado`);
    }

    toggleTheme() {
        const currentTheme = appState.getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        appState.setTheme(newTheme);
    }

    showTab(tabName) {
        // Actualizar navegación
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });
        
        // Mostrar contenido
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
            if (tab.id === tabName) {
                tab.classList.add('active');
            }
        });
        
        // Cargar datos específicos de la tab
        switch (tabName) {
            case 'saved-specs':
                this.loadSavedSpecsList();
                break;
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'spec-creator':
                if (appState.getPlacements().length === 0) {
                    this.initializePlacements();
                }
                break;
        }
    }

    updateClientLogo() {
        const customer = document.getElementById('customer')?.value.toUpperCase().trim() || '';
        const logoElement = document.getElementById('logoCliente');
        if (!logoElement) return;
        
        const customerLogos = {
            'NIKE': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Nike-Logotipo-PNG-Photo.png',
            'FANATICS': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Fanatics_company_logo.svg.png',
            'ADIDAS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1280px-Adidas_Logo.svg.png',
            'PUMA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Puma_Logo.svg/1280px-Puma_Logo.svg.png',
            'UNDER ARMOUR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Under_armour_logo.svg/1280px-Under_armour_logo.svg.png',
            'GEAR FOR SPORT': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png'
        };
        
        let logoUrl = '';
        
        // Detectar variaciones de Gear for Sport
        const gfsVariations = ['GEAR FOR SPORT', 'GEARFORSPORT', 'GFS', 'G.F.S.'];
        const isGFS = gfsVariations.some(variation => customer.includes(variation));
        
        if (isGFS) {
            logoUrl = customerLogos['GEAR FOR SPORT'];
        } else {
            for (const [key, url] of Object.entries(customerLogos)) {
                if (customer.includes(key)) {
                    logoUrl = url;
                    break;
                }
            }
        }
        
        if (logoUrl) {
            logoElement.src = logoUrl;
            logoElement.style.display = 'block';
        } else {
            logoElement.style.display = 'none';
        }
    }

    setupPasteHandler() {
        document.addEventListener('paste', (e) => {
            const activePlacement = document.querySelector('.placement-section.active');
            if (!activePlacement) return;
            
            const items = e.clipboardData.items;
            
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    const reader = new FileReader();
                    
                    reader.onload = (event) => {
                        const placementId = activePlacement.dataset.placementId;
                        this.handlePlacementImage(parseInt(placementId), event.target.result);
                    };
                    
                    reader.readAsDataURL(blob);
                    e.preventDefault();
                    break;
                }
            }
        });
    }

    handlePlacementImage(placementId, imageData) {
        const placement = appState.getPlacementById(placementId);
        if (placement) {
            appState.updatePlacement(placementId, { imageData });
            this.showStatus(`✅ Imagen pegada en ${placement.type}`);
        }
    }

    initializePlacements() {
        const firstPlacement = appState.createPlacement('FRONT');
        appState.addPlacement(firstPlacement);
    }

    renderPlacements(placements) {
        render.renderPlacements(placements);
    }

    updateCurrentPlacement() {
        const currentPlacement = appState.getCurrentPlacement();
        if (currentPlacement) {
            render.renderPlacementDetails(currentPlacement);
        }
    }

    async handleExcelUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const data = await this.readExcelFile(file);
            this.processExcelData(data, file.name);
        } catch (error) {
            console.error('Error processing Excel file:', error);
            this.showStatus('❌ Error procesando archivo Excel', 'error');
        }
        
        // Reset input
        event.target.value = '';
    }

    readExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    resolve(workbook);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    processExcelData(workbook, fileName) {
        const sheetPriority = ['SWO', 'PPS', 'Proto 1', 'Proto 2', 'Proto 3', 'Proto 4', 'Sheet1'];
        let worksheet = null;
        let sheetUsed = '';
        
        for (const sheetName of sheetPriority) {
            if (workbook.SheetNames.includes(sheetName)) {
                worksheet = workbook.Sheets[sheetName];
                sheetUsed = sheetName;
                break;
            }
        }
        
        if (!worksheet) {
            worksheet = workbook.Sheets[workbook.SheetNames[0]];
            sheetUsed = workbook.SheetNames[0];
        }
        
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        const extracted = teamParser.processExcelData(data, sheetUsed);
        
        // Actualizar formulario
        this.updateFormFromExcel(data, sheetUsed);
        
        this.showStatus(`✅ "${sheetUsed || 'hoja'}" procesado - Equipo: ${extracted.team || 'No detectado'}`, 'success');
    }

    updateFormFromExcel(data, sheetName) {
        const isSWOSheet = sheetName.includes('SWO');
        const isPPSSheet = sheetName.includes('PPS');
        
        const extracted = {};
        
        if (isSWOSheet || isPPSSheet) {
            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                if (!row || row.length < 2) continue;
                
                const label = String(row[1] || '').trim();
                const val = String(row[2] || '').trim();
                
                if (label.includes('CUSTOMER:')) {
                    extracted.customer = val;
                } else if (label.includes('STYLE:')) {
                    extracted.style = val;
                } else if (label.includes('COLORWAY')) {
                    extracted.colorway = val;
                } else if (label.includes('SEASON:')) {
                    extracted.season = val;
                } else if (label.includes('PATTERN')) {
                    extracted.pattern = val;
                } else if (label.includes('P.O.')) {
                    extracted.po = val;
                } else if (label.includes('SAMPLE TYPE')) {
                    extracted.sampleType = val;
                } else if (label.includes('TEAM:')) {
                    extracted.nameTeam = val;
                } else if (label.includes('GENDER:')) {
                    extracted.gender = val;
                }
            }
        }
        
        // Actualizar estado
        if (Object.keys(extracted).length > 0) {
            appState.setFormData(extracted);
        }
    }

    loadSavedSpecsList() {
        render.renderSavedSpecsList();
    }

    updateDashboard() {
        render.renderDashboard();
    }

    showStatus(message, type = 'success') {
        const statusEl = document.getElementById('statusMessage');
        if (!statusEl) return;
        
        statusEl.textContent = message;
        statusEl.className = `status-message status-${type}`;
        statusEl.style.display = 'block';
        
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 4000);
    }
}

// Instancia singleton
export const uiManager = new UIManager();
