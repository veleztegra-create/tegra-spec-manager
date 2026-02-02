// utils/helpers.js - FUNCIONES DE AYUDA GENERALES
console.log('🔧 Cargando helpers...');

window.Utils = {
    /**
     * Formatea una fecha a string legible
     */
    formatDate: function(date = new Date()) {
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    /**
     * Genera un ID único
     */
    generateId: function(prefix = '') {
        return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    /**
     * Valida si es un email válido
     */
    isValidEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    /**
     * Sanitiza texto (elimina HTML peligroso)
     */
    sanitizeText: function(text) {
        if (typeof text !== 'string') return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },
    
    /**
     * Convierte bytes a formato legible (KB, MB, GB)
     */
    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    /**
     * Copia texto al portapapeles
     */
    copyToClipboard: function(text) {
        return navigator.clipboard.writeText(text);
    },
    
    /**
     * Descarga un archivo
     */
    downloadFile: function(filename, content, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    /**
     * Muestra una notificación (compatible con showAppStatus)
     */
    showNotification: function(message, type = 'info', duration = 4000) {
        // Usar showAppStatus si existe
        if (window.showAppStatus) {
            window.showAppStatus(message, type);
            return;
        }
        
        // Fallback básico
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
        
        // Agregar estilos CSS si no existen
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    },
    
    /**
     * Debounce function para eventos de input
     */
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Extrae dimensiones de un texto
     */
    extractDimensions: function(text) {
        if (!text) return { width: '', height: '' };
        
        const patterns = [
            /SIZE:\s*\(W\)\s*([\d\.]+)\s*["']?\s*X\s*\(H\)\s*([\d\.]+)/i,
            /([\d\.]+)\s*["']?\s*[xX×]\s*([\d\.]+)/,
            /W\s*:\s*([\d\.]+).*H\s*:\s*([\d\.]+)/i,
            /ANCHO\s*:\s*([\d\.]+).*ALTO\s*:\s*([\d\.]+)/i,
            /(\d+)\s*["']?\s*[xX]\s*(\d+)/
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return {
                    width: match[1],
                    height: match[2]
                };
            }
        }
        
        return { width: '', height: '' };
    }
};

console.log('✅ Helpers cargados correctamente');
