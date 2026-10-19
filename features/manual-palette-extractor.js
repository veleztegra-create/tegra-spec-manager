(function () {
  const DB_NAME = 'TEGRA_GFSEXTR_DB';
  const DB_VERSION = 1;
  const STORE_NAME = 'app';
  let root = null;
  let db = null;
  let state = { activePaletteId: null, palettes: [] };
  let currentImage = null;
  let pendingColor = null;
  let dragStart = null;
  let bound = false;
  let modalCallback = null;

  const $ = (selector) => root ? root.querySelector(selector) : null;
  const uid = (prefix = 'id') => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));
  const safeFile = (value) => (value || 'palette').replace(/[\\/:*?"<>|]+/g, '-').trim() || 'palette';
  const normalizeHex = (hex) => {
    const value = String(hex || '').trim().replace(/^#/, '').toUpperCase();
    return /^[0-9A-F]{6}$/.test(value) ? '#' + value : '';
  };
  const hexToRgb = (hex) => {
    const value = normalizeHex(hex).slice(1);
    return [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16));
  };
  const rgbToHex = (r, g, b) => '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();

  function openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
      };
      request.onsuccess = () => { db = request.result; resolve(db); };
      request.onerror = () => reject(request.error);
    });
  }
  function dbGet(key) {
    return new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  function dbSet(key, value) {
    return new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  async function persist() {
    if (!db) {
      const saveState = $('#gfsextr-save-state');
      if (saveState) saveState.textContent = 'Almacenamiento no disponible';
      return;
    }
    await dbSet('state', state);
    const saveState = $('#gfsextr-save-state');
    if (saveState) {
      saveState.textContent = '✓ Guardado local';
      window.setTimeout(() => { if (saveState.isConnected) saveState.textContent = 'Almacenamiento local'; }, 1200);
    }
  }
  function activePalette() {
    return state.palettes.find((palette) => palette.id === state.activePaletteId) || null;
  }
  function getSerigraphyAdvice(r, g, b) {
    const thresholdInput = $('#gfsextr-threshold');
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const threshold = Math.max(0, Math.min(255, Number.parseInt(thresholdInput?.value, 10) || 155));
    return brightness > threshold || Math.max(r, g, b) > 200;
  }
  function setStatus(message, type = '') {
    const status = $('#gfsextr-status');
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-error', type === 'error');
    status.classList.toggle('is-warning', type === 'warning');
  }
  function renderPalettes() {
    const select = $('#gfsextr-palette-select');
    if (!select) return;
    select.innerHTML = state.palettes.map((palette) =>
      '<option value="' + escapeHtml(palette.id) + '">' + escapeHtml(palette.name) + ' — ' + palette.colors.length + '</option>'
    ).join('');
    select.value = state.activePaletteId || '';
  }
  function renderColors() {
    const container = $('#gfsextr-colors');
    const count = $('#gfsextr-count');
    const palette = activePalette();
    if (!container || !count) return;
    if (!palette) {
      count.textContent = '0 colores';
      container.innerHTML = '<p class="gfsextr-empty">No hay una paleta activa.</p>';
      return;
    }
    count.textContent = palette.colors.length + (palette.colors.length === 1 ? ' color' : ' colores');
    if (!palette.colors.length) {
      container.innerHTML = '<p class="gfsextr-empty">Esta paleta está vacía. Selecciona una muestra en la imagen y después arrastra sobre el nombre.</p>';
      return;
    }
    container.innerHTML = palette.colors.slice().reverse().map((color) => {
      const id = escapeHtml(color.id);
      return '<article class="gfsextr-color-row" data-color-id="' + id + '">' +
        '<span class="gfsextr-swatch" style="background:' + escapeHtml(normalizeHex(color.hex) || '#FFFFFF') + '" title="' + escapeHtml(color.hex) + '"></span>' +
        '<div class="gfsextr-color-name"><label>Nombre del color<input class="gfsextr-name-input" type="text" value="' + escapeHtml(color.colorName) + '" aria-label="Nombre del color"></label><code>' + escapeHtml(color.hex) + '</code></div>' +
        '<label class="gfsextr-base-toggle"><input class="gfsextr-base-input" type="checkbox" ' + (color.underbase ? 'checked' : '') + '> Lleva base</label>' +
        '<button type="button" class="btn btn-secondary gfsextr-remove" aria-label="Eliminar color" title="Eliminar color">×</button>' +
        '</article>';
    }).join('');
    container.querySelectorAll('.gfsextr-color-row').forEach((row) => {
      const color = palette.colors.find((item) => item.id === row.dataset.colorId);
      if (!color) return;
      row.querySelector('.gfsextr-name-input').addEventListener('change', async (event) => {
        color.colorName = event.target.value.trim() || 'Sin nombre';
        await persist();
      });
      row.querySelector('.gfsextr-base-input').addEventListener('change', async (event) => {
        color.underbase = event.target.checked;
        await persist();
      });
      row.querySelector('.gfsextr-remove').addEventListener('click', async () => {
        if (!window.confirm('¿Eliminar "' + (color.colorName || color.hex) + '" de esta paleta?')) return;
        palette.colors = palette.colors.filter((item) => item.id !== color.id);
        await persist(); renderPalettes(); renderColors();
      });
    });
  }
  function renderAll() { renderPalettes(); renderColors(); }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportJson(palette = activePalette()) {
    if (!palette) return;
    const payload = { format: 'GFSEXTR-Palette', version: 1, name: palette.name, colors: palette.colors };
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), safeFile(palette.name) + '.json');
  }
  function exportAll() {
    const payload = { format: 'GFSEXTR-Backup', version: 1, exportedAt: new Date().toISOString(), palettes: state.palettes };
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), 'Tegra-GFSEXTR-backup.json');
  }
  function u16(value) { return new Uint8Array([(value >> 8) & 255, value & 255]); }
  function ascii(value) { return new TextEncoder().encode(value); }
  function acbString(value) {
    const text = String(value || '');
    const bytes = new Uint8Array(4 + text.length * 2);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, text.length);
    for (let i = 0; i < text.length; i++) view.setUint16(4 + i * 2, text.charCodeAt(i));
    return bytes;
  }
  function concatBytes(parts) {
    const result = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
    let offset = 0;
    parts.forEach((part) => { result.set(part, offset); offset += part.length; });
    return result;
  }
  function makeAcb(palette) {
    const colors = palette.colors;
    const parts = [
      ascii('8BCB'), u16(1), u16(3000), acbString(palette.name),
      acbString(''), acbString(''), acbString('GFSEXTR custom RGB color book'),
      u16(colors.length), u16(Math.min(9, Math.max(1, colors.length || 1))),
      u16(Math.min(4, Math.max(0, Math.floor((colors.length - 1) / 2)))), u16(0)
    ];
    colors.forEach((color, index) => {
      const rgb = hexToRgb(color.hex);
      const code = ('C' + String(index + 1).padStart(5, '0')).slice(0, 6);
      parts.push(acbString(color.colorName || code), ascii(code.padEnd(6, ' ')), new Uint8Array(rgb));
    });
    parts.push(ascii('spflproc'));
    return concatBytes(parts);
  }
  function exportAcb() {
    const palette = activePalette();
    if (!palette || !palette.colors.length) { window.alert('La paleta no tiene colores para exportar.'); return; }
    try {
      downloadBlob(new Blob([makeAcb(palette)], { type: 'application/octet-stream' }), safeFile(palette.name) + '.acb');
      setStatus('Archivo ACB generado. Impórtalo en Illustrator y verifica la biblioteca antes de usarla en producción.');
    } catch (error) {
      console.error(error); setStatus('No se pudo generar el ACB: ' + error.message, 'error');
    }
  }
  function dedupeColors(colors) {
    const seen = new Set();
    return colors.reduce((result, color) => {
      const hex = normalizeHex(color.hex);
      if (!hex || seen.has(hex)) return result;
      seen.add(hex);
      result.push({ id: uid('color_'), hex, colorName: String(color.colorName || 'Sin nombre'), underbase: Boolean(color.underbase) });
      return result;
    }, []);
  }
  async function importJsonFile(file) {
    try {
      const parsed = JSON.parse(await file.text());
      let incoming = [];
      if (parsed.format === 'GFSEXTR-Backup' && Array.isArray(parsed.palettes)) {
        incoming = parsed.palettes.map((palette) => ({
          id: uid('palette_'), name: String(palette.name || 'Paleta importada'),
          colors: dedupeColors(Array.isArray(palette.colors) ? palette.colors : [])
        }));
      } else if (Array.isArray(parsed.colors)) {
        incoming = [{ id: uid('palette_'), name: String(parsed.name || file.name.replace(/\.json$/i, '')), colors: dedupeColors(parsed.colors) }];
      } else if (Array.isArray(parsed)) {
        incoming = [{ id: uid('palette_'), name: file.name.replace(/\.json$/i, ''), colors: dedupeColors(parsed) }];
      } else {
        throw new Error('El archivo no tiene un formato de paleta reconocido.');
      }
      if (!incoming.length) throw new Error('El respaldo no contiene paletas.');
      state.palettes.push(...incoming);
      state.activePaletteId = incoming[0].id;
      await persist(); renderAll();
      setStatus('Importación completada: ' + incoming.length + (incoming.length === 1 ? ' paleta.' : ' paletas.'));
    } catch (error) {
      setStatus('No se pudo importar el JSON: ' + error.message, 'error');
    }
  }
  function showModal(title, initialValue, callback) {
    const modal = $('#gfsextr-modal');
    const input = $('#gfsextr-modal-input');
    if (!modal || !input) return;
    $('#gfsextr-modal-title').textContent = title;
    input.value = initialValue || '';
    modalCallback = callback;
    modal.hidden = false;
    input.focus(); input.select();
  }
  function closeModal() {
    const modal = $('#gfsextr-modal');
    if (modal) modal.hidden = true;
    modalCallback = null;
  }
  async function loadImage(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setStatus('Selecciona un archivo de imagen válido.', 'error'); return; }
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      currentImage = image;
      const canvas = $('#gfsextr-canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext('2d').drawImage(image, 0, 0);
      URL.revokeObjectURL(url);
      pendingColor = null;
      setStatus('Imagen cargada. Paso 1: clic en la muestra de color. Paso 2: arrastra sobre su nombre.');
    };
    image.onerror = () => { URL.revokeObjectURL(url); setStatus('No se pudo leer la imagen.', 'error'); };
    image.src = url;
  }
  function canvasPoint(event) {
    const canvas = $('#gfsextr-canvas');
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(canvas.width - 1, Math.round((event.clientX - rect.left) * canvas.width / rect.width))),
      y: Math.max(0, Math.min(canvas.height - 1, Math.round((event.clientY - rect.top) * canvas.height / rect.height)))
    };
  }
  async function finishCanvasAction(event) {
    if (!currentImage || !dragStart) return;
    const end = canvasPoint(event);
    const start = dragStart;
    dragStart = null;
    const canvas = $('#gfsextr-canvas');
    const ctx = canvas.getContext('2d');
    ctx.drawImage(currentImage, 0, 0);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    if (width < 5 || height < 5) {
      const pixel = ctx.getImageData(start.x, start.y, 1, 1).data;
      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      const palette = activePalette();
      const existing = palette?.colors.find((color) => normalizeHex(color.hex) === hex);
      if (existing) {
        pendingColor = null;
        setStatus(hex + ' ya existe en esta paleta como "' + existing.colorName + '". No se duplicará.', 'warning');
        return;
      }
      pendingColor = { hex, underbase: getSerigraphyAdvice(pixel[0], pixel[1], pixel[2]) };
      setStatus('Muestra ' + hex + ' seleccionada. Base sugerida: ' + (pendingColor.underbase ? 'SÍ' : 'NO') + '. Ahora arrastra sobre el nombre del color.');
      return;
    }
    if (!pendingColor) { setStatus('Primero haz clic en la muestra de color.', 'warning'); return; }
    if (!window.Tesseract || typeof window.Tesseract.recognize !== 'function') {
      setStatus('OCR no disponible. Comprueba la conexión para cargar Tesseract.js.', 'error'); return;
    }
    setStatus('Leyendo el nombre del color con OCR…');
    const x = Math.min(start.x, end.x), y = Math.min(start.y, end.y);
    const crop = document.createElement('canvas');
    crop.width = width; crop.height = height;
    crop.getContext('2d').drawImage(currentImage, x, y, width, height, 0, 0, width, height);
    try {
      const result = await window.Tesseract.recognize(crop.toDataURL('image/png'), 'eng');
      const name = String(result?.data?.text || '').trim().replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ') || 'Sin nombre';
      const palette = activePalette();
      if (!palette) throw new Error('No hay una paleta activa.');
      const duplicate = palette.colors.find((color) => normalizeHex(color.hex) === pendingColor.hex);
      if (duplicate) {
        const duplicateHex = pendingColor.hex;
        pendingColor = null;
        setStatus(duplicateHex + ' ya existe en esta paleta. No se duplicó.', 'warning');
        return;
      }
      palette.colors.push({ id: uid('color_'), hex: pendingColor.hex, colorName: name, underbase: pendingColor.underbase });
      pendingColor = null;
      await persist(); renderAll();
      setStatus('Color guardado en "' + palette.name + '". Puedes corregir el nombre o el indicador de base desde la lista.');
    } catch (error) {
      console.error(error); setStatus('No se pudo reconocer el texto: ' + error.message, 'error');
    }
  }
  function bindEvents() {
    if (bound) return;
    const upload = $('#gfsextr-image-upload');
    const canvas = $('#gfsextr-canvas');
    if (!upload || !canvas) return;
    upload.addEventListener('change', (event) => { loadImage(event.target.files[0]); event.target.value = ''; });
    canvas.addEventListener('mousedown', (event) => { if (currentImage) dragStart = canvasPoint(event); });
    canvas.addEventListener('mousemove', (event) => {
      if (!currentImage || !dragStart || event.buttons !== 1) return;
      const end = canvasPoint(event);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(currentImage, 0, 0);
      ctx.strokeStyle = '#0984e3'; ctx.lineWidth = Math.max(2, canvas.width / 1000);
      ctx.strokeRect(dragStart.x, dragStart.y, end.x - dragStart.x, end.y - dragStart.y);
    });
    canvas.addEventListener('mouseup', finishCanvasAction);
    canvas.addEventListener('mouseleave', (event) => { if (dragStart && event.buttons === 0) dragStart = null; });

    $('#gfsextr-palette-select').addEventListener('change', async (event) => {
      state.activePaletteId = event.target.value; pendingColor = null; await persist(); renderColors();
    });
    $('#gfsextr-new').addEventListener('click', () => showModal('Crear nueva paleta', 'Nueva paleta', async (name) => {
      const palette = { id: uid('palette_'), name, colors: [] };
      state.palettes.push(palette); state.activePaletteId = palette.id; await persist(); renderAll(); setStatus('Paleta creada.');
    }));
    $('#gfsextr-rename').addEventListener('click', () => {
      const palette = activePalette(); if (!palette) return;
      showModal('Renombrar paleta', palette.name, async (name) => { palette.name = name; await persist(); renderPalettes(); setStatus('Paleta renombrada.'); });
    });
    $('#gfsextr-delete').addEventListener('click', async () => {
      const palette = activePalette(); if (!palette) return;
      if (state.palettes.length === 1) { setStatus('Debe existir al menos una paleta. Crea otra antes de eliminar esta.', 'warning'); return; }
      if (!window.confirm('¿Eliminar la paleta "' + palette.name + '" y sus ' + palette.colors.length + ' colores?')) return;
      state.palettes = state.palettes.filter((item) => item.id !== palette.id);
      state.activePaletteId = state.palettes[0].id; await persist(); renderAll(); setStatus('Paleta eliminada.');
    });
    $('#gfsextr-import').addEventListener('change', async (event) => {
      if (event.target.files[0]) await importJsonFile(event.target.files[0]);
      event.target.value = '';
    });
    $('#gfsextr-export-json').addEventListener('click', () => exportJson());
    $('#gfsextr-export-acb').addEventListener('click', exportAcb);
    $('#gfsextr-export-all').addEventListener('click', exportAll);
    $('#gfsextr-threshold').addEventListener('change', () => {
      const input = $('#gfsextr-threshold');
      input.value = String(Math.max(0, Math.min(255, Number.parseInt(input.value, 10) || 155)));
      setStatus('Umbral actualizado. Solo afecta los colores nuevos; los indicadores existentes se pueden editar manualmente.');
    });
    $('#gfsextr-modal-cancel').addEventListener('click', closeModal);
    $('#gfsextr-modal-save').addEventListener('click', async () => {
      const name = $('#gfsextr-modal-input').value.trim();
      if (!name) { $('#gfsextr-modal-input').focus(); return; }
      const callback = modalCallback; closeModal();
      if (callback) await callback(name);
    });
    $('#gfsextr-modal-input').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') $('#gfsextr-modal-save').click();
      if (event.key === 'Escape') closeModal();
    });
    $('#gfsextr-modal').addEventListener('click', (event) => { if (event.target === $('#gfsextr-modal')) closeModal(); });
    bound = true;
  }

  window.initManualPaletteExtractor = async function initManualPaletteExtractor() {
    root = document.getElementById('gfsextr-tool');
    if (!root) return;
    bindEvents();
    try {
      if (!db) await openDb();
      const saved = await dbGet('state');
      if (saved && Array.isArray(saved.palettes)) state = saved;
    } catch (error) {
      console.error(error);
      setStatus('No se pudo abrir IndexedDB. El extractor necesita almacenamiento local del navegador.', 'error');
    }
    if (!Array.isArray(state.palettes)) state = { activePaletteId: null, palettes: [] };
    if (!state.palettes.length) {
      const palette = { id: uid('palette_'), name: 'Mi primera paleta', colors: [] };
      state.palettes.push(palette); state.activePaletteId = palette.id;
      try { await persist(); } catch (error) { console.error(error); }
    }
    if (!state.palettes.some((palette) => palette.id === state.activePaletteId)) state.activePaletteId = state.palettes[0].id;
    renderAll();
  };
})();
