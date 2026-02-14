// pdf-generator-mejorado.js
// Generador PDF profesional (versión segura para jsPDF)

async function generateProfessionalPDF(data) {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof window.jspdf === 'undefined') {
        throw new Error('jsPDF no está cargado.');
      }

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'letter' });

      const COLORS = {
        primary: [227, 24, 55],
        primaryDark: [139, 0, 0],
        black: [26, 26, 26],
        grayDark: [45, 45, 45],
        grayMedium: [128, 128, 128],
        grayLight: [245, 245, 245],
        white: [255, 255, 255],
        textMuted: [102, 102, 102],
        yellow: [255, 193, 7]
      };

      const MARGIN = 15;
      const PAGE_WIDTH = pdf.internal.pageSize.getWidth();
      const PAGE_HEIGHT = pdf.internal.pageSize.getHeight();

      const safeColor = (c, fallback = COLORS.black) => {
        if (!Array.isArray(c) || c.length < 3) return fallback;
        const v = c.slice(0, 3).map(n => Number.isFinite(n) ? Math.max(0, Math.min(255, n)) : 0);
        return v;
      };

      const drawText = (txt, x, y, options = {}) => {
        const { size = 10, font = 'helvetica', style = 'normal', color = COLORS.black, align = 'left' } = options;
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        pdf.setFont(font, style);
        pdf.setFontSize(size);
        pdf.setTextColor(...safeColor(color));
        pdf.text(String(txt || ''), x, y, { align });
      };

      const drawRect = (x, y, w, h, fillColor = null, strokeColor = null, lineWidth = 0.2) => {
        if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) return;
        if (fillColor) {
          pdf.setFillColor(...safeColor(fillColor));
          pdf.rect(x, y, w, h, 'F');
        }
        if (strokeColor) {
          pdf.setDrawColor(...safeColor(strokeColor));
          pdf.setLineWidth(lineWidth);
          pdf.rect(x, y, w, h);
        }
      };

      const drawLine = (x1, y1, x2, y2, color = COLORS.grayLight, width = 0.3) => {
        if (![x1, y1, x2, y2].every(Number.isFinite)) return;
        pdf.setDrawColor(...safeColor(color));
        pdf.setLineWidth(width);
        pdf.line(x1, y1, x2, y2);
      };

      const processImage = async (imageData) => {
        if (!imageData || !String(imageData).startsWith('data:')) return null;
        return new Promise((resolveImg) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolveImg(canvas.toDataURL('image/jpeg', 0.9));
          };
          img.onerror = () => resolveImg(null);
          img.src = imageData;
        });
      };

      let y = 0;
      drawRect(0, 0, PAGE_WIDTH, 28, COLORS.primary);
      drawRect(0, 0, PAGE_WIDTH, 3, COLORS.primaryDark);

      drawText('TEGRA', MARGIN, 18, { size: 26, style: 'bold', color: COLORS.white });
      drawText('Technical Spec Manager', MARGIN, 24, { size: 8, color: COLORS.white });

      drawText('SPECIFICATION', PAGE_WIDTH / 2, 16, { size: 18, style: 'bold', color: COLORS.white, align: 'center' });
      drawText('Sistema de gestión de especificaciones técnicas', PAGE_WIDTH / 2, 22, { size: 7, color: COLORS.white, align: 'center' });

      const customerBoxX = PAGE_WIDTH - 135;
      drawRect(customerBoxX, 4, 80, 20, [35, 35, 35], COLORS.white, 0.5);
      drawText('CUSTOMER / CLIENTE', customerBoxX + 40, 10, { size: 6, style: 'bold', color: COLORS.white, align: 'center' });
      drawText((data.customer || 'N/A').toUpperCase(), customerBoxX + 40, 19, { size: 11, style: 'bold', color: COLORS.white, align: 'center' });

      drawText('# FOLDER', PAGE_WIDTH - MARGIN, 10, { size: 6, color: COLORS.white, align: 'right' });
      drawText(String(data.folder || '#####'), PAGE_WIDTH - MARGIN, 22, { size: 22, style: 'bold', color: COLORS.white, align: 'right' });

      y = 35;
      drawText('INFORMACIÓN GENERAL', MARGIN, y, { size: 12, style: 'bold', color: COLORS.primary });
      drawRect(MARGIN, y + 2, 4, 18, COLORS.primary);
      y += 8;

      const infoFields = [
        { label: 'CLIENTE:', value: data.customer },
        { label: 'SEASON:', value: data.season },
        { label: 'STYLE:', value: data.style },
        { label: 'COLORWAY:', value: data.colorway },
        { label: 'P.O. #:', value: data.po },
        { label: 'TEAM:', value: data.nameTeam },
        { label: 'SAMPLE TYPE:', value: data.sampleType },
        { label: 'GENDER:', value: data.gender },
        { label: 'DESIGNER:', value: data.designer, highlight: true },
        { label: 'DESARROLLADO POR:', value: data.developedBy || data.sampleDevelopedBy }
      ];

      const sectionHeight = 48;
      drawRect(MARGIN, y, PAGE_WIDTH - (MARGIN * 2), sectionHeight, COLORS.grayLight);

      let fieldY = y + 10;
      for (let i = 0; i < infoFields.length; i += 2) {
        const left = infoFields[i];
        const right = infoFields[i + 1];

        drawText(left.label, MARGIN + 8, fieldY, { size: 8, style: 'bold', color: COLORS.textMuted });
        drawText(String(left.value || '---'), MARGIN + 35, fieldY, { size: 9, style: left.highlight ? 'bold' : 'normal', color: left.highlight ? COLORS.primary : COLORS.black });

        if (right) {
          const col2X = PAGE_WIDTH / 2 + 5;
          drawText(right.label, col2X + 3, fieldY, { size: 8, style: 'bold', color: COLORS.textMuted });
          drawText(String(right.value || '---'), col2X + 38, fieldY, { size: 9, style: right.highlight ? 'bold' : 'normal', color: right.highlight ? COLORS.primary : COLORS.black });
        }
        fieldY += 8;
      }

      y += sectionHeight + 8;

      if (Array.isArray(data.placements)) {
        for (let pIndex = 0; pIndex < data.placements.length; pIndex++) {
          const placement = data.placements[pIndex];
          if (pIndex > 0 && y > PAGE_HEIGHT - 100) {
            pdf.addPage();
            y = 20;
          }

          const placementType = (placement.type || 'PLACEMENT').toUpperCase();
          drawRect(MARGIN, y, PAGE_WIDTH - (MARGIN * 2), 12, COLORS.primary);
          drawText(`PLACEMENT: ${placementType}`, MARGIN + 15, y + 8, { size: 13, style: 'bold', color: COLORS.white });
          y += 18;

          const col1Width = (PAGE_WIDTH - (MARGIN * 2) - 10) / 2;
          const col2X = MARGIN + col1Width + 10;
          let contentHeight = 70;

          if (placement.imageData) {
            const processedImage = await processImage(placement.imageData);
            if (processedImage) {
              drawRect(MARGIN, y, col1Width, 69, [230, 230, 230], [200, 200, 200]);
              pdf.addImage(processedImage, 'JPEG', MARGIN + 2, y + 2, col1Width - 4, 65);
            } else {
              drawRect(MARGIN, y, col1Width, 60, COLORS.grayLight);
              drawText('Imagen no disponible', MARGIN + col1Width / 2, y + 30, { size: 10, color: COLORS.textMuted, align: 'center' });
            }
          } else {
            drawRect(MARGIN, y, col1Width, 60, COLORS.grayLight, [180, 180, 180], 0.5);
            drawText('Sin imagen de referencia', MARGIN + col1Width / 2, y + 30, { size: 10, color: COLORS.textMuted, align: 'center' });
          }

          drawRect(col2X, y, col1Width, contentHeight, COLORS.grayLight, COLORS.primary, 1);
          drawRect(col2X, y, col1Width, 8, COLORS.primary);
          drawText('DETALLES TÉCNICOS', col2X + 5, y + 5.5, { size: 9, style: 'bold', color: COLORS.white });

          let detailY = y + 15;
          const details = [
            { label: 'Tipo de Tinta', value: placement.inkType || 'WATER', highlight: true },
            { label: 'Dimensiones (W x H)', value: `${placement.width || '##'}" x ${placement.height || '##'}"` },
            { label: 'Ubicación', value: placement.placementDetails || '---' },
            { label: 'Especialidades', value: placement.specialties || 'Ninguna' }
          ];

          details.forEach((d) => {
            drawText(d.label.toUpperCase(), col2X + 5, detailY, { size: 7, style: 'bold', color: COLORS.textMuted });
            drawText(String(d.value || '---'), col2X + 5, detailY + 5, { size: 10, style: d.highlight ? 'bold' : 'normal', color: d.highlight ? COLORS.primary : COLORS.black });
            detailY += 14;
          });

          y += 82;

          const stationsData = generateStationsDataProfessional(placement);
          if (stationsData.length > 0) {
            drawRect(MARGIN, y, PAGE_WIDTH - (MARGIN * 2), 10, COLORS.primary);
            drawText(`SECUENCIA DE IMPRESIÓN - ${placementType}`, MARGIN + 5, y + 6.5, { size: 11, style: 'bold', color: COLORS.white });
            y += 12;

            const headers = ['Est', 'Scr.', 'Screen', 'Aditivos', 'Malla', 'Str.', 'Ang.', 'Press.', 'Duro'];
            const colWidths = [12, 14, 52, 42, 16, 16, 14, 18, 14];
            const colX = [];
            let cx = MARGIN;
            colWidths.forEach(w => { colX.push(cx); cx += w; });

            drawRect(MARGIN, y - 6, PAGE_WIDTH - (MARGIN * 2), 8, COLORS.grayDark);
            headers.forEach((h, i) => drawText(h, colX[i] + 2, y - 1, { size: 7, style: 'bold', color: COLORS.white }));
            y += 5;

            stationsData.forEach((row, idx) => {
              if (y > PAGE_HEIGHT - 35) {
                pdf.addPage();
                y = 20;
                drawRect(MARGIN, y - 6, PAGE_WIDTH - (MARGIN * 2), 8, COLORS.grayDark);
                headers.forEach((h, i) => drawText(h, colX[i] + 2, y - 1, { size: 7, style: 'bold', color: COLORS.white }));
                y += 5;
              }

              if (idx % 2 === 0) drawRect(MARGIN, y - 4, PAGE_WIDTH - (MARGIN * 2), 6, [250, 250, 250]);
              drawText(String(row.st || ''), colX[0] + 5, y, { size: 8, style: 'bold', color: COLORS.primary, align: 'center' });
              drawText(String(row.screenLetter || ''), colX[1] + 2, y, { size: 8, style: 'bold', color: COLORS.primary });
              drawText(String(row.screenCombined || ''), colX[2] + 2, y, { size: 8, color: COLORS.black });
              drawText(String(row.add || ''), colX[3] + 2, y, { size: 6.5, color: COLORS.primary });
              drawText(String(row.mesh || ''), colX[4] + 2, y, { size: 8, color: COLORS.black });
              drawText(String(row.strokes || ''), colX[5] + 8, y, { size: 8, color: COLORS.black, align: 'center' });
              drawText(String(row.angle || ''), colX[6] + 2, y, { size: 8, color: COLORS.black });
              drawText(String(row.pressure || ''), colX[7] + 9, y, { size: 8, color: COLORS.black, align: 'center' });
              drawText(String(row.duro || ''), colX[8] + 2, y, { size: 8, color: COLORS.black });
              y += 7;
            });

            y += 10;
          }

          if (y > PAGE_HEIGHT - 45) {
            pdf.addPage();
            y = 20;
          }

          drawRect(MARGIN, y, PAGE_WIDTH - (MARGIN * 2), 28, COLORS.grayLight, COLORS.primary, 1.5);
          drawRect(MARGIN, y, PAGE_WIDTH - (MARGIN * 2), 6, COLORS.primary);
          drawText('CONDICIONES DE CURADO', MARGIN + 5, y + 4, { size: 9, style: 'bold', color: COLORS.white });
          drawText(`TEMP: ${placement.temp || '320°F'}`, MARGIN + 10, y + 18, { size: 11, style: 'bold' });
          drawText(`TIEMPO: ${placement.time || '1:40 min'}`, MARGIN + 65, y + 18, { size: 11, style: 'bold' });
          drawText(`TINTA: ${placement.inkType || 'WATER'}`, MARGIN + 120, y + 18, { size: 11, style: 'bold' });
          y += 40;

          const technicalComments = placement.technicalComments || placement.specialInstructions || data.technicalComments || 'Ningún comentario técnico registrado.';
          if (y > PAGE_HEIGHT - 50) { pdf.addPage(); y = 20; }

          drawRect(MARGIN, y, PAGE_WIDTH - (MARGIN * 2), 10, COLORS.yellow, [200, 150, 0], 1);
          drawText('TECHNICAL COMMENTS / COMENTARIOS TÉCNICOS', MARGIN + 5, y + 6.5, { size: 11, style: 'bold', color: COLORS.black });
          y += 12;
          drawRect(MARGIN, y, PAGE_WIDTH - (MARGIN * 2), 25, [255, 253, 231], COLORS.yellow, 1);
          const commentLines = pdf.splitTextToSize(String(technicalComments), PAGE_WIDTH - (MARGIN * 2) - 10);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(...safeColor(COLORS.black));
          pdf.text(commentLines, MARGIN + 5, y + 7);
          y += 45;
        }
      }

      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        const footerY = PAGE_HEIGHT - 15;
        drawLine(MARGIN, footerY - 5, PAGE_WIDTH - MARGIN, footerY - 5, COLORS.grayLight, 0.5);
        const dateStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        drawText(`Generado: ${dateStr}`, MARGIN, footerY + 2, { size: 8, color: COLORS.textMuted });
        if (data.designer) drawText(`Designer: ${data.designer}`, PAGE_WIDTH / 2 - 20, footerY + 2, { size: 8, color: COLORS.textMuted });
        drawText(`Página ${i} de ${totalPages}`, PAGE_WIDTH - 60, footerY + 2, { size: 8, color: COLORS.textMuted, align: 'center' });
        drawText('TEGRA Spec Manager', PAGE_WIDTH - MARGIN, footerY + 2, { size: 8, style: 'bold', color: COLORS.primary, align: 'right' });
      }

      resolve(pdf.output('blob'));
    } catch (error) {
      console.error('Error al generar PDF profesional:', error);
      reject(error);
    }
  });
}

function generateStationsDataProfessional(placement) {
  const stations = [];
  let stNum = 1;
  const preset = getInkPresetForPDFProfessional(placement.inkType || 'WATER');

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
      let mesh = meshColor, strokesVal = strokes, duro = durometer, ang = angle, press = pressure, spd = speed, add = additives;
      if (item.type === 'BLOCKER') { mesh = meshBlocker; add = preset.blocker.additives; }
      if (item.type === 'WHITE_BASE') { mesh = meshWhite; add = preset.white.additives; }
      if (item.type === 'METALLIC') { mesh = '110/64'; strokesVal = '1'; duro = '70'; add = 'Catalizador especial'; }

      stations.push({
        st: stNum++,
        screenLetter: item.screenLetter || '',
        screenCombined: item.val || '---',
        mesh, strokes: strokesVal, duro, angle: ang, pressure: press, speed: spd, add
      });

      if (idx < placement.colors.length - 1) {
        stations.push({ st: stNum++, screenLetter: '', screenCombined: 'FLASH', mesh: '-', strokes: '-', duro: '-', angle: '-', pressure: '-', speed: '-', add: '' });
        stations.push({ st: stNum++, screenLetter: '', screenCombined: 'COOL', mesh: '-', strokes: '-', duro: '-', angle: '-', pressure: '-', speed: '-', add: '' });
      }
    });
  }

  return stations;
}

function getInkPresetForPDFProfessional(inkType = 'WATER') {
  if (window.Config?.INK_PRESETS?.[inkType]) return window.Config.INK_PRESETS[inkType];
  return {
    temp: '320°F',
    time: '1:40 min',
    blocker: { name: 'BLOCKER CHT', mesh1: '122/55', additives: 'N/A' },
    white: { name: 'AQUAFLEX V2 WHITE', mesh1: '198/40', additives: 'N/A' },
    color: { mesh: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: '3% cross-linker 500 · 1.5% antitack' }
  };
}

window.generateProfessionalPDF = generateProfessionalPDF;
