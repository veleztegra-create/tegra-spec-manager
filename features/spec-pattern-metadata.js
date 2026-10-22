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
    const list = placements();
    const desired = list.length
      ? list.map((placement, index) => ({ value: String(placement.id), label: placementLabel(placement, index) }))
      : [{ value: '', label: 'Primero crea un placement' }];

    // Este archivo observa cambios del DOM. No reescribir el selector si ya está actualizado:
    // hacerlo dispara al observer otra vez y puede crear un ciclo infinito de mutaciones.
    const alreadyMatches = select.options.length === desired.length &&
      desired.every((option, index) =>
        select.options[index].value === option.value &&
        select.options[index].textContent === option.label
      );
    if (alreadyMatches) return;

    select.replaceChildren();
    desired.forEach(option => select.add(new Option(option.label, option.value)));
    if (previous && list.some(placement => String(placement.id) === previous)) {
      select.value = previous;
    } else if (list.length) {
      select.value = String(list[0].id);
    }
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
  function suggestLocalPieceIndex(placement, pieces) {
    const type=String(placement.type||placement.title||placement.name||'').toUpperCase();
    const tests=type.includes('FRONT')?[/^FT/,/FRONT/]:type.includes('BACK')?[/^BK/,/BACK/]:
      type.includes('SLEEVE')?[/^SLV/,/SLEEVE/]:type.includes('CHEST')?[/^CH\\b/,/CHEST/]:
      type.includes('SHOULDER')?[/^SH\\b/,/SHOULDER/]:type.includes('COLLAR')?[/^CL\\b/,/COLLAR/]:[];
    for(const test of tests){const i=pieces.findIndex(p=>test.test(String(p.pieceName||'').toUpperCase()));if(i>=0)return i;}
    return -1;
  }
  function renderLocalPieceOptions() {
    const pieces=availablePieces();
    document.querySelectorAll('.placement-pattern-piece-select').forEach(select=>{
      const placement=placements().find(p=>String(p.id)===String(select.dataset.placementId));if(!placement)return;
      const previous=select.value||String(placement.patternPieceSelection||'');
      const desired=[{value:'',label:pieces.length?'Selecciona la pieza…':'Carga un patrón primero'},...pieces.map((p,i)=>({value:String(i),label:[p.pieceName,p.shrinkage].filter(Boolean).join(' — ')}))];
      const same=select.options.length===desired.length&&desired.every((o,i)=>select.options[i].value===o.value&&select.options[i].textContent===o.label);
      if(!same){select.replaceChildren();desired.forEach(o=>select.add(new Option(o.label,o.value)));}
      let chosen=previous&&pieces[Number(previous)]?previous:'';
      if(!chosen&&pieces.length){const i=suggestLocalPieceIndex(placement,pieces);if(i>=0)chosen=String(i);}
      select.value=chosen;placement.patternPieceSelection=chosen;
      const status=document.getElementById('placement-pattern-status-'+placement.id);
      if(status&&!pieces.length&&status.textContent!=='Carga un patrón para ver las piezas disponibles.')status.textContent='Carga un patrón para ver las piezas disponibles.';
      else if(status&&chosen&&status.textContent!=='Sugerencia automática; puedes cambiarla antes de asignar.')status.textContent='Sugerencia automática; puedes cambiarla antes de asignar.';
    });
  }
  function renderLocalAssignedPieces() {
    placements().forEach(placement=>{
      const target=document.getElementById('placement-pattern-pieces-'+placement.id);if(!target)return;
      const pieces=Array.isArray(placement.patternPieces)?placement.patternPieces:[];
      const html=pieces.length?pieces.map((p,i)=>'<div class="pattern-shrinkage-line"><span>'+esc([p.pieceName,p.shrinkage].filter(Boolean).join(' '))+'</span><button type="button" class="btn btn-outline btn-sm" data-remove-placement-pattern-piece="'+esc(placement.id)+'" data-piece-index="'+i+'"><i class="fas fa-times"></i> Quitar</button></div>').join(''):'<p class="pattern-shrinkage-empty">Sin piezas asignadas.</p>';
      if(target.innerHTML!==html)target.innerHTML=html;
    });
  }
  function addLocalPiece(placementId) {
    const placement=placements().find(p=>String(p.id)===String(placementId));
    const select=document.querySelector('.placement-pattern-piece-select[data-placement-id="'+placementId+'"]');
    if(!placement||!select||select.value==='')return;
    const piece=availablePieces()[Number(select.value)];if(!piece)return;
    if(!Array.isArray(placement.patternPieces))placement.patternPieces=[];
    if(placement.patternPieces.some(p=>p.key===piece.key||(p.pieceName===piece.pieceName&&p.shrinkage===piece.shrinkage))){
      const status=document.getElementById('placement-pattern-status-'+placementId);if(status)status.textContent='Esa pieza ya está asignada a este placement.';return;
    }
    placement.patternPieces.push({...piece});renderLocalAssignedPieces();
    const status=document.getElementById('placement-pattern-status-'+placementId);if(status)status.textContent='Pieza asignada correctamente.';
  }
  document.addEventListener('change',event=>{
    const select=event.target;
    if(select instanceof HTMLSelectElement&&select.classList.contains('placement-pattern-piece-select')){
      const placement=placements().find(p=>String(p.id)===String(select.dataset.placementId));
      if(placement)placement.patternPieceSelection=select.value;
      const status=document.getElementById('placement-pattern-status-'+select.dataset.placementId);
      if(status)status.textContent='Pieza seleccionada. Pulsa “Asignar pieza” para agregarla.';
    }
  });
  document.addEventListener('click',event=>{
    const add=event.target.closest('[data-add-placement-pattern-piece]');
    if(add){addLocalPiece(add.getAttribute('data-add-placement-pattern-piece'));return;}
    const remove=event.target.closest('[data-remove-placement-pattern-piece]');
    if(remove){
      const placement=placements().find(p=>String(p.id)===String(remove.getAttribute('data-remove-placement-pattern-piece')));
      const i=Number(remove.getAttribute('data-piece-index'));
      if(placement&&Array.isArray(placement.patternPieces)){placement.patternPieces=placement.patternPieces.filter((_,index)=>index!==i);renderLocalAssignedPieces();}
    }
  });
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
        setGeneral('patternPieces', []); // Limpiar metadatos globales heredados; las nuevas asociaciones son por placement.
        // Una nueva fuente de patrón invalida las asignaciones anteriores para evitar referencias mezcladas.
        placements().forEach(placement => { placement.patternPieces = []; });
        renderPlacementOptions();
        renderPieceOptions();
        renderPieces();
        renderLocalPieceOptions();
        renderLocalAssignedPieces();
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
  function initialize() { initializeStageDate(); renderPlacementOptions(); renderPieceOptions(); renderPieces(); renderLocalPieceOptions(); renderLocalAssignedPieces(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  const observer = new MutationObserver(() => {
    const dateInput = document.getElementById('spec-stage-date');
    if (dateInput && dateInput.dataset.patternMetadataInitialized !== '1') {
      dateInput.dataset.patternMetadataInitialized = '1';
      initialize();
    } else if (document.querySelector('.placement-pattern-piece-select')) {
      renderLocalPieceOptions(); renderLocalAssignedPieces();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.renderPatternShrinkageExport = renderPieces;
})();