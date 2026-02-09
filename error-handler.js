// error-handler.js - Manejador centralizado de errores
class ErrorHandler {
    constructor() {
        this.errors = [];
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
        
        // Limitar a 100 errores
        if (this.errors.length > 100) {
            this.errors.shift();
        }
        
        // Guardar en localStorage
        this.saveToStorage();
        
        console.error(`[${context}]`, error, extraData);
        
        return errorEntry;
    }
    
    getErrors(limit = 20) {
        return this.errors.slice(-limit).reverse();
    }
    
    clear() {
        this.errors = [];
        localStorage.removeItem('tegraspec_errors');
    }
    
    saveToStorage() {
        try {
            localStorage.setItem('tegraspec_errors', JSON.stringify({
                errors: this.errors.slice(-50),
                lastUpdated: new Date().toISOString()
            }));
        } catch (e) {
            console.warn('No se pudo guardar errores:', e);
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

// Instancia global
window.errorHandler = new ErrorHandler();
errorHandler.loadFromStorage();
