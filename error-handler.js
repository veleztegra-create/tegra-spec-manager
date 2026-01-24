// error-handler.js - VERSIÓN CORREGIDA
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.setupGlobalErrorHandling();
    }
    
    setupGlobalErrorHandling() {
        // Capturar errores globales
        window.addEventListener('error', (event) => {
            this.log('global_error', event.error || event, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        // Capturar promesas rechazadas
        window.addEventListener('unhandledrejection', (event) => {
            this.log('unhandled_promise_rejection', event.reason);
        });
    }
    
    log(context, error, extraData = {}) {
        const errorEntry = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            context,
            error: {
                message: error.message || String(error),
                stack: error.stack,
                name: error.name || 'UnknownError'
            },
            extraData
        };
        
        this.errors.push(errorEntry);
        
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        console.error(`[${context}]`, error, extraData);
        
        this.saveToStorage();
        
        return errorEntry;
    }
    
    getErrors() {
        return [...this.errors].reverse();
    }
    
    clearErrors() {
        this.errors = [];
        this.saveToStorage();
    }
    
    saveToStorage() {
        try {
            localStorage.setItem('tegraspec_errors', JSON.stringify({
                errors: this.errors.slice(-50),
                lastUpdated: new Date().toISOString()
            }));
        } catch (e) {
            console.warn('No se pudieron guardar errores:', e);
        }
    }
    
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('tegraspec_errors');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.errors = parsed.errors || [];
            }
        } catch (e) {
            console.warn('No se pudieron cargar errores:', e);
        }
    }
}

// Instancia global - NO llamar loadFromStorage aquí, se llama después
const errorHandler = new ErrorHandler();

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.errorHandler = errorHandler;
}