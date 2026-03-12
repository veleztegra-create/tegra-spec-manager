// =====================================================
// store.js - Reactive Store con soporte para historial
// Versión: 3.1 - CORREGIDO: Problema de Proxy al guardar
// =====================================================

const Store = (function() {
    'use strict';

    // Estado interno (privado)
    let state = {
        generalData: {
            customer: '',
            style: '',
            folder: '',
            colorway: '',
            season: '',
            pattern: '',
            po: '',
            sampleType: '',
            nameTeam: '',
            gender: '',
            designer: '',
            baseSize: '',
            fabric: '',
            technicianName: '',
            technicalComments: ''
        },
        placements: []
    };

    // Historial para undo/redo
    const history = {
        past: [],
        future: []
    };

    // Límite de historial
    const MAX_HISTORY = 50;

    // Suscriptores a cambios
    const subscribers = [];

    // =============================================
    // FUNCIÓN AUXILIAR: Deep clone SIN Proxies
    // =============================================
    function deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (Array.isArray(obj)) {
            return obj.map(item => deepClone(item));
        }
        // Objeto plano
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = deepClone(obj[key]);
        });
        return cloned;
    }

    // =============================================
    // FUNCIÓN PARA OBTENER ESTADO LIMPIO (sin Proxy)
    // =============================================
    function getCleanState() {
        return deepClone(state);
    }

    // =============================================
    // NOTIFICAR A SUSCRIPTORES
    // =============================================
    function notify() {
        // Pasamos una copia limpia del estado a los suscriptores
        const cleanState = getCleanState();
        subscribers.forEach(callback => {
            try {
                callback(cleanState);
            } catch (e) {
                console.error('Error en suscriptor del Store:', e);
            }
        });
    }

    // =============================================
    // GUARDAR EN HISTORIAL (ANTES DE CAMBIAR)
    // =============================================
    function saveHistory() {
        try {
            // Guardar una copia profunda y limpia del estado actual
            const stateCopy = getCleanState();
            
            history.past.push(stateCopy);
            
            // Limitar tamaño del historial
            if (history.past.length > MAX_HISTORY) {
                history.past.shift();
            }
            
            // Limpiar future cuando se hace un nuevo cambio
            history.future = [];
        } catch (e) {
            console.error('Error guardando historial:', e);
        }
    }

    // =============================================
    // HANDLER DEL PROXY
    // =============================================
    const handler = {
        get(target, prop) {
            // Si es propiedad del objeto, devolver valor real
            if (prop in target) {
                const value = target[prop];
                
                // Si es un objeto, envolverlo en Proxy también (reactividad profunda)
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    return new Proxy(value, handler);
                }
                
                // Los arrays los devolvemos tal cual (ya son observables por cambios en longitud)
                // pero necesitamos interceptar métodos que modifican el array
                if (Array.isArray(value)) {
                    // Devolvemos el array pero con métodos sobreescritos para detectar cambios
                    return new Proxy(value, arrayHandler);
                }
                
                return value;
            }
            return target[prop];
        },
        
        set(target, prop, value) {
            // Guardar historial ANTES de cambiar (solo si es una propiedad directa del state)
            if (target === state || Object.is(target, state)) {
                saveHistory();
            }
            
            // Asignar nuevo valor
            target[prop] = value;
            
            // Notificar cambios
            notify();
            
            return true;
        },
        
        deleteProperty(target, prop) {
            // Guardar historial ANTES de eliminar
            if (target === state || Object.is(target, state)) {
                saveHistory();
            }
            
            delete target[prop];
            notify();
            return true;
        }
    };

    // =============================================
    // HANDLER ESPECIAL PARA ARRAYS
    // =============================================
    const arrayHandler = {
        get(target, prop) {
            // Interceptar métodos que modifican el array
            if (prop === 'push' || prop === 'pop' || prop === 'splice' || 
                prop === 'shift' || prop === 'unshift' || prop === 'reverse' || 
                prop === 'sort' || prop === 'fill') {
                
                return function(...args) {
                    // Guardar historial ANTES de modificar
                    saveHistory();
                    
                    // Ejecutar método original
                    const result = Array.prototype[prop].apply(target, args);
                    
                    // Notificar cambios
                    notify();
                    
                    return result;
                };
            }
            
            // Para cualquier otra propiedad, devolver valor original
            const value = target[prop];
            if (typeof value === 'function') {
                return value.bind(target);
            }
            return value;
        },
        
        set(target, prop, value) {
            // Guardar historial ANTES de cambiar
            saveHistory();
            
            // Asignar valor
            target[prop] = value;
            
            // Notificar cambios
            notify();
            
            return true;
        }
    };

    // =============================================
    // CREAR PROXY DEL ESTADO
    // =============================================
    const proxiedState = new Proxy(state, handler);

    // =============================================
    // API PÚBLICA
    // =============================================
    return {
        // Estado reactivo (con Proxy)
        state: proxiedState,
        
        // Obtener estado limpio (sin Proxy) - ¡NUEVO!
        getCleanState: getCleanState,
        
        // Suscribirse a cambios
        subscribe(callback) {
            subscribers.push(callback);
            // Devolver función para desuscribirse
            return () => {
                const index = subscribers.indexOf(callback);
                if (index > -1) subscribers.splice(index, 1);
            };
        },
        
        // Reemplazar estado completo (para load/autosave)
        replaceState(newState) {
            // Guardar historial
            saveHistory();
            
            // Reemplazar estado
            state = deepClone(newState);
            
            // Actualizar el Proxy (reconfigurar)
            // Esto es un poco tricky, pero podemos reasignar las propiedades
            Object.keys(proxiedState).forEach(key => {
                delete proxiedState[key];
            });
            Object.assign(proxiedState, state);
            
            // Notificar
            notify();
        },
        
        // Undo
        undo() {
            if (history.past.length === 0) return false;
            
            // Guardar estado actual en future
            const currentState = getCleanState();
            history.future.push(currentState);
            
            // Restaurar último estado del past
            const pastState = history.past.pop();
            state = deepClone(pastState);
            
            // Actualizar Proxy
            Object.keys(proxiedState).forEach(key => {
                delete proxiedState[key];
            });
            Object.assign(proxiedState, state);
            
            notify();
            return true;
        },
        
        // Redo
        redo() {
            if (history.future.length === 0) return false;
            
            // Guardar estado actual en past
            const currentState = getCleanState();
            history.past.push(currentState);
            
            // Restaurar último estado del future
            const futureState = history.future.pop();
            state = deepClone(futureState);
            
            // Actualizar Proxy
            Object.keys(proxiedState).forEach(key => {
                delete proxiedState[key];
            });
            Object.assign(proxiedState, state);
            
            notify();
            return true;
        },
        
        // Limpiar historial
        clearHistory() {
            history.past = [];
            history.future = [];
        },
        
        // Obtener historial (copia)
        getHistory() {
            return {
                past: deepClone(history.past),
                future: deepClone(history.future)
            };
        }
    };
})();

// Exponer globalmente
window.Store = Store;

console.log('✅ Store v3.1 (Proxy corregido) cargado');
