import { decodeAcb } from '../modules/acb-reader.js';
import { saveAcbLibrary, loadAcbLibrary, loadAcbLibraries, loadActiveAcbLibrary, setActiveAcbLibrary, deleteAcbLibrary, clearAcbLibrary } from '../modules/acb-library-storage.js';
import { matchExactAcbColor } from '../modules/acb-color-matcher.js';

const PAGE_SIZE = 250;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
let currentBook = null;
let currentFileName = '';
let visibleLimit = PAGE_SIZE;
let currentSort = 'original';
let currentFamily = 'all';
let selectedColorIndexes = [];
let editingColorIndex = null;
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

function refreshLibraryControls() {
  const select = document.getElementById('acb-saved-libraries');
  const deleteButton = document.getElementById('acb-delete-current-library');
  if (!select) return;
  const { libraries, activeLibraryId } = loadAcbLibraries(window.localStorage);
  select.innerHTML = libraries.map((item) => {
    const label = item.book.title || item.sourceFile || 'Biblioteca sin nombre';
    const file = item.sourceFile ? ` — ${item.sourceFile}` : '';
    return `<option value="${escapeHtml(item.id)}" ${item.id === activeLibraryId ? 'selected' : ''}>${escapeHtml(label + file)}</option>`;
  }).join('');
  if (!libraries.length) {
    select.innerHTML = '<option value="">No hay bibliotecas guardadas</option>';
    select.disabled = true;
  } else {
    select.disabled = false;
  }
  if (deleteButton) deleteButton.disabled = !libraries.length;
}

function activateSavedLibrary(libraryId) {
  const result = setActiveAcbLibrary(window.localStorage, libraryId);
  if (!result.ok) {
    setMessage('No se pudo activar la biblioteca seleccionada.', 'error');
    return;
  }
  const active = loadActiveAcbLibrary(window.localStorage);
  if (active) showBook(active.book, active.sourceFile, { restored: true });
  refreshLibraryControls();
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

function getColorFamily(color) {
  const { r = 0, g = 0, b = 0 } = color.rgb || {};
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  if (delta < 22) return 'neutrals';
  let hue = 0;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;
  hue = (hue * 60 + 360) % 360;
  if (hue < 15 || hue >= 345) return 'reds';
  if (hue < 45) return 'oranges';
  if (hue < 70) return 'yellows';
  if (hue < 165) return 'greens';
  if (hue < 195) return 'cyans';
  if (hue < 255) return 'blues';
  if (hue < 290) return 'purples';
  return 'pinks';
}

function renumberBookColors() {
  currentBook.colors.forEach((color, index) => { color.index = index; });
  currentBook.colorCount = currentBook.colors.length;
}

function persistCurrentBook() {
  renumberBookColors();
  const result = saveAcbLibrary(window.localStorage, currentBook, currentFileName);
  if (!result.ok) {
    setMessage('No se pudo guardar el cambio en la biblioteca. ' + result.reason, 'error');
    return false;
  }
  return true;
}

function renderRows() {
  if (!currentBook) return;
  const query = (document.getElementById('acb-color-search')?.value || '').trim().toLocaleLowerCase();
  const duplicates = findDuplicates(currentBook.colors);
  const filtered = currentBook.colors.filter((color) =>
    (currentFamily === 'all' || getColorFamily(color) === currentFamily) &&
    [color.name, color.rawName, color.code, color.hex, `${color.rgb.r},${color.rgb.g},${color.rgb.b}`]
      .some((value) => String(value).toLocaleLowerCase().includes(query))
  );
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    if (currentSort === 'name-asc') comparison = collator.compare(a.name, b.name);
    else if (currentSort === 'name-desc') comparison = collator.compare(b.name, a.name);
    else if (currentSort === 'code') comparison = collator.compare(a.code, b.code);
    else if (currentSort === 'hex') comparison = collator.compare(a.hex, b.hex);
    else comparison = a.index - b.index;
    return comparison || a.index - b.index;
  });
  const body = document.getElementById('acb-color-rows');
  const shown = sorted.slice(0, visibleLimit);
  body.innerHTML = shown.map((color) => {
    const types = duplicates.get(color.index);
    const review = types
      ? `<span class="acb-import-badge duplicate">Revisar: ${escapeHtml([...types].join(', '))}</span>`
      : '<span class="acb-import-badge">Sin repetición interna</span>';
    const checked = selectedColorIndexes.includes(color.index) ? 'checked' : '';
    return `<tr>
      <td><input type="checkbox" class="acb-color-select" data-color-index="${color.index}" ${checked} aria-label="Seleccionar ${escapeHtml(color.name)}"></td>
      <td>${color.index + 1}</td>
      <td><span class="acb-import-swatch" style="background:${color.hex}" title="${color.hex}" aria-label="Muestra ${color.hex}"></span></td>
      <td>${escapeHtml(color.name)}</td>
      <td><code>${escapeHtml(color.code)}</code></td>
      <td>${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}</td>
      <td><code>${escapeHtml(color.hex)}</code></td>
      <td>${review}</td>
      <td class="acb-color-actions">
        <button type="button" class="btn btn-sm acb-edit-color" data-color-index="${color.index}">Editar</button>
        <button type="button" class="btn btn-sm acb-delete-color" data-color-index="${color.index}">Eliminar</button>
      </td>
    </tr>`;
  }).join('');

  const archived = Array.isArray(currentBook.archivedColors) ? currentBook.archivedColors : [];
  if (document.getElementById('acb-show-archived')?.checked) {
    body.innerHTML += archived.map((entry, index) => {
      const color = entry.color;
      return `<tr class="acb-archived-row">
        <td>—</td><td>—</td>
        <td><span class="acb-import-swatch" style="background:${color.hex}" title="${color.hex}"></span></td>
        <td>${escapeHtml(color.name)}</td><td><code>${escapeHtml(color.code)}</code></td>
        <td>${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}</td><td><code>${escapeHtml(color.hex)}</code></td>
        <td>Archivado: ${escapeHtml(entry.reason || '')}</td>
        <td><button type="button" class="btn btn-sm acb-restore-color" data-archive-index="${index}">Restaurar</button></td>
      </tr>`;
    }).join('');
  }
  const mergeButton = document.getElementById('acb-merge-colors');
  if (mergeButton) mergeButton.disabled = selectedColorIndexes.length !== 2;
  const archiveLabel = document.getElementById('acb-archived-count');
  if (archiveLabel) archiveLabel.textContent = archived.length;

  const issueCount = duplicates.size;
  document.getElementById('acb-stat-title').textContent = currentBook.title || '(sin título)';
  document.getElementById('acb-stat-count').textContent = currentBook.colorCount;
  document.getElementById('acb-stat-duplicates').textContent = issueCount;
  document.getElementById('acb-stat-model').textContent = currentBook.colorModel;
  document.getElementById('acb-table-summary').textContent =
    query ? `Coincidencias: ${filtered.length} de ${currentBook.colorCount}` : `Colores del libro: ${currentBook.colorCount}`;
  document.getElementById('acb-page-info').textContent =
    sorted.length ? `Mostrando ${shown.length} de ${sorted.length}` : 'No hay colores que coincidan con la búsqueda.';
  document.getElementById('acb-show-more').hidden = shown.length >= sorted.length;
  document.getElementById('acb-show-more').textContent = `Mostrar siguientes ${PAGE_SIZE}`;
  body.querySelectorAll('.acb-color-select').forEach((input) => input.addEventListener('change', () => {
    const index = Number(input.dataset.colorIndex);
    selectedColorIndexes = input.checked ? [...selectedColorIndexes, index].slice(-2) : selectedColorIndexes.filter((value) => value !== index);
    renderRows();
  }));
  body.querySelectorAll('.acb-edit-color').forEach((button) => button.addEventListener('click', () => openColorEditor(Number(button.dataset.colorIndex))));
  body.querySelectorAll('.acb-delete-color').forEach((button) => button.addEventListener('click', () => archiveColor(Number(button.dataset.colorIndex), 'eliminación manual')));
  body.querySelectorAll('.acb-restore-color').forEach((button) => button.addEventListener('click', () => restoreArchivedColor(Number(button.dataset.archiveIndex))));
}

function openColorEditor(index) {
  const color = currentBook?.colors.find((item) => item.index === index);
  if (!color) return;
  editingColorIndex = index;
  document.getElementById('acb-edit-name').value = color.name || '';
  document.getElementById('acb-edit-hex').value = color.hex || '#000000';
  document.getElementById('acb-edit-swatch').style.background = color.hex || '#000000';
  document.getElementById('acb-color-editor').hidden = false;
  document.getElementById('acb-edit-name').focus();
}

function closeColorEditor() {
  document.getElementById('acb-color-editor').hidden = true;
  editingColorIndex = null;
}

function saveColorEditor() {
  const color = currentBook?.colors.find((item) => item.index === editingColorIndex);
  if (!color) return closeColorEditor();
  const name = document.getElementById('acb-edit-name').value.trim();
  const hex = document.getElementById('acb-edit-hex').value.trim().toUpperCase();
  if (!name) return setMessage('El nombre del color no puede quedar vacío.', 'error');
  if (!/^#[0-9A-F]{6}$/.test(hex)) return setMessage('Introduce un HEX válido, por ejemplo #ECA521.', 'error');
  if (!color.sourceSnapshot) color.sourceSnapshot = { name: color.name, hex: color.hex, rgb: { ...color.rgb }, code: color.code, rawName: color.rawName };
  color.name = name;
  color.hex = hex;
  color.rgb = { r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) };
  if (!persistCurrentBook()) return;
  closeColorEditor();
  selectedColorIndexes = [];
  setMessage('Color actualizado. El nombre original y el código ACB se conservaron como referencia.', 'success');
  renderRows();
  refreshLibraryControls();
}

function archiveColor(index, reason) {
  const color = currentBook?.colors.find((item) => item.index === index);
  if (!color) return;
  if (!window.confirm(`¿Retirar "${color.name}" (${color.code}) de esta biblioteca?\n\nLas especificaciones existentes conservan su propia copia del nombre y HEX. Podrás restaurar el registro desde "Mostrar eliminados".`)) return;
  currentBook.archivedColors = Array.isArray(currentBook.archivedColors) ? currentBook.archivedColors : [];
  currentBook.archivedColors.push({ color: { ...color, rgb: { ...color.rgb } }, reason, archivedAt: new Date().toISOString() });
  currentBook.colors = currentBook.colors.filter((item) => item.index !== index);
  selectedColorIndexes = [];
  if (!persistCurrentBook()) return;
  setMessage('Color retirado de la biblioteca y archivado para poder restaurarlo.', 'success');
  renderRows();
}

function restoreArchivedColor(archiveIndex) {
  const archived = currentBook?.archivedColors?.[archiveIndex];
  if (!archived) return;
  currentBook.colors.push({ ...archived.color, index: currentBook.colors.length });
  currentBook.archivedColors.splice(archiveIndex, 1);
  if (!persistCurrentBook()) return;
  setMessage('Color restaurado a la biblioteca.', 'success');
  renderRows();
}

function mergeSelectedColors() {
  if (!currentBook || selectedColorIndexes.length !== 2) return;
  const [keepIndex, removeIndex] = selectedColorIndexes;
  const keep = currentBook.colors.find((item) => item.index === keepIndex);
  const remove = currentBook.colors.find((item) => item.index === removeIndex);
  if (!keep || !remove || keep === remove) return;
  if (!window.confirm(`Se conservará "${keep.name}" (${keep.hex}) y se archivará "${remove.name}" (${remove.hex}).\n\nLas especificaciones existentes conservarán sus copias de color; no se actualizarán automáticamente. ¿Continuar?`)) return;
  currentBook.archivedColors = Array.isArray(currentBook.archivedColors) ? currentBook.archivedColors : [];
  currentBook.archivedColors.push({ color: { ...remove, rgb: { ...remove.rgb } }, reason: `combinado en ${keep.code}`, archivedAt: new Date().toISOString() });
  currentBook.colors = currentBook.colors.filter((item) => item.index !== removeIndex);
  selectedColorIndexes = [];
  if (!persistCurrentBook()) return;
  setMessage(`Registros combinados. Se conservó "${keep.name}" y el otro quedó archivado.`, 'success');
  renderRows();
}

function showBook(book, fileName, options = {}) {
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
  selectedColorIndexes = [];
  let persistenceNote = '';
  if (options.restored) {
    persistenceNote = ' Biblioteca restaurada desde este navegador.';
  } else {
    try {
      const result = saveAcbLibrary(window.localStorage, book, fileName);
      persistenceNote = result.ok
        ? ' Biblioteca guardada localmente en este navegador. Puedes conservar otras paletas y cambiar entre ellas.'
        : result.reason === 'too-large' || result.reason === 'quota-exceeded'
          ? ' No se pudo guardar: el almacenamiento local está lleno o la biblioteca es demasiado grande.'
          : ' No se pudo guardar en el almacenamiento local de este navegador.';
    } catch {
      persistenceNote = ' El navegador no permitió guardar la biblioteca localmente.';
    }
  }
  setMessage(
    (duplicateCount
      ? `Lectura completada: ${book.colorCount} colores. ${duplicateCount} registros tienen posibles repeticiones internas; revisa la tabla antes de usar los datos.`
      : `Lectura completada: ${book.colorCount} colores. No se encontraron repeticiones internas por código, nombre o HEX.`) + persistenceNote,
    duplicateCount ? 'warning' : ''
  );
  renderRows();
  refreshLibraryControls();
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
      hex: color.hex,
      ...(color.sourceSnapshot ? { sourceSnapshot: color.sourceSnapshot } : {})
    })),
    archivedColors: currentBook.archivedColors || [],
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
  document.getElementById('acb-color-family')?.addEventListener('change', (event) => {
    currentFamily = event.target.value || 'all';
    visibleLimit = PAGE_SIZE;
    renderRows();
  });
  document.getElementById('acb-show-archived')?.addEventListener('change', renderRows);
  document.getElementById('acb-merge-colors')?.addEventListener('click', mergeSelectedColors);
  document.getElementById('acb-edit-cancel')?.addEventListener('click', closeColorEditor);
  document.getElementById('acb-edit-save')?.addEventListener('click', saveColorEditor);
  document.getElementById('acb-color-editor')?.addEventListener('click', (event) => {
    if (event.target.id === 'acb-color-editor') closeColorEditor();
  });
  document.getElementById('acb-edit-hex')?.addEventListener('input', (event) => {
    const value = event.target.value.trim();
    if (/^#[0-9A-F]{6}$/i.test(value)) document.getElementById('acb-edit-swatch').style.background = value;
  });
  document.getElementById('acb-color-search').addEventListener('input', () => {
    visibleLimit = PAGE_SIZE;
    renderRows();
  });
  document.getElementById('acb-color-sort')?.addEventListener('change', (event) => {
    currentSort = event.target.value || 'original';
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
  document.getElementById('acb-saved-libraries')?.addEventListener('change', (event) => {
    if (event.target.value) activateSavedLibrary(event.target.value);
  });
  document.getElementById('acb-delete-current-library')?.addEventListener('click', () => {
    const active = loadActiveAcbLibrary(window.localStorage);
    if (!active) return;
    if (!window.confirm(`¿Eliminar solo la biblioteca "${active.book.title || active.sourceFile}"? Las demás bibliotecas y las especificaciones existentes no se modificarán.`)) return;
    const result = deleteAcbLibrary(window.localStorage, active.id);
    if (!result.ok) {
      setMessage('No se pudo eliminar la biblioteca seleccionada.', 'error');
      return;
    }
    const next = loadActiveAcbLibrary(window.localStorage);
    refreshLibraryControls();
    if (next) showBook(next.book, next.sourceFile, { restored: true });
    else {
      currentBook = null;
      currentFileName = '';
      document.getElementById('acb-import-results').hidden = true;
      document.getElementById('acb-export-preview').disabled = true;
      setMessage('No quedan bibliotecas guardadas. Puedes cargar otra paleta cuando la necesites.');
    }
  });
  document.getElementById('acb-clear-saved-library')?.addEventListener('click', () => {
    if (!window.confirm('¿Eliminar TODAS las bibliotecas ACB guardadas en este navegador? Las especificaciones existentes no se modificarán.')) return;
    const cleared = clearAcbLibrary(window.localStorage);
    currentBook = null;
    currentFileName = '';
    document.getElementById('acb-import-results').hidden = true;
    document.getElementById('acb-export-preview').disabled = true;
    refreshLibraryControls();
    setMessage(cleared ? 'Todas las bibliotecas locales fueron eliminadas. Las especificaciones existentes no se han modificado.' : 'No se pudieron eliminar las bibliotecas guardadas.', cleared ? '' : 'error');
  });

  try {
    const saved = loadAcbLibrary(window.localStorage);
    if (saved) showBook(saved.book, saved.sourceFile, { restored: true });
    refreshLibraryControls();
  } catch (error) {
    console.warn('No se pudo restaurar la biblioteca ACB local:', error);
  }
}

window.initAcbImporter = initAcbImporter;
function getAcbColorLibrary() {
  // Restore the persisted library on demand so Spec Creator can resolve names
  // even if the user has not opened the ACB tab after refreshing the app.
  if (!currentBook) {
    try {
      const saved = loadAcbLibrary(window.localStorage);
      if (saved?.book) {
        currentBook = saved.book;
        currentFileName = saved.sourceFile || '';
      }
    } catch (error) {
      console.warn('No se pudo recuperar la biblioteca ACB para resolver colores:', error);
    }
  }
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

window.resolveAcbColorByName = function resolveAcbColorByName(query) {
  const book = getAcbColorLibrary();
  if (!book) return null;
  const color = matchExactAcbColor(book, query);
  return color ? { ...color, bookTitle: book.title, sourceFile: book.sourceFile } : null;
};

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

