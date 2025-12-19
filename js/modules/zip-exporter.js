// js/modules/zip-exporter.js
export function downloadProjectZip() {
    showStatus('⚠️ Función ZIP en desarrollo. Por ahora usa PDF o Excel.', 'warning');
}

export function exportPDF() {
    showStatus('⚠️ Función PDF en desarrollo. Próximamente.', 'warning');
}

export function exportToExcel() {
    showStatus('⚠️ Función Excel en desarrollo. Próximamente.', 'warning');
}

// Hacer globales
window.downloadProjectZip = downloadProjectZip;
window.exportPDF = exportPDF;
window.exportToExcel = exportToExcel;
