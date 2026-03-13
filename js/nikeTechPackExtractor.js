/**
 * Nike Tech Pack Extractor V4 - Extracción precisa de placements
 */

class NikeTechPackExtractor {
    constructor() {
        console.log('🦁 NikeTechPackExtractor V4 inicializado');
        this.extractedData = {
            informacionGeneral: {},
            tallaBase: null,
            telas: [],
            tinta: null,
            placements: []
        };
        
        // Mapeo completo de códigos ELP
        this.ELP_MAPPING = {
            // COLLAR
            'ELP69': { ubicacion: 'COLLAR', descripcion: 'Escudo NFL - Cuello' },
            
            // FRONT
            'ELP52': { ubicacion: 'FRONT', descripcion: 'Números Frontales' },
            'ELP100': { ubicacion: 'FRONT', descripcion: 'Distancia entre números frontales' },
            
            // BACK
            'ELP92': { ubicacion: 'BACK', descripcion: 'Nameplate' },
            'ELP64': { ubicacion: 'BACK', descripcion: 'Números Traseros' },
            'ELP101': { ubicacion: 'BACK', descripcion: 'Distancia entre números traseros' },
            
            // CUSTOM (Jocktag)
            'ELP37': { ubicacion: 'CUSTOM', descripcion: 'Jocktag - Lateral' },
            'ELP38': { ubicacion: 'CUSTOM', descripcion: 'Jocktag - Inferior' },
            
            // TV NUMBERS
            'ELP67': { ubicacion: 'TV. NUMBERS', descripcion: 'Números TV - Hombros' },
            'ELP102': { ubicacion: 'TV. NUMBERS', descripcion: 'Distancia entre números TV' },
            
            // SLEEVE
            'ELP05': { ubicacion: 'SLEEVE', descripcion: 'Swoosh - Manga' },
            'ELP40': { ubicacion: 'SLEEVE', descripcion: 'Rayas de Manga' }
        };

        // Mapa de índices de tallas
        this.SIZE_INDICES = {
            'S': 0,
            'M': 1,
            'L': 2,
            'XL': 3,
            '2XL': 4,
            '3XL': 5
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
                
                // Agrupar por líneas para mejor estructura
                const lines = this.groupTextIntoLines(textContent.items);
                fullText += lines.join('\n') + '\n';
            }

            console.log('📄 Texto extraído del PDF');

            // 1. Primero encontrar la talla base
            this.extractedData.tallaBase = this.extractBaseSize(fullText);
            console.log(`📏 Talla base detectada: ${this.extractedData.tallaBase}`);

            // 2. Extraer información general
            this.extractedData.informacionGeneral = this.extractGeneralInfo(fullText);
            
            // 3. Extraer telas
            this.extractedData.telas = this.extractFabrics(fullText);
            
            // 4. Extraer tipo de tinta
            this.extractedData.tinta = this.extractInkType(fullText);
            
            // 5. Extraer placements (AHORA CON LA TALLA BASE)
            this.extractedData.placements = this.extractPlacementsPreciso(fullText);

            console.log('📊 Placements extraídos:', this.extractedData.placements);
            
            return this.extractedData;

        } catch (error) {
            console.error('Error procesando PDF:', error);
            throw error;
        }
    }

    groupTextIntoLines(items) {
        const lines = [];
        const itemsByY = {};
        
        // Agrupar por coordenada Y
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

        // Ordenar de arriba a abajo
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
        // Buscar Base Size en el texto
        const patterns = [
            /Base Size[^\n]*?([SML]|2XL|3XL|4XL|5XL)/i,
            /Base Size[^\n]*\n[^\n]*?([SML]|2XL|3XL|4XL|5XL)/i,
            /Base Size.*?[\s:]+([SML]|2XL|3XL|4XL|5XL)/i
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1].toUpperCase().replace(' ', '');
            }
        }
        
        return 'L';
    }

    extractPlacementsPreciso(text) {
        const placements = [];
        const tallaBase = this.extractedData.tallaBase || 'L';
        
        // 1. Encontrar la tabla de Graphic Placement
        const tableMatch = text.match(/Graphic Placement[\s\S]*?(?=Page|Measurement|$)/i);
        if (!tableMatch) {
            console.log('No se encontró tabla de Graphic Placement');
            return placements;
        }

        const tableText = tableMatch[0];
        
        // 2. Dividir en líneas y buscar cada ELP
        const lines = tableText.split('\n');
        let currentELP = null;
        let currentDesc = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Detectar inicio de un ELP
            if (line.match(/^ELP\d+/)) {
                // Procesar ELP anterior si existe
                if (currentELP) {
                    const placement = this.procesarLineaELP(currentELP, currentDesc, tallaBase);
                    if (placement) placements.push(placement);
                }
                
                // Extraer código y el resto de la línea
                const parts = line.split(/\s+/);
                currentELP = parts[0];
                currentDesc = parts.slice(1).join(' ');
            } 
            else if (currentELP) {
                // Continuar la descripción en la siguiente línea
                currentDesc += ' ' + line;
            }
        }
        
        // Procesar el último ELP
        if (currentELP) {
            const placement = this.procesarLineaELP(currentELP, currentDesc, tallaBase);
            if (placement) placements.push(placement);
        }
        
        return placements;
    }

    procesarLineaELP(codigo, descripcionCompleta, tallaBase) {
        // Verificar si el código está mapeado
        if (!this.ELP_MAPPING[codigo]) {
            return null;
        }

        const mapping = this.ELP_MAPPING[codigo];
        
        // 1. Extraer la descripción PURA (sin números)
        let descripcionPura = descripcionCompleta;
        
        // Quitar Yes/No
        descripcionPura = descripcionPura.replace(/\b(Yes|No)\b/gi, '').trim();
        
        // Quitar todos los números (son medidas y tolerancias)
        descripcionPura = descripcionPura.replace(/\d+\.?\d*/g, '').trim();
        
        // Limpiar espacios múltiples
        descripcionPura = descripcionPura.replace(/\s+/g, ' ').trim();
        
        // 2. Extraer TODOS los números de la línea
        const numbers = [];
        const numberMatches = descripcionCompleta.matchAll(/\b(\d+\.?\d*)\b/g);
        for (const match of numberMatches) {
            numbers.push(parseFloat(match[1]));
        }
        
        // 3. Encontrar el valor para la talla base
        // La estructura típica: [Yes/No] [Tol+] [Tol-] [S] [M] [L] [XL] [2XL] [3XL]
        let distancia = 'N/A';
        
        if (numbers.length >= 5) { // Mínimo: Tol+, Tol-, S, M, L
            // Mapa de índices según posición después de tolerancias
            const sizeIndexMap = {
                'S': 0,
                'M': 1,
                'L': 2,
                'XL': 3,
                '2XL': 4,
                '3XL': 5,
                '4XL': 6,
                '5XL': 7
            };
            
            // Los primeros 2 números son tolerancias (+ y -)
            const startIdx = 2;
            const sizeIndex = sizeIndexMap[tallaBase];
            
            if (sizeIndex !== undefined && (startIdx + sizeIndex) < numbers.length) {
                const valor = numbers[startIdx + sizeIndex];
                distancia = valor + ' cm';
                console.log(`📏 ${codigo} - Talla ${tallaBase}: ${distancia}`);
            }
        }
        
        return {
            codigo: codigo,
            ubicacion: mapping.ubicacion,
            descripcion: mapping.descripcion,
            descripcionIngles: descripcionPura,
            distancia: distancia,
            talla: tallaBase,
            raw: descripcionCompleta // Para debugging
        };
    }

    extractGeneralInfo(text) {
        const info = {};

        const styleMatch = text.match(/Style\s*#?\s*[:#]?\s*([A-Z0-9-]+)/i);
        if (styleMatch) info.styleNumber = styleMatch[1].trim();

        const seasonMatch = text.match(/Season\s*[:#]?\s*([^\n]+)/i);
        if (seasonMatch) info.season = seasonMatch[1].trim();

        // Detectar equipo
        const teams = ['Bills', 'Steelers', 'Cowboys', 'Eagles', 'Patriots', 'Chiefs', '49ers', 'Packers'];
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
        const bomSection = text.match(/Bill of Material[\s\S]*?(?=Measurement|Page|$)/i);
        
        if (bomSection) {
            const fabricMatches = bomSection[0].matchAll(/(\d+)\s*gsm[\s\S]*?(\d+%\s*[^\n]+)/gi);
            for (const match of fabricMatches) {
                telas.push({
                    peso: match[1] + ' gsm',
                    composicion: match[2].trim()
                });
            }
        }
        
        return telas;
    }

    extractInkType(text) {
        if (text.match(/High Solids Water Base/i)) {
            return { tipo: 'WATER', nombreCompleto: 'High Solids Water Base' };
        }
        if (text.match(/Water Base|Waterbase/i)) {
            return { tipo: 'WATER', nombreCompleto: 'Water Base' };
        }
        return { tipo: 'WATER', nombreCompleto: 'No especificado' };
    }
}

// Hacer disponible globalmente
window.NikeTechPackExtractor = NikeTechPackExtractor;
console.log('✅ NikeTechPackExtractor V4 cargado');
