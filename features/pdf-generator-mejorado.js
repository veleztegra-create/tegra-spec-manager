// Generador de HTML técnico (layout tipo carta) para descarga local

(function () {
  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  function getLogoKey(customer) {
    return String(customer || '')
      .toUpperCase()
      .replace(/&/g, 'AND')
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  function resolveColorHex(name) {
    try {
      if (window.ColorConfig?.findColorHex) return window.ColorConfig.findColorHex(name) || '#999999';
      if (window.Utils?.getColorHex) return window.Utils.getColorHex(name) || '#999999';
    } catch (_) {
      return '#999999';
    }
    return '#999999';
  }

  function getInkPreset(inkType = 'WATER') {
    if (window.Config?.INK_PRESETS?.[inkType]) return window.Config.INK_PRESETS[inkType];
    return {
      blocker: { mesh1: '122/55', additives: 'N/A' },
      white: { mesh1: '198/40', additives: 'N/A' },
      color: { mesh: '157/48', durometer: '70', angle: '15', strokes: '2', pressure: '40', additives: '3% cross-linker 500 · 1.5% antitack' }
    };
  }

  function generateStationsData(placement) {
    const stations = [];
    let st = 1;
    const preset = getInkPreset(placement.inkType || 'WATER');
    const meshColor = placement.meshColor || preset.color.mesh;
    const meshWhite = placement.meshWhite || preset.white.mesh1;
    const meshBlocker = placement.meshBlocker || preset.blocker.mesh1;
    const durometer = placement.durometer || preset.color.durometer;
    const strokes = placement.strokes || preset.color.strokes;
    const angle = placement.angle || preset.color.angle;
    const pressure = placement.pressure || preset.color.pressure;
    const additives = placement.additives || preset.color.additives;

    (placement.colors || []).forEach((item, idx, arr) => {
      let mesh = meshColor;
      let add = additives;
      let strokesVal = strokes;
      let duro = durometer;
      if (item.type === 'BLOCKER') {
        mesh = meshBlocker;
        add = preset.blocker.additives;
      } else if (item.type === 'WHITE_BASE') {
        mesh = meshWhite;
        add = preset.white.additives;
      } else if (item.type === 'METALLIC') {
        mesh = '110/64';
        strokesVal = '1';
        duro = '70';
        add = 'Catalizador especial';
      }

      stations.push({
        st: st++,
        screenLetter: item.screenLetter || '',
        screenCombined: item.val || '---',
        add,
        mesh,
        strokes: strokesVal,
        angle,
        pressure,
        duro
      });

      if (idx < arr.length - 1) {
        stations.push({ st: st++, screenLetter: '', screenCombined: 'FLASH' });
        stations.push({ st: st++, screenLetter: '', screenCombined: 'COOL' });
      }
    });

    return stations;
  }

  function buildPlacementHtml(placement, index, total, data) {
    const title = esc((placement.title || placement.type || `Placement ${index + 1}`).replace('CUSTOM: ', ''));
    const imageData = placement.imageData && String(placement.imageData).startsWith('data:')
      ? String(placement.imageData)
      : 'https://via.placeholder.com/200x180/E31837/FFFFFF?text=PLACEMENT';

    const uniqueDesignColors = [];
    const seenColorNames = new Set();
    (placement.colors || []).forEach((c) => {
      if (c.type !== 'COLOR' && c.type !== 'METALLIC') return;
      const normalized = String(c.val || '').toUpperCase().trim();
      if (!normalized || seenColorNames.has(normalized)) return;
      seenColorNames.add(normalized);
      uniqueDesignColors.push(c);
    });

    const colors = uniqueDesignColors.map((c, i) => `
      <div class="color-swatch">
        <div class="color-box" style="background:${esc(resolveColorHex(c.val))};"></div>
        <div class="color-info"><span class="color-number">${esc(c.screenLetter || String(i + 1))}</span><span class="color-name">${esc(c.val || '---')}</span></div>
      </div>`).join('') || '<div class="color-name">Sin colores registrados</div>';

    const rows = generateStationsData(placement).map((r) => {
      const isFlash = /FLASH|COOL/.test(String(r.screenCombined || '').toUpperCase());
      if (isFlash) {
        return `<tr class="flash-row"><td class="station-number">${esc(r.st)}</td><td></td><td colspan="7">${esc(r.screenCombined)}</td></tr>`;
      }
      return `<tr>
        <td class="station-number">${esc(r.st)}</td>
        <td class="screen-letter">${esc(r.screenLetter)}</td>
        <td class="ink-name">${esc(r.screenCombined)}</td>
        <td class="additives">${esc(r.add || '')}</td>
        <td>${esc(r.mesh || '')}</td>
        <td>${esc(r.strokes || '')}</td>
        <td>${esc(r.angle || '')}</td>
        <td>${esc(r.pressure || '')}</td>
        <td>${esc(r.duro || '')}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="9">Sin secuencia</td></tr>';

    return `
      <section class="placement-section">
        <div class="placement-header-bar"><div class="placement-icon">👕</div><span class="placement-title-text">Placement: ${title}</span></div>
        <div class="placement-content">
          <div class="placement-image-container"><span class="placement-badge">${title}</span><img src="${imageData}" class="placement-image" alt="${title}"></div>
          <div class="placement-details-panel">
            <div class="detail-row"><span class="detail-label">Tipo de Tinta</span><span class="detail-value highlight">${esc(placement.inkType || 'WATER')}</span></div>
            <div class="detail-row"><span class="detail-label">Dimensiones</span><span class="detail-value">${esc(`${placement.width || '--'} x ${placement.height || '--'}`)}</span></div>
            <div class="detail-row"><span class="detail-label">Ubicación</span><span class="detail-value">${esc(placement.placementDetails || '---')}</span></div>
            <div class="detail-row"><span class="detail-label">Especialidades</span><span class="detail-value">${esc(placement.specialties || '—')}</span></div>
            <div class="detail-row"><span class="detail-label">Talla Base</span><span class="detail-value">${esc(placement.baseSize || data.baseSize || '---')}</span></div>
          </div>
        </div>

        <div class="colors-section"><h3 class="sub-title">Colores y Tintas</h3><div class="colors-grid">${colors}</div></div>

        <div class="sequence-section">
          <div class="sequence-header">Secuencia de Impresión - ${title}</div>
          <table class="sequence-table">
            <thead><tr><th>Est</th><th>Scr.</th><th>Screen (Tinta/Proceso)</th><th>Aditivos</th><th>Malla</th><th>Strk</th><th>Ang</th><th>Pres</th><th>Duro</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>

        <div class="curing-section">
          <div class="curing-title">Condiciones de Curado</div>
          <div class="curing-grid">
            <div class="curing-item"><div class="curing-label">Temperatura</div><div class="curing-value">${esc(placement.temp || '320°F')}</div></div>
            <div class="curing-item"><div class="curing-label">Tiempo</div><div class="curing-value">${esc(placement.time || '1:40 min')}</div></div>
            <div class="curing-item"><div class="curing-label">Tela</div><div class="curing-value small">${esc(placement.fabric || data.fabric || '---')}</div></div>
          </div>
        </div>

        <div class="tech-section">
          <div class="sub-title" style="margin-bottom:8px;">Información Técnica</div>
          <div class="info-grid">
            <div class="info-row"><span class="info-label">NOMBRE TÉCNICO:</span><span class="info-value">${esc(data.technicianName || '________________________')}</span></div>
            <div class="info-row"><span class="info-label">COMENTARIOS TÉCNICOS:</span><span class="info-value">${esc(data.technicalComments || '____________________________________________')}</span></div>
          </div>
        </div>

        <footer class="spec-footer">
          <div class="footer-left">Generado: ${esc(new Date().toLocaleString('es-ES'))}</div>
          <div class="footer-center">TEGRA SPEC MANAGER</div>
          <div class="footer-right">Placement ${index + 1} de ${total}</div>
        </footer>
      </section>`;
  }

  function generateSpecHTMLDocument(data) {
    const placements = Array.isArray(data?.placements) && data.placements.length ? data.placements : [{}];
    const customerKey = getLogoKey(data.customer || '');
    const customerLogo = window.LogoConfig?.[customerKey] || '';
    const tegraLogo = window.LogoConfig?.TEGRA || '';

    const placementSections = placements.map((p, i) => buildPlacementHtml(p, i, placements.length, data)).join('');

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tegra Spec Manager - ${esc(data.style || 'Spec')}</title>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;700&family=Roboto+Condensed:wght@400;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style>
    :root { --tegra-red:#E31837; --tegra-red-dark:#8B0000; --tegra-gray-dark:#1A1A1A; --tegra-gray-light:#F5F5F5; --text-dark:#1A1A1A; --text-muted:#666; --border-light:#E0E0E0; --font-display:'Oswald',sans-serif; --font-condensed:'Roboto Condensed',sans-serif; --font-body:'Roboto',sans-serif; }
    *{margin:0;padding:0;box-sizing:border-box;} body{font-family:var(--font-body);background:linear-gradient(135deg,#f5f5f5 0%,#e0e0e0 100%);padding:20px;color:var(--text-dark);} .mockup-container{width:816px;margin:0 auto;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.3);border-radius:4px;overflow:visible;display:flex;flex-direction:column;}
    .spec-header{background:linear-gradient(135deg,var(--tegra-red-dark) 0%,var(--tegra-red) 100%);color:#fff;display:grid;grid-template-columns:140px 1fr 160px 100px;min-height:70px;align-items:center;position:relative;overflow:hidden;} .spec-header::before{content:'';position:absolute;top:-50%;right:-10%;width:300px;height:200%;background:rgba(255,255,255,.05);transform:rotate(15deg);} .header-logo{padding:15px;display:flex;align-items:center;justify-content:center;border-right:1px solid rgba(255,255,255,.2);} .header-logo svg{width:110px;height:auto;filter:brightness(0) invert(1);} .header-title{padding:15px 20px;z-index:1;} .header-title h1{font-family:var(--font-display);font-size:1.4rem;text-transform:uppercase;} .header-title p{font-size:.75rem;opacity:.9;} .header-customer{background:rgba(0,0,0,.2);padding:12px 15px;text-align:center;border-left:1px solid rgba(255,255,255,.2);border-right:1px solid rgba(255,255,255,.2);} .header-customer-label{font-size:.6rem;text-transform:uppercase;opacity:.8;margin-bottom:5px;} .header-customer-logo{background:#fff;padding:6px 10px;border-radius:4px;display:inline-block;} .header-customer-logo img{max-height:20px;max-width:80px;object-fit:contain;} .header-folder{padding:15px;text-align:right;z-index:1;} .folder-label{font-size:.65rem;text-transform:uppercase;opacity:.8;} .folder-number{font-family:var(--font-display);font-size:1.8rem;font-weight:700;}
    .info-section{background:var(--tegra-gray-light);padding:15px 20px;border-bottom:3px solid var(--tegra-red);} .section-title{font-family:var(--font-display);font-size:.9rem;font-weight:700;text-transform:uppercase;color:var(--tegra-red);margin-bottom:12px;display:flex;align-items:center;gap:8px;} .section-title::before{content:'';width:3px;height:18px;background:var(--tegra-red);} .info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px 30px;} .info-row{display:flex;gap:8px;} .info-label{font-family:var(--font-condensed);font-size:.75rem;font-weight:700;text-transform:uppercase;min-width:100px;} .info-value{font-size:.85rem;font-weight:500;flex:1;border-bottom:1px solid #ccc;padding-bottom:1px;}
    .placement-section{padding:20px;border-bottom:1px solid var(--border-light);display:flex;flex-direction:column;} .placement-header-bar{background:var(--tegra-red);color:#fff;padding:10px 15px;margin:-20px -20px 15px -20px;display:flex;gap:10px;align-items:center;} .placement-icon{width:28px;height:28px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;} .placement-title-text{font-family:var(--font-display);font-size:1.1rem;text-transform:uppercase;} .placement-content{display:grid;grid-template-columns:200px 1fr;gap:20px;margin-bottom:15px;} .placement-image-container{position:relative;background:linear-gradient(135deg,#f8f8f8 0%,#e8e8e8 100%);border-radius:6px;padding:12px;border:2px solid var(--border-light);height:fit-content;} .placement-image{width:100%;max-height:180px;object-fit:contain;border-radius:4px;} .placement-badge{position:absolute;top:8px;right:8px;background:var(--tegra-red);color:#fff;padding:4px 8px;border-radius:3px;font-size:.65rem;font-weight:700;text-transform:uppercase;} .placement-details-panel{background:var(--tegra-gray-light);border-radius:6px;padding:15px;border-left:3px solid var(--tegra-red);} .detail-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e0e0e0;} .detail-row:last-child{border-bottom:none;} .detail-label{font-family:var(--font-condensed);font-size:.75rem;font-weight:700;text-transform:uppercase;color:var(--text-muted);} .detail-value{font-size:.85rem;font-weight:600;} .detail-value.highlight{color:var(--tegra-red);} 
    .colors-section{margin-top:15px;padding:12px;background:#fff;border:1px solid var(--border-light);border-radius:6px;} .sub-title{font-family:var(--font-condensed);font-size:.8rem;text-transform:uppercase;color:var(--text-muted);} .colors-grid{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;} .color-swatch{display:flex;align-items:center;gap:8px;background:var(--tegra-gray-light);padding:8px 12px;border-radius:4px;border:1px solid var(--border-light);} .color-box{width:24px;height:24px;border-radius:3px;border:2px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,.2);} .color-number{font-family:var(--font-condensed);font-weight:700;font-size:.8rem;color:var(--tegra-red);} .color-name{font-size:.7rem;color:var(--text-muted);} 
    .sequence-section{margin-top:15px;} .sequence-header{background:var(--tegra-red);color:#fff;padding:8px 15px;font-family:var(--font-display);font-size:.85rem;text-transform:uppercase;} .sequence-table{width:100%;border-collapse:collapse;font-size:.75rem;} .sequence-table th{background:var(--tegra-gray-dark);color:#fff;padding:8px 6px;text-align:left;font-family:var(--font-condensed);font-size:.65rem;text-transform:uppercase;} .sequence-table td{padding:6px;border-bottom:1px solid var(--border-light);} .station-number{font-family:var(--font-display);font-size:.9rem;color:var(--tegra-red);text-align:center;} .screen-letter{font-weight:700;color:var(--tegra-red);} .ink-name{font-weight:600;} .additives{font-size:.7rem;color:var(--text-muted);font-style:italic;} .flash-row{background:#f5f5f5 !important;font-style:italic;color:var(--text-muted);} 
    .curing-section{margin-top:15px;background:linear-gradient(135deg,var(--tegra-gray-light) 0%,#e8e8e8 100%);border-radius:6px;padding:12px;border-left:3px solid var(--tegra-red);} .curing-title{font-family:var(--font-display);font-size:.85rem;color:var(--tegra-red);margin-bottom:10px;} .curing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;} .curing-item{text-align:center;} .curing-label{font-size:.7rem;text-transform:uppercase;color:var(--text-muted);} .curing-value{font-family:var(--font-display);font-size:1.2rem;font-weight:700;} .curing-value.small{font-size:1rem;}
    .spec-footer{background:var(--tegra-gray-dark);color:#fff;padding:10px 20px;display:flex;justify-content:space-between;font-size:.75rem;margin-top:20px;} .footer-center{font-family:var(--font-display);font-weight:700;letter-spacing:1px;}
  </style>
</head>
<body>
  <div class="mockup-container">
    <header class="spec-header">
      <div class="header-logo">
        ${tegraLogo ? `<img src="${esc(tegraLogo)}" alt="TEGRA" style="width:110px;height:auto;object-fit:contain;">` : `<span style="font-family:var(--font-display);font-size:1.2rem;font-weight:700;">TEGRA</span>`}
      </div>
      <div class="header-title"><h1>Technical Spec Manager</h1><p>Sistema de gestión de especificaciones técnicas</p></div>
      <div class="header-customer"><div class="header-customer-label">Customer / Cliente</div><div class="header-customer-logo">${customerLogo ? `<img src="${esc(customerLogo)}" alt="customer">` : `<span style="font-weight:700;color:#1a1a1a;">${esc((data.customer || 'N/A').toUpperCase())}</span>`}</div></div>
      <div class="header-folder"><div class="folder-label"># Folder</div><div class="folder-number">${esc(data.folder || '00000')}</div></div>
    </header>

    <section class="info-section">
      <h2 class="section-title">Información General</h2>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">Cliente:</span><span class="info-value">${esc(data.customer || '---')}</span></div>
        <div class="info-row"><span class="info-label">Season:</span><span class="info-value">${esc(data.season || '---')}</span></div>
        <div class="info-row"><span class="info-label">Style:</span><span class="info-value">${esc(data.style || '---')}</span></div>
        <div class="info-row"><span class="info-label">Colorway:</span><span class="info-value">${esc(data.colorway || '---')}</span></div>
        <div class="info-row"><span class="info-label">P.O. #:</span><span class="info-value">${esc(data.po || '---')}</span></div>
        <div class="info-row"><span class="info-label">Team:</span><span class="info-value">${esc(data.nameTeam || '---')}</span></div>
        <div class="info-row"><span class="info-label">Sample Type:</span><span class="info-value">${esc(data.sampleType || '---')}</span></div>
        <div class="info-row"><span class="info-label">Gender:</span><span class="info-value">${esc(data.gender || '---')}</span></div>
        <div class="info-row"><span class="info-label">Designer:</span><span class="info-value">${esc(data.designer || '---')}</span></div>
      </div>
    </section>

    ${placementSections}
  </div>
</body>
</html>`;
  }

  window.generateSpecHTMLDocument = generateSpecHTMLDocument;
})();
