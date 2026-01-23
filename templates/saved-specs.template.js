/**
 * Template para la vista de Specs Guardadas
 * Renderiza la lista de specs almacenadas en localStorage
 */

function renderSavedSpecs() {
  const container = document.getElementById('saved-specs');
  
  if (!container) {
    console.error('❌ No se encontró el contenedor de saved-specs');
    return;
  }
  
  const html = `
    <div class="card">
      <div class="card-header">
        <h2 class="card-title"><i class="fas fa-database"></i> Specs Guardadas (Browser)</h2>
        <button class="btn btn-outline btn-sm" onclick="clearAllSpecs()">
          <i class="fas fa-trash"></i> Limpiar Todo
        </button>
      </div>
      <div class="card-body" id="saved-specs-list">
        <!-- La lista se cargará dinámicamente -->
        <p style="text-align:center; color:var(--text-secondary); padding:20px;">
          <i class="fas fa-database" style="font-size:2rem; margin-bottom:10px; display:block;"></i>
          No hay specs guardadas. Crea una nueva spec para verla aquí.
        </p>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  loadSavedSpecsList();
}

function loadSavedSpecsList() {
  const list = document.getElementById('saved-specs-list');
  if (!list) return;
  
  const specs = Object.keys(localStorage).filter(key => key.startsWith('spec_'));
  
  if (specs.length === 0) {
    list.innerHTML = `
      <p style="text-align: center; color: var(--text-secondary); padding: 30px;">
        <i class="fas fa-database" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
        No hay specs guardadas. Crea una nueva spec para verla aquí.
      </p>
    `;
    return;
  }
  
  list.innerHTML = '';
  specs.forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      const div = document.createElement('div');
      div.style.cssText = "padding:15px; border-bottom:1px solid var(--border-dark); display:flex; justify-content:space-between; align-items:center; transition: var(--transition);";
      div.innerHTML = `
        <div style="flex: 1;">
          <div style="font-weight: 700; color: var(--primary);">${data.style || 'N/A'}</div>
          <div style="font-size: 0.85rem; color: var(--text-secondary);">Cliente: ${data.customer || 'N/A'} | Colorway: ${data.colorway || 'N/A'}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Guardado: ${new Date(data.savedAt).toLocaleDateString('es-ES')}</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary btn-sm" onclick='loadSpecData(${JSON.stringify(data)})'><i class="fas fa-edit"></i> Cargar</button>
          <button class="btn btn-outline btn-sm" onclick="downloadSingleSpec('${key}')"><i class="fas fa-download"></i> JSON</button>
          <button class="btn btn-danger btn-sm" onclick="deleteSpec('${key}')"><i class="fas fa-trash"></i></button>
        </div>
      `;
      list.appendChild(div);
    } catch (e) {
      console.error('Error al parsear spec guardada:', key, e);
      localStorage.removeItem(key);
    }
  });
}

function downloadSingleSpec(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `TegraSpec_${data.style || 'Backup'}.json`);
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showStatus('✅ Spec descargada como JSON', 'success');
  } catch (e) {
    showStatus('❌ Error al descargar la spec', 'error');
  }
}

function deleteSpec(key) {
  if (confirm('¿Estás seguro de que quieres eliminar esta spec?')) {
    localStorage.removeItem(key);
    loadSavedSpecsList();
    if (window.updateDashboard) {
      window.updateDashboard();
    }
    showStatus('🗑️ Spec eliminada', 'success');
  }
}

function clearAllSpecs() {
  if (confirm('⚠️ ¿Estás seguro de que quieres eliminar TODAS las specs guardadas?\n\nEsta acción no se puede deshacer y se perderán todos los datos.')) {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('spec_')) {
        localStorage.removeItem(key);
      }
    });
    loadSavedSpecsList();
    if (window.updateDashboard) {
      window.updateDashboard();
    }
    showStatus('🗑️ Todas las specs han sido eliminadas', 'success');
  }
}

// Añadimos loadSpecData aquí ya que es necesaria para este template
function loadSpecData(data) {
  if (window.layoutManager && window.layoutManager.loadSpecData) {
    window.layoutManager.loadSpecData(data);
  }
}

// Hacer funciones disponibles globalmente
window.renderSavedSpecs = renderSavedSpecs;
window.loadSavedSpecsList = loadSavedSpecsList;
window.clearAllSpecs = clearAllSpecs;
window.deleteSpec = deleteSpec;
window.downloadSingleSpec = downloadSingleSpec;
window.loadSpecData = loadSpecData;
