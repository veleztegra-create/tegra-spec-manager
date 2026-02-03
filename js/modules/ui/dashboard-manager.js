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
@@ -151,66 +153,74 @@ const DashboardManager = (function() {
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
        setInterval(updateDateTime, 60000);
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
@@ -243,35 +253,43 @@ const DashboardManager = (function() {
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

