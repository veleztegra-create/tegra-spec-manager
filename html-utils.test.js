import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
// html-utils.js es un script clásico de navegador: lo cargamos con window simulado.
const browser = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'modules', 'html-utils.js'), 'utf8'), browser);
const escapeHtml = browser.window.escapeHtml;

test('escapeHtml escapa los 5 caracteres peligrosos', () => {
  assert.equal(escapeHtml(`<a href="x" onclick='y'>&</a>`),
    '&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;');
});

test('escapeHtml tolera null, undefined y números', () => {
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(undefined), '');
  assert.equal(escapeHtml(0), '0');
});

test('escapeHtml evita salir de un atributo value="..."', () => {
  const html = `<input value="${escapeHtml('x" autofocus onfocus="alert(1)')}">`;
  // Solo deben quedar las 2 comillas que abren y cierran value="..."; el resto va como &quot;.
  assert.equal(html.match(/"/g).length, 2);
});

test('renderSavedSpecListItem (app.js) no deja pasar HTML en los campos de la spec', () => {
  const src = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const start = src.indexOf('function renderSavedSpecListItem');
  assert.ok(start >= 0, 'no se encontró renderSavedSpecListItem');
  const end = src.indexOf('\n}\n', start) + 2;
  const ctx = vm.createContext({ escapeHtml, encodeURIComponent, Date });
  vm.runInContext(src.slice(start, end), ctx);
  const evil = '<img src=x onerror=alert(1)>';
  const html = ctx.renderSavedSpecListItem({
    key: 'k1', savedAt: 0, source: 'local',
    data: { style: evil, customer: evil, colorway: evil, po: evil }
  });
  assert.ok(!html.includes('<img'), 'quedó una etiqueta <img> sin escapar');
  assert.ok(html.includes('&lt;img'));
});

test('la tecla Enter en el campo Pantone no se propaga ni ejecuta la acción predeterminada', () => {
  const src = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const inputStart = src.indexOf('class="form-control placement-ink-input"');
  assert.ok(inputStart >= 0, 'no se encontró el campo Pantone');
  const inputEnd = src.indexOf('ondblclick="this.select()"', inputStart);
  assert.ok(inputEnd > inputStart, 'no se encontró el final de la plantilla del campo Pantone');
  const inputMarkup = src.slice(inputStart, inputEnd);
  const match = inputMarkup.match(/onkeydown="([^"]+)"/);
  assert.ok(match, 'el campo Pantone debe manejar la tecla Enter');

  const event = {
    key: 'Enter',
    prevented: false,
    stopped: false,
    preventDefault() { this.prevented = true; },
    stopPropagation() { this.stopped = true; }
  };
  let blurred = false;
  const input = { blur() { blurred = true; } };
  vm.runInNewContext(`(function(event) { ${match[1]} }).call(input, event)`, { input, event });

  assert.equal(event.prevented, true, 'Enter debe cancelar la acción predeterminada');
  assert.equal(event.stopped, true, 'Enter no debe propagarse a manejadores globales');
  assert.equal(blurred, true, 'Enter debe retirar el foco del campo Pantone');
});

test('el generador de la spec rechaza imageData no válido y escapa src', () => {
  const generatorContext = { window: {} };
  vm.runInNewContext(
    fs.readFileSync(path.join(root, 'features', 'approved-spec-renderer.js'), 'utf8'),
    generatorContext
  );
  vm.runInNewContext(
    fs.readFileSync(path.join(root, 'features', 'pdf-generator-mejorado.js'), 'utf8'),
    generatorContext
  );
  const generate = generatorContext.window.generateSpecHTMLDocument;
  assert.equal(typeof generate, 'function');

  const malicious = 'data:image/png;base64,AAAA" onerror="alert(1)';
  const maliciousHtml = generate({
    style: 'TEST',
    placements: [{ title: 'BACK', imageData: malicious }]
  });
  assert.ok(!maliciousHtml.includes('onerror="alert(1)"'), 'no debe permitir atributos inyectados');
  assert.ok(!maliciousHtml.includes('data:image/png;base64,AAAA"'), 'no debe conservar una data URI manipulada');
  assert.ok(maliciousHtml.includes('[ARTWORK / ARTE]'), 'una imagen inválida debe mostrar el placeholder visual aprobado');

  const validHtml = generate({
    style: 'TEST',
    placements: [{ title: 'BACK', imageData: 'data:image/png;base64,AAAA' }]
  });
  assert.ok(validHtml.includes('src="data:image/png;base64,AAAA"'),
    'debe conservar data URI raster base64 válido');
});
