// js/modules/spec-creator.js
// Variables globales que necesitamos
window.specGlobal = {
    customer: '', style: '', colorway: '', season: '', pattern: '', po: '',
    sampleType: '', nameTeam: '', gender: '', designer: '', inkType: 'WATER',
    folder: '', dimensions: '', placement: '', temp: '320 °F', time: '1:40 min',
    specialties: '', instructions: '', imageB64: '', artes: [], savedAt: null
};

window.currentImageData = null;

export function initSpecCreator() {
    console.log("Inicializando spec creator...");
    // Inicializar eventos específicos del formulario
    document.getElementById('customer')?.addEventListener('input', updateClientLogo);
    document.getElementById('ink-type-select')?.addEventListener('change', updateInkPreset);
}

export function renderArtes() {
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
        div.innerHTML = `
            <div class="arte-header">
                <span class="arte-title">${arte.name}</span>
                <div>
                    <button class="btn btn-outline btn-sm" onclick="editArte(${i})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="removeArte(${i})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="arte-body">
                <p><strong>Dimensiones:</strong> ${arte.dimensions}</p>
                <p><strong>Placement:</strong> ${arte.placement}</p>
                ${arte.colors && arte.colors.length > 0 ? 
                    `<p><strong>Colores:</strong> ${arte.colors.length}</p>` : ''}
            </div>
        `;
        container.appendChild(div);
    });
}

// Hacer funciones globales para llamarlas desde HTML
window.addArte = function() {
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
};

window.updateClientLogo = function() {
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
};

function updateInkPreset() {
    const select = document.getElementById('ink-type-select');
    if (!select) return;
    
    const inkType = select.value;
    const preset = window.INK_PRESETS ? window.INK_PRESETS[inkType] : null;
    
    if (preset) {
        document.getElementById('temp').value = preset.temp;
        document.getElementById('time').value = preset.time;
        showStatus(`Preset ${inkType} aplicado`);
    }
}
