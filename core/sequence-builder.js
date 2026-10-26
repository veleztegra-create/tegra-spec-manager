// sequence-builder.js - construye secuencia final con multiplicidad y procesos intermedios
window.SequenceBuilder = (function () {
  'use strict';

  function buildSequence(layers = [], options = {}) {
    const isPpf = Boolean(options.isPpf);
    const expanded = [];

    layers.forEach((layer) => {
      const count = Math.max(1, Number(layer.count) || 1);
      for (let i = 0; i < count; i += 1) {
        const name = count > 1 && layer.tipo !== 'COLOR'
          ? `${layer.nombre}${i > 0 ? ` (${i + 1})` : ''}`
          : layer.nombre;

        expanded.push({
          ...layer,
          nombre: name,
          count: undefined
        });
      }
    });

    const sequence = [];
    expanded.forEach((step, index) => {
      sequence.push(step);

      // Cada pase de impresión necesita su ciclo automático FLASH → COOL,
      // incluido el último color (por ejemplo, ROYAL). Las estaciones manuales
      // se añaden por separado en app.js y no forman parte de estas capas.
      sequence.push({ tipo: 'FLASH', screenLetter: '', nombre: 'FLASH', mesh: '-', additives: '' });
      sequence.push({ tipo: 'COOL', screenLetter: '', nombre: 'COOL', mesh: '-', additives: '' });

      if (isPpf && index === 0) {
        // HOT HEAD se inserta después del primer ciclo automático y conserva
        // su estación COOL posterior, sin duplicar el primer FLASH/COOL
        // cuando la secuencia contiene una sola capa.
        sequence.push({ tipo: 'HOT_HEAD', stationType: 'HOT_HEAD', screenLetter: '', nombre: 'HOT HEAD', mesh: 'TEFLÓN', additives: '' });
        sequence.push({ tipo: 'COOL', screenLetter: '', nombre: 'COOL', mesh: '-', additives: '' });
      }
    });

    return sequence;
  }

  return { buildSequence };
})();
