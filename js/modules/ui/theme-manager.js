// js/modules/ui/theme-manager.js
// MÓDULO PARA GESTIÓN DE TEMA CLARO/OSCURO

const ThemeManager = (function() {
    console.log('🎨 Módulo ThemeManager cargando...');
    
    // ========== VARIABLES PRIVADAS ==========
    let isDarkMode = true;
    const THEME_KEY = 'tegraspec-theme';
    
    // ========== FUNCIONES PRIVADAS ==========
    
    function updateThemeButton() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        if (isDarkMode) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
            themeToggle.title = 'Cambiar a modo claro';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
            themeToggle.title = 'Cambiar a modo oscuro';
        }
    }
    
    function applyThemeToUI() {
        const body = document.body;
        
        if (isDarkMode) {
            body.classList.remove('light-mode');
            console.log('🌙 Tema oscuro aplicado');
        } else {
            body.classList.add('light-mode');
            console.log('☀️ Tema claro aplicado');
        }
        
        // Actualizar botón
        updateThemeButton();
        
        // Mostrar notificación
        showThemeNotification();
    }
    
    function showThemeNotification() {
        const message = isDarkMode ? 'Modo oscuro activado' : 'Modo claro activado';
        const icon = isDarkMode ? '🌙' : '☀️';
        
        // Intentar usar AppManager si existe
        if (window.AppManager && typeof window.AppManager.showStatus === 'function') {
            window.AppManager.showStatus(`${icon} ${message}`, 'success');
        }
        // Fallback a función global
        else if (typeof showStatus === 'function') {
            showStatus(`${icon} ${message}`);
        }
        // Último recurso
        else {
            console.log(`${icon} ${message}`);
        }
    }
    
    function saveThemePreference() {
        try {
            localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
            console.log('💾 Preferencia de tema guardada');
        } catch (error) {
            console.error('❌ Error al guardar tema:', error);
        }
    }
    
    // ========== FUNCIONES PÚBLICAS ==========
    
    function initialize() {
        console.log('⚙️ Inicializando ThemeManager...');
        
        // 1. Cargar preferencia guardada
        loadSavedTheme();
        
        // 2. Aplicar tema inicial
        applyThemeToUI();
        
        // 3. Configurar el botón (ya se hizo en main.js)
        
        publicAPI._initialized = true;
        console.log('✅ ThemeManager inicializado');
        return true;
    }
    
    function loadSavedTheme() {
        try {
            const savedTheme = localStorage.getItem(THEME_KEY);
            
            if (savedTheme === 'light') {
                isDarkMode = false;
                console.log('📖 Tema claro cargado de localStorage');
            } else if (savedTheme === 'dark') {
                isDarkMode = true;
                console.log('📖 Tema oscuro cargado de localStorage');
            } else {
                // Por defecto: oscuro
                isDarkMode = true;
                console.log('📖 Usando tema oscuro por defecto');
            }
        } catch (error) {
            console.warn('⚠️ No se pudo cargar tema guardado, usando por defecto');
            isDarkMode = true;
        }
    }
    
        
        // Para compatibilidad
        toggle: toggleTheme, // alias
        
        // Información del módulo
        _info: {
            name: 'ThemeManager',
            version: '1.0.0',
            author: 'Tegra Spec Manager'
        }
    };
    
    // Hacer disponible globalmente
    if (typeof window !== 'undefined') {
        window.ThemeManager = publicAPI;
        console.log('✅ ThemeManager disponible como window.ThemeManager');
    }
    
    return publicAPI;
})();

// Auto-inicialización cuando se carga el módulo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (ThemeManager && typeof ThemeManager.initialize === 'function') {
            setTimeout(() => ThemeManager.initialize(), 100);
            setTimeout(() => {
                if (!ThemeManager._initialized) {
                    ThemeManager.initialize();
                }
            }, 100);
        }
    });
} else {
    // DOM ya cargado
    if (ThemeManager && typeof ThemeManager.initialize === 'function') {
        setTimeout(() => ThemeManager.initialize(), 100);
        setTimeout(() => {
            if (!ThemeManager._initialized) {
                ThemeManager.initialize();
            }
        }, 100);
    }
}

console.log('🎨 Módulo ThemeManager cargado correctamente');
