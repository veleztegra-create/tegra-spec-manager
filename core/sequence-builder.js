// sequence-builder.js - construye secuencia final con multiplicidad y procesos intermedios
window.SequenceBuilder = (function () {
  'use strict';

  function buildSequence(layers = []) {
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
      if (index < expanded.length - 1) {
        sequence.push({ tipo: 'FLASH', screenLetter: '', nombre: 'FLASH', mesh: '-', additives: '' });
        sequence.push({ tipo: 'COOL', screenLetter: '', nombre: 'COOL', mesh: '-', additives: '' });
      }
    });

    return sequence;
  }

  return { buildSequence };
})();
