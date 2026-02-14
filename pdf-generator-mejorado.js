// pdf-generator-mejorado.js
// Plan C refinado: HTML mockup -> canvas -> PDF (sin distorsión + logos reales)

async function generateProfessionalPDF(data) {
  if (typeof window.jspdf === 'undefined') throw new Error('jsPDF no está cargado.');
  if (typeof window.html2canvas === 'undefined') throw new Error('html2canvas no está cargado.');

  const { jsPDF } = window.jspdf;
  const placements = Array.isArray(data?.placements) && data.placements.length ? data.placements : [{}];
  const logos = await resolvePdfLogos(data);

  const host = document.createElement('div');
  host.id = 'tegra-pdf-render-host';
  host.style.position = 'fixed';
  host.style.left = '-30000px';
  host.style.top = '0';
  host.style.width = '1050px';
  host.style.zIndex = '-1';
  host.style.background = '#ffffff';
  document.body.appendChild(host);

  try {
    const canvases = [];
    for (let i = 0; i < placements.length; i++) {
      host.innerHTML = buildSpecPageHtml(data, placements[i], i, placements.length, logos);
      await waitForImages(host.firstElementChild);

      const canvas = await window.html2canvas(host.firstElementChild, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false
      });
      canvases.push(canvas);
    }

    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'letter' });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();

    let pageIndex = 0;
    canvases.forEach((canvas) => {
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgW = canvas.width;
      const imgH = canvas.height;
      const slicePx = Math.floor((pdfH / pdfW) * imgW);

      for (let offsetY = 0; offsetY < imgH; offsetY += slicePx) {
        const currentSliceHeight = Math.min(slicePx, imgH - offsetY);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = imgW;
        sliceCanvas.height = currentSliceHeight;

        const ctx = sliceCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, offsetY, imgW, currentSliceHeight, 0, 0, imgW, currentSliceHeight);

        if (pageIndex > 0) pdf.addPage('letter', 'p');
        const sliceImg = sliceCanvas.toDataURL('image/jpeg', 0.95);
        const renderH = (currentSliceHeight / imgW) * pdfW;
        pdf.addImage(sliceImg, 'JPEG', 0, 0, pdfW, renderH, undefined, 'FAST');
        pageIndex += 1;
      }
    });

    return pdf.output('blob');
  } finally {
    host.remove();
  }
}

async function resolvePdfLogos(data) {
  const logoCfg = window.LogoConfig || {};
  const customerKey = normalizeLogoKey(data?.customer || '');
  const customerSrc = logoCfg[customerKey] || '';
  const tegraSrc = logoCfg.TEGRA || '';

  return {
    tegra: await toDataUrlIfPossible(tegraSrc),
    customer: await toDataUrlIfPossible(customerSrc)
  };
}

function normalizeLogoKey(customer) {
  return String(customer || '')
    .toUpperCase()
    .replace(/&/g, 'AND')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

async function toDataUrlIfPossible(src) {
  const input = String(src || '').trim();
  if (!input) return '';
  if (input.startsWith('data:')) return input;

  try {
    const res = await fetch(input, { mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onloadend = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  } catch (_) {
    return input;
  }
}

function waitForImages(root) {
  const images = Array.from(root.querySelectorAll('img'));
  if (!images.length) return Promise.resolve();

  return Promise.all(images.map((img) => new Promise((resolve) => {
    if (img.complete) return resolve();
    const done = () => resolve();
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  })));
}

function buildSpecPageHtml(data, placement, index, total, logos = {}) {
  const escaped = (v) => String(v ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  const customer = escaped((data.customer || 'N/A').toUpperCase());
  const placementType = escaped((placement.title || placement.type || 'FRONT').toUpperCase());
  const colors = Array.isArray(placement.colors) ? placement.colors : [];
  const stations = generateStationsDataProfessional(placement);

  const infoRows = [
    ['Cliente', data.customer], ['Season', data.season],
    ['Style', data.style], ['Colorway', data.colorway],
    ['P.O. #', data.po], ['Team', data.nameTeam],
    ['Sample Type', data.sampleType], ['Gender', data.gender],
    ['Designer', data.designer], ['Desarrollado por', data.developedBy || data.sampleDevelopedBy]
  ];

  const infoHtml = infoRows.map(([label, val]) => `
    <div class="info-row">
      <span class="info-label">${escaped(label)}:</span>
      <span class="info-value">${escaped(val || '---')}</span>
    </div>`).join('');

  const colorsHtml = colors.length ? colors.map((c, i) => {
    const name = escaped(c?.val || 'N/A');
    const hex = escapeCssColor(window.Utils?.getColorHex?.(c?.val) || '#999999');
    return `<div class="color-swatch"><div class="color-box" style="background:${hex};"></div><div class="color-info"><span class="color-number">${i + 1}</span><span class="color-name">${name}</span></div></div>`;
  }).join('') : '<div class="muted">Sin colores registrados.</div>';

  const seqRowsHtml = stations.length ? stations.map((row) => {
    const isFlash = /FLASH|COOL/.test(String(row.screenCombined || '').toUpperCase());
    if (isFlash) {
      return `<tr class="flash-row"><td class="station-number">${escaped(row.st)}</td><td></td><td colspan="7">${escaped(row.screenCombined)}</td></tr>`;
    }
    return `<tr>
      <td class="station-number">${escaped(row.st)}</td>
      <td class="screen-letter">${escaped(row.screenLetter)}</td>
      <td class="ink-name">${escaped(row.screenCombined)}</td>
      <td class="additives">${escaped(row.add || '')}</td>
      <td>${escaped(row.mesh)}</td>
      <td>${escaped(row.strokes)}</td>
      <td>${escaped(row.angle)}</td>
      <td>${escaped(row.pressure)}</td>
      <td>${escaped(row.duro)}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="9" class="muted">Sin secuencia de impresión.</td></tr>';

  const technicalComments = escaped(placement.technicalComments || placement.specialInstructions || data.technicalComments || 'Ningún comentario técnico registrado.');
  const placementImage = placement.imageData && String(placement.imageData).startsWith('data:') ? String(placement.imageData) : '';
  const tegraLogoHtml = logos.tegra ? `<img class="tegra-logo" src="${logos.tegra}" alt="TEGRA">` : '<div class="tegra-fallback">TEGRA</div>';
  const customerLogoHtml = logos.customer ? `<img class="customer-logo" src="${logos.customer}" alt="${customer}">` : `<span class="customer-fallback">${customer}</span>`;

  const now = new Date().toLocaleString('es-ES', { hour12: false });

  return `
  <div class="mockup-container">
    <style>
      :root { --tegra-red:#E31837; --tegra-red-dark:#8B0000; --tegra-gray-dark:#1A1A1A; --tegra-gray-light:#F5F5F5; --text-dark:#1A1A1A; --text-muted:#666; --border-light:#E0E0E0; }
      *{ box-sizing:border-box; margin:0; padding:0; }
      .mockup-container{ width:1050px; background:white; color:var(--text-dark); font-family:Arial,Helvetica,sans-serif; }
      .spec-header{ background:linear-gradient(135deg,var(--tegra-red-dark),var(--tegra-red)); color:#fff; display:grid; grid-template-columns:180px 1fr 200px 140px; min-height:90px; align-items:center; }
      .header-logo,.header-title,.header-customer,.header-folder{ padding:14px; }
      .header-logo{ border-right:1px solid rgba(255,255,255,.22); display:flex; align-items:center; justify-content:center; }
      .tegra-logo{ max-width:145px; max-height:52px; object-fit:contain; filter:brightness(0) invert(1); }
      .tegra-fallback{ font-weight:800; font-size:34px; }
      .header-title h1{ font-size:30px; letter-spacing:.6px; text-transform:uppercase; }
      .header-title p{ margin-top:5px; font-size:12px; opacity:.9; }
      .header-customer{ border-left:1px solid rgba(255,255,255,.22); border-right:1px solid rgba(255,255,255,.22); text-align:center; }
      .header-customer-label{ font-size:10px; text-transform:uppercase; opacity:.86; margin-bottom:7px; font-weight:700; }
      .header-customer-logo{ background:rgba(255,255,255,.95); border-radius:4px; padding:8px 10px; min-height:42px; display:flex; align-items:center; justify-content:center; }
      .customer-logo{ max-width:150px; max-height:26px; object-fit:contain; }
      .customer-fallback{ font-size:13px; font-weight:700; color:#1a1a1a; }
      .header-folder{ text-align:right; }
      .folder-label{ font-size:10px; text-transform:uppercase; opacity:.86; }
      .folder-number{ font-size:35px; font-weight:800; line-height:1.1; }
      .info-section{ background:var(--tegra-gray-light); padding:18px 22px; border-bottom:3px solid var(--tegra-red); }
      .section-title{ font-size:22px; text-transform:uppercase; color:var(--tegra-red); margin-bottom:10px; }
      .info-grid{ display:grid; grid-template-columns:1fr 1fr; gap:10px 30px; }
      .info-row{ display:flex; align-items:baseline; gap:8px; }
      .info-label{ font-weight:700; font-size:12px; text-transform:uppercase; min-width:115px; }
      .info-value{ font-size:13px; font-weight:600; border-bottom:1px solid #ccc; flex:1; }
      .placement-section{ padding:18px 22px; }
      .placement-header-bar{ margin:-18px -22px 14px; background:var(--tegra-red); color:white; padding:10px 14px; font-size:22px; font-weight:700; text-transform:uppercase; }
      .placement-content{ display:grid; grid-template-columns:1fr 1fr; gap:16px; }
      .placement-image-container{ position:relative; min-height:250px; background:linear-gradient(135deg,#f8f8f8,#e8e8e8); border-radius:8px; border:2px solid var(--border-light); display:flex; align-items:center; justify-content:center; overflow:hidden; }
      .placement-image{ width:100%; height:100%; object-fit:contain; }
      .placement-placeholder{ font-size:14px; color:#777; }
      .placement-badge{ position:absolute; top:8px; right:8px; background:var(--tegra-red); color:white; padding:5px 9px; border-radius:4px; font-size:11px; font-weight:700; }
      .placement-details-panel{ background:var(--tegra-gray-light); border-radius:8px; padding:12px; border-left:4px solid var(--tegra-red); }
      .detail-row{ display:flex; justify-content:space-between; gap:8px; padding:8px 0; border-bottom:1px solid #ddd; }
      .detail-row:last-child{ border-bottom:none; }
      .detail-label{ font-size:11px; font-weight:700; text-transform:uppercase; color:var(--text-muted); }
      .detail-value{ font-size:13px; font-weight:700; text-align:right; }
      .detail-value.highlight{ color:var(--tegra-red); }
      .colors-section,.sequence-section,.curing-section,.comments-section{ margin-top:14px; }
      .colors-grid{ display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }
      .color-swatch{ display:flex; align-items:center; gap:8px; padding:8px 10px; background:#f5f5f5; border:1px solid #e0e0e0; border-radius:6px; min-width:170px; }
      .color-box{ width:20px; height:20px; border:2px solid white; box-shadow:0 1px 3px rgba(0,0,0,.2); border-radius:4px; }
      .color-number{ font-size:11px; font-weight:700; color:var(--tegra-red); display:block; }
      .color-name{ font-size:11px; color:#444; }
      .sequence-header{ background:var(--tegra-red); color:#fff; padding:9px 12px; font-size:14px; font-weight:700; text-transform:uppercase; }
      .sequence-table{ width:100%; border-collapse:collapse; font-size:10px; table-layout:fixed; }
      .sequence-table th{ background:var(--tegra-gray-dark); color:#fff; padding:6px 5px; text-align:left; font-size:9px; }
      .sequence-table td{ border-bottom:1px solid #eee; padding:5px; vertical-align:top; overflow-wrap:anywhere; }
      .sequence-table th:nth-child(1), .sequence-table td:nth-child(1){ width:34px; text-align:center; }
      .sequence-table th:nth-child(2), .sequence-table td:nth-child(2){ width:34px; }
      .sequence-table th:nth-child(3), .sequence-table td:nth-child(3){ width:190px; }
      .sequence-table th:nth-child(4), .sequence-table td:nth-child(4){ width:170px; }
      .flash-row{ background:#f5f5f5; font-style:italic; }
      .station-number,.screen-letter{ font-weight:700; color:var(--tegra-red); }
      .curing-section{ background:linear-gradient(135deg,var(--tegra-gray-light),#e8e8e8); border-left:4px solid var(--tegra-red); border-radius:8px; padding:10px; }
      .curing-title{ font-size:13px; font-weight:800; color:var(--tegra-red); text-transform:uppercase; margin-bottom:6px; }
      .curing-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; text-align:center; }
      .curing-label{ font-size:10px; text-transform:uppercase; color:var(--text-muted); }
      .curing-value{ font-size:19px; font-weight:800; }
      .comments-section{ border:1px solid #e0b100; border-radius:6px; overflow:hidden; }
      .comments-title{ background:#ffc107; padding:7px 10px; font-size:12px; font-weight:800; text-transform:uppercase; }
      .comments-body{ background:#fffde7; padding:10px; font-size:12px; min-height:42px; }
      .spec-footer{ background:var(--tegra-gray-dark); color:#fff; margin-top:14px; padding:10px 14px; display:flex; justify-content:space-between; font-size:11px; }
      .muted{ color:#777; text-align:center; padding:8px; }
    </style>

    <header class="spec-header">
      <div class="header-logo">${tegraLogoHtml}</div>
      <div class="header-title"><h1>Technical Spec Manager</h1><p>Sistema de gestión de especificaciones técnicas</p></div>
      <div class="header-customer"><div class="header-customer-label">Customer / Cliente</div><div class="header-customer-logo">${customerLogoHtml}</div></div>
      <div class="header-folder"><div class="folder-label"># Folder</div><div class="folder-number">${escaped(data.folder || '#####')}</div></div>
    </header>

    <section class="info-section"><h2 class="section-title">Información General</h2><div class="info-grid">${infoHtml}</div></section>

    <section class="placement-section">
      <div class="placement-header-bar">Placement: ${placementType}</div>
      <div class="placement-content">
        <div class="placement-image-container">
          <span class="placement-badge">${placementType}</span>
          ${placementImage ? `<img class="placement-image" src="${placementImage}" alt="placement">` : '<div class="placement-placeholder">Sin imagen de referencia</div>'}
        </div>
        <div class="placement-details-panel">
          <div class="detail-row"><span class="detail-label">Tipo de Tinta</span><span class="detail-value highlight">${escaped(placement.inkType || 'WATER')}</span></div>
          <div class="detail-row"><span class="detail-label">Dimensiones</span><span class="detail-value">${escaped(`${placement.width || '--'} x ${placement.height || '--'}`)}</span></div>
          <div class="detail-row"><span class="detail-label">Ubicación</span><span class="detail-value">${escaped(placement.placementDetails || '---')}</span></div>
          <div class="detail-row"><span class="detail-label">Especialidades</span><span class="detail-value">${escaped(placement.specialties || '—')}</span></div>
        </div>
      </div>

      <div class="colors-section"><div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#555;">Colores y Tintas</div><div class="colors-grid">${colorsHtml}</div></div>

      <div class="sequence-section">
        <div class="sequence-header">Secuencia de Impresión - ${placementType}</div>
        <table class="sequence-table"><thead><tr><th>Est</th><th>Scr.</th><th>Screen (Tinta/Proceso)</th><th>Aditivos</th><th>Malla</th><th>Strokes</th><th>Angle</th><th>Pressure</th><th>Duro</th></tr></thead><tbody>${seqRowsHtml}</tbody></table>
      </div>

      <div class="curing-section"><h3 class="curing-title">Condiciones de Curado</h3><div class="curing-grid">
        <div><div class="curing-label">Temperatura</div><div class="curing-value">${escaped(placement.temp || '320°F')}</div></div>
        <div><div class="curing-label">Tiempo</div><div class="curing-value">${escaped(placement.time || '1:40 min')}</div></div>
        <div><div class="curing-label">Tipo de Tinta</div><div class="curing-value" style="font-size:16px;color:#E31837;">${escaped(placement.inkType || 'WATER')}</div></div>
      </div></div>

      <div class="comments-section"><div class="comments-title">Technical Comments / Comentarios Técnicos</div><div class="comments-body">${technicalComments}</div></div>
    </section>

    <footer class="spec-footer"><div>Generado: ${escaped(now)}</div><div><strong>TEGRA SPEC MANAGER</strong></div><div>Placement ${index + 1} de ${total}</div></footer>
  </div>`;
}

function escapeCssColor(hex) {
  const clean = String(hex || '').trim();
  return /^#?[0-9a-fA-F]{3,8}$/.test(clean) ? (clean.startsWith('#') ? clean : `#${clean}`) : '#999999';
}

function generateStationsDataProfessional(placement) {
  const stations = [];
  let stNum = 1;
  const preset = getInkPresetForPDFProfessional(placement.inkType || 'WATER');

  const meshColor = placement.meshColor || preset.color.mesh;
  const meshWhite = placement.meshWhite || preset.white.mesh1;
  const meshBlocker = placement.meshBlocker || preset.blocker.mesh1;
  const durometer = placement.durometer || preset.color.durometer;
  const strokes = placement.strokes || preset.color.strokes;
  const angle = placement.angle || preset.color.angle;
  const pressure = placement.pressure || preset.color.pressure;
  const speed = placement.speed || preset.color.speed;
  const additives = placement.additives || preset.color.additives;

  if (Array.isArray(placement.colors)) {
    placement.colors.forEach((item, idx) => {
      let mesh = meshColor;
      let strokesVal = strokes;
      let duro = durometer;
      let ang = angle;
      let press = pressure;
      let spd = speed;
      let add = additives;

      if (item.type === 'BLOCKER') {
        mesh = meshBlocker;
        add = preset.blocker.additives;
      }
      if (item.type === 'WHITE_BASE') {
        mesh = meshWhite;
        add = preset.white.additives;
      }
      if (item.type === 'METALLIC') {
        mesh = '110/64';
        strokesVal = '1';
        duro = '70';
        add = 'Catalizador especial';
      }

      stations.push({
        st: stNum++,
        screenLetter: item.screenLetter || '',
        screenCombined: item.val || '---',
        mesh,
        strokes: strokesVal,
        duro,
        angle: ang,
        pressure: press,
        speed: spd,
        add
      });

      if (idx < placement.colors.length - 1) {
        stations.push({ st: stNum++, screenLetter: '', screenCombined: 'FLASH', mesh: '-', strokes: '-', duro: '-', angle: '-', pressure: '-', speed: '-', add: '' });
        stations.push({ st: stNum++, screenLetter: '', screenCombined: 'COOL', mesh: '-', strokes: '-', duro: '-', angle: '-', pressure: '-', speed: '-', add: '' });
      }
    });
  }

  return stations;
}

function getInkPresetForPDFProfessional(inkType = 'WATER') {
  if (window.Config?.INK_PRESETS?.[inkType]) return window.Config.INK_PRESETS[inkType];
  return {
    temp: '320°F',
    time: '1:40 min',
    blocker: { name: 'BLOCKER CHT', mesh1: '122/55', additives: 'N/A' },
    white: { name: 'AQUAFLEX V2 WHITE', mesh1: '198/40', additives: 'N/A' },
    color: { mesh: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: '3% cross-linker 500 · 1.5% antitack' }
  };
}

window.generateProfessionalPDF = generateProfessionalPDF;
