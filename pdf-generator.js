
function hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return [204, 204, 204]; // default to gray
    hex = hex.replace('#', '');
    if (hex.length !== 6) return [204, 204, 204];
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return [r, g, b];
}

function getColorHex(colorName, colorDatabases) {
    if (!colorName) return '#cccccc';
    const name = colorName.toUpperCase().trim();

    if (colorDatabases) {
        for (const db of Object.values(colorDatabases)) {
            for (const [key, data] of Object.entries(db)) {
                const keyUpper = key.toUpperCase();
                if (name === keyUpper || name.includes(keyUpper) || keyUpper.includes(name)) {
                    if (data && data.hex) return data.hex;
                }
            }
        }
    }

    const hexMatch = name.match(/#([0-9A-F]{6})/i);
    if (hexMatch) return `#${hexMatch[1]}`;

    return '#cccccc';
}

window.PdfGenerator = {
  generate: async function(data, colorDatabases) {
    try {
      if (typeof window.jspdf === 'undefined' || typeof window.jspdf.autoTable === 'undefined') {
        throw new Error('jsPDF o jsPDF-AutoTable no están cargados.');
      }

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'letter');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      let y = 18;

      const primaryColor = [255, 82, 82];
      const grayLight = [240, 240, 240];
      const grayDark = [100, 100, 100];

      const text = (str, x, y, size = 10, bold = false, color = [0, 0, 0], align = 'left') => {
        pdf.setTextColor(...color);
        pdf.setFont('helvetica', bold ? 'bold' : 'normal');
        pdf.setFontSize(size);
        pdf.text(String(str || '---'), x, y, { align });
      };

      const drawFooter = (pageIndex, totalPages) => {
          const footerY = pageH - 15;
          pdf.setDrawColor(220, 220, 220);
          pdf.line(10, footerY - 2, pageW - 10, footerY - 2);
          text(`Generado: ${new Date().toLocaleString('es-ES')}`, 10, footerY, 8, false, grayDark);
          text(`Página ${pageIndex} de ${totalPages}`, pageW / 2, footerY, 8, false, grayDark, 'center');
          text('TEGRA Spec Manager', pageW - 10, footerY, 8, true, primaryColor, 'right');
      };

      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, pageW, 18, 'F');
      text('TEGRA', 15, 12, 20, true, [255, 255, 255]);
      text('TECHNICAL SPECIFICATION', 15, 17, 10, false, [255, 255, 255]);
      const folderNum = data.folder || '#####';
      text('FOLDER', pageW - 25, 10, 8, false, [255, 255, 255], 'right');
      text(`#${folderNum}`, pageW - 25, 15, 16, true, [255, 255, 255], 'right');

      y = 30;
      text('INFORMACIÓN GENERAL', 10, y - 4, 12, true, primaryColor);
      
      const generalInfoBody = [
        [{ content: 'CLIENTE:', styles: { fontStyle: 'bold' } }, data.customer, { content: 'SEASON:', styles: { fontStyle: 'bold' } }, data.season],
        [{ content: 'STYLE:', styles: { fontStyle: 'bold' } }, data.style, { content: 'COLORWAY:', styles: { fontStyle: 'bold' } }, data.colorway],
        [{ content: 'P.O. #:', styles: { fontStyle: 'bold' } }, data.po, { content: 'TEAM:', styles: { fontStyle: 'bold' } }, data.nameTeam],
        [{ content: 'SAMPLE:', styles: { fontStyle: 'bold' } }, data.sampleType, { content: 'GENDER:', styles: { fontStyle: 'bold' } }, data.gender],
      ];

      pdf.autoTable({
        startY: y,
        body: generalInfoBody,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 0: { cellWidth: 25 }, 2: { cellWidth: 25 } },
        margin: { left: 10, right: 10 }
      });

      y = pdf.autoTable.previous.finalY + 8;

      data.placements.forEach((placement, index) => {
          if (index > 0) pdf.addPage();
          y = index === 0 ? y : 25;

          const displayType = placement.type.includes('CUSTOM:') ? placement.type.replace('CUSTOM: ', '') : placement.type;
          pdf.setFillColor(...primaryColor);
          pdf.rect(10, y, pageW - 20, 8, 'F');
          text(`PLACEMENT: ${displayType}`, 15, y + 5.5, 11, true, [255, 255, 255]);
          y += 12;

          if (placement.imageData && placement.imageData.startsWith('data:')) {
              const imgH = 60, imgW = 85;
              try {
                  pdf.addImage(placement.imageData, 'JPEG', 15, y, imgW, imgH);
              } catch (e) {
                  console.warn('Error adding image to PDF:', e);
                  text('Error al cargar imagen', 15, y + 30);
              }
              
              const detailsTableBody = [
                [{ content: 'Tinta:', styles: { fontStyle: 'bold' } }, placement.inkType || '---'],
                [{ content: 'Dimensiones:', styles: { fontStyle: 'bold' } }, `${placement.width || '##'}" X ${placement.height || '##'}"`],
                [{ content: 'Ubicación:', styles: { fontStyle: 'bold' } }, placement.placementDetails || '---'],
                [{ content: 'Especialidades:', styles: { fontStyle: 'bold' } }, placement.specialties || '---'],
              ];
              pdf.autoTable({
                  startY: y - 1, body: detailsTableBody, theme: 'plain',
                  styles: { fontSize: 8, cellPadding: 1.5 }, margin: { left: 105 }
              });
              y += imgH + 5;
          }

          if (placement.stationsData && placement.stationsData.length > 0) {
              text(`SECUENCIA DE IMPRESIÓN - ${displayType}`, 10, y, 12, true, primaryColor);
              y += 5;

              const head = [['Est', 'Scr.', 'Screen (Tinta/Proceso)', 'Aditivos', 'Malla', 'Strokes', 'Angle', 'Pressure', 'Speed', 'Duro']];
              const body = placement.stationsData.map(r => [r.st,r.screenLetter,r.screenCombined,r.add,r.mesh,r.strokes,r.angle,r.pressure,r.speed,r.duro]);

              pdf.autoTable({
                  startY: y, head: head, body: body, theme: 'grid',
                  headStyles: { fillColor: primaryColor, textColor: [255,255,255], fontSize: 8, fontStyle: 'bold', cellPadding: 1.5 },
                  styles: { fontSize: 7, cellPadding: 1 },
                  columnStyles: {
                      0: { cellWidth: 8 }, 1: { cellWidth: 10, fontStyle: 'bold' },
                      2: { cellWidth: 40 }, 3: { cellWidth: 40, fontSize: 6.5 },
                      4: { cellWidth: 13 }, 5: { cellWidth: 13 }, 6: { cellWidth: 12 },
                      7: { cellWidth: 15 }, 8: { cellWidth: 12 }, 9: { cellWidth: 10 },
                  },
                  margin: { left: 10, right: 10 },
                  didDrawCell: (d) => {
                      if (d.section === 'body' && (d.cell.raw.includes('FLASH') || d.cell.raw.includes('COOL'))) {
                          pdf.setFillColor(...grayLight);
                          pdf.rect(d.cell.x, d.cell.y, d.cell.width, d.cell.height, 'F');
                          pdf.setTextColor(...grayDark); pdf.setFont('helvetica', 'bold');
                          pdf.text(d.cell.text, d.cell.x + d.cell.padding('left'), d.cell.y + d.cell.height / 2, { baseline: 'middle' });
                      }
                  }
              });
              y = pdf.autoTable.previous.finalY + 8;
          }
          
          const temp = placement.temp || '---';
          const time = placement.time || '---';
          const cureTable = { startY: y, theme: 'grid', styles: { fontSize: 9, cellPadding: 2 }, 
                              body: [[{content: 'CONDICIONES DE CURADO', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold', fillColor: grayLight }}],
                                    [{content: 'Temp:', styles:{fontStyle:'bold'}}, temp, {content: 'Tiempo:', styles:{fontStyle:'bold'}}, time]]};
          pdf.autoTable(cureTable);
          y = pdf.autoTable.previous.finalY + 5;

          if (placement.specialInstructions) {
              y += 2;
              text('INSTRUCCIONES ESPECIALES:', 10, y, 10, true, primaryColor);
              pdf.setFontSize(9).setTextColor(...grayDark).text(pdf.splitTextToSize(placement.specialInstructions, pageW - 20), 10, y + 5);
          }
      });

      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          drawFooter(i, totalPages);
      }

      const fileName = `TegraSpec_${data.style || 'Spec'}_${data.folder || '00000'}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error("Error al generar PDF:", error);
      // Aquí se podría llamar a una función de notificación
    }
  }
};
