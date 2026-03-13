/**
 * Nike Tech Pack Extractor V3 - Extracción precisa de placements por talla base
 */

class NikeTechPackExtractor {
    constructor() {
        console.log('🦁 NikeTechPackExtractor V3 inicializado');
        this.extractedData = {
            informacionGeneral: {},
            tallaBase: null,
            telas: [],
            tinta: null,
            placements: []
        };
        
        // Mapeo completo de ELP codes
        this.ELP_MAPPING = {
            // COLLAR
            'ELP69': { ubicacion: 'COLLAR', descripcion: 'Escudo NFL - Cuello' },
            
            // FRONT
            'ELP52': { ubicacion: 'FRONT', descripcion: 'Números Frontales' },
            'ELP100': { ubicacion: 'FRONT', descripcion: 'Distancia entre números frontales' },
            'ELP27': { ubicacion: 'FRONT', descripcion: 'Centrado de números frontales' },
            
            // BACK
            'ELP92': { ubicacion: 'BACK', descripcion: 'Nameplate' },
            'ELP64': { ubicacion: 'BACK', descripcion: 'Números Traseros' },
            'ELP101': { ubicacion: 'BACK', descripcion: 'Distancia entre números traseros' },
            'ELP28': { ubicacion: 'BACK', descripcion: 'Nameplate/Números - Centrado' },
            
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
            '3XL': 5,
            '4XL': 6,
            '5XL': 7
        };
    }

    async procesarPDF(pdfFile) {
        try {
            // Extraer texto del PDF
            const text = await this.extractTextFromPDF(pdfFile);
            
            // Encontrar talla base PRIMERO
            this.extractedData.tallaBase = this.extractBaseSize(text);
            console.log(`📏 Talla base detectada: ${this.extractedData.tallaBase}`);
            
            // Extraer placements usando la talla base
            this.extractedData.placements = this.extractPlacementsRobust(text);
            
            // Extraer demás información
            this.extractedData.informacionGeneral = this.extractGeneralInfo(text);
            this.extractedData.telas = this.extractFabrics(text);
            this.extractedData.tinta = this.extractInkType(text);
            
            console.log('📊 Placements extraídos:', this.extractedData.placements);
            return this.extractedData;
            
        } catch (error) {
            console.error('Error procesando PDF:', error);
            throw error;
        }
    }

    async extractTextFromPDF(pdfFile) {
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
                
                // Agrupar por líneas para preservar estructura
                const itemsByY = {};
                textContent.items.forEach(item => {
                    const y = Math.round(item.transform[5]);
                    if (!itemsByY[y]) itemsByY[y] = [];
                    itemsByY[y].push({
                        text: item.str,
                        x: item.transform[4]
                    });
                });

                // Ordenar líneas de arriba a abajo
                const sortedY = Object.keys(itemsByY).sort((a, b) => b - a);
                
                sortedY.forEach(y => {
                    const lineItems = itemsByY[y].sort((a, b) => a.x - b.x);
                    const lineText = lineItems.map(item => item.text).join(' ').trim();
                    if (lineText) {
                        fullText += lineText + '\n';
                    }
                });
                
                fullText += '\n';
            }

            return fullText;
        } catch (error) {
            console.error('Error extrayendo texto:', error);
            throw error;
        }
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
        
        // Buscar en sección de Graphic Placement
        const placementSection = text.match(/Graphic Placement[\s\S]*?Base Size[^\n]*/i);
        if (placementSection) {
            const sizeMatch = placementSection[0].match(/([SML]|2XL|3XL|4XL|5XL)/i);
            if (sizeMatch) {
                return sizeMatch[1].toUpperCase().replace(' ', '');
            }
        }
        
        console.log('⚠️ No se encontró talla base, usando L por defecto');
        return 'L';
    }

    extractPlacementsRobust(text) {
        const placements = [];
        const tallaBase = this.extractedData.tallaBase || 'L';
        
        // 1. Encontrar la tabla de Graphic Placement
        const tableMatch = text.match(/Graphic Placement[\s\S]*?(?=Page|$)/i);
        if (!tableMatch) {
            console.log('❌ No se encontró tabla de Graphic Placement');
            return placements;
        }
        
        const tableText = tableMatch[0];
        
        // 2. Encontrar el orden de las tallas en la tabla
        const headerLines = tableText.split('\n').slice(0, 10);
        let sizeOrder = [];
        
        for (const line of headerLines) {
            const sizes = line.match(/\b(S|M|L|XL|2XL|3XL|4XL|5XL)\b/g);
            if (sizes && sizes.length >= 3) {
                sizeOrder = sizes.map(s => s.toUpperCase());
                break;
            }
        }
        
        if (sizeOrder.length === 0) {
            sizeOrder = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
        }
        
        console.log('📋 Orden de tallas detectado:', sizeOrder);
        console.log(`🎯 Buscando valores para talla base: ${tallaBase}`);
        
        // 3. Extraer cada fila de ELP
        const lines = tableText.split('\n');
        let currentELP = null;
        let currentDesc = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Detectar inicio de ELP
            if (line.match(/^ELP\d+/)) {
                // Si ya teníamos un ELP pendiente, procesarlo
                if (currentELP) {
                    const placement = this.processELPLine(currentELP, currentDesc, sizeOrder, tallaBase);
                    if (placement) placements.push(placement);
                }
                
                // Extraer código y parte inicial de la descripción
                const parts = line.split(/\s+/);
                currentELP = parts[0];
                currentDesc = parts.slice(1).join(' ');
            } 
            else if (currentELP) {
                // Continuar descripción en múltiples líneas
                currentDesc += ' ' + line;
            }
        }
        
        // Procesar el último ELP
        if (currentELP) {
            const placement = this.processELPLine(currentELP, currentDesc, sizeOrder, tallaBase);
            if (placement) placements.push(placement);
        }
        
        return placements;
    }

    processELPLine(codigo, descripcionCompleta, sizeOrder, tallaBase) {
        // Limpiar descripción
        let descripcion = descripcionCompleta.replace(/\s+/g, ' ').trim();
        
        // Encontrar Yes/No
        const ynMatch = descripcion.match(/\b(Yes|No)\b/i);
        const tieneYN = ynMatch ? ynMatch[1] : 'No';
        
        // Encontrar todos los números en la línea
        const numbers = [];
        const numberMatches = descripcion.matchAll(/\b(\d+\.?\d*)\b/g);
        for (const match of numberMatches) {
            numbers.push(parseFloat(match[1]));
        }
        
        // Verificar si el código está mapeado
        if (!this.ELP_MAPPING[codigo]) {
            console.log(`ℹ️ Código no mapeado: ${codigo} - ${descripcion.substring(0, 50)}...`);
            return null;
        }
        
        const mapping = this.ELP_MAPPING[codigo];
        
        // Extraer la descripción pura (sin números ni Yes/No)
        let descripcionPura = descripcion;
        
        // Quitar Yes/No de la descripción
        if (ynMatch) {
            descripcionPura = descripcionPura.replace(ynMatch[0], '').trim();
        }
        
        // Quitar números del final (son las medidas)
        const lastNumberIndex = descripcionPura.search(/\d+\.?\d*\s*$/);
        if (lastNumberIndex > 0) {
            descripcionPura = descripcionPura.substring(0, lastNumberIndex).trim();
        }
        
        // Quitar códigos ELP del inicio
        descripcionPura = descripcionPura.replace(/^ELP\d+\s*/, '').trim();
        
        // Encontrar el valor para la talla base
        let valorTallaBase = 'N/A';
        
        if (numbers.length > 0) {
            // Los primeros 2 números después de Yes/No son tolerancias
            const startIdx = 2;
            
            // Encontrar índice de la talla base en el orden
            const sizeIndex = sizeOrder.indexOf(tallaBase);
            if (sizeIndex !== -1) {
                const valueIndex = startIdx + sizeIndex;
                if (valueIndex < numbers.length) {
                    valorTallaBase = numbers[valueIndex] + ' cm';
                } else {
                    console.log(`⚠️ No hay valor para talla ${tallaBase} en ${codigo}`);
                }
            } else {
                // Si no encontramos la talla, usar L como fallback (índice 2)
                const fallbackIndex = startIdx + 2;
                if (fallbackIndex < numbers.length) {
                    valorTallaBase = numbers[fallbackIndex] + ' cm';
                    console.log(`ℹ️ Usando fallback L para ${codigo}`);
                }
            }
        }
        
        // Crear objeto placement
        return {
            codigo: codigo,
            ubicacion: mapping.ubicacion,
            descripcion: mapping.descripcion,
            descripcionIngles: descripcionPura,
            distancia: valorTallaBase,
            talla: tallaBase,
            tieneYN: tieneYN
        };
    }

    extractGeneralInfo(text) {
        const info = {};

        const marketingMatch = text.match(/Marketing Name[^\n]*([^\n]+)/i);
        if (marketingMatch) info.nombreMarketing = marketingMatch[1].trim();

        const styleMatch = text.match(/Style[ #]*([A-Z0-9-]+)/i);
        if (styleMatch) info.styleNumber = styleMatch[1].trim();

        const seasonMatch = text.match(/Season[^\n]*([^\n]+)/i);
        if (seasonMatch) info.season = seasonMatch[1].trim();

        // Detectar equipo
        const teams = ['Steelers', 'Bills', 'Cowboys', 'Eagles', 'Patriots', 'Chiefs', '49ers', 'Packers'];
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
console.log('✅ NikeTechPackExtractor V3 cargado');
