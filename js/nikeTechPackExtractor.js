// nikeTechPackExtractor.js - Versión estable
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
        
        // Mapeo de códigos ELP comunes
        this.ELP_MAPPING = {
            'ELP69': { ubicacion: 'COLLAR', descripcion: 'Escudo NFL' },
            'ELP52': { ubicacion: 'FRONT', descripcion: 'Números Frontales' },
            'ELP100': { ubicacion: 'FRONT', descripcion: 'Distancia entre números' },
            'ELP92': { ubicacion: 'BACK', descripcion: 'Nameplate' },
            'ELP64': { ubicacion: 'BACK', descripcion: 'Números Traseros' },
            'ELP101': { ubicacion: 'BACK', descripcion: 'Distancia entre números' },
            'ELP37': { ubicacion: 'CUSTOM', descripcion: 'Jocktag Lateral' },
            'ELP38': { ubicacion: 'CUSTOM', descripcion: 'Jocktag Inferior' },
            'ELP67': { ubicacion: 'TV. NUMBERS', descripcion: 'Números TV' },
            'ELP102': { ubicacion: 'TV. NUMBERS', descripcion: 'Distancia entre números TV' },
            'ELP05': { ubicacion: 'SLEEVE', descripcion: 'Swoosh' },
            'ELP40': { ubicacion: 'SLEEVE', descripcion: 'Rayas de Manga' }
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
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }

            console.log('📄 Texto extraído del PDF');

            // Extraer datos básicos
            this.extractedData.informacionGeneral = this.extractGeneralInfo(fullText);
            this.extractedData.tallaBase = this.extractBaseSize(fullText);
            this.extractedData.telas = this.extractFabrics(fullText);
            this.extractedData.tinta = this.extractInkType(fullText);
            this.extractedData.placements = this.extractPlacements(fullText);

            return this.extractedData;

        } catch (error) {
            console.error('Error procesando PDF:', error);
            throw error;
        }
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

    extractBaseSize(text) {
        const baseSizeMatch = text.match(/Base Size[^\n]*?([SML]|2XL|3XL|4XL|5XL)/i);
        if (baseSizeMatch) {
            return baseSizeMatch[1].toUpperCase();
        }
        return 'L';
    }

    extractFabrics(text) {
        const telas = [];
        const fabricMatches = text.matchAll(/(\d+)\s*gsm[\s\S]*?(\d+%\s*[^\n]+)/gi);
        for (const match of fabricMatches) {
            telas.push({
                peso: match[1] + ' gsm',
                composicion: match[2].trim()
            });
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

    extractPlacements(text) {
        const placements = [];
        const placementSection = text.match(/Graphic Placement[\s\S]*?(?=Page|$)/i);
        
        if (!placementSection) return placements;

        const lines = placementSection[0].split('\n');
        let currentELP = null;

        lines.forEach(line => {
            const elpMatch = line.match(/(ELP\d+)/);
            if (elpMatch) {
                const codigo = elpMatch[1];
                if (this.ELP_MAPPING[codigo]) {
                    currentELP = {
                        codigo: codigo,
                        ubicacion: this.ELP_MAPPING[codigo].ubicacion,
                        descripcion: this.ELP_MAPPING[codigo].descripcion,
                        descripcionIngles: line.replace(codigo, '').trim()
                    };
                    placements.push(currentELP);
                }
            }
        });

        return placements;
    }
}

window.NikeTechPackExtractor = NikeTechPackExtractor;
console.log('✅ NikeTechPackExtractor cargado');
