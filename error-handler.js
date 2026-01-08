// error-handler.js - VERSIÓN COMPLETA CORREGIDA
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        
        // Verificar si Config existe, si no, usar valores por defecto
        this.config = window.Config || {
            APP: {
                NAME: 'Tegra Spec Manager',
                VERSION: '1.0.0'
            }
        };
        
        this.loadFromLocalStorage();
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
            extraData,
            userAgent: navigator.userAgent,
            url: window.location.href,
            appVersion: this.config.APP.VERSION || '1.0.0'
        };
        
        console.error(`[${context}]`, error, extraData);
        
        // Guardar en array
        this.errors.unshift(errorEntry);
        if (this.errors.length > this.maxErrors) {
            this.errors.pop();
        }
        
        // Guardar en localStorage para persistencia
        this.saveToLocalStorage();
        
        // Opcional: Mostrar notificación al usuario
        this.showUserNotification(errorEntry);
        
        return errorEntry;
    }
    
    saveToLocalStorage() {
        try {
            localStorage.setItem('tegraspec_error_log', JSON.stringify({
                errors: this.errors.slice(0, 50),
                lastUpdated: new Date().toISOString(),
                totalErrors: this.errors.length
            }));
        } catch (e) {
            console.warn('No se pudieron guardar errores en localStorage:', e);
        }
    }
    
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('tegraspec_error_log');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.errors = parsed.errors || [];
            }
        } catch (e) {
            console.warn('No se pudieron cargar errores desde localStorage:', e);
        }
    }
    
    getErrors(limit = 20) {
        return this.errors.slice(0, limit);
    }
    
    getErrorCount() {
        return this.errors.length;
    }
    
    clearErrors() {
        this.errors = [];
        localStorage.removeItem('tegraspec_error_log');
    }
    
    getErrorSummary() {
        const summary = {
            total: this.errors.length,
            byContext: {},
            last24Hours: 0,
            lastWeek: 0
        };
        
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        
        this.errors.forEach(error => {
            // Contar por contexto
            summary.byContext[error.context] = (summary.byContext[error.context] || 0) + 1;
            
            // Contar últimos 24 horas
            const errorTime = new Date(error.timestamp).getTime();
            if (now - errorTime < oneDay) {
                summary.last24Hours++;
            }
            
            // Contar última semana
            if (now - errorTime < oneWeek) {
                summary.lastWeek++;
            }
        });
        
        return summary;
    }
    
    showUserNotification(errorEntry) {
        // Solo mostrar notificación para errores críticos
        const criticalContexts = [
            'saveCurrentSpec',
            'exportPDF',
            'exportToExcel',
            'loadProjectZip',
            'processExcelData'
        ];
        
        if (criticalContexts.includes(errorEntry.context)) {
            this.showToastNotification(`Error en ${errorEntry.context}: ${errorEntry.error.message.substring(0, 50)}...`, 'error');
        }
    }
    
    showToastNotification(message, type = 'error') {
        // Crear elemento de notificación
        const toast = document.createElement('div');
        toast.className = `error-toast error-toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f44336' : '#ff9800'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        toast.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'exclamation-circle'}"></i>
            <div>
                <div style="font-weight: bold; margin-bottom: 5px;">${type === 'error' ? 'Error' : 'Advertencia'}</div>
                <div style="font-size: 0.9rem;">${message}</div>
            </div>
            <button onclick="this.parentElement.remove()" 
                    style="background: transparent; border: none; color: white; cursor: pointer; margin-left: auto;">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remover después de 8 segundos
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 8000);
    }
    
    exportErrors(format = 'json') {
        try {
            const exportData = {
                app: this.config.APP.NAME,
                version: this.config.APP.VERSION,
                exportDate: new Date().toISOString(),
                errorCount: this.errors.length,
                summary: this.getErrorSummary(),
                errors: this.errors
            };
            
            if (format === 'json') {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", `TegraSpec_ErrorLog_${new Date().toISOString().slice(0, 10)}.json`);
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error al exportar errores:', error);
            return false;
        }
    }
    
    diagnoseCommonIssues() {
        const issues = [];
        
        // Verificar librerías externas
        if (typeof XLSX === 'undefined') {
            issues.push('Biblioteca Excel (XLSX) no cargada');
        }
        
        if (typeof window.jspdf === 'undefined') {
            issues.push('Biblioteca PDF (jsPDF) no cargada');
        }
        
        if (typeof JSZip === 'undefined') {
            issues.push('Biblioteca ZIP (JSZip) no cargada');
        }
        
        // Verificar localStorage
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
        } catch (e) {
            issues.push('localStorage no disponible o lleno');
        }
        
        // Verificar conexión a internet (para logos)
        if (!navigator.onLine) {
            issues.push('Sin conexión a internet');
        }
        
        return issues;
    }
}

// Instancia global
window.errorHandler = new ErrorHandler();

// Métodos de conveniencia global
window.logError = function(context, error, extraData = {}) {
    return errorHandler.log(context, error, extraData);
};

window.showError = function(message, type = 'error') {
    errorHandler.showToastNotification(message, type);
};