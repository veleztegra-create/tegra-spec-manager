/**
 * Nike Tech Pack Extractor V5 - Extracción precisa con parsing de tabla
 */

class NikeTechPackExtractor {
    constructor() {
        console.log('🦁 NikeTechPackExtractor V5 inicializado');
        this.extractedData = {
            informacionGeneral: {},
            tallaBase: null,
            telas: [],
            tinta: null,
            placements: []
        };
        
        // Mapeo completo de códigos ELP con nombres en español
        this.ELP_MAPPING = {
            'ELP68': { ubicacion: 'COLLAR', nombreEs: 'Escudo NFL', nombreEn: 'NFL Shield' },
            'ELP69': { ubicacion: 'COLLAR', nombreEs: 'Escudo NFL - Cuello', nombreEn: 'NFL Shield - Collar' },
            'ELP01': { ubicacion: 'FRONT', nombreEs: 'Wordmark', nombreEn: 'Wordmark' },
            'ELP52': { ubicacion: 'FRONT', nombreEs: 'Números frontales', nombreEn: 'Front Numbers' },
            'ELP71': { ubicacion: 'FRONT', nombreEs: 'Distancia wordmark a números', nombreEn: 'Wordmark to numbers distance' },
            'ELP100': { ubicacion: 'FRONT', nombreEs: 'Distancia entre números frontales', nombreEn: 'Distance between front numbers' },
            'ELP27': { ubicacion: 'FRONT', nombreEs: 'Centrado horizontal wordmark/números', nombreEn: 'Center alignment' },
            'ELP73': { ubicacion: 'BACK', nombreEs: 'Logo espalda (CB)', nombreEn: 'Back logo (CB)' },
            'ELP08': { ubicacion: 'BACK', nombreEs: 'Nameplate - distancia desde costura cuello', nombreEn: 'Nameplate - distance from neck seam' },
            'ELP92': { ubicacion: 'BACK', nombreEs: 'Nameplate', nombreEn: 'Nameplate' },
            'ELP64': { ubicacion: 'BACK', nombreEs: 'Números traseros - distancia desde nameplate', nombreEn: 'Back numbers - distance from nameplate' },
            'ELP101': { ubicacion: 'BACK', nombreEs: 'Distancia entre números traseros', nombreEn: 'Distance between back numbers' },
            'ELP28': { ubicacion: 'BACK', nombreEs: 'Centrado horizontal', nombreEn: 'Center alignment' },
            'ELP67': { ubicacion: 'TV. NUMBERS', nombreEs: 'Números TV - centrado en hombro', nombreEn: 'TV Numbers - centered on shoulder' },
            'ELP102': { ubicacion: 'TV. NUMBERS', nombreEs: 'Distancia entre números TV', nombreEn: 'Distance between TV numbers' },
            'ELP79': { ubicacion: 'SLEEVE', nombreEs: 'Swoosh - manga', nombreEn: 'Swoosh - sleeve' },
            'ELP05': { ubicacion: 'SLEEVE', nombreEs: 'Swoosh - manga', nombreEn: 'Swoosh - sleeve' },
            'ELP40': { ubicacion: 'SLEEVE', nombreEs: 'Rayas de manga', nombreEn: 'Sleeve stripes' },
            'ELP37': { ubicacion: 'CUSTOM', nombreEs: 'Jocktag - distancia desde costura lateral', nombreEn: 'Jocktag - distance from side seam' },
            'ELP38': { ubicacion: 'CUSTOM', nombreEs: 'Jocktag - distancia desde dobladillo inferior', nombreEn: 'Jocktag - distance from bottom hem' }
        };
    }

    async procesarPDF(pdfFile) {
        try {
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF.js no está cargado');
            }

            const arrayBuffer = pdfFile instanceof File 
                ? await pdfFile.arrayBuffer() 
                : pdfFile;

            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const lines = this.groupTextIntoLines(textContent.items);
                fullText += lines.join('\n') + '\n';
            }

            console.log('📄 Texto extraído del PDF');

            // Extraer talla base (buscar específicamente "Base Size")
            this.extractedData.tallaBase = this.extractBaseSize(fullText);
            console.log(`📏 Talla base detectada: ${this.extractedData.tallaBase}`);

            // Extraer información general
            this.extractedData.informacionGeneral = this.extractGeneralInfo(fullText);
            
            // Extraer telas
            this.extractedData.telas = this.extractFabrics(fullText);
            
            // Extraer tipo de tinta
            this.extractedData.tinta = this.extractInkType(fullText);
            
            // Extraer placements usando la tabla correcta
            this.extractedData.placements = this.extractPlacementsFromTable(fullText);

            console.log('📊 Placements extraídos:', this.extractedData.placements.length);
            
            return this.extractedData;

        } catch (error) {
            console.error('Error procesando PDF:', error);
            throw error;
        }
    }

    groupTextIntoLines(items) {
        const lines = [];
        const itemsByY = {};
        
        items.forEach(item => {
            const y = Math.round(item.transform[5]);
            if (!itemsByY[y]) {
                itemsByY[y] = [];
            }
            itemsByY[y].push({
                text: item.str,
                x: item.transform[4]
            });
        });

        const sortedY = Object.keys(itemsByY).sort((a, b) => b - a);
        
        sortedY.forEach(y => {
            const lineItems = itemsByY[y].sort((a, b) => a.x - b.x);
            const lineText = lineItems.map(item => item.text).join(' ').trim();
            if (lineText) {
                lines.push(lineText);
            }
        });

        return lines;
    }

    extractBaseSize(text) {
        // Buscar "Base Size" en la tabla de Graphic Placement
        const baseSizeMatch = text.match(/Base Size\s*([SMLXL2XL3XL4XL5XL]+)/i);
        if (baseSizeMatch) {
            return baseSizeMatch[1].toUpperCase();
        }
        
        // Patrón alternativo
        const altMatch = text.match(/Base Size[^\n]*?([SML]|2XL|3XL|4XL|5XL)/i);
        if (altMatch) {
            return altMatch[1].toUpperCase();
        }
        
        return 'L';
    }

    extractPlacementsFromTable(text) {
        const placements = [];
        const tallaBase = this.extractedData.tallaBase || 'L';
        
        // Mapeo de índices de columnas según el orden en la tabla
        // Orden típico: Name, Description, QC, Tol(+), Tol(-), S, M, L, XL, 2XL, 3XL, 4XL, 5XL
        const sizeColumns = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
        const targetColIndex = sizeColumns.indexOf(tallaBase);
        
        // Buscar la sección de Graphic Placement
        // El PDF muestra una tabla con ELP codes en la página 20
        const tableStart = text.search(/Graphic Placement[\s\S]*?Base Size/i);
        if (tableStart === -1) {
            console.log('⚠️ No se encontró tabla de Graphic Placement');
            return [];
        }
        
        // Extraer hasta la siguiente tabla o sección
        let tableSection = text.slice(tableStart);
        const tableEnd = tableSection.search(/\n\s*\n\s*(?:Page|\d+\s*$)/i);
        if (tableEnd !== -1) {
            tableSection = tableSection.slice(0, tableEnd);
        }
        
        // Dividir en líneas
        const lines = tableSection.split('\n');
        
        // Buscar líneas que contengan ELP codes
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Buscar código ELP
            const elpMatch = line.match(/^(ELP\d+)/i);
            if (!elpMatch) continue;
            
            const codigo = elpMatch[1].toUpperCase();
            if (!this.ELP_MAPPING[codigo]) continue;
            
            const mapping = this.ELP_MAPPING[codigo];
            
            // Extraer todos los números de la línea (incluyendo tolerancias y valores por talla)
            const numbers = [];
            const numberMatches = line.matchAll(/\b(\d+\.?\d*)\b/g);
            for (const match of numberMatches) {
                numbers.push(parseFloat(match[1]));
            }
            
            // Estructura típica: [Tol+] [Tol-] [S] [M] [L] [XL] [2XL] [3XL] [4XL] [5XL]
            // A veces vienen con Yes/No antes
            let startIdx = 0;
            
            // Si hay "Yes" o "No" al inicio, saltarlo
            if (line.match(/^(ELP\d+\s+(Yes|No))/i)) {
                startIdx = 2; // Saltar el Yes/No
            }
            
            // Los primeros 2 números después del código son tolerancias (+ y -)
            const toleranciaPos = numbers[startIdx] || 0;
            const toleranciaNeg = numbers[startIdx + 1] || 0;
            
            // Calcular índice para la talla base
            const valueIndex = startIdx + 2 + targetColIndex;
            let distancia = null;
            let unidad = 'cm';
            
            if (valueIndex < numbers.length) {
                distancia = numbers[valueIndex];
            }
            
            // Si no hay valor numérico, buscar "0" (centrado)
            if (distancia === null || isNaN(distancia)) {
                distancia = 0;
            }
            
            // Determinar si es una medida de distancia o centrado
            const esCentrado = (codigo === 'ELP27' || codigo === 'ELP28' || codigo === 'ELP67');
            
            // Construir descripción clara en español
            let descripcionEs = mapping.nombreEs;
            let instruccionEs = '';
            
            switch(codigo) {
                case 'ELP100':
                case 'ELP101':
                    instruccionEs = distancia === 0 ? 'números centrados' : `distancia entre números: ${distancia} ${unidad}`;
                    break;
                case 'ELP71':
                    instruccionEs = `desde wordmark hasta números: ${distancia} ${unidad}`;
                    break;
                case 'ELP08':
                    instruccionEs = `desde costura cuello hasta nameplate: ${distancia} ${unidad}`;
                    break;
                case 'ELP64':
                    instruccionEs = `desde nameplate hasta números: ${distancia} ${unidad}`;
                    break;
                case 'ELP102':
                    instruccionEs = distancia === 0 ? 'números TV centrados' : `distancia entre números TV: ${distancia} ${unidad}`;
                    break;
                case 'ELP37':
                    instruccionEs = `desde costura lateral: ${distancia} ${unidad}`;
                    break;
                case 'ELP38':
                    instruccionEs = `desde dobladillo inferior: ${distancia} ${unidad}`;
                    break;
                case 'ELP40':
                    instruccionEs = `rayas desde borde de manga: ${distancia} ${unidad}`;
                    break;
                case 'ELP79':
                    instruccionEs = `swoosh desde borde de manga: ${distancia} ${unidad}`;
                    break;
                default:
                    if (esCentrado) {
                        instruccionEs = 'centrado horizontalmente';
                    } else if (distancia !== null && distancia !== 0) {
                        instruccionEs = `${distancia} ${unidad} desde referencia`;
                    } else {
                        instruccionEs = 'según especificación';
                    }
            }
            
            // Descripción final limpia
            let descripcionFinal = descripcionEs;
            if (instruccionEs && instruccionEs !== 'según especificación') {
                descripcionFinal += `: ${instruccionEs}`;
            }
            
            placements.push({
                codigo: codigo,
                ubicacion: mapping.ubicacion,
                nombre: mapping.nombreEs,
                descripcion: descripcionFinal,
                descripcionOriginal: mapping.nombreEn,
                medida: distancia !== null ? `${distancia} ${unidad}` : 'N/A',
                tolerancia: `+${toleranciaPos}/${toleranciaNeg} ${unidad}`,
                talla: tallaBase,
                esCentrado: esCentrado || distancia === 0
            });
            
            console.log(`✅ ${codigo} - ${mapping.nombreEs}: ${distancia} ${unidad} (talla ${tallaBase})`);
        }
        
        return placements;
    }

    extractGeneralInfo(text) {
        const info = {};

        const styleMatch = text.match(/Style\s*#?\s*[:#]?\s*([A-Z0-9-]+)/i);
        if (styleMatch) info.styleNumber = styleMatch[1].trim();

        const seasonMatch = text.match(/Seasonal Plan[\s:]*([^\n]+)/i);
        if (seasonMatch) info.season = seasonMatch[1].trim();

        // Detectar equipo
        const teams = ['Bills', 'Steelers', 'Cowboys', 'Eagles', 'Patriots', 'Chiefs', '49ers', 'Packers', 'Dolphins', 'Giants'];
        for (const team of teams) {
            if (text.includes(team)) {
                info.equipo = team;
                break;
            }
        }

        return info;
    }

    extractFabrics(text) {
        const telas = [];
        const bomSection = text.match(/Bill of Material[\s\S]*?(?=Page|$)/i);
        
        if (bomSection) {
            // Buscar telas tipo Knit
            const knitMatches = bomSection[0].matchAll(/Knit\s+([A-Z0-9]+).*?(\d+\s*gsm)/gi);
            for (const match of knitMatches) {
                telas.push({
                    tipo: 'Tejido',
                    nombre: match[1],
                    peso: match[2]
                });
            }
        }
        
        return telas;
    }

    extractInkType(text) {
        if (text.match(/High Solids Water Base/i)) {
            return { tipo: 'WATER', nombreCompleto: 'High Solids Water Base (Base de agua de alto sólido)' };
        }
        if (text.match(/Water Base|Waterbase/i)) {
            return { tipo: 'WATER', nombreCompleto: 'Water Base (Base de agua)' };
        }
        if (text.match(/Plastisol/i)) {
            return { tipo: 'PLASTISOL', nombreCompleto: 'Plastisol' };
        }
        return { tipo: 'WATER', nombreCompleto: 'Base de agua' };
    }
}

window.NikeTechPackExtractor = NikeTechPackExtractor;
console.log('✅ NikeTechPackExtractor V5 cargado');
