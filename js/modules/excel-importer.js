// js/modules/excel-importer.js
export function handleExcelUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            
            // Simulación de carga de datos
            const mockData = {
                customer: 'NIKE',
                style: 'JERSEY-2024',
                colorway: 'TEAM RED/WHITE',
                season: 'FALL 2024',
                pattern: 'PAT-12345',
                po: 'PO-67890',
                sampleType: 'PRODUCTION',
                nameTeam: 'LOS ANGELES',
                gender: 'MENS',
                designer: 'ELMER VELEZ',
                inkType: 'WATER',
                dimensions: 'SIZE: (W) 10" X (H) 12"',
                placement: '4.5" FROM COLLAR SEAM'
            };
            
            // Llenar formulario con datos
            Object.keys(mockData).forEach(key => {
                const el = document.getElementById(key);
                if (el) el.value = mockData[key];
            });
            
            // Actualizar logo
            if (typeof window.updateClientLogo === 'function') {
                window.updateClientLogo();
            }
            
            // Actualizar preset de tinta
            const inkSelect = document.getElementById('ink-type-select');
            if (inkSelect) {
                inkSelect.value = mockData.inkType;
                const event = new Event('change');
                inkSelect.dispatchEvent(event);
            }
            
            showTab('spec-creator');
            showStatus('✅ Datos de Excel cargados (simulación)');
            
        } catch(error) {
            console.error('Error leyendo Excel:', error);
            showStatus('Error al leer el archivo Excel', 'error');
        }
    };
    reader.readAsArrayBuffer(file);
}

// Hacer global para el evento
window.handleExcelUpload = handleExcelUpload;
