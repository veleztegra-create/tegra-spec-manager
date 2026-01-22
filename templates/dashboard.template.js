/**
 * Template para el Dashboard
 * Renderiza la vista principal con estadísticas y acciones rápidas
 */

export function renderDashboard() {
  const container = document.getElementById('dashboard');
  
  const html = `
    <div class="dashboard-grid">
      <div class="stat-card">
        <div class="stat-number" id="total-specs">0</div>
        <div class="stat-label">Specs Totales</div>
      </div>
      <div class="stat-card">
        <div id="today-specs">
          <div style="font-size:0.9rem; color:var(--text-secondary);">Última Spec:</div>
          <div style="font-size:1.2rem; font-weight:bold; color:var(--primary);">Ninguna</div>
          <div style="font-size:0.8rem; color:var(--text-secondary);">-</div>
        </div>
        <div class="stat-label">Última Creación</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" id="active-projects">0</div>
        <div class="stat-label">Proyectos Activos</div>
      </div>
      <div class="stat-card">
        <div id="completion-rate">
          <div style="font-size:0.9rem; color:var(--text-secondary);">Placements totales:</div>
          <div style="font-size:1.5rem; font-weight:bold; color:var(--primary);">0</div>
        </div>
        <div class="stat-label">Placements Totales</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title"><i class="fas fa-rocket"></i> Acciones Rápidas</h2>
        <div class="no-print">
          <button class="btn btn-outline btn-sm" onclick="clearErrorLog()">
            <i class="fas fa-trash"></i> Limpiar Log
          </button>
        </div>
      </div>
      <div class="card-body" style="text-align:center;">
        <div style="margin-top:20px; display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
          <button class="btn btn-primary btn-lg" onclick="window.layoutManager.showTab('spec-creator')">
            <i class="fas fa-plus"></i> Nueva Spec
          </button>
          <button class="btn btn-warning btn-lg" onclick="document.getElementById('excelFile').click()">
            <i class="fas fa-folder-open"></i> Cargar Spec
          </button>
          <button class="btn btn-success btn-lg" onclick="document.getElementById('excelFile').click()">
            <i class="fas fa-file-excel"></i> Cargar SWO
          </button>
          <button class="btn btn-outline btn-lg" onclick="window.layoutManager.showTab('saved-specs')">
            <i class="fas fa-history"></i> Ver Historial
          </button>
          <button class="btn btn-danger btn-lg" onclick="window.layoutManager.showTab('error-log')">
            <i class="fas fa-bug"></i> Ver Errores
          </button>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  updateDashboard();
}

function updateDashboard() {
  try {
    const specs = Object.keys(localStorage).filter(k => k.startsWith('spec_'));
    const total = specs.length;
    
    const totalEl = document.getElementById('total-specs');
    if (totalEl) totalEl.textContent = total;
    
    let lastSpec = null;
    let lastSpecDate = null;
    
    specs.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        const specDate = new Date(data.savedAt || 0);
        
        if (!lastSpecDate || specDate > lastSpecDate) {
          lastSpecDate = specDate;
          lastSpec = data;
        }
      } catch(e) {
        console.warn('Error al parsear spec:', key, e);
      }
    });
    
    const todaySpecsEl = document.getElementById('today-specs');
    if (todaySpecsEl && lastSpec) {
      todaySpecsEl.innerHTML = `
        <div style="font-size:0.9rem; color:var(--text-secondary);">Última Spec:</div>
        <div style="font-size:1.2rem; font-weight:bold; color:var(--primary);">${lastSpec.style || 'Sin nombre'}</div>
        <div style="font-size:0.8rem; color:var(--text-secondary);">${lastSpecDate.toLocaleDateString('es-ES')}</div>
      `;
    }
    
    let activeCount = 0;
    specs.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data.placements && data.placements.length > 0) {
          activeCount++;
        }
      } catch(e) {
        // Ignorar errores
      }
    });
    
    const activeProjectsEl = document.getElementById('active-projects');
    if (activeProjectsEl) activeProjectsEl.textContent = activeCount;
    
    const totalPlacements = specs.reduce((total, key) => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        return total + (data.placements?.length || 0);
      } catch(e) {
        return total;
      }
    }, 0);
    
    const completionRateEl = document.getElementById('completion-rate');
    if (completionRateEl) {
      completionRateEl.innerHTML = `
        <div style="font-size:0.9rem; color:var(--text-secondary);">Placements totales:</div>
        <div style="font-size:1.5rem; font-weight:bold; color:var(--primary);">${totalPlacements}</div>
      `;
    }
    
  } catch (error) {
    console.error('Error en updateDashboard:', error);
  }
}

// Hacer disponible globalmente
window.updateDashboard = updateDashboard;
