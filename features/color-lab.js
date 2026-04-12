(function () {
  const WARNING_LABEL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700"><rect width="1200" height="700" fill="#fff" stroke="#000" stroke-width="3"/><text x="600" y="62" text-anchor="middle" font-size="48" font-family="Arial" font-weight="700" fill="#b32222">TEGRA</text><text x="600" y="122" text-anchor="middle" font-size="72" font-family="Arial" font-weight="800" fill="#111">Etiqueta de Seguridad</text><g transform="translate(0,160)" font-family="Arial"><rect x="0" y="0" width="1200" height="105" fill="#fff" stroke="#000" stroke-width="3"/><rect x="130" y="0" width="390" height="105" fill="#0459b3" stroke="#000" stroke-width="3"/><text x="65" y="70" text-anchor="middle" font-size="56" font-weight="700">1</text><text x="145" y="70" font-size="66" font-weight="800" fill="#fff">SALUD</text><text x="540" y="70" font-size="62" font-weight="700">0 - Material estable</text></g><g transform="translate(0,265)" font-family="Arial"><rect x="0" y="0" width="1200" height="105" fill="#fff" stroke="#000" stroke-width="3"/><rect x="130" y="0" width="390" height="105" fill="#d61920" stroke="#000" stroke-width="3"/><text x="65" y="70" text-anchor="middle" font-size="56" font-weight="700">0</text><text x="145" y="70" font-size="62" font-weight="800" fill="#fff">INFLAMABILIDAD</text><text x="540" y="70" font-size="62" font-weight="700">1 - Ligeramente peligroso</text></g><g transform="translate(0,370)" font-family="Arial"><rect x="0" y="0" width="1200" height="105" fill="#fff" stroke="#000" stroke-width="3"/><rect x="130" y="0" width="390" height="105" fill="#ffe100" stroke="#000" stroke-width="3"/><text x="65" y="70" text-anchor="middle" font-size="56" font-weight="700">0</text><text x="145" y="70" font-size="62" font-weight="800" fill="#111">REACTIVO</text><text x="540" y="70" font-size="62" font-weight="700">2 - Moderadamente peligroso</text></g><g transform="translate(0,475)" font-family="Arial"><rect x="0" y="0" width="1200" height="105" fill="#fff" stroke="#000" stroke-width="3"/><rect x="130" y="0" width="390" height="105" fill="#fff" stroke="#000" stroke-width="3"/><text x="65" y="70" text-anchor="middle" font-size="56" font-weight="700">0</text><text x="145" y="70" font-size="62" font-weight="800" fill="#111">INF. ESPECIAL</text><text x="540" y="70" font-size="62" font-weight="700">3 - Muy peligroso</text></g><g transform="translate(0,580)" font-family="Arial"><rect x="0" y="0" width="1200" height="105" fill="#fff" stroke="#000" stroke-width="3"/><text x="540" y="70" font-size="62" font-weight="700">4 - Extremadamente peligroso</text></g></svg>`;

  const SYSTEMS = {
    silicone: { name: 'Silicone', file: 'data/color-lab/silicone.json' },
    waterbase: { name: 'Waterbase', file: 'data/color-lab/waterbase.json' },
    plastisol: { name: 'Plastisol', file: 'data/color-lab/plastisol.json' }
  };

  const INGREDIENT_COLUMNS = {
    Column12: 'LIBRA BARRIER CLEAR PART A',
    Column13: 'LIBRA BARRIER BLACK PART B',
    Column14: 'LIBRA MATTE MIXING BASE',
    Column15: 'LIBRA RFU WHITE',
    Column16: 'LIBRA SILVER SHIMMER TONER',
    Column17: 'LIBRA YELLOW PC',
    Column18: 'LIBRA ORANGE PC',
    Column19: 'LIBRA BLUE # 2 PC',
    Column20: 'LIBRA BLACK PC',
    Column21: 'LIBRA CLEAR GEL PART A',
    Column22: 'LIBRA CLEAR GEL PART B'
  };

  const ADDITIVE_COLUMNS = {
    Column23: { key: 'w', label: 'W', name: 'LIBRA CATALYST' },
    Column24: { key: 'x', label: 'X', name: 'LIBRA RETARDER' },
    Column25: { key: 'y', label: 'Y', name: 'LIBRA MATTE' }
  };

  const state = {
    loaded: {},
    currentSystem: 'silicone',
    currentFormulas: [],
    bound: false,
    warningLabelSrc: `data:image/svg+xml;utf8,${encodeURIComponent(WARNING_LABEL_SVG)}`,
    manualSelection: [],
    lastRenderedFormula: null
  };

  function isNum(v) {
    return typeof v === 'number' && Number.isFinite(v);
  }

  function pct(v) {
    return isNum(v) ? `${(v * 100).toFixed(2)}%` : '0%';
  }

  function normalizeKey(v) {
    return String(v || '').toUpperCase().replace(/\s+/g, ' ').trim();
  }

  function detectCategory(row) {
    if (isNum(row.Column12) || isNum(row.Column13)) return 'BLOCKER';
    if (isNum(row.Column21) || isNum(row.Column22)) return 'CLEAR';

    const hasBase = isNum(row.Column14);
    const hasShimmer = isNum(row.Column16);
    const hasPigments = isNum(row.Column17) || isNum(row.Column18) || isNum(row.Column19) || isNum(row.Column20);

    if (!hasBase && !hasShimmer && !hasPigments && isNum(row.Column15)) return 'BASES';
    return 'PIGMENTO';
  }

  function mapFormula(row, systemKey) {
    const ingredients = [];
    Object.entries(INGREDIENT_COLUMNS).forEach(([column, name]) => {
      if (isNum(row[column])) {
        ingredients.push({ name, raw: row[column], percent: pct(row[column]) });
      }
    });

    const additives = {};
    Object.entries(ADDITIVE_COLUMNS).forEach(([column, def]) => {
      const val = isNum(row[column]) ? row[column] : 0;
      additives[`col_${def.key}`] = {
        label: def.label,
        name: def.name,
        value: val,
        display: `${(val * 100).toFixed(2)}%`
      };
    });

    const code = String(row['SISTEMA DE SILICON'] || row.codigo || 'N/A').trim();
    const name = String(row.Column11 || row.nombre || '').trim().toUpperCase();

    return {
      systemKey,
      code,
      name,
      category: detectCategory(row),
      ingredients,
      additives,
      comments: String(row.Column26 || row.comentarios || '').trim()
    };
  }

  function resolveColorHex(formula) {
    const candidates = [formula?.name, formula?.code, `PMS ${formula?.code || ''}`].filter(Boolean);

    for (const candidate of candidates) {
      try {
        const hex = window.ColorConfig?.findColorHex?.(candidate);
        if (hex) return hex;
      } catch (_) {
        // noop
      }
    }

    return '#808080';
  }

  async function loadSystem(systemKey) {
    if (state.loaded[systemKey]) {
      state.currentFormulas = state.loaded[systemKey];
      return state.currentFormulas;
    }

    const config = SYSTEMS[systemKey];
    if (!config) return [];

    const response = await fetch(config.file);
    if (!response.ok) throw new Error(`No se pudo cargar ${config.file}`);

    const raw = await response.json();
    const formulas = (Array.isArray(raw) ? raw : [])
      .filter((row) => row && typeof row === 'object')
      .filter((row) => {
        const code = String(row['SISTEMA DE SILICON'] || row.codigo || '').trim().toUpperCase();
        const name = String(row.Column11 || row.nombre || '').trim().toUpperCase();
        if (!name || name === 'COLOR') return false;
        if (code === 'CODIGO') return false;
        return true;
      })
      .map((row) => mapFormula(row, systemKey));

    state.loaded[systemKey] = formulas;
    state.currentFormulas = formulas;
    return formulas;
  }

  function setStatus(message) {
    const status = document.getElementById('color-lab-status');
    if (status) status.textContent = message;
  }

  function buildChips() {
    const container = document.getElementById('color-lab-chips');
    if (!container) return;

    container.innerHTML = '';
    state.currentFormulas.slice(0, 12).forEach((formula) => {
      const chip = document.createElement('button');
      chip.className = 'color-lab-chip';
      chip.type = 'button';
      chip.textContent = formula.code !== 'N/A' ? `${formula.code} · ${formula.name}` : formula.name;
      chip.addEventListener('click', () => renderFormula(formula));
      container.appendChild(chip);
    });
  }

  function renderFormula(formula) {
    const result = document.getElementById('color-lab-result');
    if (!result || !formula) return;
    state.lastRenderedFormula = formula;

    document.getElementById('color-lab-code').textContent = formula.code === 'N/A' ? '—' : formula.code;
    document.getElementById('color-lab-name').textContent = formula.name;
    document.getElementById('color-lab-category').textContent = formula.category;
    document.getElementById('color-lab-category').className = `color-lab-category cat-${formula.category}`;

    const swatch = document.getElementById('color-lab-swatch');
    if (swatch) swatch.style.background = resolveColorHex(formula);

    const ingredientsTable = document.getElementById('color-lab-ingredients');
    if (ingredientsTable) {
      ingredientsTable.innerHTML = formula.ingredients.length
        ? formula.ingredients.map((item) => `<tr><td>${item.name}</td><td style="text-align:right;">${item.percent}</td></tr>`).join('')
        : '<tr><td colspan="2">Sin datos de ingredientes.</td></tr>';
    }

    const additivesWrap = document.getElementById('color-lab-additives');
    if (additivesWrap) {
      const additives = Object.values(formula.additives || {});
      additivesWrap.innerHTML = additives.map((item) => `
        <div class="color-lab-additive-card ${item.value > 0 ? 'has' : ''}">
          <small>Col ${item.label}</small>
          <strong>${item.name}</strong>
          <span>${item.display}</span>
        </div>
      `).join('');
    }

    const comments = document.getElementById('color-lab-comments');
    if (comments) {
      comments.textContent = formula.comments || 'Sin comentarios técnicos.';
    }

    result.style.display = 'block';
  }

  function getFormulaUniqueKey(formula) {
    return `${formula.systemKey}:${normalizeKey(formula.code)}:${normalizeKey(formula.name)}`;
  }

  function renderManualSelection() {
    const list = document.getElementById('color-lab-selected-list');
    const printBtn = document.getElementById('color-lab-print-selected');
    if (!list) return;

    if (!state.manualSelection.length) {
      list.innerHTML = '<p style="margin:0; color:var(--text-secondary);">No hay fórmulas agregadas.</p>';
      if (printBtn) printBtn.disabled = true;
      return;
    }

    list.innerHTML = state.manualSelection.map((formula) => `
      <div class="color-lab-selected-item">
        <div>
          <strong>${formula.code !== 'N/A' ? `${formula.code} · ` : ''}${formula.name}</strong><br>
          <small>${String(formula.systemKey || '').toUpperCase()}</small>
        </div>
        <button type="button" class="btn btn-outline btn-sm" onclick="removeColorLabManualFormula('${getFormulaUniqueKey(formula)}')">Quitar</button>
      </div>
    `).join('');

    if (printBtn) printBtn.disabled = false;
  }

  function addManualFormula(formula) {
    if (!formula) return;
    const key = getFormulaUniqueKey(formula);
    if (state.manualSelection.some((item) => getFormulaUniqueKey(item) === key)) return;

    state.manualSelection.push({
      ...formula,
      hex: resolveColorHex(formula)
    });
    renderManualSelection();
  }

  function removeManualFormula(formulaKey) {
    state.manualSelection = state.manualSelection.filter((formula) => getFormulaUniqueKey(formula) !== formulaKey);
    renderManualSelection();
  }

  function buildManualLabelsHtml(formulas) {
    const pages = [];
    for (let i = 0; i < formulas.length; i += 4) {
      pages.push(formulas.slice(i, i + 4));
    }

    const cards = pages.map((page, pageIndex) => `
      <section class="page">
        <h2>Color Lab · Etiquetas manuales (${pageIndex + 1}/${pages.length})</h2>
        <div class="grid">
          ${page.map((formula) => `
            <article class="card">
              <img class="warning" src="${state.warningLabelSrc}" alt="Etiqueta de seguridad">
              <div class="title">
                <span class="swatch" style="background:${formula.hex || '#999'}"></span>
                <div><strong>${formula.name}</strong><small>${formula.code} · ${String(formula.systemKey || '').toUpperCase()}</small></div>
              </div>
              <ul>
                ${(formula.ingredients || []).slice(0, 4).map((item) => `<li><span>${item.name}</span><b>${item.percent}</b></li>`).join('')}
              </ul>
              <div class="pills">
                ${Object.values(formula.additives || {}).map((item) => `<span>${item.name} · ${item.display}</span>`).join('')}
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `).join('');

    return `<!doctype html><html><head><meta charset="utf-8"><title>Color Lab Manual Labels</title>
    <style>
      body{font-family:Arial,sans-serif;margin:0;padding:14px;background:#f5f5f5}
      .page{page-break-after:always;margin-bottom:12px}.page:last-child{page-break-after:auto}
      h2{font-size:16px;margin:0 0 10px 0}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .card{position:relative;background:#fff;border:1px solid #ddd;border-left:4px solid #c82037;padding:8px;min-height:180px}
      .warning{position:absolute;top:8px;right:8px;width:50%;height:auto;max-height:50%;object-fit:contain}
      .title{display:flex;gap:8px;align-items:center;padding-right:52%}
      .swatch{width:28px;height:28px;border-radius:6px;border:1px solid #aaa}
      .title small{display:block;color:#666}
      ul{list-style:none;margin:8px 0 0 0;padding:0}
      li{display:flex;justify-content:space-between;border-bottom:1px dashed #eee;font-size:12px}
      .pills{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px}
      .pills span{font-size:10px;border:1px solid #ddd;border-radius:999px;padding:2px 6px}
    </style></head><body>${cards}</body></html>`;
  }

  function printManualSelection() {
    if (!state.manualSelection.length) return;
    const html = buildManualLabelsHtml(state.manualSelection);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `color_lab_manual_labels_${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function searchFormula(query, systemKey = state.currentSystem) {
    const key = normalizeKey(query);
    if (!key) return null;

    const source = state.loaded[systemKey] || [];
    return source.find((formula) => {
      const code = normalizeKey(formula.code);
      const name = normalizeKey(formula.name);
      return code === key || name === key || name.includes(key) || code.includes(key);
    }) || null;
  }

  function findFormulaByColorName(colorName, inkType = 'SILICONE') {
    const normalizedInk = String(inkType || '').toUpperCase();
    const systemKey = normalizedInk.includes('PLAST') ? 'plastisol'
      : normalizedInk.includes('WATER') ? 'waterbase'
        : 'silicone';

    const formulas = state.loaded[systemKey] || [];
    const query = normalizeKey(colorName).replace(/^PMS\s+/i, '');
    if (!query) return null;

    const byName = formulas.find((formula) => normalizeKey(formula.name) === query || normalizeKey(formula.name).includes(query));
    if (byName) return byName;

    const codeOnly = query.replace(/^PANTONE\s+/i, '').replace(/\s+/g, ' ');
    return formulas.find((formula) => normalizeKey(formula.code) === codeOnly || codeOnly.includes(normalizeKey(formula.code)));
  }

  function collectFormulasForPlacements(placements) {
    if (!Array.isArray(placements)) return [];

    const labels = [];
    const seen = new Set();

    placements.forEach((placement) => {
      const colors = Array.isArray(placement?.colors) ? placement.colors : [];
      colors
        .filter((color) => color && (color.type === 'COLOR' || color.type === 'METALLIC'))
        .forEach((color) => {
          const formula = findFormulaByColorName(color.val, placement.inkType);
          if (!formula) return;

          const key = `${formula.systemKey}:${normalizeKey(formula.code)}:${normalizeKey(formula.name)}`;
          if (seen.has(key)) return;
          seen.add(key);

          labels.push({
            ...formula,
            hex: resolveColorHex(formula)
          });
        });
    });

    return labels;
  }

  async function init() {
    const select = document.getElementById('color-lab-system-select');
    const input = document.getElementById('color-lab-query');
    const searchBtn = document.getElementById('color-lab-search-btn');
    const addSelectedBtn = document.getElementById('color-lab-add-selected');
    const printSelectedBtn = document.getElementById('color-lab-print-selected');
    const clearSelectedBtn = document.getElementById('color-lab-clear-selected');

    if (!select || !input || !searchBtn || !addSelectedBtn || !printSelectedBtn || !clearSelectedBtn) return;

    if (!state.bound) {
      select.addEventListener('change', async () => {
        state.currentSystem = select.value;
        setStatus(`Cargando base de ${SYSTEMS[state.currentSystem].name}...`);
        try {
          await loadSystem(state.currentSystem);
          setStatus(`Sistema listo: ${SYSTEMS[state.currentSystem].name} (${state.currentFormulas.length} fórmulas)`);
          buildChips();
          document.getElementById('color-lab-result').style.display = 'none';
        } catch (error) {
          setStatus(`Error: ${error.message}`);
        }
      });

      searchBtn.addEventListener('click', () => {
        const formula = searchFormula(input.value, state.currentSystem);
        if (!formula) {
          setStatus(`No se encontró fórmula para "${input.value}"`);
          return;
        }
        renderFormula(formula);
        setStatus(`Fórmula encontrada: ${formula.code} · ${formula.name}`);
      });

      input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') searchBtn.click();
      });

      addSelectedBtn.addEventListener('click', () => {
        if (!state.lastRenderedFormula) return;
        addManualFormula(state.lastRenderedFormula);
        setStatus(`Fórmula agregada a impresión: ${state.lastRenderedFormula.code} · ${state.lastRenderedFormula.name}`);
      });

      printSelectedBtn.addEventListener('click', () => {
        printManualSelection();
      });

      clearSelectedBtn.addEventListener('click', () => {
        state.manualSelection = [];
        renderManualSelection();
      });

      state.bound = true;
    }

    select.value = state.currentSystem;

    try {
      setStatus(`Cargando base de ${SYSTEMS[state.currentSystem].name}...`);
      await Promise.all(Object.keys(SYSTEMS).map((systemKey) => loadSystem(systemKey).catch(() => [])));
      state.currentFormulas = state.loaded[state.currentSystem] || [];
      buildChips();
      renderManualSelection();
      setStatus(`Sistema listo: ${SYSTEMS[state.currentSystem].name} (${state.currentFormulas.length} fórmulas)`);
    } catch (error) {
      setStatus(`Error al cargar Color Lab: ${error.message}`);
    }
  }

  window.initColorLab = init;
  window.ColorLab = {
    init,
    searchFormula,
    findFormulaByColorName,
    collectFormulasForPlacements,
    resolveColorHex,
    get warningLabelSrc() {
      return state.warningLabelSrc;
    },
    setWarningLabelSrc(src) {
      const value = String(src || '').trim();
      if (value) state.warningLabelSrc = value;
      return state.warningLabelSrc;
    },
    addManualFormula,
    removeManualFormula,
    printManualSelection
  };

  window.removeColorLabManualFormula = removeManualFormula;
})();
