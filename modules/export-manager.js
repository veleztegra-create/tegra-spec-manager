/**
 * Export Manager - Gestiona todas las exportaciones (Excel, PDF, ZIP)
 */

export default class ExportManager {
  constructor() {
    this.initialize();
  }
  
  initialize() {
    // Hacer métodos disponibles globalmente
    window.exportManager = this;
  }
  
  exportToExcel() {
    try {
      if (typeof XLSX === 'undefined') {
        showStatus('❌ Error: Biblioteca Excel no cargada', 'error');
        return;
      }
      
      const data = {
        designer: document.getElementById('designer').value || '',
        customer: document.getElementById('customer').value || '',
        season: document.getElementById('season').value || '',
        folder: document.getElementById('folder-num').value || '',
        nameTeam: document.getElementById('name-team').value || '',
        colorway: document.getElementById('colorway').value || '',
        style: document.getElementById('style').value || ''
      };
      
      const wb = XLSX.utils.book_new();
      
      const headers = [
        'Area', 'Designer', 'Customer', 'Division', 'SEASON',
        '', '#Folder/SPEC', '', '', '', '', '', '', '', '', '', '', '', '',
        'TEAM', '', '', 'COLORWAY', '', 'PLACEMENTS', '', 'SPEC #', '#SCREEEN', 
        'NO. COLORES', 'Stations', 'setup', 'size', 'W', 'H', 'TYPE OF ART', 'INK TYPE'
      ];
      
      const rows = [];
      
      const placements = window.placements || [];
      
      if (placements && Array.isArray(placements) && placements.length > 0) {
        placements.forEach((placement, index) => {
          const placementType = this.getPlacementDisplayName(placement).toLowerCase();
          
          const screenCount = placement.colors ? placement.colors.length : 0;
          const colorCount = screenCount;
          const stationCount = colorCount > 0 ? (colorCount * 3 - 2) : 0;
          const artType = 'Vector';
          
          let inkType = 'WB MAGNA';
          if (placement.inkType === 'WATER') inkType = 'WB MAGNA';
          if (placement.inkType === 'PLASTISOL') inkType = 'PLASTISOL';
          if (placement.inkType === 'SILICONE') inkType = 'SILICONE';
          
          // Obtener dimensiones
          const width = placement.width || this.extractDimensions(placement.dimensions).width;
          const height = placement.height || this.extractDimensions(placement.dimensions).height;
          
          const row = [
            'Development',                            
            data.designer,                          
            data.customer,                          
            'NFL / jersey',                         
            data.season,                            
            '',                                     
            data.folder,                            
            '', '', '', '', '', '', '', '', '', '', '', '', '', 
            data.nameTeam,                          
            '', '',                                 
            data.colorway,                          
            '',                                     
            placementType,                          
            '',                                     
            `SPEC ${index + 1}`,  // SPEC consecutivo                   
            screenCount,                            
            colorCount,                             
            stationCount,                           
            1,                                      
            'L',                                    
            `${width}"`,  // Ancho real                      
            `${height}"`, // Alto real                       
            artType,                                
            inkType                                 
          ];
          
          rows.push(row);
        });
      } else {
        const defaultRow = [
          'Development',      
          data.designer,      
          data.customer,      
          'NFL / jersey',     
          data.season,        
          '',                 
          data.folder,        
          '', '', '', '', '', '', '', '', '', '', '', '', '', 
          data.nameTeam,      
          '', '',             
          data.colorway,      
          '',                 
          'front',            
          '',                 
          'SPEC 1',           
          0,                  
          0,                  
          0,                  
          1,                  
          'L',                
          '15.34"',           
          '12"',              
          'Vector',           
          'WB MAGNA'          
        ];
        
        rows.push(defaultRow);
      }
      
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      
      const colWidths = [];
      for (let i = 0; i < headers.length; i++) {
        if (i === 0) colWidths.push({ wch: 12 });
        else if (i === 1) colWidths.push({ wch: 12 });
        else if (i === 2) colWidths.push({ wch: 15 });
        else if (i === 3) colWidths.push({ wch: 15 });
        else if (i === 4) colWidths.push({ wch: 8 });
        else if (i === 6) colWidths.push({ wch: 12 });
        else if (i === 20) colWidths.push({ wch: 25 });
        else if (i === 23) colWidths.push({ wch: 15 });
        else if (i === 25) colWidths.push({ wch: 12 });
        else if (i === 27) colWidths.push({ wch: 8 });
        else if (i === 28) colWidths.push({ wch: 10 });
        else if (i === 29) colWidths.push({ wch: 12 });
        else if (i === 30) colWidths.push({ wch: 10 });
        else if (i === 34) colWidths.push({ wch: 10 });
        else if (i === 35) colWidths.push({ wch: 12 });
        else colWidths.push({ wch: 3 });
      }
      ws['!cols'] = colWidths;
      
      const headerRange = XLSX.utils.decode_range(ws['!ref']);
      for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[cellAddress]) continue;
        
        if (headers[C] && headers[C] !== '') {
          ws[cellAddress].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4472C4" } },
            alignment: { horizontal: "center", vertical: "center" }
          };
        }
      }
      
      XLSX.utils.book_append_sheet(wb, ws, 'Hoja1');
      
      const fileName = `Calculadora_${data.style || 'Spec'}_${data.folder || '00000'}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      showStatus('📊 Spec Excel generada correctamente', 'success');
      
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      showStatus('❌ Error al generar Spec Excel: ' + error.message, 'error');
    }
  }
  
  async exportPDF() {
    try {
      if (typeof window.jspdf === 'undefined') {
        showStatus('❌ jsPDF no está cargado', 'error');
        return;
      }

      showStatus('📄 Generando PDF...', 'warning');
      
      const pdfBlob = await this.generatePDFBlob();
      
      const style = document.getElementById('style').value || 'SinEstilo';
      const folderNum = document.getElementById('folder-num').value || '00000';
      const fileName = `TegraSpec_${style}_${folderNum}.pdf`;
      
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showStatus('✅ PDF generado correctamente', 'success');
      
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      showStatus('❌ Error al generar PDF: ' + error.message, 'error');
    }
  }
  
  async generatePDFBlob() {
    return new Promise(async (resolve, reject) => {
      try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'letter');
        
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const margin = 10;
        let y = margin;
        
        const primaryColor = [255, 82, 82];
        const accentColor = [255, 138, 128];
        const grayLight = [240, 240, 240];
        const grayDark = [100, 100, 100];
        
        // Función para verificar si necesitamos nueva página
        const checkPageBreak = (neededHeight) => {
          if (y + neededHeight > pageH - margin) {
            pdf.addPage();
            y = margin;
            return true;
          }
          return false;
        };
        
        // Función para agregar texto
        const addText = (str, x, yPos, size = 10, bold = false, color = [0, 0, 0], align = 'left', maxWidth = null) => {
          pdf.setTextColor(...color);
          pdf.setFontSize(size);
          pdf.setFont('helvetica', bold ? 'bold' : 'normal');
          const textStr = String(str || '');
          
          if (maxWidth) {
            const splitLines = pdf.splitTextToSize(textStr, maxWidth);
            pdf.text(splitLines, x, yPos, { align: align });
            return splitLines.length * (size * 0.35);
          } else {
            pdf.text(textStr, x, yPos, { align: align });
            return size * 0.35;
          }
        };
        
        // Función para dibujar rectángulo
        const drawRect = (x, yPos, width, height, fillColor = null, strokeColor = [0, 0, 0], lineWidth = 0.2) => {
          if (fillColor) {
            pdf.setFillColor(...fillColor);
            pdf.rect(x, yPos, width, height, 'F');
          }
          pdf.setDrawColor(...strokeColor);
          pdf.setLineWidth(lineWidth);
          pdf.rect(x, yPos, width, height);
          return height;
        };
        
        // ===== CABECERA =====
        pdf.setFillColor(...primaryColor);
        const headerHeight = 20;
        drawRect(0, 0, pageW, headerHeight, primaryColor);
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.setFont("helvetica", "bold");
        pdf.text("TEGRA", margin, 14);
        
        pdf.setFontSize(11);
        pdf.text("TECHNICAL SPEC MANAGER", margin, 20);
        
        const folderNum = document.getElementById('folder-num').value || '#####';
        pdf.setFontSize(8);
        pdf.text('FOLDER', pageW - margin, 14, { align: 'right' });
        pdf.setFontSize(16);
        pdf.text(`#${folderNum}`, pageW - margin, 20, { align: 'right' });
        
        y = 30;
        
        // ===== INFORMACIÓN GENERAL =====
        checkPageBreak(45);
        const infoHeight = 45;
        drawRect(margin, y, pageW - 2 * margin, infoHeight, [250, 250, 250], grayLight);
        addText('INFORMACIÓN GENERAL', margin + 5, y + 8, 12, true, primaryColor);
        
        const generalData = [
          { label: 'CLIENTE:', value: document.getElementById('customer').value || '---' },
          { label: 'STYLE:', value: document.getElementById('style').value || '---' },
          { label: 'COLORWAY:', value: document.getElementById('colorway').value || '---' },
          { label: 'SEASON:', value: document.getElementById('season').value || '---' },
          { label: 'PATTERN #:', value: document.getElementById('pattern').value || '---' },
          { label: 'P.O. #:', value: document.getElementById('po').value || '---' },
          { label: 'SAMPLE TYPE:', value: document.getElementById('sample-type').value || '---' },
          { label: 'TEAM:', value: document.getElementById('name-team').value || '---' },
          { label: 'GENDER:', value: document.getElementById('gender').value || '---' },
          { label: 'DESIGNER:', value: document.getElementById('designer').value || '---' }
        ];
        
        let infoY = y + 15;
        generalData.forEach((item, i) => {
          const xPos = i % 2 === 0 ? margin + 10 : margin + 110;
          addText(item.label, xPos, infoY, 9, true);
          addText(item.value, xPos + 25, infoY, 9, false);
          if (i % 2 !== 0) infoY += 6;
        });
        
        y += infoHeight + 10;
        
        // ===== PLACEMENTS =====
        const placementsToExport = window.placements || [];
        
        for (let pIndex = 0; pIndex < placementsToExport.length; pIndex++) {
          const placement = placementsToExport[pIndex];
          
          if (!placement) continue;
          
          if (pIndex > 0) {
            pdf.addPage();
            y = margin;
          }
          
          const displayType = this.getPlacementDisplayName(placement);
          
          // Header del placement
          checkPageBreak(15);
          pdf.setFillColor(...primaryColor);
          drawRect(margin, y, pageW - 2 * margin, 10, primaryColor, primaryColor, 0);
          addText(`PLACEMENT: ${displayType}`, margin + 5, y + 6, 11, true, [255, 255, 255]);
          y += 15;
          
          // Imagen del placement
          if (placement.imageData && placement.imageData.startsWith('data:')) {
            try {
              checkPageBreak(75);
              
              const imgHeight = 70;
              const imgWidth = 90;
              
              drawRect(margin + 5, y, imgWidth, imgHeight, [245, 245, 245], grayLight);
              
              pdf.addImage(placement.imageData, 'JPEG', margin + 7, y + 2, imgWidth - 4, imgHeight - 4);
              
              const detailsWidth = pageW - imgWidth - 3 * margin;
              const detailsX = margin + imgWidth + 10;
              
              drawRect(detailsX, y, detailsWidth, imgHeight, [250, 250, 250], grayLight);
              
              let detailY = y + 10;
              addText('DETALLES DEL PLACEMENT', detailsX + 5, detailY, 10, true, primaryColor);
              detailY += 8;
              
              const details = [
                `Tipo de tinta: ${placement.inkType || '---'}`,
                `Dimensiones: ${placement.width || '##'}" X ${placement.height || '##'}"`,
                `Ubicación: ${displayType || '---'}`,
                `Placement: ${placement.placementDetails || '---'}`,
                `Especialidades: ${placement.specialties || '---'}`
              ];
              
              details.forEach(detail => {
                addText(detail, detailsX + 5, detailY, 8);
                detailY += 5;
              });
              
              y += imgHeight + 12;
            } catch (e) {
              console.warn('No se pudo agregar imagen al PDF:', e);
              y += 10;
            }
          } else {
            y += 5;
          }
          
          // Colores del placement
          const uniqueColors = [];
          const seenColors = new Set();
          
          if (placement.colors && Array.isArray(placement.colors)) {
            placement.colors.forEach(color => {
              if (color && (color.type === 'COLOR' || color.type === 'METALLIC') && color.val) {
                const colorVal = color.val.toUpperCase().trim();
                if (colorVal && !seenColors.has(colorVal)) {
                  seenColors.add(colorVal);
                  uniqueColors.push({
                    val: colorVal,
                    screenLetter: color.screenLetter || ''
                  });
                }
              }
            });
            
            if (uniqueColors.length > 0) {
              checkPageBreak(40);
              
              const colorsHeight = 40;
              drawRect(margin, y, pageW - 2 * margin, colorsHeight, [250, 250, 250], grayLight);
              addText('COLORES Y TINTAS', margin + 5, y + 8, 11, true, primaryColor);
              
              let colorY = y + 15;
              let colorX = margin + 10;
              let colorsInRow = 0;
              
              uniqueColors.forEach((color) => {
                const colorHex = this.getColorHex(color.val) || '#cccccc';
                const rgb = this.hexToRgb(colorHex);
                
                pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
                pdf.rect(colorX, colorY, 8, 8, 'F');
                pdf.setDrawColor(0, 0, 0);
                pdf.setLineWidth(0.1);
                pdf.rect(colorX, colorY, 8, 8);
                
                addText(`${color.screenLetter}: ${color.val}`, colorX + 10, colorY + 5, 7);
                
                colorX += 70;
                colorsInRow++;
                
                if (colorsInRow >= 3 || colorX > pageW - 70) {
                  colorX = margin + 10;
                  colorY += 15;
                  colorsInRow = 0;
                }
              });
              
              y += colorsHeight + 10;
            }
          }
          
          // SECUENCIA DE IMPRESIÓN
          let stationsData = [];
          try {
            stationsData = window.updatePlacementStations ? window.updatePlacementStations(placement.id, true) : [];
          } catch (e) {
            console.warn('Error obteniendo stations data:', e);
          }
          
          if (stationsData.length > 0) {
            checkPageBreak(150);
            
            addText(`SECUENCIA DE IMPRESIÓN - ${displayType}`, margin, y, 12, true, primaryColor);
            y += 8;
            
            // Header de la tabla
            pdf.setFillColor(...primaryColor);
            const headerHeight = 8;
            drawRect(margin, y, pageW - 2 * margin, headerHeight, primaryColor, primaryColor, 0);
            
            const pdfHeaders = ['Est', 'Scr.', 'Screen (Tinta/Proceso)', 'Aditivos', 'Malla', 'Strokes', 'Angle', 'Pressure', 'Speed', 'Duro'];
            const pdfColW = [10, 12, 60, 55, 15, 15, 15, 15, 15, 15];
            let x = margin;
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            
            pdfHeaders.forEach((h, i) => {
              pdf.text(h, x + 2, y + 5);
              x += pdfColW[i];
            });
            
            y += headerHeight + 1;
            
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            
            let rowY = y;
            stationsData.forEach((row, idx) => {
              if (rowY > pageH - 20) {
                pdf.addPage();
                rowY = margin;
              }
              
              if (idx % 2 === 0 && row.screenCombined !== 'FLASH' && row.screenCombined !== 'COOL') {
                pdf.setFillColor(248, 248, 248);
                pdf.rect(margin, rowY - 3, pageW - 2 * margin, 6, 'F');
              }
              
              x = margin;
              const data = [
                row.st || '', 
                row.screenLetter || '', 
                row.screenCombined || '', 
                row.add || '', 
                row.mesh || '', 
                row.strokes || '',
                row.angle || '',
                row.pressure || '',
                row.speed || '',
                row.duro || ''
              ];
              
              data.forEach((d, i) => {
                let safeText = String(d || '');
                
                if (i === 3 && safeText.length > 35) {
                  safeText = safeText.substring(0, 22) + '...';
                }
                
                if (i === 1) {
                  pdf.setFont('helvetica', 'bold');
                  pdf.setTextColor(...primaryColor);
                }
                
                if (i === 3) {
                  pdf.setTextColor(...accentColor);
                  pdf.setFontSize(7);
                }
                
                pdf.text(safeText, x + 2, rowY);
                x += pdfColW[i];
                
                if (i === 1) pdf.setFont('helvetica', 'normal');
                if (i === 3) {
                  pdf.setTextColor(0, 0, 0);
                  pdf.setFontSize(8);
                }
              });
              
              rowY += 6;
            });
            
            y = rowY + 8;
          }
          
          // CONDICIONES DE CURADO
          checkPageBreak(25);
          
          const cureHeight = 25;
          pdf.setFillColor(245, 245, 245);
          drawRect(margin, y, pageW - 2 * margin, cureHeight, [245, 245, 245], grayLight);
          
          addText('CONDICIONES DE CURADO', margin + 5, y + 8, 10, true, primaryColor);
          
          const temp = placement.temp || '320 °F';
          const time = placement.time || '1:40 min';
          
          addText(`Temp: ${temp}`, margin + 10, y + 16, 9, true);
          addText(`Tiempo: ${time}`, margin + 50, y + 16, 9, true);
          addText(`Tinta: ${placement.inkType || 'WATER'}`, margin + 100, y + 16, 9, true);
          
          y += cureHeight + 10;
          
          // INSTRUCCIONES ESPECIALES
          if (placement.specialInstructions && placement.specialInstructions.trim()) {
            checkPageBreak(35);
            
            const instructionsHeight = 35;
            pdf.setFillColor(255, 253, 231);
            drawRect(margin, y, pageW - 2 * margin, instructionsHeight, [255, 253, 231], [255, 193, 7]);
            
            addText('INSTRUCCIONES ESPECIALES:', margin + 5, y + 8, 9, true, [255, 193, 7]);
            
            const instructions = placement.specialInstructions;
            const splitText = pdf.splitTextToSize(instructions, pageW - 2 * margin - 10);
            
            pdf.setFontSize(8);
            pdf.setTextColor(66, 66, 66);
            pdf.text(splitText, margin + 5, y + 15);
            
            y += instructionsHeight + 10;
          }
        }
        
        // FOOTER FINAL
        const footerY = pageH - 15;
        
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        
        const dateStr = new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        pdf.text(`Generado: ${dateStr}`, margin, footerY);
        
        if (placementsToExport.length > 0) {
          pdf.text(`Total de placements: ${placementsToExport.length}`, pageW / 2, footerY, { align: 'center' });
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...primaryColor);
        pdf.text('TEGRA Spec Manager', pageW - margin, footerY, { align: 'right' });
        
        const pdfBlob = pdf.output('blob');
        resolve(pdfBlob);
        
      } catch (error) {
        console.error('Error al generar PDF:', error);
        reject(error);
      }
    });
  }
  
  hexToRgb(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return [r, g, b];
  }
  
  getColorHex(colorName) {
    if (!colorName) return null;
    
    try {
      const name = colorName.toUpperCase().trim();
      
      // 1. Usar Utils si está disponible
      if (window.Utils && window.Utils.getColorHex) {
        return window.Utils.getColorHex(colorName);
      }
      
      // 2. Verificar si Config está disponible
      if (!window.Config || !window.Config.COLOR_DATABASES) {
        // Fallback a colores básicos
        return this.getBasicColorHex(name);
      }
      
      // 3. Buscar en todas las bases de datos
      for (const db of Object.values(window.Config.COLOR_DATABASES)) {
        for (const [key, data] of Object.entries(db)) {
          if (key && data && data.hex) {
            if (name === key.toUpperCase() || 
                name.includes(key.toUpperCase()) || 
                key.toUpperCase().includes(name)) {
              return data.hex;
            }
          }
        }
      }
      
      // 4. Buscar código hex directo
      const hexMatch = name.match(/#([0-9A-F]{6})/i);
      if (hexMatch) {
        return `#${hexMatch[1]}`;
      }
      
      // 5. Último recurso: colores básicos
      return this.getBasicColorHex(name);
      
    } catch (error) {
      console.warn('Error en getColorHex:', error);
      return null;
    }
  }
  
  getBasicColorHex(colorName) {
    const basicColors = {
      'RED': '#FF0000',
      'GREEN': '#00FF00',
      'BLUE': '#0000FF',
      'BLACK': '#000000',
      'WHITE': '#FFFFFF',
      'YELLOW': '#FFFF00',
      'PURPLE': '#800080',
      'ORANGE': '#FFA500',
      'GRAY': '#808080',
      'GREY': '#808080',
      'GOLD': '#FFD700',
      'SILVER': '#C0C0C0',
      'BROWN': '#A52A2A',
      'PINK': '#FFC0CB',
      'CYAN': '#00FFFF',
      'MAGENTA': '#FF00FF',
      'MAROON': '#800000',
      'OLIVE': '#808000',
      'NAVY': '#000080',
      'TEAL': '#008080',
      'LIME': '#00FF00',
      'AQUA': '#00FFFF',
      'FUCHSIA': '#FF00FF'
    };
    
    if (basicColors[colorName]) {
      return basicColors[colorName];
    }
    
    // Buscar coincidencia parcial
    for (const [color, hex] of Object.entries(basicColors)) {
      if (colorName.includes(color) || color.includes(colorName)) {
        return hex;
      }
    }
    
    return null;
  }
  
  getPlacementDisplayName(placement) {
    if (!placement) return 'N/A';
    
    if (placement.type && placement.type.includes('CUSTOM:')) {
      return placement.type.replace('CUSTOM: ', '');
    }
    
    return placement.type || placement.name || 'N/A';
  }
  
  extractDimensions(dimensionsText) {
    if (!dimensionsText) return { width: '15.34', height: '12' };
    
    const patterns = [
      /SIZE:\s*\(W\)\s*([\d\.]+)\s*["']?\s*X\s*\(H\)\s*([\d\.]+)/i,
      /([\d\.]+)\s*["']?\s*[xX×]\s*([\d\.]+)/,
      /W\s*:\s*([\d\.]+).*H\s*:\s*([\d\.]+)/i,
      /ANCHO\s*:\s*([\d\.]+).*ALTO\s*:\s*([\d\.]+)/i,
      /(\d+)\s*["']?\s*[xX]\s*(\d+)/
    ];
    
    for (const pattern of patterns) {
      const match = dimensionsText.match(pattern);
      if (match) {
        return {
          width: match[1],
          height: match[2]
        };
      }
    }
    
    return { width: '15.34', height: '12' };
  }
  
  async downloadProjectZip() {
    try {
      if (typeof JSZip === 'undefined') {
        showStatus('❌ Error: La biblioteca JSZip no está cargada', 'error');
        return;
      }

      const style = document.getElementById('style').value || 'SinEstilo';
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const projectName = `TegraSpec_${style}_${timestamp}`;
      
      const zip = new JSZip();
      
      // Obtener datos actuales
      const layoutManager = window.layoutManager;
      const jsonData = layoutManager ? layoutManager.collectData() : {};
      zip.file(`${projectName}.json`, JSON.stringify(jsonData, null, 2));
      
      try {
        const pdfBlob = await this.generatePDFBlob();
        zip.file(`${projectName}.pdf`, pdfBlob);
      } catch (pdfError) {
        console.warn('No se pudo generar PDF para ZIP:', pdfError);
        zip.file(`${projectName}_PDF_ERROR.txt`, 'No se pudo generar el archivo PDF');
      }
      
      const placements = window.placements || [];
      placements.forEach((placement, index) => {
        if (placement.imageData && placement.imageData.startsWith('data:')) {
          try {
            const imageBlob = this.dataURLToBlob(placement.imageData);
            const displayType = this.getPlacementDisplayName(placement);
            zip.file(`${projectName}_placement${index + 1}_${displayType}.jpg`, imageBlob);
          } catch (imgError) {
            console.warn(`No se pudo procesar imagen para placement ${placement.type}:`, imgError);
          }
        }
      });
      
      const readmeContent = `PROYECTO TEGRA SPEC MANAGER ================================

Archivos incluidos:
- ${projectName}.json: Datos de la especificación técnica
- ${projectName}.pdf: Documento PDF listo para imprimir
${placements.some(p => p.imageData) ? `- Imágenes de placements: ${placements.filter(p => p.imageData).length} archivo(s) de imagen` : ''}

Total de Placements: ${placements.length}
Generado: ${new Date().toLocaleString('es-ES')}
Cliente: ${document.getElementById('customer').value || 'N/A'}
Estilo: ${document.getElementById('style').value || 'N/A'}

Para cargar este proyecto:
1. Descomprime el archivo ZIP
2. En Tegra Spec Manager, ve a "Crear Spec"
3. Haz clic en "Cargar Spec" y selecciona el archivo .json
4. Las imágenes de placements se cargarán automáticamente

Placements incluidos: ${placements.map(p => this.getPlacementDisplayName(p)).join(', ')}`;
      
      zip.file('LEEME.txt', readmeContent);
      
      showStatus('📦 Generando archivo ZIP...', 'warning');
      
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });
      
      saveAs(zipBlob, `${projectName}.zip`);
      
      showStatus('📦 Proyecto ZIP descargado correctamente');
      
    } catch (error) {
      console.error('Error al generar ZIP:', error);
      showStatus('❌ Error al generar proyecto ZIP: ' + error.message, 'error');
    }
  }
  
  dataURLToBlob(dataURL) {
    try {
      if (!dataURL.startsWith('data:')) {
        throw new Error('No es una data URL válida');
      }
      
      const arr = dataURL.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      
      if (!mimeMatch) {
        throw new Error('No se pudo determinar el tipo MIME');
      }
      
      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      
      return new Blob([u8arr], { type: mime });
    } catch (error) {
      console.error('Error en dataURLToBlob:', error);
      throw error;
    }
  }
}
