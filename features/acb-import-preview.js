import { decodeAcb } from '../modules/acb-reader.js';

const PAGE_SIZE = 250;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
let currentBook = null;
let currentFileName = '';
let visibleLimit = PAGE_SIZE;
let initialized = false;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function setMessage(message, type = '') {
  const el = document.getElementById('acb-import-message');
  if (!el) return;
  el.textContent = message;
  el.className = `acb-import-message${type ? ` ${type}` : ''}`;
}

function findDuplicates(colors) {
  const codeMap = new Map();
  const nameMap = new Map();
  const hexMap = new Map();
  colors.forEach((color, index) => {
    const code = color.code.trim().toUpperCase();
    const name = color.name.trim().toLocaleLowerCase();
    const hex = color.hex.toUpperCase();
    for (const [map, key, type] of [
      [codeMap, code, 'código'],
      [nameMap, name, 'nombre'],
      [hexMap, hex, 'HEX']
    ]) {
      if (!map.has(key)) map.set(key, []);
      map.get(key).push({ index, type });
    }
  });
  const issues = new Map();
  for (const map of [codeMap, nameMap, hexMap]) {
    for (const records of map.values()) {
      if (records.length < 2) continue;
      records.forEach(({ index, type }) => {
        if (!issues.has(index)) issues.set(index, new Set());
        issues.get(index).add(type);
      });
    }
  }
  return issues;
}

function renderRows() {
  if (!currentBook) return;
  const query = (document.getElementById('acb-color-search')?.value || '').trim().toLocaleLowerCase();
  const duplicates = findDuplicates(currentBook.colors);
  const filtered = currentBook.colors.filter((color) =>
    [color.name, color.rawName, color.code, color.hex, `${color.rgb.r},${color.rgb.g},${color.rgb.b}`]
      .some((value) => String(value).toLocaleLowerCase().includes(query))
  );
  const body = document.getElementById('acb-color-rows');
  const shown = filtered.slice(0, visibleLimit);
  body.innerHTML = shown.map((color) => {
    const types = duplicates.get(color.index);
    const review = types
      ? `<span class="acb-import-badge duplicate">Revisar: ${escapeHtml([...types].join(', '))}</span>`
      : '<span class="acb-import-badge">Sin repetición interna</span>';
    return `<tr>
      <td>${color.index + 1}</td>
      <td><span class="acb-import-swatch" style="background:${color.hex}" title="${color.hex}" aria-label="Muestra ${color.hex}"></span></td>
      <td>${escapeHtml(color.name)}</td>
      <td><code>${escapeHtml(color.code)}</code></td>
      <td>${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}</td>
      <td><code>${escapeHtml(color.hex)}</code></td>
      <td>${review}</td>
    </tr>`;
  }).join('');

  const issueCount = duplicates.size;
  document.getElementById('acb-stat-title').textContent = currentBook.title || '(sin título)';
  document.getElementById('acb-stat-count').textContent = currentBook.colorCount;
  document.getElementById('acb-stat-duplicates').textContent = issueCount;
  document.getElementById('acb-stat-model').textContent = currentBook.colorModel;
  document.getElementById('acb-table-summary').textContent =
    query ? `Coincidencias: ${filtered.length} de ${currentBook.colorCount}` : `Colores del libro: ${currentBook.colorCount}`;
  document.getElementById('acb-page-info').textContent =
    filtered.length ? `Mostrando ${shown.length} de ${filtered.length}` : 'No hay colores que coincidan con la búsqueda.';
  document.getElementById('acb-show-more').hidden = shown.length >= filtered.length;
  document.getElementById('acb-show-more').textContent = `Mostrar siguientes ${PAGE_SIZE}`;
}

function showBook(book, fileName) {
  currentBook = book;
  currentFileName = fileName;
  visibleLimit = PAGE_SIZE;
  document.getElementById('acb-import-results').hidden = false;
  document.getElementById('acb-export-preview').disabled = false;
  const details = [
    `Archivo: ${fileName}`,
    `Descripción: ${book.description || '—'}`,
    `Versión ACB: ${book.version}`,
    `ID del libro: ${book.bookId}`,
    `Prefijo: ${book.colorNamePrefix || '—'}`,
    `Sufijo: ${book.colorNamePostfix || '—'}`,
    `Identificador spot/process: ${book.spotProcessIdentifier || 'no incluido'}`
  ];
  document.getElementById('acb-book-details').textContent = details.join(' · ');
  const duplicateCount = findDuplicates(book.colors).size;
  setMessage(
    duplicateCount
      ? `Lectura completada: ${book.colorCount} colores. ${duplicateCount} registros tienen posibles repeticiones internas; revisa la tabla antes de usar los datos.`
      : `Lectura completada: ${book.colorCount} colores. No se encontraron repeticiones internas por código, nombre o HEX.`,
    duplicateCount ? 'warning' : ''
  );
  renderRows();
}

async function handleFile(file) {
  if (!file) return;
  document.getElementById('acb-export-preview').disabled = true;
  document.getElementById('acb-import-results').hidden = true;
  currentBook = null;
  if (!/\.acb$/i.test(file.name)) {
    setMessage('Selecciona un archivo con extensión .ACB.', 'error');
    return;
  }
  if (file.size === 0 || file.size > MAX_FILE_BYTES) {
    setMessage('El archivo está vacío o supera el límite de 5 MB.', 'error');
    return;
  }
  try {
    const bytes = await file.arrayBuffer();
    const book = decodeAcb(bytes);
    showBook(book, file.name);
  } catch (error) {
    console.error('No se pudo leer el ACB:', error);
    setMessage(error instanceof Error ? error.message : 'No se pudo leer el archivo ACB.', 'error');
  }
}

function exportPreview() {
  if (!currentBook) return;
  const payload = {
    schemaVersion: 1,
    status: 'preview-only-not-imported',
    sourceFile: currentFileName,
    importedAt: new Date().toISOString(),
    book: {
      title: currentBook.title,
      description: currentBook.description,
      bookId: currentBook.bookId,
      sourceFormat: currentBook.sourceFormat,
      version: currentBook.version,
      colorModel: currentBook.colorModel,
      colorCount: currentBook.colorCount,
      spotProcessIdentifier: currentBook.spotProcessIdentifier
    },
    colors: currentBook.colors.map((color) => ({
      index: color.index,
      name: color.name,
      rawName: color.rawName,
      code: color.code,
      rgb: color.rgb,
      hex: color.hex
    })),
    notes: [
      'Este archivo es una exportación de vista previa; no es una biblioteca registrada.',
      'El ACB no contiene reglas de producción como tinta, blocker o base blanca.'
    ]
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${(currentBook.title || 'color-book').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '') || 'color-book'}-preview.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function initAcbImporter() {
  const root = document.getElementById('acb-library');
  if (!root || !document.getElementById('acb-file-input') || initialized) return;
  initialized = true;
  document.getElementById('acb-file-input').addEventListener('change', (event) => {
    handleFile(event.target.files?.[0]);
  });
  document.getElementById('acb-color-search').addEventListener('input', () => {
    visibleLimit = PAGE_SIZE;
    renderRows();
  });
  document.getElementById('acb-clear-search').addEventListener('click', () => {
    document.getElementById('acb-color-search').value = '';
    visibleLimit = PAGE_SIZE;
    renderRows();
  });
  document.getElementById('acb-show-more').addEventListener('click', () => {
    visibleLimit += PAGE_SIZE;
    renderRows();
  });
  document.getElementById('acb-export-preview').addEventListener('click', exportPreview);
}

window.initAcbImporter = initAcbImporter;
function getAcbColorLibrary() {
  if (!currentBook) return null;
  return {
    title: currentBook.title || '',
    sourceFile: currentFileName,
    colors: currentBook.colors.map((color) => ({
      index: color.index,
      name: color.name,
      rawName: color.rawName,
      code: color.code,
      hex: color.hex,
      rgb: color.rgb
    }))
  };
}

function closeAcbColorPicker() {
  document.getElementById('acb-selection-modal')?.remove();
}

function openAcbColorPicker(placementId, colorId) {
  const book = getAcbColorLibrary();
  if (!book || !book.colors.length) {
    if (typeof window.showStatus === 'function') {
      window.showStatus('Primero carga un archivo .ACB en la pestaña Biblioteca ACB.', 'info');
    }
    window.showTab?.('acb-library');
    return;
  }

  closeAcbColorPicker();
  const modal = document.createElement('div');
  modal.id = 'acb-selection-modal';
  modal.className = 'acb-selection-overlay';
  modal.innerHTML = `
    <section class="acb-selection-dialog" role="dialog" aria-modal="true" aria-labelledby="acb-selection-title">
      <header class="acb-selection-header">
        <div>
          <h2 id="acb-selection-title">Seleccionar color ACB</h2>
          <p>${escapeHtml(book.title || book.sourceFile || 'Biblioteca cargada')} · ${book.colors.length} colores</p>
        </div>
        <button type="button" class="btn btn-outline btn-sm" data-acb-close aria-label="Cerrar selector">Cerrar ✕</button>
      </header>
      <label class="acb-selection-search-label" for="acb-selection-search">Buscar por nombre, código, HEX o RGB</label>
      <input id="acb-selection-search" class="form-control" type="search" placeholder="Ej. University Gold, C00047 o #F2AE2D" autocomplete="off">
      <p class="acb-import-muted acb-selection-help">La selección actualiza el color de diseño de esta pantalla; no asigna tinta ni cambia la malla o los parámetros de producción.</p>
      <div id="acb-selection-results" class="acb-selection-results"></div>
    </section>`;
  document.body.appendChild(modal);

  const search = modal.querySelector('#acb-selection-search');
  const results = modal.querySelector('#acb-selection-results');
  const filterColors = () => {
    const query = search.value.trim().toLocaleLowerCase();
    return book.colors.filter((color) =>
      [color.name, color.rawName, color.code, color.hex, color.rgb ? `${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}` : '']
        .some((value) => String(value ?? '').toLocaleLowerCase().includes(query))
    );
  };
  const render = () => {
    const matching = filterColors();
    const filtered = matching.slice(0, 300);
    results.innerHTML = filtered.length ? filtered.map((color) => {
      const safeHex = /^#[0-9A-F]{6}$/i.test(String(color.hex || '')) ? color.hex : '#CCCCCC';
      const rgb = color.rgb || { r: 0, g: 0, b: 0 };
      return `
        <button type="button" class="acb-selection-option" data-acb-color-index="${color.index}">
          <span class="acb-selection-swatch" style="background:${safeHex}"></span>
          <span class="acb-selection-color-info">
            <strong>${escapeHtml(color.name || color.rawName || 'Color sin nombre')}</strong>
            <small>${escapeHtml(color.code || 'Sin código')} · ${escapeHtml(color.hex || '')} · RGB ${rgb.r}, ${rgb.g}, ${rgb.b}</small>
          </span>
          <span class="acb-selection-choose">Seleccionar</span>
        </button>`;
    }).join('') : '<p class="acb-import-muted">No hay coincidencias.</p>';
    if (matching.length > 300) results.insertAdjacentHTML('beforeend', `<p class="acb-import-muted acb-selection-help">Se muestran 300 coincidencias de ${matching.length}. Refina la búsqueda para encontrar el color exacto.</p>`);
  };

  search.addEventListener('input', render);
  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.closest('[data-acb-close]')) {
      closeAcbColorPicker();
      return;
    }
    const option = event.target.closest('[data-acb-color-index]');
    if (!option) return;
    const index = Number(option.dataset.acbColorIndex);
    const selected = book.colors.find((color) => color.index === index);
    if (!selected) return;
    if (typeof window.applyAcbColorToPlacement === 'function') {
      window.applyAcbColorToPlacement(placementId, colorId, selected, book);
    }
    closeAcbColorPicker();
  });
  render();
  search.focus();
}

window.getAcbColorLibrary = getAcbColorLibrary;
window.openAcbColorPicker = openAcbColorPicker;

