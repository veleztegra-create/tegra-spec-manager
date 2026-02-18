// pdf-diagnostic.js - Script de diagnóstico para identificar problemas en la generación de PDF
// Agrega este archivo a tu proyecto e inclúyelo en index.html después de pdf-generator-mejorado.js

window.PdfDiagnostic = {
  logs: [],
  
  log: function(msg, type = 'info', data = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      message: msg,
      data: data ? JSON.stringify(data).substring(0, 500) : null
    };
    this.logs.push(entry);
    console.log(`[PDF-DIAG] [${type.toUpperCase()}] ${msg}`, data || '');
  },
  
  // Verificar librerías
  checkLibraries: function() {
    this.log('Verificando librerías...');
    
    const checks = {
      jsPDF: typeof window.jspdf !== 'undefined',
      html2canvas: typeof window.html2canvas !== 'undefined',
      jsPDFVersion: window.jspdf?.version || 'unknown',
      html2canvasVersion: window.html2canvas?.version || 'unknown'
    };
    
    this.log('Estado de librerías', 'info', checks);
    return checks;
  },
  
  // Verificar datos
  checkData: function(data) {
    this.log('Verificando datos...');
    
    if (!data) {
      this.log('ERROR: Datos son null/undefined', 'error');
      return false;
    }
    
    const checks = {
      hasCustomer: !!data.customer,
      hasStyle: !!data.style,
      hasFolder: !!data.folder,
      placementsCount: data.placements?.length || 0,
      placementsIsArray: Array.isArray(data.placements),
      firstPlacement: data.placements?.[0] ? {
        hasId: !!data.placements[0].id,
        hasType: !!data.placements[0].type,
        hasTitle: !!data.placements[0].title,
        hasImageData: !!data.placements[0].imageData,
        imageDataLength: data.placements[0].imageData?.length || 0,
        colorsCount: data.placements[0].colors?.length || 0,
        hasColors: Array.isArray(data.placements[0].colors)
      } : null
    };
    
    this.log('Estructura de datos', 'info', checks);
    return checks;
  },
  
  // Verificar configuración
  checkConfig: function() {
    this.log('Verificando configuración...');
    
    const checks = {
      hasConfig: !!window.Config,
      hasINK_PRESETS: !!window.Config?.INK_PRESETS,
      inkTypes: window.Config?.INK_PRESETS ? Object.keys(window.Config.INK_PRESETS) : [],
      hasLogoConfig: !!window.LogoConfig,
      logoKeys: window.LogoConfig ? Object.keys(window.LogoConfig) : [],
      hasColorConfig: !!window.ColorConfig,
      hasUtils: !!window.Utils
    };
    
    this.log('Configuración disponible', 'info', checks);
    return checks;
  },
  
  // Test de html2canvas simple
  testHtml2Canvas: async function() {
    this.log('Probando html2canvas...');
    
    try {
      const testDiv = document.createElement('div');
      testDiv.innerHTML = '<h1>Test</h1><p>Contenido de prueba</p>';
      testDiv.style.cssText = 'padding:20px;background:white;position:fixed;left:-9999px;';
      document.body.appendChild(testDiv);
      
      const canvas = await html2canvas(testDiv, { 
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      document.body.removeChild(testDiv);
      
      const result = {
        success: true,
        width: canvas.width,
        height: canvas.height,
        hasData: canvas.toDataURL().length > 100
      };
      
      this.log('html2canvas funciona correctamente', 'success', result);
      return result;
    } catch (error) {
      this.log('ERROR en html2canvas: ' + error.message, 'error', error.stack);
      return { success: false, error: error.message };
    }
  },
  
  // Test de jsPDF simple
  testJsPDF: function() {
    this.log('Probando jsPDF...');
    
    try {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();
      pdf.text('Test', 10, 10);
      
      const blob = pdf.output('blob');
      const result = {
        success: true,
        blobSize: blob.size,
        blobType: blob.type
      };
      
      this.log('jsPDF funciona correctamente', 'success', result);
      return result;
    } catch (error) {
      this.log('ERROR en jsPDF: ' + error.message, 'error', error.stack);
      return { success: false, error: error.message };
    }
  },
  
  // Test completo de generación
  testFullGeneration: async function() {
    this.log('=== INICIANDO TEST COMPLETO ===');
    this.logs = []; // Limpiar logs anteriores
    
    const results = {
      libraries: this.checkLibraries(),
      config: this.checkConfig(),
      jsPDF: this.testJsPDF(),
      html2canvas: await this.testHtml2Canvas()
    };
    
    // Probar con datos de ejemplo
    const testData = this.createTestData();
    results.testData = this.checkData(testData);
    
    // Intentar generar PDF si todo está bien
    if (results.libraries.jsPDF && results.libraries.html2canvas) {
      try {
        this.log('Intentando generar PDF con datos de prueba...');
        const blob = await window.generateProfessionalPDF(testData);
        results.pdfGeneration = {
          success: true,
          blobSize: blob.size,
          blobType: blob.type
        };
        this.log('PDF generado exitosamente', 'success', results.pdfGeneration);
      } catch (error) {
        results.pdfGeneration = {
          success: false,
          error: error.message,
          stack: error.stack
        };
        this.log('ERROR generando PDF: ' + error.message, 'error', error.stack);
      }
    } else {
      results.pdfGeneration = {
        success: false,
        error: 'Librerías no disponibles'
      };
      this.log('No se intentó generar PDF porque faltan librerías', 'warning');
    }
    
    this.log('=== TEST COMPLETO FINALIZADO ===');
    return results;
  },
  
  // Crear datos de prueba
  createTestData: function() {
    return {
      customer: 'TEST CUSTOMER',
      style: 'TEST-STYLE-001',
      folder: '12345',
      colorway: 'ITALY BLUE',
      season: 'FW2024',
      pattern: 'TEST-PATTERN',
      po: 'PO-12345',
      sampleType: 'PROTO',
      nameTeam: 'Houston Texans',
      gender: 'Men',
      designer: 'Test Designer',
      savedAt: new Date().toISOString(),
      placements: [{
        id: 1,
        type: 'FRONT',
        title: 'FRONT',
        name: 'FRONT',
        imageData: null, // Sin imagen para simplificar
        colors: [
          { id: 1, type: 'BLOCKER', val: 'BLOCKER CHT', screenLetter: 'A' },
          { id: 2, type: 'WHITE_BASE', val: 'AQUAFLEX WHITE', screenLetter: 'B' },
          { id: 3, type: 'COLOR', val: 'ITALY BLUE', screenLetter: '1' }
        ],
        placementDetails: '3.5" FROM COLLAR SEAM',
        dimensions: 'SIZE: (W) 15.34 X (H) 12',
        width: '15.34',
        height: '12',
        temp: '320 °F',
        time: '1:40 min',
        specialties: '',
        specialInstructions: 'Test instructions',
        inkType: 'WATER',
        placementSelect: 'FRONT',
        meshColor: '157/48',
        meshWhite: '198/40',
        meshBlocker: '122/55',
        durometer: '70',
        strokes: '2',
        angle: '15',
        pressure: '40',
        speed: '35',
        additives: '3% cross-linker'
      }]
    };
  },
  
  // Diagnóstico con datos reales de la aplicación
  diagnoseRealData: async function() {
    this.log('=== DIAGNÓSTICO CON DATOS REALES ===');
    
    // Verificar si existe collectData
    if (typeof collectData !== 'function') {
      this.log('ERROR: función collectData no encontrada', 'error');
      return { error: 'collectData no disponible' };
    }
    
    try {
      const realData = collectData();
      this.log('Datos recolectados de la aplicación', 'info', realData);
      
      const dataCheck = this.checkData(realData);
      
      // Intentar generar PDF
      try {
        this.log('Intentando generar PDF con datos reales...');
        const blob = await window.generateProfessionalPDF(realData);
        this.log('PDF generado con datos reales', 'success', { size: blob.size });
        return { success: true, dataCheck, blobSize: blob.size };
      } catch (error) {
        this.log('ERROR con datos reales: ' + error.message, 'error', error.stack);
        return { success: false, dataCheck, error: error.message, stack: error.stack };
      }
    } catch (error) {
      this.log('ERROR recolectando datos: ' + error.message, 'error', error.stack);
      return { error: error.message };
    }
  },
  
  // Exportar logs
  exportLogs: function() {
    const blob = new Blob([JSON.stringify(this.logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pdf-diagnostic-logs.json';
    a.click();
    URL.revokeObjectURL(url);
    this.log('Logs exportados', 'success');
  },
  
  // Mostrar reporte visual
  showReport: function() {
    const reportDiv = document.createElement('div');
    reportDiv.id = 'pdf-diagnostic-report';
    reportDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      max-width: 800px;
      max-height: 80vh;
      background: white;
      border: 2px solid #333;
      border-radius: 8px;
      padding: 20px;
      z-index: 10000;
      overflow-y: auto;
      font-family: monospace;
      font-size: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    
    let html = '<h2>Reporte de Diagnóstico PDF</h2>';
    html += '<button onclick="PdfDiagnostic.exportLogs()">Exportar Logs</button>';
    html += '<button onclick="document.getElementById(\'pdf-diagnostic-report\').remove()">Cerrar</button>';
    html += '<hr>';
    
    this.logs.forEach(log => {
      const color = log.type === 'error' ? 'red' : log.type === 'success' ? 'green' : 'black';
      html += `<div style="color:${color};margin:5px 0;">`;
      html += `<strong>[${log.timestamp}] ${log.type.toUpperCase()}</strong>: ${log.message}`;
      if (log.data) {
        html += `<pre style="background:#f5f5f5;padding:5px;overflow-x:auto;">${log.data}</pre>`;
      }
      html += '</div>';
    });
    
    reportDiv.innerHTML = html;
    document.body.appendChild(reportDiv);
  }
};

// Hacer disponible globalmente
window.PdfDiagnostic = PdfDiagnostic;

console.log('[PDF-DIAG] Diagnóstico de PDF cargado. Usa PdfDiagnostic.testFullGeneration() o PdfDiagnostic.diagnoseRealData()');
