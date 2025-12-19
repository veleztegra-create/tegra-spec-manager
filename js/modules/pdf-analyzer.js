// js/modules/pdf-analyzer.js
window.pdfAnalysisResults = [];
window.originalPDFResults = [];

export function initPDFAnalyzer() {
    console.log("Inicializando PDF analyzer...");
    document.getElementById('pdf-file')?.addEventListener('change', function() {
        showStatus('PDF listo para análisis', 'info');
    });
}

export function startPDFAnalysis() {
    const fileInput = document.getElementById('pdf-file');
    const file = fileInput?.files[0];
    
    if (!file) {
        showStatus('Selecciona un archivo PDF primero', 'warning');
        return;
    }
    
    showStatus('Análisis de PDF iniciado (versión simulada)', 'info');
    
    // Simulación de resultados
    window.pdfAnalysisResults = [
        {
            page: 1,
            colorName: "UNI RED",
            screenLetter: "A",
            colorType: "COLOR",
            arteName: "FRONT",
            blackPixels: 1500000,
            netBlackPixels: 1200000,
            coveragePercentage: "15.75",
            matchesSpec: true
        },
        {
            page: 2,
            colorName: "BLOCKER CHT",
            screenLetter: "B",
            colorType: "BLOCKER",
            arteName: "FRONT",
            blackPixels: 2000000,
            netBlackPixels: 1800000,
            coveragePercentage: "22.50",
            matchesSpec: true
        }
    ];
    
    displayPDFResults();
    document.getElementById('save-results-btn').style.display = 'inline-flex';
}

// Hacer global
window.startPDFAnalysis = startPDFAnalysis;

function displayPDFResults() {
    const container = document.getElementById('pdf-results-container');
    if (!container) return;
    
    if (!window.pdfAnalysisResults || window.pdfAnalysisResults.length === 0) {
        container.innerHTML = '<p>No hay resultados disponibles.</p>';
        return;
    }
    
    let html = `
        <div class="analysis-results-summary">
            <h3 style="color:white;margin-bottom:15px;">
                <i class="fas fa-chart-pie"></i> Resumen del Análisis
            </h3>
            <div class="summary-metrics">
                <div class="summary-metric">
                    <div class="summary-label">Total Páginas</div>
                    <div class="summary-value">${window.pdfAnalysisResults.length}</div>
                </div>
                <div class="summary-metric">
                    <div class="summary-label">Píxeles Netos Totales</div>
                    <div class="summary-value">${window.pdfAnalysisResults.reduce((sum, r) => sum + r.netBlackPixels, 0).toLocaleString()}</div>
                </div>
            </div>
        </div>
        <table class="sequence-table">
            <thead>
                <tr>
                    <th>Página</th><th>Color</th><th>Screen</th><th>Tipo</th><th>Ubicación</th>
                    <th>Píxeles Netos</th><th>% Cobertura</th><th>Concuerda</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    window.pdfAnalysisResults.forEach(result => {
        html += `
            <tr>
                <td>${result.page}</td>
                <td>${result.colorName}</td>
                <td>${result.screenLetter}</td>
                <td>${result.colorType}</td>
                <td>${result.arteName}</td>
                <td>${result.netBlackPixels.toLocaleString()}</td>
                <td>${result.coveragePercentage}%</td>
                <td>${result.matchesSpec ? '✅' : '❌'}</td>
            </tr>
        `;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

window.savePDFResults = function() {
    if (window.pdfAnalysisResults.length === 0) {
        showStatus('No hay resultados para guardar', 'warning');
        return;
    }
    
    const data = {
        analysisDate: new Date().toISOString(),
        results: window.pdfAnalysisResults
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `PDF_Analysis_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    
    showStatus('✅ Resultados guardados como JSON');
};
