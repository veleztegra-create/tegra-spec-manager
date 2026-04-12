(function () {
  let currentImage = null;
  let database = [];
  let pendingColor = null;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let bound = false;

  function rgbToHex(r, g, b) {
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
  }

  function getSerigraphyAdvice(r, g, b) {
    const thresholdInput = document.getElementById('palette-light-threshold');
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const maxColor = Math.max(r, g, b);
    const manualThreshold = thresholdInput ? parseInt(thresholdInput.value, 10) : 55;
    return brightness > manualThreshold || maxColor > 200;
  }

  function renderDatabase() {
    const dataRows = document.getElementById('dataRows');
    const dbControls = document.getElementById('dbControls');
    if (!dataRows) return;

    dataRows.innerHTML = database.map((item) => `
      <div class="row-item">
        <div class="color-preview" style="background-color:${item.hex}"></div>
        <input type="text" class="text-input" value="${String(item.colorName || '').replace(/"/g, '&quot;')}" oninput="updateManualPaletteText(${item.id}, this.value)">
        <span class="badge ${item.underbase ? 'base-true' : 'base-false'}">${item.underbase ? 'CON BASE' : 'SIN BASE'}</span>
        <button class="delete-btn" onclick="deleteManualPaletteItem(${item.id})">✕</button>
      </div>
    `).reverse().join('');

    if (dbControls) dbControls.style.display = database.length ? 'block' : 'none';
  }

  window.updateManualPaletteText = (id, newText) => {
    const item = database.find((entry) => entry.id === id);
    if (item) item.colorName = newText;
  };

  window.deleteManualPaletteItem = (id) => {
    database = database.filter((entry) => entry.id !== id);
    renderDatabase();
  };

  function setStatus(message) {
    const statusBar = document.getElementById('statusBar');
    if (statusBar) statusBar.textContent = message;
  }

  function bindEvents() {
    if (bound) return;

    const imageUpload = document.getElementById('imageUpload');
    const imgCanvas = document.getElementById('imgCanvas');
    const downloadDb = document.getElementById('downloadDb');
    if (!imageUpload || !imgCanvas) return;

    const ctx = imgCanvas.getContext('2d');

    imageUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          imgCanvas.width = img.width;
          imgCanvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          currentImage = img;
          setStatus('🎯 1: Clic en color | 2: Arrastra sobre el texto');
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });

    imgCanvas.addEventListener('mousedown', (e) => {
      if (!currentImage) return;
      const rect = imgCanvas.getBoundingClientRect();
      startX = (e.clientX - rect.left) * (imgCanvas.width / rect.width);
      startY = (e.clientY - rect.top) * (imgCanvas.height / rect.height);
      isDragging = false;
    });

    imgCanvas.addEventListener('mousemove', (e) => {
      if (!currentImage || e.buttons !== 1) return;
      isDragging = true;
      const rect = imgCanvas.getBoundingClientRect();
      const curX = (e.clientX - rect.left) * (imgCanvas.width / rect.width);
      const curY = (e.clientY - rect.top) * (imgCanvas.height / rect.height);

      ctx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
      ctx.drawImage(currentImage, 0, 0);
      ctx.strokeStyle = '#0984e3';
      ctx.lineWidth = 3;
      ctx.strokeRect(startX, startY, curX - startX, curY - startY);
    });

    imgCanvas.addEventListener('mouseup', async (e) => {
      if (!currentImage) return;
      const rect = imgCanvas.getBoundingClientRect();
      const endX = (e.clientX - rect.left) * (imgCanvas.width / rect.width);
      const endY = (e.clientY - rect.top) * (imgCanvas.height / rect.height);

      ctx.drawImage(currentImage, 0, 0);

      if (!isDragging || Math.abs(endX - startX) < 5) {
        const pixel = ctx.getImageData(startX, startY, 1, 1).data;
        const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
        const needsBase = getSerigraphyAdvice(pixel[0], pixel[1], pixel[2]);

        pendingColor = { hex, underbase: needsBase };
        setStatus(`🎨 ${hex} | Base: ${needsBase ? 'SÍ' : 'NO'}. Ahora selecciona el texto.`);
        return;
      }

      if (!pendingColor) return;
      if (!window.Tesseract) {
        setStatus('❌ OCR no disponible (Tesseract no cargado)');
        return;
      }

      setStatus('⌛ Leyendo texto con OCR...');

      const cropX = Math.min(startX, endX);
      const cropY = Math.min(startY, endY);
      const cropW = Math.abs(endX - startX);
      const cropH = Math.abs(endY - startY);

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = cropW;
      tempCanvas.height = cropH;
      tempCanvas.getContext('2d').drawImage(imgCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      try {
        const result = await Tesseract.recognize(tempCanvas.toDataURL(), 'eng');
        database.push({
          id: Date.now(),
          hex: pendingColor.hex,
          colorName: String(result.data.text || '').trim().replace(/\n/g, ' '),
          underbase: pendingColor.underbase
        });
        pendingColor = null;
        renderDatabase();
        setStatus('✅ Guardado. Selecciona el siguiente color.');
      } catch (error) {
        console.error(error);
        setStatus('❌ Error en OCR');
      }
    });

    if (downloadDb) {
      downloadDb.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(database, null, 4)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `spec_colors_${Date.now()}.json`;
        a.click();
      });
    }

    bound = true;
  }

  window.initManualPaletteExtractor = function initManualPaletteExtractor() {
    const thresholdInput = document.getElementById('palette-light-threshold');
    if (thresholdInput) {
      const current = parseInt(thresholdInput.value, 10);
      if (!Number.isFinite(current)) thresholdInput.value = '55';
    }

    bindEvents();
    renderDatabase();
  };
})();
