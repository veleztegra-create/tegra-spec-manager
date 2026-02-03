// js/core/error-handler.js - VERSIÓN A PRUEBA DE REDECLARACIONES
if (!window.ErrorHandler) {
    window.ErrorHandler = (function() {
        console.log('⚠️ ErrorHandler cargando...');
        
        let errors = [];
        const maxErrors = 100;
        
        const ErrorHandler = {
            log: function(error, context = {}) {
                const errorEntry = {
                    id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                    message: error.message || String(error),
                    stack: error.stack,
                    context: context,
                    timestamp: new Date().toISOString()
                };
                
                errors.unshift(errorEntry);
                
                // Mantener solo los últimos maxErrors
                if (errors.length > maxErrors) {
                    errors = errors.slice(0, maxErrors);
                }
                
                console.error('❌ Error registrado:', errorEntry.message, context);
                this.updateErrorDisplay();
                
                return errorEntry.id;
            },
            
            getErrors: function() {
                return [...errors];
            },
            
            clear: function() {
                errors = [];
                this.updateErrorDisplay();
                console.log('🧹 Errores limpiados');
            },
            
            updateErrorDisplay: function() {
                const errorListElement = document.getElementById('error-log-list');
                if (errorListElement) {
                    errorListElement.innerHTML = errors.length > 0 
                        ? this.generateErrorListHTML() 
                        : '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No hay errores registrados.</p>';
                }
            },
            
            generateErrorListHTML: function() {
                let html = '<div class="error-list">';
                
                errors.forEach(error => {
                    html += `
                        <div class="error-item" style="margin-bottom: 10px; padding: 10px; border-left: 3px solid var(--error); background: rgba(244, 67, 54, 0.1);">
                            <div style="font-weight: bold; color: var(--error);">
                                <i class="fas fa-exclamation-circle"></i> ${error.message}
                            </div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 5px;">
                                ${new Date(error.timestamp).toLocaleString()}
                            </div>
                            ${error.context.module ? `<div style="font-size: 0.8rem; color: var(--text-muted);">Módulo: ${error.context.module}</div>` : ''}
                        </div>
                    `;
                });
                
                html += '</div>';
                return html;
            },
            
            // Métodos de conveniencia
            warn: function(message, context = {}) {
                console.warn('⚠️ ' + message, context);
                this.log(new Error(message), { ...context, level: 'warning' });
            },
            
            info: function(message, context = {}) {
                console.info('ℹ️ ' + message, context);
                // No lo agregamos a errores, solo log
            }
        };
        
        console.log('✅ ErrorHandler cargado correctamente');
        return ErrorHandler;
        
    })();
}
