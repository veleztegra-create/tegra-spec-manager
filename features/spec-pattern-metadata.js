/* Integra el lector de patrones en la Spec y conserva los datos en Store. */
(function () {
  'use strict';
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const today = () => {
    const d = new Date();
    return [String(d.getDate()).padStart(2, '0'), String(d.getMonth() + 1).padStart(2, '0'), d.getFullYear()].join('-');
  };
  function generalData() {
    if (!window.Store) return {};
    // Store.getState() devuelve una copia profunda; modificarla no persiste.
    // Para que las piezas detectadas lleguen al selector, escribir en el estado reactivo.
    const state = Store.state;
    if (!state.generalData || typeof state.generalData !== 'object') state.generalData = {};
    return state.generalData;
  }
  function setGeneral(key, value) {
    const data = generalData();
    data[key] = value;
  }
  function availablePieces() {
    return Array.isArray(generalData().availablePatternPieces) ? generalData().availablePatternPieces : [];
  }
  function selectedPieces() {
    return Array.isArray(generalData().patternPieces) ? generalData().patternPieces : [];
  }
  function renderPieceOptions() {
    const select = document.getElementById('pattern-piece-select');
    const search = document.getElementById('pattern-piece-search');
    const add = document.getElementById('pattern-piece-add');
    const status = document.getElementById('pattern-piece-picker-status');
    if (!select) return;
    const query = String(search?.value || '').trim();
    const matches = window.PatternPieceShrinkage
      ? window.PatternPieceShrinkage.filterPieces(availablePieces(), query)
      : availablePieces().filter(piece => String(piece.pieceName || '').toLowerCase().includes(query.toLowerCase()));
    const previous = select.value;
    select.replaceChildren();
    if (!availablePieces().length) {
      select.add(new Option('Carga un patrón .ai para detectar piezas', ''));
    } else if (!matches.length) {
      select.add(new Option('No hay coincidencias', ''));
    } else {
      select.add(new Option('Selecciona una pieza…', ''));
      matches.forEach((piece, index) => {
        const option = new Option([piece.pieceName, piece.shrinkage].filter(Boolean).join(' — '), String(availablePieces().indexOf(piece)));
        select.add(option);
      });
      if (previous && Array.from(select.options).some(option => option.value === previous)) select.value = previous;
    }
    if (add) add.disabled = !select.value;
    if (status) status.textContent = availablePieces().length
      ? matches.length + ' de ' + availablePieces().length + ' piezas disponibles. Selecciona una y pulsa “Agregar pieza a la Spec”.'
      : 'Carga el patrón y después busca/selecciona las piezas que necesitas.';
  }
  function renderPieces() {
    const target = document.getElementById('pattern-shrinkage-export');
    if (!target) return;
    const pieces = selectedPieces();
    if (!pieces.length) {
      target.innerHTML = '<p class="pattern-shrinkage-empty">Todavía no has agregado piezas a la Spec.</p>';
      return;
    }
    target.innerHTML = pieces.map((piece, index) => {
      const name = String(piece.pieceName || '').trim();
      const shrinkage = String(piece.shrinkage || '').trim();
      return '<div class="pattern-shrinkage-line"><span>' + esc([name, shrinkage].filter(Boolean).join(' ')) + '</span><button type="button" class="btn btn-outline btn-sm" data-remove-pattern-piece="' + index + '" aria-label="Quitar ' + esc(name) + '"><i class="fas fa-times"></i> Quitar</button></div>';
    }).join('');
  }
  function addSelectedPiece() {
    const select = document.getElementById('pattern-piece-select');
    if (!select || select.value === '') return;
    const piece = availablePieces()[Number(select.value)];
    if (!piece) return;
    const selected = selectedPieces();
    if (selected.some(item => item.key === piece.key || (item.pieceName === piece.pieceName && item.shrinkage === piece.shrinkage))) {
      const status = document.getElementById('pattern-piece-picker-status');
      if (status) status.textContent = 'Esa pieza ya está agregada a la Spec.';
      return;
    }
    setGeneral('patternPieces', [...selected, piece]);
    renderPieces();
  }
  function initializeStageDate() {
    const input = document.getElementById('spec-stage-date');
    if (!input) return;
    const data = generalData();
    if (!data.stageDate) {
      data.stageDate = today();
      input.value = data.stageDate;
    } else {
      input.value = data.stageDate;
    }
    if (!data._stageDateForStage) data._stageDateForStage = document.getElementById('sample-type')?.value?.trim() || '';
  }
  document.addEventListener('change', async (event) => {
    const input = event.target;
    if (input instanceof HTMLSelectElement && input.id === 'pattern-piece-select') {
      const add = document.getElementById('pattern-piece-add');
      if (add) add.disabled = !input.value;
      return;
    }
    if (!(input instanceof HTMLInputElement)) return;
    if (input.id === 'exported-pattern-file') {
      const file = input.files && input.files[0];
      if (!file) return;
      const status = document.getElementById('exported-pattern-status');
      const nameInput = document.getElementById('exported-pattern-name');
      if (nameInput) {
        nameInput.value = file.name;
        setGeneral('exportedPatternName', file.name);
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (status) status.textContent = 'Analizando etiquetas de piezas…';
      try {
        if (!window.PatternPieceShrinkage?.extractFromAiFile) throw new Error('El lector de patrones no está disponible.');
        const result = await window.PatternPieceShrinkage.extractFromAiFile(file);
        setGeneral('availablePatternPieces', result.pieces);
        setGeneral('patternPieces', []);
        const search = document.getElementById('pattern-piece-search');
        if (search) search.value = '';
        renderPieceOptions();
        renderPieces();
        const withShrinkage = result.pieces.filter((piece) => piece.hasShrinkage).length;
        if (status) status.textContent = result.pieces.length + ' piezas detectadas; ' + withShrinkage + ' con encogimiento indicado. Ahora busca y agrega las que necesitas.';
        const pickerStatus = document.getElementById('pattern-piece-picker-status');
        if (pickerStatus) pickerStatus.textContent = result.pieces.length
          ? result.pieces.length + ' piezas disponibles para seleccionar.'
          : 'El archivo se abrió, pero el lector no encontró etiquetas de piezas legibles.';
      } catch (error) {
        setGeneral('availablePatternPieces', []);
        setGeneral('patternPieces', []);
        renderPieceOptions();
        renderPieces();
        if (status) status.textContent = error.message || 'No se pudo analizar el patrón.';
        const pickerStatus = document.getElementById('pattern-piece-picker-status');
        if (pickerStatus) pickerStatus.textContent = error.message || 'No se pudo analizar el patrón.';
      }
    } else if (input.id === 'customer-techpack-file') {
      const file = input.files && input.files[0];
      if (!file) return;
      const nameInput = document.getElementById('customer-techpack-name');
      if (nameInput) {
        nameInput.value = file.name;
        setGeneral('customerTechpackName', file.name);
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  });
  document.addEventListener('input', (event) => {
    const input = event.target;
    if (input instanceof HTMLInputElement && input.id === 'pattern-piece-search') {
      renderPieceOptions();
      return;
    }
    if (!(input instanceof HTMLInputElement) || input.id !== 'sample-type') return;
    const data = generalData();
    const nextStage = input.value.trim();
    const previousStage = String(data._stageDateForStage || '').trim();
    if (nextStage && nextStage !== previousStage) {
      data.stageDate = today();
      data._stageDateForStage = nextStage;
      const dateInput = document.getElementById('spec-stage-date');
      if (dateInput) dateInput.value = data.stageDate;
    }
  });
  document.addEventListener('click', (event) => {
    const addButton = event.target.closest('#pattern-piece-add');
    if (addButton) { addSelectedPiece(); return; }
    const removeButton = event.target.closest('[data-remove-pattern-piece]');
    if (removeButton) {
      const index = Number(removeButton.getAttribute('data-remove-pattern-piece'));
      setGeneral('patternPieces', selectedPieces().filter((_, itemIndex) => itemIndex !== index));
      renderPieces();
    }
  });
  function initialize() { initializeStageDate(); renderPieceOptions(); renderPieces(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  const observer = new MutationObserver(() => {
    const dateInput = document.getElementById('spec-stage-date');
    if (dateInput && dateInput.dataset.patternMetadataInitialized !== '1') {
      dateInput.dataset.patternMetadataInitialized = '1';
      initialize();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.renderPatternShrinkageExport = renderPieces;
})();
