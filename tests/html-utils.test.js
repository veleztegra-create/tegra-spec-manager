import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
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
