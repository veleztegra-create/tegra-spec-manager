// js/modules/placements/placements-export.js
console.log('🔄 Cargando módulo PlacementsExport...');

const PlacementsExport = (function() {
    // ========== CONFIGURACIÓN ==========
    const CONFIG = {
        defaultInkPreset: {
            WATER: { name: "Agua base", min: 0.5, max: 1.0, default: 0.75 },
            ALCOHOL: { name: "Alcohol base", min: 0.3, max: 0.8, default: 0.5 },
            SOLVENT: { name: "Solvente base", min: 0.4, max: 0.9, default: 0.65 },
            UV: { name: "UV base", min: 0.6, max: 1.2, default: 0.85 }
        },
        stationTypes: ['P1', 'P2', 'P3', 'P4', 'P5', 'C1', 'C2', 'C3', 'C4'],
        maxStations: 15
    };
    
    // ========== FUNCIONES PRIVADAS ==========
    function calculateInkCoverage(inkType, area, presetOverride = null) {
        console.log('📊 Calculando cobertura de tinta...');
        try {
            const preset = presetOverride || 
                (window.Utils ? window.Utils.getInkPreset(inkType) : CONFIG.defaultInkPreset[inkType] || CONFIG.defaultInkPreset.WATER);
            
            const coverage = area * (preset.default || 0.75);
            console.log(`✅ Cobertura calculada: ${coverage.toFixed(2)} para ${inkType}`);
            return coverage;
        } catch (error) {
            console.error('❌ Error en calculateInkCoverage:', error);
            return area * 0.75; // Valor por defecto
        }
    }
    
    function extractDimensions(dimensionsText) {
        console.log('📏 Extrayendo dimensiones...');
        try {
            if (!dimensionsText) return { width: '15.34', height: '12' };
            
            const patterns = [
                /SIZE:\s*\(W\)\s*([\d\.]+)\s*["']?\s*X\s*\(H\)\s*([\d\.]+)/i,
                /([\d\.]+)\s*["']?\s*[xX×]\s*([\d\.]+)/,
                /W\s*:\s*([\d\.]+).*H\s*:\s*([\d\.]+)/i,
                /ANCHO\s*:\s*([\d\.]+).*ALTO\s*:\s*([\d\.]+)/i,
                /(\d+)\s*["']?\s*[xX]\s*(\d+)/
            ];
            
            for (const pattern of patterns) {
                const match = dimensionsText.match(pattern);
                if (match) {
                    console.log(`✅ Dimensiones extraídas: ${match[1]} x ${match[2]}`);
                    return {
                        width: match[1],
                        height: match[2]
                    };
                }
            }
            
            console.warn('⚠️ No se encontraron dimensiones, usando valores por defecto');
            return { width: '15.34', height: '12' };
        } catch (error) {
            console.error('❌ Error en extractDimensions:', error);
            return { width: '15.34', height: '12' };
        }
    }
    
    // ========== FUNCIONES PÚBLICAS ==========
    function updatePlacementStations(placementId, returnOnly = false) {
        console.log(`🔄 Actualizando estaciones para placement ${placementId}`);
        try {
            // Usar PlacementsCore si está disponible
            const placements = window.PlacementsCore ? 
                window.PlacementsCore.getAllPlacements() : 
                window.globalPlacements || [];
            
            const placement = placements.find(p => p.id === parseInt(placementId));
            
            if (!placement) {
                console.warn(`⚠️ Placement ${placementId} no encontrado`);
                return returnOnly ? [] : null;
            }
            
            // Obtener configuración de tinta
            const preset = window.Utils ? 
                window.Utils.getInkPreset(placement.inkType || 'WATER') : {
                    temp: '320 °F', 
                    time: '1:40 min',
                    blocker: { 
                        name: 'BLOCKER CHT', 
                        mesh1: '122/55', 
                        mesh2: '157/48', 
                        durometer: '70', 
                        speed: '35', 
                        angle: '15', 
                        strokes: '2', 
                        pressure: '40', 
                        additives: 'N/A' 
                    },
                    white: { 
                        name: 'AQUAFLEX WHITE', 
                        mesh1: '198/40', 
                        mesh2: '157/48', 
                        durometer: '70', 
                        speed: '35', 
                        angle: '15', 
                        strokes: '2', 
                        pressure: '40', 
                        additives: 'N/A' 
                    },
                    color: { 
                        mesh: '157/48', 
                        durometer: '70', 
                        speed: '35', 
                        angle: '15', 
                        strokes: '2', 
                        pressure: '40', 
                        additives: '3 % cross-linker 500 · 1.5 % antitack' 
                    }
                };
            
            const stationsData = [];
            let stNum = 1;
            
            // Usar valores personalizados si existen
            const meshColor = placement.meshColor || preset.color.mesh;
            const meshWhite = placement.meshWhite || preset.white.mesh1;
            const meshBlocker = placement.meshBlocker || preset.blocker.mesh1;
            const durometer = placement.durometer || preset.color.durometer;
            const strokes = placement.strokes || preset.color.strokes;
            const angle = placement.angle || preset.color.angle;
            const pressure = placement.pressure || preset.color.pressure;
            const speed = placement.speed || preset.color.speed;
            const additives = placement.additives || preset.color.additives;
            
            if (placement.colors && Array.isArray(placement.colors)) {
                placement.colors.forEach((item, idx) => {
                    let mesh, strokesVal, duro, ang, press, spd, add, screenLetter, screenTypeLabel;
                    
                    screenLetter = item.screenLetter || 'N/A';
                    
                    if (item.type === 'BLOCKER') {
                        screenTypeLabel = preset.blocker.name;
                        mesh = stNum <= 3 ? meshBlocker : (placement.meshBlocker || preset.blocker.mesh2);
                        strokesVal = strokes;
                        duro = durometer;
                        ang = angle;
                        press = pressure;
                        spd = speed;
                        add = placement.additives || preset.blocker.additives;
                    } else if (item.type === 'WHITE_BASE') {
                        screenTypeLabel = preset.white.name;
                        mesh = stNum <= 9 ? meshWhite : (placement.meshWhite || preset.white.mesh2);
                        strokesVal = strokes;
                        duro = durometer;
                        ang = angle;
                        press = pressure;
                        spd = speed;
                        add = placement.additives || preset.white.additives;
                    } else if (item.type === 'METALLIC') {
                        screenTypeLabel = item.val || '---';
                        mesh = '110/64';
                        strokesVal = '1';
                        duro = '70';
                        ang = '15';
                        press = '40';
                        spd = '35';
                        add = 'Catalizador especial para metálicos';
                    } else {
                        screenTypeLabel = item.val || '---';
                        mesh = meshColor;
                        strokesVal = strokes;
                        duro = durometer;
                        ang = angle;
                        press = pressure;
                        spd = speed;
                        add = additives;
                    }
                    
                    const screenCombined = (item.type === 'BLOCKER' || item.type === 'WHITE_BASE' || item.type === 'METALLIC') 
                                 ? screenTypeLabel
                                 : item.val || '---';
                    
                    stationsData.push({ 
                        st: stNum++, 
                        screenLetter: screenLetter,
                        screenCombined: screenCombined,
                        mesh: mesh, 
                        ink: item.val || '---',
                        strokes: strokesVal, 
                        duro: duro,
                        angle: ang,
                        pressure: press,
                        speed: spd,
                        add: add 
                    });
                    
                    if (idx < placement.colors.length - 1) {
                        stationsData.push({ 
                            st: stNum++, 
                            screenLetter: '', 
                            screenCombined: 'FLASH', 
                            mesh: '-', 
                            ink: '-', 
                            strokes: '-', 
                            duro: '-',
                            angle: '-',
                            pressure: '-',
                            speed: '-',
                            add: '' 
                        });
                        
                        stationsData.push({ 
                            st: stNum++, 
                            screenLetter: '', 
                            screenCombined: 'COOL', 
                            mesh: '-', 
                            ink: '-', 
                            strokes: '-', 
                            duro: '-',
                            angle: '-',
                            pressure: '-',
                            speed: '-',
                            add: '' 
                        });
                    }
                });
            }
            
            if (returnOnly) {
                console.log(`✅ Estaciones generadas (returnOnly): ${stationsData.length}`);
                return stationsData;
            }
            
            // Si no es returnOnly, renderizar la tabla
            renderPlacementStationsTable(placementId, stationsData);
            console.log(`✅ Estaciones actualizadas para placement ${placementId}`);
            return stationsData;
            
        } catch (error) {
            console.error(`❌ Error en updatePlacementStations:`, error);
            return returnOnly ? [] : null;
        }
    }
    
    function renderPlacementStationsTable(placementId, data) {
        console.log(`🔄 Renderizando tabla de estaciones para placement ${placementId}`);
        try {
            const div = document.getElementById(`placement-sequence-table-${placementId}`);
            if (!div) {
                console.warn(`⚠️ Contenedor no encontrado: placement-sequence-table-${placementId}`);
                return;
            }
            
            if (!data || data.length === 0) {
                div.innerHTML = `
                    <p style="color:var(--text-secondary); font-style:italic; text-align:center; padding:15px; background:var(--gray-dark); border-radius:var(--radius);">
                        Agrega colores para generar la secuencia de impresión.
                    </p>
                `;
                return;
            }
            
            let html = `<table class="sequence-table">
                <thead><tr>
                    <th>Est</th>
                    <th>Screen Letter</th>
                    <th>Screen (Tinta/Proceso)</th>
                    <th>Aditivos</th>
                    <th>Malla</th>
                    <th>Strokes</th>
                    <th>Angle</th>
                    <th>Pressure</th>
                    <th>Speed</th>
                    <th>Duro</th>
                </tr></thead><tbody>`;
            
            data.forEach((row, idx) => {
                const isMetallic = row.screenCombined && (
                    row.screenCombined.includes('METALLIC') || 
                    row.screenCombined.includes('GOLD') || 
                    row.screenCombined.includes('SILVER') ||
                    row.screenCombined.match(/(8[7-9][0-9])\s*C?/i)
                );
                
                html += `<tr ${isMetallic ? 'style="background: linear-gradient(90deg, rgba(255,215,0,0.1) 0%, var(--bg-card) 100%);"' : ''}>
                    <td><strong>${row.st}</strong></td>
                    <td><b style="color: var(--primary);">${row.screenLetter}</b></td>
                    <td>${row.screenCombined}</td>
                    <td style="font-size:11px; color:var(--primary); font-weight:600;">${row.add}</td>
                    <td>${row.mesh}</td>
                    <td>${row.strokes}</td>
                    <td>${row.angle}</td>
                    <td>${row.pressure}</td>
                    <td>${row.speed}</td>
                    <td>${row.duro}</td>
                </tr>`;
            });
            html += '</tbody></table>';
            div.innerHTML = html;
            
            console.log(`✅ Tabla de estaciones renderizada con ${data.length} filas`);
        } catch (error) {
            console.error(`❌ Error en renderPlacementStationsTable:`, error);
        }
    }
    
    // ========== EXPORTACIÓN PÚBLICA ==========
    return {
        updatePlacementStations,
        renderPlacementStationsTable,
        extractDimensions,
        calculateInkCoverage
    };
})();

// ========== EXPORTACIÓN GLOBAL ==========
window.PlacementsExport = PlacementsExport;
window.updatePlacementStations = PlacementsExport.updatePlacementStations; // Para compatibilidad
window.renderPlacementStationsTable = PlacementsExport.renderPlacementStationsTable; // Para compatibilidad

console.log('✅ Módulo PlacementsExport completamente cargado');
