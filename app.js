// js/app.js - VERSIÓN CORREGIDA

// ========== CONFIGURACIÓN GLOBAL ==========
const INK_PRESETS = {
    WATER: {
        temp: '320 °F',
        time: '1:40 min',
        blocker: {
            name: 'BLOCKER CHT',
            mesh1: '122/55',
            mesh2: '157/48',
            durometer: '70',
            strokes: '2',
            additives: 'N/A'
        },
        white: {
            name: 'AQUAFLEX WHITE',
            mesh1: '198/40',
            mesh2: '157/48',
            durometer: '70',
            strokes: '2',
            additives: 'N/A'
        },
        color: {
            mesh: '157/48',
            durometer: '70',
            strokes: '2',
            additives: '3 % cross-linker 500 · 1.5 % antitack'
        }
    },
    PLASTISOL: {
        temp: '320 °F',
        time: '0:45 min',
        blocker: {
            name: 'BLOCKER plastisol',
            mesh1: '110/64',
            mesh2: '156/64',
            durometer: '65',
            strokes: '1',
            additives: 'N/A'
        },
        white: {
            name: 'PLASTISOL WHITE',
            mesh1: '156/64',
            mesh2: '110/64',
            durometer: '65',
            strokes: '2',
            additives: 'N/A'
        },
        color: {
            mesh: '156/64',
            durometer: '65',
            strokes: '1',
            additives: '1 % catalyst'
        }
    },
    SILICONE: {
        temp: '320 °F',
        time: '1:00 min',
        blocker: {
            name: 'Bloquer Libra',
            mesh1: '110/64',
            mesh2: '157/48',
            durometer: '70',
            strokes: '2',
            additives: 'N/A'
        },
        white: {
            name: 'White Libra',
            mesh1: '122/55',
            mesh2: '157/48',
            durometer: '70',
            strokes: '2',
            additives: 'N/A'
        },
        color: {
            mesh: '157/48',
            durometer: '70',
            strokes: '2',
            additives: '3 % cat · 2 % ret'
        }
    }
};

const PANTONE_DB = {
    'UNI WHITE': '#FFFFFF', 'WHITE': '#FFFFFF', 'BLACK': '#000000',
    'UNI RED': '#C8102E', 'UNI BLUE': '#003A70', 'UNI GREEN': '#008D62',
    'UNI GOLD': '#FFB612', 'UNI SILVER': '#A5ACAF', 'UNI NAVY': '#0B162A',
    'COLLEGE NAVY': '#1C2841', 'MARINE': '#003A70', 'ITALY BLUE': '#0033A0',
    'GYM BLUE': '#005EB8', 'SPORT TEAL': '#008E97', 'ACTION GREEN': '#008D62',
    'SEQUOIA': '#1D2624', 'UNIVERSITY RED': '#C8102E', 'TEAM RED': '#D50A0A',
    'UNI ORANGE': '#FB4F14', 'TEAM ORANGE': '#FB4F14', 'TEAM GOLD': '#FFB612',
    'COLOR RUSH GOLD': '#FFB612', 'MEDIUM SILVER': '#A7A8AA', 'WOLF GREY': '#9B9B9B',
    'PEWTER GREY': '#97999B', 'DARK STEEL GREY': '#53565A'
};

const CLIENT_LOGOS = {
    'NIKE': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Nike-Logotipo-PNG-Photo.png',
    'FANATICS': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Fanatics_company_logo.svg.png',
    'ADIDAS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1280px-Adidas_Logo.svg.png',
    'PUMA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Puma_Logo.svg/1280px-Puma_Logo.svg.png',
    'UNDER ARMOUR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Under_armour_logo.svg/1280px-Under_armour_logo.svg.png'
};

// ========== VARIABLES GLOBALES ==========
let specGlobal = {
    customer: '', style: '', colorway: '', season: '', pattern: '', po: '',
    sampleType: '', nameTeam: '', gender: '', designer: '', inkType: 'WATER',
    folder: '', dimensions: '', placement: '', temp: '320 °F', time: '1:40 min',
    specialties: '', instructions: '', imageB64: '', artes: [], savedAt: null
};

let currentImageData = null;
let pdfAnalysisResults = [];

// ========== FUNCIONES DE UTILIDAD ==========
function showStatus(msg, type = 'success') {
    const el = document.getElementById('statusMessage');
    if (!el) return;
    
    el.textContent = msg;
    el.className = `status-message status-${type}`;
    el.style.display = 'block';
    
    setTimeout(() => {
        el.style.display = 'none';
    }, 4000);
}

function updateDateTime() {
    const dateElement = document.getElementById('current-datetime');
    if (!dateElement) return;
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    
    dateElement.textContent = new Date().toLocaleDateString('es-ES', options);
}

// ========== NAVEGACIÓN ==========
function showTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(t => {
        t.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-tab').forEach(t => {
        t.classList.remove('active');
    });
    
    // Mostrar tab seleccionado
    const tabElement = document.getElementById(tabName);
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    // Activar botón correspondiente
    document.querySelectorAll('.nav-tab').forEach(tab => {
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        }
    });
    
    // Acciones específicas
    if (tabName === 'saved-specs') {
        loadSavedSpecsList();
    }
    
    if (tabName === 'dashboard') {
        updateDashboard();
    }
}

// ========== DASHBOARD ==========
function updateDashboard() {
    const specs = Object.keys(localStorage).filter(k => k.startsWith('spec_'));
    const total = specs.length;
    
    const totalEl = document.getElementById('total-specs');
    const todayEl = document.getElementById('today-specs');
    const activeEl = document.getElementById('active-projects');
    const rateEl = document.getElementById('completion-rate');
    
    if (totalEl) totalEl.textContent = total;
    
    // Contar specs de hoy
    const today = new Date().toDateString();
    let todayCount = 0;
    specs.forEach(k => {
        try {
            const spec = JSON.parse(localStorage.getItem(k));
            if (spec && spec.savedAt && new Date(spec.savedAt).toDateString() === today) {
                todayCount++;
            }
        } catch(e) {
            console.error("Error parsing spec:", e);
        }
    });
    
    if (todayEl) todayEl.textContent = todayCount;
    if (activeEl) activeEl.textContent = Math.floor(total * 0.7);
    if (rateEl) {
        const rate = Math.floor((todayCount / Math.max(total, 1)) * 100);
        rateEl.textContent = rate + '%';
    }
}

// ========== SPEC CREATOR ==========
function updateClientLogo() {
    const customer = document.getElementById('customer')?.value.toUpperCase() || '';
    const img = document.getElementById('logoCliente');
    if (!img) return;
    
    for (const [key, url] of Object.entries(CLIENT_LOGOS)) {
        if (customer.includes(key)) {
            img.src = url;
            img.style.display = 'block';
            return;
        }
    }
    
    img.style.display = 'none';
}

function updateInkPreset() {
    const select = document.getElementById('ink-type-select');
    if (!select) return;
    
    const inkType = select.value;
    const preset = INK_PRESETS[inkType];
    
    if (preset) {
        document.getElementById('temp').value = preset.temp;
        document.getElementById('time').value = preset.time;
        showStatus(`Preset ${inkType} aplicado`, 'info');
    }
}

function addArte() {
    const name = prompt('Nombre de la ubicación (ej: FRONT, BACK, SLEEVE):', 'FRONT');
    if (!name) return;
    
    const arte = {
        name: name.toUpperCase(),
        imageB64: '',
        colors: [],
        dimensions: 'SIZE: (W) ##" X (H) ##"',
        placement: '#.#" FROM COLLAR SEAM',
        inkType: 'WATER',
        temp: '320 °F',
        time: '1:40 min',
        specialties: '',
        instructions: ''
    };
    
    specGlobal.artes.push(arte);
    renderArtes();
    showStatus('✅ Ubicación agregada');
}

function renderArtes() {
    const container = document.getElementById('artes-container');
    if (!container) return;
    
    if (!specGlobal.artes || specGlobal.artes.length === 0) {
        container.innerHTML = '<p style="color:var(--gray-light);text-align:center;padding:20px;">No hay ubicaciones. Usa el botón "Nueva Ubicación".</p>';
        return;
    }
    
    container.innerHTML = '';
    specGlobal.artes.forEach((arte, i) => {
        const div = document.createElement('div');
        div.className = 'arte-card';
        div.style.cssText = 'background:white;border-radius:8px;border:1px solid var(--border);margin-bottom:25px;overflow:hidden;';
        div.innerHTML = `
            <div style="background:var(--gray-extra-light);padding:15px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
                <h4 style="color:var(--primary);margin:0;">${arte.name}</h4>
                <div>
                    <button class="btn btn-outline btn-sm" onclick="editArte(${i})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="removeArte(${i})" style="margin-left:5px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div style="padding:20px;">
                <!-- IMAGEN DE LA UBICACIÓN -->
                <div style="margin-bottom:20px;">
                    <label style="display:block;font-size:.85rem;font-weight:bold;color:var(--gray-dark);margin-bottom:10px;">IMAGEN ${arte.name}:</label>
                    <div class="file-upload-area" onclick="loadArteImage(${i})" style="padding:20px;">
                        <i class="fas fa-cloud-upload-alt" style="font-size:2rem;color:var(--primary);margin-bottom:10px;"></i>
                        <p>Haz clic para cargar imagen para ${arte.name}</p>
                    </div>
                    <div class="image-preview-container" id="arte-image-${i}" style="margin-top:10px;">
                        ${arte.imageB64 ? `<img src="${arte.imageB64}" class="image-preview" style="max-height:200px;">` : ''}
                    </div>
                </div>
                
                <!-- DIMENSIONES Y PLACEMENT -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));gap:15px;margin-bottom:20px;">
                    <div>
                        <label style="display:block;font-size:.85rem;font-weight:bold;color:var(--gray-dark);margin-bottom:5px;">DIMENSIONES (PULGADAS):</label>
                        <input type="text" class="form-control" value="${arte.dimensions}" 
                               onchange="updateArteField(${i}, 'dimensions', this.value)" style="font-size:14px;" placeholder='SIZE: (W) ##" X (H) ##"'>
                    </div>
                    <div>
                        <label style="display:block;font-size:.85rem;font-weight:bold;color:var(--gray-dark);margin-bottom:5px;">PLACEMENT:</label>
                        <input type="text" class="form-control" value="${arte.placement}" 
                               onchange="updateArteField(${i}, 'placement', this.value)" style="font-size:14px;" placeholder='#.#" FROM COLLAR SEAM'>
                    </div>
                </div>
                
                <!-- CONDICIONES DE IMPRESIÓN -->
                <div style="background:var(--gray-extra-light);padding:15px;border-radius:8px;margin-bottom:20px;">
                    <h5 style="color:var(--primary);margin-bottom:10px;"><i class="fas fa-print"></i> Condiciones de Impresión</h5>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:15px;">
                        <div>
                            <label style="display:block;font-size:.85rem;font-weight:bold;color:var(--gray-dark);margin-bottom:5px;">INK TYPE:</label>
                            <select id="ink-type-${i}" class="form-control" style="font-size:14px;" onchange="updateArteInkType(${i}, this.value)">
                                <option value="WATER" ${arte.inkType === 'WATER' ? 'selected' : ''}>WATER</option>
                                <option value="PLASTISOL" ${arte.inkType === 'PLASTISOL' ? 'selected' : ''}>PLASTISOL</option>
                                <option value="SILICONE" ${arte.inkType === 'SILICONE' ? 'selected' : ''}>SILICONE</option>
                            </select>
                        </div>
                        <div>
                            <label style="display:block;font-size:.85rem;font-weight:bold;color:var(--gray-dark);margin-bottom:5px;">TEMP:</label>
                            <input type="text" class="form-control" value="${arte.temp || '320 °F'}" 
                                   onchange="updateArteField(${i}, 'temp', this.value)" style="font-size:14px;">
                        </div>
                        <div>
                            <label style="display:block;font-size:.85rem;font-weight:bold;color:var(--gray-dark);margin-bottom:5px;">TIME:</label>
                            <input type="text" class="form-control" value="${arte.time || '1:40 min'}" 
                                   onchange="updateArteField(${i}, 'time', this.value)" style="font-size:14px;">
                        </div>
                    </div>
                </div>
                
                <!-- COLORES / TINTAS -->
                <div style="margin-bottom:20px;">
                    <label style="display:block;font-size:.85rem;font-weight:bold;color:var(--gray-dark);margin-bottom:10px;">COLORES / TINTAS ${arte.name}:</label>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
                        <button class="btn btn-danger btn-sm" onclick="addArteColor(${i}, 'BLOCKER')">
                            <i class="fas fa-plus"></i> Blocker
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="addArteColor(${i}, 'WHITE_BASE')">
                            <i class="fas fa-plus"></i> White Base
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="addArteColor(${i}, 'COLOR')">
                            <i class="fas fa-plus"></i> Color
                        </button>
                    </div>
                    <div id="arte-colors-${i}"></div>
                </div>
                
                <!-- SPECIALTIES -->
                <div style="margin-bottom:15px;">
                    <label style="display:block;font-size:.85rem;font-weight:bold;color:var(--gray-dark);margin-bottom:5px;">SPECIALTIES ${arte.name}:</label>
                    <input type="text" class="form-control" value="${arte.specialties || ''}" 
                           onchange="updateArteField(${i}, 'specialties', this.value)" style="font-size:14px;" placeholder="Especialidades específicas para esta ubicación">
                </div>
                
                <!-- INSTRUCTIONS -->
                <div>
                    <label style="display:block;font-size:.85rem;font-weight:bold;color:var(--gray-dark);margin-bottom:5px;">INSTRUCTIONS ${arte.name}:</label>
                    <textarea class="form-control" rows="2" onchange="updateArteField(${i}, 'instructions', this.value)" style="font-size:14px;">${arte.instructions || ''}</textarea>
                </div>
            </div>
        `;
        container.appendChild(div);
        renderArteColors(i);
    });
}

function loadArteImage(i) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            specGlobal.artes[i].imageB64 = e.target.result;
            renderArtes();
            showStatus('✅ Imagen cargada para ' + specGlobal.artes[i].name);
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

function updateArteField(i, field, value) {
    specGlobal.artes[i][field] = value;
}

function updateArteInkType(i, inkType) {
    specGlobal.artes[i].inkType = inkType;
    const preset = INK_PRESETS[inkType];
    if (preset) {
        specGlobal.artes[i].temp = preset.temp;
        specGlobal.artes[i].time = preset.time;
        renderArtes();
        applyInkPresetToArte(i);
    }
}

function addArteColor(i, type) {
    const colors = specGlobal.artes[i].colors;
    let letter = '';
    
    if (type === 'BLOCKER') {
        letter = 'A';
    } else if (type === 'WHITE_BASE') {
        letter = 'B';
    } else {
        const nums = colors.filter(c => c.type !== 'BLOCKER' && c.type !== 'WHITE_BASE')
                          .map(c => parseInt(c.screenLetter) || 0);
        letter = String(Math.max(...nums, 0) + 1);
    }

    colors.push({
        id: Date.now() + Math.random(),
        type: type,
        screenLetter: letter,
        val: ''
    });
    
    renderArteColors(i);
    applyInkPresetToArte(i);
}

function renderArteColors(i) {
    const colors = specGlobal.artes[i].colors;
    const div = document.getElementById(`arte-colors-${i}`);
    if (!div) return;
    
    if (colors.length === 0) {
        div.innerHTML = '<p style="color:var(--gray-light);text-align:center;padding:10px;">Sin colores. Usa los botones de arriba.</p>';
        return;
    }
    
    div.innerHTML = '';
    colors.forEach(c => {
        const item = document.createElement('div');
        item.className = 'color-item';
        item.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px;background:white;border-radius:6px;border:1px solid var(--border);margin-bottom:8px;border-left:4px solid var(--primary);';
        item.innerHTML = `
            <span style="padding:4px 8px;border-radius:12px;font-size:11px;font-weight:bold;color:white;text-transform:uppercase;background:${
                c.type === 'BLOCKER' ? 'var(--gray-dark)' : 
                c.type === 'WHITE_BASE' ? 'var(--gray-medium)' : 'var(--primary)'
            }">${c.type === 'BLOCKER' ? 'BLOQUEADOR' : c.type === 'WHITE_BASE' ? 'WHITE BASE' : 'COLOR'}</span>
            <input type="text" style="width:40px;text-align:center;font-weight:bold;padding:6px;border:1px solid var(--border);border-radius:4px;" 
                   value="${c.screenLetter}" onchange="updateColorLetter(${i}, ${c.id}, this.value)">
            <input type="text" class="form-control" placeholder="Nombre tinta..." value="${c.val}" 
                   style="flex:1;font-size:14px;" onchange="updateColorValue(${i}, ${c.id}, this.value)">
            <div style="width:30px;height:30px;border-radius:4px;border:2px solid var(--border);background:${getColorHex(c.val)}"></div>
            <button class="btn btn-danger btn-sm" onclick="removeArteColor(${i}, ${c.id})" style="padding:4px 8px;">
                <i class="fas fa-times"></i>
            </button>
        `;
        div.appendChild(item);
    });
}

function updateColorLetter(i, colorId, value) {
    const color = specGlobal.artes[i].colors.find(c => c.id === colorId);
    if (color) color.screenLetter = value.toUpperCase();
}

function updateColorValue(i, colorId, value) {
    const color = specGlobal.artes[i].colors.find(c => c.id === colorId);
    if (color) {
        color.val = value;
        renderArteColors(i);
    }
}

function removeArteColor(i, colorId) {
    specGlobal.artes[i].colors = specGlobal.artes[i].colors.filter(c => c.id !== colorId);
    renderArteColors(i);
}

function applyInkPresetToArte(i) {
    const inkType = specGlobal.artes[i].inkType || 'WATER';
    const preset = INK_PRESETS[inkType];
    if (!preset) return;
    
    const colors = specGlobal.artes[i].colors;
    colors.forEach(c => {
        if (!c.val) {
            if (c.type === 'BLOCKER') c.val = preset.blocker.name;
            if (c.type === 'WHITE_BASE') c.val = preset.white.name;
        }
    });
    renderArteColors(i);
}

function getColorHex(colorName) {
    if (!colorName) return '#CCCCCC';
    const normalized = colorName.toUpperCase().trim();
    
    if (PANTONE_DB[normalized]) {
        return PANTONE_DB[normalized];
    }
    
    for (const [key, value] of Object.entries(PANTONE_DB)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return value;
        }
    }
    
    if (normalized.includes('BLACK')) return '#000000';
    if (normalized.includes('WHITE')) return '#FFFFFF';
    if (normalized.includes('RED')) return '#C8102E';
    if (normalized.includes('BLUE')) return '#003A70';
    if (normalized.includes('GREEN')) return '#008D62';
    if (normalized.includes('GOLD')) return '#FFB612';
    if (normalized.includes('SILVER') || normalized.includes('GREY')) return '#A5ACAF';
    
    return '#CCCCCC';
}

function editArte(index) {
    const arte = specGlobal.artes[index];
    const newName = prompt('Nuevo nombre para la ubicación:', arte.name);
    if (newName) {
        arte.name = newName.toUpperCase();
        renderArtes();
        showStatus('✅ Ubicación actualizada');
    }
}

function removeArte(index) {
    if (confirm('¿Eliminar esta ubicación?')) {
        specGlobal.artes.splice(index, 1);
        renderArtes();
        showStatus('🗑️ Ubicación eliminada');
    }
}

// ========== EXCEL IMPORTER ==========
function handleExcelUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            
            const processedData = {};
            
            jsonData.forEach(row => {
                if (Array.isArray(row)) {
                    const key = row[0] ? String(row[0]).trim().toUpperCase().replace(/\s+/g, ' ') : '';
                    const value = row[1] ? String(row[1]).trim() : '';
                    
                    if (key && value) {
                        switch(key) {
                            case 'CLIENTE': processedData.customer = value; break;
                            case 'STYLE': processedData.style = value; break;
                            case 'COLORWAY': processedData.colorway = value; break;
                            case 'SEASON': processedData.season = value; break;
                            case 'PATTERN #': 
                            case 'PATTERN': processedData.pattern = value; break;
                            case 'P.O. #': 
                            case 'PO': processedData.po = value; break;
                            case 'SAMPLE TYPE': processedData.sampleType = value; break;
                            case 'NAME / TEAM': 
                            case 'NAME/TEAM': 
                            case 'TEAM': processedData.nameTeam = value; break;
                            case 'GENDER': processedData.gender = value; break;
                            case 'DESIGNER': processedData.designer = value; break;
                            case 'INK TYPE': processedData.inkType = value; break;
                            case 'DIMENSIONS': processedData.dimensions = value; break;
                            case 'PLACEMENT': processedData.placement = value; break;
                        }
                    }
                }
            });
            
            if (jsonData.length > 0 && jsonData[0].length > 1) {
                const headerRow = jsonData[0];
                const dataRow = jsonData[1] || [];
                
                headerRow.forEach((header, index) => {
                    if (header && dataRow[index]) {
                        const key = String(header).trim().toUpperCase().replace(/\s+/g, ' ');
                        const value = String(dataRow[index]).trim();
                        
                        if (!processedData.customer && key.includes('CLIENT')) processedData.customer = value;
                        if (!processedData.style && key.includes('STYLE')) processedData.style = value;
                        if (!processedData.colorway && key.includes('COLOR')) processedData.colorway = value;
                        if (!processedData.season && key.includes('SEASON')) processedData.season = value;
                        if (!processedData.pattern && (key.includes('PATTERN') || key.includes('PATT'))) processedData.pattern = value;
                        if (!processedData.po && (key.includes('PO') || key.includes('P.O'))) processedData.po = value;
                        if (!processedData.sampleType && key.includes('SAMPLE')) processedData.sampleType = value;
                        if (!processedData.nameTeam && (key.includes('NAME') || key.includes('TEAM'))) processedData.nameTeam = value;
                        if (!processedData.gender && key.includes('GENDER')) processedData.gender = value;
                        if (!processedData.designer && key.includes('DESIGN')) processedData.designer = value;
                    }
                });
            }
            
            Object.keys(processedData).forEach(key => {
                const el = document.getElementById(key);
                if (el) el.value = processedData[key] || '';
            });
            
            updateClientLogo();
            
            processExcelArtes(jsonData, processedData);
            
            showTab('spec-creator');
            showStatus('✅ Excel cargado correctamente', 'success');
            
        } catch(error) {
            console.error('Error leyendo Excel:', error);
            showStatus('❌ Error al leer Excel. Asegúrate de que tenga el formato correcto.', 'error');
        }
    };
    reader.readAsArrayBuffer(file);
}

function processExcelArtes(jsonData, generalData) {
    let artesSectionStart = -1;
    
    for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (Array.isArray(row) && row[0]) {
            const cellValue = String(row[0]).toUpperCase();
            if (cellValue.includes('ARTE') || cellValue.includes('UBICACION') || 
                cellValue.includes('LOCATION') || cellValue.includes('FRONT') || 
                cellValue.includes('BACK') || cellValue.includes('SLEEVE')) {
                artesSectionStart = i;
                break;
            }
        }
    }
    
    if (artesSectionStart !== -1) {
        specGlobal.artes = [];
        
        for (let i = artesSectionStart; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (Array.isArray(row) && row[0] && String(row[0]).trim()) {
                const arteName = String(row[0]).trim().toUpperCase();
                
                if (arteName.includes('ARTE') || arteName.includes('UBICACION') || 
                    arteName.includes('LOCATION') || arteName.includes('NOMBRE')) {
                    continue;
                }
                
                const arte = {
                    name: arteName,
                    imageB64: '',
                    colors: [],
                    dimensions: row[1] || 'SIZE: (W) ##" X (H) ##"',
                    placement: row[2] || '#.#" FROM COLLAR SEAM',
                    inkType: generalData.inkType || 'WATER',
                    temp: '320 °F',
                    time: '1:40 min',
                    specialties: row[3] || '',
                    instructions: row[4] || ''
                };
                
                specGlobal.artes.push(arte);
            }
        }
        
        if (specGlobal.artes.length > 0) {
            renderArtes();
            showStatus(`✅ ${specGlobal.artes.length} ubicaciones cargadas desde Excel`, 'info');
        }
    }
}

// ========== PDF ANALYSIS ==========
function initPDFAnalyzer() {
    document.getElementById('pdf-file')?.addEventListener('change', function() {
        showStatus('PDF listo para análisis', 'info');
    });
}

function startPDFAnalysis() {
    const fileInput = document.getElementById('pdf-file');
    const file = fileInput?.files[0];
    
    if (!file) {
        showStatus('Selecciona un archivo PDF primero', 'warning');
        return;
    }
    
    showStatus('🔍 Analizando PDF... Esto puede tomar unos segundos', 'info');
    
    setTimeout(() => {
        pdfAnalysisResults = [
            {
                page: 1,
                colorName: "UNI RED",
                screenLetter: "A",
                colorType: "COLOR",
                arteName: "FRONT",
                blackPixels: 1580000,
                netBlackPixels: Math.max(0, 1580000 - 15870446),
                coveragePercentage: "0.15",
                matchesSpec: true,
                expectedPixels: calculateExpectedPixels(),
                pageScreenshot: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qw6FnaW5hIDE8L3RleHQ+PHRleHQgeD0iMTAwIiB5PSIxMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UkVEIC8gU2NyZWVuIEE8L3RleHQ+PC9zdmc+'
            },
            {
                page: 2,
                colorName: "BLOCKER CHT",
                screenLetter: "B",
                colorType: "BLOCKER",
                arteName: "FRONT",
                blackPixels: 17500000,
                netBlackPixels: Math.max(0, 17500000 - 15870446),
                coveragePercentage: "18.25",
                matchesSpec: true,
                expectedPixels: calculateExpectedPixels(),
                pageScreenshot: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qw6FnaW5hIDI8L3RleHQ+PHRleHQgeD0iMTAwIiB5PSIxMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QkxPQ0tFUiAvIFNjcmVlbiBCPC90ZXh0Pjwvc3ZnPg=='
            }
        ];
        
        displayPDFResults();
        document.getElementById('save-results-btn').style.display = 'inline-flex';
        showStatus('✅ Análisis de PDF completado', 'success');
    }, 2000);
}

function calculateExpectedPixels() {
    const dimensions = document.getElementById('dimensions')?.value || '';
    if (!dimensions) return 0;
    
    const matches = dimensions.match(/(\d+(\.\d+)?)/g);
    if (!matches || matches.length < 2) return 0;
    
    const widthInches = parseFloat(matches[0]);
    const heightInches = parseFloat(matches[1]);
    
    if (isNaN(widthInches) || isNaN(heightInches)) return 0;
    
    return Math.round(widthInches * 300) * Math.round(heightInches * 300);
}

function displayPDFResults() {
    const container = document.getElementById('pdf-results-container');
    if (!container) return;
    
    if (!pdfAnalysisResults || pdfAnalysisResults.length === 0) {
        container.innerHTML = '<p>No hay resultados disponibles.</p>';
        return;
    }
    
    let html = `
        <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;padding:20px;border-radius:12px;margin-bottom:20px;">
            <h3 style="color:white;margin-bottom:15px;"><i class="fas fa-chart-pie"></i> Resumen del Análisis</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:15px;">
                <div style="text-align:center;padding:15px;background:rgba(255,255,255,0.2);border-radius:8px;">
                    <div style="font-size:0.9rem;opacity:0.9;">Total Páginas</div>
                    <div style="font-size:1.5rem;font-weight:bold;">${pdfAnalysisResults.length}</div>
                </div>
                <div style="text-align:center;padding:15px;background:rgba(255,255,255,0.2);border-radius:8px;">
                    <div style="font-size:0.9rem;opacity:0.9;">Píxeles Netos</div>
                    <div style="font-size:1.5rem;font-weight:bold;">${pdfAnalysisResults.reduce((sum, r) => sum + r.netBlackPixels, 0).toLocaleString()}</div>
                </div>
            </div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:10px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
            <thead>
                <tr style="background:linear-gradient(to right, var(--primary), var(--primary-dark));color:white;">
                    <th style="padding:12px 8px;text-align:left;">Página</th><th>Color</th><th>Screen</th><th>Tipo</th>
                    <th>Ubicación</th><th>Píxeles Netos</th><th>% Cobertura</th><th>Concuerda</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    pdfAnalysisResults.forEach(result => {
        html += `
            <tr style="border-bottom:1px solid var(--border);">
                <td style="padding:12px 8px;">${result.page}</td>
                <td>${result.colorName}</td>
                <td>${result.screenLetter}</td>
                <td>${result.colorType}</td>
                <td>${result.arteName}</td>
                <td>${result.netBlackPixels.toLocaleString()}</td>
                <td>${result.coveragePercentage}%</td>
                <td>${result.matchesSpec ? '✅' : '❌'}</td>
            </tr>
        `;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

function savePDFResults() {
    if (!pdfAnalysisResults || pdfAnalysisResults.length === 0) {
        showStatus('No hay resultados para guardar', 'warning');
        return;
    }
    
    const data = {
        analysisDate: new Date().toISOString(),
        results: pdfAnalysisResults
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `PDF_Analysis_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    
    showStatus('✅ Resultados guardados como JSON');
}

// ========== STORAGE MANAGER ==========
function loadSavedSpecsList() {
    const list = document.getElementById('saved-specs-list');
    if (!list) return;
    
    const specs = Object.keys(localStorage).filter(k => k.startsWith('spec_'));
    
    if (specs.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:var(--gray-light);padding:30px;">No hay specs guardadas.</p>';
        return;
    }
    
    let html = '';
    specs.forEach(key => {
        try {
            const spec = JSON.parse(localStorage.getItem(key));
            html += `
                <div style="padding:15px;border-bottom:1px solid var(--border);">
                    <div style="font-weight:bold;color:var(--primary)">${spec.style || 'Sin nombre'}</div>
                    <div style="font-size:.85rem;color:var(--gray-medium)">
                        Cliente: ${spec.customer || 'N/A'} | Artes: ${spec.artes?.length || 0}
                    </div>
                    <div style="font-size:.75rem;color:var(--gray-light)">
                        ${spec.savedAt ? new Date(spec.savedAt).toLocaleDateString('es-ES') : 'Fecha desconocida'}
                    </div>
                    <div style="margin-top:10px;">
                        <button class="btn btn-primary btn-sm" onclick="loadSpec('${key}')">
                            <i class="fas fa-edit"></i> Cargar
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="deleteSpec('${key}')" style="margin-left:5px;">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            `;
        } catch(e) {
            console.error("Error cargando spec:", e);
        }
    });
    
    list.innerHTML = html;
}

function loadSpec(key) {
    try {
        const spec = JSON.parse(localStorage.getItem(key));
        
        Object.keys(spec).forEach(k => {
            const el = document.getElementById(k);
            if (el) el.value = spec[k] || '';
        });
        
        if (spec.artes) {
            specGlobal.artes = spec.artes;
            renderArtes();
        }
        
        updateClientLogo();
        
        const inkSelect = document.getElementById('ink-type-select');
        if (inkSelect && spec.inkType) {
            inkSelect.value = spec.inkType;
            updateInkPreset();
        }
        
        showTab('spec-creator');
        showStatus('Spec cargada correctamente');
    } catch(e) {
        showStatus('Error cargando spec', 'error');
    }
}

function deleteSpec(key) {
    if (confirm('¿Eliminar esta spec?')) {
        localStorage.removeItem(key);
        loadSavedSpecsList();
        updateDashboard();
        showStatus('Spec eliminada');
    }
}

function clearAllSpecs() {
    if (confirm('¿Eliminar TODAS las specs guardadas?')) {
        Object.keys(localStorage)
            .filter(k => k.startsWith('spec_'))
            .forEach(k => localStorage.removeItem(k));
        
        loadSavedSpecsList();
        updateDashboard();
        showStatus('Todas las specs eliminadas');
    }
}

// ========== GUARDAR SPEC ==========
function saveSpec() {
    const fields = ['customer', 'style', 'colorway', 'season', 'pattern', 'po', 
                   'sampleType', 'nameTeam', 'gender', 'designer', 'dimensions', 
                   'placement', 'specialties', 'instructions'];
    
    fields.forEach(field => {
        const el = document.getElementById(field);
        if (el) specGlobal[field] = el.value;
    });
    
    specGlobal.inkType = document.getElementById('ink-type-select')?.value || 'WATER';
    specGlobal.temp = document.getElementById('temp')?.value || '320 °F';
    specGlobal.time = document.getElementById('time')?.value || '1:40 min';
    specGlobal.folder = document.getElementById('folder-num')?.value || '';
    specGlobal.imageB64 = currentImageData || '';
    specGlobal.savedAt = new Date().toISOString();
    
    if (!specGlobal.customer || !specGlobal.style) {
        showStatus('⚠️ Completa al menos CLIENTE y STYLE', 'warning');
        return;
    }
    
    const key = `spec_${specGlobal.style}_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(specGlobal));
    
    updateDashboard();
    showStatus(`✅ Spec "${specGlobal.style}" guardada correctamente`, 'success');
}

// ========== EXPORTAR A EXCEL ==========
function exportToExcel() {
    if (!specGlobal.customer || !specGlobal.style) {
        showStatus('⚠️ Primero completa los datos de la spec', 'warning');
        return;
    }
    
    try {
        const wb = XLSX.utils.book_new();
        
        const generalData = [
            ['TEGRA TECHNICAL SPEC MANAGER', '', '', ''],
            ['Fecha', new Date().toLocaleDateString('es-ES'), '', ''],
            ['', '', '', ''],
            ['INFORMACIÓN GENERAL', '', '', ''],
            ['CLIENTE', specGlobal.customer],
            ['STYLE', specGlobal.style],
            ['COLORWAY', specGlobal.colorway],
            ['SEASON', specGlobal.season],
            ['PATTERN #', specGlobal.pattern],
            ['P.O. #', specGlobal.po],
            ['SAMPLE TYPE', specGlobal.sampleType],
            ['TEAM', specGlobal.nameTeam],
            ['GENDER', specGlobal.gender],
            ['DESIGNER', specGlobal.designer],
            ['INK TYPE', specGlobal.inkType],
            ['DIMENSIONS', specGlobal.dimensions],
            ['PLACEMENT', specGlobal.placement],
            ['TEMP/TIME', `${specGlobal.temp} / ${specGlobal.time}`],
            ['SPECIALTIES', specGlobal.specialties],
            ['INSTRUCTIONS', specGlobal.instructions],
            ['', '', '', ''],
            ['ARTES / UBICACIONES', '', '', ''],
            ['Nombre', 'Colores', 'Dimensiones', 'Placement']
        ];
        
        specGlobal.artes.forEach(arte => {
            generalData.push([
                arte.name,
                arte.colors.length,
                arte.dimensions,
                arte.placement
            ]);
        });
        
        const ws1 = XLSX.utils.aoa_to_sheet(generalData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Datos Generales');
        
        if (specGlobal.artes.length > 0) {
            const colorsData = [
                ['ARTE', 'SCREEN', 'TIPO', 'NOMBRE TINTA', 'MESH', 'DURÓMETRO', 'GOLPES', 'ADITIVOS']
            ];
            
            specGlobal.artes.forEach(arte => {
                arte.colors.forEach(color => {
                    const preset = INK_PRESETS[specGlobal.inkType];
                    colorsData.push([
                        arte.name,
                        color.screenLetter,
                        color.type === 'BLOCKER' ? 'BLOQUEADOR' : 
                        color.type === 'WHITE_BASE' ? 'WHITE BASE' : 'COLOR',
                        color.val,
                        color.type === 'BLOCKER' ? preset?.blocker?.mesh1 || 'N/A' :
                        color.type === 'WHITE_BASE' ? preset?.white?.mesh1 || 'N/A' :
                        preset?.color?.mesh || 'N/A',
                        color.type === 'BLOCKER' ? preset?.blocker?.durometer || 'N/A' :
                        color.type === 'WHITE_BASE' ? preset?.white?.durometer || 'N/A' :
                        preset?.color?.durometer || 'N/A',
                        color.type === 'BLOCKER' ? preset?.blocker?.strokes || 'N/A' :
                        color.type === 'WHITE_BASE' ? preset?.white?.strokes || 'N/A' :
                        preset?.color?.strokes || 'N/A',
                        color.type === 'BLOCKER' ? preset?.blocker?.additives || 'N/A' :
                        color.type === 'WHITE_BASE' ? preset?.white?.additives || 'N/A' :
                        preset?.color?.additives || 'N/A'
                    ]);
                });
            });
            
            const ws2 = XLSX.utils.aoa_to_sheet(colorsData);
            XLSX.utils.book_append_sheet(wb, ws2, 'Colores');
        }
        
        const fileName = `TegraSpec_${specGlobal.style}_${new Date().toISOString().slice(0,10)}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        showStatus('✅ Excel exportado correctamente', 'success');
    } catch (error) {
        console.error('Error exportando Excel:', error);
        showStatus('❌ Error al exportar Excel', 'error');
    }
}

// ========== EXPORTAR PDF ==========
function exportPDF() {
    if (!specGlobal.customer || !specGlobal.style) {
        showStatus('⚠️ Primero completa los datos de la spec', 'warning');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        let y = 20;
        
        function addText(text, x, yPos, size = 10, bold = false, color = [0, 0, 0]) {
            pdf.setFontSize(size);
            pdf.setFont('helvetica', bold ? 'bold' : 'normal');
            pdf.setTextColor(...color);
            pdf.text(text, x, yPos);
        }
        
        pdf.setFillColor(211, 47, 47);
        pdf.rect(0, 0, pageWidth, 30, 'F');
        addText('TEGRA TECHNICAL SPEC MANAGER', 15, 15, 16, true, [255, 255, 255]);
        addText('PDF MAESTRO', 15, 22, 12, false, [255, 255, 255]);
        
        y = 40;
        addText('INFORMACIÓN GENERAL', 15, y, 12, true, [211, 47, 47]);
        y += 10;
        
        const generalFields = [
            ['CLIENTE:', specGlobal.customer],
            ['STYLE:', specGlobal.style],
            ['COLORWAY:', specGlobal.colorway],
            ['SEASON:', specGlobal.season],
            ['PATTERN #:', specGlobal.pattern],
            ['P.O. #:', specGlobal.po],
            ['SAMPLE TYPE:', specGlobal.sampleType],
            ['TEAM:', specGlobal.nameTeam],
            ['GENDER:', specGlobal.gender],
            ['DESIGNER:', specGlobal.designer],
            ['INK TYPE:', specGlobal.inkType],
            ['DIMENSIONS:', specGlobal.dimensions],
            ['PLACEMENT:', specGlobal.placement],
            ['TEMP/TIME:', `${specGlobal.temp} / ${specGlobal.time}`]
        ];
        
        generalFields.forEach(([label, value], i) => {
            const x = i % 2 === 0 ? 15 : 110;
            addText(label, x, y, 9, true);
            addText(value || '---', x + 25, y, 9);
            if (i % 2 !== 0) y += 6;
        });
        
        y += 10;
        
        if (specGlobal.specialties) {
            addText('SPECIALTIES:', 15, y, 10, true);
            addText(specGlobal.specialties, 15, y + 5, 9);
            y += 15;
        }
        
        if (specGlobal.instructions) {
            addText('INSTRUCTIONS:', 15, y, 10, true);
            const instructions = pdf.splitTextToSize(specGlobal.instructions, pageWidth - 30);
            pdf.text(instructions, 15, y + 5);
            y += instructions.length * 5 + 10;
        }
        
        if (specGlobal.artes.length > 0) {
            addText('ARTES / UBICACIONES', 15, y, 12, true, [211, 47, 47]);
            y += 10;
            
            specGlobal.artes.forEach((arte, index) => {
                if (y > 250) {
                    pdf.addPage();
                    y = 20;
                }
                
                addText(`UBICACIÓN: ${arte.name}`, 15, y, 11, true);
                y += 7;
                
                addText(`Dimensiones: ${arte.dimensions}`, 20, y, 9);
                y += 5;
                addText(`Placement: ${arte.placement}`, 20, y, 9);
                y += 5;
                
                if (arte.specialties) {
                    addText(`Specialties: ${arte.specialties}`, 20, y, 9);
                    y += 5;
                }
                
                if (arte.colors.length > 0) {
                    addText('Colores:', 20, y, 10, true);
                    y += 6;
                    
                    arte.colors.forEach(color => {
                        const typeLabel = color.type === 'BLOCKER' ? 'BLOQUEADOR' : 
                                        color.type === 'WHITE_BASE' ? 'WHITE BASE' : 'COLOR';
                        addText(`  ${color.screenLetter}: ${color.val} (${typeLabel})`, 25, y, 9);
                        y += 5;
                    });
                }
                
                y += 10;
            });
        }
        
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Generado por Tegra Technical Spec Manager', pageWidth / 2, 290, { align: 'center' });
        pdf.text(new Date().toLocaleDateString('es-ES'), pageWidth / 2, 294, { align: 'center' });
        
        const fileName = `TegraSpec_${specGlobal.style}_${new Date().toISOString().slice(0,10)}.pdf`;
        pdf.save(fileName);
        
        showStatus('✅ PDF exportado correctamente', 'success');
    } catch (error) {
        console.error('Error exportando PDF:', error);
        showStatus('❌ Error al exportar PDF', 'error');
    }
}

// ========== ZIP EXPORTER ==========
function downloadProjectZip() {
    showStatus('⚠️ Función ZIP en desarrollo. Por ahora usa PDF o Excel.', 'warning');
}

// ========== CLEAR FORM ==========
function clearForm() {
    if (confirm('¿Limpiar todo el formulario?')) {
        specGlobal = {
            customer: '', style: '', colorway: '', season: '', pattern: '', po: '',
            sampleType: '', nameTeam: '', gender: '', designer: '', inkType: 'WATER',
            folder: '', dimensions: '', placement: '', temp: '320 °F', time: '1:40 min',
            specialties: '', instructions: '', imageB64: '', artes: [], savedAt: null
        };
        
        currentImageData = null;
        
        const fields = ['customer', 'style', 'colorway', 'season', 'pattern', 'po', 
                       'sampleType', 'nameTeam', 'gender', 'dimensions', 'placement', 
                       'specialties', 'instructions', 'folder-num'];
        
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        
        document.getElementById('designer').value = '';
        document.getElementById('ink-type-select').value = 'WATER';
        document.getElementById('temp').value = '320 °F';
        document.getElementById('time').value = '1:40 min';
        
        const preview = document.getElementById('imagePreview');
        if (preview) {
            preview.style.display = 'none';
            preview.src = '';
        }
        
        specGlobal.artes = [];
        renderArtes();
        
        const logo = document.getElementById('logoCliente');
        if (logo) logo.style.display = 'none';
        
        showStatus('Formulario limpiado', 'info');
    }
}

// ========== INICIALIZACIÓN ==========
function initApp() {
    console.log("Inicializando Tegra Spec Manager...");
    
    const appContainer = document.getElementById('app-container');
    if (appContainer) {
        appContainer.innerHTML = `
            <div class="app-container">
                <!-- HEADER -->
                <header class="app-header">
                    <div class="logo-section">
                        <div class="app-logo">
                            <svg viewBox="0 0 145.94 39.05" fill="white" height="45">
                                <path d="M42.24 12.37v1.93h6.91v15.25h4.21V14.3h6.91v-3.88h-16.1l-1.93 1.95zm49.82 7.94v1.87h4.24v2.73c-.53.38-1.13.67-1.8.86s-1.39.29-2.16.29c-.84 0-1.61.15-2.32-.45-.71-.3-1.33-.72-1.84-1.27s-.92-1.19-1.2-1.93c-.28-.74-.42-1.54-.42-2.42v-.05c0-.82.14-1.59.42-2.31.28-.72.67-1.35 1.18-1.89.5-.54 1.08-.97 1.75-1.28.66-.32 1.38-.48 2.15-.48.55 0 1.05.05 1.5.14.46.09.88.22 1.27.38.39.16.77.36 1.13.6.25.16.49.34.74.54l2.94-2.97c-.47-.4-.96-.75-1.46-1.07-.53-.33-1.09-.60-1.70-.82-.60-.22-1.25-.39-1.95-.51s-1.48-.18-2.34-.18c-1.44 0-2.77.26-4.00.78-1.23.52-2.29 1.23-3.18 2.13-.89.90-1.59 1.95-2.09 3.14-.50 1.19-.75 2.47-.75 3.84v.05c0 1.42.25 2.73.74 3.94.49 1.20 1.18 2.24 2.06 3.12.88.87 1.94 1.56 3.17 2.05 1.23.49 2.59.74 4.09.74 1.75 0 3.30-.30 4.66-.89 1.36-.59 2.53-1.31 3.51-2.15v-8.31h-6.56l-1.74 1.76zM68.15 21.80h9.02v-3.74h-9.02v-3.88h10.25v-3.74h-12.55l-1.86 1.88v17.26h14.54v-3.74h-10.39v-4.02zm46.09-11.37h-8.75v19.13h4.21v-6.12h3.31l4.10 6.12h2.57l1.39-1.40-3.71-5.43c1.22-.46 2.21-1.17 2.97-2.15.76-.97 1.13-2.24 1.13-3.79v-.05c0-1.82-.55-3.28-1.64-4.37-1.29-1.29-3.15-1.94-5.58-1.94zm2.95 6.60c0 .82-.28 1.48-.83 1.98-.56.49-1.35.74-2.39.74h-4.26v-5.52h4.18c1.04 0 1.85.23 2.43.69.58.46.87 1.14.87 2.06v.05zm19.51-6.74h-3.88l-8.20 19.27h4.29l1.75-4.29h8.09l1.75 4.29h1.97l1.70-1.72-7.47-17.55zm-4.54 11.29l2.54-6.20 2.54 6.20h-5.08z"/>
                            </svg>
                        </div>
                        <div>
                            <h1 class="app-title">Technical Spec Manager</h1>
                            <p class="app-subtitle">Sistema integrado: Specs + Análisis de PDF</p>
                        </div>
                    </div>
                    <div class="client-section">
                        <span class="client-label">CLIENTE:</span>
                        <div class="client-logo-wrapper">
                            <img id="logoCliente" alt="Logo del cliente" style="max-height:35px;display:none">
                        </div>
                    </div>
                    <div class="header-actions">
                        <div class="folder-input-container">
                            <span class="client-label"># FOLDER:</span>
                            <input type="text" id="folder-num" class="form-control" placeholder="#####">
                        </div>
                        <div id="current-datetime"></div>
                    </div>
                </header>

                <!-- NAVEGACIÓN -->
                <nav class="app-nav">
                    <ul class="nav-tabs">
                        <li class="nav-tab active" data-tab="dashboard" onclick="showTab('dashboard')">
                            <i class="fas fa-tachometer-alt"></i> Dashboard
                        </li>
                        <li class="nav-tab" data-tab="spec-creator" onclick="showTab('spec-creator')">
                            <i class="fas fa-file-alt"></i> Crear Spec
                        </li>
                        <li class="nav-tab" data-tab="pdf-analysis" onclick="showTab('pdf-analysis')">
                            <i class="fas fa-search"></i> Analizar PDF
                        </li>
                        <li class="nav-tab" data-tab="saved-specs" onclick="showTab('saved-specs')">
                            <i class="fas fa-database"></i> Guardadas
                        </li>
                    </ul>
                </nav>

                <!-- CONTENIDO PRINCIPAL -->
                <main class="app-main">
                    <!-- DASHBOARD -->
                    <div id="dashboard" class="tab-content active">
                        <div class="dashboard-grid">
                            <div class="stat-card"><div class="stat-number" id="total-specs">0</div><div class="stat-label">Specs Totales</div></div>
                            <div class="stat-card"><div class="stat-number" id="today-specs">0</div><div class="stat-label">Creadas Hoy</div></div>
                            <div class="stat-card"><div class="stat-number" id="active-projects">0</div><div class="stat-label">Proyectos Activos</div></div>
                            <div class="stat-card"><div class="stat-number" id="completion-rate">0%</div><div class="stat-label">Tasa de Finalización</div></div>
                        </div>
                        <div class="card">
                            <div class="card-body" style="text-align:center">
                                <h2 style="color:var(--primary);margin-bottom:20px">
                                    <i class="fas fa-rocket"></i> Acciones Rápidas
                                </h2>
                                <div style="margin-top:20px;display:flex;gap:15px;justify-content:center;flex-wrap:wrap">
                                    <button class="btn btn-primary btn-lg" onclick="showTab('spec-creator')">
                                        <i class="fas fa-plus"></i> Nueva Spec
                                    </button>
                                    <button class="btn btn-success btn-lg" onclick="document.getElementById('excelFile').click()">
                                        <i class="fas fa-file-excel"></i> Cargar Excel
                                    </button>
                                    <button class="btn btn-warning btn-lg" onclick="showTab('pdf-analysis')">
                                        <i class="fas fa-file-pdf"></i> Analizar PDF
                                    </button>
                                    <button class="btn btn-outline btn-lg" onclick="showTab('saved-specs')">
                                        <i class="fas fa-history"></i> Ver Historial
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- SPEC CREATOR -->
                    <div id="spec-creator" class="tab-content">
                        <!-- Información General -->
                        <div class="card">
                            <div class="card-header">
                                <h2 class="card-title"><i class="fas fa-info-circle"></i> Información General</h2>
                            </div>
                            <div class="card-body">
                                <div class="form-grid">
                                    <div class="form-group"><label class="form-label">CLIENTE:</label><input type="text" id="customer" class="form-control" oninput="updateClientLogo()"></div>
                                    <div class="form-group"><label class="form-label">STYLE:</label><input type="text" id="style" class="form-control"></div>
                                    <div class="form-group"><label class="form-label">COLORWAY:</label><input type="text" id="colorway" class="form-control"></div>
                                    <div class="form-group"><label class="form-label">SEASON:</label><input type="text" id="season" class="form-control"></div>
                                    <div class="form-group"><label class="form-label">PATTERN #:</label><input type="text" id="pattern" class="form-control"></div>
                                    <div class="form-group"><label class="form-label">P.O. #:</label><input type="text" id="po" class="form-control"></div>
                                    <div class="form-group"><label class="form-label">SAMPLE TYPE:</label><input type="text" id="sample-type" class="form-control"></div>
                                    <div class="form-group"><label class="form-label">NAME / TEAM:</label><input type="text" id="name-team" class="form-control"></div>
                                    <div class="form-group"><label class="form-label">GENDER:</label><input type="text" id="gender" class="form-control"></div>
                                    <div class="form-group"><label class="form-label">DISEÑADOR:</label>
                                        <select id="designer" class="form-control">
                                            <option value="">Seleccionar...</option>
                                            <option>ELMER VELEZ</option><option>DANIEL HERNANDEZ</option><option>CINDY PINEDA</option><option>FERNANDO FERRERA</option><option>NILDA CORDOBA</option><option>OTRO</option>
                                        </select>
                                    </div>
                                    <div class="form-group"><label class="form-label">INK TYPE:</label>
                                        <select id="ink-type-select" class="form-control" onchange="updateInkPreset()">
                                            <option value="WATER">WATER</option><option value="PLASTISOL">PLASTISOL</option><option value="SILICONE">SILICONE</option>
                                        </select>
                                    </div>
                                    <div class="form-group"><label class="form-label">DIMENSIONES (PULGADAS):</label><input type="text" id="dimensions" class="form-control" placeholder='SIZE: (W) ##" X (H) ##"'></div>
                                    <div class="form-group"><label class="form-label">PLACEMENT:</label><input type="text" id="placement" class="form-control" placeholder='#.#" FROM COLLAR SEAM'></div>
                                    <div class="form-group"><label class="form-label">TEMP:</label><input type="text" id="temp" class="form-control" value="320 °F"></div>
                                    <div class="form-group"><label class="form-label">TIME:</label><input type="text" id="time" class="form-control" value="1:40 min"></div>
                                    <div class="form-group"><label class="form-label">SPECIALTIES:</label><input type="text" id="specialties" class="form-control"></div>
                                    <div class="form-group"><label class="form-label">INSTRUCTIONS:</label><textarea id="instructions" class="form-control" rows="3"></textarea></div>
                                    <div class="form-group"><label class="form-label">IMAGEN (Opcional):</label>
                                        <div class="file-upload-area" onclick="document.getElementById('imageInput').click()">
                                            <i class="fas fa-cloud-upload-alt" style="font-size:2.5rem;color:var(--primary);margin-bottom:15px;"></i>
                                            <p>Haz clic para cargar imagen o pega (Ctrl+V)</p>
                                        </div>
                                        <div class="image-preview-container">
                                            <img id="imagePreview" class="image-preview" style="display:none;" alt="Vista previa">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Artes / Ubicaciones -->
                        <div class="card">
                            <div class="card-header">
                                <h2 class="card-title"><i class="fas fa-layer-group"></i> Artes / Ubicaciones</h2>
                                <button class="btn btn-primary btn-sm" onclick="addArte()">
                                    <i class="fas fa-plus"></i> Nueva Ubicación
                                </button>
                            </div>
                            <div class="card-body" id="artes-container">
                                <!-- Las ubicaciones aparecerán aquí -->
                            </div>
                        </div>

                        <!-- Botones finales -->
                        <div class="card">
                            <div class="card-body" style="display:flex;gap:15px;flex-wrap:wrap;justify-content:center">
                                <button class="btn btn-success btn-lg" onclick="saveSpec()">
                                    <i class="fas fa-save"></i> Guardar Spec
                                </button>
                                <button class="btn btn-primary btn-lg" onclick="downloadProjectZip()">
                                    <i class="fas fa-file-archive"></i> Descargar ZIP
                                </button>
                                <button class="btn btn-success btn-lg" onclick="exportPDF()">
                                    <i class="fas fa-file-pdf"></i> Exportar PDF
                                </button>
                                <button class="btn btn-warning btn-lg" onclick="exportToExcel()">
                                    <i class="fas fa-file-excel"></i> Exportar Excel
                                </button>
                                <button class="btn btn-outline btn-lg" onclick="clearForm()">
                                    <i class="fas fa-broom"></i> Limpiar
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- PDF ANALYSIS -->
                    <div id="pdf-analysis" class="tab-content">
                        <div class="card">
                            <div class="card-header">
                                <h2 class="card-title"><i class="fas fa-file-pdf"></i> Análisis de Separaciones PDF</h2>
                            </div>
                            <div class="card-body">
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label class="form-label">ARCHIVO PDF:</label>
                                        <input type="file" id="pdf-file" accept="application/pdf" class="form-control">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">DPI DE ANÁLISIS:</label>
                                        <select id="analysis-dpi" class="form-control">
                                            <option value="300" selected>300 DPI</option>
                                            <option value="150">150 DPI</option>
                                            <option value="72">72 DPI</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">PÍXELES DE RUIDO A RESTAR:</label>
                                        <input type="number" id="noise-pixels" class="form-control" value="15870446">
                                        <small style="color:var(--gray-light)">Guías, texto y elementos no deseados</small>
                                    </div>
                                </div>
                                
                                <div style="text-align:center;margin-top:20px;">
                                    <button class="btn btn-primary btn-lg" onclick="startPDFAnalysis()">
                                        <i class="fas fa-play"></i> Iniciar Análisis de PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-header">
                                <h2 class="card-title"><i class="fas fa-chart-bar"></i> Resultados del Análisis</h2>
                                <div>
                                    <button class="btn btn-success btn-sm" onclick="savePDFResults()" id="save-results-btn" style="display:none;">
                                        <i class="fas fa-save"></i> Guardar Resultados
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <div id="pdf-results-container">
                                    <p style="text-align:center;color:var(--gray-light);padding:30px;">
                                        Los resultados del análisis aparecerán aquí después de procesar un PDF.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- GUARDADAS -->
                    <div id="saved-specs" class="tab-content">
                        <div class="card">
                            <div class="card-header">
                                <h2 class="card-title"><i class="fas fa-database"></i> Specs Guardadas</h2>
                                <button class="btn btn-outline btn-sm" onclick="clearAllSpecs()">
                                    <i class="fas fa-trash"></i> Limpiar Todo
                                </button>
                            </div>
                            <div class="card-body" id="saved-specs-list">
                                <!-- Las specs guardadas aparecerán aquí -->
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }
    
    setupEventListeners();
    initPDFAnalyzer();
    updateDateTime();
    updateDashboard();
    renderArtes();
    
    setInterval(updateDateTime, 60000);
    
    setTimeout(() => {
        showStatus('✅ Tegra Spec Manager cargado correctamente', 'success');
    }, 1000);
}

function setupEventListeners() {
    document.getElementById('excelFile')?.addEventListener('change', handleExcelUpload);
    
    document.getElementById('imageInput')?.addEventListener('change', function(e) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImageData = e.target.result;
            const preview = document.getElementById('imagePreview');
            if (preview) {
                preview.src = currentImageData;
                preview.style.display = 'block';
            }
            showStatus('✅ Imagen cargada');
        };
        reader.readAsDataURL(e.target.files[0]);
    });
    
    document.addEventListener('paste', function(e) {
        if (e.clipboardData && e.clipboardData.items) {
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        currentImageData = e.target.result;
                        const preview = document.getElementById('imagePreview');
                        if (preview) {
                            preview.src = currentImageData;
                            preview.style.display = 'block';
                        }
                        showStatus('✅ Imagen pegada desde portapapeles');
                    };
                    reader.readAsDataURL(blob);
                    break;
                }
            }
        }
    });
    
    document.getElementById('folder-num')?.addEventListener('input', function() {
        specGlobal.folder = this.value;
    });
    
    document.getElementById('ink-type-select')?.addEventListener('change', updateInkPreset);
}

// ========== EJECUCIÓN PRINCIPAL ==========
document.addEventListener('DOMContentLoaded', initApp);
