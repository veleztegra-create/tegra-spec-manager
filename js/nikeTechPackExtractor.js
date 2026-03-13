/**
 * Nike Tech Pack Extractor V2
 * Módulo robusto para extraer información de tech packs de Nike desde PDF
 */

// ============================================
// CONFIGURACIÓN Y DICCIONARIOS
// ============================================

const CONFIG = {
    TALLAS: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    KEYWORDS: {
        tallaBase: ['Base Size', 'Talla Base', 'Size Scale'],
        tela: ['Fabric', 'Tela', 'Knit', 'Tricot', 'Mesh', 'Material'],
        tinta: ['Water Base', 'Plastisol', 'Silicone', 'High Solids', 'Ink Type'],
        placement: ['Graphic Placement', 'Placement', 'ELP', 'Graphic'],
        measurement: ['Measurement', 'Medida', 'QC Tol', 'Chart']
    }
};

const TRADUCCIONES = {
    'CF': 'FRONT (Frente)',
    'Center Front': 'FRONT (Frente)',
    'CB': 'BACK (Espalda)',
    'Center Back': 'BACK (Espalda)',
    'Sleeve': 'SLEEVE (Manga)',
    'Left Sleeve': 'SLEEVE (Manga)',
    'Right Sleeve': 'SLEEVE (Manga)',
    'Shoulder': 'SHOULDER (Hombro)',
    'TV Numbers': 'TV. NUMBERS (Números TV)',
    'Chest': 'CHEST (Pecho)',
    'Collar': 'COLLAR (Cuello)',
    'Neck': 'COLLAR (Cuello)',
    'Jocktag': 'CUSTOM (Jocktag)',
    'Nameplate': 'BACK (Nameplate)',
    'Water Base': 'Water-base',
    'High Solids Water Base': 'Water-base',
    'Plastisol': 'Plastisol',
    'Silicone': 'Silicone'
};

const ELP_MAPPING = {
    'ELP68': { ubicacion: 'COLLAR', descripcion: 'Escudo NFL - Centrado en cuello' },
    'ELP69': { ubicacion: 'COLLAR', descripcion: 'Escudo NFL - Cuello trasero' },
    'ELP66': { ubicacion: 'COLLAR', descripcion: 'Back Neck Band - Cinta cuello' },
    'ELP01': { ubicacion: 'FRONT', descripcion: 'Wordmark - Centro frente' },
    'ELP71': { ubicacion: 'FRONT', descripcion: 'Números Frontales' },
    'ELP27': { ubicacion: 'FRONT', descripcion: 'Centrado Wordmark/Números' },
    'ELP73': { ubicacion: 'BACK', descripcion: 'Logo trasero centrado' },
    'ELP08': { ubicacion: 'BACK', descripcion: 'Nameplate' },
    'ELP64': { ubicacion: 'BACK', descripcion: 'Números Traseros' },
    'ELP28': { ubicacion: 'BACK', descripcion: 'Centrado Logo/Nameplate' },
    'ELP100': { ubicacion: 'FRONT', descripcion: 'Distancia entre números frontales' },
    'ELP67': { ubicacion: 'TV. NUMBERS', descripcion: 'Números de Hombro' },
    'ELP79': { ubicacion: 'SLEEVE', descripcion: 'Swoosh en manga' },
    'ELP40': { ubicacion: 'SLEEVE', descripcion: 'Rayas de Manga' },
    'ELP37': { ubicacion: 'CUSTOM', descripcion: 'Jocktag lateral' },
    'ELP38': { ubicacion: 'CUSTOM', descripcion: 'Jocktag vertical' }
};

// ============================================
// CLASE PRINCIPAL EXTRACTORA
// ============================================

class NikeTechPackExtractor {
    constructor() {
        console.log('🦁 NikeTechPackExtractor V2 inicializado');
        this.extractedData = {
            informacionGeneral: {},
            tallaBase: null,
            telas: [],
            tinta: null,
            placements: []
        };
        this.debug = [];
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
            let pages = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                
                // Mejorar la extracción: agrupar por coordenadas para reconstruir líneas
                const items = textContent.items.sort((a, b) => {
                    if (Math.abs(a.transform[5] - b.transform[5]) < 5) {
                        return a.transform[4] - b.transform[4];
                    }
                    return b.transform[5] - a.transform[5];
                });

                let pageText = '';
                let lastY = null;
                
                items.forEach(item => {
                    const y = Math.round(item.transform[5]);
                    if (lastY !== null && Math.abs(y - lastY) > 5) {
                        pageText += '\n';
                    }
                    pageText += item.str + ' ';
                    lastY = y;
                });

                pages.push({
                    numero: i,
                    texto: pageText
                });
                
                fullText += `===== PAGE ${i} START =====\n${pageText}\n===== PAGE ${i} END =====\n\n`;
            }

            return { fullText, pages };
        } catch (error) {
            console.error('Error extrayendo texto del PDF:', error);
            throw error;
        }
    }

    parseTechPackText(extracted) {
        const text = typeof extracted === 'string' ? extracted : extracted.fullText;
        
        this.extractedData = {
            informacionGeneral: this.extractGeneralInfo(text),
            tallaBase: this.extractBaseSize(text),
            telas: this.extractFabrics(text),
            tinta: this.extractInkType(text),
            placements: this.extractPlacementsRobust(text)
        };

        return this.extractedData;
    }

    extractGeneralInfo(text) {
        const info = {};

        const marketingNameMatch = text.match(/Marketing Name\s*[:#]?\s*([^\n\r]+)/i);
        if (marketingNameMatch) {
            info.nombreMarketing = marketingNameMatch[1].trim();
        }

        const styleMatch = text.match(/Style\s*#?\s*[:#]?\s*([A-Z0-9-]+)/i);
        if (styleMatch) {
            info.styleNumber = styleMatch[1].trim();
        }

        const seasonMatch = text.match(/Season(?:al Plan)?\s*[:#]?\s*([^\n\r]+)/i);
        if (seasonMatch) {
            info.season = seasonMatch[1].trim();
        }

        // Detectar equipo y tipo
        const teams = ['Bills', 'Bengals', 'Ravens', 'Steelers', 'Cowboys', 'Eagles', 'Giants', 
                      'Commanders', '49ers', 'Rams', 'Seahawks', 'Cardinals', 'Chiefs', 'Raiders', 
                      'Broncos', 'Chargers', 'Packers', 'Bears', 'Lions', 'Vikings', 'Saints', 
                      'Buccaneers', 'Falcons', 'Panthers', 'Patriots', 'Jets', 'Dolphins', 
                      'Jaguars', 'Colts', 'Titans', 'Texans'];
        
        const types = ['Home', 'Road', 'Away', 'Alternate', 'Local', 'Visitante'];
        
        const teamRegex = new RegExp(`(${teams.join('|')})\\s+(${types.join('|')})`, 'i');
        const teamMatch = text.match(teamRegex);
        
        if (teamMatch) {
            info.equipo = teamMatch[1];
            info.tipo = teamMatch[2];
        }

        return info;
    }

    extractBaseSize(text) {
        // Buscar patrones comunes de talla base
        const patterns = [
            /Base Size[^\n]*?\b([SML]|2XL|3XL|4XL|5XL)\b/i,
            /Size Scale[^\n]*?\b([SML]|2XL|3XL|4XL|5XL)\b/i,
            /Base Size.*?[:\s]+([SML]|2XL|3XL|4XL|5XL)/i,
            /Base Size.*?\n.*?\b([SML]|2XL|3XL|4XL|5XL)\b/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1].toUpperCase();
            }
        }

        // Buscar en sección de Graphic Placement
        const placementSection = this.extractSection(text, ['Graphic Placement', 'Placement']);
        if (placementSection) {
            const baseMatch = placementSection.match(/Base Size[^\n]*?\b([SML]|2XL|3XL|4XL|5XL)\b/i);
            if (baseMatch) return baseMatch[1].toUpperCase();
        }

        return 'L'; // Default
    }

    extractFabrics(text) {
        const telas = [];
        const bomSection = this.extractSection(text, ['Bill of Material', 'BOM', 'Materials']);
        
        if (!bomSection) return telas;

        // Buscar telas en BOM
        const fabricPatterns = [
            {
                regex: /Knit\s+(\w+)[\s\S]*?(\d+)\s*gsm[\s\S]*?(\d+%\s*[^\n]+)/i,
                tipo: 'Knit Principal'
            },
            {
                regex: /Flat Knit Rib[\s\S]*?(\d+)\s*gsm[\s\S]*?(\d+%\s*[^\n]+)/i,
                tipo: 'Rib (Cuello)'
            },
            {
                regex: /Mesh[\s\S]*?(\d+)\s*gsm[\s\S]*?(\d+%\s*[^\n]+)/i,
                tipo: 'Mesh'
            },
            {
                regex: /Tricot[\s\S]*?(\d+)\s*gsm[\s\S]*?(\d+%\s*[^\n]+)/i,
                tipo: 'Tricot'
            }
        ];

        fabricPatterns.forEach(pattern => {
            const matches = bomSection.matchAll(new RegExp(pattern.regex, 'gi'));
            for (const match of matches) {
                telas.push({
                    nombre: match[1] || pattern.tipo,
                    tipo: pattern.tipo,
                    peso: match[2] ? match[2] + ' gsm' : 'N/A',
                    composicion: match[3] || 'N/A'
                });
            }
        });

        // Si no encuentra con patrones específicos, buscar composiciones
        if (telas.length === 0) {
            const composicionMatches = bomSection.match(/(\d+%\s*(?:Polyester|Recycled Polyester|Cotton|Nylon|Elastane|Spandex)[^\n]*)/gi);
            if (composicionMatches) {
                composicionMatches.forEach((comp, index) => {
                    telas.push({
                        nombre: `Fabric ${index + 1}`,
                        tipo: index === 0 ? 'Principal' : 'Secundaria',
                        composicion: comp.trim()
                    });
                });
            }
        }

        return telas;
    }

    extractInkType(text) {
        const inkPatterns = [
            { regex: /High Solids Water Base/i, tipo: 'WATER', nombre: 'High Solids Water Base Print' },
            { regex: /Water Base|Waterbase/i, tipo: 'WATER', nombre: 'Water Base Print' },
            { regex: /Plastisol/i, tipo: 'PLASTISOL', nombre: 'Plastisol Print' },
            { regex: /Silicone/i, tipo: 'SILICONE', nombre: 'Silicone Print' }
        ];

        for (const pattern of inkPatterns) {
            if (text.match(pattern.regex)) {
                return {
                    tipo: pattern.tipo,
                    nombreCompleto: pattern.nombre,
                    descripcion: `Impresión ${pattern.tipo.toLowerCase()}`
                };
            }
        }

        return {
            tipo: 'WATER',
            nombreCompleto: 'No especificado (asumiendo Water-base)',
            descripcion: 'Tipo de tinta no especificado'
        };
    }

    extractSection(text, keywords) {
        for (const keyword of keywords) {
            const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`${escapedKeyword}[\\s\\S]*?(?=(?:Page|PAGE|\\n=====|$))`, 'i');
            const match = text.match(regex);
            if (match) {
                return match[0];
            }
        }
        return null;
    }

    extractPlacementsRobust(text) {
        const placements = [];
        const tallaBase = this.extractedData.tallaBase || 'L';
        
        // 1. Encontrar la sección de Graphic Placement
        const placementSection = this.extractSection(text, ['Graphic Placement', 'Placement', 'ELP']);
        
        if (!placementSection) {
            console.log('No se encontró sección de Graphic Placement');
            return placements;
        }

        // 2. Detectar el orden de las tallas en la tabla
        const sizeOrder = this.detectSizeOrder(placementSection);
        
        // 3. Extraer todas las filas de ELP
        const elpRows = this.extractELPRows(placementSection);
        
        // 4. Procesar cada fila
        elpRows.forEach(row => {
            const placement = this.processELPRow(row, sizeOrder, tallaBase);
            if (placement) {
                placements.push(placement);
            }
        });

        return placements;
    }

    detectSizeOrder(text) {
        const sizeOrder = [];
        const sizePattern = /\b(S|M|L|XL|2XL|3XL|4XL|5XL)\b/g;
        
        // Buscar en las primeras líneas de la tabla
        const lines = text.split('\n').slice(0, 20);
        
        for (const line of lines) {
            const matches = [...line.matchAll(sizePattern)];
            if (matches.length >= 3) {
                matches.forEach(match => {
                    const size = match[1].toUpperCase();
                    if (!sizeOrder.includes(size)) {
                        sizeOrder.push(size);
                    }
                });
                if (sizeOrder.length > 0) break;
            }
        }

        // Si no detecta, usar orden por defecto
        if (sizeOrder.length === 0) {
            return ['S', 'M', 'L', 'XL', '2XL', '3XL'];
        }

        return sizeOrder;
    }

    extractELPRows(text) {
        const rows = [];
        
        // Dividir por ELP codes
        const elpBlocks = text.split(/(?=ELP\d+)/g);
        
        elpBlocks.forEach(block => {
            if (block.match(/ELP\d+/)) {
                // Limpiar el bloque
                const cleanBlock = block.replace(/\s+/g, ' ').trim();
                
                // Extraer código ELP
                const codeMatch = cleanBlock.match(/(ELP\d+)/);
                if (!codeMatch) return;
                
                const codigo = codeMatch[1];
                
                // Extraer descripción (todo hasta el primer número o Yes/No)
                const descMatch = cleanBlock.match(/ELP\d+\s+([^0-9\n]+?)\s+(Yes|No)/i);
                const descripcion = descMatch ? descMatch[1].trim() : '';
                
                // Extraer números (valores de medidas)
                const numbers = cleanBlock.match(/\b\d+(?:\.\d+)?\b/g) || [];
                
                // Buscar Yes/No
                const ynMatch = cleanBlock.match(/\b(Yes|No)\b/i);
                const tieneYN = ynMatch ? ynMatch[1] : 'No';
                
                rows.push({
                    codigo,
                    descripcion,
                    tieneYN,
                    numbers: numbers.map(n => parseFloat(n))
                });
            }
        });

        return rows;
    }

    processELPRow(row, sizeOrder, tallaBase) {
        if (!row || !row.codigo || !ELP_MAPPING[row.codigo]) {
            return null;
        }

        const mapping = ELP_MAPPING[row.codigo];
        
        // Encontrar el índice de la talla base en el orden detectado
        const sizeIndex = sizeOrder.indexOf(tallaBase);
        
        // Si no encuentra la talla, usar L como fallback
        const targetIndex = sizeIndex !== -1 ? sizeIndex : sizeOrder.indexOf('L');
        
        // Obtener el valor correspondiente
        let distancia = 'N/A';
        
        // Los números pueden incluir valores de tolerancia y medidas
        // Asumiendo que después de Yes/No vienen los valores por talla
        if (row.numbers.length > 0) {
            // Saltar tolerancias si existen (primeros 2 números después de Yes/No)
            const startIdx = row.tieneYN ? 2 : 0;
            const valueIndex = startIdx + targetIndex;
            
            if (valueIndex < row.numbers.length) {
                distancia = row.numbers[valueIndex] + ' cm';
            } else if (row.numbers.length > targetIndex) {
                distancia = row.numbers[targetIndex] + ' cm';
            }
        }

        return {
            codigo: row.codigo,
            ubicacion: mapping.ubicacion,
            descripcion: mapping.descripcion,
            descripcionIngles: row.descripcion,
            distancia: distancia,
            talla: tallaBase,
            rawData: row // Para debugging
        };
    }

    async procesarPDF(pdfFile) {
        try {
            const extracted = await this.extractTextFromPDF(pdfFile);
            const result = this.parseTechPackText(extracted);
            
            console.log('📊 Datos extraídos:', result);
            console.log('📝 Debug:', this.debug);
            
            return result;
        } catch (error) {
            console.error('Error procesando PDF:', error);
            throw error;
        }
    }
}

// Hacer disponible globalmente
window.NikeTechPackExtractor = NikeTechPackExtractor;
console.log('✅ NikeTechPackExtractor V2 cargado correctamente');
