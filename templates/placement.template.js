/**
 * Template para Placements individuales
 * Renderiza la estructura completa de un placement con todos sus componentes
 */

export function renderPlacement(placement, isFirst = false) {
  const container = document.getElementById('placements-container');
  if (!container) return;
  
  const sectionId = `placement-section-${placement.id}`;
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
  
  const sectionHTML = `
    <div id="${sectionId}" class="placement-section" data-placement-id="${placement.id}">
      <div class="placement-header">
        <div class="placement-title">
          <i class="fas fa-map-marker-alt"></i>
          <span>${displayType}</span>
        </div>
        <div class="placement-actions">
          <button class="btn btn-outline btn-sm" onclick="window.layoutManager.duplicatePlacement(${placement.id})">
            <i class="fas fa-copy"></i> Duplicar
          </button>
          ${window.placements.length > 1 ? `
          <button class="btn btn-danger btn-sm" onclick="window.layoutManager.removePlacement(${placement.id})">
            <i class="fas fa-trash"></i> Eliminar
          </button>
          ` : ''}
        </div>
      </div>
      
      <div class="placement-grid">
        <div class="placement-left-column">
          <!-- Tipo de Placement -->
          <div class="form-group">
            <label class="form-label">TIPO DE PLACEMENT:</label>
            <select class="form-control placement-type-select" 
                    data-placement-id="${placement.id}"
                    onchange="window.layoutManager.updatePlacementType(${placement.id}, this.value)">
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
          
          <!-- Input para custom placement -->
          <div id="custom-placement-input-${placement.id}" style="display:${isCustom ? 'block' : 'none'}; margin-top:10px;">
            <label class="form-label">NOMBRE DEL PLACEMENT:</label>
            <input type="text" 
                   class="form-control custom-placement-name"
                   data-placement-id="${placement.id}"
                   placeholder="Escribe el nombre del placement personalizado..."
                   value="${customName}"
                   oninput="window.layoutManager.updateCustomPlacement(${placement.id}, this.value)">
          </div>
          
          <!-- Imagen de Referencia -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title" style="font-size: 1rem;">
                <i class="fas fa-image"></i> Imagen para ${displayType}
              </h3>
            </div>
            <div class="card-body">
              <div class="file-upload-area" onclick="window.layoutManager.openImagePickerForPlacement(${placement.id})">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Haz clic para subir una imagen para este placement</p>
                <p style="font-size:0.8rem; color:var(--text-secondary);">Ctrl+V para pegar</p>
              </div>
              <div class="image-preview-container">
                <img id="placement-image-preview-${placement.id}" 
                     class="image-preview placement-image" 
                     alt="Vista previa"
                     style="display: none;">
                <div class="image-actions" id="placement-image-actions-${placement.id}" style="display:none;">
                  <button class="btn btn-danger btn-sm" onclick="window.layoutManager.removePlacementImage(${placement.id})">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Condiciones de Impresión -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title" style="font-size: 1rem;">
                <i class="fas fa-print"></i> Condiciones para ${displayType}
              </h3>
            </div>
            <div class="card-body">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">DETALLES DE UBICACIÓN:</label>
                  <input type="text" 
                         id="placement-details-${placement.id}"
                         class="form-control placement-details"
                         value="${placement.placementDetails}"
                         oninput="window.layoutManager.updatePlacementField(${placement.id}, 'placementDetails', this.value)">
                </div>
                
                <!-- Dimensiones separadas -->
                <div class="form-group">
                  <label class="form-label">DIMENSIONES:</label>
                  <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="text" 
                           id="dimension-w-${placement.id}"
                           class="form-control placement-dimension-w"
                           placeholder="Ancho"
                           value="${placement.width || dimensions.width.replace('"', '')}"
                           oninput="window.layoutManager.updatePlacementDimension(${placement.id}, 'width', this.value)"
                           style="width: 100px;">
                    <span style="color: var(--text-secondary);">X</span>
                    <input type="text" 
                           id="dimension-h-${placement.id}"
                           class="form-control placement-dimension-h"
                           placeholder="Alto"
                           value="${placement.height || dimensions.height.replace('"', '')}"
                           oninput="window.layoutManager.updatePlacementDimension(${placement.id}, 'height', this.value)"
                           style="width: 100px;">
                    <span style="color: var(--text-secondary);">pulgadas</span>
                  </div>
                </div>
                
                <!-- Campos de temperatura y tiempo -->
                <div class="form-group">
                  <label class="form-label">TEMPERATURA:</label>
                  <input type="text" 
                         id="temp-${placement.id}"
                         class="form-control placement-temp"
                         value="${placement.temp}"
                         readonly
                         title="Determinado por el tipo de tinta seleccionado">
                </div>
                <div class="form-group">
                  <label class="form-label">TIEMPO:</label>
                  <input type="text" 
                         id="time-${placement.id}"
                         class="form-control placement-time"
                         value="${placement.time}"
                         readonly
                         title="Determinado por el tipo de tinta seleccionado">
                </div>
                
                <!-- CAMPO SPECIALTIES -->
                <div class="form-group">
                  <label class="form-label">SPECIALTIES:</label>
                  <input type="text" 
                         id="specialties-${placement.id}"
                         class="form-control placement-specialties"
                         placeholder="Detectado automáticamente..."
                         value="${placement.specialties || ''}"
                         readonly
                         title="Detectado automáticamente de los colores">
                </div>
              </div>
            </div>
          </div>
          
          <!-- Parámetros de Impresión Editables -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title" style="font-size: 1rem;">
                <i class="fas fa-sliders-h"></i> Parámetros de Impresión
              </h3>
            </div>
            <div class="card-body">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">MALLA COLORES:</label>
                  <input type="text" 
                         id="mesh-color-${placement.id}"
                         class="form-control placement-mesh-color"
                         value="${placement.meshColor || defaultMeshColor}"
                         oninput="window.layoutManager.updatePlacementParam(${placement.id}, 'meshColor', this.value)"
                         title="Malla para colores regulares">
                </div>
                
                <div class="form-group">
                  <label class="form-label">MALLA WHITE BASE:</label>
                  <input type="text" 
                         id="mesh-white-${placement.id}"
                         class="form-control placement-mesh-white"
                         value="${placement.meshWhite || defaultMeshWhite}"
                         oninput="window.layoutManager.updatePlacementParam(${placement.id}, 'meshWhite', this.value)"
                         title="Malla para White Base">
                </div>
                
                <div class="form-group">
                  <label class="form-label">MALLA BLOCKER:</label>
                  <input type="text" 
                         id="mesh-blocker-${placement.id}"
                         class="form-control placement-mesh-blocker"
                         value="${placement.meshBlocker || defaultMeshBlocker}"
                         oninput="window.layoutManager.updatePlacementParam(${placement.id}, 'meshBlocker', this.value)"
                         title="Malla para Blocker">
                </div>
                
                <div class="form-group">
                  <label class="form-label">DURÓMETRO:</label>
                  <input type="text" 
                         id="durometer-${placement.id}"
                         class="form-control placement-durometer"
                         value="${placement.durometer || defaultDurometer}"
                         oninput="window.layoutManager.updatePlacementParam(${placement.id}, 'durometer', this.value)"
                         title="Durometer (dureza de la racleta)">
                </div>
                
                <div class="form-group">
                  <label class="form-label">STROKES:</label>
                  <input type="text" 
                         id="strokes-${placement.id}"
                         class="form-control placement-strokes"
                         value="${placement.strokes || defaultStrokes}"
                         oninput="window.layoutManager.updatePlacementParam(${placement.id}, 'strokes', this.value)"
                         title="Número de strokes">
                </div>
                
                <div class="form-group">
                  <label class="form-label">ANGLE:</label>
                  <input type="text" 
                         id="angle-${placement.id}"
                         class="form-control placement-angle"
                         value="${placement.angle || defaultAngle}"
                         oninput="window.layoutManager.updatePlacementParam(${placement.id}, 'angle', this.value)"
                         title="Ángulo de la racleta">
                </div>
                
                <div class="form-group">
                  <label class="form-label">PRESSURE:</label>
                  <input type="text" 
                         id="pressure-${placement.id}"
                         class="form-control placement-pressure"
                         value="${placement.pressure || defaultPressure}"
                         oninput="window.layoutManager.updatePlacementParam(${placement.id}, 'pressure', this.value)"
                         title="Presión de impresión">
                </div>
                
                <div class="form-group">
                  <label class="form-label">SPEED:</label>
                  <input type="text" 
                         id="speed-${placement.id}"
                         class="form-control placement-speed"
                         value="${placement.speed || defaultSpeed}"
                         oninput="window.layoutManager.updatePlacementParam(${placement.id}, 'speed', this.value)"
                         title="Velocidad de impresión">
                </div>
                
                <div class="form-group">
                  <label class="form-label">ADITIVOS:</label>
                  <input type="text" 
                         id="additives-${placement.id}"
                         class="form-control placement-additives"
                         value="${placement.additives || defaultAdditives}"
                         oninput="window.layoutManager.updatePlacementParam(${placement.id}, 'additives', this.value)"
                         title="Aditivos para la tinta">
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="placement-right-column">
          <!-- Tipo de Tinta -->
          <div class="form-group">
            <label class="form-label">TIPO DE TINTA:</label>
            <select class="form-control placement-ink-type"
                    data-placement-id="${placement.id}"
                    onchange="window.layoutManager.updatePlacementInkType(${placement.id}, this.value)">
              <option value="WATER" ${placement.inkType === 'WATER' ? 'selected' : ''}>Water-base</option>
              <option value="PLASTISOL" ${placement.inkType === 'PLASTISOL' ? 'selected' : ''}>Plastisol</option>
              <option value="SILICONE" ${placement.inkType === 'SILICONE' ? 'selected' : ''}>Silicone</option>
            </select>
          </div>
          
          <!-- Colores y Tintas -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title" style="font-size: 1rem;">
                <i class="fas fa-palette"></i> Colores para ${displayType}
              </h3>
            </div>
            <div class="card-body">
              <div class="no-print" style="margin-bottom:20px; display:flex; gap:10px; flex-wrap:wrap;">
                <button class="btn btn-danger btn-sm" onclick="window.layoutManager.addPlacementColorItem(${placement.id}, 'BLOCKER')">
                  <i class="fas fa-plus"></i> Blocker
                </button>
                <button class="btn btn-white-base btn-sm" onclick="window.layoutManager.addPlacementColorItem(${placement.id}, 'WHITE_BASE')">
                  <i class="fas fa-plus"></i> White Base
                </button>
                <button class="btn btn-primary btn-sm" onclick="window.layoutManager.addPlacementColorItem(${placement.id}, 'COLOR')">
                  <i class="fas fa-plus"></i> Color
                </button>
                <button class="btn btn-warning btn-sm" onclick="window.layoutManager.addPlacementColorItem(${placement.id}, 'METALLIC')">
                  <i class="fas fa-star"></i> Metálico
                </button>
              </div>
              <div id="placement-colors-container-${placement.id}" class="color-sequence"></div>
            </div>
          </div>
          
          <!-- Instrucciones Especiales -->
          <div class="form-group">
            <label class="form-label">INSTRUCCIONES ESPECIALES:</label>
            <textarea id="special-instructions-${placement.id}"
                      class="form-control placement-special-instructions"
                      rows="3"
                      placeholder="Instrucciones especiales para este placement..."
                      oninput="window.layoutManager.updatePlacementField(${placement.id}, 'specialInstructions', this.value)">${placement.specialInstructions}</textarea>
          </div>
          
          <!-- Vista previa de colores -->
          <div id="placement-colors-preview-${placement.id}" class="color-legend"></div>
          
          <!-- Secuencia de Estaciones -->
          <h4 style="margin:15px 0 10px; font-size:0.9rem; color:var(--primary);">
            <i class="fas fa-list-ol"></i> Secuencia de ${displayType}
          </h4>
          <div id="placement-sequence-table-${placement.id}"></div>
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

// Funciones auxiliares para placements
function getPlacementDisplayName(placement) {
  if (!placement) return 'N/A';
  
  if (placement.type && placement.type.includes('CUSTOM:')) {
    return placement.type.replace('CUSTOM: ', '');
  }
  
  return placement.type || placement.name || 'N/A';
}

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

function renderPlacementColors(placementId) {
  const placement = window.placements.find(p => p.id === placementId);
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
             oninput="window.layoutManager.updatePlacementScreenLetter(${placementId}, ${color.id}, this.value)"
             title="Letra/Número de Pantalla">
      <input type="text" 
             class="form-control placement-ink-input"
             data-color-id="${color.id}"
             data-placement-id="${placementId}"
             placeholder="Nombre de la tinta..." 
             value="${color.val}"
             oninput="window.layoutManager.updatePlacementColorValue(${placementId}, ${color.id}, this.value)">
      <div class="color-preview" 
           id="placement-color-preview-${placementId}-${color.id}" 
           title="Vista previa del color"></div>
      <button class="btn btn-danger btn-sm" onclick="window.layoutManager.removePlacementColorItem(${placementId}, ${color.id})">
        <i class="fas fa-times"></i>
      </button>
    `;
    container.appendChild(div);
  });
}

function updatePlacementStations(placementId, returnOnly = false) {
  const placement = window.placements.find(p => p.id === placementId);
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
}

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

function updatePlacementColorsPreview(placementId) {
  const placement = window.placements.find(p => p.id === placementId);
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
}

function getColorHex(colorName) {
  if (!colorName) return null;
  
  try {
    const name = colorName.toUpperCase().trim();
    
    // 1. Usar Utils si está disponible
    if (window.Utils && window.Utils.getColorHex) {
      return window.Utils.getColorHex(colorName);
    }
    
    // 2. Verificar si Config está disponible
    if (!window.Config || !window.Config.COLOR_DATABASES) {
      // Fallback a colores básicos
      return getBasicColorHex(name);
    }
    
    // 3. Buscar en todas las bases de datos
    for (const db of Object.values(window.Config.COLOR_DATABASES)) {
      for (const [key, data] of Object.entries(db)) {
        if (key && data && data.hex) {
          if (name === key.toUpperCase() || 
              name.includes(key.toUpperCase()) || 
              key.toUpperCase().includes(name)) {
            return data.hex;
          }
        }
      }
    }
    
    // 4. Buscar código hex directo
    const hexMatch = name.match(/#([0-9A-F]{6})/i);
    if (hexMatch) {
      return `#${hexMatch[1]}`;
    }
    
    // 5. Último recurso: colores básicos
    return getBasicColorHex(name);
    
  } catch (error) {
    console.warn('Error en getColorHex:', error);
    return null;
  }
}

function getBasicColorHex(colorName) {
  const basicColors = {
    'RED': '#FF0000',
    'GREEN': '#00FF00',
    'BLUE': '#0000FF',
    'BLACK': '#000000',
    'WHITE': '#FFFFFF',
    'YELLOW': '#FFFF00',
    'PURPLE': '#800080',
    'ORANGE': '#FFA500',
    'GRAY': '#808080',
    'GREY': '#808080',
    'GOLD': '#FFD700',
    'SILVER': '#C0C0C0',
    'BROWN': '#A52A2A',
    'PINK': '#FFC0CB',
    'CYAN': '#00FFFF',
    'MAGENTA': '#FF00FF',
    'MAROON': '#800000',
    'OLIVE': '#808000',
    'NAVY': '#000080',
    'TEAL': '#008080',
    'LIME': '#00FF00',
    'AQUA': '#00FFFF',
    'FUCHSIA': '#FF00FF'
  };
  
  if (basicColors[colorName]) {
    return basicColors[colorName];
  }
  
  // Buscar coincidencia parcial
  for (const [color, hex] of Object.entries(basicColors)) {
    if (colorName.includes(color) || color.includes(colorName)) {
      return hex;
    }
  }
  
  return null;
}

function updateAllPlacementTitles(placementId) {
  const placement = window.placements.find(p => p.id === placementId);
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
  updatePlacementTabName(placementId, displayType);
}

function updatePlacementTabName(placementId, displayName) {
  const tab = document.querySelector(`.placement-tab[data-placement-id="${placementId}"]`);
  if (!tab) return;
  
  const icon = tab.querySelector('i').className;
  tab.innerHTML = `
    <i class="${icon}"></i>
    ${displayName.substring(0, 15)}${displayName.length > 15 ? '...' : ''}
    ${window.placements.length > 1 ? `<span class="remove-tab" onclick="window.layoutManager.removePlacement(${placementId})">&times;</span>` : ''}
  `;
}

// Hacer funciones disponibles globalmente
window.renderPlacement = renderPlacement;
window.updatePlacementStations = updatePlacementStations;
window.updatePlacementColorsPreview = updatePlacementColorsPreview;
window.updateAllPlacementTitles = updateAllPlacementTitles;
