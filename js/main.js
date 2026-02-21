// Módulo para renderizar componentes
import { appState } from './state.js';
import { colorParser } from './color-parser.js';
import { presetsManager } from './presets.js';

export class Renderer {
    constructor() {
        console.log('📦 Inicializando Renderer...');
        this.templates = new Map();
        this.initTemplates();
        console.log('✅ Renderer inicializado. Templates:', Array.from(this.templates.keys()));
    }

    initTemplates() {
        // Guardar las funciones directamente
        this.templates.set('header', this.headerTemplate.bind(this));
        this.templates.set('nav', this.navTemplate.bind(this));
        this.templates.set('dashboard', this.dashboardTemplate.bind(this));
        this.templates.set('specCreator', this.specCreatorTemplate.bind(this));
        this.templates.set('savedSpecs', this.savedSpecsTemplate.bind(this));
        this.templates.set('errorLog', this.errorLogTemplate.bind(this));
    }

    // ========== TEMPLATES ==========

    headerTemplate() {
        return `
            <header class="app-header">
                <div class="header-left">
                    <div class="logo">
                        <svg width="50" height="50" viewBox="0 0 145.94 39.05" xmlns="http://www.w3.org/2000/svg">
                            <path fill="white" d="M42.24,12.37v1.93h6.91v15.25h4.21v-15.25h6.91v-3.88h-16.1l-1.93,1.95ZM92.06,20.31v1.87h4.24v2.73c-.53.38-1.13.67-1.8.86-.67.19-1.39.29-2.16.29-.84,0-1.61.15-2.32-.45-.71-.3-1.33-.72-1.84-1.27-.52-.55-.92-1.19-1.2-1.93-.28-.74-.42-1.54-.42-2.42v-.05c0-.82.14-1.59.42-2.31.28-.72.67-1.35,1.18-1.89.5-.54,1.08-.97,1.75-1.28.66-.32,1.38-.48,2.15-.48.55,0,1.05.05,1.5.14.46.09.88.22,1.27.38.39.16.77.36,1.13.60.25.16.49.34.74.54l2.94-2.97c-.47-.4-.96-.75-1.46-1.07-.53-.33-1.09-.60-1.70-.82-.60-.22-1.25-.39-1.95-.51-.70-.12-1.48-.18-2.34-.18-1.44,0-2.77.26-4,.78-1.23.52-2.29,1.23-3.18,2.13-.89.90-1.59,1.95-2.09,3.14-.50,1.19-.75,2.47-.75,3.84v-.05c0,1.42.25,2.73.74,3.94.49,1.20,1.18,2.24,2.06,3.12.88.87,1.94,1.56,3.17,2.05,1.23.49,2.59.74,4.09.74,1.75,0,3.30-.30,4.66-.89,1.36-.59,2.53-1.31,3.51-2.15v-8.31h-6.56l-1.74,1.76ZM68.15,21.8h9.02v-3.74h-9.02v-3.88h10.25v-3.74h-12.55l0.14,0.14v17.12h14.54v-3.74h-10.53v-4.02ZM114.24,10.43h-8.75v19.13h4.21v-6.12h3.31l4.10,6.12h2.57l1.39-1.40-3.71-5.43c1.22-.46,2.21-1.17,2.97-2.15.76-.97,1.13-2.24,1.13-3.79v-.05c0-1.82-.55-3.28-1.64-4.37-1.29-1.29-3.15-1.94-5.58-1.94ZM117.19,17.03c0,.82-.28,1.48-.83,1.98-.56.49-1.35.74-2.39.74h-4.26v-5.52h4.18c1.04,0,1.85.23,2.43.69.58.46.87,1.14.87,2.06v.05ZM136.7,10.29h-3.88l-8.20,19.27h4.29l1.75-4.29h8.09l1.75,4.29h1.97l1.70-1.72-7.47-17.55ZM132.16,21.58l2.54-6.20,2.54,6.20h-5.08Z"/>
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
                        <img id="logoCliente" alt="Logo del cliente" style="max-height: 35px; max-width: 120px; display: none;">
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
                    <div id="current-datetime" class="current-datetime"></div>
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
                            <p style="color: var(--text-secondary); text-align: center; padding: 40px;">
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
                        <form id="spec-creator-form" class="grid grid-2 gap-lg" onsubmit="event.preventDefault()">
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
                
                <!-- Placements Section -->
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
                        <div style="display: flex; gap: var(--space-md); flex-wrap: wrap;">
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

    savedSpecsTemplate() {
        return `
            <div id="saved-specs" class="tab-content">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-database"></i> Specs Guardadas</h3>
                        <div style="display: flex; gap: var(--space-sm);">
                            <button id="refresh-specs-btn" class="btn btn-outline btn-sm">
                                <i class="fas fa-sync-alt"></i> Actualizar
                            </button>
                            <button id="clear-all-specs-btn" class="btn btn-error btn-sm">
                                <i class="fas fa-trash"></i> Limpiar Todo
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="saved-specs-list" style="min-height: 400px;"></div>
                    </div>
                </div>
            </div>
        `;
    }

    errorLogTemplate() {
        return `
            <div id="error-log" class="tab-content">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-exclamation-triangle"></i> Log de Errores</h3>
                        <div style="display: flex; gap: var(--space-sm);">
                            <button id="refresh-errors-btn" class="btn btn-outline btn-sm">
                                <i class="fas fa-sync-alt"></i> Actualizar
                            </button>
                            <button id="export-errors-btn" class="btn btn-outline btn-sm">
                                <i class="fas fa-download"></i> Exportar
                            </button>
                            <button id="clear-errors-btn" class="btn btn-error btn-sm">
                                <i class="fas fa-trash"></i> Limpiar
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="error-log-content" style="min-height: 400px;"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // ========== RENDER METHODS ==========

    renderApp() {
        console.log('🎨 Renderizando aplicación...');
        
        const appContainer = document.getElementById('app');
        if (!appContainer) {
            console.error('❌ No se encontró el contenedor #app');
            return;
        }
        
        // Verificar que los templates existen
        console.log('Templates disponibles:', Array.from(this.templates.keys()));
        
        // Obtener los templates y ejecutarlos
        let header = '', nav = '', dashboard = '', specCreator = '', savedSpecs = '', errorLog = '';
        
        if (this.templates.has('header')) {
            header = this.templates.get('header')();
        } else {
            console.warn('Template "header" no encontrado');
        }
        
        if (this.templates.has('nav')) {
            nav = this.templates.get('nav')();
        } else {
            console.warn('Template "nav" no encontrado');
        }
        
        if (this.templates.has('dashboard')) {
            dashboard = this.templates.get('dashboard')();
        } else {
            console.warn('Template "dashboard" no encontrado');
        }
        
        if (this.templates.has('specCreator')) {
            specCreator = this.templates.get('specCreator')();
        } else {
            console.warn('Template "specCreator" no encontrado');
        }
        
        if (this.templates.has('savedSpecs')) {
            savedSpecs = this.templates.get('savedSpecs')();
        } else {
            console.warn('Template "savedSpecs" no encontrado');
        }
        
        if (this.templates.has('errorLog')) {
            errorLog = this.templates.get('errorLog')();
        } else {
            console.warn('Template "errorLog" no encontrado');
        }
        
        // Construir HTML
        appContainer.innerHTML = `
            ${header}
            ${nav}
            <main class="app-main">
                ${dashboard}
                ${specCreator}
                ${savedSpecs}
                ${errorLog}
            </main>
        `;
        
        console.log('✅ Aplicación renderizada');
        
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
        const specs = Object.keys(localStorage).filter(k => k.startsWith('spec_'));
        
        // Actualizar contadores
        const totalSpecsEl = document.getElementById('total-specs');
        if (totalSpecsEl) totalSpecsEl.textContent = specs.length;
        
        // Calcular specs de hoy
        const today = new Date().toDateString();
        const todaySpecs = specs.filter(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                return new Date(data.savedAt).toDateString() === today;
            } catch {
                return false;
            }
        }).length;
        
        const todaySpecsEl = document.getElementById('today-specs');
        if (todaySpecsEl) todaySpecsEl.textContent = todaySpecs;
        
        // Calcular proyectos activos
        const activeProjects = specs.filter(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                return data.placements && data.placements.length > 0;
            } catch {
                return false;
            }
        }).length;
        
        const activeProjectsEl = document.getElementById('active-projects');
        if (activeProjectsEl) activeProjectsEl.textContent = activeProjects;
        
        // Calcular tasa de completitud
        const totalPlacements = specs.reduce((total, key) => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                return total + (data.placements?.length || 0);
            } catch {
                return total;
            }
        }, 0);
        
        const completionRateEl = document.getElementById('completion-rate');
        if (completionRateEl) {
            completionRateEl.textContent = `${totalPlacements} placements totales`;
        }
    }

    renderPlacements(placements) {
        const tabsContainer = document.getElementById('placements-tabs');
        const placementsContainer = document.getElementById('placements-container');
        
        if (!tabsContainer || !placementsContainer) return;
        
        if (!placements || placements.length === 0) {
            tabsContainer.innerHTML = '';
            placementsContainer.innerHTML = '<p style="text-align: center; padding: 40px;">No hay placements. Agrega uno nuevo.</p>';
            return;
        }
        
        // Render tabs
        tabsContainer.innerHTML = placements.map(placement => {
            const displayType = this.getDisplayType(placement.type);
            return `
                <div class="placement-tab ${placement.id === appState.getState().currentPlacementId ? 'active' : ''}" 
                     data-placement-id="${placement.id}"
                     onclick="window.showPlacement(${placement.id})">
                    <i class="fas fa-${this.getPlacementIcon(placement.type)}"></i>
                    ${displayType.substring(0, 15)}${displayType.length > 15 ? '...' : ''}
                    ${placements.length > 1 ? `<span class="remove-tab" onclick="event.stopPropagation(); window.removePlacement(${placement.id})">&times;</span>` : ''}
                </div>
            `;
        }).join('');
        
        // Render placements
        placementsContainer.innerHTML = placements.map(placement => `
            <div id="placement-section-${placement.id}" 
                 class="placement-section ${placement.id === appState.getState().currentPlacementId ? 'active' : ''}" 
                 data-placement-id="${placement.id}">
                ${this.renderPlacementContent(placement)}
            </div>
        `).join('');
    }

    renderPlacementContent(placement) {
        const preset = presetsManager.getPreset(placement.inkType || 'WATER');
        const displayType = this.getDisplayType(placement.type);
        const isCustom = placement.type.includes('CUSTOM:');
        
        return `
            <div class="placement-header">
                <div class="placement-title">
                    <i class="fas fa-${this.getPlacementIcon(placement.type)}"></i>
                    <span>${displayType}</span>
                </div>
                <div class="placement-actions">
                    <button class="btn btn-outline btn-sm" onclick="window.duplicatePlacement(${placement.id})">
                        <i class="fas fa-copy"></i> Duplicar
                    </button>
                    ${appState.getPlacements().length > 1 ? `
                    <button class="btn btn-danger btn-sm" onclick="window.removePlacement(${placement.id})">
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
                                onchange="window.updatePlacementType(${placement.id}, this.value)">
                            ${this.getPlacementTypeOptions(placement.type)}
                        </select>
                    </div>
                    
                    ${isCustom ? `
                    <div style="margin-top:10px;">
                        <label class="form-label">NOMBRE DEL PLACEMENT:</label>
                        <input type="text" 
                               class="form-control custom-placement-name"
                               data-placement-id="${placement.id}"
                               placeholder="Escribe el nombre del placement personalizado..."
                               value="${displayType}"
                               oninput="window.updateCustomPlacement(${placement.id}, this.value)">
                    </div>
                    ` : ''}
                    
                    <!-- Imagen de Referencia -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title" style="font-size: 1rem;">
                                <i class="fas fa-image"></i> Imagen para ${displayType}
                            </h3>
                        </div>
                        <div class="card-body">
                            <div class="file-upload-area" onclick="window.openImagePickerForPlacement(${placement.id})">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>Haz clic para subir una imagen</p>
                                <p style="font-size:0.8rem; color:var(--text-secondary);">Ctrl+V para pegar</p>
                            </div>
                            <div class="image-preview-container">
                                ${placement.imageData ? `
                                    <img src="${placement.imageData}" 
                                         class="image-preview" 
                                         alt="Vista previa"
                                         style="display: block; max-width: 100%; border-radius: var(--radius-md); margin-top: 10px;">
                                    <div class="image-actions" style="display: flex; margin-top: 10px;">
                                        <button class="btn btn-danger btn-sm" onclick="window.removePlacementImage(${placement.id})">
                                            <i class="fas fa-trash"></i> Eliminar
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="placement-right-column">
                    <!-- Tipo de Tinta -->
                    <div class="form-group">
                        <label class="form-label">TIPO DE TINTA:</label>
                        <select class="form-control placement-ink-type"
                                data-placement-id="${placement.id}"
                                onchange="window.updatePlacementInkType(${placement.id}, this.value)">
                            ${this.getInkTypeOptions(placement.inkType || 'WATER')}
                        </select>
                    </div>
                    
                    <!-- Colores -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title" style="font-size: 1rem;">
                                <i class="fas fa-palette"></i> Colores para ${displayType}
                            </h3>
                        </div>
                        <div class="card-body">
                            <div class="no-print" style="margin-bottom:20px; display:flex; gap:10px; flex-wrap:wrap;">
                                <button type="button" class="btn btn-danger btn-sm" onclick="window.addPlacementColorItem(${placement.id}, 'BLOCKER')">
                                    <i class="fas fa-plus"></i> Blocker
                                </button>
                                <button type="button" class="btn btn-white-base btn-sm" onclick="window.addPlacementColorItem(${placement.id}, 'WHITE_BASE')">
                                    <i class="fas fa-plus"></i> White Base
                                </button>
                                <button type="button" class="btn btn-primary btn-sm" onclick="window.addPlacementColorItem(${placement.id}, 'COLOR')">
                                    <i class="fas fa-plus"></i> Color
                                </button>
                                <button type="button" class="btn btn-warning btn-sm" onclick="window.addPlacementColorItem(${placement.id}, 'METALLIC')">
                                    <i class="fas fa-star"></i> Metálico
                                </button>
                            </div>
                            <div id="placement-colors-container-${placement.id}" class="color-sequence"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ========== HELPER METHODS ==========

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
        
        if (type.includes('CUSTOM:')) {
            return 'star';
        }
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
        
        return types.map(type => {
            const isSelected = currentType === type.value || 
                              (currentType.includes('CUSTOM:') && type.value === 'CUSTOM');
            return `
                <option value="${type.value}" ${isSelected ? 'selected' : ''}>
                    ${type.label}
                </option>
            `;
        }).join('');
    }

    getInkTypeOptions(currentInkType) {
        const inkTypes = [
            { value: 'WATER', label: 'Water-base' },
            { value: 'PLASTISOL', label: 'Plastisol' },
            { value: 'SILICONE', label: 'Silicone' }
        ];
        
        return inkTypes.map(ink => `
            <option value="${ink.value}" ${currentInkType === ink.value ? 'selected' : ''}>
                ${ink.label}
            </option>
        `).join('');
    }

    renderSavedSpecsList() {
        const container = document.getElementById('saved-specs-list');
        if (!container) return;
        
        const specs = Object.keys(localStorage).filter(key => key.startsWith('spec_'));
        
        if (specs.length === 0) {
            container.innerHTML = `
                <p style="text-align: center; color: var(--text-secondary); padding: 30px;">
                    <i class="fas fa-database" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    No hay specs guardadas. Crea una nueva spec para verla aquí.
                </p>
            `;
            return;
        }
        
        container.innerHTML = specs.map(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                return `
                    <div style="padding:15px; border-bottom:1px solid var(--border-dark); display:flex; justify-content:space-between; align-items:center;">
                        <div style="flex: 1;">
                            <div style="font-weight: 700; color: var(--primary);">${data.style || 'N/A'}</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">Cliente: ${data.customer || 'N/A'} | Colorway: ${data.colorway || 'N/A'}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">Guardado: ${new Date(data.savedAt).toLocaleDateString('es-ES')}</div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-primary btn-sm" onclick="window.loadSpec('${key}')"><i class="fas fa-edit"></i> Cargar</button>
                            <button class="btn btn-outline btn-sm" onclick="window.downloadSpec('${key}')"><i class="fas fa-download"></i> JSON</button>
                            <button class="btn btn-danger btn-sm" onclick="window.deleteSpec('${key}')"><i class="fas fa-trash"></i></button>
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
        const container = document.getElementById('error-log-content');
        if (!container) return;
        
        const errors = appState.getState().errorLog || [];
        
        if (errors.length === 0) {
            container.innerHTML = `
                <p style="text-align: center; color: var(--text-secondary); padding: 30px;">
                    <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: 10px; display: block; color: var(--success);"></i>
                    No hay errores registrados en el log.
                </p>
            `;
            return;
        }
        
        container.innerHTML = errors.map((error, index) => `
            <div class="card" style="margin-bottom: 15px; border-left: 4px solid var(--error);">
                <div class="card-body">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <strong style="color: var(--error);">${error.context || 'Error'}</strong>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">
                                ${new Date(error.timestamp).toLocaleString('es-ES')}
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline" onclick="window.copyErrorDetails(${index})">
                            <i class="fas fa-copy"></i> Copiar
                        </button>
                    </div>
                    <div style="background: var(--bg-secondary); padding: 10px; border-radius: var(--radius); margin-bottom: 10px;">
                        <code style="color: var(--text-primary); font-size: 0.85rem;">
                            ${error.error?.message || 'Sin mensaje'}
                        </code>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateCurrentPlacement() {
        const currentPlacement = appState.getCurrentPlacement();
        if (currentPlacement) {
            // Actualizar UI del placement actual
            const tabs = document.querySelectorAll('.placement-tab');
            tabs.forEach(tab => {
                const placementId = parseInt(tab.dataset.placementId);
                tab.classList.toggle('active', placementId === currentPlacement.id);
            });
            
            const sections = document.querySelectorAll('.placement-section');
            sections.forEach(section => {
                const placementId = parseInt(section.dataset.placementId);
                section.classList.toggle('active', placementId === currentPlacement.id);
            });
        }
    }

    updateFormUI(formData) {
        // Implementar actualización de formulario si es necesario
    }
}

// Instancia singleton
export const render = new Renderer();
