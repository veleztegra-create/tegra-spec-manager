// js/modules/placements/placements-colors.js
// Módulo de gestión de colores dentro de placements

console.log('🎨 Módulo placements-colors.js cargado');

const PlacementsColors = (function() {
    
    // ========== FUNCIONES PRINCIPALES DE COLORES ==========
    
    /**
     * Agrega un nuevo color a un placement
     * @param {number} placementId - ID del placement
     * @param {string} type - Tipo de color (BLOCKER, WHITE_BASE, COLOR, METALLIC)
     * @returns {Object} El nuevo color agregado
     */
    function addPlacementColorItem(placementId, type) {
        console.log(`➕ Agregando color tipo "${type}" al placement ${placementId}`);
        
        const placement = window.PlacementsCore ? 
            window.PlacementsCore.getPlacementById(placementId) : null;
        
        if (!placement) {
            console.error(`❌ Placement ${placementId} no encontrado`);
            return null;
        }
        
        let initialLetter = '';
        let initialVal = '';
        
        // Configurar valores iniciales según el tipo
        if (type === 'BLOCKER') {
            initialLetter = 'A';
            initialVal = 'BLOCKER CHT';
        } else if (type === 'WHITE_BASE') {
            initialLetter = 'B';
            initialVal = 'AQUAFLEX WHITE';
        } else if (type === 'METALLIC') {
            const colorItems = placement.colors.filter(c => c.type === 'COLOR' || c.type === 'METALLIC');
            initialLetter = String(colorItems.length + 1);
            initialVal = 'METALLIC GOLD';
        } else {
            const colorItems = placement.colors.filter(c => c.type === 'COLOR' || c.type === 'METALLIC');
            initialLetter = String(colorItems.length + 1);
        }
        
        const colorId = Date.now() + Math.random();
        const newColor = {
            id: colorId,
            type: type,
            screenLetter: initialLetter,
            val: initialVal
        };
        
        placement.colors.push(newColor);
        
        // Actualizar UI si está disponible
        if (window.PlacementsUI) {
            renderPlacementColors(placementId);
            updatePlacementStations(placementId);
            updatePlacementColorsPreview(placementId);
        }
        
        // Verificar especialidades
        checkForSpecialtiesInColors(placementId);
        
        console.log(`✅ Color "${initialVal}" agregado al placement ${placementId}`);
        return newColor;
    }
    
    /**
     * Renderiza los colores de un placement
     * @param {number} placementId - ID del placement
     */
    function renderPlacementColors(placementId) {
        console.log(`🎨 Renderizando colores del placement ${placementId}`);
        
        const placement = window.PlacementsCore ? 
            window.PlacementsCore.getPlacementById(placementId) : null;
        
        if (!placement) return;
        
        const container = document.getElementById(`placement-colors-container-${placementId}`);
        if (!container) {
            console.error(`❌ Contenedor de colores para placement ${placementId} no encontrado`);
            return;
        }
        
        if (placement.colors.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                    <i class="fas fa-palette" style="font-size: 1.5rem; margin-bottom: 10px; display: block;"></i>
                    <p>No hay colores agregados para este placement.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        placement.colors.forEach(color => {
            let badgeClass = 'badge-color';
            let label = 'COLOR';
            
            if (color.type === 'BLOCKER') {
                badgeClass = 'badge-blocker';
                label = 'BLOQUEADOR';
            } else if (color.type === 'WHITE_BASE') {
                badgeClass = 'badge-white';
                label = 'WHITE BASE';
            } else if (color.type === 'METALLIC') {
                badgeClass = 'badge-warning';
                label = 'METÁLICO';
            }
            
            const div = document.createElement('div');
            div.className = 'color-item';
            div.innerHTML = `
                <span class="badge ${badgeClass}">${label}</span>
                <input type="text" 
                       style="width: 60px; text-align: center; font-weight: bold;" 
                       value="${color.screenLetter}" 
                       class="form-control placement-screen-letter"
                       data-color-id="${color.id}"
                       data-placement-id="${placementId}"
                       oninput="window.PlacementsColors.updatePlacementScreenLetter(${placementId}, ${color.id}, this.value)"
                       title="Letra/Número de Pantalla">
                <input type="text" 
                       class="form-control placement-ink-input"
                       data-color-id="${color.id}"
                       data-placement-id="${placementId}"
                       placeholder="Nombre de la tinta..." 
                       value="${color.val}"
                       oninput="window.PlacementsColors.updatePlacementColorValue(${placementId}, ${color.id}, this.value)">
                <div class="color-preview" 
                     id="placement-color-preview-${placementId}-${color.id}" 
                     title="Vista previa del color"></div>
                <button class="btn btn-danger btn-sm" onclick="window.PlacementsColors.removePlacementColorItem(${placementId}, ${color.id})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(div);
            
            // Actualizar vista previa del color
            setTimeout(() => updatePlacementColorPreview(placementId, color.id), 10);
        });
        
        console.log(`✅ ${placement.colors.length} colores renderizados para placement ${placementId}`);
    }
    
    /**
     * Actualiza el valor de un color
     * @param {number} placementId - ID del placement
     * @param {number} colorId - ID del color
     * @param {string} value - Nuevo valor
     */
    function updatePlacementColorValue(placementId, colorId, value) {
        const placement = window.PlacementsCore ? 
            window.PlacementsCore.getPlacementById(placementId) : null;
        
        if (!placement) return;
        
        const color = placement.colors.find(c => c.id === colorId);
        if (color) {
            color.val = value;
            updatePlacementColorPreview(placementId, colorId);
            updatePlacementStations(placementId);
            updatePlacementColorsPreview(placementId);
            checkForSpecialtiesInColors(placementId);
            
            console.log(`✏️ Color ${colorId} actualizado: "${value}"`);
        }
    }
    
    /**
     * Actualiza la letra de pantalla de un color
     * @param {number} placementId - ID del placement
     * @param {number} colorId - ID del color
     * @param {string} value - Nueva letra/número
     */
    function updatePlacementScreenLetter(placementId, colorId, value) {
        const placement = window.PlacementsCore ? 
            window.PlacementsCore.getPlacementById(placementId) : null;
        
        if (!placement) return;
        
        const color = placement.colors.find(c => c.id === colorId);
        if (color) {
            color.screenLetter = value.toUpperCase();
            updatePlacementStations(placementId);
            
            console.log(`🔤 Letra de pantalla ${colorId} actualizada: "${value}"`);
        }
    }
    
    /**
     * Elimina un color de un placement
     * @param {number} placementId - ID del placement
     * @param {number} colorId - ID del color
     */
    function removePlacementColorItem(placementId, colorId) {
        console.log(`🗑️ Eliminando color ${colorId} del placement ${placementId}`);
        
        const placement = window.PlacementsCore ? 
            window.PlacementsCore.getPlacementById(placementId) : null;
        
        if (!placement) return;
        
        placement.colors = placement.colors.filter(c => c.id !== colorId);
        renderPlacementColors(placementId);
        updatePlacementStations(placementId);
        updatePlacementColorsPreview(placementId);
        checkForSpecialtiesInColors(placementId);
        
        console.log(`✅ Color ${colorId} eliminado del placement ${placementId}`);
    }
    
    // ========== VISTA PREVIA DE COLORES ==========
    
    /**
     * Actualiza la vista previa de un color
     * @param {number} placementId - ID del placement
     * @param {number} colorId - ID del color
     */
    function updatePlacementColorPreview(placementId, colorId) {
        const placement = window.PlacementsCore ? 
            window.PlacementsCore.getPlacementById(placementId) : null;
        
        if (!placement) return;
        
        const color = placement.colors.find(c => c.id === colorId);
        if (!color) return;
        
        const preview = document.getElementById(`placement-color-preview-${placementId}-${colorId}`);
        if (!preview) return;
        
        const colorName = color.val.toUpperCase().trim();
        let colorHex = null;
        
        // Buscar en Utils.getColorHex si está disponible
        if (window.Utils && window.Utils.getColorHex) {
            colorHex = window.Utils.getColorHex(color.val);
        }
        
        // Buscar en TeamsConfig si está disponible
        if (!colorHex && window.TeamsConfig) {
            const leagues = ['NCAA', 'NBA', 'NFL'];
            
            for (const league of leagues) {
                if (window.TeamsConfig[league] && window.TeamsConfig[league].colors) {
                    const colorCategories = ['institutional', 'metallic', 'alt', 'uni'];
                    
                    for (const category of colorCategories) {
                        const categoryColors = window.TeamsConfig[league].colors[category];
                        if (categoryColors) {
                            for (const [key, data] of Object.entries(categoryColors)) {
                                const keyUpper = key.toUpperCase().replace(/_/g, ' ');
                                if (colorName === keyUpper || 
                                    colorName.includes(keyUpper) || 
                                    keyUpper.includes(colorName)) {
                                    if (data && data.hex) {
                                        colorHex = data.hex;
                                        break;
                                    }
                                }
                            }
                        }
                        if (colorHex) break;
                    }
                }
                if (colorHex) break;
            }
        }
        
        // Buscar en Config.COLOR_DATABASES
        if (!colorHex && window.Config && window.Config.COLOR_DATABASES) {
            const databases = ['PANTONE', 'GEARFORSPORT', 'INSTITUCIONAL'];
            
            for (const dbName of databases) {
                const db = window.Config.COLOR_DATABASES[dbName];
                if (db) {
                    for (const [key, data] of Object.entries(db)) {
                        if (colorName === key.toUpperCase() || 
                            colorName.includes(key.toUpperCase()) || 
                            key.toUpperCase().includes(colorName)) {
                            if (data && data.hex) {
                                colorHex = data.hex;
                                break;
                            }
                        }
                    }
                }
                if (colorHex) break;
            }
        }
        
        // Colores básicos mínimos
        if (!colorHex) {
            const basicColors = {
                'RED': '#FF0000',
                'BLUE': '#0000FF',
                'GREEN': '#00FF00',
                'BLACK': '#000000',
                'WHITE': '#FFFFFF',
                'YELLOW': '#FFFF00',
                'PURPLE': '#800080',
                'ORANGE': '#FFA500',
                'GRAY': '#808080',
                'GREY': '#808080',
                'GOLD': '#FFD700',
                'SILVER': '#C0C0C0',
                'NAVY': '#000080',
                'MAROON': '#800000',
                'PINK': '#FFC0CB',
                'BROWN': '#A52A2A',
                'TEAL': '#008080',
                'CYAN': '#00FFFF',
                'MAGENTA': '#FF00FF',
                'LIME': '#00FF00',
                'OLIVE': '#808000'
            };
            
            // Coincidencia exacta
            if (basicColors[colorName]) {
                colorHex = basicColors[colorName];
            } else {
                // Buscar palabra dentro del nombre
                for (const [basicName, hex] of Object.entries(basicColors)) {
                    if (colorName.includes(basicName)) {
                        colorHex = hex;
                        break;
                    }
                }
            }
        }
        
        // Código HEX directo
        if (!colorHex) {
            const hexMatch = colorName.match(/#([0-9A-F]{6})/i);
            if (hexMatch) {
                colorHex = `#${hexMatch[1]}`;
            }
        }
        
        // Aplicar color
        if (colorHex) {
            preview.style.background = colorHex;
            preview.style.backgroundImage = 'none';
            preview.title = `${color.val} - ${colorHex}`;
        } else {
            // Fallback: gris neutro
            preview.style.background = '#CCCCCC';
            preview.style.backgroundImage = 'repeating-linear-gradient(45deg, #999 0, #999 2px, #CCC 2px, #CCC 4px)';
            preview.title = `${color.val} - No encontrado`;
        }
    }
    
    /**
     * Actualiza la vista previa de todos los colores de un placement
     * @param {number} placementId - ID del placement
     */
    function updatePlacementColorsPreview(placementId) {
        console.log(`🎨 Actualizando vista previa de colores del placement ${placementId}`);
        
        const placement = window.PlacementsCore ? 
            window.PlacementsCore.getPlacementById(placementId) : null;
        
        if (!placement) return;
        
        const container = document.getElementById(`placement-colors-preview-${placementId}`);
        if (!container) return;
        
        const uniqueColors = [];
        const seenColors = new Set();
        
        placement.colors.forEach(color => {
            if (color.type === 'COLOR' || color.type === 'METALLIC') {
                const colorVal = color.val.toUpperCase().trim();
                if (colorVal && !seenColors.has(colorVal)) {
                    seenColors.add(colorVal);
                    uniqueColors.push({
                        val: colorVal,
                        screenLetter: color.screenLetter
                    });
                }
            }
        });
        
        if (uniqueColors.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        let html = '<div><strong>Leyenda de Colores:</strong></div><div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 10px;">';
        
        uniqueColors.forEach(color => {
            const colorHex = getColorHex(color.val) || '#cccccc';
            html += `
                <div class="color-legend-item" style="display: flex; align-items: center; margin-bottom: 5px;">
                    <div class="color-legend-swatch" style="background-color: ${colorHex}; border: 1px solid #666; width: 15px; height: 15px; margin-right: 5px;"></div>
                    <span style="font-size: 11px;">${color.screenLetter}: ${color.val}</span>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        console.log(`✅ Vista previa de colores actualizada: ${uniqueColors.length} colores únicos`);
    }
    
    // ========== DETECCIÓN DE ESPECIALIDADES ==========
    
    /**
     * Verifica si hay especialidades en los colores de un placement
     * @param {number} placementId - ID del placement
     * @returns {Array} Array de especialidades encontradas
     */
    function checkForSpecialtiesInColors(placementId) {
        console.log(`🔍 Verificando especialidades en colores del placement ${placementId}`);
        
        const placement = window.PlacementsCore ? 
            window.PlacementsCore.getPlacementById(placementId) : null;
        
        if (!placement) return [];
        
        let specialties = [];
        
        placement.colors.forEach(color => {
            if (color.val) {
                const colorVal = color.val.toUpperCase();
                
                // Detectar HIGH DENSITY
                if (colorVal.includes('HD') || colorVal.includes('HIGH DENSITY')) {
                    if (!specialties.includes('HIGH DENSITY')) {
                        specialties.push('HIGH DENSITY');
                    }
                }
                
                // Detectar metálicos
                if (isMetallicColor(colorVal)) {
                    if (!specialties.includes('METALLIC')) {
                        specialties.push('METALLIC');
                    }
                }
                
                // Detectar FOIL
                if (colorVal.includes('FOIL')) {
                    if (!specialties.includes('FOIL')) {
                        specialties.push('FOIL');
                    }
                }
            }
        });
        
        // Actualizar el campo de specialties en la UI
        const specialtiesField = document.getElementById(`specialties-${placementId}`);
        if (specialtiesField) {
            specialtiesField.value = specialties.join(', ');
            
            // Actualizar en el objeto placement
            if (placement) {
                placement.specialties = specialtiesField.value;
            }
        }
        
        console.log(`✅ Especialidades encontradas: ${specialties.length > 0 ? specialties.join(', ') : 'Ninguna'}`);
        return specialties;
    }
    
    /**
     * Verifica si un color es metálico
     * @param {string} colorName - Nombre del color
     * @returns {boolean} True si es metálico
     */
    function isMetallicColor(colorName) {
        if (!colorName) return false;
        
        const upperColor = colorName.toUpperCase();
        
        // Verificar códigos Pantone metálicos (8xxC)
        if (upperColor.match(/(8[7-9][0-9]\s*C?)/i)) {
            return true;
        }
        
        const METALLIC_CODES = [
            "871C", "872C", "873C", "874C", "875C", "876C", "877C",
            "METALLIC", "GOLD", "SILVER", "BRONZE", "METÁLICO", "METALIC"
        ];
        
        for (const metallicCode of METALLIC_CODES) {
            if (upperColor.includes(metallicCode)) {
                return true;
            }
        }
        
        return false;
    }
    
    // ========== SECUENCIA DE ESTACIONES ==========
    
    /**
     * Actualiza la secuencia de estaciones de un placement
     * @param {number} placementId - ID del placement
     * @param {boolean} returnOnly - Si solo debe retornar los datos
     * @returns {Array} Datos de estaciones si returnOnly es true
     */
    function updatePlacementStations(placementId, returnOnly = false) {
        console.log(`🔄 Actualizando estaciones del placement ${placementId}`);
        
        const placement = window.PlacementsCore ? 
            window.PlacementsCore.getPlacementById(placementId) : null;
        
        if (!placement) return returnOnly ? [] : null;
        
        const preset = window.Utils ? window.Utils.getInkPreset(placement.inkType || 'WATER') : {
            temp: '320 °F', 
            time: '1:40 min',
            blocker: { name: 'BLOCKER CHT', mesh1: '122/55', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
            white: { name: 'AQUAFLEX WHITE', mesh1: '198/40', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
            color: { mesh: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: '3 % cross-linker 500 · 1.5 % antitack' }
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
        
        if (returnOnly) return stationsData;
        
        renderPlacementStationsTable(placementId, stationsData);
        console.log(`✅ Estaciones del placement ${placementId} actualizadas: ${stationsData.length} filas`);
    }
    
    /**
     * Renderiza la tabla de secuencia de estaciones
     * @param {number} placementId - ID del placement
     * @param {Array} data - Datos de las estaciones
     */
    function renderPlacementStationsTable(placementId, data) {
        const div = document.getElementById(`placement-sequence-table-${placementId}`);
        if (!div) return;
        
        if (data.length === 0) {
            div.innerHTML = '<p style="color:var(--text-secondary); font-style:italic; text-align:center; padding:15px; background:var(--gray-dark); border-radius:var(--radius);">Agrega colores para generar la secuencia de impresión.</p>';
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
    }
    
    // ========== FUNCIONES AUXILIARES ==========
    
    /**
     * Obtiene el código hexadecimal de un color
     * @param {string} colorName - Nombre del color
     * @returns {string} Código hexadecimal o null
     */
    function getColorHex(colorName) {
        if (!colorName) return null;
        
        const name = colorName.toUpperCase().trim();
        
        // Buscar en todas las bases de datos
        if (window.Config && window.Config.COLOR_DATABASES) {
            for (const db of Object.values(window.Config.COLOR_DATABASES)) {
                for (const [key, data] of Object.entries(db)) {
                    if (name === key || name.includes(key) || key.includes(name)) {
                        return data.hex;
                    }
                }
            }
        }
        
        const hexMatch = name.match(/#([0-9A-F]{6})/i);
        if (hexMatch) {
            return `#${hexMatch[1]}`;
        }
        
        return null;
    }
    
    /**
     * Obtiene el total de colores de un placement
     * @param {number} placementId - ID del placement
     * @returns {number} Total de colores
     */
    function getTotalColors(placementId) {
        const placement = window.PlacementsCore ? 
            window.PlacementsCore.getPlacementById(placementId) : null;
        
        return placement ? placement.colors.length : 0;
    }
    
    /**
     * Limpia todos los colores de un placement
     * @param {number} placementId - ID del placement
     */
    function clearPlacementColors(placementId) {
        const placement = window.PlacementsCore ? 
            window.PlacementsCore.getPlacementById(placementId) : null;
        
        if (placement) {
            placement.colors = [];
            renderPlacementColors(placementId);
            updatePlacementStations(placementId);
            updatePlacementColorsPreview(placementId);
            checkForSpecialtiesInColors(placementId);
            
            console.log(`🧹 Colores del placement ${placementId} limpiados`);
        }
    }
    
    // ========== EXPORTACIÓN PÚBLICA ==========
    return {
        // Funciones principales de colores
        addPlacementColorItem,
        renderPlacementColors,
        updatePlacementColorValue,
        updatePlacementScreenLetter,
        removePlacementColorItem,
        
        // Vista previa de colores
        updatePlacementColorPreview,
        updatePlacementColorsPreview,
        
        // Detección de especialidades
        checkForSpecialtiesInColors,
        isMetallicColor,
        
        // Secuencia de estaciones
        updatePlacementStations,
        renderPlacementStationsTable,
        
        // Funciones auxiliares
        getColorHex,
        getTotalColors,
        clearPlacementColors
    };
})();

// ========== EXPORTACIÓN GLOBAL ==========
window.PlacementsColors = PlacementsColors;

// Exportar funciones individuales para compatibilidad
window.addPlacementColorItem = PlacementsColors.addPlacementColorItem;
window.renderPlacementColors = PlacementsColors.renderPlacementColors;
window.updatePlacementColorValue = PlacementsColors.updatePlacementColorValue;
window.updatePlacementScreenLetter = PlacementsColors.updatePlacementScreenLetter;
window.removePlacementColorItem = PlacementsColors.removePlacementColorItem;
window.updatePlacementColorPreview = PlacementsColors.updatePlacementColorPreview;
window.updatePlacementColorsPreview = PlacementsColors.updatePlacementColorsPreview;
window.checkForSpecialtiesInColors = PlacementsColors.checkForSpecialtiesInColors;
window.updatePlacementStations = PlacementsColors.updatePlacementStations;

console.log('✅ Módulo PlacementsColors completamente cargado y exportado');
