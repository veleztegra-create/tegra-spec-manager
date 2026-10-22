/* Integra el lector de patrones y asocia cada pieza/encogimiento a un placement. */
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
    const state = Store.state;
    if (!state.generalData || typeof state.generalData !== 'object') state.generalData = {};
    return state.generalData;
  }
  function setGeneral(key, value) { generalData()[key] = value; }
  function availablePieces() {
    return Array.isArray(generalData().availablePatternPieces) ? generalData().availablePatternPieces : [];
  }
  function legacySelectedPieces() {
    return Array.isArray(generalData().patternPieces) ? generalData().patternPieces : [];
  }
  function placements() {
    return Array.isArray(window.placements) ? window.placements : [];
  }
  function placementLabel(placement, index) {
    return String(placement.title || placement.name || placement.type || ('Placement ' + (index + 1))).replace('CUSTOM: ', '');
  }
  function renderPlacementOptions() {
    const select = document.getElementById('pattern-placement-select');
    if (!select) return;
    const previous = select.value;
    select.replaceChildren();
    const list = placements();
    if (!list.length) {
      select.add(new Option('Primero crea un placement', ''));
      return;
    }
    list.forEach((placement, index) => {
      select.add(new Option(placementLabel(placement, index), String(placement.id)));
    });
    if (previous && list.some(p => String(p.id) === previous)) select.value = previous;
    else select.value = String(list[0].id);
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
      matches.forEach(piece => {
        select.add(new Option([piece.pieceName, piece.shrinkage].filter(Boolean).join(' — '), String(availablePieces().indexOf(piece))));
      });
      if (previous && Array.from(select.options).some(option => option.value === previous)) select.value = previous;
    }
    if (add) add.disabled = !select.value || !document.getElementById('pattern-placement-select')?.value;
    if (status) status.textContent = availablePieces().length
      ? matches.length + ' de ' + availablePieces().length + ' piezas disponibles. Elige el placement y asigna la pieza.'
      : 'Carga el patrón, elige el placement de destino y asigna las piezas necesarias.';
  }
  function renderPieces() {
    const target = document.getElementById('pattern-shrinkage-export');
    if (!target) return;
    const sections = placements().map((placement, pIndex) => {
      const pieces = Array.isArray(placement.patternPieces) ? placement.patternPieces : [];
      if (!pieces.length) return '';
      const label = placementLabel(placement, pIndex);
      return '<div class="pattern-placement-group"><strong>' + esc(label) + '</strong>' +
        pieces.map((piece, index) => {
          const name = String(piece.pieceName || '').trim();
          const shrinkage = String(piece.shrinkage || '').trim();
          return '<div class="pattern-shrinkage-line"><span>' + esc([name, shrinkage].filter(Boolean).join(' ')) +
            '</span><button type="button" class="btn btn-outline btn-sm" data-remove-placement-pattern-piece="' +
            esc(placement.id) + '" data-piece-index="' + index + '" aria-label="Quitar ' + esc(name) +
            ' de ' + esc(label) + '"><i class="fas fa-times"></i> Quitar</button></div>';
        }).join('') + '</div>';
    }).join('');
    const legacy = legacySelectedPieces();
    const legacyHtml = legacy.length
      ? '<div class="pattern-placement-group"><strong>Piezas heredadas sin placement</strong>' +
        legacy.map(piece => '<div class="pattern-shrinkage-line"><span>' +
          esc([piece.pieceName, piece.shrinkage].filter(Boolean).join(' ')) +
          '</span><small>Registro de una spec anterior</small></div>').join('') + '</div>'
      : '';
    target.innerHTML = sections || legacyHtml
      ? sections + legacyHtml
      : '<p class="pattern-shrinkage-empty">Todavía no has asignado piezas a los placements.</p>';
  }
  function addSelectedPiece() {
    const select = document.getElementById('pattern-piece-select');
    const targetSelect = document.getElementById('pattern-placement-select');
    if (!select || select.value === '' || !targetSelect?.value) return;
    const piece = availablePieces()[Number(select.value)];
    const placement = placements().find(item => String(item.id) === String(targetSelect.value));
    if (!piece || !placement) return;
    if (!Array.isArray(placement.patternPieces)) placement.patternPieces = [];
    if (placement.patternPieces.some(item => item.key === piece.key ||
      (item.pieceName === piece.pieceName && item.shrinkage === piece.shrinkage))) {
      const status = document.getElementById('pattern-piece-picker-status');
      if (status) status.textContent = 'Esa pieza ya está asignada a este placement.';
      return;
    }
    placement.patternPieces.push({ ...piece });
    renderPieces();
    const status = document.getElementById('pattern-piece-picker-status');
    if (status) status.textContent = 'Pieza asignada a ' + placementLabel(placement, placements().indexOf(placement)) + '.';
  }
  function initializeStageDate() {
    const input = document.getElementById('spec-stage-date');
    if (!input) return;
    const data = generalData();
    if (!data.stageDate) {
      data.stageDate = today();
      input.value = data.stageDate;
    } else input.value = data.stageDate;
    if (!data._stageDateForStage) data._stageDateForStage = document.getElementById('sample-type')?.value?.trim() || '';
  }
  document.addEventListener('change', async (event) => {
    const input = event.target;
    if (input instanceof HTMLSelectElement && input.id === 'pattern-piece-select') {
      const add = document.getElementById('pattern-piece-add');
      if (add) add.disabled = !input.value || !document.getElementById('pattern-placement-select')?.value;
      return;
    }
    if (input instanceof HTMLSelectElement && input.id === 'pattern-placement-select') {
      const add = document.getElementById('pattern-piece-add');
      if (add) add.disabled = !input.value || !document.getElementById('pattern-piece-select')?.value;
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
        // Una nueva fuente de patrón invalida las asignaciones anteriores para evitar referencias mezcladas.
        placements().forEach(placement => { placement.patternPieces = []; });
        renderPlacementOptions();
        renderPieceOptions();
        renderPieces();
        const withShrinkage = result.pieces.filter(piece => piece.hasShrinkage).length;
        if (status) status.textContent = result.pieces.length + ' piezas detectadas; ' + withShrinkage + ' con encogimiento indicado.';
        const pickerStatus = document.getElementById('pattern-piece-picker-status');
        if (pickerStatus) pickerStatus.textContent = result.pieces.length
          ? 'Elige un placement, busca la pieza y pulsa “Asignar pieza al placement”.'
          : 'El archivo se abrió, pero el lector no encontró etiquetas de piezas legibles.';
      } catch (error) {
        setGeneral('availablePatternPieces', []);
        renderPieceOptions();
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
    const removeButton = event.target.closest('[data-remove-placement-pattern-piece]');
    if (removeButton) {
      const placementId = removeButton.getAttribute('data-remove-placement-pattern-piece');
      const index = Number(removeButton.getAttribute('data-piece-index'));
      const placement = placements().find(item => String(item.id) === String(placementId));
      if (placement && Array.isArray(placement.patternPieces)) {
        placement.patternPieces = placement.patternPieces.filter((_, pieceIndex) => pieceIndex !== index);
        renderPieces();
      }
    }
  });
  function initialize() { initializeStageDate(); renderPlacementOptions(); renderPieceOptions(); renderPieces(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  const observer = new MutationObserver(() => {
    const dateInput = document.getElementById('spec-stage-date');
    if (dateInput && dateInput.dataset.patternMetadataInitialized !== '1') {
      dateInput.dataset.patternMetadataInitialized = '1';
      initialize();
    } else if (document.getElementById('pattern-placement-select')) {
      renderPlacementOptions();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.renderPatternShrinkageExport = renderPieces;
})();