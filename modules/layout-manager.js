/**
 * Layout Manager - Orquestador de renderizado
 * Gestiona la navegación entre tabs y el renderizado de componentes
 */

class LayoutManager {
  constructor(templates) {
    this.templates = templates || {};
    this.currentPlacementId = 1;
    this.placements = [];
    this.currentTab = 'dashboard';
    
    console.log('🚀 LayoutManager inicializado');
  }
  
  initialize() {
    // Inicializar variables globales
    window.placements = this.placements;
    window.currentPlacementId = this.currentPlacementId;
    
    // Configurar eventos
    this.setupEventListeners();
    this.initializePlacements();
    
    console.log('✅ LayoutManager configurado');
  }
  
  setupEventListeners() {
    console.log('🔗 Configurando event listeners...');
    
    // Configurar paste handler para imágenes
    document.addEventListener('paste', this.handlePaste.bind(this));
    
    // Configurar carga de archivos
    const excelFileInput = document.getElementById('excelFile');
    const placementImageInput = document.getElementById('placementImageInput');
    
    if (excelFileInput) {
      excelFileInput.addEventListener('change', this.handleFileUpload.bind(this));
    }
    
    if (placementImageInput) {
      placementImageInput.addEventListener('change', this.handlePlacementImageUpload.bind(this));
    }
    
    // Configurar theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', this.toggleTheme.bind(this));
    }
  }
  
  showTab(tabName) {
    console.log(`📌 Mostrando tab: ${tabName}`);
    
    // Actualizar navegación
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Activar tab seleccionado
    const tabElement = document.getElementById(tabName);
    if (tabElement) {
      tabElement.classList.add('active');
    }
    
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      if (tab.getAttribute('data-tab') === tabName) {
        tab.classList.add('active');
      }
    });
    
    this.currentTab = tabName;
    
    // Renderizar contenido del tab
    this.renderTabContent(tabName);
    
    // Ejecutar acciones específicas del tab
    switch(tabName) {
      case 'saved-specs':
        if (window.loadSavedSpecsList) {
          window.loadSavedSpecsList();
        }
        break;
      case 'dashboard':
        if (window.updateDashboard) {
          window.updateDashboard();
        }
        break;
      case 'error-log':
        if (window.loadErrorLog) {
          window.loadErrorLog();
        }
        break;
    }
  }
  
  renderTabContent(tabName) {
    console.log(`🎨 Renderizando contenido para: ${tabName}`);
    
    switch(tabName) {
      case 'dashboard':
        if (this.templates.renderDashboard) {
          this.templates.renderDashboard();
        } else if (window.renderDashboard) {
          window.renderDashboard();
        }
        break;
      case 'spec-creator':
        if (this.templates.renderSpecCreator) {
          this.templates.renderSpecCreator();
        } else if (window.renderSpecCreator) {
          window.renderSpecCreator();
        }
        break;
      case 'saved-specs':
        if (this.templates.renderSavedSpecs) {
          this.templates.renderSavedSpecs();
        } else if (window.renderSavedSpecs) {
          window.renderSavedSpecs();
        }
        break;
      case 'error-log':
        if (this.templates.renderErrorLog) {
          this.templates.renderErrorLog();
        } else if (window.renderErrorLog) {
          window.renderErrorLog();
        }
        break;
      default:
        console.warn(`❌ Tab no reconocido: ${tabName}`);
    }
  }
  
  // ========== FUNCIONES PARA PLACEMENTS ==========
  
  initializePlacements() {
    console.log('🔄 Inicializando placements...');
    
    if (this.placements.length === 0) {
      this.addNewPlacement('FRONT', true);
    }
    
    this.updatePlacementsTabs();
    this.showPlacement(1);
  }
  
  addNewPlacement(type = null, isFirst = false) {
    console.log(`➕ Agregando nuevo placement (type: ${type}, isFirst: ${isFirst})`);
    
    const placementId = isFirst ? 1 : Date.now();
    const placementType = type || this.getNextPlacementType();
    
    const preset = window.Utils ? window.Utils.getInkPreset('WATER') : {
      temp: '320 °F', 
      time: '1:40 min',
      blocker: { name: 'BLOCKER CHT', mesh1: '122/55', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
      white: { name: 'AQUAFLEX WHITE', mesh1: '198/40', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
      color: { mesh: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: '3 % cross-linker 500 · 1.5 % antitack' }
    };
    
    const newPlacement = {
      id: placementId,
      type: placementType,
      name: placementType,
      imageData: null,
      colors: [],
      placementDetails: '#.#" FROM COLLAR SEAM',
      dimensions: 'SIZE: (W) ##" X (H) ##"',
      temp: preset.temp,
      time: preset.time,
      specialties: '',
      specialInstructions: '',
      inkType: 'WATER',
      placementSelect: 'FRONT',
      isActive: true,
      meshColor: preset.color.mesh,
      meshWhite: preset.white.mesh1,
      meshBlocker: preset.blocker.mesh1,
      durometer: preset.color.durometer,
      strokes: preset.color.strokes,
      angle: preset.color.angle,
      pressure: preset.color.pressure,
      speed: preset.color.speed,
      additives: preset.color.additives,
      width: '',
      height: ''
    };
    
    if (!isFirst) {
      this.placements.push(newPlacement);
      window.placements = this.placements; // Sincronizar
    } else {
      this.placements = [newPlacement];
      window.placements = this.placements; // Sincronizar
    }
    
    if (!isFirst) {
      if (this.templates.renderPlacement) {
        this.templates.renderPlacement(newPlacement);
      } else if (window.renderPlacement) {
        window.renderPlacement(newPlacement);
      }
      this.showPlacement(placementId);
      this.updatePlacementsTabs();
    }
    
    console.log(`✅ Placement creado: ${placementType} (ID: ${placementId})`);
    return placementId;
  }
  
  getNextPlacementType() {
    const usedTypes = this.placements.map(p => p.type);
    const allTypes = ['FRONT', 'BACK', 'SLEEVE', 'CHEST', 'TV. NUMBERS', 'SHOULDER', 'COLLAR', 'CUSTOM'];
    
    for (const type of allTypes) {
      if (!usedTypes.includes(type)) {
        return type;
      }
    }
    return 'CUSTOM';
  }
  
  showPlacement(placementId) {
    console.log(`👁️ Mostrando placement: ${placementId}`);
    
    document.querySelectorAll('.placement-section').forEach(section => {
      section.classList.remove('active');
    });
    
    const section = document.getElementById(`placement-section-${placementId}`);
    if (section) {
      section.classList.add('active');
    }
    
    document.querySelectorAll('.placement-tab').forEach(tab => {
      const tabPlacementId = parseInt(tab.getAttribute('data-placement-id') || '0');
      tab.classList.toggle('active', tabPlacementId === placementId);
    });
    
    this.currentPlacementId = placementId;
    window.currentPlacementId = placementId;
  }
  
  updatePlacementsTabs() {
    const tabsContainer = document.getElementById('placements-tabs');
    if (!tabsContainer) {
      console.warn('❌ No se encontró el contenedor de tabs de placements');
      return;
    }
    
    tabsContainer.innerHTML = '';
    
    this.placements.forEach(placement => {
      const displayType = this.getPlacementDisplayName(placement);
      const icon = this.getPlacementIcon(placement.type);
      
      const tab = document.createElement('div');
      tab.className = `placement-tab ${placement.id === this.currentPlacementId ? 'active' : ''}`;
      tab.setAttribute('data-placement-id', placement.id);
      tab.innerHTML = `
        <i class="fas fa-${icon}"></i>
        ${displayType.substring(0, 15)}${displayType.length > 15 ? '...' : ''}
        ${this.placements.length > 1 ? `<span class="remove-tab" onclick="if(window.layoutManager) window.layoutManager.removePlacement(${placement.id})">&times;</span>` : ''}
      `;
      
      tab.addEventListener('click', (e) => {
        if (!e.target.classList.contains('remove-tab')) {
          this.showPlacement(placement.id);
        }
      });
      tabsContainer.appendChild(tab);
    });
  }
  
  getPlacementDisplayName(placement) {
    if (!placement) return 'N/A';
    
    if (placement.type && placement.type.includes('CUSTOM:')) {
      return placement.type.replace('CUSTOM: ', '');
    }
    
    return placement.type || placement.name || 'N/A';
  }
  
  getPlacementIcon(type) {
    if (!type) return 'map-marker-alt';
    
    const icons = {
      'FRONT': 'tshirt',
      'BACK': 'tshirt',
      'SLEEVE': 'hat-cowboy',
      'CHEST': 'heart',
      'TV. NUMBERS': 'hashtag',
      'SHOULDER': 'user',
      'COLLAR': 'circle',
      'CUSTOM': 'star'
    };
    
    if (type.includes('CUSTOM:')) {
      return 'star';
    }
    return icons[type] || 'map-marker-alt';
  }
  
  // ========== FUNCIONES DE GESTIÓN DE PLACEMENTS ==========
  
  removePlacement(placementId) {
    if (this.placements.length <= 1) {
      showStatus('❌ No puedes eliminar el último placement', 'error');
      return;
    }
    
    if (confirm('¿Estás seguro de que quieres eliminar este placement?')) {
      this.placements = this.placements.filter(p => p.id !== placementId);
      window.placements = this.placements; // Sincronizar
      
      // Eliminar del DOM
      const section = document.getElementById(`placement-section-${placementId}`);
      if (section) section.remove();
      
      // Actualizar tabs
      this.updatePlacementsTabs();
      
      // Mostrar el primer placement disponible
      if (this.placements.length > 0) {
        this.showPlacement(this.placements[0].id);
      }
      
      showStatus('🗑️ Placement eliminado');
    }
  }
  
  duplicatePlacement(placementId) {
    const original = this.placements.find(p => p.id === placementId);
    if (!original) {
      console.error(`❌ No se encontró placement con ID: ${placementId}`);
      return;
    }

    const newId = Date.now();
    const displayType = this.getPlacementDisplayName(original);

    // Crear copia
    const duplicate = JSON.parse(JSON.stringify(original));
    duplicate.id = newId;
    duplicate.name = displayType;

    if (!duplicate.specialties) duplicate.specialties = '';

    this.placements.push(duplicate);
    window.placements = this.placements; // Sincronizar

    // Renderizar
    if (this.templates.renderPlacement) {
      this.templates.renderPlacement(duplicate);
    } else if (window.renderPlacement) {
      window.renderPlacement(duplicate);
    }
    
    this.updatePlacementsTabs();
    this.showPlacement(newId);

    showStatus('✅ Placement duplicado correctamente');

    return newId;
  }
  
  updatePlacementType(placementId, type) {
    const placement = this.placements.find(p => p.id === parseInt(placementId));
    if (!placement) {
      console.error(`❌ No se encontró placement con ID: ${placementId}`);
      return;
    }
    
    const customInput = document.getElementById(`custom-placement-input-${placementId}`);
    
    if (type === 'CUSTOM') {
      if (customInput) customInput.style.display = 'block';
      if (!placement.type.startsWith('CUSTOM:')) {
        placement.type = 'CUSTOM:';
        placement.name = '';
      }
    } else {
      if (customInput) customInput.style.display = 'none';
      placement.type = type;
      placement.name = type;
      
      if (placement.type.startsWith('CUSTOM:')) {
        placement.type = type;
        placement.name = type;
        
        // Limpiar el input si existe
        const customNameInput = document.querySelector(`.custom-placement-name[data-placement-id="${placementId}"]`);
        if (customNameInput) {
          customNameInput.value = '';
        }
      }
    }
    
    // Actualizar todos los títulos
    setTimeout(() => {
      if (window.updateAllPlacementTitles) {
        window.updateAllPlacementTitles(placementId);
      }
    }, 100);
    
    // Actualizar las pestañas
    this.updatePlacementsTabs();
    
    showStatus(`✅ Tipo de placement cambiado a ${type}`);
  }
  
  updateCustomPlacement(placementId, customName) {
    const placement = this.placements.find(p => p.id === parseInt(placementId));
    if (!placement) {
      console.error(`❌ No se encontró placement con ID: ${placementId}`);
      return;
    }
    
    if (customName && customName.trim()) {
      const trimmedName = customName.trim();
      placement.type = `CUSTOM: ${trimmedName}`;
      placement.name = trimmedName;
      
      // Actualizar el select para que muestre CUSTOM
      const typeSelect = document.querySelector(`.placement-type-select[data-placement-id="${placementId}"]`);
      if (typeSelect) {
        typeSelect.value = 'CUSTOM';
      }
      
      // Actualizar todos los títulos
      if (window.updateAllPlacementTitles) {
        window.updateAllPlacementTitles(placementId);
      }
      
      // Actualizar las pestañas
      this.updatePlacementsTabs();
      
      showStatus(`✅ Placement personalizado: ${trimmedName}`);
    } else {
      placement.type = 'CUSTOM';
      placement.name = '';
      if (window.updateAllPlacementTitles) {
        window.updateAllPlacementTitles(placementId);
      }
    }
  }
  
  // ========== FUNCIONES DE IMÁGENES ==========
  
  openImagePickerForPlacement(placementId) {
    this.currentPlacementId = placementId;
    const input = document.getElementById('placementImageInput');
    if (input) {
      input.click();
    } else {
      console.error('❌ No se encontró el input de imágenes de placement');
    }
  }
  
  handlePlacementImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const placementId = this.currentPlacementId;
    const placement = this.placements.find(p => p.id === placementId);
    if (!placement) {
      console.error(`❌ No se encontró placement con ID: ${placementId}`);
      return;
    }
    
    if (!file.type.match('image.*')) {
      showStatus('❌ Por favor, selecciona un archivo de imagen válido', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = document.getElementById(`placement-image-preview-${placementId}`);
      const imageActions = document.getElementById(`placement-image-actions-${placementId}`);
      
      if (img) {
        img.src = ev.target.result;
        img.style.display = 'block';
      }
      
      if (imageActions) {
        imageActions.style.display = 'flex';
      }
      
      placement.imageData = ev.target.result;
      showStatus(`✅ Imagen cargada para ${placement.type}`);
    };
    reader.readAsDataURL(file);
    
    e.target.value = '';
  }
  
  removePlacementImage(placementId) {
    const placement = this.placements.find(p => p.id === placementId);
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
    showStatus('🗑️ Imagen eliminada del placement');
  }
  
  // ========== FUNCIONES PARA COLORS DE PLACEMENTS ==========
  
  addPlacementColorItem(placementId, type) {
    const placement = this.placements.find(p => p.id === placementId);
    if (!placement) return;
    
    let initialLetter = '';
    let initialVal = '';
    
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
    placement.colors.push({
      id: colorId,
      type: type,
      screenLetter: initialLetter,
      val: initialVal
    });
    
    if (window.renderPlacementColors) {
      window.renderPlacementColors(placementId);
    }
    
    if (window.updatePlacementStations) {
      window.updatePlacementStations(placementId);
    }
    
    if (window.updatePlacementColorsPreview) {
      window.updatePlacementColorsPreview(placementId);
    }
  }
  
  removePlacementColorItem(placementId, colorId) {
    const placement = this.placements.find(p => p.id === placementId);
    if (!placement) return;
    
    placement.colors = placement.colors.filter(c => c.id !== colorId);
    
    if (window.renderPlacementColors) {
      window.renderPlacementColors(placementId);
    }
    
    if (window.updatePlacementStations) {
      window.updatePlacementStations(placementId);
    }
    
    if (window.updatePlacementColorsPreview) {
      window.updatePlacementColorsPreview(placementId);
    }
  }
  
  updatePlacementColorValue(placementId, colorId, value) {
    const placement = this.placements.find(p => p.id === placementId);
    if (!placement) return;
    
    const color = placement.colors.find(c => c.id === colorId);
    if (color) {
      color.val = value;
      
      if (window.updatePlacementStations) {
        window.updatePlacementStations(placementId);
      }
      
      if (window.updatePlacementColorsPreview) {
        window.updatePlacementColorsPreview(placementId);
      }
    }
  }
  
  updatePlacementScreenLetter(placementId, colorId, value) {
    const placement = this.placements.find(p => p.id === placementId);
    if (!placement) return;
    
    const color = placement.colors.find(c => c.id === colorId);
    if (color) {
      color.screenLetter = value.toUpperCase();
      
      if (window.updatePlacementStations) {
        window.updatePlacementStations(placementId);
      }
    }
  }
  
  // ========== FUNCIONES DE ACTUALIZACIÓN ==========
  
  updatePlacementField(placementId, field, value) {
    const placement = this.placements.find(p => p.id === placementId);
    if (placement) {
      if (field === 'specialties') {
        let specialties = value.toUpperCase();
        
        if (specialties.includes('HD') && !specialties.includes('HIGH DENSITY')) {
          specialties = specialties.replace(/\bHD\b/g, 'HIGH DENSITY');
        }
        
        placement[field] = specialties;
        
        const specialtiesField = document.getElementById(`specialties-${placementId}`);
        if (specialtiesField && specialtiesField.value !== specialties) {
          specialtiesField.value = specialties;
        }
      } else {
        placement[field] = value;
      }
    }
  }
  
  updatePlacementDimension(placementId, type, value) {
    const placement = this.placements.find(p => p.id === placementId);
    if (placement) {
      const wField = document.getElementById(`dimension-w-${placementId}`);
      const hField = document.getElementById(`dimension-h-${placementId}`);
      
      const width = type === 'width' ? value : (wField ? wField.value : '');
      const height = type === 'height' ? value : (hField ? hField.value : '');
      
      // Guardar valores separados
      placement.width = width;
      placement.height = height;
      
      // Actualizar el campo de dimensiones combinado
      placement.dimensions = `SIZE: (W) ${width || '##'}" X (H) ${height || '##'}"`;
      
      showStatus(`✅ Dimensión ${type === 'width' ? 'ancho' : 'alto'} actualizada`);
    }
  }
  
  updatePlacementParam(placementId, param, value) {
    const placement = this.placements.find(p => p.id === placementId);
    if (placement) {
      placement[param] = value;
      
      if (window.updatePlacementStations) {
        window.updatePlacementStations(placementId);
      }
      
      showStatus(`✅ ${param} actualizado`);
    }
  }
  
  updatePlacementInkType(placementId, inkType) {
    const placement = this.placements.find(p => p.id === placementId);
    if (!placement) return;
    
    placement.inkType = inkType;
    
    // Obtener valores de la configuración
    const preset = window.Utils ? window.Utils.getInkPreset(inkType) : 
      (inkType === 'PLASTISOL' ? 
        { temp: '320 °F', time: '1:00 min', color: { mesh: '156/64', durometer: '65', speed: '35', angle: '15', strokes: '1', pressure: '40' } } : 
        { temp: '320 °F', time: '1:40 min', color: { mesh: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40' } }
      );
    
    // Actualizar en el objeto placement
    placement.temp = preset.temp;
    placement.time = preset.time;
    
    // Actualizar en la UI
    const tempField = document.getElementById(`temp-${placementId}`);
    const timeField = document.getElementById(`time-${placementId}`);
    
    if (tempField) {
      tempField.value = preset.temp;
      tempField.setAttribute('readonly', true);
      tempField.title = `Temperatura para tinta ${inkType}`;
    }
    
    if (timeField) {
      timeField.value = preset.time;
      timeField.setAttribute('readonly', true);
      timeField.title = `Tiempo de curado para tinta ${inkType}`;
    }
    
    // Actualizar estaciones y mostrar mensaje
    if (window.updatePlacementStations) {
      window.updatePlacementStations(placementId);
    }
    
    showStatus(`✅ Tinta: ${inkType} - Temp: ${preset.temp}, Tiempo: ${preset.time}`);
  }
  
  // ========== FUNCIONES DE ARCHIVOS ==========
  
  handlePaste(e) {
    const activePlacement = document.querySelector('.placement-section.active');
    if (!activePlacement) return;
    
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        
        reader.onload = (event) => {
          const placementId = activePlacement.dataset.placementId;
          const placement = this.placements.find(p => p.id === parseInt(placementId));
          
          if (placement) {
            placement.imageData = event.target.result;
            
            const img = document.getElementById(`placement-image-preview-${placementId}`);
            const imageActions = document.getElementById(`placement-image-actions-${placementId}`);
            
            if (img && imageActions) {
              img.src = event.target.result;
              img.style.display = 'block';
              imageActions.style.display = 'flex';
            }
            
            showStatus(`✅ Imagen pegada en ${placement.type}`);
          }
        };
        
        reader.readAsDataURL(blob);
        e.preventDefault();
        break;
      }
    }
  }
  
  handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    if (file.name.toLowerCase().endsWith('.zip')) {
      this.loadProjectZip(file);
    } else if (file.name.toLowerCase().endsWith('.json')) {
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          this.loadSpecData(data);
          showStatus('✅ JSON cargado correctamente', 'success');
        } catch (err) {
          console.error('Error al cargar JSON:', err);
          showStatus('❌ Error leyendo el archivo JSON', 'error');
        }
      };
      reader.readAsText(file);
    } else {
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const sheetPriority = ['SWO', 'PPS', 'Proto 1', 'Proto 2', 'Proto 3', 'Proto 4', 'Sheet1'];
          let worksheet = null;
          let sheetUsed = '';
          
          for (const sheetName of sheetPriority) {
            if (workbook.SheetNames.includes(sheetName)) {
              worksheet = workbook.Sheets[sheetName];
              sheetUsed = sheetName;
              break;
            }
          }
          
          if (!worksheet) {
            worksheet = workbook.Sheets[workbook.SheetNames[0]];
            sheetUsed = workbook.SheetNames[0];
          }

          showStatus(`🔍 Procesando archivo: ${sheetUsed}`, 'warning');
          this.processExcelData(worksheet, sheetUsed);
          
        } catch (err) { 
          console.error('Error al cargar SWO:', err); 
          showStatus('❌ Error leyendo el archivo', 'error'); 
        }
      };
      reader.readAsArrayBuffer(file);
    }
    
    e.target.value = '';
  }
  
  processExcelData(worksheet, sheetName = '') {
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
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
            // Detectar equipo automáticamente
            extracted.team = this.detectTeamFromStyle(val);
            console.log('Equipo detectado:', extracted.team);
            
            // Detectar género automáticamente
            extracted.gender = this.extractGenderFromStyle(val);
            console.log('Género detectado:', extracted.gender);
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
          else if (label.includes('TEAM:')) {
            // Si ya hay equipo detectado, mantenerlo, si no, usar este
            if (!extracted.team) extracted.team = val;
          }
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
            extracted.team = this.detectTeamFromStyle(extracted.style);
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
            if (!extracted.team) {
              extracted.team = String(row[j + 1] || '').trim();
            }
          } else if (cell.includes('GENDER:')) {
            extracted.gender = String(row[j + 1] || '').trim();
          }
        }
      }
    }

    // Establecer valores en el formulario
    if (extracted.customer) document.getElementById('customer').value = extracted.customer;
    if (extracted.style) document.getElementById('style').value = extracted.style;
    if (extracted.colorway) document.getElementById('colorway').value = extracted.colorway;
    if (extracted.season) document.getElementById('season').value = extracted.season;
    if (extracted.pattern) document.getElementById('pattern').value = extracted.pattern;
    if (extracted.po) document.getElementById('po').value = extracted.po;
    if (extracted.sample) document.getElementById('sample-type').value = extracted.sample;
    
    // Establecer equipo y género
    if (extracted.team) {
      document.getElementById('name-team').value = extracted.team;
    }
    if (extracted.gender) {
      document.getElementById('gender').value = extracted.gender;
    }

    if (window.updateClientLogo) {
      window.updateClientLogo();
    }
    
    const teamMessage = extracted.team ? `Equipo: ${extracted.team}` : 'Equipo: No detectado';
    const genderMessage = extracted.gender ? `Género: ${extracted.gender}` : 'Género: No detectado';
    
    showStatus(`✅ "${sheetName || 'hoja'}" procesado - ${teamMessage} - ${genderMessage}`, 'success');
  }
  
  detectTeamFromStyle(style) {
    if (!style) return '';
    
    try {
      // Usar Utils si está disponible
      if (window.Utils && window.Utils.detectTeamFromStyle) {
        return window.Utils.detectTeamFromStyle(style);
      }
      
      // Fallback: búsqueda manual
      const styleStr = style.toString().toUpperCase().trim();
      
      // 1. Buscar en Gear for Sport
      if (window.Config && window.Config.GEARFORSPORT_TEAM_MAP) {
        for (const [code, teamName] of Object.entries(window.Config.GEARFORSPORT_TEAM_MAP)) {
          if (styleStr.includes(code)) {
            return teamName;
          }
        }
      }
      
      // 2. Buscar en el mapa general
      if (window.Config && window.Config.TEAM_CODE_MAP) {
        const teamMap = window.Config.TEAM_CODE_MAP;
        for (const [code, teamName] of Object.entries(teamMap)) {
          if (styleStr.includes(code)) {
            return teamName;
          }
        }
      }
      
    } catch (error) {
      console.warn('Error en detectTeamFromStyle:', error);
    }
    
    return '';
  }
  
  extractGenderFromStyle(style) {
    if (!style) return '';
    
    try {
      // Usar Utils si está disponible
      if (window.Utils && window.Utils.extractGenderFromStyle) {
        return window.Utils.extractGenderFromStyle(style);
      }
      
      // Fallback: búsqueda manual
      const styleStr = style.toString().toUpperCase().trim();
      
      // Detectar formato Gear for Sport
      const gearForSportMatch = styleStr.match(/U([MWYBGKTIAN])\d+/);
      if (gearForSportMatch && gearForSportMatch[1]) {
        const genderCode = gearForSportMatch[1];
        
        if (window.Config && window.Config.GEARFORSPORT_GENDER_MAP) {
          const fullCode = `U${genderCode}`;
          if (window.Config.GEARFORSPORT_GENDER_MAP[fullCode]) {
            return window.Config.GEARFORSPORT_GENDER_MAP[fullCode];
          }
          if (window.Config.GEARFORSPORT_GENDER_MAP[genderCode]) {
            return window.Config.GEARFORSPORT_GENDER_MAP[genderCode];
          }
        }
      }
      
    } catch (error) {
      console.warn('Error en extractGenderFromStyle:', error);
    }
    
    return '';
  }
  
  // ========== FUNCIONES DE GUARDADO Y CARGA ==========
  
  saveCurrentSpec() {
    try {
      const data = this.collectData();
      const style = data.style || 'SinEstilo_' + Date.now();
      const storageKey = `spec_${style}_${Date.now()}`;
      
      this.placements.forEach(placement => {
        const specialtiesField = document.getElementById(`specialties-${placement.id}`);
        if (specialtiesField) {
          placement.specialties = specialtiesField.value;
        }
        
        const instructionsField = document.getElementById(`special-instructions-${placement.id}`);
        if (instructionsField) {
          placement.specialInstructions = instructionsField.value;
        }
      });
      
      data.savedAt = new Date().toISOString();
      data.lastModified = new Date().toISOString();
      
      localStorage.setItem(storageKey, JSON.stringify(data));
      
      if (window.updateDashboard) {
        window.updateDashboard();
      }
      
      if (window.loadSavedSpecsList) {
        window.loadSavedSpecsList();
      }
      
      showStatus('✅ Spec guardada correctamente', 'success');
      
      setTimeout(() => {
        if (confirm('¿Deseas ver todas las specs guardadas?')) {
          this.showTab('saved-specs');
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error al guardar:', error);
      showStatus('❌ Error al guardar: ' + error.message, 'error');
    }
  }
  
  collectData() {
    const generalData = {
      customer: document.getElementById('customer').value,
      style: document.getElementById('style').value,
      folder: document.getElementById('folder-num').value,
      colorway: document.getElementById('colorway').value,
      season: document.getElementById('season').value,
      pattern: document.getElementById('pattern').value,
      po: document.getElementById('po').value,
      sampleType: document.getElementById('sample-type').value,
      nameTeam: document.getElementById('name-team').value,
      gender: document.getElementById('gender').value,
      designer: document.getElementById('designer').value,
      savedAt: new Date().toISOString()
    };
    
    const placementsData = this.placements.map(placement => ({
      id: placement.id,
      type: placement.type,
      name: placement.name,
      imageData: placement.imageData,
      colors: placement.colors.map(c => ({
        id: c.id,
        type: c.type,
        val: c.val,
        screenLetter: c.screenLetter
      })),
      placementDetails: placement.placementDetails,
      dimensions: placement.dimensions,
      width: placement.width,
      height: placement.height,
      temp: placement.temp,
      time: placement.time,
      specialties: placement.specialties,
      specialInstructions: placement.specialInstructions,
      inkType: placement.inkType,
      placementSelect: placement.placementSelect,
      // Parámetros de impresión
      meshColor: placement.meshColor,
      meshWhite: placement.meshWhite,
      meshBlocker: placement.meshBlocker,
      durometer: placement.durometer,
      strokes: placement.strokes,
      angle: placement.angle,
      pressure: placement.pressure,
      speed: placement.speed,
      additives: placement.additives
    }));
    
    return {
      ...generalData,
      placements: placementsData
    };
  }
  
  loadSpecData(data) {
    document.getElementById('customer').value = data.customer || '';
    document.getElementById('style').value = data.style || '';
    document.getElementById('folder-num').value = data.folder || ''; 
    document.getElementById('colorway').value = data.colorway || '';
    document.getElementById('season').value = data.season || '';
    document.getElementById('pattern').value = data.pattern || '';
    document.getElementById('po').value = data.po || '';
    document.getElementById('sample-type').value = data.sampleType || '';
    document.getElementById('name-team').value = data.nameTeam || '';
    document.getElementById('gender').value = data.gender || '';
    document.getElementById('designer').value = data.designer || '';
    
    const placementsContainer = document.getElementById('placements-container');
    if (placementsContainer) placementsContainer.innerHTML = '';
    
    this.placements = [];
    window.placements = this.placements;
    
    if (data.placements && Array.isArray(data.placements)) {
      data.placements.forEach((placementData, index) => {
        const placementId = index === 0 ? 1 : Date.now() + index;
        const placement = {
          ...placementData,
          id: placementId
        };
        
        if (index === 0) {
          this.placements = [placement];
          window.placements = this.placements;
        } else {
          this.placements.push(placement);
          window.placements = this.placements;
        }
        
        if (this.templates.renderPlacement) {
          this.templates.renderPlacement(placement);
        } else if (window.renderPlacement) {
          window.renderPlacement(placement);
        }
        
        if (placement.imageData) {
          const img = document.getElementById(`placement-image-preview-${placementId}`);
          const imageActions = document.getElementById(`placement-image-actions-${placementId}`);
          
          if (img && imageActions) {
            img.src = placement.imageData;
            img.style.display = 'block';
            imageActions.style.display = 'flex';
          }
        }
        
        if (window.renderPlacementColors) {
          window.renderPlacementColors(placementId);
        }
        
        if (window.updatePlacementStations) {
          window.updatePlacementStations(placementId);
        }
        
        if (window.updatePlacementColorsPreview) {
          window.updatePlacementColorsPreview(placementId);
        }
      });
    } else {
      this.initializePlacements();
    }
    
    this.updatePlacementsTabs();
    this.showPlacement(1);
    
    if (window.updateClientLogo) {
      window.updateClientLogo();
    }
    
    this.showTab('spec-creator');
    showStatus('📂 Spec cargada correctamente');
  }
  
  async loadProjectZip(file) {
    try {
      showStatus('📦 Cargando proyecto ZIP...', 'warning');
      
      const zip = new JSZip();
      const zipData = await zip.loadAsync(file);
      
      let jsonData = null;
      const imageFiles = [];
      
      for (const [filename, zipEntry] of Object.entries(zipData.files)) {
        if (!zipEntry.dir) {
          if (filename.endsWith('.json')) {
            const jsonContent = await zipEntry.async('text');
            jsonData = JSON.parse(jsonContent);
          } else if (filename.match(/\.(jpg|jpeg|png|gif)$/i)) {
            const imageBlob = await zipEntry.async('blob');
            const imageData = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target.result);
              reader.readAsDataURL(imageBlob);
            });
            imageFiles.push({ filename, imageData });
          }
        }
      }
      
      if (jsonData) {
        this.loadSpecData(jsonData);
        
        imageFiles.forEach((imageFile, index) => {
          const placementIndex = parseInt(imageFile.filename.match(/placement(\d+)/)?.[1]) - 1;
          if (placementIndex >= 0 && this.placements[placementIndex]) {
            this.placements[placementIndex].imageData = imageFile.imageData;
            
            const img = document.getElementById(`placement-image-preview-${this.placements[placementIndex].id}`);
            const imageActions = document.getElementById(`placement-image-actions-${this.placements[placementIndex].id}`);
            
            if (img && imageActions) {
              img.src = imageFile.imageData;
              img.style.display = 'block';
              imageActions.style.display = 'flex';
            }
          }
        });
        
        showStatus('✅ Proyecto ZIP cargado correctamente');
        this.showTab('spec-creator');
      } else {
        throw new Error('No se encontró archivo JSON en el ZIP');
      }
      
    } catch (error) {
      console.error('Error al cargar ZIP:', error);
      showStatus('❌ Error al cargar proyecto ZIP: ' + error.message, 'error');
    }
  }
  
  // ========== FUNCIONES DE TEMA ==========
  
  toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    
    if (body.classList.contains('light-mode')) {
      body.classList.remove('light-mode');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
      showStatus('🌙 Modo oscuro activado');
      localStorage.setItem('tegraspec-theme', 'dark');
    } else {
      body.classList.add('light-mode');
      themeToggle.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
      showStatus('☀️ Modo claro activado');
      localStorage.setItem('tegraspec-theme', 'light');
    }
  }
  
  loadThemePreference() {
    const savedTheme = localStorage.getItem('tegraspec-theme');
    const themeToggle = document.getElementById('themeToggle');
    
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
      themeToggle.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
    } else {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
    }
  }
}

// Hacer disponible globalmente
window.LayoutManager = LayoutManager;
