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
        primaryLight: [255, 77, 109],
        black: [15, 15, 15],
        grayDark: [26, 26, 26],
        gray: [45, 45, 45],
        grayMedium: [128, 128, 128],
        grayLight: [245, 245, 245],
        borderLight: [224, 224, 224],
        white: [255, 255, 255],
        textMuted: [102, 102, 102],
        yellow: [255, 193, 7],
        flashRow: [250, 250, 250]
      };

      const MARGIN = 10;
      const PAGE_WIDTH = pdf.internal.pageSize.getWidth();
      const PAGE_HEIGHT = pdf.internal.pageSize.getHeight();
      const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

      const safeColor = (c, fallback = COLORS.black) => {
        if (!Array.isArray(c) || c.length < 3) return fallback;
        return c.slice(0, 3).map((n) => Number.isFinite(n) ? Math.max(0, Math.min(255, n)) : 0);
      };

      const drawText = (txt, x, y, options = {}) => {
        const { size = 10, font = 'helvetica', style = 'normal', color = COLORS.black, align = 'left' } = options;
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        pdf.setFont(font, style);
        pdf.setFontSize(size);
        pdf.setTextColor(...safeColor(color));
        pdf.text(String(txt ?? ''), x, y, { align });
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
            resolveImg(canvas.toDataURL('image/jpeg', 0.92));
          };
          img.onerror = () => resolveImg(null);
          img.src = imageData;
        });
      };

      const drawHeader = () => {
        const y = MARGIN;
        const h = 30;
        const c1 = 45;
        const c3 = 48;
        const c4 = 28;
        const c2 = CONTENT_WIDTH - c1 - c3 - c4;

        const x1 = MARGIN;
        const x2 = x1 + c1;
        const x3 = x2 + c2;
        const x4 = x3 + c3;

        drawRect(MARGIN, y, CONTENT_WIDTH, h, COLORS.primary, null);
        drawRect(MARGIN, y, CONTENT_WIDTH, h, null, COLORS.primaryDark, 0.5);

        drawLine(x2, y, x2, y + h, [255, 255, 255], 0.2);
        drawLine(x3, y, x3, y + h, [255, 255, 255], 0.2);
        drawLine(x4, y, x4, y + h, [255, 255, 255], 0.2);

        drawText('TEGRA', x1 + c1 / 2, y + 12, { size: 16, style: 'bold', color: COLORS.white, align: 'center' });
        drawText('SPEC', x1 + c1 / 2, y + 20, { size: 8, style: 'bold', color: COLORS.white, align: 'center' });

        drawText('Technical Spec Manager', x2 + 5, y + 12, { size: 12, style: 'bold', color: COLORS.white });
        drawText('Sistema de gestión de especificaciones técnicas', x2 + 5, y + 19, { size: 7, color: COLORS.white });

        drawRect(x3 + 5, y + 4, c3 - 10, h - 8, [0, 0, 0], [255, 255, 255], 0.3);
        drawText('CUSTOMER / CLIENTE', x3 + c3 / 2, y + 10, { size: 5.5, style: 'bold', color: COLORS.white, align: 'center' });
        drawRect(x3 + 10, y + 12, c3 - 20, 12, COLORS.white);
        drawText(String(data.customer || 'N/A').toUpperCase(), x3 + c3 / 2, y + 19.5, { size: 8.5, style: 'bold', align: 'center' });

        drawText('# FOLDER', x4 + c4 - 3, y + 9, { size: 6, style: 'bold', color: COLORS.white, align: 'right' });
        drawText(String(data.folder || '#####'), x4 + c4 - 3, y + 23, { size: 16, style: 'bold', color: COLORS.white, align: 'right' });

        return y + h + 6;
      };

      const drawGeneralInfo = (y) => {
        drawRect(MARGIN, y, CONTENT_WIDTH, 4.5, COLORS.primary);
        drawText('INFORMACIÓN GENERAL', MARGIN + 2, y + 3.2, { size: 9, style: 'bold', color: COLORS.white });
        y += 6;

        drawRect(MARGIN, y, CONTENT_WIDTH, 36, COLORS.grayLight, COLORS.borderLight, 0.3);

        const infoFields = [
          { label: 'CLIENTE', value: data.customer },
          { label: 'SEASON', value: data.season },
          { label: 'STYLE', value: data.style },
          { label: 'COLORWAY', value: data.colorway },
          { label: 'P.O. #', value: data.po },
          { label: 'TEAM', value: data.nameTeam },
          { label: 'SAMPLE TYPE', value: data.sampleType },
          { label: 'GENDER', value: data.gender },
          { label: 'DESIGNER', value: data.designer, highlight: true },
          { label: 'DESARROLLADO POR', value: data.developedBy || data.sampleDevelopedBy }
        ];

        let rowY = y + 6;
        for (let i = 0; i < infoFields.length; i += 2) {
          const left = infoFields[i];
          const right = infoFields[i + 1];

          drawText(`${left.label}:`, MARGIN + 4, rowY, { size: 7, style: 'bold', color: COLORS.textMuted });
          drawText(String(left.value || '---'), MARGIN + 30, rowY, {
            size: 8,
            style: left.highlight ? 'bold' : 'normal',
            color: left.highlight ? COLORS.primary : COLORS.black
          });

          if (right) {
            drawText(`${right.label}:`, MARGIN + CONTENT_WIDTH / 2 + 2, rowY, { size: 7, style: 'bold', color: COLORS.textMuted });
            drawText(String(right.value || '---'), MARGIN + CONTENT_WIDTH / 2 + 30, rowY, {
              size: 8,
              style: right.highlight ? 'bold' : 'normal',
              color: right.highlight ? COLORS.primary : COLORS.black
            });
          }

          rowY += 7;
        }

        return y + 40;
      };

      const drawPlacementBlock = async (placement, y) => {
        const placementType = (placement.title || placement.type || `PLACEMENT`).toUpperCase();

        drawRect(MARGIN, y, CONTENT_WIDTH, 7, COLORS.primary);
        drawText(`PLACEMENT: ${placementType}`, MARGIN + 4, y + 4.8, { size: 10, style: 'bold', color: COLORS.white });
        y += 9;

        const colGap = 5;
        const colW = (CONTENT_WIDTH - colGap) / 2;
        const leftX = MARGIN;
        const rightX = MARGIN + colW + colGap;

        drawRect(leftX, y, colW, 56, [248, 248, 248], COLORS.borderLight, 0.4);
        drawRect(rightX, y, colW, 56, COLORS.grayLight, COLORS.borderLight, 0.4);

        drawRect(rightX, y, colW, 6.5, COLORS.primary);
        drawText('DETALLES TÉCNICOS', rightX + 3, y + 4.5, { size: 8, style: 'bold', color: COLORS.white });

        if (placement.imageData) {
          const processedImage = await processImage(placement.imageData);
          if (processedImage) {
            pdf.addImage(processedImage, 'JPEG', leftX + 2, y + 2, colW - 4, 52);
            drawRect(leftX + colW - 17, y + 2, 15, 5, COLORS.primary);
            drawText(placementType, leftX + colW - 9.5, y + 5.5, { size: 6, style: 'bold', color: COLORS.white, align: 'center' });
          } else {
            drawText('Imagen no disponible', leftX + colW / 2, y + 28, { size: 9, color: COLORS.textMuted, align: 'center' });
          }
        } else {
          drawText('Sin imagen de referencia', leftX + colW / 2, y + 28, { size: 9, color: COLORS.textMuted, align: 'center' });
        }

        const details = [
          { label: 'Tipo de Tinta', value: placement.inkType || 'WATER', highlight: true },
          { label: 'Dimensiones', value: `${placement.width || '--'}" x ${placement.height || '--'}"` },
          { label: 'Ubicación', value: placement.placementDetails || '---' },
          { label: 'Especialidades', value: placement.specialties || '—' }
        ];

        let dy = y + 12;
        details.forEach((d, idx) => {
          if (idx > 0) drawLine(rightX + 2, dy - 2.5, rightX + colW - 2, dy - 2.5, COLORS.borderLight, 0.2);
          drawText(String(d.label).toUpperCase(), rightX + 3, dy, { size: 6.5, style: 'bold', color: COLORS.textMuted });
          drawText(String(d.value), rightX + colW - 3, dy, { size: 8.5, style: d.highlight ? 'bold' : 'normal', color: d.highlight ? COLORS.primary : COLORS.black, align: 'right' });
          dy += 10;
        });

        y += 60;

        if (Array.isArray(placement.colors) && placement.colors.length > 0) {
          drawRect(MARGIN, y, CONTENT_WIDTH, 4.5, COLORS.grayDark);
          drawText('COLORES Y TINTAS', MARGIN + 3, y + 3.2, { size: 8, style: 'bold', color: COLORS.white });
          y += 7;

          const swW = 42;
          const swH = 11;
          const gap = 3;
          let sx = MARGIN;
          let sy = y;

          for (let i = 0; i < placement.colors.length; i++) {
            const colorItem = placement.colors[i];
            if (sx + swW > MARGIN + CONTENT_WIDTH) {
              sx = MARGIN;
              sy += swH + gap;
            }

            const colorHex = (window.Utils?.getColorHex?.(colorItem.val)) || '#999999';
            const rgb = hexToRgbForPDF(colorHex);
            drawRect(sx, sy, swW, swH, COLORS.grayLight, COLORS.borderLight, 0.3);
            drawRect(sx + 2, sy + 2, 7, 7, rgb, [255, 255, 255], 0.2);
            drawText(String(i + 1), sx + 12, sy + 5.2, { size: 7.5, style: 'bold', color: COLORS.primary });
            drawText(String(colorItem.val || 'N/A'), sx + 12, sy + 8.8, { size: 6.3, color: COLORS.black });

            sx += swW + gap;
          }

          y = sy + swH + 4;
        }

        const stationsData = generateStationsDataProfessional(placement);
        if (stationsData.length > 0) {
          drawRect(MARGIN, y, CONTENT_WIDTH, 6, COLORS.primary);
          drawText(`SECUENCIA DE IMPRESIÓN - ${placementType}`, MARGIN + 3, y + 4.2, { size: 8.3, style: 'bold', color: COLORS.white });
          y += 7.5;

          const headers = ['Est', 'Scr.', 'Screen (Tinta/Proceso)', 'Aditivos', 'Malla', 'Strokes', 'Angle', 'Pressure', 'Duro'];
          const colWidths = [9, 10, 43, 36, 13, 14, 12, 14, 11];
          const colX = [];
          let cx = MARGIN;
          colWidths.forEach((w) => { colX.push(cx); cx += w; });

          drawRect(MARGIN, y, CONTENT_WIDTH, 6, COLORS.grayDark);
          headers.forEach((h, i) => drawText(h, colX[i] + 1.5, y + 4, { size: 6, style: 'bold', color: COLORS.white }));
          y += 7;

          stationsData.forEach((row, idx) => {
            if (y > PAGE_HEIGHT - 50) {
              pdf.addPage();
              y = MARGIN + 8;
              drawRect(MARGIN, y, CONTENT_WIDTH, 6, COLORS.grayDark);
              headers.forEach((h, i) => drawText(h, colX[i] + 1.5, y + 4, { size: 6, style: 'bold', color: COLORS.white }));
              y += 7;
            }

            const isFlashCool = /FLASH|COOL/.test(String(row.screenCombined || '').toUpperCase());
            if (idx % 2 === 1 || isFlashCool) drawRect(MARGIN, y - 4.3, CONTENT_WIDTH, 5.8, COLORS.flashRow);

            drawText(String(row.st || ''), colX[0] + 4.5, y, { size: 7.2, style: 'bold', color: COLORS.primary, align: 'center' });
            drawText(String(row.screenLetter || ''), colX[1] + 1.5, y, { size: 7, style: 'bold', color: COLORS.primary });
            drawText(String(row.screenCombined || ''), colX[2] + 1.5, y, { size: 6.8, style: isFlashCool ? 'italic' : 'normal', color: isFlashCool ? COLORS.textMuted : COLORS.black });
            drawText(String(row.add || ''), colX[3] + 1.5, y, { size: 6.2, style: isFlashCool ? 'italic' : 'normal', color: isFlashCool ? COLORS.textMuted : COLORS.black });
            drawText(String(row.mesh || ''), colX[4] + 1.5, y, { size: 6.8, color: COLORS.black });
            drawText(String(row.strokes || ''), colX[5] + 7, y, { size: 6.8, color: COLORS.black, align: 'center' });
            drawText(String(row.angle || ''), colX[6] + 1.5, y, { size: 6.8, color: COLORS.black });
            drawText(String(row.pressure || ''), colX[7] + 6.5, y, { size: 6.8, color: COLORS.black, align: 'center' });
            drawText(String(row.duro || ''), colX[8] + 1.5, y, { size: 6.8, color: COLORS.black });

            y += 5.8;
          });

          y += 4;
        }

        if (y > PAGE_HEIGHT - 55) {
          pdf.addPage();
          y = MARGIN + 6;
        }

        drawRect(MARGIN, y, CONTENT_WIDTH, 4.5, COLORS.primary);
        drawText('CONDICIONES DE CURADO', MARGIN + 3, y + 3.2, { size: 8.5, style: 'bold', color: COLORS.white });
        y += 6;

        drawRect(MARGIN, y, CONTENT_WIDTH, 20, [240, 240, 240], COLORS.borderLight, 0.4);
        const itemW = CONTENT_WIDTH / 3;

        drawText('TEMPERATURA', MARGIN + itemW / 2, y + 6, { size: 6.5, style: 'bold', color: COLORS.textMuted, align: 'center' });
        drawText(String(placement.temp || '320°F'), MARGIN + itemW / 2, y + 14, { size: 12, style: 'bold', align: 'center' });

        drawText('TIEMPO', MARGIN + itemW * 1.5, y + 6, { size: 6.5, style: 'bold', color: COLORS.textMuted, align: 'center' });
        drawText(String(placement.time || '1:40 min'), MARGIN + itemW * 1.5, y + 14, { size: 12, style: 'bold', align: 'center' });

        drawText('TIPO DE TINTA', MARGIN + itemW * 2.5, y + 6, { size: 6.5, style: 'bold', color: COLORS.textMuted, align: 'center' });
        drawText(String(placement.inkType || 'WATER'), MARGIN + itemW * 2.5, y + 14, { size: 10, style: 'bold', color: COLORS.primary, align: 'center' });
        y += 24;

        const technicalComments = placement.technicalComments || placement.specialInstructions || data.technicalComments || 'Ningún comentario técnico registrado.';
        drawRect(MARGIN, y, CONTENT_WIDTH, 5, COLORS.yellow, [205, 155, 0], 0.5);
        drawText('TECHNICAL COMMENTS / COMENTARIOS TÉCNICOS', MARGIN + 3, y + 3.6, { size: 7.8, style: 'bold' });
        y += 6;

        drawRect(MARGIN, y, CONTENT_WIDTH, 16, [255, 253, 231], COLORS.yellow, 0.4);
        const commentLines = pdf.splitTextToSize(String(technicalComments), CONTENT_WIDTH - 6);
        drawText(commentLines, MARGIN + 3, y + 4.5, { size: 7.4 });

        return y + 20;
      };

      let y = drawHeader();
      y = drawGeneralInfo(y);

      if (Array.isArray(data.placements)) {
        for (let pIndex = 0; pIndex < data.placements.length; pIndex++) {
          if (y > PAGE_HEIGHT - 70) {
            pdf.addPage();
            y = drawHeader();
            y = drawGeneralInfo(y);
          }
          y = await drawPlacementBlock(data.placements[pIndex], y);
          y += 6;
        }
      }

      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        const footerY = PAGE_HEIGHT - 8;
        drawLine(MARGIN, footerY - 3.5, PAGE_WIDTH - MARGIN, footerY - 3.5, COLORS.borderLight, 0.4);
        const dateStr = new Date().toLocaleDateString('es-ES', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        drawText(`Generado: ${dateStr}`, MARGIN, footerY, { size: 6.5, color: COLORS.textMuted });
        drawText('TEGRA SPEC MANAGER', PAGE_WIDTH / 2, footerY, { size: 7, style: 'bold', color: COLORS.grayDark, align: 'center' });
        drawText(`Placement ${i} de ${totalPages}`, PAGE_WIDTH - MARGIN, footerY, { size: 6.5, color: COLORS.textMuted, align: 'right' });
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

function hexToRgbForPDF(hex) {
  const normalized = String(hex || '').trim().replace('#', '');
  const valid = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(valid)) return [153, 153, 153];

  return [
    parseInt(valid.slice(0, 2), 16),
    parseInt(valid.slice(2, 4), 16),
    parseInt(valid.slice(4, 6), 16)
  ];
}

window.generateProfessionalPDF = generateProfessionalPDF;
