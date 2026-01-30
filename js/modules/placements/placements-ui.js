// js/modules/placements/placements-ui.js
// Módulo de interfaz de usuario para placements

console.log('🎨 Módulo placements-ui.js cargado');

const PlacementsUI = (function() {
    
    // ========== FUNCIONES DE RENDERIZADO ==========
    
    /**
     * Renderiza el HTML de un placement
     * @param {Object} placement - Objeto placement
     */
    function renderPlacementHTML(placement) {
        console.log(`🎨 Renderizando placement: ${placement.type} (ID: ${placement.id})`);
        
        const container = document.getElementById('placements-container');
        if (!container) {
            console.error('❌ Contenedor de placements no encontrado');
            return;
        }
        
        // Verificar si ya existe
        if (document.getElementById(`placement-section-${placement.id}`)) {
            console.log(`ℹ️ Placement ${placement.id} ya renderizado, omitiendo`);
            return;
        }
        
        const sectionId = `placement-section-${placement.id}`;
        const isCustom = placement.type.includes('CUSTOM:');
        const displayType = isCustom ? 'CUSTOM' : placement.type;
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
        const dimensions = window.PlacementsCore ? 
            window.PlacementsCore.extractDimensions(placement.dimensions) : 
            { width: '15.34', height: '12' };
        
        const sectionHTML = `
            <div id="${sectionId}" class="placement-section" data-placement-id="${placement.id}">
                <div class="placement-header">
                    <div class="placement-title">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${displayType}</span>
                    </div>
                    <div class="placement-actions">
                        <button class="btn btn-outline btn-sm" onclick="window.PlacementsCore.duplicatePlacement(${placement.id})">
                            <i class="fas fa-copy"></i> Duplicar
                        </button>
                        ${window.PlacementsCore && window.PlacementsCore.getTotalPlacements() > 1 ? `
                        <button class="btn btn-danger btn-sm" onclick="window.PlacementsCore.removePlacement(${placement.id})">
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
                                    onchange="window.PlacementsCore.updatePlacementType(${placement.id}, this.value)">
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
                                   oninput="window.PlacementsCore.updateCustomPlacement(${placement.id}, this.value)">
                        </div>
                        
                        <!-- Imagen de Referencia -->
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title" style="font-size: 1rem;">
                                    <i class="fas fa-image"></i> Imagen para ${displayType}
                                </h3>
                            </div>
                            <div class="card-body">
                                <div class="file-upload-area" onclick="openImagePickerForPlacement(${placement.id})">
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
                                        <button class="btn btn-danger btn-sm" onclick="removePlacementImage(${placement.id})">
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
                                               oninput="updatePlacementField(${placement.id}, 'placementDetails', this.value)">
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
                                                   oninput="window.PlacementsCore.updatePlacementDimension(${placement.id}, 'width', this.value)"
                                                   style="width: 100px;">
                                            <span style="color: var(--text-secondary);">X</span>
                                            <input type="text" 
                                                   id="dimension-h-${placement.id}"
                                                   class="form-control placement-dimension-h"
                                                   placeholder="Alto"
                                                   value="${placement.height || dimensions.height.replace('"', '')}"
                                                   oninput="window.PlacementsCore.updatePlacementDimension(${placement.id}, 'height', this.value)"
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
                                    
                                    <!-- CAMPO SPECIALTIES AGREGADO -->
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
                                    <!-- Malla para colores regulares -->
                                    <div class="form-group">
                                        <label class="form-label">MALLA COLORES:</label>
                                        <input type="text" 
                                               id="mesh-color-${placement.id}"
                                               class="form-control placement-mesh-color"
                                               value="${placement.meshColor || defaultMeshColor}"
                                               oninput="window.PlacementsCore.updatePlacementParam(${placement.id}, 'meshColor', this.value)"
                                               title="Malla para colores regulares">
                                    </div>
                                    
                                    <!-- Malla para White Base -->
                                    <div class="form-group">
                                        <label class="form-label">MALLA WHITE BASE:</label>
                                        <input type="text" 
                                               id="mesh-white-${placement.id}"
                                               class="form-control placement-mesh-white"
                                               value="${placement.meshWhite || defaultMeshWhite}"
                                               oninput="window.PlacementsCore.updatePlacementParam(${placement.id}, 'meshWhite', this.value)"
                                               title="Malla para White Base">
                                    </div>
                                    
                                    <!-- Malla para Blocker -->
                                    <div class="form-group">
                                        <label class="form-label">MALLA BLOCKER:</label>
                                        <input type="text" 
                                               id="mesh-blocker-${placement.id}"
                                               class="form-control placement-mesh-blocker"
                                               value="${placement.meshBlocker || defaultMeshBlocker}"
                                               oninput="window.PlacementsCore.updatePlacementParam(${placement.id}, 'meshBlocker', this.value)"
                                               title="Malla para Blocker">
                                    </div>
                                    
                                    <!-- Durómetro -->
                                    <div class="form-group">
                                        <label class="form-label">DURÓMETRO:</label>
                                        <input type="text" 
                                               id="durometer-${placement.id}"
                                               class="form-control placement-durometer"
                                               value="${placement.durometer || defaultDurometer}"
                                               oninput="window.PlacementsCore.updatePlacementParam(${placement.id}, 'durometer', this.value)"
                                               title="Durometer (dureza de la racleta)">
                                    </div>
                                    
                                    <!-- STROKES -->
                                    <div class="form-group">
                                        <label class="form-label">STROKES:</label>
                                        <input type="text" 
                                               id="strokes-${placement.id}"
                                               class="form-control placement-strokes"
                                               value="${placement.strokes || defaultStrokes}"
                                               oninput="window.PlacementsCore.updatePlacementParam(${placement.id}, 'strokes', this.value)"
                                               title="Número de strokes">
                                    </div>
                                    
                                    <!-- ANGLE -->
                                    <div class="form-group">
                                        <label class="form-label">ANGLE:</label>
                                        <input type="text" 
                                               id="angle-${placement.id}"
                                               class="form-control placement-angle"
                                               value="${placement.angle || defaultAngle}"
                                               oninput="window.PlacementsCore.updatePlacementParam(${placement.id}, 'angle', this.value)"
                                               title="Ángulo de la racleta">
                                    </div>
                                    
                                    <!-- PRESSURE -->
                                    <div class="form-group">
                                        <label class="form-label">PRESSURE:</label>
                                        <input type="text" 
                                               id="pressure-${placement.id}"
                                               class="form-control placement-pressure"
                                               value="${placement.pressure || defaultPressure}"
                                               oninput="window.PlacementsCore.updatePlacementParam(${placement.id}, 'pressure', this.value)"
                                               title="Presión de impresión">
                                    </div>
                                    
                                    <!-- SPEED -->
                                    <div class="form-group">
                                        <label class="form-label">SPEED:</label>
                                        <input type="text" 
                                               id="speed-${placement.id}"
                                               class="form-control placement-speed"
                                               value="${placement.speed || defaultSpeed}"
                                               oninput="window.PlacementsCore.updatePlacementParam(${placement.id}, 'speed', this.value)"
                                               title="Velocidad de impresión">
                                    </div>
                                    
                                    <!-- Aditivos -->
                                    <div class="form-group">
                                        <label class="form-label">ADITIVOS:</label>
                                        <input type="text" 
                                               id="additives-${placement.id}"
                                               class="form-control placement-additives"
                                               value="${placement.additives || defaultAdditives}"
                                               oninput="window.PlacementsCore.updatePlacementParam(${placement.id}, 'additives', this.value)"
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
                                    onchange="window.PlacementsCore.updatePlacementInkType(${placement.id}, this.value)">
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
                                    <button class="btn btn-danger btn-sm" onclick="addPlacementColorItem(${placement.id}, 'BLOCKER')">
                                        <i class="fas fa-plus"></i> Blocker
                                    </button>
                                    <button class="btn btn-white-base btn-sm" onclick="addPlacementColorItem(${placement.id}, 'WHITE_BASE')">
                                        <i class="fas fa-plus"></i> White Base
                                    </button>
                                    <button class="btn btn-primary btn-sm" onclick="addPlacementColorItem(${placement.id}, 'COLOR')">
                                        <i class="fas fa-plus"></i> Color
                                    </button>
                                    <button class="btn btn-warning btn-sm" onclick="addPlacementColorItem(${placement.id}, 'METALLIC')">
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
                                      oninput="updatePlacementField(${placement.id}, 'specialInstructions', this.value)">${placement.specialInstructions}</textarea>
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
        
        // Cargar imagen si existe
        if (placement.imageData) {
            const img = document.getElementById(`placement-image-preview-${placement.id}`);
            const imageActions = document.getElementById(`placement-image-actions-${placement.id}`);
            
            if (img && imageActions) {
                img.src = placement.imageData;
                img.style.display = 'block';
                imageActions.style.display = 'flex';
            }
        }
        
        console.log(`✅ Placement ${placement.id} renderizado correctamente`);
    }
    
    /**
     * Actualiza las pestañas de placements
     */
    function updatePlacementsTabs() {
        console.log('🔄 Actualizando pestañas de placements...');
        
        const tabsContainer = document.getElementById('placements-tabs');
        if (!tabsContainer) {
            console.error('❌ Contenedor de pestañas no encontrado');
            return;
        }
        
        tabsContainer.innerHTML = '';
        
        const placements = window.PlacementsCore ? window.PlacementsCore.getAllPlacements() : [];
        const currentId = window.PlacementsCore ? window.PlacementsCore.getCurrentPlacementId() : 1;
        
        placements.forEach(placement => {
            const displayType = placement.type.includes('CUSTOM:') 
                ? placement.type.replace('CUSTOM: ', '')
                : placement.type;
                
            const tab = document.createElement('div');
            tab.className = `placement-tab ${placement.id === currentId ? 'active' : ''}`;
            tab.setAttribute('data-placement-id', placement.id);
            tab.innerHTML = `
                <i class="fas fa-${window.PlacementsCore ? window.PlacementsCore.getPlacementIcon(placement.type) : 'map-marker-alt'}"></i>
                ${displayType.substring(0, 15)}${displayType.length > 15 ? '...' : ''}
                ${placements.length > 1 ? `<span class="remove-tab" onclick="window.PlacementsCore.removePlacement(${placement.id})">&times;</span>` : ''}
            `;
            
            tab.addEventListener('click', (e) => {
                if (!e.target.classList.contains('remove-tab')) {
                    showPlacement(placement.id);
                }
            });
            tabsContainer.appendChild(tab);
        });
        
        console.log(`✅ Pestañas actualizadas: ${placements.length} placements`);
    }
    
    /**
     * Muestra un placement específico
     * @param {number} placementId - ID del placement a mostrar
     */
    function showPlacement(placementId) {
        console.log(`📍 Mostrando placement: ${placementId}`);
        
        // Ocultar todos los placements
        document.querySelectorAll('.placement-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Mostrar el placement seleccionado
        const section = document.getElementById(`placement-section-${placementId}`);
        if (section) {
            section.classList.add('active');
        }
        
        // Actualizar pestañas activas
        document.querySelectorAll('.placement-tab').forEach(tab => {
            tab.classList.toggle('active', parseInt(tab.dataset.placementId) === placementId);
        });
        
        // Actualizar en el core
        if (window.PlacementsCore) {
            window.PlacementsCore.setCurrentPlacementId(placementId);
        }
        
        console.log(`✅ Placement ${placementId} mostrado`);
    }
    
    /**
     * Actualiza todos los títulos de un placement
     * @param {number} placementId - ID del placement
     */
    function updateAllPlacementTitles(placementId) {
        console.log(`✏️ Actualizando títulos del placement: ${placementId}`);
        
        const placement = window.PlacementsCore ? 
            window.PlacementsCore.getPlacementById(placementId) : null;
        
        if (!placement) return;
        
        const displayType = placement.type.includes('CUSTOM:') 
            ? placement.type.replace('CUSTOM: ', '')
            : placement.type;
        
        const section = document.getElementById(`placement-section-${placementId}`);
        if (!section) return;
        
        // 1. Actualizar título principal
        const title = section.querySelector('.placement-title span');
        if (title) {
            title.textContent = displayType;
        }
        
        // 2. Actualizar títulos de cards
        const cardTitles = section.querySelectorAll('.card-title');
        cardTitles.forEach(titleEl => {
            const text = titleEl.textContent;
            if (text.includes('Colores para')) {
                titleEl.textContent = `Colores para ${displayType}`;
            } else if (text.includes('Imagen para')) {
                titleEl.textContent = `Imagen para ${displayType}`;
            } else if (text.includes('Condiciones para')) {
                titleEl.textContent = `Condiciones para ${displayType}`;
            }
        });
        
        // 3. Título de secuencia
        const sequenceTitle = section.querySelector('h4');
        if (sequenceTitle && sequenceTitle.textContent.includes('Secuencia de')) {
            sequenceTitle.textContent = `Secuencia de ${displayType}`;
        }
        
        // 4. Actualizar pestaña
        updatePlacementsTabs();
        
        console.log(`✅ Títulos del placement ${placementId} actualizados: "${displayType}"`);
    }
    
    /**
     * Actualiza la UI de un placement
     * @param {number} placementId - ID del placement
     */
    function updatePlacementUI(placementId) {
        const placement = window.PlacementsCore ? 
            window.PlacementsCore.getPlacementById(placementId) : null;
        
        if (!placement) return;
        
        const displayType = placement.type.includes('CUSTOM:') 
            ? placement.type.replace('CUSTOM: ', '')
            : placement.type;
        
        // Actualizar pestaña
        const tab = document.querySelector(`.placement-tab[data-placement-id="${placementId}"]`);
        if (tab) {
            const icon = tab.querySelector('i').className;
            tab.innerHTML = `
                <i class="${icon}"></i>
                ${displayType.substring(0, 15)}${displayType.length > 15 ? '...' : ''}
                ${window.PlacementsCore && window.PlacementsCore.getTotalPlacements() > 1 ? 
                    `<span class="remove-tab" onclick="window.PlacementsCore.removePlacement(${placementId})">&times;</span>` : ''}
            `;
        }
        
        // Actualizar títulos
        updateAllPlacementTitles(placementId);
    }
    
    // ========== FUNCIONES DE IMÁGENES ==========
    
    /**
     * Abre el selector de imágenes para un placement
     * @param {number} placementId - ID del placement
     */
    function openImagePickerForPlacement(placementId) {
        console.log(`🖼️ Abriendo selector de imágenes para placement: ${placementId}`);
        
        // Actualizar placement actual
        if (window.PlacementsCore) {
            window.PlacementsCore.setCurrentPlacementId(placementId);
        }
        
        // Disparar click en input oculto
        const imageInput = document.getElementById('placementImageInput');
        if (imageInput) {
            imageInput.click();
        } else {
            console.error('❌ Input de imágenes no encontrado');
        }
    }
    
    /**
     * Elimina la imagen de un placement
     * @param {number} placementId - ID del placement
     */
    function removePlacementImage(placementId) {
        console.log(`🗑️ Eliminando imagen del placement: ${placementId}`);
        
        const placement = window.PlacementsCore ? 
            window.PlacementsCore.getPlacementById(placementId) : null;
        
        if (!placement) return;
        
        const img = document.getElementById(`placement-image-preview-${placementId}`);
        const imageActions = document.getElementById(`placement-image-actions-${placementId}`);
        
        if (img) {
            img.src = '';
            img.style.display = 'none';
        }
        
        if (imageActions) {
            imageActions.style.display = 'none';
        }
        
        placement.imageData = null;
        
        console.log(`✅ Imagen del placement ${placementId} eliminada`);
    }
    
    // ========== FUNCIONES AUXILIARES ==========
    
    /**
     * Limpia el contenedor de placements
     */
    function clearPlacementsContainer() {
        const container = document.getElementById('placements-container');
        if (container) {
            container.innerHTML = '';
            console.log('🧹 Contenedor de placements limpiado');
        }
    }
    
    /**
     * Renderiza todos los placements
     */
    function renderAllPlacements() {
        console.log('🎨 Renderizando todos los placements...');
        
        clearPlacementsContainer();
        
        const placements = window.PlacementsCore ? 
            window.PlacementsCore.getAllPlacements() : [];
        
        placements.forEach(placement => {
            renderPlacementHTML(placement);
        });
        
        updatePlacementsTabs();
        
        if (placements.length > 0) {
            const currentId = window.PlacementsCore ? 
                window.PlacementsCore.getCurrentPlacementId() : placements[0].id;
            showPlacement(currentId);
        }
        
        console.log(`✅ ${placements.length} placements renderizados`);
    }
    
    /**
     * Inicializa la UI de placements
     */
    function initializePlacementsUI() {
        console.log('🔄 Inicializando UI de placements...');
        
        // Verificar que el core esté disponible
        if (!window.PlacementsCore) {
            console.error('❌ PlacementsCore no disponible');
            return;
        }
        
        // Inicializar placements si no hay
        if (window.PlacementsCore.getTotalPlacements() === 0) {
            window.PlacementsCore.initializePlacements();
        }
        
        // Renderizar todo
        renderAllPlacements();
        
        console.log('✅ UI de placements inicializada');
    }
    
    // ========== EXPORTACIÓN PÚBLICA ==========
    return {
        // Funciones principales
        renderPlacementHTML,
        updatePlacementsTabs,
        showPlacement,
        updateAllPlacementTitles,
        updatePlacementUI,
        
        // Funciones de imágenes
        openImagePickerForPlacement,
        removePlacementImage,
        
        // Funciones auxiliares
        clearPlacementsContainer,
        renderAllPlacements,
        initializePlacementsUI
    };
})();

// ========== EXPORTACIÓN GLOBAL ==========
window.PlacementsUI = PlacementsUI;

// Exportar funciones individuales para compatibilidad
window.renderPlacementHTML = PlacementsUI.renderPlacementHTML;
window.updatePlacementsTabs = PlacementsUI.updatePlacementsTabs;
window.showPlacement = PlacementsUI.showPlacement;
window.updateAllPlacementTitles = PlacementsUI.updateAllPlacementTitles;
window.openImagePickerForPlacement = PlacementsUI.openImagePickerForPlacement;
window.removePlacementImage = PlacementsUI.removePlacementImage;

console.log('✅ Módulo PlacementsUI completamente cargado y exportado');
