// Módulo para renderizar componentes
import { appState } from './state.js';
import { colorParser } from './color-parser.js';
import { presetsManager } from './presets.js';

export class Renderer {
    constructor() {
        this.templates = new Map();
        this.initTemplates();
    }

    initTemplates() {
        // Templates básicos que se pueden extender
        this.templates.set('header', this.headerTemplate);
        this.templates.set('nav', this.navTemplate);
        this.templates.set('dashboard', this.dashboardTemplate);
        this.templates.set('specCreator', this.specCreatorTemplate);
        this.templates.set('savedSpecs', this.savedSpecsTemplate);
        this.templates.set('errorLog', this.errorLogTemplate);
    }

    // ========== TEMPLATES ==========

    headerTemplate() {
        return `
            <header class="app-header">
                <div class="header-left">
                    <div class="logo">
                        <svg viewBox="0 0 145.94 39.05" xmlns="http://www.w3.org/2000/svg">
                            <!-- SVG del logo -->
                            <path d="M42.24,12.37v1.93h6.91v15.25h4.21v-15.25h6.91v-3.88h-16.1l-1.93,1.95ZM92.06,20.31v1.87h4.24v2.73c-.53.38-1.13.67-1.8.86-.67.19-1.39.29-2.16.29-.84,0-1.61.15-2.32-.45-.71-.3-1.33-.72-1.84-1.27-.52-.55-.92-1.19-1.2-1.93-.28-.74-.42-1.54-.42-2.42v-.05c0-.82.14-1.59.42-2.31.28-.72.67-1.35,1.18-1.89.5-.54,1.08-.97,1.75-1.28.66-.32,1.38-.48,2.15-.48.55,0,1.05.05,1.5.14.46.09.88.22,1.27.38.39.16.77.36,1.13.60.25.16.49.34.74.54l2.94-2.97c-.47-.4-.96-.75-1.46-1.07-.53-.33-1.09-.60-1.70-.82-.60-.22-1.25-.39-1.95-.51-.70-.12-1.48-.18-2.34-.18-1.44,0-2.77.26-4,.78-1.23.52-2.29,1.23-3.18,2.13-.89.90-1.59,1.95-2.09,3.14-.50,1.19-.75,2.47-.75,3.84v-.05c0,1.42.25,2.73.74,3.94.49,1.20,1.18,2.24,2.06,3.12.88.87,1.94,1.56,3.17,2.05,1.23.49,2.59.74,4.09.74,1.75,0,3.30-.30,4.66-.89,1.36-.59,2.53-1.31,3.51-2.15v-8.31h-6.56l-1.74,1.76ZM68.15,21.8h9.02v-3.74h-9.02v-3.88h10.25v-3.74h-12.55l0.14,0.14v17.12h14.54v-3.74h-10.53v-4.02ZM114.24,10.43h-8.75v19.13h4.21v-6.12h3.31l4.10,6.12h2.57l1.39-1.40-3.71-5.43c1.22-.46,2.21-1.17,2.97-2.15.76-.97,1.13-2.24,1.13-3.79v-.05c0-1.82-.55-3.28-1.64-4.37-1.29-1.29-3.15-1.94-5.58-1.94ZM117.19,17.03c0,.82-.28,1.48-.83,1.98-.56.49-1.35.74-2.39.74h-4.26v-5.52h4.18c1.04,0,1.85.23,2.43.69.58.46.87,1.14.87,2.06v.05ZM136.7,10.29h-3.88l-8.20,19.27h4.29l1.75-4.29h8.09l1.75,4.29h1.97l1.70-1.72-7.47-17.55ZM132.16,21.58l2.54-6.20,2.54,6.20h-5.08Z"/>
                            <g><polygon points="7.44 31.38 6.59 32.24 6.88 33.39 8.03 33.68 8.89 32.83 8.59 31.68 7.44 31.38"/><polygon points="6.79 28.67 7.94 28.97 10.41 26.5 10.11 25.35 8.96 25.05 6.49 27.52 6.79 28.67"/><polygon points="10.54 14.61 9.4 14.31 6.93 16.78 7.23 17.93 8.37 18.23 10.85 15.76 10.54 14.61"/><polygon points="26.38 22.79 25.06 24.11 25.36 25.26 26.5 25.56 27.82 24.24 27.52 23.09 26.38 22.79"/><path d="M21.9,36.93l.30,1.15,1.15.30.85-.85-.30-1.15-1.15-.30-.85.85ZM18.01,29.21l-.30-1.15.85-.85,1.15.30.30,1.15-.85.85-1.15-.30ZM18.83,19.56l-.30-1.15,1.50-1.50,1.15.30.30,1.15-1.50,1.50-1.15-.30ZM20.85,14.61l-.30-1.15,1.50-1.50,1.15.30.30,1.15-1.50,1.50-1.15-.30ZM14.33,15.34l-.30-1.14,3.78-3.68,1.14.30.30,1.14-3.78,3.68-1.15-.30ZM24.21,10.68l-.30-1.15,2.17-2.17,1.14.30.30,1.14-2.17,2.17-1.14-.30ZM20.59,9.12l-.30-1.15.85-.85,1.15.30.30,1.15-.85.85-1.15-.30ZM15.06,8.82l-.30-1.15,1.50-1.50,1.15.30.30,1.15-1.50,1.50-1.15-.30ZM25.51,0l-4.90,4.90-1.14-.30-.30-1.14,3.46-3.46H0v9.55h4.54l-1.67,1.67.30,1.14,1.15.30,3.12-3.12h.02l2.59-2.59,1.14.30.30,1.14-.57.57-1.81,1.78.30,1.15,1.15.30,2.50-2.45v8.41l-3.99,3.99.30,1.15,1.15.30,4.62-4.62,1.07.28.30,1.15-1.42,1.42-.93.93-.84.84-1.78,1.78.30,1.15,1.14.30,3.56-3.56.27-.27,1.14.30.30,1.14-4.64,4.64h-.03s-2.52,2.51-2.52,2.51l.31,1.16,1.17.31,2.52-2.52h0s.30-.32.30-.32l1.14.30.30,1.15-3.75,3.75h0s-2.17,2.18-2.17,2.18l.30,1.14,1.15.30,6.35-6.35,1.14.30.30,1.15-2.82,2.77.30,1.14,1.15.30,5.15-5.10v-2.89h0s-1.24,1.24-1.24,1.24l-1.15-.30-.30-1.14,3.43-3.41-.30-1.15-.45-.12-.71-.19-1.05,1.05-1.14-.30-.30-1.14,6.16-6.31-.30-1.15-1.14-.30-1.51,1.51v-4.34l5.25-4.76h7.28V0h-10.92Z"/></g>
                        </svg>
                    </div>
                    <div>
                        <h1 class="app-title">Technical Spec Manager</h1>
                        <p class="app-subtitle">Sistema de gestión de especificaciones técnicas</p>
                    </div>
                </div>

                <div class="client-section">
                    <span class="client-label">CUSTOMER / CLIENTE:</span>
                    <div class="client-logo-wrapper">
                        <img id="logoCliente" alt="Logo del cliente" style="display: none;">
                    </div>
                </div>

                <div class="header-actions">
                    <div class="theme-toggle">
                        <button id="themeToggle" class="theme-toggle-btn">
                            <i class="fas fa-sun"></i> Modo Claro
                        </button>
                    </div>
                    <div class="folder-input-container">
                        <span class="client-label"># FOLDER:</span>
                        <input type="text" id="folder-num" class="form-control" placeholder="#####">
                    </div>
                    <div id="current-datetime"></div>
                </div>
            </header>
        `;
    }

    navTemplate() {
        return `
            <nav class="app-nav no-print">
                <ul class="nav-tabs">
                    <li class="nav-tab active" data-tab="dashboard">
                        <i class="fas fa-tachometer-alt"></i> Dashboard
                    </li>
                    <li class="nav-tab" data-tab="spec-creator">
                        <i class="fas fa-file-alt"></i> Crear Spec
                    </li>
                    <li class="nav-tab" data-tab="saved-specs">
                        <i class="fas fa-database"></i> Guardadas
                    </li>
                    <li class="nav-tab" data-tab="error-log">
                        <i class="fas fa-exclamation-triangle"></i> Log de Errores
                    </li>
                </ul>
            </nav>
        `;
    }

    dashboardTemplate() {
        return `
            <div id="dashboard" class="tab-content active">
                <div class="dashboard-grid">
                    <div class="card dashboard-card">
                        <div class="dashboard-card-title">Total Specs</div>
                        <div id="total-specs" class="dashboard-card-value">0</div>
                        <div class="dashboard-card-subtitle">Especificaciones guardadas</div>
                    </div>
                    
                    <div class="card dashboard-card">
                        <div class="dashboard-card-title">Hoy</div>
                        <div id="today-specs" class="dashboard-card-value">0</div>
                        <div class="dashboard-card-subtitle">Specs creadas hoy</div>
                    </div>
                    
                    <div class="card dashboard-card">
                        <div class="dashboard-card-title">Proyectos Activos</div>
                        <div id="active-projects" class="dashboard-card-value">0</div>
                        <div class="dashboard-card-subtitle">Con placements activos</div>
                    </div>
                    
                    <div class="card dashboard-card">
                        <div class="dashboard-card-title">Tasa de Completitud</div>
                        <div id="completion-rate" class="dashboard-card-value">0%</div>
                        <div class="dashboard-card-subtitle">Placements completados</div>
                    </div>
                </div>
                
                <div class="card" style="margin-top: var(--space-lg);">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-history"></i> Actividad Reciente</h3>
                    </div>
                    <div class="card-body">
                        <div id="recent-activity" style="min-height: 200px;">
                            <p class="text-muted" style="text-align: center; padding: 40px;">
                                No hay actividad reciente
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    specCreatorTemplate() {
        return `
            <div id="spec-creator" class="tab-content">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-info-circle"></i> Información General</h3>
                    </div>
                    <div class="card-body">
                        <form id="spec-creator-form" class="grid grid-2 gap-lg">
                            <div class="form-group">
                                <label class="form-label" for="customer">CUSTOMER / CLIENTE:</label>
                                <input type="text" id="customer" class="form-control" placeholder="Nombre del cliente">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="style">STYLE:</label>
                                <input type="text" id="style" class="form-control" placeholder="Estilo/Modelo">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="colorway">COLORWAY:</label>
                                <input type="text" id="colorway" class="form-control" placeholder="Combinación de colores">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="season">SEASON:</label>
                                <input type="text" id="season" class="form-control" placeholder="Temporada">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="pattern">PATTERN #:</label>
                                <input type="text" id="pattern" class="form-control" placeholder="Número de patrón">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="po">P.O. #:</label>
                                <input type="text" id="po" class="form-control" placeholder="Número de orden de compra">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="sample-type">SAMPLE TYPE:</label>
                                <select id="sample-type" class="form-control">
                                    <option value="">Seleccionar tipo</option>
                                    <option value="SALESMAN">Salesman</option>
                                    <option value="PHOTO">Photo</option>
                                    <option value="PROTO">Proto</option>
                                    <option value="FIT">Fit</option>
                                    <option value="PRODUCTION">Production</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="name-team">TEAM:</label>
                                <input type="text" id="name-team" class="form-control" placeholder="Nombre del equipo">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="gender">GENDER:</label>
                                <select id="gender" class="form-control">
                                    <option value="">Seleccionar</option>
                                    <option value="MENS">Mens</option>
                                    <option value="WOMENS">Womens</option>
                                    <option value="YOUTH">Youth</option>
                                    <option value="UNISEX">Unisex</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="designer">DESIGNER:</label>
                                <input type="text" id="designer" class="form-control" placeholder="Diseñador responsable">
                            </div>
                        </form>
                    </div>
                </div>
                
                <!-- Placements Container -->
                <div id="placements-section" style="margin-top: var(--space-lg);">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-map-marker-alt"></i> Placements</h3>
                            <button id="add-placement-btn" class="btn btn-primary">
                                <i class="fas fa-plus"></i> Agregar Placement
                            </button>
                        </div>
                        <div class="card-body">
                            <!-- Tabs de placements -->
                            <div id="placements-tabs" class="placements-tabs"></div>
                            
                            <!-- Contenedor de placements -->
                            <div id="placements-container" class="placements-container"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Acciones -->
                <div class="card no-print" style="margin-top: var(--space-lg);">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-download"></i> Exportar</h3>
                    </div>
                    <div class="card-body">
                        <div class="flex gap-md">
                            <button id="save-spec-btn" class="btn btn-success">
                                <i class="fas fa-save"></i> Guardar Spec
                            </button>
                            <button id="export-pdf-btn" class="btn btn-primary">
                                <i class="fas fa-file-pdf"></i> Exportar PDF
                            </button>
                            <button id="export-excel-btn" class="btn btn-secondary">
                                <i class="fas fa-file-excel"></i> Exportar Excel
                            </button>
                            <button id="export-zip-btn" class="btn btn-outline">
                                <i class="fas fa-file-archive"></i> Proyecto ZIP
                            </button>
                            <button id="load-spec-btn" class="btn btn-outline">
                                <i class="fas fa-upload"></i> Cargar Spec
                            </button>
                            <button id="clear-form-btn" class="btn btn-error">
                                <i class="fas fa-trash"></i> Limpiar Todo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ========== RENDER METHODS ==========

    renderApp() {
        const appContainer = document.getElementById('app');
        if (!appContainer) return;
        
        appContainer.innerHTML = `
            ${this.templates.get('header')()}
            ${this.templates.get('nav')()}
            <main class="app-main">
                ${this.templates.get('dashboard')()}
                ${this.templates.get('specCreator')()}
                ${this.templates.get('savedSpecs')()}
                ${this.templates.get('errorLog')()}
            </main>
        `;
        
        // Inicializar date/time
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 60000);
    }

    updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        const dateTimeEl = document.getElementById('current-datetime');
        if (dateTimeEl) {
            dateTimeEl.textContent = now.toLocaleDateString('es-ES', options);
        }
    }

    renderDashboard() {
        // Implementar lógica del dashboard
        const specs = Object.keys(localStorage).filter(k => k.startsWith('spec_'));
        
        // Actualizar contadores
        const totalSpecsEl = document.getElementById('total-specs');
        if (totalSpecsEl) totalSpecsEl.textContent = specs.length;
        
        // Aquí se puede expandir con más métricas
    }

    renderPlacements(placements) {
        const tabsContainer = document.getElementById('placements-tabs');
        const placementsContainer = document.getElementById('placements-container');
        
        if (!tabsContainer || !placementsContainer) return;
        
        // Render tabs
        tabsContainer.innerHTML = placements.map(placement => `
            <div class="placement-tab ${placement.id === appState.getState().currentPlacementId ? 'active' : ''}" 
                 data-placement-id="${placement.id}">
                <i class="fas fa-${this.getPlacementIcon(placement.type)}"></i>
                ${this.getDisplayType(placement.type)}
                ${placements.length > 1 ? `<span class="remove-tab" onclick="appState.removePlacement(${placement.id})">&times;</span>` : ''}
            </div>
        `).join('');
        
        // Render placements
        placementsContainer.innerHTML = placements.map(placement => `
            <div id="placement-section-${placement.id}" 
                 class="placement-section ${placement.id === appState.getState().currentPlacementId ? 'active' : ''}" 
                 data-placement-id="${placement.id}">
                ${this.renderPlacementContent(placement)}
            </div>
        `).join('');
        
        // Añadir event listeners a las tabs
        tabsContainer.querySelectorAll('.placement-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                if (!e.target.classList.contains('remove-tab')) {
                    const placementId = parseInt(tab.dataset.placementId);
                    appState.setCurrentPlacement(placementId);
                }
            });
        });
    }

    renderPlacementContent(placement) {
        const preset = presetsManager.getPreset(placement.inkType);
        const displayType = this.getDisplayType(placement.type);
        
        return `
            <div class="placement-header">
                <div class="placement-title">
                    <i class="fas fa-${this.getPlacementIcon(placement.type)}"></i>
                    <span>${displayType}</span>
                </div>
                <div class="placement-actions">
                    <button class="btn btn-outline btn-sm" onclick="this.duplicatePlacement(${placement.id})">
                        <i class="fas fa-copy"></i> Duplicar
                    </button>
                    ${appState.getPlacements().length > 1 ? `
                    <button class="btn btn-danger btn-sm" onclick="appState.removePlacement(${placement.id})">
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
                        <select class="form-control placement-type-select" 
                                data-placement-id="${placement.id}"
                                onchange="this.updatePlacementType(${placement.id}, this.value)">
                            ${this.getPlacementTypeOptions(placement.type)}
                        </select>
                    </div>
                    
                    ${placement.type.includes('CUSTOM:') ? this.renderCustomPlacementInput(placement) : ''}
                    
                    <!-- Imagen de Referencia -->
                    ${this.renderImageSection(placement)}
                    
                    <!-- Condiciones de Impresión -->
                    ${this.renderPrintConditions(placement, preset)}
                    
                    <!-- Parámetros de Impresión -->
                    ${this.renderPrintParameters(placement, preset)}
                </div>
                
                <div class="placement-right-column">
                    <!-- Tipo de Tinta -->
                    <div class="form-group">
                        <label class="form-label">TIPO DE TINTA:</label>
                        <select class="form-control placement-ink-type"
                                data-placement-id="${placement.id}"
                                onchange="presetsManager.applyPresetToPlacement(${placement.id}, this.value)">
                            ${this.getInkTypeOptions(placement.inkType)}
                        </select>
                    </div>
                    
                    <!-- Colores y Tintas -->
                    ${this.renderColorsSection(placement)}
                    
                    <!-- Instrucciones Especiales -->
                    <div class="form-group">
                        <label class="form-label">INSTRUCCIONES ESPECIALES:</label>
                        <textarea class="form-control placement-special-instructions"
                                  data-placement-id="${placement.id}"
                                  rows="3"
                                  oninput="appState.updatePlacement(${placement.id}, {specialInstructions: this.value})">${placement.specialInstructions || ''}</textarea>
                    </div>
                    
                    <!-- Vista previa de colores -->
                    ${this.renderColorPreview(placement)}
                    
                    <!-- Secuencia de Estaciones -->
                    ${this.renderSequenceTable(placement)}
                </div>
            </div>
        `;
    }

    // Métodos helper para renderizado
    getDisplayType(type) {
        return type.includes('CUSTOM:') ? type.replace('CUSTOM: ', '') : type;
    }

    getPlacementIcon(type) {
        const icons = {
            'FRONT': 'tshirt',
            'BACK': 'tshirt',
            'SLEEVE': 'hat-cowboy',
            'CHEST': 'heart',
            'TV. NUMBERS': 'hashtag',
            'SHOULDER': 'user',
            'COLLAR': 'circle',
            'CUSTOM': 'star'
        };
        
        return icons[type] || 'map-marker-alt';
    }

    getPlacementTypeOptions(currentType) {
        const types = [
            { value: 'FRONT', label: 'FRONT (Frente)' },
            { value: 'BACK', label: 'BACK (Espalda)' },
            { value: 'SLEEVE', label: 'SLEEVE (Manga)' },
            { value: 'CHEST', label: 'CHEST (Pecho)' },
            { value: 'TV. NUMBERS', label: 'TV. NUMBERS (Números TV)' },
            { value: 'SHOULDER', label: 'SHOULDER (Hombro)' },
            { value: 'COLLAR', label: 'COLLAR (Cuello)' },
            { value: 'CUSTOM', label: 'CUSTOM (Personalizado)' }
        ];
        
        return types.map(type => `
            <option value="${type.value}" ${currentType === type.value ? 'selected' : ''}>
                ${type.label}
            </option>
        `).join('');
    }

    getInkTypeOptions(currentInkType) {
        const inkTypes = presetsManager.getAvailableInkTypes();
        return inkTypes.map(ink => `
            <option value="${ink.value}" ${currentInkType === ink.value ? 'selected' : ''}>
                ${ink.label}
            </option>
        `).join('');
    }

    // Render sections
    renderCustomPlacementInput(placement) {
        const customName = placement.type.includes('CUSTOM:') ? 
            placement.type.replace('CUSTOM: ', '') : '';
        
        return `
            <div id="custom-placement-input-${placement.id}" style="margin-top:10px;">
                <label class="form-label">NOMBRE DEL PLACEMENT:</label>
                <input type="text" 
                       class="form-control custom-placement-name"
                       data-placement-id="${placement.id}"
                       placeholder="Escribe el nombre del placement personalizado..."
                       value="${customName}"
                       oninput="appState.updatePlacement(${placement.id}, {type: 'CUSTOM: ' + this.value})">
            </div>
        `;
    }

    renderImageSection(placement) {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title" style="font-size: 1rem;">
                        <i class="fas fa-image"></i> Imagen para ${this.getDisplayType(placement.type)}
                    </h3>
                </div>
                <div class="card-body">
                    <div class="file-upload-area" onclick="this.openImagePicker(${placement.id})">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Haz clic para subir una imagen para este placement</p>
                        <p style="font-size:0.8rem; color:var(--text-secondary);">Ctrl+V para pegar</p>
                    </div>
                    <div class="image-preview-container">
                        ${placement.imageData ? `
                            <img src="${placement.imageData}" 
                                 class="image-preview placement-image" 
                                 alt="Vista previa"
                                 style="display: block;">
                            <div class="image-actions">
                                <button class="btn btn-danger btn-sm" onclick="appState.updatePlacement(${placement.id}, {imageData: null})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderPrintConditions(placement, preset) {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title" style="font-size: 1rem;">
                        <i class="fas fa-print"></i> Condiciones para ${this.getDisplayType(placement.type)}
                    </h3>
                </div>
                <div class="card-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">DETALLES DE UBICACIÓN:</label>
                            <input type="text" 
                                   class="form-control placement-details"
                                   value="${placement.placementDetails}"
                                   oninput="appState.updatePlacement(${placement.id}, {placementDetails: this.value})">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">DIMENSIONES:</label>
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <input type="text" 
                                       class="form-control placement-dimension-w"
                                       placeholder="Ancho"
                                       value="${placement.width || ''}"
                                       oninput="appState.updatePlacement(${placement.id}, {width: this.value})"
                                       style="width: 100px;">
                                <span style="color: var(--text-secondary);">X</span>
                                <input type="text" 
                                       class="form-control placement-dimension-h"
                                       placeholder="Alto"
                                       value="${placement.height || ''}"
                                       oninput="appState.updatePlacement(${placement.id}, {height: this.value})"
                                       style="width: 100px;">
                                <span style="color: var(--text-secondary);">pulgadas</span>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">TEMPERATURA:</label>
                            <input type="text" 
                                   class="form-control placement-temp"
                                   value="${placement.temp || preset.temp}"
                                   readonly>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">TIEMPO:</label>
                            <input type="text" 
                                   class="form-control placement-time"
                                   value="${placement.time || preset.time}"
                                   readonly>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">SPECIALTIES:</label>
                            <input type="text" 
                                   class="form-control placement-specialties"
                                   value="${placement.specialties || ''}"
                                   readonly>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPrintParameters(placement, preset) {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title" style="font-size: 1rem;">
                        <i class="fas fa-sliders-h"></i> Parámetros de Impresión
                    </h3>
                </div>
                <div class="card-body">
                    <div class="form-grid">
                        ${this.renderParameterInput('meshColor', 'MALLA COLORES:', placement, preset.color.mesh)}
                        ${this.renderParameterInput('meshWhite', 'MALLA WHITE BASE:', placement, preset.white.mesh1)}
                        ${this.renderParameterInput('meshBlocker', 'MALLA BLOCKER:', placement, preset.blocker.mesh1)}
                        ${this.renderParameterInput('durometer', 'DURÓMETRO:', placement, preset.color.durometer)}
                        ${this.renderParameterInput('strokes', 'STROKES:', placement, preset.color.strokes)}
                        ${this.renderParameterInput('angle', 'ANGLE:', placement, preset.color.angle)}
                        ${this.renderParameterInput('pressure', 'PRESSURE:', placement, preset.color.pressure)}
                        ${this.renderParameterInput('speed', 'SPEED:', placement, preset.color.speed)}
                        ${this.renderParameterInput('additives', 'ADITIVOS:', placement, preset.color.additives)}
                    </div>
                </div>
            </div>
        `;
    }

    renderParameterInput(param, label, placement, defaultValue) {
        return `
            <div class="form-group">
                <label class="form-label">${label}</label>
                <input type="text" 
                       class="form-control placement-${param}"
                       value="${placement[param] || defaultValue}"
                       oninput="appState.updatePlacement(${placement.id}, {${param}: this.value})">
            </div>
        `;
    }

    renderColorsSection(placement) {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title" style="font-size: 1rem;">
                        <i class="fas fa-palette"></i> Colores para ${this.getDisplayType(placement.type)}
                    </h3>
                </div>
                <div class="card-body">
                    <div class="no-print" style="margin-bottom:20px; display:flex; gap:10px; flex-wrap:wrap;">
                        <button type="button" class="btn btn-danger btn-sm" onclick="this.addColorItem(${placement.id}, 'BLOCKER')">
                            <i class="fas fa-plus"></i> Blocker
                        </button>
                        <button type="button" class="btn btn-white-base btn-sm" onclick="this.addColorItem(${placement.id}, 'WHITE_BASE')">
                            <i class="fas fa-plus"></i> White Base
                        </button>
                        <button type="button" class="btn btn-primary btn-sm" onclick="this.addColorItem(${placement.id}, 'COLOR')">
                            <i class="fas fa-plus"></i> Color
                        </button>
                        <button type="button" class="btn btn-warning btn-sm" onclick="this.addColorItem(${placement.id}, 'METALLIC')">
                            <i class="fas fa-star"></i> Metálico
                        </button>
                    </div>
                    <div id="placement-colors-container-${placement.id}" class="color-sequence">
                        ${this.renderColorItems(placement)}
                    </div>
                </div>
            </div>
        `;
    }

    renderColorItems(placement) {
        if (!placement.colors || placement.colors.length === 0) {
            return `
                <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                    <i class="fas fa-palette" style="font-size: 1.5rem; margin-bottom: 10px; display: block;"></i>
                    <p>No hay colores agregados para este placement.</p>
                </div>
            `;
        }
        
        return placement.colors.map(color => `
            <div class="color-item">
                <span class="badge ${this.getColorBadgeClass(color.type)}">${this.getColorLabel(color.type)}</span>
                <input type="text" 
                       style="width: 60px; text-align: center; font-weight: bold;" 
                       value="${color.screenLetter}" 
                       class="form-control placement-screen-letter"
                       oninput="this.updateColorScreenLetter(${placement.id}, ${color.id}, this.value)">
                <input type="text" 
                       class="form-control placement-ink-input"
                       placeholder="Nombre de la tinta..." 
                       value="${color.val}"
                       oninput="this.updateColorValue(${placement.id}, ${color.id}, this.value)">
                <div class="color-preview" 
                     style="background-color: ${this.getColorPreview(color.val)}"
                     title="${color.val || 'Sin color'}"></div>
                <button type="button" class="btn btn-danger btn-sm" onclick="this.removeColorItem(${placement.id}, ${color.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    getColorBadgeClass(type) {
        const classes = {
            'BLOCKER': 'badge-blocker',
            'WHITE_BASE': 'badge-white',
            'COLOR': 'badge-color',
            'METALLIC': 'badge-warning'
        };
        return classes[type] || 'badge-color';
    }

    getColorLabel(type) {
        const labels = {
            'BLOCKER': 'BLOQUEADOR',
            'WHITE_BASE': 'WHITE BASE',
            'COLOR': 'COLOR',
            'METALLIC': 'METÁLICO'
        };
        return labels[type] || 'COLOR';
    }

    getColorPreview(colorName) {
        const parsed = colorParser.parse(colorName);
        return parsed.hex || '#cccccc';
    }

    renderColorPreview(placement) {
        const uniqueColors = [];
        const seen = new Set();
        
        placement.colors?.forEach(color => {
            if (color.type === 'COLOR' || color.type === 'METALLIC') {
                const colorVal = color.val?.toUpperCase().trim();
                if (colorVal && !seen.has(colorVal)) {
                    seen.add(colorVal);
                    uniqueColors.push({
                        val: colorVal,
                        screenLetter: color.screenLetter
                    });
                }
            }
        });
        
        if (uniqueColors.length === 0) return '';
        
        return `
            <div id="placement-colors-preview-${placement.id}" class="color-legend">
                <div><strong>Leyenda de Colores:</strong></div>
                <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 10px;">
                    ${uniqueColors.map(color => `
                        <div class="color-legend-item">
                            <div class="color-legend-swatch" 
                                 style="background-color: ${this.getColorPreview(color.val)}"></div>
                            <span style="font-size: 11px;">${color.screenLetter}: ${color.val}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderSequenceTable(placement) {
        // Esta función generaría la tabla de secuencia
        // Por brevedad, aquí está simplificada
        return `
            <h4 style="margin:15px 0 10px; font-size:0.9rem; color:var(--primary);">
                <i class="fas fa-list-ol"></i> Secuencia de ${this.getDisplayType(placement.type)}
            </h4>
            <div id="placement-sequence-table-${placement.id}">
                <p style="color:var(--text-secondary); font-style:italic;">
                    La secuencia se generará automáticamente al agregar colores.
                </p>
            </div>
        `;
    }

    renderSavedSpecsList() {
        const specs = Object.keys(localStorage).filter(key => key.startsWith('spec_'));
        
        if (specs.length === 0) {
            return `
                <p style="text-align: center; color: var(--text-secondary); padding: 30px;">
                    <i class="fas fa-database" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    No hay specs guardadas. Crea una nueva spec para verla aquí.
                </p>
            `;
        }
        
        return specs.map(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                return `
                    <div class="saved-spec-item">
                        <div>
                            <div style="font-weight: 700; color: var(--primary);">${data.style || 'N/A'}</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">
                                Cliente: ${data.customer || 'N/A'} | Colorway: ${data.colorway || 'N/A'}
                            </div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">
                                Guardado: ${new Date(data.savedAt).toLocaleDateString('es-ES')}
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-primary btn-sm" onclick="this.loadSpec('${key}')">
                                <i class="fas fa-edit"></i> Cargar
                            </button>
                            <button class="btn btn-outline btn-sm" onclick="this.downloadSpec('${key}')">
                                <i class="fas fa-download"></i> JSON
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="this.deleteSpec('${key}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            } catch (e) {
                console.error('Error al parsear spec guardada:', key, e);
                return '';
            }
        }).join('');
    }

    renderErrorLog() {
        const errors = appState.getState().errorLog;
        
        if (errors.length === 0) {
            return `
                <p style="text-align: center; color: var(--text-secondary); padding: 30px;">
                    <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: 10px; display: block; color: var(--success);"></i>
                    No hay errores registrados en el log.
                </p>
            `;
        }
        
        return errors.map((error, index) => `
            <div class="card" style="margin-bottom: 15px; border-left: 4px solid var(--error);">
                <div class="card-body">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <strong style="color: var(--error);">${error.context}</strong>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">
                                ${new Date(error.timestamp).toLocaleString('es-ES')}
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline" onclick="this.copyErrorDetails(${index})">
                            <i class="fas fa-copy"></i> Copiar
                        </button>
                    </div>
                    <div style="background: var(--gray-dark); padding: 10px; border-radius: var(--radius); margin-bottom: 10px;">
                        <code style="color: var(--text-primary); font-size: 0.85rem;">
                            ${error.error?.message || 'Sin mensaje'}
                        </code>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Instancia singleton
export const render = new Renderer();
