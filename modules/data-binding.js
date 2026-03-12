// =====================================================
// data-binding.js - Binding bidireccional entre inputs y Store
// Versión: 2.1 - CORREGIDO: Usar getCleanState() y state
// =====================================================

(function() {
    'use strict';

    // Mapeo de IDs de inputs a propiedades en generalData
    const INPUT_MAP = {
        'customer': 'customer',
        'style': 'style',
        'folder-num': 'folder',
        'colorway': 'colorway',
        'season': 'season',
        'pattern': 'pattern',
        'po': 'po',
        'sample-type': 'sampleType',
        'name-team': 'nameTeam',
        'gender': 'gender',
        'designer': 'designer',
        'base-size': 'baseSize',
        'fabric': 'fabric',
        'technician-name': 'technicianName',
        'technical-comments': 'technicalComments'
    };

    let boundInputs = new Set();
    let isUpdating = false;

    // =============================================
    // ACTUALIZAR INPUTS DESDE STORE
    // =============================================
    function updateInputsFromStore() {
        if (isUpdating || !window.Store) return;
        
        isUpdating = true;
        
        try {
            // ✅ Usar getCleanState() para obtener estado limpio
            const cleanState = window.Store.getCleanState();
            const generalData = cleanState.generalData || {};
            
            // Actualizar cada input
            Object.entries(INPUT_MAP).forEach(([inputId, propName]) => {
                const input = document.getElementById(inputId);
                if (input) {
                    const value = generalData[propName] || '';
                    if (input.value !== value) {
                        input.value = value;
                    }
                }
            });
            
            // Actualizar logo si cambió customer
            if (typeof window.updateClientLogo === 'function') {
                window.updateClientLogo();
            }
            
        } catch (e) {
            console.error('Error updating inputs from store:', e);
        } finally {
            isUpdating = false;
        }
    }

    // =============================================
    // ACTUALIZAR STORE DESDE INPUT
    // =============================================
    function handleInputChange(event) {
        if (isUpdating || !window.Store) return;
        
        const input = event.target;
        const inputId = input.id;
        const propName = INPUT_MAP[inputId];
        
        if (!propName) return;
        
        isUpdating = true;
        
        try {
            // Actualizar store
            window.Store.state.generalData[propName] = input.value;
            
        } catch (e) {
            console.error(`Error updating store from input ${inputId}:`, e);
        } finally {
            isUpdating = false;
        }
    }

    // =============================================
    // BINDING DE INPUTS
    // =============================================
    function bindInputs() {
        if (!window.Store) {
            console.warn('Store no disponible para binding');
            return;
        }
        
        // Bindear cada input
        Object.keys(INPUT_MAP).forEach(inputId => {
            if (boundInputs.has(inputId)) return;
            
            const input = document.getElementById(inputId);
            if (input) {
                // Quitar listeners previos (por si acaso)
                input.removeEventListener('input', handleInputChange);
                input.removeEventListener('change', handleInputChange);
                
                // Añadir nuevos listeners
                input.addEventListener('input', handleInputChange);
                input.addEventListener('change', handleInputChange);
                
                boundInputs.add(inputId);
            }
        });
        
        // Actualizar inputs con valores iniciales
        updateInputsFromStore();
    }

    // =============================================
    // INICIALIZACIÓN
    // =============================================
    function initBindings() {
        if (!window.Store) {
            console.error('❌ Store no disponible para binding');
            return;
        }
        
        console.log('🔄 Inicializando data binding...');
        
        // Bindear inputs existentes
        bindInputs();
        
        // Suscribirse a cambios del store
        window.Store.subscribe((cleanState) => {
            // Solo actualizar si no estamos en medio de una actualización
            if (!isUpdating) {
                updateInputsFromStore();
            }
        });
        
        // Observar nuevos inputs que puedan aparecer (para placements)
        const observer = new MutationObserver(() => {
            bindInputs();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ Data binding inicializado');
    }

    // =============================================
    // API PÚBLICA
    // =============================================
    window.initBindings = initBindings;
    window.updateInputsFromStore = updateInputsFromStore;

})();
