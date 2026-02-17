
# Actualizar el pdf-generator-mejorado.js con los 3 campos faltantes

pdf_generator_actualizado = '''// pdf-generator-mejorado.js
// Nueva función de generación de PDF con diseño profesional Tegra
// Incluye: Designer, Sample Developed By, y Technical Comments

/**
 * Función mejorada para generar PDF profesional
 * NO MODIFICA ninguna lógica de tu aplicación, solo el formato visual del PDF
 * 
 * @param {Object} data - Objeto con todos los datos del spec (misma estructura que usas actualmente)
 * @returns {Promise<Blob>} - Blob del PDF generado
 */
async function generateProfessionalPDF(data) {
    return new Promise(async (resolve, reject) => {
        try {
            if (typeof window.jspdf === 'undefined') {
                throw new Error('jsPDF no está cargado. Asegúrate de incluir la librería.');
            }

            const { jsPDF } = window.jspdf;
            
            // Configuración de página (carta)
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'letter'
            });
            
            // ========== CONSTANTES DE DISEÑO TEGRA ==========
            const COLORS = {
                primary: [227, 24, 55],      // #E31837 - Rojo Tegra
                primaryDark: [139, 0, 0],    // #8B0000 - Rojo oscuro
                black: [26, 26, 26],         // #1A1A1A - Negro
                grayDark: [45, 45, 45],      // #2D2D2D - Gris oscuro
                grayMedium: [128, 128, 128], // #808080
                grayLight: [245, 245, 245],  // #F5F5F5 - Gris claro
                white: [255, 255, 255],
                textMuted: [102, 102, 102],  // #666666
                yellow: [255, 193, 7]        // Para comentarios técnicos
            };
            
            const FONTS = {
                display: 'helvetica',
                body: 'helvetica',
                condensed: 'helvetica'
            };
            
            const MARGIN = 15;
            const PAGE_WIDTH = pdf.internal.pageSize.getWidth();
            const PAGE_HEIGHT = pdf.internal.pageSize.getHeight();
            
            // ========== HELPERS DE DIBUJO ==========
            
            const drawText = (text, x, y, options = {}) => {
                const {
                    size = 10,
                    font = 'helvetica',
                    style = 'normal',
                    color = COLORS.black,
                    align = 'left'
                } = options;
                
                pdf.setFont(font, style);
                pdf.setFontSize(size);
                pdf.setTextColor(...color);
                pdf.text(String(text || ''), x, y, { align });
            };
            
            const drawRect = (x, y, width, height, fillColor = null, strokeColor = null, lineWidth = 0.2) => {
                if (fillColor) {
                    pdf.setFillColor(...fillColor);
                    pdf.rect(x, y, width, height, 'F');
                }
                if (strokeColor) {
                    pdf.setDrawColor(...strokeColor);
                    pdf.setLineWidth(lineWidth);
                    pdf.rect(x, y, width, height);
                }
            };
            
            const drawLine = (x1, y1, x2, y2, color = COLORS.grayLight, width = 0.3) => {
                pdf.setDrawColor(...color);
                pdf.setLineWidth(width);
                pdf.line(x1, y1, x2, y2);
            };
            
            const processImage = async (imageData) => {
                if (!imageData || !imageData.startsWith('data:')) return null;
                
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        resolve(canvas.toDataURL('image/jpeg', 0.9));
                    };
                    img.onerror = () => resolve(null);
                    img.src = imageData;
                });
            };
            
            // ========== HEADER PROFESIONAL (4 COLUMNAS) ==========
            let y = 0;
            
            // Fondo gradiente rojo
            drawRect(0, 0, PAGE_WIDTH, 28, COLORS.primary);
            drawRect(0, 0, PAGE_WIDTH, 3, COLORS.primaryDark);
            
            // Línea decorativa diagonal sutil
            pdf.setDrawColor(255, 255, 255);
            pdf.setLineWidth(0.5);
            pdf.setLineDashPattern([2, 2], 0);
            pdf.line(PAGE_WIDTH - 80, 0, PAGE_WIDTH, 28);
            pdf.setLineDashPattern([], 0);
            
            // Columna 1: Logo Tegra
            pdf.setFont(FONTS.display, 'bold');
            pdf.setFontSize(26);
            pdf.setTextColor(...COLORS.white);
            pdf.text('TEGRA', MARGIN, 18);
            
            pdf.setFontSize(8);
            pdf.setFont(FONTS.body, 'normal');
            pdf.text('Technical Spec Manager', MARGIN, 24);
            
            // Columna 2: Título central
            pdf.setFont(FONTS.display, 'bold');
            pdf.setFontSize(18);
            pdf.text('SPECIFICATION', PAGE_WIDTH / 2, 16, { align: 'center' });
            
            pdf.setFontSize(7);
            pdf.setFont(FONTS.body, 'normal');
            pdf.text('Sistema de gestión de especificaciones técnicas', PAGE_WIDTH / 2, 22, { align: 'center' });
            
            // Columna 3: Customer Box
            const customerBoxX = PAGE_WIDTH - 135;
            drawRect(customerBoxX, 4, 80, 20, [0, 0, 0, 0.15], COLORS.white, 0.5);
            
            pdf.setFontSize(6);
            pdf.setFont(FONTS.condensed, 'bold');
            pdf.setTextColor(...COLORS.white);
            pdf.text('CUSTOMER / CLIENTE', customerBoxX + 40, 10, { align: 'center' });
            
            const customerName = (data.customer || '').toUpperCase();
            pdf.setFontSize(11);
            pdf.setFont(FONTS.display, 'bold');
            pdf.text(customerName || 'N/A', customerBoxX + 40, 19, { align: 'center' });
            
            // Columna 4: Folder Number
            pdf.setFontSize(6);
            pdf.setFont(FONTS.condensed, 'normal');
            pdf.text('# FOLDER', PAGE_WIDTH - MARGIN, 10, { align: 'right' });
            
            pdf.setFontSize(22);
            pdf.setFont(FONTS.display, 'bold');
            pdf.text(String(data.folder || '#####'), PAGE_WIDTH - MARGIN, 22, { align: 'right' });
            
            y = 35;
            
            // ========== INFORMACIÓN GENERAL ==========
            
            drawText('INFORMACIÓN GENERAL', MARGIN, y, {
                size: 12,
                style: 'bold',
                color: COLORS.primary
            });
            
            // Barra decorativa roja
            drawRect(MARGIN, y + 2, 4, 18, COLORS.primary);
            
            y += 8;
            
            // Campos de información general (ahora incluye DESIGNER)
            const infoFields = [
                { label: 'CLIENTE:', value: data.customer },
                { label: 'SEASON:', value: data.season },
                { label: 'STYLE:', value: data.style },
                { label: 'COLORWAY:', value: data.colorway },
                { label: 'P.O. #:', value: data.po },
                { label: 'TEAM:', value: data.nameTeam },
                { label: 'SAMPLE TYPE:', value: data.sampleType },
                { label: 'GENDER:', value: data.gender },
                { label: 'DESIGNER:', value: data.designer, highlight: true },  // ← NUEVO CAMPO
                { label: 'DESARROLLADO POR:', value: data.developedBy || data.sampleDevelopedBy }  // ← NUEVO CAMPO
            ];
            
            // Calcular altura necesaria
            let maxLines = 0;
            infoFields.forEach(field => {
                const lines = pdf.splitTextToSize(String(field.value || '---'), 50);
                maxLines = Math.max(maxLines, lines.length);
            });
            
            const rowHeight = 6.5;
            const sectionHeight = Math.max(45, ((infoFields.length / 2) * rowHeight) + 15);
            
            drawRect(MARGIN, y, PAGE_WIDTH - (MARGIN * 2), sectionHeight, COLORS.grayLight);
            
            // Dibujar campos en 2 columnas
            pdf.setFontSize(9);
            let fieldY = y + 10;
            let colCount = 0;
            
            for (let i = 0; i < infoFields.length; i += 2) {
                const leftField = infoFields[i];
                const rightField = infoFields[i + 1];
                
                // Verificar si hay espacio suficiente
                if (fieldY > y + sectionHeight - 10) break;
                
                // Columna izquierda
                pdf.setFont(FONTS.condensed, 'bold');
                pdf.setFontSize(8);
                pdf.setTextColor(...COLORS.textMuted);
                pdf.text(leftField.label, MARGIN + 8, fieldY);
                
                const leftValue = pdf.splitTextToSize(String(leftField.value || '---'), 48);
                pdf.setFont(FONTS.body, leftField.highlight ? 'bold' : 'normal');
                pdf.setFontSize(9);
                pdf.setTextColor(...(leftField.highlight ? COLORS.primary : COLORS.black));
                pdf.text(leftValue, MARGIN + 35, fieldY);
                
                // Columna derecha (si existe)
                if (rightField) {
                    const col2X = PAGE_WIDTH / 2 + 5;
                    pdf.setFont(FONTS.condensed, 'bold');
                    pdf.setFontSize(8);
                    pdf.setTextColor(...COLORS.textMuted);
                    pdf.text(rightField.label, col2X + 3, fieldY);
                    
                    const rightValue = pdf.splitTextToSize(String(rightField.value || '---'), 48);
                    pdf.setFont(FONTS.body, rightField.highlight ? 'bold' : 'normal');
                    pdf.setFontSize(9);
                    pdf.setTextColor(...(rightField.highlight ? COLORS.primary : COLORS.black));
                    pdf.text(rightValue, col2X + 38, fieldY);
                }
                
                fieldY += 8;
            }
            
            y += sectionHeight + 8;
            
            // ========== PLACEMENTS ==========
            
            if (data.placements && Array.isArray(data.placements)) {
                for (let pIndex = 0; pIndex < data.placements.length; pIndex++) {
                    const placement = data.placements[pIndex];
                    
                    // Nueva página si es necesario
                    if (pIndex > 0 && y > PAGE_HEIGHT - 100) {
                        pdf.addPage();
                        y = 20;
                    }
                    
                    // Header del placement
                    const placementType = (placement.type || 'PLACEMENT').toUpperCase();
                    drawRect(MARGIN, y, PAGE_WIDTH - (MARGIN * 2), 12, COLORS.primary);
                    
                    // Icono simulado
                    pdf.setFillColor(255, 255, 255);
                    pdf.circle(MARGIN + 8, y + 6, 3, 'F');
                    
                    pdf.setTextColor(...COLORS.white);
                    pdf.setFont(FONTS.display, 'bold');
                    pdf.setFontSize(13);
                    pdf.text(`PLACEMENT: ${placementType}`, MARGIN + 15, y + 8);
                    
                    y += 18;
                    
                    // Contenido del placement (2 columnas)
                    const col1Width = (PAGE_WIDTH - (MARGIN * 2) - 10) / 2;
                    const col2X = MARGIN + col1Width + 10;
                    
                    // Calcular altura máxima
                    let contentHeight = 70;
                    
                    // Columna 1: Imagen
                    if (placement.imageData) {
                        try {
                            const processedImage = await processImage(placement.imageData);
                            if (processedImage) {
                                const imgHeight = 65;
                                drawRect(MARGIN, y, col1Width, imgHeight + 4, [230, 230, 230], [200, 200, 200]);
                                pdf.addImage(processedImage, 'JPEG', MARGIN + 2, y + 2, col1Width - 4, imgHeight);
                                contentHeight = Math.max(contentHeight, imgHeight + 10);
                            }
                        } catch (e) {
                            drawRect(MARGIN, y, col1Width, 60, COLORS.grayLight);
                            pdf.setTextColor(...COLORS.textMuted);
                            pdf.setFontSize(10);
                            pdf.text('Imagen no disponible', MARGIN + col1Width/2, y + 30, { align: 'center' });
                        }
                    } else {
                        drawRect(MARGIN, y, col1Width, 60, COLORS.grayLight, [180, 180, 180], 0.5);
                        pdf.setTextColor(...COLORS.textMuted);
                        pdf.setFontSize(10);
                        pdf.text('Sin imagen de referencia', MARGIN + col1Width/2, y + 30, { align: 'center' });
                        pdf.setFontSize(8);
                        pdf.text('Arrastra o pega una imagen aquí', MARGIN + col1Width/2, y + 38, { align: 'center' });
                    }
                    
                    // Badge de tipo
                    pdf.setFillColor(...COLORS.primary);
                    pdf.rect(MARGIN + 5, y + 5, 25, 8, 'F');
                    pdf.setTextColor(...COLORS.white);
                    pdf.setFontSize(7);
                    pdf.setFont(FONTS.condensed, 'bold');
                    pdf.text(placementType.substring(0, 8), MARGIN + 17.5, y + 10, { align: 'center' });
                    
                    // Columna 2: Detalles técnicos
                    const details = [
                        { label: 'Tipo de Tinta', value: placement.inkType || 'WATER', highlight: true },
                        { label: 'Dimensiones (W x H)', value: `${placement.width || '##'}\" x ${placement.height || '##'}\"` },
                        { label: 'Ubicación', value: placement.placementDetails || '---' },
                        { label: 'Especialidades', value: placement.specialties || 'Ninguna' }
                    ];
                    
                    let detailY = y;
                    const detailBoxHeight = contentHeight;
                    drawRect(col2X, y, col1Width, detailBoxHeight, COLORS.grayLight, COLORS.primary, 1);
                    
                    // Título del panel
                    pdf.setFillColor(...COLORS.primary);
                    pdf.rect(col2X, y, col1Width, 8, 'F');
                    pdf.setTextColor(...COLORS.white);
                    pdf.setFont(FONTS.condensed, 'bold');
                    pdf.setFontSize(9);
                    pdf.text('DETALLES TÉCNICOS', col2X + 5, y + 5.5);
                    
                    detailY += 15;
                    
                    details.forEach(detail => {
                        pdf.setFont(FONTS.condensed, 'bold');
                        pdf.setFontSize(7);
                        pdf.setTextColor(...COLORS.textMuted);
                        pdf.text(detail.label.toUpperCase(), col2X + 5, detailY);
                        
                        const valueLines = pdf.splitTextToSize(String(detail.value), col1Width - 12);
                        pdf.setFont(FONTS.body, detail.highlight ? 'bold' : 'normal');
                        pdf.setFontSize(10);
                        pdf.setTextColor(...(detail.highlight ? COLORS.primary : COLORS.black));
                        pdf.text(valueLines, col2X + 5, detailY + 5);
                        
                        detailY += 14;
                    });
                    
                    y += Math.max(75, detailBoxHeight) + 12;
                    
                    // ========== COLORES Y TINTAS ==========
                    
                    if (placement.colors && placement.colors.length > 0) {
                        const uniqueColors = [];
                        const seen = new Set();
                        
                        placement.colors.forEach(color => {
                            if (color.type === 'COLOR' || color.type === 'METALLIC') {
                                const key = `${color.screenLetter}-${color.val}`;
                                if (!seen.has(key)) {
                                    seen.add(key);
                                    uniqueColors.push(color);
                                }
                            }
                        });
                        
                        if (uniqueColors.length > 0) {
                            pdf.setFont(FONTS.condensed, 'bold');
                            pdf.setFontSize(10);
                            pdf.setTextColor(...COLORS.primary);
                            pdf.text('PALETA DE COLORES', MARGIN, y);
                            
                            // Línea decorativa
                            drawLine(MARGIN, y + 2, MARGIN + 40, y + 2, COLORS.primary, 1);
                            
                            y += 10;
                            
                            // Dibujar swatches en grid
                            let swatchX = MARGIN;
                            const swatchWidth = 60;
                            
                            uniqueColors.forEach((color, idx) => {
                                if (swatchX + swatchWidth > PAGE_WIDTH - MARGIN) {
                                    swatchX = MARGIN;
                                    y += 22;
                                }
                                
                                // Caja de fondo
                                drawRect(swatchX, y, swatchWidth, 18, COLORS.white, [200, 200, 200]);
                                
                                // Círculo de color
                                const colorHex = getColorHexForPDF(color.val);
                                const rgb = hexToRgb(colorHex);
                                pdf.setFillColor(...rgb);
                                pdf.circle(swatchX + 10, y + 9, 6, 'F');
                                pdf.setDrawColor(200, 200, 200);
                                pdf.circle(swatchX + 10, y + 9, 6, 'S');
                                
                                // Información del color
                                pdf.setFont(FONTS.display, 'bold');
                                pdf.setFontSize(11);
                                pdf.setTextColor(...COLORS.primary);
                                pdf.text(color.screenLetter || String(idx + 1), swatchX + 20, y + 7);
                                
                                pdf.setFont(FONTS.body, 'normal');
                                pdf.setFontSize(8);
                                pdf.setTextColor(...COLORS.black);
                                const colorName = pdf.splitTextToSize(color.val || '---', 35);
                                pdf.text(colorName, swatchX + 20, y + 14);
                                
                                swatchX += swatchWidth + 5;
                            });
                            
                            y += 25;
                        }
                    }
                    
                    // ========== SECUENCIA DE IMPRESIÓN ==========
                    
                    const stationsData = generateStationsData(placement);
                    
                    if (stationsData.length > 0) {
                        // Header de la tabla
                        drawRect(MARGIN, y, PAGE_WIDTH - (MARGIN * 2), 10, COLORS.primary);
                        
                        pdf.setTextColor(...COLORS.white);
                        pdf.setFont(FONTS.display, 'bold');
                        pdf.setFontSize(11);
                        pdf.text(`SECUENCIA DE IMPRESIÓN - ${placementType}`, MARGIN + 5, y + 6.5);
                        
                        // Icono de tabla
                        pdf.setFillColor(255, 255, 255);
                        pdf.rect(MARGIN + PAGE_WIDTH - 50, y + 3, 4, 4, 'F');
                        pdf.rect(MARGIN + PAGE_WIDTH - 44, y + 3, 4, 4, 'F');
                        pdf.rect(MARGIN + PAGE_WIDTH - 50, y + 3, 4, 4, 'S');
                        pdf.rect(MARGIN + PAGE_WIDTH - 44, y + 3, 4, 4, 'S');
                        
                        y += 12;
                        
                        // Headers de columnas
                        const colWidths = [12, 14, 52, 42, 16, 16, 14, 18, 14];
                        const colX = [];
                        let currentX = MARGIN;
                        colWidths.forEach(w => {
                            colX.push(currentX);
                            currentX += w;
                        });
                        
                        pdf.setFillColor(...COLORS.grayDark);
                        pdf.rect(MARGIN, y - 6, PAGE_WIDTH - (MARGIN * 2), 8, 'F');
                        
                        pdf.setFont(FONTS.condensed, 'bold');
                        pdf.setFontSize(7);
                        pdf.setTextColor(...COLORS.white);
                        
                        const headers = ['Est', 'Scr.', 'Screen (Tinta/Proceso)', 'Aditivos', 'Malla', 'Strokes', 'Angle', 'Press.', 'Duro'];
                        headers.forEach((header, i) => {
                            pdf.text(header, colX[i] + 2, y - 1);
                        });
                        
                        y += 5;
                        
                        // Filas de datos
                        pdf.setFont(FONTS.body, 'normal');
                        pdf.setFontSize(8);
                        pdf.setTextColor(...COLORS.black);
                        
                        stationsData.forEach((row, idx) => {
                            if (y > PAGE_HEIGHT - 35) {
                                pdf.addPage();
                                y = 20;
                                
                                // Repetir headers
                                pdf.setFillColor(...COLORS.grayDark);
                                pdf.rect(MARGIN, y - 6, PAGE_WIDTH - (MARGIN * 2), 8, 'F');
                                pdf.setTextColor(...COLORS.white);
                                headers.forEach((header, i) => {
                                    pdf.text(header, colX[i] + 2, y - 1);
                                });
                                y += 5;
                                pdf.setTextColor(...COLORS.black);
                            }
                            
                            const isFlash = row.screenCombined === 'FLASH' || row.screenCombined === 'COOL';
                            
                            if (isFlash) {
                                pdf.setFillColor(235, 235, 235);
                                pdf.rect(MARGIN, y - 4, PAGE_WIDTH - (MARGIN * 2), 6, 'F');
                                pdf.setFont(FONTS.body, 'italic');
                                pdf.setTextColor(...COLORS.grayMedium);
                                pdf.text(row.screenCombined, colX[2], y);
                                pdf.setFont(FONTS.body, 'normal');
                                pdf.setTextColor(...COLORS.black);
                            } else {
                                if (idx % 2 === 0) {
                                    pdf.setFillColor(250, 250, 250);
                                    pdf.rect(MARGIN, y - 4, PAGE_WIDTH - (MARGIN * 2), 6, 'F');
                                }
                                
                                // Estación (rojo bold)
                                pdf.setTextColor(...COLORS.primary);
                                pdf.setFont(FONTS.display, 'bold');
                                pdf.text(String(row.st), colX[0] + 5, y, { align: 'center' });
                                
                                // Screen letter (rojo)
                                pdf.setFont(FONTS.body, 'bold');
                                pdf.text(row.screenLetter || '', colX[1] + 2, y);
                                
                                // Resto (negro)
                                pdf.setTextColor(...COLORS.black);
                                pdf.setFont(FONTS.body, 'normal');
                                
                                const screenText = pdf.splitTextToSize(row.screenCombined, 48);
                                pdf.text(screenText, colX[2] + 2, y);
                                
                                const addText = pdf.splitTextToSize(row.add || '', 38);
                                pdf.setTextColor(...COLORS.primary);
                                pdf.setFontSize(6.5);
                                pdf.text(addText, colX[3] + 2, y);
                                pdf.setFontSize(8);
                                pdf.setTextColor(...COLORS.black);
                                
                                pdf.text(String(row.mesh), colX[4] + 2, y);
                                pdf.text(String(row.strokes), colX[5] + 8, y, { align: 'center' });
                                pdf.text(String(row.angle), colX[6] + 2, y);
                                pdf.text(String(row.pressure), colX[7] + 9, y, { align: 'center' });
                                pdf.text(String(row.duro), colX[8] + 2, y);
                            }
                            
                            y += 7;
                        });
                        
                        y += 10;
                    }
                    
                    // ========== CONDICIONES DE CURADO ==========
                    
                    if (y > PAGE_HEIGHT - 45) {
                        pdf.addPage();
                        y = 20;
                    }
                    
                    const curingHeight = 28;
                    drawRect(MARGIN, y, PAGE_WIDTH - (MARGIN * 2), curingHeight, COLORS.grayLight, COLORS.primary, 1.5);
                    
                    // Barra superior decorativa
                    pdf.setFillColor(...COLORS.primary);
                    pdf.rect(MARGIN, y, PAGE_WIDTH - (MARGIN * 2), 6, 'F');
                    
                    pdf.setFont(FONTS.condensed, 'bold');
                    pdf.setFontSize(9);
                    pdf.setTextColor(...COLORS.white);
                    pdf.text('CONDICIONES DE CURADO', MARGIN + 5, y + 4);
                    
                    const curingItems = [
                        { label: 'TEMPERATURA', value: placement.temp || '320°F', icon: '🌡️' },
                        { label: 'TIEMPO', value: placement.time || '1:40 min', icon: '⏱️' },
                        { label: 'TIPO DE TINTA', value: placement.inkType || 'WATER', icon: '🎨' }
                    ];
                    
                    let curingX = MARGIN + 10;
                    const curingItemWidth = (PAGE_WIDTH - (MARGIN * 2) - 20) / 3;
                    
                    curingItems.forEach((item, idx) => {
                        // Línea divisoria entre items
                        if (idx > 0) {
                            drawLine(curingX - 5, y + 10, curingX - 5, y + 25, [200, 200, 200]);
                        }
                        
                        pdf.setFont(FONTS.condensed, 'bold');
                        pdf.setFontSize(7);
                        pdf.setTextColor(...COLORS.textMuted);
                        pdf.text(item.label, curingX, y + 14);
                        
                        pdf.setFont(FONTS.display, 'bold');
                        pdf.setFontSize(13);
                        pdf.setTextColor(...COLORS.black);
                        pdf.text(item.value, curingX, y + 23);
                        
                        curingX += curingItemWidth;
                    });
                    
                    y += curingHeight + 15;
                    
                    // ========== TECHNICAL COMMENTS ==========
                    // ← NUEVA SECCIÓN AGREGADA
                    
                    const technicalComments = placement.technicalComments || 
                                            placement.specialInstructions || 
                                            data.technicalComments ||
                                            'Ningún comentario técnico registrado.';
                    
                    if (y > PAGE_HEIGHT - 50) {
                        pdf.addPage();
                        y = 20;
                    }
                    
                    // Header de comentarios
                    drawRect(MARGIN, y, PAGE_WIDTH - (MARGIN * 2), 10, COLORS.yellow, [200, 150, 0], 1);
                    pdf.setFont(FONTS.display, 'bold');
                    pdf.setFontSize(11);
                    pdf.setTextColor(...COLORS.black);
                    pdf.text('TECHNICAL COMMENTS / COMENTARIOS TÉCNICOS', MARGIN + 5, y + 6.5);
                    
                    y += 12;
                    
                    // Caja de comentarios
                    const commentHeight = 25;
                    drawRect(MARGIN, y, PAGE_WIDTH - (MARGIN * 2), commentHeight, [255, 253, 231], [255, 193, 7], 1);
                    
                    pdf.setFont(FONTS.body, 'normal');
                    pdf.setFontSize(9);
                    pdf.setTextColor(...COLORS.black);
                    
                    const commentLines = pdf.splitTextToSize(technicalComments, PAGE_WIDTH - (MARGIN * 2) - 10);
                    pdf.text(commentLines, MARGIN + 5, y + 7);
                    
                    y += commentHeight + 20;
                }
            }
            
            // ========== FOOTER ==========
            const totalPages = pdf.internal.getNumberOfPages();
            
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                
                const footerY = PAGE_HEIGHT - 15;
                
                // Línea divisoria
                drawLine(MARGIN, footerY - 5, PAGE_WIDTH - MARGIN, footerY - 5, COLORS.grayLight, 0.5);
                
                // Información del footer
                pdf.setFont(FONTS.body, 'normal');
                pdf.setFontSize(8);
                pdf.setTextColor(...COLORS.textMuted);
                
                const dateStr = new Date().toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                pdf.text(`Generado: ${dateStr}`, MARGIN, footerY + 2);
                
                // Designer en el footer si existe
                if (data.designer) {
                    pdf.text(`Designer: ${data.designer}`, PAGE_WIDTH / 2 - 20, footerY + 2);
                }
                
                pdf.text(`Página ${i} de ${totalPages}`, PAGE_WIDTH - 60, footerY + 2, { align: 'center' });
                
                pdf.setFont(FONTS.display, 'bold');
                pdf.setTextColor(...COLORS.primary);
                pdf.text('TEGRA Spec Manager', PAGE_WIDTH - MARGIN, footerY + 2, { align: 'right' });
            }
            
            // Generar blob
            const pdfBlob = pdf.output('blob');
            resolve(pdfBlob);
            
        } catch (error) {
            console.error('Error al generar PDF profesional:', error);
            reject(error);
        }
    });
}

// ========== FUNCIONES AUXILIARES (mantenidas igual) ==========

function generateStationsData(placement) {
    const stations = [];
    let stNum = 1;
    
    const inkType = placement.inkType || 'WATER';
    const preset = getInkPresetForPDF(inkType);
    
    const meshColor = placement.meshColor || preset.color.mesh;
    const meshWhite = placement.meshWhite || preset.white.mesh1;
    const meshBlocker = placement.meshBlocker || preset.blocker.mesh1;
    const durometer = placement.durometer || preset.color.durometer;
    const strokes = placement.strokes || preset.color.strokes;
    const angle = placement.angle || preset.color.angle;
    const pressure = placement.pressure || preset.color.pressure;
    const speed = placement.speed || preset.color.speed;
    const additives = placement.additives || preset.color.additives;
    
    if (placement.colors && Array.isArray(placement.colors)) {
        placement.colors.forEach((item, idx) => {
            let mesh, strokesVal, duro, ang, press, spd, add, screenLetter, screenTypeLabel;
            
            screenLetter = item.screenLetter || '';
            
            if (item.type === 'BLOCKER') {
                screenTypeLabel = preset.blocker.name;
                mesh = meshBlocker;
                strokesVal = strokes;
                duro = durometer;
                ang = angle;
                press = pressure;
                spd = speed;
                add = placement.additives || preset.blocker.additives;
            } else if (item.type === 'WHITE_BASE') {
                screenTypeLabel = preset.white.name;
                mesh = meshWhite;
                strokesVal = strokes;
                duro = durometer;
                ang = angle;
                press = pressure;
                spd = speed;
                add = placement.additives || preset.white.additives;
            } else if (item.type === 'METALLIC') {
                screenTypeLabel = item.val || '---';
                mesh = '110/64';
                strokesVal = '1';
                duro = '70';
                ang = '15';
                press = '40';
                spd = '35';
                add = 'Catalizador especial';
            } else {
                screenTypeLabel = item.val || '---';
                mesh = meshColor;
                strokesVal = strokes;
                duro = durometer;
                ang = angle;
                press = pressure;
                spd = speed;
                add = additives;
            }
            
            const screenCombined = (item.type === 'BLOCKER' || item.type === 'WHITE_BASE' || item.type === 'METALLIC')
                ? screenTypeLabel
                : item.val || '---';
            
            stations.push({
                st: stNum++,
                screenLetter,
                screenCombined,
                mesh,
                ink: item.val || '---',
                strokes: strokesVal,
                duro,
                angle: ang,
                pressure: press,
                speed: spd,
                add
            });
            
            if (idx < placement.colors.length - 1) {
                stations.push({
                    st: stNum++,
                    screenLetter: '',
                    screenCombined: 'FLASH',
                    mesh: '-',
                    ink: '-',
                    strokes: '-',
                    duro: '-',
                    angle: '-',
                    pressure: '-',
                    speed: '-',
                    add: ''
                });
                
                stations.push({
                    st: stNum++,
                    screenLetter: '',
                    screenCombined: 'COOL',
                    mesh: '-',
                    ink: '-',
                    strokes: '-',
                    duro: '-',
                    angle: '-',
                    pressure: '-',
                    speed: '-',
                    add: ''
                });
            }
        });
    }
    
    return stations;
}

function getInkPresetForPDF(inkType = 'WATER') {
    if (window.Config && window.Config.INK_PRESETS && window.Config.INK_PRESETS[inkType]) {
        return window.Config.INK_PRESETS[inkType];
    }
    
    const defaults = {
        'WATER': {
            temp: '320°F',
            time: '1:40 min',
            blocker: { name: 'BLOCKER CHT', mesh1: '122/55', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
            white: { name: 'AQUAFLEX V2 WHITE', mesh1: '198/40', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
            color: { mesh: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: '3% cross-linker 500 · 1.5% antitack' }
        },
        'PLASTISOL': {
            temp: '320°F',
            time: '1:00 min',
            blocker: { name: 'BARRIER BASE', mesh1: '110/64', mesh2: '156/64', durometer: '65', speed: '35', angle: '15', strokes: '1', pressure: '40', additives: 'N/A' },
            white: { name: 'TXT POLY WHITE', mesh1: '156/64', mesh2: '110/64', durometer: '65', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
            color: { mesh: '156/64', durometer: '65', speed: '35', angle: '15', strokes: '1', pressure: '40', additives: '1% catalyst' }
        },
        'SILICONE': {
            temp: '320°F',
            time: '1:40 min',
            blocker: { name: 'BLOCKER LIBRA', mesh1: '110/64', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
            white: { name: 'BASE WHITE LIBRA', mesh1: '122/55', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
            color: { mesh: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: '3% cat · 2% ret' }
        }
    };
    
    return defaults[inkType] || defaults.WATER;
}

function getColorHexForPDF(colorName) {
    if (!colorName) return '#CCCCCC';
    
    const name = colorName.toUpperCase().trim();
    
    if (window.Config && window.Config.COLOR_DATABASES) {
        for (const db of Object.values(window.Config.COLOR_DATABASES)) {
            for (const [key, data] of Object.entries(db)) {
                if (name.includes(key.toUpperCase()) || key.toUpperCase().includes(name)) {
                    return data.hex || '#CCCCCC';
                }
            }
        }
    }
    
    const basicColors = {
        'RED': '#FF0000', 'BLUE': '#0000FF', 'GREEN': '#00FF00',
        'BLACK': '#000000', 'WHITE': '#FFFFFF', 'YELLOW': '#FFFF00',
        'GOLD': '#FFD700', 'SILVER': '#C0C0C0', 'NAVY': '#000080',
        'ROYAL': '#4169E1', 'MAROON': '#800000', 'ORANGE': '#FFA500',
        'PURPLE': '#800080', 'GRAY': '#808080', 'GREY': '#808080'
    };
    
    for (const [color, hex] of Object.entries(basicColors)) {
        if (name.includes(color)) return hex;
    }
    
    const hexMatch = name.match(/#([0-9A-F]{6})/i);
    if (hexMatch) return `#${hexMatch[1]}`;
    
    return '#CCCCCC';
}

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    return [
        parseInt(hex.substring(0, 2), 16),
        parseInt(hex.substring(2, 4), 16),
        parseInt(hex.substring(4, 6), 16)
    ];
}

// Hacer disponible globalmente
window.generateProfessionalPDF = generateProfessionalPDF;
'''

# Guardar el archivo actualizado
with open('/mnt/kimi/output/pdf-generator-mejorado.js', 'w', encoding='utf-8') as f:
    f.write(pdf_generator_actualizado)

print("✅ PDF Generator actualizado con los 3 campos nuevos:")
print("   1. DESIGNER")
print("   2. SAMPLE DEVELOPED BY (Desarrollado Por)")
print("   3. TECHNICAL COMMENTS")
print("\n📁 Archivo guardado: /mnt/kimi/output/pdf-generator-mejorado.js")
