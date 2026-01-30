// js/main.js - PUNTO DE ENTRADA PRINCIPAL DE TEGRA SPEC MANAGER
console.log('🎯 Tegra Spec Manager - Punto de entrada principal cargado');

// ========== CONFIGURACIÓN INICIAL ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, iniciando aplicación...');
    
    // 1. Verificar configuraciones críticas
    checkRequiredConfigs();
    
    // 2. Inicializar módulos
    initializeModules();
    
    // 3. Configurar eventos globales
    setupGlobalEventListeners();
    
    // 4. Mostrar estado inicial
    showAppStatus('✅ Tegra Spec Manager inicializado', 'success');
    
    console.log('✅ Aplicación inicializada correctamente');
});

// ========== VERIFICAR CONFIGURACIONES REQUERIDAS ==========
function checkRequiredConfigs() {
    console.log('🔍 Verificando configuraciones...');
    
    // Verificar Config
    if (!window.Config) {
        console.error('❌ ERROR: Config no está definida');
        console.log('💡 Asegúrate que config.js se cargue antes que main.js');
        
        // Crear configuración mínima de emergencia
        window.Config = {
            APP: { 
                VERSION: '1.0.0', 
                NAME: 'Tegra Spec Manager',
                AUTHOR: 'Tegra Team'
            },
            COLOR_DATABASES: {
                PANTONE: {},
                GEARFORSPORT: {},
                RAL: {},
                CUSTOM: {},
                INSTITUCIONAL: {}
            },
            INK_PRESETS: {
                WATER: { 
                    temp: '320 °F', 
                    time: '1:40 min',
                    color: { 
                        mesh: '157/48', 
                        durometer: '70', 
                        speed: '35', 
                        angle: '15', 
                        strokes: '2', 
                        pressure: '40',
                        additives: '3 % cross-linker 500 · 1.5 % antitack'
                    },
                    blocker: { 
                        name: 'BLOCKER CHT', 
                        mesh1: '122/55', 
                        mesh2: '157/48', 
                        durometer: '70', 
                        speed: '35', 
                        angle: '15', 
                        strokes: '2', 
                        pressure: '40', 
                        additives: 'N/A'
                    },
                    white: { 
                        name: 'AQUAFLEX WHITE', 
                        mesh1: '198/40', 
                        mesh2: '157/48', 
                        durometer: '70', 
                        speed: '35', 
                        angle: '15', 
                        strokes: '2', 
                        pressure: '40', 
                        additives: 'N/A'
                    }
                },
                PLASTISOL: { 
                    temp: '320 °F', 
                    time: '1:00 min',
                    color: { 
                        mesh: '156/64', 
                        durometer: '65', 
                        speed: '35', 
                        angle: '15', 
                        strokes: '1', 
                        pressure: '40',
                        additives: 'Catalizador estándar'
                    }
                },
                SILICONE: { 
                    temp: '300 °F', 
                    time: '2:00 min',
                    color: { 
                        mesh: '110/64', 
                        durometer: '75', 
                        speed: '30', 
                        angle: '20', 
                        strokes: '2', 
                        pressure: '35',
                        additives: 'Catalizador de silicona'
                    }
                }
            },
            METALLIC_CODES: ["871C", "872C", "873C", "874C", "875C", "876C", "877C"],
            GENDER_MAP: {
                'MENS': 'M',
                'WOMENS': 'F',
                'UNISEX': 'U',
                'YOUTH': 'Y',
                'BOYS': 'B',
                'GIRLS': 'G'
            },
            PLACEMENT_TYPES: ['FRONT', 'BACK', 'SLEEVE', 'CHEST', 'TV. NUMBERS', 'SHOULDER', 'COLLAR', 'CUSTOM'],
            INK_TYPES: ['WATER', 'PLASTISOL', 'SILICONE'],
            DESIGNERS: ['ELMER VELEZ', 'DANIEL HERNANDEZ', 'CINDY PINEDA', 'FERNANDO FERRERA', 'NILDA CORDOBA', 'OTRO']
        };
    } else {
        console.log('✅ Config cargada correctamente');
    }
    
    // Verificar LogoConfig
    if (!window.LogoConfig) {
        console.warn('⚠️ ADVERTENCIA: LogoConfig no está definida');
        // Configuración básica de emergencia
        window.LogoConfig = {
            'NIKE': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Nike-Logotipo-PNG-Photo.png',
            'FANATICS': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Fanatics_company_logo.svg.png',
            'GEAR FOR SPORT': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png',
            'ADIDAS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1280px-Adidas_Logo.svg.png',
            'PUMA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Puma_Logo.svg/1280px-Puma_Logo.svg.png',
            'UNDER ARMOUR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Under_armour_logo.svg/1280px-Under_armour_logo.svg.png'
        };
    } else {
        console.log('✅ LogoConfig cargada correctamente');
    }
    
    // Verificar TeamsConfig
    if (!window.TeamsConfig) {
        console.warn('⚠️ ADVERTENCIA: TeamsConfig no está definida');
    } else {
        console.log('✅ TeamsConfig cargada correctamente');
    }
    
    // Verificar módulos core existentes
    if (!window.Utils) {
        console.warn('⚠️ Utils no está definida - algunas funciones pueden fallar');
    }
    
    if (!window.stateManager) {
        console.warn('⚠️ stateManager no está definido');
    }
    
    console.log('✅ Configuraciones verificadas');
}

// ========== INICIALIZAR MÓDULOS ==========
function initializeModules() {
    console.log('📦 Inicializando módulos...');
    
    // ORDEN DE CARGA CRÍTICO:
    // 1. Módulos de datos y configuración
    // 2. Módulos core
    // 3. Módulos UI
    // 4. Módulos de funcionalidad específica
    
    // 1. Cargar módulos de configuración
    loadConfigModules();
    
    // 2. Cargar módulos core
    loadCoreModules();
    
    // 3. Cargar módulos UI
    loadUIModules();
    
    // 4. Cargar módulos de datos
    loadDataModules();
    
    // 5. Cargar módulos de funcionalidad
    loadFunctionalityModules();
    
    // 6. Inicializar variables globales
    initGlobalVariables();
    
    console.log('✅ Todos los módulos inicializados');
}

// ========== FUNCIONES DE CARGA DE MÓDULOS ==========

function loadConfigModules() {
    console.log('⚙️ Cargando módulos de configuración...');
    // Estos ya están cargados por las etiquetas <script> en el HTML
}

function loadCoreModules() {
    console.log('🔧 Cargando módulos core...');
    
    // Verificar que los módulos core estén cargados
    const coreModules = ['stateManager', 'errorHandler'];
    coreModules.forEach(module => {
        if (window[module]) {
            console.log(`✅ ${module} disponible`);
        } else {
            console.warn(`⚠️ ${module} no disponible`);
        }
    });
}

function loadUIModules() {
    console.log('🎨 Cargando módulos UI...');
    
    // Cargar módulo de tema
    loadModule('js/modules/ui/theme-manager.js', 'ThemeManager', () => {
        console.log('✅ ThemeManager cargado');
    });
    
    // Cargar módulo de dashboard
    loadModule('js/modules/ui/dashboard-manager.js', 'DashboardManager', () => {
        console.log('✅ DashboardManager cargado');
    });
    
    // Cargar módulo de pestañas
    loadModule('js/modules/ui/tabs-manager.js', 'TabsManager', () => {
        console.log('✅ TabsManager cargado');
    });
}

function loadDataModules() {
    console.log('💾 Cargando módulos de datos...');
    
    // Cargar módulo de clientes
    loadModule('js/modules/data/client-manager.js', 'ClientManager', () => {
        console.log('✅ ClientManager cargado');
    });
    
    // Cargar módulo de specs
    loadModule('js/modules/data/specs-manager.js', 'SpecsManager', () => {
        console.log('✅ SpecsManager cargado');
    });
    
    // Cargar módulo de almacenamiento
    loadModule('js/modules/data/storage-manager.js', 'StorageManager', () => {
        console.log('✅ StorageManager cargado');
    });
}

function loadFunctionalityModules() {
    console.log('🛠️ Cargando módulos de funcionalidad...');
    
    // Cargar módulos de placements en orden
    loadPlacementsModules();
    
    // Cargar módulos de exportación
    loadExportModules();
}

function loadPlacementsModules() {
    console.log('📍 Cargando módulos de placements...');
    
    // ORDEN CRÍTICO: Core → UI → Colors → Export
    const placementsModules = [
        { path: 'js/modules/placements/placements-core.js', name: 'PlacementsCore' },
        { path: 'js/modules/placements/placements-ui.js', name: 'PlacementsUI' },
        { path: 'js/modules/placements/placements-colors.js', name: 'PlacementsColors' },
        { path: 'js/modules/placements/placements-export.js', name: 'PlacementsExport' }
    ];
    
    loadModulesSequentially(placementsModules, () => {
        console.log('✅ Todos los módulos de placements cargados');
        
        // Inicializar placements después de cargar todo
        setTimeout(() => {
            if (window.PlacementsUI && window.PlacementsUI.initializePlacementsUI) {
                window.PlacementsUI.initializePlacementsUI();
            }
        }, 1000);
    });
}

function loadExportModules() {
    console.log('📤 Cargando módulos de exportación...');
    
    const exportModules = [
        { path: 'js/modules/export/pdf-exporter.js', name: 'PDFExporter' },
        { path: 'js/modules/export/excel-exporter.js', name: 'ExcelExporter' },
        { path: 'js/modules/export/zip-exporter.js', name: 'ZipExporter' }
    ];
    
    loadModulesSequentially(exportModules, () => {
        console.log('✅ Todos los módulos de exportación cargados');
    });
}

// ========== FUNCIONES AUXILIARES DE CARGA ==========

function loadModule(modulePath, moduleName, onSuccess) {
    // Verificar si ya está cargado
    if (window[moduleName]) {
        console.log(`✅ ${moduleName} ya cargado`);
        if (onSuccess) onSuccess();
        return;
    }
    
    const script = document.createElement('script');
    script.src = modulePath;
    
    script.onload = function() {
        console.log(`✅ ${moduleName} cargado correctamente`);
        if (onSuccess) onSuccess();
    };
    
    script.onerror = function() {
        console.error(`❌ Error al cargar ${moduleName} desde ${modulePath}`);
        
        // Intentar cargar desde ruta alternativa
        const altScript = document.createElement('script');
        altScript.src = modulePath.replace('js/', '');
        
        altScript.onload = function() {
            console.log(`✅ ${moduleName} cargado desde ruta alternativa`);
            if (onSuccess) onSuccess();
        };
        
        altScript.onerror = function() {
            console.error(`❌ Error crítico: ${moduleName} no pudo ser cargado`);
        };
        
        document.head.appendChild(altScript);
    };
    
    document.head.appendChild(script);
}

function loadModulesSequentially(modules, onComplete) {
    let index = 0;
    
    function loadNext() {
        if (index >= modules.length) {
            if (onComplete) onComplete();
            return;
        }
        
        const module = modules[index];
        console.log(`📦 Cargando ${module.name}... (${index + 1}/${modules.length})`);
        
        loadModule(module.path, module.name, () => {
            index++;
            loadNext();
        });
    }
    
    loadNext();
}

// ========== INICIALIZACIÓN DE VARIABLES GLOBALES ==========

function initGlobalVariables() {
    console.log('🌍 Inicializando variables globales...');
    
    // Variables globales esenciales
    if (typeof window.globalPlacements === 'undefined') {
        window.globalPlacements = [];
        console.log('✅ globalPlacements inicializado como array vacío');
    }
    
    if (typeof window.globalCurrentPlacementId === 'undefined') {
        window.globalCurrentPlacementId = 1;
        console.log('✅ globalCurrentPlacementId inicializado como 1');
    }
    
    if (typeof window.globalClientLogoCache === 'undefined') {
        window.globalClientLogoCache = {};
        console.log('✅ globalClientLogoCache inicializado como objeto vacío');
    }
    
    if (typeof window.globalIsDarkMode === 'undefined') {
        window.globalIsDarkMode = true;
        console.log('✅ globalIsDarkMode inicializado como true');
    }
    
    // Variables de estado de la aplicación
    if (typeof window.appState === 'undefined') {
        window.appState = {
            initialized: true,
            modulesLoaded: 0,
            lastError: null,
            currentTab: 'dashboard',
            lastSave: null,
            autoSaveEnabled: true
        };
        console.log('✅ appState inicializado');
    }
    
    console.log('✅ Variables globales inicializadas');
}

// ========== CONFIGURAR EVENTOS GLOBALES ==========

function setupGlobalEventListeners() {
    console.log('🔗 Configurando eventos globales...');
    
    // 1. Eventos de navegación por pestañas
    setupTabNavigation();
    
    // 2. Eventos de botones principales
    setupMainButtons();
    
    // 3. Eventos de inputs de archivos
    setupFileInputs();
    
    // 4. Eventos de teclado
    setupKeyboardShortcuts();
    
    // 5. Eventos de formulario
    setupFormEvents();
    
    // 6. Evento para pegar imágenes
    setupPasteHandler();
    
    console.log('✅ Eventos globales configurados');
}

function setupTabNavigation() {
    console.log('🔗 Configurando navegación por pestañas...');
    
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.getAttribute('data-tab');
            
            if (window.TabsManager && window.TabsManager.showTab) {
                window.TabsManager.showTab(tabName);
            } else if (window.showTab) {
                window.showTab(tabName);
            } else {
                console.error('❌ No hay gestor de pestañas disponible');
                showAppStatus('Error: Gestor de pestañas no disponible', 'error');
            }
        });
    });
    
    // Botones que cambian de pestaña
    const tabButtons = document.querySelectorAll('[data-tab]');
    tabButtons.forEach(button => {
        if (!button.classList.contains('nav-tab')) {
            button.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                if (window.TabsManager && window.TabsManager.showTab) {
                    window.TabsManager.showTab(tabName);
                }
            });
        }
    });
}

function setupMainButtons() {
    console.log('🔗 Configurando botones principales...');
    
    // Botón: Agregar Placement
    const addPlacementBtn = document.getElementById('addPlacementBtn');
    if (addPlacementBtn) {
        addPlacementBtn.addEventListener('click', function() {
            if (window.PlacementsCore && window.PlacementsCore.addNewPlacement) {
                const newId = window.PlacementsCore.addNewPlacement();
                if (window.PlacementsUI) {
                    window.PlacementsUI.renderAllPlacements();
                    window.PlacementsUI.showPlacement(newId);
                }
                showAppStatus('✅ Nuevo placement agregado', 'success');
            } else {
                showAppStatus('❌ Módulo de placements no disponible', 'error');
            }
        });
    }
    
    // Botón: Guardar Spec
    const saveSpecBtns = document.querySelectorAll('[id^="saveSpecBtn"]');
    saveSpecBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (window.SpecsManager && window.SpecsManager.saveCurrentSpec) {
                window.SpecsManager.saveCurrentSpec();
            } else if (window.saveCurrentSpec) {
                window.saveCurrentSpec();
            } else {
                showAppStatus('❌ Función de guardar no disponible', 'error');
            }
        });
    });
    
    // Botón: Exportar PDF
    const exportPDFBtn = document.getElementById('exportPDFBtn');
    if (exportPDFBtn) {
        exportPDFBtn.addEventListener('click', function() {
            if (window.PDFExporter && window.PDFExporter.exportPDF) {
                window.PDFExporter.exportPDF();
            } else if (window.exportPDF) {
                window.exportPDF();
            } else {
                showAppStatus('❌ Exportador PDF no disponible', 'error');
            }
        });
    }
    
    // Botón: Exportar Excel
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', function() {
            if (window.ExcelExporter && window.ExcelExporter.exportToExcel) {
                window.ExcelExporter.exportToExcel();
            } else if (window.exportToExcel) {
                window.exportToExcel();
            } else {
                showAppStatus('❌ Exportador Excel no disponible', 'error');
            }
        });
    }
    
    // Botón: Exportar ZIP
    const exportZipBtn = document.getElementById('exportZipBtn');
    if (exportZipBtn) {
        exportZipBtn.addEventListener('click', function() {
            if (window.ZipExporter && window.ZipExporter.downloadProjectZip) {
                window.ZipExporter.downloadProjectZip();
            } else if (window.downloadProjectZip) {
                window.downloadProjectZip();
            } else {
                showAppStatus('❌ Exportador ZIP no disponible', 'error');
            }
        });
    }
    
    // Botón: Limpiar Formulario
    const clearFormBtns = document.querySelectorAll('[id^="clearFormBtn"]');
    clearFormBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('⚠️ ¿Estás seguro de que quieres limpiar todo el formulario?\n\nSe perderán todos los datos no guardados.')) {
                if (window.SpecsManager && window.SpecsManager.clearForm) {
                    window.SpecsManager.clearForm();
                } else if (window.clearForm) {
                    window.clearForm();
                } else {
                    // Limpieza básica
                    document.querySelectorAll('input:not(#folder-num), textarea, select').forEach(i => {
                        if (i.type !== 'button' && i.type !== 'submit') {
                            i.value = '';
                        }
                    });
                    showAppStatus('🧹 Formulario limpiado', 'success');
                }
            }
        });
    });
    
    // Botón: Limpiar Todo (Specs)
    const clearAllSpecsBtn = document.getElementById('clearAllSpecsBtn');
    if (clearAllSpecsBtn) {
        clearAllSpecsBtn.addEventListener('click', function() {
            if (confirm('⚠️ ¿Estás seguro de que quieres eliminar TODAS las specs guardadas?\n\nEsta acción no se puede deshacer.')) {
                if (window.StorageManager && window.StorageManager.clearAllSpecs) {
                    window.StorageManager.clearAllSpecs();
                } else if (window.clearAllSpecs) {
                    window.clearAllSpecs();
                }
                showAppStatus('🗑️ Todas las specs eliminadas', 'success');
            }
        });
    }
    
    // Botón: Limpiar Log de Errores
    const clearErrorLogBtns = document.querySelectorAll('[id^="clearErrorLog"], #clearLogBtn');
    clearErrorLogBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que quieres limpiar el log de errores?')) {
                if (window.errorHandler && window.errorHandler.clearErrors) {
                    window.errorHandler.clearErrors();
                } else if (window.clearErrorLog) {
                    window.clearErrorLog();
                }
                showAppStatus('🗑️ Log de errores limpiado', 'success');
            }
        });
    });
    
    // Botón: Exportar Log de Errores
    const exportErrorLogBtn = document.getElementById('exportErrorLogBtn');
    if (exportErrorLogBtn) {
        exportErrorLogBtn.addEventListener('click', function() {
            if (window.errorHandler && window.errorHandler.exportErrors) {
                window.errorHandler.exportErrors();
            } else if (window.exportErrorLog) {
                window.exportErrorLog();
            }
        });
    }
    
    // Botón: Cargar SWO/Spec
    const loadBtns = document.querySelectorAll('[id^="loadSWO"], #loadSpecBtn');
    loadBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('excelFile').click();
        });
    });
    
    // Botón: Ver Historial
    const viewHistoryBtn = document.getElementById('viewHistoryBtn');
    if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener('click', function() {
            if (window.TabsManager && window.TabsManager.showTab) {
                window.TabsManager.showTab('saved-specs');
            }
            if (window.SpecsManager && window.SpecsManager.loadSavedSpecsList) {
                window.SpecsManager.loadSavedSpecsList();
            }
        });
    }
}

function setupFileInputs() {
    console.log('🔗 Configurando inputs de archivos...');
    
    // Input para archivos Excel/JSON/ZIP
    const excelFileInput = document.getElementById('excelFile');
    if (excelFileInput) {
        excelFileInput.addEventListener('change', function(e) {
            if (!e.target.files[0]) return;
            
            const file = e.target.files[0];
            const fileName = file.name.toLowerCase();
            
            if (fileName.endsWith('.zip')) {
                // Cargar proyecto ZIP
                if (window.ZipExporter && window.ZipExporter.loadProjectZip) {
                    window.ZipExporter.loadProjectZip(file);
                }
            } else if (fileName.endsWith('.json')) {
                // Cargar spec JSON
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (window.SpecsManager && window.SpecsManager.loadSpecData) {
                            window.SpecsManager.loadSpecData(data);
                            showAppStatus('✅ Spec cargada desde JSON', 'success');
                        }
                    } catch (err) {
                        showAppStatus('❌ Error leyendo archivo JSON', 'error');
                    }
                };
                reader.readAsText(file);
            } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                // Procesar Excel
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        
                        let worksheet = null;
                        let sheetUsed = '';
                        const sheetPriority = ['SWO', 'PPS', 'Proto 1', 'Proto 2', 'Proto 3', 'Proto 4', 'Sheet1'];
                        
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
                        
                        if (window.ExcelExporter && window.ExcelExporter.processExcelData) {
                            window.ExcelExporter.processExcelData(worksheet, sheetUsed);
                        }
                        
                    } catch (err) {
                        showAppStatus('❌ Error leyendo archivo Excel', 'error');
                    }
                };
                reader.readAsArrayBuffer(file);
            }
            
            // Limpiar input
            e.target.value = '';
        });
    }
    
    // Input para imágenes de placements
    const placementImageInput = document.getElementById('placementImageInput');
    if (placementImageInput) {
        placementImageInput.addEventListener('change', function(e) {
            if (!e.target.files[0]) return;
            
            const file = e.target.files[0];
            const placementId = window.PlacementsCore ? 
                window.PlacementsCore.getCurrentPlacementId() : 1;
            
            if (!file.type.match('image.*')) {
                showAppStatus('❌ Por favor, selecciona un archivo de imagen válido', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(ev) {
                const placement = window.PlacementsCore ? 
                    window.PlacementsCore.getPlacementById(placementId) : null;
                
                if (placement) {
                    placement.imageData = ev.target.result;
                    
                    // Actualizar UI
                    const img = document.getElementById(`placement-image-preview-${placementId}`);
                    const imageActions = document.getElementById(`placement-image-actions-${placementId}`);
                    
                    if (img) {
                        img.src = ev.target.result;
                        img.style.display = 'block';
                    }
                    
                    if (imageActions) {
                        imageActions.style.display = 'flex';
                    }
                    
                    showAppStatus(`✅ Imagen cargada para placement`, 'success');
                }
            };
            reader.readAsDataURL(file);
            
            e.target.value = '';
        });
    }
}

function setupKeyboardShortcuts() {
    console.log('🔗 Configurando atajos de teclado...');
    
    document.addEventListener('keydown', function(e) {
        // Ctrl+S: Guardar spec
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            if (window.SpecsManager && window.SpecsManager.saveCurrentSpec) {
                window.SpecsManager.saveCurrentSpec();
            }
        }
        
        // Ctrl+E: Exportar Excel
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            if (window.ExcelExporter && window.ExcelExporter.exportToExcel) {
                window.ExcelExporter.exportToExcel();
            }
        }
        
        // Ctrl+P: Exportar PDF
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            if (window.PDFExporter && window.PDFExporter.exportPDF) {
                window.PDFExporter.exportPDF();
            }
        }
        
        // Ctrl+Shift+D: Diagnóstico
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            diagnoseApp();
        }
        
        // Ctrl+N: Nueva spec (limpiar formulario)
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            if (confirm('¿Crear nueva spec? Se perderán los cambios no guardados.')) {
                if (window.SpecsManager && window.SpecsManager.clearForm) {
                    window.SpecsManager.clearForm();
                }
            }
        }
        
        // Ctrl+Tab: Cambiar entre placements
        if (e.ctrlKey && e.key === 'Tab') {
            e.preventDefault();
            if (window.PlacementsCore && window.PlacementsUI) {
                const placements = window.PlacementsCore.getAllPlacements();
                const currentId = window.PlacementsCore.getCurrentPlacementId();
                const currentIndex = placements.findIndex(p => p.id === currentId);
                
                if (currentIndex !== -1) {
                    const nextIndex = e.shiftKey ? 
                        (currentIndex - 1 + placements.length) % placements.length :
                        (currentIndex + 1) % placements.length;
                    
                    window.PlacementsUI.showPlacement(placements[nextIndex].id);
                }
            }
        }
    });
}

function setupFormEvents() {
    console.log('🔗 Configurando eventos de formulario...');
    
    // Input de cliente para actualizar logo
    const customerInput = document.getElementById('customer');
    if (customerInput) {
        customerInput.addEventListener('input', function() {
            if (window.ClientManager && window.ClientManager.updateClientLogo) {
                window.ClientManager.updateClientLogo();
            } else if (window.updateClientLogo) {
                window.updateClientLogo();
            }
        });
    }
    
    // Input de estilo para detectar equipo y género
    const styleInput = document.getElementById('style');
    if (styleInput) {
        styleInput.addEventListener('input', function() {
            if (window.Utils && window.Utils.detectTeamFromStyle) {
                const team = window.Utils.detectTeamFromStyle(this.value);
                const nameTeamInput = document.getElementById('name-team');
                if (nameTeamInput && team) {
                    nameTeamInput.value = team;
                }
            }
            
            if (window.Utils && window.Utils.extractGenderFromStyle) {
                const gender = window.Utils.extractGenderFromStyle(this.value);
                const genderInput = document.getElementById('gender');
                if (genderInput && gender) {
                    genderInput.value = gender;
                }
            }
        });
    }
    
    // Auto-guardado cada 2 minutos
    if (window.appState && window.appState.autoSaveEnabled) {
        setInterval(() => {
            if (window.SpecsManager && window.SpecsManager.autoSave) {
                window.SpecsManager.autoSave();
            }
        }, 120000); // 2 minutos
    }
}

function setupPasteHandler() {
    console.log('🔗 Configurando handler para pegar imágenes...');
    
    document.addEventListener('paste', function(e) {
        // Solo procesar en la pestaña de spec-creator
        const specCreatorTab = document.getElementById('spec-creator');
        if (!specCreatorTab || !specCreatorTab.classList.contains('active')) {
            return;
        }
        
        const items = e.clipboardData.items;
        
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    const placementId = window.PlacementsCore ? 
                        window.PlacementsCore.getCurrentPlacementId() : 1;
                    
                    const placement = window.PlacementsCore ? 
                        window.PlacementsCore.getPlacementById(placementId) : null;
                    
                    if (placement) {
                        placement.imageData = event.target.result;
                        
                        // Actualizar UI
                        const img = document.getElementById(`placement-image-preview-${placementId}`);
                        const imageActions = document.getElementById(`placement-image-actions-${placementId}`);
                        
                        if (img && imageActions) {
                            img.src = event.target.result;
                            img.style.display = 'block';
                            imageActions.style.display = 'flex';
                        }
                        
                        showAppStatus(`✅ Imagen pegada en placement`, 'success');
                    }
                };
                
                reader.readAsDataURL(blob);
                e.preventDefault();
                break;
            }
        }
    });
}

// ========== FUNCIONES DE UTILIDAD ==========

function showAppStatus(message, type = 'info') {
    console.log(`📢 [${type.toUpperCase()}] ${message}`);
    
    const statusEl = document.getElementById('statusMessage');
    if (!statusEl) {
        // Crear elemento si no existe
        const newStatusEl = document.createElement('div');
        newStatusEl.id = 'statusMessage';
        newStatusEl.className = 'status-message';
        document.body.appendChild(newStatusEl);
        return showAppStatus(message, type);
    }
    
    // Limpiar clases anteriores
    statusEl.className = 'status-message';
    
    // Agregar clase de tipo
    statusEl.classList.add(`status-${type}`);
    
    // Establecer mensaje
    statusEl.textContent = message;
    statusEl.style.display = 'block';
    
    // Ocultar después de 4 segundos
    setTimeout(() => {
        if (statusEl.textContent === message) {
            statusEl.style.display = 'none';
        }
    }, 4000);
}

function showModuleStatus(moduleName, status = 'loaded') {
    const statusIcons = {
        'loaded': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    };
    
    const icon = statusIcons[status] || '🔹';
    console.log(`${icon} Módulo ${moduleName}: ${status}`);
}

// ========== FUNCIONES DE DIAGNÓSTICO ==========

function diagnoseApp() {
    console.log('🩺 Diagnóstico de la aplicación:');
    console.log('===============================');
    
    // Verificar módulos cargados
    const modules = [
        'ThemeManager', 'DashboardManager', 'TabsManager',
        'ClientManager', 'SpecsManager', 'StorageManager',
        'PlacementsCore', 'PlacementsUI', 'PlacementsColors', 'PlacementsExport',
        'PDFExporter', 'ExcelExporter', 'ZipExporter'
    ];
    
    console.log('📦 Módulos cargados:');
    modules.forEach(module => {
        const exists = typeof window[module] !== 'undefined';
        console.log(`${exists ? '✅' : '❌'} ${module}: ${exists ? 'CARGADO' : 'NO CARGADO'}`);
    });
    
    // Verificar funciones globales esenciales
    const essentialFunctions = [
        'showTab',
        'updateClientLogo',
        'updateDashboard',
        'saveCurrentSpec',
        'exportPDF',
        'exportToExcel',
        'downloadProjectZip'
    ];
    
    console.log('\n🔍 Funciones globales:');
    essentialFunctions.forEach(func => {
        const exists = typeof window[func] === 'function';
        console.log(`${exists ? '✅' : '⚠️'} ${func}(): ${exists ? 'Disponible' : 'No disponible'}`);
    });
    
    // Verificar elementos DOM críticos
    const criticalElements = [
        'customer', 'style', 'colorway', 'folder-num',
        'placements-container', 'placements-tabs',
        'dashboard', 'spec-creator', 'saved-specs', 'error-log'
    ];
    
    console.log('\n🎯 Elementos DOM críticos:');
    criticalElements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`${element ? '✅' : '❌'} #${id}: ${element ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);
    });
    
    // Información del estado
    console.log('\n📊 Estado de la aplicación:');
    console.log(`Versión: ${window.Config?.APP?.VERSION || 'Desconocida'}`);
    console.log(`Placements activos: ${window.PlacementsCore ? window.PlacementsCore.getTotalPlacements() : 0}`);
    console.log(`Specs guardadas: ${Object.keys(localStorage).filter(k => k.startsWith('spec_')).length}`);
    
    console.log('===============================');
    console.log('🩺 Diagnóstico completado');
    
    showAppStatus('Diagnóstico ejecutado - Ver consola', 'info');
}

// ========== MANEJO DE ERRORES GLOBALES ==========

window.addEventListener('error', function(e) {
    console.error('🚨 ERROR GLOBAL CAPTURADO:', e.message);
    console.error('Archivo:', e.filename);
    console.error('Línea:', e.lineno);
    console.error('Columna:', e.colno);
    console.error('Error completo:', e.error);
    
    // Mostrar notificación amigable
    showAppStatus(`Error: ${e.message.substring(0, 50)}...`, 'error');
    
    // Registrar en error handler si existe
    if (window.errorHandler && typeof window.errorHandler.log === 'function') {
        window.errorHandler.log('global_error', e.error, {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            timestamp: new Date().toISOString()
        });
    }
});

// ========== API PÚBLICA DE LA APLICACIÓN ==========

window.AppManager = {
    // Funciones principales
    showStatus: showAppStatus,
    diagnose: diagnoseApp,
    reloadModules: initializeModules,
    
    // Información del sistema
    getSystemInfo: function() {
        return {
            app: window.Config?.APP?.NAME || 'Tegra Spec Manager',
            version: window.Config?.APP?.VERSION || '1.0.0',
            modules: this.getModules(),
            placements: window.PlacementsCore ? window.PlacementsCore.getTotalPlacements() : 0,
            specs: Object.keys(localStorage).filter(k => k.startsWith('spec_')).length,
            theme: window.globalIsDarkMode ? 'dark' : 'light',
            currentTab: window.appState?.currentTab || 'dashboard'
        };
    },
    
    getModules: function() {
        const modules = [
            'ThemeManager', 'DashboardManager', 'TabsManager',
            'ClientManager', 'SpecsManager', 'StorageManager',
            'PlacementsCore', 'PlacementsUI', 'PlacementsColors', 'PlacementsExport',
            'PDFExporter', 'ExcelExporter', 'ZipExporter',
            'Utils', 'Config', 'LogoConfig', 'TeamsConfig',
            'stateManager', 'errorHandler'
        ];
        
        const result = {};
        modules.forEach(module => {
            result[module] = !!window[module];
        });
        
        return result;
    },
    
    // Utilidades
    showModuleStatus,
    
    // Control de la aplicación
    switchTheme: function() {
        if (window.ThemeManager && window.ThemeManager.toggleTheme) {
            window.ThemeManager.toggleTheme();
        } else if (window.toggleTheme) {
            window.toggleTheme();
        }
    },
    
    saveAppState: function() {
        if (window.SpecsManager && window.SpecsManager.saveCurrentSpec) {
            return window.SpecsManager.saveCurrentSpec();
        }
        return false;
    },
    
    loadAppState: function(key) {
        if (window.StorageManager && window.StorageManager.loadSpec) {
            return window.StorageManager.loadSpec(key);
        }
        return null;
    },
    
    // Información de la app
    _info: {
        name: 'AppManager',
        version: '2.0.0',
        description: 'Gestor principal de Tegra Spec Manager',
        author: 'Tegra Development Team'
    }
};

// ========== INICIALIZACIÓN ADICIONAL RETARDADA ==========

// Esperar a que todos los módulos se carguen
setTimeout(() => {
    console.log('🕒 Verificación de estado posterior a la carga...');
    
    // Verificar que el dashboard se muestre
    const dashboardTab = document.getElementById('dashboard');
    if (dashboardTab && !dashboardTab.classList.contains('active')) {
        console.log('⚠️ Dashboard no activo, activando...');
        if (window.TabsManager && typeof window.TabsManager.showTab === 'function') {
            window.TabsManager.showTab('dashboard');
        }
    }
    
    // Actualizar dashboard
    if (window.DashboardManager && window.DashboardManager.updateDashboard) {
        window.DashboardManager.updateDashboard();
    }
    
    // Actualizar fecha y hora
    if (window.DashboardManager && window.DashboardManager.updateDateTime) {
        window.DashboardManager.updateDateTime();
        setInterval(() => {
            if (window.DashboardManager && window.DashboardManager.updateDateTime) {
                window.DashboardManager.updateDateTime();
            }
        }, 60000);
    }
    
    // Cargar lista de specs guardadas
    if (window.SpecsManager && window.SpecsManager.loadSavedSpecsList) {
        setTimeout(() => {
            window.SpecsManager.loadSavedSpecsList();
        }, 1500);
    }
    
    console.log('✅ Verificación completada');
    console.log('🎉 Tegra Spec Manager listo para usar!');
    
    // Mostrar mensaje de bienvenida
    setTimeout(() => {
        showAppStatus('🎉 ¡Bienvenido a Tegra Spec Manager!', 'success');
    }, 2000);
    
}, 3000);

// ========== EXPORTACIÓN PARA COMPATIBILIDAD ==========

// Exportar funciones esenciales al ámbito global para compatibilidad
// Estas serán sobrescritas por los módulos cuando se carguen
window.showTab = function(tabName) {
    if (window.TabsManager && window.TabsManager.showTab) {
        return window.TabsManager.showTab(tabName);
    }
    console.warn('TabsManager no disponible');
    return false;
};

window.updateClientLogo = function() {
    if (window.ClientManager && window.ClientManager.updateClientLogo) {
        return window.ClientManager.updateClientLogo();
    }
    console.warn('ClientManager no disponible');
    return false;
};

window.saveCurrentSpec = function() {
    if (window.SpecsManager && window.SpecsManager.saveCurrentSpec) {
        return window.SpecsManager.saveCurrentSpec();
    }
    console.warn('SpecsManager no disponible');
    return false;
};

window.exportPDF = function() {
    if (window.PDFExporter && window.PDFExporter.exportPDF) {
        return window.PDFExporter.exportPDF();
    }
    console.warn('PDFExporter no disponible');
    return false;
};

window.exportToExcel = function() {
    if (window.ExcelExporter && window.ExcelExporter.exportToExcel) {
        return window.ExcelExporter.exportToExcel();
    }
    console.warn('ExcelExporter no disponible');
    return false;
};

window.downloadProjectZip = function() {
    if (window.ZipExporter && window.ZipExporter.downloadProjectZip) {
        return window.ZipExporter.downloadProjectZip();
    }
    console.warn('ZipExporter no disponible');
    return false;
};

console.log('🎯 Main.js completamente cargado y listo');
