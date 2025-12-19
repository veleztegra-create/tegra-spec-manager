// js/main.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("Tegra Spec Manager iniciando...");
    
    // 1. Inicializar funciones básicas
    updateDateTime();
    
    // 2. Inicializar módulos
    if (typeof initSpecCreator === 'function') {
        initSpecCreator();
    }
    
    if (typeof initPDFAnalyzer === 'function') {
        initPDFAnalyzer();
    }
    
    // 3. Inicializar datos
    if (typeof updateDashboard === 'function') {
        updateDashboard();
    }
    
    if (typeof renderArtes === 'function') {
        renderArtes();
    }
    
    // 4. Configurar eventos adicionales
    setupEventListeners();
    
    // 5. Mostrar que todo está listo
    setTimeout(() => {
        showStatus('✅ Aplicación cargada correctamente', 'success');
    }, 500);
});

function setupEventListeners() {
    // Excel
    document.getElementById('excelFile')?.addEventListener('change', handleExcelUpload);
    
    // Imagen principal
    document.getElementById('imageInput')?.addEventListener('change', function(e) {
        const reader = new FileReader();
        reader.onload = function(e) {
            window.currentImageData = e.target.result;
            const preview = document.getElementById('imagePreview');
            if (preview) {
                preview.src = window.currentImageData;
                preview.style.display = 'block';
            }
            showStatus('✅ Imagen cargada');
        };
        reader.readAsDataURL(e.target.files[0]);
    });
    
    // Pegar imagen
    document.addEventListener('paste', function(e) {
        if (e.clipboardData && e.clipboardData.items) {
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        window.currentImageData = e.target.result;
                        const preview = document.getElementById('imagePreview');
                        if (preview) {
                            preview.src = window.currentImageData;
                            preview.style.display = 'block';
                        }
                        showStatus('✅ Imagen pegada desde portapapeles');
                    };
                    reader.readAsDataURL(blob);
                    break;
                }
            }
        }
    });
    
    // Folder number
    document.getElementById('folder-num')?.addEventListener('input', function() {
        window.specGlobal.folder = this.value;
    });
    
    // Tinta
    document.getElementById('ink-type-select')?.addEventListener('change', function() {
        const preset = window.INK_PRESETS?.[this.value];
        if (preset) {
            document.getElementById('temp').value = preset.temp;
            document.getElementById('time').value = preset.time;
            showStatus(`Preset ${this.value} aplicado`);
        }
    });
}

// Función para limpiar formulario
window.clearForm = function() {
    if (confirm('¿Limpiar todo el formulario?')) {
        // Resetear objeto global
        window.specGlobal = {
            customer: '', style: '', colorway: '', season: '', pattern: '', po: '',
            sampleType: '', nameTeam: '', gender: '', designer: '', inkType: 'WATER',
            folder: '', dimensions: '', placement: '', temp: '320 °F', time: '1:40 min',
            specialties: '', instructions: '', imageB64: '', artes: [], savedAt: null
        };
        
        window.currentImageData = null;
        
        // Limpiar campos del formulario
        const fields = ['customer', 'style', 'colorway', 'season', 'pattern', 'po', 
                       'sampleType', 'nameTeam', 'gender', 'dimensions', 'placement', 
                       'specialties', 'instructions'];
        
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        
        // Resetear selects
        document.getElementById('designer').value = '';
        document.getElementById('ink-type-select').value = 'WATER';
        document.getElementById('temp').value = '320 °F';
        document.getElementById('time').value = '1:40 min';
        
        // Limpiar imagen
        const preview = document.getElementById('imagePreview');
        if (preview) {
            preview.style.display = 'none';
            preview.src = '';
        }
        
        // Limpiar artes
        if (typeof renderArtes === 'function') {
            window.specGlobal.artes = [];
            renderArtes();
        }
        
        // Limpiar logo
        const logo = document.getElementById('logoCliente');
        if (logo) logo.style.display = 'none';
        
        showStatus('Formulario limpiado', 'info');
    }
};

// Actualizar fecha/hora cada minuto
setInterval(updateDateTime, 60000);
