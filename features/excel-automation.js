// excel-automation.js - Automatización inteligente de placements desde Excel
// VERSIÓN CORREGIDA - Compatibilidad SWO y PPS

window.ExcelAutomation = (function() {
    'use strict';

    const CONFIG = {
        CLIENT_INK_DEFAULTS: {
            'FANATICS': 'WATER',
            'FANATIC': 'WATER',
            'GEAR FOR SPORT': 'PLASTISOL',
            'GEARFORSPORT': 'PLASTISOL',
            'GFS': 'PLASTISOL',
            'NIKE': 'WATER',
            'ADIDAS': 'PLASTISOL',
            'UNDER ARMOUR': 'WATER',
            'UA': 'WATER'
        },
        
        INK_KEYWORDS: {
            'SILICONE': 'SILICONE',
            'SHINY SILICONE': 'SILICONE',
            'PLASTISOL': 'PLASTISOL',
            'WATERBASE': 'WATER',
            'WATER-BASE': 'WATER',
            'WATER BASE': 'WATER'
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
            { regex: /tv\.?\s*numbers?/i, location: 'TV. NUMBERS' },
            { regex: /numbers?/i, location: 'NUMBERS' },
            { regex: /wordmark/i, location: 'WORDMARK' },
            { regex: /logo/i, location: 'LOGO' },
            { regex: /swoosh/i, location: 'SWOOSH' },
            { regex: /stripes?/i, location: 'STRIPES' }
        ],
        
        TECHNIQUES_TO_PROCESS: ['SCREENPRINT', 'SCREEN PRINT', 'SCREEN', 'SILICONE', 'WATERBASE', 'PLASTISOL'],
        TECHNIQUES_TO_IGNORE: ['EMBROIDERY', 'EMB', 'SUBLIMATION', 'SUB', 'HEAT TRANSFER', 'HT', 'DTF'],
        FORCE_PROCESS_KEYWORDS: ['SILICONE', 'SHINY SILICONE', 'WATERBASE', 'PLASTISOL']
    };

    /**
     * EXTRACT BASIC DATA - VERSIÓN UNIFICADA SWO/PPS
     */
    function extractBasicData(data, sheetName = '') {
        const extracted = {};
        const sheetUpper = (sheetName || '').toUpperCase();
        
        // Detectar tipo de formato
        const isSWO = sheetUpper.includes('SWO');
        const isPPS = sheetUpper.includes('PPS');
        const isStructuredFormat = isSWO || isPPS;
        
        console.log(`📄 Procesando hoja: ${sheetName} (Formato: ${isStructuredFormat ? 'SWO/PPS' : 'Genérico'})`);

        if (isStructuredFormat) {
            // Formato SWO/PPS: Labels en col A o B, valores en col siguiente
            for (let i = 0; i < Math.min(data.length, 30); i++) {
                const row = data[i];
                if (!row || row.length < 2) continue;

                // Buscar en columnas A (0) y B (1) por labels
                for (let col = 0; col < 2; col++) {
                    const label = String(row[col] || '').trim().toUpperCase();
                    const value = String(row[col + 1] || '').trim();

                    if (!label) continue;

                    if (label.includes('CUSTOMER') && !label.includes('IM#')) {
                        extracted.customer = value;
                    } else if (label.includes('STYLE') && !label.includes('TYPE')) {
                        extracted.style = value.replace(/<br>/gi, ' ').trim();
                    } else if (label.includes('COLORWAY')) {
                        extracted.colorway = value;
                    } else if (label.includes('SEASON')) {
                        extracted.season = value;
                    } else if (label.includes('P.O.') || label.includes('PO #')) {
                        extracted.po = value;
                    } else if (label.includes('SAMPLE TYPE') || label === 'SAMPLE:') {
                        extracted.sample = value;
                    } else if (label.includes('PATTERN')) {
                        extracted.pattern = value;
                    } else if (label.includes('TEAM')) {
                        extracted.team = value;
                    } else if (label.includes('GENDER')) {
                        extracted.gender = value;
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
                    
                    if (cell.includes('CUSTOMER:')) {
                        extracted.customer = String(row[j + 1] || '').trim();
                    } else if (cell.includes('STYLE:')) {
                        extracted.style = String(row[j + 1] || '').trim();
                    } else if (cell.includes('COLORWAY')) {
                        extracted.colorway = String(row[j + 1] || '').trim();
                    } else if (cell.includes('SEASON:')) {
                        extracted.season = String(row[j + 1] || '').trim();
                    } else if (cell.includes('P.O.')) {
                        extracted.po = String(row[j + 1] || '').trim();
                    } else if (cell.includes('SAMPLE TYPE')) {
                        extracted.sample = String(row[j + 1] || '').trim();
                    }
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

        // Detectar equipo si no está definido
        if (!extracted.team && window.detectTeamFromStyle) {
            extracted.team = window.detectTeamFromStyle(extracted.style, extracted.colorway, extracted.customer);
        }

        console.log('✅ Datos extraídos:', extracted);
        return extracted;
    }

    /**
     * DETECTAR PLACEMENTS EN SECCIÓN EMBELLISHMENTS
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

            const rowText = row.map(c => String(c || '').toUpperCase()).join(' ');

            // Detectar inicio de sección EMBELLISHMENTS
            if (rowText.includes('EMBELLISHMENTS') && !rowText.includes('END')) {
                inEmbellishmentsSection = true;
                headerRow = i;
                console.log(`🎯 Sección EMBELLISHMENTS encontrada en fila ${i}`);
                
                // Encontrar índices de columnas en la siguiente fila (header)
                const nextRow = data[i + 1] || [];
                nextRow.forEach((cell, idx) => {
                    const cellUpper = String(cell || '').toUpperCase();
                    if (cellUpper.includes('AREA') || cellUpper.includes('TECHNIQUE') || cellUpper.includes('PROCESS')) {
                        techniqueCol = idx;
                        console.log(`   📍 Columna técnica: ${idx} (${cell})`);
                    }
                    if (cellUpper.includes('APPLICATION') || cellUpper.includes('DESCRIPTION')) {
                        descriptionCol = idx;
                        console.log(`   📍 Columna descripción: ${idx} (${cell})`);
                    }
                });
                
                // Si no encontramos headers, asumir columnas 0 y 1
                if (techniqueCol === -1) techniqueCol = 0;
                if (descriptionCol === -1) descriptionCol = 1;
                
                i++; // Saltar la fila de headers
                continue;
            }

            // Detectar fin de sección
            if (inEmbellishmentsSection && 
                (rowText.includes('SHIPPING') || rowText.includes('TOTAL UNITS') || 
                 rowText.includes('SUPPLIES') || rowText.includes('FABRICS'))) {
                inEmbellishmentsSection = false;
                console.log(`🏁 Fin de sección EMBELLISHMENTS en fila ${i}`);
                break;
            }

            // Procesar fila de embellishment
            if (inEmbellishmentsSection && techniqueCol >= 0) {
                const technique = String(row[techniqueCol] || '').trim();
                const description = descriptionCol >= 0 ? String(row[descriptionCol] || '').trim() : '';

                if (technique && technique.toUpperCase() !== 'AREA' && technique.length > 1) {
                    const placement = parsePlacementRow(technique, description, customer);
                    if (placement) {
                        placements.push(placement);
                        console.log(`   ✓ Placement detectado: ${technique} - ${description.substring(0, 50)}`);
                    }
                }
            }
        }

        console.log(`📦 Total placements detectados: ${placements.length}`);
        return placements;
    }

    /**
     * PARSEAR UNA FILA INDIVIDUAL
     */
    function parsePlacementRow(technique, description, customer) {
        const techUpper = technique.toUpperCase().trim();
        const descUpper = (description || '').toUpperCase();

        // Verificar si debemos procesar esta técnica
        const hasForceKeyword = CONFIG.FORCE_PROCESS_KEYWORDS.some(kw => descUpper.includes(kw));
        const isIgnored = CONFIG.TECHNIQUES_TO_IGNORE.some(ign => techUpper.includes(ign));
        const isProcessable = CONFIG.TECHNIQUES_TO_PROCESS.some(proc => techUpper.includes(proc));

        if (!hasForceKeyword && isIgnored) {
            console.log(`   ⏭️ Ignorado (técnica excluida): ${technique}`);
            return null;
        }

        if (!hasForceKeyword && !isProcessable) {
            console.log(`   ⏭️ Ignorado (técnica no soportada): ${technique}`);
            return null;
        }

        // Determinar tinta
        const inkType = determineInkType(techUpper, descUpper, customer);

        // Extraer ubicaciones
        let locations = extractLocations(description);
        
        // Inferir ubicaciones si no se encontraron explícitamente
        if (locations.length === 0) {
            locations = inferLocationsFromDescription(descUpper);
        }

        if (locations.length === 0) {
            console.log(`   ⚠️ Sin ubicación clara: ${description}`);
            return null;
        }

        // Detectar si es par (izq/der)
        const isPaired = /left and right|both (sleeves|shoulders)|left & right/i.test(description);

        return {
            technique: technique,
            description: description,
            inkType: inkType,
            locations: locations,
            isPaired: isPaired,
            fullText: `${technique} - ${description}`
        };
    }

    function determineInkType(technique, description, customer) {
        for (const [keyword, ink] of Object.entries(CONFIG.INK_KEYWORDS)) {
            if (description.includes(keyword)) return ink;
        }
        
        if (technique.includes('SILICONE')) return 'SILICONE';
        if (technique.includes('PLASTISOL')) return 'PLASTISOL';
        if (technique.includes('WATER')) return 'WATER';

        const customerUpper = (customer || '').toUpperCase();
        for (const [client, defaultInk] of Object.entries(CONFIG.CLIENT_INK_DEFAULTS)) {
            if (customerUpper.includes(client)) return defaultInk;
        }

        return 'WATER';
    }

    function extractLocations(description) {
        const locations = [];
        if (!description) return locations;
        
        const descUpper = description.toUpperCase();
        
        CONFIG.LOCATION_PATTERNS.forEach(pattern => {
            if (pattern.regex.test(descUpper)) {
                const mapped = pattern.location;
                if (!locations.includes(mapped)) {
                    locations.push(mapped);
                }
            }
        });

        return locations;
    }

    function inferLocationsFromDescription(descUpper) {
        const locations = [];
        
        if (descUpper.includes('NUMBER')) locations.push(descUpper.includes('TV') ? 'TV. NUMBERS' : 'NUMBERS');
        if (descUpper.includes('NAME')) locations.push('NAMEPLATE');
        if (descUpper.includes('LOGO')) locations.push('LOGO');
        if (descUpper.includes('WORDMARK')) locations.push('WORDMARK');
        if (descUpper.includes('SWOOSH')) locations.push('SWOOSH');
        if (descUpper.includes('STRIPE')) locations.push('STRIPES');

        return locations;
    }

    /**
     * CREAR PLACEMENTS EN LA UI
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
        
        // Limpiar placements existentes si son automáticos
        window.placements = window.placements.filter(p => !p.isAutoGenerated);
        
        let placementCount = 0;

        detectedPlacements.forEach((detected, idx) => {
            const locationsToCreate = expandLocations(detected.locations, detected.isPaired, detected.description);
            
            locationsToCreate.forEach((location, locIdx) => {
                const placementType = mapLocationToType(location, detected.description);
                
                const newPlacement = {
                    id: Date.now() + idx * 100 + locIdx,
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
                window.showStatus(`✅ ${placementCount} placements generados automáticamente`, 'success');
            }
        }

        return placementCount;
    }

    function expandLocations(locations, isPaired, description) {
        const expanded = [];
        const descUpper = (description || '').toUpperCase();
        
        locations.forEach(location => {
            if ((location === 'SLEEVE' || location === 'SHOULDER') && 
                (isPaired || descUpper.includes('BOTH') || descUpper.includes('LEFT AND RIGHT'))) {
                expanded.push(`LEFT ${location}`);
                expanded.push(`RIGHT ${location}`);
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
            'NAMEPLATE': 'BACK',
            'NUMBERS': 'TV. NUMBERS',
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
        
        if (descUpper.includes('NUMBER')) details.push('Player Numbers');
        if (descUpper.includes('NAME')) details.push('Player Name');
        if (descUpper.includes('LOGO')) details.push('Team/Brand Logo');
        if (descUpper.includes('WORDMARK')) details.push('Team Wordmark');
        if (descUpper.includes('SWOOSH')) details.push('Swoosh');
        
        return details.join(' • ') || '#.#" FROM COLLAR SEAM';
    }

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

    /**
     * FUNCIÓN PRINCIPAL
     */
    function processExcelWithAutomation(worksheet, sheetName = '') {
        console.log('🤖 ExcelAutomation: Procesando hoja', sheetName);
        
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        const extracted = extractBasicData(data, sheetName);
        const placements = detectPlacements(data, extracted.customer);
        
        // Solo crear placements si estamos en el contexto de la app
        if (typeof window.placements !== 'undefined') {
            autoCreatePlacements(placements);
        }
        
        return { ...extracted, autoPlacements: placements };
    }

    // API Pública
    return {
        processExcelWithAutomation: processExcelWithAutomation,
        autoCreatePlacements: autoCreatePlacements,
        extractBasicData: extractBasicData,
        detectPlacements: detectPlacements,
        CONFIG: CONFIG
    };

})();

console.log('✅ Excel Automation (v4 - SWO/PPS compatible) cargado');
