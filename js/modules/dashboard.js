// js/modules/dashboard.js
export function updateDashboard() {
    console.log("Actualizando dashboard...");
    
    const specs = Object.keys(localStorage).filter(k => k.startsWith('spec_'));
    const total = specs.length;
    
    const totalEl = document.getElementById('total-specs');
    const todayEl = document.getElementById('today-specs');
    const activeEl = document.getElementById('active-projects');
    const rateEl = document.getElementById('completion-rate');
    
    if (totalEl) totalEl.textContent = total;
    
    // Contar specs de hoy
    const today = new Date().toDateString();
    let todayCount = 0;
    specs.forEach(k => {
        try {
            const spec = JSON.parse(localStorage.getItem(k));
            if (new Date(spec.savedAt).toDateString() === today) {
                todayCount++;
            }
        } catch(e) {
            console.error("Error parsing spec:", e);
        }
    });
    
    if (todayEl) todayEl.textContent = todayCount;
    if (activeEl) activeEl.textContent = Math.floor(total * 0.7);
    if (rateEl) {
        const rate = Math.floor((todayCount / Math.max(total, 1)) * 100);
        rateEl.textContent = rate + '%';
    }
}

export function createDashboard() {
    return `
        <div class="dashboard-grid">
            <div class="stat-card">
                <div class="stat-number" id="total-specs">0</div>
                <div class="stat-label">Specs Totales</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="today-specs">0</div>
                <div class="stat-label">Creadas Hoy</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="active-projects">0</div>
                <div class="stat-label">Proyectos Activos</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="completion-rate">0%</div>
                <div class="stat-label">Tasa de Finalización</div>
            </div>
        </div>
        <div class="card">
            <div class="card-body" style="text-align:center">
                <h2 style="color:var(--primary);margin-bottom:20px">
                    <i class="fas fa-rocket"></i> Acciones Rápidas
                </h2>
                <div style="margin-top:20px;display:flex;gap:15px;justify-content:center;flex-wrap:wrap">
                    <button class="btn btn-primary btn-lg" onclick="showTab('spec-creator')">
                        <i class="fas fa-plus"></i> Nueva Spec
                    </button>
                    <button class="btn btn-success btn-lg" onclick="document.getElementById('excelFile').click()">
                        <i class="fas fa-file-excel"></i> Cargar Excel
                    </button>
                    <button class="btn btn-warning btn-lg" onclick="showTab('pdf-analysis')">
                        <i class="fas fa-file-pdf"></i> Analizar PDF
                    </button>
                    <button class="btn btn-outline btn-lg" onclick="showTab('saved-specs')">
                        <i class="fas fa-history"></i> Ver Historial
                    </button>
                </div>
            </div>
        </div>
    `;
}
