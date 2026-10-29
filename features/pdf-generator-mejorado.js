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

  // Solo se aceptan imágenes raster en data URI base64. No interpolar valores
  // arbitrarios en el atributo src: pueden contener comillas u otros atributos.
  function safeImageSource(value) {
    const source = String(value ?? '');
    if (/^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(source)) {
      return source;
    }
    return 'https://via.placeholder.com/200x180/E31837/FFFFFF?text=PLACEMENT';
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
    if (!Array.isArray(placement?.printColors)) return [];

    return placement.printColors.map((color) => {
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
    const sequence = Array.isArray(placement.sequence) ? placement.sequence : [];
    sequence.forEach((item, index) => {
      const type = String(item.type || item.tipo || '').toUpperCase();
      stations.push({
        st: index + 1,
        screenLetter: item.screenLetter || '',
        screenCombined: item.val || item.nombre || type || '---',
        add: item.additives || '',
        mesh: item.mesh || '-',
        strokes: item.strokes || '-',
        angle: item.angle || '-',
        pressure: item.pressure || '-',
        duro: item.durometer || '-'
      });
    });

    return stations;
  }

  function getPrintParameters(placement) {
    const preset = getInkPreset(placement?.inkType || 'WATER');
    const colorPreset = preset?.color || {};
    const blockerPreset = preset?.blocker || {};
    const whitePreset = preset?.white || {};
    return {
      durometer: normalizeTextValue(placement?.durometer, normalizeTextValue(colorPreset.durometer, '--')),
      strokes: normalizeTextValue(placement?.strokes, normalizeTextValue(colorPreset.strokes, '--')),
      angle: normalizeTextValue(placement?.angle, normalizeTextValue(colorPreset.angle, '--')),
      pressure: normalizeTextValue(placement?.pressure, normalizeTextValue(colorPreset.pressure, '--')),
      speed: normalizeTextValue(placement?.speed, normalizeTextValue(colorPreset.speed, '--')),
      additives: normalizeTextValue(placement?.additives, normalizeTextValue(colorPreset.additives, '--')),
      additivesBlocker: normalizeTextValue(placement?.additivesBlocker, normalizeTextValue(blockerPreset.additives, '--')),
      additivesWhiteBase: normalizeTextValue(placement?.additivesWhiteBase, normalizeTextValue(whitePreset.additives, '--'))
    };
  }

  function buildPrintParametersHtml(placement) {
    const p = getPrintParameters(placement);
    const items = [
      ['DURÓMETRO', p.durometer], ['STROKES', p.strokes], ['ANGLE', p.angle], ['PRESSURE', p.pressure],
      ['SPEED', p.speed], ['ADITIVOS COLOR', p.additives], ['ADITIVOS BLOCKER', p.additivesBlocker], ['ADITIVOS WHITE BASE', p.additivesWhiteBase]
    ];
    return '<div class="print-parameters-section">' +
      '<div class="print-parameters-title">Parámetros de Impresión</div>' +
      '<div class="print-parameters-grid">' +
      items.map(([label, value]) => '<div class="print-parameter-item"><span class="print-parameter-label">' + esc(label) + '</span><span class="print-parameter-value">' + esc(value) + '</span></div>').join('') +
      '</div></div>';
  }

  function buildPlacementHtml(placement, index, total, data) {
    const title = esc((placement.title || placement.type || `Placement ${index + 1}`).replace('CUSTOM: ', ''));
    const imageData = safeImageSource(placement.imageData);

    const enrichedColors = enrichPlacementColors(placement);

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
      const colorDisplay = c.val || '---';

      return `
      <div class="color-swatch">
        <div class="color-box" style="background:${esc(c.hex || resolveColorHex(c.val))};"></div>
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

    const safeTemp = normalizeTextValue(placement.curing?.temperature ?? placement.temp, '320°F');
    const safeTime = normalizeTextValue(placement.curing?.time ?? placement.time, '1:40 min');
    const safeSpecialInstructions = normalizeTextValue(placement.specialInstructions, '---');
    const sizeNotes = getSizeNotes(data, placement);
    const sizeNotesHtml = sizeNotes.length
      ? `<div class=\"detail-row\" style=\"display:block;\"><span class=\"detail-label\">Tamaños Spec</span><div class=\"detail-value\" style=\"display:flex;flex-direction:column;gap:3px;\">${sizeNotes.map((n) => `<span>${esc(n)}</span>`).join('')}</div></div>`
      : '';

    return `
      <section class="placement-section">
        <div class="placement-header-bar"><div class="placement-icon">👕</div><span class="placement-title-text">Placement: ${title}</span></div>
        <div class="placement-content">
          <div class="placement-image-container"><span class="placement-badge">${title}</span><img src="${esc(imageData)}" class="placement-image" alt="${title}"></div>
          <div class="placement-details-panel">
            <div class="detail-row"><span class="detail-label">Tipo de Tinta</span><span class="detail-value highlight">${esc(placement.inkType || 'WATER')}</span></div>
            <div class="detail-row"><span class="detail-label">Dimensiones</span><span class="detail-value">${esc(`${placement.width || '--'} x ${placement.height || '--'}`)}</span></div>
            <div class="detail-row"><span class="detail-label">PANTALLA / SCREEN</span><span class="detail-value">${esc(placement.screenSize || 'PENDIENTE')}</span></div>
            <div class="detail-row"><span class="detail-label">CATEGORÍA / CATEGORY</span><span class="detail-value" style="${placement.category7Accepted ? 'color:#D71920;font-weight:800;' : ''}">${esc(placement.category7Accepted ? `7 (ESTACIONES ${placement.category7Stations || (placement.sequence || []).length})` : '---')}</span></div>
            <div class="detail-row"><span class="detail-label">Ubicación</span><span class="detail-value">${esc(placement.placementDetails || '---')}</span></div>
            <div class="detail-row"><span class="detail-label">Especialidades</span><span class="detail-value">${esc(placement.specialties || '—')}</span></div>
            <div class="detail-row"><span class="detail-label">Talla Base</span><span class="detail-value">${esc(placement.baseSize || data.baseSize || '---')}</span></div>
            ${sizeNotesHtml}
          </div>
        </div>

        ${buildPrintParametersHtml(placement)}

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
        const additivesHtml = additives.length
          ? `<div class="lab-additives-title">ADITIVOS:</div><div class="lab-additives-lines">${additives.map((item) => `<div>${esc(item.name || item.label)} · ${esc(item.display)}</div>`).join('')}</div>`
          : '<div class="lab-additives-title">ADITIVOS:</div><div class="lab-additives-lines"><div>Sin aditivos</div></div>';
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
            <div class="lab-mini-pills">${additivesHtml}</div>
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
    if (!window.TegraApprovedSpecRenderer?.render) {
      throw new Error('No se pudo cargar la plantilla visual aprobada.');
    }
    let html = window.TegraApprovedSpecRenderer.render(data || {});
    // Keep the existing Color Lab formula-label export available after the layout change.
    const labels = buildColorLabLabelsSection(data || {});
    if (labels) {
      const labelStyles = '<style>.color-lab-labels-section{margin-top:12pt;border-top:2pt solid #a12228;padding-top:8pt}.labels-page{margin-top:8pt}.labels-page-head{font-weight:700;font-size:8pt;margin-bottom:6pt}.labels-grid{display:grid;grid-template-columns:1fr 1fr;gap:8pt}.lab-label-card{border:1px solid #999;border-left:3pt solid #a12228;padding:6pt;break-inside:avoid}.lab-label-top{display:flex;justify-content:space-between;gap:6pt}.lab-label-meta{font-size:6.5pt;display:flex;flex-direction:column}.lab-warning-corner{max-width:75pt;max-height:55pt;object-fit:contain}.lab-label-card header{display:flex;align-items:center;gap:6pt;margin:5pt 0}.lab-color-chip{width:22pt;height:22pt;border:1px solid #999}.lab-label-card h4{font-size:9pt}.lab-label-card p,.lab-ingredients li,.lab-mini-pills{font-size:7pt}.lab-ingredients{list-style:none;margin:0;padding:0}.lab-ingredients li{display:flex;justify-content:space-between;border-bottom:1px dashed #ddd}.lab-additives-title{font-weight:700}.lab-additives-lines{display:flex;flex-direction:column;gap:2pt}@media print{.labels-page{break-after:page}.labels-page:last-child{break-after:auto}}</style>';
      html = html.replace('</head>', labelStyles + '</head>');
      html = html.replace('</main>', labels + '</main>');
    }
    return html;
  }

  window.generateSpecHTMLDocument = generateSpecHTMLDocument;
  window.PdfSpecRenderer = { generateStationsData, getPrintParameters, buildPrintParametersHtml };
})();
