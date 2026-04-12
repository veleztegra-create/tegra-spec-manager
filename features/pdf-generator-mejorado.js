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

  function normalizeTextValue(value, fallback = '') {
    const normalized = String(value ?? '').trim();
    if (!normalized || normalized.toLowerCase() === 'undefined' || normalized.toLowerCase() === 'null') return fallback;
    return normalized;
  }

  function formatScaledValue(value, factor) {
    const n = Number.parseFloat(value);
    if (!Number.isFinite(n)) return '--';
    return (Math.round((n * factor) * 1000) / 1000).toFixed(3).replace(/\.?0+$/, '');
  }

  function formatOffsetValue(value, offset) {
    const n = Number.parseFloat(value);
    if (!Number.isFinite(n)) return '--';
    return (Math.round((n + offset) * 1000) / 1000).toFixed(3).replace(/\.?0+$/, '');
  }

  function getSizeNotes(data, placement) {
    const width = normalizeTextValue(placement.width, '');
    const height = normalizeTextValue(placement.height, '');
    if (!width || !height) return [];

    const notes = [];
    notes.push(`Tamaño Final = ${width} x ${height}`);

    const fabric = String(data?.fabric || '').toUpperCase();
    const customer = String(data?.customer || '').toUpperCase();
    const isNfsArt = String(placement.type || '').toUpperCase().includes('NFS')
      || String(placement.name || '').toUpperCase().includes('NFS')
      || String(placement.placementDetails || '').toUpperCase().includes('NFS');

    if (fabric.includes('TWILL')) {
      notes.push(`Tamaño con -1% = ${formatScaledValue(width, 0.99)} x ${formatScaledValue(height, 0.99)}`);
      notes.push(`Tamaño con -4mm = ${formatOffsetValue(width, -0.1575)} x ${formatOffsetValue(height, -0.1575)}`);
    }

    if (customer.includes('NCAA')) {
      notes.push(`Tamaño -1.5% = ${formatScaledValue(width, 0.985)} x ${formatScaledValue(height, 0.985)}`);
    }

    if (isNfsArt) {
      const currentH = Number.parseFloat(height);
      const currentW = Number.parseFloat(width);
      if (Number.isFinite(currentH) && Number.isFinite(currentW) && currentH > 0) {
        const newHeight = currentH - 0.1181;
        const factor = newHeight / currentH;
        notes.push(`Tamaño -3mm alto proporcional = ${formatScaledValue(width, factor)} x ${formatOffsetValue(height, -0.1181)}`);
      }
    }

    return notes;
  }


  function enrichPlacementColors(placement) {
    if (!Array.isArray(placement?.colors)) return [];

    return placement.colors.map((color) => {
      const resolver = window.ColorEngine?.resolveColor;
      if (typeof resolver !== 'function') {
        return {
          ...color,
          tone: color.tone || color.toneCategory || null,
          ink: color.ink || null
        };
      }

      const resolved = resolver({
        hex: color.hex || resolveColorHex(color.val),
        rgb: color.rgb || null
      });

      return {
        ...color,
        tone: resolved.toneCategory,
        ink: resolved.recommendedInk || color.ink || null,
        contrastText: resolved.contrastText || color.contrastText || null
      };
    });
  }

  function generateStationsData(placement, data) {
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

    const resolveStationAdditives = (item, layerType) => {
      const resolver = window.AdditivesRules?.resolveAdditives;
      if (typeof resolver !== 'function') {
        return { additives, source: 'preset', ruleId: null };
      }

      const result = resolver({
        inkType: placement.inkType || 'WATER',
        layerType,
        colorName: item?.val || item?.name || '',
        customer: data?.customer || '',
        fabric: placement.fabric || data?.fabric || '',
        placement,
        preset
      });

      return {
        additives: result?.additives || additives,
        source: result?.source || 'preset',
        ruleId: result?.ruleId || null
      };
    };

    const formatAdditivesLabel = ({ additives: baseAdditives, source, ruleId }) => {
      const base = baseAdditives || 'N/A';
      if (source === 'placement-override') return `${base} · MANUAL`;
      if (source === 'rules') return `${base} · AUTO${ruleId ? ` (${ruleId})` : ''}`;
      return `${base} · PRESET`;
    };

    (placement.colors || []).forEach((item, idx, arr) => {
      let mesh = meshColor;
      let add = formatAdditivesLabel(resolveStationAdditives(item, item.type || 'COLOR'));
      let strokesVal = strokes;
      let duro = durometer;
      if (item.type === 'BLOCKER') {
        mesh = meshBlocker;
        add = formatAdditivesLabel(resolveStationAdditives(item, 'BLOCKER'));
      } else if (item.type === 'WHITE_BASE') {
        mesh = meshWhite;
        add = formatAdditivesLabel(resolveStationAdditives(item, 'WHITE_BASE'));
      } else if (item.type === 'METALLIC') {
        mesh = '122/55';
        strokesVal = '1';
        duro = '70';
        add = formatAdditivesLabel(resolveStationAdditives(item, 'METALLIC'));
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

        // Add 'HEAT PLATE / ROLLER SQUEEGEE' ONLY to the first COOL station (idx === 0)
        const isFirstCool = (idx === 0);
        stations.push({
          st: st++,
          screenLetter: '',
          screenCombined: 'COOL',
          add: isFirstCool ? 'HEAT PLATE / ROLLER SQUEEGEE' : ''
        });
      }
    });

    return stations;
  }

  function buildPlacementHtml(placement, index, total, data) {
    const title = esc((placement.title || placement.type || `Placement ${index + 1}`).replace('CUSTOM: ', ''));
    const imageData = placement.imageData && String(placement.imageData).startsWith('data:')
      ? String(placement.imageData)
      : 'https://via.placeholder.com/200x180/E31837/FFFFFF?text=PLACEMENT';

    const enrichedColors = enrichPlacementColors(placement);
    placement.colors = enrichedColors;

    const uniqueDesignColors = [];
    const seenColorNames = new Set();
    enrichedColors.forEach((c) => {
      if (c.type !== 'COLOR' && c.type !== 'METALLIC') return;
      const normalized = String(c.val || '').toUpperCase().replace(/\s*\(\d+\)\s*$/, '').trim();
      if (!normalized || seenColorNames.has(normalized)) return;
      seenColorNames.add(normalized);
      uniqueDesignColors.push(c);
    });

    const colors = uniqueDesignColors.map((c, i) => {
      const inkLabel = c.ink
        ? (String(c.ink).toLowerCase() === 'plastisol' ? 'PLASTISOL INK' : `${String(c.ink).toUpperCase()} INK`)
        : null;
      const colorDisplay = inkLabel ? `${c.val || '---'} (${inkLabel})` : (c.val || '---');

      return `
      <div class="color-swatch">
        <div class="color-box" style="background:${esc(resolveColorHex(c.val))};"></div>
        <div class="color-info"><span class="color-number">${esc(c.screenLetter || String(i + 1))}</span><span class="color-name">${esc(colorDisplay)}</span></div>
      </div>`;
    }).join('') || '<div class="color-name">Sin colores registrados</div>';

    const rows = generateStationsData(placement, data).map((r) => {
      const stationUpper = String(r.screenCombined || '').toUpperCase();
      const isFlash = stationUpper === 'FLASH';
      const isCool = stationUpper === 'COOL';
      if (isFlash || isCool) {
        const extraAdd = isCool && r.add ? `<span style="margin-left:12px;color:#1f9d55;font-weight:700;">${esc(r.add)}</span>` : '';
        return `<tr class="flash-row"><td class="station-number">${esc(r.st)}</td><td></td><td colspan="7">${esc(r.screenCombined)}${extraAdd}</td></tr>`;
      }
      return `<tr>
        <td class="station-number">${esc(r.st)}</td>
        <td class="screen-letter">${esc(r.screenLetter)}</td>
        <td class="ink-name">${esc(r.screenCombined)}</td>
        <td class="additives"><span style="color:#1f9d55;font-weight:700;">${esc(r.add || '')}</span></td>
        <td>${esc(r.mesh || '')}</td>
        <td>${esc(r.strokes || '')}</td>
        <td>${esc(r.angle || '')}</td>
        <td>${esc(r.pressure || '')}</td>
        <td>${esc(r.duro || '')}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="9">Sin secuencia</td></tr>';

    const safeTemp = normalizeTextValue(placement.temp, '320°F');
    const safeTime = normalizeTextValue(placement.time, '1:40 min');
    const safeSpecialInstructions = normalizeTextValue(placement.specialInstructions, '---');
    const sizeNotes = getSizeNotes(data, placement);
    const sizeNotesHtml = sizeNotes.length
      ? `<div class=\"detail-row\" style=\"display:block;\"><span class=\"detail-label\">Tamaños Spec</span><div class=\"detail-value\" style=\"display:flex;flex-direction:column;gap:3px;\">${sizeNotes.map((n) => `<span>${esc(n)}</span>`).join('')}</div></div>`
      : '';

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
            ${sizeNotesHtml}
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
            <div class="curing-item"><div class="curing-label">Temperatura</div><div class="curing-value">${esc(safeTemp)}</div></div>
            <div class="curing-item"><div class="curing-label">Tiempo</div><div class="curing-value">${esc(safeTime)}</div></div>
            <div class="curing-item"><div class="curing-label">Tela</div><div class="curing-value small">${esc(placement.fabric || data.fabric || '---')}</div></div>
          </div>
        </div>

        <div class="tech-section">
          <div class="sub-title" style="margin-bottom:8px;">Información Técnica</div>
          <div class="info-grid">
            <div class="info-row"><span class="info-label">NOMBRE TÉCNICO:</span><span class="info-value">${esc(data.technicianName || '________________________')}</span></div>
            <div class="info-row"><span class="info-label">COMENTARIOS TÉCNICOS:</span><span class="info-value">${esc(data.technicalComments || '____________________________________________')}</span></div>
            <div class="info-row"><span class="info-label">INSTRUCCIONES ESPECIALES:</span><span class="info-value">${esc(safeSpecialInstructions)}</span></div>
          </div>
        </div>

        <footer class="spec-footer">
          <div class="footer-left">Generado: ${esc(new Date().toLocaleString('es-ES'))}</div>
          <div class="footer-center">TEGRA SPEC MANAGER</div>
          <div class="footer-right">Placement ${index + 1} de ${total}</div>
        </footer>
      </section>`;
  }

  function chunkList(list, chunkSize = 4) {
    const chunks = [];
    for (let i = 0; i < list.length; i += chunkSize) {
      chunks.push(list.slice(i, i + chunkSize));
    }
    return chunks;
  }

  function buildColorLabLabelsSection(data) {
    const labels = window.ColorLab?.collectFormulasForPlacements
      ? window.ColorLab.collectFormulasForPlacements(data?.placements || [])
      : [];

    if (!Array.isArray(labels) || labels.length === 0) return '';

    const warningLabelSrc = String(window.ColorLab?.warningLabelSrc || 'assets/color-lab-warning-label.svg');
    const getFormulaClient = (formula) => {
      const firstIngredient = String(formula?.ingredients?.[0]?.name || '').trim();
      const firstAdditive = String(Object.values(formula?.additives || {})[0]?.name || '').trim();
      const source = firstIngredient || firstAdditive || 'LIBRA';
      return source.split(/\s+/)[0].toUpperCase();
    };
    const getInkType = (formula) => String(formula?.systemKey || 'SILICONE').toUpperCase();
    const pages = chunkList(labels, 4);
    const pagesHtml = pages.map((page, pageIndex) => {
      const labelsHtml = page.map((formula) => {
        const additives = Object.values(formula.additives || {});
        const additivesHtml = additives
          .map((item) => `<span class="lab-mini-pill">${esc(item.name || item.label)} · ${esc(item.display)}</span>`)
          .join('');
        const ingredientsHtml = (formula.ingredients || [])
          .slice(0, 4)
          .map((item) => `<li><span>${esc(item.name)}</span><strong>${esc(item.percent)}</strong></li>`)
          .join('');

        return `
          <article class="lab-label-card">
            <div class="lab-label-top">
              <div class="lab-label-meta">
                <span>Cliente tinta: ${esc(getFormulaClient(formula))}</span>
                <span>Tipo tinta: ${esc(getInkType(formula))}</span>
              </div>
              <img class="lab-warning-corner" src="${esc(warningLabelSrc)}" alt="Etiqueta de seguridad" />
            </div>
            <header>
              <div class="lab-color-chip" style="background:${esc(formula.hex || '#999999')};"></div>
              <div>
                <h4>${esc(formula.name || 'N/A')}</h4>
                <p>${esc(formula.code || 'N/A')} · ${esc((formula.systemKey || '').toUpperCase())}</p>
              </div>
            </header>
            <ul class="lab-ingredients">${ingredientsHtml || '<li><span>Sin ingredientes</span><strong>—</strong></li>'}</ul>
            <div class="lab-mini-pills">${additivesHtml || '<span class="lab-mini-pill">Sin aditivos</span>'}</div>
          </article>
        `;
      }).join('');

      return `
        <section class="labels-page">
          <div class="labels-page-head">Color Lab Labels · Página ${pageIndex + 1} de ${pages.length}</div>
          <div class="labels-grid">${labelsHtml}</div>
        </section>
      `;
    }).join('');

    return `
      <section class="color-lab-labels-section">
        <h2 class="section-title">Color Lab · Fórmulas por color</h2>
        ${pagesHtml}
      </section>
    `;
  }

  function generateSpecHTMLDocument(data) {
    const placements = Array.isArray(data?.placements) && data.placements.length ? data.placements : [{}];
    const customerKey = getLogoKey(data.customer || '');
    const customerLogo = window.LogoConfig?.[customerKey] || '';
    const tegraLogo = window.LogoConfig?.TEGRA || '';

    const placementSections = placements.map((p, i) => buildPlacementHtml(p, i, placements.length, data)).join('');
    const colorLabSection = buildColorLabLabelsSection(data);

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
    .color-lab-labels-section{padding:18px 20px;border-top:3px solid var(--tegra-red);background:#fafafa;} .labels-page{margin-top:10px;padding:8px 0 4px 0;} .labels-page + .labels-page{border-top:1px dashed #bbb;padding-top:14px;} .labels-page-head{font-family:var(--font-condensed);font-size:.8rem;text-transform:uppercase;color:#333;letter-spacing:.06em;margin-bottom:8px;} .labels-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;} .lab-label-card{border:1px solid var(--border-light);border-left:4px solid var(--tegra-red);border-radius:6px;background:#fff;padding:8px;min-height:220px;} .lab-label-top{display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:start;} .lab-label-meta{display:flex;flex-direction:column;gap:4px;font-size:.64rem;font-weight:700;text-transform:uppercase;color:#444;} .lab-warning-corner{width:100%;height:auto;max-height:96px;object-fit:contain;border:1px solid #ddd;border-radius:4px;} .lab-label-card header{display:flex;gap:8px;align-items:center;margin:8px 0;} .lab-color-chip{width:30px;height:30px;border-radius:6px;border:1px solid #bbb;box-shadow:inset 0 0 0 1px rgba(255,255,255,.4);} .lab-label-card h4{font-family:var(--font-display);font-size:1rem;line-height:1.1;} .lab-label-card p{font-size:.7rem;color:#555;text-transform:uppercase;letter-spacing:.05em;} .lab-ingredients{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:3px;} .lab-ingredients li{display:flex;justify-content:space-between;font-size:.72rem;border-bottom:1px dashed #eee;padding-bottom:2px;} .lab-mini-pills{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;} .lab-mini-pill{font-size:.62rem;border:1px solid #ddd;padding:2px 6px;border-radius:999px;background:#f8f8f8;}
    @media print{body{padding:8px;background:#fff;} .mockup-container{width:auto;box-shadow:none;border-radius:0;} .placement-section{padding:14px;} .placement-header-bar{margin:-14px -14px 10px -14px;} .detail-row{padding:4px 0;} .labels-page{break-after:page;} .labels-page:last-child{break-after:auto;} .lab-label-card{page-break-inside:avoid;min-height:160px;}}
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
    ${colorLabSection}
  </div>
</body>
</html>`;
  }

  window.generateSpecHTMLDocument = generateSpecHTMLDocument;
})();
