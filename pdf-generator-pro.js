
/**
 * pdf-generator-pro.js - v2.0 FINAL
 * Generador de PDF profesional basado en plantillas HTML.
 * Utiliza un enfoque de plantillas para separar el diseno (HTML/CSS) de la logica (JS).
 */

async function generateProfessionalPDF(data) {
    console.log('[PDF-PRO] Iniciando generacion de PDF con motor v2.0...');

    try {
        // 1. Cargar las plantillas HTML de forma concurrente
        const [mainTemplate, placementTemplate] = await Promise.all([
            fetch('templates/pdf-template.html').then(res => {
                if (!res.ok) throw new Error(`Fallo al cargar pdf-template.html: ${res.statusText}`);
                return res.text();
            }),
            fetch('templates/placement-template.html').then(res => {
                if (!res.ok) throw new Error(`Fallo al cargar placement-template.html: ${res.statusText}`);
                return res.text();
            })
        ]);
        console.log('[PDF-PRO] Plantillas HTML cargadas.');

        // 2. Funcion de utilidad para reemplazar marcadores de forma segura
        const replacePlaceholders = (template, replacements) => {
            let result = template;
            for (const [key, value] of Object.entries(replacements)) {
                // Si el valor es nulo o indefinido, reemplazar con una cadena vacia
                const replacementValue = value === null || value === undefined ? '' : value;
                result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), replacementValue);
            }
            return result;
        };

        // 3. Generar el HTML para cada placement
        let allPlacementsHtml = '';
        if (data.placements && Array.isArray(data.placements)) {
            for (const placement of data.placements) {
                if (!placement) continue; // Omitir placements nulos o indefinidos
                
                console.log(`[PDF-PRO] Procesando placement: ${placement.name || 'Sin Nombre'}`);
                
                // HTML para colores
                let colorsHtml = '';
                if (placement.colors && placement.colors.length > 0) {
                    const colorItems = placement.colors.filter(c => c && (c.type === 'COLOR' || c.type === 'METALLIC'));
                    colorItems.forEach(color => {
                        const colorHex = window.getColorHex ? window.getColorHex(color.val) : '#CCCCCC';
                        colorsHtml += replacePlaceholders('<div class="color-swatch"><div class="color-box" style="background-color: {{colorHex}};"></div><div class="color-info"><span class="color-number">{{screenLetter}}</span><span class="color-name">{{val}}</span></div></div>', {
                           colorHex: colorHex,
                           screenLetter: color.screenLetter,
                           val: color.val
                        });
                    });
                }

                // HTML para secuencia
                let sequenceRowsHtml = '';
                const stations = window.updatePlacementStations ? window.updatePlacementStations(placement.id, true) : [];
                if (stations && stations.length > 0) {
                    stations.forEach(station => {
                        if (!station) return;
                        if (station.screenCombined === 'FLASH' || station.screenCombined === 'COOL') {
                            sequenceRowsHtml += replacePlaceholders('<tr class="flash-row"><td class="station-number">{{st}}</td><td colspan="8">{{screenCombined}}</td></tr>', station);
                        } else {
                            sequenceRowsHtml += replacePlaceholders('<tr><td class="station-number">{{st}}</td><td class="screen-letter">{{screenLetter}}</td><td class="ink-name">{{screenCombined}}</td><td class="additives">{{add}}</td><td>{{mesh}}</td><td>{{strokes}}</td><td>{{angle}}</td><td>{{pressure}}</td><td>{{duro}}</td></tr>', station);
                        }
                    });
                }
                
                // Rellenar la plantilla del placement
                allPlacementsHtml += replacePlaceholders(placementTemplate, {
                    'placement.name': placement.name,
                    'placement.imageData': placement.imageData || 'https://via.placeholder.com/400x300/E31837/FFFFFF?text=No+Image',
                    'placement.inkType': placement.inkType,
                    'placement.dimensions': placement.dimensions,
                    'placement.placementDetails': placement.placementDetails,
                    'placement.specialties': placement.specialties || 'N/A',
                    'placement.temp': placement.temp,
                    'placement.time': placement.time,
                    'COLORS_HTML': colorsHtml,
                    'SEQUENCE_ROWS_HTML': sequenceRowsHtml,
                    'SPECIAL_INSTRUCTIONS_HTML': placement.specialInstructions ? replacePlaceholders('<div class="special-instructions"><h2 class="section-title">Instrucciones Especiales</h2><p class="instructions-text">{{instructions}}</p></div>', {instructions: placement.specialInstructions}) : ''
                });
            }
        }

        // 4. Rellenar la plantilla principal
        console.log('[PDF-PRO] Rellenando plantilla principal...');
        const finalHtml = replacePlaceholders(mainTemplate, {
            'tegraLogoUrl': window.LogoConfig?.TEGRA || '',
            'customerLogoUrl': window.resolveCustomerLogoUrl ? window.resolveCustomerLogoUrl(data.customer) : '',
            'appName': window.Config?.APP?.NAME || 'Tegra Spec Manager',
            'appVersion': window.Config?.APP?.VERSION || '2.0',
            'folder': data.folder,
            'customer': data.customer,
            'season': data.season,
            'style': data.style,
            'colorway': data.colorway,
            'po': data.po,
            'nameTeam': data.nameTeam,
            'sampleType': data.sampleType,
            'gender': data.gender,
            'pattern': data.pattern,
            'designer': data.designer,
            'generatedDate': new Date().toLocaleString('es-ES'),
            'PLACEMENTS_HTML': allPlacementsHtml
        });

        // 5. Renderizar el HTML a un canvas
        console.log('[PDF-PRO] Renderizando HTML a Canvas...');
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';//-9999px
        container.innerHTML = finalHtml;
        document.body.appendChild(container);

        const pdfContent = container.querySelector('#pdf-content');
        if (!pdfContent) throw new Error('El contenedor #pdf-content no se encontro en la plantilla.');
        
        const canvas = await html2canvas(pdfContent, { scale: 2, useCORS: true, logging: true });
        console.log('[PDF-PRO] Canvas generado. Creando PDF...');

        // 6. Crear el PDF desde el canvas
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'letter' });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasAspectRatio = canvas.width / canvas.height;
        const pdfAspectRatio = pdfWidth / pdfHeight;

        let finalCanvasHeight = pdfWidth / canvasAspectRatio;

        pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, pdfWidth, finalCanvasHeight, undefined, 'FAST');

        // Limpiar
        document.body.removeChild(container);
        console.log('[PDF-PRO] Limpieza del DOM completa.');

        // 7. Devolver el PDF como un Blob
        console.log('[PDF-PRO] Generacion de PDF completada con exito.');
        return pdf.output('blob');

    } catch (error) {
        console.error('[PDF-PRO] Ha ocurrido un error catastrofico durante la generacion del PDF:', error);
        throw error; // Lanzar el error para que la aplicacion principal lo maneje
    }
}

// Hacer la funcion accesible globalmente
window.generateProfessionalPDF = generateProfessionalPDF;
