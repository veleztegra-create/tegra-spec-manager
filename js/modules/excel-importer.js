// js/modules/excel-importer.js
function handleExcelUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    showStatus('⚠️ Importación de Excel en desarrollo. Mostrando datos de ejemplo.', 'warning');
    
    // Datos de ejemplo
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
        dimensions: 'SIZE: (W) 10" X (H) 12"',
        placement: '4.5" FROM COLLAR SEAM'
    };
    
    // Llenar formulario con datos
    Object.keys(mockData).forEach(key => {
        const el = document.getElementById(key);
        if (el) el.value = mockData[key];
    });
    
    // Actualizar logo
    if (typeof updateClientLogo === 'function') {
        updateClientLogo();
    }
    
    showTab('spec-creator');
    showStatus('✅ Datos de ejemplo cargados (Excel en desarrollo)');
}

window.handleExcelUpload = handleExcelUpload;
