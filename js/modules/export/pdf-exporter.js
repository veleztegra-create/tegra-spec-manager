// js/modules/export/pdf-exporter.js
// Módulo completo de exportación a PDF para Tegra Spec Manager

console.log('📄 Módulo PDFExporter cargado');

const PDFExporter = (function() {
    // ========== VARIABLES Y CONFIGURACIÓN ==========
    
    const CONFIG = {
        pageSize: 'letter',
        orientation: 'p',
        unit: 'mm',
        primaryColor: [255, 82, 82],    // Rojo Tegra
        accentColor: [255, 138, 128],   // Rojo claro
        grayLight: [240, 240, 240],
        grayDark: [100, 100, 100],
        textColor: [0, 0, 0],
        whiteColor: [255, 255, 255]
    };
    
    // ========== FUNCIONES PRINCIPALES ==========
    
    /**
     * Exporta la spec actual a PDF
     * @returns {Promise} Promesa que se resuelve cuando se completa la exportación
     */
    async function exportPDF() {
        console.log('📄 Iniciando exportación a PDF...');
        
        try {
            // Verificar que jsPDF esté cargado
            if (typeof window.jspdf === 'undefined') {
                throw new Error('jsPDF no está cargado');
            }
            
            showStatus('📄 Generando PDF...', 'warning');
            
            // Generar el blob del PDF
            const pdfBlob = await generatePDFBlob();
            
            // Crear nombre de archivo
            const style = document.getElementById('style')?.value || 'SinEstilo';
            const folderNum = document.getElementById('folder-num')?.value || '00000';
            const fileName = `TegraSpec_${style}_${folderNum}.pdf`;
            
            // Descargar el archivo
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showStatus('✅ PDF generado correctamente', 'success');
            console.log(`✅ PDF exportado: ${fileName}`);
            
            return pdfBlob;
            
        } catch (error) {
            console.error('❌ Error al exportar PDF:', error);
            showStatus(`❌ Error al generar PDF: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Genera el blob del PDF con todos los datos
     * @returns {Promise<Blob>} Blob del PDF generado
     */
    async function generatePDFBlob() {
        return new Promise(async (resolve, reject) => {
            try {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF(CONFIG.orientation, CONFIG.unit, CONFIG.pageSize);
                const pageW = pdf.internal.pageSize.getWidth();
                const pageH = pdf.internal.pageSize.getHeight();
                
                // Obtener datos de la spec
                const specData = collectSpecData();
                const placements = window.PlacementsCore ? 
                    window.PlacementsCore.getAllPlacements() : [];
                
                // ========== FUNCIONES DE AYUDA ==========
                
                const text = (str, x, y, size = 10, bold = false, color = CONFIG.textColor, align = 'left', maxWidth = null) => {
                    pdf.setTextColor(...color);
                    pdf.setFontSize(size);
                    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
                    const textStr = String(str || '');
                    
                    if (maxWidth) {
                        const lines = pdf.splitTextToSize(textStr, maxWidth);
                        pdf.text(lines, x, y, { align: align });
                        return lines.length;
                    } else {
                        pdf.text(textStr, x, y, { align: align });
                        return 1;
                    }
                };

                const drawRect = (x, y, width, height, fillColor = null, strokeColor = CONFIG.textColor, lineWidth = 0.2) => {
                    if (fillColor) {
                        pdf.setFillColor(...fillColor);
                        pdf.rect(x, y, width, height, 'F');
                    }
                    pdf.setDrawColor(...strokeColor);
                    pdf.setLineWidth(lineWidth);
                    pdf.rect(x, y, width, height);
                };

                const decorativeLine = (x1, y1, x2, y2, color = CONFIG.grayLight, width = 0.2) => {
                    pdf.setDrawColor(...color);
                    pdf.setLineWidth(width);
                    pdf.line(x1, y1, x2, y2);
                };
                
                // ========== CABECERA DEL PDF ==========
                
                // Fondo de cabecera
                pdf.setFillColor(...CONFIG.primaryColor);
                drawRect(0, 0, pageW, 18, CONFIG.primaryColor, CONFIG.primaryColor, 0);
                
                // Logo y título Tegra
                pdf.setTextColor(...CONFIG.whiteColor);
                pdf.setFontSize(20);
                pdf.setFont("helvetica", "bold");
                text("TEGRA", 15, 16);
                
                pdf.setFontSize(11);
                text("TECHNICAL SPEC MANAGER", 15, 22);
                
                // Número de folder
                const folderNum = specData.folder || '#####';
                pdf.setFontSize(7);
                text('FOLDER', pageW - 25, 15, 7, false, CONFIG.whiteColor, 'right');
                pdf.setFontSize(16);
                text(`#${folderNum}`, pageW - 25, 19, 16, true, CONFIG.whiteColor, 'right');
                
                let y = 42; // Posición Y inicial después de la cabecera
                
                // ========== INFORMACIÓN GENERAL ==========
                
                if (placements.length > 0) {
                    drawRect(10, y, pageW - 20, 40, [250, 250, 250], CONFIG.grayLight);
                    text('INFORMACIÓN GENERAL', 15, y + 8, 12, true, CONFIG.primaryColor);
                    
                    y += 5;
                    
                    const fields = [
                        { label: 'CLIENTE:', value: specData.customer },
                        { label: 'STYLE:', value: specData.style },
                        { label: 'COLORWAY:', value: specData.colorway },
                        { label: 'SEASON:', value: specData.season },
                        { label: 'PATTERN #:', value: specData.pattern },
                        { label: 'P.O. #:', value: specData.po },
                        { label: 'SAMPLE TYPE:', value: specData.sampleType },
                        { label: 'TEAM:', value: specData.nameTeam },
                        { label: 'GENDER:', value: specData.gender },
                        { label: 'DESIGNER:', value: specData.designer },
                    ];
                    
                    let fieldY = y + 12;
                    fields.forEach((f, i) => {
                        const xPos = i % 2 === 0 ? 15 : 115;
                        text(f.label, xPos, fieldY, 9, true);
                        text(f.value || '---', xPos + 25, fieldY, 9, false);
                        if (i % 2 !== 0) fieldY += 5;
                    });
                    y += 45;
                }
                
                // ========== PLACEMENTS ==========
                
                placements.forEach((placement, index) => {
                    // Nueva página para cada placement después del primero
                    if (index > 0) {
                        pdf.addPage();
                        y = 25;
                    }
                    
                    const displayType = placement.type.includes('CUSTOM:') 
                        ? placement.type.replace('CUSTOM: ', '')
                        : placement.type;
                    
                    // Cabecera del placement
                    pdf.setFillColor(...CONFIG.primaryColor);
                    drawRect(10, y, pageW - 20, 10, CONFIG.primaryColor, CONFIG.primaryColor, 0);
                    text(`PLACEMENT: ${displayType}`, 15, y + 6, 11, true, CONFIG.whiteColor);
                    y += 15;
                    
                    // Imagen del placement (si existe)
                    if (placement.imageData && placement.imageData.startsWith('data:')) {
                        try {
                            const imgH = 70;
                            const imgW = 90;
                            
                            drawRect(15, y, imgW, imgH, [245, 245, 245], CONFIG.grayLight);
                            pdf.addImage(placement.imageData, 'JPEG', 17, y + 2, imgW - 4, imgH - 4);
                            
                            const detailsX = 110;
                            drawRect(detailsX, y, pageW - detailsX - 15, imgH, [250, 250, 250], CONFIG.grayLight);
                            
                            let detailY = y + 10;
                            text('DETALLES DEL PLACEMENT', detailsX + 5, detailY, 10, true, CONFIG.primaryColor);
                            detailY += 7;
                            
                            const details = [
                                `Tipo de tinta: ${placement.inkType || '---'}`,
                                `Dimensiones: ${placement.width || '##'}" X ${placement.height || '##'}"`,
                                `Ubicación: ${displayType || '---'}`,
                                `Placement: ${placement.placementDetails || '---'}`,
                                `Especialidades: ${placement.specialties || '---'}`
                            ];
                            
                            details.forEach(detail => {
                                text(detail, detailsX + 5, detailY, 8);
                                detailY += 5;
                            });
                            
                            y += imgH + 12;
                        } catch (e) {
                            console.warn('No se pudo agregar imagen al PDF:', e);
                            y += 10;
                        }
                    } else {
                        y += 10;
                    }
                    
                    // ========== COLORES Y TINTAS ==========
                    
                    if (placement.colors && placement.colors.length > 0) {
                        const uniqueColors = [];
                        const seenColors = new Set();
                        
                        placement.colors.forEach(color => {
                            if (color.type === 'COLOR' || color.type === 'METALLIC') {
                                const colorVal = color.val.toUpperCase().trim();
                                if (colorVal && !seenColors.has(colorVal)) {
                                    seenColors.add(colorVal);
                                    uniqueColors.push({
                                        val: colorVal,
                                        screenLetter: color.screenLetter
                                    });
                                }
                            }
                        });
                        
                        if (uniqueColors.length > 0) {
                            drawRect(10, y, pageW - 20, 35, [250, 250, 250], CONFIG.grayLight);
                            text('COLORES Y TINTAS', 15, y + 8, 11, true, CONFIG.primaryColor);
                            y += 10;
                            
                            let xPos = 15;
                            let rowY = y + 10;
                            let colorsInRow = 0;
                            
                            uniqueColors.forEach((color, idx) => {
                                const colorHex = getColorHex(color.val) || '#cccccc';
                                const rgb = hexToRgb(colorHex);
                                
                                const colorBoxSize = 8;
                                pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
                                pdf.rect(xPos, rowY, colorBoxSize, colorBoxSize, 'F');
                                pdf.setDrawColor(0, 0, 0);
                                pdf.setLineWidth(0.1);
                                pdf.rect(xPos, rowY, colorBoxSize, colorBoxSize);
                                
                                text(`${color.screenLetter}: ${color.val}`, xPos + colorBoxSize + 4, rowY + 5, 7);
                                
                                xPos += 70;
                                colorsInRow++;
                                
                                if (colorsInRow >= 3) {
                                    xPos = 15;
                                    rowY += 15;
                                    colorsInRow = 0;
                                }
                            });
                            
                            y += 40;
                        } else {
                            y += 5;
                        }
                    } else {
                        y += 5;
                    }
                    
                    // ========== SECUENCIA DE IMPRESIÓN ==========
                    
                    const stationsData = window.PlacementsColors ? 
                        window.PlacementsColors.updatePlacementStations(placement.id, true) : [];
                    
                    if (stationsData.length > 0) {
                        text(`SECUENCIA DE IMPRESIÓN - ${displayType}`, 15, y - 5, 12, true, CONFIG.primaryColor);
                        y += 6;
                        
                        pdf.setFillColor(...CONFIG.primaryColor);
                        drawRect(15, y, pageW - 30, 8, CONFIG.primaryColor, CONFIG.primaryColor, 0);
                        
                        const pdfHeaders = ['Est', 'Scr.', 'Screen (Tinta/Proceso)', 'Aditivos', 'Malla', 'Strokes', 'Angle', 'Pressure', 'Speed', 'Duro'];
                        const pdfColW = [10, 12, 60, 55, 15, 15, 15, 15, 15, 15];
                        let x = 15;
                        
                        pdf.setTextColor(...CONFIG.whiteColor);
                        pdf.setFontSize(8);
                        pdf.setFont('helvetica', 'bold');
                        
                        pdfHeaders.forEach((h, i) => {
                            text(h, x + 2, y + 5);
                            x += pdfColW[i];
                        });
                        y += 9;
                        
                        decorativeLine(15, y - 1, pageW - 15, y - 1, CONFIG.grayDark, 0.3);
                        
                        pdf.setTextColor(...CONFIG.textColor);
                        pdf.setFont('helvetica', 'normal');
                        pdf.setFontSize(8);
                        
                        let rowCount = 0;
                        stationsData.forEach((row, idx) => {
                            if (y > 240) {
                                pdf.addPage();
                                y = 25;
                            }
                            
                            if (row.screenCombined !== 'FLASH' && row.screenCombined !== 'COOL') {
                                if (rowCount % 2 === 0) {
                                    pdf.setFillColor(248, 248, 248);
                                    pdf.rect(15, y - 3, pageW - 30, 6, 'F');
                                }
                                rowCount++;
                            }
                            
                            if (rowCount > 0 && (row.screenCombined === 'FLASH' || row.screenCombined === 'COOL')) {
                                decorativeLine(15, y + 1.5, pageW - 15, y + 1.5, [240, 240, 240], 0.1);
                            }
                            
                            x = 15;
                            const data = [
                                row.st, 
                                row.screenLetter, 
                                row.screenCombined, 
                                row.add, 
                                row.mesh, 
                                row.strokes,
                                row.angle,
                                row.pressure,
                                row.speed,
                                row.duro
                            ];
                            
                            data.forEach((d, i) => {
                                let safeText = String(d || '');
                                
                                if (i === 3 && safeText.length > 35) {
                                    safeText = safeText.substring(0, 22) + '...';
                                }
                                
                                if (i === 1) {
                                    pdf.setFont('helvetica', 'bold');
                                    pdf.setTextColor(...CONFIG.primaryColor);
                                }
                                if (i === 3) {
                                    pdf.setTextColor(...CONFIG.accentColor);
                                    pdf.setFontSize(7);
                                }
                                
                                text(safeText, x + 2, y);
                                x += pdfColW[i];
                                
                                if (i === 1) pdf.setFont('helvetica', 'normal');
                                if (i === 3) {
                                    pdf.setTextColor(...CONFIG.textColor);
                                    pdf.setFontSize(8);
                                }
                            });
                            y += 6;
                        });
                        
                        y += 8;
                        
                        // ========== CONDICIONES DE CURADO ==========
                        
                        const timeTempY = y;
                        const timeTempHeight = 22;
                        
                        pdf.setFillColor(245, 245, 245);
                        drawRect(15, timeTempY, pageW - 30, timeTempHeight, [245, 245, 245], CONFIG.grayLight);
                        decorativeLine(15, timeTempY, pageW - 15, timeTempY, CONFIG.grayDark, 0.3);
                        
                        text('CONDICIONES DE CURADO', 20, timeTempY + 8, 10, true, CONFIG.primaryColor);
                        
                        const temp = placement.temp || '320 °F';
                        const time = placement.time || '1:40 min';
                        
                        text(`Temp: ${temp}`, 25, timeTempY + 16, 9, true);
                        text(`Tiempo: ${time}`, 90, timeTempY + 16, 9, true);
                        text(`Tinta: ${placement.inkType || 'WATER'}`, 150, timeTempY + 16, 9, true);
                        
                        y += timeTempHeight + 8;
                    }
                    
                    // ========== INSTRUCCIONES ESPECIALES ==========
                    
                    if (placement.specialInstructions && placement.specialInstructions.trim()) {
                        if (y > 230) {
                            pdf.addPage();
                            y = 25;
                        }
                        
                        drawRect(15, y, pageW - 30, 30, [255, 253, 231], [255, 193, 7]);
                        
                        text('INSTRUCCIONES ESPECIALES:', 25, y + 8, 9, true, [255, 193, 7]);
                        
                        const splitText = pdf.splitTextToSize(placement.specialInstructions, pageW - 50);
                        pdf.setFontSize(8);
                        pdf.setTextColor(66, 66, 66);
                        text(splitText, 25, y + 15);
                        
                        y += 35;
                    }
                    
                    // ========== PIE DE PÁGINA ==========
                    
                    const footerY = pageH - 15;
                    decorativeLine(15, footerY - 5, pageW - 15, footerY - 5, CONFIG.grayLight, 0.3);
                    
                    pdf.setFontSize(8);
                    pdf.setTextColor(150, 150, 150);
                    
                    const dateStr = new Date().toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    text(`Generado: ${dateStr}`, 15, footerY);
                    text(`Placement ${index + 1} de ${placements.length}`, pageW / 2, footerY, 8, false, [150, 150, 150], 'center');
                    pdf.setFont('helvetica', 'bold');
                    pdf.setTextColor(...CONFIG.primaryColor);
                    text('TEGRA Spec Manager', pageW - 15, footerY, 8, true, CONFIG.primaryColor, 'right');
                });
                
                // ========== FINALIZAR PDF ==========
                
                const pdfBlob = pdf.output('blob');
                resolve(pdfBlob);
                
            } catch (error) {
                console.error('Error al generar PDF:', error);
                reject(error);
            }
        });
    }
    
    // ========== FUNCIONES AUXILIARES ==========
    
    /**
     * Convierte un color hexadecimal a RGB
     * @param {string} hex - Color hexadecimal (#FFFFFF o FFFFFF)
     * @returns {Array} Array [r, g, b]
     */
    function hexToRgb(hex) {
        if (!hex) return [0, 0, 0];
        
        hex = hex.replace('#', '');
        
        // Asegurar que tenga 6 caracteres
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return [r, g, b];
    }
    
    /**
     * Obtiene el código hexadecimal de un color por nombre
     * @param {string} colorName - Nombre del color
     * @returns {string} Código hexadecimal o null
     */
    function getColorHex(colorName) {
        if (!colorName) return null;
        
        const name = colorName.toUpperCase().trim();
        
        // Buscar en todas las bases de datos disponibles
        if (window.Config && window.Config.COLOR_DATABASES) {
            for (const db of Object.values(window.Config.COLOR_DATABASES)) {
                for (const [key, data] of Object.entries(db)) {
                    if (name === key.toUpperCase() || 
                        name.includes(key.toUpperCase()) || 
                        key.toUpperCase().includes(name)) {
                        if (data && data.hex) {
                            return data.hex;
                        }
                    }
                }
            }
        }
        
        // Buscar código hex directo
        const hexMatch = name.match(/#([0-9A-F]{6})/i);
        if (hexMatch) {
            return `#${hexMatch[1]}`;
        }
        
        // Colores básicos
        const basicColors = {
            'RED': '#FF0000',
            'BLUE': '#0000FF',
            'GREEN': '#00FF00',
            'BLACK': '#000000',
            'WHITE': '#FFFFFF',
            'YELLOW': '#FFFF00',
            'PURPLE': '#800080',
            'ORANGE': '#FFA500',
            'GRAY': '#808080',
            'GREY': '#808080',
            'GOLD': '#FFD700',
            'SILVER': '#C0C0C0'
        };
        
        if (basicColors[name]) {
            return basicColors[name];
        }
        
        return null;
    }
    
    /**
     * Recolecta todos los datos de la spec actual
     * @returns {Object} Datos de la spec
     */
    function collectSpecData() {
        return {
            customer: document.getElementById('customer')?.value || '',
            style: document.getElementById('style')?.value || '',
            folder: document.getElementById('folder-num')?.value || '',
            colorway: document.getElementById('colorway')?.value || '',
            season: document.getElementById('season')?.value || '',
            pattern: document.getElementById('pattern')?.value || '',
            po: document.getElementById('po')?.value || '',
            sampleType: document.getElementById('sample-type')?.value || '',
            nameTeam: document.getElementById('name-team')?.value || '',
            gender: document.getElementById('gender')?.value || '',
            designer: document.getElementById('designer')?.value || '',
            collectedAt: new Date().toISOString()
        };
    }
    
    /**
     * Muestra un mensaje de estado
     * @param {string} msg - Mensaje a mostrar
     * @param {string} type - Tipo de mensaje (success, error, warning)
     */
    function showStatus(msg, type = 'success') {
        // Usar el sistema de status de la aplicación si está disponible
        if (window.AppManager && window.AppManager.showStatus) {
            window.AppManager.showStatus(msg, type);
        } else {
            console.log(`📢 [${type.toUpperCase()}] ${msg}`);
            
            const statusEl = document.getElementById('statusMessage');
            if (statusEl) {
                statusEl.textContent = msg;
                statusEl.className = `status-message status-${type}`;
                statusEl.style.display = 'block';
                setTimeout(() => statusEl.style.display = 'none', 4000);
            }
        }
    }
    
    /**
     * Convierte una data URL a Blob
     * @param {string} dataURL - Data URL de la imagen
     * @returns {Blob} Blob de la imagen
     */
    function dataURLToBlob(dataURL) {
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
    
    /**
     * Genera un PDF de prueba (para diagnóstico)
     * @returns {Promise<Blob>} PDF de prueba
     */
    async function generateTestPDF() {
        return new Promise((resolve, reject) => {
            try {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF();
                
                pdf.setFontSize(20);
                pdf.text('Tegra Spec Manager - PDF Test', 20, 20);
                
                pdf.setFontSize(12);
                pdf.text('Este es un PDF de prueba generado correctamente.', 20, 40);
                pdf.text(`Fecha: ${new Date().toLocaleString()}`, 20, 50);
                pdf.text('Módulo PDFExporter funcionando ✅', 20, 60);
                
                const blob = pdf.output('blob');
                resolve(blob);
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Verifica si el sistema de PDF está listo
     * @returns {boolean} True si está listo
     */
    function isReady() {
        const requirements = [
            typeof window.jspdf !== 'undefined',
            typeof window.XLSX !== 'undefined',
            typeof document !== 'undefined'
        ];
        
        return requirements.every(req => req === true);
    }
    
    /**
     * Obtiene información del módulo
     * @returns {Object} Información del módulo
     */
    function getModuleInfo() {
        return {
            name: 'PDFExporter',
            version: '1.0.0',
            description: 'Módulo de exportación a PDF para Tegra Spec Manager',
            ready: isReady(),
            config: CONFIG,
            functions: Object.keys(PDFExporter).filter(key => typeof PDFExporter[key] === 'function')
        };
    }
    
    // ========== EXPORTACIÓN PÚBLICA ==========
    return {
        // Funciones principales
        exportPDF,
        generatePDFBlob,
        generateTestPDF,
        
        // Funciones auxiliares
        hexToRgb,
        getColorHex,
        dataURLToBlob,
        
        // Utilidades
        isReady,
        getModuleInfo,
        
        // Configuración (solo lectura)
        CONFIG: Object.freeze({...CONFIG})
    };
})();

// ========== EXPORTACIÓN GLOBAL ==========
window.PDFExporter = PDFExporter;

// Exportar funciones individuales para compatibilidad
window.exportPDF = PDFExporter.exportPDF;
window.generatePDFBlob = PDFExporter.generatePDFBlob;
window.hexToRgb = PDFExporter.hexToRgb;
window.dataURLToBlob = PDFExporter.dataURLToBlob;

console.log('✅ Módulo PDFExporter completamente cargado y exportado');
