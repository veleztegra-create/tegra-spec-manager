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
            // Usar función global si existe (compatibilidad)
            if (typeof window.updateDashboard === 'function') {
                return window.updateDashboard();
            }
            
            // Implementación propia
            updateDashboardStats();
            return true;
            
        } catch (error) {
            console.error('❌ Error en updateDashboard:', error);
            return false;
        }
    }
    
    function updateDashboardStats() {
        try {
            const specs = Object.keys(localStorage).filter(k => k.startsWith('spec_'));
            const total = specs.length;
            
            // Actualizar total de specs
            const totalEl = document.getElementById('total-specs');
            if (totalEl) totalEl.textContent = total;
            
            // Buscar última spec
            let lastSpec = null;
            let lastSpecDate = null;
            
            specs.forEach(key => {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    const specDate = new Date(data.savedAt || 0);
                    
                    if (!lastSpecDate || specDate > lastSpecDate) {
                        lastSpecDate = specDate;
                        lastSpec = data;
                    }
                } catch(e) {
                    console.warn('Error al parsear spec:', key, e);
                }
            });
            
            // Actualizar última spec
            const todayEl = document.getElementById('today-specs');
            if (todayEl) {
                if (lastSpec) {
                    todayEl.innerHTML = `
                        <div style="font-size:0.9rem; color:var(--text-secondary);">Última Spec:</div>
                        <div style="font-size:1.2rem; font-weight:bold; color:var(--primary);">${lastSpec.style || 'Sin nombre'}</div>
                        <div style="font-size:0.8rem; color:var(--text-secondary);">${lastSpecDate.toLocaleDateString('es-ES')}</div>
                    `;
                } else {
                    todayEl.innerHTML = `
                        <div style="font-size:0.9rem; color:var(--text-secondary);">Sin specs creadas</div>
                    `;
                }
            }
            
            // Contar proyectos activos
            let activeCount = 0;
            specs.forEach(key => {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data.placements && data.placements.length > 0) {
                        activeCount++;
                    }
                } catch(e) {
                    // Ignorar errores
                }
            });
            
            const activeEl = document.getElementById('active-projects');
            if (activeEl) activeEl.textContent = activeCount;
            
            // Contar placements totales
            const totalPlacements = specs.reduce((sum, key) => {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    return sum + (data.placements?.length || 0);
                } catch(e) {
                    return sum;
                }
            }, 0);
            
            const placementsEl = document.getElementById('completion-rate');
            if (placementsEl) {
                placementsEl.innerHTML = `
                    <div style="font-size:0.9rem; color:var(--text-secondary);">Placements totales:</div>
                    <div style="font-size:1.5rem; font-weight:bold; color:var(--primary);">${totalPlacements}</div>
                `;
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
        
        specs.forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (data.placements && data.placements.length > 0) {
                    activeCount++;
                    totalPlacements += data.placements.length;
                }
            } catch(e) {
                // Ignorar errores
            }
        });
        
        return {
            totalSpecs: total,
            activeProjects: activeCount,
            totalPlacements: totalPlacements,
            lastUpdate: new Date().toISOString()
        };
    }
    
    // ========== EXPORTAR MÓDULO ==========
    
    const publicAPI = {
        // Métodos principales
        initialize,
        updateDateTime,
        updateDashboard,
        refreshNow,
        
        // Control de auto-update
        startAutoUpdate,
        stopAutoUpdate,
        
        // Información
        getStats,
        
        // Para compatibilidad
        update: updateDashboard, // alias
        
        // Información del módulo
        _info: {
            name: 'DashboardManager',
            version: '1.0.0'
        },
        _initialized: false
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
