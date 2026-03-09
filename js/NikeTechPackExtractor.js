/**
 * Nike Tech Pack Extractor
 * Módulo para extraer información de tech packs de Nike desde PDF
 */

// ============================================
// CONFIGURACIÓN Y DICCIONARIOS
// ============================================

const CONFIG = {
    TALLAS: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    KEYWORDS: {
        tallaBase: ['Base Size', 'Talla Base'],
        tela: ['Fabric', 'Tela', 'Knit', 'Tricot', 'Mesh'],
        tinta: ['Water Base', 'Plastisol', 'Silicone', 'High Solids'],
        placement: ['Graphic Placement', 'Placement', 'ELP'],
        measurement: ['Measurement', 'Medida', 'QC Tol']
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
    'Silicone': 'Silicone',
    'Polyester': 'Poliéster',
    'Recycled Polyester': 'Poliéster Reciclado',
    'Cotton': 'Algodón',
    'Nylon': 'Nylon'
};

const ELP_MAPPING = {
    'ELP68': { ubicacion: 'COLLAR', descripcion: 'Escudo NFL - Centrado en cuello' },
    'ELP01': { ubicacion: 'FRONT', descripcion: 'Wordmark - Centro frente' },
    'ELP71': { ubicacion: 'FRONT', descripcion: 'Números Frontales' },
    'ELP27': { ubicacion: 'FRONT', descripcion: 'Centrado Wordmark/Números' },
    'ELP73': { ubicacion: 'BACK', descripcion: 'Logo trasero centrado' },
    'ELP08': { ubicacion: 'BACK', descripcion: 'Nameplate' },
    'ELP64': { ubicacion: 'BACK', descripcion: 'Números Traseros' },
    'ELP28': { ubicacion: 'BACK', descripcion: 'Centrado Logo/Nameplate' },
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
        console.log('🦁 NikeTechPackExtractor inicializado');
        this.extractedData = {
            informacionGeneral: {},
            tallaBase: null,
            telas: [],
            tinta: null,
            placements: []
        };
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
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }

            return fullText;
        } catch (error) {
            console.error('Error extrayendo texto del PDF:', error);
            throw error;
        }
    }

    parseTechPackText(text) {
        this.extractedData = {
            informacionGeneral: this.extractGeneralInfo(text),
            tallaBase: this.extractBaseSize(text),
            telas: this.extractFabrics(text),
            tinta: this.extractInkType(text),
            placements: this.extractPlacements(text)
        };

        return this.extractedData;
    }

    extractGeneralInfo(text) {
        const info = {};

        const marketingNameMatch = text.match(/Marketing Name\s*[:#]?\s*([^\n]+)/i);
        if (marketingNameMatch) {
            info.nombreMarketing = marketingNameMatch[1].trim();
        }

        const styleMatch = text.match(/Style\s*#?\s*[:#]?\s*(\w+)/i);
        if (styleMatch) {
            info.styleNumber = styleMatch[1].trim();
        }

        const seasonMatch = text.match(/Season\s*[:#]?\s*([^\n]+)/i);
        if (seasonMatch) {
            info.season = seasonMatch[1].trim();
        }

        const teamMatch = text.match(/(Bills|Bengals|Ravens|Steelers|Cowboys|Eagles|Giants|Commanders|49ers|Rams|Seahawks|Cardinals|Chiefs|Raiders|Broncos|Chargers|Packers|Bears|Lions|Vikings|Saints|Buccaneers|Falcons|Panthers|Patriots|Jets|Dolphins|Bills|Jaguars|Colts|Titans|Texans)\s+(Home|Road|Away|Alternate)/i);
        if (teamMatch) {
            info.equipo = teamMatch[1];
            info.tipo = teamMatch[2];
        }

        return info;
    }

    extractBaseSize(text) {
        const baseSizeMatch = text.match(/Base Size[^\n]*?\b([SMXL]|2XL|3XL|4XL|5XL)\b/i);
        if (baseSizeMatch) {
            return baseSizeMatch[1].toUpperCase();
        }

        const sizeTableMatch = text.match(/Size Scale[^\n]*?\b([SMXL]|2XL|3XL|4XL|5XL)\b/i);
        if (sizeTableMatch) {
            return sizeTableMatch[1].toUpperCase();
        }

        return 'L';
    }

    extractFabrics(text) {
        const telas = [];
        const bomMatch = text.match(/Bill of Material[\s\S]*?(?=Measurement|Graphic Placement|$)/i);
        if (!bomMatch) return telas;

        const bomText = bomMatch[0];
        const fabricPatterns = [
            {
                regex: /(\w+)\s+Tricot[\s\S]*?(\d+)\s*gsm[\s\S]*?(\d+%\s*[^\n]+)/i,
                tipo: 'Tricot Principal'
            },
            {
                regex: /(\w+)\s+Mesh[\s\S]*?(\d+)\s*gsm[\s\S]*?(\d+%\s*[^\n]+)/i,
                tipo: 'Mesh'
            },
            {
                regex: /Flat Knit Rib[\s\S]*?(\d+)\s*gsm[\s\S]*?(\d+%\s*[^\n]+)/i,
                tipo: 'Rib (Cuello)'
            }
        ];

        fabricPatterns.forEach(pattern => {
            const match = bomText.match(pattern.regex);
            if (match) {
                const composicion = match[3] || '';
                telas.push({
                    nombre: match[1] || pattern.tipo,
                    tipo: pattern.tipo,
                    peso: match[2] + ' gsm',
                    composicion: composicion
                });
            }
        });

        if (telas.length === 0) {
            const composicionMatches = bomText.match(/(\d+%\s*(?:Polyester|Recycled Polyester|Cotton|Nylon)[^\n]*)/gi);
            if (composicionMatches) {
                composicionMatches.forEach((comp, index) => {
                    telas.push({
                        nombre: `Tela ${index + 1}`,
                        tipo: index === 0 ? 'Principal' : 'Secundaria',
                        composicion: comp
                    });
                });
            }
        }

        return telas;
    }

    extractInkType(text) {
        if (text.match(/High Solids Water Base/i)) {
            return {
                tipo: 'WATER',
                nombreCompleto: 'High Solids Water Base Print',
                descripcion: 'Impresión de base acuosa de alta solidez'
            };
        }

        if (text.match(/Water Base|Waterbase/i)) {
            return {
                tipo: 'WATER',
                nombreCompleto: 'Water Base Print',
                descripcion: 'Impresión base acuosa'
            };
        }

        if (text.match(/Plastisol/i)) {
            return {
                tipo: 'PLASTISOL',
                nombreCompleto: 'Plastisol Print',
                descripcion: 'Impresión plastisol'
            };
        }

        if (text.match(/Silicone/i)) {
            return {
                tipo: 'SILICONE',
                nombreCompleto: 'Silicone Print',
                descripcion: 'Impresión de silicona'
            };
        }

        return {
            tipo: 'WATER',
            nombreCompleto: 'No especificado',
            descripcion: 'Asumiendo water-base'
        };
    }

    extractPlacements(text) {
        const placements = [];
        const tallaBase = this.extractedData.tallaBase || 'L';
        const placementMatch = text.match(/Graphic Placement[\s\S]*?(?=Measurement|$)/i);
        
        if (!placementMatch) return placements;

        const placementText = placementMatch[0];
        const elpPattern = /(ELP\d+)\s+([^\n]+?)\s+Yes\s+[^\n]*?\b(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/gi;
        
        let match;
        while ((match = elpPattern.exec(placementText)) !== null) {
            const codigo = match[1];
            const descripcionIngles = match[2].trim();

            if (ELP_MAPPING[codigo]) {
                const mapping = ELP_MAPPING[codigo];
                placements.push({
                    codigo: codigo,
                    ubicacion: mapping.ubicacion,
                    descripcion: mapping.descripcion,
                    descripcionIngles: descripcionIngles,
                    distancia: match[5] + ' cm',
                    talla: tallaBase
                });
            }
        }

        if (placements.length === 0) {
            Object.keys(ELP_MAPPING).forEach(codigo => {
                const regex = new RegExp(`${codigo}[^\n]*`, 'i');
                const match = placementText.match(regex);
                if (match) {
                    const mapping = ELP_MAPPING[codigo];
                    placements.push({
                        codigo: codigo,
                        ubicacion: mapping.ubicacion,
                        descripcion: mapping.descripcion,
                        distancia: 'Ver especificación'
                    });
                }
            });
        }

        return placements;
    }

    async procesarPDF(pdfFile) {
        try {
            const text = await this.extractTextFromPDF(pdfFile);
            return this.parseTechPackText(text);
        } catch (error) {
            console.error('Error procesando PDF:', error);
            throw error;
        }
    }
}

// Hacer disponible globalmente
window.NikeTechPackExtractor = NikeTechPackExtractor;
console.log('✅ NikeTechPackExtractor cargado correctamente');
