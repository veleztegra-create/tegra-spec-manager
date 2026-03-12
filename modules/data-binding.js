// =====================================================
// data-binding.js - Binding bidireccional entre inputs y Store
// Versión: 2.2 - CORREGIDO: Usar getCleanState() en lugar de getState()
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
    let unsubscribe = null;

    // =============================================
    // ACTUALIZAR INPUTS DESDE STORE
    // =============================================
    function updateInputsFromStore() {
        if (isUpdating || !window.Store) return;
        
        isUpdating = true;
        
        try {
            // ✅ CORREGIDO: Usar getCleanState() en lugar de getState()
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
            // Actualizar store (usando el estado reactivo)
            if (window.Store.state && window.Store.state.generalData) {
                window.Store.state.generalData[propName] = input.value;
            } else {
                console.warn('Store.state.generalData no disponible');
            }
            
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
                console.log(`🔗 Input ${inputId} bindeado`);
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
        
        // Verificar que la API del Store sea la esperada
        console.log('📊 Store API disponible:', {
            hasGetCleanState: typeof window.Store.getCleanState === 'function',
            hasState: !!window.Store.state,
            hasSubscribe: typeof window.Store.subscribe === 'function'
        });
        
        // Bindear inputs existentes
        bindInputs();
        
        // Si ya había una suscripción previa, cancelarla
        if (unsubscribe && typeof unsubscribe === 'function') {
            unsubscribe();
        }
        
        // Suscribirse a cambios del store
        unsubscribe = window.Store.subscribe((cleanState) => {
            // Solo actualizar si no estamos en medio de una actualización
            if (!isUpdating) {
                updateInputsFromStore();
            }
        });
        
        // Observar nuevos inputs que puedan aparecer (para elementos dinámicos)
        const observer = new MutationObserver((mutations) => {
            // Solo verificar si se añadieron nuevos nodos
            const shouldRebind = mutations.some(m => 
                m.type === 'childList' && m.addedNodes.length > 0
            );
            
            if (shouldRebind) {
                bindInputs();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ Data binding inicializado correctamente');
    }

    // =============================================
    // LIMPIEZA
    // =============================================
    function destroyBindings() {
        if (unsubscribe && typeof unsubscribe === 'function') {
            unsubscribe();
            unsubscribe = null;
        }
        
        boundInputs.clear();
        console.log('🧹 Data bindings limpiados');
    }

    // =============================================
    // API PÚBLICA
    // =============================================
    window.initBindings = initBindings;
    window.updateInputsFromStore = updateInputsFromStore;
    window.destroyBindings = destroyBindings;

    // Auto-inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // No inicializar automáticamente, esperar a que app.js lo llame
            console.log('📋 data-binding.js cargado, esperando initBindings()');
        });
    } else {
        console.log('📋 data-binding.js cargado, esperando initBindings()');
    }

})();
