// excel-automation.js - Automatización inteligente de placements desde Excel
// VERSIÓN v5.1 - Auto-detección de hoja con datos (con fallback robusto)

window.ExcelAutomation = (function() {
    'use strict';

    // ============================================
    // CONFIGURACIÓN
    // ============================================
    
    const CONFIG = {
        // Técnicas que SIEMPRE debemos procesar (imprimir)
        TECHNIQUES_TO_PROCESS: [
            'SCREENPRINT', 'SCREEN PRINT', 'SCREEN', 'SCREENPRINTG',
            'SILICONE', 'WATERBASE', 'WATER BASE', 'PLASTISOL'
        ],
        
        // Técnicas que DEBEMOS IGNORAR (a menos que tengan palabras clave)
        TECHNIQUES_TO_IGNORE: [
            'EMBROIDERY', 'EMB', 
            'SUBLIMATION', 'SUB', 
            'HEAT TRANSFER', 'HT',
            'DTF', 'DIRECT TO FILM',
            'Puff', 'LASER', 'TWILL'
        ],
        
        // Palabras clave que fuerzan el procesamiento incluso en técnicas ignoradas
        FORCE_PROCESS_KEYWORDS: [
            'SILICONE', 'SHINY SILICONE', 'WATERBASE', 'PLASTISOL'
        ],
        
        // Mapeo de ubicaciones detectadas a tipos de placement
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
            'PANEL': 'PANEL'
        },
        
        // Patrones para detectar ubicaciones en el texto
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
            { regex: /stripes?/i, location: 'STRIPES' }
        ],
        
        // Patrones para detectar si un placement es doble (izquierda/derecha)
        PAIRED_PATTERNS: [
            /left and right/i,
            /both (sleeves|shoulders)/i,
            /left & right/i
        ],
        
        // Palabras clave para tipo de tinta
        INK_KEYWORDS: {
            'SILICONE': 'SILICONE',
            'SHINY SILICONE': 'SILICONE',
            'PLASTISOL': 'PLASTISOL',
            'WATERBASE': 'WATER',
            'WATER-BASE': 'WATER',
            'WATER BASE': 'WATER',
            'DISCHARGE': 'DISCHARGE'
        },
        
        // Tinta por defecto según cliente
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
        
        // Indicadores de hojas válidas (con datos reales)
        VALID_SHEET_INDICATORS: ['SWO', 'PPS', 'SAMPLE WORK ORDER', 'WORK ORDER'],
        
        // Hojas a ignorar
        IGNORE_SHEET_NAMES: ['HOW TO', 'LISTS', 'LIST', 'INSTRUCTION', 'PROTO', 'HOJA TÉCNICA', 'TEMPLATE']
    };

    // ============================================
    // EXTRACCIÓN DE DATOS BÁSICOS
    // ============================================

    /**
     * Extrae datos básicos del Excel (customer, style, etc.)
     * Versión mejorada con múltiples estrategias de búsqueda
     */
    function extractBasicData(data, sheetName = '') {
        const extracted = {};
        const sheetUpper = (sheetName || '').toUpperCase();
        
        // Estrategia 1: Formato SWO/PPS estructurado (tabla con labels en col A/B)
        const isStructuredFormat = sheetUpper.includes('SWO') || 
                                   sheetUpper.includes('PPS') || 
                                   sheetUpper.includes('SAMPLE');
        
        console.log(`📄 Procesando hoja: ${sheetName} (Formato detectado: ${isStructuredFormat ? 'SWO/PPS' : 'Genérico'})`);

        // Intentar extracción estructurada primero
        if (isStructuredFormat) {
            extractFromStructuredFormat(data, extracted);
        }
        
        // Si no encontramos datos, intentar extracción agresiva
        if (!extracted.customer && !extracted.style) {
            console.log('🔍 Extracción estructurada falló, intentando modo agresivo...');
            extractFromGenericFormat(data, extracted);
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

        // Detectar equipo si no está definido
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

    /**
     * Extracción para formato SWO/PPS estructurado
     */
    function extractFromStructuredFormat(data, extracted) {
        for (let i = 0; i < Math.min(data.length, 35); i++) {
            const row = data[i];
            if (!row || row.length < 2) continue;

            // Buscar en primeras 3 columnas
            for (let col = 0; col < Math.min(3, row.length); col++) {
                const rawCell = row[col];
                if (rawCell === undefined || rawCell === null) continue;
                
                const cell = String(rawCell).trim();
                const cellUpper = cell.toUpperCase();
                
                if (!cell || cell.length < 2) continue;

                // Obtener valor: columna siguiente, o fila siguiente, o misma celda después de ":"
                let value = '';
                
                // Opción 1: Valor en columna siguiente
                if (col + 1 < row.length) {
                    const nextVal = row[col + 1];
                    if (nextVal !== undefined && nextVal !== null && nextVal !== '') {
                        value = String(nextVal).trim();
                    }
                }
                
                // Opción 2: Valor en fila siguiente (formato vertical)
                if (!value && i + 1 < data.length && data[i + 1]) {
                    const belowVal = data[i + 1][col];
                    if (belowVal !== undefined && belowVal !== null && belowVal !== '') {
                        value = String(belowVal).trim();
                    }
                }
                
                // Opción 3: Valor después del ":" en la misma celda
                if (!value && cell.includes(':')) {
                    value = cell.split(':').slice(1).join(':').trim();
                }

                // Mapeo de campos con múltiples variantes de nombres
                if (matchesField(cellUpper, ['CUSTOMER']) && 
                    !cellUpper.includes('IM#') && 
                    !cellUpper.includes('VENDOR')) {
                    extracted.customer = value || extracted.customer;
                }
                else if (matchesField(cellUpper, ['STYLE']) && 
                         !cellUpper.includes('TYPE') && 
                         !cellUpper.includes('PATTERN') &&
                         !cellUpper.includes('SAMPLE')) {
                    extracted.style = cleanValue(value) || extracted.style;
                }
                else if (matchesField(cellUpper, ['COLORWAY', 'COLORWAY #', 'COLORWAY #:']) && 
                         !cellUpper.includes('NAME')) {
                    extracted.colorway = value || extracted.colorway;
                }
                else if (matchesField(cellUpper, ['SEASON'])) {
                    extracted.season = value || extracted.season;
                }
                else if (matchesField(cellUpper, ['P.O.', 'PO #', 'PO', 'P.O. #']) && 
                         !cellUpper.includes('IM#')) {
                    extracted.po = value || extracted.po;
                }
                else if (matchesField(cellUpper, ['SAMPLE TYPE', 'SAMPLE:'])) {
                    extracted.sample = value || extracted.sample;
                }
                else if (matchesField(cellUpper, ['PATTERN', 'PATTERN #', 'PATTERN #:'])) {
                    extracted.pattern = value || extracted.pattern;
                }
                else if (matchesField(cellUpper, ['TEAM'])) {
                    extracted.team = value || extracted.team;
                }
                else if (matchesField(cellUpper, ['GENDER'])) {
                    extracted.gender = value || extracted.gender;
                }
                else if (matchesField(cellUpper, ['DATE', 'DATE:'])) {
                    extracted.date = value || extracted.date;
                }
                else if (matchesField(cellUpper, ['REQUESTED BY', 'REQUESTED BY:'])) {
                    extracted.requestedBy = value || extracted.requestedBy;
                }
            }
        }
    }

    /**
     * Extracción genérica/agresiva para cualquier formato
     */
    function extractFromGenericFormat(data, extracted) {
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row) continue;

            for (let j = 0; j < row.length; j++) {
                const cell = String(row[j] || '').trim();
                if (!cell) continue;
                
                const cellUpper = cell.toUpperCase();
                const nextCell = String(row[j + 1] || '').trim();

                // Buscar patrones tipo "LABEL: valor" o "LABEL valor"
                if (cellUpper.includes('CUSTOMER:') || cellUpper === 'CUSTOMER') {
                    extracted.customer = nextCell || cell.split(':')[1]?.trim() || extracted.customer;
                } else if (cellUpper.includes('STYLE:') || cellUpper === 'STYLE') {
                    extracted.style = cleanValue(nextCell) || cleanValue(cell.split(':')[1]?.trim()) || extracted.style;
                } else if (cellUpper.includes('COLORWAY')) {
                    extracted.colorway = nextCell || cell.split(':')[1]?.trim() || extracted.colorway;
                } else if (cellUpper.includes('SEASON:') || cellUpper === 'SEASON') {
                    extracted.season = nextCell || cell.split(':')[1]?.trim() || extracted.season;
                } else if (cellUpper.includes('P.O.') || cellUpper.includes('PO #')) {
                    extracted.po = nextCell || cell.split(':')[1]?.trim() || extracted.po;
                } else if (cellUpper.includes('SAMPLE TYPE') || cellUpper.includes('SAMPLE:')) {
                    extracted.sample = nextCell || cell.split(':')[1]?.trim() || extracted.sample;
                } else if (cellUpper.includes('PATTERN')) {
                    extracted.pattern = nextCell || cell.split(':')[1]?.trim() || extracted.pattern;
                }
            }
        }
    }

    /**
     * Verifica si una celda coincide con alguno de los campos buscados
     */
    function matchesField(cellUpper, fieldNames) {
        return fieldNames.some(field => {
            const fieldUpper = field.toUpperCase();
            return cellUpper === fieldUpper || 
                   cellUpper === fieldUpper + ':' ||
                   cellUpper.startsWith(fieldUpper + ' ');
        });
    }

    /**
     * Limpia valores (remove HTML, espacios extra)
     */
    function cleanValue(value) {
        if (!value) return value;
        return value.replace(/<br\s*\/?>/gi, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
    }

    // ============================================
    // DETECCIÓN DE PLACEMENTS
    // ============================================

    /**
     * Detecta placements en la sección de embellishments
     */
    function detectPlacements(data, customer = '') {
        const placements = [];
        let inEmbellishmentsSection = false;
        let techniqueCol = -1;
        let descriptionCol = -1;
        let dataRowsFound = 0;

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row) continue;

            const rowText = (row || []).map(c => String(c || '').toUpperCase()).join(' ');

            // Detectar inicio de sección EMBELLISHMENTS
            if (rowText.includes('EMBELLISHMENTS') && 
                !rowText.includes('END') && 
                !rowText.includes('COMMENTS')) {
                inEmbellishmentsSection = true;
                console.log(`🎯 Sección EMBELLISHMENTS encontrada en fila ${i}`);
                
                // Encontrar índices de columnas en la siguiente fila (header) o misma fila
                const headerRowData = data[i + 1] || row;
                headerRowData.forEach((cell, idx) => {
                    const cellUpper = String(cell || '').toUpperCase();
                    if ((cellUpper.includes('AREA') || 
                         cellUpper.includes('TECHNIQUE') || 
                         cellUpper.includes('PROCESS')) &&
                        !cellUpper.includes('TYPE OF')) {
                        techniqueCol = idx;
                    }
                    if (cellUpper.includes('APPLICATION') || 
                        cellUpper.includes('DESCRIPTION')) {
                        descriptionCol = idx;
                    }
                });
                
                // Si no encontramos headers, asumir columnas 0 y 1
                if (techniqueCol === -1) techniqueCol = 0;
                if (descriptionCol === -1) descriptionCol = 1;
                
                // Verificar si la siguiente fila es header
                if (data[i + 1] && data[i + 1].some(c => {
                    const val = String(c || '').toUpperCase();
                    return val.includes('AREA') || val.includes('TECHNIQUE');
                })) {
                    i++; // Saltar la fila de headers
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
                 rowText.includes('PACKAGING'))) {
                inEmbellishmentsSection = false;
                console.log(`🏁 Fin de sección EMBELLISHMENTS en fila ${i} (${dataRowsFound} filas de datos)`);
                break;
            }

            // Procesar fila de embellishment
            if (inEmbellishmentsSection && techniqueCol >= 0) {
                const technique = String(row[techniqueCol] || '').trim();
                const description = descriptionCol >= 0 ? String(row[descriptionCol] || '').trim() : '';

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

    /**
     * Parsea una fila individual de embellishment
     */
    function parsePlacementRow(technique, description, customer) {
        if (!technique) return null;
        
        const techUpper = technique.toUpperCase().trim();
        const descUpper = (description || '').toUpperCase();

        // Verificar si debemos procesar esta técnica
        const hasForceKeyword = CONFIG.FORCE_PROCESS_KEYWORDS.some(keyword => 
            descUpper.includes(keyword) || techUpper.includes(keyword)
        );

        const isIgnoredTechnique = CONFIG.TECHNIQUES_TO_IGNORE.some(ignoreTech => 
            techUpper.includes(ignoreTech)
        );

        const isProcessTechnique = CONFIG.TECHNIQUES_TO_PROCESS.some(processTech => 
            techUpper.includes(processTech)
        );

        // Decidir si procesamos
        if (!hasForceKeyword && isIgnoredTechnique) {
            console.log(`   ⏭️ Ignorando técnica excluida: ${technique}`);
            return null;
        }

        if (!hasForceKeyword && !isProcessTechnique) {
            console.log(`   ⏭️ Técnica no soportada: ${technique}`);
            return null;
        }

        // Determinar tipo de tinta
        const inkType = determineInkType(techUpper, descUpper, customer);

        // Extraer ubicaciones
        let locations = extractLocations(description, descUpper);

        // Si no hay ubicaciones, intentar inferir
        if (locations.length === 0) {
            locations = inferLocationsFromDescription(descUpper);
        }

        // Si sigue sin ubicaciones, usar genérico
        if (locations.length === 0) {
            console.log(`   ⚠️ Sin ubicación clara para: "${description.substring(0, 40)}", usando FRONT`);
            locations = ['FRONT'];
        }

        // Detectar si es un placement pareado
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

    /**
     * Determina el tipo de tinta
     */
    function determineInkType(technique, description, customer) {
        // 1. Prioridad: palabras clave en descripción
        for (const [keyword, ink] of Object.entries(CONFIG.INK_KEYWORDS)) {
            if (description.includes(keyword)) {
                return ink;
            }
        }

        // 2. Palabras clave en técnica
        if (technique.includes('SILICONE')) return 'SILICONE';
        if (technique.includes('PLASTISOL')) return 'PLASTISOL';
        if (technique.includes('WATER')) return 'WATER';

        // 3. Default por cliente
        const customerUpper = (customer || '').toUpperCase();
        for (const [client, defaultInk] of Object.entries(CONFIG.CLIENT_INK_DEFAULTS)) {
            if (customerUpper.includes(client)) return defaultInk;
        }

        return 'WATER';
    }

    /**
     * Extrae ubicaciones del texto
     */
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

    /**
     * Infiere ubicaciones
     */
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

        return locations.map(loc => CONFIG.LOCATION_MAPPING[loc] || loc);
    }

    // ============================================
    // CREACIÓN DE PLACEMENTS EN UI
    // ============================================

    /**
     * Crea los placements en la UI
     */
    function autoCreatePlacements(detectedPlacements) {
        if (!Array.isArray(detectedPlacements) || detectedPlacements.length === 0) {
            console.log('📭 No hay placements para crear');
            return 0;
        }

        if (!Array.isArray(window.placements)) {
            console.error('❌ window.placements no está definido');
            return 0;
        }

        console.log(`🎯 Creando ${detectedPlacements.length} placements...`);
        
        // Limpiar placements automáticos anteriores
        const manualPlacements = window.placements.filter(p => !p.isAutoGenerated);
        window.placements = manualPlacements;
        
        // Limpiar UI
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

    /**
     * Expande ubicaciones
     */
    function expandLocations(locations, isPaired, description) {
        const expanded = [];
        const descUpper = (description || '').toUpperCase();
        
        locations.forEach(location => {
            if (location === 'SLEEVE' || location === 'SHOULDER') {
                if (isPaired || 
                    descUpper.includes('BOTH') || 
                    descUpper.includes('LEFT AND RIGHT') ||
                    descUpper.includes('LEFT & RIGHT')) {
                    expanded.push(`LEFT ${location}`);
                    expanded.push(`RIGHT ${location}`);
                } else if (descUpper.includes('LEFT') && !descUpper.includes('RIGHT')) {
                    expanded.push(`LEFT ${location}`);
                } else if (descUpper.includes('RIGHT') && !descUpper.includes('LEFT')) {
                    expanded.push(`RIGHT ${location}`);
                } else {
                    // Por defecto, ambos lados
                    expanded.push(`LEFT ${location}`);
                    expanded.push(`RIGHT ${location}`);
                }
            } else {
                expanded.push(location);
            }
        });
        
        return expanded;
    }

    /**
     * Mapea ubicación a tipo
     */
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

    /**
     * Genera detalles de ubicación
     */
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
        if (location.includes('CHEST')) details.push('Chest');
        
        if (descUpper.includes('NUMBER')) details.push('Player Numbers');
        if (descUpper.includes('NAME')) details.push('Player Name');
        if (descUpper.includes('LOGO')) details.push('Team/Brand Logo');
        if (descUpper.includes('WORDMARK')) details.push('Team Wordmark');
        
        return details.join(' • ') || '#.#" FROM COLLAR SEAM';
    }

    /**
     * Detecta especialidades
     */
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
    // FUNCIÓN PRINCIPAL PÚBLICA
    // ============================================

    /**
     * Procesa el Excel y extrae datos + placements
     * Versión robusta que funciona con o sin workbook completo
     */
    function processExcelWithAutomation(worksheet, sheetName = '', workbook = null) {
        console.log('🤖 ExcelAutomation v5.1: Iniciando...');
        
        try {
            let targetData;
            
            // Si tenemos workbook completo, intentar encontrar mejor hoja
            if (workbook && workbook.SheetNames && workbook.SheetNames.length > 0) {
                console.log(`📚 Workbook detectado con ${workbook.SheetNames.length} hojas`);
                
                // Buscar hoja con mejor score
                let bestSheet = null;
                let bestScore = -1;
                
                for (const name of workbook.SheetNames) {
                    const upperName = name.toUpperCase();
                    
                    // Ignorar hojas de referencia
                    if (CONFIG.IGNORE_SHEET_NAMES.some(ignore => upperName.includes(ignore))) {
                        continue;
                    }
                    
                    const sheet = workbook.Sheets[name];
                    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
                    
                    // Calcular score rápido
                    let score = 0;
                    const sampleText = data.slice(0, 20).map(r => r.join(' ')).join(' ').toUpperCase();
                    
                    if (upperName.includes('SWO')) score += 30;
                    if (upperName.includes('PPS')) score += 30;
                    if (sampleText.includes('SAMPLE WORK ORDER')) score += 20;
                    if (sampleText.includes('CUSTOMER') && sampleText.match(/CUSTOMER[:\s]+([A-Z])/)) score += 25;
                    
                    if (score > bestScore) {
                        bestScore = score;
                        bestSheet = { name, data, sheet };
                    }
                }
                
                if (bestSheet && bestScore > 20) {
                    console.log(`🏆 Usando hoja: "${bestSheet.name}" (score: ${bestScore})`);
                    targetData = bestSheet.data;
                    sheetName = bestSheet.name;
                } else {
                    console.log('⚠️ No se encontró hoja mejor, usando la proporcionada');
                    targetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                }
            } else {
                // Modo fallback: usar la hoja proporcionada
                console.log(`📄 Modo hoja única: ${sheetName}`);
                targetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
            }
            
            // Extraer datos básicos
            const extracted = extractBasicData(targetData, sheetName);
            
            // Detectar placements
            const placements = detectPlacements(targetData, extracted.customer);
            
            // Crear en UI
            if (placements.length > 0 && typeof window.placements !== 'undefined') {
                autoCreatePlacements(placements);
            }
            
            return { 
                ...extracted, 
                autoPlacements: placements,
                sourceSheet: sheetName 
            };
            
        } catch (error) {
            console.error('❌ Error en ExcelAutomation:', error);
            // Retornar objeto vacío pero válido
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

console.log('✅ Excel Automation v5.1 (Robusto - con/sin workbook) cargado');
