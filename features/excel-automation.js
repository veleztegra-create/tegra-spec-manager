// excel-automation.js - Automatización inteligente de placements desde Excel
// VERSIÓN v5 - Auto-detección de hoja con datos (SWO/PPS/Genérico)

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
    // DETECCIÓN INTELIGENTE DE HOJA
    // ============================================

    /**
     * Encuentra la mejor hoja automáticamente basándose en contenido real
     */
    function findBestSheet(workbook) {
        if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
            console.error('❌ Workbook inválido o sin hojas');
            return null;
        }

        const candidates = [];
        
        for (const sheetName of workbook.SheetNames) {
            const upperName = sheetName.toUpperCase();
            
            // Ignorar hojas obvias de referencia/instrucciones
            if (CONFIG.IGNORE_SHEET_NAMES.some(ignore => upperName.includes(ignore))) {
                console.log(`⏭️ Ignorando hoja de referencia: ${sheetName}`);
                continue;
            }
            
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
            
            // Calcular score de esta hoja
            const score = calculateSheetScore(data, sheetName);
            
            candidates.push({
                name: sheetName,
                score: score,
                data: data,
                sheet: sheet
            });
            
            console.log(`📊 Hoja "${sheetName}": Score ${score}/100`);
        }
        
        // Ordenar por score descendente
        candidates.sort((a, b) => b.score - a.score);
        
        const winner = candidates[0];
        
        if (!winner || winner.score < 20) {
            console.warn('⚠️ No se encontró hoja con datos claros, usando primera disponible');
            const firstValid = workbook.SheetNames.find(n => 
                !CONFIG.IGNORE_SHEET_NAMES.some(i => n.toUpperCase().includes(i))
            );
            const fallbackName = firstValid || workbook.SheetNames[0];
            return {
                name: fallbackName,
                data: XLSX.utils.sheet_to_json(workbook.Sheets[fallbackName], { header: 1, defval: '' }),
                sheet: workbook.Sheets[fallbackName]
            };
        }
        
        console.log(`🏆 Mejor hoja seleccionada: "${winner.name}" (Score: ${winner.score})`);
        return winner;
    }

    /**
     * Calcula qué tan buena es una hoja (0-100+)
     */
    function calculateSheetScore(data, sheetName) {
        let score = 0;
        const upperName = sheetName.toUpperCase();
        const allText = data.slice(0, 30).map(r => r.join(' ')).join(' ').toUpperCase();
        
        // Bonus por nombre (SWO o PPS son preferidos)
        if (upperName.includes('SWO')) score += 40;
        if (upperName.includes('PPS')) score += 40;
        if (upperName.includes('SAMPLE')) score += 20;
        if (upperName.includes('WORK ORDER')) score += 20;
        
        // Bonus por contenido de SAMPLE WORK ORDER
        if (allText.includes('SAMPLE WORK ORDER')) score += 30;
        
        // Bonus por campos clave encontrados
        if (allText.includes('CUSTOMER')) score += 15;
        if (allText.includes('STYLE')) score += 15;
        if (allText.includes('COLORWAY')) score += 10;
        if (allText.includes('EMBELLISHMENTS')) score += 20;
        
        // Bonus por tener CUSTOMER con valor real (no vacío)
        for (let i = 0; i < Math.min(20, data.length); i++) {
            const row = data[i];
            if (!row) continue;
            
            for (let j = 0; j < row.length; j++) {
                const cell = String(row[j] || '').toUpperCase();
                const nextCell = String(row[j + 1] || '').trim();
                
                // Si encontramos CUSTOMER: con un valor real después
                if ((cell.includes('CUSTOMER') || cell.includes('CUSTOMER:')) && 
                    nextCell && 
                    nextCell.length > 2 &&
                    !nextCell.toUpperCase().includes('CUSTOMER') &&
                    !nextCell.includes(':')) {
                    score += 25; // Tiene customer real (ej: "GEAR FOR SPORT", "Fanatics")
                }
            }
        }
        
        // Penalización: Si parece template vacío tipo "Proto X"
        if (upperName.includes('PROTO') && !allText.includes('CUSTOMER:')) {
            score -= 50;
        }
        
        return Math.max(0, score);
    }

    // ============================================
    // EXTRACCIÓN DE DATOS BÁSICOS
    // ============================================

    /**
     * Extrae datos básicos del Excel (customer, style, etc.)
     */
    function extractBasicData(data, sheetName = '') {
        const extracted = {};
        const sheetUpper = (sheetName || '').toUpperCase();
        
        // Detectar tipo de formato
        const isStructuredFormat = sheetUpper.includes('SWO') || 
                                   sheetUpper.includes('PPS') || 
                                   sheetUpper.includes('SAMPLE');
        
        console.log(`📄 Procesando hoja: ${sheetName} (Formato: ${isStructuredFormat ? 'SWO/PPS' : 'Genérico'})`);

        if (isStructuredFormat) {
            // Formato SWO/PPS: Labels en col A o B, valores en col siguiente
            for (let i = 0; i < Math.min(data.length, 30); i++) {
                const row = data[i];
                if (!row || row.length < 2) continue;

                // Buscar en columnas A (0) y B (1) por labels
                for (let col = 0; col < Math.min(3, row.length); col++) {
                    const rawCell = row[col];
                    if (rawCell === undefined || rawCell === null) continue;
                    
                    const cell = String(rawCell).trim();
                    const cellUpper = cell.toUpperCase();
                    
                    // Obtener valor de la columna siguiente (o misma fila, siguiente columna)
                    let value = '';
                    if (col + 1 < row.length) {
                        value = String(row[col + 1] || '').trim();
                    }
                    
                    // También buscar en filas debajo si el valor está vacío (formato vertical)
                    if (!value && i + 1 < data.length && data[i + 1]) {
                        const belowCell = data[i + 1][col];
                        if (belowCell !== undefined && belowCell !== null) {
                            value = String(belowCell).trim();
                        }
                    }

                    if (!cell || cell.length < 2) continue;

                    // Mapeo de campos
                    if ((cellUpper.includes('CUSTOMER') || cellUpper === 'CUSTOMER:') && 
                        !cellUpper.includes('IM#') && 
                        !cellUpper.includes('VENDOR')) {
                        extracted.customer = value;
                    }
                    else if ((cellUpper.includes('STYLE') || cellUpper === 'STYLE:') && 
                             !cellUpper.includes('TYPE') && 
                             !cellUpper.includes('PATTERN')) {
                        extracted.style = value.replace(/<br\s*\/?>/gi, ' ').trim();
                    }
                    else if (cellUpper.includes('COLORWAY') && 
                            !cellUpper.includes('COLORWAY NAME')) {
                        extracted.colorway = value;
                    }
                    else if (cellUpper.includes('SEASON') || cellUpper === 'SEASON:') {
                        extracted.season = value;
                    }
                    else if ((cellUpper.includes('P.O.') || cellUpper.includes('PO #') || cellUpper === 'P.O. #:') && 
                             !cellUpper.includes('IM#')) {
                        extracted.po = value;
                    }
                    else if ((cellUpper.includes('SAMPLE TYPE') || cellUpper === 'SAMPLE:' || cellUpper === 'SAMPLE TYPE:') &&
                             !cellUpper.includes('REQUESTED')) {
                        extracted.sample = value;
                    }
                    else if (cellUpper.includes('PATTERN') || cellUpper === 'PATTERN #:') {
                        extracted.pattern = value;
                    }
                    else if (cellUpper.includes('TEAM') || cellUpper === 'TEAM:') {
                        extracted.team = value;
                    }
                    else if (cellUpper.includes('GENDER') || cellUpper === 'GENDER:') {
                        extracted.gender = value;
                    }
                    else if (cellUpper.includes('DATE') || cellUpper === 'DATE:') {
                        extracted.date = value;
                    }
                    else if (cellUpper.includes('REQUESTED BY') || cellUpper === 'REQUESTED BY:') {
                        extracted.requestedBy = value;
                    }
                }
            }
        } else {
            // Formato genérico: Buscar "LABEL: valor" en cualquier celda
            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                if (!row) continue;

                for (let j = 0; j < row.length; j++) {
                    const cell = String(row[j] || '').trim();
                    if (!cell) continue;
                    
                    const cellUpper = cell.toUpperCase();
                    const value = String(row[j + 1] || '').trim();

                    if (cellUpper.includes('CUSTOMER:')) {
                        extracted.customer = value;
                    } else if (cellUpper.includes('STYLE:')) {
                        extracted.style = value.replace(/<br\s*\/?>/gi, ' ').trim();
                    } else if (cellUpper.includes('COLORWAY')) {
                        extracted.colorway = value;
                    } else if (cellUpper.includes('SEASON:')) {
                        extracted.season = value;
                    } else if (cellUpper.includes('P.O.')) {
                        extracted.po = value;
                    } else if (cellUpper.includes('SAMPLE TYPE') || cellUpper.includes('SAMPLE:')) {
                        extracted.sample = value;
                    } else if (cellUpper.includes('PATTERN')) {
                        extracted.pattern = value;
                    }
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
        let headerRow = -1;

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row) continue;

            const rowText = (row || []).map(c => String(c || '').toUpperCase()).join(' ');

            // Detectar inicio de sección EMBELLISHMENTS
            if (rowText.includes('EMBELLISHMENTS') && 
                !rowText.includes('END') && 
                !rowText.includes('COMMENTS')) {
                inEmbellishmentsSection = true;
                headerRow = i;
                console.log(`🎯 Sección EMBELLISHMENTS encontrada en fila ${i}`);
                
                // Encontrar índices de columnas en la siguiente fila (header) o misma fila
                const headerRowData = data[i + 1] || row;
                headerRowData.forEach((cell, idx) => {
                    const cellUpper = String(cell || '').toUpperCase();
                    if (cellUpper.includes('AREA') || 
                        cellUpper.includes('TECHNIQUE') || 
                        cellUpper.includes('PROCESS') ||
                        cellUpper === 'AREA') {
                        techniqueCol = idx;
                        console.log(`   📍 Columna técnica: ${idx} (${cell})`);
                    }
                    if (cellUpper.includes('APPLICATION') || 
                        cellUpper.includes('DESCRIPTION') ||
                        cellUpper === 'APPLICATION') {
                        descriptionCol = idx;
                        console.log(`   📍 Columna descripción: ${idx} (${cell})`);
                    }
                });
                
                // Si no encontramos headers, asumir columnas 0 y 1
                if (techniqueCol === -1) techniqueCol = 0;
                if (descriptionCol === -1) descriptionCol = 1;
                
                if (data[i + 1] && data[i + 1].some(c => String(c || '').toUpperCase().includes('AREA'))) {
                    i++; // Saltar la fila de headers si existe
                }
                continue;
            }

            // Detectar fin de sección
            if (inEmbellishmentsSection && 
                (rowText.includes('SHIPPING') || 
                 rowText.includes('TOTAL UNITS') || 
                 rowText.includes('SUPPLIES') || 
                 rowText.includes('FABRICS') ||
                 rowText.includes('TRIMS'))) {
                inEmbellishmentsSection = false;
                console.log(`🏁 Fin de sección EMBELLISHMENTS en fila ${i}`);
                break;
            }

            // Procesar fila de embellishment
            if (inEmbellishmentsSection && techniqueCol >= 0) {
                const technique = String(row[techniqueCol] || '').trim();
                const description = descriptionCol >= 0 ? String(row[descriptionCol] || '').trim() : '';

                if (technique && 
                    technique.toUpperCase() !== 'AREA' && 
                    technique.toUpperCase() !== 'TECHNIQUE' &&
                    technique.length > 1) {
                    const placement = parsePlacementRow(technique, description, customer);
                    if (placement) {
                        placements.push(placement);
                        console.log(`   ✓ Placement detectado: ${technique} - ${description.substring(0, 50)}${description.length > 50 ? '...' : ''}`);
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
        if (!technique || technique.toLowerCase() === 'area') return null;
        
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
            console.log(`   ⏭️ Ignorando técnica: ${technique} - ${description.substring(0, 30)}`);
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

        // Si sigue sin ubicaciones, no crear placement
        if (locations.length === 0) {
            console.log(`   ⚠️ No se pudo determinar ubicación para: ${description.substring(0, 40)}`);
            return null;
        }

        // Detectar si es un placement pareado (izquierda/derecha)
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
     * Determina el tipo de tinta basado en la descripción y el cliente
     */
    function determineInkType(technique, description, customer) {
        // 1. Prioridad: palabras clave en descripción
        for (const [keyword, ink] of Object.entries(CONFIG.INK_KEYWORDS)) {
            if (description.includes(keyword)) {
                console.log(`   🎨 Tinta por keyword "${keyword}": ${ink}`);
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
                console.log(`   🎨 Tinta por cliente "${client}": ${defaultInk}`);
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
     * Infiere ubicaciones cuando no se encuentran explícitamente
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
            console.error('❌ window.placements no está definido como array');
            return 0;
        }

        console.log(`🎯 Creando ${detectedPlacements.length} placements...`);
        
        // Limpiar placements automáticos anteriores
        const manualPlacements = window.placements.filter(p => !p.isAutoGenerated);
        window.placements = manualPlacements;
        
        // Limpiar UI si existe
        const container = document.getElementById('placements-container');
        const tabsContainer = document.getElementById('placements-tabs');
        if (container) container.innerHTML = '';
        if (tabsContainer) tabsContainer.innerHTML = '';
        
        let placementCount = 0;

        detectedPlacements.forEach((detected, index) => {
            // Determinar si debemos expandir este placement en múltiples ubicaciones
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
                    isPaired: false // Ya expandido, ya no es "par"
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
                window.showStatus(`✅ ${placementCount} placements generados automáticamente`, 'success');
            }
            console.log(`✅ ${placementCount} placements creados exitosamente`);
        }

        return placementCount;
    }

    /**
     * Expande ubicaciones según sea necesario
     */
    function expandLocations(locations, isPaired, description) {
        const expanded = [];
        const descUpper = (description || '').toUpperCase();
        
        locations.forEach(location => {
            switch(location) {
                case 'SLEEVE':
                case 'SHOULDER':
                    if (isPaired || 
                        descUpper.includes('BOTH') || 
                        descUpper.includes('LEFT AND RIGHT') ||
                        descUpper.includes('LEFT & RIGHT')) {
                        expanded.push(`LEFT ${location}`);
                        expanded.push(`RIGHT ${location}`);
                    } else if (descUpper.includes('LEFT')) {
                        expanded.push(`LEFT ${location}`);
                    } else if (descUpper.includes('RIGHT')) {
                        expanded.push(`RIGHT ${location}`);
                    } else {
                        // Si no especifica, crear ambos para sleeves/shoulders
                        expanded.push(`LEFT ${location}`);
                        expanded.push(`RIGHT ${location}`);
                    }
                    break;
                    
                case 'FRONT':
                case 'BACK':
                case 'COLLAR':
                case 'CHEST':
                case 'YOKE':
                case 'PANEL':
                case 'NUMBERS':
                case 'TV. NUMBERS':
                case 'NAMEPLATE':
                case 'WORDMARK':
                case 'LOGO':
                case 'SWOOSH':
                case 'STRIPES':
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
        const descUpper = (description || '').toUpperCase();
        
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
     * Genera detalles de ubicación para el campo placementDetails
     */
    function generatePlacementDetails(detected, location) {
        const details = [];
        const descUpper = (detected.description || '').toUpperCase();
        
        // Ubicación física
        if (location.includes('FRONT')) details.push('Center Front');
        if (location.includes('BACK')) details.push('Center Back');
        if (location.includes('LEFT')) details.push('Left Side');
        if (location.includes('RIGHT')) details.push('Right Side');
        if (location.includes('SHOULDER')) details.push('Shoulder');
        if (location.includes('SLEEVE')) details.push('Sleeve');
        if (location.includes('COLLAR')) details.push('Collar');
        if (location.includes('CHEST')) details.push('Chest');
        if (location.includes('YOKE')) details.push('Yoke');
        if (location.includes('PANEL')) details.push('Panel');
        
        // Tipo de elemento
        if (descUpper.includes('NUMBER')) details.push('Player Numbers');
        if (descUpper.includes('NAME')) details.push('Player Name');
        if (descUpper.includes('LOGO')) details.push('Team/Brand Logo');
        if (descUpper.includes('WORDMARK')) details.push('Team Wordmark');
        if (descUpper.includes('SWOOSH')) details.push('Swoosh');
        if (descUpper.includes('STRIPE')) details.push('Stripes');
        
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
        if (desc.includes('PUFF')) specialties.push('PUFF');
        if (detected.inkType === 'SILICONE') specialties.push('SILICONE');
        
        return specialties.join(', ');
    }

    /**
     * Obtiene temperatura según tipo de tinta
     */
    function getTempForInk(inkType) {
        const temps = { 
            'WATER': '320 °F', 
            'PLASTISOL': '320 °F', 
            'SILICONE': '320 °F',
            'DISCHARGE': '320 °F'
        };
        return temps[inkType] || '320 °F';
    }

    /**
     * Obtiene tiempo según tipo de tinta
     */
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
     * Ahora con auto-detección de la mejor hoja
     */
    function processExcelWithAutomation(worksheet, sheetName = '', workbook = null) {
        console.log('🤖 ExcelAutomation v5: Iniciando procesamiento...');
        
        let targetSheet, targetData, targetName;
        
        // Si tenemos el workbook completo, encontrar la mejor hoja automáticamente
        if (workbook && workbook.SheetNames && workbook.SheetNames.length > 0) {
            console.log(`📚 Workbook con ${workbook.SheetNames.length} hojas detectado`);
            const best = findBestSheet(workbook);
            if (best) {
                targetSheet = best.sheet;
                targetData = best.data;
                targetName = best.name;
            } else {
                // Fallback a la hoja proporcionada
                targetSheet = worksheet;
                targetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                targetName = sheetName;
            }
        } else {
            // Solo tenemos una hoja, usarla directamente
            targetSheet = worksheet;
            targetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
            targetName = sheetName;
            console.log(`📄 Modo hoja única: ${sheetName}`);
        }
        
        console.log(`📄 Procesando hoja seleccionada: ${targetName}`);
        
        // Extraer datos básicos
        const extracted = extractBasicData(targetData, targetName);
        
        // Detectar placements
        const placements = detectPlacements(targetData, extracted.customer);
        
        // Crear en UI si hay placements y estamos en contexto de app
        if (placements.length > 0 && typeof window.placements !== 'undefined') {
            autoCreatePlacements(placements);
        } else if (placements.length === 0) {
            console.log('⚠️ No se detectaron placements en esta hoja');
        }
        
        return { 
            ...extracted, 
            autoPlacements: placements,
            sourceSheet: targetName 
        };
    }

    // ============================================
    // API PÚBLICA
    // ============================================

    return {
        processExcelWithAutomation: processExcelWithAutomation,
        autoCreatePlacements: autoCreatePlacements,
        extractBasicData: extractBasicData,
        detectPlacements: detectPlacements,
        findBestSheet: findBestSheet,
        CONFIG: CONFIG
    };

})();

console.log('✅ Excel Automation v5 (Auto-detección SWO/PPS) cargado');
