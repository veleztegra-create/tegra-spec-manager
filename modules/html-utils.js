/**
 * Utilidades para insertar texto de forma segura en HTML.
 *
 * Úsalo siempre que un dato de usuario, de un JSON/Excel importado o de una API
 * se interpole dentro de una plantilla que va a `innerHTML`, ya sea como
 * contenido de texto o dentro de un atributo (value="...", title="...").
 *
 * Escapa & < > " ' — suficiente para ambos contextos.
 * No sirve dentro de <script>, de handlers inline (onclick="...") ni de URLs.
 */
(function (root) {
    'use strict';

    var ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
            return ENTITIES[ch];
        });
    }

    root.escapeHtml = escapeHtml;
})(window);
