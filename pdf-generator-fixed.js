// pdf-generator-fixed.js - Generador de PDF corregido y mejorado
// Esta versión incluye manejo de errores, logs y un método de respaldo

(function() {
  'use strict';

  // Configuración
  const CONFIG = {
    pageSize: 'letter',
    orientation: 'p',
    unit: 'mm',
    primaryColor: [227, 24, 55], // Tegra red
    grayLight: [245, 245, 245],
    grayDark: [100, 100, 100],
    margin: 10,
    debug: true
  };

  // Función de log
  function log(msg, type = 'info', data) {
    if (!CONFIG.debug) return;
    const prefix = '[PDF-GEN]';
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${prefix} [${timestamp}] [${type.toUpperCase()}] ${msg}`, data || '');
  }

  // Función principal de generación
  async function generateProfessionalPDF(data) {
    log('Iniciando generación de PDF', 'info', { placements: data?.placements?.length });

    try {
      // Validar datos
      if (!data) {
        throw new Error('Datos no proporcionados');
      }

      if (!Array.isArray(data.placements) || data.placements.length === 0) {
        log('No hay placements, creando uno vacío', 'warning');
        data.placements = [{}];
      }

      // Intentar método principal (html2canvas)
      try {
        log('Intentando método html2canvas...');
        const result = await generateWithHtml2Canvas(data);
        log('PDF generado con html2canvas exitosamente', 'success');
        return result;
      } catch (html2canvasError) {
        log('Error con html2canvas: ' + html2canvasError.message, 'error');
        log('Intentando método de respaldo...', 'warning');
        
        // Método de respaldo usando jsPDF directo
        const result = await generateWithJsPDFDirect(data);
        log('PDF generado con método de respaldo exitosamente', 'success');
        return result;
      }
    } catch (error) {
      log('Error fatal en generación de PDF: ' + error.message, 'error', error.stack);
      throw error;
    }
  }

  // Método principal usando html2canvas
  async function generateWithHtml2Canvas(data) {
    if (typeof window.jspdf === 'undefined') {
      throw new Error('jsPDF no está cargado');
    }
    if (typeof window.html2canvas === 'undefined') {
      throw new Error('html2canvas no está cargado');
    }

    const { jsPDF } = window.jspdf;
    const placements = data.placements;

    // Crear contenedor temporal
    const host = document.createElement('div');
    host.id = 'pdf-render-host';
    host.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none;width:1050px;z-index:-1;background:#fff;';
    document.body.appendChild(host);

    const canvases = [];

    try {
      for (let i = 0; i < placements.length; i++) {
        log(`Procesando placement ${i + 1}/${placements.length}`);

        const placement = placements[i];
        
        // Asegurar que tenga título
        if (!placement.title && placement.type) {
          placement.title = placement.type;
        }

        // Construir HTML
        const html = buildPageHTML(data, placement, i, placements.length);
        host.innerHTML = html;

        const target = host.querySelector('.pdf-page');
        if (!target) {
          throw new Error('No se pudo construir el layout');
        }

        // Esperar a que las imágenes carguen
        await waitForImages(target);
        await new Promise(resolve => setTimeout(resolve, 200));

        // Capturar con html2canvas
        const canvas = await html2canvas(target, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: 1050,
          height: Math.max(target.scrollHeight, 1400)
        });

        canvases.push(canvas);
        log(`Canvas ${i + 1} capturado: ${canvas.width}x${canvas.height}`);
      }

      // Crear PDF
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'letter' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const margin = 6.35;
      const printableW = pdfW - (margin * 2);
      const printableH = pdfH - (margin * 2);

      let pageIndex = 0;

      for (const canvas of canvases) {
        const imgW = canvas.width;
        const imgH = canvas.height;
        const slicePx = Math.floor((printableH / printableW) * imgW);

        for (let offsetY = 0; offsetY < imgH; offsetY += slicePx) {
          const sliceHeight = Math.min(slicePx, imgH - offsetY);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = imgW;
          sliceCanvas.height = sliceHeight;

          const ctx = sliceCanvas.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          ctx.drawImage(canvas, 0, offsetY, imgW, sliceHeight, 0, 0, imgW, sliceHeight);

          if (pageIndex > 0) pdf.addPage();

          const imgData = sliceCanvas.toDataURL('image/jpeg', 0.95);
          const renderH = (sliceHeight / imgW) * printableW;
          pdf.addImage(imgData, 'JPEG', margin, margin, printableW, renderH);

          pageIndex++;
        }
      }

      log(`PDF creado con ${pageIndex} página(s)`);
      return pdf.output('blob');

    } finally {
      host.remove();
    }
  }

  // Método de respaldo usando jsPDF directo
  async function generateWithJsPDFDirect(data) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF(CONFIG.orientation, CONFIG.unit, CONFIG.pageSize);

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = CONFIG.margin;

    let y = margin;

    // Función helper para texto
    const text = (str, x, y, size = 10, bold = false, color = [0,0,0], align = 'left') => {
      pdf.setTextColor(...color);
      pdf.setFont('helvetica', bold ? 'bold' : 'normal');
      pdf.setFontSize(size);
      pdf.text(String(str || '---'), x, y, { align });
    };

    // Cabecera
    pdf.setFillColor(...CONFIG.primaryColor);
    pdf.rect(0, 0, pageW, 25, 'F');
    text('TEGRA', margin, 12, 18, true, [255,255,255]);
    text('TECHNICAL SPECIFICATION', margin, 20, 10, false, [255,255,255]);
    text(`#${data.folder || '#####'}`, pageW - margin, 15, 14, true, [255,255,255], 'right');
    y = 35;

    // Información General
    text('INFORMACIÓN GENERAL', margin, y, 12, true, CONFIG.primaryColor);
    y += 8;

    const infoFields = [
      ['Cliente:', data.customer], ['Season:', data.season],
      ['Style:', data.style], ['Colorway:', data.colorway],
      ['P.O.:', data.po], ['Team:', data.nameTeam],
      ['Sample:', data.sampleType], ['Gender:', data.gender]
    ];

    pdf.setFontSize(9);
    infoFields.forEach(([label, value], i) => {
      const x = i % 2 === 0 ? margin : 110;
      const rowY = y + Math.floor(i / 2) * 6;
      text(label, x, rowY, 9, true);
      text(value, x + 25, rowY, 9);
    });

    y += 30;

    // Placements
    data.placements.forEach((placement, idx) => {
      if (y > pageH - 60) {
        pdf.addPage();
        y = margin;
      }

      if (idx > 0) y += 10;

      // Título del placement
      pdf.setFillColor(...CONFIG.grayLight);
      pdf.rect(margin, y - 5, pageW - margin * 2, 8, 'F');
      text(`PLACEMENT: ${(placement.type || 'FRONT').toUpperCase()}`, margin + 2, y, 11, true, CONFIG.primaryColor);
      y += 12;

      // Detalles
      text(`Ink Type: ${placement.inkType || 'WATER'}`, margin, y, 9);
      text(`Dimensions: ${placement.width || '--'} x ${placement.height || '--'}`, margin, y + 5, 9);
      text(`Location: ${placement.placementDetails || '---'}`, margin, y + 10, 9);
      y += 20;

      // Colores
      if (placement.colors && placement.colors.length > 0) {
        text('COLORES:', margin, y, 10, true, CONFIG.primaryColor);
        y += 6;

        placement.colors.forEach((color, cidx) => {
          const type = color.type === 'BLOCKER' ? '[B]' : color.type === 'WHITE_BASE' ? '[W]' : `[${color.screenLetter || cidx + 1}]`;
          text(`${type} ${color.val || '---'}`, margin + 5, y, 8);
          y += 4;
        });

        y += 5;
      }

      // Secuencia
      if (placement.colors && placement.colors.length > 0) {
        text('SECUENCIA DE IMPRESIÓN:', margin, y, 10, true, CONFIG.primaryColor);
        y += 6;

        const stations = generateStations(placement);
        stations.forEach(station => {
          if (y > pageH - 20) {
            pdf.addPage();
            y = margin + 10;
          }

          if (station.screenCombined === 'FLASH' || station.screenCombined === 'COOL') {
            text(`${station.st}. ${station.screenCombined}`, margin + 5, y, 8, false, CONFIG.grayDark);
          } else {
            const line = `${station.st}. [${station.screenLetter}] ${station.screenCombined} - Malla: ${station.mesh} - Strokes: ${station.strokes}`;
            text(line, margin + 5, y, 8);
          }
          y += 4;
        });
      }

      y += 10;
    });

    // Footer en todas las páginas
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, pageH - 15, pageW - margin, pageH - 15);
      text(`Generado: ${new Date().toLocaleString('es-ES')}`, margin, pageH - 10, 7, false, CONFIG.grayDark);
      text(`Página ${i} de ${totalPages}`, pageW / 2, pageH - 10, 7, false, CONFIG.grayDark, 'center');
      text('TEGRA Spec Manager', pageW - margin, pageH - 10, 7, true, CONFIG.primaryColor, 'right');
    }

    log('PDF de respaldo creado');
    return pdf.output('blob');
  }

  // Generar datos de estaciones
  function generateStations(placement) {
    const stations = [];
    let stNum = 1;
    const preset = getInkPreset(placement.inkType || 'WATER');

    const meshColor = placement.meshColor || preset.color.mesh;
    const meshWhite = placement.meshWhite || preset.white.mesh1;
    const meshBlocker = placement.meshBlocker || preset.blocker.mesh1;
    const durometer = placement.durometer || preset.color.durometer;
    const strokes = placement.strokes || preset.color.strokes;
    const angle = placement.angle || preset.color.angle;
    const pressure = placement.pressure || preset.color.pressure;
    const speed = placement.speed || preset.color.speed;
    const additives = placement.additives || preset.color.additives;

    if (Array.isArray(placement.colors)) {
      placement.colors.forEach((item, idx) => {
        let mesh = meshColor;
        let strokesVal = strokes;
        let duro = durometer;
        let ang = angle;
        let press = pressure;
        let spd = speed;
        let add = additives;
        let screenCombined = item.val || '---';

        if (item.type === 'BLOCKER') {
          mesh = meshBlocker;
          add = preset.blocker.additives;
          screenCombined = preset.blocker.name;
        } else if (item.type === 'WHITE_BASE') {
          mesh = meshWhite;
          add = preset.white.additives;
          screenCombined = preset.white.name;
        } else if (item.type === 'METALLIC') {
          mesh = '110/64';
          strokesVal = '1';
          duro = '70';
          add = 'Catalizador especial';
        }

        stations.push({
          st: stNum++,
          screenLetter: item.screenLetter || '',
          screenCombined,
          mesh,
          strokes: strokesVal,
          duro,
          angle: ang,
          pressure: press,
          speed: spd,
          add
        });

        if (idx < placement.colors.length - 1) {
          stations.push({ st: stNum++, screenLetter: '', screenCombined: 'FLASH', mesh: '-', strokes: '-', duro: '-', angle: '-', pressure: '-', speed: '-', add: '' });
          stations.push({ st: stNum++, screenLetter: '', screenCombined: 'COOL', mesh: '-', strokes: '-', duro: '-', angle: '-', pressure: '-', speed: '-', add: '' });
        }
      });
    }

    return stations;
  }

  // Obtener preset de tinta
  function getInkPreset(inkType) {
    if (window.Config?.INK_PRESETS?.[inkType]) {
      return window.Config.INK_PRESETS[inkType];
    }

    return {
      temp: '320°F',
      time: '1:40 min',
      blocker: { name: 'BLOCKER CHT', mesh1: '122/55', additives: 'N/A' },
      white: { name: 'AQUAFLEX V2 WHITE', mesh1: '198/40', additives: 'N/A' },
      color: { mesh: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: '3% cross-linker' }
    };
  }

  // Esperar a que carguen las imágenes
  function waitForImages(root) {
    const images = Array.from(root.querySelectorAll('img'));
    if (!images.length) return Promise.resolve();

    return Promise.all(images.map(img => new Promise(resolve => {
      if (img.complete) return resolve();
      img.addEventListener('load', () => resolve(), { once: true });
      img.addEventListener('error', () => resolve(), { once: true });
      setTimeout(() => resolve(), 2000);
    })));
  }

  // Construir HTML de la página
  function buildPageHTML(data, placement, index, total) {
    const esc = (v) => String(v || '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

    const type = esc((placement.title || placement.type || 'FRONT').toUpperCase());
    const colors = Array.isArray(placement.colors) ? placement.colors : [];
    const stations = generateStations(placement);

    const colorsHtml = colors.map((c, i) => `
      <div class="color-item">
        <span class="color-num">${i + 1}</span>
        <span class="color-type">${c.type}</span>
        <span class="color-letter">${esc(c.screenLetter)}</span>
        <span class="color-val">${esc(c.val)}</span>
      </div>
    `).join('');

    const stationsHtml = stations.map(s => `
      <tr class="${s.screenCombined === 'FLASH' || s.screenCombined === 'COOL' ? 'flash' : ''}">
        <td>${s.st}</td>
        <td>${esc(s.screenLetter)}</td>
        <td>${esc(s.screenCombined)}</td>
        <td>${esc(s.add)}</td>
        <td>${esc(s.mesh)}</td>
        <td>${esc(s.strokes)}</td>
        <td>${esc(s.angle)}</td>
        <td>${esc(s.pressure)}</td>
        <td>${esc(s.duro)}</td>
      </tr>
    `).join('');

    const imgHtml = placement.imageData ? `<img src="${placement.imageData}" class="placement-img" crossorigin="anonymous">` : '<div class="no-img">Sin imagen</div>';

    return `
      <style>
        .pdf-page { width: 1050px; background: #fff; font-family: Arial, sans-serif; color: #1a1a1a; }
        .header { background: linear-gradient(135deg, #8B0000, #E31837); color: #fff; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header .folder { font-size: 32px; font-weight: bold; }
        .info-section { background: #f5f5f5; padding: 20px; border-bottom: 3px solid #E31837; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 30px; }
        .info-row { display: flex; gap: 10px; }
        .info-label { font-weight: bold; min-width: 100px; }
        .placement-section { padding: 20px; }
        .placement-title { background: #E31837; color: #fff; padding: 10px; font-size: 20px; font-weight: bold; margin: -20px -20px 20px; }
        .placement-content { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .img-container { background: #f8f8f8; border: 2px solid #e0e0e0; min-height: 200px; display: flex; align-items: center; justify-content: center; }
        .placement-img { max-width: 100%; max-height: 300px; }
        .no-img { color: #999; }
        .details-panel { background: #f5f5f5; padding: 15px; border-left: 4px solid #E31837; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
        .colors-section { margin-top: 20px; }
        .color-item { display: flex; gap: 10px; padding: 5px; background: #f5f5f5; margin: 5px 0; border-radius: 4px; }
        .color-num { background: #E31837; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
        .color-type { font-size: 11px; color: #666; }
        .color-letter { font-weight: bold; color: #E31837; }
        .sequence-section { margin-top: 20px; }
        .sequence-header { background: #E31837; color: #fff; padding: 10px; font-weight: bold; }
        .sequence-table { width: 100%; border-collapse: collapse; font-size: 10px; }
        .sequence-table th { background: #1a1a1a; color: #fff; padding: 8px; text-align: left; }
        .sequence-table td { padding: 6px; border-bottom: 1px solid #eee; }
        .sequence-table tr.flash { background: #f5f5f5; font-style: italic; }
        .curing-section { background: #f5f5f5; padding: 15px; margin-top: 20px; border-left: 4px solid #E31837; }
        .curing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center; }
        .curing-label { font-size: 11px; color: #666; }
        .curing-value { font-size: 20px; font-weight: bold; }
        .comments-section { border: 1px solid #ffc107; margin-top: 20px; border-radius: 4px; overflow: hidden; }
        .comments-title { background: #ffc107; padding: 10px; font-weight: bold; }
        .comments-body { background: #fffde7; padding: 15px; }
        .footer { background: #1a1a1a; color: #fff; padding: 15px; margin-top: 20px; display: flex; justify-content: space-between; font-size: 11px; }
      </style>
      <div class="pdf-page">
        <div class="header">
          <div>
            <h1>Technical Spec Manager</h1>
            <p>Sistema de gestión de especificaciones técnicas</p>
          </div>
          <div class="folder">#${esc(data.folder || '#####')}</div>
        </div>
        
        <div class="info-section">
          <h2 style="color: #E31837; margin: 0 0 15px;">Información General</h2>
          <div class="info-grid">
            <div class="info-row"><span class="info-label">Cliente:</span><span>${esc(data.customer)}</span></div>
            <div class="info-row"><span class="info-label">Season:</span><span>${esc(data.season)}</span></div>
            <div class="info-row"><span class="info-label">Style:</span><span>${esc(data.style)}</span></div>
            <div class="info-row"><span class="info-label">Colorway:</span><span>${esc(data.colorway)}</span></div>
            <div class="info-row"><span class="info-label">P.O.:</span><span>${esc(data.po)}</span></div>
            <div class="info-row"><span class="info-label">Team:</span><span>${esc(data.nameTeam)}</span></div>
            <div class="info-row"><span class="info-label">Sample:</span><span>${esc(data.sampleType)}</span></div>
            <div class="info-row"><span class="info-label">Gender:</span><span>${esc(data.gender)}</span></div>
          </div>
        </div>
        
        <div class="placement-section">
          <div class="placement-title">Placement: ${type}</div>
          <div class="placement-content">
            <div class="img-container">${imgHtml}</div>
            <div class="details-panel">
              <div class="detail-row"><span>Tipo de Tinta:</span><strong style="color: #E31837;">${esc(placement.inkType || 'WATER')}</strong></div>
              <div class="detail-row"><span>Dimensiones:</span><strong>${esc(placement.width || '--')} x ${esc(placement.height || '--')}</strong></div>
              <div class="detail-row"><span>Ubicación:</span><span>${esc(placement.placementDetails || '---')}</span></div>
              <div class="detail-row"><span>Especialidades:</span><span>${esc(placement.specialties || '—')}</span></div>
            </div>
          </div>
          
          <div class="colors-section">
            <h3 style="color: #555; font-size: 14px;">Colores y Tintas</h3>
            ${colorsHtml || '<p style="color: #999;">Sin colores</p>'}
          </div>
          
          <div class="sequence-section">
            <div class="sequence-header">Secuencia de Impresión - ${type}</div>
            <table class="sequence-table">
              <thead><tr><th>Est</th><th>Scr.</th><th>Screen</th><th>Aditivos</th><th>Malla</th><th>Strokes</th><th>Angle</th><th>Pressure</th><th>Duro</th></tr></thead>
              <tbody>${stationsHtml}</tbody>
            </table>
          </div>
          
          <div class="curing-section">
            <h3 style="color: #E31837; margin: 0 0 10px;">Condiciones de Curado</h3>
            <div class="curing-grid">
              <div><div class="curing-label">Temperatura</div><div class="curing-value">${esc(placement.temp || '320°F')}</div></div>
              <div><div class="curing-label">Tiempo</div><div class="curing-value">${esc(placement.time || '1:40 min')}</div></div>
              <div><div class="curing-label">Tipo de Tinta</div><div class="curing-value" style="font-size: 16px; color: #E31837;">${esc(placement.inkType || 'WATER')}</div></div>
            </div>
          </div>
          
          <div class="comments-section">
            <div class="comments-title">Comentarios Técnicos</div>
            <div class="comments-body">${esc(placement.specialInstructions || placement.technicalComments || 'Ningún comentario')}</div>
          </div>
        </div>
        
        <div class="footer">
          <div>Generado: ${new Date().toLocaleString('es-ES')}</div>
          <div><strong>TEGRA SPEC MANAGER</strong></div>
          <div>Placement ${index + 1} de ${total}</div>
        </div>
      </div>
    `;
  }

  // Exponer función global
  window.generateProfessionalPDF = generateProfessionalPDF;
  window.PdfGeneratorFixed = { generate: generateProfessionalPDF, CONFIG };

  log('Generador de PDF cargado correctamente');
})();
