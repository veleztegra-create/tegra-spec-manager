// js/main.js - PUNTO DE ENTRADA PRINCIPAL DE LA APLICACIÓN

// ========== VARIABLES GLOBALES ==========
let placements = [];
let currentPlacementId = 1;
let clientLogoCache = {};
let isDarkMode = true;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando Tegra Spec Manager...');
    
    // 1. Verificar configuraciones críticas
    verifyConfigurations();
    
    // 2. Inicializar estado global
    initGlobalState();
    
    // 3. Configurar tema
    loadThemePreference();
    
    // 4. Actualizar UI inicial
    updateDateTime();
    setInterval(updateDateTime, 60000);
    
    // 5. Inicializar componentes
    initComponents();
    
    // 6. Configurar event listeners
    setupEventListeners();
    
    // 7. Cargar estado guardado
    loadSavedState();
    
    console.log('✅ Aplicación inicializada correctamente');
    
    // 8. Mostrar dashboard inicial
    showTab('dashboard');
});

// ========== FUNCIONES DE INICIALIZACIÓN ==========
function verifyConfigurations() {
    // Verificar LogoConfig
    if (!window.LogoConfig) {
        console.error('❌ LogoConfig no cargado');
        // Configuración de emergencia
        window.LogoConfig = {
            'NIKE': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Nike-Logotipo-PNG-Photo.png',
            'FANATICS': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Fanatics_company_logo.svg.png',
            'ADIDAS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1280px-Adidas_Logo.svg.png',
            'PUMA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Puma_Logo.svg/1280px-Puma_Logo.svg.png',
            'UNDER ARMOUR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Under_armour_logo.svg/1280px-Under_armour_logo.svg.png',
            'GEAR FOR SPORT': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png'
        };
    }
    
    // Verificar TeamsConfig
    if (!window.TeamsConfig) {
        console.warn('⚠️ TeamsConfig no cargado - algunas funciones estarán limitadas');
    }
    
    // Verificar Config
    if (!window.Config) {
        console.error('❌ Config no cargado');
        // Configuración mínima de emergencia
        window.Config = {
            APP: { VERSION: '1.0.0' },
            COLOR_DATABASES: { PANTONE: {}, GEARFORSPORT: {} },
            INK_PRESETS: {
                WATER: { temp: '320 °F', time: '1:40 min' },
                PLASTISOL: { temp: '320 °F', time: '1:00 min' },
                SILICONE: { temp: '300 °F', time: '2:00 min' }
            }
        };
    }
}

function initGlobalState() {
    window.placements = [];
    window.currentPlacementId = 1;
    window.clientLogoCache = {};
    window.isDarkMode = localStorage.getItem('tegraspec-theme') !== 'light';
}

function initComponents() {
    // Inicializar dashboard
    updateDashboard();
    
    // Inicializar lista de specs
    loadSavedSpecsList();
    
    // Inicializar log de errores
    if (window.errorHandler) {
        window.errorHandler.init();
    }
    
    // Setup para pegar imágenes
    setupPasteHandler();
}

function setupEventListeners() {
    // Toggle de tema
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Input de cliente para logo automático
    const customerInput = document.getElementById('customer');
    if (customerInput) {
        customerInput.addEventListener('input', updateClientLogo);
    }
    
    // File inputs
    const excelFileInput = document.getElementById('excelFile');
    if (excelFileInput) {
        excelFileInput.addEventListener('change', handleFileUpload);
    }
    
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
    }
    
    const placementImageInput = document.getElementById('placementImageInput');
    if (placementImageInput) {
        placementImageInput.addEventListener('change', handlePlacementImageUpload);
    }
}

function loadSavedState() {
    // Cargar última spec trabajada si existe
    const lastSpecKey = localStorage.getItem('tegraspec_last_spec');
    if (lastSpecKey) {
        try {
            const specData = JSON.parse(localStorage.getItem(lastSpecKey));
            if (specData) {
                // Cargar spec automáticamente
                setTimeout(() => {
                    loadSpecData(specData);
                    showStatus('📂 Última spec cargada automáticamente', 'info');
                }, 1000);
            }
        } catch (e) {
            console.warn('Error al cargar última spec:', e);
        }
    }
}

// ========== FUNCIONES BÁSICAS DE LA APP ==========
// Estas funciones deben moverse a sus respectivos módulos, pero por ahora
// las mantenemos aquí para que la app funcione

// Función para mostrar/ocultar tabs
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    
    const tabElement = document.getElementById(tabName);
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    // Activar la pestaña correspondiente en la navegación
    document.querySelectorAll('.nav-tab').forEach(tab => {
        if (tab.innerText.toLowerCase().includes(tabName.replace('-', ' '))) {
            tab.classList.add('active');
        }
    });
    
    // Acciones específicas por tab
    switch(tabName) {
        case 'saved-specs':
            loadSavedSpecsList();
            break;
        case 'dashboard':
            updateDashboard();
            break;
        case 'error-log':
            loadErrorLog();
            break;
        case 'spec-creator':
            if (placements.length === 0) {
                initializePlacements();
            }
            break;
    }
}

// Función para actualizar logo del cliente
function updateClientLogo() {
    const customer = document.getElementById('customer').value.toUpperCase().trim();
    const logoElement = document.getElementById('logoCliente');
    
    if (!logoElement) return;
    
    let logoUrl = '';
    
    // Detectar Gear for Sport con todas sus variaciones
    const gfsVariations = ['GEAR FOR SPORT', 'GEARFORSPORT', 'GFS', 'G.F.S.', 'G.F.S', 'GEAR', 'G-F-S'];
    const isGFS = gfsVariations.some(variation => customer.includes(variation));
    
    if (customer.includes('NIKE') || customer.includes('NIQUE')) {
        logoUrl = 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Nike-Logotipo-PNG-Photo.png';
    } else if (customer.includes('FANATICS') || customer.includes('FANATIC')) {
        logoUrl = 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Fanatics_company_logo.svg.png';
    } else if (customer.includes('ADIDAS')) {
        logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1280px-Adidas_Logo.svg.png';
    } else if (customer.includes('PUMA')) {
        logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Puma_Logo.svg/1280px-Puma_Logo.svg.png';
    } else if (customer.includes('UNDER ARMOUR') || customer.includes('UA')) {
        logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Under_armour_logo.svg/1280px-Under_armour_logo.svg.png';
    } else if (isGFS) {
        logoUrl = 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png';
    }
    
    if (logoUrl) {
        logoElement.src = logoUrl;
        logoElement.style.display = 'block';
        clientLogoCache[customer] = logoUrl;
    } else {
        logoElement.style.display = 'none';
    }
}

// ========== EXPORTAR FUNCIONES AL ÁMBITO GLOBAL ==========
// Esto es necesario mientras migramos la arquitectura
window.app = {
    // Navegación
    showTab,
    
    // Placements
    addNewPlacement,
    removePlacement,
    duplicatePlacement,
    showPlacement,
    updatePlacementType,
    updatePlacementInkType,
    updateCustomPlacement,
    
    // Imágenes
    openImagePickerForPlacement,
    removePlacementImage,
    
    // Colores
    addPlacementColorItem,
    removePlacementColorItem,
    updatePlacementColorValue,
    updatePlacementScreenLetter,
    
    // Parámetros
    updatePlacementParam,
    updateAllPlacementTitles,
    
    // Guardado/Carga
    saveCurrentSpec,
    clearForm,
    loadSavedSpecsList,
    clearAllSpecs,
    
    // Exportación
    exportToExcel,
    exportPDF,
    downloadProjectZip,
    
    // Errores
    clearErrorLog,
    exportErrorLog,
    
    // UI
    updateClientLogo
};

// También exportar funciones individualmente para compatibilidad
// con el código existente en index.html
window.showTab = showTab;
window.updateClientLogo = updateClientLogo;
window.addNewPlacement = addNewPlacement;
window.saveCurrentSpec = saveCurrentSpec;
window.clearForm = clearForm;
window.exportToExcel = exportToExcel;
window.exportPDF = exportPDF;
window.downloadProjectZip = downloadProjectZip;
window.loadSavedSpecsList = loadSavedSpecsList;
window.clearErrorLog = clearErrorLog;
window.exportErrorLog = exportErrorLog;
window.clearAllSpecs = clearAllSpecs;

// ========== INCLUIR FUNCIONES RESTANTES ==========
// Las funciones restantes del código original deben incluirse aquí
// o en sus respectivos módulos. Por ahora, para que funcione:

// Incluir todas las funciones del código original que no están en main.js
// Esto es TEMPORAL hasta que se migren a módulos
function initializePlacements() {
    // Tu código actual de initializePlacements
}

function addNewPlacement(type = null, isFirst = false) {
    // Tu código actual de addNewPlacement
}

// ... incluir todas las demás funciones ...
// En js/main.js, después de verifyConfigurations()

// ========== CARGAR MÓDULOS ==========
function loadModules() {
    console.log('📦 Cargando módulos...');
    
    // Cargar módulo de placements
    const placementsScript = document.createElement('script');
    placementsScript.src = 'js/modules/placements/core.js';
    placementsScript.onload = function() {
        console.log('✅ Módulo de placements cargado');
        
        // Probar el módulo
        if (window.PlacementsModule) {
            console.log('🧪 Probando módulo de placements...');
            const placementId = window.PlacementsModule.addNewPlacement('FRONT');
            console.log(`✅ Placement creado con ID: ${placementId}`);
        }
    };
    
    document.head.appendChild(placementsScript);
}

// Llamar loadModules en initializeApp()
function initializeApp() {
    console.log('⚙️ Inicializando aplicación...');
    
    // 1. Verificar configuraciones
    verifyConfigurations();
    
    // 2. Cargar módulos
    loadModules();
    
    // 3. Resto del código...
    // ...
}

// ========== ARCHITECTURE MIGRATION HELPER ==========
// Esta función ayuda a migrar gradualmente
function migrateToModules() {
    console.log('🔧 Migrando a arquitectura modular...');
    
    // Aquí irá la lógica para mover funciones a módulos
    // Por ahora, solo registra qué funciones existen
    const functionList = [
        'showTab', 'updateClientLogo', 'addNewPlacement', 'removePlacement',
        'duplicatePlacement', 'saveCurrentSpec', 'exportPDF', 'exportToExcel',
        'downloadProjectZip', 'clearForm', 'loadSavedSpecsList', 'clearErrorLog',
        'exportErrorLog', 'clearAllSpecs', 'initializePlacements'
    ];
    
    console.log(`📋 Total de funciones a migrar: ${functionList.length}`);
    return functionList;
}

// Iniciar migración al cargar
setTimeout(migrateToModules, 5000);
