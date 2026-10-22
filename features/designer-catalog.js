/* Catálogo de diseñadores para la demo. Persistencia local por navegador; no modifica specs ya guardadas. */
(function () {
  'use strict';
  const STORAGE_KEY = 'tegra-spec-manager-designer-catalog-v1';
  const DEFAULTS = ['ELMER VELEZ', 'DANIEL HERNANDEZ', 'CINDY PINEDA', 'FERNANDO FERRERA', 'NILDA CORDOBA'];
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  function catalog() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (Array.isArray(saved)) return [...new Set(saved.map(v => String(v).trim()).filter(Boolean))];
    } catch (error) {
      console.warn('No se pudo leer el catálogo local de diseñadores:', error);
    }
    return [...DEFAULTS];
  }
  function saveCatalog(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(items.map(v => String(v).trim()).filter(Boolean))]));
  }
  function store() {
    if (!window.Store) return {};
    const state = window.Store.state;
    if (!state.generalData || typeof state.generalData !== 'object') state.generalData = {};
    return state.generalData;
  }
  function renderOptions(preferredValue) {
    const select = document.getElementById('designer');
    if (!select) return;
    const current = preferredValue ?? select.value;
    const names = catalog();
    select.replaceChildren(new Option('Seleccionar...', ''));
    names.forEach(name => select.add(new Option(name, name)));
    select.add(new Option('OTRO', 'OTRO'));
    if (current && Array.from(select.options).some(option => option.value === current)) select.value = current;
    else if (current && current !== 'OTRO') {
      const option = new Option(current, current);
      select.add(option, select.options.length - 1);
      select.value = current;
    }
    updateOtherField();
  }
  function updateOtherField() {
    const select = document.getElementById('designer');
    const input = document.getElementById('designer-other-name');
    const remove = document.getElementById('designer-remove-from-catalog');
    if (input) input.style.display = select?.value === 'OTRO' ? 'block' : 'none';
    if (remove) remove.disabled = !select?.value || select.value === 'OTRO' || !catalog().includes(select.value);
  }
  function addDesigner() {
    const select = document.getElementById('designer');
    const input = document.getElementById('designer-other-name');
    const name = String(input?.value || (select?.value === 'OTRO' ? '' : select?.value) || '').trim().replace(/\s+/g, ' ').toUpperCase();
    if (!name || name === 'OTRO') {
      window.showStatus?.('Escribe un nombre para agregarlo al catálogo.', 'warning');
      input?.focus();
      return;
    }
    const items = catalog();
    if (!items.includes(name)) items.push(name);
    saveCatalog(items);
    renderOptions(name);
    if (input) input.value = '';
    const data = store();
    data.designer = name;
    data.designerOtherName = '';
    document.getElementById('designer')?.dispatchEvent(new Event('change', { bubbles: true }));
    input?.dispatchEvent(new Event('input', { bubbles: true }));
    window.showStatus?.('Diseñador agregado al catálogo local.', 'success');
  }
  function removeDesigner() {
    const select = document.getElementById('designer');
    const name = select?.value;
    if (!name || name === 'OTRO') return;
    const items = catalog().filter(item => item !== name);
    saveCatalog(items);
    renderOptions('');
    const data = store();
    data.designer = '';
    window.showStatus?.('Nombre retirado del catálogo. Las especificaciones guardadas no se modifican.', 'success');
  }
  function initialize() {
    const select = document.getElementById('designer');
    if (!select || select.dataset.designerCatalogBound === '1') return;
    select.dataset.designerCatalogBound = '1';
    renderOptions(select.value);
    select.addEventListener('change', updateOtherField);
    document.getElementById('designer-add-to-catalog')?.addEventListener('click', addDesigner);
    document.getElementById('designer-remove-from-catalog')?.addEventListener('click', removeDesigner);
    document.getElementById('designer-other-name')?.addEventListener('input', (event) => {
      store().designerOtherName = event.target.value;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  new MutationObserver(initialize).observe(document.documentElement, { childList: true, subtree: true });
  window.DesignerCatalog = { initialize, catalog, selectValue: (value) => renderOptions(value) };
})();