// js/main.js
// Importa solo lo que necesites como módulos
import { updateDashboard, createDashboard } from './modules/dashboard.js';
import { initSpecCreator, renderArtes } from './modules/spec-creator.js';
import { initPDFAnalyzer } from './modules/pdf-analyzer.js';

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log("Tegra Spec Manager iniciando...");
    
    // 1. Cargar datos iniciales
    if (!window.INK_PRESETS) {
        // Si no están cargados los presets, cargarlos ahora
        window.INK_PRESETS = {
            WATER: { temp: '320 °F', time: '1:40 min' },
            PLASTISOL: { temp: '320 °F', time: '0:45 min' },
            SILICONE: { temp: '320 °F', time: '1:00 min' }
        };
    }
    
    // 2. Inicializar módulos
    initSpecCreator();
    initPDFAnalyzer();
    
    // 3. Inicializar UI
    updateDateTime();
    updateDashboard();
    renderArtes();
    
    // 4. Configurar eventos
    setupEventListeners();
    
    // 5. Mostrar que todo está listo
    setTimeout(() => {
        showStatus('✅ Aplicación cargada correctamente', 'success');
    }, 500);
});

// Función para configurar eventos (moverla aquí para simplificar)
function setupEventListeners() {
    // Excel
    document.getElementById('excelFile')?.addEventListener('change', window.handleExcelUpload || function(e) {
        showStatus('Funcionalidad Excel no disponible aún', 'warning');
    });
    
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
    
    // Tinta
    document.getElementById('ink-type-select')?.addEventListener('change', function() {
        const preset = window.INK_PRESETS?.[this.value];
        if (preset) {
            document.getElementById('temp').value = preset.temp;
            document.getElementById('time').value = preset.time;
            showStatus(`Preset ${this.value} aplicado`);
        }
    });
    
    // Folder
    document.getElementById('folder-num')?.addEventListener('input', function() {
        window.specGlobal.folder = this.value;
    });
}

// Función para fecha/hora (moverla aquí)
function updateDateTime() {
    const dateElement = document.getElementById('current-datetime');
    if (!dateElement) return;
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    
    dateElement.textContent = new Date().toLocaleDateString('es-ES', options);
}

// Actualizar cada minuto
setInterval(updateDateTime, 60000);

// Hacer funciones globales para HTML
window.clearForm = function() {
    if (confirm('¿Limpiar todo el formulario?')) {
        window.specGlobal = {
            customer: '', style: '', colorway: '', season: '', pattern: '', po: '',
            sampleType: '', nameTeam: '', gender: '', designer: '', inkType: 'WATER',
            folder: '', dimensions: '', placement: '', temp: '320 °F', time: '1:40 min',
            specialties: '', instructions: '', imageB64: '', artes: [], savedAt: null
        };
        
        window.currentImageData = null;
        
        // Limpiar campos del formulario
        ['customer', 'style', 'colorway', 'season', 'pattern', 'po', 'sampleType', 
         'nameTeam', 'gender', 'dimensions', 'placement', 'specialties', 'instructions']
         .forEach(id => {
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
        if (typeof window.renderArtes === 'function') {
            window.specGlobal.artes = [];
            window.renderArtes();
        }
        
        // Limpiar logo
        const logo = document.getElementById('logoCliente');
        if (logo) logo.style.display = 'none';
        
        showStatus('Formulario limpiado', 'info');
    }
};
