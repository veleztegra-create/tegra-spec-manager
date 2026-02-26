// rules-engine.js - Motor de reglas COMPLETO y REFACTORIZADO
// Versión: 2.0 - Con todas las secuencias de impresión

window.RulesEngine = (function() {
    // =============================================
    // CONFIGURACIÓN PRIVADA (EL CORAZÓN DE LAS REGLAS)
    // =============================================
    const config = {
        // Temperatura y tiempo por defecto para WATER BASE
        waterBase: {
            temp: '320 °F',
            time: '1:40 min'
        },
        plastisol: {
            temp: '320 °F',
            time: '1:00 min'
        },
        // Clasificación de colores
        colorClassification: {
            // Palabras clave para identificar colores claros (necesitan base blanca)
            light: [
                'amarillo', 'yellow', 'oro', 'gold', 'naranja', 'orange',
                'rosa', 'pink', 'beige', 'crema', 'ivory', 'blanco', 'white',
                'limon', 'lemon', 'dorado', '77c', '78h', '761' // Los especiales también son claros
            ],
            // Palabras clave para identificar colores oscuros (van sobre blocker)
            dark: [
                'rojo', 'red', 'azul', 'blue', 'verde', 'green', 'morado', 'purple',
                'marron', 'brown', 'negro', 'black', 'gris', 'gray', 'grey', 'navy',
                'charcoal', 'maroon', 'crimson'
            ],
            // Definición de colores especiales (3 pantallas)
            special: {
                '77c gold': { pantallas: 3, mallas: ['157', '198', '110'], aditivos: '3% CL 500 · 5% ecofix XL' },
                '78h amarillo': { pantallas: 3, mallas: ['157', '198', '110'], aditivos: '3% CL 500 · 5% ecofix XL' },
                '761 university gold': { pantallas: 3, mallas: ['157', '198', '110'], aditivos: '3% CL 500 · 5% ecofix XL' }
            }
        },
        // Mallas y aditivos por defecto para WATER BASE
        defaults: {
            blocker: { nombre: 'Bloquer CHT', mesh1: '110', mesh2: '122', mesh3: '157', additives: 'N/A' },
            whiteBase: { nombre: 'AquaFlex V2', mesh1: '110', mesh2: '122', mesh3: '198', additives: 'N/A' },
            whiteBaseWithCatalyst: { nombre: 'AquaFlex V2', mesh: '122', additives: '3% CL 500' },
            color: { mesh1: '157', mesh2: '198', additives: '3% CL 500 · 5% ecofix XL' }
        },
        // Reglas para clientes específicos (ej. GFS con Plastisol)
        clientRules: {
            'GEAR FOR SPORT': {
                inkType: 'PLASTISOL',
                blocker: { nombre: 'Barrier Base', mesh1: '110/64', mesh2: '122/55', additives: 'N/A' },
                white: { nombre: 'Poly White', mesh1: '157', mesh2: '122', additives: 'N/A' },
                color: { mesh1: '157', mesh2: '122', additives: 'N/A' },
                // Excepción: Midnight Navy no lleva Poly White
                exceptions: {
                    'midnight navy': { noWhiteBase: true }
                }
            },
            'FANATICS': {
                // Podrías añadir reglas específicas para Fanatics aquí
            }
        }
    };

    // =============================================
    // FUNCIONES PRIVADAS DE CLASIFICACIÓN
    // =============================================
    function clasificarTela(colorTela) {
        if (!colorTela) return 'clara';
        const telaLower = colorTela.toLowerCase();
        // Palabras clave para telas oscuras
        const oscuras = ["negro", "black", "navy", "charcoal", "maroon", "dark", "oscuro"];
        return oscuras.some(o => telaLower.includes(o)) ? 'oscura' : 'clara';
    }

    function clasificarColor(colorName) {
        if (!colorName) return { tipo: 'desconocido', esClaro: false, esOscuro: false, esEspecial: null };
        const colorLower = colorName.toLowerCase().trim();

        // 1. Verificar si es un color especial
        for (const [key, especial] of Object.entries(config.colorClassification.special)) {
            if (colorLower.includes(key)) {
                return { tipo: 'especial', esClaro: true, esOscuro: false, esEspecial: especial };
            }
        }

        // 2. Verificar si es claro
        if (config.colorClassification.light.some(light => colorLower.includes(light))) {
            return { tipo: 'claro', esClaro: true, esOscuro: false, esEspecial: null };
        }

        // 3. Verificar si es oscuro
        if (config.colorClassification.dark.some(dark => colorLower.includes(dark))) {
            return { tipo: 'oscuro', esClaro: false, esOscuro: true, esEspecial: null };
        }

        // 4. Desconocido (se tratará como oscuro por defecto para seguridad)
        return { tipo: 'desconocido', esClaro: false, esOscuro: true, esEspecial: null };
    }

    function obtenerReglasCliente(customer) {
        if (!customer) return null;
        const customerUpper = customer.toUpperCase();
        for (const [key, rules] of Object.entries(config.clientRules)) {
            if (customerUpper.includes(key)) {
                return { nombre: key, ...rules };
            }
        }
        return null; // Cliente genérico, usar reglas WATER BASE
    }

    // =============================================
    // CONSTRUCCIÓN DE SECUENCIAS (API PÚBLICA)
    // =============================================
    return {
        /**
         * Genera la secuencia de impresión completa para un placement.
         * @param {object} params - Parámetros de entrada.
         * @param {string} params.customer - Nombre del cliente.
         * @param {string} params.garmentColor - Color de la prenda (ej. "BLACK", "WHITE").
         * @param {string} params.inkType - Tipo de tinta ('WATER', 'PLASTISOL').
         * @param {array} params.designColors - Array de objetos de color del diseño { id, val }.
         * @returns {array} - Array de objetos que representan la secuencia completa.
         */
        generarSecuencia: function(params) {
            const { customer, garmentColor, inkType = 'WATER', designColors = [] } = params;
            console.log('🎯 RulesEngine.generarSecuencia', { customer, garmentColor, inkType, designColors });

            // 1. Determinar el contexto
            const telaType = clasificarTela(garmentColor);
            const reglasCliente = obtenerReglasCliente(customer);
            const usarReglasCliente = !!(reglasCliente && inkType === reglasCliente.inkType);
            
            // Seleccionar el preset de tintas a usar
            const preset = usarReglasCliente ? reglasCliente : config;

            // 2. Construir la secuencia
            let secuencia = [];
            let letraCounter = 65; // 'A'

            // --- PASO 1: Secuencia Base (Bloqueadores y Bases Blancas) ---
            if (telaType === 'oscura') {
                // Tela oscura: 3 bloqueadores
                secuencia.push(
                    { tipo: 'BLOCKER', nombre: preset.blocker.nombre, screenLetter: 'A', mesh: preset.blocker.mesh1, additives: preset.blocker.additives },
                    { tipo: 'BLOCKER', nombre: preset.blocker.nombre, screenLetter: 'A', mesh: preset.blocker.mesh2, additives: preset.blocker.additives },
                    { tipo: 'BLOCKER', nombre: preset.blocker.nombre, screenLetter: 'A', mesh: preset.blocker.mesh3, additives: preset.blocker.additives }
                );
                letraCounter++; // Pasamos a la 'B' para el siguiente elemento

                // Si es tela oscura y hay colores claros, necesitamos una base blanca extra
                // Nota: Esta lógica se refinará al procesar cada color.
                // Por ahora, añadimos la base blanca con catalizador después de los bloqueadores.
                secuencia.push({
                    tipo: 'WHITE_BASE', nombre: preset.whiteBase.nombre, screenLetter: 'B',
                    mesh: preset.whiteBaseWithCatalyst.mesh, additives: preset.whiteBaseWithCatalyst.additives
                });
                letraCounter++; // Pasamos a la 'C'

            } else {
                // Tela clara: 2 bases blancas + 1 blocker
                secuencia.push(
                    { tipo: 'WHITE_BASE', nombre: preset.whiteBase.nombre, screenLetter: 'A', mesh: preset.whiteBase.mesh1, additives: preset.whiteBase.additives },
                    { tipo: 'WHITE_BASE', nombre: preset.whiteBase.nombre, screenLetter: 'B', mesh: preset.whiteBase.mesh2, additives: preset.whiteBase.additives },
                    { tipo: 'BLOCKER', nombre: preset.blocker.nombre, screenLetter: 'C', mesh: preset.blocker.mesh3, additives: preset.blocker.additives }
                );
                // Añadimos la base blanca con catalizador
                secuencia.push({
                    tipo: 'WHITE_BASE', nombre: preset.whiteBase.nombre, screenLetter: 'D',
                    mesh: preset.whiteBaseWithCatalyst.mesh, additives: preset.whiteBaseWithCatalyst.additives
                });
                letraCounter = 69; // 'E' será la siguiente letra disponible
            }

            // --- PASO 2: Procesar cada COLOR ÚNICO del diseño ---
            // 2.1 Obtener lista de colores únicos para la leyenda y la secuencia
            const uniqueDesignColors = [];
            const seenColors = new Set();
            designColors.forEach(c => {
                const colorVal = (c.val || '').toUpperCase().trim();
                if (colorVal && !seenColors.has(colorVal)) {
                    seenColors.add(colorVal);
                    uniqueDesignColors.push(c);
                }
            });

            // 2.2 Generar pasos para cada color único
            for (let i = 0; i < uniqueDesignColors.length; i++) {
                const colorOriginal = uniqueDesignColors[i];
                const clasificacion = clasificarColor(colorOriginal.val);
                const screenLetterBase = String.fromCharCode(letraCounter);

                // Determinar sobre qué capa va este color
                const vaSobreBlocker = (telaType === 'oscura' && clasificacion.esOscuro) || (telaType === 'clara' && clasificacion.esOscuro);
                // Nota: En tela clara, los colores oscuros también pueden necesitar ir sobre Blocker según tu nota.
                // Ajusta esta lógica si es necesario.

                // Excepción para clientes (ej. Midnight Navy de GFS no lleva white base)
                const esExcepcion = usarReglasCliente && reglasCliente.exceptions &&
                    Object.keys(reglasCliente.exceptions).some(ex => colorOriginal.val.toLowerCase().includes(ex));

                if (!esExcepcion && clasificacion.esClaro && telaType === 'oscura') {
                    // En tela oscura, los colores claros necesitan una base blanca justo antes
                    secuencia.push({
                        id: Date.now() + Math.random() + i * 100,
                        tipo: 'WHITE_BASE',
                        screenLetter: String.fromCharCode(letraCounter), // Usamos la letra actual
                        nombre: preset.whiteBase.nombre,
                        mesh: preset.whiteBaseWithCatalyst.mesh,
                        additives: preset.whiteBaseWithCatalyst.additives
                    });
                    letraCounter++; // Avanzamos para el color
                }

                // Ahora, generar las pantallas para el color en sí
                if (clasificacion.esEspecial) {
                    // Color especial: 3 pantallas con la MISMA letra pero números
                    const especial = clasificacion.esEspecial;
                    for (let p = 0; p < especial.pantallas; p++) {
                        secuencia.push({
                            id: Date.now() + Math.random() + i * 10 + p,
                            tipo: 'COLOR',
                            screenLetter: screenLetterBase, // Misma letra
                            nombre: colorOriginal.val + (p > 0 ? ` (${p+1})` : ''),
                            mesh: especial.mallas[p],
                            additives: especial.aditivos
                        });
                    }
                    letraCounter++; // Avanzamos después del color especial
                } else {
                    // Color normal: 2 pantallas con la MISMA letra (1 y 2)
                    secuencia.push(
                        {
                            id: Date.now() + Math.random() + i * 10,
                            tipo: 'COLOR',
                            screenLetter: screenLetterBase, // Misma letra, se infiere que es la 1
                            nombre: colorOriginal.val,
                            mesh: vaSobreBlocker ? preset.color.mesh2 : preset.color.mesh1,
                            additives: preset.color.additives
                        },
                        {
                            id: Date.now() + Math.random() + i * 10 + 1,
                            tipo: 'COLOR',
                            screenLetter: screenLetterBase, // Misma letra, se infiere que es la 2
                            nombre: colorOriginal.val + ' (2)',
                            mesh: vaSobreBlocker ? preset.color.mesh1 : preset.color.mesh2,
                            additives: preset.color.additives
                        }
                    );
                    letraCounter++; // Avanzamos después del color normal
                }

                // Añadir FLASH y COOL después de cada color (excepto el último)
                if (i < uniqueDesignColors.length - 1) {
                    secuencia.push({ tipo: 'FLASH', nombre: 'FLASH', screenLetter: '', mesh: '-', additives: '' });
                    secuencia.push({ tipo: 'COOL', nombre: 'COOL', screenLetter: '', mesh: '-', additives: '' });
                }
            }

            console.log('✅ Secuencia generada por RulesEngine:', secuencia);
            return secuencia;
        },

        /**
         * Obtiene la temperatura y tiempo según el tipo de tinta y cliente.
         */
        getCuringConditions: function(inkType, customer) {
            const reglasCliente = obtenerReglasCliente(customer);
            if (inkType === 'PLASTISOL' || (reglasCliente && reglasCliente.inkType === 'PLASTISOL')) {
                return config.plastisol;
            }
            // Por defecto, WATER BASE
            return config.waterBase;
        },

        clasificarColor: clasificarColor,
        clasificarTela: clasificarTela,
        obtenerReglasCliente: obtenerReglasCliente
    };
})();

// Auto-inicializar (opcional, pero útil para logging)
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ RulesEngine v2.0 cargado y listo');
});
