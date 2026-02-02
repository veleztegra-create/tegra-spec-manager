// js/main.js - CARGA DINÁMICA DE TODOS LOS MÓDULOS
console.log('🚀 Tegra Spec Manager - Sistema de carga dinámica');

// ========== CONFIGURACIÓN DE MÓDULOS (ORDEN CRÍTICO) ==========
const MODULES = [
    // 1. CONFIGURACIONES (Primero)
    { path: 'js/config/config.js', name: 'Config', critical: true },
    { path: 'js/config/config-teams.js', name: 'TeamsConfig', critical: true },
    { path: 'js/config/config-logos.js', name: 'LogoConfig', critical: false },
    { path: 'js/config/color-databases.js', name: 'ColorDatabases', critical: true },
    
    // 2. UTILIDADES (Después de config)
    { path: 'utils/helpers.js', name: 'Utils', critical: true },
    { path: 'utils/validators.js', name: 'Validators', critical: false },
    { path: 'utils/detectors.js', name: 'Detectors', critical: true },
    { path: 'utils/specialties-detector.js', name: 'SpecialtiesDetector', critical: false },
    { path: 'utils/render-helpers.js', name: 'RenderHelpers', critical: false },
    
    // 3. CORE
    { path: 'core/state-manager.js', name: 'StateManager', critical: false },
    { path: 'core/error-handler.js', name: 'ErrorHandler', critical: false },
    
    // 4. MÓDULOS DE DATOS
    { path: 'js/modules/data/client-manager.js', name: 'ClientManager', critical: true },
    { path: 'js/modules/data/specs-manager.js', name: 'SpecsManager', critical: true },
    { path: 'js/modules/data/storage-manager.js', name: 'StorageManager', critical: true },
    
    // 5. MÓDULOS UI
    { path: 'js/modules/ui/theme-manager.js', name: 'ThemeManager', critical: false },
    { path: 'js/modules/ui/dashboard-manager.js', name: 'DashboardManager', critical: true },
    { path: 'js/modules/ui/tabs-manager.js', name: 'TabsManager', critical: true },
    
    // 6. MÓDULOS PLACEMENTS (ORDEN ESPECÍFICO)
    { path: 'js/modules/placements/placements-core.js', name: 'PlacementsCore', critical: true },
    { path: 'js/modules/placements/placements-ui.js', name: 'PlacementsUI', critical: true },
    { path: 'js/modules/placements/placements-colors.js', name: 'PlacementsColors', critical: true },
    { path: 'js/modules/placements/placements-export.js', name: 'PlacementsExport', critical: false },
    
    // 7. MÓDULOS DE EXPORTACIÓN
    { path: 'js/modules/export/pdf-exporter.js', name: 'PDFExporter', critical: false },
    { path: 'js/modules/export/excel-exporter.js', name: 'ExcelExporter', critical: false },
    { path: 'js/modules/export/zip-exporter.js', name: 'ZipExporter', critical: false }
];

// ========== SISTEMA DE CARGA ==========
class ModuleLoader {
    constructor() {
        this.loadedModules = new Map();
        this.errors = [];
        this.isLoading = false;
    }
    
    async loadAllModules() {
        if (this.isLoading) return;
        this.isLoading = true;
        
        console.log(`📦 Cargando ${MODULES.length} módulos...`);
        
        for (const module of MODULES) {
            await this.loadModule(module);
        }
        
        console.log('✅ Todos los módulos cargados');
        console.log(`📊 Estadísticas: ${this.loadedModules.size} ok, ${this.errors.length} errores`);
        
        if (this.errors.length > 0) {
            console.error('❌ Errores:', this.errors);
        }
        
        return this.loadedModules;
    }
    
    async loadModule(module) {
        // Si ya está cargado, saltar
        if (this.loadedModules.has(module.name) || window[module.name]) {
            console.log(`⏭️  ${module.name} ya cargado, omitiendo`);
            return true;
        }
        
        try {
            console.log(`📥 Cargando: ${module.name}...`);
            
            // Cargar script dinámicamente
            await this.loadScript(module.path);
            
            // Verificar que se exportó
            await this.verifyModuleExport(module);
            
            this.loadedModules.set(module.name, {
                path: module.path,
                timestamp: Date.now(),
                status: 'loaded'
            });
            
            console.log(`✅ ${module.name} cargado correctamente`);
            return true;
            
        } catch (error) {
            console.error(`❌ Error cargando ${module.name}:`, error.message);
            
            this.errors.push({
                module: module.name,
                path: module.path,
                error: error.message,
                timestamp: Date.now()
            });
            
            // Si es crítico, crear fallback
            if (module.critical) {
                await this.createCriticalFallback(module);
            }
            
            return false;
        }
    }
    
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = false; // IMPORTANTE: mantener orden
            
            script.onload = () => {
                // Pequeño delay para asegurar ejecución
                setTimeout(resolve, 50);
            };
            
            script.onerror = () => {
                reject(new Error(`No se pudo cargar: ${src}`));
            };
            
            document.head.appendChild(script);
        });
    }
    
    async verifyModuleExport(module) {
        // Esperar un poco y verificar que el módulo se exportó
        return new Promise((resolve, reject) => {
            const maxAttempts = 10;
            let attempts = 0;
            
            const check = () => {
                attempts++;
                
                if (window[module.name]) {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error(`Módulo no exportó "${module.name}" a window`));
                } else {
                    setTimeout(check, 50);
                }
            };
            
            check();
        });
    }
    
    async createCriticalFallback(module) {
        console.log(`🆘 Creando fallback para ${module.name}...`);
        
        // Fallbacks básicos para módulos críticos
        const fallbacks = {
            'Detectors': `
                window.Detectors = {
                    detectTeamFromStyle: (s) => s ? s.toUpperCase().includes('DODGERS') ? 'DODGERS' : '' : '',
                    extractGenderFromStyle: (s) => s ? (s.toUpperCase().includes('MENS') ? 'M' : 
                                                      s.toUpperCase().includes('WOMENS') ? 'F' : '') : ''
                };
            `,
            'PlacementsCore': `
                window.PlacementsCore = {
                    initializePlacements: () => { console.log('Placements (fallback)'); return 1; },
                    getAllPlacements: () => window.globalPlacements || [],
                    getPlacementById: (id) => (window.globalPlacements || []).find(p => p.id === id)
                };
            `,
            'PlacementsUI': `
                window.PlacementsUI = {
                    initializePlacementsUI: () => { 
                        if (!window.globalPlacements) window.globalPlacements = [];
                        return true; 
                    }
                };
            `
        };
        
        if (fallbacks[module.name]) {
            const script = document.createElement('script');
            script.textContent = fallbacks[module.name];
            document.head.appendChild(script);
            
            this.loadedModules.set(module.name, {
                path: 'fallback',
                timestamp: Date.now(),
                status: 'fallback'
            });
            
            console.log(`✅ Fallback creado para ${module.name}`);
        }
    }
    
    getModuleStatus() {
        return {
            total: MODULES.length,
            loaded: this.loadedModules.size,
            errors: this.errors.length,
            modules: Array.from(this.loadedModules.entries()).map(([name, data]) => ({
                name,
                path: data.path,
                status: data.status
            }))
        };
    }
}

// ========== INICIALIZACIÓN DE LA APLICACIÓN ==========
async function initializeApplication() {
    console.log('🚀 Inicializando Tegra Spec Manager...');
    
    try {
        // 1. Crear y configurar loader
        const loader = new ModuleLoader();
        window.AppLoader = loader; // Para debugging
        
        // 2. Cargar todos los módulos
        await loader.loadAllModules();
        
        // 3. Verificar módulos críticos
        const criticalModules = MODULES.filter(m => m.critical).map(m => m.name);
        const missingCritical = criticalModules.filter(name => !loader.loadedModules.has(name));
        
        if (missingCritical.length > 0) {
            throw new Error(`Módulos críticos faltantes: ${missingCritical.join(', ')}`);
        }
        
        // 4. Inicializar módulos en orden
        await initializeModulesInOrder();
        
        // 5. Configurar UI
        setupApplicationUI();
        
        console.log('🎉 Tegra Spec Manager inicializado exitosamente!');
        showStatus('✅ Aplicación lista', 'success');
        
    } catch (error) {
        console.error('❌ Error fatal:', error);
        showStatus(`Error: ${error.message}`, 'error');
        emergencyMode();
    }
}

// ========== FUNCIONES AUXILIARES ==========

async function initializeModulesInOrder() {
    const initSequence = [
        { check: () => window.PlacementsCore, init: 'initializePlacements' },
        { check: () => window.PlacementsUI, init: 'initializePlacementsUI' },
        { check: () => window.TabsManager, init: 'init' },
        { check: () => window.ThemeManager, init: 'init' },
        { check: () => window.ClientManager, init: 'init' },
        { check: () => window.SpecsManager, init: 'init' },
        { check: () => window.StorageManager, init: 'init' },
        { check: () => window.DashboardManager, init: 'init' }
    ];
    
    for (const module of initSequence) {
        if (module.check() && module.check()[module.init]) {
            try {
                console.log(`⚙️  Inicializando ${module.check().constructor.name}...`);
                module.check()[module.init]();
            } catch (err) {
                console.error(`❌ Error inicializando módulo:`, err);
            }
        }
    }
}

function setupApplicationUI() {
    // Mostrar dashboard inicial
    if (window.TabsManager && window.TabsManager.showTab) {
        window.TabsManager.showTab('dashboard');
    }
    
    // Configurar auto-detección en input de estilo
    const styleInput = document.getElementById('style');
    if (styleInput && window.Detectors && window.Utils) {
        styleInput.addEventListener('input', window.Utils.debounce(function() {
            window.Detectors.autoDetectFromStyleInput(this);
        }, 500));
    }
    
    // Configurar auto-guardado
    if (window.SpecsManager && window.SpecsManager.autoSave) {
        setInterval(() => {
            window.SpecsManager.autoSave();
        }, 120000); // 2 minutos
    }
    
    // Actualizar dashboard cada minuto
    if (window.DashboardManager && window.DashboardManager.updateDateTime) {
        window.DashboardManager.updateDateTime();
        setInterval(() => window.DashboardManager.updateDateTime(), 60000);
    }
}

function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('statusMessage');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `status-message status-${type}`;
        statusEl.style.display = 'block';
        
        setTimeout(() => {
            if (statusEl.textContent === message) {
                statusEl.style.display = 'none';
            }
        }, 4000);
    }
}

function emergencyMode() {
    console.log('🆘 Activando modo de emergencia...');
    
    // Cargar HTML básico si no hay UI
    if (!document.getElementById('dashboard')) {
        document.body.innerHTML = `
            <div style="padding: 20px; font-family: Arial;">
                <h1>⚠️ Tegra Spec Manager - Modo Emergencia</h1>
                <p>La aplicación encontró un error crítico.</p>
                <button onclick="location.reload()">Reintentar</button>
            </div>
        `;
    }
}

// ========== INICIAR APLICACIÓN ==========
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    initializeApplication();
}
