// =====================================================
// autosave.js - Autoguardado en localStorage
// Versión: 2.1 - CORREGIDO: Usar getCleanState()
// =====================================================

(function() {
    'use strict';
    
    const AUTOSAVE_KEY = 'spec-autosave';
    let autosaveTimeout = null;
    let isEnabled = false;
    
    function saveToLocalStorage() {
        if (!isEnabled || !window.Store) return;
        
        try {
            // ✅ USAR getCleanState() EN VEZ DE Store.state
            const cleanState = window.Store.getCleanState();
            
            // Crear objeto para guardar
            const saveData = {
                timestamp: Date.now(),
                state: cleanState
            };
            
            localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(saveData));
            console.log('[Autosave] State successfully saved locally.');
        } catch (e) {
            console.error('[Autosave] Error saving to localStorage:', e);
        }
    }
    
    function scheduleAutosave() {
        if (autosaveTimeout) {
            clearTimeout(autosaveTimeout);
        }
        autosaveTimeout = setTimeout(() => {
            saveToLocalStorage();
            autosaveTimeout = null;
        }, 2000); // 2 segundos después del último cambio
    }
    
    function enableAutosave() {
        if (isEnabled) return;
        
        isEnabled = true;
        
        // Suscribirse a cambios del Store
        if (window.Store) {
            window.Store.subscribe(() => {
                scheduleAutosave();
            });
        }
        
        console.log('✅ Autosave enabled');
    }
    
    function disableAutosave() {
        isEnabled = false;
        if (autosaveTimeout) {
            clearTimeout(autosaveTimeout);
            autosaveTimeout = null;
        }
        console.log('⏸️ Autosave disabled');
    }
    
    // Cargar autosave guardado
    function loadAutosave() {
        try {
            const saved = localStorage.getItem(AUTOSAVE_KEY);
            if (!saved) return null;
            
            const parsed = JSON.parse(saved);
            return parsed.state || null;
        } catch (e) {
            console.error('[Autosave] Error loading autosave:', e);
            return null;
        }
    }
    
    // API pública
    window.enableAutosave = enableAutosave;
    window.disableAutosave = disableAutosave;
    window.loadAutosave = loadAutosave;
    
})();
