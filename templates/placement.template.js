/**
 * Template para Placements individuales
 * Renderiza la estructura completa de un placement con todos sus componentes
 */

// Función principal para renderizar un placement
export function renderPlacement(placement, isFirst = false) {
  const container = document.getElementById('placements-container');
  if (!container) {
    console.error('❌ No se encontró el contenedor de placements');
    return;
  }
  
  const sectionId = `placement-section-${placement.id}`;
  
  // Verificar si ya existe para no duplicar
  if (document.getElementById(sectionId)) {
    console.log(`Placement ${placement.id} ya renderizado`);
    return;
  }
  
  const displayType = getPlacementDisplayName(placement);
  const isCustom = placement.type && placement.type.startsWith('CUSTOM:');
  const customName = isCustom ? placement.type.replace('CUSTOM: ', '') : '';
  
  // Obtener valores por defecto
  const preset = window.Utils ? window.Utils.getInkPreset(placement.inkType || 'WATER') : {
    temp: '320 °F', 
    time: '1:40 min',
    blocker: { name: 'BLOCKER CHT', mesh1: '122/55', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
    white: { name: 'AQUAFLEX WHITE', mesh1: '198/40', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
    color: { mesh: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: '3 % cross-linker 500 · 1.5 % antitack' }
  };
  
  const defaultMeshColor = preset.color.mesh || '157/48';
  const defaultMeshWhite = preset.white.mesh1 || '198/40';
  const defaultMeshBlocker = preset.blocker.mesh1 || '122/55';
  const defaultDurometer = preset.color.durometer || '70';
  const defaultStrokes = preset.color.strokes || '2';
  const defaultAngle = preset.color.angle || '15';
  const defaultPressure = preset.color.pressure || '40';
  const defaultSpeed = preset.color.speed || '35';
  const defaultAdditives = preset.color.additives || '3 % cross-linker 500 · 1.5 % antitack';
  
  // Extraer dimensiones
  const dimensions = extractDimensions(placement.dimensions);
  
  // HTML del placement (resumido por brevedad - usa el original pero sin export)
  const sectionHTML = `
    <div id="${sectionId}" class="placement-section" data-placement-id="${placement.id}">
      <div class="placement-header">
        <div class="placement-title">
          <i class="fas fa-map-marker-alt"></i>
          <span>${displayType}</span>
        </div>
        <div class="placement-actions">
          <button class="btn btn-outline btn-sm" onclick="if(window.layoutManager) window.layoutManager.duplicatePlacement(${placement.id})">
            <i class="fas fa-copy"></i> Duplicar
          </button>
          ${window.placements && window.placements.length > 1 ? `
          <button class="btn btn-danger btn-sm" onclick="if(window.layoutManager) window.layoutManager.removePlacement(${placement.id})">
            <i class="fas fa-trash"></i> Eliminar
          </button>
          ` : ''}
        </div>
      </div>
      
      <!-- CONTENIDO DEL PLACEMENT (simplificado para ejemplo) -->
      <div class="placement-grid">
        <div class="placement-left-column">
          <!-- Tipo de Placement -->
          <div class="form-group">
            <label class="form-label">TIPO DE PLACEMENT:</label>
            <select class="form-control placement-type-select" 
                    data-placement-id="${placement.id}"
                    onchange="if(window.layoutManager) window.layoutManager.updatePlacementType(${placement.id}, this.value)">
              <option value="FRONT" ${placement.type === 'FRONT' || displayType === 'FRONT' ? 'selected' : ''}>FRONT (Frente)</option>
              <option value="BACK" ${placement.type === 'BACK' || displayType === 'BACK' ? 'selected' : ''}>BACK (Espalda)</option>
              <option value="SLEEVE" ${placement.type === 'SLEEVE' || displayType === 'SLEEVE' ? 'selected' : ''}>SLEEVE (Manga)</option>
              <option value="CHEST" ${placement.type === 'CHEST' || displayType === 'CHEST' ? 'selected' : ''}>CHEST (Pecho)</option>
              <option value="TV. NUMBERS" ${placement.type === 'TV. NUMBERS' || displayType === 'TV. NUMBERS' ? 'selected' : ''}>TV. NUMBERS (Números TV)</option>
              <option value="SHOULDER" ${placement.type === 'SHOULDER' || displayType === 'SHOULDER' ? 'selected' : ''}>SHOULDER (Hombro)</option>
              <option value="COLLAR" ${placement.type === 'COLLAR' || displayType === 'COLLAR' ? 'selected' : ''}>COLLAR (Cuello)</option>
              <option value="CUSTOM" ${isCustom ? 'selected' : ''}>CUSTOM (Personalizado)</option>
            </select>
          </div>
          
          <!-- Resto del contenido del placement... -->
          <!-- ... usa tu código original aquí ... -->
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML += sectionHTML;
  
  // Renderizar colores si existen
  if (placement.colors && placement.colors.length > 0) {
    renderPlacementColors(placement.id);
  }
  
  // Actualizar estaciones y vista previa
  updatePlacementStations(placement.id);
  updatePlacementColorsPreview(placement.id);
  
  // Mostrar imagen si existe
  if (placement.imageData) {
    const img = document.getElementById(`placement-image-preview-${placement.id}`);
    const imageActions = document.getElementById(`placement-image-actions-${placement.id}`);
    
    if (img && imageActions) {
      img.src = placement.imageData;
      img.style.display = 'block';
      imageActions.style.display = 'flex';
    }
  }
  
  // Actualizar títulos
  setTimeout(() => {
    updateAllPlacementTitles(placement.id);
  }, 50);
}

// Función para obtener nombre de display
function getPlacementDisplayName(placement) {
  if (!placement) return 'N/A';
  
  if (placement.type && placement.type.includes('CUSTOM:')) {
    return placement.type.replace('CUSTOM: ', '');
  }
  
  return placement.type || placement.name || 'N/A';
}

// Función para extraer dimensiones
function extractDimensions(dimensionsText) {
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
      return {
        width: match[1],
        height: match[2]
      };
    }
  }
  
  return { width: '15.34', height: '12' };
}

// Función para renderizar colores del placement
function renderPlacementColors(placementId) {
  const placement = window.placements ? window.placements.find(p => p.id === placementId) : null;
  if (!placement) return;
  
  const container = document.getElementById(`placement-colors-container-${placementId}`);
  if (!container) return;
  
  if (!placement.colors || placement.colors.length === 0) {
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
             oninput="if(window.layoutManager) window.layoutManager.updatePlacementScreenLetter(${placementId}, ${color.id}, this.value)"
             title="Letra/Número de Pantalla">
      <input type="text" 
             class="form-control placement-ink-input"
             data-color-id="${color.id}"
             data-placement-id="${placementId}"
             placeholder="Nombre de la tinta..." 
             value="${color.val}"
             oninput="if(window.layoutManager) window.layoutManager.updatePlacementColorValue(${placementId}, ${color.id}, this.value)">
      <div class="color-preview" 
           id="placement-color-preview-${placementId}-${color.id}" 
           title="Vista previa del color"></div>
      <button class="btn btn-danger btn-sm" onclick="if(window.layoutManager) window.layoutManager.removePlacementColorItem(${placementId}, ${color.id})">
        <i class="fas fa-times"></i>
      </button>
    `;
    container.appendChild(div);
  });
}

// Función para actualizar estaciones
function updatePlacementStations(placementId, returnOnly = false) {
  const placement = window.placements ? window.placements.find(p => p.id === placementId) : null;
  if (!placement) return [];
  
  const preset = window.Utils ? window.Utils.getInkPreset(placement.inkType || 'WATER') : {
    temp: '320 °F', 
    time: '1:40 min',
    blocker: { name: 'BLOCKER CHT', mesh1: '122/55', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
    white: { name: 'AQUAFLEX WHITE', mesh1: '198/40', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
    color: { mesh: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: '3 % cross-linker 500 · 1.5 % antitack' }
  };
  
  const stationsData = [];
  let stNum = 1;
  
  // ... (código para generar stationsData)
  
  if (returnOnly) return stationsData;
  
  // Renderizar tabla
  const div = document.getElementById(`placement-sequence-table-${placementId}`);
  if (!div) return;
  
  if (stationsData.length === 0) {
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
  
  stationsData.forEach((row, idx) => {
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

// Función para actualizar vista previa de colores
function updatePlacementColorsPreview(placementId) {
  const placement = window.placements ? window.placements.find(p => p.id === placementId) : null;
  if (!placement) return;
  
  const container = document.getElementById(`placement-colors-preview-${placementId}`);
  if (!container) return;
  
  const uniqueColors = [];
  const seenColors = new Set();
  
  placement.colors.forEach(color => {
    if (color.type === 'COLOR' || color.type === 'METALLIC') {
      const colorVal = color.val ? color.val.toUpperCase().trim() : '';
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
}

// Función auxiliar para obtener color hex
function getColorHex(colorName) {
  if (!colorName) return null;
  
  try {
    const name = colorName.toUpperCase().trim();
    
    // Usar Utils si está disponible
    if (window.Utils && window.Utils.getColorHex) {
      return window.Utils.getColorHex(colorName);
    }
    
    // Buscar código hex directo
    const hexMatch = name.match(/#([0-9A-F]{6})/i);
    if (hexMatch) {
      return `#${hexMatch[1]}`;
    }
    
    // Colores básicos como fallback
    const basicColors = {
      'RED': '#FF0000', 'GREEN': '#00FF00', 'BLUE': '#0000FF',
      'BLACK': '#000000', 'WHITE': '#FFFFFF', 'YELLOW': '#FFFF00',
      'PURPLE': '#800080', 'ORANGE': '#FFA500', 'GRAY': '#808080',
      'GOLD': '#FFD700', 'SILVER': '#C0C0C0', 'BROWN': '#A52A2A'
    };
    
    for (const [color, hex] of Object.entries(basicColors)) {
      if (name.includes(color) || color.includes(name)) {
        return hex;
      }
    }
    
  } catch (error) {
    console.warn('Error en getColorHex:', error);
  }
  
  return null;
}

// Función para actualizar todos los títulos
function updateAllPlacementTitles(placementId) {
  const placement = window.placements ? window.placements.find(p => p.id === placementId) : null;
  if (!placement) return;
  
  const displayType = getPlacementDisplayName(placement);
  
  const section = document.getElementById(`placement-section-${placementId}`);
  if (!section) return;
  
  // 1. Actualizar título principal del placement
  const title = section.querySelector('.placement-title span');
  if (title) {
    title.textContent = displayType;
  }
  
  // 2. Actualizar "Colores para X"
  const colorTitle = section.querySelector('.card-title');
  if (colorTitle && colorTitle.textContent.includes('Colores para')) {
    colorTitle.textContent = `Colores para ${displayType}`;
  }
  
  // 3. Actualizar "Imagen para X"
  const imageTitles = section.querySelectorAll('.card-title');
  imageTitles.forEach(title => {
    if (title.textContent.includes('Imagen para')) {
      title.textContent = `Imagen para ${displayType}`;
    }
  });
  
  // 4. Actualizar "Condiciones para X"
  const conditionsTitles = section.querySelectorAll('.card-title');
  conditionsTitles.forEach(title => {
    if (title.textContent.includes('Condiciones para')) {
      title.textContent = `Condiciones para ${displayType}`;
    }
  });
  
  // 5. Actualizar "Secuencia de X"
  const sequenceTitle = section.querySelector('h4');
  if (sequenceTitle && sequenceTitle.textContent.includes('Secuencia de')) {
    sequenceTitle.textContent = `Secuencia de ${displayType}`;
  }
  
  // 6. Actualizar tab si existe
  const tab = document.querySelector(`.placement-tab[data-placement-id="${placementId}"]`);
  if (tab) {
    const icon = tab.querySelector('i') ? tab.querySelector('i').className : 'fas fa-map-marker-alt';
    tab.innerHTML = `
      <i class="${icon}"></i>
      ${displayType.substring(0, 15)}${displayType.length > 15 ? '...' : ''}
      ${window.placements && window.placements.length > 1 ? `<span class="remove-tab" onclick="if(window.layoutManager) window.layoutManager.removePlacement(${placementId})">&times;</span>` : ''}
    `;
  }
}
