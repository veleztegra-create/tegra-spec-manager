/**
 * Template para el creador de Specs
 */

// QUITAR: export function renderSpecCreator()
function renderSpecCreator() {
  const container = document.getElementById('spec-creator');
  
  const html = `
    <!-- INFORMACIÓN GENERAL -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title"><i class="fas fa-info-circle"></i> Información General</h2>
        <div class="no-print">
          <button class="btn btn-warning btn-sm" onclick="document.getElementById('excelFile').click()">
            <i class="fas fa-folder-open"></i> Cargar SWO
          </button>
          <button class="btn btn-outline btn-sm" onclick="clearForm()" style="margin-left: 10px;">
            <i class="fas fa-broom"></i> Limpiar
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">CLIENTE:</label>
            <input type="text" id="customer" class="form-control" oninput="updateClientLogo()">
          </div>
          <div class="form-group">
            <label class="form-label">STYLE:</label>
            <input type="text" id="style" class="form-control">
          </div>
          <div class="form-group">
            <label class="form-label">COLORWAY:</label>
            <input type="text" id="colorway" class="form-control">
          </div>
          <div class="form-group">
            <label class="form-label">SEASON:</label>
            <input type="text" id="season" class="form-control">
          </div>
          <div class="form-group">
            <label class="form-label">PATTERN #:</label>
            <input type="text" id="pattern" class="form-control">
          </div>
          <div class="form-group">
            <label class="form-label">P.O. #:</label>
            <input type="text" id="po" class="form-control">
          </div>
          <div class="form-group">
            <label class="form-label">SAMPLE TYPE:</label>
            <input type="text" id="sample-type" class="form-control">
          </div>
          <div class="form-group">
            <label class="form-label">NAME / TEAM:</label>
            <input type="text" id="name-team" class="form-control">
          </div>
          <div class="form-group">
            <label class="form-label">GENDER:</label>
            <input type="text" id="gender" class="form-control">
          </div>
          <div class="form-group">
            <label class="form-label">DISEÑADOR:</label>
            <select id="designer" class="form-control">
              <option value="">Seleccionar...</option>
              <option value="ELMER VELEZ">ELMER VELEZ</option>
              <option value="DANIEL HERNANDEZ">DANIEL HERNANDEZ</option>
              <option value="CINDY PINEDA">CINDY PINEDA</option>
              <option value="FERNANDO FERRERA">FERNANDO FERRERA</option>
              <option value="NILDA CORDOBA">NILDA CORDOBA</option>
              <option value="OTRO">OTRO</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- SISTEMA DE MÚLTIPLES PLACEMENTS -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title"><i class="fas fa-layer-group"></i> Ubicaciones (Placements)</h2>
        <div class="no-print">
          <button class="btn btn-primary btn-sm" onclick="addNewPlacement()">
            <i class="fas fa-plus"></i> Agregar Placement
          </button>
        </div>
      </div>
      <div class="card-body">
        <!-- Contenedor de tabs para placements -->
        <div id="placements-tabs" class="placement-tabs">
          <!-- Tabs se generarán dinámicamente -->
        </div>
        
        <!-- Contenedor principal de placements -->
        <div id="placements-container">
          <!-- Cada placement será una sección dentro de este contenedor -->
        </div>
      </div>
    </div>

    <!-- BOTONES DE ACCIÓN -->
    <div class="card no-print">
      <div class="card-body" style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
        <button class="btn btn-primary btn-lg" onclick="exportToExcel()">
          <i class="fas fa-file-excel"></i> Descargar Spec
        </button>
        <button class="btn btn-success btn-lg" onclick="exportPDF()">
          <i class="fas fa-file-pdf"></i> Exportar PDF
        </button>
        <button class="btn btn-warning btn-lg" onclick="downloadProjectZip()">
          <i class="fas fa-file-archive"></i> Descargar ZIP
        </button>
        <button class="btn btn-primary btn-lg" onclick="saveCurrentSpec()">
          <i class="fas fa-save"></i> Guardar Spec
        </button>
        <button class="btn btn-outline btn-lg" onclick="clearForm()">
          <i class="fas fa-broom"></i> Limpiar
        </button>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Inicializar placements si es necesario
  if (!window.placements || window.placements.length === 0) {
    if (window.layoutManager) {
      window.layoutManager.initializePlacements();
    }
  }
}

function clearForm() {
  if (confirm('⚠️ ¿Estás seguro de que quieres limpiar todo el formulario?\n\nSe perderán todos los datos no guardados.\n\n¿Continuar?')) {
    document.querySelectorAll('input:not(#folder-num), textarea, select').forEach(i => {
      if (i.type !== 'button' && i.type !== 'submit') {
        i.value = '';
      }
    });
    document.getElementById('designer').value = '';
    
    window.placements = [];
    const placementsContainer = document.getElementById('placements-container');
    if (placementsContainer) placementsContainer.innerHTML = '';
    
    const tabsContainer = document.getElementById('placements-tabs');
    if (tabsContainer) tabsContainer.innerHTML = '';
    
    if (window.layoutManager) {
      window.layoutManager.initializePlacements();
    }
    
    const logoElement = document.getElementById('logoCliente');
    if (logoElement) {
      logoElement.style.display = 'none';
    }
    
    showStatus('🧹 Formulario limpiado correctamente');
  }
}

// EXPORTAR AL WINDOW
window.renderSpecCreator = renderSpecCreator;
window.clearForm = clearForm;
