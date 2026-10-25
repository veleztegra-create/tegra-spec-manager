// =====================================================
// sequence-rules-engine.js
// Evalúa las reglas de rules/sequence-rules.js sobre una secuencia
// ya generada por RulesEngine. NO contiene reglas de negocio propias:
// todo lo específico (PPF, HOT HEAD, estación 4...) vive en el archivo de datos.
// =====================================================
window.SequenceRules = (function () {
    'use strict';

    const FALLBACK_SETTINGS = {
        ignorarCampos: [], maxProfundidad: 4, maxLargoTexto: 200
    };

    const upper = (v) => String(v ?? '').trim().toUpperCase();
    const toList = (v) => (v == null ? [] : (Array.isArray(v) ? v : [v]));
    const containsAny = (haystack, needles) => {
        const h = upper(haystack);
        return needles.some((n) => upper(n) && h.includes(upper(n)));
    };

    function getConfig() {
        const cfg = window.TegraSequenceRules;
        return (cfg && typeof cfg === 'object') ? cfg : { version: 1, ajustes: {}, reglas: [] };
    }

    function getSettings() {
        return { ...FALLBACK_SETTINGS, ...(getConfig().ajustes || {}) };
    }

    // Recorre un objeto y devuelve [{ campo, valor }] con todos los textos encontrados.
    function scanData(value, path, settings, depth, out) {
        const s = settings || getSettings();
        const acc = out || [];
        const d = depth || 0;
        const ignore = new Set(s.ignorarCampos || []);

        if (value == null) return acc;
        if (typeof value === 'string') {
            const t = value.trim();
            if (t && t.length <= s.maxLargoTexto) acc.push({ campo: path || '(raíz)', valor: t });
            return acc;
        }
        if (typeof value !== 'object' || d >= s.maxProfundidad) return acc;
        if (Array.isArray(value)) {
            if (value.length > 50) return acc;
            value.forEach((item, i) => scanData(item, `${path}[${i}]`, s, d + 1, acc));
            return acc;
        }
        Object.keys(value).forEach((key) => {
            if (ignore.has(key)) return;
            scanData(value[key], path ? `${path}.${key}` : key, s, d + 1, acc);
        });
        return acc;
    }

    function evaluateConditions(cuando, ctx) {
        const c = cuando || {};
        const evidencia = [];

        const textos = toList(c.textoContiene);
        if (textos.length) {
            const hits = (ctx.textos || []).filter((t) => containsAny(t.valor, textos));
            if (!hits.length) return { ok: false, motivo: `ningún dato contiene ${textos.join(' / ')}` };
            hits.forEach((h) => evidencia.push(`${h.campo} = "${h.valor}"`));
        }

        const tintas = toList(c.tipoTinta).map(upper);
        if (tintas.length && !tintas.includes(upper(ctx.inkType))) {
            return { ok: false, motivo: `tinta ${upper(ctx.inkType)} no está en ${tintas.join(', ')}` };
        }

        if (c.tela) {
            const quiereOscura = upper(c.tela) === 'OSCURA';
            if (Boolean(ctx.isDarkFabric) !== quiereOscura) {
                return { ok: false, motivo: `la tela no es ${c.tela}` };
            }
        }

        const colores = toList(c.colorTela);
        if (colores.length && !containsAny(ctx.garmentColor, colores)) {
            return { ok: false, motivo: `color de tela "${ctx.garmentColor}" no coincide` };
        }

        const clientes = toList(c.cliente);
        if (clientes.length && !containsAny(ctx.customer, clientes)) {
            return { ok: false, motivo: `cliente "${ctx.customer}" no coincide` };
        }

        if (upper(c.placements) === 'PRIMERO' && !ctx.isFirstColoredPlacement) {
            return { ok: false, motivo: 'la regla aplica solo al primer placement con color' };
        }

        return { ok: true, evidencia };
    }

    function makeStep(spec) {
        const step = {
            tipo: spec.tipo,
            screenLetter: spec.screenLetter || '',
            nombre: spec.nombre || spec.tipo,
            mesh: spec.mesh ?? '-',
            additives: spec.additives || ''
        };
        if (spec.stationType) step.stationType = spec.stationType;
        return step;
    }

    function insertAtStation(sequence, accion) {
        const skipType = upper(accion.omitirSiYaExiste);
        if (skipType && sequence.some((s) => upper(s.tipo || s.type) === skipType)) return false;

        const pasos = toList(accion.pasos).map(makeStep);
        if (!pasos.length) return false;

        const station = Math.max(1, parseInt(accion.estacion, 10) || 1);

        // Si la secuencia es más corta que la estación pedida, completar con FLASH/COOL.
        while (sequence.length < station - 1) {
            const last = upper(sequence[sequence.length - 1]?.tipo || sequence[sequence.length - 1]?.type);
            const tipo = last === 'FLASH' ? 'COOL' : 'FLASH';
            sequence.push(makeStep({ tipo, nombre: tipo, mesh: '-' }));
        }

        sequence.splice(station - 1, 0, ...pasos);
        return true;
    }

    const ACTIONS = {
        INSERTARENESTACION: insertAtStation
    };

    // Devuelve { sequence, aplicadas: [{ id, descripcion, evidencia }], descartadas: [{ id, motivo }] }
    function apply(sequence, ctx) {
        const result = { sequence: Array.isArray(sequence) ? sequence.slice() : [], aplicadas: [], descartadas: [] };
        const reglas = Array.isArray(getConfig().reglas) ? getConfig().reglas : [];

        reglas.forEach((regla) => {
            if (!regla || regla.activa === false) return;

            const check = evaluateConditions(regla.cuando, ctx || {});
            if (!check.ok) {
                result.descartadas.push({ id: regla.id, motivo: check.motivo });
                return;
            }

            let cambio = false;
            toList(regla.entonces).forEach((accion) => {
                const fn = ACTIONS[upper(accion?.accion)];
                if (!fn) {
                    console.warn(`SequenceRules: acción desconocida "${accion?.accion}" en la regla "${regla.id}"`);
                    return;
                }
                if (fn(result.sequence, accion)) cambio = true;
            });

            if (cambio) {
                result.aplicadas.push({ id: regla.id, descripcion: regla.descripcion || '', evidencia: check.evidencia });
            } else {
                result.descartadas.push({ id: regla.id, motivo: 'condiciones cumplidas pero la acción no cambió nada (¿ya existía el paso?)' });
            }
        });

        return result;
    }

    return { apply, scanData, evaluateConditions, getSettings, getConfig };
})();
