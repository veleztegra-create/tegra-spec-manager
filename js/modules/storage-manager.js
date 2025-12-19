// js/modules/storage-manager.js
export function loadSavedSpecsList() {
    const list = document.getElementById('saved-specs-list');
    if (!list) return;
    
    const specs = Object.keys(localStorage).filter(k => k.startsWith('spec_'));
    
    if (specs.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:var(--gray-light);padding:30px;">No hay specs guardadas.</p>';
        return;
    }
    
    let html = '';
    specs.forEach(key => {
        try {
            const spec = JSON.parse(localStorage.getItem(key));
            html += `
                <div style="padding:15px;border-bottom:1px solid var(--border);">
                    <div style="font-weight:bold;color:var(--primary)">${spec.style || 'Sin nombre'}</div>
                    <div style="font-size:.85rem;color:var(--gray-medium)">
                        Cliente: ${spec.customer || 'N/A'} | Artes: ${spec.artes?.length || 0}
                    </div>
                    <div style="font-size:.75rem;color:var(--gray-light)">
                        ${new Date(spec.savedAt).toLocaleDateString('es-ES')}
                    </div>
                    <div style="margin-top:10px;">
                        <button class="btn btn-primary btn-sm" onclick="loadSpec('${key}')">
                            <i class="fas fa-edit"></i> Cargar
                        </button>
                    </div>
                </div>
            `;
        } catch(e) {
            console.error("Error cargando spec:", e);
        }
    });
    
    list.innerHTML = html;
}

// Hacer global
window.loadSavedSpecsList = loadSavedSpecsList;

window.loadSpec = function(key) {
    try {
        const spec = JSON.parse(localStorage.getItem(key));
        // Cargar datos en el formulario
        Object.keys(spec).forEach(k => {
            const el = document.getElementById(k);
            if (el) el.value = spec[k] || '';
        });
        
        // Cargar artes
        if (spec.artes) {
            window.specGlobal.artes = spec.artes;
            if (typeof window.renderArtes === 'function') {
                window.renderArtes();
            }
        }
        
        showTab('spec-creator');
        showStatus('Spec cargada correctamente');
    } catch(e) {
        showStatus('Error cargando spec', 'error');
    }
};

window.clearAllSpecs = function() {
    if (confirm('¿Eliminar TODAS las specs guardadas?')) {
        Object.keys(localStorage)
            .filter(k => k.startsWith('spec_'))
            .forEach(k => localStorage.removeItem(k));
        
        loadSavedSpecsList();
        if (typeof window.updateDashboard === 'function') {
            window.updateDashboard();
        }
        showStatus('Todas las specs eliminadas');
    }
};
