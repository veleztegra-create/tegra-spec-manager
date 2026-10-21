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
    const state = Store.getState();
    if (!state.generalData || typeof state.generalData !== 'object') state.generalData = {};
    return state.generalData;
  }
  function setGeneral(key, value) {
    const data = generalData();
    data[key] = value;
  }
  function renderPieces() {
    const target = document.getElementById('pattern-shrinkage-export');
    if (!target) return;
    const pieces = Array.isArray(generalData().patternPieces) ? generalData().patternPieces : [];
    if (!pieces.length) {
      target.innerHTML = '<p class="pattern-shrinkage-empty">Las piezas y sus encogimientos aparecerán aquí después de cargar el patrón.</p>';
      return;
    }
    target.innerHTML = pieces.map((piece) => {
      const name = String(piece.pieceName || '').trim();
      const shrinkage = String(piece.shrinkage || '').trim();
      return '<div class="pattern-shrinkage-line">' + esc([name, shrinkage].filter(Boolean).join(' ')) + '</div>';
    }).join('');
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
        setGeneral('patternPieces', result.pieces);
        renderPieces();
        const withShrinkage = result.pieces.filter((piece) => piece.hasShrinkage).length;
        if (status) status.textContent = result.pieces.length + ' piezas detectadas; ' + withShrinkage + ' con encogimiento indicado.';
      } catch (error) {
        setGeneral('patternPieces', []);
        renderPieces();
        if (status) status.textContent = error.message || 'No se pudo analizar el patrón.';
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
  function initialize() { initializeStageDate(); renderPieces(); }
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
