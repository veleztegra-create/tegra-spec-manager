/* Extractor local de etiquetas Piece Name y encogimientos desde archivos AI compatibles con PDF. */
(function (root) {
  'use strict';
  const SHRINKAGE_RE = /([0-9]+(?:\.[0-9]+)?\s*_\s*L\s*X\s*[0-9]+(?:\.[0-9]+)?\s*_\s*W)/i;
  const LABEL_RE = /Piece\s*Name\s*:?/ig;
  const NEXT_LABEL_RE = /\b(?:Piece\s*(?:Name|Number|No\.?|ID)|Style\s*:|Pattern\s*:|Size\s*:)/i;
  function normalizeSpaces(value) {
    return String(value || '').replace(/[\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function decodePostScriptString(value) {
    return String(value || '')
      .replace(/\\([()\\])/g, '$1')
      .replace(/\\([0-7]{1,3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)));
  }

  function parsePieceNames(text) {
    const source = String(text || '');
    const postScriptLabels = [];
    const postScriptText = /\(((?:\\.|[^\\)])*)\)\s*Tx/g;
    let psMatch;
    while ((psMatch = postScriptText.exec(source)) !== null) {
      const fragment = normalizeSpaces(decodePostScriptString(psMatch[1]));
      if (/Piece\s*Name\s*:?/i.test(fragment)) postScriptLabels.push(fragment);
    }

    // Illustrator puede guardar las etiquetas como cadenas PostScript: (Piece Name: ...) Tx.
    // Si existen, se analiza cada cadena de texto de forma aislada para no mezclar piezas.
    const segments = postScriptLabels.length
      ? postScriptLabels
      : (normalizeSpaces(source).match(/Piece\s*Name\s*:?\s*[\s\S]*?(?=Piece\s*Name\s*:?\s*|$)/gi) || []);
    const pieces = [];

    for (const segment of segments) {
      const label = segment.match(/Piece\s*Name\s*:?/i);
      if (!label) continue;
      const tail = segment.slice(label.index + label[0].length);
      const shrinkageMatch = tail.match(SHRINKAGE_RE);
      let raw = shrinkageMatch
        ? tail.slice(0, shrinkageMatch.index + shrinkageMatch[0].length)
        : tail.slice(0, 70);
      raw = normalizeSpaces(raw).replace(/^[:\-\s]+/, '').replace(/[;,\s]+$/, '');
      // Remove PostScript/PDF string-command remnants from labels without shrinkage.
      raw = raw.replace(/\)\s*Tx\s*$/i, '').replace(/\s*\)\s*Tx\s*$/i, '').trim();
      if (!raw) continue;

      const shrink = raw.match(SHRINKAGE_RE);
      const shrinkage = shrink
        ? normalizeSpaces(shrink[1]).replace(/\s*_\s*/g, '_').replace(/\s*X\s*/gi, ' X ')
        : null;
      const pieceName = shrink
        ? normalizeSpaces(raw.slice(0, shrink.index)).replace(/[-:;,\s]+$/, '')
        : raw;
      if (!pieceName && !shrinkage) continue;

      const key = (pieceName + '|' + (shrinkage || '')).toLowerCase();
      if (pieces.some(item => item.key === key)) continue;
      pieces.push({
        key,
        pieceName: pieceName || 'Nombre no identificado',
        shrinkage,
        fullText: 'Piece Name: ' + (pieceName ? pieceName + (shrinkage ? ' ' : '') : '') + (shrinkage || ''),
        hasShrinkage: Boolean(shrinkage)
      });
    }
    return pieces;
  }

  // "FT" es la abreviatura operativa que se usa para localizar Front.
  function filterPieces(pieces, query) {
    const term = normalizeSpaces(query).toLowerCase();
    if (!term) return pieces.slice();
    const aliases = term === 'ft' || term === 'front' ? ['front'] : [term];
    return pieces.filter(piece => {
      const name = normalizeSpaces(piece.pieceName).toLowerCase();
      const full = normalizeSpaces(piece.fullText).toLowerCase();
      return aliases.some(alias => name.includes(alias) || (alias !== 'front' && full.includes(alias)));
    });
  }

  async function extractFromAiFile(file) {
    // Primero intenta leer el texto nativo de Illustrator/PostScript. Es rápido y
    // funciona incluso cuando el .ai no contiene una representación PDF compatible.
    let nativeText = '';
    try {
      nativeText = await file.text();
      const nativePieces = parsePieceNames(nativeText);
      if (nativePieces.length) return { pieces: nativePieces, pageCount: null, sourceFormat: 'illustrator-postscript' };
    } catch (_) {
      // Continúa con PDF.js como alternativa.
    }

    if (!root.pdfjsLib || typeof root.pdfjsLib.getDocument !== 'function') {
      throw new Error('No se encontró texto nativo de piezas y tampoco está disponible el lector PDF.js para el formato alternativo.');
    }
    const data = await file.arrayBuffer();
    let pdf;
    try {
      pdf = await root.pdfjsLib.getDocument({ data }).promise;
    } catch (error) {
      throw new Error('No se pudo extraer texto del archivo .ai. El formato debe conservar texto nativo de Illustrator o ser compatible con PDF.');
    }
    const chunks = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      chunks.push(content.items.map(item => item.str || '').join(' '));
    }
    const pieces = parsePieceNames(chunks.join(' '));
    if (!pieces.length) {
      throw new Error('El archivo se abrió, pero no se encontraron etiquetas “Piece Name” con texto legible. Verifica que las etiquetas no estén convertidas a contornos.');
    }
    return { pieces, pageCount: pdf.numPages, sourceFormat: 'pdf' };
  }
  root.PatternPieceShrinkage = { parsePieceNames, filterPieces, extractFromAiFile };
  root.initPatternPieceShrinkage = function () {
    const input = document.getElementById('pattern-ai-file');
    const status = document.getElementById('pattern-ai-status');
    const search = document.getElementById('pattern-piece-search');
    const list = document.getElementById('pattern-piece-list');
    const detail = document.getElementById('pattern-piece-detail');
    const copyButton = document.getElementById('pattern-piece-copy');
    if (!input || input.dataset.bound === '1') return;
    input.dataset.bound = '1';
    let selected = null;
    let allPieces = [];
    function setStatus(message, kind) {
      status.textContent = message;
      status.className = 'pattern-ai-status ' + (kind || '');
    }
    function renderPieces(pieces) {
      list.replaceChildren();
      detail.textContent = 'Selecciona una pieza para ver el texto detectado.';
      copyButton.disabled = true;
      selected = null;
      if (!pieces.length) {
        const empty = document.createElement('p');
        empty.className = 'pattern-piece-empty';
        empty.textContent = allPieces.length
          ? 'No se encontraron piezas que coincidan con la búsqueda.'
          : 'Carga un archivo para ver las piezas encontradas.';
        list.appendChild(empty);
        return;
      }
      pieces.forEach((piece, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'pattern-piece-option';
        button.textContent = piece.pieceName;
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => {
          selected = piece;
          list.querySelectorAll('button').forEach(item => {
            item.classList.toggle('selected', item === button);
            item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
          });
          detail.textContent = piece.fullText;
          copyButton.disabled = false;
        });
        button.dataset.index = String(index);
        list.appendChild(button);
      });
      if (pieces.length) list.querySelector('button')?.click();
    }
    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      if (!/\.ai$/i.test(file.name)) {
        setStatus('Selecciona un archivo de Adobe Illustrator (.ai).', 'error');
        return;
      }
      allPieces = [];
      if (search) search.value = '';
      setStatus('Analizando textos del archivo…', 'loading');
      list.replaceChildren();
      detail.textContent = 'Procesando archivo…';
      copyButton.disabled = true;
      try {
        const result = await extractFromAiFile(file);
        allPieces = result.pieces;
        renderPieces(allPieces);
        const withShrinkage = allPieces.filter(piece => piece.hasShrinkage).length;
        setStatus('Análisis completado: ' + result.pieces.length + ' piezas detectadas; ' + withShrinkage + ' con encogimiento indicado. No se verifica el encogimiento físico del patrón.', 'success');
      } catch (error) {
        allPieces = [];
        renderPieces([]);
        setStatus(error.message || 'No se pudo analizar el archivo.', 'error');
        detail.textContent = 'No hay resultados para mostrar.';
      }
    });
    if (search && search.dataset.bound !== '1') {
      search.dataset.bound = '1';
      search.addEventListener('input', () => {
        const query = search.value;
        const filtered = root.PatternPieceShrinkage.filterPieces(allPieces, query);
        renderPieces(filtered);
        if (query.trim()) {
          setStatus('Búsqueda: ' + filtered.length + ' coincidencia(s) para "' + query.trim() + '".', filtered.length ? 'success' : 'error');
        } else if (allPieces.length) {
          const withShrinkage = allPieces.filter(piece => piece.hasShrinkage).length;
          setStatus('Análisis completado: ' + allPieces.length + ' piezas detectadas; ' + withShrinkage + ' con encogimiento indicado. No se verifica el encogimiento físico del patrón.', 'success');
        }
      });
    }
    copyButton.addEventListener('click', async () => {
      if (!selected) return;
      try {
        await navigator.clipboard.writeText(selected.fullText);
        setStatus('Texto copiado al portapapeles.', 'success');
      } catch (_) {
        setStatus('No se pudo copiar automáticamente. Selecciona y copia el texto mostrado.', 'error');
      }
    });
  };
})(window);
