// js/modules/zip-exporter.js
function downloadProjectZip() {
    showStatus('⚠️ Función ZIP en desarrollo. Por ahora usa los otros formatos.', 'warning');
}

function exportPDF() {
    showStatus('⚠️ Función PDF en desarrollo. Próximamente.', 'warning');
}

function exportToExcel() {
    showStatus('⚠️ Función Excel en desarrollo. Próximamente.', 'warning');
}

// Hacer globales
window.downloadProjectZip = downloadProjectZip;
window.exportPDF = exportPDF;
window.exportToExcel = exportToExcel;
