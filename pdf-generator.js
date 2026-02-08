
// pdf-generator.js

// Objeto de configuración centralizado para el diseño del PDF, como sugeriste.
const CONFIG = {
    pageSize: 'letter',
    orientation: 'p',
    unit: 'mm',
    primaryColor: [0, 51, 153], // Azul TEGRA corporativo
    grayLight: [240, 240, 240],
    grayDark: [100, 100, 100],
    margin: 15,
    labelWidth: 35, // Ancho para etiquetas como "CLIENTE:"
    col2X: 115,     // Posición X de inicio para la segunda columna de datos
    // Coordenadas X fijas para la tabla de secuencia, para un control preciso
    tableCols: {
        est: 17,
        scr: 28,
        screen: 40,
        add: 105,
        mesh: 150,
        strokes: 165,
        angle: 178,
        pressure: 190,
        duro: 205
    }
};

window.PdfGenerator = {
  generate: async function(data, colorDatabases, options = {}) {
    return new Promise((resolve, reject) => {
        try {
            if (typeof window.jspdf === 'undefined') {
                throw new Error('jsPDF no está cargado.');
            }

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF(CONFIG.orientation, CONFIG.unit, CONFIG.pageSize);
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            let y = 20; // y inicial

            // --- Helpers ---
            const text = (str, x, y, size = 10, bold = false, color = [0,0,0]) => {
                pdf.setTextColor(...color);
                pdf.setFont('helvetica', bold ? 'bold' : 'normal');
                pdf.setFontSize(size);
                pdf.text(String(str || '---'), x, y);
            };

            const drawFooter = (pageIndex, totalPages) => {
                const footerY = pageH - 15;
                pdf.setDrawColor(220, 220, 220);
                pdf.line(CONFIG.margin, footerY - 2, pageW - CONFIG.margin, footerY - 2);
                text(`Generado: ${new Date().toLocaleString('es-ES')}`, CONFIG.margin, footerY, 8, false, CONFIG.grayDark);
                text(`Página ${pageIndex} de ${totalPages}`, pageW / 2, footerY, 8, false, CONFIG.grayDark, 'center');
                text('TEGRA Spec Manager', pageW - CONFIG.margin, footerY, 8, true, CONFIG.primaryColor, 'right');
            };
            
            // --- Cabecera ---
            pdf.setFillColor(...CONFIG.primaryColor);
            pdf.rect(0, 0, pageW, 18, 'F');
            text('TEGRA', CONFIG.margin, 12, 20, true, [255, 255, 255]);
            text('TECHNICAL SPECIFICATION', CONFIG.margin, 17, 10, false, [255, 255, 255]);
            const folderNum = data.folder || '#####';
            text('FOLDER', pageW - 40, 10, 8, false, [255, 255, 255], 'right');
            text(`#${folderNum}`, pageW - 40, 15, 16, true, [255, 255, 255], 'right');
            y = 30;

            // --- Información General (2 Columnas Manual) ---
            text('INFORMACIÓN GENERAL', CONFIG.margin, y - 4, 12, true, CONFIG.primaryColor);
            const genFields = [
                { l: 'CLIENTE:', v: data.customer }, { l: 'SEASON:', v: data.season },
                { l: 'STYLE:', v: data.style }, { l: 'COLORWAY:', v: data.colorway },
                { l: 'P.O. #:', v: data.po }, { l: 'TEAM:', v: data.nameTeam },
                { l: 'SAMPLE:', v: data.sampleType }, { l: 'GENDER:', v: data.gender },
            ];
            
            pdf.setFontSize(9);
            genFields.forEach((field, i) => {
                const xPos = (i % 2 === 0) ? CONFIG.margin : CONFIG.col2X;
                text(field.l, xPos, y, 9, true);
                text(field.v, xPos + 22, y, 9, false);
                if (i % 2 !== 0) y += 6;
            });

            y += 10; // Espacio después de la info general

            // --- Placements ---
            data.placements.forEach((placement, index) => {
                if (index > 0 && y > 40) { // Si no es el primero, añadir página
                    pdf.addPage();
                    y = 20;
                }

                if (y > pageH - 60) { // Salto de página si queda poco espacio
                    pdf.addPage(); y = 20;
                }

                // --- Título del Placement ---
                pdf.setFillColor(...CONFIG.grayLight);
                pdf.rect(CONFIG.margin, y, pageW - (CONFIG.margin * 2), 8, 'F');
                text(`PLACEMENT: ${placement.type.toUpperCase()}`, CONFIG.margin + 2, y + 5.5, 11, true, CONFIG.primaryColor);
                y += 12;
                
                // --- Detalles (Imagen, etc) ---
                // ... (se puede añadir la lógica de la imagen aquí si se desea)
                y += 10;

                // --- Tabla de Secuencia de Impresión (Manual) ---
                if (placement.stationsData && placement.stationsData.length > 0) {
                    text('SECUENCIA DE IMPRESIÓN', CONFIG.margin, y, 11, true, CONFIG.primaryColor);
                    y += 6;

                    // Encabezados
                    pdf.setFontSize(8);
                    text('Est', CONFIG.tableCols.est, y, 8, true);
                    text('Scr.', CONFIG.tableCols.scr, y, 8, true);
                    text('Screen (Tinta/Proceso)', CONFIG.tableCols.screen, y, 8, true);
                    text('Aditivos', CONFIG.tableCols.add, y, 8, true);
                    text('Malla', CONFIG.tableCols.mesh, y, 8, true);
                    text('Strokes', CONFIG.tableCols.strokes, y, 8, true);
                    text('Angle', CONFIG.tableCols.angle, y, 8, true);
                    text('Pressure', CONFIG.tableCols.pressure, y, 8, true);
                    pdf.setDrawColor(...CONFIG.grayDark).line(CONFIG.margin, y + 2, pageW - CONFIG.margin, y + 2);
                    y += 7;

                    // Filas
                    placement.stationsData.forEach(row => {
                        if (y > pageH - 30) { pdf.addPage(); y = 20; }

                        const isFlash = row.screenCombined.includes('FLASH') || row.screenCombined.includes('COOL');
                        if (isFlash) {
                            pdf.setFillColor(...CONFIG.grayLight);
                            pdf.rect(CONFIG.margin, y - 4, pageW - (CONFIG.margin * 2), 5, 'F');
                            text(row.screenCombined, CONFIG.tableCols.screen, y, 8, true, CONFIG.grayDark);
                            y += 6;
                            return; // Saltar al siguiente
                        }

                        pdf.setFontSize(8);
                        text(row.st, CONFIG.tableCols.est, y, 8, true);
                        text(row.screenLetter, CONFIG.tableCols.scr, y, 8, true, CONFIG.primaryColor);
                        
                        const screenText = pdf.splitTextToSize(row.screenCombined, 60);
                        const additivesText = pdf.splitTextToSize(row.add || 'N/A', 45);
                        
                        text(screenText, CONFIG.tableCols.screen, y, 8, false);
                        text(additivesText, CONFIG.tableCols.add, y, 8, false);
                        
                        text(row.mesh, CONFIG.tableCols.mesh, y, 8, false);
                        text(row.strokes, CONFIG.tableCols.strokes, y, 8, false);
                        text(row.angle, CONFIG.tableCols.angle, y, 8, false);
                        text(row.pressure, CONFIG.tableCols.pressure, y, 8, false);

                        // Incrementar 'y' basado en la línea más alta (tinta o aditivos)
                        const maxHeight = Math.max(screenText.length, additivesText.length);
                        y += (maxHeight * 4) + 2; // 4mm por línea + 2mm de espacio
                    });
                }
                 y += 10;
            });

            // --- Footer en todas las páginas ---
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                drawFooter(i, totalPages);
            }

            // --- Salida ---
            if (options.output === 'blob') {
                resolve(pdf.output('blob'));
            } else {
                const fileName = `TegraSpec_${data.style || 'Spec'}_${data.folder || '00000'}.pdf`;
                pdf.save(fileName);
                resolve();
            }

        } catch (error) {
            console.error("Error al generar PDF:", error);
            reject(error);
        }
    });
  }
};
