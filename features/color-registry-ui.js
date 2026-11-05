/* Color Registry UI: add a missing color without leaving or resetting the current Spec. */
(function (window) {
  'use strict';

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  }

  function ensureDialog() {
    let dialog = document.getElementById('tegra-color-registry-dialog');
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.id = 'tegra-color-registry-dialog';
    dialog.className = 'tegra-color-registry-dialog';
    dialog.innerHTML = `
      <form method="dialog" class="tegra-color-registry-form">
        <header class="tegra-color-registry-header">
          <div><small>TEGRA COLOR CATALOG</small><h2>Agregar color faltante</h2></div>
          <button type="button" class="tegra-color-registry-close" aria-label="Cerrar">×</button>
        </header>
        <p class="tegra-color-registry-context"></p>
        <label>Nombre del color <input name="name" required maxlength="120" autocomplete="off"></label>
        <label>Código / Colorway <input name="code" maxlength="80" autocomplete="off"></label>
        <label>HEX <input name="hex" required placeholder="#RRGGBB" pattern="#?[0-9A-Fa-f]{6}" maxlength="7"></label>
        <label>Aliases (separados por coma) <input name="aliases" maxlength="300" autocomplete="off"></label>
        <div class="tegra-color-registry-classifications">
          <label>Underbase
            <select name="underbase"><option value="unknown">Sin clasificar</option><option value="yes">Sí — lleva base</option><option value="no">No lleva base</option></select>
          </label>
          <label>Tono de tela
            <select name="fabricTone"><option value="unknown">Sin clasificar</option><option value="light">LIGHT / Clara</option><option value="dark">DARK / Oscura</option></select>
          </label>
        </div>
        <p class="tegra-color-registry-note">Las clasificaciones se guardan por separado. El HEX no determina automáticamente si lleva base o si la tela es clara/oscura.</p>
        <div class="tegra-color-registry-actions">
          <button type="button" class="btn btn-secondary tegra-color-registry-cancel">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar en catálogo</button>
        </div>
        <p class="tegra-color-registry-error" role="alert"></p>
      </form>`;
    document.body.appendChild(dialog);
    const close = () => dialog.close();
    dialog.querySelector('.tegra-color-registry-close').addEventListener('click', close);
    dialog.querySelector('.tegra-color-registry-cancel').addEventListener('click', close);
    dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
    return dialog;
  }

  window.openColorRegistryDialog = function (options = {}) {
    if (!window.ColorRegistry) {
      window.alert('El catálogo JSON no está disponible.');
      return;
    }
    const dialog = ensureDialog();
    const form = dialog.querySelector('form');
    const context = dialog.querySelector('.tegra-color-registry-context');
    const error = dialog.querySelector('.tegra-color-registry-error');
    const query = String(options.query || '').trim();
    const existing = window.ColorRegistry.find(query);
    form.elements.name.value = existing?.name || (options.suggestedName || '');
    form.elements.code.value = existing?.code || (options.kind === 'garment' ? query : '');
    form.elements.hex.value = existing?.hex || (options.suggestedHex || '');
    form.elements.aliases.value = existing?.aliases?.join(', ') || (query && query !== form.elements.name.value ? query : '');
    form.elements.underbase.value = existing?.classifications?.underbase || 'unknown';
    form.elements.fabricTone.value = existing?.classifications?.fabricTone || 'unknown';
    context.textContent = options.kind === 'garment'
      ? 'Color de prenda / Colorway: ' + query
      : 'Color de tinta: ' + query;
    error.textContent = '';
    form.onsubmit = async event => {
      event.preventDefault();
      const name = form.elements.name.value.trim();
      const hex = window.ColorRegistry.normalizeHex(form.elements.hex.value);
      if (!name || !hex) {
        error.textContent = 'Escribe un nombre y un HEX válido (#RRGGBB).';
        return;
      }
      try {
        const saved = window.ColorRegistry.upsert({
          name,
          code: form.elements.code.value.trim(),
          aliases: form.elements.aliases.value.split(',').map(value => value.trim()).filter(Boolean),
          hex,
          classifications: {
            underbase: form.elements.underbase.value,
            fabricTone: form.elements.fabricTone.value
          },
          source: options.kind === 'garment' ? 'spec-garment-colorway' : 'spec-ink-color'
        });
        dialog.close();
        if (typeof options.onSave === 'function') await options.onSave(saved);
      } catch (saveError) {
        error.textContent = saveError.message || 'No se pudo guardar el color.';
      }
    };
    if (!dialog.open) dialog.showModal();
    form.elements.name.focus();
  };
})(window);
