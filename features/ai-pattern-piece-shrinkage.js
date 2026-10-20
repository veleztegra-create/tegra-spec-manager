/* Extractor local de etiquetas Piece Name y encogimientos desde archivos AI compatibles con PDF. */
(function (root) {
  'use strict';
  const SHRINKAGE_RE = /([0-9]+(?:\.[0-9]+)?\s*_\s*L\s*X\s*[0-9]+(?:\.[0-9]+)?\s*_\s*W)/i;
  const LABEL_RE = /Piece\s*Name\s*:?/ig;
  const NEXT_LABEL_RE = /\b(?:Piece\s*(?:Name|Number|No\.?|ID)|Style\s*:|Pattern\s*:|Size\s*:)/i;
  function normalizeSpaces(value) {
    return String(value || '').replace(/[\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function parsePieceNames(text) {
    const source = normalizeSpaces(text);
    const labels = [];
    LABEL_RE.lastIndex = 0;
    let match;
    while ((match = LABEL_RE.exec(source)) !== null) {
      const tail = source.slice(match.index + match[0].length, match.index + match[0].length + 180);
      const shrinkageMatch = tail.match(SHRINKAGE_RE);
      const nextLabelIndex = tail.search(NEXT_LABEL_RE);
      const shrinkageBeforeNextLabel = shrinkageMatch && (nextLabelIndex < 0 || shrinkageMatch.index < nextLabelIndex);
      let raw = '';
      if (shrinkageBeforeNextLabel) {
        raw = tail.slice(0, shrinkageMatch.index + shrinkageMatch[0].length);
      } else {
        raw = tail.slice(0, nextLabelIndex >= 0 ? nextLabelIndex : Math.min(tail.length, 45));
        const stop = raw.search(/\b(?:Piece\s*(?:Name|Number|No\.?|ID)|Pattern\s*:|Style\s*:|Material\s*:|Color\s*:)/i);
        if (stop >= 0) raw = raw.slice(0, stop);
      }
      raw = normalizeSpaces(raw).replace(/^[:\-\s]+/, '').replace(/[;,\s]+$/, '');
      if (!raw) continue;
      const shrink = raw.match(SHRINKAGE_RE);
      const shrinkage = shrink ? normalizeSpaces(shrink[1]).replace(/\s*_\s*/g, '_').replace(/\s*X\s*/gi, ' X ') : null;
      const pieceName = shrink ? normalizeSpaces(raw.slice(0, shrink.index)).replace(/[-:;,\s]+$/, '') : raw;
      if (!pieceName && !shrinkage) continue;
      const key = (pieceName + '|' + (shrinkage || '')).toLowerCase();
      if (labels.some(item => item.key === key)) continue;
      labels.push({
        key, pieceName: pieceName || 'Nombre no identificado', shrinkage,
        fullText: 'Piece Name: ' + (pieceName ? pieceName + (shrinkage ? ' ' : '') : '') + (shrinkage || ''),
        hasShrinkage: Boolean(shrinkage)
      });
    }
    return labels;
  }
  async function extractFromAiFile(file) {
    if (!root.pdfjsLib || typeof root.pdfjsLib.getDocument !== 'function') {
      throw new Error('No está disponible el lector PDF.js necesario para analizar archivos .ai compatibles con PDF.');
    }
    const data = await file.arrayBuffer();
    let pdf;
    try {
      pdf = await root.pdfjsLib.getDocument({ data }).promise;
    } catch (error) {
      throw new Error('No se pudo leer el archivo como PDF compatible. En Illustrator, guarda una copia con “Crear archivo compatible con PDF” activado y vuelve a intentarlo.');
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
    return { pieces, pageCount: pdf.numPages };
  }
  root.PatternPieceShrinkage = { parsePieceNames, extractFromAiFile };
  root.initPatternPieceShrinkage = function () {
    const input = document.getElementById('pattern-ai-file');
    const status = document.getElementById('pattern-ai-status');
    const list = document.getElementById('pattern-piece-list');
    const detail = document.getElementById('pattern-piece-detail');
    const copyButton = document.getElementById('pattern-piece-copy');
    if (!input || input.dataset.bound === '1') return;
    input.dataset.bound = '1';
    let selected = null;
    function setStatus(message, kind) {
      status.textContent = message;
      status.className = 'pattern-ai-status ' + (kind || '');
    }
    function renderPieces(pieces) {
      list.replaceChildren();
      detail.textContent = 'Selecciona una pieza para ver el texto detectado.';
      copyButton.disabled = true;
      selected = null;
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
      setStatus('Analizando textos del archivo…', 'loading');
      list.replaceChildren();
      detail.textContent = 'Procesando archivo…';
      copyButton.disabled = true;
      try {
        const result = await extractFromAiFile(file);
        renderPieces(result.pieces);
        const withShrinkage = result.pieces.filter(piece => piece.hasShrinkage).length;
        setStatus('Análisis completado: ' + result.pieces.length + ' piezas detectadas; ' + withShrinkage + ' con encogimiento indicado. No se verifica el encogimiento físico del patrón.', 'success');
      } catch (error) {
        setStatus(error.message || 'No se pudo analizar el archivo.', 'error');
        detail.textContent = 'No hay resultados para mostrar.';
      }
    });
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
