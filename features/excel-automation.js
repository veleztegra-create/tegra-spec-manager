// excel-automation.js - Automatización inteligente de placements desde Excel
// VERSIÓN CORREGIDA - Con filtrado por técnica y expansión correcta

window.ExcelAutomation = (function() {
    // Configuración de clientes y sus tintas por defecto
    const CLIENT_INK_DEFAULTS = {
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
    };

    // Palabras clave que indican tipo de tinta específico
    const INK_KEYWORDS = {
        'SILICONE': 'SILICONE',
        'SHINY SILICONE': 'SILICONE',
        'PLASTISOL': 'PLASTISOL',
        'WATERBASE': 'WATER',
        'WATER-BASE': 'WATER',
        'WATER BASE': 'WATER'
    };

    // Técnicas que DEBEMOS procesar (imprimir)
    const TECHNIQUES_TO_PROCESS = ['SCREENPRINT', 'SCREEN PRINT', 'SCREEN'];
    // Técnicas que DEBEMOS IGNORAR
    const TECHNIQUES_TO_IGNORE = ['EMBROIDERY', 'EMB', 'SUBLIMATION', 'SUB', 'HEAT TRANSFER', 'HT'];

    // Parser de ubicaciones desde descripción
    const LOCATION_PATTERNS = [
        { regex: /Front/i, placement: 'FRONT' },
        { regex: /Back/i, placement: 'BACK' },
        { regex: /Shoulder/i, placement: 'SHOULDER' },
        { regex: /Sleeve/i, placement: 'SLEEVE' },
        { regex: /Collar/i, placement: 'COLLAR' },
        { regex: /Neck/i, placement: 'COLLAR' },
        { regex: /Chest/i, placement: 'CHEST' },
        { regex: /Nameplate/i, placement: 'NAMEPLATE' },
        { regex: /Yoke/i, placement: 'YOKE' },
        { regex: /TV\.?\s*NUMBERS?/i, placement: 'TV. NUMBERS' },
        { regex: /Numbers?/i, placement: 'NUMBERS' },
        { regex: /Wordmark/i, placement: 'WORDMARK' },
        { regex: /Logo/i, placement: 'LOGO' },
        { regex: /Swoosh/i, placement: 'SWOOSH' },
        { regex: /Stripes?/i, placement: 'STRIPES' }
    ];

    // ========== FUNCIÓN PARA EXTRAER DATOS BÁSICOS (COPIADA DE APP.JS) ==========
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
                } else if (cell.includes('PATTERN')) {
                    extracted.pattern = String(row[j + 1] || '').trim();
                } else if (cell.includes('P.O.')) {
                    extracted.po = String(row[j + 1] || '').trim();
                } else if (cell.includes('SAMPLE TYPE') || cell.includes('SAMPLE:')) {
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
            const normalized = window.normalizeGearForSportStyleAndColorway(extracted.style, extracted.colorway, extracted.customer);
            extracted.style = normalized.style || extracted.style;
            extracted.colorway = normalized.colorway || extracted.colorway;
        }

        return extracted;
    }

    // ========== FUNCIÓN PARA DETECTAR PLACEMENTS ==========
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
                const technique = String(row[techniqueCol] || '').trim().toUpperCase();
                const description = descriptionCol >= 0 ? String(row[descriptionCol] || '').trim() : '';

                if (technique && technique !== 'AREA') {
                    const placement = parsePlacementRow(technique, description, customer);
                    if (placement) placements.push(placement);
                }
            }
        }
        return placements;
    }

    // ========== PARSEAR UNA FILA ==========
    function parsePlacementRow(technique, description, customer) {
        const techUpper = technique.toUpperCase();
        const descUpper = description.toUpperCase();

        // --- 1. FILTRAR POR TÉCNICA ---
        // ¿Es una técnica que debemos IGNORAR?
        for (let ignoreTech of TECHNIQUES_TO_IGNORE) {
            if (techUpper.includes(ignoreTech)) {
                console.log(`Ignorando técnica: ${technique}`);
                return null; // Ignorar completamente
            }
        }

        // ¿Es una técnica que DEBEMOS procesar?
        let shouldProcess = false;
        for (let processTech of TECHNIQUES_TO_PROCESS) {
            if (techUpper.includes(processTech)) {
                shouldProcess = true;
                break;
            }
        }
        // Si no es una técnica a procesar, la ignoramos (ej. "Direct To Film")
        if (!shouldProcess) {
            console.log(`Técnica no soportada (ignorando): ${technique}`);
            return null;
        }

        // --- 2. DETERMINAR TIPO DE TINTA (con lógica mejorada) ---
        let inkType = determineInkType(techUpper, descUpper, customer);

        // --- 3. EXTRAER UBICACIONES DESDE LA DESCRIPCIÓN ---
        const locations = extractLocations(description);
        if (locations.length === 0) {
            // Si no hay ubicaciones, intentar inferir de la descripción
            if (descUpper.includes('NUMBER')) locations.push('NUMBERS');
            if (descUpper.includes('NAME')) locations.push('NAMEPLATE');
            if (descUpper.includes('LOGO')) locations.push('LOGO');
            if (descUpper.includes('SWOOSH')) locations.push('SWOOSH');
        }

        // Si sigue sin ubicaciones, asignar FRONT por defecto? Mejor no crear nada.
        if (locations.length === 0) {
            console.log(`No se pudo determinar ubicación para: ${description}`);
            return null;
        }

        return {
            technique: technique,
            description: description,
            inkType: inkType,
            locations: locations,
            fullText: `${technique} - ${description}`,
            isPaired: locations.some(loc => loc === 'SLEEVE' || loc === 'SHOULDER') // Marcar si es doble
        };
    }

    // ========== DETERMINAR TIPO DE TINTA ==========
    function determineInkType(technique, description, customer) {
        // 1. Prioridad: palabras clave en descripción (ej: Shiny Silicone)
        for (const [keyword, ink] of Object.entries(INK_KEYWORDS)) {
            if (description.includes(keyword)) return ink;
        }

        // 2. Default por cliente
        const customerUpper = (customer || '').toUpperCase();
        for (const [client, defaultInk] of Object.entries(CLIENT_INK_DEFAULTS)) {
            if (customerUpper.includes(client)) return defaultInk;
        }

        return 'WATER'; // Default final
    }

    // ========== EXTRAER UBICACIONES ==========
    function extractLocations(description) {
        const locations = [];
        if (!description) return locations;

        const descUpper = description.toUpperCase();

        for (const pattern of LOCATION_PATTERNS) {
            if (pattern.regex.test(descUpper)) {
                if (!locations.includes(pattern.placement)) {
                    locations.push(pattern.placement);
                }
            }
        }
        return locations;
    }

    // ========== CREAR PLACEMENTS EN LA UI ==========
    function autoCreatePlacements(detectedPlacements) {
        if (!Array.isArray(detectedPlacements) || detectedPlacements.length === 0) return 0;

        // Limpiar placements existentes SOLO si vamos a crear nuevos
        if (typeof window.placements !== 'undefined' && typeof window.addNewPlacement === 'function') {
            // En lugar de reemplazar, añadimos. Pero necesitamos una función para limpiar si se desea.
            // Por ahora, asumimos que se cargan sobre una spec nueva o vacía.
            // Un enfoque más seguro es no limpiar y solo añadir.
            console.log("Añadiendo placements automáticos a los existentes...");
        } else {
            console.error("Funciones de window no disponibles para crear placements.");
            return 0;
        }

        let placementCount = 0;
        detectedPlacements.forEach((detected) => {
            detected.locations.forEach((location) => {
                // Mapear ubicaciones genéricas a tipos específicos
                let placementType = mapLocationToType(location, detected.description);

                const newPlacement = {
                    id: Date.now() + placementCount + Math.random(),
                    type: placementType,
                    name: `${placementType} ${placementCount + 1}`,
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
                    isPaired: detected.isPaired // ¡Guardamos esta bandera!
                };

                // Usar la función global de app.js para añadir
                if (typeof window.addNewPlacement === 'function') {
                    // addNewPlacement espera (type, isFirst). Adaptamos.
                    // Como no podemos pasar el objeto completo, tenemos que crearlo y luego modificarlo.
                    // Es más fácil manipular window.placements directamente si existe.
                    if (Array.isArray(window.placements)) {
                        window.placements.push(newPlacement);
                        if (typeof window.renderPlacementHTML === 'function') {
                            window.renderPlacementHTML(newPlacement);
                        }
                        placementCount++;
                    } else {
                        console.error("window.placements no es un array");
                    }

                } else {
                    console.error("addNewPlacement no está disponible");
                }
            });
        });

        if (placementCount > 0 && typeof window.updatePlacementsTabs === 'function') {
            window.updatePlacementsTabs();
        }
        if (placementCount > 0 && typeof window.showStatus === 'function') {
            window.showStatus(`✅ ${placementCount} placements generados automáticamente`, 'success');
        }

        return placementCount;
    }

    // ========== MAPEAR UBICACIÓN A TIPO DE PLACEMENT ==========
    function mapLocationToType(location, description) {
        const descUpper = description.toUpperCase();
        if (location === 'NUMBERS' && descUpper.includes('TV')) {
            return 'TV. NUMBERS';
        }
        if (location === 'SWOOSH') {
            return 'SLEEVE'; // Los swooshes van en mangas
        }
        // Mapeo directo
        const locationMap = {
            'FRONT': 'FRONT',
            'BACK': 'BACK',
            'SLEEVE': 'SLEEVE',
            'SHOULDER': 'SHOULDER',
            'COLLAR': 'COLLAR',
            'CHEST': 'CHEST',
            'NUMBERS': 'TV. NUMBERS',
            'NAMEPLATE': 'BACK',
            'WORDMARK': 'FRONT',
            'LOGO': 'FRONT',
            'STRIPES': 'SLEEVE'
        };
        return locationMap[location] || location || 'CUSTOM';
    }

    // ========== GENERAR DETALLES DE UBICACIÓN ==========
    function generatePlacementDetails(detected, location) {
        const details = [];
        if (location === 'FRONT') details.push('Center Front');
        if (location === 'BACK') details.push('Center Back');
        if (location === 'SHOULDER') details.push('Left/Right Shoulder');
        if (location === 'SLEEVE') details.push('Left/Right Sleeve');
        if (detected.description.toUpperCase().includes('NUMBER')) details.push('Player Numbers');
        if (detected.description.toUpperCase().includes('LOGO')) details.push('Team/Brand Logo');
        if (detected.description.toUpperCase().includes('WORDMARK')) details.push('Team Wordmark');
        if (detected.description.toUpperCase().includes('SWOOSH')) details.push('Swoosh');
        return details.join(' • ') || '#.#" FROM COLLAR SEAM';
    }

    // ========== DETECTAR ESPECIALIDADES ==========
    function detectSpecialties(detected) {
        const specialties = [];
        const desc = (detected.description || '').toUpperCase();
        if (desc.includes('HD') || desc.includes('HIGH DENSITY')) specialties.push('HIGH DENSITY');
        if (desc.includes('METALLIC') || desc.includes('GOLD') || desc.includes('SILVER')) specialties.push('METALLIC');
        if (desc.includes('FOIL')) specialties.push('FOIL');
        return specialties.join(', ');
    }

    function getTempForInk(inkType) {
        const temps = { 'WATER': '320 °F', 'PLASTISOL': '320 °F', 'SILICONE': '320 °F' };
        return temps[inkType] || '320 °F';
    }

    function getTimeForInk(inkType) {
        const times = { 'WATER': '1:40 min', 'PLASTISOL': '1:00 min', 'SILICONE': '1:40 min' };
        return times[inkType] || '1:40 min';
    }

    // ========== API PÚBLICA ==========
    return {
        extractBasicData: extractBasicData,
        processExcelWithAutomation: function(worksheet, sheetName = '') {
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
            const extracted = extractBasicData(data, sheetName);
            const placements = detectPlacements(data, extracted.customer);
            return { ...extracted, autoPlacements: placements };
        },
        autoCreatePlacements: autoCreatePlacements
    };

})();

console.log('✅ Excel Automation (v2 corregida) cargado');
