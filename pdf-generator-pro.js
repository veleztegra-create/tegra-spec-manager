
/**
 * pdf-generator-pro.js - v3.0 FINAL (Renderizador Puro)
 * Este motor de PDF está disenado para ser un "renderizador puro".
 * Recibe un objeto de datos completo y pre-procesado y su única
 * responsabilidad es rellenar las plantillas HTML con esos datos.
 * No realiza llamadas a funciones externas ni contiene lógica de negocio.
 */

async function generateProfessionalPDF(data) {
    console.log('[PDF-PRO v3.0] Iniciando renderizado de PDF...', { data });

    try {
        // 1. Cargar las plantillas HTML.
        const [mainTemplate, placementTemplate] = await Promise.all([
            fetch('templates/pdf-template.html').then(res => res.text()),
            fetch('templates/placement-template.html').then(res => res.text())
        ]);
        console.log('[PDF-PRO v3.0] Plantillas HTML cargadas.');

        // 2. Función de utilidad para reemplazar marcadores.
        const replacePlaceholders = (template, replacements) => {
            return template.replace(/\{\{(.+?)\}\}/g, (match, key) => {
                // Navegar el objeto para encontrar el valor, ej: "placement.name"
                const keys = key.trim().split('.');
                let value = replacements;
                for (const k of keys) {
                    value = value[k];
                    if (value === undefined || value === null) break;
                }
                return value === undefined || value === null ? '' : value;
            });
        };
        
        // 3. Generar el HTML para cada PLACEMENT.
        let allPlacementsHtml = '';
        if (data.placements && Array.isArray(data.placements)) {
            for (const placement of data.placements) {
                if (!placement) continue;

                // 3a. Generar HTML para los COLORES de este placement.
                let colorsHtml = '';
                const colorItems = (placement.colors || []).filter(c => c && (c.type === 'COLOR' || c.type === 'METALLIC'));
                colorItems.forEach(color => {
                    colorsHtml += `<div class="color-swatch">
                                     <div class="color-box" style="background-color: ${color.hex};"></div>
                                     <div class="color-info">
                                       <span class="color-number">${color.screenLetter}</span>
                                       <span class="color-name">${color.val}</span>
                                     </div>
                                   </div>`;
                });

                // 3b. Generar HTML para la SECUENCIA de este placement.
                let sequenceRowsHtml = '';
                const stations = placement.stations || [];
                stations.forEach(station => {
                    if (station.screenCombined === 'FLASH' || station.screenCombined === 'COOL') {
                        sequenceRowsHtml += `<tr class="flash-row">
                                             <td class="station-number">${station.st}</td>
                                             <td colspan="8">${station.screenCombined}</td>
                                           </tr>`;
                    } else {
                        sequenceRowsHtml += `<tr>
                                             <td class="station-number">${station.st}</td>
                                             <td class="screen-letter">${station.screenLetter}</td>
                                             <td class="ink-name">${station.screenCombined}</td>
                                             <td class="additives">${station.add}</td>
                                             <td>${station.mesh}</td>
                                             <td>${station.strokes}</td>
                                             <td>${station.angle}</td>
                                             <td>${station.pressure}</td>
                                             <td>${station.duro}</td>
                                           </tr>`;
                    }
                });
                
                // 3c. Generar HTML para las INSTRUCCIONES ESPECIALES.
                let specialInstructionsHtml = '';
                if (placement.specialInstructions) {
                    specialInstructionsHtml = `<div class="special-instructions">
                                                 <h2 class="section-title">Instrucciones Especiales</h2>
                                                 <p class="instructions-text">${placement.specialInstructions}</p>
                                               </div>`;
                }

                // 3d. Rellenar la plantilla del PLACEMENT con los datos generados.
                let placementHtml = placementTemplate;
                placementHtml = placementHtml.replace('{{placement.name}}', placement.name || 'N/A');
                placementHtml = placementHtml.replace('{{placement.imageData}}', placement.imageData || 'https://via.placeholder.com/400x300/E31837/FFFFFF?text=No+Image');
                placementHtml = placementHtml.replace('{{placement.inkType}}', placement.inkType || 'N/A');
                placementHtml = placementHtml.replace('{{placement.dimensions}}', placement.dimensions || 'N/A');
                placementHtml = placementHtml.replace('{{placement.placementDetails}}', placement.placementDetails || 'N/A');
                placementHtml = placementHtml.replace('{{placement.specialties}}', placement.specialties || 'N/A');
                placementHtml = placementHtml.replace('{{placement.temp}}', placement.temp || 'N/A');
                placementHtml = placementHtml.replace('{{placement.time}}', placement.time || 'N/A');
                placementHtml = placementHtml.replace('{{COLORS_HTML}}', colorsHtml);
                placementHtml = placementHtml.replace('{{SEQUENCE_ROWS_HTML}}', sequenceRowsHtml);
                placementHtml = placementHtml.replace('{{SPECIAL_INSTRUCTIONS_HTML}}', specialInstructionsHtml);

                allPlacementsHtml += placementHtml;
            }
        }

        // 4. Rellenar la PLANTILLA PRINCIPAL con los datos generales y los placements.
        const finalHtml = replacePlaceholders(mainTemplate, {
            ...data, // Todos los datos generales (customer, style, etc.)
            PLACEMENTS_HTML: allPlacementsHtml
        });

        // 5. Renderizar el HTML a un Canvas utilizando html2canvas.
        console.log('[PDF-PRO v3.0] Renderizando HTML a Canvas...');
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.innerHTML = finalHtml;
        document.body.appendChild(container);

        const pdfContent = container.querySelector('#pdf-content');
        if (!pdfContent) throw new Error('El contenedor #pdf-content no se encontró en la plantilla.');
        
        const canvas = await html2canvas(pdfContent, { scale: 2, useCORS: true, logging: true });
        console.log('[PDF-PRO v3.0] Canvas generado. Creando PDF...');

        // 6. Crear el PDF desde el Canvas utilizando jsPDF.
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'letter' });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const finalCanvasHeight = pdfWidth / (canvas.width / canvas.height);

        pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, pdfWidth, finalCanvasHeight, undefined, 'FAST');

        // 7. Limpiar y devolver el resultado.
        document.body.removeChild(container);
        console.log('[PDF-PRO v3.0] Renderizado y limpieza completados.');
        return pdf.output('blob');

    } catch (error) {
        console.error('[PDF-PRO v3.0] Ha ocurrido un error catastrófico durante el renderizado del PDF:', error);
        throw error;
    }
}

// Hacer la función accesible globalmente.
window.generateProfessionalPDF = generateProfessionalPDF;
