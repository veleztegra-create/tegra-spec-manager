// js/modules/spec-creator.js
function initSpecCreator() {
    console.log("Inicializando spec creator...");
    
    // Configurar eventos
    document.getElementById('customer')?.addEventListener('input', updateClientLogo);
    document.getElementById('ink-type-select')?.addEventListener('change', updateInkPreset);
}

function renderArtes() {
    const container = document.getElementById('artes-container');
    if (!container) return;
    
    if (!window.specGlobal.artes || window.specGlobal.artes.length === 0) {
        container.innerHTML = '<p style="color:var(--gray-light);text-align:center;padding:20px;">No hay ubicaciones. Usa el botón "Nueva Ubicación".</p>';
        return;
    }
    
    container.innerHTML = '';
    window.specGlobal.artes.forEach((arte, i) => {
        const div = document.createElement('div');
        div.className = 'arte-card';
        div.style.cssText = 'background:white;border-radius:8px;border:1px solid #CFD8DC;margin-bottom:15px;padding:15px;';
        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <h4 style="color:var(--primary);margin:0;">${arte.name}</h4>
                <button class="btn btn-danger btn-sm" onclick="removeArte(${i})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
            <p><strong>Dimensiones:</strong> ${arte.dimensions}</p>
            <p><strong>Placement:</strong> ${arte.placement}</p>
            ${arte.colors && arte.colors.length > 0 ? 
                `<p><strong>Colores:</strong> ${arte.colors.length}</p>` : 
                '<p style="color:var(--gray-light);"><em>Sin colores definidos</em></p>'
            }
        `;
        container.appendChild(div);
    });
}

function addArte() {
    const name = prompt('Nombre de la ubicación (ej: FRONT, BACK, SLEEVE):', 'FRONT');
    if (!name) return;
    
    const arte = {
        name: name.toUpperCase(),
        imageB64: '',
        colors: [],
        dimensions: 'SIZE: (W) ##" X (H) ##"',
        placement: '#.#" FROM COLLAR SEAM',
        specialties: '',
        instructions: ''
    };
    
    window.specGlobal.artes.push(arte);
    renderArtes();
    showStatus('✅ Ubicación agregada');
}

function removeArte(index) {
    if (confirm('¿Eliminar esta ubicación?')) {
        window.specGlobal.artes.splice(index, 1);
        renderArtes();
        showStatus('🗑️ Ubicación eliminada');
    }
}

function updateClientLogo() {
    const customer = document.getElementById('customer')?.value.toUpperCase() || '';
    const img = document.getElementById('logoCliente');
    if (!img) return;
    
    const logos = {
        'NIKE': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Nike-Logotipo-PNG-Photo.png',
        'FANATICS': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Fanatics_company_logo.svg.png',
        'ADIDAS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1280px-Adidas_Logo.svg.png'
    };
    
    for (const [key, url] of Object.entries(logos)) {
        if (customer.includes(key)) {
            img.src = url;
            img.style.display = 'block';
            return;
        }
    }
    
    img.style.display = 'none';
}

function updateInkPreset() {
    const select = document.getElementById('ink-type-select');
    if (!select) return;
    
    const inkType = select.value;
    const preset = window.INK_PRESETS[inkType];
    
    if (preset) {
        document.getElementById('temp').value = preset.temp;
        document.getElementById('time').value = preset.time;
        showStatus(`Preset ${inkType} aplicado`);
    }
}

// Hacer funciones globales
window.initSpecCreator = initSpecCreator;
window.renderArtes = renderArtes;
window.addArte = addArte;
window.updateClientLogo = updateClientLogo;
window.removeArte = removeArte;
