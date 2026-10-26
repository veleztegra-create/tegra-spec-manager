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

      // FLASH → COOL solo se inserta entre pasos, nunca después del último.
      // Así, una secuencia normal termina en su último color/pase.
      if (index < expanded.length - 1) {
        sequence.push({ tipo: 'FLASH', screenLetter: '', nombre: 'FLASH', mesh: '-', additives: '' });
        sequence.push({ tipo: 'COOL', screenLetter: '', nombre: 'COOL', mesh: '-', additives: '' });
      }

      if (isPpf && index === 0) {
        // HOT HEAD permanece como estación especial tras el primer ciclo.
        // Si es la única capa, se mantiene su estación COOL posterior, pero
        // no se agrega un ciclo automático al final de la secuencia.
        if (index >= expanded.length - 1) {
          sequence.push({ tipo: 'FLASH', screenLetter: '', nombre: 'FLASH', mesh: '-', additives: '' });
          sequence.push({ tipo: 'COOL', screenLetter: '', nombre: 'COOL', mesh: '-', additives: '' });
        }
        sequence.push({ tipo: 'HOT_HEAD', stationType: 'HOT_HEAD', screenLetter: '', nombre: 'HOT HEAD', mesh: 'TEFLÓN', additives: '' });
        sequence.push({ tipo: 'COOL', screenLetter: '', nombre: 'COOL', mesh: '-', additives: '' });
      }
    });

    return sequence;
  }

  return { buildSequence };
})();
