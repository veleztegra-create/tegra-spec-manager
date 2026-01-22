/**
 * Template para el Log de Errores
 * Renderiza el registro de errores de la aplicación
 */

export function renderErrorLog() {
  const container = document.getElementById('error-log');
  
  const html = `
    <div class="card">
      <div class="card-header">
        <h2 class="card-title"><i class="fas fa-exclamation-triangle"></i> Log de Errores</h2>
        <div class="no-print">
          <button class="btn btn-outline btn-sm" onclick="clearErrorLog()">
            <i class="fas fa-trash"></i> Limpiar Log
          </button>
          <button class="btn btn-warning btn-sm" onclick="exportErrorLog()" style="margin-left: 10px;">
            <i class="fas fa-download"></i> Exportar
          </button>
        </div>
      </div>
      <div class="card-body">
        <div id="error-log-content">
          <!-- Los errores se cargarán aquí dinámicamente -->
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  loadErrorLog();
}

function loadErrorLog() {
  const container = document.getElementById('error-log-content');
  if (!container) return;
  
  const errors = window.errorHandler ? window.errorHandler.getErrors() : [];
  
  if (errors.length === 0) {
    container.innerHTML = `
      <p style="text-align: center; color: var(--text-secondary); padding: 30px;">
        <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: 10px; display: block; color: var(--success);"></i>
        No hay errores registrados en el log.
      </p>
    `;
    return;
  }
  
  let html = `
    <div style="margin-bottom: 20px;">
      <p>Total de errores: <strong>${errors.length}</strong></p>
      <p style="font-size: 0.9rem; color: var(--text-secondary);">
        Última actualización: ${new Date().toLocaleString('es-ES')}
      </p>
    </div>
  `;
  
  errors.forEach((error, index) => {
    html += `
      <div class="card" style="margin-bottom: 15px; border-left: 4px solid var(--error);">
        <div class="card-body">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
            <div>
              <strong style="color: var(--error);">${error.context}</strong>
              <div style="font-size: 0.85rem; color: var(--text-secondary);">
                ${new Date(error.timestamp).toLocaleString('es-ES')}
              </div>
            </div>
            <button class="btn btn-sm btn-outline" onclick="copyErrorDetails(${index})">
              <i class="fas fa-copy"></i> Copiar
            </button>
          </div>
          <div style="background: var(--gray-dark); padding: 10px; border-radius: var(--radius); margin-bottom: 10px;">
            <code style="color: var(--text-primary); font-size: 0.85rem;">
              ${error.error.message || 'Sin mensaje'}
            </code>
          </div>
          ${error.extraData && Object.keys(error.extraData).length > 0 ? `
          <div style="font-size: 0.8rem;">
            <strong>Datos adicionales:</strong>
            <pre style="background: var(--gray-dark); padding: 8px; border-radius: var(--radius); margin-top: 5px; font-size: 0.75rem; max-height: 100px; overflow: auto;">
${JSON.stringify(error.extraData, null, 2)}
            </pre>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function copyErrorDetails(index) {
  const errors = window.errorHandler ? window.errorHandler.getErrors() : [];
  if (index < 0 || index >= errors.length) return;
  
  const error = errors[index];
  const text = `Error: ${error.error.message}\nContexto: ${error.context}\nFecha: ${error.timestamp}\nStack: ${error.error.stack || 'No disponible'}`;
  
  navigator.clipboard.writeText(text).then(() => {
    showStatus('✅ Detalles del error copiados al portapapeles', 'success');
  }).catch(err => {
    showStatus('❌ Error al copiar al portapapeles', 'error');
  });
}

function clearErrorLog() {
  if (confirm('¿Estás seguro de que quieres limpiar el log de errores?')) {
    if (window.errorHandler) {
      window.errorHandler.clearErrors();
    }
    loadErrorLog();
    showStatus('🗑️ Log de errores limpiado', 'success');
  }
}

function exportErrorLog() {
  try {
    const errors = window.errorHandler ? window.errorHandler.getErrors() : [];
    const exportData = {
      app: 'Tegra Spec Manager',
      version: window.Config && window.Config.APP ? window.Config.APP.VERSION || '1.0.0' : '1.0.0',
      exportDate: new Date().toISOString(),
      totalErrors: errors.length,
      errors: errors
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `TegraSpec_ErrorLog_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    showStatus('✅ Log de errores exportado', 'success');
  } catch (error) {
    console.error('Error al exportar log:', error);
    showStatus('❌ Error al exportar log de errores', 'error');
  }
}

// Hacer funciones disponibles globalmente
window.loadErrorLog = loadErrorLog;
window.clearErrorLog = clearErrorLog;
window.exportErrorLog = exportErrorLog;
window.copyErrorDetails = copyErrorDetails;
