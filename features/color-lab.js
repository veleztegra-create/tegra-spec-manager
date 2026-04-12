(function () {
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
    bound: false
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

    if (!select || !input || !searchBtn) return;

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

      state.bound = true;
    }

    select.value = state.currentSystem;

    try {
      setStatus(`Cargando base de ${SYSTEMS[state.currentSystem].name}...`);
      await Promise.all(Object.keys(SYSTEMS).map((systemKey) => loadSystem(systemKey).catch(() => [])));
      state.currentFormulas = state.loaded[state.currentSystem] || [];
      buildChips();
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
    resolveColorHex
  };
})();
