// excel-automation.js - Automatización inteligente de placements desde Excel
// VERSIÓN MEJORADA - Con mejor detección de técnicas y ubicaciones

window.ExcelAutomation = (function() {
    'use strict';

    // ============================================
    // CONFIGURACIÓN
    // ============================================
    
    const CONFIG = {
        // Técnicas que SIEMPRE debemos procesar (imprimir)
        TECHNIQUES_TO_PROCESS: [
            'SCREENPRINT', 'SCREEN PRINT', 'SCREEN', 
            'SILICONE', 'WATERBASE', 'WATER BASE', 'PLASTISOL'
        ],
        
        // Técnicas que DEBEMOS IGNORAR (a menos que tengan palabras clave)
        TECHNIQUES_TO_IGNORE: [
            'EMBROIDERY', 'EMB', 
            'SUBLIMATION', 'SUB', 
            'HEAT TRANSFER', 'HT',
            'DTF', 'DIRECT TO FILM',
            'Puff'
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
            'STRIPES': 'SLEEVE'
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
            'WATER BASE': 'WATER'
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
        }
    };

    // ============================================
    // FUNCIONES PRINCIPALES
    // ============================================

    /**
     * Procesa el Excel y extrae datos + placements
     */
    function processExcelWithAutomation(worksheet, sheetName = '') {
        console.log('🤖 ExcelAutomation: Procesando hoja', sheetName);
        
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        const extracted = extractBasicData(data, sheetName);
        const placements = detectPlacements(data, extracted.customer);
        
        console.log(`📊 Datos extraídos:`, extracted);
        console.log(`📦 Placements detectados:`, placements);
        
        return { ...extracted, autoPlacements: placements };
    }

    /**
     * Extrae datos básicos del Excel (customer, style, etc.)
     */
    function extractBasicData(data, sheetName = '') {
        const extracted = {};
        const isSWOSheet = sheetName.includes('SWO') || sheetName.includes('PPS');

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row) continue;

            for (let j = 0; j < row.length; j++) {
                const cell = String(row[j] || '').trim();

                if (cell.includes('CUSTOMER:')) {
                    extracted.customer = String(row[j + 1] || '').trim();
                } else if (cell.includes('STYLE:')) {
                    extracted.style = String(row[j + 1] || '').trim();
                    if (window.detectTeamFromStyle) {
                        extracted.team = window.detectTeamFromStyle(extracted.style, extracted.colorway, extracted.customer);
                    }
                } else if (cell.includes('COLORWAY')) {
                    extracted.colorway = String(row[j + 1] || '').trim();
                } else if (cell.includes('SEASON:')) {
                    extracted.season = String(row[j + 1] || '').trim();
                } else if (cell.includes('P.O.')) {
                    extracted.po = String(row[j + 1] || '').trim();
                } else if (cell.includes('SAMPLE TYPE')) {
                    extracted.sample = String(row[j + 1] || '').trim();
                } else if (cell.includes('TEAM:')) {
                    extracted.team = String(row[j + 1] || '').trim();
                } else if (cell.includes('GENDER:')) {
                    extracted.gender = String(row[j + 1] || '').trim();
                }
            }
        }

        // Normalización GFS
        if (window.normalizeGearForSportStyleAndColorway && extracted.customer) {
            const normalized = window.normalizeGearForSportStyleAndColorway(
                extracted.style, extracted.colorway, extracted.customer
            );
            extracted.style = normalized.style || extracted.style;
            extracted.colorway = normalized.colorway || extracted.colorway;
        }

        return extracted;
    }

    /**
     * Detecta placements en la sección de embellishments
     */
    function detectPlacements(data, customer = '') {
        const placements = [];
        let inEmbellishmentsSection = false;
        let techniqueCol = -1;
        let descriptionCol = -1;

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row) continue;

            const rowText = row.map(c => String(c || '').toUpperCase()).join(' ');

            // Detectar inicio de sección EMBELLISHMENTS
            if (rowText.includes('EMBELLISHMENTS') || rowText.includes('APPLICATION')) {
                inEmbellishmentsSection = true;
                
                // Encontrar índices de columnas
                row.forEach((cell, idx) => {
                    const cellUpper = String(cell || '').toUpperCase();
                    if (cellUpper.includes('AREA') || cellUpper.includes('TECHNIQUE') || cellUpper.includes('PROCESS')) {
                        techniqueCol = idx;
                    }
                    if (cellUpper.includes('APPLICATION') || cellUpper.includes('DESCRIPTION')) {
                        descriptionCol = idx;
                    }
                });
                continue;
            }

            // Detectar fin de sección
            if (inEmbellishmentsSection && 
                (rowText.includes('SHIPPING') || rowText.includes('TOTAL UNITS'))) {
                inEmbellishmentsSection = false;
                break;
            }

            // Procesar fila de embellishment
            if (inEmbellishmentsSection && techniqueCol >= 0) {
                const technique = String(row[techniqueCol] || '').trim();
                const description = descriptionCol >= 0 ? String(row[descriptionCol] || '').trim() : '';

                if (technique && technique.toUpperCase() !== 'AREA') {
                    const placement = parsePlacementRow(technique, description, customer);
                    if (placement) {
                        placements.push(placement);
                    }
                }
            }
        }

        return placements;
    }

    /**
     * Parsea una fila individual de embellishment
     */
    function parsePlacementRow(technique, description, customer) {
        const techUpper = technique.toUpperCase().trim();
        const descUpper = description.toUpperCase();

        // --- 1. VERIFICAR SI DEBEMOS PROCESAR ESTA TÉCNICA ---
        
        // Verificar si tiene palabras clave que fuerzan el procesamiento
        const hasForceKeyword = CONFIG.FORCE_PROCESS_KEYWORDS.some(keyword => 
            descUpper.includes(keyword) || techUpper.includes(keyword)
        );

        // Verificar si es una técnica a ignorar
        const isIgnoredTechnique = CONFIG.TECHNIQUES_TO_IGNORE.some(ignoreTech => 
            techUpper.includes(ignoreTech)
        );

        // Verificar si es una técnica a procesar
        const isProcessTechnique = CONFIG.TECHNIQUES_TO_PROCESS.some(processTech => 
            techUpper.includes(processTech)
        );

        // Decidir si procesamos
        if (!hasForceKeyword && isIgnoredTechnique) {
            console.log(`⏭️ Ignorando técnica: ${technique} - ${description}`);
            return null;
        }

        if (!hasForceKeyword && !isProcessTechnique) {
            console.log(`⏭️ Técnica no soportada: ${technique}`);
            return null;
        }

        // --- 2. DETERMINAR TIPO DE TINTA ---
        const inkType = determineInkType(techUpper, descUpper, customer);

        // --- 3. EXTRAER UBICACIONES ---
        let locations = extractLocations(description, descUpper);

        // Si no hay ubicaciones, intentar inferir
        if (locations.length === 0) {
            locations = inferLocationsFromDescription(descUpper);
        }

        // Si sigue sin ubicaciones, no crear placement
        if (locations.length === 0) {
            console.log(`⚠️ No se pudo determinar ubicación para: ${description}`);
            return null;
        }

        // --- 4. DETECTAR SI ES UN PLACEMENT PAREADO (izquierda/derecha) ---
        const isPaired = CONFIG.PAIRED_PATTERNS.some(pattern => 
            pattern.test(description)
        ) || locations.some(loc => loc === 'SLEEVE' || loc === 'SHOULDER');

        return {
            technique: technique,
            description: description,
            inkType: inkType,
            locations: locations,
            isPaired: isPaired,
            fullText: `${technique} - ${description}`
        };
    }

    /**
     * Determina el tipo de tinta basado en la descripción y el cliente
     */
    function determineInkType(technique, description, customer) {
        // 1. Prioridad: palabras clave en descripción
        for (const [keyword, ink] of Object.entries(CONFIG.INK_KEYWORDS)) {
            if (description.includes(keyword)) {
                console.log(`🎨 Tinta detectada por keyword: ${keyword} -> ${ink}`);
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
            if (customerUpper.includes(client)) {
                console.log(`🎨 Tinta por cliente: ${client} -> ${defaultInk}`);
                return defaultInk;
            }
        }

        return 'WATER';
    }

    /**
     * Extrae ubicaciones del texto de descripción
     */
    function extractLocations(description, descUpper) {
        const locations = [];
        
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
     * Infiere ubicaciones cuando no se encuentran explícitamente
     */
    function inferLocationsFromDescription(descUpper) {
        const locations = [];
        
        if (descUpper.includes('NUMBER')) locations.push('TV. NUMBERS');
        if (descUpper.includes('NAME')) locations.push('NAMEPLATE');
        if (descUpper.includes('LOGO')) locations.push('LOGO');
        if (descUpper.includes('WORDMARK')) locations.push('WORDMARK');
        if (descUpper.includes('SWOOSH')) locations.push('SWOOSH');
        if (descUpper.includes('STRIPE')) locations.push('STRIPES');

        return locations.map(loc => CONFIG.LOCATION_MAPPING[loc] || loc);
    }

    /**
     * Crea los placements en la UI
     */
    function autoCreatePlacements(detectedPlacements) {
        if (!Array.isArray(detectedPlacements) || detectedPlacements.length === 0) {
            console.log('📭 No hay placements para crear');
            return 0;
        }

        console.log(`🎯 Creando ${detectedPlacements.length} placements...`);
        
        let placementCount = 0;

        detectedPlacements.forEach((detected) => {
            // Determinar si debemos expandir este placement en múltiples ubicaciones
            const locationsToCreate = expandLocations(detected.locations, detected.isPaired, detected.description);
            
            locationsToCreate.forEach(location => {
                const placementType = mapLocationToType(location, detected.description);
                
                const newPlacement = {
                    id: Date.now() + placementCount + Math.random(),
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
                    isAutoGenerated: true,
                    isPaired: false // Ya expandido, ya no es "par"
                };

                // Añadir a window.placements
                if (Array.isArray(window.placements)) {
                    window.placements.push(newPlacement);
                    if (typeof window.renderPlacementHTML === 'function') {
                        window.renderPlacementHTML(newPlacement);
                    }
                    placementCount++;
                }
            });
        });

        if (placementCount > 0 && typeof window.updatePlacementsTabs === 'function') {
            window.updatePlacementsTabs();
        }
        if (placementCount > 0 && typeof window.showStatus === 'function') {
            window.showStatus(`✅ ${placementCount} placements generados`, 'success');
        }

        return placementCount;
    }

    /**
     * Expande ubicaciones según sea necesario
     */
    function expandLocations(locations, isPaired, description) {
        const expanded = [];
        
        locations.forEach(location => {
            switch(location) {
                case 'SLEEVE':
                case 'SHOULDER':
                    if (isPaired || description.toUpperCase().includes('BOTH')) {
                        expanded.push(`LEFT ${location}`);
                        expanded.push(`RIGHT ${location}`);
                    } else {
                        expanded.push(location);
                    }
                    break;
                    
                case 'FRONT':
                case 'BACK':
                case 'COLLAR':
                case 'CHEST':
                default:
                    expanded.push(location);
                    break;
            }
        });
        
        return expanded;
    }

    /**
     * Mapea ubicación a tipo de placement
     */
    function mapLocationToType(location, description) {
        const descUpper = description.toUpperCase();
        
        // Mapeo especial para números
        if (location.includes('NUMBERS') || location.includes('TV')) {
            return descUpper.includes('TV') ? 'TV. NUMBERS' : 'NUMBERS';
        }
        
        // Quitar prefijos LEFT/RIGHT para el tipo base
        const baseLocation = location.replace(/^(LEFT|RIGHT)\s+/, '');
        
        const typeMap = {
            'FRONT': 'FRONT',
            'BACK': 'BACK',
            'SLEEVE': 'SLEEVE',
            'SHOULDER': 'SHOULDER',
            'COLLAR': 'COLLAR',
            'CHEST': 'CHEST',
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
     * Genera detalles de ubicación para el campo placementDetails
     */
    function generatePlacementDetails(detected, location) {
        const details = [];
        const descUpper = detected.description.toUpperCase();
        
        if (location.includes('FRONT')) details.push('Center Front');
        if (location.includes('BACK')) details.push('Center Back');
        if (location.includes('SHOULDER')) details.push(location.includes('LEFT') ? 'Left Shoulder' : 'Right Shoulder');
        if (location.includes('SLEEVE')) details.push(location.includes('LEFT') ? 'Left Sleeve' : 'Right Sleeve');
        if (location.includes('COLLAR')) details.push('Collar');
        
        if (descUpper.includes('NUMBER')) details.push('Player Numbers');
        if (descUpper.includes('NAME')) details.push('Player Name');
        if (descUpper.includes('LOGO')) details.push('Team/Brand Logo');
        if (descUpper.includes('WORDMARK')) details.push('Team Wordmark');
        if (descUpper.includes('SWOOSH')) details.push('Swoosh');
        
        return details.join(' • ') || '#.#" FROM COLLAR SEAM';
    }

    /**
     * Detecta especialidades (HD, Metallic, etc.)
     */
    function detectSpecialties(detected) {
        const specialties = [];
        const desc = (detected.description || '').toUpperCase();
        
        if (desc.includes('HD') || desc.includes('HIGH DENSITY')) specialties.push('HIGH DENSITY');
        if (desc.includes('METALLIC') || desc.includes('GOLD') || desc.includes('SILVER')) specialties.push('METALLIC');
        if (desc.includes('FOIL')) specialties.push('FOIL');
        
        return specialties.join(', ');
    }

    /**
     * Obtiene temperatura según tipo de tinta
     */
    function getTempForInk(inkType) {
        const temps = { 'WATER': '320 °F', 'PLASTISOL': '320 °F', 'SILICONE': '320 °F' };
        return temps[inkType] || '320 °F';
    }

    /**
     * Obtiene tiempo según tipo de tinta
     */
    function getTimeForInk(inkType) {
        const times = { 'WATER': '1:40 min', 'PLASTISOL': '1:00 min', 'SILICONE': '1:40 min' };
        return times[inkType] || '1:40 min';
    }

    // ============================================
    // API PÚBLICA
    // ============================================

    return {
        processExcelWithAutomation: processExcelWithAutomation,
        autoCreatePlacements: autoCreatePlacements,
        extractBasicData: extractBasicData,
        CONFIG: CONFIG
    };

})();

console.log('✅ Excel Automation (v3 mejorada) cargado');
