// excel-automation.js - Automatización inteligente de placements desde Excel
// Integración con app.js existente

window.ExcelAutomation = {
    // Configuración de clientes y sus tintas por defecto
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

    // Palabras clave que indican tipo de tinta específico
    INK_KEYWORDS: {
        'SILICONE': 'SILICONE',
        'SHINY SILICONE': 'SILICONE',
        'PLASTISOL': 'PLASTISOL',
        'WATERBASE': 'WATER',
        'WATER-BASE': 'WATER',
        'WATER BASE': 'WATER',
        'DISCHARGE': 'DISCHARGE',
        'HD': 'HIGH DENSITY',
        'HIGH DENSITY': 'HIGH DENSITY'
    },

    // Parser de ubicaciones desde descripción
    LOCATION_PATTERNS: [
        { regex: /Front/i, placement: 'FRONT' },
        { regex: /Back/i, placement: 'BACK' },
        { regex: /Shoulder/i, placement: 'SHOULDER' },
        { regex: /Sleeve/i, placement: 'SLEEVE' },
        { regex: /Collar/i, placement: 'COLLAR' },
        { regex: /Neck/i, placement: 'NECK' },
        { regex: /Chest/i, placement: 'CHEST' },
        { regex: /Nameplate/i, placement: 'NAMEPLATE' },
        { regex: /Yoke/i, placement: 'YOKE' },
        { regex: /Panel/i, placement: 'PANEL' },
        { regex: /TV\.?\s*NUMBERS?/i, placement: 'TV. NUMBERS' },
        { regex: /Numbers?/i, placement: 'NUMBERS' },
        { regex: /Wordmark/i, placement: 'WORDMARK' },
        { regex: /Logo/i, placement: 'LOGO' },
        { regex: /Swoosh/i, placement: 'SWOOSH' },
        { regex: /Stripes?/i, placement: 'STRIPES' }
    ],

    // Procesar archivo Excel completo con automatización
    processExcelWithAutomation: function(worksheet, sheetName = '') {
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        const extracted = this.extractBasicData(data, sheetName);
        
        // Detectar placements automáticamente
        const placements = this.detectPlacements(data, extracted.customer);
        
        // Si encontramos placements, reemplazar los existentes
        if (placements.length > 0) {
            this.autoCreatePlacements(placements);
        }
        
        return { ...extracted, autoPlacements: placements };
    },

    // Detectar placements desde el área de embellishments
    detectPlacements: function(data, customer = '') {
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
                (rowText.includes('SHIPPING') || rowText.includes('TOTAL UNITS') || rowText.includes('SUPPLIES'))) {
                inEmbellishmentsSection = false;
                break;
            }
            
            // Procesar fila de embellishment
            if (inEmbellishmentsSection && techniqueCol >= 0) {
                const technique = String(row[techniqueCol] || '').trim();
                const description = descriptionCol >= 0 ? String(row[descriptionCol] || '').trim() : '';
                
                if (technique && technique.toUpperCase() !== 'AREA') {
                    const placement = this.parsePlacementRow(technique, description, customer);
                    if (placement) placements.push(placement);
                }
            }
        }
        
        return placements;
    },
    // Parser de datos básicos desde Excel (similar al de app.js)
extractBasicData: function(data, sheetName = '') {
    const extracted = {};

    const isSWOSheet = sheetName.includes('SWO');
    const isPPSSheet = sheetName.includes('PPS');
    const isProtoSheet = sheetName.includes('Proto');

    if (isSWOSheet || isPPSSheet) {
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length < 2) continue;

            const label = String(row[1] || '').trim();
            const val = String(row[2] || '').trim();

            if (label && val) {
                if (label.includes('CUSTOMER:')) {
                    extracted.customer = val;
                }
                else if (label.includes('STYLE:')) {
                    extracted.style = val;
                    if (window.detectTeamFromStyle) {
                        extracted.team = window.detectTeamFromStyle(val);
                    }
                }
                else if (label.includes('COLORWAY')) {
                    extracted.colorway = val;
                }
                else if (label.includes('SEASON:')) extracted.season = val;
                else if (label.includes('PATTERN')) extracted.pattern = val;
                else if (label.includes('P.O.')) extracted.po = val;
                else if (label.includes('SAMPLE TYPE')) extracted.sample = val;
                else if (label.includes('DATE:')) extracted.date = val;
                else if (label.includes('REQUESTED BY:')) extracted.requestedBy = val;
                else if (label.includes('TEAM:')) extracted.team = val;
                else if (label.includes('GENDER:')) extracted.gender = val;
            }
        }
    } else {
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
                        extracted.team = window.detectTeamFromStyle(extracted.style);
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
                }
            }
        }
    }

    return extracted;
},

    // Parsear una fila de embellishment
    parsePlacementRow: function(technique, description, customer) {
        if (!technique || technique.toLowerCase() === 'area') return null;
        
        const techUpper = technique.toUpperCase();
        const descUpper = (description || '').toUpperCase();
        
        // Determinar tipo de tinta
        let inkType = this.determineInkType(techUpper, descUpper, customer);
        
        // Extraer ubicaciones desde la descripción
        const locations = this.extractLocations(description);
        
        // Si no hay ubicaciones, inferir desde contexto
        if (locations.length === 0) {
            if (descUpper.includes('NUMBER')) locations.push('NUMBERS');
            if (descUpper.includes('NAME')) locations.push('NAMEPLATE');
            if (descUpper.includes('LOGO')) locations.push('LOGO');
        }
        
        return {
            technique: technique,
            description: description,
            inkType: inkType,
            locations: locations.length > 0 ? locations : ['FRONT'],
            fullText: `${technique} - ${description}`,
            isTeamLogo: descUpper.includes('TEAM LOGO'),
            isNumbers: descUpper.includes('NUMBER'),
            isWordmark: descUpper.includes('WORDMARK'),
            isSwoosh: descUpper.includes('SWOOSH')
        };
    },

    // Determinar tipo de tinta
    determineInkType: function(technique, description, customer) {
        // 1. Prioridad: palabras clave en descripción
        for (const [keyword, ink] of Object.entries(this.INK_KEYWORDS)) {
            if (description.includes(keyword)) return ink;
        }
        
        // 2. Técnica específica
        if (technique.includes('SUBLIMATION')) return 'SUBLIMATION';
        if (technique.includes('HEAT TRANSFER')) return 'HEAT';
        if (technique.includes('EMBROIDERY')) return 'EMBROIDERY';
        if (technique.includes('TWILL')) return 'TWILL';
        
        // 3. Default por cliente
        const customerUpper = (customer || '').toUpperCase();
        for (const [client, defaultInk] of Object.entries(this.CLIENT_INK_DEFAULTS)) {
            if (customerUpper.includes(client)) return defaultInk;
        }
        
        return 'WATER';
    },

    // Extraer ubicaciones desde descripción
    extractLocations: function(description) {
        const locations = [];
        if (!description) return locations;
        
        const descUpper = description.toUpperCase();
        
        for (const pattern of this.LOCATION_PATTERNS) {
            if (pattern.regex.test(descUpper)) {
                if (!locations.includes(pattern.placement)) {
                    locations.push(pattern.placement);
                }
            }
        }
        
        return locations;
    },

    // Crear placements automáticamente
    autoCreatePlacements: function(detectedPlacements) {
        if (!Array.isArray(detectedPlacements) || detectedPlacements.length === 0) return;
        
        // Limpiar placements existentes
        if (typeof placements !== 'undefined') {
            placements = [];
            const container = document.getElementById('placements-container');
            const tabsContainer = document.getElementById('placements-tabs');
            if (container) container.innerHTML = '';
            if (tabsContainer) tabsContainer.innerHTML = '';
        }
        
        // Crear cada placement
        let placementCount = 0;
        detectedPlacements.forEach((detected, index) => {
            detected.locations.forEach((location, locIndex) => {
                const placementId = Date.now() + index * 100 + locIndex;
                
                let placementType = location;
                if (location === 'NUMBERS' && detected.isNumbers) {
                    placementType = detected.description.includes('TV') ? 'TV. NUMBERS' : 'NUMBERS';
                }
                
                const newPlacement = {
                    id: placementId,
                    type: placementType,
                    name: `${placementType} ${index + 1}`,
                    imageData: null,
                    colors: [],
                    placementDetails: this.generatePlacementDetails(detected, location),
                    dimensions: 'SIZE: (W) ## X (H) ##',
                    temp: this.getTempForInk(detected.inkType),
                    time: this.getTimeForInk(detected.inkType),
                    specialties: this.detectSpecialties(detected),
                    specialInstructions: detected.description,
                    inkType: detected.inkType,
                    technique: detected.technique,
                    isAutoGenerated: true
                };
                
                if (typeof placements !== 'undefined') {
                    placements.push(newPlacement);
                    
                    if (typeof renderPlacementHTML === 'function') {
                        renderPlacementHTML(newPlacement);
                    }
                    placementCount++;
                }
            });
        });
        
        if (typeof updatePlacementsTabs === 'function') {
            updatePlacementsTabs();
        }
        
        if (placementCount > 0 && typeof showStatus === 'function') {
            showStatus(`✅ ${placementCount} placements generados automáticamente`, 'success');
        }
        
        return placementCount;
    },

    // Generar detalles de ubicación
    generatePlacementDetails: function(detected, location) {
        const details = [];
        
        if (location === 'FRONT') details.push('Center Front');
        if (location === 'BACK') details.push('Center Back');
        if (location === 'SHOULDER') details.push('Left/Right Shoulder');
        if (location === 'SLEEVE') details.push('Left/Right Sleeve');
        
        if (detected.isNumbers) details.push('Player Numbers');
        if (detected.isTeamLogo) details.push('Team Logo');
        if (detected.isWordmark) details.push('Team Wordmark');
        if (detected.isSwoosh) details.push('Brand Logo');
        
        return details.join(' • ') || '#.#" FROM COLLAR SEAM';
    },

    // Detectar specialties
    detectSpecialties: function(detected) {
        const specialties = [];
        const desc = (detected.description || '').toUpperCase();
        
        if (desc.includes('HD') || desc.includes('HIGH DENSITY')) specialties.push('HIGH DENSITY');
        if (desc.includes('METALLIC') || desc.includes('GOLD') || desc.includes('SILVER')) specialties.push('METALLIC');
        if (desc.includes('FOIL')) specialties.push('FOIL');
        if (detected.inkType === 'SILICONE') specialties.push('SILICONE');
        
        return specialties.join(', ');
    },

    getTempForInk: function(inkType) {
        const temps = { 'WATER': '320 °F', 'PLASTISOL': '320 °F', 'SILICONE': '320 °F' };
        return temps[inkType] || '320 °F';
    },

    getTimeForInk: function(inkType) {
        const times = { 'WATER': '1:40 min', 'PLASTISOL': '1:00 min', 'SILICONE': '1:40 min' };
        return times[inkType] || '1:40 min';
    }
};

// Integración automática
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (typeof processExcelData === 'function') {
            const originalProcessExcelData = processExcelData;
            
            window.processExcelData = function(worksheet, sheetName) {
                originalProcessExcelData(worksheet, sheetName);
                
                setTimeout(() => {
                    try {
                        const result = window.ExcelAutomation.processExcelWithAutomation(worksheet, sheetName);
                        console.log('✅ Automatización completada:', result);
                    } catch (error) {
                        console.error('❌ Error:', error);
                    }
                }, 200);
            };
            
            console.log('✅ Excel Automation integrado');
        }
    }, 1000);
});
