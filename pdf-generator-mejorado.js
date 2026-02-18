// ========== pdf-generator-mejorado.js - VERSIÓN OPTIMIZADA ==========
// Generador de PDF profesional con html2canvas

async function generateProfessionalPDF(data) {
    console.log('[PDF] Iniciando generación con datos:', data);
    
    // Validaciones rápidas
    if (!window.jspdf?.jsPDF) throw new Error('jsPDF no está cargado');
    if (!window.html2canvas) throw new Error('html2canvas no está cargado');
    
    const { jsPDF } = window.jspdf;
    const placements = data?.placements?.length ? data.placements : [{}];
    
    // Resolver logos una sola vez
    const logos = await resolveLogos(data);
    
    // Host temporal para renderizado
    const host = createRenderHost();
    
    try {
        // Generar canvas para cada placement
        const canvases = [];
        for (let i = 0; i < placements.length; i++) {
            console.log(`[PDF] Renderizando placement ${i + 1}/${placements.length}`);
            
            host.innerHTML = buildPageHTML(data, placements[i], i, placements.length, logos);
            const container = host.querySelector('.pdf-container');
            if (!container) throw new Error('No se pudo crear el layout');
            
            await waitForImages(container);
            await new Promise(r => setTimeout(r, 200)); // Estabilización
            
            const canvas = await html2canvas(container, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                allowTaint: true,
                logging: false,
                windowWidth: 1050,
                windowHeight: Math.min(container.scrollHeight, 2000)
            });
            
            canvases.push(canvas);
        }
        
        // Crear PDF y agregar páginas
        return createPDFFromCanvases(canvases);
        
    } finally {
        host.remove();
        console.log('[PDF] Render host eliminado');
    }
}

// ========== FUNCIONES PRIVADAS ==========

function createRenderHost() {
    const host = document.createElement('div');
    host.id = 'pdf-render-host';
    host.style.cssText = 'position:fixed; left:-9999px; top:0; width:1050px; background:white; z-index:-1; opacity:0; pointer-events:none;';
    document.body.appendChild(host);
    return host;
}

async function resolveLogos(data) {
    const cfg = window.LogoConfig || {};
    const customerKey = normalizeKey(data?.customer || '');
    
    return {
        tegra: await toDataURL(cfg.TEGRA || 'https://raw.githubusercontent.com/veleztegra-create/costos/main/tegra%20logo.png'),
        customer: await toDataURL(cfg[customerKey] || '')
    };
}

function normalizeKey(str) {
    return String(str || '').toUpperCase()
        .replace(/&/g, 'AND')
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

async function toDataURL(src) {
    if (!src || src.startsWith('data:')) return src;
    
    try {
        const res = await fetch(src, { mode: 'cors', cache: 'force-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn('[PDF] No se pudo cargar imagen:', src);
        return '';
    }
}

function waitForImages(root) {
    const images = root.querySelectorAll('img');
    if (!images.length) return Promise.resolve();
    
    return Promise.all([...images].map(img => new Promise(resolve => {
        if (img.complete && img.naturalWidth) return resolve();
        
        const timeout = setTimeout(() => {
            console.warn('[PDF] Timeout imagen:', img.alt);
            resolve();
        }, 2000);
        
        img.onload = () => { clearTimeout(timeout); resolve(); };
        img.onerror = () => { clearTimeout(timeout); resolve(); };
    })));
}

function createPDFFromCanvases(canvases) {
    const pdf = new window.jspdf.jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'letter'
    });
    
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 6.35; // 1/4 pulgada
    const printableW = pageW - margin * 2;
    
    let pageCount = 0;
    
    canvases.forEach((canvas, idx) => {
        const imgW = canvas.width;
        const imgH = canvas.height;
        const sliceH = Math.floor((pageH - margin * 2) / printableW * imgW);
        
        for (let offset = 0; offset < imgH; offset += sliceH) {
            if (pageCount++ > 0) pdf.addPage();
            
            const currentSlice = Math.min(sliceH, imgH - offset);
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = imgW;
            sliceCanvas.height = currentSlice;
            
            const ctx = sliceCanvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, imgW, currentSlice);
            ctx.drawImage(canvas, 0, offset, imgW, currentSlice, 0, 0, imgW, currentSlice);
            
            pdf.addImage(
                sliceCanvas.toDataURL('image/jpeg', 0.95),
                'JPEG',
                margin,
                margin,
                printableW,
                (currentSlice / imgW) * printableW,
                undefined,
                'FAST'
            );
        }
    });
    
    console.log(`[PDF] Generado con ${pageCount} página(s)`);
    return pdf.output('blob');
}

// ========== CONSTRUCCIÓN HTML DEL PDF ==========
function buildPageHTML(data, placement, index, total, logos) {
    const esc = str => String(str || '').replace(/[&<>"]/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
    })[m]);
    
    // Datos básicos
    const customer = esc(data.customer || 'N/A').toUpperCase();
    const type = esc(placement.title || placement.type || 'FRONT').toUpperCase();
    const colors = placement.colors || [];
    const stations = generateStations(placement);
    
    // Información general
    const infoRows = [
        ['Cliente', data.customer], ['Season', data.season],
        ['Style', data.style], ['Colorway', data.colorway],
        ['P.O. #', data.po], ['Team', data.nameTeam],
        ['Sample Type', data.sampleType], ['Gender', data.gender],
        ['Designer', data.designer], ['Desarrollado por', data.developedBy || '']
    ];
    
    // HTML de colores
    const colorsHTML = colors.length ? colors.map((c, i) => {
        const name = esc(c.val || 'N/A');
        const hex = getColorHex(c.val) || '#999999';
        return `
            <div class="color-item">
                <div class="color-box" style="background:${hex};"></div>
                <div class="color-label">
                    <span class="color-number">${i + 1}</span>
                    <span class="color-name">${name}</span>
                </div>
            </div>
        `;
    }).join('') : '<div class="muted">Sin colores</div>';
    
    // HTML de secuencia
    const seqHTML = stations.length ? stations.map(row => {
        if (row.screenCombined === 'FLASH' || row.screenCombined === 'COOL') {
            return `<tr class="flash-row"><td colspan="9">${row.screenCombined}</td></tr>`;
        }
        return `
            <tr>
                <td>${row.st}</td>
                <td class="screen-letter">${row.screenLetter || ''}</td>
                <td>${row.screenCombined}</td>
                <td>${row.add || ''}</td>
                <td>${row.mesh || ''}</td>
                <td>${row.strokes || ''}</td>
                <td>${row.angle || ''}</td>
                <td>${row.pressure || ''}</td>
                <td>${row.duro || ''}</td>
            </tr>
        `;
    }).join('') : '<tr><td colspan="9" class="muted">Sin secuencia</td></tr>';
    
    // Comentarios
    const comments = esc(placement.technicalComments || placement.specialInstructions || data.technicalComments || '');
    
    // Logos
    const tegraLogo = logos.tegra ? `<img class="logo-tegra" src="${logos.tegra}" alt="TEGRA">` : '<div class="logo-fallback">TEGRA</div>';
    const customerLogo = logos.customer ? `<img class="logo-customer" src="${logos.customer}" alt="${customer}">` : `<span class="customer-fallback">${customer}</span>`;
    
    // Fecha
    const date = new Date().toLocaleString('es-ES', { hour12: false });
    
    return `
        <style>
            .pdf-container {
                width: 1050px;
                background: white;
                font-family: Arial, Helvetica, sans-serif;
                color: #1a1a1a;
            }
            .header {
                background: linear-gradient(135deg, #8B0000, #E31837);
                color: white;
                display: grid;
                grid-template-columns: 180px 1fr 200px 140px;
                min-height: 90px;
                align-items: center;
            }
            .header-logo, .header-title, .header-customer, .header-folder {
                padding: 14px;
            }
            .header-logo { border-right: 1px solid rgba(255,255,255,0.2); }
            .logo-tegra { max-width: 145px; max-height: 52px; filter: brightness(0) invert(1); }
            .header-title h1 { font-size: 30px; margin: 0; }
            .header-title p { font-size: 12px; opacity: 0.9; margin: 5px 0 0; }
            .header-customer {
                border-left: 1px solid rgba(255,255,255,0.2);
                border-right: 1px solid rgba(255,255,255,0.2);
                text-align: center;
            }
            .customer-label { font-size: 10px; opacity: 0.86; margin-bottom: 7px; }
            .logo-customer { max-width: 150px; max-height: 26px; object-fit: contain; }
            .folder-number { font-size: 35px; font-weight: 800; }
            .info-section {
                background: #f5f5f5;
                padding: 18px 22px;
                border-bottom: 3px solid #E31837;
            }
            .section-title {
                font-size: 22px;
                color: #E31837;
                margin: 0 0 10px 0;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px 30px;
            }
            .info-row {
                display: flex;
                gap: 8px;
            }
            .info-label {
                font-weight: 700;
                font-size: 12px;
                min-width: 115px;
            }
            .info-value {
                font-size: 13px;
                border-bottom: 1px solid #ccc;
                flex: 1;
            }
            .placement-section { padding: 18px 22px; }
            .placement-header {
                background: #E31837;
                color: white;
                padding: 10px 14px;
                font-size: 22px;
                font-weight: 700;
                margin: -18px -22px 14px;
            }
            .placement-content {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-bottom: 14px;
            }
            .image-container {
                background: linear-gradient(135deg, #f8f8f8, #e8e8e8);
                border-radius: 8px;
                border: 2px solid #e0e0e0;
                min-height: 250px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            .placement-image {
                max-width: 100%;
                max-height: 250px;
                object-fit: contain;
            }
            .placement-badge {
                position: absolute;
                top: 8px;
                right: 8px;
                background: #E31837;
                color: white;
                padding: 5px 9px;
                border-radius: 4px;
                font-size: 11px;
            }
            .details-panel {
                background: #f5f5f5;
                border-radius: 8px;
                padding: 12px;
                border-left: 4px solid #E31837;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #ddd;
            }
            .detail-row:last-child { border-bottom: none; }
            .detail-label {
                font-size: 11px;
                font-weight: 700;
                color: #666;
            }
            .detail-value {
                font-size: 13px;
                font-weight: 700;
            }
            .colors-section {
                margin: 14px 0;
            }
            .colors-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 8px;
            }
            .color-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 10px;
                background: #f5f5f5;
                border: 1px solid #e0e0e0;
                border-radius: 6px;
                min-width: 170px;
            }
            .color-box {
                width: 20px;
                height: 20px;
                border-radius: 4px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            }
            .color-number {
                font-size: 11px;
                font-weight: 700;
                color: #E31837;
                display: block;
            }
            .color-name { font-size: 11px; }
            .sequence-header {
                background: #E31837;
                color: white;
                padding: 9px 12px;
                font-weight: 700;
            }
            .sequence-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 10px;
            }
            .sequence-table th {
                background: #1a1a1a;
                color: white;
                padding: 6px 5px;
                text-align: left;
            }
            .sequence-table td {
                padding: 5px;
                border-bottom: 1px solid #eee;
            }
            .screen-letter { color: #E31837; font-weight: 700; }
            .flash-row { background: #f5f5f5; font-style: italic; }
            .curing-section {
                background: #f5f5f5;
                border-left: 4px solid #E31837;
                border-radius: 8px;
                padding: 10px;
                margin: 14px 0;
            }
            .curing-title {
                font-size: 13px;
                font-weight: 800;
                color: #E31837;
                margin-bottom: 6px;
            }
            .curing-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                text-align: center;
            }
            .curing-value { font-size: 19px; font-weight: 800; }
            .comments-section {
                border: 1px solid #ffc107;
                border-radius: 6px;
                overflow: hidden;
            }
            .comments-title {
                background: #ffc107;
                padding: 7px 10px;
                font-weight: 800;
            }
            .comments-body {
                background: #fffde7;
                padding: 10px;
                font-size: 12px;
                min-height: 42px;
            }
            .footer {
                background: #1a1a1a;
                color: white;
                padding: 10px 14px;
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                margin-top: 14px;
            }
            .muted { color: #777; text-align: center; padding: 8px; }
        </style>
        
        <div class="pdf-container">
            <!-- HEADER -->
            <div class="header">
                <div class="header-logo">${tegraLogo}</div>
                <div class="header-title">
                    <h1>Technical Spec Manager</h1>
                    <p>Sistema de gestión de especificaciones</p>
                </div>
                <div class="header-customer">
                    <div class="customer-label">CUSTOMER / CLIENTE</div>
                    <div>${customerLogo}</div>
                </div>
                <div class="header-folder">
                    <div class="customer-label"># FOLDER</div>
                    <div class="folder-number">${esc(data.folder || '#####')}</div>
                </div>
            </div>
            
            <!-- INFO GENERAL -->
            <div class="info-section">
                <h2 class="section-title">Información General</h2>
                <div class="info-grid">
                    ${infoRows.map(([l, v]) => `
                        <div class="info-row">
                            <span class="info-label">${l}:</span>
                            <span class="info-value">${esc(v || '---')}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- PLACEMENT -->
            <div class="placement-section">
                <div class="placement-header">Placement: ${type}</div>
                
                <div class="placement-content">
                    <!-- Imagen -->
                    <div class="image-container">
                        <span class="placement-badge">${type}</span>
                        ${placement.imageData ? 
                            `<img class="placement-image" src="${placement.imageData}" crossorigin="anonymous">` : 
                            '<div class="muted">Sin imagen</div>'}
                    </div>
                    
                    <!-- Detalles -->
                    <div class="details-panel">
                        <div class="detail-row">
                            <span class="detail-label">Tipo de Tinta</span>
                            <span class="detail-value">${esc(placement.inkType || 'WATER')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Dimensiones</span>
                            <span class="detail-value">${esc(placement.width || '##')} x ${esc(placement.height || '##')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Ubicación</span>
                            <span class="detail-value">${esc(placement.placementDetails || '---')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Especialidades</span>
                            <span class="detail-value">${esc(placement.specialties || '—')}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Colores -->
                <div class="colors-section">
                    <h3 style="font-size:12px; margin:0 0 8px 0;">Colores y Tintas</h3>
                    <div class="colors-grid">${colorsHTML}</div>
                </div>
                
                <!-- Secuencia -->
                <div class="sequence-header">Secuencia de Impresión - ${type}</div>
                <table class="sequence-table">
                    <thead>
                        <tr>
                            <th>Est</th><th>Scr.</th><th>Screen (Tinta/Proceso)</th>
                            <th>Aditivos</th><th>Malla</th><th>Strokes</th>
                            <th>Angle</th><th>Pressure</th><th>Duro</th>
                        </tr>
                    </thead>
                    <tbody>${seqHTML}</tbody>
                </table>
                
                <!-- Curado -->
                <div class="curing-section">
                    <div class="curing-title">Condiciones de Curado</div>
                    <div class="curing-grid">
                        <div>
                            <div class="detail-label">Temperatura</div>
                            <div class="curing-value">${esc(placement.temp || '320°F')}</div>
                        </div>
                        <div>
                            <div class="detail-label">Tiempo</div>
                            <div class="curing-value">${esc(placement.time || '1:40 min')}</div>
                        </div>
                        <div>
                            <div class="detail-label">Tinta</div>
                            <div class="curing-value" style="font-size:16px;">${esc(placement.inkType || 'WATER')}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Comentarios -->
                ${comments ? `
                    <div class="comments-section">
                        <div class="comments-title">Comentarios Técnicos</div>
                        <div class="comments-body">${comments}</div>
                    </div>
                ` : ''}
            </div>
            
            <!-- FOOTER -->
            <div class="footer">
                <div>Generado: ${esc(date)}</div>
                <div><strong>TEGRA SPEC MANAGER</strong></div>
                <div>Placement ${index + 1} de ${total}</div>
            </div>
        </div>
    `;
}

// ========== GENERAR SECUENCIA DE ESTACIONES ==========
function generateStations(placement) {
    if (!placement?.colors?.length) return [];
    
    const stations = [];
    let st = 1;
    const preset = getInkPreset(placement.inkType || 'WATER');
    
    placement.colors.forEach((color, idx) => {
        // Valores base
        const base = {
            screenLetter: color.screenLetter || '',
            screenCombined: color.val || '---',
            mesh: placement.meshColor || preset.color.mesh,
            strokes: placement.strokes || preset.color.strokes,
            duro: placement.durometer || preset.color.durometer,
            angle: placement.angle || preset.color.angle,
            pressure: placement.pressure || preset.color.pressure,
            add: placement.additives || preset.color.additives
        };
        
        // Ajustes por tipo
        if (color.type === 'BLOCKER') {
            base.mesh = placement.meshBlocker || preset.blocker.mesh1;
            base.add = placement.additives || preset.blocker.additives;
            base.screenCombined = preset.blocker.name;
        } else if (color.type === 'WHITE_BASE') {
            base.mesh = placement.meshWhite || preset.white.mesh1;
            base.add = placement.additives || preset.white.additives;
            base.screenCombined = preset.white.name;
        } else if (color.type === 'METALLIC') {
            base.mesh = '110/64';
            base.strokes = '1';
            base.duro = '70';
            base.add = 'Catalizador especial';
        }
        
        stations.push({ st: st++, ...base });
        
        // Flash y Cool entre colores
        if (idx < placement.colors.length - 1) {
            stations.push({ st: st++, screenCombined: 'FLASH', mesh: '-', strokes: '-', duro: '-', angle: '-', pressure: '-', add: '' });
            stations.push({ st: st++, screenCombined: 'COOL', mesh: '-', strokes: '-', duro: '-', angle: '-', pressure: '-', add: '' });
        }
    });
    
    return stations;
}

// ========== OBTENER COLOR HEX ==========
function getColorHex(name) {
    if (!name) return null;
    
    // Usar ColorConfig si existe
    if (window.ColorConfig?.findColorHex) {
        const hex = window.ColorConfig.findColorHex(name);
        if (hex) return hex;
    }
    
    // Colores básicos
    const basics = {
        'RED': '#FF0000', 'BLUE': '#0000FF', 'GREEN': '#00FF00',
        'BLACK': '#000000', 'WHITE': '#FFFFFF', 'YELLOW': '#FFFF00',
        'GOLD': '#FFD700', 'SILVER': '#C0C0C0', 'NAVY': '#000080'
    };
    
    const upper = name.toUpperCase();
    for (const [key, hex] of Object.entries(basics)) {
        if (upper.includes(key)) return hex;
    }
    
    // Hex directo
    const match = name.match(/#([0-9A-F]{6})/i);
    return match ? `#${match[1]}` : null;
}

// ========== OBTENER PRESET DE TINTA ==========
function getInkPreset(inkType) {
    const base = {
        temp: '320°F',
        time: inkType === 'WATER' ? '1:00 min' : '1:40 min',
        blocker: { name: 'BLOCKER CHT', mesh1: '122/55', additives: 'N/A' },
        white: { name: 'AQUAFLEX WHITE', mesh1: '198/40', additives: 'N/A' },
        color: { mesh: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: '3% cross-linker 500 · 1.5% antitack' }
    };
    
    if (window.Config?.INK_PRESETS?.[inkType]) {
        return window.Config.INK_PRESETS[inkType];
    }
    
    return base;
}

// ========== EXPORTAR ==========
window.generateProfessionalPDF = generateProfessionalPDF;
