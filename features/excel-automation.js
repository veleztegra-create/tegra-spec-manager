// =====================================================
// excel-automation.js - Automatización inteligente de placements desde Excel
// VERSIÓN v6.2 - CORREGIDA: API pública apunta a funciones robustas
// =====================================================

window.ExcelAutomation = (function() {
    'use strict';

    // ============================================
    // CONFIGURACIÓN
    // ============================================
    
    const CONFIG = {
        TECHNIQUES_TO_PROCESS: [
            'SCREENPRINT', 'SCREEN PRINT', 'SCREEN', 'SCREENPRINTG', 'SCREEN PRINTG',
            'SILICONE', 'SHINY SILICONE', 
            'WATERBASE', 'WATER BASE', 
            'PLASTISOL',
            'SUBLIMATION', 'SUB',
            'EMBROIDERY', 'EMB',
            'TWILL',
            'HEAT TRANSFER', 'HT',
            'LASER', 'LASER CUT'
        ],
        
        TECHNIQUES_TO_IGNORE: [
            'Puff', 'PUFF', 'LASER PERFORATION'
        ],
        
        FORCE_PROCESS_KEYWORDS: [
            'SILICONE', 'SHINY SILICONE', 'WATERBASE', 'PLASTISOL'
        ],
        
        LOCATION_MAPPING: {
            'FRONT': 'FRONT',
            'BACK': 'BACK',
            'SHOULDER': 'SHOULDER',
            'SLEEVE': 'SLEEVE',
            'COLLAR': 'COLLAR',
            'NECK': 'COLLAR',
            'CHEST': 'CHEST',
            'NAMEPLATE': 'BACK',
            'NUMBERS': 'TV. NUMBERS',
            'TV NUMBERS': 'TV. NUMBERS',
            'WORDMARK': 'FRONT',
            'LOGO': 'FRONT',
            'SWOOSH': 'SLEEVE',
            'STRIPES': 'SLEEVE',
            'YOKE': 'YOKE',
            'PANEL': 'PANEL',
            'LEG': 'LEG',
            'SIDE': 'SIDE',
            'JOCKTAG': 'JOCKTAG'
        },
        
        LOCATION_PATTERNS: [
            { regex: /front/i, location: 'FRONT' },
            { regex: /back/i, location: 'BACK' },
            { regex: /shoulder/i, location: 'SHOULDER' },
            { regex: /sleeve/i, location: 'SLEEVE' },
            { regex: /collar/i, location: 'COLLAR' },
            { regex: /neck/i, location: 'COLLAR' },
            { regex: /chest/i, location: 'CHEST' },
            { regex: /nameplate/i, location: 'NAMEPLATE' },
            { regex: /yoke/i, location: 'YOKE' },
            { regex: /panel/i, location: 'PANEL' },
            { regex: /tv\.?\s*numbers?/i, location: 'TV. NUMBERS' },
            { regex: /numbers?/i, location: 'NUMBERS' },
            { regex: /wordmark/i, location: 'WORDMARK' },
            { regex: /logo/i, location: 'LOGO' },
            { regex: /swoosh/i, location: 'SWOOSH' },
            { regex: /stripes?/i, location: 'STRIPES' },
            { regex: /leg/i, location: 'LEG' },
            { regex: /side/i, location: 'SIDE' },
            { regex: /jocktag|jock tag/i, location: 'JOCKTAG' }
        ],
        
        PAIRED_PATTERNS: [
            /left and right/i,
            /both (sleeves|shoulders)/i,
            /left & right/i
        ],
        
        INK_KEYWORDS: {
            'SILICONE': 'SILICONE',
            'SHINY SILICONE': 'SILICONE',
            'PLASTISOL': 'PLASTISOL',
            'WATERBASE': 'WATER',
            'WATER-BASE': 'WATER',
            'WATER BASE': 'WATER',
            'DISCHARGE': 'DISCHARGE'
        },
        
        CLIENT_INK_DEFAULTS: {
            'FANATICS': 'WATER',
            'FANATIC': 'WATER',
            'GEAR FOR SPORT': 'PLASTISOL',
            'GEARFORSPORT': 'PLASTISOL',
            'GFS': 'PLASTISOL',
            'G.F.S.': 'PLASTISOL',
            'NIKE': 'WATER',
            'ADIDAS': 'PLASTISOL',
            'UNDER ARMOUR': 'WATER',
            'UA': 'WATER'
        },
        
        IGNORE_SHEET_NAMES: ['HOW TO', 'LISTS', 'LIST', 'INSTRUCTION', 'HOJA TÉCNICA', 'TEMPLATE', 'SHEET1']
    };

    // ============================================
    // EXTRACCIÓN DE DATOS BÁSICOS (VERSIÓN ROBUSTA)
    // ============================================

    function extractBasicData(data, sheetName = '') {
        const extracted = {};
        
        console.log(`🔍 Extrayendo datos de ${data.length} filas en ${sheetName || 'hoja actual'}...`);
        
        // Buscar en TODAS las filas
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;

            for (let j = 0; j < row.length - 1; j++) {
                const cell = String(row[j] || '').trim();
                const nextCell = String(row[j + 1] || '').trim();
                const cellUpper = cell.toUpperCase();
                
                if (!cell) continue;

                // Mapeo de campos (flexible)
                if (cellUpper.includes('CUSTOMER') && !cellUpper.includes('VENDOR') && nextCell) {
                    extracted.customer = extracted.customer || nextCell;
                }
                else if (cellUpper.includes('STYLE') && !cellUpper.includes('TYPE') && nextCell) {
                    extracted.style = extracted.style || nextCell.replace(/\\n/g, ' ');
                }
                else if (cellUpper.includes('COLORWAY') && !cellUpper.includes('NAME') && nextCell) {
                    extracted.colorway = extracted.colorway || nextCell;
                }
                else if (cellUpper.includes('SEASON') && nextCell) {
                    extracted.season = extracted.season || nextCell;
                }
                else if ((cellUpper.includes('P.O.') || cellUpper.includes('PO #')) && nextCell) {
                    extracted.po = extracted.po || nextCell;
                }
                else if (cellUpper.includes('SAMPLE TYPE') && nextCell) {
                    extracted.sample = extracted.sample || nextCell;
                }
                else if (cellUpper.includes('PATTERN') && nextCell) {
                    extracted.pattern = extracted.pattern || nextCell;
                }
                else if (cellUpper.includes('REQUESTED BY') && nextCell) {
                    extracted.requestedBy = extracted.requestedBy || nextCell;
                }
                else if (cellUpper.includes('TEAM') && nextCell) {
                    extracted.team = extracted.team || nextCell;
                }
            }
        }
        
        // Normalización GFS
        if (window.normalizeGearForSportStyleAndColorway && extracted.customer && 
            (extracted.style || extracted.colorway)) {
            const normalized = window.normalizeGearForSportStyleAndColorway(
                extracted.style, extracted.colorway, extracted.customer
            );
            extracted.style = normalized.style || extracted.style;
            extracted.colorway = normalized.colorway || extracted.colorway;
        }
        
        // Inferir team desde style
        if (!extracted.team && window.detectTeamFromStyle) {
            extracted.team = window.detectTeamFromStyle(extracted.style, extracted.colorway, extracted.customer);
        }
        
        console.log('✅ Datos extraídos:', {
            customer: extracted.customer || '❌',
            style: extracted.style || '❌',
            colorway: extracted.colorway || '❌',
            season: extracted.season || '❌',
            po: extracted.po || '❌',
            sample: extracted.sample || '❌',
            team: extracted.team || '❌'
        });
        
        return extracted;
    }

    // ============================================
    // DETECCIÓN DE PLACEMENTS (VERSIÓN ROBUSTA)
    // ============================================

    function detectPlacements(data, customer = '') {
        const placements = [];
        let inEmbellishmentsSection = false;
        let techniqueCol = -1;
        let descriptionCol = -1;
        let dataRowsFound = 0;
        
        console.log(`🔍 Buscando placements en ${data.length} filas...`);

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row) continue;

            const rowText = (row || []).map(c => String(c || '').toUpperCase()).join(' ');
            
            // Detectar inicio de sección EMBELLISHMENTS
            if (rowText.includes('EMBELLISHMENTS') && 
                !rowText.includes('END') && 
                !rowText.includes('COMMENTS') &&
                !inEmbellishmentsSection) {
                inEmbellishmentsSection = true;
                console.log(`🎯 Sección EMBELLISHMENTS detectada en fila ${i}`);
                
                // Buscar encabezado de tabla en las siguientes filas
                for (let h = i + 1; h < Math.min(i + 5, data.length); h++) {
                    const headerRow = data[h];
                    if (!headerRow) continue;
                    
                    const headerText = headerRow.map(c => String(c || '').toUpperCase()).join(' ');
                    if (headerText.includes('AREA') || headerText.includes('TECHNIQUE') || headerText.includes('PROCESS')) {
                        // Encontrar columnas
                        headerRow.forEach((cell, idx) => {
                            const cellUpper = String(cell || '').toUpperCase();
                            if (cellUpper.includes('AREA') || cellUpper.includes('TECHNIQUE') || cellUpper.includes('PROCESS')) {
                                techniqueCol = idx;
                            }
                            if (cellUpper.includes('APPLICATION') || cellUpper.includes('DESCRIPTION')) {
                                descriptionCol = idx;
                            }
                        });
                        
                        console.log(`   📋 Tabla detectada en fila ${h}, técnica col=${techniqueCol}, desc col=${descriptionCol}`);
                        i = h; // Continuar desde el encabezado
                        break;
                    }
                }
                continue;
            }

            // Detectar fin de sección
            if (inEmbellishmentsSection && 
                (rowText.includes('SHIPPING') || 
                 rowText.includes('TOTAL UNITS') || 
                 rowText.includes('SUPPLIES') || 
                 rowText.includes('FABRICS') ||
                 rowText.includes('TRIMS') ||
                 rowText.includes('PACKAGING') ||
                 rowText.includes('LABELS & PACKAGING'))) {
                inEmbellishmentsSection = false;
                console.log(`🏁 Fin EMBELLISHMENTS en fila ${i} (${dataRowsFound} filas de datos)`);
                break;
            }

            // Procesar filas de datos
            if (inEmbellishmentsSection && techniqueCol >= 0) {
                const technique = String(row[techniqueCol] || '').trim();
                const description = descriptionCol >= 0 ? String(row[descriptionCol] || '').trim() : '';
                
                // Ignorar encabezados y filas vacías
                if (technique && 
                    technique.toUpperCase() !== 'AREA' && 
                    technique.toUpperCase() !== 'TECHNIQUE' &&
                    technique.toUpperCase() !== 'PROCESS' &&
                    technique.length > 1 &&
                    !technique.toUpperCase().includes('TYPE OF')) {
                    
                    const placement = parsePlacementRow(technique, description, customer);
                    if (placement) {
                        placements.push(placement);
                        dataRowsFound++;
                    }
                }
            }
        }

        console.log(`📦 Total placements detectados: ${placements.length}`);
        return placements;
    }

    function parsePlacementRow(technique, description, customer) {
        if (!technique) return null;
        
        const techUpper = technique.toUpperCase().trim();
        const descUpper = (description || '').toUpperCase();
        
        // Verificar si es una técnica que procesamos
        const isProcessable = CONFIG.TECHNIQUES_TO_PROCESS.some(processTech => 
            techUpper.includes(processTech) || 
            descUpper.includes(processTech)
        );
        
        if (!isProcessable) {
            return null;
        }
        
        // Determinar tipo de tinta
        const inkType = determineInkType(techUpper, descUpper, customer);
        
        // Extraer ubicaciones
        let locations = extractLocations(description, descUpper);
        if (locations.length === 0) {
            locations = inferLocationsFromDescription(descUpper);
        }
        
        // Si no hay ubicaciones, usar genérica
        if (locations.length === 0) {
            locations = ['FRONT'];
        }
        
        const isPaired = CONFIG.PAIRED_PATTERNS.some(pattern => 
            pattern.test(description)
        ) || (descUpper.includes('BOTH') && (descUpper.includes('SLEEVE') || descUpper.includes('SHOULDER')));
        
        return {
            technique: technique,
            description: description,
            inkType: inkType,
            locations: locations,
            isPaired: isPaired,
            fullText: `${technique} - ${description}`,
            isTeamLogo: descUpper.includes('TEAM LOGO'),
            isNumbers: descUpper.includes('NUMBER'),
            isWordmark: descUpper.includes('WORDMARK'),
            isSwoosh: descUpper.includes('SWOOSH')
        };
    }

    function determineInkType(technique, description, customer) {
        // Buscar en descripción primero (más específico)
        if (description.includes('SILICONE')) return 'SILICONE';
        if (description.includes('SHINY SILICONE')) return 'SILICONE';
        if (description.includes('PLASTISOL')) return 'PLASTISOL';
        if (description.includes('WATERBASE') || description.includes('WATER BASE')) return 'WATER';
        if (description.includes('DISCHARGE')) return 'DISCHARGE';
        
        // Luego en técnica
        if (technique.includes('SILICONE')) return 'SILICONE';
        if (technique.includes('PLASTISOL')) return 'PLASTISOL';
        if (technique.includes('WATER')) return 'WATER';
        
        // Por cliente
        const customerUpper = (customer || '').toUpperCase();
        if (customerUpper.includes('GEAR') || customerUpper.includes('GFS')) return 'PLASTISOL';
        if (customerUpper.includes('FANATICS')) return 'WATER';
        if (customerUpper.includes('NIKE')) return 'WATER';
        
        return 'WATER'; // Default
    }

    function extractLocations(description, descUpper) {
        const locations = [];
        if (!description) return locations;
        
        CONFIG.LOCATION_PATTERNS.forEach(pattern => {
            if (pattern.regex.test(descUpper)) {
                const mappedLocation = CONFIG.LOCATION_MAPPING[pattern.location] || pattern.location;
                if (!locations.includes(mappedLocation)) {
                    locations.push(mappedLocation);
                }
            }
        });
        
        return locations;
    }

    function inferLocationsFromDescription(descUpper) {
        const locations = [];
        
        if (descUpper.includes('NUMBER')) {
            locations.push(descUpper.includes('TV') ? 'TV. NUMBERS' : 'NUMBERS');
        }
        if (descUpper.includes('NAME')) locations.push('NAMEPLATE');
        if (descUpper.includes('LOGO')) locations.push('LOGO');
        if (descUpper.includes('WORDMARK')) locations.push('WORDMARK');
        if (descUpper.includes('SWOOSH')) locations.push('SWOOSH');
        if (descUpper.includes('STRIPE')) locations.push('STRIPES');
        if (descUpper.includes('JOCKTAG') || descUpper.includes('JOCK TAG')) locations.push('JOCKTAG');
        
        return locations.map(loc => CONFIG.LOCATION_MAPPING[loc] || loc);
    }

    // ============================================
    // CREACIÓN DE PLACEMENTS EN UI
    // ============================================

    function autoCreatePlacements(detectedPlacements) {
        if (!Array.isArray(detectedPlacements) || detectedPlacements.length === 0) {
            console.log('📭 No hay placements para crear');
            return 0;
        }

        if (!Array.isArray(window.placements)) {
            console.error('❌ window.placements no definido');
            return 0;
        }

        console.log(`🎯 Creando ${detectedPlacements.length} placements...`);
        
        const manualPlacements = window.placements.filter(p => !p.isAutoGenerated);
        window.placements = manualPlacements;
        
        const container = document.getElementById('placements-container');
        const tabsContainer = document.getElementById('placements-tabs');
        if (container) container.innerHTML = '';
        if (tabsContainer) tabsContainer.innerHTML = '';
        
        let placementCount = 0;

        detectedPlacements.forEach((detected, index) => {
            const locationsToCreate = expandLocations(detected.locations, detected.isPaired, detected.description);
            
            locationsToCreate.forEach((location, locIndex) => {
                const placementType = mapLocationToType(location, detected.description);
                
                const newPlacement = {
                    id: Date.now() + index * 100 + locIndex,
                    type: placementType,
                    name: placementType,
                    imageData: null,
                    colors: [],
                    sequence: [],
                    placementDetails: generatePlacementDetails(detected, location),
                    dimensions: 'SIZE: (W) ## X (H) ##',
                    temp: getTempForInk(detected.inkType),
                    time: getTimeForInk(detected.inkType),
                    specialties: detectSpecialties(detected),
                    specialInstructions: detected.description,
                    inkType: detected.inkType,
                    technique: detected.technique,
                    isAutoGenerated: true,
                    isPaired: false
                };

                window.placements.push(newPlacement);
                
                if (typeof window.renderPlacementHTML === 'function') {
                    window.renderPlacementHTML(newPlacement);
                }
                placementCount++;
            });
        });

        if (placementCount > 0) {
            if (typeof window.updatePlacementsTabs === 'function') {
                window.updatePlacementsTabs();
            }
            if (typeof window.showStatus === 'function') {
                window.showStatus(`✅ ${placementCount} placements generados`, 'success');
            }
        }

        return placementCount;
    }

    function expandLocations(locations, isPaired, description) {
        const expanded = [];
        const descUpper = (description || '').toUpperCase();
        
        locations.forEach(location => {
            if (location === 'SLEEVE' || location === 'SHOULDER') {
                if (isPaired || 
                    descUpper.includes('BOTH') || 
                    descUpper.includes('LEFT AND RIGHT')) {
                    expanded.push(`LEFT ${location}`);
                    expanded.push(`RIGHT ${location}`);
                } else if (descUpper.includes('LEFT') && !descUpper.includes('RIGHT')) {
                    expanded.push(`LEFT ${location}`);
                } else if (descUpper.includes('RIGHT') && !descUpper.includes('LEFT')) {
                    expanded.push(`RIGHT ${location}`);
                } else {
                    expanded.push(`LEFT ${location}`);
                    expanded.push(`RIGHT ${location}`);
                }
            } else {
                expanded.push(location);
            }
        });
        
        return expanded;
    }

    function mapLocationToType(location, description) {
        const descUpper = (description || '').toUpperCase();
        
        if (location.includes('NUMBERS') || location.includes('TV')) {
            return descUpper.includes('TV') ? 'TV. NUMBERS' : 'NUMBERS';
        }
        
        const baseLocation = location.replace(/^(LEFT|RIGHT)\s+/, '');
        
        const typeMap = {
            'FRONT': 'FRONT',
            'BACK': 'BACK',
            'SLEEVE': 'SLEEVE',
            'SHOULDER': 'SHOULDER',
            'COLLAR': 'COLLAR',
            'CHEST': 'CHEST',
            'YOKE': 'YOKE',
            'PANEL': 'PANEL',
            'LEG': 'LEG',
            'SIDE': 'SIDE',
            'JOCKTAG': 'JOCKTAG',
            'NAMEPLATE': 'BACK',
            'NUMBERS': 'TV. NUMBERS',
            'TV. NUMBERS': 'TV. NUMBERS',
            'WORDMARK': 'FRONT',
            'LOGO': 'FRONT',
            'SWOOSH': 'SLEEVE',
            'STRIPES': 'SLEEVE'
        };
        
        return typeMap[baseLocation] || baseLocation || 'CUSTOM';
    }

    function generatePlacementDetails(detected, location) {
        const details = [];
        const descUpper = (detected.description || '').toUpperCase();
        
        if (location.includes('FRONT')) details.push('Center Front');
        if (location.includes('BACK')) details.push('Center Back');
        if (location.includes('LEFT')) details.push('Left Side');
        if (location.includes('RIGHT')) details.push('Right Side');
        if (location.includes('SHOULDER')) details.push('Shoulder');
        if (location.includes('SLEEVE')) details.push('Sleeve');
        if (location.includes('COLLAR')) details.push('Collar');
        if (location.includes('LEG')) details.push('Leg');
        if (location.includes('SIDE')) details.push('Side Panel');
        
        if (descUpper.includes('NUMBER')) details.push('Player Numbers');
        if (descUpper.includes('NAME')) details.push('Player Name');
        if (descUpper.includes('LOGO')) details.push('Team/Brand Logo');
        if (descUpper.includes('WORDMARK')) details.push('Team Wordmark');
        
        return details.join(' • ') || '#.#" FROM COLLAR SEAM';
    }

    function detectSpecialties(detected) {
        const specialties = [];
        const desc = (detected.description || '').toUpperCase();
        
        if (desc.includes('HD') || desc.includes('HIGH DENSITY')) specialties.push('HIGH DENSITY');
        if (desc.includes('METALLIC') || desc.includes('GOLD') || desc.includes('SILVER')) specialties.push('METALLIC');
        if (desc.includes('FOIL')) specialties.push('FOIL');
        if (desc.includes('PUFF')) specialties.push('PUFF');
        if (detected.inkType === 'SILICONE') specialties.push('SILICONE');
        
        return specialties.join(', ');
    }

    function getTempForInk(inkType) {
        const temps = { 
            'WATER': '320 °F', 
            'PLASTISOL': '320 °F', 
            'SILICONE': '320 °F',
            'DISCHARGE': '320 °F'
        };
        return temps[inkType] || '320 °F';
    }

    function getTimeForInk(inkType) {
        const times = { 
            'WATER': '1:40 min', 
            'PLASTISOL': '1:00 min', 
            'SILICONE': '1:40 min',
            'DISCHARGE': '1:40 min'
        };
        return times[inkType] || '1:40 min';
    }

    // ============================================
    // EVALUACIÓN DE HOJAS
    // ============================================

    function evaluateSheet(sheetName, data) {
        let score = 0;
        let hasCustomer = false;
        let hasEmbellishments = false;
        let embellishmentsRow = -1;
        
        // Bonus por nombre
        const upperName = sheetName.toUpperCase();
        if (upperName.includes('SWO')) score += 30;
        if (upperName.includes('PPS')) score += 30;
        if (upperName.includes('SAMPLE')) score += 20;
        if (upperName.includes('PROTO')) score += 20;
        
        // Analizar contenido
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row) continue;
            
            const rowText = row.map(c => String(c || '').toUpperCase()).join(' ');
            
            // CUSTOMER con valor real
            if (!hasCustomer) {
                for (let j = 0; j < row.length - 1; j++) {
                    const cell = String(row[j] || '').toUpperCase().trim();
                    const nextCell = String(row[j + 1] || '').trim();
                    
                    if ((cell === 'CUSTOMER' || cell === 'CUSTOMER:') && 
                        nextCell && nextCell.length > 2) {
                        hasCustomer = true;
                        score += 50;
                        embellishmentsRow = i;
                        break;
                    }
                }
            }
            
            // EMBELLISHMENTS con datos
            if (!hasEmbellishments && rowText.includes('EMBELLISHMENTS')) {
                // Verificar si hay filas de datos después
                for (let j = i + 1; j < Math.min(i + 10, data.length); j++) {
                    const nextRow = data[j];
                    if (!nextRow) continue;
                    const nextText = nextRow.map(c => String(c || '').toUpperCase()).join(' ');
                    if (nextText.includes('AREA') || nextText.includes('APPLICATION') || 
                        nextText.includes('SCREEN') || nextText.includes('PRINT')) {
                        hasEmbellishments = true;
                        embellishmentsRow = j;
                        score += 40;
                        break;
                    }
                }
            }
        }
        
        return { score, hasCustomer, hasEmbellishments, embellishmentsRow };
    }

    // ============================================
    // FUNCIÓN PRINCIPAL
    // ============================================

    function processExcelWithAutomation(worksheet, sheetName = '', workbook = null) {
        console.log('🤖 ExcelAutomation v6.2: Iniciando...');
        
        try {
            // Validar workbook
            if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
                throw new Error('Workbook no proporcionado o inválido');
            }

            // Buscar la mejor hoja
            let bestSheet = null;
            let bestScore = -1;
            
            for (const name of workbook.SheetNames) {
                const upperName = name.toUpperCase();
                
                // Ignorar hojas de plantilla
                if (CONFIG.IGNORE_SHEET_NAMES.some(ignore => upperName.includes(ignore))) {
                    console.log(`   ⏭️ Ignorando plantilla: ${name}`);
                    continue;
                }
                
                try {
                    const sheet = workbook.Sheets[name];
                    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
                    
                    const { score, hasCustomer, hasEmbellishments, embellishmentsRow } = evaluateSheet(name, data);
                    
                    console.log(`   📊 ${name}: score=${score}, customer=${hasCustomer}, embellishments=${hasEmbellishments} (fila ${embellishmentsRow})`);
                    
                    if (score > bestScore) {
                        bestScore = score;
                        bestSheet = { name, data, score };
                    }
                    
                } catch (e) {
                    console.warn(`   ⚠️ Error leyendo hoja ${name}:`, e.message);
                }
            }
            
            if (!bestSheet) {
                throw new Error('No se encontró ninguna hoja con datos');
            }
            
            console.log(`🏆 MEJOR HOJA: "${bestSheet.name}" (score: ${bestSheet.score})`);
            
            // Extraer datos de la mejor hoja
            const extracted = extractBasicData(bestSheet.data, bestSheet.name);
            
            // Detectar placements
            const placements = detectPlacements(bestSheet.data, extracted.customer);
            
            // Crear en UI
            if (placements.length > 0 && typeof window.placements !== 'undefined') {
                autoCreatePlacements(placements);
            } else {
                console.log('📭 No se encontraron placements para crear');
            }
            
            return { 
                ...extracted, 
                autoPlacements: placements,
                sourceSheet: bestSheet.name 
            };
            
        } catch (error) {
            console.error('❌ Error en ExcelAutomation:', error);
            return {
                customer: '',
                style: '',
                colorway: '',
                season: '',
                po: '',
                sample: '',
                team: '',
                autoPlacements: [],
                sourceSheet: sheetName,
                error: error.message
            };
        }
    }

    // ============================================
    // API PÚBLICA
    // ============================================

    return {
        processExcelWithAutomation: processExcelWithAutomation,
        autoCreatePlacements: autoCreatePlacements,
        extractBasicData: extractBasicData,
        detectPlacements: detectPlacements,
        CONFIG: CONFIG
    };

})();

console.log('✅ Excel Automation v6.2 (Totalmente Robusto) cargado');
