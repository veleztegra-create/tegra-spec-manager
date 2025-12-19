// js/modules/pdf-analyzer.js
function initPDFAnalyzer() {
    console.log("Inicializando PDF analyzer...");
    document.getElementById('pdf-file')?.addEventListener('change', function() {
        showStatus('PDF listo para análisis', 'info');
    });
}

function startPDFAnalysis() {
    const fileInput = document.getElementById('pdf-file');
    const file = fileInput?.files[0];
    
    if (!file) {
        showStatus('Selecciona un archivo PDF primero', 'warning');
        return;
    }
    
    showStatus('⚠️ Análisis de PDF en desarrollo. Mostrando resultados simulados.', 'info');
    
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

function displayPDFResults() {
    const container = document.getElementById('pdf-results-container');
    if (!container) return;
    
    if (!window.pdfAnalysisResults || window.pdfAnalysisResults.length === 0) {
        container.innerHTML = '<p>No hay resultados disponibles.</p>';
        return;
    }
    
    let html = `
        <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;padding:20px;border-radius:12px;margin-bottom:20px;">
            <h3 style="color:white;margin-bottom:15px;"><i class="fas fa-chart-pie"></i> Resumen del Análisis</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:15px;">
                <div style="text-align:center;padding:15px;background:rgba(255,255,255,0.2);border-radius:8px;">
                    <div style="font-size:0.9rem;opacity:0.9;">Total Páginas</div>
                    <div style="font-size:1.5rem;font-weight:bold;">${window.pdfAnalysisResults.length}</div>
                </div>
                <div style="text-align:center;padding:15px;background:rgba(255,255,255,0.2);border-radius:8px;">
                    <div style="font-size:0.9rem;opacity:0.9;">Píxeles Netos</div>
                    <div style="font-size:1.5rem;font-weight:bold;">${window.pdfAnalysisResults.reduce((sum, r) => sum + r.netBlackPixels, 0).toLocaleString()}</div>
                </div>
            </div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:10px;">
            <thead>
                <tr style="background:linear-gradient(to right, var(--primary), var(--primary-dark));color:white;">
                    <th style="padding:10px;text-align:left;">Página</th><th>Color</th><th>Screen</th><th>Tipo</th>
                    <th>Ubicación</th><th>Píxeles Netos</th><th>% Cobertura</th><th>Concuerda</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    window.pdfAnalysisResults.forEach(result => {
        html += `
            <tr style="border-bottom:1px solid var(--border);">
                <td style="padding:10px;">${result.page}</td>
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

function savePDFResults() {
    if (!window.pdfAnalysisResults || window.pdfAnalysisResults.length === 0) {
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
}

// Hacer globales
window.initPDFAnalyzer = initPDFAnalyzer;
window.startPDFAnalysis = startPDFAnalysis;
window.savePDFResults = savePDFResults;
