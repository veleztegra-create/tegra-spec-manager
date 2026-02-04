// js/modules/ui/dashboard-manager.js
// MÓDULO PARA GESTIÓN DEL DASHBOARD

const DashboardManager = (function() {
    console.log('📊 Módulo DashboardManager cargando...');
    
    // ========== VARIABLES PRIVADAS ==========
    let updateInterval = null;
    let dateInterval = null;
    const UPDATE_INTERVAL = 30000; // 30 segundos
    
    // ========== FUNCIONES PRIVADAS ==========
    
    function formatDate(date) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return date.toLocaleDateString('es-ES', options);
    }
    
    function showDashboardNotification(message, type = 'info') {
        if (window.AppManager && typeof window.AppManager.showStatus === 'function') {
            window.AppManager.showStatus(message, type);
        } else if (typeof showStatus === 'function') {
            showStatus(message, type);
        }
    }
    
    // ========== FUNCIONES PÚBLICAS ==========
    
    function initialize() {
        console.log('⚙️ Inicializando DashboardManager...');
        
        // 1. Actualizar fecha/hora inicial
        updateDateTime();
        
        // 2. Iniciar actualización automática
        startAutoUpdate();
        
        // 3. Actualizar estadísticas del dashboard
        updateDashboard();
        
        publicAPI._initialized = true;
        console.log('✅ DashboardManager inicializado');
        return true;
    }
    
    function updateDateTime() {
        try {
            const datetimeEl = document.getElementById('current-datetime');
            if (datetimeEl) {
                const now = new Date();
                datetimeEl.textContent = formatDate(now);
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Error en updateDateTime:', error);
            return false;
        }
    }
    
    function updateDashboard() {
        console.log('📈 Actualizando dashboard...');
        
        try {
            const { total, activeCount, totalPlacements, lastSpec } = getStats();

            const totalSpecsEl = document.getElementById('total-specs');
            if (totalSpecsEl) {
                totalSpecsEl.textContent = total;
            }

            const activeSpecsEl = document.getElementById('active-projects');
            if (activeSpecsEl) {
                activeSpecsEl.textContent = activeCount;
            }
            
            const placementsEl = document.getElementById('completion-rate');
            if (placementsEl) {
                const totalPlacementsEl = placementsEl.querySelector('#total-placements');
                if (totalPlacementsEl) {
                    totalPlacementsEl.textContent = totalPlacements;
                }
            }

            const lastSpecNameEl = document.getElementById('last-spec-name');
            const lastSpecDateEl = document.getElementById('last-spec-date');
            if (lastSpecNameEl && lastSpecDateEl) {
                if (lastSpec) {
                    lastSpecNameEl.textContent = lastSpec.name;
                    lastSpecDateEl.textContent = formatDate(lastSpec.date);
                } else {
                    lastSpecNameEl.textContent = 'Ninguna';
                    lastSpecDateEl.textContent = '-';
                }
            }
            
            console.log(`📊 Dashboard actualizado: ${total} specs, ${activeCount} activas, ${totalPlacements} placements`);
            return true;
            
        } catch (error) {
            console.error('❌ Error en updateDashboardStats:', error);
            return false;
        }
    }
    
    function startAutoUpdate() {
        // Limpiar intervalo anterior si existe
        if (updateInterval) {
            clearInterval(updateInterval);
        }

        if (dateInterval) {
            clearInterval(dateInterval);
        }
        
        // Actualizar fecha cada minuto
        dateInterval = setInterval(updateDateTime, 60000);
        
        // Actualizar dashboard cada 30 segundos
        updateInterval = setInterval(updateDashboard, UPDATE_INTERVAL);
        
        console.log(`🔄 Auto-update iniciado (cada ${UPDATE_INTERVAL/1000} segundos)`);
    }
    
    function stopAutoUpdate() {
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
            console.log('⏹️ Auto-update detenido');
        }
        if (dateInterval) {
            clearInterval(dateInterval);
            dateInterval = null;
        }
    }
    
    function refreshNow() {
        console.log('🔃 Refrescando dashboard manualmente...');
        updateDateTime();
        updateDashboard();
        showDashboardNotification('Dashboard actualizado', 'success');
        return true;
    }
    
    function getStats() {
        const specs = Object.keys(localStorage).filter(k => k.startsWith('spec_'));
        const total = specs.length;
        
        let activeCount = 0;
        let totalPlacements = 0;
        let lastSpec = null;
        
        specs.forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (data.placements && data.placements.length > 0) {
                    activeCount++;
                    totalPlacements += data.placements.length;
                }
                if (data.savedAt) {
                    const savedDate = new Date(data.savedAt);
                    if (!lastSpec || savedDate > lastSpec.date) {
                        lastSpec = {
                            name: data.style || data.styleNumber || data.name || 'Sin estilo',
                            date: savedDate
                        };
                    }
                }
            } catch(e) {
                console.warn('⚠️ Error leyendo spec para estadísticas:', e);
            }
        });

        return { total, activeCount, totalPlacements, lastSpec };
    }
    
    // ========== EXPORTAR MÓDULO ==========
    
    const publicAPI = {
        // Métodos principales
        initialize,
        updateDateTime,
        updateDashboard,
        startAutoUpdate,
        stopAutoUpdate,
        refreshNow,
        getStats,
        
        // Para compatibilidad
        update: updateDashboard, // alias
        
        // Información del módulo
        _info: {
            name: 'DashboardManager',
            version: '1.0.0'
        }
    };
    
    // Hacer disponible globalmente
    if (typeof window !== 'undefined') {
        window.DashboardManager = publicAPI;
        console.log('✅ DashboardManager disponible como window.DashboardManager');
    }
    
    return publicAPI;
})();

// Auto-inicialización
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (DashboardManager && typeof DashboardManager.initialize === 'function') {
            setTimeout(() => DashboardManager.initialize(), 500);
            setTimeout(() => {
                if (!DashboardManager._initialized) {
                    DashboardManager.initialize();
                }
            }, 500);
        }
    });
} else {
    if (DashboardManager && typeof DashboardManager.initialize === 'function') {
        setTimeout(() => DashboardManager.initialize(), 500);
        setTimeout(() => {
            if (!DashboardManager._initialized) {
                DashboardManager.initialize();
            }
        }, 500);
    }
}

console.log('📊 Módulo DashboardManager cargado correctamente');
